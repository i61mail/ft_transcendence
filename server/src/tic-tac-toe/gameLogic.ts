import * as intf from "./interfaces";

export class TicTacToeGame
{
	private winner: intf.Symbol | 'Draw' | null = null;
	private winningCells: [number, number][] | null = null;
	private xSocket: WebSocket | null = null;
	private oSocket: WebSocket | null = null;
	private currentPlayer: intf.Symbol = 'X';
	private board: intf.Symbol[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];

	addPlayer(player: WebSocket)
	{
		if (this.xSocket == null)
		{
			this.xSocket = player;
		}
		else
		{
			this.oSocket = player;
		}
	}

	private socketListen(socket: WebSocket | null, symbol: intf.Symbol)
	{
		if (socket)
        {
            socket.onmessage = (msg) => {
			if (this.currentPlayer == symbol)
				console.log("doing", symbol, "stuff with:", msg.data);
            }
        }
	}

	listenToPlayers()
    {
		this.socketListen(this.xSocket, 'X');
		this.socketListen(this.oSocket, 'O');
    }
}