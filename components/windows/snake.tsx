"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Trophy, Play, Pause } from "lucide-react";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIRECTION: Direction = "RIGHT";
const GAME_SPEED = 150;

export function Snake() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] =
    useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameStatus, setGameStatus] = useState<
    "playing" | "paused" | "gameOver"
  >("paused");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameStatus("paused");
  };

  const moveSnake = useCallback(() => {
    if (gameStatus !== "playing") return;

    setDirection(nextDirection);

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (nextDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameStatus("gameOver");
        return prevSnake;
      }

      // Check self collision
      if (
        prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameStatus("gameOver");
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameStatus, nextDirection, food, generateFood, highScore]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        gameStatus === "paused" &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        setGameStatus("playing");
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setNextDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setNextDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          break;
        case " ":
          e.preventDefault();
          if (gameStatus === "playing") setGameStatus("paused");
          else if (gameStatus === "paused") setGameStatus("playing");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameStatus]);

  return (
    <div className="flex flex-col h-full bg-[#C0C0C0] p-1 select-none font-sans">
      {/* Menu Bar */}
      <div className="flex bg-[#ECE9D8] border-b border-white px-1 text-xs mb-1">
        <div className="px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer">
          Game
        </div>
        <div className="px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer">
          Help
        </div>
      </div>

      {/* Game Container */}
      <div className="border-l-2 border-t-2 border-l-white border-t-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] p-2 bg-[#C0C0C0] flex flex-col gap-2 flex-1">
        {/* Header (Score) */}
        <div className="border-l-2 border-t-2 border-l-[#808080] border-t-[#808080] border-r-2 border-b-2 border-r-white border-b-white p-2 flex justify-between items-center bg-[#C0C0C0]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">SCORE:</span>
            <div className="bg-black text-[#00FF00] font-mono text-xl px-2 border-l border-t border-l-[#808080] border-t-[#808080] border-r border-b border-r-white border-b-white w-24 text-right leading-none py-0.5">
              {score.toString().padStart(5, "0")}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">HIGH:</span>
            <div className="bg-black text-[#00FF00] font-mono text-xl px-2 border-l border-t border-l-[#808080] border-t-[#808080] border-r border-b border-r-white border-b-white w-24 text-right leading-none py-0.5">
              {highScore.toString().padStart(5, "0")}
            </div>
          </div>
        </div>

        {/* Game Board (LCD Style) */}
        <div className="flex-1 flex items-center justify-center bg-[#9EA792] border-l-4 border-t-4 border-l-[#808080] border-t-[#808080] border-r-4 border-b-4 border-r-white border-b-white p-4 shadow-inner relative overflow-hidden">
          {/* LCD Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          <div
            className="relative border-2 border-[#4A503D] bg-[#8B967E] shadow-lg"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className="absolute bg-[#1A1F16] border border-[#8B967E]"
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-[#1A1F16] rounded-full animate-pulse"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
              }}
            />

            {/* Overlay Messages */}
            {gameStatus === "paused" && (
              <div className="absolute inset-0 bg-[#8B967E]/80 flex items-center justify-center z-10">
                <div className="text-center p-4 border-2 border-[#1A1F16] bg-[#9EA792] shadow-xl">
                  <p className="text-lg font-bold text-[#1A1F16] mb-2 font-mono">
                    PAUSED
                  </p>
                  <p className="text-xs text-[#1A1F16] font-mono">
                    PRESS SPACE TO START
                  </p>
                </div>
              </div>
            )}

            {gameStatus === "gameOver" && (
              <div className="absolute inset-0 bg-[#8B967E]/80 flex items-center justify-center z-10">
                <div className="text-center p-4 border-2 border-[#1A1F16] bg-[#9EA792] shadow-xl">
                  <p className="text-lg font-bold text-[#1A1F16] mb-2 font-mono">
                    GAME OVER
                  </p>
                  <p className="text-sm text-[#1A1F16] mb-4 font-mono">
                    SCORE: {score}
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-4 py-1 bg-[#1A1F16] text-[#9EA792] font-mono text-xs hover:bg-[#2C3325] active:translate-y-0.5"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Hint */}
        <div className="text-center text-[10px] text-gray-600 mt-1 font-mono">
          ARROWS TO MOVE • SPACE TO PAUSE
        </div>
      </div>
    </div>
  );
}
