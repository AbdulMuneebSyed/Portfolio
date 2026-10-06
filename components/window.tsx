"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Maximize2, ChevronLeft } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { DOCK_RESERVED_HEIGHT, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import type { WindowState } from "@/lib/types";
import { mobileAppTitle } from "@/lib/mobile-app-titles";

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
  onHome,
}: {
  window: WindowState;
  children: ReactNode;
  mission?: MissionSlot | null;
  onMissionSelect?: () => void;
  onHome?: () => void;
}) {
  const wm = useWindowManager();
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
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
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
  useEffect(() => {
    const resize = () =>
      setViewport({ width: innerWidth, height: innerHeight });
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, []);
  const compact =
    viewport.width < 700 || (viewport.width < 950 && viewport.height < 500);
  const availableHeight = compact
    ? Math.max(180, viewport.height - 44)
    : Math.max(180, viewport.height - MENU_BAR_HEIGHT - DOCK_RESERVED_HEIGHT);
  const width = Math.min(win.size.width, viewport.width - 16);
  const height = Math.min(win.size.height, availableHeight - 8);
  const left = Math.max(
    8,
    Math.min(win.position.x, viewport.width - width - 8),
  );
  const top = Math.max(
    MENU_BAR_HEIGHT + 4,
    Math.min(win.position.y, viewport.height - DOCK_RESERVED_HEIGHT - height),
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
  const hidden = win.isMinimized || (compact && !win.isActive);
  useEffect(() => {
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
        x: Math.max(8, Math.min(g.left + dx, viewport.width - g.width - 8)),
        y: Math.max(
          MENU_BAR_HEIGHT + 4,
          Math.min(
            g.top + dy,
            viewport.height - DOCK_RESERVED_HEIGHT - g.height,
          ),
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
    y: expanded ? (compact ? 44 : MENU_BAR_HEIGHT) : top,
    width: expanded ? viewport.width : width,
    height: expanded ? availableHeight : height,
  };
  const centerX = frameBox.x + frameBox.width / 2;
  const centerY = frameBox.y + frameBox.height / 2;
  let target;
  if (win.isMinimized) {
    // Scale effect: the window shrinks into its Dock icon.
    const icon =
      typeof document === "undefined"
        ? null
        : document.getElementById(`dock-item-${win.appId ?? win.id}`);
    const box = icon?.getBoundingClientRect();
    target = {
      opacity: 0,
      x: box ? box.left + box.width / 2 - centerX : 0,
      y: box ? box.top + box.height / 2 - centerY : 80,
      scale: box ? Math.max(0.04, box.width / frameBox.width) : 0.7,
      transitionEnd: { display: "none" },
      transition: {
        default: { duration: 0.42, ease: [0.5, 0, 0.75, 0.25] },
        opacity: { duration: 0.42, ease: [0.9, 0, 1, 1] },
      },
    };
  } else if (mission) {
    target = {
      opacity: 1,
      display: "flex",
      x: mission.cx - centerX,
      y: mission.cy - centerY,
      scale: Math.min(
        1,
        mission.maxWidth / frameBox.width,
        mission.maxHeight / frameBox.height,
      ),
      transition: { type: "spring", stiffness: 260, damping: 30 },
    };
  } else {
    target = {
      opacity: 1,
      display: "flex",
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
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
        title="Close (⌘W)"
        onClick={() => wm.closeWindow(win.id)}
      >
        <X />
      </button>
      <button
        className="traffic-light minimize"
        aria-label="Minimize"
        title="Minimize (⌘M)"
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
        role="region"
        aria-hidden={hidden}
        aria-label={`${win.title} window`}
        data-app={win.appId ?? win.id}
        data-active={win.isActive}
        data-chrome={chrome}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={target}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
        className={`mac-window absolute flex flex-col overflow-hidden ${expanded ? "rounded-none" : "rounded-[16px]"}`}
        style={{
          left: expanded ? 0 : left,
          top: expanded ? (compact ? 44 : MENU_BAR_HEIGHT) : top,
          width: expanded ? viewport.width : width,
          height: expanded ? availableHeight : height,
          zIndex: win.zIndex,
          transition:
            animateFrame && !reduceMotion
              ? `left 0.3s ${FRAME_EASE}, top 0.3s ${FRAME_EASE}, width 0.3s ${FRAME_EASE}, height 0.3s ${FRAME_EASE}`
              : undefined,
          pointerEvents: hidden ? "none" : undefined,
          visibility: compact && !win.isActive ? "hidden" : undefined,
        }}
        onPointerDownCapture={() => {
          if (!win.isActive) wm.setActiveWindow(win.id);
        }}
        onContextMenu={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="ios-app-header">
          <button onClick={onHome} aria-label="Back to Home Screen">
            <ChevronLeft size={21} /> Home
          </button>
          <strong>{mobileAppTitle(win.appId ?? win.id, win.title)}</strong>
          <span aria-hidden="true" />
        </div>
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
        {mission && (
          <button
            className="mission-pick absolute inset-0 z-[60] rounded-[inherit]"
            aria-label={`Show ${win.title}`}
            onClick={onMissionSelect}
          />
        )}
      </motion.div>
    </>
  );
}
