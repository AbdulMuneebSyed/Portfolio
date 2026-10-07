"use client";

import type React from "react";
import { AppIcon } from "@/lib/app-icons";
import type { Art } from "@/lib/app-store/editorial";
import type { MockKind } from "@/lib/app-store/catalog";

// Deterministic pseudo-random numbers so artwork is identical every render.
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function Motif({ art }: { art: Art }) {
  const [, b, c] = art.colors;
  const rand = seeded(art.colors.join() + art.motif);
  switch (art.motif) {
    case "blobs":
      return (
        <span
          className="store-art-layer"
          style={{
            background: `radial-gradient(40% 55% at 25% 30%, ${c}cc, transparent 70%),
              radial-gradient(45% 60% at 80% 75%, ${b}, transparent 70%),
              radial-gradient(30% 40% at 70% 20%, ${c}88, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
      );
    case "rings":
      return (
        <span className="store-art-layer">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: `${40 + i * 30}%`,
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: `2px dashed ${i % 2 ? b : c}66`,
              }}
            />
          ))}
        </span>
      );
    case "stripes":
      return (
        <span
          className="store-art-layer"
          style={{
            background: `repeating-linear-gradient(135deg, ${b}55 0 18px, transparent 18px 44px)`,
          }}
        />
      );
    case "grid":
      return (
        <span
          className="store-art-layer"
          style={{
            backgroundImage: `linear-gradient(${c}33 1px, transparent 1px), linear-gradient(90deg, ${c}33 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 60% 50%, black, transparent 75%)",
          }}
        />
      );
    case "pixels":
      return (
        <span className="store-art-layer">
          {Array.from({ length: 36 }, (_, i) => (
            <span
              key={i}
              className="absolute rounded-[3px]"
              style={{
                left: `${rand() * 96}%`,
                top: `${rand() * 92}%`,
                width: 10 + rand() * 18,
                height: 10 + rand() * 18,
                background: rand() > 0.5 ? b : c,
                opacity: 0.35 + rand() * 0.6,
              }}
            />
          ))}
        </span>
      );
    case "confetti":
      return (
        <span className="store-art-layer">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${rand() * 96}%`,
                top: `${rand() * 92}%`,
                width: 6 + rand() * 26,
                height: 6 + rand() * 8,
                transform: `rotate(${rand() * 180}deg)`,
                background: rand() > 0.5 ? b : c,
                opacity: 0.5 + rand() * 0.5,
              }}
            />
          ))}
        </span>
      );
  }
}

export function StoreArt({
  art,
  className = "",
  round = false,
}: {
  art: Art;
  className?: string;
  round?: boolean;
}) {
  const [a, b] = art.colors;
  return (
    <span
      className={`store-art ${className}`}
      data-round={round}
      style={{ background: `linear-gradient(140deg, ${a}, ${b})` }}
      aria-hidden="true"
    >
      <Motif art={art} />
      {art.iconId && (
        <span className="store-art-icon">
          <AppIcon appId={art.iconId} size={round ? 96 : 150} />
        </span>
      )}
    </span>
  );
}

// Stylised app screens for product-page slides, drawn instead of captured
// where a live site can't be screenshotted.
const bar = (w: string, extra?: React.CSSProperties) => (
  <span className="mock-bar" style={{ width: w, ...extra }} />
);

export function MockScreen({ kind, tint }: { kind: MockKind; tint: string }) {
  const style = { "--tint": tint } as React.CSSProperties;
  switch (kind) {
    case "resume-score":
      return (
        <div className="mock mock-split" style={style}>
          <div className="mock-paper">
            {bar("60%", { height: 10 })}
            {bar("40%")}
            {Array.from({ length: 9 }, (_, i) => bar(`${70 + ((i * 13) % 30)}%`))}
          </div>
          <div className="mock-panel">
            <div className="mock-gauge">
              <span>86</span>
              <small>ATS score</small>
            </div>
            {["Keywords", "Impact", "Formatting", "Length"].map((k, i) => (
              <div key={k} className="mock-meter">
                <small>{k}</small>
                <span style={{ width: `${92 - i * 11}%` }} />
              </div>
            ))}
          </div>
        </div>
      );
    case "resume-rewrite":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-card muted">
            <small>Before</small>
            <p>Worked on the backend of the app and fixed bugs.</p>
          </div>
          <div className="mock-card accent">
            <small>✨ Rewritten</small>
            <p>Cut API latency 40% by redesigning caching for 30K daily users.</p>
          </div>
          <div className="mock-chips">
            <span>Gemini</span>
            <span>GPT</span>
            <span>Claude</span>
          </div>
        </div>
      );
    case "leaderboard":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-heading">Weekly League</div>
          {["Aarav", "Diya", "Kabir", "Meera", "Rohan"].map((name, i) => (
            <div key={name} className="mock-list-row">
              <b>{i + 1}</b>
              <span className="mock-avatar" />
              <span className="flex-1">{name}</span>
              <span>{2480 - i * 135} XP</span>
            </div>
          ))}
        </div>
      );
    case "lms":
      return (
        <div className="mock mock-tiles" style={style}>
          {["Physics", "Chemistry", "Biology", "Maths", "Mock Tests", "PYQs"].map((s, i) => (
            <div key={s} className="mock-tile">
              <span className="mock-tile-art" style={{ opacity: 0.45 + i * 0.09 }} />
              <strong>{s}</strong>
              <div className="mock-meter">
                <span style={{ width: `${30 + ((i * 17) % 60)}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "feed":
    case "profile":
      return (
        <div className="mock mock-stack" style={style}>
          {kind === "profile" && (
            <div className="mock-profile">
              <span className="mock-avatar big" />
              <div>
                <strong>Orbit Labs</strong>
                <small>Seed · 6 founders · Hyderabad</small>
              </div>
            </div>
          )}
          {["Shipped our beta today 🚀", "Hiring a founding engineer", "We crossed 1K users!"].map((t) => (
            <div key={t} className="mock-card">
              <div className="mock-list-row">
                <span className="mock-avatar" />
                <strong className="flex-1">Founder</strong>
                <small>now</small>
              </div>
              <p>{t}</p>
            </div>
          ))}
        </div>
      );
    case "crm":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-heading">Clients</div>
          {["Qatar Logistics", "Nova Retail", "Bluepeak", "Helix Health", "Arcadia"].map((c, i) => (
            <div key={c} className="mock-list-row">
              <span className="mock-avatar" />
              <span className="flex-1">{c}</span>
              <span className="mock-pill">{["Active", "Onboarding", "Active", "Review", "Active"][i]}</span>
            </div>
          ))}
        </div>
      );
    case "chatbot":
      return (
        <div className="mock mock-chat" style={style}>
          <p className="them">How do I add a new vendor?</p>
          <p className="me">Open Vendors → Add, upload the documents, and I&apos;ll verify them for you.</p>
          <p className="them">Done! How long does approval take?</p>
          <p className="me">Usually under a minute.</p>
        </div>
      );
    case "agent-chat":
      return (
        <div className="mock mock-chat" style={style}>
          <p className="them">What are customers saying about onboarding this week?</p>
          <p className="me">12 calls mention setup friction, mostly around SSO. Two contradict last sprint&apos;s notes.</p>
          <p className="them">Show me the contradictions.</p>
          <p className="me">Here they are, with the source of each.</p>
        </div>
      );
    case "daily-brief":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-heading">Daily Brief</div>
          {[
            ["Gmail", "3 customer threads need a reply"],
            ["Calls", "SSO setup came up 5 times"],
            ["Tickets", "2 bugs reopened overnight"],
            ["Roadmap", "1 decision contradicts a spec"],
          ].map(([source, text]) => (
            <div key={source} className="mock-list-row">
              <span className="mock-pill">{source}</span>
              <span className="flex-1">{text}</span>
            </div>
          ))}
        </div>
      );
    case "sql":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-card accent">
            <p>Which region grew fastest last quarter?</p>
          </div>
          <div className="mock-card">
            <small>Analyst → SQL writer → Checker</small>
            <p className="font-mono text-[11px] leading-snug">
              SELECT region, SUM(revenue) FROM sales WHERE quarter = &apos;Q3&apos; GROUP BY region ORDER BY 2 DESC;
            </p>
          </div>
          <div className="mock-card">
            <p>South grew fastest: +24% quarter on quarter.</p>
          </div>
        </div>
      );
    case "paper":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-heading">Checkpointed State Management for Tool-Using LLM Agents</div>
          <div className="mock-card">
            <small>Summary</small>
            <p>The long-horizon reliability gap in tool-using agents, and checkpointed state management to close it.</p>
          </div>
          {["Agent", "Checkpoint", "Tool call", "Restore"].map((step, i) => (
            <div key={step} className="mock-list-row">
              <span className="mock-pill">{i + 1}</span>
              <span className="flex-1">{step}</span>
            </div>
          ))}
        </div>
      );
    case "hackathon":
      return (
        <div className="mock mock-stack" style={style}>
          <div className="mock-heading">Hack Revolution</div>
          <div className="mock-countdown">
            {["02", "14", "37", "09"].map((n, i) => (
              <span key={i}>
                <b>{n}</b>
                <small>{["days", "hrs", "min", "sec"][i]}</small>
              </span>
            ))}
          </div>
          <div className="mock-card accent">
            <p>Register your team →</p>
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="mock mock-chart" style={style}>
          {[22, 35, 31, 48, 56, 72, 88].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      );
    case "desktop":
      return (
        <div className="mock mock-desktop" style={style}>
          <div className="mock-menubar" />
          <div className="mock-window" />
          <div className="mock-window two" />
          <div className="mock-dock">
            {["about", "projects", "contact", "terminal", "ie", "app-store"].map((id) => (
              <AppIcon key={id} appId={id} size={30} />
            ))}
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className="mock mock-stack" style={style}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mock-list-row">
              <span className="mock-dot" />
              <span className="flex-1">{bar(`${80 - i * 15}%`)}</span>
            </div>
          ))}
        </div>
      );
  }
}
