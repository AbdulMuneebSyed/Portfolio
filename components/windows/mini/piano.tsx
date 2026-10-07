"use client";

import { useState } from "react";
import { noteFrequency, playTone } from "@/lib/tone";
import { MiniHeader, useFocusRoot } from "./shared";
import type { MiniAppProps } from "./registry";

// Two octaves from C4, laid out like a tracker: the Z row plays the lower
// octave's white keys (S D G H J for black), the Q row the upper octave's
// (2 3 5 6 7 for black).
const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const LOWER = "zsxdcvgbhnjm";
const UPPER = "q2w3er5t6y7u";

interface Key {
  semitone: number;
  name: string;
  black: boolean;
  shortcut: string;
}

const KEYS: Key[] = Array.from({ length: 24 }, (_, i) => {
  const name = NAMES[i % 12];
  return {
    semitone: i,
    name: `${name}${4 + Math.floor(i / 12)}`,
    black: name.includes("♯"),
    shortcut: (i < 12 ? LOWER : UPPER)[i % 12].toUpperCase(),
  };
});
const WHITE = KEYS.filter((k) => !k.black);
const SHORTCUTS = new Map(KEYS.map((k) => [k.shortcut.toLowerCase(), k.semitone]));

export function Piano({ preview }: MiniAppProps) {
  const root = useFocusRoot<HTMLDivElement>(preview);
  const [down, setDown] = useState<Set<number>>(() => new Set(preview ? [0, 4, 7] : []));
  const [wave, setWave] = useState<OscillatorType>("triangle");
  const [labels, setLabels] = useState(true);

  const strike = (semitone: number) => {
    // C4 is 9 semitones below A4.
    playTone(noteFrequency(semitone - 9), 1.1, wave);
    setDown((d) => new Set(d).add(semitone));
  };
  const release = (semitone: number) =>
    setDown((d) => {
      const next = new Set(d);
      next.delete(semitone);
      return next;
    });

  // A black key sits on the line between two white keys.
  const blackLeft = (key: Key) => {
    const whitesBefore = KEYS.slice(0, key.semitone).filter((k) => !k.black).length;
    return `${(whitesBefore / WHITE.length) * 100}%`;
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      className="mini-app piano-app"
      aria-label="Piano. Play with the Z and Q keyboard rows."
      onKeyDown={(e) => {
        if (e.repeat || e.metaKey || e.ctrlKey) return;
        const semitone = SHORTCUTS.get(e.key.toLowerCase());
        if (semitone === undefined) return;
        e.preventDefault();
        strike(semitone);
      }}
      onKeyUp={(e) => {
        const semitone = SHORTCUTS.get(e.key.toLowerCase());
        if (semitone !== undefined) release(semitone);
      }}
    >
      <MiniHeader
        title="Piano"
        action={
          <div className="flex items-center gap-2">
            <div className="mini-segments small" role="tablist" aria-label="Sound">
              {(["triangle", "sine", "square"] as OscillatorType[]).map((w) => (
                <button key={w} role="tab" aria-selected={wave === w} onClick={() => setWave(w)}>
                  {w === "triangle" ? "Soft" : w === "sine" ? "Pure" : "Retro"}
                </button>
              ))}
            </div>
            <label className="mini-check">
              <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
              Labels
            </label>
          </div>
        }
      />
      <div className="piano-keys" role="group" aria-label="Keys">
        {WHITE.map((key) => (
          <button
            key={key.semitone}
            className="piano-white"
            data-down={down.has(key.semitone)}
            aria-label={key.name}
            onPointerDown={() => strike(key.semitone)}
            onPointerUp={() => release(key.semitone)}
            onPointerLeave={() => release(key.semitone)}
          >
            {labels && (
              <span>
                {key.name}
                <kbd>{key.shortcut}</kbd>
              </span>
            )}
          </button>
        ))}
        {KEYS.filter((k) => k.black).map((key) => (
          <button
            key={key.semitone}
            className="piano-black"
            style={{ left: blackLeft(key) }}
            data-down={down.has(key.semitone)}
            aria-label={key.name}
            onPointerDown={() => strike(key.semitone)}
            onPointerUp={() => release(key.semitone)}
            onPointerLeave={() => release(key.semitone)}
          >
            {labels && <kbd>{key.shortcut}</kbd>}
          </button>
        ))}
      </div>
    </div>
  );
}
