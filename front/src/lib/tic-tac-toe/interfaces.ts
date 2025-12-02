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
	textColor: string;
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
	winLineColor: 'rgba(241, 196, 15, 0.25)',
	winLineSize: 4,
	textColor: 'rgba(0,0,0,0.6)'
};

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