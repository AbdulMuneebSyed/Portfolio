"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import { useGlobalClickSound } from "@/hooks/use-global-click-sound";
import { DesktopIconComponent } from "./desktop-icon";
import { Window } from "./window";
import { Taskbar } from "./taskbar";
import { ContextMenu } from "./context-menu";
import { ProjectsExplorer } from "./windows/projects-explorer";
import { ResumeWindow } from "./windows/resume-window";
import { AboutWindow } from "./windows/about-window";
import { ContactWindow } from "./windows/contact-window";
import { Minesweeper } from "./windows/minesweeper";
import { Snake } from "./windows/snake";
import { SettingsWindow } from "./windows/settings-window";
import { ComputerExplorer } from "./windows/computer-explorer";
import { InternetExplorer } from "./windows/internet-explorer";
import { Windows7Memories } from "./windows/windows7-memories";
import { Windows7Startup } from "./windows7-startup";
import { Calculator } from "./windows/calculator";
import { FeedbackWindow } from "./windows/feedback-window-clean";
import { PixelMusicPlayer } from "./windows/modern-music-player";
import { PhotoPreview } from "./windows/photo-preview";
import { Windows7Tour } from "./windows7-tour-pixel";

function PlaceholderWindow() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Recycle Bin</h2>
      <p className="text-muted-foreground">
        This window will be implemented in the next steps.
      </p>
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
  Windows7Memories,
  Calculator,
  FeedbackWindow,
  MusicPlayer: PixelMusicPlayer,
  PhotoPreview,
  RecycleBin: PlaceholderWindow,
};

export function Desktop() {
  useGlobalClickSound();

  const {
    desktopIcons,
    windows,
    openWindow,
    isShutdown,
    restart,
    wallpaper,
    loadState,
  } = useWindowManager();
  console.log("Initial wallpaper URL:", wallpaper);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isStartingUp, setIsStartingUp] = useState(false);
  const [hasPlayedStartupSound, setHasPlayedStartupSound] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);

  // Simple first visit check - start tour automatically
  useEffect(() => {
    const hasVisitedPortfolio = localStorage.getItem("hasVisitedPortfolio");
    if (hasVisitedPortfolio === null) {
      setIsTourRunning(true);
      setShowTourButton(false);
      localStorage.setItem("hasVisitedPortfolio", "true");
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (!isStartingUp && !isShutdown && !hasPlayedStartupSound) {
      try {
        const audio = new Audio("/startup.mp3");
        audio.volume = 0.7;
        audio.preload = "auto";
        console.log("Attempting to play startup sound on desktop appear...");

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(
                "Startup sound played successfully on desktop appear!"
              );
              setHasPlayedStartupSound(true);
            })
            .catch((error) => {
              console.log("Audio play failed on desktop appear:", error);
              const playOnInteraction = () => {
                audio
                  .play()
                  .then(() => {
                    console.log("Startup sound played after user interaction!");
                    setHasPlayedStartupSound(true);
                  })
                  .catch(() => {
                    console.log("Audio still failed after user interaction");
                  });
                document.removeEventListener("click", playOnInteraction);
              };
              document.addEventListener("click", playOnInteraction, {
                once: true,
              });
            });
        }
      } catch (error) {
        console.log("Audio creation failed:", error);
      }
    }
  }, [isStartingUp, isShutdown, hasPlayedStartupSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        openWindow({
          id: "win7-memories",
          title: "Windows 7 Memories",
          icon: "🎉",
          component: "Windows7Memories",
          isMinimized: false,
          isMaximized: false,
          position: { x: 150, y: 80 },
          size: { width: 900, height: 700 },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openWindow]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRestart = () => {
    setIsStartingUp(true);
    setHasPlayedStartupSound(false);
    setTimeout(() => {
      restart();
      setIsStartingUp(false);
    }, 6500);
  };

  const contextMenuItems = [
    {
      label: "View",
      disabled: true,
      submenu: [
        { label: "Large icons", disabled: true },
        { label: "Medium icons", disabled: true },
        { label: "Small icons", disabled: true },
      ],
    },
    {
      label: "Sort by",
      disabled: true,
      submenu: [
        { label: "Name", disabled: true },
        { label: "Size", disabled: true },
        { label: "Item type", disabled: true },
        { label: "Date modified", disabled: true },
      ],
    },
    { separator: true },
    {
      label: "Refresh",
      onClick: () => {
        window.location.reload();
      },
    },
    { separator: true },
    { label: "Paste", disabled: true },
    { label: "Paste shortcut", disabled: true },
    { separator: true },
    {
      label: "New",
      disabled: true,
      submenu: [
        { label: "Folder", disabled: true },
        { label: "Shortcut", disabled: true },
      ],
    },
    { separator: true },
    { label: "Screen resolution", disabled: true },
    { label: "Gadgets", disabled: true },
    { label: "Personalize", disabled: true },
  ];

  if (isShutdown) {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
        onClick={handleRestart}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleRestart();
          }
        }}
        tabIndex={0}
      >
        {isStartingUp ? (
          <Windows7Startup />
        ) : (
          <div className="text-center space-y-4">
            <div className="text-gray-400 text-sm">
              Click anywhere or press Enter to start
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleTourComplete = () => {
    setIsTourRunning(false);
    setShowTourButton(true);
  };

  const handleStartTour = () => {
    setIsTourRunning(true);
    setShowTourButton(false);
  };

  return (
    <>
      <Windows7Tour
        run={isTourRunning}
        onComplete={handleTourComplete}
        onSkip={handleTourComplete}
      />

      <div
        className="relative w-full h-screen p-2 md:p-4 bg-gradient-to-br from-[#3a6ea5] to-[#2d5a8a] overflow-hidden"
        style={{
          backgroundImage: wallpaper,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        <div
          className="w-full p-2 sm:p-3 md:p-1 flex flex-col flex-wrap content-start gap-2 sm:gap-3 md:gap-2"
          style={{
            height: "calc(100vh - 48px)",
            alignContent: "flex-start",
          }}
        >
          {desktopIcons.map((icon) => (
            <DesktopIconComponent key={icon.id} icon={icon} />
          ))}
        </div>

        {windows.map((window) => {
          const WindowComponent =
            windowComponents[window.component] || PlaceholderWindow;
          return (
            <Window key={window.id} window={window}>
              {windowComponents[window.component] ? (
                <WindowComponent {...(window.metadata || {})} />
              ) : (
                <PlaceholderWindow />
              )}
            </Window>
          );
        })}

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenuItems}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Tour Button */}
        {showTourButton && (
          <button
            className="fixed bottom-14 right-5 z-50 px-4 py-2 bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] hover:from-[#5A96C2] hover:to-[#3A7BB0] text-white rounded shadow-lg border border-[#3A7BB0]"
            onClick={handleStartTour}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
              Tour My Portfolio
            </div>
          </button>
        )}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </>
  );
}
