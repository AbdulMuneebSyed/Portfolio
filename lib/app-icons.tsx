import type React from "react";
import Image from "next/image";
import {
  Activity,
  AppWindow,
  Github,
  Linkedin,
  Trash2,
  type LucideIcon,
} from "lucide-react";

// Icons follow the macOS Big Sur grid: artwork fills ~80% of the canvas,
// leaving a transparent margin, so mixed sources line up in the Dock.
// - "png": a ready-made Big Sur icon (already includes the margin)
// - "photo": a photo placed on the squircle
// - "glyph": a gradient squircle with a symbol
// - "folder" / "document": drawn Finder-style file icons
type IconSpec =
  | { kind: "png"; src: string }
  | { kind: "photo"; src: string }
  | { kind: "glyph"; glyph: LucideIcon; from: string; to: string; color?: string }
  | { kind: "folder" }
  | { kind: "document"; label: string; color: string };

const ICONS: Record<string, IconSpec> = {
  about: { kind: "photo", src: "/avatar-256.jpg" },
  projects: { kind: "folder" },
  resume: { kind: "document", label: "PDF", color: "#e5352b" },
  contact: { kind: "png", src: "/icons/mac/mail.png" },
  "github-activity": { kind: "glyph", glyph: Github, from: "#3a3a3c", to: "#111113" },
  linkedin: { kind: "glyph", glyph: Linkedin, from: "#1d8fe0", to: "#0a5fb4" },
  terminal: { kind: "png", src: "/icons/mac/terminal.png" },
  ie: { kind: "png", src: "/icons/mac/safari.png" },
  computer: { kind: "png", src: "/icons/mac/finder.png" },
  settings: { kind: "png", src: "/icons/mac/system-settings.png" },
  feedback: { kind: "png", src: "/icons/mac/notes.png" },
  calculator: { kind: "png", src: "/icons/mac/calculator.png" },
  recycle: { kind: "glyph", glyph: Trash2, from: "#fbfbfd", to: "#d4d4da", color: "#6b6b73" },
  "task-manager": { kind: "glyph", glyph: Activity, from: "#2b2b2e", to: "#0e0e10", color: "#5ce06a" },
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

  if (spec.kind === "folder") {
    return frame(<FolderArt size={art} />);
  }

  if (spec.kind === "document") {
    return frame(<DocumentArt size={art} label={spec.label} color={spec.color} />);
  }

  const tileStyle = {
    width: art,
    height: art,
    borderRadius: radius,
    boxShadow: "0 1px 2px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15)",
  };

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
      </span>
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
    </span>
  );
}

// Finder-style blue folder.
function FolderArt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aa8f0" />
          <stop offset="1" stopColor="#2f86d8" />
        </linearGradient>
        <linearGradient id="folder-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd3ff" />
          <stop offset="1" stopColor="#5db6f6" />
        </linearGradient>
      </defs>
      <path
        d="M4 14a4 4 0 0 1 4-4h15l5 5h28a4 4 0 0 1 4 4v31a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"
        fill="url(#folder-back)"
      />
      <path
        d="M4 23a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"
        fill="url(#folder-front)"
      />
      <path d="M4 23a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4" stroke="#bfe6ff" strokeWidth="1" fill="none" />
    </svg>
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
