var SETTINGS = {
    // court
    wallColor: "#202020",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    // logic
    getIntervalLength: function () { return (1.0 / this.targetFps) * 1000; },
    targetFps: 30,
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
var PlayerIndex = {
    PlayerOne: 1,
    PlayerTwo: 2
};
var PongGame = /** @class */ (function () {
    function PongGame(canvas) {
        this._canvas = canvas;
        this._court = new Court(canvas);
        var that = this;
        document.addEventListener("keydown", function (e) {
            if (e.key == "Enter" && !that._court.ismatchStarted)
                that._court.startMatch();
        });
    }
    PongGame.prototype._update = function (deltaTime) {
        this._court.update(deltaTime);
    };
    PongGame.prototype.draw = function () {
        var context = this._canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._court.draw(this._canvas);
        }
    };
    PongGame.prototype.run = function () {
        var parent = this;
        var previousUpdateTime = Date.now();
        setInterval(function () {
            var updateTime = Date.now();
            var deltaTime = (updateTime - previousUpdateTime) / 1000.0;
            parent._update(deltaTime);
            parent.draw();
            previousUpdateTime = updateTime;
        }, SETTINGS.getIntervalLength());
    };
    return PongGame;
}());
var Court = /** @class */ (function () {
    function Court(canvas) {
        this._canvas = canvas;
        this.leftPadle = new Padle(SETTINGS.paddleWidth, canvas.height / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PlayerIndex.PlayerOne, this);
        this.rightPadle = new Padle(canvas.width - 2 * SETTINGS.paddleWidth, canvas.height / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PlayerIndex.PlayerTwo, this);
        this._leftPlayerController = new playerController(this.leftPadle);
        this._rightPlayerController = new playerController(this.rightPadle);
        this._scoreBoard = new ScoreBoard();
        this._ball = new Ball(SETTINGS.ballRadius, canvas.width / 2, canvas.height / 2, this);
        this.ismatchStarted = false;
    }
    Object.defineProperty(Court.prototype, "bounds", {
        get: function () {
            return {
                upper: SETTINGS.courtMarginY + SETTINGS.wallSize,
                lower: this._canvas.height - SETTINGS.courtMarginY - SETTINGS.wallSize,
                left: 0,
                right: this._canvas.width
            };
        },
        enumerable: false,
        configurable: true
    });
    Court.prototype.startMatch = function () {
        this.ismatchStarted = true;
        this._spawnBall();
        this._scoreBoard.reset();
        this.leftPadle.reset();
        this.rightPadle.reset();
        this._scoreBoard.round = 1;
    };
    Court.prototype._spawnBall = function () {
        this._ball.velocity = {
            x: Math.random() > 0.5 ? 1 : -1,
            y: Math.random() > 0.5 ? 1 : -1
        };
        this._ball.posX = this._canvas.width / 2;
        this._ball.posY = this._canvas.height / 2;
        this._ball.speed = Ball.minSpeed;
    };
    Court.prototype.scorePoint = function (playerIndex) {
        if (playerIndex == PlayerIndex.PlayerOne)
            this._scoreBoard.leftPlayerScore += 1;
        else if (playerIndex == PlayerIndex.PlayerTwo)
            this._scoreBoard.rightPlayerScore += 1;
        if (this._scoreBoard.winner)
            this.ismatchStarted = false;
        else {
            this._scoreBoard.round++;
            this._spawnBall();
        }
    };
    Court.prototype.update = function (deltaTime) {
        if (!this.ismatchStarted)
            return;
        this._leftPlayerController.update(deltaTime);
        this._rightPlayerController.update(deltaTime);
        this._ball.update(deltaTime);
    };
    Court.prototype.draw = function (canvas) {
        var context = canvas.getContext('2d');
        if (!context)
            return;
        context.fillStyle = SETTINGS.wallColor;
        context.fillRect(0, SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
        context.fillRect(0, this._canvas.height - SETTINGS.wallSize - SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
        this.leftPadle.draw(canvas);
        this.rightPadle.draw(canvas);
        this._ball.draw(this._canvas);
        this._scoreBoard.draw(this._canvas);
    };
    return Court;
}());
var playerController = /** @class */ (function () {
    function playerController(paddle) {
        this._paddle = paddle;
        this._isUpKeyPressed = false;
        this._isDownKeyPressed = false;
        var that = this;
        document.addEventListener("keydown", function (e) {
            if (that._paddle._playerIndex == PlayerIndex.PlayerOne) {
                that._isUpKeyPressed = (e.key == "w") ? true : that._isUpKeyPressed;
                that._isDownKeyPressed = (e.key == "s") ? true : that._isDownKeyPressed;
            }
            else {
                that._isUpKeyPressed = (e.key == "ArrowUp") ? true : that._isUpKeyPressed;
                that._isDownKeyPressed = (e.key == "ArrowDown") ? true : that._isDownKeyPressed;
            }
        });
        document.addEventListener("keyup", function (e) {
            if (that._paddle._playerIndex == PlayerIndex.PlayerOne) {
                that._isUpKeyPressed = (e.key == "w") ? false : that._isUpKeyPressed;
                that._isDownKeyPressed = (e.key == "s") ? false : that._isDownKeyPressed;
            }
            else {
                that._isUpKeyPressed = (e.key == "ArrowUp") ? false : that._isUpKeyPressed;
                that._isDownKeyPressed = (e.key == "ArrowDown") ? false : that._isDownKeyPressed;
            }
        });
    }
    Object.defineProperty(playerController.prototype, "velocity", {
        get: function () {
            var velocity = 0;
            if (this._isUpKeyPressed)
                velocity -= 1;
            if (this._isDownKeyPressed)
                velocity += 1;
            return velocity;
        },
        enumerable: false,
        configurable: true
    });
    playerController.prototype.update = function (deltaTime) {
        if (this.velocity > 0)
            this._paddle.moveDown(deltaTime);
        else if (this.velocity < 0)
            this._paddle.moveUp(deltaTime);
    };
    return playerController;
}());
var Padle = /** @class */ (function () {
    function Padle(posX, posY, width, height, PlayerIndex, court) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this._playerIndex = PlayerIndex;
        this._court = court;
        this._startPosX = posX;
        this._startPosY = posY;
    }
    Object.defineProperty(Padle, "speed", {
        get: function () { return SETTINGS.paddleSpeed; } // pixels per second
        ,
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Padle.prototype, "collisionBox", {
        get: function () {
            return new Rectangle(this.posX, this.posY, this.width, this.height);
        },
        enumerable: false,
        configurable: true
    });
    Padle.prototype.moveUp = function (deltaTime) {
        this.posY -= Padle.speed * deltaTime;
        if (this.posY < this._court.bounds.upper)
            this.posY = this._court.bounds.upper;
    };
    Padle.prototype.moveDown = function (deltaTime) {
        this.posY += Padle.speed * deltaTime;
        if (this.posY + this.height > this._court.bounds.lower)
            this.posY = this._court.bounds.lower - this.height;
    };
    Padle.prototype.reset = function () {
        this.posX = this._startPosX;
        this.posY = this._startPosY;
    };
    Object.defineProperty(Padle.prototype, "renderColor", {
        get: function () {
            return this._playerIndex == PlayerIndex.PlayerOne ? SETTINGS.playerOneColor : SETTINGS.playerTwoColor;
        },
        enumerable: false,
        configurable: true
    });
    Padle.prototype.draw = function (canvas) {
        var context = canvas.getContext('2d');
        if (!context)
            return;
        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, this.width, this.height);
    };
    return Padle;
}());
var Ball = /** @class */ (function () {
    function Ball(radius, posX, posY, court) {
        this.radius = radius;
        this.posX = posX;
        this.posY = posY;
        this._court = court;
        this._startPosX = posX;
        this._startPosY = posY;
        this._velocity = { x: 0, y: 0 };
        this._speed = Ball.minSpeed;
    }
    Object.defineProperty(Ball, "minSpeed", {
        get: function () { return SETTINGS.ballMinSpeed; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball, "maxSpeed", {
        get: function () { return SETTINGS.ballMaxSpeed; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball, "acceleration", {
        get: function () { return SETTINGS.ballAcceleration; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "speed", {
        get: function () { return this._speed; },
        set: function (value) {
            if (value < Ball.minSpeed)
                this._speed = Ball.minSpeed;
            else if (value > Ball.maxSpeed)
                this._speed = Ball.maxSpeed;
            else
                this._speed = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "normalizedSpeed", {
        get: function () {
            return (this._speed - Ball.minSpeed) / (Ball.maxSpeed - Ball.minSpeed);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "collisionBox", {
        get: function () {
            return new Rectangle(this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "velocity", {
        get: function () { return this._velocity; },
        set: function (value) { this._velocity = value; },
        enumerable: false,
        configurable: true
    });
    Ball.prototype.draw = function (canvas) {
        var context = canvas.getContext('2d');
        if (!context)
            return;
        context.fillStyle = SETTINGS.ballColor;
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
    };
    Ball.prototype.update = function (deltaTime) {
        this.posX += Math.sign(this._velocity.x) * this._speed * deltaTime;
        this.posY += Math.sign(this._velocity.y) * this._speed * deltaTime;
        if (this.posY - this.radius < this._court.bounds.upper) {
            this.posY = this._court.bounds.upper + this.radius;
            this._velocity.y *= -1;
        }
        else if (this.posY + this.radius > this._court.bounds.lower) {
            this.posY = this._court.bounds.lower - this.radius;
            this._velocity.y *= -1;
        }
        if (this.collisionBox.overlaps(this._court.leftPadle.collisionBox)) {
            this.posX = this._court.leftPadle.collisionBox.right + this.radius;
            this._velocity.x *= -1;
        }
        else if (this.collisionBox.overlaps(this._court.rightPadle.collisionBox)) {
            this.posX = this._court.rightPadle.collisionBox.left - this.radius;
            this._velocity.x *= -1;
        }
        if (this.posX < this._court.bounds.left) {
            this._court.scorePoint(PlayerIndex.PlayerTwo);
        }
        else if (this.posX > this._court.bounds.right) {
            this._court.scorePoint(PlayerIndex.PlayerOne);
        }
        this.speed += Ball.acceleration * deltaTime;
    };
    return Ball;
}());
var ScoreBoard = /** @class */ (function () {
    function ScoreBoard() {
        this.reset();
    }
    Object.defineProperty(ScoreBoard.prototype, "winner", {
        get: function () {
            if (this.leftPlayerScore >= SETTINGS.winningScore)
                return PlayerIndex.PlayerOne;
            if (this.rightPlayerScore >= SETTINGS.winningScore)
                return PlayerIndex.PlayerTwo;
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    ScoreBoard.prototype.draw = function (canvas) {
        var context = canvas.getContext('2d');
        if (!context)
            return;
        context.font = SETTINGS.smallFont;
        context.fillStyle = SETTINGS.scoreTextColor;
        context.fillText("Player 1: " + this.leftPlayerScore, 20, 30); // it's hard coded so change this later
        context.fillText("Player 2: " + this.rightPlayerScore, canvas.width - 120, 30); // it's hard coded so change this later
        context.fillText("Round: " + this.round, canvas.width / 2 - 30, 30); // it's hard coded so change this later
        if (this.winner) {
            var winnerText = this.winner == (PlayerIndex.PlayerOne) ? "Player 1 Wins!" : "Player 2 Wins!";
            context.font = SETTINGS.largeFont;
            context.fillText(winnerText, canvas.width / 2 - 80, canvas.height / 2); // it's hard coded so change this later
        }
    };
    ScoreBoard.prototype.reset = function () {
        this.leftPlayerScore = 0;
        this.rightPlayerScore = 0;
        this.round = 0;
    };
    return ScoreBoard;
}());
var Rectangle = /** @class */ (function () {
    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(Rectangle.prototype, "left", {
        get: function () { return this.x; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "right", {
        get: function () { return this.x + this.width; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "top", {
        get: function () { return this.y; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "bottom", {
        get: function () { return this.y + this.height; },
        enumerable: false,
        configurable: true
    });
    Rectangle.prototype.overlaps = function (other) {
        return other.left < this.right &&
            this.left < other.right &&
            other.top < this.bottom &&
            this.top < other.bottom;
    };
    Rectangle.prototype.contains = function (x, y) {
        return this.left < x && this.right > x &&
            this.top < y && this.bottom > y;
    };
    return Rectangle;
}());
function startGame() {
    var canvas = document.getElementById("canvas");
    var pong = new PongGame(canvas);
    pong.run();
}
