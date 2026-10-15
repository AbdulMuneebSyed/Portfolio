# AGENTS.md

Instructions for AI coding agents (Codex, Gemini CLI, GitHub Copilot,
Cursor, and others).

**Read [`CLAUDE.md`](./CLAUDE.md) before doing anything.** It is the single
source of truth for this repository: what the app is, how it's built, the
rules the code depends on, how to write code here, and how to commit. The
rules in it apply to every agent, not only Claude. If it disagrees with the
code, the code wins; fix `CLAUDE.md` in the same change.

If you can't follow links, the essentials:

- **App:** MuneebOS, a portfolio built as a macOS-style OS (iOS-style below
  700 px). Next.js 15 App Router, React 18, TypeScript strict, Tailwind 4,
  Zustand 5. No backend, no env vars.
- **Before calling a change done:** `npx tsc --noEmit` (run `npm run build`
  or `npm run dev` once first to generate `next-env.d.ts`),
  `node --test scripts/test-macos.cjs`, `npm run build`, and a browser check
  at desktop and phone size for anything visual. `next build` ignores type
  errors and `npm run lint` is currently broken, so neither proves anything.
- **Open apps only through `launchApp(id)`**; every app is registered in
  `lib/app-registry.ts`; every shortcut lives in `lib/shortcuts.ts`; all
  portfolio facts live in `lib/portfolio-data.ts`.
- **Never invent portfolio content** (metrics, links, employers, dates).
  The résumé is intentionally locked (`profile.resumeLocked`).
- **Process:** clarify → plan → test first for `lib/` logic → find root
  causes → verify with real output. The repo uses the
  [Superpowers](https://github.com/obra/superpowers) skills; install them
  for your agent if it supports them.
- **Git:** conventional commits with a scope; no AI co-author or
  "generated with" trailers.
