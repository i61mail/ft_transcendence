export enum messageType
{
	midGame,
	winner
}

export interface gameMessage
{
	type: messageType.midGame;
    board: Symbol[][];
	currentPLayer: Symbol;
}
export interface winnerMessage
{
	type: messageType.winner;
	board: Symbol[][];
	winner: Symbol | 'Draw';
	winningCells: [number, number][];
}

export type Symbol = '' | 'X' | 'O';

export interface tttDataBase
{
	x_player_id: number,
	o_player_id: number,
	winner: 'x' | 'o' | 'draw'
}