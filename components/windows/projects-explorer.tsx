"use client";

import { useState } from "react";
import { ChevronRight, Search, Folder, FileText, ExternalLink } from "lucide-react";

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
    techStack: ["Next.js", "TypeScript", "Gemini", "OpenAI", "Claude", "Cashfree", "Vercel"],
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
      "The site you're on right now — a Windows 7 desktop rebuilt in React with a full window manager, tour, and mini-apps.",
    techStack: ["Next.js", "TypeScript", "Zustand", "Framer Motion", "Tailwind"],
    demoLink: "https://github.com/AbdulMuneebSyed",
    category: "Interactive",
  },
];

export function ProjectsExplorer() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumb] = useState(["Computer", "Projects"]);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center gap-2 px-3 py-2">
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">File</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">Edit</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">View</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">Tools</button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200">
          <div className="flex items-center gap-1 flex-1 bg-white border border-gray-300 rounded px-2 py-1">
            <Folder className="w-4 h-4 text-gray-600" />
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 px-3 py-1 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selectedProject ? (
          <div className="max-w-4xl mx-auto">
            <button
              className="mb-4 text-blue-600 hover:underline text-sm flex items-center gap-1"
              onClick={() => setSelectedProject(null)}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Projects
            </button>

            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {selectedProject.image && (
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-6">
                <div className="text-xs text-blue-600 mb-1">
                  {selectedProject.category}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedProject.title}
                </h2>
                <p className="text-gray-700 mb-4">{selectedProject.description}</p>

                {selectedProject.highlights && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Highlights
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selectedProject.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.demoLink && (
                  <a
                    href={selectedProject.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Visit
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                className="text-left border border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all bg-white p-4"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <p className="text-xs text-blue-600">{project.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 text-gray-500 text-[11px]">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 bg-gradient-to-b from-gray-50 to-white px-3 py-1">
        <span className="text-xs text-gray-600">
          {filteredProjects.length} items
        </span>
      </div>
    </div>
  );
}
