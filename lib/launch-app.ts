import { getApp } from "./app-registry";
import { useWindowManager } from "./window-manager";

export const MENU_BAR_HEIGHT = 30;
export const DOCK_RESERVED_HEIGHT = 88;
const CASCADE_STEP = 26;

// The single way to open a registry app, used by the Dock, desktop files,
// Spotlight, menus, and Terminal.
export function launchApp(appId: string, metadata?: Record<string, unknown>) {
  const app = getApp(appId);
  if (!app) return;

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
      x: Math.max(0, Math.round((window.innerWidth - width) / 2) + cascade),
      y: MENU_BAR_HEIGHT + Math.max(8, Math.round((usableHeight - height) / 2)) + cascade,
    },
    size: { width, height },
    metadata: metadata ?? app.metadata,
  });
}
