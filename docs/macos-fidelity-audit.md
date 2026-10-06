# macOS fidelity audit: windows, Finder, and built-in apps

Date: 2026-10-06

Reference: Apple Human Interface Guidelines, "Toolbars" (macOS window anatomy:
a Finder window), "Sidebars", "Windows", and "Search fields" images. These are
2× images, so the measurements below are halved to points. Compared against
screenshots of the portfolio at 1440 × 900.

## The biggest gap: two title bars instead of one

Since Big Sur, a Mac app with a sidebar has **no separate title bar**. The
sidebar runs the full height of the window, the traffic lights sit on top of
it, and the window title sits in the toolbar beside the back and forward
buttons. The toolbar _is_ the title bar.

The portfolio gives every window a 44 px grey title bar with a centred title
("Finder"), then the app draws its own 48 px toolbar below it with a second
title ("Home").

|                      | macOS (HIG)                                    | Portfolio                  | Difference                     |
| -------------------- | ---------------------------------------------- | -------------------------- | ------------------------------ |
| Chrome above content | 52 pt, one row                                 | 44 + 48 = 92 px, two rows  | ~40 px lost; title shown twice |
| Sidebar              | full height, under the traffic lights          | starts below the title bar | wrong structure                |
| Toolbar background   | same as the content, no divider                | grey with a bottom border  | looks like a separate bar      |
| Toolbar title        | 15 pt bold, after back/forward                 | 14 px semibold             | small                          |
| Toolbar buttons      | grouped in capsules (back + forward share one) | flat, unbordered icons     | noticeable                     |
| Search               | capsule field                                  | 6 px-radius rectangle      | small                          |

## Window frame

|                                  | macOS                               | Portfolio             | Difference               |
| -------------------------------- | ----------------------------------- | --------------------- | ------------------------ |
| Traffic light size               | 12 pt                               | 13 px                 | 1 px                     |
| Light spacing (centre to centre) | 20 pt (8 pt gap)                    | 21 px                 | ok                       |
| First light centre               | ~23 pt from left and top            | 22 px left, 22 px top | ok, but in the wrong row |
| Corner radius                    | ~16 pt (Tahoe, window with toolbar) | 12 px                 | 4 px                     |

## Sidebar

|                | macOS                                                 | Portfolio                                     | Difference                |
| -------------- | ----------------------------------------------------- | --------------------------------------------- | ------------------------- |
| Row pitch      | ~24–28 pt                                             | ~36 px (6 px padding + 2 px margin each side) | ~30% too tall             |
| Icon           | 16 pt, accent colour                                  | 17 px, accent                                 | ok                        |
| Label          | 13 pt, ~39 pt from window edge                        | 13 px, ~45 px                                 | small                     |
| Section header | 11 pt semibold grey, first one just below the toolbar | same type, but below a 44 px title bar        | moves with the chrome fix |

## Finder

- **Path bar and status bar.** Finder hides both by default. The portfolio shows
  both (two extra rows, ~56 px). The status bar, when shown, has centred text
  and no buttons; the portfolio's has a stray "go home" arrow.
- **Icon view selection.** macOS draws a grey rounded box around the icon and a
  blue capsule with white text around the name. The portfolio tints the whole
  tile light blue.

## Other apps

| App                                                                                             | macOS                                                                                                 | Portfolio                                                                               | Gap                               |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| System Settings                                                                                 | pane title ("Appearance") in the toolbar next to back/forward; search field at the top of the sidebar | separate "System Settings" title bar; pane title as a large heading inside the content  | medium                            |
| Calculator                                                                                      | dark window, transparent title bar with no title, round buttons with gaps                             | light title bar reading "Calculator", square buttons in a flat grid (pre-Big Sur style) | large                             |
| Terminal                                                                                        | one title bar reading "muneeb — -zsh — 80×24"                                                         | title bar reading "Terminal", plus a second bar repeating the title, plus a footer hint | medium                            |
| Safari                                                                                          | one unified toolbar; the tab bar is hidden when only one tab is open                                  | separate title bar, then toolbar, then a tab strip for a single tab                     | medium                            |
| Activity Monitor, Trash, Music, Notes, Contact, Feedback, About, GitHub, Resume, Preview, games | one unified toolbar                                                                                   | title bar plus toolbar                                                                  | fixed by the shared chrome change |
| Notes                                                                                           | three columns: folders, note list, editor                                                             | two columns: folders, editor                                                            | medium (not in this pass)         |
| Music                                                                                           | sidebar (Home, Radio, Library) and playback controls in the toolbar                                   | single-pane player                                                                      | medium (not in this pass)         |
| Activity Monitor                                                                                | CPU / Memory / Energy / Disk / Network tabs and more columns                                          | Status and PID columns                                                                  | small (not in this pass)          |

## Plan

### Phase 1 — shared window chrome (fixes every app)

1. `components/window.tsx`: windows whose app draws a toolbar get **unified**
   chrome: no title bar row; traffic lights float over the top-left corner,
   centred in the 52 px toolbar row. The toolbar and the top of the sidebar
   become the drag region (empty space only, not buttons or fields), and
   double-clicking them zooms, as on a Mac. Apps without a toolbar (Calculator,
   Terminal) keep a title bar.
2. `app/globals.css`:
   - toolbar: 52 px, content background, no divider; 15 px bold title;
     clears the traffic lights when there is no sidebar;
   - sidebar: starts at the top of the window, 52 px top padding, 28 px rows;
   - capsule groups for toolbar buttons; capsule search field;
   - 12 px traffic lights, 16 px window radius.

### Phase 2 — per-app fixes

3. Finder: remove the path bar; status bar with centred text and no button;
   macOS icon selection (grey box around the icon, blue capsule on the name);
   back/forward in one capsule.
4. Projects: same toolbar and selection treatment as Finder.
5. System Settings: pane title moves into the toolbar.
6. Calculator: dark title bar without a title, round buttons with gaps.
7. Terminal: title "muneeb — -zsh — 80×24"; remove the duplicate bar and footer.
   Found while testing: unknown commands answered with the Windows `cmd.exe`
   error ("is not recognized as an internal or external command"); now
   `zsh: command not found: <name>`, as zsh prints.
8. Safari: unified toolbar; hide the tab strip when only one tab is open.

### Not in this pass

Notes third column, Music sidebar, Activity Monitor tabs and columns, Trash as
a Finder window. Each is a self-contained follow-up.

### Status

Phases 1 and 2 are done. Also added: System Settings back/forward walk the
panes visited; search moved above the account row, as in macOS; settings
icons are 20 px.

### Verification

Before/after screenshots of every app at 1440 × 900 and 390 × 844, in light
and dark mode; `node --test scripts/test-macos.cjs`; `npx tsc --noEmit`;
`npm run build`.

Result: all passed. Checked by hand in the browser: dragging by the toolbar
and by the top of the sidebar moves the window; pressing on toolbar buttons,
fields, or sidebar items does not; double-clicking empty toolbar space zooms;
traffic lights, Calculator keys, Settings back/forward, and Safari's tab bar
(shown once a second tab opens) all work.
