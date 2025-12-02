interface settingsInterface
{
	canvaSize: number;
    squareSize: number;
	squareColor: string;
	borderColor: string;
	borderSize: number;
	xColor: string;
	oColor: string;
	xoLineWidth: number;
	winLineColor: string;
	winLineSize: number; // not used
}

const SQUARESIZE = 300;

export const SETTINGS: settingsInterface =
{
	// tictactoe settings (dark theme)
	canvaSize: SQUARESIZE * 3,
	squareSize: SQUARESIZE,
	squareColor: "#121212",
	borderColor: "#6f6e6eff",
	borderSize: 4,
	xColor: "#FF5252",
	oColor: "#64B5F6",
	xoLineWidth: 6,
	winLineColor: "#66BB6A",
	winLineSize: 4
};

export enum messageType
{
	midGame,
	winner
}

// export interface gameConnect
// {
// 	type: ...;
// 	id:
// 	cookies: 
// }

interface jhh
{
	type:
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

export interface playerInfo
{
  id: number;
  socket: WebSocket;
}

export interface tttDataBase
{
	x_player_id: number,
	o_player_id: number,
	winner: 'x' | 'o' | 'draw'
}