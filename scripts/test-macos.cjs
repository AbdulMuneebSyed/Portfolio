const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");

// Load the TypeScript stores without a browser or an additional test dependency.
const cache = new Map();
function load(relative) {
  const filename = path.resolve(__dirname, "..", relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = createRequire(filename);
  const requireTS = (name) => {
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(path.relative(path.resolve(__dirname, ".."), path.resolve(path.dirname(filename), `${name}.ts`)));
    return localRequire(name);
  };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "module", "exports", code)(requireTS, module, module.exports);
  return module.exports;
}
const storage = new Map();
global.window = { innerWidth: 1280, innerHeight: 800 };
global.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const { useWindowManager: wm } = load("lib/window-manager.ts");
const { useSystemControls: controls } = load("lib/system-controls.ts");
const { launchApp, MENU_BAR_HEIGHT, DOCK_RESERVED_HEIGHT } = load("lib/launch-app.ts");
const initialWindows = wm.getState();
const initialControls = controls.getState();

test.beforeEach(() => {
  storage.clear();
  wm.setState(initialWindows, true);
  controls.setState(initialControls, true);
  window.innerWidth = 1280;
  window.innerHeight = 800;
});

test("minimize and close focus the next visible window; Dock restoration raises it", () => {
  launchApp("about"); launchApp("projects");
  wm.getState().minimizeWindow("projects");
  assert.equal(wm.getState().activeWindowId, "about");
  wm.getState().restoreWindow("projects");
  assert.equal(wm.getState().activeWindowId, "projects");
  assert.equal(wm.getState().windows.filter((w) => w.isActive).length, 1);
  wm.getState().closeWindow("projects");
  assert.equal(wm.getState().activeWindowId, "about");
  wm.getState().closeWindow("about");
  assert.equal(wm.getState().activeWindowId, null);
});

test("closing a background window preserves the front window", () => {
  launchApp("about"); launchApp("projects"); launchApp("settings");
  wm.getState().closeWindow("about");
  assert.equal(wm.getState().activeWindowId, "settings");
  assert.equal(wm.getState().windows.find((w) => w.id === "settings").isActive, true);
});

test("reopening Settings updates its section without duplicating the window", () => {
  launchApp("settings", { section: "appearance" });
  wm.getState().minimizeWindow("settings");
  launchApp("settings", { section: "keyboard" });
  assert.equal(wm.getState().windows.length, 1);
  assert.deepEqual(wm.getState().windows[0].metadata, { section: "keyboard" });
  assert.equal(wm.getState().windows[0].isMinimized, false);
});

test("appearance, sound, and accessibility preferences persist and ranges clamp", () => {
  controls.getState().setDarkMode(true);
  controls.getState().setReduceMotion(true);
  controls.getState().setSystemSounds(true);
  controls.getState().setBrightness(-1);
  controls.getState().setVolume(2);
  controls.setState(initialControls, true);
  controls.getState().loadControls();
  assert.equal(controls.getState().darkMode, true);
  assert.equal(controls.getState().reduceMotion, true);
  assert.equal(controls.getState().systemSounds, true);
  assert.equal(controls.getState().brightness, 0.3);
  assert.equal(controls.getState().volume, 1);
});

test("window geometry, wallpaper, and minimized state survive a reload", () => {
  launchApp("computer");
  wm.getState().updateWindowPosition("computer", { x: 80, y: 60 });
  wm.getState().updateWindowSize("computer", { width: 650, height: 450 });
  wm.getState().setWallpaper("linear-gradient(red, blue)");
  wm.getState().minimizeWindow("computer");
  wm.setState(initialWindows, true);
  wm.getState().loadState();
  assert.deepEqual(wm.getState().windows[0].position, { x: 80, y: 60 });
  assert.deepEqual(wm.getState().windows[0].size, { width: 650, height: 450 });
  assert.equal(wm.getState().windows[0].isMinimized, true);
  assert.equal(wm.getState().wallpaper, "linear-gradient(red, blue)");
});

test("cascaded app launches fit a phone viewport and reserve the Dock", () => {
  window.innerWidth = 390; window.innerHeight = 844;
  for (const app of ["about", "projects", "settings", "computer", "notes", "music"]) launchApp(app);
  for (const w of wm.getState().windows) {
    assert.ok(w.position.x >= 0 && w.position.x + w.size.width <= window.innerWidth);
    assert.ok(w.position.y >= MENU_BAR_HEIGHT);
    assert.ok(w.position.y + w.size.height <= window.innerHeight - DOCK_RESERVED_HEIGHT);
  }
});

test("every app name and alias resolves to exactly one app", () => {
  const { APP_REGISTRY, findAppByAlias } = load("lib/app-registry.ts");
  const owners = new Map();
  for (const app of APP_REGISTRY)
    for (const name of [app.id, app.title, ...(app.launchAliases ?? [])]) {
      const key = name.toLowerCase();
      assert.ok(!owners.has(key) || owners.get(key) === app.id, `"${name}" is used by ${owners.get(key)} and ${app.id}`);
      owners.set(key, app.id);
    }
  assert.equal(findAppByAlias("activity").id, "task-manager");
});

test("saved windows of apps removed from the registry are dropped on load", () => {
  storage.set("muneebos-mac-state-v2", JSON.stringify({
    windows: [
      { id: "projects-pro", appId: "projects-pro", component: "ProjectsExplorerPro", position: { x: 0, y: 40 }, size: { width: 400, height: 300 } },
      { id: "about", appId: "about", component: "AboutWindow", position: { x: 0, y: 40 }, size: { width: 400, height: 300 } },
    ],
  }));
  wm.getState().loadState();
  assert.deepEqual(wm.getState().windows.map((w) => w.id), ["about"]);
});

test("Mission Control gives every window its own slot inside the area", () => {
  const { missionLayout } = load("lib/mission-control.ts");
  const area = { x: 40, y: 70, width: 1200, height: 600 };
  for (const count of [1, 2, 3, 5, 9]) {
    const slots = missionLayout(count, area);
    assert.equal(slots.length, count);
    const centres = new Set(slots.map((s) => `${s.cx},${s.cy}`));
    assert.equal(centres.size, count);
    for (const s of slots) {
      assert.ok(s.cx - s.maxWidth / 2 >= area.x && s.cx + s.maxWidth / 2 <= area.x + area.width);
      assert.ok(s.cy - s.maxHeight / 2 >= area.y && s.cy + s.maxHeight / 2 <= area.y + area.height);
    }
  }
});

test("notification banners show, cap at three, and are silenced by Focus", () => {
  const { useNotifications, notify } = load("lib/notifications.ts");
  useNotifications.setState({ banners: [] });
  for (let i = 0; i < 4; i++) notify({ appId: "about", title: `n${i}`, body: "" });
  assert.deepEqual(useNotifications.getState().banners.map((b) => b.title), ["n3", "n2", "n1"]);
  useNotifications.setState({ banners: [] });
  controls.setState({ focusOn: true });
  notify({ appId: "about", title: "quiet", body: "" });
  assert.equal(useNotifications.getState().banners.length, 0);
  // Focus skips the banner, but the notification still waits unread.
  assert.equal(useNotifications.getState().notices[0].title, "quiet");
});

test("unread notifications persist until opened or cleared", () => {
  const { useNotifications, notify } = load("lib/notifications.ts");
  useNotifications.setState({ banners: [], notices: [] });
  notify({ appId: "github-activity", title: "GitHub", body: "a" });
  notify({ appId: "linkedin", title: "LinkedIn", body: "b" });
  const [linkedin, github] = useNotifications.getState().notices;
  // A banner timing out leaves the notice unread.
  useNotifications.getState().dismiss(linkedin.id);
  assert.equal(useNotifications.getState().notices.length, 2);
  // Reloading the page brings them back.
  useNotifications.setState({ notices: [] });
  useNotifications.getState().loadNotifications();
  assert.deepEqual(useNotifications.getState().notices.map((n) => n.title), ["LinkedIn", "GitHub"]);
  // Opening one removes it everywhere; Clear All removes the rest.
  useNotifications.getState().remove(github.id);
  assert.deepEqual(useNotifications.getState().notices.map((n) => n.id), [linkedin.id]);
  useNotifications.getState().clearAll();
  useNotifications.getState().loadNotifications();
  assert.equal(useNotifications.getState().notices.length, 0);
});

test("notification times read like macOS", () => {
  const { timeAgo } = load("lib/notifications.ts");
  const now = new Date(2026, 9, 8, 15, 0).getTime();
  assert.equal(timeAgo(now - 20_000, now), "now");
  assert.equal(timeAgo(now - 5 * 60_000, now), "5m ago");
  assert.equal(timeAgo(now - 3 * 3_600_000, now), "3h ago");
  assert.equal(timeAgo(new Date(2026, 9, 7, 22, 0).getTime(), now), "Yesterday");
});

test("the feed goes LinkedIn/GitHub/resume first and skips seen or open apps", () => {
  const { pickNext, feedBody, FEED } = load("lib/notification-feed.ts");
  const first = pickNext(new Set(), new Set(), () => 0);
  assert.equal(first.tier, 1);
  const tierOne = FEED.filter((item) => item.tier === 1).map((item) => item.id);
  // Seen everything in tier 1: the next comes from tier 2.
  assert.equal(pickNext(new Set(tierOne), new Set()).tier, 2);
  // An app the visitor already has open isn't nudged.
  for (let i = 0; i < 20; i++)
    assert.notEqual(pickNext(new Set(), new Set(["linkedin"])).appId, "linkedin");
  // Run out entirely: nothing more to send.
  assert.equal(pickNext(new Set(FEED.map((item) => item.id)), new Set()), null);
  // Muneeb's local time is in the Hyderabad notification.
  const hyd = FEED.find((item) => item.id === "hyderabad-time");
  assert.match(feedBody(hyd, new Date("2026-10-08T20:44:00Z")), /2:14 AM in Hyderabad/);
});

test("Finder labels wrap to two lines and shorten the second in the middle", () => {
  const { finderNameLines } = load("lib/finder-name.ts");
  const measure = (text) => text.length * 6; // 6px per character
  assert.deepEqual(finderNameLines("AiResumate", 100, measure), ["AiResumate"]);
  assert.deepEqual(finderNameLines("package-lock.json", 60, measure), ["package-", "lock.json"]);
  const lines = finderNameLines("E-Cell MJCET Hackathon Platform", 60, measure);
  assert.equal(lines.length, 2);
  assert.equal(lines[0], "E-Cell");
  assert.match(lines[1], /^MJC.*….*form$/);
  assert.ok(lines[1].length * 6 <= 60);
});

test("Safari's Smart Search field opens sites and searches everything else", () => {
  const { resolveAddress, hostLabel, searchQuery, START_PAGE } = load("lib/safari-url.ts");
  assert.equal(resolveAddress("apple.com"), "https://apple.com/");
  assert.equal(resolveAddress("http://example.org/a"), "http://example.org/a");
  assert.equal(resolveAddress("localhost:3000"), "https://localhost:3000/");
  assert.equal(searchQuery(resolveAddress("next.js app router")), "next.js app router");
  assert.equal(searchQuery(resolveAddress("hello")), "hello");
  assert.equal(resolveAddress("   "), null);
  assert.equal(resolveAddress(START_PAGE), START_PAGE);
  assert.equal(hostLabel("https://www.github.com/x"), "github.com");
});

// ---------- App Store ----------
const { useInstalledApps: installed } = load("lib/app-store/installed.ts");
const registry = load("lib/app-registry.ts");
const resetInstalls = () =>
  installed.setState({ overrides: {}, updatedTo: null, progress: {}, loaded: false });

test("store-only apps start uninstalled; Get and Delete persist across a reload", () => {
  resetInstalls();
  const ids = () => registry.getLaunchableApps().map((app) => app.id);
  assert.ok(!ids().includes("game-2048"));
  assert.ok(!ids().includes("snake"));
  assert.ok(ids().includes("about"));
  assert.equal(registry.isAppInstalled("about"), true);

  installed.getState().setInstalled("game-2048", true);
  assert.ok(ids().includes("game-2048"));
  installed.setState({ overrides: {}, loaded: false });
  assert.equal(registry.isAppInstalled("game-2048"), true, "restored from storage");

  installed.getState().setInstalled("game-2048", false);
  installed.setState({ overrides: {}, loaded: false });
  assert.equal(registry.isAppInstalled("game-2048"), false);
});

test("opening an uninstalled app shows its App Store page instead", () => {
  resetInstalls();
  launchApp("breakout");
  const windows = wm.getState().windows;
  assert.deepEqual(windows.map((w) => w.id), ["app-store"]);
  assert.deepEqual(windows[0].metadata.route, { kind: "product", id: "breakout" });
});

test("Get installs after the progress animation; Delete quits the app", async () => {
  resetInstalls();
  const { installApp, uninstallApp } = load("lib/app-store/actions.ts");
  const done = installApp("simon");
  assert.equal(installed.getState().progress.simon, 0);
  await done;
  assert.equal(installed.getState().progress.simon, undefined);
  assert.equal(registry.isAppInstalled("simon"), true);
  launchApp("simon");
  assert.ok(wm.getState().windows.some((w) => w.id === "simon"));
  uninstallApp("simon");
  assert.equal(registry.isAppInstalled("simon"), false);
  assert.ok(!wm.getState().windows.some((w) => w.id === "simon"));
});

test("saved windows of uninstalled apps are dropped on load", () => {
  resetInstalls();
  storage.set("muneebos-mac-state-v2", JSON.stringify({
    windows: [
      { id: "memory", appId: "memory", component: "MemoryGame", position: { x: 0, y: 40 }, size: { width: 400, height: 300 } },
      { id: "about", appId: "about", component: "AboutWindow", position: { x: 0, y: 40 }, size: { width: 400, height: 300 } },
    ],
  }));
  wm.getState().loadState();
  assert.deepEqual(wm.getState().windows.map((w) => w.id), ["about"]);
});

test("every App Store reference points at a real item and app", () => {
  const { STORE_ITEMS, getStoreItem } = load("lib/app-store/catalog.ts");
  const { EDITORIAL } = load("lib/app-store/editorial.ts");
  for (const [tab, sections] of Object.entries(EDITORIAL)) {
    for (const section of sections) {
      const ids = [
        ...(section.itemIds ?? []),
        ...[section.feature, ...(section.cards ?? []), ...(section.stories ?? [])]
          .filter(Boolean)
          .flatMap((f) => [f.itemId, f.art.iconId].filter(Boolean)),
      ];
      for (const id of ids) assert.ok(getStoreItem(id), `${tab}: ${id}`);
    }
  }
  for (const item of STORE_ITEMS) {
    if (item.appId) assert.ok(registry.getApp(item.appId), item.id);
    for (const slide of item.slides)
      if (slide.live) assert.ok(registry.getApp(slide.live), `${item.id} slide ${slide.live}`);
  }
  // Every installable app is in the store.
  for (const app of registry.APP_REGISTRY.filter((a) => a.installable))
    assert.ok(getStoreItem(app.id), app.id);
  assert.equal(new Set(STORE_ITEMS.map((i) => i.id)).size, STORE_ITEMS.length, "unique ids");
});

test("store search ranks names first; skills match whole technology names", () => {
  const { searchStore, projectsUsing } = load("lib/app-store/catalog.ts");
  assert.equal(searchStore("word")[0].id, "word-guess");
  assert.ok(searchStore("mongodb").some((i) => i.id === "arrwin"));
  assert.deepEqual(searchStore("   "), []);
  assert.deepEqual(projectsUsing("C"), []);
  assert.ok(projectsUsing("Next.js").length >= 3);
  assert.ok(projectsUsing("Tailwind CSS").some((i) => i.id === "ecell"));
});

test("gift codes install a set of apps; unknown codes are rejected", async () => {
  resetInstalls();
  const { redeemCode } = load("lib/app-store/actions.ts");
  assert.equal(redeemCode("nope"), null);
  const ids = redeemCode(" arcade ");
  assert.ok(ids.includes("snake") && ids.includes("game-2048"));
  await new Promise((r) => setTimeout(r, 1800));
  for (const id of ids) assert.equal(registry.isAppInstalled(id), true, id);
});

test("2048 merges each pair once and only counts real moves", () => {
  const { slideRow, move } = load("lib/games/game-2048.ts");
  assert.deepEqual(slideRow([2, 2, 2, 2]), { row: [4, 4, 0, 0], gained: 8 });
  assert.deepEqual(slideRow([0, 4, 4, 8]).row, [8, 8, 0, 0]);
  assert.deepEqual(slideRow([2, 0, 0, 2]).row, [4, 0, 0, 0]);
  const board = [2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.equal(move(board, "left").moved, false);
  const up = move(board, "up");
  assert.equal(up.board[0], 4);
  assert.equal(up.gained, 4);
});

test("the tic-tac-toe computer wins when it can and blocks when it must", () => {
  const { bestMove, winner } = load("lib/games/tic-tac-toe.ts");
  // O can win at 2.
  assert.equal(bestMove(["O", "O", null, "X", "X", null, null, null, null], "O"), 2);
  // X threatens 0-1-2; O must block at 2.
  assert.equal(bestMove(["X", "X", null, null, "O", null, null, null, null], "O"), 2);
  assert.deepEqual(winner(["X", "X", "X", null, null, null, null, null, null]).line, [0, 1, 2]);
});

test("Word Guess marks repeated letters only as often as the answer has them", () => {
  const { scoreGuess, WORDS } = load("lib/games/word-guess.ts");
  assert.deepEqual(scoreGuess("REACT", "REACT"), Array(5).fill("correct"));
  assert.deepEqual(scoreGuess("ERROR", "REDIS"), ["present", "present", "absent", "absent", "absent"]);
  assert.ok(WORDS.every((w) => /^[A-Z]{5}$/.test(w)));
});

test("JSON errors report a line and column; colours report WCAG contrast", () => {
  const { parseJson } = load("lib/games/json.ts");
  const bad = parseJson('{\n  "a": 1,\n  "b": }');
  assert.equal(bad.ok, false);
  assert.equal(bad.line, 3);
  assert.equal(parseJson('{"a":[1,2]}').ok, true);
  const { contrastRatio, hexToRgb, wcagLevel, rgbToHex } = load("lib/games/color.ts");
  const ratio = contrastRatio(hexToRgb("#000"), hexToRgb("#fff"));
  assert.equal(Math.round(ratio), 21);
  assert.equal(wcagLevel(ratio), "AAA");
  assert.equal(rgbToHex(hexToRgb("#0A84FF")), "#0a84ff");
});

test("every project has an App Store page; the offered update matches MuneebOS's newest version", () => {
  const { getStoreItem, MUNEEBOS_VERSION } = load("lib/app-store/catalog.ts");
  const { projects } = load("lib/portfolio-data.ts");
  for (const p of projects) assert.equal(getStoreItem(p.id)?.kind, "project", p.id);
  assert.equal(getStoreItem("muneebos").versions[0].version, MUNEEBOS_VERSION);
});

test("a two-finger swipe is reported once; mouse-wheel notches and sideways drift are not", () => {
  const { createSwipeDetector } = load("lib/trackpad-swipe.ts");
  const feed = (detect, samples, start = 0) =>
    samples.map((s, i) => detect({ deltaMode: 0, deltaX: 0, deltaY: 0, time: start + i * 16, ...s })).filter(Boolean);
  // Fingers up (natural scrolling): many small positive deltaY, then momentum.
  let detect = createSwipeDetector();
  assert.deepEqual(feed(detect, Array(30).fill({ deltaY: 12 })), ["up"]);
  // A new gesture after a pause is reported again.
  assert.deepEqual(feed(detect, Array(20).fill({ deltaY: -14 }), 5000), ["down"]);
  // One mouse-wheel notch, or line-mode scrolling, does nothing.
  detect = createSwipeDetector();
  assert.deepEqual(feed(detect, [{ deltaY: 120 }]), []);
  assert.deepEqual(feed(detect, Array(10).fill({ deltaY: 40, deltaMode: 1 }), 1000), []);
  // Mostly diagonal movement is ambiguous and ignored; clear sideways is left/right.
  detect = createSwipeDetector();
  assert.deepEqual(feed(detect, Array(20).fill({ deltaY: 10, deltaX: 9 })), []);
  assert.deepEqual(feed(detect, Array(20).fill({ deltaX: -15 }), 5000), ["right"]);
});

// ---------- Desktops (Spaces), folders and Trash ----------
test("new windows open on the current desktop; activating one elsewhere switches there", () => {
  const s = () => wm.getState();
  const a = s().addSpace();
  launchApp("about");
  s().switchSpace(a);
  launchApp("contact");
  assert.equal(s().windows.find((w) => w.id === "contact").spaceId, a);
  assert.equal(s().activeWindowId, "contact");
  s().restoreWindow("about");
  assert.equal(s().activeSpaceId, "space-1");
  s().switchSpace(a);
  assert.equal(s().activeWindowId, "contact", "the desktop's front window becomes active");
});

test("removing a desktop moves its windows and files to its neighbour; at most six", () => {
  const s = () => wm.getState();
  const two = s().addSpace();
  s().switchSpace(two);
  launchApp("contact");
  const folder = s().createFolder();
  s().removeSpace(two);
  assert.deepEqual(s().spaces, ["space-1"]);
  assert.equal(s().activeSpaceId, "space-1");
  assert.equal(s().windows.find((w) => w.id === "contact").spaceId, "space-1");
  assert.equal(s().desktopIcons.find((i) => i.id === folder).spaceId, "space-1");
  s().removeSpace("space-1");
  assert.deepEqual(s().spaces, ["space-1"], "the last desktop can't be removed");
  for (let i = 0; i < 10; i++) s().addSpace();
  assert.equal(s().spaces.length, 6);
});

test("folders get unique names, rename safely, and go to the Trash and back", () => {
  const s = () => wm.getState();
  const a = s().createFolder();
  const b = s().createFolder();
  const title = (id) => s().desktopIcons.find((i) => i.id === id)?.title;
  assert.equal(title(a), "untitled folder");
  assert.equal(title(b), "untitled folder 2");
  assert.equal(s().renamingIconId, b, "a new folder starts in rename mode");
  s().renameIcon(b, "  Designs  ");
  assert.equal(title(b), "Designs");
  s().renameIcon(a, "Designs");
  assert.equal(title(a), "Designs 2");
  s().renameIcon(a, "   ");
  assert.equal(title(a), "Designs 2", "a blank name is ignored");
  // Folders on the same desktop never share a grid cell.
  const pa = s().desktopIcons.find((i) => i.id === a).position;
  const pb = s().desktopIcons.find((i) => i.id === b).position;
  assert.notDeepEqual(pa, pb);

  s().trashIcons([a, "about"]);
  assert.ok(!s().desktopIcons.some((i) => i.id === a));
  assert.ok(s().desktopIcons.some((i) => i.id === "about"), "portfolio files can't be trashed");
  assert.deepEqual(s().trash.map((i) => i.id), [a]);
  s().putBack([a]);
  assert.ok(s().desktopIcons.some((i) => i.id === a));
  s().trashIcons([a]);
  s().emptyTrash();
  assert.deepEqual(s().trash, []);
});

test("files move between desktops and everything survives a reload", () => {
  const s = () => wm.getState();
  const two = s().addSpace();
  const folder = s().createFolder();
  s().moveIconsToSpace([folder, "resume"], two);
  launchApp("about");
  s().moveWindowToSpace("about", two);
  s().switchSpace(two);
  wm.setState(initialWindows, true);
  s().loadState();
  assert.deepEqual(s().spaces, ["space-1", two]);
  assert.equal(s().activeSpaceId, two);
  assert.equal(s().desktopIcons.find((i) => i.id === folder).spaceId, two);
  assert.equal(s().desktopIcons.find((i) => i.id === "resume").spaceId, two);
  assert.equal(s().windows.find((w) => w.id === "about").spaceId, two);
});

test("every iPhone app setting names a real app, and every iOS icon file exists", () => {
  const { PHONE_APPS, phoneTitle } = load("lib/phone.ts");
  const { getApp } = load("lib/app-registry.ts");
  for (const [id, spec] of Object.entries(PHONE_APPS)) {
    assert.ok(getApp(id), `${id} is not in the app registry`);
    if (spec.icon)
      assert.ok(
        fs.existsSync(path.resolve(__dirname, "..", "public/icons/ios", `${spec.icon}.png`)),
        `missing icon ${spec.icon}.png`,
      );
  }
  assert.equal(phoneTitle("computer", "Finder"), "Files");
  assert.equal(phoneTitle("about", "About Me"), "About Me");
});

test("the phone breakpoint in lib/phone.ts matches every iPhone @media rule in the CSS", () => {
  const { PHONE_QUERY } = load("lib/phone.ts");
  const css = ["app/globals.css", "app/app-store.css"]
    .map((file) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"))
    .join("\n");
  assert.ok(css.includes(`@media ${PHONE_QUERY} {`), "globals.css has no rule for PHONE_QUERY");
});

test("the App Switcher puts the newest app in the middle and older ones to its left", () => {
  const { switcherSlots } = load("lib/phone.ts");
  const slots = switcherSlots(3, 393, 852, 0);
  assert.equal(slots[2].cx, 393 / 2);
  assert.ok(slots[1].cx < slots[2].cx && slots[0].cx < slots[1].cx);
  // Cards never overlap: spacing is wider than a card.
  assert.ok(slots[2].cx - slots[1].cx > slots[2].maxWidth);
  // Dragging shifts every card by the same amount.
  const panned = switcherSlots(3, 393, 852, 120);
  panned.forEach((slot, i) => assert.equal(slot.cx - slots[i].cx, 120));
});
