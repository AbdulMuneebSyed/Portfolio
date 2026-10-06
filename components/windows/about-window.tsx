"use client";

import { useState } from "react";
import {
  UserRound,
  Briefcase,
  Code2,
  Award,
  Mail,
  FileText,
} from "lucide-react";
import { launchApp } from "@/lib/launch-app";
import Image from "next/image";

export function AboutWindow() {
  const [tab, setTab] = useState("Overview");
  const skillGroups = [
    {
      label: "Languages",
      items: ["JavaScript", "TypeScript", "Python", "C++", "Java", "C", "Rust"],
    },
    {
      label: "Frameworks & Frontend",
      items: [
        "React",
        "Next.js",
        "Node.js",
        "ASP.NET Core",
        "SignalR",
        "Express",
        "Tailwind CSS",
        "Redux",
      ],
    },
    {
      label: "Databases & Infra",
      items: [
        "MongoDB",
        "PostgreSQL",
        "Redis",
        "Supabase",
        "AWS (S3, EC2, CloudFront)",
        "Docker",
        "Vercel",
      ],
    },
    {
      label: "Concepts",
      items: ["DSA", "OOP", "System Design", "GenAI", "MCP"],
    },
  ];

  const timeline = [
    {
      period: "Feb 2026 – Present",
      title: "SDE Intern · Pulsegen",
      location: "Hyderabad",
      points: [
        "MongoDB Atlas Search autocomplete pipeline with 3-tier scoring (exact → prefix → fuzzy) for a 400K+ account SaaS.",
        "7-level user adoption tracking (L1–L7) with batch fetching, cron jobs, and Change Streams — cut DB round-trips by ~80%.",
        "RBAC, onboarding, notifications, and MCP integration in a virtualized app rendering 100K+ elements per page.",
      ],
    },
    {
      period: "Jul 2025 – Jan 2026",
      title: "SDE Intern · MathonGO (GetMarks)",
      location: "Bengaluru",
      points: [
        "Built and optimized Leaderboard, League, and Horoscope modules — 1L+ weekly rank updates.",
        "Led NEET v2 revamp: data flow, caching, UX — 300% rise in daily NEET aspirants.",
        "Shipped the Courses (LMS) module supporting 30K+ daily active learners on launch.",
      ],
    },
    {
      period: "Dec 2024 – May 2025",
      title: "Full Stack Developer · Capco-CS",
      location: "Remote",
      points: [
        "Custom CRM + React/Supabase vendor portal — +30% client management, +25% vendor onboarding.",
        "Gemini-powered support chatbot — 90% faster response time.",
      ],
    },
    {
      period: "Sep 2024 – Jul 2025",
      title: "Tech Lead · E-Cell MJCET",
      location: "Hyderabad",
      points: [
        "Led a 5-member team building E-Cell's hackathon platform (Next.js).",
        "500K+ visitors, 127+ daily registrations, 440% growth to 30K users.",
      ],
    },
  ];

  const awards = [
    "#1 College Rank · GeeksforGeeks",
    "MasterBlaze Winner · Coding Ninjas (2024)",
    "4-Star Coder · GeeksforGeeks",
  ];

  return (
    <div className="mac-split">
      <aside className="mac-sidebar">
        <div className="sidebar-heading">About Me</div>
        {[
          { name: "Overview", icon: UserRound },
          { name: "Experience", icon: Briefcase },
          { name: "Skills", icon: Code2 },
          { name: "Awards", icon: Award },
        ].map((item) => (
          <button
            key={item.name}
            className="sidebar-item"
            data-selected={tab === item.name}
            onClick={() => setTab(item.name)}
          >
            <item.icon />
            <span>{item.name}</span>
          </button>
        ))}
      </aside>
      <main className="finder-main">
        <div className="mac-toolbar">
          <h2>{tab}</h2>
          <button className="mac-button" onClick={() => launchApp("resume")}>
            <FileText size={13} />
            Resume
          </button>
        </div>
        <div className="about-content">
          {tab === "Overview" && (
            <>
              <Image
                src="/avatar-256.jpg"
                alt="Syed Abdul Muneeb"
                width={112}
                height={112}
                className="about-avatar"
              />
              <p className="about-eyebrow">Software Engineer</p>
              <h1>Syed Abdul Muneeb</h1>
              <p className="mac-muted">Hyderabad, India</p>
              <p className="about-bio">
                Full-stack SDE with production experience across edtech,
                fintech, and AI-powered SaaS platforms. Shipping features at
                scale — from MongoDB Atlas search pipelines handling 400K+
                documents to React frontends serving 30K+ daily active users.
              </p>
              <dl className="about-facts">
                <div>
                  <dt>Currently</dt>
                  <dd>SDE Intern at Pulsegen</dd>
                </div>
                <div>
                  <dt>Previously</dt>
                  <dd>MathonGO · Capco-CS</dd>
                </div>
                <div>
                  <dt>Building</dt>
                  <dd>Co-founder of AiResumate</dd>
                </div>
                <div>
                  <dt>Education</dt>
                  <dd>B.E. Computer Science, MJCET · 2022–2026</dd>
                </div>
              </dl>
              <button
                className="mac-button primary"
                onClick={() => launchApp("contact")}
              >
                <Mail size={14} />
                Get in touch
              </button>
            </>
          )}
          {tab === "Experience" && (
            <>
              <h1>Experience</h1>
              {timeline.map((item) => (
                <section className="experience-entry" key={item.title}>
                  <p className="mac-muted text-xs">
                    {item.period} · {item.location}
                  </p>
                  <h2>{item.title}</h2>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
          {tab === "Skills" && (
            <>
              <h1>Skills</h1>
              {skillGroups.map((group) => (
                <section className="experience-entry" key={group.label}>
                  <h2>{group.label}</h2>
                  <div className="project-tech">
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
          {tab === "Awards" && (
            <>
              <h1>Awards & Recognition</h1>
              {awards.map((award) => (
                <div className="award-row" key={award}>
                  <Award size={24} />
                  <span>{award}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
