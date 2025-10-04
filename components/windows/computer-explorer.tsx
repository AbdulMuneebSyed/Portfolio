"use client";

import type React from "react";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  HardDrive,
  FileText,
  ImageIcon,
  Music,
  Search,
  Gamepad2,
  Monitor,
  Settings,
} from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";

interface FolderItem {
  id: string;
  name: string;
  type: "folder" | "file" | "application";
  icon: React.ComponentType<{ className?: string }> | string;
  size?: string;
  modified?: string;
  component?: string; // For applications
}

interface ComputerExplorerProps {
  initialFolder?: string; // Can be "Documents", "Pictures", "Music", etc.
  initialPath?: string[]; // Direct path like ["Computer", "Local Disk (C:)", "Program Files", "Games"]
}

const libraryStructure: Record<string, FolderItem[]> = {
  Computer: [
    {
      id: "local-disk-c",
      name: "Local Disk (C:)",
      type: "folder",
      icon: HardDrive,
    },
    { id: "documents", name: "Documents", type: "folder", icon: Folder },
    { id: "pictures", name: "Pictures", type: "folder", icon: Folder },
    { id: "music", name: "Music", type: "folder", icon: Folder },
    { id: "downloads", name: "Downloads", type: "folder", icon: Folder },
  ],
  "Local Disk (C:)": [
    {
      id: "program-files",
      name: "Program Files",
      type: "folder",
      icon: Folder,
    },
    { id: "windows", name: "Windows", type: "folder", icon: Folder },
    { id: "users", name: "Users", type: "folder", icon: Folder },
  ],
  "Program Files": [
    { id: "games", name: "Games", type: "folder", icon: Gamepad2 },
    {
      id: "microsoft-office",
      name: "Microsoft Office",
      type: "folder",
      icon: Folder,
    },
    {
      id: "internet-explorer",
      name: "Internet Explorer",
      type: "folder",
      icon: Monitor,
    },
  ],
  Games: [
    {
      id: "minesweeper",
      name: "Minesweeper",
      type: "application",
      icon: "💣",
      size: "1.2 MB",
      modified: "10/15/2009",
      component: "Minesweeper",
    },
    {
      id: "snake",
      name: "Snake",
      type: "application",
      icon: "🐍",
      size: "890 KB",
      modified: "10/15/2009",
      component: "Snake",
    },
  ],
  Documents: [
    {
      id: "resume",
      name: "2Syed Abdul Muneeb's SE Resume.pdf",
      type: "file",
      icon: FileText,
      size: "245 KB",
      modified: "2025-01-15",
    },
  ],
  Pictures: [
    {
      id: "profile",
      name: "profile.jpg",
      type: "file",
      icon: ImageIcon,
      size: "2.4 MB",
      modified: "2024-12-20",
    },
  ],
  Music: [
    {
      id: "for-a-reason",
      name: "ForAReason.mp3",
      type: "file",
      icon: Music,
      size: "4.2 MB",
      modified: "2024-12-15",
    },
    {
      id: "regrets",
      name: "regrets.mp3",
      type: "file",
      icon: Music,
      size: "3.8 MB",
      modified: "2024-12-20",
    },
  ],
  Downloads: [
    {
      id: "installer",
      name: "setup-installer.exe",
      type: "file",
      icon: FileText,
      size: "156 MB",
      modified: "2025-01-20",
    },
  ],
};

export function ComputerExplorer({
  initialFolder,
  initialPath,
}: ComputerExplorerProps = {}) {
  const { openWindow } = useWindowManager();

  console.log("ComputerExplorer props:", { initialFolder, initialPath });

  // Set initial path based on initialPath or initialFolder prop
  const getInitialPath = () => {
    if (initialPath && Array.isArray(initialPath)) {
      console.log("Using initialPath:", initialPath);
      return initialPath;
    }
    if (initialFolder && libraryStructure[initialFolder]) {
      console.log("Using initialFolder:", initialFolder);
      return ["Computer", initialFolder];
    }
    console.log("Using default path: Computer");
    return ["Computer"];
  };

  const [currentPath, setCurrentPath] = useState<string[]>(getInitialPath());
  const [searchQuery, setSearchQuery] = useState("");

  const currentFolder = currentPath[currentPath.length - 1];
  const items = libraryStructure[currentFolder] || [];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemAction = (item: FolderItem) => {
    if (item.type === "folder") {
      navigateToFolder(item.name);
    } else if (item.type === "application" && item.component) {
      openWindow({
        id: item.id,
        title: item.name,
        icon: item.icon,
        component: item.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 150 + Math.random() * 100, y: 80 + Math.random() * 50 },
        size: { width: 600, height: 700 },
      });
    } else if (item.type === "file" && item.name.endsWith(".mp3")) {
      // Open music player for MP3 files
      openWindow({
        id: `music-player-${item.id}`,
        title: `Music Player - ${item.name}`,
        icon: Music,
        component: "MusicPlayer",
        isMinimized: false,
        isMaximized: false,
        disableMaximize: true, // Disable maximize button for music player
        position: { x: 200 + Math.random() * 100, y: 100 + Math.random() * 50 },
        size: { width: 480, height: 600 },
        metadata: {
          fileName: item.name,
          filePath: `/${item.name}`,
        },
      });
    } else if (
      item.type === "file" &&
      (item.name.endsWith(".jpg") ||
        item.name.endsWith(".jpeg") ||
        item.name.endsWith(".png") ||
        item.name.endsWith(".gif"))
    ) {
      // Open photo preview for image files
      openWindow({
        id: `photo-preview-${item.id}`,
        title: `Photo Preview - ${item.name}`,
        icon: ImageIcon,
        component: "PhotoPreview",
        isMinimized: false,
        isMaximized: false,
        position: { x: 150 + Math.random() * 100, y: 80 + Math.random() * 50 },
        size: { width: 700, height: 500 },
        metadata: {
          fileName: item.name,
          filePath: `/${item.name}`,
        },
      });
    } else if (item.type === "file" && item.name.endsWith(".pdf")) {
      // Open resume window for PDF files
      openWindow({
        id: `resume-${item.id}`,
        title: `Resume - ${item.name}`,
        icon: FileText,
        component: "ResumeWindow",
        isMinimized: false,
        isMaximized: false,
        position: { x: 150 + Math.random() * 100, y: 80 + Math.random() * 50 },
        size: { width: 900, height: 700 },
      });
    }
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSearchQuery("");
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-48 border-r border-gray-300 bg-gradient-to-b from-gray-50 to-white p-3">
        <div className="space-y-1">
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
              currentFolder === "Computer"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setCurrentPath(["Computer"])}
          >
            <HardDrive className="w-4 h-4" />
            <span className="text-sm font-medium">Computer</span>
          </button>

          <div className="pt-2 border-t border-gray-200 mt-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-1">
              Libraries
            </div>
            {["Documents", "Pictures", "Music", "Downloads"].map((lib) => (
              <button
                key={lib}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                  currentFolder === lib
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => setCurrentPath(["Computer", lib])}
              >
                <Folder className="w-4 h-4" />
                <span className="text-sm">{lib}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-200 mt-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-1">
              Quick Access
            </div>
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                currentFolder === "Games"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() =>
                setCurrentPath([
                  "Computer",
                  "Local Disk (C:)",
                  "Program Files",
                  "Games",
                ])
              }
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">Games</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={navigateBack}
              disabled={currentPath.length === 1}
              className="px-3 py-1 text-sm hover:bg-blue-100 rounded disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Back
            </button>
            <button className="px-3 py-1 text-sm hover:bg-blue-100 rounded">
              Forward
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200">
            <div className="flex items-center gap-1 flex-1 bg-white border border-gray-300 rounded px-2 py-1">
              <HardDrive className="w-4 h-4 text-gray-600" />
              {currentPath.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    {item}
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-3 py-1 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* File/Folder List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition-colors text-left"
                onDoubleClick={() => handleItemAction(item)}
              >
                {typeof item.icon === "string" ? (
                  <span className="w-5 h-5 flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                ) : (
                  <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                    {item.name}
                    {item.type === "application" && (
                      <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                        APP
                      </span>
                    )}
                  </div>
                  {(item.type === "file" || item.type === "application") && (
                    <div className="text-xs text-gray-500">
                      {item.size} • Modified {item.modified}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>This folder is empty</p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-300 bg-gradient-to-b from-gray-50 to-white px-3 py-1">
          <span className="text-xs text-gray-600">
            {filteredItems.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
