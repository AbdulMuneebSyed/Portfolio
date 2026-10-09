"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { DOCK_RESERVED_HEIGHT, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import type { WindowState } from "@/lib/types";
import { launchRect, phoneApp, usePhone, useSwitcherPan } from "@/lib/phone";
import { spaceTargetAt, useMissionControl } from "@/lib/mission-control";

// Where Mission Control places this window: a centre point and a box the
// scaled-down window must fit in.
export interface MissionSlot {
  cx: number;
  cy: number;
  maxWidth: number;
  maxHeight: number;
}

type TileZone = "left" | "right" | "fill";

const FRAME_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
// How much of a window must stay on screen when it's dragged off an edge.
const GRAB_MARGIN = 80;

// Since Big Sur, an app with a toolbar has no separate title bar: the toolbar
// is the title bar and the traffic lights float over the sidebar ("unified").
// Apps without a toolbar keep a plain title bar, or none at all.
const TITLE_BARS: Partial<
  Record<string, { style: "titled" | "transparent"; title?: string }>
> = {
  TerminalWindow: { style: "titled", title: "muneeb — -zsh — 80×24" },
  Calculator: { style: "transparent" },
};
const INTERACTIVE =
  "button, input, textarea, select, a, label, [role='button'], [contenteditable='true']";

// Unified windows are dragged by the empty parts of the toolbar and of the
// sidebar's top strip, like a real title bar.
function isDragRegion(target: HTMLElement, frameTop: number, clientY: number) {
  if (target.closest(INTERACTIVE)) return false;
  if (target.closest(".mac-toolbar")) return true;
  return !!target.closest(".mac-sidebar") && clientY - frameTop < 52;
}

export function Window({
  window: win,
  children,
  mission,
  onMissionSelect,
  offSpace = false,
}: {
  window: WindowState;
  children: ReactNode;
  mission?: MissionSlot | null;
  onMissionSelect?: () => void;
  // On another desktop: kept mounted (so the app keeps its state) but hidden.
  offSpace?: boolean;
}) {
  // Actions only: subscribing to the whole store re-rendered every window on
  // any change anywhere.
  const wm = useWindowManager.getState();
  const reduceMotion = useSystemControls((s) => s.reduceMotion);
  // Zoom and tiling animate the frame; dragging and resizing never do.
  const [animateFrame, setAnimateFrame] = useState(false);
  const [tileZone, setTileZoneState] = useState<TileZone | null>(null);
  // Pointer-up can arrive before a re-render, so the zone also lives in a ref.
  const tileZoneRef = useRef<TileZone | null>(null);
  const setTileZone = (zone: TileZone | null) => {
    tileZoneRef.current = zone;
    setTileZoneState(zone);
  };
  const untiled = useRef<{ width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { width: 1200, height: 800 }
      : { width: innerWidth, height: innerHeight },
  );
  const gesture = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
    width: number;
    height: number;
    edge: string;
  } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const edgeSwipe = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const resize = () =>
      setViewport({ width: innerWidth, height: innerHeight });
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, []);
  // On a phone every app fills the screen, under the status bar.
  const compact = usePhone();
  const availableHeight = compact
    ? viewport.height
    : Math.max(180, viewport.height - MENU_BAR_HEIGHT - DOCK_RESERVED_HEIGHT);
  const width = Math.min(win.size.width, viewport.width - 16);
  const height = Math.min(win.size.height, availableHeight - 8);
  // Like macOS, a window can hang off the sides and bottom of the screen,
  // as long as enough of it stays on screen to grab it again; it never goes
  // under the menu bar, and its title bar never goes under the Dock.
  const left = Math.max(
    GRAB_MARGIN - width,
    Math.min(win.position.x, viewport.width - GRAB_MARGIN),
  );
  const top = Math.max(
    MENU_BAR_HEIGHT + 4,
    // The title bar stays above the Dock.
    Math.min(win.position.y, viewport.height - DOCK_RESERVED_HEIGHT - 32),
  );
  const expanded = compact || win.isMaximized;
  const firstZoomRender = useRef(true);
  useEffect(() => {
    if (firstZoomRender.current) {
      firstZoomRender.current = false;
      return;
    }
    setAnimateFrame(true);
    const id = setTimeout(() => setAnimateFrame(false), 320);
    return () => clearTimeout(id);
  }, [win.isMaximized]);
  const tileRect = (zone: TileZone) => {
    const tileWidth =
      zone === "fill" ? viewport.width - 16 : (viewport.width - 24) / 2;
    return {
      x: zone === "right" ? 16 + tileWidth : 8,
      y: MENU_BAR_HEIGHT + 4,
      width: Math.round(tileWidth),
      height: availableHeight - 8,
    };
  };
  // In Mission Control (the App Switcher on a phone) every card shows.
  const hidden =
    !mission && (win.isMinimized || offSpace || (compact && !win.isActive));
  // Before paint, so focus can't land in a window that's going away.
  useLayoutEffect(() => {
    if (hidden) frame.current?.setAttribute("inert", "");
    else frame.current?.removeAttribute("inert");
  }, [hidden]);

  // Like macOS, the active window takes keyboard focus: restore the control
  // that last had focus in it, else the app's own focusable root.
  const content = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!win.isActive || hidden) return;
    const id = requestAnimationFrame(() => {
      const root = content.current;
      if (!root || frame.current?.contains(document.activeElement)) return;
      const first = root.firstElementChild as HTMLElement | null;
      const target =
        lastFocused.current && root.contains(lastFocused.current)
          ? lastFocused.current
          : first && first.tabIndex >= 0
            ? first
            : root;
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [win.isActive, hidden]);

  const begin = (e: PointerEvent, edge = "move") => {
    if (expanded || e.button !== 0) return;
    e.preventDefault();
    wm.setActiveWindow(win.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    let g = { left, top, width, height };
    if (edge === "move" && untiled.current) {
      // Dragging a tiled window away restores its size under the cursor.
      const restored = untiled.current;
      const ratio = (e.clientX - left) / width;
      g = {
        left: e.clientX - ratio * restored.width,
        top,
        width: restored.width,
        height: restored.height,
      };
      untiled.current = null;
      wm.updateWindowSize(win.id, { width: g.width, height: g.height });
      wm.updateWindowPosition(win.id, { x: g.left, y: g.top });
    }
    gesture.current = { x: e.clientX, y: e.clientY, ...g, edge };
  };
  const move = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.edge === "move") {
      // Sequoia tiling: hold the window at a screen edge to preview a tile.
      setTileZone(
        compact
          ? null
          : e.clientX <= 2
            ? "left"
            : e.clientX >= viewport.width - 3
              ? "right"
              : e.clientY <= MENU_BAR_HEIGHT
                ? "fill"
                : null,
      );
      wm.updateWindowPosition(win.id, {
        x: Math.max(
          GRAB_MARGIN - g.width,
          Math.min(g.left + dx, viewport.width - GRAB_MARGIN),
        ),
        y: Math.max(
          MENU_BAR_HEIGHT + 4,
          Math.min(g.top + dy, viewport.height - DOCK_RESERVED_HEIGHT - 32),
        ),
      });
      return;
    }
    let right = g.left + g.width;
    let bottom = g.top + g.height;
    let x = g.left;
    let y = g.top;
    const minWidth = Math.min(320, viewport.width - 16);
    const minHeight = Math.min(220, availableHeight - 8);
    if (g.edge.includes("right"))
      right = Math.min(
        viewport.width - 8,
        Math.max(g.left + minWidth, right + dx),
      );
    if (g.edge.includes("left"))
      x = Math.max(8, Math.min(right - minWidth, g.left + dx));
    if (g.edge.includes("bottom"))
      bottom = Math.min(
        viewport.height - DOCK_RESERVED_HEIGHT,
        Math.max(g.top + minHeight, bottom + dy),
      );
    if (g.edge.includes("top"))
      y = Math.max(
        MENU_BAR_HEIGHT + 4,
        Math.min(bottom - minHeight, g.top + dy),
      );
    wm.updateWindowPosition(win.id, { x, y });
    wm.updateWindowSize(win.id, { width: right - x, height: bottom - y });
  };
  const end = () => {
    const g = gesture.current;
    gesture.current = null;
    const zone = tileZoneRef.current;
    if (!g || !zone) return;
    const rect = tileRect(zone);
    untiled.current = { width: g.width, height: g.height };
    setTileZone(null);
    setAnimateFrame(true);
    setTimeout(() => setAnimateFrame(false), 320);
    wm.updateWindowPosition(win.id, { x: rect.x, y: rect.y });
    wm.updateWindowSize(win.id, { width: rect.width, height: rect.height });
  };

  // The frame as laid out, used to aim the minimize and Mission Control moves.
  const frameBox = {
    x: expanded ? 0 : left,
    y: expanded ? (compact ? 0 : MENU_BAR_HEIGHT) : top,
    width: expanded ? viewport.width : width,
    height: expanded ? availableHeight : height,
  };
  const centerX = frameBox.x + frameBox.width / 2;
  const centerY = frameBox.y + frameBox.height / 2;
  // A phone shows one app at a time. Remember whether this one was on
  // screen, so going Home animates it back into its icon but no other.
  const onScreen = useRef(false);
  if (compact && !win.isMinimized) onScreen.current = win.isActive;
  const closingOnPhone = win.isMinimized && onScreen.current;

  // On a phone, apps zoom out of their Home Screen icon and back into it.
  const appId = win.appId ?? win.id;
  const iconBox = compact ? launchRect(appId) : null;
  // Moves are one `transform` string, not separate x/y/scale: framer-motion
  // hands a whole transform to the compositor, so a busy main thread (React
  // committing the change that started it) can't make it stutter.
  const place = (x: number, y: number, scale: number) =>
    `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  // Scaled to the icon's width and clipped to a square, so the app grows out
  // of the icon's own shape.
  const fullClip = "inset(0px 0px 0px 0px round 0px)";
  const iconMorph = (box: DOMRect | null) => {
    if (!box) return { transform: place(0, 40, 0.86), clipPath: fullClip };
    const scale = box.width / frameBox.width;
    const crop = Math.max(0, (frameBox.height - frameBox.width) / 2);
    const radius = (box.width * 0.2237) / scale;
    return {
      transform: place(
        box.left + box.width / 2 - centerX,
        box.top + box.height / 2 - centerY,
        scale,
      ),
      clipPath: `inset(${crop}px 0px ${crop}px 0px round ${radius}px)`,
    };
  };
  // Where a minimized window flies: its own spot at the end of the Dock,
  // which only exists once this render commits, so it is measured in a
  // layout effect (before the frame is painted) and the flight starts then.
  const [dockTarget, setDockTarget] = useState<string | null>(null);
  useLayoutEffect(() => {
    if (!win.isMinimized || compact) return setDockTarget(null);
    // Hidden (not minimized), it just fades where it is.
    if (win.isHidden) return setDockTarget(place(0, 0, 0.98));
    const icon =
      document.getElementById(`dock-window-${win.id}`) ??
      document.getElementById(`dock-item-${appId}`);
    const box = icon?.getBoundingClientRect();
    setDockTarget(
      box
        ? place(
            box.left + box.width / 2 - centerX,
            box.top + box.height / 2 - centerY,
            Math.max(0.04, box.width / frameBox.width),
          )
        : place(0, 80, 0.7),
    );
    // Measured once per minimize; later renders keep the same target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.isMinimized, win.isHidden, compact]);
  // Hidden windows keep their layout (visibility, not display: none), so
  // restoring one doesn't lay out and paint the whole app on its first frame.
  // Off-space windows, and phone apps that aren't in front, hide at once.
  const shownVisibility =
    offSpace || (compact && !win.isActive && !closingOnPhone && !mission)
      ? "hidden"
      : "visible";
  const instant = { duration: 0 };
  const missionScale = mission
    ? Math.min(
        1,
        mission.maxWidth / frameBox.width,
        mission.maxHeight / frameBox.height,
      )
    : 1;
  let target;
  if (compact && mission) {
    const scale = mission.maxWidth / frameBox.width;
    target = {
      opacity: 1,
      visibility: "visible",
      transform: place(mission.cx - centerX, mission.cy - centerY, scale),
      clipPath: `inset(0px 0px 0px 0px round ${38 / scale}px)`,
      transition: {
        default: { type: "spring", stiffness: 340, damping: 34 },
        visibility: instant,
      },
    };
  } else if (compact && win.isMinimized) {
    target = {
      opacity: 0,
      ...iconMorph(iconBox),
      transitionEnd: { visibility: "hidden" },
      transition: {
        default: { type: "spring", stiffness: 460, damping: 40 },
        opacity: { duration: 0.16, delay: 0.08 },
      },
    };
  } else if (win.isMinimized && dockTarget) {
    // Scale effect: the window shrinks into its spot in the Dock. It moves
    // off at once and eases in.
    target = {
      opacity: 0,
      transform: dockTarget,
      transitionEnd: { visibility: "hidden" },
      transition: win.isHidden
        ? { duration: 0.15 }
        : {
            default: { duration: 0.3, ease: [0.3, 0.1, 0.2, 1] },
            opacity: { duration: 0.3, ease: [0.6, 0, 1, 1] },
          },
    };
  } else if (mission) {
    const scale = missionScale;
    target = {
      opacity: 1,
      visibility: "visible",
      transform: place(mission.cx - centerX, mission.cy - centerY, scale),
      transition: {
        default: { type: "spring", stiffness: 260, damping: 30 },
        visibility: instant,
      },
    };
  } else if (compact) {
    target = {
      opacity: 1,
      visibility: shownVisibility,
      transform: place(0, 0, 1),
      clipPath: fullClip,
      transition: {
        default: { type: "spring", stiffness: 300, damping: 32 },
        opacity: { duration: 0.12 },
        visibility: instant,
      },
    };
  } else {
    target = {
      opacity: 1,
      visibility: shownVisibility,
      transform: place(0, 0, 1),
      transition: {
        default: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
        visibility: instant,
      },
    };
  }

  const titleBar = TITLE_BARS[win.component];
  const chrome = titleBar?.style ?? "unified";
  const zoom = () =>
    !compact && !win.disableMaximize && wm.maximizeWindow(win.id);
  const trafficLights = (
    <div
      className="traffic-lights group z-20 flex items-center"
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button
        className="traffic-light close"
        aria-label="Close"
        title="Close (⌥W)"
        onClick={() => wm.closeWindow(win.id)}
      >
        <X />
      </button>
      <button
        className="traffic-light minimize"
        aria-label="Minimize"
        title="Minimize (⌥M)"
        onClick={() => wm.minimizeWindow(win.id)}
      >
        <Minus />
      </button>
      <button
        className="traffic-light zoom"
        aria-label="Zoom"
        title="Zoom"
        disabled={compact || win.disableMaximize}
        onClick={() => wm.maximizeWindow(win.id)}
      >
        <Maximize2 />
      </button>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {tileZone && (
          <motion.div
            key="tile-preview"
            className="tile-preview pointer-events-none fixed rounded-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, ...tileRect(tileZone) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ left: 0, top: 0, zIndex: win.zIndex - 1 }}
          />
        )}
      </AnimatePresence>
      <motion.div
        ref={frame}
        // A non-modal dialog, the role screen readers expect for a window.
        role="dialog"
        aria-modal="false"
        aria-hidden={hidden}
        aria-label={win.title}
        data-app={win.appId ?? win.id}
        data-active={win.isActive}
        data-chrome={chrome}
        data-phone-sidebar={phoneApp(appId).sidebar ?? "chips"}
        data-phone-dark={phoneApp(appId).dark || undefined}
        initial={
          compact
            ? { opacity: 0, ...iconMorph(iconBox) }
            : { opacity: 0, transform: place(0, 8, 0.97) }
        }
        animate={target}
        exit={{ opacity: 0, transform: place(0, 0, 0.97), transition: { duration: 0.18 } }}
        className={`mac-window absolute flex flex-col overflow-hidden ${expanded ? "rounded-none" : "rounded-[16px]"}`}
        style={{
          left: expanded ? 0 : left,
          top: expanded ? (compact ? 0 : MENU_BAR_HEIGHT) : top,
          width: expanded ? viewport.width : width,
          height: expanded ? availableHeight : height,
          zIndex: win.zIndex,
          transition:
            animateFrame && !reduceMotion
              ? `left 0.3s ${FRAME_EASE}, top 0.3s ${FRAME_EASE}, width 0.3s ${FRAME_EASE}, height 0.3s ${FRAME_EASE}`
              : undefined,
          pointerEvents: hidden ? "none" : undefined,
          // Mission Control's labels stay readable on a scaled-down window.
          ["--mission-inv" as string]: 1 / missionScale,
        }}
        // Promoted to its own layer only while it moves (see globals.css).
        onAnimationStart={() => {
          if (frame.current) frame.current.dataset.moving = "true";
        }}
        onAnimationComplete={() => {
          if (frame.current) delete frame.current.dataset.moving;
        }}
        onPointerDownCapture={(e: React.PointerEvent) => {
          if (!win.isActive) wm.setActiveWindow(win.id);
          // iPhone: a swipe from the left edge goes back a page.
          edgeSwipe.current =
            compact && !mission && e.clientX < 24
              ? { x: e.clientX, y: e.clientY }
              : null;
        }}
        onPointerUpCapture={(e: React.PointerEvent) => {
          const start = edgeSwipe.current;
          edgeSwipe.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (dx < 70 || Math.abs(e.clientY - start.y) > dx) return;
          const back = frame.current?.querySelector<HTMLButtonElement>(
            '.mac-toolbar [aria-label^="Back"]:not(:disabled)',
          );
          if (back && back.offsetParent) back.click();
        }}
        onContextMenu={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {chrome === "unified" ? (
          trafficLights
        ) : (
          <div
            className="mac-titlebar relative flex h-7 shrink-0 select-none items-center px-[9px]"
            onPointerDown={(e) => begin(e)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onDoubleClick={zoom}
          >
            {trafficLights}
            {chrome === "titled" && (
              <span className="pointer-events-none absolute inset-x-20 truncate text-center text-[13px] font-semibold">
                {titleBar?.title ?? win.title}
              </span>
            )}
          </div>
        )}
        <div
          ref={content}
          tabIndex={-1}
          className="mac-content min-h-0 flex-1 overflow-auto outline-none"
          onFocus={(e) => {
            if (e.target !== e.currentTarget)
              lastFocused.current = e.target as HTMLElement;
          }}
          {...(chrome === "unified" && {
            onPointerDown: (e: PointerEvent) => {
              const top = frame.current?.getBoundingClientRect().top ?? 0;
              if (isDragRegion(e.target as HTMLElement, top, e.clientY))
                begin(e);
            },
            onPointerMove: move,
            onPointerUp: end,
            onPointerCancel: end,
            onDoubleClick: (e: React.MouseEvent) => {
              // Pointer capture retargets the click to this element, so look
              // up what is actually under the pointer.
              const hit = document.elementFromPoint(e.clientX, e.clientY);
              const top = frame.current?.getBoundingClientRect().top ?? 0;
              if (
                hit instanceof HTMLElement &&
                isDragRegion(hit, top, e.clientY)
              )
                zoom();
            },
          })}
        >
          {children}
        </div>
        {!expanded &&
          [
            "left",
            "right",
            "bottom",
            "top",
            "bottom-right",
            "bottom-left",
            "top-right",
            "top-left",
          ].map((edge) => (
            <div
              key={edge}
              className={`resize-handle resize-${edge}`}
              onPointerDown={(e) => begin(e, edge)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
          ))}
        {mission &&
          (compact ? (
            <SwitcherCard win={win} onSelect={onMissionSelect} />
          ) : (
            <MissionPick win={win} onSelect={onMissionSelect} />
          ))}
      </motion.div>
    </>
  );
}

// Mission Control's click target over a window. Click to pick the window;
// drag it onto a desktop in the strip to move it there (or onto + for a
// new desktop).
function MissionPick({
  win,
  onSelect,
}: {
  win: WindowState;
  onSelect?: () => void;
}) {
  const press = useRef<{ x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const dragging = useMissionControl(
    (s) => s.drag?.windowId === win.id,
  );

  const update = (x: number, y: number) =>
    useMissionControl.getState().setDrag({
      windowId: win.id,
      appId: win.appId ?? win.id,
      title: win.title,
      x,
      y,
      target: spaceTargetAt(x, y),
    });

  return (
    <button
      className="mission-pick absolute inset-0 z-[60] rounded-[inherit]"
      data-dragging={dragging}
      aria-label={`Show ${win.title}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        press.current = { x: e.clientX, y: e.clientY, dragging: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const p = press.current;
        if (!p) return;
        if (!p.dragging && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6)
          return;
        p.dragging = true;
        update(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        const p = press.current;
        press.current = null;
        if (!p?.dragging) return;
        suppressClick.current = true;
        const mc = useMissionControl.getState();
        const target = mc.drag?.target;
        mc.setDrag(null);
        const wm = useWindowManager.getState();
        if (target === "new") {
          const id = wm.addSpace();
          if (id) wm.moveWindowToSpace(win.id, id);
        } else if (target) wm.moveWindowToSpace(win.id, target);
      }}
      onPointerCancel={() => {
        press.current = null;
        useMissionControl.getState().setDrag(null);
      }}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onSelect?.();
      }}
    >
      {/* Like macOS, the hovered (or focused) window shows its name. */}
      <span className="mission-title">{win.title}</span>
    </button>
  );
}

// An App Switcher card: tap to open the app, swipe it up to quit it, drag
// sideways to scroll through the cards.
function SwitcherCard({
  win,
  onSelect,
}: {
  win: WindowState;
  onSelect?: () => void;
}) {
  const press = useRef<{ x: number; y: number; pan: number; axis?: "x" | "y" } | null>(null);
  const moved = useRef(false);
  return (
    <button
      className="mission-pick switcher-card absolute inset-0 z-[60]"
      aria-label={`Open ${win.title}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY, pan: useSwitcherPan.getState().pan };
        moved.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const p = press.current;
        if (!p) return;
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        if (!p.axis && Math.hypot(dx, dy) > 8)
          p.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (p.axis === "x") useSwitcherPan.getState().setPan(p.pan + dx);
        if (p.axis) moved.current = true;
      }}
      onPointerUp={(e) => {
        const p = press.current;
        press.current = null;
        if (p?.axis === "y" && p.y - e.clientY > 80)
          useWindowManager.getState().closeWindow(win.id);
      }}
      onPointerCancel={() => {
        press.current = null;
      }}
      onClick={() => {
        if (!moved.current) onSelect?.();
        moved.current = false;
      }}
    />
  );
}
