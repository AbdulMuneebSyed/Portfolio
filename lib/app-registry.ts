import type { AppRegistryEntry, DesktopIcon } from "./types";
import { gridCell } from "./desktop-grid";

export const APP_REGISTRY: AppRegistryEntry[] = [
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
    description: "Shipped work: AiResumate, GetMarks, LaunchPad, and more.",
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
    icon: "/mail-client.svg",
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
    launchAliases: ["github", "git", "activity", "repos"],
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
    icon: "/terminal-app.svg",
    component: "TerminalWindow",
    category: "System",
    description: "Run shell commands and launch apps by name.",
    defaultSize: { width: 760, height: 520 },
    launchAliases: ["terminal", "cmd", "command", "shell"],
  },
  {
    id: "ie",
    title: "Safari",
    icon: "/internet_explorer.png",
    component: "InternetExplorer",
    category: "Utilities",
    description: "Browse project links and live demos.",
    defaultSize: { width: 900, height: 620 },
    launchAliases: ["safari", "browser", "internet", "web"],
  },
  {
    id: "computer",
    title: "Finder",
    icon: "/thispc.png",
    component: "ComputerExplorer",
    category: "System",
    description: "Browse folders, files, music, and games.",
    defaultSize: { width: 820, height: 600 },
    launchAliases: ["finder", "files", "explorer", "computer"],
  },
  {
    id: "settings",
    title: "System Settings",
    icon: "/settings.png",
    component: "SettingsWindow",
    category: "System",
    description: "Change the wallpaper and shell preferences.",
    defaultSize: { width: 800, height: 600 },
    launchAliases: ["settings", "preferences", "wallpaper"],
  },
  {
    id: "feedback",
    title: "Feedback",
    icon: "/contact.png",
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
    icon: "/settings.png",
    component: "TaskManagerWindow",
    category: "System",
    description: "Monitor running apps, focus windows, and quit them.",
    defaultSize: { width: 760, height: 500 },
    launchAliases: ["activity", "activity monitor", "processes", "task manager"],
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
    icon: "/calc.png",
    component: "Calculator",
    category: "Utilities",
    description: "A classic calculator.",
    defaultSize: { width: 400, height: 550 },
    launchAliases: ["calc", "calculator"],
  },
  // Demo apps with placeholder data — kept out of the Dock and search
  // until they show real content.
  {
    id: "projects-pro",
    title: "Projects Explorer Pro",
    icon: "/projects-pro.svg",
    component: "ProjectsExplorerPro",
    category: "Portfolio",
    description: "Inspect featured projects with filters, notes, and launch details.",
    defaultSize: { width: 960, height: 640 },
    searchable: false,
  },
  {
    id: "mail-client",
    title: "Mail Contact Client",
    icon: "/mail-client.svg",
    component: "MailContactClient",
    category: "Productivity",
    description: "Compose contact messages and manage local contact notes.",
    defaultSize: { width: 900, height: 610 },
    searchable: false,
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
  "settings",
  "separator",
  "linkedin",
  "recycle",
] as const;

export const APP_REGISTRY_BY_ID = new Map(
  APP_REGISTRY.map((app) => [app.id, app])
);

export function getApp(appId: string) {
  return APP_REGISTRY_BY_ID.get(appId);
}

export function getLaunchableApps() {
  return APP_REGISTRY.filter((app) => app.searchable !== false);
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
