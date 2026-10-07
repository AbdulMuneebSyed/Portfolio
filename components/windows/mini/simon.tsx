"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { playTone } from "@/lib/tone";
import { MiniButton, MiniHeader, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const PADS = [
  { name: "Green", color: "#30d158", freq: 329.63 },
  { name: "Red", color: "#ff453a", freq: 261.63 },
  { name: "Yellow", color: "#ffd60a", freq: 220.0 },
  { name: "Blue", color: "#0a84ff", freq: 164.81 },
];

type Phase = "idle" | "showing" | "input" | "over";

export function Simon({ preview }: MiniAppProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<number | null>(preview ? 2 : null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [best, setBest] = useStoredNumber("muneebos-simon-best");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const flash = (pad: number, ms = 380) => {
    setLit(pad);
    playTone(PADS[pad].freq, ms / 1000, "sine");
    timers.current.push(setTimeout(() => setLit(null), ms));
  };

  const show = (seq: number[]) => {
    setPhase("showing");
    const gap = Math.max(260, 620 - seq.length * 25);
    seq.forEach((pad, i) => timers.current.push(setTimeout(() => flash(pad, gap * 0.65), 500 + i * gap)));
    timers.current.push(
      setTimeout(() => {
        setPhase("input");
        setStep(0);
      }, 500 + seq.length * gap),
    );
  };

  const start = () => {
    clearTimers();
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    show(first);
  };

  const press = (pad: number) => {
    if (phase !== "input") return;
    flash(pad, 220);
    if (pad !== sequence[step]) {
      setPhase("over");
      playTone(110, 0.6, "sawtooth");
      return;
    }
    if (step + 1 < sequence.length) {
      setStep(step + 1);
      return;
    }
    if (sequence.length > best) setBest(sequence.length);
    const next = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(next);
    timers.current.push(setTimeout(() => show(next), 400));
  };

  const round = preview ? 7 : sequence.length;
  return (
    <div className="mini-app">
      <MiniHeader
        title="Simon"
        stats={[
          { label: "Round", value: round || "–" },
          { label: "Best", value: best || "–" },
        ]}
      />
      <div className="simon-board" data-phase={phase}>
        {PADS.map((pad, i) => (
          <button
            key={pad.name}
            className="simon-pad"
            aria-label={pad.name}
            data-lit={lit === i}
            style={{ "--pad": pad.color } as React.CSSProperties}
            disabled={phase !== "input"}
            onClick={() => press(i)}
          />
        ))}
        <div className="simon-center">
          {phase === "idle" || phase === "over" ? (
            <MiniButton primary onClick={start}>
              {phase === "over" ? "Again" : "Start"}
            </MiniButton>
          ) : (
            <strong>{phase === "showing" ? "Watch" : "Your turn"}</strong>
          )}
        </div>
      </div>
      <p className="mini-status" role="status">
        {phase === "over"
          ? `Wrong pad! You reached round ${sequence.length}.`
          : "Repeat the sequence. It grows by one each round."}
      </p>
    </div>
  );
}
