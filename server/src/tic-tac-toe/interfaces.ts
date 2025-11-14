interface settingsInterface
{
    squareSize: number;
	squareColor: string;
	borderColor: string;
	borderwidth: number;
	xColor: string;
	oColor: string;
	winLineColor: string;
	winLineWidth: number;
}

export const SETTINGS: settingsInterface =
{
	//tictattoe settings
	squareSize: 300,
	squareColor: "#FFFFFF",
	borderColor: "#000000",
	borderwidth: 2,
	xColor: "#FF0000",
	oColor: "#0000FF",
	winLineColor: "#00FF00",
	winLineWidth: 4
};

export enum GameMode {
    online,
    local,
    AI
}

export enum PlayerIndex {
    leftPlayer = 1,
    rightPlayer = 2
};