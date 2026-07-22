"use client";

import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import { findAppByAlias, getLaunchableApps } from "@/lib/app-registry";

type TerminalLine = {
  id: string;
  kind: "input" | "output" | "error";
  text: string;
};

const initialLines: TerminalLine[] = [
  {
    id: "boot",
    kind: "output",
    text: "MuneebOS Terminal [Version 7.1.7601]",
  },
  {
    id: "hint",
    kind: "output",
    text: "Type 'help' to list portfolio commands.",
  },
];

export function TerminalWindow() {
  const { openWindow } = useWindowManager();
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const prompt = useMemo(() => "C:\\Users\\Muneeb>", []);

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

    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      addLines([{ kind: "output", text: `Opening ${app.title}...` }]);
      return;
    }

    openWindow({
      id: app.id,
      title: app.title,
      icon: typeof app.icon === "string" ? app.icon : app.icon.src,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: app.defaultPosition ?? { x: 140, y: 80 },
      size: app.defaultSize,
      metadata: app.metadata,
    });
    addLines([{ kind: "output", text: `Opening ${app.title}...` }]);
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
          text: "  about, projects, skills, contact, github, apps, taskmgr, date, echo, open, clear",
        },
        {
          kind: "output",
          text: "Try: open projects | open github | open mail | open recycle | open taskmgr",
        },
      ]);
      return;
    }

    if (normalizedName === "about") {
      addLines([
        {
          kind: "output",
          text: "Syed Abdul Muneeb - software developer focused on modern web apps, AI tooling, and polished product UI.",
        },
      ]);
      return;
    }

    if (normalizedName === "projects") {
      addLines([
        {
          kind: "output",
          text: "Featured: E-Commerce Platform, Task Management App, AI Chat Assistant, Portfolio OS.",
        },
        { kind: "output", text: "Run 'open projects' for the pro explorer." },
      ]);
      return;
    }

    if (normalizedName === "skills") {
      addLines([
        {
          kind: "output",
          text: "Next.js, React, TypeScript, Tailwind CSS, Supabase, Node.js, PostgreSQL, API design.",
        },
      ]);
      return;
    }

    if (normalizedName === "contact") {
      addLines([
        {
          kind: "output",
          text: "Run 'open mail' to compose a message and manage contacts.",
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
        }))
      );
      return;
    }

    if (normalizedName === "taskmgr") {
      openApp("taskmgr");
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
      openApp(args[0]?.toLowerCase() ?? "");
      return;
    }

    addLines([
      {
        kind: "error",
        text: `'${name}' is not recognized as an internal or external command.`,
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
    <div className="flex h-full flex-col bg-[#0c0c0c] font-mono text-[13px] text-[#d7f7d2]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1d1d1d] px-3 py-2 text-xs text-[#d6d6d6]">
        <span>Administrator: MuneebOS Command Prompt</span>
        <span className="text-[#8bcf84]">READY</span>
      </div>
      <div className="flex-1 overflow-auto px-3 py-3">
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "error"
                ? "text-[#ff8a8a]"
                : line.kind === "input"
                  ? "text-white"
                  : "text-[#d7f7d2]"
            }
          >
            {line.text}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-2">
          <span className="text-white">{prompt}</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-white outline-none"
            aria-label="Terminal command"
          />
        </form>
        <div ref={endRef} />
      </div>
      <div className="border-t border-white/10 bg-[#151515] px-3 py-1 text-[11px] text-[#8d8d8d]">
        Commands are local to this portfolio shell. Use Arrow Up and Arrow Down
        for history.
      </div>
    </div>
  );
}
