"use client";

import { useEffect } from "react";

export function useGlobalClickSound() {
  useEffect(() => {
    let lastClickTime = 0;

    const playClickSound = () => {
      try {
        const audio = new Audio("/click.mp3");
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio not available:", e);
      }
    };

    // Add global click listener to the document
    const handleGlobalClick = (event: MouseEvent) => {
      // Play sound for left clicks (button 0) and right clicks (button 2)
      if (event.button === 0 || event.button === 2) {
        const now = Date.now();
        // Prevent duplicate sounds within 100ms
        if (now - lastClickTime > 100) {
          playClickSound();
          lastClickTime = now;
        }
      }
    };

    // Use only mousedown to catch clicks immediately
    document.addEventListener("mousedown", handleGlobalClick);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, []);
}

export default useGlobalClickSound;
