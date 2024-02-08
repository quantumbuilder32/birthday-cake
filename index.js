"use strict";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const numParam = urlParams.get('num') ? parseInt(urlParams.get('num')) : 0;
const spawnPoints = document.querySelectorAll(".spawnPoints");
const spawnCont = document.querySelector("#spawnCont");
const amtOfPoints = numParam > 0 ? numParam : 19;
const amtOfSpawnPoints = spawnPoints.length;
const amtInEachSpawnPoint = Math.floor(amtOfPoints / amtOfSpawnPoints);
const remainderAmtForMiddleSpawnPoint = amtOfPoints % amtOfSpawnPoints;
let canStartBlowingOutCandles = false;
let message = document.querySelector("#message");
let openingMessageCont = document.getElementById("openingMessage");
let birthdayCakeCont = document.getElementById("birthdayCakeCont");
let yesButton = document.querySelector("#yes");
let noButton = document.querySelector("#no");
yesButton.addEventListener("click", yesClick);
noButton.addEventListener("click", noClick);
function start() {
    const safePositions = getSafePositions(spawnPoints, amtInEachSpawnPoint, remainderAmtForMiddleSpawnPoint);
    const candles = makeCandles(amtOfPoints);
    setTimeout(() => {
        canStartBlowingOutCandles = true;
    }, amtOfPoints * 100 + 1000);
    safePositions.forEach((eachPos, eachPosIndex) => {
        addCandleToSpawnArea(candles[eachPosIndex], eachPos);
    });
}
function findPercentageOf(num, maxNum) {
    return (num / maxNum) * 100;
}
function getSafePositions(seenSpawnPoints, seenAmtInEachSpawnPoint, seenRemainderAmtForMiddleSpawnPoint) {
    const localSafeLocationPos = [];
    seenSpawnPoints.forEach((eachEl, eachElIndex) => {
        const amtToLoop = eachElIndex === 0 ? seenAmtInEachSpawnPoint + seenRemainderAmtForMiddleSpawnPoint : seenAmtInEachSpawnPoint;
        const maxWidth = spawnCont.clientWidth;
        const maxHeight = spawnCont.clientHeight;
        const elWidth = eachEl.clientWidth;
        const elHeight = eachEl.clientHeight;
        const xOffset = eachEl.offsetLeft;
        const yOffset = eachEl.offsetTop;
        const lowerLeftRange = xOffset;
        const higherLeftRange = xOffset + elWidth;
        const lowerTopRange = yOffset;
        const higherTopRange = yOffset + elHeight;
        for (let index = 0; index < amtToLoop; index++) {
            const randXPos = Math.floor(Math.random() * (higherLeftRange - lowerLeftRange)) + lowerLeftRange;
            const randYPos = Math.floor(Math.random() * (higherTopRange - lowerTopRange)) + lowerTopRange;
            const randomXPerc = Math.floor(findPercentageOf(randXPos, maxWidth));
            const randomYPerc = Math.floor(findPercentageOf(randYPos, maxHeight));
            // console.log(`$maxWidth`, maxWidth);
            // console.log(`$maxHeight`, maxHeight);
            // console.log(`$xOffset`, xOffset);
            // console.log(`$yOffset`, yOffset);
            // console.log(`$higherLeftRange`, higherLeftRange);
            // console.log(`$higherTopRange`, higherTopRange);
            // console.log(`$randXPos`, randXPos);
            // console.log(`$randYPos`, randYPos);
            // console.log(`$randomXPerc`, randomXPerc);
            // console.log(`$randomYPerc`, randomYPerc);
            localSafeLocationPos.push([randomXPerc, randomYPerc]);
        }
    });
    return localSafeLocationPos;
}
function addCandleToSpawnArea(candle, locationPos) {
    candle.style.left = `${locationPos[0]}%`;
    candle.style.top = `${locationPos[1]}%`;
    candle.style.translate = `-50% -100%`;
    candle.style.zIndex = `${10 + locationPos[1]}`;
    spawnCont.appendChild(candle);
}
function makeCandles(amtToMake) {
    const divArray = [];
    for (let index = 0; index < amtToMake; index++) {
        let divElement = document.createElement("div");
        divElement.classList.add("candle");
        const randomHeight = Math.floor(Math.random() * 10) + 60;
        divElement.style.setProperty(`--candleHeight`, `${randomHeight}px`);
        divElement.style.setProperty(`--candleWidth`, `20px`);
        divElement.style.setProperty(`--delayTime`, `${1000 + (index * 100)}ms`);
        let flameDiv = document.createElement("div");
        flameDiv.classList.add("flame");
        flameDiv.classList.add("active");
        divElement.appendChild(flameDiv);
        let shadowDiv = document.createElement("div");
        shadowDiv.classList.add("shadow");
        divElement.appendChild(shadowDiv);
        divArray.push(divElement);
    }
    return divArray;
}
function yesClick() {
    openingMessageCont.style.display = "none";
    birthdayCakeCont.style.display = "block";
    //make candles on cake
    start();
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
    function handleMicInput(stream) {
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
                blowOutCandle();
            }
        });
    }
    // mic error handling
    function handleMicErr(error) {
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
    if (!canStartBlowingOutCandles)
        return;
    const allActiveFlames = document.querySelectorAll(".active");
    const randIndex = Math.floor(Math.random() * allActiveFlames.length);
    const chosenEl = allActiveFlames[randIndex];
    chosenEl.classList.add("putFlameOut");
    chosenEl.classList.remove("active");
    let amtPutOut = 0;
    allActiveFlames.forEach(eachEl => {
        if (eachEl.className.includes("putFlameOut")) {
            amtPutOut++;
            if (amtPutOut > allActiveFlames.length) {
                amtPutOut = allActiveFlames.length;
            }
        }
    });
    if (allActiveFlames.length === amtPutOut) {
        message.style.position = "static";
        message.style.translate = "0 0";
        message.innerHTML = "Happy Birthday ELISE<br>Have a great 19th. So glad to see your growth and I pray nothing brings you down. I wish you all the best. Love you fr 🙏🏾💞";
    }
}
