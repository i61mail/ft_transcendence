interface settingsInterface {
    // canvas
    canvasColor: string;
    canvasWidth: number;
    canvasHeight: number;
    // court
    wallColor: string;
	wallSize: number;
	courtMarginX: number;
	courtMarginY: number;
    // logic
    getIntervalLength: () => number;
    targetFps: number;
    // paddle
    paddleSpeed: number;
    playerOneColor: string;
    playerTwoColor: string;
    paddleWidth: number;
    paddleHeight: number;
    // scoreboard
    winningScore: number;
    smallFont: string;
    largeFont: string;
    scoreTextColor: string;
    // ball
    ballMinSpeed: number;
    ballMaxSpeed: number;
    ballColor: string;
    ballAcceleration: number;
    ballRadius: number;
}

export const SETTINGS: settingsInterface =
{
    // canvas
    canvasColor: "#0f172a",
    canvasWidth: 800,
    canvasHeight: 600,
	// court
    wallColor: "rgba(59, 130, 246, 0.3)",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    // logic
    getIntervalLength: function() { return (1000 / this.targetFps); }, // milliseconds
    targetFps: 60,
    // paddle
    paddleSpeed: 200, // pixels per second
    playerOneColor: "#3b82f6",
    playerTwoColor: "#a855f7",
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 7,
    smallFont: "20px Arial",
    largeFont: "30px Arial",
    scoreTextColor: "#e0e7ff", // light blue
    // ball
    ballMinSpeed: 200,
    ballMaxSpeed: 300,
    ballColor: "#06b6d4",
    ballAcceleration: 10,
    ballRadius: 8
};

export enum GameMode {
    online,
    local,
    AI
}

export enum PlayerIndex {
    leftPlayer = 1,
    rightPlayer = 2
};

export interface messageInterface
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
