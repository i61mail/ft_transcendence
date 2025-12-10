import * as types from "../types/pong.types";
import { EventEmitter } from "events";
import type { WebSocket } from "ws";
import { FastifyInstance } from 'fastify';
import { playerInfo } from "../types/playerInfo.types";

const event: EventEmitter = new EventEmitter();

class ScoreBoard
{
    leftPlayerScore: number = 0;
    rightPlayerScore: number = 0;
    winnerByForfeit: types.PlayerIndex = types.PlayerIndex.none;

    get winner() : number
    {
        if (this.winnerByForfeit != types.PlayerIndex.none)
            return (this.winnerByForfeit);
        if (this.leftPlayerScore >= types.SETTINGS.winningScore)
            return types.PlayerIndex.leftPlayer;
        if (this.rightPlayerScore >= types.SETTINGS.winningScore)
            return types.PlayerIndex.rightPlayer;
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
    canBeRecovered: boolean = true;

    constructor(court: Court)
    {
        this.posX = types.SETTINGS.canvasWidth / 2;
        this.posY = types.SETTINGS.canvasHeight / 2;
        this._court = court;
        this._velocity = {x: 0, y: 0};
        this._speed = Ball.minSpeed;
    }

    static get minSpeed() { return types.SETTINGS.ballMinSpeed; }
    static get maxSpeed() { return types.SETTINGS.ballMaxSpeed; }
    static get acceleration() { return types.SETTINGS.ballAcceleration; }

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
        return new Rectangle(this.posX - types.SETTINGS.ballRadius,
                            this.posY - types.SETTINGS.ballRadius,
                            types.SETTINGS.ballRadius * 2, types.SETTINGS.ballRadius * 2);
    }

    get velocity() { return this._velocity; }
    set velocity(value: {x: number, y: number}) { this._velocity = value; }


    _overlapsPaddle(paddle: Padle, isLeftPaddle: boolean)
    {
        if (!this.collisionBox.overlaps(paddle.collisionBox))
            return;
        if (this.posY + types.SETTINGS.ballRadius <= paddle.posY ||
            this.posY - types.SETTINGS.ballRadius >= paddle.posY + types.SETTINGS.paddleHeight)
        {
            this._velocity.y *= -1;
            this.canBeRecovered = false;
        }
        else
        {
            this.posX = paddle.collisionBox.right;
            this._velocity.x *= -1;
            if (isLeftPaddle)
            {
                this.posX = paddle.collisionBox.right + types.SETTINGS.ballRadius;
                if (this._court.gameMode == types.GameMode.AI)
                    event.emit("aiPredection", this.posX, this.posY, this.velocity);
            }
            else
                this.posX = paddle.collisionBox.left - types.SETTINGS.ballRadius;
        }
    }

    update(deltaTime: number)
    {
        this.posX += Math.sign(this._velocity.x) * this._speed * deltaTime;
        this.posY += Math.sign(this._velocity.y) * this._speed * deltaTime;

        if (this.posY - types.SETTINGS.ballRadius < this._court.bounds.upper)
        {
            this.posY = this._court.bounds.upper + types.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }
        else if (this.posY + types.SETTINGS.ballRadius > this._court.bounds.lower)
        {
            this.posY = this._court.bounds.lower - types.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }
        if (this.canBeRecovered == true)
        {
            this._overlapsPaddle(this._court.leftPadle, true);
            this._overlapsPaddle(this._court.rightPadle, false);
        }

        if (this.posX < this._court.bounds.left)
        {
            this._court.scorePoint(types.PlayerIndex.rightPlayer);
            this.canBeRecovered = true;
        }
        else if (this.posX > this._court.bounds.right)
        {
            this._court.scorePoint(types.PlayerIndex.leftPlayer);
            this.canBeRecovered = true;
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
    playerIndex: types.PlayerIndex;

    constructor(playerIndex: types.PlayerIndex, court: Court)
    {
        if (playerIndex == types.PlayerIndex.leftPlayer)
            this.posX = types.SETTINGS.paddleWidth;
        else
            this.posX = types.SETTINGS.canvasWidth - 2 * types.SETTINGS.paddleWidth;
        this.posY =  types.SETTINGS.canvasHeight / 2 - types.SETTINGS.paddleHeight / 2;
        this._court = court;
        this._collisionBox = new Rectangle(this.posX, this.posY, types.SETTINGS.paddleWidth, types.SETTINGS.paddleHeight);
        this.playerIndex = playerIndex;
    }

    static get speed() { return types.SETTINGS.paddleSpeed; } // pixels per second

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
        if (this.posY + types.SETTINGS.paddleHeight > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - types.SETTINGS.paddleHeight;
    }

}

abstract class Controller
{
    public  paddle: Padle;
    public  socket: WebSocket;
    public  id: number;
    public  _status: types.keyStat;

    constructor(paddle: Padle, player: playerInfo)
    {
        this.paddle = paddle;
        this._status = types.keyStat.none;
        this.socket = player.socket;
        this.id = player.id;
        console.log('!!!!id:', this.id);
    }

    abstract controlling(): void;


    get velocity()
    {
        let velocity = 0;
        if (this._status == types.keyStat.up)
            velocity += 1;
        else if (this._status == types.keyStat.down)
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

class LocalController extends Controller // remove this later
{
    constructor(paddle: Padle, player: playerInfo)
    {
        super(paddle, player);
    }

    controlling(): void {}

    static listener(socket: WebSocket, leftPlayer: LocalController, rightPlayer: LocalController)
    {
        socket.onmessage = (msg) =>
        {
            const data: string = msg.data.toString();
            if (data.length != 2)
                return ;
            if (data[0] == leftPlayer.paddle.playerIndex.toString())
                leftPlayer._status = parseInt(data[1]!, 10); // i should problem check the message length before using it
            else
                rightPlayer._status = parseInt(data[1]!, 10);
        };
    }
}

class onlineController extends Controller
{
    constructor(paddle: Padle, player: playerInfo)
    {
        super(paddle, player);
    }

    controlling(): void
    {
        if (this.socket)
        {
            this.socket.onmessage = (msg) => {
                const data = msg.data.toString();
                
                this._status = parseInt(data[0], 10);
            }
        }
    }
}

class AIController extends Controller
{
    private _court: Court;
    private _target: number = 0;
    private _difficulty: types.Difficulty;

    constructor(paddle: Padle, court: Court, difficulty: types.Difficulty, player: playerInfo)
    {
        super(paddle, player);

        this._difficulty = difficulty;
        this._court = court;
    }

    controlling(): void
    {
        event.on("aiPredection", (x: number, y: number, vec : {x: number, y: number}) =>
        {

            const Xtarget: number = this.paddle.posX - types.SETTINGS.ballRadius;
            const Ymin: number = this._court.bounds.upper + types.SETTINGS.ballRadius;
            const Ymax: number = this._court.bounds.lower - types.SETTINGS.ballRadius;
            const Ly: number = Ymax - Ymin;

            const horizontalDist: number = Xtarget - x;
            let Yunfold: number;
            if (vec.x === 0)
                Yunfold = y;
            else
                Yunfold = y + (vec.y / vec.x) * horizontalDist;
            const YdistUnfold: number = Yunfold - Ymin;
            const modRemainder: number = ((YdistUnfold % (2 * Ly)) + (2 * Ly)) % (2 * Ly);

            if (modRemainder <= Ly)
                this._target = Ymin + modRemainder;
            else
                this._target = Ymax - (modRemainder - Ly);
            this._target -= types.SETTINGS.paddleHeight / 2;

            this._target += (Math.random() - 0.5) * types.SETTINGS.paddleHeight * this._difficulty;

            if (this._target < this._court.bounds.upper)
                this._target = this._court.bounds.upper;
            else if (this._target + types.SETTINGS.paddleHeight > this._court.bounds.lower)
                this._target = this._court.bounds.lower - types.SETTINGS.paddleHeight;

            this._status = this._target < this.paddle.posY ? types.keyStat.up : types.keyStat.down; 
        });
    }

    get velocity()
    {
        let velocity = 0;
        if (this._status == types.keyStat.up && this._target < this.paddle.posY)
            velocity += 1;
        else if (this._status == types.keyStat.down && this._target > this.paddle.posY)
            velocity -= 1;
        return velocity;
    }
}

class Court
{
    private _isMatchStarted: boolean = true; // might add a timer before it startes
    public  leftPadle: Padle;
    public  rightPadle: Padle;
    public  gameMode: types.GameMode;
    public  leftPlayerController: Controller;
    public  rightPlayerController: Controller;
    public  scoreBoard: ScoreBoard;
    public  ball: Ball;
    private aiDifficulty: types.Difficulty;
    private server: FastifyInstance;

    constructor(gameMode: types.GameMode,
        difficulty: types.Difficulty,
        player1 : playerInfo,
        player2 : playerInfo,
        server: FastifyInstance
    )
    {
        this.server = server;
        this.ball = new Ball(this);
        this.gameMode = gameMode;
        this.aiDifficulty = difficulty;
        this.leftPadle = new Padle(types.PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(types.PlayerIndex.rightPlayer, this);
        if (gameMode == types.GameMode.online)
        {
            this.leftPlayerController = new onlineController(this.leftPadle, player1) as Controller;
            this.rightPlayerController = new onlineController(this.rightPadle, player2) as Controller;
        }
        else if (gameMode == types.GameMode.local)
        {
            this.leftPlayerController = new LocalController(this.leftPadle, player1) as Controller;
            this.rightPlayerController = new LocalController(this.rightPadle, player1) as Controller;
            LocalController.listener(player1.socket, this.leftPlayerController, this.rightPlayerController);
        }
        else
        {
            this.leftPlayerController = new onlineController(this.leftPadle, player1) as Controller;
            this.rightPlayerController = new AIController(this.rightPadle, this, difficulty, player1) as Controller;
        }

        this.scoreBoard = new ScoreBoard()
    }

    onCloseHandler(player1: playerInfo, player2: playerInfo)
    {
        player1.socket.onclose = () =>
        {
            this.scoreBoard.winnerByForfeit = types.PlayerIndex.rightPlayer;
            this.endGame()
        }
        if (player1.id != player2.id)
        {
            player2.socket.onclose = () =>
            {
                this.scoreBoard.winnerByForfeit = types.PlayerIndex.rightPlayer;
                this.endGame()
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
        this.ball.velocity = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this.ball.posX = types.SETTINGS.canvasWidth / 2;
        this.ball.posY = types.SETTINGS.canvasHeight / 2;
        if (this.gameMode == types.GameMode.AI && this.ball.velocity.x == 1)
            event.emit("aiPredection", this.ball.posX, this.ball.posY, this.ball.velocity);
        this.ball.speed = Ball.minSpeed;
    }

    addToDatabase()
    {
        const insertMatchStmt = this.server.db.prepare(`
            INSERT INTO pong_matches (
                game_mode, 
                left_player_id, 
                right_player_id, 
                winner, 
                left_score, 
                right_score, 
                ai_difficulty
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const gameMode : string =
            this.gameMode == types.GameMode.online
            ? 'online' : this.gameMode == types.GameMode.local
            ? 'local' : 'ai';
        
        const difficulty : string | null =
            this.gameMode != types.GameMode.AI
            ? null
            : this.aiDifficulty == types.Difficulty.easy
            ? 'easy' : this.aiDifficulty == types.Difficulty.meduim
            ? 'meduim' : this.aiDifficulty == types.Difficulty.hard
            ? 'hard' : 'impossible'



        const winner: string = this.scoreBoard.winner == types.PlayerIndex.leftPlayer
            ? 'left' : 'right';
        
        const leftId: number = this.leftPlayerController.id;
        const rightId: number | null = this.gameMode == types.GameMode.online
            ? this.rightPlayerController.id
            : null ;
        try
        {
            insertMatchStmt.run(
                gameMode,
                leftId,
                rightId,
                winner,
                this.scoreBoard.leftPlayerScore,
                this.scoreBoard.rightPlayerScore,
                difficulty
            );
        }
        catch (err)
        {
            console.error("Failed to insert match:", err);
        }
    }

    endGame()
    {
        this._isMatchStarted = false;
        this.addToDatabase();
        this.leftPlayerController.socket.send("finished");
        this.rightPlayerController.socket.send("finished");
    }

    async scorePoint(playerIndex: number)
    {
        if (playerIndex == types.PlayerIndex.leftPlayer)
            this.scoreBoard.leftPlayerScore += 1;
        else if (playerIndex == types.PlayerIndex.rightPlayer)
            this.scoreBoard.rightPlayerScore += 1;

        if (this.scoreBoard.winner != 0)
        {
            this.endGame();
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
        this.ball.update(deltaTime);
        let data: types.messageInterace =
        {
            leftPlayerPosY: this.leftPadle.posY,
            rightPlayerPosY: this.rightPadle.posY,

            leftPlayerScore: this.scoreBoard.leftPlayerScore,
            rightPlayerScore: this.scoreBoard.rightPlayerScore,

            ballPosX: this.ball.posX,
            ballPosY: this.ball.posY,
        }
        
        this.leftPlayerController.socket.send(JSON.stringify(data));
        if (this.leftPlayerController.id != this.rightPlayerController.id)
            this.rightPlayerController.socket.send(JSON.stringify(data));
    }

    get bounds()
    {
        return {
            upper: types.SETTINGS.courtMarginY + types.SETTINGS.wallSize,
            lower: types.SETTINGS.canvasHeight - types.SETTINGS.courtMarginY - types.SETTINGS.wallSize,
            left: 0,
            right: types.SETTINGS.canvasWidth
        }
    }

}

export class PongGame
{
    private _court: Court;

    constructor(
        gameMode: types.GameMode,
        server: FastifyInstance,
        player1 : playerInfo,
        player2 : playerInfo = player1,
        difficulty: types.Difficulty = types.Difficulty.hard
    )
    {
        this._court = new Court(gameMode, difficulty, player1, player2, server);
        
        let that = this;
        let data: types.messageInterace =
        {
            leftPlayerPosY: this._court.leftPadle.posY,
            rightPlayerPosY: this._court.rightPadle.posY,

            leftPlayerScore: this._court.scoreBoard.leftPlayerScore,
            rightPlayerScore: this._court.scoreBoard.rightPlayerScore,

            ballPosX: this._court.ball.posX,
            ballPosY: this._court.ball.posY,
        }
        
        this._court.leftPlayerController.socket.send(JSON.stringify(data));
        this._court.rightPlayerController.socket.send(JSON.stringify(data));
        this.run();
    }

    private _update(deltaTime: number)
    {
        this._court.update(deltaTime);
    }

    private async run()
    {
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        let parent: PongGame = this;
        let previousUpdateTime = Date.now();
        this._court.spawnBall();
        this._court.listenToPlayers();
        setInterval(function()
        {
            let updateTime = Date.now();
            let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
			previousUpdateTime = updateTime;
        }, types.SETTINGS.getIntervalLength());
    }
    get winner(): number
    {
        return (this._court.scoreBoard.winner);
    }
}

export function pongOnline(
    player1 : playerInfo,
    player2 : playerInfo,
    server: FastifyInstance
) : PongGame
{
    const data: string =JSON.stringify(
    {
        gm: types.GameMode.online,
        player1: player1.username,
        player2: player2.username
    });
    player1.socket.send(data);
    player2.socket.send(data);

    return new PongGame(types.GameMode.online, server, player1, player2);
}

export function pongLocal(
    player : playerInfo,
    server: FastifyInstance
)
{
    player.socket.send(JSON.stringify(
        {
            gm: types.GameMode.local,
            player1: 'Player 1',
            player2: 'Player 2'
        }));
    let pong: PongGame = new PongGame(types.GameMode.local, server, player);
}

export function pongAI(
    player : playerInfo,
    difficulty: string,
    server: FastifyInstance
)
{

    player.socket.send(JSON.stringify({gm: types.GameMode.AI, player1: player.username, player2: `${difficulty} bot`}));

    let pongDif: types.Difficulty = types.Difficulty.easy;

    switch (difficulty)
    {
        case 'easy':
            pongDif = types.Difficulty.easy;
            break;
        case 'meduim':
            pongDif = types.Difficulty.meduim;
            break;
        case 'hard':
            pongDif = types.Difficulty.hard;
            break;
        default:
            return;
    }
    let pong: PongGame = new PongGame(types.GameMode.AI, server, player, undefined, pongDif);
}
