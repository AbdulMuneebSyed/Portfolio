const titles: Record<string, string> = {
  computer: "Files",
  settings: "Settings",
  "task-manager": "Activity",
  recycle: "Recently Deleted",
};

export function mobileAppTitle(id: string, fallback: string) {
  return titles[id] ?? fallback;
}
