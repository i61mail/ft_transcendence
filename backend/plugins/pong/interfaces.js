export const SETTINGS = {
    // canvas
    canvasColor: "#004c00ff",
    canvasWidth: 800,
    canvasHeight: 600,
    // court
    wallColor: "#b8b8b8ff",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    // logic
    getIntervalLength: function () { return (1000 / this.targetFps); }, // milliseconds
    targetFps: 60,
    // paddle
    paddleSpeed: 200, // pixels per second
    playerOneColor: "#0000FF",
    playerTwoColor: "#FF0000",
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 7,
    smallFont: "20px Arial",
    largeFont: "30px Arial",
    scoreTextColor: "#F0EAD6", // eggshell white
    // ball
    ballMinSpeed: 200,
    ballMaxSpeed: 400,
    ballColor: "#F0EAD6", // eggshell white
    ballAcceleration: 10,
    ballRadius: 8
};
export var GameMode;
(function (GameMode) {
    GameMode[GameMode["online"] = 0] = "online";
    GameMode[GameMode["local"] = 1] = "local";
    GameMode[GameMode["AI"] = 2] = "AI";
})(GameMode || (GameMode = {}));
export var PlayerIndex;
(function (PlayerIndex) {
    PlayerIndex[PlayerIndex["leftPlayer"] = 1] = "leftPlayer";
    PlayerIndex[PlayerIndex["rightPlayer"] = 2] = "rightPlayer";
})(PlayerIndex || (PlayerIndex = {}));
;
export var keyStat;
(function (keyStat) {
    keyStat[keyStat["down"] = 0] = "down";
    keyStat[keyStat["up"] = 1] = "up";
    keyStat[keyStat["none"] = 2] = "none";
})(keyStat || (keyStat = {}));
export var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["easy"] = 2] = "easy";
    Difficulty[Difficulty["meduim"] = 1] = "meduim";
    Difficulty[Difficulty["hard"] = 0.5] = "hard";
    Difficulty[Difficulty["impossible"] = 0] = "impossible"; // might remove later
})(Difficulty || (Difficulty = {}));
