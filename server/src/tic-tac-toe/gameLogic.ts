import * as intf from "./interfaces";

class TicTacToeGame
{
	private winner: intf.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] | null = null;
	private board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];
}