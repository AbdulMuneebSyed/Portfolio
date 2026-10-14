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
import { profile } from "@/lib/portfolio-data";
import {
  absolutePath,
  completePath,
  displayPath,
  entries,
  resolve,
  type FsDir,
  type FsNode,
} from "@/lib/terminal-fs";

// Coloured pieces of a line: folders bold blue, hidden files dimmed, like
// zsh with colours on.
type Tone = "dir" | "hidden" | "file" | "path" | "dim";
type Part = { text: string; tone?: Tone };

type TerminalLine = {
  id: string;
  kind: "input" | "output" | "error";
  text: string;
  parts?: Part[];
  // ls output: entries flow across the line and wrap.
  grid?: boolean;
};

const TONE_CLASS: Record<Tone, string> = {
  dir: "font-bold text-[#6cb6ff]",
  hidden: "text-[#8b8b90]",
  file: "text-[#e5e5e7]",
  path: "font-bold text-[#6cb6ff]",
  dim: "text-[#8b8b90]",
};

const COMMANDS = [
  "about", "apps", "cat", "cd", "clear", "contact", "date", "echo", "github", "help", "install",
  "ls", "open", "projects", "pwd", "skills", "store", "top", "tree", "uninstall", "whoami",
];

const isHidden = (name: string) => name.startsWith(".");
const entryPart = (name: string, node: FsNode): Part =>
  node.type === "dir"
    ? { text: `${name}/`, tone: "dir" }
    : { text: name, tone: isHidden(name) ? "hidden" : "file" };

// Hidden entries last, like the screenshot of a real shell with ls -a.
const sorted = (d: FsDir, all: boolean) => {
  const list = entries(d).filter((e) => all || !isHidden(e.name));
  return [...list.filter((e) => !isHidden(e.name)), ...list.filter((e) => isHidden(e.name))];
};

function treeLines(d: FsDir, prefix = ""): Part[][] {
  const list = sorted(d, false);
  return list.flatMap((e, i) => {
    const last = i === list.length - 1;
    const row: Part[] = [{ text: `${prefix}${last ? "└── " : "├── "}`, tone: "dim" }, entryPart(e.name, e.node)];
    return e.node.type === "dir"
      ? [row, ...treeLines(e.node, `${prefix}${last ? "    " : "│   "}`)]
      : [row];
  });
}

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
  const [cwd, setCwd] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const where = useMemo(() => displayPath(cwd), [cwd]);
  const promptParts = (at: string): Part[] => [
    { text: "muneeb@MuneebOS " },
    { text: at, tone: "path" },
    { text: " %" },
  ];

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
    addLines([
      {
        kind: "input",
        text: `muneeb@MuneebOS ${where} % ${command}`,
        parts: [...promptParts(where), { text: ` ${command}` }],
      },
    ]);

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
          text: "  ls [-a] [path], cd <dir>, cat <file>, tree, pwd, whoami   (look around)",
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
          text: "Syed Abdul Muneeb - full-stack engineer building AI-agent products. SDE at PulseGen, working on AI agents; previously MathonGO (GetMarks) and Capco-CS. Co-founder of AiResumate.",
        },
      ]);
      return;
    }

    if (normalizedName === "projects") {
      addLines([
        {
          kind: "output",
          text: "Featured: AiResumate, GetMarks (MathonGO), Hypogen, a research paper on checkpointed LLM agents, Paighaam, CopyOnScreenShot, One-Piss, Aletheia, LaunchPad, Capco-CS Vendor Portal, E-Cell Hackathon Platform.",
        },
        { kind: "output", text: "Run 'open projects' for details." },
      ]);
      return;
    }

    if (normalizedName === "skills") {
      addLines([
        {
          kind: "output",
          text: "TypeScript, Python, React, Next.js, Node.js, MongoDB, PostgreSQL, Redis, DuckDB, AWS, Docker, AI agents, MCP, LLM APIs.",
        },
      ]);
      return;
    }

    if (normalizedName === "contact") {
      addLines([
        {
          kind: "output",
          text: `Email ${profile.email}, or run 'open contact' to send a message.`,
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

    if (normalizedName === "ls" || normalizedName === "ll" || normalizedName === "la") {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const all = normalizedName !== "ls" || flags.includes("a");
      const long = normalizedName === "ll" || flags.includes("l");
      const targets = args.filter((a) => !a.startsWith("-"));
      const target = targets[0] ?? ".";
      const found = resolve(cwd, target);
      if (!found) {
        addLines([{ kind: "error", text: `ls: ${target}: No such file or directory` }]);
        return;
      }
      if (found.node.type === "file") {
        addLines([{ kind: "output", text: target, parts: [entryPart(target, found.node)] }]);
        return;
      }
      const list = sorted(found.node, all);
      if (!list.length) return;
      if (long) {
        addLines(
          list.map((e) => {
            const size = e.node.type === "dir" ? Object.keys(e.node.children).length * 64 + 64 : e.node.lines.join("\n").length;
            const mode = e.node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
            const meta = `${mode}  muneeb  staff  ${String(size).padStart(5)}  `;
            return { kind: "output" as const, text: meta + e.name, parts: [{ text: meta, tone: "dim" as const }, entryPart(e.name, e.node)] };
          }),
        );
        return;
      }
      addLines([{ kind: "output", text: list.map((e) => e.name).join("  "), parts: list.map((e) => entryPart(e.name, e.node)), grid: true }]);
      return;
    }

    if (normalizedName === "cd") {
      const target = args[0] ?? "~";
      const found = resolve(cwd, target === "-" ? "~" : target);
      if (!found) {
        addLines([{ kind: "error", text: `cd: no such file or directory: ${target}` }]);
        return;
      }
      if (found.node.type !== "dir") {
        addLines([{ kind: "error", text: `cd: not a directory: ${target}` }]);
        return;
      }
      setCwd(found.path);
      return;
    }

    if (normalizedName === "pwd") {
      addLines([{ kind: "output", text: absolutePath(cwd) }]);
      return;
    }

    if (normalizedName === "whoami") {
      addLines([{ kind: "output", text: "muneeb" }]);
      return;
    }

    if (normalizedName === "cat" || normalizedName === "less" || normalizedName === "more") {
      if (!args.length) {
        addLines([{ kind: "error", text: `usage: ${normalizedName} <file>` }]);
        return;
      }
      for (const target of args) {
        const found = resolve(cwd, target);
        if (!found) {
          addLines([{ kind: "error", text: `${normalizedName}: ${target}: No such file or directory` }]);
        } else if (found.node.type === "dir") {
          addLines([{ kind: "error", text: `${normalizedName}: ${target}: Is a directory` }]);
        } else {
          addLines(found.node.lines.map((text) => ({ kind: "output" as const, text: text || "\u00a0" })));
        }
      }
      return;
    }

    if (normalizedName === "tree") {
      const target = args[0] ?? ".";
      const found = resolve(cwd, target);
      if (!found || found.node.type !== "dir") {
        addLines([{ kind: "error", text: `tree: ${target}: not a directory` }]);
        return;
      }
      addLines([
        { kind: "output", text: target, parts: [{ text: target === "." ? "." : target, tone: "dir" }] },
        ...treeLines(found.node).map((parts) => ({ kind: "output" as const, text: parts.map((p) => p.text).join(""), parts })),
      ]);
      return;
    }

    if (normalizedName === "open") {
      const target = args.join(" ");
      // open . / open about.txt / open projects/: the app behind that place.
      const found = target.includes("/") || target.includes(".") || target === "~" ? resolve(cwd, target) : null;
      if (found) {
        if (found.node.app) {
          openApp(found.node.app);
        } else if (found.node.type === "dir") {
          openApp("finder");
        } else {
          addLines([{ kind: "output", text: `Run 'cat ${target}' to read it here.` }]);
        }
        return;
      }
      openApp(target.toLowerCase());
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
    if (event.key === "Tab") {
      event.preventDefault();
      const words = input.split(" ");
      const last = words[words.length - 1];
      if (words.length === 1) {
        const hits = COMMANDS.filter((c) => c.startsWith(last.toLowerCase()));
        if (hits.length === 1) setInput(`${hits[0]} `);
        else if (hits.length > 1)
          addLines([{ kind: "output", text: hits.join("  "), parts: hits.map((text) => ({ text })), grid: true }]);
        return;
      }
      const done = completePath(cwd, last, false);
      if (!done) return;
      words[words.length - 1] = done.value;
      const single = done.options.length === 1 && !done.value.endsWith("/");
      setInput(words.join(" ") + (single ? " " : ""));
      if (done.options.length > 1 && done.value === last) {
        addLines([
          {
            kind: "output",
            text: done.options.join("  "),
            parts: done.options.map((o) => (o.endsWith("/") ? { text: o, tone: "dir" as const } : { text: o, tone: isHidden(o) ? ("hidden" as const) : ("file" as const) })),
            grid: true,
          },
        ]);
      }
      return;
    }

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
            className={`whitespace-pre-wrap break-words ${
              line.kind === "error"
                ? "text-[#ff8a8a]"
                : line.kind === "input"
                  ? "text-white"
                  : "text-[#e5e5e7]"
            } ${line.grid ? "flex flex-wrap gap-x-5" : ""}`}
          >
            {line.parts
              ? line.parts.map((part, index) => (
                  <span key={index} className={part.tone ? TONE_CLASS[part.tone] : undefined}>
                    {part.text}
                  </span>
                ))
              : line.text}
          </div>
        ))}
        <form
          onSubmit={handleSubmit}
          className="mt-1 flex flex-wrap items-center gap-2"
        >
          <span className="text-white">
            {promptParts(where).map((part, index) => (
              <span key={index} className={part.tone ? TONE_CLASS[part.tone] : undefined}>
                {part.text}
              </span>
            ))}
          </span>
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
      {/* No keyboard shortcuts on a phone: the common commands are a tap. */}
      <div className="terminal-quick mobile-only" aria-label="Quick commands">
        {["help", "ls", "cat about.txt", "projects", "contact", "clear"].map((cmd) => (
          <button key={cmd} type="button" onClick={() => runCommand(cmd)}>
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
