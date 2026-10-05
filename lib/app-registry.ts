import type { AppRegistryEntry, DesktopIcon } from "./types";
import { gridCell } from "./desktop-grid";
import foldericon from "../public/folder.png";
import computericon from "../public/thispc.png";
import recyclebinicon from "../public/rycyclebin.png";
import resumeicon from "../public/pdf.png";
import linkedinicon from "../public/linkedin.png";
import ieicon from "../public/internet_explorer.png";
import settingsicon from "../public/settings.png";
import feedbackicon from "../public/contact.png";
import calcicon from "../public/calc.png";

export const APP_REGISTRY: AppRegistryEntry[] = [
  {
    id: "about",
    title: "About Me",
    icon: feedbackicon,
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
    icon: foldericon,
    component: "ProjectsExplorer",
    category: "Portfolio",
    description: "Shipped work: AiResumate, GetMarks, LaunchPad, and more.",
    defaultSize: { width: 860, height: 620 },
    defaultIconPosition: gridCell(0, 1),
    showOnDesktop: true,
    launchAliases: ["projects", "portfolio", "work"],
  },
  {
    id: "computer",
    title: "Computer",
    icon: computericon,
    component: "ComputerExplorer",
    category: "System",
    description: "Browse local drives, folders, portfolio files, and project areas.",
    defaultSize: { width: 800, height: 600 },
    defaultIconPosition: gridCell(1, 0),
    showOnDesktop: true,
    launchAliases: ["explorer", "files", "computer", "my computer"],
  },
  {
    id: "resume",
    title: "Resume",
    icon: resumeicon,
    component: "ResumeWindow",
    category: "Portfolio",
    description: "View or download my resume.",
    defaultSize: { width: 800, height: 600 },
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
    id: "linkedin",
    title: "LinkedIn",
    icon: linkedinicon,
    component: "PlaceholderWindow",
    category: "Portfolio",
    description: "Open Syed Abdul Muneeb's LinkedIn profile.",
    defaultSize: { width: 800, height: 600 },
    defaultIconPosition: gridCell(0, 4),
    showOnDesktop: true,
    externalUrl: "https://www.linkedin.com/in/syed-abdul-muneeb/",
    launchAliases: ["linkedin", "profile"],
  },
  {
    id: "recycle",
    title: "Recycle Bin",
    icon: recyclebinicon,
    component: "RecycleBin",
    category: "System",
    description: "Review, restore, or permanently remove deleted local shell items.",
    defaultSize: { width: 860, height: 560 },
    defaultIconPosition: gridCell(1, 4),
    showOnDesktop: true,
    launchAliases: ["trash", "bin", "recycle"],
  },
  {
    id: "ie",
    title: "Internet Explorer",
    icon: ieicon,
    component: "InternetExplorer",
    category: "Utilities",
    description: "Browse portfolio links in a retro browser shell.",
    defaultSize: { width: 900, height: 620 },
    defaultIconPosition: gridCell(1, 2),
    showOnDesktop: true,
    launchAliases: ["browser", "internet", "web"],
  },
  {
    id: "feedback",
    title: "Reviews & Bugs",
    icon: feedbackicon,
    component: "FeedbackWindow",
    category: "Portfolio",
    description: "Send portfolio feedback, bugs, and review notes.",
    defaultSize: { width: 800, height: 600 },
    defaultIconPosition: gridCell(1, 3),
    showOnDesktop: true,
    launchAliases: ["feedback", "bugs", "reviews"],
  },
  {
    id: "settings",
    title: "Control Panel",
    icon: settingsicon,
    component: "SettingsWindow",
    category: "System",
    description: "Adjust wallpaper, taskbar glass, and shell preferences.",
    defaultSize: { width: 800, height: 600 },
        launchAliases: ["settings", "control", "control panel"],
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "/terminal-app.svg",
    component: "TerminalWindow",
    category: "System",
    description: "Run local MuneebOS shell commands and launch apps by alias.",
    defaultSize: { width: 760, height: 520 },
    defaultIconPosition: gridCell(1, 1),
    showOnDesktop: true,
    launchAliases: ["terminal", "cmd", "command", "powershell"],
  },
  {
    id: "github-activity",
    title: "GitHub",
    icon: "/github-activity.svg",
    component: "GitHubActivityViewer",
    category: "Portfolio",
    description: "View GitHub-style activity, repositories, and coding signal.",
    defaultSize: { width: 920, height: 600 },
    defaultIconPosition: gridCell(0, 5),
    showOnDesktop: true,
    launchAliases: ["github", "git", "activity", "repos"],
  },
  {
    id: "task-manager",
    title: "Task Manager",
    icon: settingsicon,
    component: "TaskManagerWindow",
    category: "System",
    description: "Monitor running apps, focus windows, and end tasks.",
    defaultSize: { width: 760, height: 500 },
    searchable: true,
    launchAliases: ["task", "tasks", "processes", "taskmgr", "task manager"],
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: calcicon,
    component: "Calculator",
    category: "Utilities",
    description: "Run calculations in a classic desktop utility.",
    defaultSize: { width: 400, height: 550 },
    searchable: true,
    launchAliases: ["calc", "calculator"],
  },
  // Demo apps with placeholder data — kept out of the desktop and search
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
    title: app.title,
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

export function searchApps(query: string) {
  const normalized = query.trim().toLowerCase();
  const apps = getLaunchableApps();

  if (!normalized) return apps;

  return apps.filter((app) => {
    const searchableText = [
      app.id,
      app.title,
      app.category,
      app.description,
      ...(app.launchAliases ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return searchableText.includes(normalized);
  });
}
