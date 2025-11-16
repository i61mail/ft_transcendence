import { send } from "process";
import * as intf from "./interfaces";

class Player
{
	public	socket: WebSocket | null = null;
	private symbol: intf.Symbol;
	private ttt: TicTacToeGame;

	constructor(symbol: intf.Symbol, ttt: TicTacToeGame)
	{
		this.ttt = ttt;
		this.symbol = symbol;
	}

	socketListen(player: WebSocket)
	{
		this.socket = player;
		this.socket.send(this.symbol);
	
		this.socket.onmessage = (msg) => {
			if (this.ttt.currentPlayer == this.symbol)
				this.ttt.send(msg.data);
		}
	}

	send(gameMsg: intf.gameMessage | intf.winnerMessage)
	{
		console.log(JSON.stringify(gameMsg));
		this.socket?.send(JSON.stringify(gameMsg));
	}
}

export class TicTacToeGame
{
	public  currentPlayer: intf.Symbol = 'X';
	private winner: intf.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] = [];
	private players: [Player, Player];
	private board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];

	constructor()
	{
		const randomizer = (Date.now() * Math.random()) % 1;

		this.players = (randomizer < 0.5)
			? [new Player('X', this), new Player('O', this)]
			: [new Player('O', this), new Player('X', this)];
	}

	listenToPlayers(clients: WebSocket[])
    {
		this.players[0].socketListen(clients[0]);
		this.players[1].socketListen(clients[1]);
    }

	send(message: string)
	{
		const {row, collumn} = JSON.parse(message);
	
		if (this.board[row][collumn] == '')
		{
			this.board[row][collumn] = this.currentPlayer
			const hasWinner = this.checkWinner(row, collumn);
			this.currentPlayer = (this.currentPlayer == 'X') ? 'O': 'X';
			const gameMsg: intf.gameMessage | intf.winnerMessage = hasWinner ?
			{
				type: intf.messageType.winner,
				board: this.board,
				winner: this.winner!,
				winningCells: this.winningCells
			}
			: {
				type: intf.messageType.midGame,
				board: this.board,
				currentPLayer: this.currentPlayer
			}
			this.players[0].send(gameMsg);
			this.players[1].send(gameMsg);
		}
	}

	checkWinner(row: number, collumn: number): boolean
	{
		if (this.board[row][0] == this.currentPlayer
			&& this.board[row][0] == this.board[row][1]
			&& this.board[row][0] == this.board[row][2])
		{
			this.winner = this.currentPlayer;
			this.winningCells = 
			[
				[row, 0],
				[row, 1],
				[row, 2]
			];
			return (true);
		}

		if (this.board[0][collumn] == this.currentPlayer
			&& this.board[0][collumn] == this.board[1][collumn]
			&& this.board[0][collumn] == this.board[2][collumn])
		{
			this.winner = this.currentPlayer;
			this.winningCells = 
			[
				[0, collumn],
				[1, collumn],
				[2, collumn]
			];
			return (true);
		}
		
		if (row == collumn
			&& this.board[0][0] == this.currentPlayer
			&& this.board[0][0] == this.board[1][1]
			&& this.board[1][1] == this.board[2][2])
		{
			this.winner = this.currentPlayer;
			this.winningCells = 
			[
				[0, 0],
				[1, 1],
				[2, 2]
			];
			return (true);
		}

		if (row == Math.abs(collumn - 2)
			&& this.board[0][2] == this.currentPlayer
			&& this.board[0][2] == this.board[1][1]
			&& this.board[1][1] == this.board[2][0])
		{
			this.winner = this.currentPlayer;
			this.winningCells = 
			[
				[0, 2],
				[1, 1],
				[2, 0]
			];
			return (true);
		}

		return (false);
	}
}