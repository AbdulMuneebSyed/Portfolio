import { create } from "zustand";
import type { WindowState, DesktopIcon } from "./types";
import {
  getApp,
  getDesktopIconsFromRegistry,
  isAppInstalled,
} from "./app-registry";
import { DEFAULT_WALLPAPER } from "@/lib/wallpapers";
import { GRID_CELL_HEIGHT, gridCell, nearestFreeCell } from "./desktop-grid";

interface WindowManagerState {
  windows: WindowState[];
  nextZIndex: number;
  nextProcessId: number;
  activeWindowId: string | null;
  desktopIcons: DesktopIcon[];
  isShutdown: boolean;
  wallpaper: string;
  taskbarTransparency: number;
  aeroEffects: boolean;

  openWindow: (window: Omit<WindowState, "zIndex" | "isActive">) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string, options?: { hide?: boolean }) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number },
  ) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  resetIconPositions: () => void;
  shutdown: () => void;
  restart: () => void;
  setWallpaper: (wallpaper: string) => void;
  setTaskbarTransparency: (transparency: number) => void;
  setAeroEffects: (enabled: boolean) => void;
  loadState: () => void;
  saveState: () => void;

  // Desktops (Spaces). Every window and desktop file belongs to one.
  spaces: string[];
  activeSpaceId: string;
  nextSpaceNumber: number;
  addSpace: () => string | null;
  removeSpace: (id: string) => void;
  switchSpace: (id: string) => void;
  moveWindowToSpace: (windowId: string, spaceId: string) => void;
  moveIconsToSpace: (iconIds: string[], spaceId: string) => void;

  // Desktop folders and Trash.
  trash: DesktopIcon[];
  renamingIconId: string | null;
  createFolder: (near?: { x: number; y: number }) => string;
  renameIcon: (id: string, title: string) => void;
  setRenamingIcon: (id: string | null) => void;
  trashIcons: (ids: string[]) => void;
  putBack: (ids: string[]) => void;
  emptyTrash: () => void;
}

export const MAX_SPACES = 6;
let folderCount = 0;
const FIRST_SPACE = "space-1";

// The desktop a window or file is on; unknown or missing ids mean the first.
export function spaceOf(
  item: { spaceId?: string },
  spaces: string[],
): string {
  return item.spaceId && spaces.includes(item.spaceId)
    ? item.spaceId
    : spaces[0];
}

// Desktop files sit in a container under the menu bar, anchored top-right.
function iconBounds() {
  if (typeof window === "undefined") return { width: 1200, height: 700 };
  return {
    width: Math.max(200, window.innerWidth - 16),
    height: Math.max(200, window.innerHeight - 24 - 96),
  };
}

function freeCellFor(
  icons: DesktopIcon[],
  spaces: string[],
  spaceId: string,
  near: { x: number; y: number },
  except?: string,
) {
  const occupied = icons
    .filter((i) => i.id !== except && spaceOf(i, spaces) === spaceId)
    .map((i) => i.position);
  return nearestFreeCell(near, occupied, iconBounds());
}

// The front window of a desktop, to activate after switching to it.
function frontWindowIn(windows: WindowState[], spaces: string[], spaceId: string) {
  return (
    [...windows]
      .filter((w) => !w.isMinimized && spaceOf(w, spaces) === spaceId)
      .sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null
  );
}

const DESKTOP_LAYOUT_VERSION = 5;
const DEFAULT_ICONS: DesktopIcon[] = getDesktopIconsFromRegistry();

function estimateMemoryMb(component: string, id: string) {
  const seed = `${component}:${id}`
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return 42 + (seed % 96);
}

function serializeWindows(windows: WindowState[]) {
  return windows.map((window) => ({
    id: window.id,
    processId: window.processId,
    appId: window.appId,
    title: window.title,
    icon: window.icon,
    component: window.component,
    status: window.status,
    startedAt: window.startedAt,
    lastActiveAt: window.lastActiveAt,
    memoryMb: window.memoryMb,
    isMinimized: window.isMinimized,
    isHidden: window.isHidden,
    isMaximized: window.isMaximized,
    position: window.position,
    size: window.size,
    disableMaximize: window.disableMaximize,
    metadata: window.metadata,
    spaceId: window.spaceId,
  }));
}

function mergeSavedDesktopIcons(savedIcons: DesktopIcon[]) {
  const savedById = new Map(savedIcons.map((icon) => [icon.id, icon]));
  const defaultIds = new Set(DEFAULT_ICONS.map((icon) => icon.id));

  const mergedDefaults = DEFAULT_ICONS.map((defaultIcon) => {
    const savedIcon = savedById.get(defaultIcon.id);
    return savedIcon?.position
      ? {
          ...defaultIcon,
          position: savedIcon.position,
          spaceId: savedIcon.spaceId,
        }
      : defaultIcon;
  });

  const customIcons = savedIcons.filter((icon) => !defaultIds.has(icon.id));
  return [...mergedDefaults, ...customIcons];
}

let pendingSave: ReturnType<typeof setTimeout> | null = null;
let flushHooked = false;

function flushState() {
  if (pendingSave) clearTimeout(pendingSave);
  pendingSave = null;
  writeState(useWindowManager.getState());
}

function writeState(state: WindowManagerState) {
  const stateToSave = {
    desktopIcons: state.desktopIcons,
    desktopLayoutVersion: DESKTOP_LAYOUT_VERSION,
    windows: serializeWindows(state.windows),
    nextProcessId: state.nextProcessId,
    wallpaper: state.wallpaper,
    taskbarTransparency: state.taskbarTransparency,
    aeroEffects: state.aeroEffects,
    spaces: state.spaces,
    activeSpaceId: state.activeSpaceId,
    nextSpaceNumber: state.nextSpaceNumber,
    trash: state.trash,
  };

  localStorage.setItem("muneebos-mac-state-v2", JSON.stringify(stateToSave));
}

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  nextProcessId: 1000,
  activeWindowId: null,
  desktopIcons: DEFAULT_ICONS,
  isShutdown: false,
  wallpaper: DEFAULT_WALLPAPER,
  taskbarTransparency: 85,
  aeroEffects: true,
  spaces: [FIRST_SPACE],
  activeSpaceId: FIRST_SPACE,
  nextSpaceNumber: 2,
  trash: [],
  renamingIconId: null,
  loadState: () => {
    if (typeof window === "undefined") return;
    // A save still waiting would be older than what's on screen.
    if (pendingSave) flushState();

    const savedState = localStorage.getItem("muneebos-mac-state-v2");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const savedIcons =
          Array.isArray(parsed.desktopIcons) &&
          parsed.desktopLayoutVersion === DESKTOP_LAYOUT_VERSION
            ? parsed.desktopIcons
            : DEFAULT_ICONS;
        // Drop windows of apps that no longer exist in the registry or
        // were uninstalled in the App Store.
        const savedWindows = Array.isArray(parsed.windows)
          ? (parsed.windows as WindowState[]).filter(
              (window) =>
                !window.appId ||
                (getApp(window.appId) && isAppInstalled(window.appId)),
            )
          : [];
        const nextProcessId = savedWindows.reduce(
          (nextId, window) => Math.max(nextId, (window.processId ?? 999) + 1),
          parsed.nextProcessId ?? 1000,
        );
        const spaces =
          Array.isArray(parsed.spaces) &&
          parsed.spaces.length &&
          parsed.spaces.every((id: unknown) => typeof id === "string")
            ? (parsed.spaces as string[]).slice(0, MAX_SPACES)
            : [FIRST_SPACE];
        set({
          spaces,
          activeSpaceId: spaces.includes(parsed.activeSpaceId)
            ? parsed.activeSpaceId
            : spaces[0],
          nextSpaceNumber: Math.max(
            parsed.nextSpaceNumber ?? 2,
            ...spaces.map((id) => Number(id.split("-")[1]) + 1 || 2),
          ),
          trash: Array.isArray(parsed.trash) ? parsed.trash : [],
          desktopIcons: mergeSavedDesktopIcons(savedIcons),
          windows: savedWindows.map((window, index) => ({
            ...window,
            isActive: false,
            zIndex: 100 + index,
            status: window.isMinimized ? "minimized" : "running",
          })),
          nextZIndex: 100 + savedWindows.length,
          nextProcessId,
          activeWindowId: null,
          wallpaper: parsed.wallpaper || get().wallpaper,
          taskbarTransparency: parsed.taskbarTransparency ?? 85,
          aeroEffects: parsed.aeroEffects ?? true,
        });
      } catch (e) {
        console.error("Failed to load window state:", e);
      }
    }
  },

  // Batched: actions fire on every pointermove of a drag, and writing the
  // whole desktop to localStorage each time stalls animations. Saved a beat
  // later, or straight away when the page is hidden or closed.
  saveState: () => {
    if (typeof window === "undefined") return;
    if (typeof document === "undefined") return writeState(get());
    if (pendingSave) return;
    pendingSave = setTimeout(flushState, 300);
    if (!flushHooked) {
      flushHooked = true;
      addEventListener("pagehide", flushState);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushState();
      });
    }
  },

  // Clean Up: line the current desktop's files up in columns from the
  // top-right, keeping their order.
  resetIconPositions: () => {
    const { desktopIcons, spaces, activeSpaceId } = get();
    const rows = Math.max(1, Math.floor(iconBounds().height / GRID_CELL_HEIGHT));
    let slot = 0;
    set({
      desktopIcons: desktopIcons.map((icon) => {
        if (spaceOf(icon, spaces) !== activeSpaceId) return icon;
        const position = gridCell(Math.floor(slot / rows), slot % rows);
        slot += 1;
        return { ...icon, position };
      }),
    });
    get().saveState();
  },

  updateIconPosition: (id, position) => {
    set((state) => ({
      desktopIcons: state.desktopIcons.map((icon) =>
        icon.id === id ? { ...icon, position } : icon,
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

  openWindow: (window) => {
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
                  metadata: window.metadata ?? w.metadata,
                  isMinimized: false,
                  isActive: true,
                  status: "running",
                  lastActiveAt: new Date().toISOString(),
                  zIndex: state.nextZIndex,
                }
              : { ...w, isActive: false },
          ),
          nextZIndex: state.nextZIndex + 1,
          activeWindowId: window.id,
          // A window on another desktop brings you to that desktop.
          activeSpaceId: spaceOf(existingWindow, state.spaces),
        };
      }

      const app = getApp(window.id);
      const now = new Date().toISOString();
      // Create new window
      return {
        windows: [
          ...state.windows.map((w) => ({ ...w, isActive: false })),
          {
            ...window,
            appId: app?.id ?? window.id,
            processId: state.nextProcessId,
            status: "running",
            startedAt: now,
            lastActiveAt: now,
            memoryMb: estimateMemoryMb(window.component, window.id),
            spaceId: state.activeSpaceId,
            zIndex: state.nextZIndex,
            isActive: true,
          },
        ],
        nextZIndex: state.nextZIndex + 1,
        nextProcessId: state.nextProcessId + 1,
        activeWindowId: window.id,
      };
    });
    get().saveState();
  },

  closeWindow: (id) => {
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== id);
      const next =
        state.activeWindowId === id
          ? frontWindowIn(remaining, state.spaces, state.activeSpaceId)
          : state.activeWindowId;
      return {
        windows: remaining.map((w) => ({ ...w, isActive: w.id === next })),
        activeWindowId: next,
      };
    });
    get().saveState();
  },

  minimizeWindow: (id, options) => {
    set((state) => {
      const next =
        state.activeWindowId === id
          ? frontWindowIn(
              state.windows.filter((w) => w.id !== id),
              state.spaces,
              state.activeSpaceId,
            )
          : state.activeWindowId;
      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                isMinimized: true,
                isHidden: !!options?.hide,
                isActive: false,
                status: "minimized" as const,
              }
            : { ...w, isActive: w.id === next },
        ),
        activeWindowId: next,
      };
    });
    get().saveState();
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w,
      ),
    }));
    get().saveState();
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMinimized: false,
              isHidden: false,
              isActive: true,
              status: "running",
              lastActiveAt: new Date().toISOString(),
              zIndex: state.nextZIndex,
            }
          : { ...w, isActive: false },
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
      activeSpaceId: (() => {
        const target = state.windows.find((w) => w.id === id);
        return target ? spaceOf(target, state.spaces) : state.activeSpaceId;
      })(),
    }));
    get().saveState();
  },

  setActiveWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isActive: true,
              status: w.isMinimized ? "minimized" : "running",
              lastActiveAt: new Date().toISOString(),
              zIndex: state.nextZIndex,
            }
          : { ...w, isActive: false },
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
      activeSpaceId: (() => {
        const target = state.windows.find((w) => w.id === id);
        return target ? spaceOf(target, state.spaces) : state.activeSpaceId;
      })(),
    }));
    get().saveState();
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
    get().saveState();
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
    get().saveState();
  },
  addSpace: () => {
    const { spaces, nextSpaceNumber } = get();
    if (spaces.length >= MAX_SPACES) return null;
    const id = `space-${nextSpaceNumber}`;
    set({ spaces: [...spaces, id], nextSpaceNumber: nextSpaceNumber + 1 });
    get().saveState();
    return id;
  },

  // Its windows and files move to the desktop before it (or after, for
  // the first), like macOS.
  removeSpace: (id) => {
    const { spaces, windows, desktopIcons, activeSpaceId } = get();
    const index = spaces.indexOf(id);
    if (index < 0 || spaces.length < 2) return;
    const target = spaces[index === 0 ? 1 : index - 1];
    const remaining = spaces.filter((s) => s !== id);
    let icons = desktopIcons;
    for (const icon of desktopIcons) {
      if (spaceOf(icon, spaces) !== id) continue;
      const position = freeCellFor(icons, spaces, target, icon.position, icon.id);
      icons = icons.map((i) =>
        i.id === icon.id ? { ...i, spaceId: target, position } : i,
      );
    }
    set({
      spaces: remaining,
      desktopIcons: icons,
      windows: windows.map((w) =>
        spaceOf(w, spaces) === id ? { ...w, spaceId: target } : w,
      ),
      activeSpaceId: activeSpaceId === id ? target : activeSpaceId,
    });
    if (activeSpaceId === id) get().switchSpace(target);
    get().saveState();
  },

  switchSpace: (id) => {
    const { spaces, windows } = get();
    if (!spaces.includes(id)) return;
    const front = frontWindowIn(windows, spaces, id);
    set({
      activeSpaceId: id,
      activeWindowId: front,
      windows: windows.map((w) => ({ ...w, isActive: w.id === front })),
    });
    get().saveState();
  },

  moveWindowToSpace: (windowId, spaceId) => {
    const { spaces, windows, activeSpaceId } = get();
    if (!spaces.includes(spaceId)) return;
    const moved = windows.map((w) => (w.id === windowId ? { ...w, spaceId } : w));
    const front = frontWindowIn(moved, spaces, activeSpaceId);
    set({
      windows: moved.map((w) => ({ ...w, isActive: w.id === front })),
      activeWindowId: front,
    });
    get().saveState();
  },

  moveIconsToSpace: (iconIds, spaceId) => {
    const { spaces } = get();
    if (!spaces.includes(spaceId)) return;
    let icons = get().desktopIcons;
    for (const id of iconIds) {
      const icon = icons.find((i) => i.id === id);
      if (!icon || spaceOf(icon, spaces) === spaceId) continue;
      const position = freeCellFor(icons, spaces, spaceId, icon.position, id);
      icons = icons.map((i) => (i.id === id ? { ...i, spaceId, position } : i));
    }
    set({ desktopIcons: icons });
    get().saveState();
  },

  createFolder: (near = gridCell(1, 0)) => {
    const { desktopIcons, trash, spaces, activeSpaceId } = get();
    const taken = new Set([...desktopIcons, ...trash].map((i) => i.title));
    let title = "untitled folder";
    for (let n = 2; taken.has(title); n++) title = `untitled folder ${n}`;
    const id = `folder-${Date.now().toString(36)}-${(folderCount++).toString(36)}`;
    const folderIcon: DesktopIcon = {
      id,
      title,
      icon: "/icons/mac/folder.png",
      component: "ComputerExplorer",
      kind: "folder",
      spaceId: activeSpaceId,
      position: freeCellFor(desktopIcons, spaces, activeSpaceId, near),
    };
    set({ desktopIcons: [...desktopIcons, folderIcon], renamingIconId: id });
    get().saveState();
    return id;
  },

  // Blank names are ignored; a taken name gets a number, like Finder.
  renameIcon: (id, title) => {
    const name = title.trim().replace(/[/:]/g, "-").slice(0, 60);
    const { desktopIcons, trash } = get();
    const icon = desktopIcons.find((i) => i.id === id);
    if (!icon || !name || name === icon.title) {
      set({ renamingIconId: null });
      return;
    }
    const taken = new Set(
      [...desktopIcons, ...trash].filter((i) => i.id !== id).map((i) => i.title),
    );
    let unique = name;
    for (let n = 2; taken.has(unique); n++) unique = `${name} ${n}`;
    set({
      renamingIconId: null,
      desktopIcons: desktopIcons.map((i) =>
        i.id === id ? { ...i, title: unique } : i,
      ),
    });
    get().saveState();
  },

  setRenamingIcon: (id) => set({ renamingIconId: id }),

  // Only folders the visitor made can go in the Trash; portfolio files stay.
  trashIcons: (ids) => {
    const { desktopIcons, trash, spaces } = get();
    const gone = desktopIcons.filter(
      (i) => ids.includes(i.id) && i.kind === "folder",
    );
    if (!gone.length) return;
    set({
      desktopIcons: desktopIcons.filter((i) => !gone.includes(i)),
      trash: [
        ...trash,
        ...gone.map((i) => ({ ...i, spaceId: spaceOf(i, spaces) })),
      ],
    });
    get().saveState();
  },

  putBack: (ids) => {
    const { trash, spaces } = get();
    let icons = get().desktopIcons;
    for (const item of trash.filter((i) => ids.includes(i.id))) {
      const spaceId = spaceOf(item, spaces);
      const position = freeCellFor(icons, spaces, spaceId, item.position);
      icons = [...icons, { ...item, spaceId, position }];
    }
    set({ desktopIcons: icons, trash: trash.filter((i) => !ids.includes(i.id)) });
    get().saveState();
  },

  emptyTrash: () => {
    set({ trash: [] });
    get().saveState();
  },

}));

// App menu › Hide Others (⌥⇧H): hides every other visible window on the
// current desktop, leaving the front one.
export function hideOtherWindows() {
  const { windows, activeWindowId, spaces, activeSpaceId, minimizeWindow } =
    useWindowManager.getState();
  windows
    .filter(
      (w) =>
        w.id !== activeWindowId &&
        !w.isMinimized &&
        spaceOf(w, spaces) === activeSpaceId,
    )
    .forEach((w) => minimizeWindow(w.id, { hide: true }));
}
