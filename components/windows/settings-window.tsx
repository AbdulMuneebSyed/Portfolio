"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Monitor,
  Palette,
  SettingsIcon,
  Info,
  Download,
  Upload,
} from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";

export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<
    "personalize" | "visitor" | "system"
  >("personalize");
  const {
    wallpaper,
    setWallpaper,
    taskbarTransparency,
    setTaskbarTransparency,
    aeroEffects,
    setAeroEffects,
  } = useWindowManager();
  const [visitorInfo, setVisitorInfo] = useState({
    browser: "",
    os: "",
    screenSize: "",
    timezone: "",
    language: "",
  });

  const [settings, setSettings] = useState({
    wallpaper: wallpaper,
    taskbarTransparency: taskbarTransparency,
    aeroEffects: aeroEffects,
    windowAnimations: true,
    systemSounds: true,
  });

  // Sync settings with window manager state
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      wallpaper: wallpaper,
      taskbarTransparency: taskbarTransparency,
      aeroEffects: aeroEffects,
    }));
  }, [wallpaper, taskbarTransparency, aeroEffects]);

  useEffect(() => {
    // Gather visitor information
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    // Detect browser
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // Detect OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    setVisitorInfo({
      browser,
      os,
      screenSize: `${window.screen.width} x ${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    });
  }, []);

  const wallpapers = [
    {
      id: "default",
      name: "Windows 7 Default",
      url: "url(https://wparena.com/wp-content/uploads/2009/09/img0.jpg)",
    },
    {
      id: "xp",
      name: "Windows XP Bliss",
      url: "url(/xp.jpg)",
    },
    {
      id: "win10",
      name: "Windows 10",
      url: "url(/10.jpg)",
    },
    {
      id: "black",
      name: "Black",
      url: "url(/black.png)",
    },
  ];

  const handleWallpaperChange = (wallpaperUrl: string) => {
    setWallpaper(wallpaperUrl);
    setSettings((prev) => ({ ...prev, wallpaper: wallpaperUrl }));
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "win7-settings.json";
    link.click();
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setSettings(imported);
        } catch (error) {
          alert("Invalid settings file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 flex">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "personalize"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("personalize")}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Personalize
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "visitor"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("visitor")}
        >
          <Info className="w-4 h-4 inline mr-2" />
          Visitor Info
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "system"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("system")}
        >
          <SettingsIcon className="w-4 h-4 inline mr-2" />
          System
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "personalize" && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Desktop Background
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      wallpaper === wp.url
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleWallpaperChange(wp.url)}
                  >
                    <div
                      className="w-full h-24 rounded mb-2 bg-cover bg-center"
                      style={{ backgroundImage: wp.url }}
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {wp.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Taskbar Transparency
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.taskbarTransparency}
                  onChange={(e) => {
                    const transparency = Number.parseInt(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      taskbarTransparency: transparency,
                    }));
                    setTaskbarTransparency(transparency);
                  }}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {settings.taskbarTransparency}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Visual Effects
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.windowAnimations}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      windowAnimations: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />
                <span className="text-gray-700">Enable window animations</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.systemSounds}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      systemSounds: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />
                <span className="text-gray-700">Enable system sounds</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "visitor" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your System Information
            </h2>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Browser:</span>
                <span className="text-gray-900">{visitorInfo.browser}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">
                  Operating System:
                </span>
                <span className="text-gray-900">{visitorInfo.os}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">
                  Screen Resolution:
                </span>
                <span className="text-gray-900">{visitorInfo.screenSize}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Timezone:</span>
                <span className="text-gray-900">{visitorInfo.timezone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Language:</span>
                <span className="text-gray-900">{visitorInfo.language}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              This information is collected from your browser and is not stored
              or transmitted anywhere.
            </p>
          </div>
        )}

        {activeTab === "system" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Import/Export Settings
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleExportSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Settings
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Export your settings as JSON to backup or share. Import to
                restore previous settings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Current Settings
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto">
                {JSON.stringify(settings, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
