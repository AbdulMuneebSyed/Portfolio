"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";

const steps = [
  {
    app: "about",
    title: "Welcome to Muneeb OS",
    text: "A little desktop, a lot to explore. Get to know me, browse my projects, or get in touch.",
  },
  {
    app: "projects",
    title: "Explore my work",
    text: "Open Projects to browse what I’ve built. Select a folder to see the story, technologies, and results.",
  },
  {
    app: "computer",
    title: "Make yourself at home",
    text: "Use the Dock to open apps. Drag windows by their title bars. The red, yellow, and green buttons close, minimize, and zoom.",
    phoneText: "Open Files to browse the portfolio. Use the Home button to return to your apps, or swipe through the categories at the top of a screen.",
  },
  {
    app: "settings",
    title: "Your desktop, your way",
    text: "Change the wallpaper and appearance in System Settings. Press ⌘K or Ctrl+K to find any app with Spotlight.",
    phoneTitle: "Make it yours",
    phoneText: "Change the wallpaper and appearance in Settings. Tap Search on the Home Screen to find any app.",
  },
];
export function PhoneTour({
  run,
  onComplete,
  onSkip,
}: {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (run) {
      setIndex(0);
      const id = setTimeout(() => ref.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [run]);
  if (!run) return null;
  const step = steps[index];
  return (
    <div className="tour-backdrop" onClick={onSkip}>
      <div
        ref={ref}
        tabIndex={-1}
        className="tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio tour"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onSkip();
          if (e.key === "Tab") {
            const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            );
            const current = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            e.preventDefault();
            buttons[
              (current + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length
            ]?.focus();
          }
        }}
      >
        <button
          className="tour-close mac-icon-button"
          aria-label="Close tour"
          onClick={onSkip}
        >
          <X size={17} />
        </button>
        <AppIcon appId={step.app} size={86} />
        <h1>
          <span className={step.phoneTitle ? "desktop-only" : ""}>{step.title}</span>
          {step.phoneTitle && <span className="mobile-only">{step.phoneTitle}</span>}
        </h1>
        <p>
          <span className={step.phoneText ? "desktop-only" : ""}>{step.text}</span>
          {step.phoneText && <span className="mobile-only">{step.phoneText}</span>}
        </p>
        <div className="tour-dots">
          {steps.map((s, i) => (
            <span key={s.app} data-active={i === index} />
          ))}
        </div>
        <div className="flex justify-between items-center gap-3 w-full">
          <button
            className="mac-button"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            Back
          </button>
          <button
            className="mac-button primary"
            onClick={() => {
              if (index === steps.length - 1) {
                onComplete();
                launchApp("about");
              } else setIndex(index + 1);
            }}
          >
            {index === steps.length - 1 ? "Explore Portfolio" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
