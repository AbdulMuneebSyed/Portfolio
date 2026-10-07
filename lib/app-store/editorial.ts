import type { StoreTab } from "./catalog";

// What each App Store tab shows, top to bottom. Data only; the window
// renders each section type with its own component.

// Generated artwork for heroes and cards: a gradient with a motif and,
// optionally, a large app icon on top.
export interface Art {
  colors: [string, string, string];
  motif: "blobs" | "pixels" | "rings" | "stripes" | "confetti" | "grid";
  iconId?: string;
  image?: string;
}

export interface Feature {
  itemId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  art: Art;
}

export type Section =
  | { type: "hero"; feature: Feature }
  | { type: "cards"; cards: Feature[] }
  | { type: "stories"; stories: Feature[] }
  | { type: "shelf"; title: string; itemIds: string[] }
  | { type: "skills"; title: string };

export const TAB_TITLES: Record<StoreTab, string> = {
  discover: "Discover",
  arcade: "Arcade",
  create: "Create",
  work: "Work",
  play: "Play",
  develop: "Develop",
};

const GAMES = [
  "game-2048",
  "word-guess",
  "breakout",
  "tic-tac-toe",
  "memory",
  "simon",
  "snake",
  "minesweeper",
];

export const EDITORIAL: Record<StoreTab, Section[]> = {
  discover: [
    {
      type: "hero",
      feature: {
        itemId: "airesumate",
        eyebrow: "App of the Day",
        title: "Ship a better résumé with AI",
        subtitle: "Gemini, GPT and Claude score and rewrite it in real time.",
        art: { colors: ["#2b1a6b", "#7c5cff", "#ff7ad9"], motif: "blobs", iconId: "airesumate" },
      },
    },
    {
      type: "cards",
      cards: [
        {
          itemId: "getmarks",
          eyebrow: "Projects we love",
          title: "1L+ rank updates every week",
          subtitle: "How GetMarks keeps lakhs of aspirants competing.",
          art: { colors: ["#0b2a5b", "#2f80ed", "#8fd3ff"], motif: "rings", iconId: "getmarks" },
        },
        {
          itemId: "game-2048",
          eyebrow: "New in the Arcade",
          title: "Twelve new apps and games",
          subtitle: "Get them free and they join your Dock.",
          art: { colors: ["#3d2b00", "#edc22e", "#ff9f0a"], motif: "pixels", iconId: "game-2048" },
        },
      ],
    },
    {
      type: "shelf",
      title: "Shipped to Production",
      itemIds: ["arrwin", "airesumate", "getmarks", "hypogen", "agent-checkpoints", "capco", "ecell", "launchpad", "muneebos"],
    },
    {
      type: "stories",
      stories: [
        {
          itemId: "about",
          eyebrow: "Meet the developer",
          title: "Hi, I'm Muneeb",
          subtitle: "Full-stack engineer shipping AI-agent products.",
          art: { colors: ["#4a2600", "#ff9f0a", "#ffd60a"], motif: "confetti", iconId: "about" },
        },
        {
          itemId: "resume",
          eyebrow: "Read the résumé",
          title: "One page, every detail",
          subtitle: "Experience, skills and awards in a PDF.",
          art: { colors: ["#4a0a08", "#e5352b", "#ff9f7a"], motif: "stripes", iconId: "resume" },
        },
        {
          itemId: "contact",
          eyebrow: "Say hello",
          title: "Hiring? Let's talk",
          subtitle: "Messages land straight in my inbox.",
          art: { colors: ["#002a5c", "#0a84ff", "#64d2ff"], motif: "rings", iconId: "contact" },
        },
      ],
    },
    {
      type: "shelf",
      title: "Try It Right Here",
      itemIds: [
        "game-2048",
        "word-guess",
        "typing-test",
        "piano",
        "sketch",
        "json-formatter",
        "tic-tac-toe",
        "breakout",
        "pomodoro",
      ],
    },
    {
      type: "shelf",
      title: "Where I've Worked",
      itemIds: ["exp-pulsegen", "exp-mathongo", "exp-airesumate", "exp-ecell-mjcet"],
    },
  ],
  arcade: [
    {
      type: "hero",
      feature: {
        itemId: "breakout",
        eyebrow: "New on MuneebOS Arcade",
        title: "Smash every brick",
        subtitle: "Breakout, rebuilt for the browser. Three lives. No ads.",
        art: { colors: ["#2a0f00", "#ff6b00", "#ffd60a"], motif: "pixels", iconId: "breakout" },
      },
    },
    { type: "shelf", title: "All Games", itemIds: GAMES },
    {
      type: "stories",
      stories: [
        {
          itemId: "word-guess",
          eyebrow: "Let's play",
          title: "Words developers say",
          subtitle: "Five letters, six tries.",
          art: { colors: ["#0f2410", "#538d4e", "#b59f3b"], motif: "grid", iconId: "word-guess" },
        },
        {
          itemId: "tic-tac-toe",
          eyebrow: "Challenge",
          title: "Try to beat the computer",
          subtitle: "It plays perfect minimax.",
          art: { colors: ["#3a0016", "#ff375f", "#ff9fb4"], motif: "grid", iconId: "tic-tac-toe" },
        },
        {
          itemId: "simon",
          eyebrow: "Brain training",
          title: "Follow the lights",
          subtitle: "One step longer every round.",
          art: { colors: ["#00281a", "#30d158", "#64d2ff"], motif: "rings", iconId: "simon" },
        },
      ],
    },
  ],
  create: [
    {
      type: "hero",
      feature: {
        itemId: "muneebos",
        eyebrow: "Behind the design",
        title: "This portfolio is an app",
        subtitle: "How MuneebOS recreates macOS and iOS in React.",
        art: { colors: ["#001b3d", "#0a84ff", "#bf5af2"], motif: "blobs", iconId: "muneebos" },
      },
    },
    {
      type: "shelf",
      title: "Make Something",
      itemIds: ["sketch", "piano", "color-lab", "notes", "music", "muneebos"],
    },
    {
      type: "cards",
      cards: [
        {
          itemId: "sketch",
          eyebrow: "Apps we love",
          title: "Draw, then save a PNG",
          subtitle: "Brushes, colours and an eraser.",
          art: { colors: ["#3a0016", "#ff2d55", "#ffd60a"], motif: "confetti", iconId: "sketch" },
        },
        {
          itemId: "piano",
          eyebrow: "Apps we love",
          title: "Play by ear",
          subtitle: "Your keyboard is now a piano.",
          art: { colors: ["#0b0b0c", "#3a3a3c", "#f2f2f7"], motif: "stripes", iconId: "piano" },
        },
      ],
    },
  ],
  work: [
    {
      type: "cards",
      cards: [
        {
          itemId: "exp-pulsegen",
          eyebrow: "Now working at",
          title: "PulseGen",
          subtitle: "Arrwin, an AI assistant for PMs, and search across 400K+ accounts.",
          art: { colors: ["#1a1446", "#5856d6", "#64d2ff"], motif: "grid", iconId: "exp-pulsegen" },
        },
        {
          itemId: "exp-mathongo",
          eyebrow: "Previously",
          title: "MathonGO (GetMarks)",
          subtitle: "Leagues, LMS and the NEET v2 revamp.",
          art: { colors: ["#0b2a5b", "#2f80ed", "#8fd3ff"], motif: "rings", iconId: "exp-mathongo" },
        },
      ],
    },
    {
      type: "shelf",
      title: "Experience",
      itemIds: ["exp-pulsegen", "exp-mathongo", "exp-airesumate", "exp-ecell-mjcet", "resume", "contact"],
    },
    {
      type: "shelf",
      title: "Great Productivity Apps",
      itemIds: ["pomodoro", "typing-test", "notes", "calculator", "terminal", "task-manager"],
    },
  ],
  play: [
    {
      type: "hero",
      feature: {
        itemId: "word-guess",
        eyebrow: "Game of the Day",
        title: "Guess the developer word",
        subtitle: "Six tries. Green is right, yellow is close.",
        art: { colors: ["#0f2410", "#538d4e", "#b59f3b"], motif: "grid", iconId: "word-guess" },
      },
    },
    {
      type: "stories",
      stories: [
        {
          itemId: "game-2048",
          eyebrow: "Let's play",
          title: "Just one more go",
          subtitle: "Slide, merge and reach 2048.",
          art: { colors: ["#3d2b00", "#edc22e", "#f67c5f"], motif: "pixels", iconId: "game-2048" },
        },
        {
          itemId: "memory",
          eyebrow: "From the developer",
          title: "Remember the stack",
          subtitle: "Match pairs of tech logos.",
          art: { colors: ["#2a0b3d", "#bf5af2", "#ff9fdc"], motif: "confetti", iconId: "memory" },
        },
        {
          itemId: "music",
          eyebrow: "Listen",
          title: "My playlist",
          subtitle: "Songs I code to.",
          art: { colors: ["#3d0010", "#fa2d48", "#ff9f0a"], motif: "rings", iconId: "music" },
        },
      ],
    },
    { type: "shelf", title: "Best New Games", itemIds: GAMES },
  ],
  develop: [
    {
      type: "hero",
      feature: {
        itemId: "json-formatter",
        eyebrow: "Tools for builders",
        title: "Readable JSON, instantly",
        subtitle: "Format, minify and find the exact error.",
        art: { colors: ["#130f3d", "#5e5ce6", "#64d2ff"], motif: "grid", iconId: "json-formatter" },
      },
    },
    {
      type: "shelf",
      title: "Developer Tools",
      itemIds: ["json-formatter", "color-lab", "terminal", "github-activity", "ie", "task-manager"],
    },
    { type: "skills", title: "My Stack" },
  ],
};
