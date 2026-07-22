"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  LayoutGrid,
  ListFilter,
  Search,
  Star,
} from "lucide-react";

type ProjectStatus = "Live" | "Building" | "Prototype";

type ProjectRecord = {
  id: string;
  name: string;
  category: string;
  status: ProjectStatus;
  score: number;
  updated: string;
  summary: string;
  stack: string[];
  outcomes: string[];
  link: string;
};

const baseProjects: ProjectRecord[] = [
  {
    id: "commerce",
    name: "E-Commerce Platform",
    category: "Full Stack",
    status: "Live",
    score: 92,
    updated: "2026-06-14",
    summary:
      "Inventory, checkout, admin reporting, and payment-oriented storefront workflows.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe"],
    outcomes: ["Order flow", "Admin metrics", "Inventory alerts"],
    link: "https://github.com/AbdulMuneebSyed",
  },
  {
    id: "tasks",
    name: "Task Management App",
    category: "Productivity",
    status: "Building",
    score: 86,
    updated: "2026-05-28",
    summary:
      "Team workspaces with real-time task states, project views, and collaboration notes.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    outcomes: ["Realtime state", "Team filters", "Progress views"],
    link: "https://github.com/AbdulMuneebSyed",
  },
  {
    id: "assistant",
    name: "AI Chat Assistant",
    category: "AI",
    status: "Prototype",
    score: 81,
    updated: "2026-05-09",
    summary:
      "Conversational assistant interface with prompt memory, context grouping, and response review.",
    stack: ["Python", "FastAPI", "OpenAI", "React"],
    outcomes: ["Prompt flows", "Context panel", "Review queue"],
    link: "https://github.com/AbdulMuneebSyed",
  },
  {
    id: "portfolio",
    name: "Portfolio Desktop OS",
    category: "Frontend",
    status: "Live",
    score: 95,
    updated: "2026-07-09",
    summary:
      "Windows-inspired portfolio with draggable apps, desktop state, and interactive demos.",
    stack: ["Next.js", "Framer Motion", "Zustand", "Tailwind"],
    outcomes: ["Desktop shell", "Window manager", "Playable apps"],
    link: "https://github.com/AbdulMuneebSyed/Portfolio",
  },
];

const categories = ["All", "Full Stack", "Productivity", "AI", "Frontend"];
const statuses: Array<"All" | ProjectStatus> = [
  "All",
  "Live",
  "Building",
  "Prototype",
];

export function ProjectsExplorerPro() {
  const [projects, setProjects] = useState(baseProjects);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProjectStatus>("All");
  const [selectedId, setSelectedId] = useState(baseProjects[0].id);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return projects.filter((project) => {
      const matchesQuery =
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.summary.toLowerCase().includes(normalizedQuery) ||
        project.stack.some((tech) => tech.toLowerCase().includes(normalizedQuery));
      const matchesCategory = category === "All" || project.category === category;
      const matchesStatus = status === "All" || project.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, projects, query, status]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedId) ??
    filteredProjects[0] ??
    projects[0];

  const liveCount = projects.filter((project) => project.status === "Live").length;
  const averageScore = Math.round(
    projects.reduce((sum, project) => sum + project.score, 0) / projects.length
  );

  const cycleStatus = (projectId: string) => {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) return project;
        const nextStatus: Record<ProjectStatus, ProjectStatus> = {
          Live: "Building",
          Building: "Prototype",
          Prototype: "Live",
        };
        return { ...project, status: nextStatus[project.status] };
      })
    );
  };

  return (
    <div className="flex h-full flex-col bg-[#f3f7fb] text-slate-900">
      <div className="border-b border-slate-300 bg-gradient-to-b from-white to-[#dfeaf5]">
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            File
          </button>
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            View
          </button>
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            Analyze
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-white/80 px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-slate-300 bg-white px-2 py-1 text-sm">
            <FolderGit2 className="size-4 text-sky-700" />
            <span>Computer</span>
            <span className="text-slate-400">/</span>
            <span>Portfolio</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium">Projects Explorer Pro</span>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              className="w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-sm outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[190px_minmax(280px,1fr)_280px]">
        <aside className="border-r border-slate-300 bg-[#edf4fb] p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <ListFilter className="size-4" />
            Filters
          </div>
          <label className="mb-1 block text-xs text-slate-600" htmlFor="project-category">
            Category
          </label>
          <select
            id="project-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mb-3 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label className="mb-1 block text-xs text-slate-600" htmlFor="project-status">
            Status
          </label>
          <select
            id="project-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "All" | ProjectStatus)
            }
            className="mb-4 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <div className="rounded border border-slate-300 bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <BarChart3 className="size-4 text-sky-700" />
              Portfolio Health
            </div>
            <div className="text-2xl font-semibold">{averageScore}%</div>
            <div className="text-xs text-slate-500">{liveCount} live projects</div>
          </div>
        </aside>

        <main className="min-w-0 overflow-auto bg-white">
          <div className="sticky top-0 grid grid-cols-[1.5fr_110px_100px_90px] border-b border-slate-300 bg-[#eef5fc] px-3 py-2 text-xs font-semibold uppercase text-slate-500">
            <span>Project</span>
            <span>Category</span>
            <span>Status</span>
            <span>Score</span>
          </div>
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className={`grid w-full grid-cols-[1.5fr_110px_100px_90px] items-center border-b border-slate-200 px-3 py-3 text-left text-sm hover:bg-sky-50 ${
                selectedProject.id === project.id ? "bg-[#dff0ff]" : "bg-white"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{project.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {project.updated}
                </span>
              </span>
              <span className="text-slate-600">{project.category}</span>
              <span className="flex items-center gap-1 text-slate-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {project.status}
              </span>
              <span className="font-semibold">{project.score}</span>
            </button>
          ))}
        </main>

        <aside className="border-l border-slate-300 bg-[#f8fbff] p-4">
          <div className="mb-3 flex items-center gap-2">
            <LayoutGrid className="size-5 text-sky-700" />
            <h2 className="text-base font-semibold">{selectedProject.name}</h2>
          </div>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {selectedProject.summary}
          </p>
          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedProject.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Outcomes
            </div>
            <div className="flex flex-col gap-2">
              {selectedProject.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-center gap-2 text-sm">
                  <Star className="size-4 text-amber-500" />
                  {outcome}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => cycleStatus(selectedProject.id)}
            className="mb-2 w-full rounded border border-sky-400 bg-[#e6f4ff] px-3 py-2 text-sm font-medium text-sky-900 hover:bg-[#d4ecff]"
          >
            Cycle project status
          </button>
          <a
            href={selectedProject.link}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded bg-[#1f5f99] px-3 py-2 text-sm font-medium text-white hover:bg-[#184d7c]"
          >
            Open source
            <ExternalLink className="size-4" />
          </a>
        </aside>
      </div>

      <div className="border-t border-slate-300 bg-gradient-to-b from-white to-[#e7eef6] px-3 py-1 text-xs text-slate-600">
        {filteredProjects.length} items selected from {projects.length} portfolio records
      </div>
    </div>
  );
}
