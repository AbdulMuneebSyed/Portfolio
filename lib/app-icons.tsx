import Image from "next/image";
import {
  Activity,
  AppWindow,
  Calculator,
  Compass,
  FileText,
  Folder,
  Github,
  Linkedin,
  Mail,
  MessageSquareHeart,
  Settings,
  Smile,
  SquareTerminal,
  Trash2,
  type LucideIcon,
} from "lucide-react";

// Own artwork: a rounded "squircle" tile with a gradient and a glyph.
// No Apple icons are used.
type IconSpec =
  | { glyph: LucideIcon; from: string; to: string; color?: string }
  | { image: string };

const ICONS: Record<string, IconSpec> = {
  about: { image: "/avatar-256.jpg" },
  projects: { glyph: Folder, from: "#6cc4ff", to: "#1f7ae0" },
  resume: { glyph: FileText, from: "#ff7a6e", to: "#d93025" },
  contact: { glyph: Mail, from: "#5ac8fa", to: "#0a6cf0" },
  "github-activity": { glyph: Github, from: "#48484a", to: "#1c1c1e" },
  linkedin: { glyph: Linkedin, from: "#2a9be8", to: "#0a66c2" },
  terminal: { glyph: SquareTerminal, from: "#4a4a4a", to: "#111111", color: "#7CFC9A" },
  ie: { glyph: Compass, from: "#6fd3ff", to: "#1e6ff1" },
  computer: { glyph: Smile, from: "#7cd0ff", to: "#2f6ff5" },
  settings: { glyph: Settings, from: "#b3b3b8", to: "#5d5d62" },
  feedback: { glyph: MessageSquareHeart, from: "#ffd34d", to: "#ff9500" },
  recycle: { glyph: Trash2, from: "#f2f2f7", to: "#b9b9c0", color: "#55555c" },
  "task-manager": { glyph: Activity, from: "#4cd964", to: "#1f8a3a" },
  calculator: { glyph: Calculator, from: "#ffb340", to: "#d45500" },
};

const FALLBACK: IconSpec = { glyph: AppWindow, from: "#c7c7cc", to: "#8e8e93" };

interface AppIconProps {
  appId: string;
  size?: number;
  className?: string;
}

export function AppIcon({ appId, size = 48, className = "" }: AppIconProps) {
  const spec = ICONS[appId] ?? FALLBACK;
  const radius = Math.round(size * 0.225);
  const frame = {
    width: size,
    height: size,
    borderRadius: radius,
  };

  if ("image" in spec) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-black/10 ${className}`}
        style={frame}
      >
        <Image
          src={spec.image}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          draggable={false}
        />
      </span>
    );
  }

  const Glyph = spec.glyph;
  return (
    <span
      className={`flex shrink-0 items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-black/10 ${className}`}
      style={{
        ...frame,
        background: `linear-gradient(180deg, ${spec.from}, ${spec.to})`,
      }}
    >
      <Glyph
        style={{ width: size * 0.55, height: size * 0.55 }}
        color={spec.color ?? "#ffffff"}
        strokeWidth={1.8}
      />
    </span>
  );
}
