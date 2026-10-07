# Mobile UI Audit — iPhone layout

Audited on 2026-10-07 at 393×852 (iPhone 15/16 Pro), 375×667 (iPhone SE) and 852×393 (landscape), by opening every screen and every app in the browser and measuring the DOM.

Reference: iOS 18 on a 393-pt-wide iPhone.

---

## 1. The root problem: what the previous mobile work got wrong

The phone UI was never designed as a phone UI. The Mac desktop was squeezed into a phone with CSS overrides, and an iPhone home screen was placed on top. Almost every issue below comes from one of these decisions:

| # | Wrong step | Consequence |
|---|---|---|
| R1 | **Mac windows reused as-is.** They are forced full screen with one large `@media` block in `globals.css` (~550 lines, many `!important`). | Every app keeps its Mac toolbar, Mac sidebar, Mac status footer and Mac controls. |
| R2 | **A generic `ios-app-header` ("‹ Home  Title") was added on top of every window** (`window.tsx:384`). | Two or three title bars are stacked: iOS header, then the sidebar turned into a chip strip, then the Mac toolbar with the title again. About Me spends **~200 px of 852 (24%)** on chrome. In landscape it spends about half the screen. |
| R3 | **Mac sidebars were turned into horizontal chip strips** (`.mac-window .mac-sidebar { max-height: 58px; overflow-x: auto }`). | No iOS app looks like this. Tabs are cut off at the edge ("Full Stac…", "Appli…"), and apps with no useful sidebar (Notes) show an empty grey strip. |
| R4 | **macOS artwork used on an iOS home screen.** Finder face, Mac Safari, Mac Notes, Big Sur gear, Mac Mail, plain blue Finder folders for Projects and Files. | It reads as "a Mac on a phone", not an iPhone. Icon fill is inconsistent: measured inner art is **61, 76, 61, 34 px** inside the same 76-px tile, so Projects and Resume float with no tile while GitHub is a small glyph. |
| R5 | **Invented metrics instead of iOS ones.** | 76-px icons, 11-px labels, a 44-px status bar, a 92×24 island and an 88-px dock. On iOS: 60-pt icons, 12-pt labels, a 54-pt status bar, a 126×37 island and a ~96-pt dock. |
| R6 | **The phone/desktop decision is made twice**: in CSS (media query) and in JS. `window.tsx` starts with `viewport = {1200×800}`. | On the first render every window is a floating desktop window. It then snaps to full screen, which is visible as a rounded card zooming in. The two rules can also drift apart. |
| R7 | **Mac motion kept.** | Apps open with the Mac window animation (scale 0.97 + fade) and leave with the minimise animation, not the iOS zoom from the icon and back into it. |
| R8 | **Tap-only.** | There is no swipe up on the home bar, no edge swipe back and no pull-down for Control Center. "Swipe up to open" on the lock screen is the only gesture. |
| R9 | **Desktop copy left in.** | The welcome notification says "press ⌘K"; Safari says "the rest of this Mac". Search shows Mac names ("Finder", "System Settings", "Activity Monitor") while the home screen says "Files", "Settings", "Activity". |

**Conclusion:** patching more CSS onto the Mac windows will not fix this. The fix is an iOS app shell (one nav bar, an optional tab bar, iOS metrics, iOS motion) plus a phone layout for each app's content. The desktop is not touched.

---

## 2. System screens

### 2.1 Lock screen
| Issue | Correction |
|---|---|
| Battery % shown as a line under the clock (Mac lock-screen idea) | Remove it. iOS shows date, then a large clock, then optional widgets |
| Status icons: battery (charging) before Wi-Fi, no signal, nothing on the left | iOS order is left: carrier/empty; right: signal · Wi-Fi · battery |
| Clock "2:37" while the home status bar shows "14:37" | Use one format everywhere (follow the locale; 12-h on both) |
| No flashlight or camera buttons, no notification stack | Add the two round bottom buttons (decorative or working) and optionally one notification ("Welcome to Muneeb OS") |
| "Swipe up to open" plus bar works, but the swipe has no motion | Lock screen should follow the finger upward and spring |

### 2.2 Status bar
| Issue | Correction |
|---|---|
| 44 px tall, island 92×24 at y=10 | 54 pt; island 126×37 at y=11; time centred in the left ear (17-pt semibold) |
| Inside apps it is a solid white strip, even over Calculator and Terminal (black apps) | The status bar takes the app's nav-bar colour (light text on dark apps, dark text on light apps) |
| The island also shows in landscape | Landscape iPhone hides the status bar; the island sits on the side |
| The whole right cluster is one button that opens Control Center | Keep the tap target, but also support pull-down from the top-right |

### 2.3 Home screen (the main page)
| Issue | Correction |
|---|---|
| Icons are macOS artwork (Finder, Mac Safari, Mac Notes ×2 for Notes and Feedback, Big Sur Settings, Mac Mail, blue folders) | Use real iOS 18 icons: Files, Safari, Notes, Settings, Mail, Music, App Store, Calculator. Give Projects and Resume proper squircle icons, and give Feedback its own icon instead of reusing Notes |
| Inconsistent inner art size (61/76/34 px) | Every icon is a full-bleed 60-pt squircle (continuous corner ~13.5 pt); the artwork fills it |
| 76-px tiles, 11-px labels, gap 20/8 | 60-pt icons, 12-pt labels, 4 columns with ~27-pt side margins, ~90-pt row pitch |
| Profile "widget" is a custom navy card (357×132) with an overline and an arrow link | A real iOS **medium widget** (338×158, radius 22) in an iOS widget style. Photo + name + role + one live line (e.g. "Now: SDE Intern @ Pulsegen") |
| The widget pushes the grid down, and a large empty area remains between the grid and the Search pill | Fill page 1 to iOS density. Optionally add page 2 and page dots, or a second small widget (GitHub streak / Now Playing) |
| Folder icon shows 2×2; the open folder is a 4-column panel with a "Done" button | iOS folder icon is a 3×3 mini grid. The open folder has its title above a 3-column panel and closes by tapping outside (no Done button) |
| Utilities holds "Recently Deleted" and a LinkedIn link | Group sensibly: "Utilities" (Terminal, Activity), and move LinkedIn to the dock, the widget or Contact |
| Search pill is pink-tinted and sits 15 px above the dock | iOS 18 pill: neutral glass, 30 pt tall, ~10 pt above the dock |
| Dock 369×88, radius 28, 70-px icons, pink tint | ~96-pt-tall glass, radius ~38 (follows the display corner), 60-pt icons, 8-pt side inset |
| The welcome banner covers the widget and mentions ⌘K | Phone copy ("Tap the widget to meet Muneeb"), iOS banner metrics, swipe up to dismiss |
| Apps open with the Mac window animation | Zoom from the tapped icon's rect to full screen, and back into the icon on Home |

### 2.4 Control Center
| Issue | Correction |
|---|---|
| A translucent sheet over the home screen: icons and labels show through the tiles and are hard to read | iOS 18 Control Center: a heavily blurred, dimmed full screen with separate glass modules |
| Only 4 rectangular toggles + one plain slider + "Open Settings" | Connectivity 2×2 module (Airplane, Cellular, Wi-Fi, Bluetooth), Now Playing, Focus, tall vertical Brightness and Volume sliders, round Flashlight / Timer / Calculator / Camera buttons, Dark Mode |
| Opens by tapping the status icons; closes with a chevron | Pull down from the top-right, close by swiping up or tapping outside; no chevron |

### 2.5 Search (Spotlight)
| Issue | Correction |
|---|---|
| The Mac Spotlight panel floats mid-screen with a square focus ring on the input | iOS Search: the field sits at the bottom above the keyboard (iOS 18) or at the top with "Cancel", on a blurred wallpaper |
| Results use Mac names (Finder, System Settings, Activity Monitor) and Mac descriptions | Use the phone names. Group into "Top Hit", "Apps", and Siri Suggestions as icon rows |

### 2.6 Tour (PhoneTour)
| Issue | Correction |
|---|---|
| The card reuses Mac `.tour-dialog` styles and Mac buttons | iOS onboarding sheet ("What's New" style): large title, 3 rows of icon + text, one full-width "Continue" button |
| Mixed copy: phone text exists only for 2 of 4 steps | Phone copy for every step; mention gestures (swipe up for Home, pull down for Control Center) |

### 2.7 Landscape (852×393)
| Issue | Correction |
|---|---|
| Inside an app, the iOS header + chip strip + toolbar use about half the height | One compact nav bar (~32 pt), no status bar |
| Home: the widget and icons scroll sideways, and the dock is a vertical bar on the right | Acceptable as a concept, but tighten it: iPhone home is portrait-only on most models, so it is fine to show the portrait layout rotated or to keep this one with iOS metrics |

---

## 3. App by app

Every app currently shows **iOS header + (chip strip) + Mac toolbar + Mac footer**. The common fix (T2 below) removes all of that. After that, each app needs the content-level corrections listed here.

| App | What's wrong now | What it should be on iPhone |
|---|---|---|
| **About Me** | "About Me" header, then the Overview/Experience/Skills/Awards chip strip, then an "Overview" toolbar with a Resume button: three bars. Visible Mac scrollbar | Large-title page ("About Me"), a segmented control or iOS tab bar at the bottom for the four sections, the Resume button in the nav bar's top-right, grouped inset lists for Currently / Previously / Education |
| **Projects** | Projects shown as **plain blue Mac folders**. The title appears three times (header, toolbar, sidebar). Detail view has two back buttons ("‹ Home" and "‹"). The detail hero is a folder icon. Footer says "1 project selected" | Large-title list of rich cards (cover image, name, category, one-line result), category filter as a segmented control or chips under the title. Tapping pushes a detail page with a hero image, highlights, a tech-stack chip row and "Open project" / "View in App Store" buttons; one back button |
| **Resume** | The PDF iframe is **blank (dark grey) on phones**, because mobile browsers don't render PDFs in iframes. Mac "Open / Download" pill buttons | Render page images (pre-exported PNGs or pdf.js) in a scrolling viewer like Quick Look. Share and Download in the nav bar |
| **GitHub** | The search field is cut off ("AbdulMunee…"), refresh icon floats, every event is a Mac table row | Large title, profile header (avatar, streak, repos), contribution graph, then an inset-grouped activity list |
| **Notes** | An empty grey chip strip, a "Notes" toolbar with a download button, and the body is a plain textarea | iOS Notes: a folder/notes list with a large title, then the note editor with yellow accents, "Done" and the compose button in the bottom toolbar |
| **Calculator** | A white "‹ Home / Calculator" header and a white status bar on top of a black app. Buttons are small, with dead space above the display | Full black screen, no header, iOS button size (~80 pt circles on 393 wide), display directly above the keypad |
| **Feedback** | Header "Feedback", then the toolbar "Feedback Assistant" plus a Mac segmented control | One nav bar titled "Feedback" with an iOS segmented control under it; form in inset-grouped sections; Submit in the nav bar |
| **Settings** | Mac panes reached through a horizontal chip strip (Accessibility / Appearance / Display…). The Appearance picker shows **Mac window thumbnails** | iOS Settings: a large-title grouped list (profile card at top, then rows with coloured squircle icons) that drills down into each pane. Appearance uses iPhone thumbnails |
| **App Store** | Mostly good (the best-adapted app). Still has the extra "‹ Home" header above it | Remove the header duplication; move Discover/Arcade/Create… to the iOS bottom tab bar (Today, Games, Apps, Search) |
| **Files** (`computer`) | Mac Finder: chip strip (Home/Portfolio/Documents/Appli…), back/forward arrows, grid/list toggle, plain blue folders, "6 items" footer | iOS Files: "Browse" large title, Locations list, folder grid with iOS folder art; bottom tab bar Recents / Shared / Browse |
| **Safari** | Already improved earlier (bottom toolbar). Still has the "‹ Home" header on top, the Mac start page and "Edit" button, and Mac copy ("this Mac") | Drop the header; iOS bottom address bar (pill) plus a toolbar with back, forward, share, bookmarks and tabs; start page as iOS (Favourites, Privacy Report, Reading List) |
| **Music** | Mac player in a scrolling page: small artwork, Mac slider, track list below | iOS Music: library list, a mini player above the tab bar, and a full-screen Now Playing sheet (large art, scrubber, transport, volume) |
| **Contact** | Mac Mail compose window with a "Send" pill and a footer bar | iOS Mail compose sheet: "Cancel" and the send arrow in the nav bar, To/Cc/Subject rows, body |
| **Terminal** | Works. Has the white header over a dark app; no on-screen key help | Dark nav bar, a row of quick-command chips above the keyboard (help, projects, about) |
| **Activity** (`task-manager`) | A Mac Activity Monitor table (App / Status columns) plus a stats footer | Inset-grouped list of open apps with an app-switcher-style card view, or simply remove it on phone and add a real **App Switcher** gesture (see T5) |
| **Recently Deleted** (`recycle`) | Fine empty state; Mac footer "0 items · Recently Deleted" | iOS empty state, no footer; better placed as a section in Files than as a home-screen app |
| **Games / installed mini apps** | Not audited one by one; they share the same Mac chrome | Covered by the shell fix; check each mini app at 393 wide after T2 |

---

## 4. Cross-cutting issues

- **Touch targets:** Mac toolbar buttons are 28–32 px and chip text is 12 px. The iOS minimum is 44×44 pt and body text is 17 pt.
- **Typography:** the font stack is `ui-sans-serif, system-ui`, which is SF on Apple devices but not elsewhere. Sizes are taken from macOS (13 px body), not iOS (17-pt body, 34-pt large title, 13-pt footnote).
- **Dark mode:** the phone always follows the in-app setting; check the status-bar and nav-bar colours in dark mode after T2.
- **Scrollbars:** Mac scrollbars are visible in About and GitHub. iOS shows thin overlay indicators only while scrolling.
- **Naming consistency:** one name per app across the home screen, Search, Activity, Settings and the tour (`lib/mobile-app-titles.ts` is only used in two places).
- **CSS structure:** the phone styles are one 550-line `@media` block that overrides Mac classes, plus `.desktop-only` / `.mobile-only` toggles. Move phone styles into their own file or section, keyed on `[data-device="phone"]` set from one JS hook. That also fixes R6.
- **Tests:** `scripts/test-macos.cjs` has no phone coverage. Add a 393×852 run (open each app, assert one nav bar, no horizontal overflow, status-bar colour).

---

## 5. TODO — work plan

Ordered so that each step makes the next one easier. ☐ = not started.

### Phase 0 — Foundation (do first; everything else depends on it)
- ☑ **T0.1** Create a single `usePhone()` hook (matchMedia, SSR-safe) and set `data-device="phone"` on `.mac-desktop`. Replace the duplicate `compact` maths in `window.tsx` and the `Tour` query. This fixes the first-render floating-window flash. — *done: `lib/phone.ts` (`usePhone`, `PHONE_QUERY`), used by window.tsx, Tour, banners and Search*
- ☑ **T0.2** Write iOS design tokens: status bar 54, island 126×37, nav bar 44 + large title 52, tab bar 49, home-indicator safe area 34, icon 60, label 12, body 17, radii, glass materials (light/dark). — *done: `--ios-*` tokens in globals.css*
- ☑ **T0.3** Move the phone CSS out of the giant media query into its own section keyed on `[data-device="phone"]`, and delete the `!important` overrides as each app is redone. — *partly: the phone CSS is one rewritten section; it stays an @media query (not a data attribute) so it applies before hydration*

### Phase 1 — iOS app shell (fixes R1–R3 and R7 for every app at once)
- ☑ **T1.1** `PhoneAppShell`: status bar coloured per app, **one** nav bar (back / large title / trailing actions), optional bottom tab bar, safe areas. It replaces `ios-app-header`, and the Mac toolbar, sidebar and footer are hidden on phone. — *done: one bar per app (the app toolbar restyled as a large-title bar with iOS 26 glass buttons), status bar coloured per app, Mac footer/scrollbars hidden*
- ☑ **T1.2** Apps declare their phone chrome: title, tabs, trailing actions and dark/light bar, via a small `phone` field in the app registry or a hook inside each app. — *done: `PHONE_APPS` in lib/phone.ts (title, icon, dark, sidebar = tabs/chips/hidden)*
- ☑ **T1.3** Open/close motion: zoom from the icon rect to full screen, and back into the icon on Home (spring, ~0.4 s, honours Reduce Motion). — *done: apps zoom out of the tapped icon and back into it*
- ☑ **T1.4** Gestures (done: swipe up = Home, swipe up and hold = App Switcher, left-edge swipe = Back, pull down top-right = Control Center; Search opens from the pill): swipe up on the home indicator goes Home; swipe up and hold opens the App Switcher (T5); left-edge swipe goes back inside an app; pull down top-right opens Control Center; pull down mid-screen opens Search.

### Phase 2 — Home screen (the main page)
- ☑ **T2.1** Replace all home and dock icons with real iOS 18 icons (Files, Safari, Notes, Settings, Mail, Music, App Store, Calculator), plus proper squircle icons for About, Projects, Resume, Feedback and GitHub. All icons full-bleed. — *done: real iOS 26 artwork (macOS 26 system icons + official App Store artwork for Files, GitHub, LinkedIn, Pages, Xcode) in public/icons/ios*
- ☑ **T2.2** Grid at iOS metrics (60-pt icons, 12-pt labels, 4 columns, iOS row pitch) on 375 / 393 / 430 widths.
- ☑ **T2.3** (medium widget; a second small widget was skipped: page 1 has no free two-row space without scrolling) Real iOS medium profile widget (338×158), plus one small live widget (GitHub or Now Playing) to fill page 1.
- ☑ **T2.4** Dock and Search pill at iOS size and material; remove the pink tint.
- ☑ **T2.5** (iOS folder icon and panel; LinkedIn moved to the Home Screen, Utilities = Terminal, Activity, Recently Deleted) Folders: 3×3 mini-grid icon; open folder is a 3-column panel with its title above, closed by tapping outside. Regroup the Utilities contents.
- ☑ **T2.6** Welcome notification with phone copy and iOS banner metrics; swipe to dismiss. — *done: banners drop from under the island, swipe up to dismiss, phone copy*

### Phase 3 — System screens
- ☑ **T3.1** Lock screen: correct status icons, one clock format, remove the battery line, add flashlight/camera buttons, interactive swipe-up. — *done: iPhone status bar with island, big clock, a waiting notification, flashlight/camera buttons, slides up and follows the finger*
- ☑ **T3.2** Control Center, iOS 18 style (modules as listed in 2.4), opened by pull-down. — *done: blurred full screen with connectivity, Now Playing, Focus, tall Brightness/Volume sliders and round buttons; opens by tap or pull-down top-right, closes by tapping outside or swiping up*
- ☑ **T3.3** iOS Search screen with phone app names and Top Hit / Apps sections. — *done: field at the top with Cancel, Siri Suggestions, Top Hit and Apps; finds iPhone names; Return opens the top hit*
- ☑ **T3.4** PhoneTour as an iOS onboarding sheet with phone copy for all steps. — *done: an iOS "Welcome" sheet (large title, four features with their app icons, "Meet Muneeb" button, pull down to dismiss) shown on a phone's first visit instead of the banner; the tour button was hidden on phones, so the old card tour was unreachable*
- ☑ **T3.5** Landscape: hide the status bar, compact nav bar, tidy the home layout. — *done in the shell work: no status bar inside apps, one compact bar, sideways Home Screen with the Dock on the right*

### Phase 4 — Apps (each one on the new shell; order = visitor importance)
- ☑ **T4.1** About Me: large title, segmented sections, inset-grouped facts, Resume in the nav bar. — *done through the shell: large title with Resume in the bar, and an iOS 26 tab bar for Overview/Experience/Skills/Awards*
- ☑ **T4.2** Projects: card list with images, filter chips, pushed detail page, one back button. — *done: card list with each project's icon, App Store–style detail page, one back button*
- ☑ **T4.3** Resume: render page images instead of the PDF iframe; Share/Download in the nav bar. — *done: pages pre-rendered to public/resume/*.webp (re-export when the PDF changes); Download/Share in the bar; also used on desktop when a PDF can't embed*
- ☑ **T4.4** Contact: iOS Mail compose sheet. — *done: one bar with a round send arrow, call/mail/LinkedIn/GitHub actions, 17pt fields*
- ☑ **T4.5** GitHub: profile header, contribution graph, grouped activity list. — *done: avatar + Repos/Stars/Pushes header, activity and repositories in inset groups (no contribution graph yet)*
- ☑ **T4.6** Settings: iOS grouped list with drill-down panes; iPhone appearance thumbnails. — *done: iOS grouped list (profile card, search, groups with chevrons) opening one page at a time; Appearance still shows Mac thumbnails*
- ☑ **T4.7** Safari: remove the extra header; iOS bottom address pill; iOS start page copy. — *done through the shell: no extra header, bottom toolbar; "this Mac" copy is left for T5.2*
- ☑ **T4.8** Music: library, mini player, full-screen Now Playing. — *done as a restyle: Now Playing screen tinted from the artwork, large controls, track list below (no separate mini player yet)*
- ☑ **T4.9** Files: Browse / Locations, iOS folder art, bottom tabs. — *done: Browse list (Favorites, Locations → On My iPhone) opening one folder at a time; Back returns to Browse*
- ☑ **T4.10** Calculator: full black, no header, iOS key sizes. — *done: black, no header, 80pt keys, iOS colours and display size*
- ☑ **T4.11** Notes: list view and editor in iOS Notes style. — *partly: iOS Notes paper (17pt, yellow tint); no separate notes list, since the app holds a single note*
- ☑ **T4.12** Feedback: one nav bar, iOS segmented control, grouped form. — *done: one bar titled "Feedback" with the segmented control under it*
- ☑ **T4.13** App Store: remove header duplication; Today / Games / Apps / Search tab bar. — *done: floating Today / Arcade / Apps / Updates / Search tab bar with the update badge*
- ☑ **T4.14** Terminal: dark bars, quick-command chips. — *done: quick-command buttons above the home bar; input at 16px*
- ☑ **T4.15** Activity → replace it with the App Switcher; move Recently Deleted into Files. — *done: the App Switcher replaces Activity on phones (marked `macOnly`, so it is off the Home Screen and out of Search; the Mac keeps it). Recently Deleted stays in the Utilities folder next to Terminal*
- ☑ **T4.16** Pass over every installed mini app at 393 wide. — *done: all 14 checked at 393 wide; fixed 2048 row heights, Typing Test header, Sketch canvas position, keyboard-only copy in Breakout/Snake, "Mac" in Tic-Tac-Toe*

### Phase 5 — Polish and guard rails
- ☑ **T5.1** App Switcher (swipe up and hold): horizontally scrolling app cards, swipe a card up to close it. — *done: swipe up and hold on the home bar; live app cards (newest in the middle), drag sideways, swipe a card up to quit, tap to open, tap outside for Home*
- ☑ **T5.2** Remove desktop copy on phone (⌘K, "this Mac", drag/right-click hints) and unify app names. — *done: Safari says "this iPhone"; App Store copy no longer mentions arrow keys, right-click or "this Mac"; App Store and Activity use the Home Screen names (Files, Settings, Activity…) on phones via `useAppName`*
- ☑ **T5.3** Touch targets ≥ 44 pt, iOS type scale, overlay scrollbars. — *done: text fields ≥16px (no zoom on tap); nav-bar glass buttons 44pt; every icon button, button and Feedback star ≥44pt; sliders 28pt tall. Measured on every app at 393×852: nothing tappable under 44pt*
- ☑ **T5.4** Dark-mode pass on every phone screen. — *done: Home, Resume, Files, GitHub, Contact, App Store, Settings, Projects, Music checked in dark mode*
- ☑ **T5.5** Add phone tests to `scripts/test-macos.cjs` (393×852): one nav bar per app, no horizontal overflow, status-bar colour, gestures. — *done: tests that the CSS phone breakpoint matches lib/phone.ts, App Switcher layout, and every phone icon/app setting*

**Suggested first sprint:** Phase 0 + T1.1/T1.2 (the shell) + T2.1–T2.4 (home screen). That removes the "Mac squeezed into a phone" look from every screen at once, and the app-by-app work after that is content-only.
