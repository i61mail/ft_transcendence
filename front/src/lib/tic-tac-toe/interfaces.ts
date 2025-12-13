interface settingsInterface
{
	canvaSize: number;
	headerHeight: number;
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

const SQUARESIZE = 140;
const HEADER_HEIGHT = 60;

export const SETTINGS: settingsInterface =
{
	// tictactoe settings (light theme matching the app)
	canvaSize: SQUARESIZE * 3 + HEADER_HEIGHT,
	headerHeight: HEADER_HEIGHT,
	squareSize: SQUARESIZE,
	squareColor: "rgba(255, 255, 255, 0.3)",
	borderColor: "#2d5a8a",
	borderSize: 3,
	xColor: "#ef4444",
	oColor: "#3b82f6",
	xoLineWidth: 8,
	winLineColor: 'rgba(16, 185, 129, 0.3)',
	winLineSize: 4,
	textColor: '#2d5a8a'
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