import { APP_REGISTRY, getApp, isAppInstalled } from "../app-registry";
import { notify } from "../notifications";
import { useWindowManager } from "../window-manager";
import { useInstalledApps } from "./installed";

export const INSTALL_MS = 1600;

// Get: shows download progress, then installs the app and posts a banner
// (unless `quiet`). Resolves once the app is installed.
export function installApp(
  appId: string,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<void> {
  const app = getApp(appId);
  const store = useInstalledApps.getState();
  if (!app?.installable || isAppInstalled(appId)) return Promise.resolve();
  if (store.installing[appId] !== undefined) return Promise.resolve();

  return new Promise((resolve) => {
    // The store only changes at the start and the end; the ring in between
    // is a CSS animation (GetButton).
    store.setInstalling(appId, Date.now());
    setTimeout(() => {
      const state = useInstalledApps.getState();
      state.setInstalling(appId, null);
      state.setInstalled(appId, true);
      if (!quiet)
        notify({
          appId,
          title: `${app.title} installed`,
          body: "Open it from the App Store, Finder, Spotlight or the Dock.",
        });
      resolve();
    }, INSTALL_MS);
  });
}

// Removes an installable app and quits its windows.
export function uninstallApp(appId: string) {
  const app = getApp(appId);
  if (!app?.installable) return;
  const wm = useWindowManager.getState();
  for (const w of wm.windows)
    if ((w.appId ?? w.id) === appId) wm.closeWindow(w.id);
  useInstalledApps.getState().setInstalled(appId, false);
}

// Account › Redeem Gift Card. Returns the redeemed app ids, or null for an
// unknown code.
const GAME_IDS = [
  "game-2048",
  "tic-tac-toe",
  "memory",
  "breakout",
  "word-guess",
  "simon",
  "snake",
  "minesweeper",
];
export const PROMO_CODES: Record<string, () => string[]> = {
  ARCADE: () => GAME_IDS,
  HIREME: () =>
    APP_REGISTRY.filter((app) => app.installable).map((app) => app.id),
};

export function redeemCode(code: string): string[] | null {
  const ids = PROMO_CODES[code.trim().toUpperCase()]?.();
  if (!ids) return null;
  const pending = ids.filter((id) => !isAppInstalled(id));
  void Promise.all(pending.map((id) => installApp(id, { quiet: true }))).then(
    () =>
      pending.length &&
      notify({
        appId: "app-store",
        title: `${pending.length} apps installed`,
        body: "Find them in Finder › Applications, Spotlight and the Dock.",
      }),
  );
  return ids;
}
