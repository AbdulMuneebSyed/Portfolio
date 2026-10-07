"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { spaceOf, useWindowManager } from "@/lib/window-manager";
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
import { notify } from "@/lib/notifications";
import { NotificationBanners } from "./mac/notification-banners";
import { ContextMenu } from "./context-menu";
import { MenuBar } from "./mac/menu-bar";
import { Dock } from "./mac/dock";
import { MobileHome } from "./mobile-home";
import {
  PHONE_QUERY,
  phoneApp,
  phoneTitle,
  switcherSlots,
  usePhone,
  useSwitcherPan,
} from "@/lib/phone";
import { PhoneAppIcon } from "@/lib/app-icons";
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
  const spaces = useWindowManager((state) => state.spaces);
  const activeSpaceId = useWindowManager((state) => state.activeSpaceId);
  // Desktops are a Mac feature; the phone layout shows everything.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const update = () => setWide(innerWidth >= 700);
    update();
    addEventListener("resize", update);
    return () => removeEventListener("resize", update);
  }, []);
  const onThisSpace = (item: { spaceId?: string }) =>
    !wide || spaceOf(item, spaces) === activeSpaceId;

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
  const [showTourButton, setShowTourButton] = useState(true);
  const missionOpen = useMissionControl((state) => state.open);
  const missionDrag = useMissionControl((state) => state.drag);
  const setMissionOpen = useMissionControl((state) => state.setOpen);
  const [band, setBand] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
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
    if (innerWidth < 700) return;
    try {
      if (localStorage.getItem("muneebos-spaces-tip")) return;
    } catch {
      return;
    }
    const id = setTimeout(() => {
      localStorage.setItem("muneebos-spaces-tip", "shown");
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
    if (localStorage.getItem("hasVisitedPortfolio") === null) {
      setShowTourButton(true);
      // Marked as visited only once the welcome actually shows.
      const id = setTimeout(() => {
        localStorage.setItem("hasVisitedPortfolio", "true");
        // A phone greets with its welcome sheet, the Mac with a banner.
        if (matchMedia(PHONE_QUERY).matches) {
          setIsTourRunning(true);
          return;
        }
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
      if (
        e.ctrlKey &&
        !e.metaKey &&
        innerWidth >= 700 &&
        (key === "arrowleft" || key === "arrowright" || /^[1-6]$/.test(key))
      ) {
        // Ctrl+←/→ moves between desktops; Ctrl+1…6 jumps to one.
        e.preventDefault();
        const { spaces, activeSpaceId, switchSpace } = wm;
        const index = spaces.indexOf(activeSpaceId);
        const target = /^[1-6]$/.test(key)
          ? spaces[Number(key) - 1]
          : spaces[index + (key === "arrowright" ? 1 : -1)];
        if (target) switchSpace(target);
      } else if ((e.ctrlKey && key === "arrowup") || key === "f3") {
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
        const visible = wm.windows.filter(
          (w) =>
            !w.isMinimized &&
            (innerWidth < 700 || spaceOf(w, wm.spaces) === wm.activeSpaceId),
        );
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

  // Two-finger swipe up on the empty desktop opens Mission Control; swipe
  // down anywhere closes it. Swipes over a window scroll the window.
  useEffect(() => {
    const detect = createSwipeDetector();
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || innerWidth < 700) return; // ctrl+wheel is pinch-zoom
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
    setShowTourButton(true);
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourRunning(true);
    setShowTourButton(false);
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

  // Opening or closing a window leaves Mission Control. The iPhone App
  // Switcher stays open while cards are swiped away, until none are left.
  const phone = usePhone();
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
    typeof window === "undefined" ? 393 : innerWidth,
    typeof window === "undefined" ? 852 : innerHeight,
    switcherPan,
  );
  switcherOrder.forEach((w, i) => missionSlots.set(w.id, switcherCards[i]));
  if (missionOpen && !phone && typeof window !== "undefined") {
    const visible = windows
      .filter((w) => !w.isMinimized && onThisSpace(w))
      .sort((a, b) => a.zIndex - b.zIndex);
    // Leave room at the top for the strip of desktops.
    const barHeight = Math.round((168 * innerHeight) / innerWidth) + 52;
    const slots = missionLayout(visible.length, {
      x: 40,
      y: MENU_BAR_HEIGHT + barHeight + 16,
      width: innerWidth - 80,
      height:
        innerHeight - MENU_BAR_HEIGHT - barHeight - DOCK_RESERVED_HEIGHT - 36,
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

        <MenuBar
          onOpenSpotlight={openSpotlight}
          onStartTour={handleStartTour}
          onLock={onLock}
          onRestart={handleRestart}
        />

        <MobileHome
          appOpen={mobileAppOpen}
          darkApp={mobileAppDark}
          onHome={goMobileHome}
          onSearch={openSpotlight}
          onSwitcher={() => setMissionOpen(true)}
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
          {desktopIcons.filter(onThisSpace).map((icon) => (
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
            const top = card.cy - (card.maxWidth * innerHeight) / innerWidth / 2 - 34;
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
          {missionOpen && wide && (
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
                offSpace={!onThisSpace(window)}
                mission={missionSlots.get(window.id) ?? null}
                onMissionSelect={() => {
                  const wm = useWindowManager.getState();
                  if (window.isMinimized) wm.restoreWindow(window.id);
                  wm.setActiveWindow(window.id);
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
