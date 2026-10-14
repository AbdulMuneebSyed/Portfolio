import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/portfolio-data";

// The card shown when the link is shared (LinkedIn, Slack, X). It uses the
// /profile site's look (warm paper, near-black ink, Archivo) and shows the
// real thing: the desktop with About Me open, and the phone's home screen.
export const alt = `Most portfolios, you scroll. Mine, you boot up. ${profile.name}'s portfolio runs as a desktop in your browser and as an iPhone on your phone.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#faf7f3";
const INK = "#111111";
const INK_SOFT = "#1111118c";

const asset = (file: string) => readFile(path.join(process.cwd(), "app/_og", file));
const jpeg = (buf: Buffer) => `data:image/jpeg;base64,${buf.toString("base64")}`;

export default async function OpengraphImage() {
  const [desktop, phone, archivo500, archivo800] = await Promise.all([
    asset("desktop.jpg"),
    asset("phone.jpg"),
    asset("archivo-500.woff"),
    asset("archivo-800.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          color: INK,
          fontFamily: "Archivo",
        }}
      >
        {/* Copy, left */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 58,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 500, color: INK_SOFT, letterSpacing: "-0.02em" }}>
            /MUNEEBOS · LIVE NOW
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 18,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 0.94,
              letterSpacing: "-0.035em",
            }}
          >
            <span>MOST PORTFOLIOS,</span>
            <span>YOU SCROLL.</span>
            <span>MINE, YOU BOOT UP.</span>
          </div>
          <div
            style={{
              marginTop: 24,
              width: 500,
              fontSize: 23,
              fontWeight: 500,
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
              color: INK_SOFT,
            }}
          >
            My portfolio is a desktop that runs in your browser. On your phone, it becomes an iPhone.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 54,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#30c85a" }} />
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em" }}>syedabdulmuneeb.dev</div>
        </div>

        {/* Desktop window, right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={jpeg(desktop)}
          width={496}
          height={279}
          style={{
            position: "absolute",
            left: 590,
            top: 262,
            borderRadius: 12,
            boxShadow: "0 24px 60px rgba(17,17,17,0.22)",
          }}
        />

        {/* iPhone in front of it */}
        <div
          style={{
            position: "absolute",
            left: 966,
            top: 196,
            width: 198,
            height: 412,
            padding: 8,
            borderRadius: 40,
            background: "#111111",
            display: "flex",
            boxShadow: "0 24px 60px rgba(17,17,17,0.3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={jpeg(phone)} width={182} height={396} style={{ borderRadius: 32 }} />
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
