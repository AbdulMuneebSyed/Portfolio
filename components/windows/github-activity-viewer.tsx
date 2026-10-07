"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  GitCommit,
  GitFork,
  Github,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

type GitHubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork?: boolean;
};

// Events that show actual coding work; housekeeping like Delete, Member,
// and Watch is noise for a visitor.
const MEANINGFUL_EVENT_TYPES = new Set([
  "PushEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
  "CreateEvent",
  "ReleaseEvent",
  "IssuesEvent",
]);

const fallbackEvents: GitHubEvent[] = [
  {
    id: "fallback-1",
    type: "PushEvent",
    repo: { name: "AbdulMuneebSyed/Portfolio" },
    created_at: "2026-07-09T10:00:00Z",
  },
  {
    id: "fallback-2",
    type: "CreateEvent",
    repo: { name: "AbdulMuneebSyed/ai-chat-interface" },
    created_at: "2026-07-01T12:30:00Z",
  },
  {
    id: "fallback-3",
    type: "WatchEvent",
    repo: { name: "AbdulMuneebSyed/task-management-interface" },
    created_at: "2026-06-24T08:15:00Z",
  },
];

const fallbackRepos: GitHubRepo[] = [
  {
    id: 1,
    name: "Portfolio",
    html_url: "https://github.com/AbdulMuneebSyed/Portfolio",
    description: "macOS-style portfolio desktop with interactive apps.",
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: "2026-07-09T10:00:00Z",
  },
  {
    id: 2,
    name: "task-management-interface",
    html_url: "https://github.com/AbdulMuneebSyed",
    description: "Productivity dashboard and collaboration workflow.",
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: "2026-06-24T08:15:00Z",
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function eventLabel(type: string) {
  return type.replace("Event", "").replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function GitHubActivityViewer() {
  const [username, setUsername] = useState("AbdulMuneebSyed");
  const [query, setQuery] = useState("AbdulMuneebSyed");
  const [events, setEvents] = useState<GitHubEvent[]>(fallbackEvents);
  const [repos, setRepos] = useState<GitHubRepo[]>(fallbackRepos);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("Showing fallback activity.");

  const loadGitHub = useCallback(async (nextUsername: string) => {
    const cleanUsername = nextUsername.trim();
    if (!cleanUsername) return;

    setStatus("loading");
    setMessage("Fetching public GitHub activity...");

    try {
      const [eventsResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${cleanUsername}/events/public`),
        fetch(
          `https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=20`,
        ),
      ]);

      if (!eventsResponse.ok || !reposResponse.ok) {
        throw new Error("GitHub request failed.");
      }

      const nextEvents = (await eventsResponse.json()) as GitHubEvent[];
      const nextRepos = (await reposResponse.json()) as GitHubRepo[];

      const codingEvents = nextEvents.filter((event) =>
        MEANINGFUL_EVENT_TYPES.has(event.type),
      );
      const ownRepos = nextRepos.filter((repo) => !repo.fork).slice(0, 8);

      setEvents(
        codingEvents.length ? codingEvents.slice(0, 12) : fallbackEvents,
      );
      setRepos(ownRepos.length ? ownRepos : fallbackRepos);
      setUsername(cleanUsername);
      setStatus("ready");
      setMessage(
        nextEvents.length || nextRepos.length
          ? `Loaded public activity for ${cleanUsername}.`
          : "No recent public activity found, showing fallback data.",
      );
    } catch {
      setEvents(fallbackEvents);
      setRepos(fallbackRepos);
      setStatus("error");
      setMessage(
        "GitHub could not be reached. Showing portfolio fallback data.",
      );
    }
  }, []);

  useEffect(() => {
    void loadGitHub("AbdulMuneebSyed");
  }, [loadGitHub]);

  const totals = useMemo(() => {
    return {
      repos: repos.length,
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      pushes: events.filter((event) => event.type === "PushEvent").length,
    };
  }, [events, repos]);

  return (
    <div className="mac-split">
      <aside className="mac-sidebar github-sidebar">
        <Github size={32} className="mb-4" />
        <strong className="block break-all text-sm">{username}</strong>
        <p className="mac-muted text-xs mt-1">Public activity</p>
        <div className="github-counts">
          {[
            [totals.repos, "Repositories"],
            [totals.stars, "Stars"],
            [totals.forks, "Forks"],
          ].map(([value, label]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed mac-muted" role="status">
          {message}
        </p>
      </aside>
      <div className="finder-main">
        <div className="mac-toolbar">
          <h2>GitHub</h2>
          <form
            className="flex min-w-0 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void loadGitHub(query);
            }}
          >
            <label className="mac-search">
              <Search size={14} />
              <input
                aria-label="GitHub username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              className="mac-icon-button"
              type="submit"
              aria-label="Refresh GitHub"
              disabled={status === "loading"}
            >
              <RefreshCw
                size={16}
                className={status === "loading" ? "animate-spin" : ""}
              />
            </button>
          </form>
        </div>
        <main className="github-main">
          {/* iPhone: the sidebar's profile and counts become a header. */}
          <section className="github-phone-header mobile-only">
            <img src={`https://github.com/${username}.png?size=160`} alt="" />
            <div>
              <strong>{username}</strong>
              <span>Public activity on GitHub</span>
            </div>
            <dl>
              {[
                [totals.repos, "Repos"],
                [totals.stars, "Stars"],
                [totals.pushes, "Pushes"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dd>{value}</dd>
                  <dt>{label}</dt>
                </div>
              ))}
            </dl>
          </section>
          <h2>Recent Activity</h2>
          {!events.length && (
            <p className="mac-muted text-xs py-5">No recent public activity.</p>
          )}
          <div className="github-group">
          {events.map((event) => (
            <div className="github-event" key={event.id}>
              <GitCommit size={17} />
              <div>
                <strong>{eventLabel(event.type)}</strong>
                <p>{event.repo.name}</p>
              </div>
              <time>{formatDate(event.created_at)}</time>
            </div>
          ))}
          </div>
          <h2 className="mt-8">Repositories</h2>
          <div className="github-group">
          {repos.map((repo) => (
            <a
              className="github-repo"
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>{repo.name} ↗</strong>
              <p>{repo.description ?? "No description available."}</p>
              <span>
                {repo.language ?? "Code"} · Updated{" "}
                {formatDate(repo.updated_at)}
              </span>
            </a>
          ))}
          </div>
        </main>
      </div>
    </div>
  );
}
