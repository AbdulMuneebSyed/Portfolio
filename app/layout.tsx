import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Syed Abdul Muneeb | Software Engineer Portfolio",
    template: "%s | Syed Abdul Muneeb",
  },
  description:
    "Explore the interactive portfolio of Syed Abdul Muneeb, a Software Engineer. Experience Muneeb OS, a retro Windows 7-style interface showcasing projects, skills, and experience.",
  keywords: [
    "Syed Abdul Muneeb",
    "Software Engineer",
    "Portfolio",
    "Web Developer",
    "React",
    "Next.js",
    "Windows 7 Clone",
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
    url: "https://portfolio-muneeb.vercel.app", // Assuming a URL or placeholder
    title: "Syed Abdul Muneeb - Software Engineer Portfolio",
    description:
      "Welcome to Muneeb OS! An interactive Windows 7-style portfolio showcasing my work as a Software Engineer.",
    siteName: "Syed Abdul Muneeb Portfolio",
    images: [
      {
        url: "/windowslogo.png", // Using existing asset
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
      "Welcome to Muneeb OS! An interactive Windows 7-style portfolio showcasing my work as a Software Engineer.",
    images: ["/windowslogo.png"],
    creator: "@muneeb", // Placeholder, user can update
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
    url: "https://portfolio-muneeb.vercel.app",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://www.linkedin.com/in/syed-abdul-muneeb/",
      "https://github.com/AbdulMuneebSyed",
    ],
    description:
      "Software Engineer specializing in building exceptional digital experiences. Currently focused on building accessible, human-centered products.",
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
