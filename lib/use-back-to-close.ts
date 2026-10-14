import { useEffect, useRef } from "react";

// On a phone the edge swipe is the browser's Back, and opening an app here
// doesn't change the page, so Back left the site (back to LinkedIn, say).
// While something is open, this keeps one history entry for it at the same
// address: Back closes the newest open thing instead. Closing it any other
// way takes its entry off again, so Back on the Home Screen still leaves.

type Entry = { close: () => void };
const open: Entry[] = [];
let ownBacks = 0; // Backs this file triggered, to let their popstate pass
let listening = false;

function onPopState() {
  if (ownBacks > 0) {
    ownBacks--;
    return;
  }
  open.pop()?.close();
}

export function useBackToClose(isOpen: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) return;
    if (!listening) {
      window.addEventListener("popstate", onPopState);
      listening = true;
    }
    let closedByBack = false;
    const entry: Entry = {
      close: () => {
        closedByBack = true;
        closeRef.current();
      },
    };
    open.push(entry);
    window.history.pushState({ backToClose: true }, "");

    return () => {
      if (closedByBack) return;
      const i = open.indexOf(entry);
      if (i !== -1) open.splice(i, 1);
      // Only while one of these entries is still current: if the page
      // itself moved on (a link to /profile), its history is left alone.
      window.setTimeout(() => {
        if (!window.history.state?.backToClose) return;
        ownBacks++;
        window.history.back();
      });
    };
  }, [isOpen]);
}
