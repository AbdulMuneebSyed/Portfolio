"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { useWindowManager } from "@/lib/window-manager";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIRECTION: Direction = "RIGHT";
const GAME_SPEED = 150;

export function Snake() {
  const active = useWindowManager((s) =>
    s.windows.some(
      (w) => w.component === "Snake" && w.isActive && !w.isMinimized,
    ),
  );
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
        (segment) => segment.x === newFood.x && segment.y === newFood.y,
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
    if (gameStatus !== "playing" || !active) return;

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
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
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
  }, [gameStatus, nextDirection, food, generateFood, highScore, active]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        !active ||
        e.metaKey ||
        e.ctrlKey ||
        (e.target as HTMLElement).matches("input, textarea")
      )
        return;
      if (e.key.startsWith("Arrow")) e.preventDefault();
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
  }, [direction, gameStatus, active]);

  const steer = (next: Direction) => {
    const opposite: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (direction !== opposite[next]) setNextDirection(next);
    if (gameStatus === "paused") setGameStatus("playing");
  };
  return (
    <div className="game-app">
      <div className="mac-toolbar">
        <h2>Snake</h2>
        <span className="mac-muted text-xs">
          Score {score} · Best {highScore}
        </span>
        <button
          className="mac-icon-button"
          aria-label={gameStatus === "playing" ? "Pause game" : "Play game"}
          disabled={gameStatus === "gameOver"}
          onClick={() =>
            setGameStatus(gameStatus === "playing" ? "paused" : "playing")
          }
        >
          {gameStatus === "playing" ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          className="mac-icon-button"
          aria-label="New game"
          onClick={resetGame}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="game-body">
        <div className="snake-board">
          {snake.map((segment, index) => (
            <div
              key={index}
              className="snake-segment"
              style={{
                left: `${segment.x * 5}%`,
                top: `${segment.y * 5}%`,
                opacity: index === 0 ? 1 : 0.75,
              }}
            />
          ))}
          <div
            className="snake-food"
            style={{ left: `${food.x * 5}%`, top: `${food.y * 5}%` }}
          />
          {gameStatus !== "playing" && (
            <div className="game-overlay">
              <h2>
                {gameStatus === "gameOver" ? "Game Over" : "Ready to play?"}
              </h2>
              <p>
                {gameStatus === "gameOver"
                  ? `Your score: ${score}`
                  : "Use the arrow keys or controls below."}
              </p>
              <button
                className="mac-button primary"
                onClick={() => {
                  if (gameStatus === "gameOver") resetGame();
                  else setGameStatus("playing");
                }}
              >
                {gameStatus === "gameOver" ? "New Game" : "Play"}
              </button>
            </div>
          )}
        </div>
        <div className="game-directions">
          <button aria-label="Move left" onClick={() => steer("LEFT")}>
            <ArrowLeft size={20} />
          </button>
          <button aria-label="Move up" onClick={() => steer("UP")}>
            <ArrowUp size={20} />
          </button>
          <button aria-label="Move down" onClick={() => steer("DOWN")}>
            <ArrowDown size={20} />
          </button>
          <button aria-label="Move right" onClick={() => steer("RIGHT")}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <div className="mac-statusbar">
        <span>Arrow keys to move</span>
        <span>Space to pause</span>
      </div>
    </div>
  );
}
