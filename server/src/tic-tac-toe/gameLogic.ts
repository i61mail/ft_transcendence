import * as intf from "./interfaces";
import { fastify } from '../server';

class Player
{
	private	socket: WebSocket;
	private ttt: TicTacToeGame;
	public	symbol: intf.Symbol;
	public 	playerId : number;

	constructor(symbol: intf.Symbol, ttt: TicTacToeGame, playerInfo : intf.playerInfo)
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
			if (this.ttt.currentPlayer == this.symbol)
				this.ttt.send(msg.data);
		}
	}

	send(gameMsg: intf.gameMessage | intf.winnerMessage)
	{
		console.log(JSON.stringify(gameMsg));
		this.socket.send(JSON.stringify(gameMsg));
	}
}

export class TicTacToeGame
{
	public  currentPlayer: intf.Symbol = 'X';
	private winner: intf.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] = [];
	private player1: Player;
	private player2: Player;
	private board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];

	constructor(player1: intf.playerInfo, player2: intf.playerInfo)
	{
		const randomizer : boolean = ((Date.now() * Math.random()) % 1) < 0.5;
		let symbol1 : intf.Symbol = randomizer ? 'X' : 'O';
		let symbol2 : intf.Symbol = randomizer ? 'O' : 'X';;

		this.player1 = new Player(symbol1, this, player1);
		this.player2 = new Player(symbol2, this, player2);
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
		const insertMatchStmt = fastify.db.prepare(`
			INSERT INTO pong_matches (
				x_player_id, 
				o_player_id, 
				winner,
			) VALUES (
				@x_player_id, 
				@o_player_id, 
				@winner,
			)
		`);

		const matchData: intf.tttDataBase = {
			x_player_id: this.player1.symbol == 'X'
				? this.player1.playerId: this.player2.playerId,
			o_player_id: this.player1.symbol == 'O'
				? this.player1.playerId: this.player2.playerId,
			winner: this.winner == 'X'
				? 'x' : this.winner == 'O'
				? 'o' : 'draw'
		};
		try
		{
			insertMatchStmt.run(matchData);
		}
		catch (err)
		{
			console.error("Failed to insert match:", err);
		}
	}
}