# CLAUDE.md

Instructions for AI coding agents (Claude Code, and anyone reading
`AGENTS.md`) working in this repository. This file is the source of truth
for how the app works and how to change it. If anything here disagrees with
the code, the code wins: fix this file in the same change.

Last verified against the code: 2026-10-15.

---

## 1. What this is

**MuneebOS** is Syed Abdul Muneeb's portfolio, built as a fake operating
system in the browser. Live at <https://www.syedabdulmuneeb.dev> (Vercel).

- **Desktop and tablet** (≥ 700 px wide): a macOS-style shell. Lock screen,
  menu bar, Dock, Spotlight, Control Center, Notification Center, draggable
  windows, Mission Control, Spaces, tiling, an App Store.
- **Phone** (< 700 px, or a short landscape screen): an iOS-style Home
  Screen with folders, Search, Control Center, App Switcher and gestures.
  Same apps, presented full screen.
- **`/profile`**: the same portfolio as an ordinary website (the About Me
  app embeds it). `/` also server-renders a hidden text profile for
  crawlers, screen readers and no-JS visitors.

Its job is to get a recruiter to *who Muneeb is and how to reach him* fast,
then reward exploring. Fidelity to macOS/iOS matters, but a portfolio fact
a visitor can't find is a bigger bug than a pixel off.

There is **no backend, no database, no environment variables**. Forms open
the visitor's mail app (`lib/compose-mail.ts`). GitHub data is fetched
client-side from the public GitHub API. Everything a visitor changes lives
in `localStorage`.

## 2. How to work here (skills and process)

Use the **[Superpowers](https://github.com/obra/superpowers)** skills. If
they aren't installed, ask the user to install them:

```
/plugin install superpowers@claude-plugins-official
# or
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Check for a relevant skill **before** starting a task, and follow it.
Which skill fits which job here:

| Situation | Skill |
|---|---|
| A new feature, app, or behaviour change; anything vague | `brainstorming` first. Agree what the visitor sees before code. |
| Agreed work that touches more than a couple of files | `writing-plans`, then `executing-plans` or `subagent-driven-development` |
| Pure logic in `lib/` (stores, layout maths, game rules, parsers) | `test-driven-development`: add the test to `scripts/test-macos.cjs` first |
| Any bug, flaky behaviour, or "it doesn't work on my phone" | `systematic-debugging`: find the root cause before changing code |
| Before saying anything is done, fixed or passing | `verification-before-completion`: run the checks in §3 and show output |
| Finishing a branch / before a PR | `requesting-code-review`, then `finishing-a-development-branch` |
| Acting on review comments | `receiving-code-review`: verify each claim, don't just comply |
| Independent tasks that can run at once | `dispatching-parallel-agents` |

Without the plugin, follow the same discipline by hand: clarify, plan,
test first where logic is testable, find root causes, and verify with real
command output before claiming success.

Specs and plans go in `docs/superpowers/specs/YYYY-MM-DD-<topic>.md` and
`docs/superpowers/plans/YYYY-MM-DD-<topic>.md` (the Superpowers defaults).
Once the work ships, delete them; git history keeps them. Open work lives
in `TODO.md`; keep it current and short.

Other habits that matter in this repo:

- **Look in the browser.** Most bugs here are visual or gestural. For UI
  changes, check at desktop size (1440×900) *and* phone size (393×852), in
  light *and* dark mode. Playwright with Chromium is available in cloud
  sessions (`executablePath: '/opt/pw-browsers/chromium'` if needed).
- **Ask before deciding for the owner.** Portfolio copy, what's shown to
  recruiters, the résumé lock, and anything in "Needs the owner" in
  `TODO.md` are Muneeb's calls.
- **Keep diffs small and on-task.** No drive-by refactors, renames or
  reformatting of code you weren't asked to touch.

## 3. Commands (all verified)

Node 18.18+ (tested on 22). npm, with `package-lock.json` committed.

```bash
npm ci                              # install
npm run dev                         # http://localhost:3000
npm run build                       # production build (also generates next-env.d.ts)
npx tsc --noEmit                    # typecheck — needs next-env.d.ts, so run dev or build once first
node --test scripts/test-macos.cjs  # unit tests (36, all pure lib/ logic, no browser)
git diff --check                    # whitespace
```

The checks to run before calling any change done: **`npx tsc --noEmit`,
`node --test scripts/test-macos.cjs`, `npm run build`**, and a browser look
for anything visual.

Gotchas:

- **`next build` ignores type and lint errors** (`next.config.mjs` sets
  `ignoreBuildErrors` and `ignoreDuringBuilds`). A green build proves
  nothing about types: always run `npx tsc --noEmit` yourself.
- **`npm run lint` is broken**: `next lint` with ESLint 9 and the legacy
  `.eslintrc.json` crashes ("Converting circular structure to JSON").
  Don't claim lint passed. Fixing it means moving to `eslint.config.mjs`
  (flat config) — a separate task.
- **Don't run `npm run build` while `npm run dev` is running**: both write
  `.next/`, and the dev server then serves 404 CSS. Stop dev first.
- `tailwind.config.js` is empty on purpose. Tailwind 4 is configured in CSS
  (`@import "tailwindcss"` at the top of `app/globals.css`).
- Tests load the TypeScript sources directly through the `typescript`
  package (see the loader at the top of `scripts/test-macos.cjs`); only
  `@/` and relative `.ts` imports resolve. Keep testable logic in `.ts`
  files free of React and DOM access at import time.

## 4. Stack

Next.js 15 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS 4 ·
Zustand 5 · Framer Motion 12 · lucide-react · shepherd.js (desktop tour) ·
Vercel Analytics. Path alias `@/*` → repo root.

## 5. Architecture map

```
app/
  layout.tsx            Metadata (metadataBase = syedabdulmuneeb.dev), JSON-LD Person, Analytics
  page.tsx              Skip link → <Profile/> (server text) + <Shell/> (client OS)
  profile/              /profile: the portfolio as a website (site.css, `mj-` classes)
  opengraph-image.tsx   Share card (also twitter-image.tsx); fonts in app/_og/
  globals.css           ~4.6k lines: shell, windows, apps, and the phone section at the end
  app-store.css         App Store styles
  robots.ts sitemap.ts manifest.ts
components/
  shell.tsx             Lock screen ↔ Desktop; Desktop is lazy-loaded while the lock screen shows
  desktop.tsx           Composes the OS; `windowComponents` maps registry `component` → React component
  window.tsx            Window chrome, drag/resize/tiling, minimize-to-Dock, phone full-screen presentation
  mobile-home.tsx       iPhone Home Screen
  profile.tsx           Server-rendered text profile (the page's <main>)
  mac/                  Menu bar, Dock, Spotlight, lock/boot screens, Control/Notification Center,
                        Mission Control strip (spaces-bar), App Switcher, tours
  windows/              One file per app; app-store/ (the store); mini/ (12 installable mini-apps)
  site/                 Pieces of the /profile website
lib/
  app-registry.ts       APP_REGISTRY: every app (id, title, icon, component, size, aliases, installable)
  launch-app.ts         launchApp(id) / openInAppStore(id)
  window-manager.ts     Zustand store: windows, Spaces, desktop icons, trash; persisted
  system-controls.ts    Zustand store: appearance, sound, Wi-Fi, brightness…; persisted
  shortcuts.ts          SHORTCUTS: every keyboard shortcut, once
  phone.ts              PHONE_QUERY, usePhone(), useViewport(), PHONE_APPS (phone titles/icons/chrome)
  portfolio-data.ts     profile, projects, timeline, skills, education, awards — all portfolio content
  app-store/            catalog (items), editorial (tab layouts), installed (store), actions, version
  games/                Pure rules for the mini-apps (tested)
  storage.ts            Safe localStorage helpers
  terminal-fs.ts        The virtual file tree Terminal's ls/cd/cat/tree browse
  notification*.ts      Banners, the timed notification feed and its scheduler
  mission-control.ts trackpad-swipe.ts desktop-grid.ts desktop-selection.ts …
scripts/test-macos.cjs  The test suite (node:test)
public/                 Icons (icons/mac, icons/ios, icons/settings), wallpapers, audio, app-store shots
```

## 6. Rules the code depends on (don't break these)

**Apps and launching**
- `launchApp(id)` in `lib/launch-app.ts` is **the** way to open an app.
  Dock, desktop files, Spotlight, menus, Terminal and the App Store all go
  through it. It handles uninstalled apps (→ App Store page), external
  URLs, sizing and cascading. Don't call `openWindow` directly unless an
  app needs a file-specific preview (e.g. `PhotoPreview`).
- Adding an app: component in `components/windows/` → lazy import and an
  entry in `windowComponents` in `components/desktop.tsx` → entry in
  `APP_REGISTRY` → optionally `DOCK_APP_IDS`, an icon in `lib/app-icons.tsx`,
  `showOnDesktop`, and a `PHONE_APPS` entry in `lib/phone.ts`. Installable
  apps also need an item in `lib/app-store/catalog.ts`. Every launch alias
  must map to exactly one app (a test enforces it).
- Mini-apps take `preview?: boolean`. In preview (the store's live
  screenshots) they must start no timers, play no sound, and take no input.
- Saved windows whose `appId` is no longer registered, or not installed,
  are dropped on load. Removing an app is safe for returning visitors.

**State and storage**
- Zustand stores are read with **narrow selectors**
  (`useWindowManager((s) => s.x)`), never the whole store; one window's
  change must not re-render every app.
- Use `lib/storage.ts` (`readJSON`, `writeJSON`…) for `localStorage`.
  Storage can be missing or throw; never touch it bare.
- Keys are `muneebos-<thing>-v<N>`. If you change the shape of saved data,
  bump the version (or migrate) — returning visitors have the old shape.
- `saveState()` is debounced (the deferred writer in `lib/storage.ts`) and
  flushed on `pagehide`. Use the same writer for new persisted state.

**Desktop vs phone**
- `PHONE_QUERY` in `lib/phone.ts` must match the phone `@media` rule in
  `app/globals.css` (a test checks this). Use `usePhone()` in components
  and `isPhone()` in handlers; don't write new width checks.
- Phone copy uses phone names ("Files", "Settings", "this iPhone"), via
  `useAppName()` / `phoneTitle()`. Mac copy never mentions Windows terms.
- Phone touch targets ≥ 44 px; text inputs ≥ 16 px (stops iOS zoom).

**Keyboard shortcuts**
- Every shortcut is defined once in `lib/shortcuts.ts`. Handlers use
  `isShortcut(id, e)`; menus, tooltips and Settings show `shortcutKeys(id)`.
  ⌘W/⌘M/⌘H/⌘Tab belong to the browser, so the advertised keys use ⌥.

**Performance and loading**
- `/` First Load JS is ~175 kB. Keep it there: apps load with
  `next/dynamic` (`ssr: false`) and are prefetched while idle; the App
  Store loads on first open. New heavy code goes behind a dynamic import.
- Animate `transform` and `opacity`, not layout. `will-change` only while
  animating.

**Accessibility**
- Windows are non-modal `role="dialog"`s labelled by their title; hidden
  windows (other Space, minimized) are `inert` + `visibility: hidden`, so
  apps keep their state.
- Respect Reduce Motion (`reduceMotion` in system controls): cross-fade,
  don't move or scale.
- Keep the skip link and the server-rendered `<Profile/>` working.

**Content truth (portfolio data)**
- All portfolio facts live in `lib/portfolio-data.ts`; About, Projects,
  the App Store, Terminal, `/profile`, metadata and JSON-LD read from it.
  Change facts there, not in components.
- **Never invent** achievements, metrics, dates, employers, links or
  screenshots. If something is missing, leave it out and add it to
  "Needs the owner" in `TODO.md`.
- **The résumé is locked**: `profile.resumeLocked = true`. The PDF and
  page image were removed from `public/` in commit `3563a2a`; the Resume
  app shows a lock and links point to Contact. Don't re-add the PDF or link
  to it unless the owner asks. To unlock: `git checkout 3f3441b -- public/`
  and set `resumeLocked: false`. (The redirects in `next.config.mjs` point
  at the PDF and 404 while it's locked.)
- Credits for third-party designs, icons and wallpapers are in the README.
  Keep them when adding borrowed assets.

## 7. Writing code here

Match the code around you. Concretely:

- **TypeScript strict.** No `any` except where the file already does it
  for a reason (e.g. the `windowComponents` map). Prefer types from
  `lib/types.ts`.
- **Style:** 2-space indent, double quotes, semicolons, trailing commas,
  named exports, function components, `"use client"` only where needed.
  File names are kebab-case.
- **Comments explain why, in plain sentences**, above the code they
  describe — see `lib/launch-app.ts` or `lib/storage.ts`. No comments that
  restate the code, no commented-out code, no `console.log` left behind.
- **Simple over clever.** Reuse what exists (`launchApp`, `storage.ts`,
  `usePhone`, `SHORTCUTS`, `glass.ts`, the registry) before adding a
  helper. Delete dead code you create; don't leave fallbacks "just in case".
- **Pure logic in `lib/`, rendering in `components/`.** Logic that can be
  tested should be a pure function in `lib/` with a test in
  `scripts/test-macos.cjs`.
- **No new dependencies** without a clear reason the user agrees to. Check
  bundle impact.
- **UI copy:** short, plain English, the way macOS/iOS would say it.
  Sentence case for messages, Title Case for menu items and buttons (as
  macOS does).
- **CSS:** Tailwind utilities for one-off layout; shared shell/app styles
  live in `app/globals.css` (phone rules in the phone section at the end).
  Avoid adding `!important`.
- **Assets:** optimize images before committing (WebP/JPEG, sized to use);
  `images.unoptimized` is on, so Next won't do it for you.

## 8. Git

- Conventional commits with a scope, subject describing what the *visitor*
  gets: `feat(terminal): browse the portfolio as files with ls, cd, cat and tree`,
  `fix(phone): close the open app or sheet on the back gesture`. Body in
  plain prose bullets when useful.
- Work on the branch you're given; never push to `main` without being asked.
- **Don't add AI attribution**: no `Co-Authored-By: Claude`/AI trailers, no
  "Generated with" lines in commits or PRs. The owner has asked for this.
- Never commit secrets, `.env*`, `.next/`, or `node_modules/`.

## 9. Known open items

See `TODO.md`. In short: Launchpad, hot corners, Window → Move & Resize,
dragging several desktop files at once, browser (Playwright) tests, the
broken lint setup, and content only the owner can supply.
