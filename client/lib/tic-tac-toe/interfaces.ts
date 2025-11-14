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

export interface messageInterface
{
    board: Symbol[][];
	winner: Symbol | 'Draw' | null;
	winningCells: [number, number][] | null;
}

export enum GameMode {
    online,
    local,
    AI
}

export enum PlayerIndex {
    leftPlayer = 1,
    rightPlayer = 2
};

export type Symbol = '' | 'X' | 'O';