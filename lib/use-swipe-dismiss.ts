import { useRef, useState, type PointerEvent } from "react";

// A finger swipe that dismisses a card: up for a banner, left for a
// notification in a list. It moves the card with plain CSS on an inner
// element, so the outer motion.div's exit animation owns its own transform.
// (framer-motion's `drag` snaps back on release and cancels the exit, which
// left invisible cards holding their space in the stack.)
export function useSwipeDismiss(
  axis: "x" | "y",
  onDismiss: () => void,
  threshold = axis === "y" ? 24 : 80,
) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [offset, setOffset] = useState(0);

  // Towards the dismiss side it follows the finger; the other way it resists.
  const clamp = (d: number) => (d < 0 ? d : d * 0.1);

  return {
    // True right after a swipe, so the card's click doesn't also open it.
    wasSwiped: () => {
      const value = swiped.current;
      swiped.current = false;
      return value;
    },
    props: {
      style: {
        transform: `translate${axis.toUpperCase()}(${offset}px)`,
        transition: start.current ? "none" : "transform 0.25s ease",
        touchAction: axis === "y" ? "pan-x" : "pan-y",
      },
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        e.stopPropagation();
        start.current = { x: e.clientX, y: e.clientY };
        swiped.current = false;
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        if (!start.current) return;
        const d = axis === "y" ? e.clientY - start.current.y : e.clientX - start.current.x;
        if (Math.abs(d) > 6 && !e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.setPointerCapture(e.pointerId);
        setOffset(clamp(d));
      },
      onPointerUp: (e: PointerEvent<HTMLElement>) => {
        if (!start.current) return;
        const d = axis === "y" ? e.clientY - start.current.y : e.clientX - start.current.x;
        start.current = null;
        if (Math.abs(d) > 6) swiped.current = true;
        if (d < -threshold) onDismiss();
        else setOffset(0);
      },
      onPointerCancel: () => {
        start.current = null;
        setOffset(0);
      },
    },
  };
}
