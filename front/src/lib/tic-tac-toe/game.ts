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
		const y: number = (e.clientY - canvasRect.top);
		const collumn: number = Math.floor((x / canvasRect.width) * 3);
		const row: number = Math.floor((y / canvasRect.height) * 3);

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
		this.ctx.clearRect(0, 0, SETTINGS.canvaSize, SETTINGS.canvaSize);
		
		// Draw turn indicator at the top
		this.drawTurnIndicator();
		
		this.ctx.lineWidth = SETTINGS.borderSize;
		this.ctx.strokeStyle = SETTINGS.borderColor;
		for (let i = 1; i <= 2; i++) {
			// vertical
			this.ctx.beginPath();
			this.ctx.moveTo(i * SETTINGS.squareSize, 10);
			this.ctx.lineTo(i * SETTINGS.squareSize, SETTINGS.canvaSize - 10);
			this.ctx.stroke();
			// horizontal
			this.ctx.beginPath();
			this.ctx.moveTo(10, i * SETTINGS.squareSize);
			this.ctx.lineTo(SETTINGS.canvaSize - 10, i * SETTINGS.squareSize);
			this.ctx.stroke();
		}
	}

	drawX(r: number, c: number)
	{
		const padding = SETTINGS.squareSize * 0.2;
		const x1 = c * SETTINGS.squareSize + padding;
		const y1 = r * SETTINGS.squareSize + padding;
		const x2 = (c + 1) * SETTINGS.squareSize - padding;
		const y2 = (r + 1) * SETTINGS.squareSize - padding;

		this.ctx.strokeStyle = SETTINGS.xColor;
		this.ctx.lineWidth = SETTINGS.xoLineWidth;
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.moveTo(x2, y1);
		this.ctx.lineTo(x1, y2);
		this.ctx.stroke();
	}

	drawO(r: number, c: number)
	{
		const cx = c * SETTINGS.squareSize + SETTINGS.squareSize / 2;
		const cy = r * SETTINGS.squareSize + SETTINGS.squareSize / 2;
		const radius = SETTINGS.squareSize * 0.3;

		this.ctx.strokeStyle = SETTINGS.oColor;
		this.ctx.lineWidth = SETTINGS.xoLineWidth;
		this.ctx.beginPath();
		this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		this.ctx.stroke();
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
		this.ctx.fillStyle = intf.SETTINGS.textColor;
		this.ctx.fillRect(0, intf.SETTINGS.canvaSize - 50, intf.SETTINGS.canvaSize, 50);
		this.ctx.fillStyle = '#fff';
		this.ctx.font = '18px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		const text = this.winner == 'Draw' ? 'Draw!' : `${this.winner} wins!`;
		this.ctx.fillText(text, intf.SETTINGS.canvaSize / 2, intf.SETTINGS.canvaSize - 25);
	}

	highlightWinning()
	{
		this.ctx.fillStyle = SETTINGS.winLineColor;
		for (const [r, c] of this.winningCells) {
			this.ctx.fillRect(c * SETTINGS.squareSize + SETTINGS.borderSize,
				r * SETTINGS.squareSize + SETTINGS.borderSize,
				SETTINGS.squareSize - SETTINGS.borderSize * 2,
				SETTINGS.squareSize - SETTINGS.borderSize * 2
			);
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
	canvas.style.backgroundColor = SETTINGS.squareColor;
	canvas.width = SETTINGS.canvaSize;
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