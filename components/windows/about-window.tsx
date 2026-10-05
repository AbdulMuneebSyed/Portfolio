"use client";

import Image from "next/image";
import avatar from "../../public/avatar.jpg";

export function AboutWindow() {
  const skillGroups = [
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

  const timeline = [
    {
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
      period: "Dec 2024 – May 2025",
      title: "Full Stack Developer · Capco-CS",
      location: "Remote",
      points: [
        "Custom CRM + React/Supabase vendor portal — +30% client management, +25% vendor onboarding.",
        "Gemini-powered support chatbot — 90% faster response time.",
      ],
    },
    {
      period: "Sep 2024 – Jul 2025",
      title: "Tech Lead · E-Cell MJCET",
      location: "Hyderabad",
      points: [
        "Led a 5-member team building E-Cell's hackathon platform (Next.js).",
        "500K+ visitors, 127+ daily registrations, 440% growth to 30K users.",
      ],
    },
  ];

  const awards = [
    "#1 College Rank · GeeksforGeeks",
    "MasterBlaze Winner · Coding Ninjas (2024)",
    "4-Star Coder · GeeksforGeeks",
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-8 border-b border-gray-200">
          <Image
            src={avatar}
            alt="Syed Abdul Muneeb"
            width={128}
            height={128}
            className="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white ring-1 ring-gray-200"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Syed Abdul Muneeb
            </h1>
            <p className="text-lg text-blue-600 mb-3">
              Full-Stack Software Engineer · Hyderabad, India
            </p>
            <p className="text-gray-700 leading-relaxed">
              Full-stack SDE with production experience across edtech, fintech,
              and AI-powered SaaS platforms. Shipping features at scale — from
              MongoDB Atlas search pipelines handling 400K+ documents to React
              frontends serving 30K+ daily active users. Currently building at
              Pulsegen; previously at MathonGO (GetMarks) and Capco-CS.
              Co-founder of AiResumate.
            </p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded" />
            Skills
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded" />
            Experience
          </h2>
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-blue-100" />
            <div className="space-y-6">
              {timeline.map((item) => (
                <div key={item.title} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow" />
                  <div className="text-xs text-gray-500 mb-0.5">
                    {item.period} · {item.location}
                  </div>
                  <div className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                    {item.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded" />
            Awards
          </h2>
          <ul className="grid sm:grid-cols-3 gap-3">
            {awards.map((a) => (
              <li
                key={a}
                className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3"
              >
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-gray-500">
            B.E. Computer Science · Muffakham Jah College of Engineering &
            Technology (2022–2026)
          </p>
        </section>
      </div>
    </div>
  );
}
