interface settingsInterface {
    // court
    wallColor: string;
	wallSize: number;
	courtMarginX: number;
	courtMarginY: number;
    // logic
    getIntervalLength: () => number;
    targetFps: number;
    // paddle
    paddleSpeed: number;
    playerOneColor: string;
    playerTwoColor: string;
    paddleWidth: number;
    paddleHeight: number;
    // scoreboard
    winningScore: number;
    smallFont: string;
    largeFont: string;
    scoreTextColor: string;
    // ball
    ballMinSpeed: number;
    ballMaxSpeed: number;
    ballColor: string;
    ballAcceleration: number;
    ballRadius: number;
}

const SETTINGS: settingsInterface = {
	// court
    wallColor: "#b8b8b8ff",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    // logic
    getIntervalLength: function() { return (1000 / this.targetFps); }, // milliseconds
    targetFps: 60,
    // paddle
    paddleSpeed: 200, // pixels per second
    playerOneColor: "#0000FF",
    playerTwoColor: "#FF0000",
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 7,
    smallFont: "20px Arial",
    largeFont: "30px Arial",
    scoreTextColor: "#F0EAD6", // eggshell white
    // ball
    ballMinSpeed: 200,
    ballMaxSpeed: 300,
    ballColor: "#F0EAD6", // eggshell white
    ballAcceleration: 10,
    ballRadius: 8
};

const PlayerIndex = {
    PlayerOne: 1,
    PlayerTwo: 2
};
 
class PongGame
{
	_canvas: HTMLCanvasElement;
	_court: Court;
    constructor(canvas: HTMLCanvasElement)
    {
        this._canvas = canvas;
        this._court = new Court(canvas);

        let that = this;

        document.addEventListener("keydown", (e) => {
            if (e.key == "Enter" && !that._court.ismatchStarted)
                that._court.startMatch();
        });
    }
    _update(deltaTime: number)
    {
        this._court.update(deltaTime);
    }

    draw()
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
            parent.draw();
			previousUpdateTime = updateTime;
        }, SETTINGS.getIntervalLength());
    }
}

class Court
{
    _canvas: HTMLCanvasElement;
    leftPadle: Padle;
    rightPadle: Padle;
    _leftPlayerController: playerController;
    _rightPlayerController: playerController;
    _scoreBoard: ScoreBoard;
    _ball: Ball;
    ismatchStarted: boolean;

    constructor(canvas: HTMLCanvasElement)
    {
        this._canvas = canvas;

        this.leftPadle = new Padle(SETTINGS.paddleWidth,
            canvas.height / 2 - SETTINGS.paddleHeight / 2,
            SETTINGS.paddleWidth, SETTINGS.paddleHeight, PlayerIndex.PlayerOne, this);
        this.rightPadle = new Padle(canvas.width - 2 * SETTINGS.paddleWidth,
            canvas.height / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth,
            SETTINGS.paddleHeight, PlayerIndex.PlayerTwo, this);

        this._leftPlayerController = new playerController(this.leftPadle);
        this._rightPlayerController = new playerController(this.rightPadle);

        this._scoreBoard = new ScoreBoard();
        this._ball = new Ball(SETTINGS.ballRadius, canvas.width / 2, canvas.height / 2, this);

        this.ismatchStarted = false;
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

    startMatch()
    {
        this.ismatchStarted = true;
        this._spawnBall();
        this._scoreBoard.reset();
        this.leftPadle.reset();
        this.rightPadle.reset();
        this._scoreBoard.round = 1;
    }

    _spawnBall()
    {
        this._ball.velocity = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this._ball.posX = this._canvas.width / 2;
        this._ball.posY = this._canvas.height / 2;
        this._ball.speed = Ball.minSpeed;
    }

    scorePoint(playerIndex: number)
    {
        if (playerIndex == PlayerIndex.PlayerOne)
            this._scoreBoard.leftPlayerScore += 1;
        else if (playerIndex == PlayerIndex.PlayerTwo)
            this._scoreBoard.rightPlayerScore += 1;

        if (this._scoreBoard.winner)
            this.ismatchStarted = false;
        else
        {
            this._scoreBoard.round++;
            this._spawnBall();
        }
    }

    update(deltaTime: number)
    {
        if (!this.ismatchStarted)
            return;

        this._leftPlayerController.update(deltaTime);
        this._rightPlayerController.update(deltaTime);
        this._ball.update(deltaTime);
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
        this._ball.draw(this._canvas);
        this._scoreBoard.draw(this._canvas);
    }
}

class playerController
{
    _paddle: Padle;
    _isUpKeyPressed: boolean;
    _isDownKeyPressed: boolean;

    constructor(paddle: Padle)
    {
        this._paddle = paddle;
        this._isUpKeyPressed = false;
        this._isDownKeyPressed = false;

        let that: playerController = this;
        document.addEventListener("keydown", function(e) {
            if (that._paddle._playerIndex == PlayerIndex.PlayerOne)
            {
                if (e.key == "w") that._isUpKeyPressed = true;
                if (e.key == "s") that._isDownKeyPressed = true;
            }
            else if (that._paddle._playerIndex == PlayerIndex.PlayerTwo)
            {
                if (e.key == "ArrowUp") that._isUpKeyPressed = true;
                if (e.key == "ArrowDown") that._isDownKeyPressed = true;
            }
        });

        document.addEventListener("keyup", function(e) {
            if (that._paddle._playerIndex == PlayerIndex.PlayerOne)
            {
                if (e.key == "w") that._isUpKeyPressed = false;
                if (e.key == "s") that._isDownKeyPressed = false;
            }
            else if (that._paddle._playerIndex == PlayerIndex.PlayerTwo)
            {
                if (e.key == "ArrowUp") that._isUpKeyPressed = false;
                if (e.key == "ArrowDown") that._isDownKeyPressed = false;
            }
        });
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
            this._paddle.moveDown(deltaTime);
        else if (this.velocity < 0)
            this._paddle.moveUp(deltaTime);
    }
}

class Padle
{
    posX: number;
    posY: number;
    width: number;
    height: number;
    _playerIndex: number;
    _court: Court;
    _startPosX: number;
    _startPosY: number;

    constructor(posX: number, posY: number, width: number, height: number, PlayerIndex: number, court: Court)
    {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this._playerIndex = PlayerIndex;
        this._court = court;
        this._startPosX = posX;
        this._startPosY = posY;
    }

    static get speed() { return SETTINGS.paddleSpeed; } // pixels per second

    get collisionBox()
    {
        return new Rectangle(this.posX, this.posY, this.width, this.height);
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
        if (this.posY + this.height > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - this.height;
    }

    reset()
    {
        this.posX = this._startPosX;
        this.posY = this._startPosY;
    }

    get renderColor()
    {
        return this._playerIndex == PlayerIndex.PlayerOne ? SETTINGS.playerOneColor : SETTINGS.playerTwoColor;
    }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, this.width, this.height);
    }
}

class Ball
{
    radius: number;
    posX: number;
    posY: number;
    _court: Court;
    _startPosX: number;
    _startPosY: number;
    _velocity: {x: number, y: number};
    _speed: number;

    constructor(radius: number, posX: number, posY: number, court: Court)
    {
        this.radius = radius;
        this.posX = posX;
        this.posY = posY;
        this._court = court;
        this._startPosX = posX;
        this._startPosY = posY;
        this._velocity = {x: 0, y: 0};
        this._speed = Ball.minSpeed;
    }

    static get minSpeed() { return SETTINGS.ballMinSpeed; }
    static get maxSpeed() { return SETTINGS.ballMaxSpeed; }
    static get acceleration() { return SETTINGS.ballAcceleration; }

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

    get normalizedSpeed()
    {
        return (this._speed - Ball.minSpeed) / (Ball.maxSpeed - Ball.minSpeed);
    }

    get collisionBox()
    {
        return new Rectangle(this.posX - this.radius,
                            this.posY - this.radius,
                            this.radius * 2, this.radius * 2);
    }

    get velocity() { return this._velocity; }
    set velocity(value: {x: number, y: number}) { this._velocity = value; }

    draw(canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.fillStyle = SETTINGS.ballColor;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
    }

    update(deltaTime: number)
    {
        this.posX += Math.sign(this._velocity.x) * this._speed * deltaTime;
        this.posY += Math.sign(this._velocity.y) * this._speed * deltaTime;

        if (this.posY - this.radius < this._court.bounds.upper)
        {
            this.posY = this._court.bounds.upper + this.radius;
            this._velocity.y *= -1;
        }
        else if (this.posY + this.radius > this._court.bounds.lower)
        {
            this.posY = this._court.bounds.lower - this.radius;
            this._velocity.y *= -1;
        }

        if (this.collisionBox.overlaps(this._court.leftPadle.collisionBox))
        {
            this.posX = this._court.leftPadle.collisionBox.right + this.radius;
            this._velocity.x *= -1;
        }
        else if (this.collisionBox.overlaps(this._court.rightPadle.collisionBox))
        {
            this.posX = this._court.rightPadle.collisionBox.left - this.radius;
            this._velocity.x *= -1;
        }

        if (this.posX < this._court.bounds.left)
        {
            this._court.scorePoint(PlayerIndex.PlayerTwo);
        }
        else if (this.posX > this._court.bounds.right)
        {
            this._court.scorePoint(PlayerIndex.PlayerOne);
        }
        this.speed += Ball.acceleration * deltaTime;
    }
}

class ScoreBoard
{
    leftPlayerScore: number = 0;
    rightPlayerScore: number = 0;
    round: number = 0;

    constructor()
    {
        this.reset();
    }

    get winner()
    {
        if (this.leftPlayerScore >= SETTINGS.winningScore)
            return PlayerIndex.PlayerOne;
        if (this.rightPlayerScore >= SETTINGS.winningScore)
            return PlayerIndex.PlayerTwo;
        return 0;
    }

    draw (canvas: HTMLCanvasElement)
    {
        let context = canvas.getContext('2d');
        if (!context)
            return;

        context.font = SETTINGS.smallFont;
        context.fillStyle = SETTINGS.scoreTextColor;
        context.fillText("Player 1: " + this.leftPlayerScore, 20, 30); // it's hard coded so change this later
        context.fillText("Player 2: " + this.rightPlayerScore, canvas.width - 120, 30); // it's hard coded so change this later
        context.fillText("Round: " + this.round, canvas.width / 2 - 30, 30); // it's hard coded so change this later
        if (this.winner)
        {
            let winnerText = this.winner == (PlayerIndex.PlayerOne) ? "Player 1 Wins!" : "Player 2 Wins!";
            context.font = SETTINGS.largeFont;
            context.fillText(winnerText, canvas.width / 2 - 80, canvas.height / 2); // it's hard coded so change this later
        }
    }

    reset()
    {
        this.leftPlayerScore = 0;
        this.rightPlayerScore = 0;
        this.round = 0;
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

    // contains(x: number, y: number) // did not use it, might remove later
    // {
    //     return  this.left < x && this.right > x &&
    //             this.top < y && this.bottom > y;
    // } 
}

export function startGame(canvas: HTMLCanvasElement)
{
	let pong: PongGame = new PongGame(canvas);
	pong.run();
}
