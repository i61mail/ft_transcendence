import { Socket } from "dgram";
import * as intf from "./interfaces.js";
import { EventEmitter } from "events";
// const fastify = Fastify({ logger: true });
// fastify.register(dbPlugin);
const event = new EventEmitter();
class ScoreBoard {
    leftPlayerScore = 0;
    rightPlayerScore = 0;
    get winner() {
        if (this.leftPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.leftPlayer;
        if (this.rightPlayerScore >= intf.SETTINGS.winningScore)
            return intf.PlayerIndex.rightPlayer;
        return 0;
    }
}
class Rectangle {
    x;
    y;
    width;
    height;
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get top() { return this.y; }
    get bottom() { return this.y + this.height; }
    overlaps(other) {
        return other.left < this.right &&
            this.left < other.right &&
            other.top < this.bottom &&
            this.top < other.bottom;
    }
}
class Ball {
    posX;
    posY;
    _court;
    _velocity;
    _speed;
    canBeRecovered = true;
    constructor(court) {
        this.posX = intf.SETTINGS.canvasWidth / 2;
        this.posY = intf.SETTINGS.canvasHeight / 2;
        this._court = court;
        this._velocity = { x: 0, y: 0 };
        this._speed = Ball.minSpeed;
    }
    static get minSpeed() { return intf.SETTINGS.ballMinSpeed; }
    static get maxSpeed() { return intf.SETTINGS.ballMaxSpeed; }
    static get acceleration() { return intf.SETTINGS.ballAcceleration; }
    get speed() { return this._speed; }
    set speed(value) {
        if (value < Ball.minSpeed)
            this._speed = Ball.minSpeed;
        else if (value > Ball.maxSpeed)
            this._speed = Ball.maxSpeed;
        else
            this._speed = value;
    }
    get collisionBox() {
        return new Rectangle(this.posX - intf.SETTINGS.ballRadius, this.posY - intf.SETTINGS.ballRadius, intf.SETTINGS.ballRadius * 2, intf.SETTINGS.ballRadius * 2);
    }
    get velocity() { return this._velocity; }
    set velocity(value) { this._velocity = value; }
    _overlapsPaddle(paddle, isLeftPaddle) {
        if (!this.collisionBox.overlaps(paddle.collisionBox))
            return;
        if (this.posY + intf.SETTINGS.ballRadius <= paddle.posY ||
            this.posY - intf.SETTINGS.ballRadius >= paddle.posY + intf.SETTINGS.paddleHeight) {
            this._velocity.y *= -1;
            this.canBeRecovered = false;
        }
        else {
            this.posX = paddle.collisionBox.right;
            this._velocity.x *= -1;
            if (isLeftPaddle) {
                this.posX = paddle.collisionBox.right + intf.SETTINGS.ballRadius;
                if (this._court.gameMode == intf.GameMode.AI)
                    event.emit("aiPredection", this.posX, this.posY, this.velocity);
            }
            else
                this.posX = paddle.collisionBox.left - intf.SETTINGS.ballRadius;
        }
    }
    update(deltaTime) {
        this.posX += Math.sign(this._velocity.x) * this._speed * deltaTime;
        this.posY += Math.sign(this._velocity.y) * this._speed * deltaTime;
        if (this.posY - intf.SETTINGS.ballRadius < this._court.bounds.upper) {
            this.posY = this._court.bounds.upper + intf.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }
        else if (this.posY + intf.SETTINGS.ballRadius > this._court.bounds.lower) {
            this.posY = this._court.bounds.lower - intf.SETTINGS.ballRadius;
            this._velocity.y *= -1;
        }
        if (this.canBeRecovered == true) {
            this._overlapsPaddle(this._court.leftPadle, true);
            this._overlapsPaddle(this._court.rightPadle, false);
        }
        if (this.posX < this._court.bounds.left) {
            this._court.scorePoint(intf.PlayerIndex.rightPlayer);
            this.canBeRecovered = true;
        }
        else if (this.posX > this._court.bounds.right) {
            this._court.scorePoint(intf.PlayerIndex.leftPlayer);
            this.canBeRecovered = true;
        }
        this.speed += Ball.acceleration * deltaTime;
    }
}
class Padle {
    posX;
    posY;
    _court;
    _collisionBox;
    playerIndex;
    constructor(playerIndex, court) {
        if (playerIndex == intf.PlayerIndex.leftPlayer)
            this.posX = intf.SETTINGS.paddleWidth;
        else
            this.posX = intf.SETTINGS.canvasWidth - 2 * intf.SETTINGS.paddleWidth;
        this.posY = intf.SETTINGS.canvasHeight / 2 - intf.SETTINGS.paddleHeight / 2;
        this._court = court;
        this._collisionBox = new Rectangle(this.posX, this.posY, intf.SETTINGS.paddleWidth, intf.SETTINGS.paddleHeight);
        this.playerIndex = playerIndex;
    }
    static get speed() { return intf.SETTINGS.paddleSpeed; } // pixels per second
    get collisionBox() {
        this._collisionBox.x = this.posX;
        this._collisionBox.y = this.posY;
        return (this._collisionBox);
    }
    moveUp(deltaTime) {
        this.posY -= Padle.speed * deltaTime;
        if (this.posY < this._court.bounds.upper)
            this.posY = this._court.bounds.upper;
    }
    moveDown(deltaTime) {
        this.posY += Padle.speed * deltaTime;
        if (this.posY + intf.SETTINGS.paddleHeight > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - intf.SETTINGS.paddleHeight;
    }
}
class Controller {
    paddle;
    socket;
    id;
    _status;
    constructor(paddle, player) {
        this.paddle = paddle;
        this._status = intf.keyStat.none;
        this.socket = player.socket;
        this.id = player.id;
    }
    get velocity() {
        let velocity = 0;
        if (this._status == intf.keyStat.up)
            velocity += 1;
        else if (this._status == intf.keyStat.down)
            velocity -= 1;
        return velocity;
    }
    update(deltaTime) {
        const velocity = this.velocity;
        if (velocity < 0)
            this.paddle.moveDown(deltaTime);
        else if (velocity > 0)
            this.paddle.moveUp(deltaTime);
    }
}
class LocalController extends Controller // remove this later
 {
    constructor(paddle, player) {
        super(paddle, player);
    }
    controlling() { }
    static listener(socket, leftPlayer, rightPlayer) {
        socket.onmessage = (msg) => {
            const data = msg.data.toString();
            console.log(data);
            if (data.length != 2)
                return;
            if (data[0] == leftPlayer.paddle.playerIndex.toString())
                leftPlayer._status = parseInt(data[1], 10); // i should problem check the message length before using it
            else
                rightPlayer._status = parseInt(data[1], 10);
        };
    }
}
class onlineController extends Controller {
    constructor(paddle, player) {
        super(paddle, player);
    }
    controlling() {
        if (this.socket) {
            this.socket.onmessage = (msg) => {
                this._status = parseInt(msg.data.toString(), 10);
            };
        }
    }
}
class AIController extends Controller {
    _court;
    _target = 0;
    _difficulty;
    constructor(paddle, court, difficulty, player) {
        super(paddle, player);
        this._difficulty = difficulty;
        this._court = court;
    }
    controlling() {
        event.on("aiPredection", (x, y, vec) => {
            const Xtarget = this.paddle.posX - intf.SETTINGS.ballRadius;
            const Ymin = this._court.bounds.upper + intf.SETTINGS.ballRadius;
            const Ymax = this._court.bounds.lower - intf.SETTINGS.ballRadius;
            const Ly = Ymax - Ymin;
            const horizontalDist = Xtarget - x;
            let Yunfold;
            if (vec.x === 0)
                Yunfold = y;
            else
                Yunfold = y + (vec.y / vec.x) * horizontalDist;
            const YdistUnfold = Yunfold - Ymin;
            const modRemainder = ((YdistUnfold % (2 * Ly)) + (2 * Ly)) % (2 * Ly);
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
    get velocity() {
        let velocity = 0;
        if (this._status == intf.keyStat.up && this._target < this.paddle.posY)
            velocity += 1;
        else if (this._status == intf.keyStat.down && this._target > this.paddle.posY)
            velocity -= 1;
        return velocity;
    }
}
class Court {
    _isMatchStarted = true; // might add a timer before it startes
    leftPadle;
    rightPadle;
    gameMode;
    leftPlayerController;
    rightPlayerController;
    _ball;
    _scoreBoard;
    aiDifficulty;
    constructor(gameMode, difficulty, player1, player2) {
        this._ball = new Ball(this);
        this.gameMode = gameMode;
        this.aiDifficulty = difficulty;
        this.leftPadle = new Padle(intf.PlayerIndex.leftPlayer, this);
        this.rightPadle = new Padle(intf.PlayerIndex.rightPlayer, this);
        if (gameMode == intf.GameMode.online) {
            this.leftPlayerController = new onlineController(this.leftPadle, player1);
            this.rightPlayerController = new onlineController(this.rightPadle, player2);
        }
        else if (gameMode == intf.GameMode.local) {
            this.leftPlayerController = new LocalController(this.leftPadle, player1);
            this.rightPlayerController = new LocalController(this.rightPadle, player1);
            LocalController.listener(player1.socket, this.leftPlayerController, this.rightPlayerController);
        }
        else {
            this.leftPlayerController = new onlineController(this.leftPadle, player1);
            this.rightPlayerController = new AIController(this.rightPadle, this, difficulty, player1);
        }
        this._scoreBoard = new ScoreBoard();
    }
    listenToPlayers() {
        this.leftPlayerController.controlling();
        this.rightPlayerController.controlling();
    }
    spawnBall() {
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
    // addToDatabase()
    // {
    //     const insertMatchStmt = fastify.db.prepare(`
    //         INSERT INTO pong_matches (
    //             game_mode, 
    //             left_player_id, 
    //             right_player_id, 
    //             winner, 
    //             left_score, 
    //             right_score, 
    //             ai_difficulty
    //         ) VALUES (
    //             @game_mode, 
    //             @left_player_id, 
    //             @right_player_id, 
    //             @winner, 
    //             @left_score, 
    //             @right_score, 
    //             @ai_difficulty
    //         )
    //     `);
    //         const gameMode : 'online' | 'local' | 'ai' =
    //             this.gameMode == intf.GameMode.online
    //             ? 'online' : this.gameMode == intf.GameMode.local
    //             ? 'local' : 'ai';
    //         const difficulty : string | null =
    //             this.gameMode != intf.GameMode.AI
    //             ? null : this.aiDifficulty == intf.Difficulty.easy
    //             ? 'easy' : this.aiDifficulty == intf.Difficulty.meduim
    //             ? 'meduim' : this.aiDifficulty == intf.Difficulty.hard
    //             ? 'hard' : 'impossible'
    //         const matchData: intf.PongDataBase = {
    //             game_mode: gameMode,
    //             left_player_id: this.leftPlayerController.id,
    //             right_player_id: this.rightPlayerController.id,
    //             winner: this._scoreBoard.winner == intf.PlayerIndex.leftPlayer
    //                     ? 'left' : 'right',
    //             left_score: this._scoreBoard.leftPlayerScore,
    //             right_score: this._scoreBoard.rightPlayerScore,
    //             ai_difficulty: difficulty
    //         };
    //         try
    //         {
    //             insertMatchStmt.run(matchData);
    //         }
    //         catch (err)
    //         {
    //             console.error("Failed to insert match:", err);
    //         }
    // }
    scorePoint(playerIndex) {
        if (playerIndex == intf.PlayerIndex.leftPlayer)
            this._scoreBoard.leftPlayerScore += 1;
        else if (playerIndex == intf.PlayerIndex.rightPlayer)
            this._scoreBoard.rightPlayerScore += 1;
        if (this._scoreBoard.winner != 0) {
            this._isMatchStarted = false;
            // this.addToDatabase();
        }
        else
            this.spawnBall();
    }
    update(deltaTime) {
        if (this._isMatchStarted == false)
            return;
        this.leftPlayerController.update(deltaTime);
        this.rightPlayerController.update(deltaTime);
        this._ball.update(deltaTime);
        let data = {
            // this is a vector, so eithert change the name of it or make the user teleport to where it's position on the server instead
            leftPlayerPosY: this.leftPadle.posY,
            rightPlayerPosY: this.rightPadle.posY,
            //might add the current position in case there was a big delay between the paddle position in the server and in the client 
            leftPlayerScore: this._scoreBoard.leftPlayerScore,
            rightPlayerScore: this._scoreBoard.rightPlayerScore,
            ballPosX: this._ball.posX,
            ballPosY: this._ball.posY
        };
        this.leftPlayerController.socket.send(JSON.stringify(data));
        this.rightPlayerController.socket.send(JSON.stringify(data));
    }
    get bounds() {
        return {
            upper: intf.SETTINGS.courtMarginY + intf.SETTINGS.wallSize,
            lower: intf.SETTINGS.canvasHeight - intf.SETTINGS.courtMarginY - intf.SETTINGS.wallSize,
            left: 0,
            right: intf.SETTINGS.canvasWidth
        };
    }
}
export class PongGame {
    _court;
    constructor(gameMode, player1, player2 = player1, difficulty = intf.Difficulty.impossible) {
        this._court = new Court(gameMode, difficulty, player1, player2);
        let that = this;
        this._court.listenToPlayers();
        this.run();
    }
    _update(deltaTime) {
        this._court.update(deltaTime);
    }
    run() {
        let parent = this;
        let previousUpdateTime = Date.now();
        this._court.spawnBall();
        setInterval(function () {
            let updateTime = Date.now();
            let deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
            previousUpdateTime = updateTime;
        }, intf.SETTINGS.getIntervalLength());
    }
}
export function pongOnline(player1, player2) {
    player1.socket.send(JSON.stringify({ gm: intf.GameMode.local, plyI: 0 }));
    player2.socket.send(JSON.stringify({ gm: intf.GameMode.local, plyI: 1 }));
    let pong = new PongGame(intf.GameMode.online, player1, player2);
}
export function pongLocal(player) {
    player.socket.send(JSON.stringify({ gm: intf.GameMode.local, plyI: 0 }));
    let pong = new PongGame(intf.GameMode.local, player);
}
export function pongAI(player, difficulty) {
    player.socket.send(JSON.stringify({ gm: intf.GameMode.local, plyI: 0 }));
    let pong = new PongGame(intf.GameMode.AI, player, undefined, difficulty);
}
