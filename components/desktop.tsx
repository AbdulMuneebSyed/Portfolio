"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { useGlobalClickSound } from "@/hooks/use-global-click-sound";
import {
  DOCK_RESERVED_HEIGHT,
  launchApp,
  MENU_BAR_HEIGHT,
} from "@/lib/launch-app";
import { DesktopIconComponent } from "./desktop-icon";
import { Window } from "./window";
import { useMissionControl, missionLayout } from "@/lib/mission-control";
import { useDesktopSelection } from "@/lib/desktop-selection";
import { notify } from "@/lib/notifications";
import { NotificationBanners } from "./mac/notification-banners";
import { ContextMenu } from "./context-menu";
import { MenuBar } from "./mac/menu-bar";
import { Dock } from "./mac/dock";
import { MobileHome } from "./mobile-home";
import { Spotlight } from "./mac/spotlight";
import { BootScreen } from "./mac/boot-screen";
import { Tour } from "./mac/tour";
import { ProjectsExplorer } from "./windows/projects-explorer";
import { ResumeWindow } from "./windows/resume-window";
import { AboutWindow } from "./windows/about-window";
import { ContactWindow } from "./windows/contact-window";
import { Minesweeper } from "./windows/minesweeper";
import { Snake } from "./windows/snake";
import { SettingsWindow } from "./windows/settings-window";
import { ComputerExplorer } from "./windows/computer-explorer";
import { InternetExplorer } from "./windows/internet-explorer";
import { Calculator } from "./windows/calculator";
import { FeedbackWindow } from "./windows/feedback-window-clean";
import { PixelMusicPlayer } from "./windows/modern-music-player";
import { PhotoPreview } from "./windows/photo-preview";
import { Notepad } from "./windows/notepad";
import { TerminalWindow } from "./windows/terminal-window";
import { GitHubActivityViewer } from "./windows/github-activity-viewer";
import { RecycleBin } from "./windows/recycle-bin";
import { TaskManagerWindow } from "./windows/task-manager-window";

function PlaceholderWindow() {
  return (
    <div className="p-8">
      <h2 className="mb-4 text-2xl font-bold">Coming Soon</h2>
      <p className="text-muted-foreground">This app isn&apos;t ready yet.</p>
    </div>
  );
}

const windowComponents: Record<string, React.ComponentType> = {
  ProjectsExplorer,
  ResumeWindow,
  AboutWindow,
  ContactWindow,
  Minesweeper,
  Snake,
  SettingsWindow,
  ComputerExplorer,
  InternetExplorer,
  Calculator,
  FeedbackWindow,
  MusicPlayer: PixelMusicPlayer,
  PhotoPreview,
  Notepad,
  TerminalWindow,
  GitHubActivityViewer,
  RecycleBin,
  TaskManagerWindow,
};

interface DesktopProps {
  onLock: () => void;
}

export function Desktop({ onLock }: DesktopProps) {
  useGlobalClickSound();

  const {
    desktopIcons,
    windows,
    isShutdown,
    wallpaper,
    loadState,
    resetIconPositions,
  } = useWindowManager();
  const aeroEffects = useWindowManager((state) => state.aeroEffects);
  const reduceMotion = useSystemControls((state) => state.reduceMotion);
  const brightness = useSystemControls((state) => state.brightness);
  const darkMode = useSystemControls((state) => state.darkMode);
  const loadControls = useSystemControls((state) => state.loadControls);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);
  const missionOpen = useMissionControl((state) => state.open);
  const setMissionOpen = useMissionControl((state) => state.setOpen);
  const [band, setBand] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const filesRef = useRef<HTMLDivElement>(null);

  // Remember the first visit; the tour stays available without interrupting.
  useEffect(() => {
    if (localStorage.getItem("hasVisitedPortfolio") === null) {
      setShowTourButton(true);
      // Marked as visited only once the welcome actually shows.
      const id = setTimeout(() => {
        localStorage.setItem("hasVisitedPortfolio", "true");
        notify({
          appId: "about",
          title: "Welcome to Muneeb OS",
          body: "Click here to meet Muneeb, or press ⌘K to search every app.",
        });
      }, 1200);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    loadState();
    loadControls();
  }, [loadState, loadControls]);

  // Control Center's Dark Mode applies to the whole shell (and portals).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    return () => document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const wm = useWindowManager.getState();
      if ((e.ctrlKey && key === "arrowup") || key === "f3") {
        e.preventDefault();
        if (innerWidth >= 700) useMissionControl.getState().toggle();
      } else if (mod && (key === "k" || e.code === "Space")) {
        e.preventDefault();
        setIsSpotlightOpen((open) => !open);
      } else if (mod && key === ",") {
        e.preventDefault();
        launchApp("settings");
      } else if (mod && e.altKey && key === "escape") {
        e.preventDefault();
        launchApp("task-manager");
      } else if (mod && key === "m" && wm.activeWindowId) {
        e.preventDefault();
        wm.minimizeWindow(wm.activeWindowId);
      } else if (mod && key === "w" && wm.activeWindowId) {
        e.preventDefault();
        wm.closeWindow(wm.activeWindowId);
      } else if (mod && key === "`") {
        e.preventDefault();
        const visible = wm.windows.filter((w) => !w.isMinimized);
        const index = visible.findIndex((w) => w.id === wm.activeWindowId);
        const next =
          visible[
            (index + (e.shiftKey ? visible.length - 1 : 1)) % visible.length
          ];
        if (next) wm.setActiveWindow(next.id);
      } else if (key === "escape") {
        useMissionControl.getState().setOpen(false);
        setContextMenu(null);
        setIsSpotlightOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBootDone = useCallback(() => {
    useWindowManager.getState().restart();
    setIsBooting(false);
  }, []);

  const handleRestart = useCallback(() => {
    setIsBooting(true);
  }, []);

  const handleTourComplete = useCallback(() => {
    setIsTourRunning(false);
    setShowTourButton(true);
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourRunning(true);
    setShowTourButton(false);
  }, []);

  const openSpotlight = useCallback(() => setIsSpotlightOpen(true), []);
  const mobileAppOpen = windows.some((w) => w.isActive && !w.isMinimized);
  const goMobileHome = useCallback(() => {
    const manager = useWindowManager.getState();
    manager.windows
      .filter((w) => !w.isMinimized)
      .forEach((w) => manager.minimizeWindow(w.id));
    setIsSpotlightOpen(false);
  }, []);

  // Opening or closing a window leaves Mission Control.
  useEffect(() => setMissionOpen(false), [windows.length, setMissionOpen]);

  // Mission Control slots for the visible windows, back to front.
  const missionSlots = new Map<
    string,
    ReturnType<typeof missionLayout>[number]
  >();
  if (missionOpen && typeof window !== "undefined") {
    const visible = windows
      .filter((w) => !w.isMinimized)
      .sort((a, b) => a.zIndex - b.zIndex);
    const slots = missionLayout(visible.length, {
      x: 40,
      y: MENU_BAR_HEIGHT + 36,
      width: innerWidth - 80,
      height: innerHeight - MENU_BAR_HEIGHT - DOCK_RESERVED_HEIGHT - 56,
    });
    visible.forEach((w, i) => missionSlots.set(w.id, slots[i]));
  }

  // Rubber-band selection: drag on empty desktop to select files.
  const updateBand = (x1: number, y1: number) => {
    if (!band) return;
    setBand({ ...band, x1, y1 });
    const left = Math.min(band.x0, x1);
    const right = Math.max(band.x0, x1);
    const top = Math.min(band.y0, y1);
    const bottom = Math.max(band.y0, y1);
    const hits = [
      ...(filesRef.current?.querySelectorAll<HTMLElement>("[data-icon-id]") ??
        []),
    ].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.left < right && r.right > left && r.top < bottom && r.bottom > top;
    });
    useDesktopSelection
      .getState()
      .select(hits.map((el) => el.dataset.iconId as string));
  };

  const contextMenuItems = [
    {
      label: "Change Wallpaper…",
      onClick: () => launchApp("settings", { section: "wallpaper" }),
    },
    { label: "Clean Up", onClick: resetIconPositions },
    { separator: true },
    { label: "Spotlight…", onClick: openSpotlight },
  ];

  if (isBooting) {
    return <BootScreen onDone={handleBootDone} />;
  }

  if (isShutdown) {
    return (
      <div
        className="fixed inset-0 flex cursor-pointer items-center justify-center bg-black"
        onClick={handleRestart}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRestart();
        }}
        tabIndex={0}
        autoFocus
      >
        <div className="text-sm text-white/50">
          Click or press Enter to start up
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div
        data-reduce-motion={reduceMotion}
        data-transparency={aeroEffects}
        data-mobile-app-open={mobileAppOpen}
        className="mac-desktop font-mac relative h-dvh w-dvw overflow-hidden bg-[#1e1b4b]"
        style={{
          backgroundImage: wallpaper,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        onClick={() => setContextMenu(null)}
      >
        <Tour
          run={isTourRunning}
          onComplete={handleTourComplete}
          onSkip={handleTourComplete}
        />

        <MenuBar
          onOpenSpotlight={openSpotlight}
          onStartTour={handleStartTour}
          onLock={onLock}
          onRestart={handleRestart}
        />

        <MobileHome
          appOpen={mobileAppOpen}
          onHome={goMobileHome}
          onSearch={openSpotlight}
        />

        {/* Desktop files, anchored top-right */}
        <div
          ref={filesRef}
          onPointerDown={(e) => {
            if (e.target !== e.currentTarget || e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            useDesktopSelection.getState().clear();
            setBand({
              x0: e.clientX,
              y0: e.clientY,
              x1: e.clientX,
              y1: e.clientY,
            });
          }}
          onPointerMove={(e) => updateBand(e.clientX, e.clientY)}
          onPointerUp={() => setBand(null)}
          onPointerCancel={() => setBand(null)}
          className="desktop-files absolute"
          style={{
            top: MENU_BAR_HEIGHT + 20,
            right: 28,
            bottom: DOCK_RESERVED_HEIGHT,
            left: 12,
          }}
        >
          {desktopIcons.map((icon) => (
            <DesktopIconComponent key={icon.id} icon={icon} />
          ))}
        </div>

        {band && (
          <div
            className="selection-band pointer-events-none fixed z-[90]"
            style={{
              left: Math.min(band.x0, band.x1),
              top: Math.min(band.y0, band.y1),
              width: Math.abs(band.x1 - band.x0),
              height: Math.abs(band.y1 - band.y0),
            }}
          />
        )}

        <AnimatePresence>
          {missionOpen && (
            <motion.div
              key="mission-backdrop"
              className="mission-backdrop fixed inset-0"
              style={{ zIndex: 99 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMissionOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {windows.map((window) => {
            const WindowComponent =
              windowComponents[window.component] ?? PlaceholderWindow;
            return (
              <Window
                key={window.id}
                window={window}
                mission={missionSlots.get(window.id) ?? null}
                onHome={goMobileHome}
                onMissionSelect={() => {
                  useWindowManager.getState().setActiveWindow(window.id);
                  setMissionOpen(false);
                }}
              >
                <WindowComponent {...(window.metadata || {})} />
              </Window>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={contextMenuItems}
              onClose={() => setContextMenu(null)}
            />
          )}
        </AnimatePresence>

        {showTourButton && (
          <button
            className="tour-launcher fixed bottom-5 right-5 z-[8500] flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xl hover:bg-white/30"
            onClick={handleStartTour}
          >
            <HelpCircle className="size-3.5" />
            Take the tour
          </button>
        )}

        <Dock onSearch={openSpotlight} />

        <NotificationBanners />

        {/* Control Center's Display slider: dims everything, like a screen. */}
        {brightness < 1 && (
          <div
            className="pointer-events-none fixed inset-0 z-[30000] bg-black"
            style={{ opacity: 1 - brightness }}
          />
        )}

        <Spotlight
          open={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
