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
});
