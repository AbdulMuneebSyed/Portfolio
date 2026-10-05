# macOS Shell Redesign

**Date:** 2026-10-05
**Status:** Approved (approach A: re-skin the shell, keep the engine)

## Goal

Replace the Windows 7 desktop shell with a modern macOS-style shell
(Sonoma/Sequoia look). Keep the window manager, app registry, desktop grid
and every app's content. Mobile (`MuneebOS`, < 1024px) is unchanged.

## Decisions

| Question | Decision |
|---|---|
| Replace or toggle | Replace Windows entirely (git history keeps it) |
| Style | Modern macOS: frosted menu bar and Dock, traffic-light windows |
| Mobile | Unchanged |
| Navigation | Dock holds all apps; desktop holds 4 files; Spotlight for search |

## What the visitor sees

- **Lock screen** (replaces Win7 login): wallpaper, large clock and date,
  avatar, name, "Click or press Enter to unlock". No password field.
- **Menu bar** (top, 28px, frosted): MuneebOS logo menu (About Muneeb,
  System Settings, Lock Screen, Restart, Shut Down), the active app's name,
  a **Go** menu (About, Projects, Resume, Contact, GitHub, LinkedIn), a
  **Window** menu (Minimize, Zoom, Close, open windows), a **Help** menu
  (Take the Tour). Right side: Spotlight button, Wi-Fi and volume glyphs,
  date and time.
- **Desktop**: macOS-style CSS wallpaper; four files anchored top-right:
  About Me, Projects (folder), Resume.pdf, Contact. Draggable, snapping to
  the shared grid (measured from the top-right corner). Right-click menu:
  Change Wallpaper…, Clean Up, Spotlight.
- **Dock** (bottom, frosted, magnifies on hover, running-app dots):
  About · Projects · Resume · Contact · GitHub | Terminal · Safari · Finder ·
  System Settings | LinkedIn · Trash.
- **Windows**: 10px rounded corners, light title bar with traffic lights
  (close / minimize / zoom) on the left and a centred title. Zoom fills the
  area between menu bar and Dock. Minimize animates into the Dock icon.
- **Spotlight**: ⌘K / Ctrl+K (and the menu-bar icon) opens a centred search
  over the app registry; arrow keys + Enter launch; Esc closes.
- **Tour**: same 6 steps, now pointing at Dock icons.
- **Shut Down / Restart**: black screen → short boot (logo + progress bar,
  ~2s) → desktop. No Windows startup chime.

## App renames (content unchanged)

| Registry id | Was | Becomes |
|---|---|---|
| `ie` | Internet Explorer | Safari |
| `computer` | Computer | Finder |
| `settings` | Control Panel | System Settings |
| `recycle` | Recycle Bin | Trash (Dock only) |
| `task-manager` | Task Manager | Activity Monitor |
| `feedback` | Reviews & Bugs | Feedback |

Visible "Windows" wording inside apps (IE8 status bar, "Windows Calculator",
"Windows Media Player", Recycle Bin labels, Explorer's File/Edit/View bar)
is renamed or removed. Calculator, Minesweeper, Snake keep their look.

## Architecture

New, focused units (all in `components/mac/` unless noted):

| Unit | Responsibility |
|---|---|
| `lib/app-icons.tsx` | `AppIcon` – squircle gradient tile + glyph per app id (own artwork, no Apple assets) |
| `lib/launch-app.ts` | `launchApp(appId)` – one way to open any registry app (external URL, centred cascading position, default size) |
| `lock-screen.tsx` | Lock screen (replaces `login-screen.tsx`) |
| `menu-bar.tsx` | Top menu bar and its dropdown menus |
| `dock.tsx` | Dock with magnification, running dots, minimize targets (`dock-item-<appId>`) |
| `spotlight.tsx` | Search overlay |
| `boot-screen.tsx` | Short boot animation (replaces `windows7-startup.tsx`) |
| `muneeb-logo.tsx` | Monogram used in menu bar and boot screen |

Changed: `desktop.tsx` (composes the new shell), `window.tsx` (Mac chrome),
`desktop-icon.tsx` (Finder look, top-right anchoring), `context-menu.tsx`
(Mac look), `windows7-tour-pixel.tsx` (Dock targets), `app-registry.ts`
(renames, `DOCK_APP_IDS`, desktop set), `window-manager.ts` (new storage key
`muneebos-mac-state-v1` so Windows-era saved state is discarded),
`wallpapers.ts` (macOS gradients), `settings-window.tsx` (drop Aero and
taskbar options), `app/page.tsx`, `app/layout.tsx` (copy, OG image).

Removed: `taskbar.tsx`, `start-menu.tsx`, `login-screen.tsx`,
`windows7-startup.tsx`, `system-tray/`, `windows/windows7-memories.tsx`
(and its ⌘X shortcut, which also hijacked Cut).

## Error handling

- Saved state from the Windows version uses a different key and is ignored.
- `launchApp` with an unknown id is a no-op.
- External apps (LinkedIn) open in a new tab and never create a window.

## Testing

The repo has no test runner. Each task is verified in the browser pane at
1440×900 (and 1280×720 for layout), checking the behaviour listed in the
task, plus `tsc` (no new errors beyond the 20 pre-existing ones) and a
final `next build`.

## Out of scope

Mobile, the hidden demo apps (Projects Explorer Pro, Mail client), new
features, Apple trademarks or artwork.
