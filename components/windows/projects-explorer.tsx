"use client"

import { useState } from "react"
import { ChevronRight, Search, Folder, FileText, ExternalLink } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  image: string
  demoLink?: string
  category: string
}

const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard.",
    techStack: ["React", "Node.js", "PostgreSQL", "Stripe"],
    image: "/ecommerce-dashboard.png",
    demoLink: "https://example.com",
    category: "Web Development",
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates, team collaboration, and project tracking.",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    image: "/task-management-interface.png",
    demoLink: "https://example.com",
    category: "Web Development",
  },
  {
    id: "3",
    title: "AI Chat Assistant",
    description: "Intelligent chatbot powered by AI with context awareness and natural language processing.",
    techStack: ["Python", "OpenAI", "FastAPI", "React"],
    image: "/ai-chat-interface.png",
    demoLink: "https://example.com",
    category: "AI/ML",
  },
  {
    id: "4",
    title: "Portfolio Website",
    description: "Modern portfolio website with animations, dark mode, and responsive design.",
    techStack: ["Next.js", "Framer Motion", "Tailwind CSS"],
    image: "/portfolio-website-showcase.png",
    demoLink: "https://example.com",
    category: "Web Development",
  },
]

export function ProjectsExplorer() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [breadcrumb] = useState(["Computer", "Projects"])

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Explorer Toolbar */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center gap-2 px-3 py-2">
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">File</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">Edit</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">View</button>
          <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">Tools</button>
        </div>

        {/* Address Bar */}
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

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {selectedProject ? (
          // Project Detail View
          <div className="max-w-4xl mx-auto">
            <button
              className="mb-4 text-blue-600 hover:underline text-sm flex items-center gap-1"
              onClick={() => setSelectedProject(null)}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Projects
            </button>

            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <img
                src={selectedProject.image || "/placeholder.svg"}
                alt={selectedProject.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.title}</h2>
                <p className="text-gray-600 mb-4">{selectedProject.description}</p>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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
                    View Demo
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Projects Grid View
          <div className="grid grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                className="text-left border border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all bg-white"
                onClick={() => setSelectedProject(project)}
              >
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-xs text-gray-500">{project.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-300 bg-gradient-to-b from-gray-50 to-white px-3 py-1">
        <span className="text-xs text-gray-600">{filteredProjects.length} items</span>
      </div>
    </div>
  )
}
