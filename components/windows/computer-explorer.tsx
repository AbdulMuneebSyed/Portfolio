"use client";

import type React from "react";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Folder,
  HardDrive,
  FileText,
  ImageIcon,
  Music,
  Search,
  Gamepad2,
  Monitor,
  Settings,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Star,
  LayoutGrid,
  List as ListIcon,
  HelpCircle,
  Menu,
  Video,
  Download,
  Printer,
  Share2,
  Disc,
  Info,
} from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";

interface FolderItem {
  id: string;
  name: string;
  type: "folder" | "file" | "application" | "drive";
  icon: React.ComponentType<{ className?: string }> | string;
  size?: string;
  totalSize?: string; // For drives
  freeSpace?: string; // For drives
  percentFull?: number; // For drives
  modified?: string;
  component?: string; // For applications
  description?: string;
}

interface ComputerExplorerProps {
  initialFolder?: string;
  initialPath?: string[];
}

const libraryStructure: Record<string, FolderItem[]> = {
  Computer: [
    {
      id: "local-disk-c",
      name: "Local Disk (C:)",
      type: "drive",
      icon: HardDrive,
      totalSize: "499 GB",
      freeSpace: "120 GB",
      percentFull: 76,
    },
    {
      id: "local-disk-d",
      name: "Data (D:)",
      type: "drive",
      icon: HardDrive,
      totalSize: "931 GB",
      freeSpace: "850 GB",
      percentFull: 9,
    },
    {
      id: "dvd-drive",
      name: "DVD RW Drive (E:)",
      type: "drive",
      icon: "💿",
      totalSize: "0 bytes",
      freeSpace: "0 bytes",
      percentFull: 0,
      description: "CD Drive",
    },
  ],
  "Local Disk (C:)": [
    {
      id: "program-files",
      name: "Program Files",
      type: "folder",
      icon: Folder,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "windows",
      name: "Windows",
      type: "folder",
      icon: Folder,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "users",
      name: "Users",
      type: "folder",
      icon: Folder,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "perflogs",
      name: "PerfLogs",
      type: "folder",
      icon: Folder,
      modified: "07/13/2009 10:20 PM",
    },
  ],
  "Program Files": [
    {
      id: "games",
      name: "Games",
      type: "folder",
      icon: Gamepad2,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "microsoft-office",
      name: "Microsoft Office",
      type: "folder",
      icon: Folder,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "internet-explorer",
      name: "Internet Explorer",
      type: "folder",
      icon: Monitor,
      modified: "10/26/2009 8:00 AM",
    },
    {
      id: "windows-media-player",
      name: "Windows Media Player",
      type: "folder",
      icon: Folder,
      modified: "10/26/2009 8:00 AM",
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
    {
      id: "project-notes",
      name: "Project Notes.txt",
      type: "file",
      icon: FileText,
      size: "12 KB",
      modified: "2025-01-10",
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
    {
      id: "vacation",
      name: "vacation.png",
      type: "file",
      icon: ImageIcon,
      size: "3.1 MB",
      modified: "2024-08-15",
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
    {
      id: "memories",
      name: "memories.mp3",
      type: "file",
      icon: Music,
      size: "2.1 MB",
      modified: "2009-10-22",
    },
  ],
  Videos: [
    {
      id: "sample-video",
      name: "Wildlife.wmv",
      type: "file",
      icon: Video,
      size: "25.6 MB",
      modified: "2009-10-22",
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
    {
      id: "archive",
      name: "project-backup.zip",
      type: "file",
      icon: Folder,
      size: "45 MB",
      modified: "2025-01-18",
    },
  ],
};

export function ComputerExplorer({
  initialFolder,
  initialPath,
}: ComputerExplorerProps = {}) {
  const { openWindow } = useWindowManager();

  const getInitialPath = () => {
    if (initialPath && Array.isArray(initialPath)) {
      return initialPath;
    }
    if (initialFolder && libraryStructure[initialFolder]) {
      return ["Computer", initialFolder];
    }
    return ["Computer"];
  };

  const [currentPath, setCurrentPath] = useState<string[]>(getInitialPath());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "tiles" | "icons">(
    "details"
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FolderItem;
    direction: "asc" | "desc";
  } | null>(null);

  const currentFolder = currentPath[currentPath.length - 1];
  const items = libraryStructure[currentFolder] || [];

  const filteredItems = useMemo(() => {
    let result = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [items, searchQuery, sortConfig]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );

  const handleSort = (key: keyof FolderItem) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleItemAction = (item: FolderItem) => {
    if (item.type === "folder" || item.type === "drive") {
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
      openWindow({
        id: `music-player-${item.id}`,
        title: `Music Player - ${item.name}`,
        icon: Music,
        component: "MusicPlayer",
        isMinimized: false,
        isMaximized: false,
        disableMaximize: true,
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
    setSelectedItemId(null);
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItemId(null);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedItemId(null);
  };

  // Group items for "Computer" view
  const hardDrives = filteredItems.filter(
    (item) => item.type === "drive" && item.icon === HardDrive
  );
  const removableDrives = filteredItems.filter(
    (item) => item.type === "drive" && item.icon !== HardDrive
  );
  const otherItems = filteredItems.filter((item) => item.type !== "drive");

  return (
    <div className="flex flex-col h-full bg-white select-none font-segoe">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[#F0F0F0] border-b border-[#D9D9D9]">
        <div className="flex items-center gap-1">
          <button
            onClick={navigateBack}
            disabled={currentPath.length === 1}
            className="p-1 rounded-full hover:bg-[#D9D9D9] disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#3C3C3C]" />
          </button>
          <button className="p-1 rounded-full hover:bg-[#D9D9D9] disabled:opacity-30 transition-colors">
            <ArrowRight className="w-5 h-5 text-[#3C3C3C]" />
          </button>
          <button className="p-1 rounded-full hover:bg-[#D9D9D9] transition-colors">
            <ChevronDown className="w-4 h-4 text-[#3C3C3C]" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-white border border-[#7F9DB9] rounded-[2px] h-[26px] px-1 mx-2 shadow-inner relative">
          <HardDrive className="w-4 h-4 text-[#3C3C3C] mr-2 ml-1" />
          <div className="flex items-center text-sm flex-1 overflow-hidden">
            {currentPath.map((item, index) => (
              <div key={index} className="flex items-center h-full group">
                {index > 0 && (
                  <span className="text-[#666666] mx-0.5">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                )}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] px-1 rounded-[2px] transition-colors whitespace-nowrap border border-transparent flex items-center"
                >
                  {item}
                  <ChevronDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 text-[#3C3C3C]" />
                </button>
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center hover:bg-[#E5F3FB] cursor-pointer border-l border-transparent hover:border-[#7DA2CE]">
            <ChevronDown className="w-4 h-4 text-[#3C3C3C]" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder={`Search ${currentFolder}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[26px] pl-2 pr-8 border border-[#7F9DB9] rounded-[2px] text-sm focus:outline-none focus:border-[#3399FF] shadow-inner italic text-gray-500"
          />
          <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-gradient-to-b from-white to-[#F0F0F0] border-l border-[#D9D9D9] rounded-r-[2px]">
            <Search className="w-4 h-4 text-[#1E528C]" />
          </div>
        </div>
      </div>

      {/* Command Bar */}
      <div className="flex items-center gap-0 px-2 py-1.5 bg-[#F5F6F7] border-b border-[#D9D9D9] text-sm text-[#1E1E1E]">
        <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors">
          Organize
        </button>
        {currentFolder === "Computer" && (
          <>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors">
              System properties
            </button>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors">
              Uninstall or change a program
            </button>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors">
              Map network drive
            </button>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors">
              Open Control Panel
            </button>
          </>
        )}
        {currentFolder === "Documents" && (
          <>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Share with
            </button>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors flex items-center gap-1">
              <Disc className="w-3 h-3" /> Burn
            </button>
            <button className="px-3 py-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors flex items-center gap-1">
              <Folder className="w-3 h-3" /> New folder
            </button>
          </>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1 border-l border-[#D9D9D9] pl-2 ml-2">
          <button
            className={`p-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors ${
              viewMode === "details" ? "bg-[#CDE6F7] border-[#7DA2CE]" : ""
            }`}
            onClick={() => setViewMode("details")}
            title="Details view"
          >
            <ListIcon className="w-4 h-4 text-[#1E1E1E]" />
          </button>
          <button
            className={`p-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors ${
              viewMode === "tiles" ? "bg-[#CDE6F7] border-[#7DA2CE]" : ""
            }`}
            onClick={() => setViewMode("tiles")}
            title="Tiles view"
          >
            <LayoutGrid className="w-4 h-4 text-[#1E1E1E]" />
          </button>
        </div>
        <button className="p-1 hover:bg-[#E5F3FB] hover:border hover:border-[#7DA2CE] border border-transparent rounded-[2px] transition-colors ml-1">
          <HelpCircle className="w-4 h-4 text-[#1E1E1E]" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[200px] bg-[#F0F0F0] border-r border-[#D9D9D9] overflow-y-auto p-2 text-sm">
          <div className="space-y-1">
            {/* Favorites */}
            <div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-[#1E1E1E] hover:bg-[#E5F3FB] cursor-pointer group">
                <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-0 h-0 border-l-[4px] border-l-[#444] border-y-[3px] border-y-transparent transform rotate-45"></div>
                </div>
                <Star className="w-3 h-3 text-[#FACC2E] fill-[#FACC2E]" />
                <span className="font-medium ml-1">Favorites</span>
              </div>
              <div className="pl-6 space-y-0.5 mt-0.5">
                <div
                  className="flex items-center gap-2 px-1 py-0.5 hover:bg-[#E5F3FB] cursor-pointer"
                  onClick={() => setCurrentPath(["Computer", "Desktop"])}
                >
                  <Monitor className="w-4 h-4 text-[#3C3C3C]" />
                  <span>Desktop</span>
                </div>
                <div
                  className="flex items-center gap-2 px-1 py-0.5 hover:bg-[#E5F3FB] cursor-pointer"
                  onClick={() => setCurrentPath(["Computer", "Downloads"])}
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                  <span>Downloads</span>
                </div>
              </div>
            </div>

            {/* Libraries */}
            <div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-[#1E1E1E] hover:bg-[#E5F3FB] cursor-pointer group">
                <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-0 h-0 border-l-[4px] border-l-[#444] border-y-[3px] border-y-transparent transform rotate-45"></div>
                </div>
                <Folder className="w-3 h-3 text-[#3C3C3C]" />
                <span className="font-medium ml-1">Libraries</span>
              </div>
              <div className="pl-6 space-y-0.5 mt-0.5">
                {["Documents", "Music", "Pictures", "Videos"].map((lib) => (
                  <div
                    key={lib}
                    className={`flex items-center gap-2 px-1 py-0.5 cursor-pointer ${
                      currentFolder === lib
                        ? "bg-[#CDE6F7] border border-[#7DA2CE] rounded-[2px]"
                        : "hover:bg-[#E5F3FB] border border-transparent"
                    }`}
                    onClick={() => setCurrentPath(["Computer", lib])}
                  >
                    <Folder className="w-4 h-4 text-[#FACC2E] fill-[#FACC2E]" />
                    <span>{lib}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Computer */}
            <div>
              <div
                className={`flex items-center gap-1 px-1 py-0.5 text-[#1E1E1E] cursor-pointer group ${
                  currentFolder === "Computer"
                    ? "bg-[#CDE6F7] border border-[#7DA2CE] rounded-[2px]"
                    : "hover:bg-[#E5F3FB] border border-transparent"
                }`}
                onClick={() => setCurrentPath(["Computer"])}
              >
                <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-0 h-0 border-l-[4px] border-l-[#444] border-y-[3px] border-y-transparent transform rotate-45"></div>
                </div>
                <HardDrive className="w-3 h-3 text-[#3C3C3C]" />
                <span className="font-medium ml-1">Computer</span>
              </div>
              <div className="pl-6 space-y-0.5 mt-0.5">
                <div
                  className="flex items-center gap-2 px-1 py-0.5 hover:bg-[#E5F3FB] cursor-pointer"
                  onClick={() =>
                    setCurrentPath(["Computer", "Local Disk (C:)"])
                  }
                >
                  <HardDrive className="w-4 h-4 text-[#3C3C3C]" />
                  <span>Local Disk (C:)</span>
                </div>
              </div>
            </div>

            {/* Network */}
            <div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-[#1E1E1E] hover:bg-[#E5F3FB] cursor-pointer group">
                <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-0 h-0 border-l-[4px] border-l-[#444] border-y-[3px] border-y-transparent transform rotate-45"></div>
                </div>
                <Monitor className="w-3 h-3 text-[#3C3C3C]" />
                <span className="font-medium ml-1">Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white overflow-y-auto p-0">
          {currentFolder === "Computer" ? (
            <div className="space-y-6 p-4">
              {/* Hard Disk Drives */}
              {hardDrives.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 border-b border-[#D9D9D9] pb-1">
                    <ChevronDown className="w-3 h-3 text-[#1E528C]" />
                    <span className="text-[#1E528C] font-medium text-sm">
                      Hard Disk Drives ({hardDrives.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hardDrives.map((drive) => (
                      <div
                        key={drive.id}
                        className={`flex gap-3 p-2 border border-transparent hover:bg-[#E5F3FB] hover:border-[#7DA2CE] rounded-[2px] cursor-pointer ${
                          selectedItemId === drive.id
                            ? "bg-[#CDE6F7] border-[#7DA2CE]"
                            : ""
                        }`}
                        onClick={() => setSelectedItemId(drive.id)}
                        onDoubleClick={() => handleItemAction(drive)}
                      >
                        <HardDrive className="w-10 h-10 text-[#3C3C3C]" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[#1E1E1E]">
                            {drive.name}
                          </div>
                          <div className="w-full h-3 bg-[#E6E6E6] border border-[#BCBCBC] mt-1 rounded-[2px] overflow-hidden">
                            <div
                              className={`h-full ${
                                (drive.percentFull || 0) > 90
                                  ? "bg-red-500"
                                  : "bg-[#4891FF]"
                              }`}
                              style={{ width: `${drive.percentFull}%` }}
                            />
                          </div>
                          <div className="text-xs text-[#666666] mt-0.5">
                            {drive.freeSpace} free of {drive.totalSize}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Devices with Removable Storage */}
              {removableDrives.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 border-b border-[#D9D9D9] pb-1">
                    <ChevronDown className="w-3 h-3 text-[#1E528C]" />
                    <span className="text-[#1E528C] font-medium text-sm">
                      Devices with Removable Storage ({removableDrives.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {removableDrives.map((drive) => (
                      <div
                        key={drive.id}
                        className={`flex gap-3 p-2 border border-transparent hover:bg-[#E5F3FB] hover:border-[#7DA2CE] rounded-[2px] cursor-pointer ${
                          selectedItemId === drive.id
                            ? "bg-[#CDE6F7] border-[#7DA2CE]"
                            : ""
                        }`}
                        onClick={() => setSelectedItemId(drive.id)}
                        onDoubleClick={() => handleItemAction(drive)}
                      >
                        <div className="w-10 h-10 flex items-center justify-center text-3xl">
                          {typeof drive.icon === "string" ? (
                            drive.icon
                          ) : (
                            <drive.icon className="w-10 h-10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="font-medium text-sm text-[#1E1E1E]">
                            {drive.name}
                          </div>
                          {drive.description && (
                            <div className="text-xs text-[#666666]">
                              {drive.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Standard Folder View
            <div className="h-full">
              {viewMode === "details" ? (
                <div className="w-full text-sm">
                  {/* Table Header */}
                  <div className="flex items-center px-4 py-1 border-b border-[#D9D9D9] bg-white text-[#1E1E1E] font-medium sticky top-0 z-10">
                    <div
                      className="flex-1 border-r border-[#D9D9D9] px-2 hover:bg-[#E5F3FB] cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort("name")}
                    >
                      Name{" "}
                      {sortConfig?.key === "name" &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </div>
                    <div
                      className="w-40 border-r border-[#D9D9D9] px-2 hover:bg-[#E5F3FB] cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort("modified")}
                    >
                      Date modified{" "}
                      {sortConfig?.key === "modified" &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </div>
                    <div
                      className="w-32 border-r border-[#D9D9D9] px-2 hover:bg-[#E5F3FB] cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort("type")}
                    >
                      Type{" "}
                      {sortConfig?.key === "type" &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </div>
                    <div
                      className="w-24 px-2 hover:bg-[#E5F3FB] cursor-pointer flex items-center gap-1"
                      onClick={() => handleSort("size")}
                    >
                      Size{" "}
                      {sortConfig?.key === "size" &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </div>
                  </div>
                  {/* Table Body */}
                  <div className="p-2">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center px-2 py-1 border border-transparent hover:bg-[#E5F3FB] hover:border-[#7DA2CE] rounded-[2px] cursor-pointer ${
                          selectedItemId === item.id
                            ? "bg-[#CDE6F7] border-[#7DA2CE]"
                            : ""
                        }`}
                        onClick={() => setSelectedItemId(item.id)}
                        onDoubleClick={() => handleItemAction(item)}
                      >
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          {typeof item.icon === "string" ? (
                            <span className="w-4 h-4 flex items-center justify-center text-sm">
                              {item.icon}
                            </span>
                          ) : (
                            <item.icon
                              className={`w-4 h-4 ${
                                item.type === "folder"
                                  ? "text-[#FACC2E] fill-[#FACC2E]"
                                  : "text-[#3C3C3C]"
                              }`}
                            />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="w-40 text-[#666666] px-2 truncate">
                          {item.modified || "-"}
                        </div>
                        <div className="w-32 text-[#666666] px-2 truncate">
                          {item.type === "folder"
                            ? "File folder"
                            : item.type === "application"
                            ? "Application"
                            : `${item.name
                                .split(".")
                                .pop()
                                ?.toUpperCase()} File`}
                        </div>
                        <div className="w-24 text-[#666666] px-2 truncate">
                          {item.size || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 p-1 border border-transparent hover:bg-[#E5F3FB] hover:border-[#7DA2CE] rounded-[2px] cursor-pointer ${
                        selectedItemId === item.id
                          ? "bg-[#CDE6F7] border-[#7DA2CE]"
                          : ""
                      }`}
                      onClick={() => setSelectedItemId(item.id)}
                      onDoubleClick={() => handleItemAction(item)}
                    >
                      {typeof item.icon === "string" ? (
                        <span className="w-5 h-5 flex items-center justify-center text-lg">
                          {item.icon}
                        </span>
                      ) : (
                        <item.icon
                          className={`w-5 h-5 ${
                            item.type === "folder"
                              ? "text-[#FACC2E] fill-[#FACC2E]"
                              : "text-[#3C3C3C]"
                          }`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#1E1E1E] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#666666] truncate">
                          {item.type === "folder"
                            ? "File folder"
                            : item.type === "application"
                            ? "Application"
                            : item.size}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>This folder is empty.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Pane (Bottom) */}
      <div className="bg-[#F0F0F0] border-t border-[#D9D9D9] p-3 flex items-center gap-4 h-16">
        {selectedItem ? (
          <>
            <div className="w-10 h-10 flex items-center justify-center">
              {typeof selectedItem.icon === "string" ? (
                <span className="text-3xl">{selectedItem.icon}</span>
              ) : (
                <selectedItem.icon
                  className={`w-10 h-10 ${
                    selectedItem.type === "folder"
                      ? "text-[#FACC2E] fill-[#FACC2E]"
                      : "text-[#3C3C3C]"
                  }`}
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-medium text-[#1E1E1E]">
                {selectedItem.name}
              </div>
              <div className="text-xs text-[#666666] flex gap-4">
                <span>
                  {selectedItem.type === "folder"
                    ? "File folder"
                    : selectedItem.type === "application"
                    ? "Application"
                    : `${selectedItem.name
                        .split(".")
                        .pop()
                        ?.toUpperCase()} File`}
                </span>
                {selectedItem.modified && (
                  <span>Date modified: {selectedItem.modified}</span>
                )}
                {selectedItem.size && <span>Size: {selectedItem.size}</span>}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-xs text-[#666666]">
                {filteredItems.length} items
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
