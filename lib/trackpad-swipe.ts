// Two-finger trackpad swipes, read from wheel events. Browsers never see
// three- or four-finger gestures (macOS keeps them), so MuneebOS uses two
// fingers on the empty desktop instead.
//
// With natural scrolling (the macOS default), fingers moving up produce a
// positive deltaY and fingers moving left a positive deltaX.

export type Swipe = "up" | "down" | "left" | "right";

export interface WheelSample {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  time: number;
}

interface Options {
  threshold?: number; // pixels of travel before a swipe counts
  minEvents?: number; // trackpads send many small events; a mouse notch sends one
  idleMs?: number; // silence that ends a gesture (momentum keeps it going)
}

// Returns a function to feed wheel events; it reports each swipe once per
// gesture, ignoring the momentum events that follow it.
export function createSwipeDetector({
  threshold = 140,
  minEvents = 4,
  idleMs = 220,
}: Options = {}) {
  let dx = 0;
  let dy = 0;
  let count = 0;
  let last = -Infinity;
  let fired = false;

  return (e: WheelSample): Swipe | null => {
    if (e.time - last > idleMs) {
      dx = 0;
      dy = 0;
      count = 0;
      fired = false;
    }
    last = e.time;
    // Line or page scrolling comes from a mouse wheel, not a trackpad.
    if (fired || e.deltaMode !== 0) return null;
    dx += e.deltaX;
    dy += e.deltaY;
    count += 1;
    if (count < minEvents) return null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ay >= threshold && ay > ax * 2) {
      fired = true;
      return dy > 0 ? "up" : "down";
    }
    if (ax >= threshold && ax > ay * 2) {
      fired = true;
      return dx > 0 ? "left" : "right";
    }
    return null;
  };
}
