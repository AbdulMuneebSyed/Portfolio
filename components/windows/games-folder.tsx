"use client";

import { useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import {
  Gamepad2,
  ChevronRight,
  Home,
  Search,
  List,
  Grid3X3,
  ArrowUp,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";

export function GamesFolder() {
  const { openWindow } = useWindowManager();
  const [viewMode, setViewMode] = useState<"icons" | "list">("icons");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const games = [
    {
      id: "minesweeper",
      title: "Minesweeper",
      icon: "💣",
      component: "Minesweeper",
      type: "Application",
      size: "1.2 MB",
      dateModified: "10/15/2009",
    },
    {
      id: "snake",
      title: "Snake",
      icon: "🐍",
      component: "Snake",
      type: "Application",
      size: "890 KB",
      dateModified: "10/15/2009",
    },
  ];

  const handleOpenGame = (game: (typeof games)[0]) => {
    openWindow({
      id: game.id,
      title: game.title,
      icon: game.icon,
      component: game.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 150 + Math.random() * 100, y: 80 + Math.random() * 50 },
      size: { width: 600, height: 700 },
    });
  };

  const handleItemClick = (gameId: string, isDoubleClick: boolean = false) => {
    if (isDoubleClick) {
      const game = games.find((g) => g.id === gameId);
      if (game) handleOpenGame(game);
    } else {
      setSelectedItems([gameId]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menu Bar */}
      <div className="bg-gradient-to-b from-[#F8F8F8] to-[#E8E8E8] border-b border-[#C0C0C0] px-2 py-1">
        <div className="flex items-center text-xs">
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            File
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Edit
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            View
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Tools
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Help
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gradient-to-b from-[#F0F4F7] to-[#E1E8ED] border-b border-[#C0C0C0] px-2 py-2">
        <div className="flex items-center gap-1">
          {/* Navigation Buttons */}
          <div className="flex items-center bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded">
            <button className="p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0] border-r border-[#C0C0C0]">
              <ArrowUp className="w-4 h-4 text-[#333]" />
            </button>
            <button className="p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]">
              <RefreshCw className="w-4 h-4 text-[#333]" />
            </button>
          </div>

          <div className="w-px h-6 bg-[#C0C0C0]" />

          {/* View Buttons */}
          <div className="flex items-center bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded">
            <button
              onClick={() => setViewMode("icons")}
              className={`p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0] border-r border-[#C0C0C0] ${
                viewMode === "icons"
                  ? "bg-gradient-to-b from-[#E0E8F0] to-[#D0D8E0]"
                  : ""
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-[#333]" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0] ${
                viewMode === "list"
                  ? "bg-gradient-to-b from-[#E0E8F0] to-[#D0D8E0]"
                  : ""
              }`}
            >
              <List className="w-4 h-4 text-[#333]" />
            </button>
          </div>

          <div className="flex-1" />

          {/* Search Box */}
          <div className="flex items-center bg-white border border-[#999] rounded-sm px-2 py-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#666] mr-2" />
            <input
              type="text"
              placeholder="Search Games"
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Address Bar / Breadcrumbs */}
      <div className="bg-white border-b border-[#E0E0E0] px-4 py-2">
        <div className="flex items-center gap-1 text-sm">
          <Home className="w-4 h-4 text-[#666]" />
          <span className="text-[#333]">Computer</span>
          <ChevronRight className="w-3 h-3 text-[#999]" />
          <span className="text-[#333]">Local Disk (C:)</span>
          <ChevronRight className="w-3 h-3 text-[#999]" />
          <span className="text-[#333]">Program Files</span>
          <ChevronRight className="w-3 h-3 text-[#999]" />
          <span className="text-[#333] font-medium">Games</span>
        </div>
      </div>

      {/* Development Disclaimer Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-orange-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-orange-600 text-sm">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-800 mb-1">
              Development Notice
            </h3>
            <p className="text-xs text-orange-700 leading-relaxed">
              <strong>Under Development:</strong> This Games section is part of
              my portfolio and still evolving. The entries you see here are
              functional previews. Additional polish, deeper gameplay features,
              scoring systems, and persistence will roll out in upcoming
              updates.
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-orange-600">
              <span>🎮 Early playable preview</span>
              <span>🚧 More features coming</span>
              <span>� Portfolio build</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white">
        {viewMode === "icons" ? (
          /* Icon View */
          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  className={`group cursor-pointer flex flex-col items-center p-3 rounded hover:bg-[#E3F2FD] transition-colors ${
                    selectedItems.includes(game.id)
                      ? "bg-[#CCE8FF] border border-[#99D1FF]"
                      : ""
                  }`}
                  onClick={() => handleItemClick(game.id)}
                  onDoubleClick={() => handleItemClick(game.id, true)}
                >
                  {/* Game Icon */}
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-[#F8F8F8] to-[#E8E8E8] border border-[#C0C0C0] rounded mb-2 group-hover:from-[#F0F8FF] group-hover:to-[#E0F0FF]">
                    <span className="text-2xl">{game.icon}</span>
                  </div>
                  {/* Game Title */}
                  <span className="text-xs text-center text-[#333] leading-tight max-w-full break-words">
                    {game.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col">
            {/* List Header */}
            <div className="bg-gradient-to-b from-[#F0F0F0] to-[#E0E0E0] border-b border-[#C0C0C0] px-4 py-2 text-xs font-medium text-[#333]">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Date modified</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3">Size</div>
              </div>
            </div>

            {/* List Items */}
            <div className="flex-1">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className={`group cursor-pointer border-b border-[#F0F0F0] px-4 py-2 hover:bg-[#E3F2FD] transition-colors ${
                    selectedItems.includes(game.id)
                      ? "bg-[#CCE8FF]"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-[#FAFAFA]"
                  }`}
                  onClick={() => handleItemClick(game.id)}
                  onDoubleClick={() => handleItemClick(game.id, true)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-sm">{game.icon}</span>
                      </div>
                      <span className="text-[#333]">{game.title}</span>
                    </div>
                    <div className="col-span-2 text-[#666] text-xs">
                      {game.dateModified}
                    </div>
                    <div className="col-span-2 text-[#666] text-xs">
                      {game.type}
                    </div>
                    <div className="col-span-3 text-[#666] text-xs">
                      {game.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-[#C0C0C0] bg-gradient-to-b from-[#F0F0F0] to-[#E8E8E8] px-4 py-1 flex items-center justify-between text-xs">
        <span className="text-[#333]">{games.length} items</span>
        <span className="text-[#666]">
          {selectedItems.length} item(s) selected
        </span>
      </div>
    </div>
  );
}
