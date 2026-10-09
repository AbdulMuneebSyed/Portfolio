import type React from "react";
import Image from "next/image";
import { phoneApp } from "./phone";
import {
  Gamepad2,
  AppWindow,
  Github,
  Linkedin,
  Grid2x2,
  Hash,
  Brain,
  BrickWall,
  SpellCheck,
  Disc3,
  Keyboard,
  Timer,
  Brush,
  Piano,
  Palette,
  Braces,
  Sparkles,
  Bot,
  Rocket,
  Headset,
  Database,
  Monitor,
  Activity,
  GraduationCap,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";

// Icons follow the macOS Big Sur grid: artwork fills ~80% of the canvas,
// leaving a transparent margin, so mixed sources line up in the Dock.
// - "png": a ready-made Big Sur icon (already includes the margin)
// - "photo": a photo placed on the squircle
// - "glyph": a gradient squircle with a symbol
// - "document": a drawn file icon with a type label, like Finder generates
type IconSpec =
  | { kind: "png"; src: string }
  | { kind: "photo"; src: string }
  | {
      kind: "glyph";
      glyph: LucideIcon;
      from: string;
      to: string;
      color?: string;
    }
  | { kind: "document"; label: string; color: string }
  | { kind: "logo"; src: string; background: string }
  | { kind: "app-store" };

const ICONS: Record<string, IconSpec> = {
  notes: { kind: "png", src: "/icons/mac/notes.png" },
  snake: { kind: "glyph", glyph: Gamepad2, from: "#64d2a0", to: "#24854a" },
  minesweeper: {
    kind: "glyph",
    glyph: Gamepad2,
    from: "#7a85ed",
    to: "#5154ae",
  },
  about: { kind: "photo", src: "/avatar-256.jpg" },
  projects: { kind: "png", src: "/icons/mac/folder.png" },
  resume: { kind: "document", label: "PDF", color: "#e5352b" },
  contact: { kind: "png", src: "/icons/mac/mail.png" },
  "github-activity": {
    kind: "glyph",
    glyph: Github,
    from: "#3a3a3c",
    to: "#111113",
  },
  linkedin: { kind: "glyph", glyph: Linkedin, from: "#1d8fe0", to: "#0a5fb4" },
  terminal: { kind: "png", src: "/icons/mac/terminal.png" },
  ie: { kind: "png", src: "/icons/mac/safari.png" },
  computer: { kind: "png", src: "/icons/mac/finder.png" },
  settings: { kind: "png", src: "/icons/mac/system-settings.png" },
  feedback: { kind: "png", src: "/icons/mac/notes.png" },
  calculator: { kind: "png", src: "/icons/mac/calculator.png" },
  music: { kind: "png", src: "/icons/mac/music.png" },
  recycle: { kind: "png", src: "/icons/mac/trash.png" },
  "task-manager": { kind: "png", src: "/icons/mac/activity-monitor.png" },
  "app-store": { kind: "app-store" },
  // App Store: mini-apps
  "game-2048": { kind: "glyph", glyph: Grid2x2, from: "#f7d154", to: "#e0a813" },
  "tic-tac-toe": { kind: "glyph", glyph: Hash, from: "#ff6482", to: "#d7194a" },
  memory: { kind: "glyph", glyph: Brain, from: "#d68cff", to: "#9a3fd8" },
  breakout: { kind: "glyph", glyph: BrickWall, from: "#ffb340", to: "#f2640c" },
  "word-guess": { kind: "glyph", glyph: SpellCheck, from: "#6fae69", to: "#3c6f37" },
  simon: { kind: "glyph", glyph: Disc3, from: "#4be07c", to: "#14984a" },
  "typing-test": { kind: "glyph", glyph: Keyboard, from: "#7fdcff", to: "#1b8fd6" },
  pomodoro: { kind: "glyph", glyph: Timer, from: "#ff6b61", to: "#d42a1f" },
  sketch: { kind: "glyph", glyph: Brush, from: "#ff5f86", to: "#c9124a" },
  piano: { kind: "glyph", glyph: Piano, from: "#48484a", to: "#111113" },
  "color-lab": {
    kind: "glyph",
    glyph: Palette,
    from: "#ffd60a",
    to: "#ff375f",
  },
  "json-formatter": { kind: "glyph", glyph: Braces, from: "#8583ff", to: "#4643c9" },
  // App Store: projects and experience
  airesumate: { kind: "glyph", glyph: Sparkles, from: "#9d84ff", to: "#5a33e6" },
  getmarks: { kind: "photo", src: "/app-store/icons/getmarks.png" },
  arrwin: { kind: "glyph", glyph: Bot, from: "#8a88ff", to: "#3d3ab8" },
  hypogen: { kind: "glyph", glyph: Database, from: "#ffc35a", to: "#e07a00" },
  "agent-checkpoints": { kind: "glyph", glyph: BookOpen, from: "#64d2ff", to: "#1f8aa8" },
  launchpad: { kind: "glyph", glyph: Rocket, from: "#ff9a5c", to: "#e84a12" },
  capco: { kind: "glyph", glyph: Headset, from: "#3ccfcf", to: "#0d8585" },
  ecell: { kind: "logo", src: "/app-store/icons/ecell.png", background: "#ffffff" },
  muneebos: { kind: "glyph", glyph: Monitor, from: "#5ac8fa", to: "#0a5fd8" },
  "exp-pulsegen": { kind: "glyph", glyph: Activity, from: "#8a88ff", to: "#3d3ab8" },
  "exp-mathongo": { kind: "glyph", glyph: GraduationCap, from: "#5aa8ff", to: "#1662c9" },
  "exp-airesumate": { kind: "glyph", glyph: Sparkles, from: "#9d84ff", to: "#5a33e6" },
  "exp-capco-cs": { kind: "glyph", glyph: Headset, from: "#3ccfcf", to: "#0d8585" },
  "exp-ecell-mjcet": { kind: "glyph", glyph: Users, from: "#ff6b8b", to: "#d1124a" },
};

const FALLBACK: IconSpec = {
  kind: "glyph",
  glyph: AppWindow,
  from: "#c7c7cc",
  to: "#8e8e93",
};

interface AppIconProps {
  appId: string;
  size?: number;
  className?: string;
}

export function AppIcon({ appId, size = 48, className = "" }: AppIconProps) {
  const spec = ICONS[appId] ?? FALLBACK;
  const art = Math.round(size * 0.8);
  const radius = Math.round(art * 0.225);

  if (spec.kind === "png") {
    return (
      <Image
        src={spec.src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={`block shrink-0 select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const frame = (children: React.ReactNode) => (
    <span
      className={`flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );

  if (spec.kind === "document") {
    return frame(
      <DocumentArt size={art} label={spec.label} color={spec.color} />,
    );
  }

  const tileStyle = {
    width: art,
    height: art,
    borderRadius: radius,
    boxShadow: "0 1px 2px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15)",
  };

  if (spec.kind === "app-store") {
    return frame(<AppStoreArt size={art} radius={radius} />);
  }

  if (spec.kind === "logo") {
    return frame(
      <span
        className="relative block overflow-hidden"
        style={{ ...tileStyle, background: spec.background }}
      >
        <Image
          src={spec.src}
          alt=""
          fill
          sizes={`${art}px`}
          className="object-contain p-[14%]"
          draggable={false}
        />
      </span>,
    );
  }

  if (spec.kind === "photo") {
    return frame(
      <span className="relative block overflow-hidden" style={tileStyle}>
        <Image
          src={spec.src}
          alt=""
          fill
          sizes={`${art}px`}
          className="object-cover"
          draggable={false}
        />
      </span>,
    );
  }

  const Glyph = spec.glyph;
  return frame(
    <span
      className="flex items-center justify-center"
      style={{
        ...tileStyle,
        background: `linear-gradient(180deg, ${spec.from}, ${spec.to})`,
      }}
    >
      <Glyph
        style={{ width: art * 0.56, height: art * 0.56 }}
        color={spec.color ?? "#ffffff"}
        strokeWidth={1.9}
      />
    </span>,
  );
}

// White page with a folded corner and a coloured type label.
function DocumentArt({
  size,
  label,
  color,
}: {
  size: number;
  label: string;
  color: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M14 4h26l14 14v40a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="#ffffff"
        stroke="#d6d6d6"
      />
      <path d="M40 4v12a2 2 0 0 0 2 2h12" fill="#ececec" stroke="#d6d6d6" />
      <rect x="18" y="26" width="24" height="2" rx="1" fill="#d9d9d9" />
      <rect x="18" y="31" width="28" height="2" rx="1" fill="#d9d9d9" />
      <rect x="18" y="36" width="20" height="2" rx="1" fill="#d9d9d9" />
      <rect x="14" y="44" width="36" height="12" rx="2" fill={color} />
      <text
        x="32"
        y="53"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

// Blue squircle with an "A" drawn from three rounded strokes.
function AppStoreArt({ size, radius }: { size: number; radius: number }) {
  return (
    <span
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(180deg, #1ecbff, #0866f0)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 64 64"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M37 10 18 44" />
        <path d="M27 10l19 34" />
        <path d="M12 36h40" />
        <path d="m10 52 4-7" />
        <path d="m50 45 4 7" />
      </svg>
    </span>
  );
}

// iPhone Home Screen icon: full-bleed squircle, no Mac margin. Apps with
// real iOS artwork use it; the rest crop their Mac icon to the squircle.
export function PhoneAppIcon({
  appId,
  size = 60,
}: {
  appId: string;
  size?: number;
}) {
  const ios = phoneApp(appId).icon;
  if (ios) {
    return (
      <Image
        src={`/icons/ios/${ios}.png`}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="phone-icon block shrink-0 select-none"
        style={{ width: size, height: size }}
      />
    );
  }
  // The Mac artwork fills 80% of its canvas: draw it larger and crop.
  return (
    <span
      className="phone-icon flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size * 0.2237 }}
    >
      <AppIcon appId={appId} size={size / 0.8} />
    </span>
  );
}
