"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Search,
  ExternalLink,
  LayoutGrid,
  List,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { AppIcon, PhoneAppIcon } from "@/lib/app-icons";
import { usePhone } from "@/lib/phone";
import { FinderLabel } from "@/components/finder-label";
import { projects, type Project } from "@/lib/portfolio-data";
import { openInAppStore } from "@/lib/launch-app";

// iPhone: one card per project with its own icon, opening a detail page laid
// out like an App Store listing.
function PhoneProjectList({
  items,
  onOpen,
}: {
  items: Project[];
  onOpen: (p: Project) => void;
}) {
  return (
    <div className="phone-projects">
      {items.map((p) => (
        <button key={p.id} className="phone-project-card" onClick={() => onOpen(p)}>
          <PhoneAppIcon appId={p.id} size={56} />
          <span className="phone-project-text">
            <small>{p.category}</small>
            <strong>{p.title}</strong>
            <span>{p.description}</span>
            {p.highlights?.[0] && <em>{p.highlights[0]}</em>}
          </span>
          <ChevronRight size={18} className="phone-project-chevron" />
        </button>
      ))}
    </div>
  );
}

function PhoneProjectDetail({ project }: { project: Project }) {
  return (
    <article className="phone-project-detail">
      <header>
        <PhoneAppIcon appId={project.id} size={104} />
        <div>
          <h1>{project.title}</h1>
          <p>{project.category}</p>
          {project.demoLink ? (
            <a
              className="phone-project-open"
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
          ) : (
            <button
              className="phone-project-open"
              onClick={() => openInAppStore(project.id)}
            >
              View
            </button>
          )}
        </div>
      </header>
      {project.highlights && (
        <div className="phone-project-stats">
          {project.highlights.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      )}
      <section>
        <h3>About</h3>
        <p>{project.description}</p>
      </section>
      <section>
        <h3>Built with</h3>
        <div className="project-tech">
          {project.techStack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </section>
      <button
        className="phone-project-store"
        onClick={() => openInAppStore(project.id)}
      >
        View in App Store <ChevronRight size={16} />
      </button>
    </article>
  );
}

export function ProjectsExplorer() {
  const phone = usePhone();
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
          {/* On a phone the detail page carries the title itself. */}
          <h2>{selectedProject ? (phone ? "" : selectedProject.title) : "Projects"}</h2>
          {!selectedProject && !phone && (
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
          {phone && selectedProject ? (
            <PhoneProjectDetail project={selectedProject} />
          ) : phone && filtered.length ? (
            <PhoneProjectList items={filtered} onOpen={setSelectedProject} />
          ) : selectedProject ? (
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
