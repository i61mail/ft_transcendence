(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/lib/pong/interfaces.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameMode",
    ()=>GameMode,
    "PlayerIndex",
    ()=>PlayerIndex,
    "SETTINGS",
    ()=>SETTINGS,
    "keyStat",
    ()=>keyStat
]);
const SETTINGS = {
    // canvas
    canvasColor: "#004c00ff",
    canvasWidth: 800,
    canvasHeight: 600,
    // court
    wallColor: "#b8b8b8ff",
    wallSize: 30,
    courtMarginX: 12,
    courtMarginY: 10,
    // logic
    getIntervalLength: function() {
        return 1000 / this.targetFps;
    },
    targetFps: 60,
    // paddle
    paddleSpeed: 200,
    playerOneColor: "#0000FF",
    playerTwoColor: "#FF0000",
    paddleWidth: 12,
    paddleHeight: 80,
    // scoreboard
    winningScore: 7,
    smallFont: "20px Arial",
    largeFont: "30px Arial",
    scoreTextColor: "#F0EAD6",
    // ball
    ballMinSpeed: 200,
    ballMaxSpeed: 300,
    ballColor: "#F0EAD6",
    ballAcceleration: 10,
    ballRadius: 8
};
var GameMode = /*#__PURE__*/ function(GameMode) {
    GameMode[GameMode["online"] = 0] = "online";
    GameMode[GameMode["local"] = 1] = "local";
    GameMode[GameMode["AI"] = 2] = "AI";
    return GameMode;
}({});
var PlayerIndex = /*#__PURE__*/ function(PlayerIndex) {
    PlayerIndex[PlayerIndex["leftPlayer"] = 1] = "leftPlayer";
    PlayerIndex[PlayerIndex["rightPlayer"] = 2] = "rightPlayer";
    return PlayerIndex;
}({});
var keyStat = /*#__PURE__*/ function(keyStat) {
    keyStat[keyStat["down"] = 0] = "down";
    keyStat[keyStat["up"] = 1] = "up";
    keyStat[keyStat["none"] = 2] = "none";
    return keyStat;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/pong/game.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "startGame",
    ()=>startGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/pong/interfaces.ts [app-client] (ecmascript)");
;
;
class ScoreBoard {
    get winner() {
        if (this.leftPlayerScore >= __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].winningScore) return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].leftPlayer;
        if (this.rightPlayerScore >= __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].winningScore) return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].rightPlayer;
        return 0;
    }
    draw(canvas) {
        let context = canvas.getContext('2d');
        if (!context) return;
        context.font = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].smallFont;
        context.fillStyle = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].scoreTextColor;
        context.fillText("Player 1: " + this.leftPlayerScore, 20, 30); // it's hard coded so change this later
        context.fillText("Player 2: " + this.rightPlayerScore, canvas.width - 120, 30); // it's hard coded so change this later
        context.fillText("Round: " + this.round, canvas.width / 2 - 30, 30); // it's hard coded so change this later
        if (this.winner) {
            let winnerText = this.winner == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].leftPlayer ? "Player 1 Wins!" : "Player 2 Wins!";
            context.font = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].largeFont;
            context.fillText(winnerText, canvas.width / 2 - 80, canvas.height / 2); // it's hard coded so change this later
        }
    }
    update(leftPS, rightPS) {
        this.leftPlayerScore = leftPS;
        this.rightPlayerScore = rightPS;
        this.round = leftPS + rightPS + 1;
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "leftPlayerScore", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "rightPlayerScore", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "round", 0);
    }
}
class Ball {
    draw(canvas) {
        let context = canvas.getContext('2d');
        if (!context) return;
        context.fillStyle = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].ballColor;
        context.beginPath();
        context.arc(this.posX, this.posY, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].ballRadius, 0, Math.PI * 2, false);
        context.fill();
    }
    update(nextPosX, nextPosY) {
        this.posX = nextPosX;
        this.posY = nextPosY;
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "posX", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "posY", void 0);
        this.posX = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth / 2;
        this.posY = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasHeight / 2;
    }
}
class Padle {
    static get speed() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleSpeed;
    }
    get upKey() {
        return this._gameMode == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].local && this.playerIndex == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].rightPlayer ? "ArrowUp" : "w";
    }
    get downKey() {
        return this._gameMode == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].local && this.playerIndex == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].rightPlayer ? "ArrowDown" : "s";
    }
    get status() {
        if (this._gameMode == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].local) {
            return this.playerIndex.toString() + this._status.toString();
        }
        return this._status.toString();
    }
    get renderColor() {
        return this.playerIndex == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].leftPlayer ? __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].playerOneColor : __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].playerTwoColor;
    }
    draw(canvas) {
        let context = canvas.getContext('2d');
        if (!context) return;
        context.fillStyle = this.renderColor;
        context.fillRect(this.posX, this.posY, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleWidth, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleHeight);
    }
    constructor(playerIndex, court, isPlayable, gameMode){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "posX", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "posY", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "playerIndex", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_status", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_gameMode", void 0);
        if (playerIndex == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].leftPlayer) this.posX = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleWidth;
        else this.posX = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth - 2 * __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleWidth;
        this.posY = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasHeight / 2 - __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].paddleHeight / 2;
        this.playerIndex = playerIndex;
        this._status = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].none;
        this._gameMode = gameMode;
        let that = this;
        if (this._gameMode == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].online && !isPlayable) return;
        document.addEventListener("keydown", function(e) {
            if (e.key == that.upKey && that._status != __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].up) {
                that._status = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].up;
                if (court.socket.readyState === WebSocket.OPEN) court.socket.send(that.status);
            } else if (e.key == that.downKey && that._status != __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].down) {
                that._status = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].down;
                if (court.socket.readyState === WebSocket.OPEN) court.socket.send(that.status);
            }
        });
        document.addEventListener("keyup", function(e) {
            if (court.socket.readyState != WebSocket.OPEN) return;
            if (e.key == that.upKey && that._status == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].up || e.key == that.downKey && that._status == __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].down) {
                that._status = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keyStat"].none;
                if (court.socket.readyState === WebSocket.OPEN) court.socket.send(that.status);
            }
        });
    }
}
class Court {
    get bounds() {
        return {
            upper: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].courtMarginY + __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallSize,
            lower: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasHeight - __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].courtMarginY - __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallSize,
            left: 0,
            right: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth
        };
    }
    listen(message) {
        this.leftPadle.posY = message.leftPlayerPosY;
        this.rightPadle.posY = message.rightPlayerPosY;
        this._ball.update(message.ballPosX, message.ballPosY);
        this._scoreBoard.update(message.leftPlayerScore, message.rightPlayerScore);
    }
    draw(canvas) {
        let context = canvas.getContext('2d');
        if (!context) return;
        context.fillStyle = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallColor;
        context.fillRect(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].courtMarginY, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallSize);
        context.fillRect(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasHeight - __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallSize - __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].courtMarginY, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].wallSize);
        this.leftPadle.draw(canvas);
        this.rightPadle.draw(canvas);
        this._ball.draw(canvas);
        this._scoreBoard.draw(canvas);
    }
    constructor(canvas, socket, info){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "leftPadle", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "rightPadle", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "gameMode", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "socket", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_scoreBoard", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_ball", void 0);
        const { gm, playerIndex } = JSON.parse(info);
        this.socket = socket;
        this.gameMode = gm;
        this.leftPadle = new Padle(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].leftPlayer, this, playerIndex == 0 ? true : false, this.gameMode);
        this.rightPadle = new Padle(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlayerIndex"].rightPlayer, this, playerIndex == 1 ? true : false, this.gameMode);
        this._scoreBoard = new ScoreBoard();
        this._ball = new Ball();
    }
}
class PongGame {
    listen(message) {
        this._court.listen(message);
        this._draw();
    }
    _draw() {
        let context = this._canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._court.draw(this._canvas);
        }
    }
    constructor(canvas, info, socket){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_canvas", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "_court", void 0);
        this._canvas = canvas;
        this._court = new Court(canvas, socket, info);
    }
}
function startGame(canvas, socket, data) {
    let pong;
    canvas.width = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasWidth;
    canvas.height = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasHeight;
    canvas.style.backgroundColor = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$interfaces$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS"].canvasColor;
    pong = new PongGame(canvas, data, socket);
    socket.onmessage = (msg)=>{
        console.log("on message working!");
        pong.listen(JSON.parse(msg.data));
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/app/games/online/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$context$2f$GlobalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/context/GlobalStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$game$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/pong/game.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const OnlineGame = ()=>{
    _s();
    const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$context$2f$GlobalStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const [start, setStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OnlineGame.useEffect": ()=>{
            if (manager.gameSocket && !sentRef.current) {
                var _manager_user;
                console.log("starting online game...");
                const data = {
                    gameType: "online",
                    data: {
                        player: {
                            id: (_manager_user = manager.user) === null || _manager_user === void 0 ? void 0 : _manager_user.id
                        }
                    }
                };
                manager.gameSocket.send(JSON.stringify(data));
                sentRef.current = true;
                manager.gameSocket.onmessage = ({
                    "OnlineGame.useEffect": (msg)=>{
                        console.log(msg.data);
                        setStart(true);
                        if (canvasRef.current && manager.gameSocket) {
                            console.log("start");
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$pong$2f$game$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startGame"])(canvasRef.current, manager.gameSocket, msg.data);
                        }
                    }
                })["OnlineGame.useEffect"];
            }
        }
    }["OnlineGame.useEffect"], [
        manager.gameSocket
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            width: 800,
            height: 600,
            children: "if you see this message, than the canvas did not load propraly"
        }, void 0, false, {
            fileName: "[project]/frontend/app/games/online/page.tsx",
            lineNumber: 38,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false);
};
_s(OnlineGame, "E+I0PsBAGlWoLV+Bs/YvEadnD8c=");
_c = OnlineGame;
const __TURBOPACK__default__export__ = OnlineGame;
var _c;
__turbopack_context__.k.register(_c, "OnlineGame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_",
    ()=>_define_property
]);
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else obj[key] = value;
    return obj;
}
;
}),
]);

//# sourceMappingURL=frontend_a0c9faf9._.js.map