"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Activity,
  Cpu,
  ExternalLink,
  HardDrive,
  MonitorDot,
  Play,
  Square,
  XCircle,
} from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { getApp } from "@/lib/app-registry";

function formatStartedAt(value?: string) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUptime(value?: string) {
  if (!value) return "--";
  const elapsedMs = Date.now() - new Date(value).getTime();
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
  if (elapsedMinutes < 1) return "<1m";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  return `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
}

export function TaskManagerWindow() {
  const {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    setActiveWindow,
  } = useWindowManager();
  const [selectedId, setSelectedId] = useState<string | null>(
    windows[0]?.id ?? null
  );

  const selectedWindow =
    windows.find((window) => window.id === selectedId) ?? windows[0] ?? null;

  const stats = useMemo(() => {
    const totalMemory = windows.reduce(
      (total, window) => total + (window.memoryMb ?? 0),
      0
    );
    const runningCount = windows.filter(
      (window) => !window.isMinimized
    ).length;
    return {
      totalMemory,
      runningCount,
      minimizedCount: windows.length - runningCount,
      cpuLoad: Math.min(96, 18 + windows.length * 9),
    };
  }, [windows]);

  const launchTerminal = () => {
    const terminal = getApp("terminal");
    if (!terminal) return;

    openWindow({
      id: terminal.id,
      title: terminal.title,
      icon: typeof terminal.icon === "string" ? terminal.icon : terminal.icon.src,
      component: terminal.component,
      isMinimized: false,
      isMaximized: false,
      position: terminal.defaultPosition ?? { x: 140, y: 80 },
      size: terminal.defaultSize,
    });
  };

  const focusSelected = () => {
    if (!selectedWindow) return;
    if (selectedWindow.isMinimized) {
      restoreWindow(selectedWindow.id);
      return;
    }
    setActiveWindow(selectedWindow.id);
  };

  const endSelected = () => {
    if (!selectedWindow) return;
    closeWindow(selectedWindow.id);
    setSelectedId((current) => {
      const nextWindow = windows.find((window) => window.id !== current);
      return nextWindow?.id ?? null;
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#f3f7fb] text-slate-900">
      <div className="border-b border-slate-300 bg-gradient-to-b from-white to-[#dbe7f2]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MonitorDot className="size-4 text-sky-700" />
            MuneebOS Task Manager
          </div>
          <button
            onClick={launchTerminal}
            className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium hover:bg-slate-100"
          >
            <Play className="size-3.5" />
            Launch Terminal
          </button>
        </div>
        <div className="grid grid-cols-4 border-t border-white/80 text-xs">
          <div className="flex items-center gap-2 border-r border-slate-300 px-3 py-2">
            <Activity className="size-4 text-emerald-700" />
            <span>{windows.length} processes</span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-300 px-3 py-2">
            <Cpu className="size-4 text-amber-700" />
            <span>{stats.cpuLoad}% CPU</span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-300 px-3 py-2">
            <HardDrive className="size-4 text-violet-700" />
            <span>{stats.totalMemory} MB</span>
          </div>
          <div className="px-3 py-2">
            {stats.runningCount} active / {stats.minimizedCount} minimized
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <div className="sticky top-0 grid grid-cols-[2fr_80px_100px_90px_90px] border-b border-slate-300 bg-[#edf5fc] px-3 py-2 text-xs font-semibold uppercase text-slate-500">
          <span>Application</span>
          <span>PID</span>
          <span>Status</span>
          <span>Memory</span>
          <span>Uptime</span>
        </div>
        {windows.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            No running applications.
          </div>
        ) : (
          windows.map((window) => (
            <button
              key={window.id}
              onClick={() => setSelectedId(window.id)}
              onDoubleClick={() => {
                if (window.isMinimized) restoreWindow(window.id);
                else setActiveWindow(window.id);
              }}
              className={`grid w-full grid-cols-[2fr_80px_100px_90px_90px] items-center border-b border-slate-200 px-3 py-2 text-left text-sm hover:bg-sky-50 ${
                selectedWindow?.id === window.id ? "bg-[#dff0ff]" : "bg-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {typeof window.icon === "string" && window.icon.startsWith("/") ? (
                  <Image
                    src={window.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="size-[18px] object-contain"
                  />
                ) : (
                  <span className="flex size-[18px] items-center justify-center text-sm">
                    {typeof window.icon === "string" ? window.icon : "▣"}
                  </span>
                )}
                <span className="truncate font-medium">{window.title}</span>
              </span>
              <span>{window.processId ?? "--"}</span>
              <span>{window.isMinimized ? "Minimized" : "Running"}</span>
              <span>{window.memoryMb ?? 0} MB</span>
              <span>{formatUptime(window.startedAt)}</span>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-slate-300 bg-[#eef4fb] p-3">
        <div className="min-w-0 text-xs text-slate-600">
          {selectedWindow ? (
            <>
              <div className="truncate font-semibold text-slate-800">
                {selectedWindow.title}
              </div>
              <div>
                PID {selectedWindow.processId ?? "--"} · Started{" "}
                {formatStartedAt(selectedWindow.startedAt)} · Component{" "}
                {selectedWindow.component}
              </div>
            </>
          ) : (
            "Select an application to manage it."
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={focusSelected}
            disabled={!selectedWindow}
            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ExternalLink className="size-3.5" />
            Switch To
          </button>
          <button
            onClick={() => selectedWindow && minimizeWindow(selectedWindow.id)}
            disabled={!selectedWindow || selectedWindow.isMinimized}
            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square className="size-3.5" />
            Minimize
          </button>
          <button
            onClick={endSelected}
            disabled={!selectedWindow}
            className="flex items-center gap-1.5 rounded border border-rose-300 bg-[#fff1f2] px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="size-3.5" />
            End Task
          </button>
        </div>
      </div>
    </div>
  );
}
