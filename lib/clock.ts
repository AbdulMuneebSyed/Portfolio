import { useSyncExternalStore } from "react";

// One clock for the whole OS, ticking on the minute (every clock on screen
// shows hours and minutes), instead of a timer per component.
let now: Date | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function tick() {
  now = new Date();
  listeners.forEach((listener) => listener());
  timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) tick();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) clearTimeout(timer);
  };
}

// The current minute; null during server rendering.
export function useMinute() {
  return useSyncExternalStore(subscribe, () => now, () => null);
}

// iOS and lock-screen style: 12-hour without AM/PM, e.g. "6:56".
export function formatClock(date: Date) {
  return `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
}
