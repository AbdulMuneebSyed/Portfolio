import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/portfolio-data";

// The card shown when the link is shared (LinkedIn, Slack, X): who Muneeb is
// and what he has shipped, rather than a screenshot of the lock screen.
export const alt = `${profile.name}, Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HIGHLIGHTS = [
  "AI-agent products at PulseGen",
  "30K+ daily users at MathonGO",
  "500K+ visitors, hackathon platform",
];

export default async function OpengraphImage() {
  const photo = await readFile(path.join(process.cwd(), "public/avatar-256.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "white",
          background:
            "linear-gradient(135deg, #1a1446 0%, #3a2a8c 45%, #d6336c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            width={150}
            height={150}
            style={{ borderRadius: 75, objectFit: "cover", border: "4px solid #ffffff55" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 66, fontWeight: 700, letterSpacing: -1.5 }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 34, opacity: 0.9, marginTop: 6 }}>
              Software Engineer · AI agents · Full stack
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {HIGHLIGHTS.map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "#ffffff26",
                fontSize: 26,
              }}
            >
              {text}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            opacity: 0.85,
          }}
        >
          <span>{profile.status} · {profile.location}</span>
          <span>syedabdulmuneeb.dev</span>
        </div>
      </div>
    ),
    size,
  );
}
