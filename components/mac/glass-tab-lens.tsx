"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { attachRefraction } from "@/lib/glass";

// The phone bottom bars: the one every app's Mac sidebar becomes, and the
// App Store's own. A tab is selected by data-selected or aria-pressed.
const BAR = ".mac-split > .mac-sidebar, .store-phone-tabs";
const ITEM = ".sidebar-item, .store-phone-tabs > button";
const SELECTED = ITEM.split(", ")
  .flatMap((i) => [`${i}[data-selected="true"]`, `${i}[aria-pressed="true"]`])
  .join(", ");
const SLIDE = { stiffness: 420, damping: 32, mass: 0.9 };
const FOLLOW = { stiffness: 900, damping: 48 };

// The iOS 26 tab bar's selection: a glass lens under the current tab. It
// slides to a new tab with a little overshoot. While a finger is down it
// lifts above the icons, swells, magnifies them and, on a tab bar, follows
// the finger, stretching with its speed, then settles on the nearest tab.
export function GlassTabLens({
  frame,
  tabs,
}: {
  frame: RefObject<HTMLElement | null>;
  tabs: boolean; // the sidebar is a tab bar, not a scrolling row of chips
}) {
  const [bar, setBar] = useState<HTMLElement | null>(null);
  // Tabs that fit the bar can be dragged across; chips scroll instead.
  const draggable = !!bar && (tabs || bar.matches(".store-phone-tabs"));
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(0);
  const w = useMotionValue(0);
  const sx = useSpring(x, SLIDE);
  const sw = useSpring(w, SLIDE);
  const press = useSpring(1, { stiffness: 500, damping: 26 });
  const speed = useVelocity(sx);
  // Fast moves stretch the lens along its path and thin it, like a drop.
  const scaleX = useTransform(() => press.get() * (1 + Math.min(Math.abs(speed.get()) / 2600, 0.35)));
  const scaleY = useTransform(() => press.get() * (1 - Math.min(Math.abs(speed.get()) / 6000, 0.14)));

  // The sidebar renders with the app, after the window, so watch for it.
  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    const find = () =>
      setBar(
        [...root.querySelectorAll<HTMLElement>(BAR)].find((b) => b.offsetParent !== null) ?? null,
      );
    find();
    const observer = new MutationObserver(find);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [frame]);

  // Follow the selected tab: on selection changes and resizes.
  useEffect(() => {
    if (!bar) return;
    bar.dataset.lens = "";
    const undoBend = attachRefraction(bar, { bezel: 18, strength: 28, after: "blur(5px) saturate(1.7) brightness(1.04)" });
    let first = true;
    const measure = () => {
      const item = bar.querySelector<HTMLElement>(SELECTED);
      if (!item || item.offsetParent === null) return setBox(null);
      x.set(item.offsetLeft);
      w.set(item.offsetWidth);
      if (first) {
        sx.jump(item.offsetLeft);
        sw.jump(item.offsetWidth);
        first = false;
      }
      setBox({ top: item.offsetTop, height: item.offsetHeight });
    };
    measure();
    const mutations = new MutationObserver(measure);
    mutations.observe(bar, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-selected", "aria-pressed"] });
    const resize = new ResizeObserver(measure);
    resize.observe(bar);
    return () => {
      delete bar.dataset.lens;
      undoBend();
      mutations.disconnect();
      resize.disconnect();
    };
  }, [bar, x, w, sx, sw]);

  // The lens bends what it covers once it's lifted.
  const unbend = useRef<(() => void) | undefined>(undefined);
  const lens = useCallback((el: HTMLSpanElement | null) => {
    unbend.current?.();
    unbend.current = el
      ? attachRefraction(el, { bezel: 16, strength: 34, after: "saturate(1.5) brightness(1.08)" })
      : undefined;
  }, []);

  // Press, drag and release.
  useEffect(() => {
    if (!bar) return;
    const items = () => [...bar.querySelectorAll<HTMLElement>(ITEM)].filter((i) => i.offsetParent !== null);
    const nearest = () => {
      const centre = x.get() + w.get() / 2;
      return items().reduce<HTMLElement | null>((best, item) => {
        const d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centre);
        return !best || d < Math.abs(best.offsetLeft + best.offsetWidth / 2 - centre) ? item : best;
      }, null);
    };
    let start: { x: number; id: number } | null = null;
    let dragging = false;
    let under: HTMLElement | null = null;
    const mark = (item: HTMLElement | null) => {
      if (under === item) return;
      under?.removeAttribute("data-under");
      under = item;
      under?.setAttribute("data-under", "");
    };
    const follow = (clientX: number) => {
      const left = bar.getBoundingClientRect().left;
      const max = bar.scrollWidth - w.get();
      x.set(Math.min(max, Math.max(0, clientX - left + bar.scrollLeft - w.get() / 2)));
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target as Element).closest(ITEM)) return;
      start = { x: e.clientX, id: e.pointerId };
      dragging = false;
      setPressed(true);
      press.set(draggable ? 1.22 : 1.06);
      const item = (e.target as Element).closest<HTMLElement>(ITEM);
      if (draggable && item) {
        // The lens jumps under the finger, as on iOS.
        x.set(item.offsetLeft);
        w.set(item.offsetWidth);
        follow(e.clientX);
      }
      mark(item);
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id || !draggable) return;
      if (!dragging && Math.abs(e.clientX - start.x) > 6) {
        dragging = true;
        // Captured only once it's a drag, so a plain tap still clicks.
        try {
          bar.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer is already gone */
        }
      }
      if (dragging) {
        follow(e.clientX);
        mark(nearest());
      }
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      setPressed(false);
      press.set(1);
      mark(null);
      if (dragging) {
        const target = nearest();
        if (target && !target.matches(SELECTED)) target.click();
        const item = target ?? bar.querySelector<HTMLElement>(SELECTED);
        if (item) {
          x.set(item.offsetLeft);
          w.set(item.offsetWidth);
        }
      } else {
        const item = bar.querySelector<HTMLElement>(SELECTED);
        // A tap: the click will move the selection; if it doesn't, go home.
        requestAnimationFrame(() => {
          const now = bar.querySelector<HTMLElement>(SELECTED) ?? item;
          if (now) {
            x.set(now.offsetLeft);
            w.set(now.offsetWidth);
          }
        });
      }
      dragging = false;
    };
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    return () => {
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
      mark(null);
    };
  }, [bar, draggable, x, w, press]);

  if (!bar || !box) return null;
  return createPortal(
    <motion.span
      ref={lens}
      aria-hidden="true"
      className="glass-lens"
      data-pressed={pressed || undefined}
      style={{ x: sx, width: sw, top: box.top, height: box.height, scaleX, scaleY }}
    />,
    bar,
  );
}
