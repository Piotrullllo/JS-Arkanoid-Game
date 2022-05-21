const welcomeScreen = document.getElementById('welcome-screen');
const pauseScreen = document.getElementById('pause-screen');
const loseScreen = document.getElementById('lose-screen');
const winScreen = document.getElementById('win-screen');

const buttons = document.querySelectorAll('.menu button');
const startButton = document.getElementById('b-start');
const continueBtn = document.getElementById('b-continue');
const newGame = document.getElementById('b-new-game');
const soundButtons = document.querySelectorAll('.b-sound');
const pauseStart = document.getElementById('b-pause-start');
const pauseEnd = document.getElementById('b-pause-end');
const quitBnts = document.querySelectorAll('.b-quit');

const gameData = document.getElementById('game-data');
const soundInfo = document.querySelectorAll('.b-sound span');

const sounds = [new Audio("sounds/nav.wav"), new Audio("sounds/ding.wav"), new Audio("sounds/fail.wav"), new Audio("sounds/gameOver.wav"), new Audio("sounds/nextLvl.wav"), new Audio("sounds/powerupcollected.wav")];

let paused = false;
let started = false;
let visibleButtons = [];
let choosenButton = -1;

function pause(){
    if(!started)return;
    if(!paused){
        clearInterval(interval);
        choosenButton = -1;
        pauseScreen.style.display = "block";
    } else {
        interval = setInterval(theGame, frame);
        pauseScreen.style.display = "none";
    }
    paused = !paused;
}

function dropGameData(){
    wall = [];
    resetObjects();
    resetPowerUps();
    hearts = defaultHearts;
    countHearts();
    lvl = 1;
    level.textContent = `${lvl}`;
    score = 0;
    scoreMeters.forEach(meter => {
        meter.textContent = 0;
    });
}

function resetObjects(){
    balls = [];
    powerUps = [];
    breakThroughBlocks = 0;
    rarePowerUpsUsed = [false,false];
    ballCatched = false;
    slowdownEnabled = false;
    slowdownTime = -1;
    slowdownTimer.textContent = "";
    slowdownSpeed = 1;
    vausX = defaultVausX;
}

function resetPowerUps(){
    pointsMultiplier = 1;
    vausWidth = defaultVausWidth;
    catchAbility = false;
}

function startGame(){
    createBall(defaultBallX, defaultBallY, defaultBallSize, ballSpeedAlpha, ballSpeedBeta);
    objectGenerator();
    started = true;
    interval = setInterval(theGame, frame);
}

function stopGame(){
    clearInterval(interval);
    choosenButton = -1;
    paused = false;
    started = false;
}

function playSound(){
    sounds[1].currentTime = 0;
    sounds[1].play();
}

startButton.addEventListener('click', () => {
    welcomeScreen.style.display = "none";
    gameData.style.visibility = "visible";
    startGame();
});

pauseEnd.addEventListener('click', () => {
    if(started && paused){
        interval = setInterval(theGame, frame);
        paused = !paused;
        pauseScreen.style.display = "none";
    }
})

soundButtons.forEach(sBtn => {
    sBtn.addEventListener('click', () =>{
        if(sounds[0].volume == 0){
            soundInfo.forEach(inf => inf.textContent = "on");
            sounds.forEach(sound => sound.volume = 0.4);
        }
        else {
            soundInfo.forEach(inf => inf.textContent = "off");
            sounds.forEach(sound => sound.volume = 0);
        }
    });
});

continueBtn.addEventListener("click", () => {
    winScreen.style.display = "none";
    lvl++;
    level.textContent = `${lvl}`;
    startGame();
})

quitBnts.forEach(quitBtn => {
    quitBtn.addEventListener('click', () => {
        stopGame();
        drawBackground();
        pauseScreen.style.display = "none";
        winScreen.style.display = "none";
        loseScreen.style.display = "none";
        gameData.style.visibility = "hidden";
        dropGameData();
        welcomeScreen.style.display = "block";
    });
});

newGame.addEventListener('click', () => {
    stopGame();
    pauseScreen.style.display = "none";
    loseScreen.style.display = "none";
    dropGameData();
    startGame();
});

buttons.forEach(button => {
    button.addEventListener('focusin', () => {
        sounds[0].currentTime = 0;
        sounds[0].play();
    });
    button.addEventListener('mouseenter', () => {
        sounds[0].currentTime = 0;
        sounds[0].play();
    });
});