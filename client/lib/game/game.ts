import * as intf from "./interfaces";

class ScoreBoard
{
    leftPlayerScore: number = 0;
    rightPlayerScore: number = 0;
    round: number = 0;

    get winner() : number
    {
        if (this.leftPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.leftPlayer;
        if (this.rightPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.rightPlayer;
        return 0;
    }

    draw (canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.font = intf.SETTINGS.smallFont;
        context.fillStyle = intf.SETTINGS.scoreTextColor;
        context.fillText("Player 1: " + this.leftPlayerScore, 20, 30); // it's hard coded so change this later
        context.fillText("Player 2: " + this.rightPlayerScore, canvas.width - 120, 30); // it's hard coded so change this later
        context.fillText("Round: " + this.round, canvas.width / 2 - 30, 30); // it's hard coded so change this later
        if (this.winner)
        {
            let winnerText = this.winner == (intf.PlayerIndex.leftPlayer) ? "Player 1 Wins!" : "Player 2 Wins!";
            context.font = intf.SETTINGS.largeFont;
            context.fillText(winnerText, canvas.width / 2 - 80, canvas.height / 2); // it's hard coded so change this later
        }
    }

    update(leftPS: number, rightPS:number)
    {
        this.leftPlayerScore = leftPS;
        this.rightPlayerScore = rightPS;
        this.round = leftPS + rightPS + 1;
    }
}

class Ball
{
    posX: number;
    posY: number;

    constructor()
    {
        this.posX = intf.SETTINGS.canvasWidth / 2;
        this.posY = intf.SETTINGS.canvasHeight / 2;
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;
        context.fillStyle = intf.SETTINGS.ballColor;
        context.beginPath();
        context.arc(this.posX, this.posY, intf.SETTINGS.ballRadius, 0, Math.PI * 2, false);
        context.fill();
    }
    
    update(nextPosX: number, nextPosY: number)
    {
        this.posX = nextPosX;
        this.posY = nextPosY;
    }
}


class Padle
{
    public  posX: number;
    public  posY: number;
    public  playerIndex: intf.PlayerIndex;
    private _status: intf.keyStat;
    private _gameMode:intf.GameMode;

    constructor(playerIndex: intf.PlayerIndex, court: Court, isPlayable: boolean, gameMode: intf.GameMode)
    {
       if (playerIndex == intf.PlayerIndex.leftPlayer)
            this.posX = intf.SETTINGS.paddleWidth;
        else
            this.posX = intf.SETTINGS.canvasWidth - 2 * intf.SETTINGS.paddleWidth;
        this.posY =  intf.SETTINGS.canvasHeight / 2 - intf.SETTINGS.paddleHeight / 2;
        this.playerIndex  = playerIndex;
        this._status = intf.keyStat.none;
        this._gameMode = gameMode;

        let that: Padle = this;
        if (this._gameMode == intf.GameMode.online && !isPlayable)
            return ;
        document.addEventListener("keydown", function(e) {
            if (e.key == that.upKey && that._status != intf.keyStat.up)
            {
                that._status = intf.keyStat.up;
                court.socket.send(that.status);
            }
            else if (e.key == that.downKey && that._status != intf.keyStat.down)
            {
                that._status = intf.keyStat.down;
                court.socket.send(that.status);
            }
        });
        
        document.addEventListener("keyup", function(e) {
            if ((e.key == that.upKey && that._status == intf.keyStat.up)
                || (e.key == that.downKey && that._status == intf.keyStat.down))
            {
                that._status = intf.keyStat.none;
                court.socket.send(that.status);
            }
        });
    }

    static get speed() { return intf.SETTINGS.paddleSpeed; } // pixels per second // maybe useless remove later

    get upKey(): string
    {
        return this._gameMode == intf.GameMode.local && this.playerIndex == intf.PlayerIndex.rightPlayer
                ? "ArrowUp" : "w";
    }
    get downKey(): string
    {
        return this._gameMode == intf.GameMode.local && this.playerIndex == intf.PlayerIndex.rightPlayer
                ? "ArrowDown" : "s";
    }

    get status() : string
    {
        if (this._gameMode == intf.GameMode.local)
        {
            return this.playerIndex.toString() + this._status.toString();
        }
        return this._status.toString();
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
    leftPadle!: Padle;
    rightPadle!: Padle;
    gameMode: intf.GameMode;
    socket: WebSocket;
    _scoreBoard: ScoreBoard;
    _ball: Ball;

    constructor(canvas: HTMLCanvasElement, socket: WebSocket, info: string)
    {
        const { gm, plyI } = JSON.parse(info);

        this.socket = socket;
        this.gameMode = gm;

        this.createControllers(plyI);

        this._scoreBoard = new ScoreBoard();
        this._ball = new Ball();

    }

    createControllers(plyI: number)
    {
        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this, (plyI == 0) ? true : false, this.gameMode);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this, (plyI == 1) ? true : false, this.gameMode);
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

    public listen(message: intf.messageInterface)
    {
        this.leftPadle.posY = message.leftPlayerPosY;
        this.rightPadle.posY = message.rightPlayerPosY;
        this._ball.update(message.ballPosX, message.ballPosY);
        this._scoreBoard.update(message.leftPlayerScore, message.rightPlayerScore);
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = intf.SETTINGS.wallColor;
        context.fillRect(0, intf.SETTINGS.courtMarginY, intf.SETTINGS.canvasWidth, intf.SETTINGS.wallSize);
        context.fillRect(0, intf.SETTINGS.canvasHeight - intf.SETTINGS.wallSize - intf.SETTINGS.courtMarginY, intf.SETTINGS.canvasWidth, intf.SETTINGS.wallSize);
        this.leftPadle.draw(canvas);
        this.rightPadle.draw(canvas);
        this._ball.draw(canvas);
        this._scoreBoard.draw(canvas);
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

    canvas.width = intf.SETTINGS.canvasWidth;
    canvas.height = intf.SETTINGS.canvasHeight;
    canvas.style.backgroundColor = intf.SETTINGS.canvasColor;
    socket.onmessage = (msg) =>
    {
        pong = new PongGame(canvas, msg.data, socket);
        socket.onmessage = (msg) =>
        {
            pong.listen(JSON.parse(msg.data));
        }
    }
}
