"use client";

import { useRef, useState } from "react";
import {
  addRandomTile,
  canMove,
  move,
  newBoard,
  type Direction,
} from "@/lib/games/game-2048";
import { MiniButton, MiniHeader, useFocusRoot, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const KEYS: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

const PREVIEW_BOARD = [2, 4, 8, 0, 0, 16, 32, 2, 0, 128, 64, 4, 2, 256, 512, 1024];

export function Game2048({ preview }: MiniAppProps) {
  const root = useFocusRoot<HTMLDivElement>(preview);
  const [board, setBoard] = useState(() => (preview ? PREVIEW_BOARD : newBoard()));
  const [score, setScore] = useState(preview ? 3120 : 0);
  const [best, setBest] = useStoredNumber("muneebos-2048-best");
  const [won, setWon] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const over = !preview && !canMove(board);

  const play = (dir: Direction) => {
    if (preview || over || (won && !keepGoing)) return;
    const result = move(board, dir);
    if (!result.moved) return;
    const next = addRandomTile(result.board);
    const total = score + result.gained;
    setBoard(next);
    setScore(total);
    if (total > best) setBest(total);
    if (!won && next.includes(2048)) setWon(true);
  };

  const restart = () => {
    setBoard(newBoard());
    setScore(0);
    setWon(false);
    setKeepGoing(false);
    root.current?.focus();
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      className="mini-app"
      aria-label="2048. Use the arrow keys to slide the tiles."
      onKeyDown={(e) => {
        const dir = KEYS[e.key];
        if (!dir) return;
        e.preventDefault();
        play(dir);
      }}
      onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
        play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
      }}
    >
      <MiniHeader
        title="2048"
        stats={[
          { label: "Score", value: score },
          { label: "Best", value: Math.max(best, score) },
        ]}
        action={<MiniButton onClick={restart}>New Game</MiniButton>}
      />
      <div className="g2048-board" role="grid" aria-label="Board">
        {board.map((value, i) => (
          <div
            key={i}
            role="gridcell"
            className="g2048-tile"
            data-value={value > 2048 ? "big" : value}
            aria-label={value ? String(value) : "empty"}
          >
            {value || ""}
          </div>
        ))}
        {(over || (won && !keepGoing)) && (
          <div className="mini-overlay">
            <strong>{over ? "Game over" : "You made 2048!"}</strong>
            <div className="flex gap-2">
              {won && !over && (
                <MiniButton onClick={() => setKeepGoing(true)}>Keep going</MiniButton>
              )}
              <MiniButton primary onClick={restart}>
                Try again
              </MiniButton>
            </div>
          </div>
        )}
      </div>
      <p className="mini-hint">Arrow keys or swipe. Equal tiles merge.</p>
    </div>
  );
}
