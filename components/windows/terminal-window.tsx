"use client";

import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { launchApp } from "@/lib/launch-app";
import {
  APP_REGISTRY,
  findAppByAlias,
  getLaunchableApps,
  isAppInstalled,
} from "@/lib/app-registry";
import { installApp, uninstallApp } from "@/lib/app-store/actions";

type TerminalLine = {
  id: string;
  kind: "input" | "output" | "error";
  text: string;
};

const initialLines: TerminalLine[] = [
  {
    id: "boot",
    kind: "output",
    text: "Last login: just now on ttys000",
  },
  {
    id: "hint",
    kind: "output",
    text: "Type 'help' to list portfolio commands.",
  },
];

export function TerminalWindow() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompt = useMemo(() => "muneeb@MuneebOS ~ %", []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const addLines = (nextLines: Omit<TerminalLine, "id">[]) => {
    setLines((current) => [
      ...current,
      ...nextLines.map((line, index) => ({
        ...line,
        id: `${Date.now()}-${index}-${line.text}`,
      })),
    ]);
  };

  const openApp = (key: string) => {
    const app = findAppByAlias(key);
    if (!app) {
      addLines([{ kind: "error", text: `Unknown app '${key}'.` }]);
      return;
    }

    if (!isAppInstalled(app.id)) {
      addLines([
        {
          kind: "error",
          text: `${app.title} isn't installed. Run 'install ${key}' or get it in the App Store.`,
        },
      ]);
      return;
    }

    launchApp(app.id);
    addLines([{ kind: "output", text: `Opening ${app.title}...` }]);
  };

  // install / uninstall: App Store apps from the command line.
  const changeInstall = (key: string, install: boolean) => {
    const app = findAppByAlias(key);
    if (!app) {
      addLines([{ kind: "error", text: `No app named '${key}'. Run 'store' to list them.` }]);
      return;
    }
    if (!app.installable) {
      addLines([{ kind: "error", text: `${app.title} is part of MuneebOS and can't be ${install ? "installed" : "removed"}.` }]);
      return;
    }
    if (isAppInstalled(app.id) === install) {
      addLines([{ kind: "output", text: `${app.title} is already ${install ? "installed" : "uninstalled"}.` }]);
      return;
    }
    if (install) {
      addLines([{ kind: "output", text: `==> Downloading ${app.title}...` }]);
      void installApp(app.id).then(() =>
        addLines([{ kind: "output", text: `==> ${app.title} installed. Run 'open ${key}'.` }]),
      );
    } else {
      uninstallApp(app.id);
      addLines([{ kind: "output", text: `Removed ${app.title}.` }]);
    }
  };

  const runCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;

    setHistory((current) => [...current, command]);
    setHistoryIndex(null);
    addLines([{ kind: "input", text: `${prompt} ${command}` }]);

    const [name = "", ...args] = command.split(" ");
    const normalizedName = name.toLowerCase();

    if (normalizedName === "clear" || normalizedName === "cls") {
      setLines([]);
      return;
    }

    if (normalizedName === "help") {
      addLines([
        { kind: "output", text: "Available commands:" },
        {
          kind: "output",
          text: "  about, projects, skills, contact, github, apps, top, date, echo, open, clear",
        },
        {
          kind: "output",
          text: "  store, install <app>, uninstall <app>   (App Store apps)",
        },
        {
          kind: "output",
          text: "Try: open about | open projects | open contact | open github | open resume",
        },
      ]);
      return;
    }

    if (normalizedName === "about") {
      addLines([
        {
          kind: "output",
          text: "Syed Abdul Muneeb - full-stack SDE. SDE Intern at Pulsegen; previously MathonGO (GetMarks) and Capco-CS. Co-founder of AiResumate.",
        },
      ]);
      return;
    }

    if (normalizedName === "projects") {
      addLines([
        {
          kind: "output",
          text: "Featured: AiResumate, GetMarks (MathonGO), LaunchPad, Capco-CS Vendor Portal, E-Cell Hackathon Platform.",
        },
        { kind: "output", text: "Run 'open projects' for details." },
      ]);
      return;
    }

    if (normalizedName === "skills") {
      addLines([
        {
          kind: "output",
          text: "TypeScript, React, Next.js, Node.js, ASP.NET Core, MongoDB, PostgreSQL, Redis, AWS, Docker, GenAI.",
        },
      ]);
      return;
    }

    if (normalizedName === "contact") {
      addLines([
        {
          kind: "output",
          text: "Email samuneeb786@gmail.com, or run 'open contact' to send a message.",
        },
      ]);
      return;
    }

    if (normalizedName === "github") {
      addLines([
        {
          kind: "output",
          text: "Default GitHub profile: AbdulMuneebSyed. Run 'open github' to view activity.",
        },
      ]);
      return;
    }

    if (normalizedName === "apps") {
      addLines(
        getLaunchableApps().map((app) => ({
          kind: "output",
          text: `${app.id.padEnd(18)} ${app.title} - ${app.category}`,
        })),
      );
      return;
    }

    if (normalizedName === "top" || normalizedName === "taskmgr") {
      openApp("task-manager");
      return;
    }

    if (normalizedName === "date") {
      addLines([{ kind: "output", text: new Date().toString() }]);
      return;
    }

    if (normalizedName === "echo") {
      addLines([{ kind: "output", text: args.join(" ") }]);
      return;
    }

    if (normalizedName === "open") {
      openApp(args.join(" ").toLowerCase());
      return;
    }

    // "brew install x" works too.
    const [verb, rest] =
      normalizedName === "brew" ? [args[0]?.toLowerCase(), args.slice(1)] : [normalizedName, args];
    if (verb === "install" || verb === "uninstall") {
      const key = rest.join(" ").toLowerCase();
      if (!key) {
        addLines([{ kind: "error", text: `usage: ${verb} <app>` }]);
        return;
      }
      changeInstall(key, verb === "install");
      return;
    }

    if (normalizedName === "store" || normalizedName === "appstore") {
      addLines([
        { kind: "output", text: "App Store apps (install <name> / uninstall <name>):" },
        ...APP_REGISTRY.filter((app) => app.installable).map((app) => ({
          kind: "output" as const,
          text: `  ${(app.launchAliases?.[0] ?? app.id).padEnd(16)} ${isAppInstalled(app.id) ? "✓ installed" : "  –"}  ${app.title}`,
        })),
      ]);
      launchApp("app-store");
      return;
    }

    addLines([
      {
        kind: "error",
        text: `zsh: command not found: ${name}`,
      },
    ]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runCommand(input);
    setInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHistoryIndex((current) => {
        const nextIndex =
          current === null ? history.length - 1 : Math.max(0, current - 1);
        setInput(history[nextIndex] ?? input);
        return nextIndex;
      });
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHistoryIndex((current) => {
        if (current === null) return null;
        const nextIndex = current + 1;
        if (nextIndex >= history.length) {
          setInput("");
          return null;
        }
        setInput(history[nextIndex] ?? "");
        return nextIndex;
      });
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] font-mono text-[13px] text-[#e5e5e7]">
      <div
        className="flex-1 overflow-auto px-3 py-3"
        onClick={() => {
          // Like Terminal: clicking the window returns to the prompt, unless
          // the visitor is selecting text to copy.
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "error"
                ? "text-[#ff8a8a]"
                : line.kind === "input"
                  ? "text-white"
                  : "text-[#e5e5e7]"
            }
          >
            {line.text}
          </div>
        ))}
        <form
          onSubmit={handleSubmit}
          className="mt-1 flex flex-wrap items-center gap-2"
        >
          <span className="text-white">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            className="terminal-input min-w-0 flex-1 bg-transparent text-white outline-none"
            aria-label="Terminal command"
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
}
