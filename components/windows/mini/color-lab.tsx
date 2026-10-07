"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  contrastRatio,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  wcagLevel,
} from "@/lib/games/color";
import { MiniHeader } from "./shared";
import type { MiniAppProps } from "./registry";

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

export function ColorLab({ preview }: MiniAppProps) {
  const [hex, setHex] = useState("#0a84ff");
  const [draft, setDraft] = useState("#0a84ff");
  const [copied, setCopied] = useState<string | null>(null);
  const rgb = hexToRgb(hex)!;
  const hsl = rgbToHsl(rgb);

  const set = (value: string) => {
    setDraft(value);
    const parsed = hexToRgb(value);
    if (parsed) setHex(rgbToHex(parsed));
  };

  const copy = async (text: string) => {
    if (preview) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const formats = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)` },
  ];
  const shades = [92, 80, 68, 56, hsl.l, 40, 30, 20, 10].map((l) =>
    rgbToHex(hslToRgb(hsl.h, hsl.s, l)),
  );
  const harmony = [
    { label: "Complement", h: hsl.h + 180 },
    { label: "Triad", h: hsl.h + 120 },
    { label: "Triad", h: hsl.h + 240 },
    { label: "Analogous", h: hsl.h + 30 },
    { label: "Analogous", h: hsl.h - 30 },
  ].map((c) => ({ ...c, hex: rgbToHex(hslToRgb(((c.h % 360) + 360) % 360, hsl.s, hsl.l)) }));

  return (
    <div className="mini-app color-lab">
      <MiniHeader title="Color Lab" />
      <div className="color-top">
        <label className="color-well" style={{ background: hex }}>
          <input type="color" value={hex} aria-label="Pick a colour" onChange={(e) => set(e.target.value)} />
        </label>
        <div className="color-formats">
          <input
            className="color-hex"
            aria-label="Hex colour"
            value={draft}
            spellCheck={false}
            onChange={(e) => set(e.target.value)}
            onBlur={() => setDraft(hex)}
          />
          {formats.map((f) => (
            <button key={f.label} className="color-format" onClick={() => copy(f.value)}>
              <small>{f.label}</small>
              <code>{f.value}</code>
              {copied === f.value ? <Check size={14} /> : <Copy size={14} />}
            </button>
          ))}
        </div>
      </div>
      <h3 className="color-heading">Contrast</h3>
      <div className="color-contrast">
        {[
          { bg: WHITE, label: "On white" },
          { bg: BLACK, label: "On black" },
        ].map(({ bg, label }) => {
          const ratio = contrastRatio(rgb, bg);
          const level = wcagLevel(ratio);
          return (
            <div key={label} style={{ background: rgbToHex(bg), color: hex }}>
              <strong>Aa</strong>
              <span style={{ color: bg === WHITE ? "#1d1d1f" : "#f5f5f7" }}>
                {label} · {ratio.toFixed(2)}:1 · <b data-fail={level === "Fail"}>{level}</b>
              </span>
            </div>
          );
        })}
      </div>
      <h3 className="color-heading">Shades</h3>
      <div className="color-swatches">
        {shades.map((s, i) => (
          <button key={i} style={{ background: s }} aria-label={`Use ${s}`} title={s} onClick={() => set(s)} />
        ))}
      </div>
      <h3 className="color-heading">Harmony</h3>
      <div className="color-swatches labelled">
        {harmony.map((c, i) => (
          <button key={i} style={{ background: c.hex }} aria-label={`${c.label} ${c.hex}`} title={c.hex} onClick={() => set(c.hex)}>
            <small>{c.label}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
