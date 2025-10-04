"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Trophy } from "lucide-react";

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
    <div className="flex flex-col h-full bg-white">
      {/* Development Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-600">⚠️</span>
          <span className="text-amber-700 font-medium">Under Development:</span>
          <span className="text-amber-700">
            This Snake build is an in-progress portfolio feature. Movement,
            scoring, and collision are live; future updates will refine visuals
            and add difficulty modes + persistence.
          </span>
        </div>
      </div>

      {/* Game Header */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-black text-green-400 font-mono text-lg font-bold rounded">
              Score: {score}
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              High Score: {highScore}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Use arrow keys to move • Press Space to pause
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
        <div
          className="relative border-4 border-gray-800 rounded"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 bg-gray-900">
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="absolute border border-gray-800"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                />
              ))
            )}
          </div>

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded-sm ${
                index === 0 ? "bg-green-400" : "bg-green-500"
              }`}
              style={{
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
            }}
          />

          {/* Overlay Messages */}
          {gameStatus === "paused" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-2">
                  Press any arrow key to start
                </p>
                <p className="text-gray-300">
                  Use arrow keys to control the snake
                </p>
              </div>
            </div>
          )}

          {gameStatus === "gameOver" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500 mb-2">
                  Game Over!
                </p>
                <p className="text-xl text-white mb-4">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
