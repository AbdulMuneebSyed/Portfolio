import { useRef, useState, type PointerEvent } from "react";

// A finger swipe on a card: up dismisses a banner, left clears a
// notification in a list. With `onPull`, dragging the other way (down for a
// banner) rubber-bands with a slight stretch and opens it past
// PULL_THRESHOLD, like pulling down an iOS banner.
// It moves the card with plain CSS on an inner element, so the outer
// motion.div's exit animation owns its own transform. (framer-motion's
// `drag` snaps back on release and cancels the exit, which left invisible
// cards holding their space in the stack.)
const PULL_THRESHOLD = 50;
const PULL_MAX = 56; // the furthest the rubber band lets the card travel

export function useSwipeDismiss(
  axis: "x" | "y",
  onDismiss: () => void,
  { onPull, threshold = axis === "y" ? 24 : 80 }: { onPull?: () => void; threshold?: number } = {},
) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [offset, setOffset] = useState(0);

  // Towards the dismiss side it follows the finger; the other way it
  // resists, more so the further it goes.
  const clamp = (d: number) => {
    if (d <= 0) return d;
    if (!onPull) return d * 0.1;
    return PULL_MAX * (1 - Math.exp(-d / 110));
  };
  const distance = (e: PointerEvent<HTMLElement>, from: { x: number; y: number }) =>
    axis === "y" ? e.clientY - from.y : e.clientX - from.x;
  const stretch = onPull && offset > 0 ? 1 + offset / 900 : 1;

  return {
    // True right after a swipe, so the card's click doesn't also open it.
    wasSwiped: () => {
      const value = swiped.current;
      swiped.current = false;
      return value;
    },
    props: {
      style: {
        transform: `translate${axis.toUpperCase()}(${offset}px) scale(${stretch})`,
        transformOrigin: "top center",
        transition: start.current ? "none" : "transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        touchAction: axis === "y" ? "pan-x" : "pan-y",
      },
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        e.stopPropagation();
        start.current = { x: e.clientX, y: e.clientY };
        swiped.current = false;
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        if (!start.current) return;
        const d = distance(e, start.current);
        if (Math.abs(d) > 6 && !e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.setPointerCapture(e.pointerId);
        setOffset(clamp(d));
      },
      onPointerUp: (e: PointerEvent<HTMLElement>) => {
        if (!start.current) return;
        const d = distance(e, start.current);
        start.current = null;
        if (Math.abs(d) > 6) swiped.current = true;
        // Dismissed, it leaves from where the finger let go.
        if (d < -threshold) return onDismiss();
        setOffset(0);
        if (onPull && d > PULL_THRESHOLD) onPull();
      },
      onPointerCancel: () => {
        start.current = null;
        setOffset(0);
      },
    },
  };
}
