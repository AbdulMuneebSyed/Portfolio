"use client";

import { useState } from "react";
import { Search, XCircle, ExternalLink } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { AppIcon } from "@/lib/app-icons";
import { useAppName } from "@/lib/phone";

export function TaskManagerWindow() {
  const { windows, closeWindow, restoreWindow } = useWindowManager();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const appName = useAppName();
  const current = windows.find((w) => w.id === selected);
  const filtered = windows.filter((w) =>
    appName(w.appId ?? w.id, w.title).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <button
          className="mac-icon-button"
          aria-label="Quit selected app"
          disabled={!current}
          onClick={() => current && closeWindow(current.id)}
        >
          <XCircle size={18} />
        </button>
        <button
          className="mac-icon-button"
          aria-label="Show selected app"
          disabled={!current}
          onClick={() => current && restoreWindow(current.id)}
        >
          <ExternalLink size={17} />
        </button>
        <h2><span className="desktop-only">All Processes</span><span className="mobile-only">Open Apps</span></h2>
        <label className="mac-search">
          <Search size={14} />
          <input
            aria-label="Search processes"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="finder-list">
          <thead>
            <tr>
              <th><span className="desktop-only">Process Name</span><span className="mobile-only">App</span></th>
              <th>Status</th>
              <th className="optional-column">PID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr
                key={w.id}
                tabIndex={0}
                data-selected={selected === w.id}
                onClick={() => setSelected(w.id)}
                onFocus={() => setSelected(w.id)}
                onDoubleClick={() => restoreWindow(w.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") restoreWindow(w.id);
                }}
              >
                <td>
                  <span className="flex items-center gap-2">
                    <AppIcon appId={w.appId ?? w.id} size={24} />
                    {appName(w.appId ?? w.id, w.title)}
                  </span>
                </td>
                <td>
                  <span className="desktop-only">{w.isMinimized ? "Minimized" : "Running"}</span>
                  <span className="mobile-only">{w.isMinimized ? "Background" : "Open"}</span>
                </td>
                <td className="optional-column">{w.processId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty-state">No matching processes</div>
        )}
      </div>
      <div className="activity-summary">
        <div>
          <strong>{windows.length}</strong>
          <span>Applications</span>
        </div>
        <div>
          <strong>{windows.filter((w) => !w.isMinimized).length}</strong>
          <span>Visible</span>
        </div>
        <div>
          <strong>{windows.filter((w) => w.isMinimized).length}</strong>
          <span><span className="desktop-only">Minimized</span><span className="mobile-only">Background</span></span>
        </div>
      </div>
      <div className="mac-statusbar">
        <span>Portfolio applications</span>
        <span><span className="desktop-only">Activity Monitor</span><span className="mobile-only">Activity</span></span>
      </div>
    </div>
  );
}
