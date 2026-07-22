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
};

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
    description: "Windows-inspired portfolio desktop with interactive apps.",
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
    "idle"
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
          `https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=8`
        ),
      ]);

      if (!eventsResponse.ok || !reposResponse.ok) {
        throw new Error("GitHub request failed.");
      }

      const nextEvents = (await eventsResponse.json()) as GitHubEvent[];
      const nextRepos = (await reposResponse.json()) as GitHubRepo[];

      setEvents(nextEvents.length ? nextEvents.slice(0, 12) : fallbackEvents);
      setRepos(nextRepos.length ? nextRepos : fallbackRepos);
      setUsername(cleanUsername);
      setStatus("ready");
      setMessage(
        nextEvents.length || nextRepos.length
          ? `Loaded public activity for ${cleanUsername}.`
          : "No recent public activity found, showing fallback data."
      );
    } catch {
      setEvents(fallbackEvents);
      setRepos(fallbackRepos);
      setStatus("error");
      setMessage("GitHub could not be reached. Showing portfolio fallback data.");
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
    <div className="flex h-full flex-col bg-[#f2f5f8] text-slate-900">
      <div className="border-b border-slate-300 bg-gradient-to-b from-white to-[#e0e9f4] px-3 py-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void loadGitHub(query);
          }}
        >
          <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-2 py-1 text-sm">
            <Github className="size-4 text-slate-700" />
            <span>https://github.com/</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-48 bg-transparent font-medium outline-none"
              aria-label="GitHub username"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded border border-sky-400 bg-[#e4f3ff] px-3 py-1 text-sm font-medium hover:bg-[#d3ebff]"
          >
            {status === "loading" ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Load
          </button>
        </form>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[250px_minmax(300px,1fr)]">
        <aside className="border-r border-slate-300 bg-[#eaf2fb] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded border border-slate-300 bg-white">
              <Github className="size-7 text-slate-800" />
            </div>
            <div>
              <div className="font-semibold">{username}</div>
              <div className="text-xs text-slate-500">Public activity</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-slate-300 bg-white p-3">
              <div className="text-2xl font-semibold">{totals.repos}</div>
              <div className="text-xs text-slate-500">Repos</div>
            </div>
            <div className="rounded border border-slate-300 bg-white p-3">
              <div className="text-2xl font-semibold">{totals.pushes}</div>
              <div className="text-xs text-slate-500">Pushes</div>
            </div>
            <div className="rounded border border-slate-300 bg-white p-3">
              <div className="flex items-center gap-1 text-2xl font-semibold">
                {totals.stars}
                <Star className="size-4 text-amber-500" />
              </div>
              <div className="text-xs text-slate-500">Stars</div>
            </div>
            <div className="rounded border border-slate-300 bg-white p-3">
              <div className="flex items-center gap-1 text-2xl font-semibold">
                {totals.forks}
                <GitFork className="size-4 text-sky-700" />
              </div>
              <div className="text-xs text-slate-500">Forks</div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded border border-slate-300 bg-white p-3 text-xs text-slate-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-sky-700" />
            <span>{message}</span>
          </div>
        </aside>

        <main className="grid min-h-0 grid-rows-[1fr_210px]">
          <section className="min-h-0 overflow-auto bg-white">
            <div className="sticky top-0 border-b border-slate-300 bg-[#edf5fc] px-3 py-2 text-xs font-semibold uppercase text-slate-500">
              Recent Activity
            </div>
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 border-b border-slate-200 px-4 py-3"
              >
                <div className="mt-0.5 flex size-8 items-center justify-center rounded border border-slate-300 bg-[#f6fbff]">
                  <GitCommit className="size-4 text-sky-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{eventLabel(event.type)}</div>
                  <div className="truncate text-sm text-slate-600">
                    {event.repo.name}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(event.created_at)}
                </div>
              </div>
            ))}
          </section>

          <section className="border-t border-slate-300 bg-[#f8fbff]">
            <div className="border-b border-slate-300 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
              Updated Repositories
            </div>
            <div className="grid h-[170px] grid-cols-2 gap-2 overflow-auto p-3">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-slate-300 bg-white p-3 hover:border-sky-400 hover:bg-sky-50"
                >
                  <div className="truncate font-semibold">{repo.name}</div>
                  <div className="line-clamp-2 text-xs leading-5 text-slate-600">
                    {repo.description ?? "No repository description available."}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{repo.language ?? "Code"}</span>
                    <span>{formatDate(repo.updated_at)}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
