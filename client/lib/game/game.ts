import {messageInterace , SETTINGS, GameMode, PlayerIndex} from "./interfaces"

class playerController
{
    private _paddle: Padle;
    public  nextPosY: number;
    private _isUpKeyPressed: boolean;
    private _isDownKeyPressed: boolean;
    constructor(paddle: Padle)
    {
        this._paddle = paddle;
        this.nextPosY = paddle.posY;
        this._isUpKeyPressed = false;
        this._isDownKeyPressed = false;

        let that: playerController = this;
        document.addEventListener("keydown", function(e) {
            if (e.key == "w" && that._isUpKeyPressed == false)
            {
                that._isUpKeyPressed = true;
                that._paddle.send('u');
            }
        });

        document.addEventListener("keyup", function(e) {
            if (that._paddle._playerIndex == PlayerIndex.leftPlayer)
            {
                if (e.key == "w") that._isUpKeyPressed = false;
                if (e.key == "s") that._isDownKeyPressed = false;
            }
            else if (that._paddle._playerIndex == PlayerIndex.rightPlayer)
            {
                if (e.key == "ArrowUp") that._isUpKeyPressed = false;
                if (e.key == "ArrowDown") that._isDownKeyPressed = false;
            }
        });
    }

    get velocity()
    {
        // console.log(`nextPosY: ${this.nextPosY}, paddlePosY: ${this._paddle.posY}`);
        if (this.nextPosY > this._paddle.posY)
            return (-1);
        else if (this.nextPosY < this._paddle.posY)
            return (1);
        return 0;
    }
    
    update(deltaTime: number)
    {
        // console.log("bruhhhhh");
        if (this.velocity > 0)
            this._paddle.moveDown(deltaTime);
        else if (this.velocity < 0)
            this._paddle.moveUp(deltaTime);
    }
}

class Padle
{
    posX: number;
    posY: number;
    _playerIndex: PlayerIndex;
    _court: Court;

    constructor(playerIndex: PlayerIndex, court: Court)
    {
       if (playerIndex == PlayerIndex.leftPlayer)
            this.posX = SETTINGS.paddleWidth;
        else
            this.posX = SETTINGS.canvasWidth - 2 * SETTINGS.paddleWidth;
        this.posY =  SETTINGS.canvasHeight / 2 - SETTINGS.paddleHeight / 2;
        this._playerIndex = playerIndex;
        this._court = court;
    }

    static get speed() { return SETTINGS.paddleSpeed; } // pixels per second // maybe useless remove later


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

    get renderColor()
    {
        return this._playerIndex == PlayerIndex.leftPlayer ? SETTINGS.playerOneColor : SETTINGS.playerTwoColor;
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, SETTINGS.paddleWidth, SETTINGS.paddleHeight);
    }
}

class Court
{
    _canvas: HTMLCanvasElement;
    leftPadle: Padle;
    rightPadle: Padle;
    _leftPlayerController: playerController;
    _rightPlayerController: playerController;
    // _scoreBoard: ScoreBoard;
    // _ball: Ball;

    constructor(canvas: HTMLCanvasElement, socket: WebSocket)
    {
        this._canvas = canvas;

        this.leftPadle = new Padle(PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(PlayerIndex.rightPlayer, this);

        this._leftPlayerController = new playerController(this.leftPadle);
        this._rightPlayerController = new playerController(this.rightPadle);

        // this._scoreBoard = new ScoreBoard();
        // this._ball = new Ball(SETTINGS.ballRadius, canvas.width / 2, canvas.height / 2, this);

    }

    get bounds()
    {
        return {
            upper: SETTINGS.courtMarginY + SETTINGS.wallSize,
            lower: this._canvas.height - SETTINGS.courtMarginY - SETTINGS.wallSize,
            left: 0,
            right: this._canvas.width
        }
    }

    public listen(message: messageInterace)
    {
        // console.clear();
        // console.log(message.leftPlayerPosY);
        this._leftPlayerController.nextPosY = message.leftPlayerPosY;
        this._rightPlayerController.nextPosY = message.rightPlayerPosY;

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
    //     if (playerIndex == PlayerIndex.PlayerOne)
    //         this._scoreBoard.leftPlayerScore += 1;
    //     else if (playerIndex == PlayerIndex.PlayerTwo)
    //         this._scoreBoard.rightPlayerScore += 1;

    //     if (this._scoreBoard.winner)
    //         this.ismatchStarted = false;
    //     else
    //     {
    //         this._scoreBoard.round++;
    //         this._spawnBall();
    //     }
    // }

    update(deltaTime: number)
    {
        this._leftPlayerController.update(deltaTime);
        this._rightPlayerController.update(deltaTime);
        // this._ball.update(deltaTime);
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = SETTINGS.wallColor;
        context.fillRect(0, SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
        context.fillRect(0, this._canvas.height - SETTINGS.wallSize - SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
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
    public  gameMode: GameMode;

    constructor(canvas: HTMLCanvasElement, gameMode: GameMode, socket: WebSocket)
    {
        this._canvas = canvas;
        this.gameMode = gameMode;
        this._court = new Court(canvas, socket);

        let that = this;
    }

    public listen(message: messageInterace)
    {
        this._court.listen(message);
    } 

    private _update(deltaTime: number)
    {
        this._court.update(deltaTime);
    }

    private _draw()
    {
        let context = this._canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._court.draw(this._canvas);
        }
    }

    run()
    {
        let parent: PongGame = this;
        let previousUpdateTime = Date.now();
        setInterval(function()
        {
            let updateTime = Date.now();
            let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
            parent._draw();
			previousUpdateTime = updateTime;
        }, SETTINGS.getIntervalLength());
    }

}

export function startGame(canvas: HTMLCanvasElement)
{
    const socket = new WebSocket("ws://localhost:4000/game");
    let pong: PongGame;
    let gameMode: GameMode;

    // socket.addEventListener("message", (event) => {
    //     console.log("Message from server ", event.data);
    // });
    socket.onmessage = (msg) =>
    {
        pong = new PongGame(canvas, msg.data, socket);
        pong.run();
        socket.onmessage = (msg) =>
        {
            pong.listen(JSON.parse(msg.data));
        }
        // message = JSON.parse(msg.data);
        // console.log("bruh: ", message);
    }
    
    // ***** you should change the input to send two signals, if the key is down or not ***** //
    // ***** the current code bellow sends mutipal messages when you keep pressing a key ***** //
    // ***** also add this listener inside of PongGame class ***** //
    window.addEventListener("keydown", function(e) { 
        if (e.key == "w") socket.send('u');
        if (e.key == "s") socket.send('d');
    });
}
