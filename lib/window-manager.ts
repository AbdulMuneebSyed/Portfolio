import { create } from "zustand";
import type { WindowState, DesktopIcon } from "./types";
import Image from "next/image";
import foldericon from "../public/folder.png";
import computericon from "../public/thispc.png";
import recyclebinicon from "../public/rycyclebin.png";
import resumeicon from "../public/pdf.png";
import linkedinicon from "../public/linkedin.png";
import gamesicon from "../public/games.png";
import ieicon from "../public/internet_explorer.png";
import settingsicon from "../public/settings.png";
import feedbackicon from "../public/contact.png"; // Using contact icon for feedback
import calcicon from "../public/calc.png";

interface WindowManagerState {
  windows: WindowState[];
  nextZIndex: number;
  activeWindowId: string | null;
  desktopIcons: DesktopIcon[];
  isShutdown: boolean;
  wallpaper: string;
  taskbarTransparency: number;
  aeroEffects: boolean;

  openWindow: (window: Omit<WindowState, "zIndex" | "isActive">) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number }
  ) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  shutdown: () => void;
  restart: () => void;
  setWallpaper: (wallpaper: string) => void;
  setTaskbarTransparency: (transparency: number) => void;
  setAeroEffects: (enabled: boolean) => void;
  loadState: () => void;
  saveState: () => void;
}

const DEFAULT_ICONS: DesktopIcon[] = [
  {
    id: "computer",
    title: "Computer",
    icon: computericon,
    component: "ComputerExplorer",
    position: { x: 20, y: 20 },
  },
  {
    id: "resume",
    title: "Resume",
    icon: resumeicon,
    component: "ResumeWindow",
    position: { x: 20, y: 120 },
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    icon: linkedinicon,
    component: "PlaceholderWindow", // Not used since it opens in new tab
    position: { x: 20, y: 220 },
  },
  {
    id: "recycle",
    title: "Recycle Bin",
    icon: recyclebinicon,
    component: "RecycleBin",
    position: { x: 20, y: 320 },
  },
  {
    id: "ie",
    title: "Internet Explorer",
    icon: ieicon,
    component: "InternetExplorer",
    position: { x: 20, y: 420 },
  },
  {
    id: "feedback",
    title: "Reviews & Bugs",
    icon: feedbackicon,
    component: "FeedbackWindow",
    position: { x: 120, y: 20 },
  },
  {
    id: "settings",
    title: "Control Panel",
    icon: settingsicon,
    component: "SettingsWindow",
    position: { x: 120, y: 120 },
  },
];

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  activeWindowId: null,
  desktopIcons: DEFAULT_ICONS,
  isShutdown: false,
  wallpaper: "url(https://wparena.com/wp-content/uploads/2009/09/img0.jpg)",
  taskbarTransparency: 85,
  aeroEffects: true,
  loadState: () => {
    if (typeof window === "undefined") return;

    const savedState = localStorage.getItem("win7-desktop-state-v4");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        set({
          desktopIcons: parsed.desktopIcons || DEFAULT_ICONS,
          isShutdown: parsed.isShutdown || false,
          wallpaper: parsed.wallpaper || get().wallpaper,
          taskbarTransparency: parsed.taskbarTransparency ?? 85,
          aeroEffects: parsed.aeroEffects ?? true,
        });
      } catch (e) {
        console.error("[v0] Failed to load state:", e);
      }
    }
  },

  saveState: () => {
    if (typeof window === "undefined") return;

    const state = get();
    const stateToSave = {
      desktopIcons: state.desktopIcons,
      isShutdown: state.isShutdown,
      wallpaper: state.wallpaper,
      taskbarTransparency: state.taskbarTransparency,
      aeroEffects: state.aeroEffects,
    };

    localStorage.setItem("win7-desktop-state-v4", JSON.stringify(stateToSave));
  },

  updateIconPosition: (id, position) => {
    set((state) => ({
      desktopIcons: state.desktopIcons.map((icon) =>
        icon.id === id ? { ...icon, position } : icon
      ),
    }));
    get().saveState();
  },

  shutdown: () => {
    set({ isShutdown: true });
    get().saveState();
  },

  restart: () => {
    set({ isShutdown: false });
    get().saveState();
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    get().saveState();
  },

  setTaskbarTransparency: (transparency) => {
    set({ taskbarTransparency: transparency });
    get().saveState();
  },

  setAeroEffects: (enabled) => {
    set({ aeroEffects: enabled });
    get().saveState();
  },

  openWindow: (window) =>
    set((state) => {
      // Check if window already exists
      const existingWindow = state.windows.find((w) => w.id === window.id);
      if (existingWindow) {
        // Restore and activate existing window
        return {
          windows: state.windows.map((w) =>
            w.id === window.id
              ? {
                  ...w,
                  isMinimized: false,
                  isActive: true,
                  zIndex: state.nextZIndex,
                }
              : { ...w, isActive: false }
          ),
          nextZIndex: state.nextZIndex + 1,
          activeWindowId: window.id,
        };
      }

      // Create new window
      return {
        windows: [
          ...state.windows.map((w) => ({ ...w, isActive: false })),
          { ...window, zIndex: state.nextZIndex, isActive: true },
        ],
        nextZIndex: state.nextZIndex + 1,
        activeWindowId: window.id,
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isActive: false } : w
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMinimized: false,
              isActive: true,
              zIndex: state.nextZIndex,
            }
          : { ...w, isActive: false }
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
    })),

  setActiveWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isActive: true, zIndex: state.nextZIndex }
          : { ...w, isActive: false }
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
    })),

  updateWindowPosition: (id, position) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    })),

  updateWindowSize: (id, size) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    })),
}));
