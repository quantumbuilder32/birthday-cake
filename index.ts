const spawnPoints = document.querySelectorAll(".spawnPoints") as NodeListOf<HTMLDivElement>
const amtOfPoints = 19
const amtOfSpawnPoints = spawnPoints.length
const amtInEachSpawnPoint = Math.floor(amtOfPoints / amtOfSpawnPoints)
const remainderAmtForMiddleSpawnPoint = amtOfPoints % amtOfSpawnPoints
let canStartBlowingOutCandles = false


let message = document.querySelector("#message") as HTMLParagraphElement;
let openingMessageCont = document.getElementById("openingMessage") as HTMLDivElement;
let birthdayCakeCont = document.getElementById("birthdayCakeCont") as HTMLDivElement;
let yesButton = document.querySelector("#yes") as HTMLButtonElement;
let noButton = document.querySelector("#no") as HTMLButtonElement;

yesButton.addEventListener("click", yesClick);
noButton.addEventListener("click", noClick);



function start() {
    const safeLocationPos: [HTMLDivElement, Number, number][] = getSafeLocationPos(spawnPoints, amtInEachSpawnPoint, remainderAmtForMiddleSpawnPoint)
    const candles: HTMLDivElement[] = makeCandles(amtOfPoints)

    setTimeout(() => {
        canStartBlowingOutCandles = true
    }, amtOfPoints * 100 + 1000);


    safeLocationPos.forEach((eachLocationPos, eachLocationPosIndex) => {
        addCandleToSpawnArea(candles[eachLocationPosIndex], eachLocationPos)
    })
}

function getSafeLocationPos(seenSpawnPoints: NodeListOf<HTMLDivElement>, seenAmtInEachSpawnPoint: number, seenRemainderAmtForMiddleSpawnPoint: number) {
    const localSafeLocationPos: [HTMLDivElement, Number, number][] = []

    seenSpawnPoints.forEach((eachEl, eachElIndex) => {
        const amtToLoop = eachElIndex === 0 ? seenAmtInEachSpawnPoint + seenRemainderAmtForMiddleSpawnPoint : seenAmtInEachSpawnPoint

        for (let index = 0; index < amtToLoop; index++) {
            const randomX = Math.floor(Math.random() * 101)
            const randomY = Math.floor(Math.random() * 101)

            localSafeLocationPos.push([eachEl, Math.floor(randomX), Math.floor(randomY)])
        }
    })

    return localSafeLocationPos
}

function addCandleToSpawnArea(candle: HTMLDivElement, locationPos: [HTMLDivElement, Number, number]) {
    candle.style.left = `${locationPos[1]}%`
    candle.style.top = `${locationPos[2]}%`

    candle.style.translate = `-50% -100%`

    const additionalZ = locationPos[0].id === "spawnPoint" ? 10 : 0
    candle.style.zIndex = `${locationPos[2] + additionalZ}`
    locationPos[0].appendChild(candle)
}

function makeCandles(amtToMake: number) {
    const divArray: HTMLDivElement[] = []

    for (let index = 0; index < amtToMake; index++) {

        let divElement = document.createElement("div")
        divElement.classList.add("candle")
        const randomHeight = Math.floor(Math.random() * 10) + 60

        divElement.style.setProperty(`--candleHeight`, `${randomHeight}px`)
        divElement.style.setProperty(`--candleWidth`, `20px`)
        divElement.style.setProperty(`--delayTime`, `${1000 + (index * 100)}ms`)

        let flameDiv = document.createElement("div")
        flameDiv.classList.add("flame")
        flameDiv.classList.add("active")
        divElement.appendChild(flameDiv)

        let shadowDiv = document.createElement("div")
        shadowDiv.classList.add("shadow")
        divElement.appendChild(shadowDiv)

        divArray.push(divElement)
    }

    return divArray
}

















function yesClick() {
    openingMessageCont.style.display = "none"
    birthdayCakeCont.style.display = "block"

    //make candles on cake
    start()

    message.innerHTML = "Blow out the candles";

    //  store the audio context
    let audioCon = new AudioContext();
    //  store media stream source
    let mediaStreamSource = null;
    //  store script processor node
    let scriptProcessorNode = null;
    //  store the threshold value
    let threshold = 0.2;

    // function to handle the microphone input
    function handleMicInput(stream: MediaStream) {
        // create a media stream source from the stream
        mediaStreamSource = audioCon.createMediaStreamSource(stream);
        // create a script processor node with a buffer size of 4096 and one input and output channel
        scriptProcessorNode = audioCon.createScriptProcessor(4096, 1, 1);
        // connect the media stream source to the script processor node
        mediaStreamSource.connect(scriptProcessorNode);
        // connect the script processor node to the destination
        scriptProcessorNode.connect(audioCon.destination);
        // add an event listener for the audio process event
        scriptProcessorNode.addEventListener("audioprocess", function (event) {
            // get the input buffer from the event
            let inputBuffer = event.inputBuffer;
            // get the data from the input buffer
            let data = inputBuffer.getChannelData(0);
            // create a variable to store the maximum value
            let max = 0;
            // loop through the data
            for (let i = 0; i < data.length; i++) {
                // get the absolute value of the data point
                let value = Math.abs(data[i]);
                // check if the value is greater than the max
                if (value > max) {
                    // update the max value
                    max = value;
                }
            }
            // check if the max value is greater than the threshold
            if (max > threshold) {
                blowOutCandle()
            }
        });
    }

    // mic error handling
    function handleMicErr(error: any) {
        message.innerHTML = "Sorry, there was an error accessing your microphone: " + error.message;
    }

    // request mic access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(handleMicInput)
        .catch(handleMicErr);
}

function noClick() {
    message.innerHTML = "...I will touch you... be watchful 🧍🏾";
}

function blowOutCandle() {
    if (!canStartBlowingOutCandles) return

    const allActiveFlames = document.querySelectorAll(".active")
    const randIndex = Math.floor(Math.random() * allActiveFlames.length)


    const chosenEl = allActiveFlames[randIndex]

    chosenEl.classList.add("putFlameOut")
    chosenEl.classList.remove("active")

    let amtPutOut = 0
    allActiveFlames.forEach(eachEl => {
        if (eachEl.className.includes("putFlameOut")) {
            amtPutOut++

            if (amtPutOut > allActiveFlames.length) {
                amtPutOut = allActiveFlames.length
            }
        }
    })

    if (allActiveFlames.length === amtPutOut) {
        message.style.position = "static"
        message.style.translate = "0 0"

        message.innerHTML = "Happy Birthday ELISE<br>Have a great 19th. So glad to see your growth and I pray nothing brings you down. I wish you all the best. Love you fr 🙏🏾💞";
    }
}


