"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Search,
  Folder,
  ExternalLink,
  LayoutGrid,
  List,
  Briefcase,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  image?: string;
  demoLink?: string;
  category: string;
  highlights?: string[];
}

const projects: Project[] = [
  {
    id: "airesumate",
    title: "AiResumate",
    description:
      "Co-founded AI resume platform integrating Gemini, GPT, and Claude for real-time scoring, rewriting, and ATS optimization. Cashfree payments, Vercel deploy.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Gemini",
      "OpenAI",
      "Claude",
      "Cashfree",
      "Vercel",
    ],
    demoLink: "https://airesumate.com",
    category: "AI / SaaS",
    highlights: [
      "1,000+ visitors and $150+ revenue in month one",
      "Zero-downtime releases",
    ],
  },
  {
    id: "getmarks",
    title: "GetMarks (MathonGO)",
    description:
      "SDE Intern work on GetMarks — built Leaderboard, League, Horoscope, and the Courses (LMS) module. Led NEET v2 revamp.",
    techStack: ["React", "Next.js", "Node.js", "Redux", "MongoDB"],
    demoLink: "https://web.getmarks.app",
    category: "EdTech",
    highlights: [
      "1L+ weekly rank updates",
      "300% rise in daily NEET aspirants after v2",
      "30K+ daily active learners on LMS launch",
    ],
  },
  {
    id: "launchpad",
    title: "LaunchPad — Startup Network",
    description:
      "Twitter-like startup networking platform with real-time feeds, founder profiles, and live interactions. JWT auth, Redis caching, modular backend.",
    techStack: [".NET Core", "React", "PostgreSQL", "SignalR", "Redis"],
    category: "Full Stack",
  },
  {
    id: "capco",
    title: "Capco-CS Vendor Portal",
    description:
      "Full-stack web app with custom CRM and vendor portal; Gemini-powered support chatbot integrated for automated user support.",
    techStack: ["React", "Supabase", "Gemini AI"],
    demoLink: "https://www.capco-cs.com",
    category: "Enterprise",
    highlights: [
      "+30% client management efficiency",
      "+25% vendor onboarding",
      "90% faster support response",
    ],
  },
  {
    id: "ecell",
    title: "E-Cell MJCET Hackathon Platform",
    description:
      "Led a 5-member team to build E-Cell MJCET's hackathon platform. Managed architecture, deployment, and growth push.",
    techStack: ["Next.js", "TypeScript", "Tailwind"],
    demoLink: "https://www.hackrevolution.in",
    category: "Community",
    highlights: [
      "500K+ visitors",
      "127+ daily registrations",
      "440% growth to 30K users",
    ],
  },
  {
    id: "muneebos",
    title: "Muneeb OS (this portfolio)",
    description:
      "The site you're on right now — a macOS-style desktop built in React with a window manager, Dock, Spotlight, and mini-apps.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Zustand",
      "Framer Motion",
      "Tailwind",
    ],
    demoLink: "https://github.com/AbdulMuneebSyed",
    category: "Interactive",
  },
];

export function ProjectsExplorer() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Projects");
  const [view, setView] = useState<"icons" | "list">("icons");
  const categories = [
    "All Projects",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const filtered = projects.filter(
    (p) =>
      (category === "All Projects" || p.category === category) &&
      `${p.title} ${p.description} ${p.techStack.join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="mac-split">
      <aside className="mac-sidebar">
        <div className="sidebar-heading">Portfolio</div>
        <nav aria-label="Project categories">
          {categories.map((name) => (
            <button
              key={name}
              className="sidebar-item"
              data-selected={category === name}
              onClick={() => {
                setCategory(name);
                setSelectedProject(null);
              }}
            >
              <Briefcase />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </nav>
        <div className="px-3 mt-8 text-[11px] leading-relaxed mac-muted">
          Selected work by
          <br />
          Syed Abdul Muneeb
        </div>
      </aside>
      <main className="finder-main">
        <div className="mac-toolbar">
          <button
            className="mac-icon-button"
            aria-label="Back to projects"
            disabled={!selectedProject}
            onClick={() => setSelectedProject(null)}
          >
            <ChevronLeft size={18} />
          </button>
          <h2>{selectedProject?.title ?? "Projects"}</h2>
          {!selectedProject && (
            <>
              <button
                className="mac-icon-button"
                aria-label="Icon view"
                aria-pressed={view === "icons"}
                onClick={() => setView("icons")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className="mac-icon-button"
                aria-label="List view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List size={18} />
              </button>
            </>
          )}
          <label className="mac-search">
            <Search size={14} />
            <input
              aria-label="Search projects"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProject(null);
              }}
            />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {selectedProject ? (
            <article className="project-detail">
              <AppIcon appId="projects" size={80} />
              <div className="mac-muted text-xs mt-3">
                {selectedProject.category}
              </div>
              <h1>{selectedProject.title}</h1>
              <p>{selectedProject.description}</p>
              {selectedProject.highlights && (
                <>
                  <h3>Highlights</h3>
                  <ul>
                    {selectedProject.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </>
              )}
              <h3>Built with</h3>
              <div className="project-tech">
                {selectedProject.techStack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              {selectedProject.demoLink && (
                <a
                  className="mac-button primary"
                  href={selectedProject.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open project <ExternalLink size={13} />
                </a>
              )}
            </article>
          ) : !filtered.length ? (
            <div className="empty-state">
              <Search size={32} />
              <p>No projects found</p>
            </div>
          ) : view === "icons" ? (
            <div className="finder-grid">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  className="finder-file"
                  onClick={() => setSelectedProject(p)}
                >
                  <AppIcon appId="projects" size={72} />
                  <span>{p.title}</span>
                  <span className="mac-muted text-[10px]">{p.category}</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {filtered.map((p) => (
                <button
                  key={p.id}
                  className="project-list-row"
                  onClick={() => setSelectedProject(p)}
                >
                  <AppIcon appId="projects" size={36} />
                  <span>
                    <strong>{p.title}</strong>
                    <small>{p.category}</small>
                  </span>
                  <span className="mac-muted">{p.techStack[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="finder-path">
          <Folder size={12} />
          <span>Portfolio</span>
          <span>›</span>
          <span>Projects</span>
          {selectedProject && (
            <>
              <span>›</span>
              <span>{selectedProject.title}</span>
            </>
          )}
        </div>
        <div className="mac-statusbar">
          <span>
            {selectedProject
              ? "1 project selected"
              : `${filtered.length} projects`}
          </span>
          <span>Portfolio</span>
        </div>
      </main>
    </div>
  );
}
