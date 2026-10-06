"use client";

import { useState, useEffect, useCallback } from "react";
import { Flag, RefreshCw } from "lucide-react";

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type GameStatus = "playing" | "won" | "lost";
type Difficulty = "beginner" | "intermediate" | "expert";

const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [mineCount, setMineCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [flagMode, setFlagMode] = useState(false);

  const initializeGame = useCallback(() => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const newGrid: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols).fill({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }),
      );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c] = { ...newGrid[r][c], isMine: true };
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newGrid[r][c].isMine) {
          let neighbors = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                r + i >= 0 &&
                r + i < rows &&
                c + j >= 0 &&
                c + j < cols &&
                newGrid[r + i][c + j].isMine
              ) {
                neighbors++;
              }
            }
          }
          newGrid[r][c] = { ...newGrid[r][c], neighborMines: neighbors };
        }
      }
    }

    setGrid(newGrid);
    setGameStatus("playing");
    setMineCount(mines);
    setTimer(0);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStatus === "playing") {
      interval = setInterval(() => {
        setTimer((t) => Math.min(t + 1, 999));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

  const revealCell = (r: number, c: number) => {
    if (
      gameStatus !== "playing" ||
      grid[r][c].isRevealed ||
      grid[r][c].isFlagged
    )
      return;

    const newGrid = [...grid.map((row) => [...row])];

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true;
      // Reveal all mines
      newGrid.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.isMine) newGrid[i][j].isRevealed = true;
        });
      });
      setGrid(newGrid);
      setGameStatus("lost");
    } else {
      // Reveal cell and flood fill if empty
      const reveal = (row: number, col: number) => {
        if (
          row < 0 ||
          row >= newGrid.length ||
          col < 0 ||
          col >= newGrid[0].length ||
          newGrid[row][col].isRevealed ||
          newGrid[row][col].isFlagged
        )
          return;

        newGrid[row][col].isRevealed = true;

        if (newGrid[row][col].neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              reveal(row + i, col + j);
            }
          }
        }
      };

      reveal(r, c);
      setGrid(newGrid);

      // Check win condition
      const unrevealedSafeCells = newGrid
        .flat()
        .filter((cell) => !cell.isMine && !cell.isRevealed).length;
      if (unrevealedSafeCells === 0) {
        setGameStatus("won");
        setMineCount(0); // Flag all mines visually if we wanted, but just setting count to 0 is fine
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus !== "playing" || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map((row) => [...row])];
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    setGrid(newGrid);
    setMineCount((prev) => (newGrid[r][c].isFlagged ? prev - 1 : prev + 1));
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return <span className="text-red-600 text-lg">🚩</span>;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return <span className="text-black text-lg">💣</span>;
    if (cell.neighborMines === 0) return null;

    const colors = [
      "",
      "text-blue-600",
      "text-green-600",
      "text-red-600",
      "text-blue-900",
      "text-red-900",
      "text-cyan-600",
      "text-black",
      "text-gray-600",
    ];
    return (
      <span className={`font-bold ${colors[cell.neighborMines]}`}>
        {cell.neighborMines}
      </span>
    );
  };

  return (
    <div className="game-app">
      <div className="mac-toolbar">
        <h2>Minesweeper</h2>
        <span className="mac-muted text-xs">
          {mineCount} mines · {timer}s
        </span>
        <button
          className="mac-icon-button"
          aria-label="Flag mode"
          aria-pressed={flagMode}
          onClick={() => setFlagMode(!flagMode)}
        >
          <Flag size={16} />
        </button>
        <button
          className="mac-icon-button"
          aria-label="New game"
          onClick={initializeGame}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="game-body">
        <div className="mac-segmented mb-6">
          {(["beginner", "intermediate", "expert"] as Difficulty[]).map((d) => (
            <button
              key={d}
              className="capitalize"
              aria-pressed={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mine-scroll">
          <div
            className="mine-board"
            style={{
              gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, 28px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  aria-label={`Row ${r + 1}, column ${c + 1}${cell.isFlagged ? ", flagged" : cell.isRevealed ? ", revealed" : ""}`}
                  className="mine-cell"
                  data-revealed={cell.isRevealed}
                  onClick={(e) =>
                    flagMode ? toggleFlag(e, r, c) : revealCell(r, c)
                  }
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    toggleFlag(e, r, c);
                  }}
                >
                  {getCellContent(cell)}
                </button>
              )),
            )}
          </div>
        </div>
        <p role="status" className="mt-5 text-sm">
          {gameStatus === "won"
            ? "You cleared the board!"
            : gameStatus === "lost"
              ? "You found a mine. Try a new game."
              : "Reveal a square. Flag a suspected mine."}
        </p>
      </div>
      <div className="mac-statusbar">
        <span>Right-click or use Flag mode to flag</span>
        <span className="capitalize">{difficulty}</span>
      </div>
    </div>
  );
}
