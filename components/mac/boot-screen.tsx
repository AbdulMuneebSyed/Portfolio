"use client";

import { useEffect, useState } from "react";
import { AppleLogo } from "./apple-logo";

const BOOT_DURATION_MS = 2000;

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    // A timer (not requestAnimationFrame) so a throttled background tab
    // still finishes booting on time; the bar is a CSS transition.
    const startId = window.setTimeout(() => setIsFilling(true), 50);
    const doneId = window.setTimeout(onDone, BOOT_DURATION_MS);
    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(doneId);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center gap-12 bg-black text-white">
      <AppleLogo className="size-20" />
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white ease-out"
          style={{
            width: isFilling ? "100%" : "0%",
            transitionProperty: "width",
            transitionDuration: `${BOOT_DURATION_MS - 150}ms`,
          }}
        />
      </div>
    </div>
  );
}
