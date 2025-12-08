import { playerInfo } from "../types/playerInfo.types";
import * as types from "../types/ticTacToe.types";
import type { WebSocket } from "ws";
import { FastifyInstance } from 'fastify';

class Player
{
	private	socket: WebSocket;
	private ttt: TicTacToeGame;
	public	symbol: types.Symbol;
	public 	playerId : number;

	constructor(symbol: types.Symbol, ttt: TicTacToeGame, playerInfo : playerInfo)
	{
		this.ttt = ttt;
		this.symbol = symbol;
		this.playerId = playerInfo.id;
		this.socket = playerInfo.socket;
		this.socketListen();
	}

	socketListen()
	{
		this.socket.send(this.symbol);

		this.socket.onmessage = (msg) => {
			console.log("received:", msg.data);
			if (this.ttt.currentPlayer == this.symbol)
				this.ttt.send(msg.data.toString());
		}
	}

	send(gameMsg: types.gameMessage | types.winnerMessage)
	{
		console.log(JSON.stringify(gameMsg));
		this.socket.send(JSON.stringify(gameMsg));
	}
}

export class TicTacToeGame
{
	public  currentPlayer: types.Symbol = 'X';
	private winner: types.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] = [];
	private player1: Player;
	private player2: Player;
	private server: FastifyInstance;
	private board: types.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];

	constructor(player1: playerInfo, player2: playerInfo, server: FastifyInstance)
	{
		const randomizer : boolean = ((Date.now() * Math.random()) % 1) < 0.5;
		let symbol1 : types.Symbol = randomizer ? 'X' : 'O';
		let symbol2 : types.Symbol = randomizer ? 'O' : 'X';;

		this.player1 = new Player(symbol1, this, player1);
		this.player2 = new Player(symbol2, this, player2);
		this.server = server;
	}

	send(message: string)
	{
		const {row, collumn} = JSON.parse(message);
	
		if (this.board[row][collumn] == '')
		{
			this.board[row][collumn] = this.currentPlayer
			const hasWinner = this.checkWinner(row, collumn);
			this.currentPlayer = (this.currentPlayer == 'X') ? 'O': 'X';
			const gameMsg: types.gameMessage | types.winnerMessage = hasWinner ?
			{
				type: types.messageType.winner,
				board: this.board,
				winner: this.winner!,
				winningCells: this.winningCells
			}
			: {
				type: types.messageType.midGame,
				board: this.board,
				currentPLayer: this.currentPlayer
			};
			this.player1.send(gameMsg);
			this.player2.send(gameMsg);
			if (hasWinner)
				this.addToDatabase();
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
	
	addToDatabase()
	{
		const insertMatchStmt = this.server.db.prepare(`
			INSERT INTO tic_tac_toe_matches (
				x_player_id,
				o_player_id,
				winner
			) VALUES (?, ?, ?)
		`);

		const xPlayerId: number = this.player1.symbol === 'X' ? this.player1.playerId : this.player2.playerId;
		const oPlayerId: number = this.player1.symbol === 'O' ? this.player1.playerId : this.player2.playerId;
		const winnerStr: 'x' | 'o' | 'draw' = this.winner === 'X' ? 'x' : this.winner === 'O' ? 'o' : 'draw';
		console.log('xPlayerId:', xPlayerId);
		console.log('oPlayerId:', oPlayerId);
		console.log('winnerStr:', winnerStr);
		try {
			insertMatchStmt.run(xPlayerId, oPlayerId, winnerStr);
		} catch (err) {
			console.error("Failed to insert match:", err);
		}
	}
}


export function tttGame(
	player1 : playerInfo,
    player2 : playerInfo,
    server: FastifyInstance
)
{
	player1.socket.send(JSON.stringify({Symbol: 'X'}));
	player2.socket.send(JSON.stringify({Symbol: 'O'}));

	new TicTacToeGame(player1, player2, server);
}