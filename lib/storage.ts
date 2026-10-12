// Browser storage for the OS's stores. Storage can be missing or throw
// (private windows, blocked site data, server rendering), and saved JSON can
// be corrupt, so every read falls back and every write is best-effort.

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

// A save that runs a beat after the last call, for state that changes on
// every pointermove or slider input. Pending work is written straight away
// when the page is hidden or closed (`flush`). Outside a browser page (the
// test runner) it writes immediately.
export function batched(write: () => void, delayMs = 300) {
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hooked = false;
  const flush = () => {
    if (pending === undefined) return;
    clearTimeout(pending);
    pending = undefined;
    write();
  };
  const schedule = () => {
    if (typeof document === "undefined") return write();
    if (!hooked) {
      hooked = true;
      addEventListener("pagehide", flush);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flush();
      });
    }
    clearTimeout(pending);
    pending = setTimeout(flush, delayMs);
  };
  return { schedule, flush };
}
