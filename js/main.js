const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const health = document.getElementById('health');
const level = document.getElementById('lvl');
const scoreMeters = document.querySelectorAll('.points');
const pickedUpPowerUp = document.getElementById("picked-power-up");
const slowdownTimer = document.getElementById("slowdown-time");

let hearts = defaultHearts;
let score = 0; 
let lvl = 1;
let multipliersGained = 0;
let pointsMultiplier = 1;
let breakThroughBlocks = 0;

let slowdownEnabled = false;
let slowdownSpeed = 1;
let slowdownTime = -1;

let catchAbility = false;
let ballCatched = false;

let rarePowerUpsUsed = [false,false];
let fps = 60;
let frame = 1000/fps;
let interval;
let wall = [];

let vausX = defaultVausX;
let vausY = canvas.height - 100;
let vausWidth = defaultVausWidth;
let vausHeight = defaultVausHeight;

let balls = [];
let powerUps = [];

class BallObject{
    constructor(x,y,size,speedX,speedY){
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.catched = false;
        this.ballMattressOffset;
    }
}

class DestroyableObject{
    constructor(x, y, width, height, color, visibility, powerMode, powerColor, sPBM, sPPU){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; 
        this.color = color;
        this.powerMode = powerMode;
        this.powerColor = powerColor;
        this.visibility = visibility;
        this.sPBM = sPBM;
        this.sPPU = sPPU;
    }
    drawObject(){
        if (this.visibility == true){
            drawRect(this.x, this.y, this.width, this.height, this.color)
            if(this.powerMode === "none")return;
            drawRect(this.x+this.width/2-powerupSize, this.y+this.height/2-powerupSize, 2*powerupSize, 2*powerupSize, this.powerColor);
        } else if (this.visibility == false){
            this.x = -1000;
            this.y = this.x;
        }
    }
}

class PowerUp{
    constructor(x,y,power,color,sPPU){
        this.x = x;
        this.y = y;
        this.power = power;
        this.color = color;
        this.touched = false;
        this.sPPU = sPPU;
    }
}

function drawRect(x,y,width,height,color){
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color; 
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle="black";
    ctx.stroke();
}

function objectGenerator(){
    let template = levelTemplates[Math.floor(Math.random()*(levelTemplates.length-1))];
    let x = objectX;
    let y = objectY;
    let visibility = true;
    let color;
    for (i = 0; i < rows; i++){
        color = objectColor[i];
        for(j = 0; j < columns; j++){
            if(template[i].charAt(j) == "-"){
                let power = randomPowerUp(i);
                const brick = new DestroyableObject(x, y, objectWidth, objectHeight, color, visibility, powerUpsModes[power], powerUpsColors[power], rows-i, sPPUs[power]);
                wall.push(brick);
            }
            x += objectWidth + objectSpacingX;
        }
        x = objectX;
        y += objectHeight + objectSpacingY;
    }
}

function createBall(x, y, size, speedX, speedY){
    const ball = new BallObject(x, y, size, speedX, speedY);
    balls.push(ball);
}

function randomPowerUp(row){
    const random = Math.floor(Math.random() * (2048 - 1)) + 1;
    if(random%64 == 0 && row < rows-4 && !rarePowerUpsUsed[0] && catchAbility == false){
        rarePowerUpsUsed[0] = true;
        return 7;
    }
    if(random%12 == 0 && row < rows-4 && !rarePowerUpsUsed[1]){
        rarePowerUpsUsed[1] = true;
        return 3;
    }
    if(random%49 == 0 && row < rows-3)return 0;
    if(random%16 == 0 && row < rows-3)return 4; 
    if(random%81 == 0 && row < rows-2)return 2; 
    if(random%25 == 0 && row < rows-1)return 5; 
    if(random%36 == 0 && row < rows-2)return 1; 
    if(random%21 == 0 && row < rows-1)return 6;
    return 8;
}

function createPowerUpObject(x, y, power, color, sPPU){
    const pwrUp = new PowerUp(x, y, power, color, sPPU);
    powerUps.push(pwrUp);
}

function objectCollisionDetection(wall){
    wall.forEach(obj => {
        balls.forEach(b => {
            if(b.x+b.size >= obj.x && b.x+b.size <= obj.x + b.size*2 && (b.y + b.size >= obj.y && b.y + b.size <= obj.y+obj.height))collision("horiz", obj, b);
            if(b.x-b.size <= obj.x + obj.width && b.x-b.size >= obj.x+obj.width - b.size*2 && (b.y + b.size >= obj.y && b.y + b.size <= obj.y+obj.height))collision("horiz", obj, b);
            if(b.y+b.size >= obj.y && b.y+b.size <= obj.y + b.size*2 && (b.x + b.size >= obj.x && b.x + b.size <= obj.x+obj.width))collision("vert", obj, b);
            if(b.y-b.size <= obj.y + obj.height && b.y-b.size >= obj.y+obj.height - b.size*2 && (b.x + b.size >= obj.x && b.x + b.size <= obj.x+obj.width))collision("vert", obj, b);
        });
    });
}

function collision(angle, obj, b){
    if(breakThroughBlocks > 0) breakThroughBlocks--;
    else{
        if(angle === "vert")b.speedY = -b.speedY;
        else b.speedX = -b.speedX;
    }
    obj.visibility = false;
    updateScore(scoreMeters, "brick", obj.sPBM);
    checkIfCleared();
    playSound();
    if(obj.powerMode != "none")createPowerUpObject(obj.x+obj.width/2-powerupSize, obj.y+obj.height/2-powerupSize, obj.powerMode, obj.powerColor, obj.sPPU);
}

function vausColission(){
    balls.forEach(ball => {
        if(!(ball.y >=  vausY-vausHeight/2 && ball.y < vausY+vausHeight/2 && ball.x >= vausX-vausWidth/2 && ball.x <= vausX+vausWidth/2))return;
        if(ball.x >= vausX-vausWidth/4 && ball.x <= vausX+vausWidth/4) {
            if(ball.speedX > 0)ball.speedX = ballSpeedAlpha;
            else ball.speedX = -ballSpeedAlpha;
            ball.speedY = -ballSpeedBeta;
        } else if(ball.x >= vausX+ball.size-vausWidth/2 && ball.x <= vausX+vausWidth/2-ball.size){
            if(ball.speedX > 0)ball.speedX = ballSpeedBeta;
            else ball.speedX = -ballSpeedBeta;
            ball.speedY = -ballSpeedAlpha;
        } else if(ball.x <= vausX+ball.size-vausWidth/2 && ball.x >= vausX-vausWidth/2){
            ball.speedX = -Math.abs(ball.speedX);
            ball.speedY = -Math.abs(ball.speedY);
        } else if(ball.x >= vausX+vausWidth/2-ball.size && ball.x <= vausX+vausWidth/2){
            ball.speedX = Math.abs(ball.speedX);
            ball.speedY = -Math.abs(ball.speedY);
        }
        if(!ball.catched)playSound();
        if(catchAbility && !ball.catched && !ballCatched){
            ball.catched = true;
            ball.y = vausY-vausHeight/2;
            ballCatched = true;
            ball.ballMattressOffset = ball.x - vausX;
        }
    }); 
}

function activatePowerUp(){
    powerUps.forEach(powerUp => {
        if(powerUp.touched === true)return;
        if(powerUp.y >=  vausY-vausHeight/2 && powerUp.y <= vausY-vausHeight/2+powerupSpeed/slowdownSpeed && powerUp.x >= vausX-vausWidth/2 && powerUp.x <= vausX+vausWidth/2) {
            powerUp.touched = true;
            switch (powerUp.power){
                case "More Balls":
                    if(balls.length < 1)break;
                    if(balls[balls.length-1].x - ballsOffset < 0)createBall(balls[balls.length-1].x+2*ballsOffset, balls[balls.length-1].y, defaultBallSize, balls[balls.length-1].speedX, balls[balls.length-1].speedY);
                    else createBall(balls[balls.length-1].x-ballsOffset, balls[balls.length-1].y, defaultBallSize, balls[balls.length-1].speedX, balls[balls.length-1].speedY);
                    if(balls[balls.length-2].x + ballsOffset > canvas.width)createBall(balls[balls.length-2].x-2*ballsOffset, balls[balls.length-2].y, defaultBallSize, balls[balls.length-2].speedX, balls[balls.length-2].speedY);
                    else createBall(balls[balls.length-2].x+ballsOffset, balls[balls.length-2].y, defaultBallSize, balls[balls.length-2].speedX, balls[balls.length-2].speedY);
                    break;
                case "Vaus Expanded":
                    if(vausWidth >= 2.25*defaultVausWidth)break;
                    vausWidth *= 1.5;
                    break;
                case "Vaus Shrinked":
                    if(vausWidth <= defaultVausWidth/2.25)break;
                    vausWidth /= 1.5;
                    break;
                case "Heart+":
                    hearts++;
                    countHearts();
                    break;
                case "Points Multiplier: ":
                    multipliersGained++;
                    if(multipliersGained%pointsMultiplier == 0){
                        pointsMultiplier *= 2;
                        multipliersGained = 0;
                        break;
                    } else break;
                case "Slowdown":
                    if(slowdownEnabled)return;
                    slowdownTime = slowdownLength*fps;
                    slowdownSpeed = slowdownPower;
                    slowdownEnabled = true;
                    break;
                case "Break-Through":
                    breakThroughBlocks = breakableBlocks;
                    break;
                case "Catch-Ball Enabled":
                    catchAbility = true;
                    break;
            }
            updateScore(scoreMeters, "powerUp", powerUp.sPPU);
            sounds[5].currentTime = 0;
            sounds[5].play();
            displayPowerUpName(powerUp.power);
            powerUp.y = underBottomArea;
        }
    });
}

function ballWCollision(){
    for(i = 0; i < balls.length; i++){
        if (balls[i].y + balls[i].speedY < balls[i].size/2){
            balls[i].speedY = -balls[i].speedY;
            playSound();
        } else if (balls[i].x + balls[i].speedX > canvas.width-balls[i].size/2 || balls[i].x + balls[i].speedX < balls[i].size/2) {
            balls[i].speedX = -balls[i].speedX;
            if(balls[i].y < canvas.height+30 && !balls[i].catched)playSound();
        }
    } 
}

function drawPowerUp(){
    for(i=0;i<powerUps.length;i++) drawRect(powerUps[i].x, powerUps[i].y, 2*powerupSize, 2*powerupSize, powerUps[i].color);
}

function movePowerUp(){
    for(i=0;i<powerUps.length;i++){
        if(powerUps[i].y < underBottomArea)powerUps[i].y += powerupSpeed/slowdownSpeed;
        else powerUps.splice(i,1);
    }
}

function displayPowerUpName(name){
    pickedUpPowerUp.style.opacity = 1;
    if(name === "Points Multiplier: " && multipliersGained%pointsMultiplier == 0) pickedUpPowerUp.textContent = `${name}${pointsMultiplier}`;
    else if(name === "Points Multiplier: ")pickedUpPowerUp.textContent = `Multipliers Gained: ${multipliersGained}/${pointsMultiplier}`;
    else if(name === "Vaus Expanded" && vausWidth >= 2.25*defaultVausWidth) pickedUpPowerUp.textContent = `Vaus is too large to expand!`;
    else if(name === "Vaus Shrinked" && vausWidth <= defaultVausWidth/2.25) pickedUpPowerUp.textContent = `Vaus is too small to shrink!`;
    else pickedUpPowerUp.textContent = name;
    setTimeout(() => pickedUpPowerUp.style.opacity = 0, 3000);
}


function countdown(){
    if(slowdownTime < 0)return;
    if(slowdownTime >= 0 && slowdownTime < 1){
        slowdownSpeed = 1;
        slowdownEnabled = false;
        slowdownTimer.style.opacity = 0;
    } else {
        slowdownTimer.style.opacity = 1;
        slowdownTime--
        slowdownTimer.textContent = Math.floor(slowdownTime/90);
    };
}

function checkIfCleared(){
    let destroyedBlocks = 0;
    wall.forEach(block => {
        if(block.y == -1000)destroyedBlocks++;
        if(destroyedBlocks == (wall.length-1)){
            setTimeout(() => {
                stopGame();
                wall = [];
                resetObjects();
                sounds[4].currentTime = 0;
                sounds[4].play();
                winScreen.style.display = "block";
            }, frame)
        }
    });
}

function moveBalls(){
    for(i = 0; i < balls.length; i++){
        if(balls[i].catched){
            balls[i].x = vausX + balls[i].ballMattressOffset;
        } else {
            balls[i].x += balls[i].speedX/slowdownSpeed;
            balls[i].y += balls[i].speedY/slowdownSpeed;
        }
    }
}

function countHearts(){
    if(hearts > 1){
        health.textContent = "❤";
        for(i=0;i<hearts-1;i++)health.textContent += "❤";
    }
    else if(hearts == 1)health.textContent = "❤";
    else health.textContent = "";
}

function lose(){
    for(i=0;i<balls.length;i++){
        if(balls[i].y >= underBottomArea-220 && balls[i].y <= underBottomArea-217){
            sounds[2].currentTime = 0;
            sounds[2].play();
        } else if(balls[i].y > underBottomArea)balls.splice(i, 1);
    }
    if(balls.length != 0)return;
    hearts--;
    countHearts();
    if(hearts >= 0){
        resetObjects();
        createBall(defaultBallX, defaultBallY, defaultBallSize, ballSpeedAlpha, ballSpeedBeta);
    } else {
        stopGame();
        sounds[3].currentTime = 0; 
        sounds[3].play();
        loseScreen.style.display = "block";
    }
}

function updateScore(scoreMeters, scoreMode, scorePerItem){
    if(scoreMode === "brick")score += (scorePerBlock*pointsMultiplier*scorePerItem);
    else score += (scorePerPowerUp*pointsMultiplier*scorePerItem);
    scoreMeters.forEach(meter => meter.textContent = score);
}

function drawBalls(){
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x,ball.y,ball.size,0,7);
        ctx.fillStyle = ballColor;
	    ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    });
}

function pushBall(mode){
    balls.forEach(ball => {
        if(!ball.catched || ball.x < 0+ball.size/2 || ball.x > canvas.width-ball.size/2)return;
        ball.y = vausY-10;
        if(mode === "left") ball.speedX = -Math.abs(ball.speedX);
        else ball.speedX = Math.abs(ball.speedX);
        ball.speedY = -Math.abs(ball.speedY);
        ball.catched = ballCatched = false;
    });
}

function drawBackground(){
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
}

function theGame(){
    drawBackground();
    drawRect(vausX-vausWidth/2, vausY, vausWidth, vausHeight, vausColor);
    ballWCollision();
    vausColission();
    for(i = 0; i < wall.length; i++) wall[i].drawObject();
    objectCollisionDetection(wall);
    countdown();
    lose();
    moveBalls();
    activatePowerUp();
    movePowerUp();
    drawBalls();
    drawPowerUp();
}

function handleInput(x, input){
    if(input === "mouse") vausX = x;
    else{
        switch(x){
            case 37:
                if(vausX < 0)break;
                vausX -= defaultMoveWithKeyboard/slowdownSpeed;
                break;
            case 39:
                if(vausX > canvas.width)break;
                vausX += defaultMoveWithKeyboard/slowdownSpeed;
                break;
            case 17:
                pushBall("left");
                break;
            case 32:
                pushBall("right");
                break;
            case 19:
            case 27:
                pause();
                break;
            case 40:
                visibleButtons.length = 0;
                buttons.forEach(btn => {
                    if(btn.getBoundingClientRect().width != 0){
                        visibleButtons.push(btn);
                    }
                })
                if(choosenButton < visibleButtons.length-1)choosenButton++;
                else choosenButton = 0;
                visibleButtons[choosenButton].focus();
                break;
            case 38:
                visibleButtons.length = 0;
                buttons.forEach(btn => {
                    if(btn.getBoundingClientRect().width != 0){
                        visibleButtons.push(btn);
                    }
                })
                if(choosenButton > 0)choosenButton--;
                else choosenButton = visibleButtons.length-1;
                visibleButtons[choosenButton].focus();
                break;
        }
    }
}

sounds.forEach(sound => sound.volume = 0.4);
canvas.addEventListener("mousemove", e => handleInput(e.offsetX, "mouse"));
window.addEventListener("keydown", e => handleInput(e.keyCode, "keyboard"));
window.addEventListener("blur",() => {
    if(!paused)pause();
})