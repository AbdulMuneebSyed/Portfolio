"use client";

import { useEffect, useState } from "react";

export type BatteryStatus = { level: number; charging: boolean };

// Real battery level where the browser exposes it (Chromium); null elsewhere.
export function useBatteryStatus() {
  const [status, setStatus] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
        removeEventListener: (type: string, listener: () => void) => void;
      }>;
    };
    if (!nav.getBattery) return;

    let cleanup = () => {};
    nav.getBattery().then((battery) => {
      const update = () =>
        setStatus({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        });
      update();
      battery.addEventListener("levelchange", update);
      battery.addEventListener("chargingchange", update);
      cleanup = () => {
        battery.removeEventListener("levelchange", update);
        battery.removeEventListener("chargingchange", update);
      };
    }).catch(() => {});

    return () => cleanup();
  }, []);

  return status;
}
