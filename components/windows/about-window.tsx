"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Briefcase,
  Code2,
  Award,
  Mail,
  FileText,
  Download,
  Linkedin,
  Github,
} from "lucide-react";
import { launchApp } from "@/lib/launch-app";
import Image from "next/image";
import {
  awards,
  education,
  profile,
  skillGroups,
  timeline,
} from "@/lib/portfolio-data";

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
                Full-stack engineer who builds AI-agent products.
                Built streaming LLM chat, MCP and REST integrations, and
                multi-tenant search at PulseGen, and scaled a learning platform
                serving 30K+ daily users at MathonGO. Most comfortable owning a
                feature end to end: spec, code, tests and deploy.
              </p>
              <dl className="about-facts">
                <div>
                  <dt>Status</dt>
                  <dd>{profile.status}</dd>
                </div>
                <div>
                  <dt>Currently</dt>
                  <dd>SDE at PulseGen, working on AI agents</dd>
                </div>
                <div>
                  <dt>Previously</dt>
                  <dd>MathonGO · Capco-CS · Co-founder of AiResumate</dd>
                </div>
                <div>
                  <dt>Research</dt>
                  <dd>Checkpointed state for tool-using LLM agents</dd>
                </div>
                <div>
                  <dt>Education</dt>
                  <dd>
                    {education.degree}, MJCET · {education.period}
                  </dd>
                </div>
              </dl>
              {/* Everything a recruiter needs, one click each. */}
              <div className="about-links">
                <button
                  className="mac-button primary"
                  onClick={() => launchApp("contact")}
                >
                  <Mail size={14} />
                  Get in touch
                </button>
                <a
                  className="mac-button"
                  href={profile.resume}
                  download="syedabdulmuneebresume.pdf"
                >
                  <Download size={14} />
                  Resume PDF
                </a>
                <a
                  className="mac-button"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
                <a
                  className="mac-button"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={14} />
                  GitHub
                </a>
              </div>
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
