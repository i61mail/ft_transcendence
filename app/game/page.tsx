

export default function GamePage() {
  return (
    <div>
      <h1>Pong Game</h1>
	<button
		onClick={(e) => {
			// @ts-ignore
			if (typeof window !== "undefined" && typeof window.startGame === "function") {
				window.startGame();
				(e.target as HTMLButtonElement).disabled = true;
			}
		}}
	>
		Start Game
	</button>
      <canvas id="gameCanvas" width={800} height={600}></canvas>
    </div>
  );
}