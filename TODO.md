# Muneeb OS macOS redesign notes

Status: active redesign work is implemented in the working tree. This file tracks what is done and what is left.
Current direction: macOS on desktop/tablet; iOS 27-inspired presentation below 700px.

Date: 2026-10-06

## What has been completed

- Reworked the shell to use a macOS-style desktop on wide screens and an iPhone-inspired Home Screen on phones.
- Removed the old mobile shell (`components/muneebOS.tsx`) and replaced it with `components/mobile-home.tsx` for the current phone design.
- Added Big Sur-style menu bar, Dock, traffic lights, translucent windows, dark mode, reduced motion, keyboard focus states, compact mobile Dock, and desktop icon touch/keyboard support.
- Added system shortcuts: Spotlight (`⌘K` / `Ctrl+K`, plus `⌘Space` when the browser passes it through), Settings (`⌘,`), minimize (`⌘M`), close (`⌘W`), cycle windows (`⌘\``), and Escape dismissal.
- Rebuilt Finder in `components/windows/computer-explorer.tsx` with sidebar locations, folder history, search, icon/list views, sorting, keyboard navigation, file/app opening, and responsive layout.
- Rebuilt Projects in `components/windows/projects-explorer.tsx` with Finder-like sidebar, categories, search, icon/list views, and detail view.
- Rebuilt System Settings in `components/windows/settings-window.tsx` with Appearance, Wallpaper, Displays, Sound, Accessibility, Keyboard Shortcuts, and About sections. Settings persist through `lib/system-controls.ts` and `lib/window-manager.ts`.
- Rebuilt or refreshed Safari, Notes, Calculator, Music, Contact, Feedback, About, Resume, Photo Preview, Terminal, GitHub, Activity Monitor, Trash, Snake, and Minesweeper to use the shared macOS visual system.
- Music and Control Center share playback state through `lib/now-playing.ts`.
- Settings and window state persistence, focus behavior, Dock restore behavior, responsive launch bounds, and app registry aliases are covered by `scripts/test-macos.cjs`.
- Updated `README.md` with the new responsive behavior and shortcut reference.

## Verification already run

```bash
node --test scripts/test-macos.cjs
npx tsc --noEmit
npm run build
git diff --check
```

All passed. `next build` still reports the existing warning that `metadataBase` is not set in `app/layout.tsx`; this does not fail the build.

Browser checks at 390 × 844 also passed for Calculator, Safari, Music, About, Projects, Contact, Feedback, Snake, Minesweeper, GitHub, Activity Monitor, and Trash: each active window stayed within the viewport without horizontal content overflow. Finder navigation and opening Notes were exercised. Dark mode and Settings keyboard navigation were exercised.

## Done on 2026-10-06 (second pass)

- Browser smoke pass at desktop and 375 × 812: Spotlight (Ctrl+K, search, Enter to launch), Ctrl+, / Ctrl+M / Ctrl+W, Dock restore of a minimized window, phone-width compact Dock + Spotlight, touch-tap on a desktop file opens a full-width window with no horizontal overflow.
- `metadataBase` set to `https://portfolio-muneeb.vercel.app` in `app/layout.tsx`; the build warning is gone.
- Removed the legacy `projects-pro` and `mail-client` registry entries and their alias files. Saved windows whose `appId` is no longer in the registry are dropped on load (`lib/window-manager.ts`).
- Legacy-string sweep: no Windows/Aero copy left in `app/` or `components/` UI. Remaining hits are internal names (`aeroEffects`, `setAeroEffects`, `taskbarTransparency`) kept for saved-state compatibility, and Settings copy that correctly says "Ctrl on Windows and Linux".

## Done on 2026-10-06 (audit pass)

- Added favicon, SVG icon, Apple touch icon, web manifest (`app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `app/manifest.ts`, `public/icon-192.png`, `public/icon-512.png`). The old metadata pointed at files that did not exist.
- Added `app/robots.ts` and `app/sitemap.ts`. Removed the placeholder Twitter `creator: "@muneeb"`, which pointed at someone else's account.
- About now uses `/avatar-256.jpg` (was a 2413×2631, 3.9 MB import); Finder's avatar.jpg preview uses `/avatar-1200.jpg` (344 KB).
- Fixed alias collision: "activity" opened GitHub instead of Activity Monitor. Terminal `top` (and legacy `taskmgr`) now open Activity Monitor. Test added: every alias maps to one app.
- Terminal: clicking anywhere in the window focuses the prompt; removed the blue focus box around the prompt.
- Windows take keyboard focus when they become active (restoring the last focused control), so Calculator and other keyboard-driven apps work right after opening from Spotlight or the Dock.
- Resume shows an "Open Resume" fallback where the browser can't embed PDFs (`navigator.pdfViewerEnabled === false`, e.g. Android Chrome).

## Done on 2026-10-06 (macOS behaviours pass)

- Deleted 30 unused Windows-era/placeholder files from `public/` (22 MB → 16 MB). Kept `2Syed Abdul Muneeb's SE Resume.pdf` (unused, but may be linked from old applications). Registry `icon` paths now point at the Mac icons.
- Minimize animates into the app's Dock icon (macOS "Scale effect"); restore comes back out of it.
- Dock icons bounce when an app launches (not for windows restored on load).
- Zoom and tiling animate the frame (CSS transition on left/top/width/height only while zooming/tiling).
- Sequoia tiling: hold a window at the left/right edge (half) or top (fill) for a preview; dragging a tiled window away restores its size. The pre-tile size lives in a ref, so it is forgotten on reload.
- Mission Control (Ctrl+↑, F3, Window menu): windows laid out by `missionLayout` in `lib/mission-control.ts`; click to pick, Esc or click backdrop to leave. Disabled under 700px.
- Rubber-band selection on the desktop; Shift/⌘-click toggles. Selection is shared in `lib/desktop-selection.ts`.
- Notification banners (`lib/notifications.ts`, `components/mac/notification-banners.tsx`): welcome on first visit, Contact sent, Feedback sent, Screenshot saved/unavailable. Focus mode silences them; max 3; 5 s each.
- Notifications persist: unread ones stay in Notification Center (Mac: menu bar clock; iPhone: pull down from the status bar time) and on the lock screen until opened or cleared (`components/mac/notice-list.tsx`). Focus skips the banner but still delivers.
- Notification feed (`lib/notification-feed.ts`, `lib/notification-scheduler.ts`): LinkedIn, GitHub and resume first, then resume highlights and nudges. Active-tab time only; first after 30–45 s, gaps 60–100 s growing 1.3×, max 6 a visit, never repeated within two weeks, held back while a banner, dialog or Notification Center is open. `?notifications=fast` runs it 15× faster.
- Tests added for the Mission Control layout and banners.

## Resume update (2026-10-08)

- New resume at `public/syedabdulmuneebresume.pdf` (replaces `Syed Abdul Muneeb's SDE Resume (15).pdf`); `public/resume/page-1.webp` re-rendered from it.
- `lib/portfolio-data.ts` follows the resume: SDE at PulseGen (Arrwin), AiResumate as the Capco-cs role, new Projects & Research (Arrwin, Hypogen, the checkpointed-agents paper); LaunchPad and the Capco vendor portal removed from Projects, the App Store and Safari.
- Site URL is now `https://www.syedabdulmuneeb.dev` (metadata, sitemap, robots, JSON-LD); it already serves this build.

## Remaining work

1. Ideas not built yet: Launchpad, hot corners, Window → Move & Resize menu items, dragging several selected desktop files at once.
2. Optional: add a Playwright layer; `scripts/test-macos.cjs` covers stores and launch geometry only.
3. Product decisions for the owner: keep the click sound opt-in? Auto-start the tour on first visit (`components/desktop.tsx`)?
4. Note: running `npm run build` while `npm run dev` is running overwrites `.next` and leaves the dev server serving 404 CSS. Stop dev before building.

## App Store (2026-10-07)

Plan: `docs/superpowers/plans/2026-10-07-app-store.md`.

- `components/windows/app-store/` — window (sidebar, history stack, search, scroll-aware toolbar, compact layout under 640px of content width), tab pages, product page, live previews, generated artwork and mock screens. Loaded with `next/dynamic` on first open.
- `lib/app-store/` — `catalog.ts` (every item), `editorial.ts` (what each tab shows), `installed.ts` (install overrides and the Updates version, saved as `muneebos-app-store-v1`), `actions.ts` (Get, Delete, Update, gift codes), `version.ts`.
- Registry entries can be `installable` (and `preinstalled`). `isAppInstalled()` gates `getLaunchableApps()`, so Finder, Spotlight and Terminal follow automatically; `launchApp()` sends an uninstalled app to its store page; saved windows of uninstalled apps are dropped on load.
- Twelve mini-apps in `components/windows/mini/`, rules in `lib/games/` (covered by tests). Each takes `preview` for the store's live screenshots: no timers, input or sound.
- Project and job data moved to `lib/portfolio-data.ts` (About, Projects and the store share it).
- Screenshots: `public/app-store/shots/` (headless Chrome, 2026-10-07). airesumate.com no longer resolves and hackrevolution.in blocks automated browsers, so those use drawn screens. **`portfolio-muneeb.vercel.app` currently serves someone else's portfolio** — the README "Live" link needs checking.
- Checked in the browser at 1440×900 (light and dark) and 375×812: every tab, product pages, Get/Open/Delete, Update and Dock badge, gift codes, search, Terminal install/open, Spotlight "Get in the App Store", `?app=` links, all twelve mini-apps rendering, 2048 and Tic-Tac-Toe play. `next build` passes; first-load JS for `/` is 279 kB.

## Desktops (Spaces) (2026-10-07)

Plan and checkpoints: `docs/superpowers/plans/2026-10-07-spaces.md`.

- State lives in `lib/window-manager.ts` (saved with the windows): `spaces`, `activeSpaceId`, `trash`, plus `spaceId` on windows and desktop icons (`spaceOf()` treats a missing/unknown id as the first desktop). Activating a window on another desktop switches to it.
- `components/mac/spaces-bar.tsx` is Mission Control's strip; `lib/trackpad-swipe.ts` turns two-finger wheel events into swipes; window drag state is in `lib/mission-control.ts`.
- Windows on other desktops stay mounted with `visibility: hidden` + `inert`, so apps keep their state.
- Only visitor-made folders can be trashed; portfolio files can move between desktops.

## Important implementation notes

- Keep the registry as the single launch source: use `launchApp()` instead of opening windows directly unless an app needs a file-specific preview.
- `Window` in `components/window.tsx` owns responsive sizing, drag/resize pointer gestures, active focus, minimized state, and compact viewport hiding.
- `aeroEffects` now controls transparency for the shared shell. `reduceMotion`, `systemSounds`, `darkMode`, brightness, volume, and network toggles live in `lib/system-controls.ts`.
- The current working tree includes the intentional deletion of `components/muneebOS.tsx`. Preserve it unless the user explicitly asks for a separate mobile OS.
- Do not reset or discard the working tree; all current changes are part of this redesign.

## iPhone design pass (2026-10-06)

- Apple released iOS 27 on September 14, 2026. Research sources: [iOS 27](https://www.apple.com/os/ios/), [Apple newsroom](https://www.apple.com/newsroom/2026/09/major-updates-for-apples-software-platforms-are-now-available/), [Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios), [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), and [Layout](https://developer.apple.com/design/human-interface-guidelines/layout).
- The Mac shell remains on tablet/desktop. Below 700px, `components/mobile-home.tsx` provides the iPhone-inspired home screen, app folders, Search, Dock, status area, and Control Center. `components/window.tsx` presents apps full screen with a Home control. `components/mac/lock-screen.tsx` has an iPhone lock layout and swipe-up unlock. Phone styles are at the end of `app/globals.css`.
- Finder, Projects, and Settings use horizontally scrolling category navigation on phones. App icons use unique SVG gradient IDs to render correctly when many folder icons are present.
- Browser checked at 390×844, 375×667, and 844×390: lock screen, home, folders, Projects list/detail, Finder, Settings in light/dark, Control Center, Search, Snake, About, Safari, Calculator, Contact, Music, Notes, Resume, Feedback, and GitHub. No horizontal content overflow in those app checks. Continue checking other apps if changing their internals.
- Phone-specific polish completed: Settings hides Desktop & Dock, uses phone labels and keyboard shortcuts, and no longer shows desktop history controls. Files calls the Desktop folder “Portfolio” on phones; Notes, the tour, Activity, and Recently Deleted use phone-appropriate copy. The apps remain portfolio experiences rather than exact replicas of Apple’s native apps.
