// Every keyboard shortcut MuneebOS has, in one place: the key handlers match
// with `match`, and menus, tooltips and System Settings show `keys`, so what
// is advertised is always what works. ⌘ means ⌘ or Ctrl. ⌘W, ⌘M, ⌘H and ⌘Tab
// belong to the browser or the OS, so those use ⌥ instead; `e.code` is used
// with ⌥, which turns letters into symbols on a Mac.

type Shortcut = {
  label: string;
  // As shown in Settings, e.g. "⌘K / ⌘Space".
  keys: string;
  // As shown in a menu or tooltip when shorter than `keys`.
  short?: string;
  // Omitted for shortcuts a single app handles itself (Finder's).
  match?: (e: KeyboardEvent) => boolean;
};

const mod = (e: KeyboardEvent) => e.metaKey || e.ctrlKey;
const key = (e: KeyboardEvent) => e.key.toLowerCase();
const onlyCtrl = (e: KeyboardEvent) => e.ctrlKey && !e.metaKey;

export const SHORTCUTS = {
  spotlight: {
    label: "Spotlight",
    keys: "⌘K / ⌘Space",
    short: "⌘K",
    match: (e) => mod(e) && (key(e) === "k" || e.code === "Space"),
  },
  settings: {
    label: "System Settings",
    keys: "⌘,",
    match: (e) => mod(e) && key(e) === ",",
  },
  activityMonitor: {
    label: "Activity Monitor",
    keys: "⌘⌥Esc",
    match: (e) => mod(e) && e.altKey && key(e) === "escape",
  },
  minimize: {
    label: "Minimize window",
    keys: "⌥M",
    match: (e) => (mod(e) && key(e) === "m") || (e.altKey && e.code === "KeyM"),
  },
  close: {
    label: "Close window",
    keys: "⌥W",
    match: (e) => (mod(e) && key(e) === "w") || (e.altKey && e.code === "KeyW"),
  },
  hide: {
    label: "Hide app",
    keys: "⌥H",
    match: (e) => e.altKey && !e.shiftKey && e.code === "KeyH",
  },
  hideOthers: {
    label: "Hide others",
    keys: "⌥⇧H",
    match: (e) => e.altKey && e.shiftKey && e.code === "KeyH",
  },
  switchApps: {
    label: "Switch apps",
    keys: "⌥Tab",
    match: (e) => e.altKey && !e.metaKey && !e.ctrlKey && e.key === "Tab",
  },
  cycleWindows: {
    label: "Cycle windows",
    keys: "⌘`",
    match: (e) => mod(e) && key(e) === "`",
  },
  missionControl: {
    label: "Mission Control",
    keys: "⌃↑ / F3",
    short: "⌃↑",
    match: (e) => (e.ctrlKey && key(e) === "arrowup") || key(e) === "f3",
  },
  switchDesktop: {
    label: "Previous / next desktop",
    keys: "⌃← / ⌃→",
    match: (e) => onlyCtrl(e) && (key(e) === "arrowleft" || key(e) === "arrowright"),
  },
  goToDesktop: {
    label: "Go to desktop 1–6",
    keys: "⌃1 … ⌃6",
    match: (e) => onlyCtrl(e) && /^[1-6]$/.test(key(e)),
  },
  moveToTrash: { label: "Move folder to Trash", keys: "⌘⌫" },
  openFile: { label: "Open selected file", keys: "⌘O / Return" },
  enclosingFolder: { label: "Finder: enclosing folder", keys: "⌘↑" },
  finderViews: { label: "Finder: icon / list view", keys: "⌘1 / ⌘2" },
  dismiss: { label: "Dismiss menu or search", keys: "Esc", match: (e) => key(e) === "escape" },
} satisfies Record<string, Shortcut>;

export type ShortcutId = keyof typeof SHORTCUTS;

// The shorter form, for menus and tooltips.
export const shortcutKeys = (id: ShortcutId) => {
  const s: Shortcut = SHORTCUTS[id];
  return s.short ?? s.keys;
};

// True when `e` is shortcut `id`.
export const isShortcut = (id: ShortcutId, e: KeyboardEvent) =>
  (SHORTCUTS[id] as Shortcut).match?.(e) ?? false;
