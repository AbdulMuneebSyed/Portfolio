// A small read-only file system for the Terminal: `ls`, `cd`, `cat`, `tree`.
// Every file is written from lib/portfolio-data.ts, so the Terminal never
// says anything the rest of the site doesn't.

import {
  awards,
  education,
  instagram,
  profile,
  projects,
  skillGroups,
  timeline,
} from "@/lib/portfolio-data";

export type FsFile = {
  type: "file";
  lines: string[];
  // The app `open <file>` launches (an app alias), when there is one.
  app?: string;
};
export type FsDir = { type: "dir"; children: Record<string, FsNode>; app?: string };
export type FsNode = FsFile | FsDir;

const file = (lines: string[], app?: string): FsFile => ({ type: "file", lines, app });
const dir = (children: Record<string, FsNode>, app?: string): FsDir => ({ type: "dir", children, app });

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const projectFiles = Object.fromEntries(
  projects.map((p) => [
    `${p.id}.md`,
    file(
      [
        `# ${p.title}`,
        `${p.category}`,
        "",
        p.description,
        ...(p.highlights?.length ? ["", ...p.highlights.map((h) => `- ${h}`)] : []),
        "",
        `Stack: ${p.techStack.join(", ")}`,
        ...(p.demoLink ? [`Link:  ${p.demoLink}`] : []),
        "",
        "Run 'open projects' to see it in the Projects app.",
      ],
      "projects",
    ),
  ]),
);

const experienceFiles = Object.fromEntries(
  timeline.map((job) => [
    `${job.id}.md`,
    file(
      [
        `# ${job.role} · ${job.company}`,
        `${job.period} · ${job.location}`,
        "",
        ...job.points.map((p) => `- ${p}`),
        "",
        `Stack: ${job.stack.join(", ")}`,
        `Link:  ${job.url}`,
      ],
      "about",
    ),
  ]),
);

export const HOME: FsDir = dir({
  "about.txt": file(
    [
      `${profile.name}`,
      `${profile.role} · ${profile.location}`,
      "",
      "Full-stack engineer building AI-agent products.",
      `Previously ${timeline
        .slice(1)
        .map((j) => j.company)
        .join(", ")}.`,
      "",
      "This whole desktop is my portfolio. Look around: ls, cd, cat.",
    ],
    "about",
  ),
  "projects/": dir(projectFiles, "projects"),
  "experience/": dir(experienceFiles, "about"),
  "education/": dir({
    [`${slug(education.degree)}.txt`]: file([education.degree, education.school, education.period]),
  }),
  "skills.txt": file(skillGroups.map((g) => `${(g.label + ":").padEnd(14)} ${g.items.join(", ")}`)),
  "awards.txt": file(awards.map((a) => `- ${a}`)),
  "contact.txt": file(
    [
      `Email:    ${profile.email}`,
      `LinkedIn: ${profile.linkedin}`,
      `GitHub:   ${profile.github}`,
      `Instagram: ${profile.instagram}`,
      "",
      "Run 'open contact' to send me a message.",
    ],
    "contact",
  ),
  "instagram.txt": file(
    [
      `${instagram.name} (${instagram.handle})`,
      instagram.blurb,
      "",
      profile.instagram,
      "",
      "Run 'open instagram' to watch.",
    ],
    "instagram",
  ),
  ".bashrc": file([
    "# ~/.bashrc",
    "export EDITOR=vim        # still learning how to quit",
    'alias hire="open contact"',
    'alias play="open 2048"',
    'alias coffee="echo brewing..."',
    "",
    "# Most portfolios, you scroll. This one, you ls.",
  ]),
  ".secret": file([
    "You found the secret file. Not many people type ls -a.",
    "",
    "Here's the reward: the App Store has games I built.",
    "Try 'install 2048', then 'open 2048'.",
    "",
    "And if you're hiring: 'open contact'. I read every message.",
  ]),
});

// Directory names are stored with a trailing slash; strip it for paths.
const childName = (key: string) => key.replace(/\/$/, "");

export const entries = (d: FsDir) =>
  Object.entries(d.children).map(([key, node]) => ({ name: childName(key), node }));

const child = (d: FsDir, name: string): FsNode | undefined =>
  d.children[name] ?? d.children[`${name}/`];

// Resolve a path against the working directory (segments under ~).
// Returns the normalized segments and the node, or null when nothing is there.
export function resolve(cwd: string[], raw: string): { path: string[]; node: FsNode } | null {
  let path = [...cwd];
  let rest = raw.trim();
  if (rest === "" || rest === "~") return { path: [], node: HOME };
  if (rest.startsWith("~/")) {
    path = [];
    rest = rest.slice(2);
  } else if (rest === "/" || rest.startsWith("/Users/muneeb")) {
    // The only real directory is home, so absolute paths start there.
    path = [];
    rest = rest.replace(/^\/Users\/muneeb\/?/, "").replace(/^\/$/, "");
  }
  for (const part of rest.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      path.pop();
      continue;
    }
    path.push(part);
  }
  let node: FsNode = HOME;
  for (const part of path) {
    if (node.type !== "dir") return null;
    const next = child(node, part);
    if (!next) return null;
    node = next;
  }
  return { path, node };
}

export const displayPath = (path: string[]) => (path.length ? `~/${path.join("/")}` : "~");
export const absolutePath = (path: string[]) => ["/Users/muneeb", ...path].join("/");

// Tab completion for the path being typed: the common prefix of the matching
// entries (directories get their slash), or nothing when there's no match.
export function completePath(cwd: string[], partial: string, showHidden: boolean): { value: string; options: string[] } | null {
  const slash = partial.lastIndexOf("/");
  const base = slash >= 0 ? partial.slice(0, slash + 1) : "";
  const stem = slash >= 0 ? partial.slice(slash + 1) : partial;
  const parent = resolve(cwd, base || ".");
  if (!parent || parent.node.type !== "dir") return null;
  const matches = entries(parent.node)
    .filter((e) => e.name.startsWith(stem) && (showHidden || stem.startsWith(".") || !e.name.startsWith(".")))
    .map((e) => e.name + (e.node.type === "dir" ? "/" : ""));
  if (!matches.length) return null;
  let common = matches[0];
  for (const m of matches) {
    let i = 0;
    while (i < common.length && common[i] === m[i]) i++;
    common = common.slice(0, i);
  }
  return { value: base + common, options: matches };
}
