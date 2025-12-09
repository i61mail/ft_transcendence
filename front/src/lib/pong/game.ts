"use client";
import { stat } from "fs";
import * as intf from "./interfaces";
import { useRouter } from "next/navigation";

class ScoreBoard
{
    leftPlayerScore: number = 0;
    rightPlayerScore: number = 0;
    player1: string;
    player2: string;
    round: number = 0;

    constructor(leftPlayerName: string, rightPlayerName: string)
    {
        this.player1 = leftPlayerName;
        this.player2 = rightPlayerName;
    }

    truncateToWidth(
        context: CanvasRenderingContext2D,
        name: string,
        maxW: number
    ): string
    {
        if (maxW <= 0) return '...';
        if (context.measureText(name).width <= maxW) return name;
        let lo = 0, hi = name.length;
        while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (context.measureText(name.slice(0, mid) + '...').width <= maxW) lo = mid;
        else hi = mid - 1;
        }
        let truncated = name.slice(0, lo);
        while (truncated.length > 0 && context.measureText(truncated + '...').width > maxW) {
        truncated = truncated.slice(0, -1);
        }
        return truncated + '...';
    }

    draw (canvas: HTMLCanvasElement, hasWon: boolean = false)
    {
        let context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!context)
            return;

        context.font = intf.SETTINGS.smallFont;
        context.fillStyle = intf.SETTINGS.scoreTextColor;
        const padding = 20;
        const halfWidth = canvas.width / 2;
        const maxNameArea = Math.max(0, halfWidth - padding * 2);

        const leftScorePart = `: ${this.leftPlayerScore}`;
        const leftScoreWidth = context.measureText(leftScorePart).width;
        const allowedLeftNameWidth = Math.max(0, maxNameArea - leftScoreWidth);
        const leftName = this.truncateToWidth(context ,this.player1, allowedLeftNameWidth);
        context.textAlign = 'left';
        context.fillText(`${leftName}${leftScorePart}`, padding, 30);

        const rightScorePart = `: ${this.rightPlayerScore}`;
        const rightScoreWidth = context.measureText(rightScorePart).width;
        const allowedRightNameWidth = Math.max(0, maxNameArea - rightScoreWidth);
        const rightName = this.truncateToWidth(context, this.player2, allowedRightNameWidth);
        context.textAlign = 'right';
        context.fillText(`${rightName}${rightScorePart}`, canvas.width - padding, 30);

        context.textAlign = 'left';
        context.fillText("Round: " + this.round, canvas.width / 2 - 30, 30); // it's hard coded so change this later
        if (hasWon)
        {
            let winnerText = this.leftPlayerScore > this.rightPlayerScore ? `${this.player1} Wins!` : `${this.player1} Wins!`;
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
        document.addEventListener("keydown", function(e)
        {
            if (e.key == that.upKey && that._status != intf.keyStat.up)
            {
                that._status = intf.keyStat.up;
                if (court.socket.readyState === WebSocket.OPEN)
                    court.socket.send(that.status);
            }
            else if (e.key == that.downKey && that._status != intf.keyStat.down)
            {
                that._status = intf.keyStat.down;
                if (court.socket.readyState === WebSocket.OPEN)
                    court.socket.send(that.status);
            }
        });
        
        document.addEventListener("keyup", function(e)
        {
            if (court.socket.readyState != WebSocket.OPEN)
                return ;
            if ((e.key == that.upKey && that._status == intf.keyStat.up)
                || (e.key == that.downKey && that._status == intf.keyStat.down))
            {
                that._status = intf.keyStat.none;
                if (court.socket.readyState === WebSocket.OPEN)
                    court.socket.send(that.status);
            }
        });
    }

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

    constructor(socket: WebSocket, info: string)
    {
        const { gm, player1, player2 } = JSON.parse(info);
        console.log('info:', info);
        this.socket = socket;
        this.gameMode = gm;

        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this, true, this.gameMode);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this, true, this.gameMode);

        this._scoreBoard = new ScoreBoard(player1, player2);
        this._ball = new Ball();

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
    private status: 'start' | 'ingame' | 'finished' = 'start';

    constructor(canvas: HTMLCanvasElement, info: string, socket: WebSocket)
    {
        this._canvas = canvas;
        this._court = new Court(socket, info);
    }

    public listen(message: intf.messageInterface)
    {
        this._court.listen(message);
        this._draw();
    } 

    private _draw()
    {
        let context = this._canvas.getContext('2d');
        if (context && this.status != 'finished') {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._court.draw(this._canvas);
            if (this.status == 'start')
            {
                console.log("type start");
                context.fillStyle = intf.SETTINGS.scoreTextColor;
                context.font = intf.SETTINGS.largeFont;
                context.fillText("Game will start now...", this._canvas.width / 2 - 80, this._canvas.height / 2);
                this.status = 'ingame';
            }
        }
    }

    async finish(onFinish: () => void)
    {
        this.status = 'finished';
        this._court._scoreBoard.draw(this._canvas, true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        onFinish();
    }
}

export function startGame(
    canvas: HTMLCanvasElement,
    socket: WebSocket,
    data: string,
    onFinish: () => void
)
{
    canvas.width = intf.SETTINGS.canvasWidth;
    canvas.height = intf.SETTINGS.canvasHeight;
    canvas.style.backgroundColor = intf.SETTINGS.canvasColor;
    const pong: PongGame = new PongGame(canvas, data, socket);

    socket.onmessage = (msg) =>
    {
        if (msg.data == "finished")
            pong.finish(onFinish);
        else
            pong.listen(JSON.parse(msg.data));
    }
}
