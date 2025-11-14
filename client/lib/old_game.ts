export function startGame(canvas: HTMLCanvasElement)
{
	const ctx = canvas.getContext('2d')!;
	const dpr = Math.max(1, window.devicePixelRatio || 1);

	// initialize canvas size
	const CSS_SIZE = 360;
	canvas.style.width = `${CSS_SIZE}px`;
	canvas.style.height = `${CSS_SIZE}px`;
	canvas.width = Math.floor(CSS_SIZE * dpr);
	canvas.height = Math.floor(CSS_SIZE * dpr);
	ctx.scale(dpr, dpr);

	const size = CSS_SIZE;
	const cell = size / 3;

	type Mark = '' | 'X' | 'O';
	const board: Mark[][] = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];

	let current: Mark = 'X';
	let winner: Mark | 'Draw' | null = null;
	let winningCells: [number, number][] | null = null;

	function clearBoard() {
		for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) board[r][c] = '';
		current = 'X';
		winner = null;
		winningCells = null;
		draw();
	}

	function drawGrid() {
		ctx.clearRect(0, 0, size, size);
		ctx.lineWidth = 4;
		ctx.strokeStyle = '#222';
		for (let i = 1; i <= 2; i++) {
			// vertical
			ctx.beginPath();
			ctx.moveTo(i * cell, 10);
			ctx.lineTo(i * cell, size - 10);
			ctx.stroke();
			// horizontal
			ctx.beginPath();
			ctx.moveTo(10, i * cell);
			ctx.lineTo(size - 10, i * cell);
			ctx.stroke();
		}
	}

	function drawX(r: number, c: number) {
		const padding = cell * 0.2;
		const x1 = c * cell + padding;
		const y1 = r * cell + padding;
		const x2 = (c + 1) * cell - padding;
		const y2 = (r + 1) * cell - padding;
		ctx.strokeStyle = '#c0392b';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.moveTo(x2, y1);
		ctx.lineTo(x1, y2);
		ctx.stroke();
	}

	function drawO(r: number, c: number) {
		const cx = c * cell + cell / 2;
		const cy = r * cell + cell / 2;
		const radius = cell * 0.28;
		ctx.strokeStyle = '#2980b9';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.stroke();
	}

	function highlightWinning() {
		if (!winningCells) return;
		ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
		for (const [r, c] of winningCells) {
			ctx.fillRect(c * cell + 4, r * cell + 4, cell - 8, cell - 8);
		}
	}

	function drawStatus() {
		if (!winner) return;
		ctx.fillStyle = 'rgba(0,0,0,0.6)';
		ctx.fillRect(0, size - 50, size, 50);
		ctx.fillStyle = '#fff';
		ctx.font = '18px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const text = winner === 'Draw' ? 'Draw! Click any cell to restart' : `${winner} wins! Click any cell to restart`;
		ctx.fillText(text, size / 2, size - 25);
	}

	function draw() {
		drawGrid();
		if (winningCells) highlightWinning();
		for (let r = 0; r < 3; r++) {
			for (let c = 0; c < 3; c++) {
				if (board[r][c] === 'X') drawX(r, c);
				if (board[r][c] === 'O') drawO(r, c);
			}
		}
		drawStatus();
	}

	function checkWinner() {
		// rows & cols
		for (let i = 0; i < 3; i++) {
			if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
				winner = board[i][0];
				winningCells = [
					[i, 0],
					[i, 1],
					[i, 2],
				];
				return;
			}
			if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
				winner = board[0][i];
				winningCells = [
					[0, i],
					[1, i],
					[2, i],
				];
				return;
			}
		}
		// diagonals
		if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
			winner = board[0][0];
			winningCells = [
				[0, 0],
				[1, 1],
				[2, 2],
			];
			return;
		}
		if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
			winner = board[0][2];
			winningCells = [
				[0, 2],
				[1, 1],
				[2, 0],
			];
			return;
		}
		// draw?
		let full = true;
		for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!board[r][c]) full = false;
		if (full) {
			winner = 'Draw';
			winningCells = null;
		}
	}

	function handleClick(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		// translate to CSS pixel coordinates
		const x = (e.clientX - rect.left);
		const y = (e.clientY - rect.top);
		const c = Math.floor((x / rect.width) * 3);
		const r = Math.floor((y / rect.height) * 3);
		if (r < 0 || r > 2 || c < 0 || c > 2) return;

		// if game over, reset on any click
		if (winner) {
			clearBoard();
			return;
		}

		if (board[r][c]) return;
		board[r][c] = current;
		checkWinner();
		if (!winner) current = current === 'X' ? 'O' : 'X';
		draw();
	}

	canvas.style.cursor = 'pointer';
	canvas.addEventListener('click', handleClick);
	clearBoard();
}