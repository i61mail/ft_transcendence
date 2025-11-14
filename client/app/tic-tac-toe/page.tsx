"use client";

import { useEffect, useRef } from "react";
import { startGame } from "@/lib/tic-tac-toe/game";


export default function GamePage()
{
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
	if (canvasRef.current)
	  startGame(canvasRef.current);
  }, []);

  return (
	<canvas ref={canvasRef} width={900} height={900}>
			if you see this message, than the canvas did not load propraly
		</canvas>
  );
}