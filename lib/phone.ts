import { useSyncExternalStore } from "react";
import { create } from "zustand";

// The iPhone layout. Must match the phone @media rules in globals.css.
export const PHONE_QUERY =
  "(max-width: 699px), (max-width: 950px) and (max-height: 500px)";

function subscribe(onChange: () => void) {
  const query = matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Read synchronously on the first client render, so a window never paints
// as a floating Mac window before snapping to full screen.
export function usePhone() {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

// How each app presents itself on the iPhone.
// - title: the name under its Home Screen icon and in Search
// - icon: real iOS artwork in /public/icons/ios
// - dark: the app's top is dark, so the status bar text turns white
// - sidebar: what the Mac sidebar becomes — a bottom tab bar, a row of
//   filter chips, a list that opens one page at a time, or nothing
// - macOnly: left off the iPhone's Home Screen and Search
export interface PhoneApp {
  title?: string;
  icon?: string;
  dark?: boolean;
  sidebar?: "tabs" | "chips" | "stack" | "hidden";
  macOnly?: boolean;
}

export const PHONE_APPS: Record<string, PhoneApp> = {
  about: { sidebar: "tabs" },
  projects: { icon: "xcode" },
  resume: { icon: "pages" },
  "github-activity": { icon: "github" },
  notes: { icon: "notes", sidebar: "hidden" },
  calculator: { icon: "calculator", dark: true },
  feedback: { icon: "feedback" },
  settings: { title: "Settings", icon: "settings", sidebar: "stack" },
  "app-store": { icon: "app-store" },
  computer: { title: "Files", icon: "files", sidebar: "stack" },
  ie: { icon: "safari", sidebar: "hidden" },
  music: { icon: "music", dark: true },
  contact: { icon: "mail", sidebar: "hidden" },
  terminal: { icon: "terminal", dark: true },
  // The App Switcher does this job on a phone.
  "task-manager": { title: "Activity", icon: "activity", macOnly: true },
  recycle: { title: "Recently Deleted" },
  linkedin: { icon: "linkedin" },
};

export function phoneApp(id: string): PhoneApp {
  return PHONE_APPS[id] ?? {};
}

export function phoneTitle(id: string, fallback: string) {
  return PHONE_APPS[id]?.title ?? fallback;
}

// An app's name as this device shows it: "Files" on a phone, "Finder" on a Mac.
export function useAppName() {
  const phone = usePhone();
  return (id: string, name: string) => (phone ? phoneTitle(id, name) : name);
}

// Where each app was last opened from on the Home Screen, so it can zoom out
// of its icon and back into it.
const launchRects = new Map<string, DOMRect>();

export function rememberLaunch(id: string, el: Element | null) {
  if (el) launchRects.set(id, el.getBoundingClientRect());
}

export function launchRect(id: string) {
  return launchRects.get(id) ?? null;
}

// The App Switcher's sideways scroll, in pixels (positive = towards older
// apps). Cards and the drag on them share it.
export const useSwitcherPan = create<{
  pan: number;
  setPan: (pan: number) => void;
}>((set) => ({ pan: 0, setPan: (pan) => set({ pan }) }));

// App Switcher card geometry for a viewport: most recent app in the middle,
// older ones to its left.
export function switcherSlots(count: number, width: number, height: number, pan: number) {
  const cardWidth = width * 0.66;
  const spacing = width * 0.74;
  return Array.from({ length: count }, (_, i) => {
    const fromNewest = count - 1 - i;
    return {
      cx: width / 2 - fromNewest * spacing + pan,
      cy: height * 0.47,
      maxWidth: cardWidth,
      maxHeight: height,
    };
  });
}
