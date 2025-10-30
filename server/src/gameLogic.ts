import { SETTINGS, GameMode, messageInterace, PlayerIndex } from './interfaces'

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

    constructor(playerIndex: PlayerIndex, court: Court)
    {
        if (playerIndex == PlayerIndex.leftPlayer)
            this.posX = SETTINGS.paddleWidth;
        else
            this.posX = SETTINGS.canvasWidth - 2 * SETTINGS.paddleWidth;
        this.posY =  SETTINGS.canvasHeight / 2 - SETTINGS.paddleHeight / 2;
        this._court = court;
        this._collisionBox = new Rectangle(this.posX, this.posY, SETTINGS.paddleWidth, SETTINGS.paddleHeight);
    }

    static get speed() { return SETTINGS.paddleSpeed; } // pixels per second

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
        if (this.posY + SETTINGS.paddleHeight > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - SETTINGS.paddleHeight;
    }

}


abstract class Controller
{
    private     paddle: Padle;
    private     _socket: WebSocket | null = null;
    protected   _isUpKeyPressed: boolean;
    protected   _isDownKeyPressed: boolean;

    constructor(paddle: Padle)
    {
        this.paddle = paddle;
        this._isUpKeyPressed = false;
        this._isDownKeyPressed = false;
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
        if (this._isUpKeyPressed)
            velocity -= 1;
        if (this._isDownKeyPressed)
            velocity += 1;
        return velocity;
    }

    update(deltaTime: number)
    {
        if (this.velocity > 0)
            this.paddle.moveDown(deltaTime);
        else if (this.velocity < 0)
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
            this.socket.onmessage = (msg) => {
                // this will be changed later when i update the client input handler so it will send a JSON instead
               
                if (msg.data == 'u')
                {
                    console.log(msg.data);
                    this._isUpKeyPressed = true;
                    this._isDownKeyPressed = false;
                }
                else if (msg.data == 'd')
                {
                     console.log(msg.data);
                    this._isDownKeyPressed = true;
                    this._isUpKeyPressed = false;
                }
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
    private gameMode: GameMode;
    public  leftPlayerController: Controller;
    public  rightPlayerController: Controller;

    constructor(gameMode: GameMode)
    {
        this.gameMode = gameMode;
        this.leftPadle = new Padle(PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(PlayerIndex.rightPlayer, this);
        this.leftPlayerController = new onlineController(this.leftPadle) as Controller;
        if (gameMode == GameMode.online)
            this.rightPlayerController = new onlineController(this.rightPadle) as Controller;
        else if (gameMode == GameMode.local)
            this.rightPlayerController = new LocalController(this.rightPadle) as Controller;
        else
            this.rightPlayerController = new AIController(this.rightPadle) as Controller;
    }

    addPlayer(player: WebSocket)
    {
        if (this.leftPlayerController.socket == null)
            this.leftPlayerController.socket = player;
        else if (this.gameMode == GameMode.online)
            this.rightPlayerController.socket = player;
        if (this.gameMode == GameMode.local)
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
        let data: messageInterace =
        {
            leftPlayerPosY: this.leftPadle.posY,
            rightPlayerPosY: this.rightPadle.posY,

            leftPlayerScore: 0, // for now
            rightPlayerScore: 0, // for now

            ballPosX: 0, // for now
            ballPosY: 0, // for now
        }
    
        this.leftPlayerController.socket?.send(JSON.stringify(data));
    }

    get bounds()
    {
        return {
            upper: SETTINGS.courtMarginY + SETTINGS.wallSize,
            lower: SETTINGS.canvasHeight - SETTINGS.courtMarginY - SETTINGS.wallSize,
            left: 0,
            right: SETTINGS.canvasWidth
        }
    }

}

export class PongGame
{
    private _court: Court;

    constructor(gameMode: GameMode)
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
        }, SETTINGS.getIntervalLength());
    }

}
