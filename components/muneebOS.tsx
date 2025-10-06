"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ProfileCard = {
  id: string;
  idx?: number;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  href?: string;
};

type Ripple = {
  id: number;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  accent: string;
};

type FloatingNotification = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  href: string;
};

const PROFILE_CARDS: ProfileCard[] = [
  {
    id: "now",
    title: "Right now",
    subtitle: "Product Designer",
    description: "Crafting playful web experiences.",
    accent: "from-sky-500/70 to-cyan-400/70",
  },
  {
    id: "latest",
    title: "Latest project",
    subtitle: "Torch Mobile",
    description: "An immersive productivity OS in the browser.",
    accent: "from-purple-500/70 to-pink-500/70",
  },
  {
    id: "reach-out",
    title: "Let’s talk",
    subtitle: "Always open",
    description: "Swipe for contact options and collabs.",
    accent: "from-emerald-500/70 to-lime-400/70",
  },
  {
    id: "latest-archive",
    title: "Torch beta",
    subtitle: "Designing future workflows",
    description: "Experimenting with motion-driven UX systems.",
    accent: "from-orange-500/70 to-amber-400/70",
  },
  {
    id: "connect",
    title: "Mail me",
    subtitle: "hello@muneeb.design",
    description: "Let’s ship something memorable together.",
    accent: "from-rose-500/70 to-pink-500/70",
  },
];

const FLOATING_SOCIAL_NOTIFICATIONS: FloatingNotification[] = [
  {
    id: "float-linkedin",
    title: "Hey stranger",
    subtitle: "Let’s connect on LinkedIn",
    accent: "from-sky-500/80 to-cyan-500/80",
    href: "https://www.linkedin.com/in/syed-abdul-muneeb/",
  },
  {
    id: "float-instagram",
    title: "Slide into my DMs",
    subtitle: "Follow along on Instagram",
    accent: "from-pink-500/80 to-rose-500/80",
    href: "https://www.instagram.com/_.muxeeb",
  },
];

type MobileAppId =
  | "chrome"
  | "contact"
  | "camera"
  | "reaction"
  | "numbers"
  | "gfg"
  | "resume"
  | "music";
type HomeOverlayAppId = "gfg" | "resume" | "music";

type ChromeBookmark = {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
  accent: string;
  category: string;
};

const CHROME_BOOKMARKS: ChromeBookmark[] = [
  {
    id: "airesumate",
    title: "AIresumate",
    url: "https://airesumate.com/",
    description:
      "AI-powered resume enhancement platform crafted for job seekers.",
    image: "/ai-chat-interface.png",
    accent: "from-sky-500/30 to-cyan-500/30",
    category: "AI Career Assist",
  },
  {
    id: "paighaam",
    title: "Paighaam Chat",
    url: "https://paighaam-alpha.vercel.app/",
    description: "Real-time multilingual messaging with expressive UI details.",
    image: "/task-management-interface.png",
    accent: "from-purple-500/30 to-pink-500/30",
    category: "Realtime WebApp",
  },
  {
    id: "commerce",
    title: "Commerce Dashboard",
    url: "https://abdulmuneebsyed.github.io/ecommerce-dashboard/",
    description: "Analytics-first admin dashboard for modern online stores.",
    image: "/ecommerce-dashboard.png",
    accent: "from-amber-500/30 to-orange-500/30",
    category: "Data Visualization",
  },
  {
    id: "portfolio",
    title: "Portfolio Showcase",
    url: "https://abdulmuneebsyed.github.io/portfolio-site/",
    description: "Framer Motion powered personal site celebrating playful UX.",
    image: "/portfolio-website-showcase.png",
    accent: "from-emerald-500/30 to-lime-500/30",
    category: "Personal Brand",
  },
];

const HOME_APPS = [
  {
    id: "gfg" as const,
    title: "GeeksforGeeks",
    description: "Track problem streaks, articles, and badges in one glance.",
    icon: "/internet_explorer.png",
    accent: "from-emerald-500/40 via-emerald-400/30 to-teal-500/30",
    type: "overlay" as const,
  },
  {
    id: "github" as const,
    title: "GitHub",
    description: "Jump straight to repos, commits, and stars.",
    icon: "/torch.png",
    accent: "from-stone-500/40 via-neutral-500/30 to-stone-700/30",
    type: "external" as const,
    href: "https://github.com/AbdulMuneebSyed",
  },
  {
    id: "resume" as const,
    title: "Resume",
    description: "Review the latest resume or download it instantly.",
    icon: "/pdf.png",
    accent: "from-blue-500/40 via-sky-500/30 to-cyan-500/30",
    type: "overlay" as const,
  },
  {
    id: "music" as const,
    title: "Now Playing",
    description: "Cue up Regrets or For A Reason inside muneebOS.",
    icon: "/games.png",
    accent: "from-rose-500/40 via-fuchsia-500/30 to-purple-500/30",
    type: "overlay" as const,
  },
];

const CONTACT_CARDS = [
  {
    label: "Email",
    value: "samuneeb786@gmail.com",
    accent: "from-blue-500/20 to-sky-500/30",
    href: "mailto:samuneeb786@gmail.com",
    icon: "📧",
  },
  {
    label: "Phone",
    value: "+91 99667 82707",
    accent: "from-green-500/20 to-emerald-500/30",
    href: "tel:+919966782707",
    icon: "📱",
  },
  {
    label: "Location",
    value: "Hyderabad, India",
    accent: "from-amber-500/20 to-orange-500/30",
    href: undefined,
    icon: "📍",
  },
  {
    label: "LinkedIn",
    value: "syed-abdul-muneeb",
    accent: "from-blue-600/20 to-slate-600/30",
    href: "https://www.linkedin.com/in/syed-abdul-muneeb/",
    icon: "💼",
  },
  {
    label: "GitHub",
    value: "AbdulMuneebSyed",
    accent: "from-purple-500/20 to-indigo-500/30",
    href: "https://github.com/AbdulMuneebSyed",
    icon: "💻",
  },
];

const shuffleArray = <T,>(input: T[]): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Torch v2 is live",
    description: "Check out the new animation system you shipped yesterday.",
    time: "2m",
    accent: "bg-sky-400/80",
  },
  {
    id: "notif-2",
    title: "Portfolio feedback",
    description: "Sara sent detailed thoughts on the Windows nostalgia flow.",
    time: "18m",
    accent: "bg-purple-400/80",
  },
  {
    id: "notif-3",
    title: "Coffee run?",
    description: "Arsalan dropped a calendar invite for 4:15pm.",
    time: "1h",
    accent: "bg-amber-400/80",
  },
];

const PANEL_HEIGHT = 440;
const PANEL_HANDLE_HEIGHT = 36;
const BATTERY_LEVEL = 69;

const FINGERPRINT_VIBRATION_PATTERN: number[] = [0, 28, 20, 32];

const vibrateDevice = (pattern: number | number[]) => {
  if (typeof window === "undefined") return;
  try {
    const { navigator } = window;
    if (typeof navigator?.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Silently ignore vibration errors (e.g., unsupported environments)
  }
};

const formatter = {
  statusTime: new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }),
  largeTime: new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }),
  fullDate: new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
};

const wallpaperStyle: CSSProperties = {
  height: "100dvh",
  backgroundImage: "url('/nothing-wallpaper.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#000",
};

type TopStatusBarProps = {
  time: string;
  dataSpeed: string;
  batteryLevel?: number;
};

const TopStatusBar = ({
  time,
  dataSpeed,
  batteryLevel = BATTERY_LEVEL,
}: TopStatusBarProps) => {
  const clampedBattery = Math.min(Math.max(batteryLevel, 0), 100);

  return (
    <div className="flex items-center justify-between px-3 py-2 text-white">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-black flex items-center justify-center rounded-full">
          <div className="h-2 w-2 bg-white/10 rounded-full"></div>
        </div>
        <span className="text-sm font-medium tracking-wide drop-shadow-lg">
          {time}
        </span>
      </div>
      <div className="flex items-center space-x-2 text-white/90">
        <div className="flex flex-col leading-[0.8] text-right">
          <span className="text-[10px] font-semibold tracking-wide">
            {dataSpeed}
          </span>
          <span className="text-[7px] uppercase tracking-[0.2em] text-white/70">
            KB/s
          </span>
        </div>
        <span className="text-xs font-semibold tracking-wide">
          {batteryLevel}%
        </span>
        <div className="w-6 h-3 border border-white/80 rounded-sm flex items-center px-[1px]">
          <div
            className="h-[9px] rounded-2xl bg-white"
            style={{ width: `${clampedBattery}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl">
    <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
      {label}
    </p>
    <p className="mt-2 text-sm font-semibold text-white/85">{value}</p>
  </div>
);

const DockIcon = ({ label, icon, onPress }: DockLaunch) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.9 }}
    onClick={onPress}
    className="flex flex-col items-center gap-2"
  >
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-3xl bg-black/80 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
      <Image
        src={icon}
        alt={label}
        width={32}
        height={32}
        className="h-8 w-8"
      />
    </div>
    {/* <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/70">
      {label}
    </span> */}
  </motion.button>
);

type HomeApp = (typeof HOME_APPS)[number];
type HomeAppWithAction = HomeApp & { onLaunch: () => void };

const HomeAppCard = ({ app }: { app: HomeAppWithAction }) => (
  <motion.button
    type="button"
    layout
    whileTap={{ scale: 0.97 }}
    onClick={app.onLaunch}
    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-5 text-left text-white shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
  >
    <div
      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${app.accent} opacity-80 transition-opacity group-hover:opacity-100`}
    />
    <div className="relative z-10 flex items-start justify-between gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
        <Image
          src={app.icon}
          alt={app.title}
          width={26}
          height={26}
          className="h-6 w-6"
        />
      </div>
      <span className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
        Launch
      </span>
    </div>
    <div className="relative z-10 mt-6 space-y-2">
      <h3 className="text-xl font-semibold leading-tight drop-shadow-sm">
        {app.title}
      </h3>
      <p className="text-sm text-white/80">{app.description}</p>
    </div>
    <div className="relative z-10 mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/75">
      <span>Tap to open</span>
      <span>↗</span>
    </div>
  </motion.button>
);

const QuickReactionGame = () => {
  type GameState = "idle" | "waiting" | "ready" | "result" | "too-soon";

  const [state, setState] = useState<GameState>("idle");
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState("Tap when the card glows.");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startTimeRef.current = null;
  };

  const start = () => {
    reset();
    setResult(null);
    setMessage("Wait for the glow…");
    setState("waiting");

    const delay = Math.random() * 1800 + 1400;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setState("ready");
      setMessage("Tap now!");
    }, delay);
  };

  const handleTap = () => {
    if (state === "idle") {
      start();
      return;
    }

    if (state === "waiting") {
      reset();
      setState("too-soon");
      setMessage("Too soon! Try again.");
      return;
    }

    if (state === "ready" && startTimeRef.current) {
      const reactionTime = performance.now() - startTimeRef.current;
      setResult(reactionTime);
      setState("result");
      setMessage("Nice! Tap to try again.");
      reset();
      return;
    }

    start();
  };

  useEffect(() => () => reset(), []);

  return (
    <motion.article
      layout
      onClick={handleTap}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 px-5 py-6 backdrop-blur-2xl transition-colors ${
        state === "ready" ? "bg-emerald-500/30" : "bg-black/60"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-active:opacity-40" />
      <div className="relative z-10 flex flex-col gap-3 text-white">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold">Reaction Dash</h3>
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            Tap to play
          </span>
        </div>
        <p className="text-sm text-white/75">{message}</p>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Latest reaction
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {Math.round(result)}
              <span className="ml-1 text-sm font-medium text-white/70">ms</span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

const NumberTapSprint = () => {
  const [tiles, setTiles] = useState(() =>
    shuffleArray(Array.from({ length: 9 }, (_, idx) => idx + 1))
  );
  const [target, setTarget] = useState(1);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("Tap numbers 1 through 9 in order.");
  const startRef = useRef<number | null>(null);

  const handlePress = (value: number) => {
    if (value !== target) {
      setFeedback("Stay sharp—hit the next number in sequence.");
      return;
    }

    if (target === 1) {
      startRef.current = performance.now();
    }

    if (value === 9 && startRef.current) {
      const elapsed = performance.now() - startRef.current;
      setBestTime((prev) => (prev ? Math.min(prev, elapsed) : elapsed));
      setTiles(shuffleArray(Array.from({ length: 9 }, (_, idx) => idx + 1)));
      setTarget(1);
      setFeedback("🔥 Sprint complete! Tap any tile to play again.");
      startRef.current = null;
      return;
    }

    setTarget((prev) => prev + 1);
    setFeedback(`Nice! You're chasing ${target + 1}.`);
  };

  return (
    <motion.article
      layout
      className="rounded-3xl border border-white/10 bg-black/60 px-5 py-6 backdrop-blur-2xl"
    >
      <div className="flex items-baseline justify-between text-white">
        <h3 className="text-lg font-semibold">Number Tap Sprint</h3>
        <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
          Level up
        </span>
      </div>
      <p className="mt-3 text-sm text-white/75">{feedback}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {tiles.map((value) => (
          <motion.button
            key={value}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePress(value)}
            className={`flex h-16 items-center justify-center rounded-2xl border border-white/10 text-lg font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-colors ${
              value < target ? "bg-emerald-500/40" : "bg-white/10"
            }`}
          >
            {value}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-white/70">
        <div>
          <p className="uppercase tracking-[0.35em] text-white/50">Target</p>
          <p className="mt-1 text-xl font-semibold text-white">{target}</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-[0.35em] text-white/50">
            Best sprint
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {bestTime ? `${Math.round(bestTime)} ms` : "—"}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

const AppOverlay = ({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <motion.div
    className="fixed inset-0 z-[1600] flex flex-col bg-black/85 text-white backdrop-blur-xl"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 border-b border-white/10 bg-black/70 px-5 py-4"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
        <Image
          src={icon}
          alt={title}
          width={28}
          height={28}
          className="h-7 w-7"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.3em] text-white/50">
          Mobile app view
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onClose}
        className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80"
      >
        Close
      </motion.button>
    </motion.header>
    <div className="flex-1 overflow-hidden">{children}</div>
  </motion.div>
);

const MobileChromeApp = () => {
  const [activeBookmark, setActiveBookmark] = useState<ChromeBookmark | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPendingTimeout(), [clearPendingTimeout]);

  const currentUrl = activeBookmark?.url ?? "chrome://newtab";

  const currentHostname = useMemo(() => {
    if (!activeBookmark) return "chrome://newtab";
    try {
      return new URL(activeBookmark.url).hostname;
    } catch (error) {
      return activeBookmark.url;
    }
  }, [activeBookmark]);

  const handleOpenBookmark = useCallback(
    (bookmark: ChromeBookmark) => {
      clearPendingTimeout();
      setActiveBookmark(bookmark);
      setIsLoading(true);
      setLoadError(null);

      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setLoadError(
          "This project might block embedding. Use the Open Site button to view it in a dedicated tab."
        );
      }, 6500);
    },
    [clearPendingTimeout]
  );

  const handleReturnHome = useCallback(() => {
    clearPendingTimeout();
    setActiveBookmark(null);
    setIsLoading(false);
    setLoadError(null);
  }, [clearPendingTimeout]);

  const handleIframeLoad = useCallback(() => {
    clearPendingTimeout();
    setIsLoading(false);
  }, [clearPendingTimeout]);

  return (
    <div className="flex h-full flex-col text-white">
      <div className="border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Image src="/chrome.png" alt="Chrome" width={28} height={28} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {activeBookmark ? activeBookmark.title : "Chrome"}
            </p>
            <p className="truncate text-[11px] text-white/60">
              {currentHostname}
            </p>
          </div>
          {activeBookmark && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleReturnHome}
              className="ml-auto rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70"
            >
              New tab
            </motion.button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[11px] text-white/60">
          <span className="font-semibold text-white/70">{"🔍"}</span>
          <span className="truncate">
            {currentUrl === "chrome://newtab"
              ? "Search or type web address"
              : currentUrl}
          </span>
        </div>
      </div>

      {!activeBookmark ? (
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              New tab
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              What are we browsing today?
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/70">
              Tap a project to open it inside Chrome. Each preview loads right
              here, so you can explore without leaving muneebOS.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CHROME_BOOKMARKS.map((bookmark) => (
                <motion.button
                  key={bookmark.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenBookmark(bookmark)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative h-32 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${bookmark.accent} opacity-80 transition-opacity group-hover:opacity-100`}
                    />
                    <Image
                      src={bookmark.image}
                      alt={bookmark.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover opacity-80 mix-blend-overlay"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
                      {bookmark.category}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col justify-between px-4 py-4 text-white">
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {bookmark.title}
                      </h3>
                      <p className="mt-2 text-xs text-white/70 line-clamp-3">
                        {bookmark.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/50">
                      <span>Preview</span>
                      <span>Tap to open</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden bg-black/80">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
          <iframe
            key={activeBookmark.id}
            src={activeBookmark.url}
            title={activeBookmark.title}
            className="h-full w-full border-0 bg-black"
            onLoad={handleIframeLoad}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 z-30 rounded-3xl border border-white/10 bg-black/70 px-4 py-4 text-xs text-white/70 backdrop-blur-xl">
            <p className="text-[11px] font-medium text-white/75">
              {activeBookmark.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleReturnHome}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
              >
                Back to new tab
              </motion.button>
              <motion.a
                whileTap={{ scale: 0.94 }}
                href={activeBookmark.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-black"
              >
                Open site
              </motion.a>
            </div>
            {loadError && (
              <p className="mt-3 text-[10px] leading-relaxed text-amber-200/80">
                {loadError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileContactApp = () => (
  <div className="flex h-full flex-col text-white">
    {/* <div className="flex items-center gap-3 border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
      <Image src="/contact.png" alt="Contact" width={28} height={28} />
      <div>
        <p className="text-sm font-semibold">Reach me out</p>
      </div>
    </div> */}

    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent px-5 py-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Snapshot
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          Software Engineering Student
        </h3>
        <p className="mt-2 text-sm text-white/75">
          Passionate about playful interfaces, resilience engineering, and
          communities that learn together.
        </p>
        <motion.a
          whileTap={{ scale: 0.96 }}
          href="/2Syed Abdul Muneeb's SE Resume.pdf"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black"
        >
          View resume
        </motion.a>
      </div>

      <div className="space-y-3">
        {CONTACT_CARDS.map((card) => (
          <motion.a
            key={card.label}
            whileTap={{ scale: 0.97 }}
            href={card.href ?? undefined}
            target={card.href?.startsWith("http") ? "_blank" : undefined}
            rel={card.href?.startsWith("http") ? "noreferrer" : undefined}
            className={`block rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} px-5 py-4`}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                  {card.label}
                </p>
                <p className="mt-1 text-lg font-semibold">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </div>
);

const MobileCameraApp = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setError("Camera not supported in this environment.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {
            setError("Unable to start video stream.");
          });
        }
      } catch (err) {
        setError("Camera permission denied. Enable access to capture moments.");
      }
    };

    void startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleCapture = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setSnapshots((prev) => [dataUrl, ...prev].slice(0, 6));
  };

  return (
    <div className="flex h-full flex-col bg-black/80 text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/camera.png" alt="Camera" width={28} height={28} />
          <div>
            <p className="text-sm font-semibold">Capture Studio</p>
            <p className="text-[11px] text-white/60">Document the journey</p>
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handleCapture}
          className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-black"
        >
          Snap
        </motion.button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/70">
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Tip: try using Chrome on desktop/mobile.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            autoPlay
            muted
          />
        )}
      </div>

      {snapshots.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-black/70 px-4 py-3">
          {snapshots.map((src, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={src}
                alt={`Snapshot ${idx + 1}`}
                className="h-20 w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GfgApp = () => {
  const profileUrl = "https://www.geeksforgeeks.org/user/samuneeb/";
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timeout = setTimeout(() => setShowHint(true), 4500);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div className="flex h-full flex-col bg-black/80 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
        <Image
          src="/internet_explorer.png"
          alt="GeeksforGeeks"
          width={28}
          height={28}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            GeeksforGeeks Profile
          </p>
          <p className="truncate text-[11px] text-white/60">samuneeb</p>
        </div>
        <motion.a
          whileTap={{ scale: 0.95 }}
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-full border border-white/15 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-black"
        >
          Open tab
        </motion.a>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-md">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Loading profile…
            </p>
          </div>
        )}
        <iframe
          src={profileUrl}
          title="GeeksforGeeks profile"
          className="h-full w-full border-0 bg-black"
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
        {showHint && isLoading && (
          <div className="absolute bottom-4 left-4 right-4 z-30 rounded-3xl border border-white/15 bg-black/70 px-4 py-3 text-xs text-white/70 backdrop-blur-xl">
            <p>
              If the profile stays blank, GeeksforGeeks may block embeds. Tap
              “Open tab” above to view it directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResumeApp = () => {
  const resumePath = "/2Syed Abdul Muneeb's SE Resume.pdf";

  return (
    <div className="flex h-full flex-col bg-black/85 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
        <Image src="/pdf.png" alt="Resume" width={28} height={28} />
        <div>
          <p className="text-sm font-semibold">Resume Viewer</p>
          <p className="text-[11px] text-white/60">Syed Abdul Muneeb</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white/95">
        <iframe
          src={`${resumePath}#toolbar=0`}
          title="Resume Preview"
          className="h-full w-full border-0"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-black/60 px-4 py-3 text-xs text-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
            PDF
          </span>
          <p>Updated resume ready to share.</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.a
            whileTap={{ scale: 0.95 }}
            href={resumePath}
            download
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            Download
          </motion.a>
          <motion.a
            whileTap={{ scale: 0.95 }}
            href={resumePath}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black"
          >
            Open tab
          </motion.a>
        </div>
      </div>
    </div>
  );
};

const MusicApp = () => {
  const tracks = useMemo(
    () => [
      {
        id: "regrets",
        title: "Regrets",
        description: "Ambient reflection track.",
        src: "/regrets.mp3",
      },
      {
        id: "for-a-reason",
        title: "For A Reason",
        description: "Lo-fi vibes to focus and flow.",
        src: "/ForAReason.mp3",
      },
    ],
    []
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState(() => tracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});

  const currentTrack =
    tracks.find((track) => track.id === currentTrackId) ?? tracks[0];

  useEffect(() => {
    let isMounted = true;

    const preloadDurations = async () => {
      await Promise.all(
        tracks.map(
          (track) =>
            new Promise<void>((resolve) => {
              const audio = new Audio(track.src);
              audio.preload = "metadata";
              const handleLoaded = () => {
                if (isMounted) {
                  setDurations((prev) => ({
                    ...prev,
                    [track.id]: audio.duration,
                  }));
                }
                cleanup();
              };
              const handleError = () => {
                cleanup();
              };
              const cleanup = () => {
                audio.removeEventListener("loadedmetadata", handleLoaded);
                audio.removeEventListener("error", handleError);
                resolve();
              };
              audio.addEventListener("loadedmetadata", handleLoaded);
              audio.addEventListener("error", handleError);
              audio.load();
            })
        )
      );
    };

    void preloadDurations();

    return () => {
      isMounted = false;
    };
  }, [tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentTrack.src;
    audio.load();
    const playPromise = audio.play();
    playPromise
      ?.then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, []);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    },
    []
  );

  const formatDuration = useCallback((seconds?: number) => {
    if (!seconds || Number.isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="flex h-full flex-col bg-black/85 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
        <Image src="/games.png" alt="Music" width={28} height={28} />
        <div>
          <p className="text-sm font-semibold">Music Folder</p>
          <p className="text-[11px] text-white/60">Two-track mini player</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-5">
        <div className="rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Snap games
              </p>
              <h3 className="mt-1 text-lg font-semibold">Reaction Dash</h3>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
              Play now
            </span>
          </div>
          <div className="mt-4">
            <QuickReactionGame />
          </div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Now playing
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {currentTrack.title}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            {currentTrack.description}
          </p>
          <audio ref={audioRef} controls className="mt-4 w-full">
            <track kind="captions" />
          </audio>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/60">
            {isPlaying ? "Playing" : "Paused"}
          </p>
        </div>

        <div className="space-y-3">
          {tracks.map((track) => (
            <motion.button
              key={track.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentTrackId(track.id)}
              className={`flex w-full items-center justify-between rounded-3xl border border-white/10 px-4 py-3 text-left transition-colors ${
                track.id === currentTrackId
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/70"
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{track.title}</p>
                <p className="text-[11px] uppercase tracking-[0.25em]">
                  {track.id === currentTrackId ? "Now playing" : "Tap to play"}
                </p>
              </div>
              <span className="text-xs font-semibold">
                {formatDuration(durations[track.id])}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

type LockScreenProps = {
  statusTime: string;
  formattedTime: string;
  formattedDate: string;
  dataSpeed: string;
  cards: ProfileCard[];
  ripples: Ripple[];
  isLocked: boolean;
  isInitialRender: boolean;
  isUnlocking: boolean;
  onFingerprintStart: () => void;
  onFingerprintEnd: () => void;
  onCardDismiss: (id: string) => void;
};

const LockScreen = ({
  statusTime,
  formattedTime,
  formattedDate,
  dataSpeed,
  cards,
  ripples,
  isLocked,
  isInitialRender,
  isUnlocking,
  onFingerprintStart,
  onFingerprintEnd,
  onCardDismiss,
}: LockScreenProps) => {
  return (
    <div className="relative w-full overflow-hidden" style={wallpaperStyle}>
      <div className="flex h-full flex-col justify-between">
        <TopStatusBar
          time={statusTime}
          dataSpeed={dataSpeed}
          batteryLevel={BATTERY_LEVEL}
        />

        <div className="flex flex-1 flex-col items-start justify-start px-4 text-white">
          <div className="grid w-full grid-cols-3 gap-3">
            <motion.div
              initial={isInitialRender ? { y: 40, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="col-span-2 rounded-3xl bg-black/80 px-6 py-5 text-center backdrop-blur-2xl"
            >
              <TimeDisplay
                time={formattedTime}
                isInitial={isInitialRender && isLocked}
              />
              <DateDisplay
                date={formattedDate}
                isInitial={isInitialRender && isLocked}
              />
            </motion.div>

            <motion.div
              initial={isInitialRender ? { y: 40, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
              className="flex items-center justify-center rounded-2xl bg-black/80 p-2 backdrop-blur-2xl"
            >
              <Image
                src="/avatar.jpg"
                alt="Muneeb avatar"
                width={96}
                height={96}
                className="rounded-lg border border-white/20 object-cover"
                priority
              />
            </motion.div>
          </div>

          <div className="mt-6 w-full">
            <AnimatePresence>
              {cards.map((card, idx) => (
                <SwipeCard
                  idx={idx}
                  key={card.id}
                  card={card}
                  onDismiss={() => onCardDismiss(card.id)}
                />
              ))}
            </AnimatePresence>
            {/* {!cards.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                className="rounded-2xl border border-white/20 bg-black/50 px-4 py-6 text-center text-sm text-white/60"
              >
                Cards cleared. Unlock to continue.
              </motion.div>
            )} */}
          </div>
        </div>

        <div className="flex justify-center select-none pb-20">
          <div className="relative">
            <motion.div
              id="fingerprint-area"
              className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-white/40 transition-all duration-300 ${
                isUnlocking
                  ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
                  : "hover:border-white/60"
              }`}
              whileTap={{ scale: 0.95 }}
              animate={
                isUnlocking
                  ? {
                      borderColor: "#4ade80",
                      backgroundColor: "rgba(74, 222, 128, 0.18)",
                      scale: 1.05,
                    }
                  : undefined
              }
              onTouchStart={onFingerprintStart}
              onTouchEnd={onFingerprintEnd}
              onTouchCancel={onFingerprintEnd}
              onMouseDown={onFingerprintStart}
              onMouseUp={onFingerprintEnd}
              onMouseLeave={onFingerprintEnd}
            >
              <FingerprintIcon isActive={isUnlocking} />
            </motion.div>

            <AnimatePresence>
              {ripples.map((ripple) => (
                <motion.div
                  key={ripple.id}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-0 right-0 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-sm text-white"
          >
            Hold to unlock
          </motion.p>
        </div>
      </div>
    </div>
  );
};

const FingerprintIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    className={`transition-colors duration-300 ${
      isActive ? "text-emerald-400" : "text-white/80"
    }`}
  >
    <path
      d="M12 2C9.79 2 8 3.79 8 6v4c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-3.31 2.69-6 6-6s6 2.69 6 6v4c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-1.1-.9-2-2-2z"
      fill="currentColor"
    />
    <path
      d="M12 14c-1.1 0-2-.9-2-2V6c0-.55.45-1 1-1s1 .45 1 1v6c0 .55.45 1 1 1s1-.45 1-1V6c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 2.21 1.79 4 4 4s4-1.79 4-4v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2z"
      fill="currentColor"
    />
  </svg>
);

const TimeDisplay = ({
  time,
  isInitial,
}: {
  time: string;
  isInitial: boolean;
}) => (
  <motion.h2
    initial={isInitial ? { y: 40, opacity: 0 } : false}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="text-5xl font-bold tracking-tight drop-shadow-lg md:text-6xl"
  >
    {time}
  </motion.h2>
);

const DateDisplay = ({
  date,
  isInitial,
}: {
  date: string;
  isInitial: boolean;
}) => (
  <motion.p
    initial={isInitial ? { y: 40, opacity: 0 } : false}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
    className="mt-2 text-sm font-medium uppercase tracking-[0.3em] text-white/70"
  >
    {date}
  </motion.p>
);

const FloatingNotificationToast = ({
  notification,
  onDismiss,
}: {
  notification: FloatingNotification;
  onDismiss: (id: string) => void;
}) => {
  const handleActivate = () => {
    if (typeof window === "undefined") return;
    window.open(notification.href, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss(notification.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ y: -80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -70, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      drag="y"
      dragConstraints={{ top: -160, bottom: 120 }}
      dragElastic={0.25}
      whileDrag={{ scale: 0.97 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40 || info.velocity.y < -500) {
          onDismiss(notification.id);
          return;
        }

        if (info.offset.y > 45 || info.velocity.y > 500) {
          handleActivate();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleActivate}
      className={`pointer-events-auto w-[90%] max-w-sm rounded-3xl border border-white/20 bg-black/80 px-4 py-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-3xl`}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/avatar.jpg"
          alt="Profile"
          width={42}
          height={42}
          className="rounded-2xl border border-white/30 object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold leading-tight">
            {notification.title}
          </h3>
          <p className="text-xs font-medium text-white/85">
            {notification.subtitle}
          </p>
        </div>
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.9, y: 0 }}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
        >
          Tap
        </motion.span>
      </div>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/70">
        Swipe up to dismiss
      </p>
    </motion.div>
  );
};

const SwipeCard = ({
  card,
  onDismiss,
  idx,
}: {
  card: ProfileCard;
  onDismiss: () => void;
  idx?: number;
}) => {
  const index = idx ?? 0;
  const isStacked = index > 1;
  const stackDepth = Math.max(0, index - 1);
  const scale = isStacked ? Math.max(0.88, 1 - stackDepth * 0.04) : 1;
  const initialY = index === 0 ? -36 : index === 1 ? -18 : 24;

  const cardStyle: CSSProperties = {
    marginTop: index === 0 ? 12 : index === 1 ? 10 : -18,
    marginLeft: index <= 1 ? 4 : 0,
    marginRight: index <= 1 ? 4 : 0,
    zIndex: 60 - index,
  };

  const handleActivate = () => {
    if (!card.href || typeof window === "undefined") return;
    window.open(card.href, "_blank", "noopener,noreferrer");
  };

  const handleKeyPress = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!card.href) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      whileDrag={{ scale: 0.95 }}
      onDragEnd={(_, info) => {
        const threshold = 120;
        if (
          Math.abs(info.offset.x) > threshold ||
          Math.abs(info.velocity.x) > 600
        ) {
          onDismiss();
        }
      }}
      initial={{ opacity: 0, y: initialY, scale }}
      animate={{
        opacity: 1,
        y: isStacked ? -stackDepth * 6 : 0,
        scale,
      }}
      exit={{ opacity: 0, x: 120, transition: { duration: 0.25 } }}
      style={cardStyle}
      className={`relative flex items-center gap-3 rounded-2xl border border-white/15 bg-black/90 px-4 py-2 text-white backdrop-blur-2xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
        card.href ? "cursor-pointer" : ""
      }`}
      role={card.href ? "button" : undefined}
      tabIndex={card.href ? 0 : undefined}
      onClick={handleActivate}
      onKeyDown={handleKeyPress}
    >
      <Image
        src={"/avatar.jpg"}
        alt=""
        width={40}
        height={40}
        className="pointer-events-none rounded-full border border-white/10"
      />
      <div>
        <h3 className="text-sm font-semibold">{card.title}</h3>
        <p className="text-xs font-medium text-white/70">{card.subtitle}</p>
      </div>
      {index === 0 && (
        <p className="absolute right-2 text-[10px] font-medium text-white/30">
          Swipe to dismiss
        </p>
      )}
    </motion.div>
  );
};

type HomeScreenProps = {
  statusTime: string;
  dataSpeed: string;
  onRelock: () => void;
  onOpenApp: (app: MobileAppId) => void;
  onOpenLinkedIn: () => void;
};

type DockLaunch = {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
};

const HomeScreen = ({
  statusTime,
  dataSpeed,
  onRelock,
  onOpenApp,
  onOpenLinkedIn,
}: HomeScreenProps) => {
  const dockItems: DockLaunch[] = useMemo(
    () => [
      {
        id: "chrome",
        label: "Chrome",
        icon: "/chrome.png",
        onPress: () => onOpenApp("chrome"),
      },
      {
        id: "contact",
        label: "Contact",
        icon: "/contact.png",
        onPress: () => onOpenApp("contact"),
      },
      {
        id: "camera",
        label: "Camera",
        icon: "/camera.png",
        onPress: () => onOpenApp("camera"),
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        icon: "/linkedin.png",
        onPress: onOpenLinkedIn,
      },
    ],
    [onOpenApp, onOpenLinkedIn]
  );

  const homeApps = useMemo(
    () =>
      HOME_APPS.map((app) => ({
        ...app,
        onLaunch: () => {
          if (app.type === "external" && app.href) {
            vibrateDevice([0, 18]);
            if (typeof window !== "undefined") {
              window.open(app.href, "_blank", "noopener,noreferrer");
            }
            return;
          } else {
            onOpenApp(app.id as HomeOverlayAppId);
          }
        },
      })),
    [onOpenApp]
  );

  return (
    <div className="relative w-full overflow-hidden" style={wallpaperStyle}>
      <div className="flex h-[100dvh] flex-col">
        <TopStatusBar time={statusTime} dataSpeed={dataSpeed} />

        <div className="flex-1 px-4 pb-10 pt-4 text-white">
          <div className="flex h-full flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/55 px-5 py-4 backdrop-blur-2xl"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
                  Favorites
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-tight text-white/90">
                  Launch your daily essentials.
                </h2>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onRelock}
                className="rounded-full border border-white/15 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-black shadow-lg shadow-black/25"
              >
                Lock
              </motion.button>
            </motion.div>

            <motion.div
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.42, ease: "easeOut" }}
              className="grid flex-1 grid-cols-2 grid-rows-2 gap-4"
            >
              {homeApps.map((app) => (
                <HomeAppCard key={app.id} app={app} />
              ))}
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none relative flex justify-center pb-1">
          <div className="pointer-events-auto flex w-[90%] max-w-sm items-end justify-between rounded-[32px]   px-6 py-3 backdrop-blur-s,">
            {dockItems.map((item) => (
              <DockIcon key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type NotificationPanelProps = {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  notifications: NotificationItem[];
  statusTime: string;
  dataSpeed: string;
};

const NotificationPanel = ({
  isOpen,
  onToggle,
  notifications,
  statusTime,
  dataSpeed,
}: NotificationPanelProps) => {
  return (
    <motion.div
      drag="y"
      dragConstraints={{
        top: -PANEL_HEIGHT + PANEL_HANDLE_HEIGHT,
        bottom: 0,
      }}
      dragElastic={0.32}
      onDragEnd={(_, info) => {
        const distanceThreshold = PANEL_HEIGHT * 0.12;
        const velocityThreshold = 160;

        if (isOpen) {
          const shouldClose =
            info.velocity.y < -velocityThreshold ||
            info.offset.y < -distanceThreshold;
          onToggle(!shouldClose);
        } else {
          const shouldOpen =
            info.velocity.y > velocityThreshold ||
            info.offset.y > distanceThreshold;
          onToggle(shouldOpen);
        }
      }}
      initial={false}
      animate={{
        y: isOpen ? 0 : -PANEL_HEIGHT + PANEL_HANDLE_HEIGHT,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 36 }}
      className={`absolute inset-x-0 top-0 z-40 mx-auto opacity-${
        isOpen ? 100 : 0
      } w-full max-w-sm`}
      style={{ height: PANEL_HEIGHT }}
    >
      <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-3xl">
        <div className="flex justify-center pt-2 pb-3">
          <div className="h-1.5 w-12 rounded-full bg-white/30" />
        </div>

        <TopStatusBar time={statusTime} dataSpeed={dataSpeed} />

        <div className="px-5 pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Notifications
          </span>

          <div
            className="mt-4 space-y-3 overflow-y-auto pr-1"
            style={{ maxHeight: PANEL_HEIGHT - 140 }}
          >
            {notifications.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <span className="text-xs text-white/60">{item.time}</span>
                </div>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
                <div
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/85 ${item.accent}`}
                >
                  Activity
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MuneebOS = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [dataSpeed, setDataSpeed] = useState("0.0");
  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visibleCards, setVisibleCards] = useState(PROFILE_CARDS);
  const rippleIdRef = useRef(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const gestureStartRef = useRef<number | null>(null);
  const gestureActiveRef = useRef(false);
  const unlockingTouchRef = useRef(false);
  const [floatingNotifications, setFloatingNotifications] = useState<
    FloatingNotification[]
  >([]);
  const [activeApp, setActiveApp] = useState<MobileAppId | null>(null);
  const scheduledSocialNotificationsRef = useRef<
    ReturnType<typeof setTimeout>[]
  >([]);
  const floatingDismissTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const speed = (10 + Math.random() * 190).toFixed(1);
      setDataSpeed(speed);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const guard = setTimeout(() => setIsInitialRender(false), 1500);
    return () => clearTimeout(guard);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/notification.mp3");
    audio.preload = "auto";
    audio.volume = 0.85;
    notificationAudioRef.current = audio;

    return () => {
      audio.pause();
      notificationAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (scheduledSocialNotificationsRef.current.length) {
      return () => {
        scheduledSocialNotificationsRef.current.forEach(clearTimeout);
        scheduledSocialNotificationsRef.current = [];
      };
    }

    const baseDelay = 15000;
    const gap = 20000;
    const timeouts = FLOATING_SOCIAL_NOTIFICATIONS.map((notification, index) =>
      setTimeout(() => {
        setFloatingNotifications((prev) => {
          if (prev.some((item) => item.id === notification.id)) {
            return prev;
          }
          return [...prev, notification];
        });
      }, baseDelay + index * gap)
    );

    scheduledSocialNotificationsRef.current = timeouts;

    return () => {
      scheduledSocialNotificationsRef.current.forEach(clearTimeout);
      scheduledSocialNotificationsRef.current = [];
    };
  }, []);

  useEffect(() => {
    floatingNotifications.forEach((notification) => {
      if (floatingDismissTimersRef.current.has(notification.id)) return;

      const audio = notificationAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }

      const timeoutId = setTimeout(() => {
        setFloatingNotifications((prev) =>
          prev.filter((item) => item.id !== notification.id)
        );
        floatingDismissTimersRef.current.delete(notification.id);
      }, 10000);

      floatingDismissTimersRef.current.set(notification.id, timeoutId);
    });

    floatingDismissTimersRef.current.forEach((timeoutId, id) => {
      if (!floatingNotifications.some((item) => item.id === id)) {
        clearTimeout(timeoutId);
        floatingDismissTimersRef.current.delete(id);
      }
    });

    return () => {
      floatingDismissTimersRef.current.forEach((timeoutId, id) => {
        if (!floatingNotifications.some((item) => item.id === id)) {
          clearTimeout(timeoutId);
          floatingDismissTimersRef.current.delete(id);
        }
      });
    };
  }, [floatingNotifications]);

  const statusTime = useMemo(
    () => formatter.statusTime.format(currentTime),
    [currentTime]
  );

  const formattedTime = useMemo(
    () => formatter.largeTime.format(currentTime),
    [currentTime]
  );

  const formattedDate = useMemo(
    () => formatter.fullDate.format(currentTime),
    [currentTime]
  );

  const handleCardDismiss = useCallback((id: string) => {
    setVisibleCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const registerRipple = useCallback(() => {
    rippleIdRef.current += 1;
    const id = rippleIdRef.current;
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 1000);
  }, []);

  const handleFingerprintStart = useCallback(() => {
    registerRipple();
    if (!unlockingTouchRef.current) {
      vibrateDevice(FINGERPRINT_VIBRATION_PATTERN);
    }
    unlockingTouchRef.current = true;
    setIsUnlocking(true);
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
    }

    unlockTimerRef.current = setTimeout(() => {
      setIsUnlocking(false);
      setIsLocked(false);
      setIsNotificationOpen(false);
      unlockingTouchRef.current = false;
      unlockTimerRef.current = null;
    }, 1300);
  }, [registerRipple]);

  const handleFingerprintEnd = useCallback(() => {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
      setIsUnlocking(false);
    }
    unlockingTouchRef.current = false;
  }, []);

  const handleRelock = useCallback(() => {
    setIsLocked(true);
    setVisibleCards(PROFILE_CARDS);
  }, []);

  const handleNotificationToggle = useCallback((open: boolean) => {
    setIsNotificationOpen((prev) => (prev === open ? prev : open));
  }, []);

  const handleOpenApp = useCallback((app: MobileAppId) => {
    vibrateDevice([0, 24]);
    setActiveApp(app);
  }, []);

  const handleCloseApp = useCallback(() => {
    setActiveApp(null);
  }, []);

  const handleLinkedInOpen = useCallback(() => {
    vibrateDevice([0, 18]);
    if (typeof window !== "undefined") {
      window.open(
        "https://www.linkedin.com/in/syed-abdul-muneeb/",
        "_blank",
        "noopener,noreferrer"
      );
    }
  }, []);

  const handleFloatingDismiss = useCallback((id: string) => {
    const timeout = floatingDismissTimersRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      floatingDismissTimersRef.current.delete(id);
    }
    setFloatingNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const activeOverlay = useMemo(() => {
    if (!activeApp) return null;

    switch (activeApp) {
      case "chrome":
        return {
          title: "Chrome",
          icon: "/chrome.png",
          node: <MobileChromeApp />,
        };
      case "contact":
        return {
          title: "Contacts",
          icon: "/contact.png",
          node: <MobileContactApp />,
        };
      case "camera":
        return {
          title: "Camera",
          icon: "/camera.png",
          node: <MobileCameraApp />,
        };
      case "gfg":
        return {
          title: "GeeksforGeeks",
          icon: "/internet_explorer.png",
          node: <GfgApp />,
        };
      case "resume":
        return {
          title: "Resume",
          icon: "/pdf.png",
          node: <ResumeApp />,
        };
      case "music":
        return {
          title: "Now Playing",
          icon: "/games.png",
          node: <MusicApp />,
        };
      case "reaction":
        return {
          title: "Reaction Dash",
          icon: "/games.png",
          node: (
            <div className="h-full overflow-y-auto bg-black/75 px-5 py-6">
              <QuickReactionGame />
            </div>
          ),
        };
      case "numbers":
        return {
          title: "Number Sprint",
          icon: "/calc.png",
          node: (
            <div className="h-full overflow-y-auto bg-black/75 px-5 py-6">
              <NumberTapSprint />
            </div>
          ),
        };
      default:
        return null;
    }
  }, [activeApp]);

  const handleGesturePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      gestureStartRef.current = event.clientY;
      gestureActiveRef.current = true;
    },
    []
  );

  const handleGesturePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      if (!gestureActiveRef.current || gestureStartRef.current === null) return;

      const delta = event.clientY - gestureStartRef.current;
      if (delta > 45) {
        setIsNotificationOpen(true);
      }
    },
    []
  );

  const handleGesturePointerEnd = useCallback(() => {
    gestureStartRef.current = null;
    gestureActiveRef.current = false;
  }, []);

  return (
    <div className="pointer-events-auto">
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute top-4 left-0 right-0 z-[1200] flex flex-col items-center gap-3">
          <AnimatePresence>
            {floatingNotifications.map((notification) => (
              <FloatingNotificationToast
                key={notification.id}
                notification={notification}
                onDismiss={handleFloatingDismiss}
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="relative w-full ">
          <div
            className="relative overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
            onPointerDown={handleGesturePointerDown}
            onPointerMove={handleGesturePointerMove}
            onPointerUp={handleGesturePointerEnd}
            onPointerCancel={handleGesturePointerEnd}
          >
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.button
                  type="button"
                  key="notification-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 bg-black/70"
                  onClick={() => setIsNotificationOpen(false)}
                />
              )}
            </AnimatePresence>
            <NotificationPanel
              isOpen={isNotificationOpen}
              onToggle={handleNotificationToggle}
              notifications={NOTIFICATIONS}
              statusTime={statusTime}
              dataSpeed={dataSpeed}
            />

            <motion.div
              layout
              animate={{ opacity: 1 }}
              className="relative z-20"
            >
              <AnimatePresence mode="wait">
                {isLocked ? (
                  <motion.div
                    key="lock-screen"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <LockScreen
                      statusTime={statusTime}
                      formattedTime={formattedTime}
                      formattedDate={formattedDate}
                      dataSpeed={dataSpeed}
                      cards={visibleCards}
                      ripples={ripples}
                      isLocked={isLocked}
                      isInitialRender={isInitialRender}
                      isUnlocking={isUnlocking}
                      onFingerprintStart={handleFingerprintStart}
                      onFingerprintEnd={handleFingerprintEnd}
                      onCardDismiss={handleCardDismiss}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="home-screen"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <HomeScreen
                      statusTime={statusTime}
                      dataSpeed={dataSpeed}
                      onRelock={handleRelock}
                      onOpenApp={handleOpenApp}
                      onOpenLinkedIn={handleLinkedInOpen}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {activeOverlay && activeApp && (
          <AppOverlay
            key={activeApp}
            title={activeOverlay.title}
            icon={activeOverlay.icon}
            onClose={handleCloseApp}
          >
            {activeOverlay.node}
          </AppOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};
