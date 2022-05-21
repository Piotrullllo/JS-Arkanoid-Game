let defaultVausX = canvas.width/2;
let defaultVausWidth = 200;
let defaultVausHeight = 15;
let vausColor = "blue"

let defaultBallX = 500;
let defaultBallY = 500;
let defaultBallSize = 15;
let ballSpeedAlpha = 2;
let ballSpeedBeta = 3;
let ballColor = "yellow";
let ballsOffset = 50;

let objectX = 70;
let objectY = 50;
let objectWidth = 100;
let objectHeight = 35;
let objectSpacingX = 14;
let objectSpacingY = 10;
let rows = 6;
let columns = 10;
let breakableBlocks = 7;

let powerupSize = 8;
let powerupSpeed = 3;

let slowdownPower = 1.8;
let slowdownLength = 24;
let scorePerBlock = 10;
let scorePerPowerUp = 50;
let defaultHearts = 3;
let underBottomArea = 1320;
let defaultMoveWithKeyboard = 15;
let backgroundColor = "rgb(45, 45, 45)";
let objectColor = ['silver', 'red', 'yellow', 'blue', 'violet', 'green'];

let powerUpsModes = ["Vaus Expanded", "Vaus Shrinked", "Heart+", "More Balls", "Break-Through", "Slowdown", "Points Multiplier: ", "Catch-Ball Enabled", "none"];
let powerUpsColors = ["blue", "magenta", "red", "white", "gray", "orange", "gold", "green"];
let sPPUs = [3,2,1,3,2,2,1,3]

let levelTemplates = [
    [
        "----------",
        "--0-0-0-0-",
        "-0-0-0-0--",
        "--0-0-0-0-",
        "-0-0-0-0--",
        "----------",
    ],
    [
        "----------",
        "----------",
        "----------",
        "----------",
        "----------",
        "----------",
    ],
    [
        "-0-0-0-0-0",
        "0-0-0-0-0-",
        "-0-0-0-0-0",
        "0-0-0-0-0-",
        "-0-0-0-0-0",
        "0-0-0-0-0-",
    ],
    [
        "0--------0",
        "00------00",
        "000----000",
        "000----000",
        "00------00",
        "0--------0",
    ],
    [
        "00------00",
        "0-00--00-0",
        "--0---0---",
        "----------",
        "----------",
        "-0-0-0-0--",
    ],
    [
        "00---00000",
        "0------000",
        "----------",
        "-------000",
        "-------000",
        "-0-0-0-000",
    ],
    [
        "000000---0",
        "-000-0-00-",
        "0-0-00-00-",
        "00-000-00-",
        "0-0-00-00-",
        "-000-0---0",
    ],
    [
        "00------00",
        "0--00000-0",
        "---00000-0",
        "---------0",
        "0--------0",
        "00--00--00",
    ]
];