"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  hideOtherWindows,
  spaceOf,
  useWindowManager,
} from "@/lib/window-manager";
import { SpacesBar } from "./mac/spaces-bar";
import { AppIcon } from "@/lib/app-icons";
import { useSystemControls } from "@/lib/system-controls";
import { useGlobalClickSound } from "@/hooks/use-global-click-sound";
import {
  DOCK_RESERVED_HEIGHT,
  launchApp,
  MENU_BAR_HEIGHT,
  openInAppStore,
} from "@/lib/launch-app";
import { DesktopIconComponent } from "./desktop-icon";
import { Window } from "./window";
import { useMissionControl, missionLayout } from "@/lib/mission-control";
import { createSwipeDetector } from "@/lib/trackpad-swipe";
import { useDesktopSelection } from "@/lib/desktop-selection";
import { notify, useNotifications } from "@/lib/notifications";
import { startNotificationFeed } from "@/lib/notification-scheduler";
import { NotificationBanners } from "./mac/notification-banners";
import { ContextMenu } from "./context-menu";
import { MenuBar } from "./mac/menu-bar";
import { Dock } from "./mac/dock";
import { MobileHome } from "./mobile-home";
import {
  isPhone,
  phoneApp,
  phoneTitle,
  switcherSlots,
  usePhone,
  useSwitcherPan,
  useViewport,
} from "@/lib/phone";
import { PhoneAppIcon } from "@/lib/app-icons";
import { useBackToClose } from "@/lib/use-back-to-close";
import { Spotlight } from "./mac/spotlight";
import { AppSwitcher } from "./mac/app-switcher";
import { BootScreen } from "./mac/boot-screen";
import { Tour } from "./mac/tour";
import { readString, writeString } from "@/lib/storage";
import type { DesktopIcon } from "@/lib/types";
import { isShortcut } from "@/lib/shortcuts";

// Every app's code loads on its own, so the lock screen and desktop come up
// without it; they're fetched while the visitor looks around (see
// prefetchApps) and open instantly by the time anyone clicks.
const APP_LOADERS: (() => Promise<unknown>)[] = [];
function lazyApp<P>(loader: () => Promise<React.ComponentType<P>>) {
  APP_LOADERS.push(loader);
  return dynamic(loader, { ssr: false });
}
function prefetchApps() {
  for (const load of APP_LOADERS) void load();
}
// This module loads while the lock screen is up (components/shell.tsx), so
// fetch the apps then too: by the first click every app's code is ready, and
// a window never fills in halfway through its opening animation.
if (typeof window !== "undefined") {
  const idle = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 200));
  idle(prefetchApps);
}
const ProjectsExplorer = lazyApp(() => import("./windows/projects-explorer").then((m) => m.ProjectsExplorer));
const ResumeWindow = lazyApp(() => import("./windows/resume-window").then((m) => m.ResumeWindow));
const AboutWindow = lazyApp(() => import("./windows/about-window").then((m) => m.AboutWindow));
const ContactWindow = lazyApp(() => import("./windows/contact-window").then((m) => m.ContactWindow));
const Minesweeper = lazyApp(() => import("./windows/minesweeper").then((m) => m.Minesweeper));
const Snake = lazyApp(() => import("./windows/snake").then((m) => m.Snake));
const SettingsWindow = lazyApp(() => import("./windows/settings-window").then((m) => m.SettingsWindow));
const ComputerExplorer = lazyApp(() => import("./windows/computer-explorer").then((m) => m.ComputerExplorer));
const InternetExplorer = lazyApp(() => import("./windows/internet-explorer").then((m) => m.InternetExplorer));
const Calculator = lazyApp(() => import("./windows/calculator").then((m) => m.Calculator));
const FeedbackWindow = lazyApp(() => import("./windows/feedback-window-clean").then((m) => m.FeedbackWindow));
const PixelMusicPlayer = lazyApp(() => import("./windows/modern-music-player").then((m) => m.PixelMusicPlayer));
const PhotoPreview = lazyApp(() => import("./windows/photo-preview").then((m) => m.PhotoPreview));
const Notepad = lazyApp(() => import("./windows/notepad").then((m) => m.Notepad));
const TerminalWindow = lazyApp(() => import("./windows/terminal-window").then((m) => m.TerminalWindow));
const GitHubActivityViewer = lazyApp(() => import("./windows/github-activity-viewer").then((m) => m.GitHubActivityViewer));
const RecycleBin = lazyApp(() => import("./windows/recycle-bin").then((m) => m.RecycleBin));
const TaskManagerWindow = lazyApp(() => import("./windows/task-manager-window").then((m) => m.TaskManagerWindow));

// App Store mini-apps load the first time one opens.
const MINI_APP_NAMES = [
  "Game2048",
  "TicTacToe",
  "MemoryGame",
  "Breakout",
  "WordGuess",
  "Simon",
  "TypingTest",
  "Pomodoro",
  "Sketch",
  "Piano",
  "ColorLab",
  "JsonFormatter",
];
const MINI_APP_COMPONENTS = Object.fromEntries(
  MINI_APP_NAMES.map((name) => [
    name,
    dynamic(
      () =>
        import("./windows/mini/registry").then(
          (m) => m.MINI_APP_COMPONENTS[name],
        ),
      { ssr: false },
    ),
  ]),
);

// The App Store is the largest app; load it the first time it opens.
const AppStoreWindow = dynamic(
  () =>
    import("./windows/app-store/app-store-window").then((m) => m.AppStoreWindow),
  { ssr: false },
);

function PlaceholderWindow() {
  return (
    <div className="p-8">
      <h2 className="mb-4 text-2xl font-bold">Coming Soon</h2>
      <p className="text-muted-foreground">This app isn&apos;t ready yet.</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowComponents: Record<string, React.ComponentType<any>> = {
  ...MINI_APP_COMPONENTS,
  AppStoreWindow,
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

// The desktop's files, with rubber-band selection: drag on the empty desktop
// to select. Its own component, so the band's movement doesn't re-render the
// whole Desktop. Icon positions are measured once when the drag starts, the
// band is redrawn at most once a frame, and the selection only changes when
// the set of files under the band does.
function DesktopFiles({
  filesRef,
  icons,
}: {
  filesRef: React.RefObject<HTMLDivElement>;
  icons: DesktopIcon[];
}) {
  type Box = { left: number; top: number; right: number; bottom: number };
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const drag = useRef<{
    x0: number;
    y0: number;
    rects: { id: string; box: Box }[];
    hits: string;
    frame: number;
  } | null>(null);

  const end = () => {
    if (drag.current) cancelAnimationFrame(drag.current.frame);
    drag.current = null;
    setBand(null);
  };

  // Pressing anywhere but a file deselects the files, and pressing a file
  // (without ⇧ or ⌘) leaves only that one selected. One listener for all
  // files; it runs after the pressed file's own handler.
  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const pressed = (event.target as Element).closest?.<HTMLElement>("[data-icon-id]");
      if (pressed && (event.shiftKey || event.metaKey)) return;
      const { selected, select } = useDesktopSelection.getState();
      const keep = selected.filter((id) => id === pressed?.dataset.iconId);
      if (keep.length !== selected.length) select(keep);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <>
      <div
        ref={filesRef}
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          useDesktopSelection.getState().clear();
          const rects = [
            ...e.currentTarget.querySelectorAll<HTMLElement>("[data-icon-id]"),
          ].map((el) => ({
            id: el.dataset.iconId as string,
            box: el.getBoundingClientRect(),
          }));
          drag.current = { x0: e.clientX, y0: e.clientY, rects, hits: "", frame: 0 };
          setBand({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const { clientX: x1, clientY: y1 } = e;
          cancelAnimationFrame(d.frame);
          d.frame = requestAnimationFrame(() => {
            setBand({ x0: d.x0, y0: d.y0, x1, y1 });
            const left = Math.min(d.x0, x1);
            const right = Math.max(d.x0, x1);
            const top = Math.min(d.y0, y1);
            const bottom = Math.max(d.y0, y1);
            const hits = d.rects
              .filter(
                ({ box }) =>
                  box.left < right && box.right > left && box.top < bottom && box.bottom > top,
              )
              .map(({ id }) => id);
            const key = hits.join("\n");
            if (key === d.hits) return;
            d.hits = key;
            useDesktopSelection.getState().select(hits);
          });
        }}
        onPointerUp={end}
        onPointerCancel={end}
        className="desktop-files absolute"
        style={{
          top: MENU_BAR_HEIGHT + 20,
          right: 28,
          bottom: DOCK_RESERVED_HEIGHT,
          left: 12,
        }}
      >
        {icons.map((icon) => (
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
    </>
  );
}

interface DesktopProps {
  onLock: () => void;
}

export function Desktop({ onLock }: DesktopProps) {
  useGlobalClickSound();

  const desktopIcons = useWindowManager((state) => state.desktopIcons);
  const windows = useWindowManager((state) => state.windows);
  const isShutdown = useWindowManager((state) => state.isShutdown);
  const wallpaper = useWindowManager((state) => state.wallpaper);
  const { loadState, resetIconPositions } = useWindowManager.getState();
  const aeroEffects = useWindowManager((state) => state.aeroEffects);
  const spaces = useWindowManager((state) => state.spaces);
  const activeSpaceId = useWindowManager((state) => state.activeSpaceId);
  // Desktops are a Mac feature; the phone layout shows everything.
  const phone = usePhone();
  const viewport = useViewport();
  // Mission Control or the App Switcher: bring the picked window forward.
  // Stable, so it doesn't defeat Window's memo.
  const selectFromMission = useCallback((id: string) => {
    useWindowManager.getState().restoreWindow(id);
    useMissionControl.getState().setOpen(false);
  }, []);
  const onThisSpace = (item: { spaceId?: string }) =>
    phone || spaceOf(item, spaces) === activeSpaceId;

  // Switching desktops slides the new one in and briefly shows its name.
  const [spaceSwitch, setSpaceSwitch] = useState<{
    dir: "left" | "right";
    name: string;
    key: number;
  } | null>(null);
  const previousSpace = useRef(activeSpaceId);
  useEffect(() => {
    const before = spaces.indexOf(previousSpace.current);
    previousSpace.current = activeSpaceId;
    const after = spaces.indexOf(activeSpaceId);
    if (before < 0 || before === after) return;
    setSpaceSwitch({
      dir: after > before ? "left" : "right",
      name: `Desktop ${after + 1}`,
      key: Date.now(),
    });
    const id = setTimeout(() => setSpaceSwitch(null), 1100);
    return () => clearTimeout(id);
  }, [activeSpaceId, spaces]);

  // Slide the new desktop's files and windows in from the side you're moving
  // towards. Web Animations on `translate`, so nothing remounts (a file being
  // dragged across desktops keeps its drag) and framer-motion's `transform`
  // is untouched. Runs after the windows have marked themselves inert.
  useEffect(() => {
    if (!spaceSwitch || useSystemControls.getState().reduceMotion) return;
    const from = spaceSwitch.dir === "left" ? "18vw 0" : "-18vw 0";
    const targets = [
      filesRef.current,
      ...document.querySelectorAll<HTMLElement>(".mac-window:not([inert])"),
    ];
    for (const el of targets)
      el?.animate(
        [
          { translate: from, opacity: 0.4 },
          { translate: "0 0", opacity: 1 },
        ],
        { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
  }, [spaceSwitch]);
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
  const missionOpen = useMissionControl((state) => state.open);
  const missionDrag = useMissionControl((state) => state.drag);
  const setMissionOpen = useMissionControl((state) => state.setOpen);
  const filesRef = useRef<HTMLDivElement>(null);

  // A shared App Store link (/?app=<id>) opens that product page once the
  // Mac is unlocked; the parameter is then removed from the address bar.
  useEffect(() => {
    const url = new URL(window.location.href);
    const itemId = url.searchParams.get("app");
    if (!itemId) return;
    url.searchParams.delete("app");
    window.history.replaceState(null, "", url);
    void import("@/lib/app-store/catalog").then(
      ({ getStoreItem }) => getStoreItem(itemId) && openInAppStore(itemId),
    );
  }, []);

  // Once, on a Mac-sized screen: a tip about the trackpad gestures, after
  // the welcome banner has had its turn.
  useEffect(() => {
    if (isPhone()) return;
    try {
      if (readString("muneebos-spaces-tip")) return;
    } catch {
      return;
    }
    const id = setTimeout(() => {
      writeString("muneebos-spaces-tip", "shown");
      notify({
        appId: "settings",
        title: "Try two fingers on the desktop",
        body: "Swipe up for Mission Control and more desktops; swipe left or right to switch.",
      });
    }, 20000);
    return () => clearTimeout(id);
  }, []);

  // Remember the first visit; the tour stays available without interrupting.
  useEffect(() => {
    if (readString("hasVisitedPortfolio") === null) {
      // Marked as visited only once the welcome actually shows.
      const id = setTimeout(() => {
        writeString("hasVisitedPortfolio", "true");
        // A phone greets with its welcome sheet, the Mac with a banner.
        if (isPhone()) {
          setIsTourRunning(true);
          return;
        }
        // First answer "who is this": About Me opens by itself, unless the
        // visitor already asked for something from the lock screen.
        const { windows } = useWindowManager.getState();
        if (!useNotifications.getState().pendingOpen && windows.length === 0)
          launchApp("about");
        notify({
          appId: "about",
          title: "Welcome to Muneeb OS",
          body: "Everything here is an app. Press ⌘K to search them all.",
        });
      }, 1200);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    loadState();
    loadControls();
  }, [loadState, loadControls]);

  // Notifications that drop in while the visitor looks around, and the app
  // a notification tapped on the lock screen asked for.
  useEffect(() => {
    const notifications = useNotifications.getState();
    notifications.loadNotifications();
    const appId = notifications.pendingOpen;
    const id = appId
      ? window.setTimeout(() => {
          notifications.setPendingOpen(null);
          launchApp(appId);
        }, 500)
      : undefined;
    const stopFeed = startNotificationFeed();
    return () => {
      window.clearTimeout(id);
      stopFeed();
    };
  }, []);

  // Control Center's Dark Mode applies to the whole shell (and portals).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    return () => document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    // The system shortcuts (lib/shortcuts.ts has the keys).
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const wm = useWindowManager.getState();
      const front = wm.activeWindowId;
      const run = (action: () => void) => {
        e.preventDefault();
        action();
      };
      if (isShortcut("switchDesktop", e) || isShortcut("goToDesktop", e)) {
        if (isPhone()) return;
        const { spaces, activeSpaceId, switchSpace } = wm;
        const index = spaces.indexOf(activeSpaceId);
        const target = isShortcut("goToDesktop", e)
          ? spaces[Number(e.key) - 1]
          : spaces[index + (e.key === "ArrowRight" ? 1 : -1)];
        run(() => target && switchSpace(target));
      } else if (isShortcut("missionControl", e)) {
        run(() => !isPhone() && useMissionControl.getState().toggle());
      } else if (isShortcut("spotlight", e)) {
        run(() => setIsSpotlightOpen((open) => !open));
      } else if (isShortcut("settings", e)) {
        run(() => launchApp("settings"));
      } else if (isShortcut("activityMonitor", e)) {
        run(() => launchApp("task-manager"));
      } else if (isShortcut("minimize", e) && front) {
        run(() => wm.minimizeWindow(front));
      } else if (isShortcut("hide", e) && front) {
        run(() => wm.minimizeWindow(front, { hide: true }));
      } else if (isShortcut("hideOthers", e) && front) {
        run(hideOtherWindows);
      } else if (isShortcut("close", e) && front) {
        run(() => wm.closeWindow(front));
      } else if (isShortcut("cycleWindows", e)) {
        const visible = wm.windows.filter(
          (w) =>
            !w.isMinimized &&
            (isPhone() || spaceOf(w, wm.spaces) === wm.activeSpaceId),
        );
        const index = visible.findIndex((w) => w.id === front);
        const next =
          visible[
            (index + (e.shiftKey ? visible.length - 1 : 1)) % visible.length
          ];
        run(() => next && wm.setActiveWindow(next.id));
      } else if (isShortcut("dismiss", e)) {
        useMissionControl.getState().setOpen(false);
        setContextMenu(null);
        setIsSpotlightOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Two-finger swipe up on the empty desktop opens Mission Control; swipe
  // down anywhere closes it. Swipes over a window scroll the window.
  useEffect(() => {
    const detect = createSwipeDetector();
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || isPhone()) return; // ctrl+wheel is pinch-zoom
      const target = e.target as Element | null;
      const mission = useMissionControl.getState();
      const overDesktop =
        !target?.closest(".mac-window, .mac-menubar, .mac-dock, [role='dialog'], [role='menu']");
      if (!mission.open && !overDesktop) return;
      const swipe = detect({
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaMode: e.deltaMode,
        time: e.timeStamp,
      });
      if (swipe === "up" && !mission.open) mission.setOpen(true);
      else if (swipe === "down" && mission.open) mission.setOpen(false);
      else if (swipe === "left" || swipe === "right") {
        // Fingers moving left bring in the desktop on the right, as on a Mac.
        const { spaces, activeSpaceId, switchSpace } = useWindowManager.getState();
        const target = spaces[spaces.indexOf(activeSpaceId) + (swipe === "left" ? 1 : -1)];
        if (target) switchSpace(target);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
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
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourRunning(true);
  }, []);

  const openSpotlight = useCallback(() => setIsSpotlightOpen(true), []);
  const mobileApp = windows.find((w) => w.isActive && !w.isMinimized);
  const mobileAppOpen = !!mobileApp;
  const mobileAppDark = !!(
    mobileApp && phoneApp(mobileApp.appId ?? mobileApp.id).dark
  );
  const goMobileHome = useCallback(() => {
    const manager = useWindowManager.getState();
    manager.windows
      .filter((w) => !w.isMinimized)
      .forEach((w) => manager.minimizeWindow(w.id));
    setIsSpotlightOpen(false);
  }, []);
  // On a phone the edge swipe (the browser's Back) goes Home from an app,
  // and closes Search or the App Switcher, rather than leaving the site.
  useBackToClose(phone && mobileAppOpen, goMobileHome);
  useBackToClose(phone && isSpotlightOpen, () => setIsSpotlightOpen(false));
  useBackToClose(phone && missionOpen, () => {
    goMobileHome();
    setMissionOpen(false);
  });

  // Opening or closing a window leaves Mission Control. The iPhone App
  // Switcher stays open while cards are swiped away, until none are left.
  const switcherPan = useSwitcherPan((s) => s.pan);
  const windowCount = useRef(windows.length);
  useEffect(() => {
    const closed = windows.length < windowCount.current;
    windowCount.current = windows.length;
    if (!(phone && closed && windows.length > 0)) setMissionOpen(false);
  }, [windows.length, setMissionOpen, phone]);
  useEffect(() => {
    if (missionOpen) useSwitcherPan.getState().setPan(0);
  }, [missionOpen]);

  // Mission Control slots for the visible windows, back to front.
  const missionSlots = new Map<
    string,
    ReturnType<typeof missionLayout>[number]
  >();
  // iPhone App Switcher: every app, oldest on the left, newest in the middle.
  const switcherOrder =
    phone && missionOpen ? [...windows].sort((a, b) => a.zIndex - b.zIndex) : [];
  const switcherCards = switcherSlots(
    switcherOrder.length,
    viewport.width,
    viewport.height,
    switcherPan,
  );
  switcherOrder.forEach((w, i) => missionSlots.set(w.id, switcherCards[i]));
  if (missionOpen && !phone) {
    const visible = windows
      .filter((w) => !w.isMinimized && onThisSpace(w))
      .sort((a, b) => a.zIndex - b.zIndex);
    // Leave room at the top for the strip of desktops.
    const barHeight = Math.round((168 * viewport.height) / viewport.width) + 52;
    const slots = missionLayout(visible.length, {
      x: 40,
      y: MENU_BAR_HEIGHT + barHeight + 16,
      width: viewport.width - 80,
      height:
        viewport.height - MENU_BAR_HEIGHT - barHeight - DOCK_RESERVED_HEIGHT - 36,
    });
    visible.forEach((w, i) => missionSlots.set(w.id, slots[i]));
  }

  const contextMenuItems = [
    {
      label: "New Folder",
      onClick: () => {
        // Place it where the menu was opened, in desktop-file coordinates.
        const rect = filesRef.current?.getBoundingClientRect();
        const near =
          rect && contextMenu
            ? {
                x: Math.max(0, rect.right - contextMenu.x - 48),
                y: Math.max(0, contextMenu.y - rect.top - 40),
              }
            : undefined;
        useWindowManager.getState().createFolder(near);
      },
    },
    { separator: true },
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

        {/* Each device mounts only its own shell. */}
        {!phone && (
          <MenuBar
            onOpenSpotlight={openSpotlight}
            onStartTour={handleStartTour}
            onLock={onLock}
            onRestart={handleRestart}
          />
        )}

        {phone && (
          <MobileHome
            appOpen={mobileAppOpen}
            darkApp={mobileAppDark}
            onHome={goMobileHome}
            onSearch={openSpotlight}
            onSwitcher={() => setMissionOpen(true)}
          />
        )}

        {/* Desktop files, anchored top-right */}
        <DesktopFiles
          filesRef={filesRef}
          icons={desktopIcons.filter(onThisSpace)}
        />

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
              onClick={() => {
                // On a phone, tapping outside the cards goes Home.
                if (phone) goMobileHome();
                setMissionOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* App Switcher: each card's icon and name above it. */}
        {phone &&
          missionOpen &&
          switcherOrder.map((w, i) => {
            const card = switcherCards[i];
            const top = card.cy - (card.maxWidth * viewport.height) / viewport.width / 2 - 34;
            return (
              <div
                key={w.id}
                className="switcher-label"
                style={{ left: card.cx - card.maxWidth / 2, top }}
              >
                <PhoneAppIcon appId={w.appId ?? w.id} size={26} />
                {phoneTitle(w.appId ?? w.id, w.title)}
              </div>
            );
          })}

        <AnimatePresence>
          {missionOpen && !phone && (
            <motion.div
              key="spaces-bar"
              className="fixed inset-x-0 z-[9600] flex justify-center"
              style={{ top: MENU_BAR_HEIGHT + 10 }}
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25 }}
            >
              <SpacesBar onPick={() => setMissionOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {missionDrag && (
          <div
            className="mission-drag-ghost"
            style={{ left: missionDrag.x, top: missionDrag.y }}
            aria-hidden="true"
          >
            <AppIcon appId={missionDrag.appId} size={36} />
            <span>{missionDrag.title}</span>
          </div>
        )}

        <AnimatePresence>
          {spaceSwitch && !missionOpen && (
            <motion.div
              key={spaceSwitch.key}
              className="space-hud"
              role="status"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <strong>{spaceSwitch.name}</strong>
              <span>
                {spaces.map((id) => (
                  <i key={id} data-active={id === activeSpaceId} />
                ))}
              </span>
            </motion.div>
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
                app={WindowComponent}
                offSpace={!onThisSpace(window)}
                mission={missionSlots.get(window.id) ?? null}
                onMissionSelect={selectFromMission}
              />
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

        {!isTourRunning && (
          <button
            className="tour-launcher fixed bottom-5 right-5 z-[8500] flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xl hover:bg-white/30"
            onClick={handleStartTour}
          >
            <HelpCircle className="size-3.5" />
            Take the tour
          </button>
        )}

        {!phone && <Dock />}

        <NotificationBanners />

        {!phone && <AppSwitcher />}

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
