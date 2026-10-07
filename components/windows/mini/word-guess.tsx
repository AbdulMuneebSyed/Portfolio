"use client";

import { useState } from "react";
import { Delete } from "lucide-react";
import { WORDS, scoreGuess, type Mark } from "@/lib/games/word-guess";
import { MiniButton, MiniHeader, useFocusRoot, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const ROWS = 6;
const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };

const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];

export function WordGuess({ preview }: MiniAppProps) {
  const root = useFocusRoot<HTMLDivElement>(preview);
  const [answer, setAnswer] = useState(() => (preview ? "REACT" : pick()));
  const [guesses, setGuesses] = useState<string[]>(preview ? ["STACK", "TRACE"] : []);
  const [current, setCurrent] = useState(preview ? "RE" : "");
  const [streak, setStreak] = useStoredNumber("muneebos-wordguess-streak");
  const [shake, setShake] = useState(false);

  const solved = guesses.includes(answer);
  const over = solved || guesses.length >= ROWS;

  const keyMarks: Record<string, Mark> = {};
  for (const g of guesses)
    scoreGuess(g, answer).forEach((mark, i) => {
      const prev = keyMarks[g[i]];
      if (!prev || RANK[mark] > RANK[prev]) keyMarks[g[i]] = mark;
    });

  const press = (key: string) => {
    if (preview || over) return;
    if (key === "ENTER") {
      if (current.length !== 5) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      const next = [...guesses, current];
      setGuesses(next);
      setCurrent("");
      if (current === answer) setStreak(streak + 1);
      else if (next.length >= ROWS) setStreak(0);
    } else if (key === "BACK") setCurrent(current.slice(0, -1));
    else if (/^[A-Z]$/.test(key) && current.length < 5) setCurrent(current + key);
  };

  const restart = () => {
    setAnswer(pick());
    setGuesses([]);
    setCurrent("");
    root.current?.focus();
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      className="mini-app"
      aria-label="Word Guess. Type a five-letter word and press Return."
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        const key = e.key === "Enter" ? "ENTER" : e.key === "Backspace" ? "BACK" : e.key.toUpperCase();
        if (key === "ENTER" || key === "BACK" || /^[A-Z]$/.test(key)) {
          e.preventDefault();
          press(key);
        }
      }}
    >
      <MiniHeader
        title="Word Guess"
        stats={[{ label: "Streak", value: streak }]}
        action={<MiniButton onClick={restart}>New Word</MiniButton>}
      />
      <div className="word-grid" role="grid" aria-label="Guesses">
        {Array.from({ length: ROWS }, (_, r) => {
          const word = guesses[r] ?? (r === guesses.length ? current : "");
          const marks = guesses[r] ? scoreGuess(guesses[r], answer) : null;
          return (
            <div key={r} role="row" className="word-row" data-shake={shake && r === guesses.length}>
              {Array.from({ length: 5 }, (_, c) => (
                <span
                  key={c}
                  role="gridcell"
                  className="word-cell"
                  data-mark={marks?.[c] ?? (word[c] ? "typed" : "")}
                  aria-label={word[c] ? `${word[c]}${marks ? `, ${marks[c]}` : ""}` : "empty"}
                >
                  {word[c] ?? ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <p className="mini-status" role="status">
        {solved ? "Nice! You got it." : over ? `The word was ${answer}.` : "Words developers use every day."}
      </p>
      <div className="word-keyboard">
        {KEYBOARD.map((row, i) => (
          <div key={row}>
            {i === 2 && (
              <button className="wide" onClick={() => press("ENTER")}>
                Enter
              </button>
            )}
            {row.split("").map((k) => (
              <button key={k} data-mark={keyMarks[k] ?? ""} onClick={() => press(k)}>
                {k}
              </button>
            ))}
            {i === 2 && (
              <button className="wide" aria-label="Delete" onClick={() => press("BACK")}>
                <Delete size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
