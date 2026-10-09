import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { education, profile } from "@/lib/portfolio-data";
import "./globals.css";
import "./app-store.css";

// Role and impact first: this is what search results and link previews show.
const DESCRIPTION =
  "Syed Abdul Muneeb is a software engineer at PulseGen, Hyderabad, building AI-agent products: streaming LLM chat, MCP integrations and multi-tenant search. Previously scaled MathonGO to 30K+ daily users. Open to SDE roles.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syedabdulmuneeb.dev"),
  title: {
    default: "Syed Abdul Muneeb | Software Engineer, AI agents and full stack",
    template: "%s | Syed Abdul Muneeb",
  },
  description: DESCRIPTION,
  keywords: [
    "Syed Abdul Muneeb",
    "Software Engineer",
    "SDE",
    "Full Stack Developer",
    "AI Agents",
    "LLM",
    "MCP",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Hyderabad",
    "PulseGen",
  ],
  authors: [{ name: "Syed Abdul Muneeb" }],
  creator: "Syed Abdul Muneeb",
  publisher: "Syed Abdul Muneeb",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Share images come from app/opengraph-image.tsx and twitter-image.tsx.
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: "https://www.syedabdulmuneeb.dev",
    title: "Syed Abdul Muneeb, Software Engineer",
    description: DESCRIPTION,
    siteName: "Syed Abdul Muneeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syed Abdul Muneeb, Software Engineer",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: "https://www.syedabdulmuneeb.dev",
    image: "https://www.syedabdulmuneeb.dev/avatar-1200.jpg",
    email: `mailto:${profile.email}`,
    jobTitle: "Software Development Engineer",
    worksFor: { "@type": "Organization", name: "PulseGen", url: "https://www.pulsegen.io" },
    alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressCountry: "IN",
    },
    knowsAbout: [
      "AI agents",
      "Large language models",
      "Model Context Protocol",
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "MongoDB",
    ],
    sameAs: [profile.linkedin, profile.github],
    description:
      "Full-stack engineer who builds AI-agent products: streaming LLM chat, MCP and REST integrations, and multi-tenant search at PulseGen.",
  };

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
