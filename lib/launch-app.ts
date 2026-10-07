import { getApp, isAppInstalled } from "./app-registry";
import { useWindowManager } from "./window-manager";

export const MENU_BAR_HEIGHT = 24;
export const DOCK_RESERVED_HEIGHT = 88;
const CASCADE_STEP = 26;

// The single way to open a registry app, used by the Dock, desktop files,
// Spotlight, menus, and Terminal.
export function launchApp(appId: string, metadata?: Record<string, unknown>) {
  const app = getApp(appId);
  if (!app) return;

  // An app the visitor hasn't installed opens on its App Store page.
  if (!isAppInstalled(appId)) {
    openInAppStore(appId);
    return;
  }

  if (app.externalUrl) {
    window.open(app.externalUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const { windows, openWindow } = useWindowManager.getState();
  const usableHeight =
    window.innerHeight - MENU_BAR_HEIGHT - DOCK_RESERVED_HEIGHT;
  const width = Math.min(app.defaultSize.width, window.innerWidth - 40);
  const height = Math.min(app.defaultSize.height, usableHeight - 16);
  const cascade = (windows.length % 6) * CASCADE_STEP;

  openWindow({
    id: app.id,
    title: app.title,
    icon: typeof app.icon === "string" ? app.icon : app.icon.src,
    component: app.component,
    isMinimized: false,
    isMaximized: false,
    position: {
      x: Math.max(8, Math.min(window.innerWidth - width - 8, Math.round((window.innerWidth - width) / 2) + cascade)),
      y: MENU_BAR_HEIGHT + Math.min(usableHeight - height, Math.max(8, Math.round((usableHeight - height) / 2)) + cascade),
    },
    size: { width, height },
    metadata: metadata ?? app.metadata,
  });
}

// Opens the App Store on a product page, or on a tab when `itemId` is
// omitted. `at` makes a repeat request for the same page still navigate.
export function openInAppStore(itemId?: string, tab?: string) {
  launchApp("app-store", {
    route: itemId ? { kind: "product", id: itemId } : { kind: "tab", id: tab ?? "discover" },
    at: Date.now(),
  });
}
