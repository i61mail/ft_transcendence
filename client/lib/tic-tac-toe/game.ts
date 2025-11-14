import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import * as intf from "./interfaces";
import { SETTINGS } from "./interfaces";

class Controller
{
	private gameMode: intf.GameMode;
	private currentPlayer: intf.Symbol = 'X';
	private playableCharatcer!: intf.Symbol;
	private tttGame: TicTacToeGame;

	constructor(gameMode: intf.GameMode, playerSymbol: string, tttGame: TicTacToeGame)
	{
		this.gameMode = gameMode;
		if (gameMode == intf.GameMode.local)
			this.playableCharatcer = '';
		else if (playerSymbol == 'X')
			this.playableCharatcer = 'X';
		else
			this.playableCharatcer = 'O';
		this.tttGame = tttGame;
		this.handleClick = this.handleClick.bind(this);
		tttGame.canvas.addEventListener('click', this.handleClick);
	}
	
	handleClick(e: MouseEvent) {
		console.log("x:", e.clientX, 'y:', e.clientY);
		const rect:DOMRect = this.tttGame.canvas.getBoundingClientRect();
		// translate to CSS pixel coordinates
		const x = (e.clientX - rect.left);
		const y = (e.clientY - rect.top);
		const c = Math.floor((x / rect.width) * 3);
		const r = Math.floor((y / rect.height) * 3);
		if (r < 0 || r > 2 || c < 0 || c > 2) return;

		if (this.tttGame.board[r][c]) return;

		console.log('r:', r, 'c:', c);
		this.tttGame.board[r][c] = this.currentPlayer;
		// checkWinner();
		this.currentPlayer = this.currentPlayer == 'X' ? 'O' : 'X';

	}
}

class TicTacToeGame
{
	private socket: WebSocket;
	private gameMode: intf.GameMode;
	private ctx: CanvasRenderingContext2D;
	private winner: intf.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] | null = null;
	private	control: Controller;
	public	canvas: HTMLCanvasElement;
	public  current: intf.Symbol = 'X';
	public  board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];
	
	constructor(socket: WebSocket, canvas: HTMLCanvasElement, info: string)
	{
		const { gm, plySymbole } = JSON.parse(info);
		this.socket = socket;
		this.control = new Controller(gm, plySymbole, this);
		this.gameMode = gm;
		
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.draw();
	}

	listen(message: intf.messageInterface)
	{
		
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

	highlightWinning()
	{
		if (!this.winningCells)
			return ;
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
		this.highlightWinning();
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
        socket.onmessage = (msg) =>
        {
            ttt.listen(JSON.parse(msg.data));
        }
    }
}