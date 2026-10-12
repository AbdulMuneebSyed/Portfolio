import { feedBody, pickNext } from "./notification-feed";
import { notify, useNotifications } from "./notifications";
import { useWindowManager } from "./window-manager";
import { readJSON, writeJSON } from "./storage";

// When feed notifications drop in. Only time spent looking at the page
// counts: the first (tier 0, the LinkedIn invite) arrives 10–15 s after the
// desktop opens, then the gaps start at 60–100 s
// and stretch by 1.3× each time, at most six a visit. Anything already on
// screen (a banner, an overlay marked data-blocks-notifications such as
// Spotlight or Notification Center, the tour, typing) pushes the next one
// back 10 s.
// A visitor never gets the same one twice within two weeks.
// `?notifications=fast` runs the clock 15× faster for testing.
const FIRST_DELAY: [number, number] = [10_000, 15_000];
const GAP: [number, number] = [60_000, 100_000];
const GAP_GROWTH = 1.3;
const MAX_PER_VISIT = 6;
const RETRY_MS = 10_000;
const TICK_MS = 1000;
const SEEN_KEY = "muneebos-feed-seen-v1";
const SEEN_FOR_MS = 14 * 86_400_000;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);

function loadSeen(now: number): Record<string, number> {
  const saved = readJSON<unknown>(SEEN_KEY, {});
  if (!saved || typeof saved !== "object") return {};
  return Object.fromEntries(
    Object.entries(saved).filter(
      ([, at]) => typeof at === "number" && now - at < SEEN_FOR_MS,
    ),
  ) as Record<string, number>;
}

function isBusy() {
  if (useNotifications.getState().banners.length > 0) return true;
  if (
    document.querySelector(
      // Shepherd builds the Mac tour's popovers itself, so they can't carry
      // the attribute.
      "[data-blocks-notifications], .shepherd-element",
    )
  )
    return true;
  const active = document.activeElement as HTMLElement | null;
  return !!active && (active.matches("input, textarea, select") || active.isContentEditable);
}

export function startNotificationFeed() {
  const speed =
    new URLSearchParams(location.search).get("notifications") === "fast" ? 15 : 1;
  const seen = loadSeen(Date.now());
  const opened = new Set(useWindowManager.getState().windows.map((w) => w.id));
  const unsubscribe = useWindowManager.subscribe((state) => {
    for (const w of state.windows) opened.add(w.id);
  });

  let active = 0;
  let due = between(FIRST_DELAY) / speed;
  let gap = between(GAP);
  let sent = 0;

  const timer = window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    active += TICK_MS;
    if (active < due) return;
    if (isBusy()) {
      due = active + RETRY_MS / speed;
      return;
    }
    const item = pickNext(new Set(Object.keys(seen)), opened);
    if (!item) return stop();
    notify({ appId: item.appId, title: item.title, body: feedBody(item) });
    seen[item.id] = Date.now();
    writeJSON(SEEN_KEY, seen);
    if (++sent >= MAX_PER_VISIT) return stop();
    due = active + gap / speed;
    gap *= GAP_GROWTH;
  }, TICK_MS);

  function stop() {
    window.clearInterval(timer);
    unsubscribe();
  }
  return stop;
}
