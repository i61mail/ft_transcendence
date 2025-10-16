interface settingsInterface {
    wallColor: string;
    wallSize: number;
    courtMarginX: number;
    courtMarginY: number;
    getIntervalLength: () => number;
    targetFps: number;
    paddleSpeed: number;
    playerOneColor: string;
    playerTwoColor: string;
    paddleWidth: number;
    paddleHeight: number;
    winningScore: number;
    smallFont: string;
    largeFont: string;
    scoreTextColor: string;
    ballMinSpeed: number;
    ballMaxSpeed: number;
    ballColor: string;
    ballAcceleration: number;
    ballRadius: number;
}
declare const SETTINGS: settingsInterface;
declare const PlayerIndex: {
    PlayerOne: number;
    PlayerTwo: number;
};
declare class PongGame {
    _canvas: HTMLCanvasElement;
    _court: Court;
    constructor(canvas: HTMLCanvasElement);
    _update(deltaTime: number): void;
    draw(): void;
    run(): void;
}
declare class Court {
    _canvas: HTMLCanvasElement;
    leftPadle: Padle;
    rightPadle: Padle;
    _leftPlayerController: playerController;
    _rightPlayerController: playerController;
    _scoreBoard: ScoreBoard;
    _ball: Ball;
    ismatchStarted: boolean;
    constructor(canvas: HTMLCanvasElement);
    get bounds(): {
        upper: number;
        lower: number;
        left: number;
        right: number;
    };
    startMatch(): void;
    _spawnBall(): void;
    scorePoint(playerIndex: number): void;
    update(deltaTime: number): void;
    draw(canvas: HTMLCanvasElement): void;
}
declare class playerController {
    _paddle: Padle;
    _isUpKeyPressed: boolean;
    _isDownKeyPressed: boolean;
    constructor(paddle: Padle);
    get velocity(): number;
    update(deltaTime: number): void;
}
declare class Padle {
    posX: number;
    posY: number;
    width: number;
    height: number;
    _playerIndex: number;
    _court: Court;
    _startPosX: number;
    _startPosY: number;
    constructor(posX: number, posY: number, width: number, height: number, PlayerIndex: number, court: Court);
    static get speed(): number;
    get collisionBox(): Rectangle;
    moveUp(deltaTime: number): void;
    moveDown(deltaTime: number): void;
    reset(): void;
    get renderColor(): string;
    draw(canvas: HTMLCanvasElement): void;
}
declare class Ball {
    radius: number;
    posX: number;
    posY: number;
    _court: Court;
    _startPosX: number;
    _startPosY: number;
    _velocity: {
        x: number;
        y: number;
    };
    _speed: number;
    constructor(radius: number, posX: number, posY: number, court: Court);
    static get minSpeed(): number;
    static get maxSpeed(): number;
    static get acceleration(): number;
    get speed(): number;
    set speed(value: number);
    get normalizedSpeed(): number;
    get collisionBox(): Rectangle;
    get velocity(): {
        x: number;
        y: number;
    };
    set velocity(value: {
        x: number;
        y: number;
    });
    draw(canvas: HTMLCanvasElement): void;
    update(deltaTime: number): void;
}
declare class ScoreBoard {
    leftPlayerScore: number;
    rightPlayerScore: number;
    round: number;
    constructor();
    get winner(): number;
    draw(canvas: HTMLCanvasElement): void;
    reset(): void;
}
declare class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    get left(): number;
    get right(): number;
    get top(): number;
    get bottom(): number;
    overlaps(other: Rectangle): boolean;
    contains(x: number, y: number): boolean;
}
declare function startGame(): void;
//# sourceMappingURL=tsScript.d.ts.map