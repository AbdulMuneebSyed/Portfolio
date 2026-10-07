"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Search,
  ExternalLink,
  LayoutGrid,
  List,
  Briefcase,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { FinderLabel } from "@/components/finder-label";
import { projects, type Project } from "@/lib/portfolio-data";
import { openInAppStore } from "@/lib/launch-app";

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
          <div className="toolbar-group">
            <button
              className="mac-icon-button"
              aria-label="Back to projects"
              disabled={!selectedProject}
              onClick={() => setSelectedProject(null)}
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          <h2>{selectedProject?.title ?? "Projects"}</h2>
          {!selectedProject && (
            <div className="toolbar-group">
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
            </div>
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
              <div className="flex flex-wrap gap-2">
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
                {/* Every project has an App Store page with the same id. */}
                <button
                  className="mac-button"
                  onClick={() => openInAppStore(selectedProject.id)}
                >
                  View in App Store
                </button>
              </div>
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
                  <AppIcon appId="projects" size={64} />
                  <span className="finder-file-name">
                    <FinderLabel name={p.title} />
                  </span>
                  <span className="finder-file-info">{p.category}</span>
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
        <div className="mac-statusbar finder-status">
          {selectedProject
            ? "1 project selected"
            : `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}`}
        </div>
      </main>
    </div>
  );
}
