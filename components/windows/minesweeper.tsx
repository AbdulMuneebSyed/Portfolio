"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { RotateCcw, Trophy } from "lucide-react";

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [flagsLeft, setFlagsLeft] = useState(DIFFICULTIES[difficulty].mines);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 999,
    medium: 999,
    hard: 999,
  });

  useEffect(() => {
    initializeBoard();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && gameStatus === "playing") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameStatus]);

  const initializeBoard = () => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const newBoard: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          }))
      );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols &&
                newBoard[newRow][newCol].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameStatus("playing");
    setFlagsLeft(mines);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const revealCell = (row: number, col: number) => {
    if (
      gameStatus !== "playing" ||
      board[row][col].isRevealed ||
      board[row][col].isFlagged
    )
      return;

    if (!isTimerRunning) setIsTimerRunning(true);

    const newBoard = [...board];
    newBoard[row][col].isRevealed = true;

    if (newBoard[row][col].isMine) {
      setGameStatus("lost");
      setIsTimerRunning(false);
      // Reveal all mines
      newBoard.forEach((row) =>
        row.forEach((cell) => cell.isMine && (cell.isRevealed = true))
      );
    } else if (newBoard[row][col].neighborMines === 0) {
      // Flood fill for empty cells
      const queue: [number, number][] = [[row, col]];
      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const newRow = r + dr;
            const newCol = c + dc;
            if (
              newRow >= 0 &&
              newRow < board.length &&
              newCol >= 0 &&
              newCol < board[0].length &&
              !newBoard[newRow][newCol].isRevealed &&
              !newBoard[newRow][newCol].isFlagged
            ) {
              newBoard[newRow][newCol].isRevealed = true;
              if (
                newBoard[newRow][newCol].neighborMines === 0 &&
                !newBoard[newRow][newCol].isMine
              ) {
                queue.push([newRow, newCol]);
              }
            }
          }
        }
      }
    }

    setBoard(newBoard);

    // Check win condition
    const allNonMinesRevealed = newBoard.every((row) =>
      row.every((cell) => cell.isMine || cell.isRevealed)
    );
    if (allNonMinesRevealed) {
      setGameStatus("won");
      setIsTimerRunning(false);
      if (timer < highScores[difficulty]) {
        setHighScores((prev) => ({ ...prev, [difficulty]: timer }));
      }
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== "playing" || board[row][col].isRevealed) return;

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagsLeft((prev) => prev + (newBoard[row][col].isFlagged ? -1 : 1));
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) return "bg-gray-300 hover:bg-gray-200";
    if (cell.isMine) return "bg-red-500";
    return "bg-gray-100";
  };

  const getNumberColor = (num: number) => {
    const colors = [
      "",
      "text-blue-600",
      "text-green-600",
      "text-red-600",
      "text-purple-600",
      "text-orange-600",
      "text-cyan-600",
      "text-pink-600",
      "text-gray-800",
    ];
    return colors[num] || "text-gray-800";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Development Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-600">⚠️</span>
          <span className="text-amber-700 font-medium">Under Development:</span>
          <span className="text-amber-700">
            This Minesweeper implementation is an early portfolio build. Core
            logic works, but enhanced animations, accessibility tweaks, and
            persistent high scores are planned.
          </span>
        </div>
      </div>

      {/* Game Header */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-black text-red-500 font-mono text-lg font-bold rounded">
              {String(flagsLeft).padStart(3, "0")}
            </div>
            <button
              onClick={initializeBoard}
              className="w-10 h-10 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors"
              aria-label="New Game"
            >
              {gameStatus === "lost"
                ? "😵"
                : gameStatus === "won"
                ? "😎"
                : "🙂"}
            </button>
            <div className="px-3 py-1 bg-black text-red-500 font-mono text-lg font-bold rounded">
              {String(timer).padStart(3, "0")}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              Best: {highScores[difficulty]}s
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                difficulty === diff
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
        <div className="inline-block border-4 border-gray-400 rounded">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <button
                  key={colIndex}
                  className={`w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold transition-colors ${getCellColor(
                    cell
                  )}`}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                >
                  {cell.isFlagged ? (
                    "🚩"
                  ) : cell.isRevealed ? (
                    cell.isMine ? (
                      "💣"
                    ) : cell.neighborMines > 0 ? (
                      <span className={getNumberColor(cell.neighborMines)}>
                        {cell.neighborMines}
                      </span>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      {gameStatus !== "playing" && (
        <div className="border-t border-gray-300 bg-gradient-to-b from-gray-50 to-white p-4 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {gameStatus === "won" ? "🎉 You Won!" : "💥 Game Over!"}
          </p>
          <button
            onClick={initializeBoard}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
