"use client";

import { useState, useEffect, useCallback } from "react";
import { Smile, Frown, Meh, RefreshCw } from "lucide-react";

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
  const [isMouseDown, setIsMouseDown] = useState(false);

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
        })
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
      <div className="border-l-2 border-t-2 border-l-white border-t-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] p-2 bg-[#C0C0C0] flex flex-col gap-2">
        {/* Header (Score & Face) */}
        <div className="border-l-2 border-t-2 border-l-[#808080] border-t-[#808080] border-r-2 border-b-2 border-r-white border-b-white p-2 flex justify-between items-center bg-[#C0C0C0]">
          {/* Mine Counter */}
          <div className="bg-black text-red-600 font-mono text-2xl px-1 border-l border-t border-l-[#808080] border-t-[#808080] border-r border-b border-r-white border-b-white w-16 text-center leading-none py-0.5">
            {Math.max(-99, Math.min(999, mineCount))
              .toString()
              .padStart(3, "0")}
          </div>

          {/* Face Button */}
          <button
            onClick={initializeGame}
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
            className="w-8 h-8 border-l-2 border-t-2 border-l-white border-t-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] active:border-l-[#808080] active:border-t-[#808080] active:border-r-white active:border-b-white bg-[#C0C0C0] flex items-center justify-center active:translate-y-[1px] active:translate-x-[1px]"
          >
            {gameStatus === "won" ? (
              <div className="text-yellow-400 drop-shadow-sm text-xl">😎</div>
            ) : gameStatus === "lost" ? (
              <div className="text-yellow-400 drop-shadow-sm text-xl">😵</div>
            ) : isMouseDown ? (
              <div className="text-yellow-400 drop-shadow-sm text-xl">😮</div>
            ) : (
              <div className="text-yellow-400 drop-shadow-sm text-xl">🙂</div>
            )}
          </button>

          {/* Timer */}
          <div className="bg-black text-red-600 font-mono text-2xl px-1 border-l border-t border-l-[#808080] border-t-[#808080] border-r border-b border-r-white border-b-white w-16 text-center leading-none py-0.5">
            {timer.toString().padStart(3, "0")}
          </div>
        </div>

        {/* Grid */}
        <div
          className="border-l-4 border-t-4 border-l-[#808080] border-t-[#808080] border-r-4 border-b-4 border-r-white border-b-white bg-[#C0C0C0] mx-auto"
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, 20px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  className={`w-5 h-5 flex items-center justify-center text-sm font-bold cursor-default
                    ${
                      cell.isRevealed
                        ? "border-[0.5px] border-[#808080] bg-[#C0C0C0]" // Revealed
                        : "border-l-2 border-t-2 border-l-white border-t-white border-r-2 border-b-2 border-r-[#808080] border-b-[#808080] bg-[#C0C0C0] hover:bg-[#D0D0D0]" // Unrevealed
                    }
                    ${
                      cell.isMine && cell.isRevealed && gameStatus === "lost"
                        ? "bg-red-500"
                        : ""
                    }
                  `}
                >
                  {getCellContent(cell)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Difficulty Selector (Simple footer for now) */}
      <div className="mt-2 flex justify-center gap-2 text-xs">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`px-2 py-1 border border-[#808080] rounded ${
              difficulty === diff
                ? "bg-[#316AC5] text-white"
                : "bg-[#ECE9D8] hover:bg-[#E0E0E0]"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
