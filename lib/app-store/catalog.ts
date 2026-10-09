import { getApp } from "../app-registry";
import { projects, timeline } from "../portfolio-data";

// Everything the App Store lists. Three kinds of item:
// - "project": shipped work; the main button opens the live site
// - "app": a MuneebOS app from the registry; Open, or Get when installable
// - "experience": a job, presented as an app; Open shows the company site

export type StoreTab =
  | "discover"
  | "arcade"
  | "create"
  | "work"
  | "play"
  | "develop";

export type StoreItemKind = "project" | "app" | "experience";

// A product-page screenshot. `live` renders the app itself, scaled down;
// `image` is a captured screenshot; `mock` draws a stylised interface.
export interface Slide {
  strong: string;
  caption: string;
  live?: string;
  image?: string;
  mock?: MockKind;
}
export type MockKind =
  | "resume-score"
  | "resume-rewrite"
  | "leaderboard"
  | "lms"
  | "feed"
  | "profile"
  | "crm"
  | "chatbot"
  | "agent-chat"
  | "daily-brief"
  | "sql"
  | "paper"
  | "hackathon"
  | "stats"
  | "desktop"
  | "timeline";

export interface Version {
  version: string;
  date: string;
  notes: string;
}

export interface StoreItem {
  id: string;
  kind: StoreItemKind;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  highlights?: string[];
  techStack?: string[];
  website?: string;
  appId?: string;
  aboutTab?: string;
  chart?: { rank: number; list: string };
  award?: string;
  size: string;
  age: string;
  platforms: string[];
  slides: Slide[];
  versions: Version[];
  tint: string;
}

const DEVELOPER = "Syed Abdul Muneeb";
export const STORE_DEVELOPER = DEVELOPER;

const project = (id: string) => {
  const p = projects.find((item) => item.id === id);
  if (!p) throw new Error(`Unknown project ${id}`);
  return p;
};
const job = (id: string) => {
  const t = timeline.find((item) => item.id === id);
  if (!t) throw new Error(`Unknown job ${id}`);
  return t;
};

const PROJECT_ITEMS: StoreItem[] = [
  {
    id: "airesumate",
    kind: "project",
    name: "AiResumate",
    subtitle: "AI résumé scoring and rewriting",
    category: "AI / SaaS",
    description: project("airesumate").description,
    highlights: project("airesumate").highlights,
    techStack: project("airesumate").techStack,
    website: project("airesumate").demoLink,
    chart: { rank: 1, list: "AI / SaaS" },
    award: "Co-founded",
    size: "Web",
    age: "4+",
    platforms: ["Web", "Mac", "iPhone"],
    tint: "#7c5cff",
    slides: [
      {
        strong: "Score your résumé.",
        caption: "Gemini, GPT and Claude grade it against the job in real time.",
        mock: "resume-score",
      },
      {
        strong: "Rewrite with one click.",
        caption: "ATS-friendly bullet points, tuned for every role.",
        mock: "resume-rewrite",
      },
      {
        strong: "Launched and earning.",
        caption: "1K+ visitors and $150+ revenue in the first month.",
        mock: "stats",
      },
    ],
    versions: [
      {
        version: "1.2",
        date: "2025",
        notes: "Cashfree payments and zero-downtime releases on Vercel.",
      },
      {
        version: "1.0",
        date: "2025",
        notes: "Launch: real-time scoring, rewriting and ATS optimisation.",
      },
    ],
  },
  {
    id: "getmarks",
    kind: "project",
    name: "GetMarks",
    subtitle: "Exam prep for JEE and NEET",
    category: "EdTech",
    description: project("getmarks").description,
    highlights: project("getmarks").highlights,
    techStack: project("getmarks").techStack,
    website: project("getmarks").demoLink,
    chart: { rank: 1, list: "EdTech" },
    size: "Web",
    age: "4+",
    platforms: ["Web", "iPhone", "Android"],
    tint: "#2f80ed",
    slides: [
      {
        strong: "Practise and learn.",
        caption: "The live GetMarks web app, used by lakhs of aspirants.",
        image: "/app-store/shots/getmarks-1.jpg",
      },
      {
        strong: "Leaderboards and Leagues.",
        caption: "1L+ rank updates every week.",
        mock: "leaderboard",
      },
      {
        strong: "Courses that scale.",
        caption: "The LMS module served 30K+ daily learners at launch.",
        mock: "lms",
      },
    ],
    versions: [
      {
        version: "NEET v2",
        date: "Jan 2026",
        notes: "Refactored data flow, API caching and rendering; the release coincided with 3x daily NEET users.",
      },
      {
        version: "LMS",
        date: "Oct 2025",
        notes: "Courses module launched to 30K+ daily active learners.",
      },
      {
        version: "Leagues",
        date: "Aug 2025",
        notes: "Leaderboard and League modules.",
      },
    ],
  },
  {
    id: "arrwin",
    kind: "project",
    name: "Arrwin",
    subtitle: "An AI assistant for product managers",
    category: "AI Agents",
    description: project("arrwin").description,
    highlights: project("arrwin").highlights,
    techStack: project("arrwin").techStack,
    website: project("arrwin").demoLink,
    chart: { rank: 1, list: "AI Agents" },
    award: "Built at PulseGen",
    size: "Web",
    age: "4+",
    platforms: ["Web"],
    tint: "#5856d6",
    slides: [
      {
        strong: "Ask your product anything.",
        caption: "Streaming chat over every call, doc and ticket, with contradictions flagged.",
        mock: "agent-chat",
      },
      {
        strong: "The Daily Brief.",
        caption: "Gmail and other connectors via MCP and REST, summed up every morning.",
        mock: "daily-brief",
      },
    ],
    versions: [
      {
        version: "Daily Brief",
        date: "2026",
        notes: "Gmail and other connectors via MCP and REST APIs.",
      },
      {
        version: "1.0",
        date: "2026",
        notes: "Ingestion, streaming chat, contradiction detection and tenant-isolated knowledge.",
      },
    ],
  },
  {
    id: "hypogen",
    kind: "project",
    name: "Hypogen",
    subtitle: "Business questions, answered in SQL",
    category: "AI Agents",
    description: project("hypogen").description,
    techStack: project("hypogen").techStack,
    chart: { rank: 2, list: "AI Agents" },
    size: "Pipeline",
    age: "4+",
    platforms: ["Web"],
    tint: "#ff9f0a",
    slides: [
      {
        strong: "Ask in plain English.",
        caption: "Several LLM roles plan, write and check DuckDB SQL over business data.",
        mock: "sql",
      },
    ],
    versions: [
      {
        version: "1.0",
        date: "2026",
        notes: "Multi-role LLM pipeline generating and running DuckDB SQL.",
      },
    ],
  },
  {
    id: "agent-checkpoints",
    kind: "project",
    name: "Checkpointed Agents",
    subtitle: "Research: reliable long-horizon LLM agents",
    category: "Research",
    description: project("agent-checkpoints").description,
    techStack: project("agent-checkpoints").techStack,
    chart: { rank: 1, list: "Research" },
    award: "Research paper",
    size: "Paper",
    age: "4+",
    platforms: ["Web"],
    tint: "#30b0c7",
    slides: [
      {
        strong: "Agents that pick up where they left off.",
        caption: "Checkpointed state management for tool-using LLM agents.",
        mock: "paper",
      },
    ],
    versions: [
      {
        version: "Paper",
        date: "2026",
        notes: "With S. S. Ahmed and S. W. Sidiqi.",
      },
    ],
  },
  {
    id: "launchpad",
    kind: "project",
    name: "LaunchPad",
    subtitle: "A social network for startups",
    category: "Full Stack",
    description: project("launchpad").description,
    techStack: project("launchpad").techStack,
    chart: { rank: 1, list: "Full Stack" },
    size: "Web",
    age: "4+",
    platforms: ["Web"],
    tint: "#ff6b35",
    slides: [
      {
        strong: "Real-time founder feed.",
        caption: "Posts and reactions stream in over SignalR.",
        mock: "feed",
      },
      {
        strong: "Founder profiles.",
        caption: "Startups, teams and live interactions in one place.",
        mock: "profile",
      },
    ],
    versions: [
      {
        version: "1.0",
        date: "2025",
        notes: "JWT auth, Redis caching and a modular .NET Core backend.",
      },
    ],
  },
  {
    id: "capco",
    kind: "project",
    name: "Capco-CS Vendor Portal",
    subtitle: "CRM, vendors and an AI help desk",
    category: "Enterprise",
    description: project("capco").description,
    highlights: project("capco").highlights,
    techStack: project("capco").techStack,
    website: project("capco").demoLink,
    chart: { rank: 1, list: "Enterprise" },
    size: "Web",
    age: "4+",
    platforms: ["Web"],
    tint: "#14a3a3",
    slides: [
      {
        strong: "Live in production.",
        caption: "The Capco-CS site with its Gemini-powered assistant.",
        image: "/app-store/shots/capco-1.jpg",
      },
      {
        strong: "One CRM for every client.",
        caption: "+30% client management efficiency.",
        mock: "crm",
      },
      {
        strong: "Support in seconds.",
        caption: "The AI chatbot cut response times by 90%.",
        mock: "chatbot",
      },
    ],
    versions: [
      {
        version: "1.0",
        date: "May 2025",
        notes: "Vendor portal, custom CRM and Gemini support chatbot.",
      },
    ],
  },
  {
    id: "ecell",
    kind: "project",
    name: "Hack Revolution",
    subtitle: "E-Cell MJCET hackathon platform",
    category: "Community",
    description: project("ecell").description,
    highlights: project("ecell").highlights,
    techStack: project("ecell").techStack,
    website: project("ecell").demoLink,
    chart: { rank: 1, list: "Community" },
    size: "Web",
    age: "4+",
    platforms: ["Web"],
    tint: "#ff3b6b",
    slides: [
      {
        strong: "Register, team up, hack.",
        caption: "127+ registrations a day at its peak.",
        mock: "hackathon",
      },
      {
        strong: "Built to grow.",
        caption: "500K+ visitors and 440% growth to 30K users.",
        mock: "stats",
      },
    ],
    versions: [
      {
        version: "2025",
        date: "Jul 2025",
        notes: "Led a five-person team through architecture, deploy and growth.",
      },
    ],
  },
  {
    id: "muneebos",
    kind: "project",
    name: "MuneebOS",
    subtitle: "This portfolio, as an operating system",
    category: "Interactive",
    description: project("muneebos").description,
    techStack: project("muneebos").techStack,
    website: "https://github.com/AbdulMuneebSyed",
    chart: { rank: 1, list: "Interactive" },
    award: "You're using it",
    size: "Web",
    age: "4+",
    platforms: ["Mac", "iPhone", "Web"],
    tint: "#0a84ff",
    slides: [
      {
        strong: "A Mac in your browser.",
        caption: "Windows, Dock, Spotlight, Mission Control and Control Center.",
        mock: "desktop",
      },
      {
        strong: "Finder, but for a portfolio.",
        caption: "Browse folders, songs, games and projects.",
        live: "computer",
      },
      {
        strong: "Make it yours.",
        caption: "Wallpapers, dark mode, sound and accessibility settings.",
        live: "settings",
      },
    ],
    versions: [
      {
        version: "3.1",
        date: "7 Oct 2026",
        notes: "The App Store, with twelve new apps and games to get.",
      },
      {
        version: "3.0",
        date: "7 Oct 2026",
        notes: "iPhone-inspired Home Screen, folders and Control Center on phones.",
      },
      {
        version: "2.3",
        date: "6 Oct 2026",
        notes: "Unified toolbars; rebuilt Finder, Calculator, Terminal and Safari.",
      },
      {
        version: "2.2",
        date: "6 Oct 2026",
        notes: "System Settings with real macOS sidebar icons and new panes.",
      },
      {
        version: "2.1",
        date: "6 Oct 2026",
        notes: "Window tiling, Mission Control and notifications.",
      },
      {
        version: "2.0",
        date: "5 Oct 2026",
        notes: "From Windows 7 to macOS: menu bar, Dock, Spotlight, lock screen.",
      },
      {
        version: "1.0",
        date: "22 Jul 2026",
        notes: "MuneebOS desktop and mobile experience.",
      },
    ],
  },
];

const EXPERIENCE_TINTS: Record<string, string> = {
  pulsegen: "#5856d6",
  mathongo: "#2f80ed",
  airesumate: "#7c5cff",
  "ecell-mjcet": "#ff3b6b",
  "capco-cs": "#14a3a3",
};

// Each company's own site, opened in Safari from the item's Open button.
const EXPERIENCE_SITES: Record<string, string> = {
  pulsegen: "https://www.pulsegen.io/",
  mathongo: "https://www.mathongo.com/",
  airesumate: "https://airesumate.com/",
  "capco-cs": "https://www.capco-cs.com/",
  "ecell-mjcet": "https://www.ecell-mjcet.com/",
};

const EXPERIENCE_ITEMS: StoreItem[] = timeline.map((entry, index) => {
  const [role, company] = entry.title.split(" · ");
  return {
    id: `exp-${entry.id}`,
    kind: "experience",
    name: company,
    subtitle: `${role} · ${entry.period}`,
    category: "Experience",
    description: entry.points.join("\n"),
    highlights: entry.points,
    appId: "about",
    aboutTab: "Experience",
    website: EXPERIENCE_SITES[entry.id],
    chart: { rank: index + 1, list: "Experience" },
    size: entry.location,
    age: "4+",
    platforms: ["Web"],
    tint: EXPERIENCE_TINTS[entry.id] ?? "#0a84ff",
    slides: [
      { strong: role, caption: `${company}, ${entry.location}.`, mock: "timeline" },
      { strong: "Results.", caption: entry.points[0], mock: "stats" },
    ],
    versions: [{ version: role, date: entry.period, notes: entry.points[0] }],
  };
});

interface AppDetails {
  subtitle: string;
  description: string;
  highlights?: string[];
  tint: string;
  slides?: Slide[];
  version?: Version;
}

const NEW_APP: Version = {
  version: "1.0",
  date: "7 Oct 2026",
  notes: "New in the MuneebOS App Store.",
};

const APP_DETAILS: Record<string, AppDetails> = {
  about: {
    subtitle: "Meet the developer",
    description:
      "Syed Abdul Muneeb is a full-stack engineer who has shipped products used by lakhs of students and thousands of businesses. Experience, skills and awards, all in one window.",
    tint: "#ff9f0a",
    slides: [
      { strong: "Hello.", caption: "Who I am and what I build.", live: "about" },
    ],
  },
  projects: {
    subtitle: "Every project in one folder",
    description:
      "A Finder-style browser for everything I've shipped, with categories, search, icon and list views.",
    tint: "#1e90ff",
    slides: [
      { strong: "All my work.", caption: "Filter by category or search by tech.", live: "projects" },
    ],
  },
  resume: {
    subtitle: "One page, one click",
    description: "My résumé as a PDF you can read here or download.",
    tint: "#e5352b",
  },
  contact: {
    subtitle: "Send me a message",
    description:
      "Write to me from inside MuneebOS. Messages land straight in my inbox.",
    tint: "#0a84ff",
    slides: [
      { strong: "Say hello.", caption: "I reply to every message.", live: "contact" },
    ],
  },
  "github-activity": {
    subtitle: "Live commits and repositories",
    description: "Recent public GitHub activity and repositories, fetched live.",
    tint: "#3a3a3c",
  },
  terminal: {
    subtitle: "A shell that knows me",
    description:
      "Type help, about, projects or open <app>. Now with install and uninstall.",
    tint: "#2c2c2e",
  },
  ie: {
    subtitle: "Browse my live projects",
    description:
      "Safari with bookmarks for every product I've worked on, a Reading List and history.",
    tint: "#0a84ff",
  },
  computer: {
    subtitle: "Folders, music and games",
    description: "Browse the MuneebOS file system.",
    tint: "#1e90ff",
    slides: [{ strong: "Everything in one place.", caption: "Folders, music and games.", live: "computer" }],
  },
  settings: {
    subtitle: "Make MuneebOS yours",
    description: "Appearance, wallpaper, display, sound and accessibility.",
    tint: "#8e8e93",
    slides: [{ strong: "Make it yours.", caption: "Dark mode, wallpapers and more.", live: "settings" }],
  },
  notes: {
    subtitle: "Jot it down",
    description: "Notes that stay in this browser.",
    tint: "#ffcc00",
    slides: [{ strong: "Notes.", caption: "Saved as you type.", live: "notes" }],
  },
  calculator: {
    subtitle: "The classic",
    description: "A calculator with the familiar Apple look.",
    tint: "#ff9500",
    slides: [{ strong: "Calculator.", caption: "Quick sums, one tap away.", live: "calculator" }],
  },
  music: {
    subtitle: "My playlist",
    description: "Play the songs in my library. Control Center shares the same player.",
    tint: "#fa2d48",
    slides: [{ strong: "Music.", caption: "Play, pause and skip.", live: "music" }],
  },
  feedback: {
    subtitle: "Tell me what you think",
    description: "Send feedback, bug reports and suggestions about this portfolio.",
    tint: "#34c759",
  },
  "task-manager": {
    subtitle: "See what's running",
    description: "Monitor running apps, bring them forward or quit them.",
    tint: "#30d158",
  },
  snake: {
    subtitle: "Eat, grow, don't crash",
    description: "The arcade classic. Steer with the arrow keys or the on-screen pad.",
    tint: "#34c759",
    version: { version: "1.0", date: "Jul 2026", notes: "Ported to MuneebOS." },
  },
  minesweeper: {
    subtitle: "Clear the field",
    description: "Find every mine without setting one off.",
    tint: "#5e5ce6",
    slides: [{ strong: "Minesweeper.", caption: "Reveal a square, flag a mine.", live: "minesweeper" }],
    version: { version: "1.0", date: "Jul 2026", notes: "Ported to MuneebOS." },
  },
  "game-2048": {
    subtitle: "Slide. Merge. Repeat.",
    description:
      "Slide the tiles with the arrow keys or a swipe. Equal tiles merge; reach 2048 to win. Your best score is saved.",
    tint: "#edc22e",
    slides: [
      { strong: "Just one more go.", caption: "Arrow keys on a Mac, swipes on a phone.", live: "game-2048" },
    ],
  },
  "tic-tac-toe": {
    subtitle: "Beat the computer. If you can.",
    description:
      "Play noughts and crosses against a friend or a computer that never loses.",
    tint: "#ff375f",
    slides: [{ strong: "Unbeatable.", caption: "The computer plays perfect minimax.", live: "tic-tac-toe" }],
  },
  memory: {
    subtitle: "Match the tech logos",
    description: "Flip two cards at a time and find every pair in as few moves as you can.",
    tint: "#bf5af2",
    slides: [{ strong: "Remember the stack.", caption: "React, Redis, Rust and friends.", live: "memory" }],
  },
  breakout: {
    subtitle: "Smash every brick",
    description: "Move the paddle with the mouse, the arrow keys or a finger, and clear the wall.",
    tint: "#ff9f0a",
    slides: [{ strong: "Retro, refined.", caption: "Five rows, three lives.", live: "breakout" }],
  },
  "word-guess": {
    subtitle: "A word game for developers",
    description:
      "Guess the five-letter word in six tries. Every answer is something developers say.",
    tint: "#538d4e",
    slides: [{ strong: "Six tries.", caption: "Green is right, yellow is close.", live: "word-guess" }],
  },
  simon: {
    subtitle: "Follow the lights",
    description: "Watch the sequence, then repeat it. It gets one step longer each round.",
    tint: "#30d158",
    slides: [{ strong: "How far can you go?", caption: "Each colour plays its own note.", live: "simon" }],
  },
  "typing-test": {
    subtitle: "How fast do you type?",
    description: "A 30-second typing test with words per minute and accuracy.",
    tint: "#64d2ff",
    slides: [{ strong: "Words per minute.", caption: "Thirty seconds, no backspace penalty.", live: "typing-test" }],
  },
  pomodoro: {
    subtitle: "Focus in 25-minute sprints",
    description:
      "Work for 25 minutes, rest for 5. A notification tells you when to switch.",
    tint: "#ff453a",
    slides: [{ strong: "Deep work.", caption: "Focus, break, repeat.", live: "pomodoro" }],
  },
  sketch: {
    subtitle: "Draw anything",
    description: "A canvas with brushes, colours, an eraser and PNG export.",
    tint: "#ff2d55",
    slides: [{ strong: "Doodle freely.", caption: "Then save it as a PNG.", live: "sketch" }],
  },
  piano: {
    subtitle: "Two octaves, zero setup",
    description:
      "Play with the mouse, touch or your keyboard: the Z row is the lower octave, the Q row the upper one.",
    tint: "#1c1c1e",
    slides: [{ strong: "Play by ear.", caption: "Synthesised with Web Audio.", live: "piano" }],
  },
  "color-lab": {
    subtitle: "Colours for developers",
    description:
      "Pick a colour, copy it as HEX, RGB or HSL, check WCAG contrast and build a palette.",
    tint: "#ff9f0a",
    slides: [{ strong: "Ship accessible colour.", caption: "Contrast ratios at a glance.", live: "color-lab" }],
  },
  "json-formatter": {
    subtitle: "Pretty-print and validate",
    description: "Paste JSON to format, minify or validate it, with the exact error position.",
    tint: "#5e5ce6",
    slides: [{ strong: "Readable JSON.", caption: "Format, minify, validate.", live: "json-formatter" }],
  },
};

const APP_ITEMS: StoreItem[] = Object.entries(APP_DETAILS).map(
  ([id, details]) => {
    const app = getApp(id);
    if (!app) throw new Error(`Unknown app ${id}`);
    return {
      id,
      kind: "app",
      name: app.title,
      subtitle: details.subtitle,
      category: app.category,
      description: details.description,
      highlights: details.highlights,
      appId: id,
      size: app.installable ? "1 MB" : "Built in",
      age: "4+",
      platforms: ["Mac", "iPhone"],
      tint: details.tint,
      slides: details.slides ?? [
        { strong: app.title, caption: app.description, live: id },
      ],
      versions: [details.version ?? (app.installable ? NEW_APP : {
        version: "3.0",
        date: "7 Oct 2026",
        notes: "Updated for the macOS look of MuneebOS 3.",
      })],
    };
  },
);

export const STORE_ITEMS: StoreItem[] = [
  ...PROJECT_ITEMS,
  ...EXPERIENCE_ITEMS,
  ...APP_ITEMS,
];

const BY_ID = new Map(STORE_ITEMS.map((item) => [item.id, item]));

export function getStoreItem(id: string) {
  return BY_ID.get(id);
}

export function storeCategories() {
  const counts = new Map<string, number>();
  for (const item of STORE_ITEMS)
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

// Ranked: name prefix, then name, then subtitle/category/tech, then description.
export function searchStore(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const rank = (item: StoreItem) => {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    const meta = `${item.subtitle} ${item.category} ${(item.techStack ?? []).join(" ")}`;
    if (meta.toLowerCase().includes(q)) return 2;
    return item.description.toLowerCase().includes(q) ? 3 : -1;
  };
  return STORE_ITEMS.map((item) => ({ item, score: rank(item) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

export function moreLikeThis(item: StoreItem, limit = 6) {
  return STORE_ITEMS.filter(
    (other) => other.id !== item.id && other.category === item.category,
  ).slice(0, limit);
}

// Which projects use a technology. Names match ignoring punctuation and case
// ("Next.js" = "nextjs"); a prefix counts only for names of 4+ letters, so
// "Tailwind CSS" matches "Tailwind" but "C" doesn't match "Cashfree".
export function projectsUsing(tech: string) {
  const norm = (name: string) =>
    name.toLowerCase().split(" (")[0].replace(/[^a-z0-9+#]/g, "");
  const key = norm(tech);
  const same = (other: string) => {
    const o = norm(other);
    if (o === key) return true;
    return (
      Math.min(o.length, key.length) >= 4 &&
      (o.startsWith(key) || key.startsWith(o))
    );
  };
  return PROJECT_ITEMS.filter((item) => (item.techStack ?? []).some(same));
}

export { MUNEEBOS_VERSION } from "./version";
