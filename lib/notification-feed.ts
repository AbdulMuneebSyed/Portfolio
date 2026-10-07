// The notifications that drop in while someone looks around, drawn from the
// resume. Tier 1 goes first (LinkedIn, GitHub, the resume), then highlights,
// then nudges towards corners of the OS people miss.
export interface FeedItem {
  id: string;
  tier: 1 | 2 | 3;
  appId: string;
  title: string;
  body: string | ((now: Date) => string);
}

// Muneeb's local time, e.g. "2:14 AM", and the hour it falls in.
function hyderabadTime(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
  return { hour, time };
}

export const FEED: FeedItem[] = [
  {
    id: "linkedin-connect",
    tier: 1,
    appId: "linkedin",
    title: "LinkedIn",
    body: "Syed Abdul Muneeb wants to connect. SDE at PulseGen, Hyderabad.",
  },
  {
    id: "github-contributions",
    tier: 1,
    appId: "github-activity",
    title: "GitHub",
    body: "AbdulMuneebSyed has been busy. See this year's contributions and repos.",
  },
  {
    id: "resume-updated",
    tier: 1,
    appId: "resume",
    title: "Resume.pdf updated",
    body: "Now an SDE at PulseGen, building Arrwin, an AI assistant for PMs. Open the full resume.",
  },
  {
    id: "open-to-roles",
    tier: 2,
    appId: "contact",
    title: "Mail",
    body: "Muneeb is open to SDE roles. Have an opportunity? Write to him here.",
  },
  {
    id: "arrwin",
    tier: 2,
    appId: "projects",
    title: "Arrwin · PulseGen",
    body: "Streaming LLM chat and a Daily Brief over MCP connectors, in production for PMs.",
  },
  {
    id: "agent-research",
    tier: 2,
    appId: "projects",
    title: "Research paper",
    body: "His 2026 paper on checkpointed state management for tool-using LLM agents.",
  },
  {
    id: "airesumate",
    tier: 2,
    appId: "projects",
    title: "AiResumate",
    body: "1K+ visitors and $150+ revenue in its first month. See how it was built.",
  },
  {
    id: "pulsegen-adoption",
    tier: 2,
    appId: "about",
    title: "Shipped at PulseGen",
    body: "7-level adoption tracking with Change Streams cut database round-trips by ~80%.",
  },
  {
    id: "hackathon-platform",
    tier: 2,
    appId: "projects",
    title: "E-Cell MJCET",
    body: "The hackathon platform Muneeb's team built passed 500K+ visitors.",
  },
  {
    id: "neet-revamp",
    tier: 2,
    appId: "projects",
    title: "GetMarks · MathonGO",
    body: "The NEET v2 revamp he led shipped as daily NEET users tripled.",
  },
  {
    id: "gfg-rank",
    tier: 2,
    appId: "about",
    title: "Achievement unlocked",
    body: "#1 college rank on GeeksforGeeks, and a 4-star coder there too.",
  },
  {
    id: "hyderabad-time",
    tier: 2,
    appId: "about",
    title: "Muneeb · Hyderabad",
    body: (now) => {
      const { hour, time } = hyderabadTime(now);
      if (hour < 5) return `It's ${time} in Hyderabad. He's probably still shipping something.`;
      if (hour < 12) return `It's ${time} in Hyderabad. Coffee's on, code's compiling.`;
      if (hour < 18) return `It's ${time} in Hyderabad. Deep in the workday right now.`;
      return `It's ${time} in Hyderabad. Side-project hours have begun.`;
    },
  },
  {
    id: "terminal-help",
    tier: 3,
    appId: "terminal",
    title: "Terminal",
    body: "Type help. There's more in here than it looks.",
  },
  {
    id: "mini-apps",
    tier: 3,
    appId: "app-store",
    title: "App Store",
    body: "Free mini-apps are waiting: Snake, 2048, Breakout and more.",
  },
  {
    id: "playlist",
    tier: 3,
    appId: "music",
    title: "Music",
    body: "Muneeb's playlist is queued up. Press play while you look around.",
  },
  {
    id: "masterblaze",
    tier: 3,
    appId: "about",
    title: "Achievement unlocked",
    body: "MasterBlaze winner, Coding Ninjas 2024.",
  },
];

// The next notification to send: unseen, not about an app the visitor has
// already opened, from the earliest tier that has one; random within it.
export function pickNext(
  seen: ReadonlySet<string>,
  openedApps: ReadonlySet<string>,
  random = Math.random,
): FeedItem | null {
  const fresh = FEED.filter((item) => !seen.has(item.id) && !openedApps.has(item.appId));
  if (fresh.length === 0) return null;
  const tier = Math.min(...fresh.map((item) => item.tier));
  const pool = fresh.filter((item) => item.tier === tier);
  return pool[Math.floor(random() * pool.length)];
}

export function feedBody(item: FeedItem, now = new Date()) {
  return typeof item.body === "function" ? item.body(now) : item.body;
}
