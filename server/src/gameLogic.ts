import * as intf from "./interfaces";

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

    // contains(x: number, y: number) // did not use it, might remove later
    // {
    //     return  this.left < x && this.right > x &&
    //             this.top < y && this.bottom > y;
    // } 
}

class Padle
{
    posX: number;
    posY: number;
    _court: Court;
    _collisionBox: Rectangle;

    constructor(playerIndex: intf.PlayerIndex, court: Court)
    {
        if (playerIndex == intf.PlayerIndex.leftPlayer)
            this.posX = intf.SETTINGS.paddleWidth;
        else
            this.posX = intf.SETTINGS.canvasWidth - 2 * intf.SETTINGS.paddleWidth;
        this.posY =  intf.SETTINGS.canvasHeight / 2 - intf.SETTINGS.paddleHeight / 2;
        this._court = court;
        this._collisionBox = new Rectangle(this.posX, this.posY, intf.SETTINGS.paddleWidth, intf.SETTINGS.paddleHeight);
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
    private     paddle: Padle;
    private     _socket: WebSocket | null = null;
    protected   _status: intf.keyStat;

    constructor(paddle: Padle)
    {
        this.paddle = paddle;
        this._status = intf.keyStat.none;
        this.controlling();
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
        if (this._status == intf.keyStat.down)
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
    constructor(paddle: Padle)
    {
        super(paddle);
    }

    controlling(): void
    {
        if (this.socket)
        {
            this.socket.onmessage = (msg) => {
                

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
    constructor(paddle: Padle)
    {
        super(paddle);
    }

    controlling(): void
    {
        // will add this later
        // maybe will add event handler here, that will trigger whenever the player's paddle touches the ball 
    }
}

class Court
{
    public  leftPadle: Padle;
    public  rightPadle: Padle;
    private gameMode: intf.GameMode;
    public  leftPlayerController: Controller;
    public  rightPlayerController: Controller;

    constructor(gameMode: intf.GameMode)
    {
        this.gameMode = gameMode;
        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this);
        this.leftPlayerController = new onlineController(this.leftPadle) as Controller;
        if (gameMode == intf.GameMode.online)
            this.rightPlayerController = new onlineController(this.rightPadle) as Controller;
        else if (gameMode == intf.GameMode.local)
            this.rightPlayerController = new LocalController(this.rightPadle) as Controller;
        else
            this.rightPlayerController = new AIController(this.rightPadle) as Controller;
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
            this.rightPlayerController.socket = player;
    }

    listenToPlayers()
    {
        this.leftPlayerController.controlling();
        this.rightPlayerController.controlling();
    }
    
    update(deltaTime: number)
    {
        this.leftPlayerController.update(deltaTime);
        this.rightPlayerController.update(deltaTime);
        let data: intf.messageInterace =
        {
            // this is a vector, so eithert change the name of it or make the user teleport to where it's position on the server instead

            leftPlayerPosY: this.leftPadle.posY,
            rightPlayerPosY: this.rightPadle.posY,

            //might add the current position in case there was a big delay between the paddle position in the server and in the client 

            leftPlayerScore: 0, // for now
            rightPlayerScore: 0, // for now

            ballPosX: 0, // for now
            ballPosY: 0, // for now
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

    constructor(gameMode: intf.GameMode)
    {
        this._court = new Court(gameMode);
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
        setInterval(function()
        {
            let updateTime = Date.now();
            let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
			previousUpdateTime = updateTime;
        }, intf.SETTINGS.getIntervalLength());
    }

}
