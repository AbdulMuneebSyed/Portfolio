import {
  awards,
  education,
  profile,
  projects,
  skillGroups,
  timeline,
} from "@/lib/portfolio-data";

// Muneeb's profile as plain, server-rendered HTML. On `/` it is visually
// hidden behind the OS (for crawlers, screen readers and no-JS visitors);
// at `/profile` it is the page.
export function Profile({ hidden = false }: { hidden?: boolean }) {
  return (
    <main className={hidden ? "sr-only" : "profile-page"} id="profile">
      <header>
        <h1>{profile.name}</h1>
        <p>
          Software engineer · {profile.role} · {profile.location}.{" "}
          {profile.status}.
        </p>
        <p>
          Full-stack engineer who builds AI-agent products. Built
          streaming LLM chat, MCP and REST integrations, and multi-tenant search
          at PulseGen, and scaled a learning platform serving 30K+ daily users
          at MathonGO.
        </p>
        <ul className="profile-links">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.resume}>Resume (PDF)</a>
          </li>
          <li>
            <a href={profile.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={profile.github}>GitHub</a>
          </li>
        </ul>
      </header>

      <section>
        <h2>Experience</h2>
        {timeline.map((job) => (
          <article key={job.id}>
            <h3>{job.title}</h3>
            <p>
              {job.period} · {job.location}
            </p>
            <ul>
              {job.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((project) => (
          <article key={project.id}>
            <h3>
              {project.demoLink ? (
                <a href={project.demoLink}>{project.title}</a>
              ) : (
                project.title
              )}
            </h3>
            <p>{project.description}</p>
            <p>{project.techStack.join(", ")}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {skillGroups.map((group) => (
          <p key={group.label}>
            <strong>{group.label}:</strong> {group.items.join(", ")}
          </p>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        <p>
          {education.degree}, {education.school} · {education.period}
        </p>
      </section>

      <section>
        <h2>Awards</h2>
        <ul>
          {awards.map((award) => (
            <li key={award}>{award}</li>
          ))}
        </ul>
      </section>

      {hidden ? (
        <p>
          <a href="/profile">Read this profile as a plain page</a>
        </p>
      ) : (
        <p>
          <a href="/">Open Muneeb OS, the interactive version</a>
        </p>
      )}
    </main>
  );
}
