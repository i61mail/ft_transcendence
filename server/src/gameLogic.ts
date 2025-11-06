import { match } from "assert";
import * as intf from "./interfaces";
import { EventEmitter } from "events";

const event: EventEmitter = new EventEmitter();

class ScoreBoard
{
    leftPlayerScore: number = 0;
    rightPlayerScore: number = 0;

    get winner() : number
    {
        if (this.leftPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.leftPlayer;
        if (this.rightPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.rightPlayer;
        return 0;
    }
}

class Rectangle
{
    x: number;
    y: number;
    width: number;
    height: number;

	constructor(x: number, y: number, width: number, height: number)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get top() { return this.y; }
    get bottom() { return this.y + this.height; }

    overlaps(other: Rectangle)
    {
        return  other.left < this.right &&
                this.left < other.right &&
                other.top < this.bottom &&
                this.top < other.bottom;
    }
}

class Ball
{
    posX: number;
    posY: number;
    _court: Court;
    _velocity: {x: number, y: number};
    _speed: number;

    constructor(court: Court)
    {
        this.posX = intf.SETTINGS.canvasWidth / 2;
        this.posY = intf.SETTINGS.canvasHeight / 2;
        this._court = court;
        this._velocity = {x: 0, y: 0};
        this._speed = Ball.minSpeed;
    }

    static get minSpeed() { return intf.SETTINGS.ballMinSpeed; }
    static get maxSpeed() { return intf.SETTINGS.ballMaxSpeed; }
    static get acceleration() { return intf.SETTINGS.ballAcceleration; }

    get speed() { return this._speed; }

    set speed(value: number)
    {
        if (value < Ball.minSpeed)
            this._speed = Ball.minSpeed;
        else if (value > Ball.maxSpeed)
            this._speed = Ball.maxSpeed;
        else
            this._speed = value;
    }

    get collisionBox()
    {
        return new Rectangle(this.posX - intf.SETTINGS.ballRadius,
                            this.posY - intf.SETTINGS.ballRadius,
                            intf.SETTINGS.ballRadius * 2, intf.SETTINGS.ballRadius * 2);
    }

    get velocity() { return this._velocity; }
    set velocity(value: {x: number, y: number}) { this._velocity = value; }

    update(deltaTime: number)
    {
        this.posX += Math.sign(this._velocity.x) * this._speed * deltaTime;
        this.posY += Math.sign(this._velocity.y) * this._speed * deltaTime;

        if (this.posY - intf.SETTINGS.ballRadius < this._court.bounds.upper)
        {
            this.posY = this._court.bounds.upper + intf.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }
        else if (this.posY + intf.SETTINGS.ballRadius > this._court.bounds.lower)
        {
            this.posY = this._court.bounds.lower - intf.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }

        if (this.collisionBox.overlaps(this._court.leftPadle.collisionBox))
        {
            this.posX = this._court.leftPadle.collisionBox.right + intf.SETTINGS.ballRadius;
            this._velocity.x *= -1;
            if (this._court.gameMode == intf.GameMode.AI)
                event.emit("aiPredection", this.posX, this.posY, this.velocity);
        }
        else if (this.collisionBox.overlaps(this._court.rightPadle.collisionBox))
        {
            this.posX = this._court.rightPadle.collisionBox.left - intf.SETTINGS.ballRadius;
            this._velocity.x *= -1;
        }

        if (this.posX < this._court.bounds.left)
        {
            this._court.scorePoint(intf.PlayerIndex.rightPlayer);
        }
        else if (this.posX > this._court.bounds.right)
        {
            this._court.scorePoint(intf.PlayerIndex.leftPlayer);
        }
        this.speed += Ball.acceleration * deltaTime;
    }
}

class Padle
{
    posX: number;
    posY: number;
    _court: Court;
    _collisionBox: Rectangle;
    playerIndex: intf.PlayerIndex;

    constructor(playerIndex: intf.PlayerIndex, court: Court)
    {
        if (playerIndex == intf.PlayerIndex.leftPlayer)
            this.posX = intf.SETTINGS.paddleWidth;
        else
            this.posX = intf.SETTINGS.canvasWidth - 2 * intf.SETTINGS.paddleWidth;
        this.posY =  intf.SETTINGS.canvasHeight / 2 - intf.SETTINGS.paddleHeight / 2;
        this._court = court;
        this._collisionBox = new Rectangle(this.posX, this.posY, intf.SETTINGS.paddleWidth, intf.SETTINGS.paddleHeight);
        this.playerIndex = playerIndex;
    }

    static get speed() { return intf.SETTINGS.paddleSpeed; } // pixels per second

    get collisionBox()
    {
        this._collisionBox.x = this.posX;
        this._collisionBox.y = this.posY;
        return (this._collisionBox);
    }

    moveUp(deltaTime: number)
    {

        this.posY -= Padle.speed * deltaTime;
        if (this.posY < this._court.bounds.upper)
            this.posY = this._court.bounds.upper;
    }

    moveDown(deltaTime: number)
    {
        this.posY += Padle.speed * deltaTime;
        if (this.posY + intf.SETTINGS.paddleHeight > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - intf.SETTINGS.paddleHeight;
    }

}


abstract class Controller
{
    public   paddle: Padle;
    private  _socket: WebSocket | null = null;
    public   _status: intf.keyStat;

    constructor(paddle: Padle)
    {
        this.paddle = paddle;
        this._status = intf.keyStat.none;
    }

    abstract controlling(): void;

    public set socket(socket: WebSocket)
    {
        this._socket = socket;
    }

    public get socket(): WebSocket | null
    {
        return (this._socket);
    }

    get velocity()
    {
        let velocity = 0;
        if (this._status == intf.keyStat.up)
            velocity += 1;
        else if (this._status == intf.keyStat.down)
            velocity -= 1;
        return velocity;
    }

    update(deltaTime: number)
    {
        const velocity = this.velocity;
        if (velocity < 0)
            this.paddle.moveDown(deltaTime);
        else if (velocity > 0)
            this.paddle.moveUp(deltaTime);
    }
}

class LocalController extends Controller
{
    static _socket: WebSocket | null;
    static controlers:Controller[] = [];
    constructor(paddle: Padle)
    {
        super(paddle);
    }

    controlling(): void
    {
       LocalController.listener(this);
    }

    static listener(controller: Controller)
    {
        LocalController.controlers.push(controller);
        if (LocalController._socket == null)
            LocalController._socket = controller.socket;
        else
            return ;
        if (LocalController._socket)
        {
            LocalController._socket.onmessage = (msg) => {
                if (msg.data[0] == LocalController.controlers[0].paddle.playerIndex)
                    LocalController.controlers[0]._status = msg.data[1]; // i should problem check the message length before using it
                else
                    LocalController.controlers[1]._status = msg.data[1];
            }
        }
    }
}

class onlineController extends Controller
{
    constructor(paddle: Padle)
    {
        super(paddle);
    }

    controlling(): void
    {
        if (this.socket)
        {
            // u: press Up
            // d: press Down
            // r: release
            this.socket.onmessage = (msg) => {
                this._status = msg.data;
            }
        }
    }
}

class AIController extends Controller
{
    private _court: Court;
    private _target: number = 0;
    private _difficulty: intf.Difficulty;

    constructor(paddle: Padle, court: Court, difficulty: intf.Difficulty)
    {
        super(paddle);

        this._difficulty = difficulty;
        this._court = court;
    }

    controlling(): void
    {
        event.on("aiPredection", (x: number, y: number, vec : {x: number, y: number}) =>
        {

            const Xtarget: number = this.paddle.posX - intf.SETTINGS.ballRadius;
            const Ymin: number = this._court.bounds.upper + intf.SETTINGS.ballRadius;
            const Ymax: number = this._court.bounds.lower - intf.SETTINGS.ballRadius;
            const Ly: number = Ymax - Ymin;

            x -= intf.SETTINGS.paddleWidth * 2;
            const horizontalDist: number = Xtarget - x;
            const Yunfold: number = y + vec.y * horizontalDist;
            const YdistUnfold: number = Yunfold - Ymin;
            const modRemainder: number = ((YdistUnfold % (2 * Ly)) + (2 * Ly)) % (2 * Ly);

            if (modRemainder <= Ly)
                this._target = Ymin + modRemainder;
            else
                this._target = Ymax - (modRemainder - Ly);
            this._target -= intf.SETTINGS.paddleHeight / 2;

            this._target += (Math.random() - 0.5) * intf.SETTINGS.paddleHeight * this._difficulty;

            if (this._target < this._court.bounds.upper)
                this._target = this._court.bounds.upper;
            else if (this._target + intf.SETTINGS.paddleHeight > this._court.bounds.lower)
                this._target = this._court.bounds.lower - intf.SETTINGS.paddleHeight;

            this._status = this._target < this.paddle.posY ? intf.keyStat.up : intf.keyStat.down; 
        });
    }

    get velocity()
    {
        let velocity = 0;
        if (this._status == intf.keyStat.up && this._target < this.paddle.posY)
            velocity += 1;
        else if (this._status == intf.keyStat.down && this._target > this.paddle.posY)
            velocity -= 1;
        return velocity;
    }
}

class Court
{
    private _isMatchStarted: boolean = true; // might add a timer before it startes
    public  leftPadle: Padle;
    public  rightPadle: Padle;
    public  gameMode: intf.GameMode;
    public  leftPlayerController: Controller;
    public  rightPlayerController: Controller;
    private _ball: Ball;
    private _scoreBoard: ScoreBoard;

    constructor(gameMode: intf.GameMode, difficulty: intf.Difficulty)
    {
        this._ball = new Ball(this);
        this.gameMode = gameMode;
        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this);
        if (gameMode == intf.GameMode.online)
        {
            this.leftPlayerController = new onlineController(this.leftPadle) as Controller;
            this.rightPlayerController = new onlineController(this.rightPadle) as Controller;
        }
        else if (gameMode == intf.GameMode.local)
        {
            this.leftPlayerController = new LocalController(this.leftPadle) as Controller;
            this.rightPlayerController = new LocalController(this.rightPadle) as Controller;
        }
        else
        {
            this.leftPlayerController = new onlineController(this.leftPadle) as Controller;
            this.rightPlayerController = new AIController(this.rightPadle, this, difficulty) as Controller;
        }

        this._scoreBoard = new ScoreBoard()
    }

    addPlayer(player: WebSocket)
    {
        if (this.leftPlayerController.socket == null)
            this.leftPlayerController.socket = player;
        else if (this.gameMode == intf.GameMode.online)
        {
            this.rightPlayerController.socket = player;
        }
        if (this.gameMode == intf.GameMode.local)
        {
            this.rightPlayerController.socket = player;

            player.onmessage = (msg) => {
                if (msg.data[0] == this.leftPadle.playerIndex)
                {
                    this.leftPlayerController._status = msg.data[1]; // i should problem check the message length before using it
                }
                else
                    this.rightPlayerController._status = msg.data[1];
            }
        }
    }

    listenToPlayers()
    {
        this.leftPlayerController.controlling();
        this.rightPlayerController.controlling();
    }
    
    spawnBall()
    {
        this._ball.velocity = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this._ball.posX = intf.SETTINGS.canvasWidth / 2;
        this._ball.posY = intf.SETTINGS.canvasHeight / 2;
        if (this.gameMode == intf.GameMode.AI && this._ball.velocity.x == 1)
            event.emit("aiPredection", this._ball.posX, this._ball.posY, this._ball.velocity);
        this._ball.speed = Ball.minSpeed;
    }

    scorePoint(playerIndex: number)
    {
        if (playerIndex == intf.PlayerIndex.leftPlayer)
            this._scoreBoard.leftPlayerScore += 1;
        else if (playerIndex == intf.PlayerIndex.rightPlayer)
            this._scoreBoard.rightPlayerScore += 1;

        if (this._scoreBoard.winner != 0)
        {
            this._isMatchStarted = false;
        }
        else
            this.spawnBall();
    }

    update(deltaTime: number)
    {
        if (this._isMatchStarted == false)
            return;
        this.leftPlayerController.update(deltaTime);
        this.rightPlayerController.update(deltaTime);
        this._ball.update(deltaTime);
        let data: intf.messageInterace =
        {
            // this is a vector, so eithert change the name of it or make the user teleport to where it's position on the server instead

            leftPlayerPosY: this.leftPadle.posY,
            rightPlayerPosY: this.rightPadle.posY,

            //might add the current position in case there was a big delay between the paddle position in the server and in the client 

            leftPlayerScore: this._scoreBoard.leftPlayerScore,
            rightPlayerScore: this._scoreBoard.rightPlayerScore,

            ballPosX: this._ball.posX,
            ballPosY: this._ball.posY
        }
        
        this.leftPlayerController.socket?.send(JSON.stringify(data));
        this.rightPlayerController.socket?.send(JSON.stringify(data));
    }

    get bounds()
    {
        return {
            upper: intf.SETTINGS.courtMarginY + intf.SETTINGS.wallSize,
            lower: intf.SETTINGS.canvasHeight - intf.SETTINGS.courtMarginY - intf.SETTINGS.wallSize,
            left: 0,
            right: intf.SETTINGS.canvasWidth
        }
    }

}

export class PongGame
{
    private _court: Court;

    constructor(gameMode: intf.GameMode, difficulty: intf.Difficulty)
    {
        this._court = new Court(gameMode, difficulty);
        let that = this;
    }

    public addPlayer(player: WebSocket)
    {
        this._court.addPlayer(player);
    }

    public listenToPlayers()
    {
        this._court.listenToPlayers();
    }
    
    private _update(deltaTime: number)
    {
        this._court.update(deltaTime);
    }

    public run()
    {
        let parent: PongGame = this;
        let previousUpdateTime = Date.now();
        this._court.spawnBall();
        setInterval(function()
        {
            let updateTime = Date.now();
            let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
			previousUpdateTime = updateTime;
        }, intf.SETTINGS.getIntervalLength());
    }

}
