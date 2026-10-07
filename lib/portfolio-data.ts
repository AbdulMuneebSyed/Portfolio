// Portfolio content shared by About Me, Projects and the App Store.

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

export const skillGroups = [
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

export const timeline = [
  {
    id: "pulsegen",
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
    id: "mathongo",
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
    id: "capco-cs",
    period: "Dec 2024 – May 2025",
    title: "Full Stack Developer · Capco-CS",
    location: "Remote",
    points: [
      "Custom CRM + React/Supabase vendor portal — +30% client management, +25% vendor onboarding.",
      "Gemini-powered support chatbot — 90% faster response time.",
    ],
  },
  {
    id: "ecell-mjcet",
    period: "Sep 2024 – Jul 2025",
    title: "Tech Lead · E-Cell MJCET",
    location: "Hyderabad",
    points: [
      "Led a 5-member team building E-Cell's hackathon platform (Next.js).",
      "500K+ visitors, 127+ daily registrations, 440% growth to 30K users.",
    ],
  },
];

export const awards = [
  "#1 College Rank · GeeksforGeeks",
  "MasterBlaze Winner · Coding Ninjas (2024)",
  "4-Star Coder · GeeksforGeeks",
];

