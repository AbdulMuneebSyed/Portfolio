"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { notify } from "@/lib/notifications";
import { playTone } from "@/lib/tone";
import { MiniHeader } from "./shared";
import type { MiniAppProps } from "./registry";

const MODES = {
  focus: { label: "Focus", minutes: 25, color: "#ff453a" },
  short: { label: "Short Break", minutes: 5, color: "#30d158" },
  long: { label: "Long Break", minutes: 15, color: "#0a84ff" },
} as const;
type Mode = keyof typeof MODES;

const format = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Pomodoro({ preview }: MiniAppProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(preview ? 17 * 60 + 42 : MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(preview ? 3 : 0);
  const endsAt = useRef(0);

  const total = MODES[mode].minutes * 60;

  // Count down from a fixed end time so the timer stays right even when the
  // browser throttles background tabs.
  useEffect(() => {
    if (!running) return;
    endsAt.current = Date.now() + left * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining > 0) return;
      clearInterval(timer);
      setRunning(false);
      playTone(880, 0.4);
      setTimeout(() => playTone(1175, 0.6), 250);
      if (mode === "focus") {
        const done = sessions + 1;
        setSessions(done);
        notify({ appId: "pomodoro", title: "Focus session done", body: "Time for a break." });
        switchMode(done % 4 === 0 ? "long" : "short");
      } else {
        notify({ appId: "pomodoro", title: "Break's over", body: "Ready for another focus session?" });
        switchMode("focus");
      }
    }, 250);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const switchMode = (next: Mode) => {
    setRunning(false);
    setMode(next);
    setLeft(MODES[next].minutes * 60);
  };

  const r = 92;
  const c = 2 * Math.PI * r;
  const color = MODES[mode].color;

  return (
    <div className="mini-app">
      <MiniHeader title="Pomodoro" stats={[{ label: "Sessions", value: sessions }]} />
      <div className="mini-segments" role="tablist" aria-label="Timer">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}>
            {MODES[m].label}
          </button>
        ))}
      </div>
      <div className="pomodoro-dial">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <circle cx="110" cy="110" r={r} className="pomodoro-track" />
          <circle
            cx="110"
            cy="110"
            r={r}
            className="pomodoro-bar"
            stroke={color}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - left / total)}
          />
        </svg>
        <div>
          <strong role="timer" aria-live="off">
            {format(left)}
          </strong>
          <small>{MODES[mode].label}</small>
        </div>
      </div>
      <div className="pomodoro-controls">
        <button
          className="pomodoro-main"
          style={{ background: color }}
          aria-label={running ? "Pause" : "Start"}
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause size={26} /> : <Play size={26} />}
        </button>
        <button className="mini-icon-button" aria-label="Reset" onClick={() => switchMode(mode)}>
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
