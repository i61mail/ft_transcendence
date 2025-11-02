import * as intf from "./interfaces";

class PlayerController
{
    public  nextPos: number;
    private _paddle: Padle;
    private _status: intf.keyStat;

    constructor(paddle: Padle, court: Court, isPlayable: boolean)
    {
        this._paddle = paddle;
        this.nextPos = paddle.posY;
        this._status = intf.keyStat.none;
        
        let that: PlayerController = this;
        if (isPlayable)
        {
            document.addEventListener("keydown", function(e) {
                if (e.key == "w" && that._status != intf.keyStat.up)
                {
                    that._status = intf.keyStat.up;
                    court.socket.send(that._status.toString());
                }
                else if (e.key == "s" && that._status != intf.keyStat.down)
                {
                    that._status = intf.keyStat.down;
                    court.socket.send(that._status.toString());
                }
            });
            
            document.addEventListener("keyup", function(e) {
                if ((e.key == "w" && that._status == intf.keyStat.up)
                    || (e.key == "s" && that._status == intf.keyStat.down))
                {
                    that._status = intf.keyStat.none;
                    court.socket.send(that._status.toString());
                }
            });
        }
    }
    
    update()
    {
        this._paddle.posY = this.nextPos;
    }
}

class Padle
{
    public  posX: number;
    public  posY: number;
    public  playerIndex: intf.PlayerIndex;
    private _court: Court;

    constructor(playerIndex: intf.PlayerIndex, court: Court)
    {
       if (playerIndex == intf.PlayerIndex.leftPlayer)
            this.posX = intf.SETTINGS.paddleWidth;
        else
            this.posX = intf.SETTINGS.canvasWidth - 2 * intf.SETTINGS.paddleWidth;
        this.posY =  intf.SETTINGS.canvasHeight / 2 - intf.SETTINGS.paddleHeight / 2;
        this.playerIndex  = playerIndex;
        this._court = court;
    }

    static get speed() { return intf.SETTINGS.paddleSpeed; } // pixels per second // maybe useless remove later


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

    get renderColor()
    {
        return this.playerIndex  == intf.PlayerIndex.leftPlayer ? intf.SETTINGS.playerOneColor : intf.SETTINGS.playerTwoColor;
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, intf.SETTINGS.paddleWidth, intf.SETTINGS.paddleHeight);
    }
}

class Court
{
    _canvas: HTMLCanvasElement;
    leftPadle: Padle;
    rightPadle: Padle;
    _leftPlayerController!: PlayerController;
    _rightPlayerController!: PlayerController;
    gameMode: intf.GameMode;
    socket: WebSocket;
    // _scoreBoard: ScoreBoard;
    // _ball: Ball;

    constructor(canvas: HTMLCanvasElement, socket: WebSocket, info: string)
    {
        const { gm, plyI } = JSON.parse(info);

        this.socket = socket;
        this.gameMode = gm;
        this._canvas = canvas;
        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this);

        this.createControllers(plyI);

        // this._scoreBoard = new ScoreBoard();
        // this._ball = new Ball(Interfaces.SETTINGS.ballRadius, canvas.width / 2, canvas.height / 2, this);

    }

    createControllers(plyI: number)
    {
        if (this.gameMode == intf.GameMode.online)
        {
            this._leftPlayerController = new PlayerController(this.leftPadle, this, (plyI == 0) ? true : false);
            this._rightPlayerController = new PlayerController(this.rightPadle, this, (plyI == 1) ? true : false);
        }
    }

    get bounds()
    {
        return {
            upper: intf.SETTINGS.courtMarginY + intf.SETTINGS.wallSize,
            lower: this._canvas.height - intf.SETTINGS.courtMarginY - intf.SETTINGS.wallSize,
            left: 0,
            right: this._canvas.width
        }
    }

    public listen(message: intf.messageInterface)
    {
        this._leftPlayerController.nextPos = message.leftPlayerPosY;
        this._rightPlayerController.nextPos = message.rightPlayerPosY;

        //update ball postion and scoreboard
    }

    // startMatch()
    // {
    //     this.ismatchStarted = true;
    //     this._spawnBall();
    //     // this._scoreBoard.reset();
    //     this.leftPadle.reset();
    //     this.rightPadle.reset();
    //     this._scoreBoeard.round = 1;
    // }

    // _spawnBall()
    // {
    //     this._ball.velocity = {
    //         x: Math.random() > 0.5 ? 1 : -1,
    //         y: Math.random() > 0.5 ? 1 : -1
    //     };
    //     this._ball.posX = this._canvas.width / 2;
    //     this._ball.posY = this._canvas.height / 2;
    //     this._ball.speed = Ball.minSpeed;
    // }

    // scorePoint(playerIndex: number)
    // {
    //     if (playerIndex == Interfaces.PlayerIndex.PlayerOne)
    //         this._scoreBoard.leftPlayerScore += 1;
    //     else if (playerIndex == Interfaces.PlayerIndex.PlayerTwo)
    //         this._scoreBoard.rightPlayerScore += 1;

    //     if (this._scoreBoard.winner)
    //         this.ismatchStarted = false;
    //     else
    //     {
    //         this._scoreBoard.round++;
    //         this._spawnBall();
    //     }
    // }

    update()
    {
        this._leftPlayerController.update();
        this._rightPlayerController.update();
        // this._ball.update(deltaTime);
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = intf.SETTINGS.wallColor;
        context.fillRect(0, intf.SETTINGS.courtMarginY, this._canvas.width, intf.SETTINGS.wallSize);
        context.fillRect(0, this._canvas.height - intf.SETTINGS.wallSize - intf.SETTINGS.courtMarginY, this._canvas.width, intf.SETTINGS.wallSize);
        this.leftPadle.draw(canvas);
        this.rightPadle.draw(canvas);
        // this._ball.draw(this._canvas);
        // this._scoreBoard.draw(this._canvas);
    }
}

class PongGame
{
	private _canvas: HTMLCanvasElement;
	private _court: Court;

    constructor(canvas: HTMLCanvasElement, info: string, socket: WebSocket)
    {
        this._canvas = canvas;
        this._court = new Court(canvas, socket, info);
    }

    public listen(message: intf.messageInterface)
    {
        this._court.listen(message);
        this._court.update();
        this._draw();
    } 

    private _draw()
    {
        let context = this._canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._court.draw(this._canvas);
        }
    }

}

export function startGame(canvas: HTMLCanvasElement)
{
    const socket = new WebSocket("ws://localhost:4000/game");
    let pong: PongGame;
    let gameMode: intf.GameMode;

    socket.onmessage = (msg) =>
    {
        pong = new PongGame(canvas, msg.data, socket);
        socket.onmessage = (msg) =>
        {
            pong.listen(JSON.parse(msg.data));
        }
    }
}
