"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { getApp } from "@/lib/app-registry";
import { AboutWindow } from "../about-window";
import { ProjectsExplorer } from "../projects-explorer";
import { ContactWindow } from "../contact-window";
import { ComputerExplorer } from "../computer-explorer";
import { SettingsWindow } from "../settings-window";
import { Notepad } from "../notepad";
import { Calculator } from "../calculator";
import { PixelMusicPlayer } from "../modern-music-player";
import { Minesweeper } from "../minesweeper";
import { MINI_APPS } from "../mini/registry";

// Apps that are safe to render as a still preview: no global key listeners
// and no autofocus. Mini-apps also get `preview` so they skip input and timers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PREVIEWS: Record<string, React.ComponentType<any>> = {
  about: AboutWindow,
  projects: ProjectsExplorer,
  contact: ContactWindow,
  computer: ComputerExplorer,
  settings: SettingsWindow,
  notes: Notepad,
  calculator: Calculator,
  music: PixelMusicPlayer,
  minesweeper: Minesweeper,
  ...MINI_APPS,
};

export function hasLivePreview(appId: string) {
  return appId in PREVIEWS;
}

// The app drawn at its normal window size, then scaled to fit the slide.
export function LivePreview({ appId }: { appId: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const app = getApp(appId);
  const Component = PREVIEWS[appId];
  const width = app?.defaultSize.width ?? 800;
  const height = Math.min(app?.defaultSize.height ?? 600, 640);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () =>
      setScale(Math.min(el.clientWidth / width, el.clientHeight / (height + 28)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  // `inert` keeps the preview out of the tab order and pointer events.
  // React 18 has no prop for it, so set the attribute directly.
  useEffect(() => {
    frame.current?.setAttribute("inert", "");
  }, [scale]);

  if (!Component) return null;
  return (
    <div ref={box} className="store-live" aria-hidden="true">
      {scale > 0 && (
        <div
          ref={frame}
          className="store-live-window mac-window font-mac"
          style={{ width, height: height + 28, transform: `scale(${scale})` }}
        >
          <div className="store-live-titlebar">
            <span />
            <span />
            <span />
          </div>
          <div className="store-live-content mac-content">
            <Component preview />
          </div>
        </div>
      )}
    </div>
  );
}
