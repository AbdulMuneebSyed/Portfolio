import type { AppRegistryEntry, DesktopIcon } from "./types";
import { gridCell } from "./desktop-grid";
import { installOverride } from "./app-store/installed";

export const APP_REGISTRY: AppRegistryEntry[] = [
  {
    id: "notes",
    title: "Notes",
    icon: "/icons/mac/notes.png",
    component: "Notepad",
    category: "Utilities",
    description: "A place for project notes, saved in this browser.",
    defaultSize: { width: 650, height: 500 },
    launchAliases: ["notes", "notepad"],
  },
  {
    id: "snake",
    title: "Snake",
    icon: "/games.png",
    component: "Snake",
    installable: true,
    category: "Games",
    description: "Play a round of Snake.",
    launchAliases: ["snake"],
    defaultSize: { width: 620, height: 650 },
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "/games.png",
    component: "Minesweeper",
    installable: true,
    category: "Games",
    description: "Find every mine.",
    defaultSize: { width: 620, height: 650 },
  },
  {
    id: "about",
    title: "About Me",
    icon: "/avatar-256.jpg",
    component: "AboutWindow",
    category: "Portfolio",
    description: "Experience, skills, and awards.",
    defaultSize: { width: 860, height: 640 },
    defaultIconPosition: gridCell(0, 0),
    showOnDesktop: true,
    launchAliases: ["about", "about me", "me", "experience", "skills"],
  },
  {
    id: "projects",
    title: "Projects",
    icon: "/folder.png",
    component: "ProjectsExplorer",
    category: "Portfolio",
    description: "My work: Arrwin, AiResumate, GetMarks, and more.",
    defaultSize: { width: 860, height: 620 },
    defaultIconPosition: gridCell(0, 1),
    showOnDesktop: true,
    launchAliases: ["projects", "portfolio", "work"],
  },
  {
    id: "resume",
    title: "Resume",
    desktopTitle: "Resume.pdf",
    icon: "/pdf.png",
    component: "ResumeWindow",
    category: "Portfolio",
    description: "View or download my resume.",
    defaultSize: { width: 820, height: 640 },
    defaultIconPosition: gridCell(0, 2),
    showOnDesktop: true,
    launchAliases: ["cv", "resume"],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "/icons/mac/mail.png",
    component: "ContactWindow",
    category: "Portfolio",
    description: "Send Syed Abdul Muneeb a message.",
    defaultSize: { width: 860, height: 620 },
    defaultIconPosition: gridCell(0, 3),
    showOnDesktop: true,
    launchAliases: ["contact", "mail", "email", "hire", "message"],
  },
  {
    id: "github-activity",
    title: "GitHub",
    icon: "/github-activity.svg",
    component: "GitHubActivityViewer",
    category: "Portfolio",
    description: "Recent GitHub activity and repositories.",
    defaultSize: { width: 920, height: 600 },
    launchAliases: ["github", "git", "repos"],
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    icon: "/linkedin.png",
    component: "PlaceholderWindow",
    category: "Portfolio",
    description: "Open Syed Abdul Muneeb's LinkedIn profile.",
    defaultSize: { width: 800, height: 600 },
    externalUrl: "https://www.linkedin.com/in/syed-abdul-muneeb/",
    launchAliases: ["linkedin", "profile"],
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "/icons/mac/terminal.png",
    component: "TerminalWindow",
    category: "System",
    description: "Run shell commands and launch apps by name.",
    defaultSize: { width: 760, height: 520 },
    launchAliases: ["terminal", "cmd", "command", "shell"],
  },
  {
    id: "ie",
    title: "Safari",
    icon: "/icons/mac/safari.png",
    component: "InternetExplorer",
    category: "Utilities",
    description: "Browse project links and live demos.",
    defaultSize: { width: 900, height: 620 },
    launchAliases: ["safari", "browser", "internet", "web"],
  },
  {
    id: "computer",
    title: "Finder",
    icon: "/icons/mac/finder.png",
    component: "ComputerExplorer",
    category: "System",
    description: "Browse folders, files, music, and games.",
    defaultSize: { width: 820, height: 600 },
    launchAliases: ["finder", "files", "explorer", "computer"],
  },
  {
    id: "settings",
    title: "System Settings",
    icon: "/icons/mac/system-settings.png",
    component: "SettingsWindow",
    category: "System",
    description: "Change the wallpaper and shell preferences.",
    defaultSize: { width: 800, height: 600 },
    launchAliases: ["settings", "preferences", "wallpaper"],
  },
  {
    id: "feedback",
    title: "Feedback",
    icon: "/icons/mac/notes.png",
    component: "FeedbackWindow",
    category: "Portfolio",
    description: "Send portfolio feedback, bugs, and reviews.",
    defaultSize: { width: 800, height: 600 },
    launchAliases: ["feedback", "bugs", "reviews"],
  },
  {
    id: "recycle",
    title: "Trash",
    icon: "/rycyclebin.png",
    component: "RecycleBin",
    category: "System",
    description: "Review, restore, or permanently remove deleted items.",
    defaultSize: { width: 860, height: 560 },
    launchAliases: ["trash", "bin", "recycle"],
  },
  {
    id: "task-manager",
    title: "Activity Monitor",
    icon: "/icons/mac/system-settings.png",
    component: "TaskManagerWindow",
    category: "System",
    description: "Monitor running apps, focus windows, and quit them.",
    defaultSize: { width: 760, height: 500 },
    launchAliases: [
      "activity",
      "activity monitor",
      "processes",
      "task manager",
    ],
  },
  {
    id: "music",
    title: "Music",
    icon: "/icons/mac/notes.png",
    component: "MusicPlayer",
    category: "Utilities",
    description: "Play the songs in my library.",
    defaultSize: { width: 480, height: 600 },
    launchAliases: ["music", "songs", "player"],
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: "/icons/mac/calculator.png",
    component: "Calculator",
    category: "Utilities",
    description: "A classic calculator.",
    defaultSize: { width: 250, height: 410 },
    launchAliases: ["calc", "calculator"],
  },
  {
    id: "app-store",
    title: "App Store",
    icon: "/icons/mac/app-store.svg",
    component: "AppStoreWindow",
    category: "System",
    description: "Browse Syed Abdul Muneeb's projects and get new apps.",
    defaultSize: { width: 1120, height: 740 },
    launchAliases: ["app store", "appstore", "store", "mac app store"],
  },
  {
    id: "game-2048",
    title: "2048",
    icon: "/games.png",
    component: "Game2048",
    category: "Games",
    description: "Slide tiles and merge them to reach 2048.",
    defaultSize: { width: 440, height: 600 },
    installable: true,
    launchAliases: ["2048"],
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    icon: "/games.png",
    component: "TicTacToe",
    category: "Games",
    description: "Noughts and crosses against the computer or a friend.",
    defaultSize: { width: 420, height: 560 },
    installable: true,
    launchAliases: ["tictactoe", "tic tac toe", "noughts and crosses"],
  },
  {
    id: "memory",
    title: "Memory",
    icon: "/games.png",
    component: "MemoryGame",
    category: "Games",
    description: "Flip cards and find every matching pair.",
    defaultSize: { width: 520, height: 620 },
    installable: true,
    launchAliases: ["memory", "pairs", "concentration"],
  },
  {
    id: "breakout",
    title: "Breakout",
    icon: "/games.png",
    component: "Breakout",
    category: "Games",
    description: "Bounce the ball and clear every brick.",
    defaultSize: { width: 620, height: 600 },
    installable: true,
    launchAliases: ["breakout", "bricks", "arkanoid"],
  },
  {
    id: "word-guess",
    title: "Word Guess",
    icon: "/games.png",
    component: "WordGuess",
    category: "Games",
    description: "Guess the five-letter developer word in six tries.",
    defaultSize: { width: 460, height: 660 },
    installable: true,
    launchAliases: ["word guess", "wordle", "words"],
  },
  {
    id: "simon",
    title: "Simon",
    icon: "/games.png",
    component: "Simon",
    category: "Games",
    description: "Repeat the growing sequence of colours and tones.",
    defaultSize: { width: 440, height: 560 },
    installable: true,
    launchAliases: ["simon", "simon says"],
  },
  {
    id: "typing-test",
    title: "Typing Test",
    icon: "/games.png",
    component: "TypingTest",
    category: "Productivity",
    description: "Measure your typing speed and accuracy.",
    defaultSize: { width: 680, height: 480 },
    installable: true,
    launchAliases: ["typing", "typing test", "wpm"],
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    icon: "/games.png",
    component: "Pomodoro",
    category: "Productivity",
    description: "Focus for 25 minutes, then take a break.",
    defaultSize: { width: 400, height: 520 },
    installable: true,
    launchAliases: ["pomodoro", "timer", "focus timer"],
  },
  {
    id: "sketch",
    title: "Sketch",
    icon: "/games.png",
    component: "Sketch",
    category: "Creativity",
    description: "Draw with brushes and colours, then save a PNG.",
    defaultSize: { width: 760, height: 560 },
    installable: true,
    launchAliases: ["sketch", "draw", "paint"],
  },
  {
    id: "piano",
    title: "Piano",
    icon: "/games.png",
    component: "Piano",
    category: "Creativity",
    description: "Play a two-octave piano with the mouse or keyboard.",
    defaultSize: { width: 720, height: 360 },
    installable: true,
    launchAliases: ["piano", "keyboard instrument"],
  },
  {
    id: "color-lab",
    title: "Color Lab",
    icon: "/games.png",
    component: "ColorLab",
    category: "Developer Tools",
    description: "Pick colours, convert formats, and check contrast.",
    defaultSize: { width: 640, height: 520 },
    installable: true,
    launchAliases: ["color", "colour", "color lab", "color picker"],
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    icon: "/games.png",
    component: "JsonFormatter",
    category: "Developer Tools",
    description: "Format, minify, and validate JSON.",
    defaultSize: { width: 760, height: 540 },
    installable: true,
    launchAliases: ["json", "json formatter", "formatter"],
  },
];

// Dock order, left to right; "separator" draws a divider.
export const DOCK_APP_IDS = [
  "about",
  "projects",
  "resume",
  "contact",
  "github-activity",
  "separator",
  "terminal",
  "ie",
  "computer",
  "app-store",
  "settings",
  "separator",
  "linkedin",
  "recycle",
] as const;

export const APP_REGISTRY_BY_ID = new Map(
  APP_REGISTRY.map((app) => [app.id, app]),
);

export function getApp(appId: string) {
  return APP_REGISTRY_BY_ID.get(appId);
}

// Installable apps count as installed once the visitor gets them in the
// App Store (or when they ship preinstalled and haven't been removed).
export function isAppInstalled(appId: string) {
  const app = getApp(appId);
  if (!app?.installable) return true;
  return installOverride(appId) ?? app.preinstalled === true;
}

export function getLaunchableApps() {
  return APP_REGISTRY.filter(
    (app) => app.searchable !== false && isAppInstalled(app.id),
  );
}

export function getDesktopIconsFromRegistry(): DesktopIcon[] {
  return APP_REGISTRY.filter((app) => app.showOnDesktop).map((app) => ({
    id: app.id,
    title: app.desktopTitle ?? app.title,
    icon: app.icon,
    component: app.component,
    position: app.defaultIconPosition ?? gridCell(0, 0),
  }));
}

export function findAppByAlias(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  return APP_REGISTRY.find((app) => {
    const aliases = [app.id, app.title, ...(app.launchAliases ?? [])];
    return aliases.some((alias) => alias.toLowerCase() === normalized);
  });
}

// Matches ranked: title prefix, then title/alias, then any other text.
export function searchApps(query: string) {
  const normalized = query.trim().toLowerCase();
  const apps = getLaunchableApps();

  if (!normalized) return apps;

  const rank = (app: AppRegistryEntry) => {
    const title = app.title.toLowerCase();
    if (title.startsWith(normalized)) return 0;
    const names = [title, app.id, ...(app.launchAliases ?? [])];
    if (names.some((name) => name.toLowerCase().includes(normalized))) return 1;
    const text = `${app.category} ${app.description}`.toLowerCase();
    return text.includes(normalized) ? 2 : -1;
  };

  return apps
    .map((app) => ({ app, score: rank(app) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .map(({ app }) => app);
}
