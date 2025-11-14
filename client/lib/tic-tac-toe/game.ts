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

		console.log('r:', row, 'c:', collumn);
		this.socket.send(JSON.stringify({row, collumn}));
		// this.board[row][collumn] = this.currentPlayer;
		// checkWinner();
		// this.currentPlayer = this.currentPlayer == 'X' ? 'O' : 'X';

	}
	
	listen(message: intf.gameMessage | intf.winnerMessage)
	{
		if (message.type == intf.messageType.midGame)
		{
			this.board = message.board;
			this.currentPlayer = message.currentPLayer;
		}
		else
		{
			this.winningCells = message.winningCells;
			this.winner = message.winner;
			this.drawStatus();
			this.highlightWinning();
		}
	}

	drawGrid()
	{
		if (!this.ctx)
			return ;
		this.ctx.clearRect(0, 0, SETTINGS.canvaSize, SETTINGS.canvaSize);
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


	drawStatus()
	{
		this.ctx.fillStyle = intf.SETTINGS.textColor;
		this.ctx.fillRect(0, intf.SETTINGS.canvaSize - 50, intf.SETTINGS.canvaSize, 50);
		this.ctx.fillStyle = '#fff';
		this.ctx.font = '18px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		const text = this.winner == 'Draw' ? 'Draw! Click any cell to restart' : `${this.winner} wins! Click any cell to restart`;
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
		// this.drawX(0, 0);
		// this.drawO(1, 0);
	}

	
}

export function startGame(canvas: HTMLCanvasElement)
{
	const socket = new WebSocket("ws://localhost:4000/tic-tac-toe");
	let ttt: TicTacToeGame;
	canvas.style.backgroundColor = SETTINGS.squareColor;
	canvas.width = SETTINGS.canvaSize;
	canvas.height = SETTINGS.canvaSize;

	socket.onmessage = (msg) =>
    {
		ttt =  new TicTacToeGame(socket, canvas, msg.data);
		ttt.draw();
        socket.onmessage = (msg) =>
        {
            ttt.listen(JSON.parse(msg.data));
        }
    }
}