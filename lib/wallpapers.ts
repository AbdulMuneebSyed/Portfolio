// The Big Sur image is the default; the rest are CSS-only gradients.
export const MAC_WALLPAPERS = [
  {
    id: "big-sur",
    name: "Big Sur",
    css: "url('/wallpapers/big-sur.webp')",
  },
  {
    id: "dusk",
    name: "Dusk",
    css: [
      "radial-gradient(ellipse 80% 60% at 20% 100%, rgba(255,140,90,0.85), transparent 60%)",
      "radial-gradient(ellipse 70% 55% at 85% 90%, rgba(236,72,153,0.7), transparent 60%)",
      "radial-gradient(ellipse 90% 70% at 60% 0%, rgba(99,102,241,0.85), transparent 65%)",
      "linear-gradient(160deg, #1e1b4b 0%, #4c1d95 45%, #9d174d 75%, #f97316 100%)",
    ].join(", "),
  },
  {
    id: "lagoon",
    name: "Lagoon",
    css: [
      "radial-gradient(ellipse 70% 60% at 15% 20%, rgba(56,189,248,0.8), transparent 60%)",
      "radial-gradient(ellipse 80% 60% at 90% 80%, rgba(16,185,129,0.65), transparent 60%)",
      "linear-gradient(150deg, #0c4a6e 0%, #0369a1 40%, #0f766e 75%, #064e3b 100%)",
    ].join(", "),
  },
  {
    id: "dawn",
    name: "Dawn",
    css: [
      "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(251,191,36,0.85), transparent 60%)",
      "radial-gradient(ellipse 60% 50% at 10% 10%, rgba(244,114,182,0.6), transparent 60%)",
      "linear-gradient(180deg, #93c5fd 0%, #c4b5fd 45%, #fbcfe8 75%, #fde68a 100%)",
    ].join(", "),
  },
  {
    id: "graphite",
    name: "Graphite",
    css: [
      "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(148,163,184,0.35), transparent 65%)",
      "linear-gradient(180deg, #1f2937 0%, #111827 60%, #030712 100%)",
    ].join(", "),
  },
];

export const DEFAULT_WALLPAPER = MAC_WALLPAPERS[0].css;
