# macOS Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Windows 7 desktop shell with a modern macOS-style shell while keeping the window manager, app registry, desktop grid, and every app's content.

**Architecture:** New shell units live in `components/mac/` and `lib/` (app icons, `launchApp`). `components/desktop.tsx` composes them; the Zustand window manager and app registry stay the single source of truth. Windows-only shell components are deleted.

**Tech Stack:** Next.js 15 (app router, client components), React 18, TypeScript, Tailwind CSS, Zustand, framer-motion, lucide-react, shepherd.js.

**Spec:** `docs/superpowers/specs/2026-10-05-macos-shell-design.md`

## Global Constraints

- Desktop shell only applies at viewport width ≥ 1024px; mobile (`MuneebOS`) is untouched.
- No Apple logos, artwork, sounds, or fonts; all icons are own gradient tiles + lucide glyphs.
- Menu bar height: 28px. Dock reserved height: 88px. Windows may not be dragged above the menu bar.
- Storage key for shell state: `muneebos-mac-state-v1`.
- `tsc --noEmit` must report no errors beyond the 20 pre-existing ones (all in `muneebOS.tsx` and `components/ui/button.tsx`).
- Commit after each task; messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Testing note:** the repo has no test runner, and this work is visual. Each
task's "test" is a browser check in the preview pane at 1440×900, using
fresh `localStorage`, plus `tsc`. This replaces TDD's failing-unit-test step
(agreed with the user).

**Plan note:** component markup is written during execution rather than
duplicated here; each task fixes the files, interfaces, and the exact
behaviour to verify.

---

### Task 1: App icons, launcher, registry, and state key

**Files:**
- Create: `lib/app-icons.tsx`, `lib/launch-app.ts`
- Modify: `lib/app-registry.ts`, `lib/window-manager.ts`, `lib/wallpapers.ts`, `lib/types.ts`

**Interfaces:**
- Produces: `AppIcon({ appId: string; size?: number; className?: string })` – squircle tile.
- Produces: `launchApp(appId: string): void` – opens a registry app (external URL → new tab; otherwise `openWindow` with centred, cascading position below the 28px menu bar, using `defaultSize`).
- Produces: `DOCK_APP_IDS: (string | "separator")[]` and `DESKTOP_FILE_IDS = ["about", "projects", "resume", "contact"]` in `app-registry.ts`.
- Produces: `MAC_WALLPAPERS: { id: string; name: string; css: string }[]` and `DEFAULT_WALLPAPER` in `wallpapers.ts`.

- [x] Rename registry titles per spec table (Safari, Finder, System Settings, Trash, Activity Monitor, Feedback); only `DESKTOP_FILE_IDS` keep `showOnDesktop`, placed at `gridCell(0, 0..3)` (measured from the top-right).
- [x] Change storage key to `muneebos-mac-state-v1`; default wallpaper `DEFAULT_WALLPAPER`.
- [x] Verify: `npx tsc --noEmit -p . | grep -c "error TS"` → 20.
- [x] Commit.

### Task 2: Mac window chrome

**Files:** Modify: `components/window.tsx`

**Interfaces:** Consumes `WindowState`; minimize target element id becomes `dock-item-${window.appId ?? window.id}`.

- [x] Traffic lights (red close, yellow minimize, green zoom; glyphs on hover), centred title, light title bar (inactive = flatter), 10px radius, large soft shadow.
- [x] Zoomed window: `top: 28`, `left: 0`, `width: 100vw`, `height: calc(100vh - 28px - 88px)`. Drag clamps `y ≥ 28`.
- [x] Verify in browser: open About; drag, zoom, minimize (shrinks toward Dock icon), restore from Dock, close.
- [x] Commit.

### Task 3: Menu bar, Dock, Spotlight, desktop composition

**Files:**
- Create: `components/mac/menu-bar.tsx`, `components/mac/dock.tsx`, `components/mac/spotlight.tsx`, `components/mac/muneeb-logo.tsx`
- Modify: `components/desktop.tsx`, `components/context-menu.tsx`, `components/desktop-icon.tsx`, `components/desktop-icon-context-menu.tsx`, `components/windows/terminal-window.tsx`
- Delete: `components/taskbar.tsx`, `components/start-menu.tsx`, `components/system-tray/`, `components/windows/windows7-memories.tsx`

**Interfaces:**
- `MenuBar({ onOpenSpotlight: () => void; onStartTour: () => void; onLock: () => void })`
- `Dock()` – each item `id="dock-item-<appId>"`, `data-dock-id="<appId>"`.
- `Spotlight({ open: boolean; onClose: () => void })` – uses `searchApps` + `launchApp`.

- [x] Menu bar per spec (logo menu, active app name, Go, Window, Help, right-side glyphs + clock). Menus close on outside click / Esc.
- [x] Dock with framer-motion magnification, separators, running dots, click → `launchApp` (restores minimized windows).
- [x] Spotlight: ⌘K / Ctrl+K toggles, arrow keys + Enter, Esc closes.
- [x] Desktop icons: Finder-style label, anchored top-right (`left = containerWidth − GRID_CELL_WIDTH − x`, inverse for drag); open via `launchApp`.
- [x] Context menus restyled Mac (rounded, translucent, blue highlight). Desktop menu: Change Wallpaper…, Clean Up, Spotlight.
- [x] Remove ⌘X memories shortcut and Ctrl+Shift+Esc → open Activity Monitor via `launchApp`.
- [x] Verify in browser: Dock magnifies; dots appear for open apps; Spotlight finds "resume" and opens it; desktop files drag/snap top-right; menu bar Go → Projects opens Projects.
- [x] Commit.

### Task 4: Lock screen, boot screen, tour

**Files:**
- Create: `components/mac/lock-screen.tsx`, `components/mac/boot-screen.tsx`
- Modify: `app/page.tsx`, `components/desktop.tsx`, `components/windows7-tour-pixel.tsx`
- Delete: `components/login-screen.tsx`, `components/windows7-startup.tsx`

**Interfaces:** `LockScreen({ onUnlock: () => void })`; `BootScreen({ onDone: () => void })`.

- [x] Lock screen per spec; Enter or click unlocks. Menu bar "Lock Screen" returns to it.
- [x] Shut Down → black "Click or press Enter to start up" → `BootScreen` (~2s) → desktop. Startup chime removed.
- [x] Tour targets `[data-dock-id="…"]`; "Take the Tour" in Help menu plus a Mac-style pill.
- [x] Verify in browser: fresh visit → lock → desktop → tour walks About/Projects/Resume/Contact Dock icons; Shut Down → boot → desktop.
- [x] Commit.

### Task 5: App internals, settings, copy, OG image

**Files:** Modify: `components/windows/internet-explorer.tsx`, `projects-explorer.tsx`, `recycle-bin.tsx`, `task-manager-window.tsx`, `calculator.tsx`, `modern-music-player.tsx`, `settings-window.tsx`, `computer-explorer.tsx`, `github-activity-viewer.tsx`, `app/layout.tsx`, `public/og-image.png`

- [x] Rename visible Windows wording (Safari, Trash, Activity Monitor, Calculator, Music, Finder); drop Explorer's File/Edit/View/Tools bar.
- [x] Settings: wallpaper picker uses `MAC_WALLPAPERS`; remove Aero and taskbar transparency controls.
- [x] Metadata copy says macOS-style; regenerate OG image from the lock screen.
- [x] Verify in browser: each Dock app opens with no Windows wording visible; wallpaper switch works.
- [x] Commit.

### Task 6: Final verification

- [x] `npx tsc --noEmit -p .` → 20 errors (pre-existing).
- [x] `npx next build` succeeds.
- [x] Full fresh-visitor walkthrough at 1440×900 and 1280×720; mobile view at 375×812 unchanged.
- [x] `grep -rn "Windows\|Internet Explorer\|Recycle Bin\|Control Panel" components app lib` shows only intentional leftovers (mobile, hidden demo apps, game internals).
