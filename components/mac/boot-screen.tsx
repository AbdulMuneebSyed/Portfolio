"use client";

import { useEffect, useState } from "react";
import { MuneebLogo } from "./muneeb-logo";

const BOOT_DURATION_MS = 2000;

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const value = Math.min(1, (time - start) / BOOT_DURATION_MS);
      setProgress(value);
      if (value < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center gap-12 bg-black text-white">
      <MuneebLogo className="size-20" />
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
