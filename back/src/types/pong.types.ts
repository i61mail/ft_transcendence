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
    canvasColor: "#004c00ff",
    canvasWidth: 800,
    canvasHeight: 600,
	// court
    wallColor: "#b8b8b8ff",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    // logic
    getIntervalLength: function() { return (1000 / this.targetFps); }, // milliseconds
    targetFps: 60,
    // paddle
    paddleSpeed: 400, // pixels per second
    playerOneColor: "#0000FF",
    playerTwoColor: "#FF0000",
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 1,
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

export enum GameMode {
    online,
    local,
    AI
}

export enum PlayerIndex {
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

export enum Difficulty // might need to be balanced later, also you can add as much difuclities as you want
{
    easy = 2,
    meduim = 1,
    hard = 0.5,
    impossible = 0 // might remove later
}

export interface PongDataBase
{
  game_mode: string;
  left_player_id: number;
  right_player_id: number | null;
  winner: string;
  left_score: number;
  right_score: number;
  ai_difficulty: string | null;
}