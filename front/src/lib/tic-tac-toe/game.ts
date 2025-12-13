import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import * as intf from "./interfaces";
import { SETTINGS } from "./interfaces";

class TicTacToeGame
{
	private socket: WebSocket;
	private ctx: CanvasRenderingContext2D;
	private winner!: intf.Symbol | 'Draw';
	private winningCells!: [number, number][];
	private currentPlayer: intf.Symbol = 'X';
	private playableChar: intf.Symbol;
	private	canvas: HTMLCanvasElement;
	private board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];
	
	constructor(socket: WebSocket, canvas: HTMLCanvasElement, plySymbole: intf.Symbol)
	{
		this.socket = socket;
		this.playableChar = plySymbole;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.draw();
		this.handleClick = this.handleClick.bind(this);
		this.canvas.addEventListener('click', this.handleClick);
	}

	handleClick(e: MouseEvent)
	{
		const canvasRect: DOMRect = this.canvas.getBoundingClientRect();
		const x: number = (e.clientX - canvasRect.left);
		const y: number = (e.clientY - canvasRect.top) - SETTINGS.headerHeight;
		
		// Calculate grid position (accounting for header offset)
		const gridWidth = SETTINGS.squareSize * 3;
		const collumn: number = Math.floor((x / canvasRect.width) * 3);
		const row: number = Math.floor((y / gridWidth) * 3);

		if (row < 0 || row > 2 || collumn < 0 || collumn > 2
			|| this.board[row][collumn] != ''
			|| this.currentPlayer != this.playableChar)
			return;
		
		console.log("data sent:", {row, collumn});
		this.socket.send(JSON.stringify({row, collumn}));

	}
	
	listen(message: intf.gameMessage | intf.winnerMessage) : boolean
	{
		if (message.type == intf.messageType.midGame)
		{
			this.board = message.board;
			this.currentPlayer = message.currentPLayer;
			this.draw();
			return (false);
		}
		else
		{
			this.winningCells = message.winningCells;
			this.winner = message.winner;
			this.board = message.board;
			this.draw();
			this.drawStatus();
			this.highlightWinning();
			return (true);
		}
	}

	drawGrid()
	{
		if (!this.ctx)
			return ;
		
		const gridWidth = SETTINGS.squareSize * 3;
		this.ctx.clearRect(0, 0, gridWidth, SETTINGS.canvaSize);
		
		// Draw turn indicator at the top
		this.drawTurnIndicator();
		
		const offsetY = SETTINGS.headerHeight;
		
		this.ctx.lineWidth = SETTINGS.borderSize;
		this.ctx.strokeStyle = SETTINGS.borderColor;
		this.ctx.lineCap = 'round';
		
		for (let i = 1; i <= 2; i++) {
			// vertical
			this.ctx.beginPath();
			this.ctx.moveTo(i * SETTINGS.squareSize, offsetY + 10);
			this.ctx.lineTo(i * SETTINGS.squareSize, offsetY + gridWidth - 10);
			this.ctx.stroke();
			// horizontal
			this.ctx.beginPath();
			this.ctx.moveTo(10, offsetY + i * SETTINGS.squareSize);
			this.ctx.lineTo(gridWidth - 10, offsetY + i * SETTINGS.squareSize);
			this.ctx.stroke();
		}
	}

	drawX(r: number, c: number)
	{
		const offsetY = SETTINGS.headerHeight;
		const padding = SETTINGS.squareSize * 0.25;
		const x1 = c * SETTINGS.squareSize + padding;
		const y1 = offsetY + r * SETTINGS.squareSize + padding;
		const x2 = (c + 1) * SETTINGS.squareSize - padding;
		const y2 = offsetY + (r + 1) * SETTINGS.squareSize - padding;

		this.ctx.strokeStyle = SETTINGS.xColor;
		this.ctx.lineWidth = SETTINGS.xoLineWidth;
		this.ctx.lineCap = 'round';
		this.ctx.shadowColor = SETTINGS.xColor;
		this.ctx.shadowBlur = 10;
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.moveTo(x2, y1);
		this.ctx.lineTo(x1, y2);
		this.ctx.stroke();
		this.ctx.shadowBlur = 0;
	}

	drawO(r: number, c: number)
	{
		const offsetY = SETTINGS.headerHeight;
		const cx = c * SETTINGS.squareSize + SETTINGS.squareSize / 2;
		const cy = offsetY + r * SETTINGS.squareSize + SETTINGS.squareSize / 2;
		const radius = SETTINGS.squareSize * 0.3;

		this.ctx.strokeStyle = SETTINGS.oColor;
		this.ctx.lineWidth = SETTINGS.xoLineWidth;
		this.ctx.lineCap = 'round';
		this.ctx.shadowColor = SETTINGS.oColor;
		this.ctx.shadowBlur = 10;
		this.ctx.beginPath();
		this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		this.ctx.stroke();
		this.ctx.shadowBlur = 0;
	}


	drawTurnIndicator()
	{
		const gridWidth = SETTINGS.squareSize * 3;
		
		// Draw turn indicator at the top of the canvas
		this.ctx.fillStyle = 'rgba(45, 90, 138, 0.9)';
		this.ctx.beginPath();
		this.ctx.roundRect(10, 10, gridWidth - 20, SETTINGS.headerHeight - 20, 12);
		this.ctx.fill();
		
		// Determine if it's the player's turn
		const isMyTurn = this.currentPlayer === this.playableChar;
		
		// Set color based on whose turn it is
		this.ctx.fillStyle = isMyTurn ? '#10b981' : '#f59e0b';
		this.ctx.font = 'bold 18px "Pixelify Sans", sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		
		// Display turn message
		const turnText = isMyTurn ? `YOUR TURN (${this.playableChar})` : `OPPONENT'S TURN (${this.currentPlayer})`;
		this.ctx.fillText(turnText, gridWidth / 2, SETTINGS.headerHeight / 2);
	}


	drawTurnIndicator()
	{
		// Draw turn indicator at the top of the canvas
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		this.ctx.fillRect(0, 0, intf.SETTINGS.canvaSize, 60);
		
		// Determine if it's the player's turn
		const isMyTurn = this.currentPlayer === this.playableChar;
		
		// Set color based on whose turn it is
		this.ctx.fillStyle = isMyTurn ? '#4CAF50' : '#FF9800';
		this.ctx.font = 'bold 24px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		
		// Display turn message
		const turnText = isMyTurn ? `YOUR TURN (${this.playableChar})` : `OPPONENT'S TURN (${this.currentPlayer})`;
		this.ctx.fillText(turnText, intf.SETTINGS.canvaSize / 2, 30);
	}


	drawStatus()
	{
		const gridWidth = SETTINGS.squareSize * 3;
		
		// Draw status bar at the bottom (over the turn indicator area)
		this.ctx.fillStyle = 'rgba(45, 90, 138, 0.95)';
		this.ctx.beginPath();
		this.ctx.roundRect(10, 10, gridWidth - 20, SETTINGS.headerHeight - 20, 12);
		this.ctx.fill();
		
		this.ctx.fillStyle = '#ffffff';
		this.ctx.font = 'bold 18px "Pixelify Sans", sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		
		let text: string;
		if (this.winner === 'Draw') {
			text = "It's a Draw!";
		} else if (this.winner === this.playableChar) {
			text = "You Win!";
		} else {
			text = "You Lose!";
		}
		this.ctx.fillText(text, gridWidth / 2, SETTINGS.headerHeight / 2);
	}

	highlightWinning()
	{
		if (!this.winningCells || this.winningCells.length === 0) return;
		
		const offsetY = SETTINGS.headerHeight;
		
		this.ctx.fillStyle = SETTINGS.winLineColor;
		for (const [r, c] of this.winningCells) {
			this.ctx.beginPath();
			this.ctx.roundRect(
				c * SETTINGS.squareSize + 8,
				offsetY + r * SETTINGS.squareSize + 8,
				SETTINGS.squareSize - 16,
				SETTINGS.squareSize - 16,
				12
			);
			this.ctx.fill();
		}
	}

	draw()
	{
		this.drawGrid();
		for (let r = 0; r < 3; r++)
		{
			for (let c = 0; c < 3; c++)
			{
				if (this.board[r][c] == 'X')
					this.drawX(r, c);
				if (this.board[r][c] == 'O')
					this.drawO(r, c);
			}
		}
	}

	async finish(onFinish: () => void)
    {
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
	const gridWidth = SETTINGS.squareSize * 3;
	canvas.style.backgroundColor = SETTINGS.squareColor;
	canvas.width = gridWidth;
	canvas.height = SETTINGS.canvaSize;

	const symbol: intf.Symbol | null = JSON.parse(data).Symbol ?? null;

	if (symbol == null) return;

	const ttt: TicTacToeGame =  new TicTacToeGame(socket, canvas, symbol);
	ttt.draw();
	socket.onmessage = (msg) =>
	{
		console.log("received:", msg.data);
		if (ttt.listen(JSON.parse(msg.data)))
			ttt.finish(onFinish);
	}
}