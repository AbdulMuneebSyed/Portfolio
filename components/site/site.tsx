import Image from "next/image";
import { Archivo } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { profile, projects, timeline, type Project } from "@/lib/portfolio-data";
import { ContactForm } from "./contact-form";
import { CompanyIcon, ProjectShot } from "./project-shot";
import { SiteEffects } from "./site-effects";

// /profile: the portfolio as an ordinary website, for anyone who'd rather
// read than explore the OS. Rendered on the server; SiteEffects adds the
// motion and ContactForm the form.

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-archivo",
});

const NAV = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const QUOTE =
  "From spec to deploy. I like owning the whole feature: the data model, the API, the interface and the tests, built to be fast, reliable and simple to use.";

const SKILLS = [
  { name: "AI Agents", tags: ["LLM APIs", "MCP", "Multi-agent pipelines"] },
  { name: "Full-Stack Products", tags: ["Next.js", "Node.js", "TypeScript"] },
  { name: "Frontend & UI/UX", tags: ["React", "Framer Motion", "Responsive interfaces"] },
  { name: "Performance at Scale", tags: ["Virtualization", "Caching", "CI/CD"] },
];

// What I've shipped at PulseGen, one row per area.
const PULSEGEN = [
  { name: "AI assistant for product managers", tags: ["Streaming LLM chat", "Contradiction detection", "Tenant-isolated knowledge"] },
  { name: "Daily Brief over MCP", tags: ["Gmail and other connectors", "REST APIs", "OAuth scopes"] },
  { name: "Search across 400K+ accounts", tags: ["AWS", "MongoDB Atlas", "3-tier relevance scoring"] },
  { name: "~80% fewer database round trips", tags: ["7-level adoption tracking", "Change Streams", "Batch fetching"] },
  { name: "100K+ elements on one page", tags: ["Virtualized views", "RBAC and onboarding", "84 tickets shipped with tests"] },
];

// Featured with a picture, best first; the rest are listed below them.
const FEATURED: { id: string; label: string; title?: string }[] = [
  { id: "airesumate", label: "AI résumé platform · Co-founder" },
  { id: "getmarks", label: "Exam prep for 30K+ daily learners", title: "GetMarks" },
  { id: "paighaam", label: "Real-time chat in 20+ languages" },
  { id: "capco", label: "CRM, vendor portal and AI support", title: "Capco-CS" },
  { id: "ecell", label: "Hackathon platform · 500K+ visitors", title: "Hack Revolution" },
  { id: "aletheia", label: "AI fact-checker" },
];
const MORE: { id: string; title?: string }[] = [
  { id: "hypogen" },
  { id: "one-piss" },
  { id: "copyonscreenshot" },
  { id: "launchpad", title: "LaunchPad" },
];

// Each role in one line, for the experience cards.
const HEADLINES: Record<string, string> = {
  pulsegen:
    "Building AI-agent products: streaming LLM chat, MCP and REST connectors, and search across 400K+ accounts.",
  mathongo:
    "Built GetMarks' Leaderboard, League and Courses modules, serving 30K+ daily learners and 1L+ weekly rank updates.",
  airesumate:
    "Co-founded an AI résumé platform routing between Gemini, GPT and Claude. $150+ revenue in month one.",
  "capco-cs":
    "Built a CRM, a vendor portal and a Gemini support bot that made support responses 90% faster.",
  "ecell-mjcet":
    "Led a five-person team building a hackathon platform that reached 500K+ visitors.",
};

const byId = (id: string) => projects.find((p) => p.id === id) as Project;
const paper = byId("agent-checkpoints");

function Arrow() {
  return (
    <span className="mj-arrow" aria-hidden="true">
      <ArrowUpRight />
    </span>
  );
}

// The hero's two glossy shapes.
function Star() {
  return (
    <svg className="mj-shape mj-star" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="mj-holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9b8cff" />
          <stop offset=".5" stopColor="#5a3fd6" />
          <stop offset="1" stopColor="#c7b8ff" />
        </linearGradient>
        <linearGradient id="mj-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset=".45" stopColor="#0d0d0d" />
          <stop offset="1" stopColor="#222" />
        </linearGradient>
      </defs>
      <path d="M50 2 C55 36 64 45 98 50 C64 55 55 64 50 98 C45 64 36 55 2 50 C36 45 45 36 50 2Z" fill="url(#mj-holo)" transform="translate(3 3)" />
      <path d="M50 2 C55 36 64 45 98 50 C64 55 55 64 50 98 C45 64 36 55 2 50 C36 45 45 36 50 2Z" fill="url(#mj-ink)" />
      <path d="M50 10 C53 38 60 44 86 50" stroke="#ffffff40" strokeWidth="2" fill="none" />
    </svg>
  );
}
function Bolt() {
  return (
    <svg className="mj-shape mj-bolt" viewBox="0 0 80 110" aria-hidden="true">
      <path d="M48 2 8 62h28L28 108l46-64H44L56 2Z" fill="url(#mj-holo)" transform="translate(4 3)" />
      <path d="M48 2 8 62h28L28 108l46-64H44L56 2Z" fill="url(#mj-ink)" stroke="#ffffff30" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Portrait({ className }: { className?: string }) {
  return (
    <div className={`mj-portrait-card ${className ?? ""}`}>
      <div className="mj-face mj-face-back">
        <Image src="/avatar-1200.jpg" alt="" fill sizes="360px" priority />
      </div>
      <div className="mj-face mj-face-front">
        <Image src="/avatar-1200.jpg" alt="Syed Abdul Muneeb" fill sizes="360px" priority />
      </div>
    </div>
  );
}

export function Site() {
  return (
    <div className={`site ${archivo.variable}`} id="site">
      <SiteEffects />
      <div className="mj-grain" aria-hidden="true" />

      <nav className="mj-nav" aria-label="Main">
        <div className="mj-nav-bar">
          <a href="#top" className="mj-nav-name">
            Muneeb
          </a>
          <button
            type="button"
            className="mj-nav-toggle"
            aria-expanded="false"
            aria-controls="mj-nav-links"
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <ul className="mj-nav-links" id="mj-nav-links">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href}>{n.label}</a>
            </li>
          ))}
          <li>
            <a href="/" target="_top">MuneebOS ↗</a>
          </li>
        </ul>
      </nav>

      <main id="top">
        {/* Hero and bio share a stage, so the portrait can travel between them. */}
        <div className="mj-stage">
          <div className="mj-track" aria-hidden="true">
            <div className="mj-portrait">
              <Portrait />
            </div>
          </div>

          <header className="mj-hero mj-wrap">
            <h1>
              <span className="mj-hero-line">
                <Star />
                Software
              </span>
              <span className="mj-hero-line">
                Engineer
                <Bolt />
              </span>
              <span className="sr-only"> · {profile.name}</span>
            </h1>
            <div className="mj-hero-foot">
              <p className="mj-year">©2026</p>
              <p className="mj-slash">/Based in Hyderabad</p>
            </div>
          </header>

          <section id="about" className="mj-bio mj-wrap" aria-label="About">
            <div className="mj-bio-left">
              <h2 className="mj-title" data-reveal>
                Hey!
              </h2>
              <p className="mj-bio-lead">
                I&apos;m Muneeb, a software engineer at PulseGen in Hyderabad,
                building AI-agent products.
              </p>
            </div>
            <div className="mj-bio-photo">
              <Portrait className="mj-static" />
            </div>
            <div className="mj-bio-right">
              <p>
                I build full-stack products end to end, from the model call to
                the pixels: streaming LLM chat, MCP and REST integrations, and
                multi-tenant search across 400K+ accounts.
              </p>
              <p>
                Before PulseGen I scaled GetMarks to 30K+ daily learners at
                MathonGO, and co-founded AiResumate.
              </p>
              <a className="mj-cta" href="#contact">
                Get in touch
                <Arrow />
              </a>
            </div>
          </section>
        </div>

        <section className="mj-quote-wrap mj-wrap" aria-label="How I work">
          <p className="mj-quote">
            {QUOTE.split(" ").map((word, i) => (
              <span key={i}>{word} </span>
            ))}
          </p>
        </section>

        <section className="mj-section mj-wrap" aria-labelledby="skills-title">
          <h2 id="skills-title" className="mj-title" data-reveal>
            What I do
          </h2>
          <ul className="mj-rows">
            {SKILLS.map((s) => (
              <li key={s.name} data-reveal>
                <h3>{s.name}</h3>
                <p className="mj-dots">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mj-section mj-wrap" aria-labelledby="pulsegen-title">
          <h2 id="pulsegen-title" className="mj-title" data-reveal>
            Now at PulseGen
          </h2>
          <ul className="mj-rows">
            {PULSEGEN.map((s) => (
              <li key={s.name} data-reveal>
                <h3>{s.name}</h3>
                <p className="mj-dots">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="work" className="mj-section mj-wrap" aria-labelledby="work-title">
          <div className="mj-title-row">
            <h2 id="work-title" className="mj-title" data-reveal>
              Selected
              <br />
              Work
            </h2>
            <a className="mj-cta" href={profile.github} target="_blank" rel="noreferrer">
              All on GitHub
              <Arrow />
            </a>
          </div>
          <ul className="mj-projects">
            {FEATURED.map((f) => {
              const p = byId(f.id);
              return (
                <li key={f.id} data-reveal>
                  <a href={p.demoLink} target="_blank" rel="noreferrer" className="mj-project">
                    <ProjectShot id={f.id} />
                    <h3>{f.title ?? p.title}</h3>
                    <p>{f.label}</p>
                  </a>
                </li>
              );
            })}
          </ul>
          <ul className="mj-rows mj-more">
            {MORE.map((m) => {
              const p = byId(m.id);
              const name = m.title ?? p.title;
              return (
                <li key={m.id} data-reveal>
                  <h3>
                    {p.demoLink ? (
                      <a href={p.demoLink} target="_blank" rel="noreferrer">
                        {name}
                        <Arrow />
                      </a>
                    ) : (
                      name
                    )}
                  </h3>
                  <p className="mj-dots">
                    <span>{p.category}</span>
                    {p.techStack.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="experience" className="mj-section mj-wrap" aria-labelledby="exp-title">
          <h2 id="exp-title" className="mj-title" data-reveal>
            Experience
          </h2>
          <ul className="mj-cards">
            {timeline.map((job) => (
              <li key={job.id} className="mj-flip" data-reveal tabIndex={0}>
                <div className="mj-flip-inner">
                  <div className="mj-flip-face">
                    <p className="mj-card-text">{HEADLINES[job.id]}</p>
                    <div className="mj-author">
                      <CompanyIcon id={job.id} />
                      <div>
                        <p>{job.role}</p>
                        <p>
                          {job.company.replace(/ \(.*\)$/, "")} · {job.period.split(" – ")[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mj-flip-face mj-flip-back">
                    <p className="mj-card-when">{job.period}</p>
                    <p className="mj-card-company">{job.company.replace(/ \(.*\)$/, "")}</p>
                    <p className="mj-card-place">{job.location}</p>
                    <ul className="mj-chips">
                      {job.stack.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <a href={job.url} target="_blank" rel="noreferrer" className="mj-cta mj-cta-light">
                      Visit
                      <Arrow />
                    </a>
                  </div>
                </div>
              </li>
            ))}
            <li className="mj-card-plain" data-reveal>
              {profile.resumeLocked ? (
                <>
                  <p>My résumé is being updated. Ask, and I&apos;ll send you a copy.</p>
                  <a className="mj-cta" href="#contact">
                    Ask for my résumé
                    <Arrow />
                  </a>
                </>
              ) : (
                <>
                  <p>Every role, every number, on one page.</p>
                  <a className="mj-cta" href={profile.resume} target="_blank" rel="noreferrer">
                    Read the résumé
                    <Arrow />
                  </a>
                </>
              )}
            </li>
          </ul>
        </section>

        <section className="mj-section mj-wrap" aria-labelledby="also-title">
          <h2 id="also-title" className="mj-title" data-reveal>
            Also
          </h2>
          <ul className="mj-posts">
            <li className="mj-post mj-post-paper" data-reveal>
              <p className="mj-post-date">2026 · Research paper</p>
              <h3>{paper.title}</h3>
              <p>
                Why tool-using LLM agents fail on long tasks, and how
                checkpointed state management makes them reliable.
              </p>
            </li>
            <li className="mj-post mj-post-os" data-reveal>
              <a href="/" target="_top">
                <Image src="/og-image.png" alt="" fill sizes="(min-width: 810px) 400px, 90vw" />
                <span className="mj-post-shade" />
                <p className="mj-post-date">Interactive · Live</p>
                <h3>MuneebOS</h3>
                <p>This portfolio&apos;s other half: a whole desktop that runs in your browser.</p>
              </a>
            </li>
            <li className="mj-post mj-post-cta" data-reveal>
              <p>Prefer to explore? Open the operating system version of this site.</p>
              <a className="mj-cta mj-cta-light" href="/" target="_top">
                Open MuneebOS
                <Arrow />
              </a>
            </li>
          </ul>
        </section>

        <section id="contact" className="mj-section mj-wrap mj-contact" aria-labelledby="contact-title">
          <div>
            <h2 id="contact-title" className="mj-title" data-reveal>
              Let&apos;s talk.
            </h2>
            <p>Have a project or a question? Send a message and I&apos;ll get back to you soon.</p>
            <ul className="mj-socials">
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`}>Email</a>
              </li>
              {!profile.resumeLocked && (
                <li>
                  <a href={profile.resume} target="_blank" rel="noreferrer">Résumé</a>
                </li>
              )}
            </ul>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer className="mj-footer">
        <div className="mj-wrap mj-footer-cols">
          <p className="mj-footer-line">
            Building AI products
            <br />
            that ship.
          </p>
          <div>
            <h2>/Quick links</h2>
            <ul className="mj-chips mj-chips-light">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href="/" target="_top">MuneebOS</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>/Contact</h2>
            <a className="mj-footer-mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
        </div>
        <p className="mj-giant" aria-hidden="true">
          MUNEEB
        </p>
      </footer>
    </div>
  );
}
