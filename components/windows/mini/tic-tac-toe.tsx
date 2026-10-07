"use client";

import { useEffect, useState } from "react";
import { bestMove, isFull, winner, type Cell } from "@/lib/games/tic-tac-toe";
import { MiniButton, MiniHeader } from "./shared";
import type { MiniAppProps } from "./registry";
import { usePhone } from "@/lib/phone";

type Mode = "computer" | "friend";

const PREVIEW: Cell[] = ["X", null, "O", null, "X", null, "O", null, null];

export function TicTacToe({ preview }: MiniAppProps) {
  const phone = usePhone();
  const [board, setBoard] = useState<Cell[]>(() => (preview ? PREVIEW : Array(9).fill(null)));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [mode, setMode] = useState<Mode>("computer");
  const [tally, setTally] = useState({ X: 0, O: 0, draw: 0 });
  const win = winner(board);
  const done = !!win || isFull(board);

  const place = (i: number, player: "X" | "O") => {
    const next = [...board];
    next[i] = player;
    setBoard(next);
    setTurn(player === "X" ? "O" : "X");
    const result = winner(next);
    if (result) setTally((t) => ({ ...t, [result.player]: t[result.player] + 1 }));
    else if (isFull(next)) setTally((t) => ({ ...t, draw: t.draw + 1 }));
  };

  // The computer plays O a moment after you.
  useEffect(() => {
    if (preview || mode !== "computer" || turn !== "O" || done) return;
    const timer = setTimeout(() => place(bestMove(board, "O"), "O"), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, turn, mode, done, preview]);

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setBoard(Array(9).fill(null));
    setTurn("X");
  };

  const status = win
    ? mode === "computer"
      ? win.player === "X"
        ? "You win!"
        : "The computer wins."
      : `${win.player} wins!`
    : isFull(board)
      ? "It's a draw."
      : mode === "computer"
        ? turn === "X"
          ? "Your move"
          : "Thinking…"
        : `${turn} to move`;

  return (
    <div className="mini-app">
      <MiniHeader
        title="Tic-Tac-Toe"
        stats={[
          { label: mode === "computer" ? "You" : "X", value: tally.X },
          { label: "Draws", value: tally.draw },
          { label: mode === "computer" ? (phone ? "iPhone" : "Mac") : "O", value: tally.O },
        ]}
      />
      <div className="mini-segments" role="tablist" aria-label="Opponent">
        {(["computer", "friend"] as Mode[]).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => reset(m)}>
            {m === "computer" ? "vs Computer" : "vs Friend"}
          </button>
        ))}
      </div>
      <p className="mini-status" role="status">
        {status}
      </p>
      <div className="ttt-board" role="grid" aria-label="Board">
        {board.map((cell, i) => (
          <button
            key={i}
            role="gridcell"
            className="ttt-cell"
            data-mark={cell ?? ""}
            data-win={win?.line.includes(i) ?? false}
            aria-label={cell ? `Square ${i + 1}, ${cell}` : `Square ${i + 1}, empty`}
            disabled={!!cell || done || (mode === "computer" && turn === "O")}
            onClick={() => place(i, turn)}
          >
            {cell}
          </button>
        ))}
      </div>
      <MiniButton primary onClick={() => reset()}>
        {done ? "Play again" : "Restart"}
      </MiniButton>
    </div>
  );
}
