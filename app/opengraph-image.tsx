import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/portfolio-data";

// The card shown when the link is shared (LinkedIn, Slack, X): who Muneeb is
// and what he has shipped, rather than a screenshot of the lock screen.
// Dressed in the /profile site's look: warm paper, near-black ink, Archivo.
export const alt = `${profile.name}, Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#faf7f3";
const INK = "#111111";
const INK_SOFT = "#1111118c";

const HIGHLIGHTS = [
  "AI-agent products at PulseGen",
  "30K+ daily users at MathonGO",
  "500K+ visitors, hackathon platform",
];

const asset = (file: string) => readFile(path.join(process.cwd(), file));

export default async function OpengraphImage() {
  const [photo, archivo500, archivo800] = await Promise.all([
    asset("public/avatar-256.jpg"),
    asset("app/_og/archivo-500.woff"),
    asset("app/_og/archivo-800.woff"),
  ]);
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
          color: INK,
          background: PAPER,
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            width={150}
            height={150}
            style={{
              borderRadius: 75,
              objectFit: "cover",
              border: "5px solid #ffffff",
              boxShadow: "0 14px 30px rgba(17,17,17,0.22)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: INK_SOFT, letterSpacing: "-0.02em" }}>
              /MUNEEBOS · PORTFOLIO
            </div>
            <div
              style={{
                fontSize: 70,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.035em",
                textTransform: "uppercase",
                marginTop: 10,
              }}
            >
              {profile.name}
            </div>
            <div style={{ fontSize: 32, fontWeight: 500, color: INK_SOFT, letterSpacing: "-0.03em", marginTop: 12 }}>
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
                padding: "13px 26px",
                borderRadius: 999,
                background: INK,
                color: PAPER,
                fontSize: 25,
                fontWeight: 500,
                letterSpacing: "-0.02em",
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
            alignItems: "center",
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: INK_SOFT }}>{profile.location}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#30c85a" }} />
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em" }}>syedabdulmuneeb.dev</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo500, weight: 500, style: "normal" },
        { name: "Archivo", data: archivo800, weight: 800, style: "normal" },
      ],
    },
  );
}
