"use client";

import { useEffect, useState } from "react";
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
import { awards, skillGroups, timeline } from "@/lib/portfolio-data";

export function AboutWindow({ tab: initialTab }: { tab?: string }) {
  const [tab, setTab] = useState(initialTab ?? "Overview");
  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

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
