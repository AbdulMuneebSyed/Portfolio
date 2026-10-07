"use client";

import { useEffect, useRef, useState } from "react";
import { MiniButton, MiniHeader, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const SECONDS = 30;
const POOL =
  "react state props hook render deploy commit merge branch build cache query index server client async await promise array object string number function return import export type interface module package bundle compile debug test write ship design system scale data stream event signal route layout style token logic value event queue worker thread memory pixel frame socket".split(
    " ",
  );

const makeWords = () =>
  Array.from({ length: 80 }, () => POOL[Math.floor(Math.random() * POOL.length)]);

export function TypingTest({ preview }: MiniAppProps) {
  const [words, setWords] = useState(() => (preview ? POOL.slice(0, 40) : makeWords()));
  const [typed, setTyped] = useState<string[]>(preview ? ["react", "state", "prpos", "hook"] : []);
  const [input, setInput] = useState(preview ? "ren" : "");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [best, setBest] = useStoredNumber("muneebos-typing-best");
  const field = useRef<HTMLInputElement>(null);

  const elapsed = startedAt ? Math.min(SECONDS, (now - startedAt) / 1000) : 0;
  const finished = elapsed >= SECONDS;

  useEffect(() => {
    if (!preview) field.current?.focus({ preventScroll: true });
  }, [preview]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [startedAt, finished]);

  const correctChars = typed.reduce((sum, w, i) => sum + (w === words[i] ? w.length + 1 : 0), 0);
  const wpm = elapsed > 0 ? Math.round(correctChars / 5 / (elapsed / 60)) : preview ? 64 : 0;
  const accuracy = typed.length
    ? Math.round((typed.filter((w, i) => w === words[i]).length / typed.length) * 100)
    : 100;

  useEffect(() => {
    if (finished && wpm > best) setBest(wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const restart = () => {
    setWords(makeWords());
    setTyped([]);
    setInput("");
    setStartedAt(null);
    setNow(0);
    field.current?.focus();
  };

  const index = typed.length;
  return (
    <div className="mini-app">
      <MiniHeader
        title="Typing Test"
        stats={[
          { label: "Time", value: `${Math.ceil(SECONDS - elapsed)}s` },
          { label: "WPM", value: wpm },
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Best", value: best || "–" },
        ]}
        action={<MiniButton onClick={restart}>Restart</MiniButton>}
      />
      <div className="typing-words" aria-hidden="true" onClick={() => field.current?.focus()}>
        {words.slice(Math.max(0, index - 6), index + 30).map((word, k) => {
          const i = Math.max(0, index - 6) + k;
          const state =
            i < index ? (typed[i] === word ? "right" : "wrong") : i === index ? "current" : "";
          return (
            <span key={i} data-state={state}>
              {i === index
                ? word.split("").map((ch, c) => (
                    <i key={c} data-state={c < input.length ? (input[c] === ch ? "right" : "wrong") : ""}>
                      {ch}
                    </i>
                  ))
                : word}
            </span>
          );
        })}
      </div>
      <input
        ref={field}
        className="typing-input"
        aria-label="Type the words shown"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={finished || preview}
        value={input}
        placeholder={startedAt ? "" : "Start typing to begin…"}
        onChange={(e) => {
          const value = e.target.value;
          if (!startedAt) {
            setStartedAt(Date.now());
            setNow(Date.now());
          }
          if (value.endsWith(" ")) {
            const word = value.trim();
            if (word) setTyped([...typed, word]);
            setInput("");
          } else setInput(value);
        }}
      />
      <p className="mini-status" role="status">
        {finished ? `Time! ${wpm} words per minute at ${accuracy}% accuracy.` : "Type each word, then press Space."}
      </p>
    </div>
  );
}
