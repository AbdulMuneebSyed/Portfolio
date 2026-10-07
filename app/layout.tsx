import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./app-store.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syedabdulmuneeb.dev"),
  title: {
    default: "Syed Abdul Muneeb | Software Engineer Portfolio",
    template: "%s | Syed Abdul Muneeb",
  },
  description:
    "Explore the interactive portfolio of Syed Abdul Muneeb, a Software Engineer. Experience Muneeb OS, a macOS-style desktop showcasing projects, skills, and experience.",
  keywords: [
    "Syed Abdul Muneeb",
    "Software Engineer",
    "Portfolio",
    "Web Developer",
    "React",
    "Next.js",
    "macOS Portfolio",
    "Interactive Portfolio",
    "Frontend Developer",
    "Full Stack Developer",
    "JavaScript",
    "TypeScript",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.syedabdulmuneeb.dev",
    title: "Syed Abdul Muneeb - Software Engineer Portfolio",
    description:
      "Welcome to Muneeb OS! An interactive macOS-style portfolio showcasing my work as a Software Engineer.",
    siteName: "Syed Abdul Muneeb Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Muneeb OS Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syed Abdul Muneeb - Software Engineer Portfolio",
    description:
      "Welcome to Muneeb OS! An interactive macOS-style portfolio showcasing my work as a Software Engineer.",
    images: ["/og-image.png"],
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
    name: "Syed Abdul Muneeb",
    url: "https://www.syedabdulmuneeb.dev",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://www.linkedin.com/in/syed-abdul-muneeb/",
      "https://github.com/AbdulMuneebSyed",
    ],
    description:
      "Full-stack engineer who ships AI-agent products to production: streaming LLM chat, MCP and REST integrations, and multi-tenant search at PulseGen.",
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
