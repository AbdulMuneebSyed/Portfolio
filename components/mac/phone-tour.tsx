"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { PhoneAppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";

// iPhone welcome sheet, like the "What's New" screen an iOS app shows on its
// first launch: a large title, a short list of what's here, one big button.
const features = [
  {
    app: "projects",
    title: "See what I’ve built",
    text: "Projects holds the apps and tools I’ve made, each with its story and tech stack.",
  },
  {
    app: "resume",
    title: "Read my résumé",
    text: "Open Resume to read it, share it or save the PDF.",
  },
  {
    app: "contact",
    title: "Get in touch",
    text: "Write to me in Mail, or find me on LinkedIn and GitHub.",
  },
  {
    app: "settings",
    title: "Use it like an iPhone",
    text: "Swipe up from the bottom to go Home; swipe up and hold to switch apps. Pull down from the top right for Control Center.",
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
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!run) return;
    const id = setTimeout(() => ref.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [run]);

  return (
    <AnimatePresence>
      {run && (
        <>
          <motion.div
            key="welcome-backdrop"
            className="pwelcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onSkip}
          />
          <motion.div
            key="welcome"
            ref={ref}
            tabIndex={-1}
            className="pwelcome"
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to Muneeb OS"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            // Pull the sheet down to dismiss it, as on iOS.
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onSkip();
            }}
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Escape" && onSkip()}
          >
            <span className="pwelcome-grabber" aria-hidden="true" />
            <div className="pwelcome-body">
              <Image
                src="/avatar-256.jpg"
                alt=""
                width={84}
                height={84}
                className="pwelcome-avatar"
              />
              <h1>Welcome to Muneeb&nbsp;OS</h1>
              <ul>
                {features.map((f) => (
                  <li key={f.app}>
                    <PhoneAppIcon appId={f.app} size={44} />
                    <span>
                      <strong>{f.title}</strong>
                      <span>{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pwelcome-actions">
              <button
                className="pwelcome-continue"
                onClick={() => {
                  onComplete();
                  launchApp("about");
                }}
              >
                Meet Muneeb
              </button>
              <button className="pwelcome-skip" onClick={onSkip}>
                Explore on my own
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
