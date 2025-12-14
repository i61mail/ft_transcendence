interface settingsInterface {
    // canvas
    canvasWidth: number;
    canvasHeight: number;
    // court
    wallSize: number;
    courtMarginY: number;
    // logic
    getIntervalLength: () => number;
    targetFps: number;
    // paddle
    paddleSpeed: number;
    paddleWidth: number;
    paddleHeight: number;
    // scoreboard
    winningScore: number;
    // ball
    ballMinSpeed: number;
    ballMaxSpeed: number;
    ballAcceleration: number;
    ballRadius: number;
}

export const SETTINGS: settingsInterface =
{
    // canvas
    canvasWidth: 800,
    canvasHeight: 600,
    // court
    wallSize: 30,
    courtMarginY: 10,
    // logic
    getIntervalLength: function() { return (1000 / this.targetFps); },
    targetFps: 60,
    // paddle
    paddleSpeed: 400,
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 7,
    // ball
    ballMinSpeed: 200,
    ballMaxSpeed: 400,
    ballAcceleration: 10,
    ballRadius: 8
};

export enum GameMode {
    online,
    local,
    AI
}

export enum PlayerIndex {
    none = 0,
    leftPlayer = 1,
    rightPlayer = 2
};

export interface messageInterace
{
    leftPlayerPosY: number;
    rightPlayerPosY: number;
    
    leftPlayerScore: number;
    rightPlayerScore: number;

    ballPosX: number;
    ballPosY: number;
}

export enum keyStat
{
    down,
    up,
    none
}

export enum Difficulty
{
    easy = 2,
    meduim = 1.5,
    hard = 1.25
}