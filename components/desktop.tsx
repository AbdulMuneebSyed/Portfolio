"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useGlobalClickSound } from "@/hooks/use-global-click-sound";
import {
  DOCK_RESERVED_HEIGHT,
  launchApp,
  MENU_BAR_HEIGHT,
} from "@/lib/launch-app";
import { DesktopIconComponent } from "./desktop-icon";
import { Window } from "./window";
import { ContextMenu } from "./context-menu";
import { MenuBar } from "./mac/menu-bar";
import { Dock } from "./mac/dock";
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
import { ProjectsExplorerPro } from "./windows/projects-explorer-pro";
import { GitHubActivityViewer } from "./windows/github-activity-viewer";
import { MailContactClient } from "./windows/mail-contact-client";
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
  ProjectsExplorerPro,
  GitHubActivityViewer,
  MailContactClient,
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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);

  // First visit: start the tour automatically.
  useEffect(() => {
    if (localStorage.getItem("hasVisitedPortfolio") === null) {
      setIsTourRunning(true);
      setShowTourButton(false);
      localStorage.setItem("hasVisitedPortfolio", "true");
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen((open) => !open);
      } else if (mod && e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        launchApp("task-manager");
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

  const contextMenuItems = [
    { label: "Change Wallpaper…", onClick: () => launchApp("settings") },
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
    <div
      className="relative h-dvh w-dvw overflow-hidden bg-[#1e1b4b]"
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

      {/* Desktop files, anchored top-right */}
      <div
        className="absolute"
        style={{
          top: MENU_BAR_HEIGHT + 12,
          right: 12,
          bottom: DOCK_RESERVED_HEIGHT,
          left: 12,
        }}
      >
        {desktopIcons.map((icon) => (
          <DesktopIconComponent key={icon.id} icon={icon} />
        ))}
      </div>

      <AnimatePresence>
        {windows.map((window) => {
          const WindowComponent =
            windowComponents[window.component] ?? PlaceholderWindow;
          return (
            <Window key={window.id} window={window}>
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
          className="fixed bottom-5 right-5 z-[8500] flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xl hover:bg-white/30"
          onClick={handleStartTour}
        >
          <HelpCircle className="size-3.5" />
          Take the tour
        </button>
      )}

      <Dock />
      <Spotlight
        open={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </div>
  );
}
