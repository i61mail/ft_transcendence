const SETTINGS = {
    wallColor: "#202020",
    wallSize: 30,
    courtMarginX: 12, // might remove later if not used
    courtMarginY: 10,
    targetFps: 30,
    speed: 200, // pixels per second
    playerOneColor: "#0000FF",
    playerTwoColor: "#FF0000",
    paddleWidth: 12,
    paddleHeight: 80,
    getIntervalLength: function() { return (1.0 / this.targetFps) * 1000; }
};

const PlayerIndex = {
    PlayerOne: 1,
    PlayerTwo: 2
};

class PongGame
{
    constructor(canvas)
    {
        this._canvas = canvas;
        this._court = new Court(canvas);
    }

    _update(deltaTime)
    {

    }

    draw()
    {
        let context = this._canvas.getContext('2d');
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._court.draw(this._canvas);
    }

    run()
    {
        let parent = this;
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
    constructor(canvas)
    {
        this._canvas = canvas;

        this.leftPadle = new Padle(SETTINGS.paddleWidth, canvas.height / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PlayerIndex.PlayerOne, this);
        this.rightPadle = new Padle(canvas.width - 2 * SETTINGS.paddleWidth, canvas.height / 2 - SETTINGS.paddleHeight / 2, SETTINGS.paddleWidth, SETTINGS.paddleHeight, PlayerIndex.PlayerTwo, this);
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

    update(deltaTime)
    {
        
    }

    draw(canvas)
    {
        let context = canvas.getContext('2d');
        context.fillStyle = SETTINGS.wallColor;
        context.fillRect(0, SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
        context.fillRect(0, this._canvas.height - SETTINGS.wallSize - SETTINGS.courtMarginY, this._canvas.width, SETTINGS.wallSize);
        this.leftPadle.draw(canvas);
        this.rightPadle.draw(canvas);
    }
}

class Padle
{
    constructor(posX, posY, width, height, PlayerIndex, court)
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

    static get speed() { return SETTINGS.speed; } // pixels per second

    get collisionBox()
    {
        return new Rectangle(this.posX, this.posY, this.width, this.height);
    }
    
    moveUp(deltaTime)
    {
        this.posY -= Padle.speed * deltaTime;
        if (this.posY < this._court.bounds.upper)
            this.posY = this._court.bounds.upper;
    }

    moveDown(deltaTime)
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

    draw(canvas)
    {
        let context = canvas.getContext('2d');
        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, this.width, this.height);
    }
}

class Rectangle
{
	constructor(x, y, width, height)
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

    overlaps(other)
    {
        return  other.left < this.right &&
                this.left < other.right &&
                other.top < this.bottom &&
                this.top < other.bottom;
    }

    contains(x, y)
    {
        return  this.left < x && this.right > x &&
                this.top < y && this.bottom > y;
    } 
}

function startGame()
{
    let canvas = document.getElementById("canvas");
	let pong = new PongGame(canvas);
	pong.run();
}
