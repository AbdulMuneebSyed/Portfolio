"use client";

import { useEffect, useState } from "react";
import { MiniButton, MiniHeader, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const FACES = [
  { label: "React", color: "#61dafb", text: "#0b2833" },
  { label: "Next", color: "#111111", text: "#ffffff" },
  { label: "TS", color: "#3178c6", text: "#ffffff" },
  { label: "Node", color: "#5fa04e", text: "#ffffff" },
  { label: "Mongo", color: "#00ed64", text: "#023430" },
  { label: "Redis", color: "#dc382d", text: "#ffffff" },
  { label: "Rust", color: "#ce422b", text: "#ffffff" },
  { label: "Docker", color: "#1d63ed", text: "#ffffff" },
];

function shuffled() {
  const cards = [...FACES.keys(), ...FACES.keys()];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function MemoryGame({ preview }: MiniAppProps) {
  const [cards, setCards] = useState<number[]>(() =>
    preview ? [0, 3, 5, 1, 6, 2, 0, 7, 4, 1, 3, 6, 2, 5, 7, 4] : shuffled(),
  );
  const [open, setOpen] = useState<number[]>(preview ? [1, 4] : []);
  const [matched, setMatched] = useState<Set<number>>(() => new Set(preview ? [0, 6, 3, 9] : []));
  const [moves, setMoves] = useState(preview ? 7 : 0);
  const [best, setBest] = useStoredNumber("muneebos-memory-best");
  const won = matched.size === cards.length;

  // Two open cards: keep them if they match, otherwise flip them back.
  useEffect(() => {
    if (preview || open.length !== 2) return;
    const [a, b] = open;
    if (cards[a] === cards[b]) {
      const next = new Set(matched).add(a).add(b);
      setMatched(next);
      setOpen([]);
      if (next.size === cards.length && (!best || moves < best)) setBest(moves);
      return;
    }
    const timer = setTimeout(() => setOpen([]), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.has(i)) return;
    if (open.length === 1) setMoves((m) => m + 1);
    setOpen([...open, i]);
  };

  const restart = () => {
    setCards(shuffled());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
  };

  return (
    <div className="mini-app">
      <MiniHeader
        title="Memory"
        stats={[
          { label: "Moves", value: moves },
          { label: "Best", value: best || "–" },
        ]}
        action={<MiniButton onClick={restart}>New Game</MiniButton>}
      />
      <div className="memory-board">
        {cards.map((face, i) => {
          const shown = open.includes(i) || matched.has(i);
          const f = FACES[face];
          return (
            <button
              key={i}
              className="memory-card"
              data-shown={shown}
              data-matched={matched.has(i)}
              aria-label={shown ? f.label : "Hidden card"}
              onClick={() => flip(i)}
            >
              <span className="memory-face memory-back" />
              <span className="memory-face memory-front" style={{ background: f.color, color: f.text }}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mini-status" role="status">
        {won ? `All pairs found in ${moves} moves!` : "Find all eight pairs."}
      </p>
    </div>
  );
}
