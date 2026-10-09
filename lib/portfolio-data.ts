// Portfolio content shared by About Me, Projects and the App Store.

// Who Muneeb is, in one line, and how to reach him. Shown wherever a
// visitor should get it without exploring: lock screens, About, metadata.
export const profile = {
  name: "Syed Abdul Muneeb",
  role: "SDE at PulseGen",
  status: "Open to SDE roles",
  location: "Hyderabad, India",
  email: "samuneeb786@gmail.com",
  linkedin: "https://www.linkedin.com/in/syed-abdul-muneeb/",
  github: "https://github.com/AbdulMuneebSyed",
  resume: "/syedabdulmuneebresume.pdf",
};

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  image?: string;
  demoLink?: string;
  category: string;
  highlights?: string[];
}

export const projects: Project[] = [
  {
    id: "arrwin",
    title: "Arrwin (PulseGen)",
    description:
      "An AI assistant for product managers. Built ingestion, streaming chat, contradiction detection and tenant-isolated knowledge workflows, plus the Daily Brief that pulls in Gmail and other connectors over MCP and REST.",
    techStack: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Redis Streams",
      "S3",
      "AI agents",
      "MCP",
    ],
    demoLink: "https://www.pulsegen.io",
    category: "AI Agents",
    highlights: [
      "Streaming LLM chat with contradiction detection",
      "Daily Brief with Gmail and other connectors via MCP",
      "Tenant-isolated knowledge workflows",
    ],
  },
  {
    id: "airesumate",
    title: "AiResumate",
    description:
      "Co-founded AI resume platform routing between Gemini, OpenAI GPT and Claude for real-time ATS scoring and rewriting, via serverless REST endpoints. Cashfree payments, zero-downtime Vercel CI/CD.",
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
      "1K+ visitors and $150+ revenue in month one",
      "Zero-downtime releases",
    ],
  },
  {
    id: "getmarks",
    title: "GetMarks (MathonGO)",
    description:
      "SDE Intern work on GetMarks — built the Leaderboard and League modules and the Courses (LMS) module, and led the NEET v2 revamp.",
    techStack: ["React", "Next.js", "Node.js", "Redux", "REST APIs"],
    demoLink: "https://web.getmarks.app",
    category: "EdTech",
    highlights: [
      "1L+ weekly rank updates with low-latency UX",
      "NEET v2 release coincided with 3x daily NEET users",
      "30K+ daily active learners on LMS launch",
    ],
  },
  {
    id: "agent-checkpoints",
    title: "Checkpointed State for LLM Agents",
    description:
      "Research paper (2026) on the long-horizon reliability gap in tool-using LLM agents. Proposed checkpointed state management and designed the experimental evaluation. With S. S. Ahmed and S. W. Sidiqi.",
    techStack: ["LLM agents", "Tool use", "Evaluation"],
    category: "Research",
  },
  {
    id: "hypogen",
    title: "Hypogen",
    description:
      "A multi-role LLM pipeline that answers business questions by generating and running DuckDB SQL over business data.",
    techStack: ["LLM APIs", "Multi-agent", "DuckDB", "SQL"],
    category: "AI Agents",
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
      "127+ registrations a day at peak",
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

export const skillGroups = [
  {
    label: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "C++ (DSA & CP)", "Java", "SQL"],
  },
  {
    label: "Development",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "Redux",
      "Tailwind CSS",
      "REST APIs",
      "AI agents",
      "MCP",
      "LLM APIs",
    ],
  },
  {
    label: "Data & Infra",
    items: [
      "MongoDB",
      "PostgreSQL",
      "Redis",
      "DuckDB",
      "Supabase",
      "AWS",
      "Docker",
      "Git",
      "Vercel",
      "CI/CD",
      "Jest",
      "Playwright",
    ],
  },
];

export const timeline = [
  {
    id: "pulsegen",
    period: "Feb 2026 – Present",
    title: "SDE · PulseGen",
    location: "Hyderabad",
    points: [
      "Arrwin, an AI assistant for product managers: ingestion, streaming chat, contradiction detection and tenant-isolated knowledge workflows with Next.js, TypeScript, MongoDB, Redis Streams, S3 and AI agents.",
      "Shipped the Daily Brief for PMs, integrating Gmail and other connectors via MCP and REST APIs; diagnosed auth and permission failures across MongoDB Atlas and OAuth scopes.",
      "Search pipeline on AWS and MongoDB Atlas with 3-tier relevance scoring across 400K+ accounts in a multi-tenant SaaS.",
      "7-level user-adoption tracking with batch fetching, cron jobs and MongoDB Change Streams, cutting database round trips by ~80%.",
      "RBAC, onboarding, notifications, email workflows, CI/CD and virtualized views rendering 100K+ elements per page; closed 84 feature and bug tickets with Jest unit and integration tests.",
    ],
  },
  {
    id: "mathongo",
    period: "Jul 2025 – Jan 2026",
    title: "SDE Intern · MathonGO (GetMarks)",
    location: "Bengaluru",
    points: [
      "Built and optimized the Leaderboard and League modules for GetMarks in React with REST APIs, handling 1L+ weekly rank updates with low-latency UX.",
      "Led the NEET v2 revamp: refactored data flow, API caching and the rendering pipeline; the release coincided with 3x daily NEET users.",
      "Integrated a modular LMS Courses module into GetMarks, serving 30K+ DAUs at launch.",
    ],
  },
  {
    id: "airesumate",
    period: "Dec 2024 – May 2025",
    title: "Co-founder & Full Stack Developer · AiResumate (Capco-cs)",
    location: "Remote",
    points: [
      "Shipped an AI resume platform (Next.js) routing between Gemini, OpenAI GPT and Claude for real-time ATS scoring and rewriting, via serverless REST endpoints.",
      "Integrated Cashfree payments with zero-downtime Vercel CI/CD; reached 1K+ visitors and $150+ revenue in month one.",
    ],
  },
  {
    id: "ecell-mjcet",
    period: "Sep 2024 – Jul 2025",
    title: "Tech Lead · E-Cell MJCET",
    location: "Hyderabad",
    points: [
      "Led a 5-member team building the hackathon platform (Next.js): 500K+ visitors, 30K users (440% growth), 127+ registrations/day at peak.",
    ],
  },
];

export const education = {
  degree: "B.E. Computer Science",
  school: "Muffakham Jah College of Engineering and Technology, Hyderabad",
  period: "Sep 2022 – Aug 2026",
};

export const awards = [
  "#1 College Rank · GeeksforGeeks",
  "MasterBlaze Winner · Coding Ninjas (2024)",
  "4-Star Coder · GeeksforGeeks",
];
