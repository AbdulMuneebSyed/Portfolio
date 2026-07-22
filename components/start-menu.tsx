"use client";

import { useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import type { AppRegistryEntry } from "@/lib/types";
import { getLaunchableApps, searchApps } from "@/lib/app-registry";
import {
  FileText,
  ImageIcon,
  Music,
  Power,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import avatar from "../public/avatar.jpg";
import { motion, AnimatePresence } from "framer-motion";
interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow, shutdown } = useWindowManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const searchResults = searchApps(searchQuery).slice(0, 8);
  const allPrograms = getLaunchableApps();

  const handleOpenRegistryApp = (app: AppRegistryEntry) => {
    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    openWindow({
      id: app.id,
      title: app.title,
      icon: typeof app.icon === "string" ? app.icon : app.icon.src,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position:
        app.defaultPosition ?? {
          x: 100 + Math.random() * 200,
          y: 50 + Math.random() * 100,
        },
      size: app.defaultSize,
      metadata: app.metadata,
    });
    onClose();
  };

  const handleShutdownClick = () => {
    shutdown();
    onClose();
  };

  const handleRightPanelItemClick = (item: any) => {
    openWindow({
      id: `computer-${item.path}`,
      title: `Computer - ${item.title}`,
      icon: "💻",
      component: "ComputerExplorer",
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
      size: { width: 800, height: 600 },
      metadata: { initialFolder: item.title },
    });
    onClose();
  };

  const pinnedApps = allPrograms.filter((app) =>
    ["terminal", "task-manager", "calculator"].includes(app.id)
  );

  const rightPanelItems = [
    {
      title: "Documents",
      icon: FileText,
      path: "documents",
      openType: "folder",
    },
    {
      title: "Pictures",
      icon: ImageIcon,
      path: "pictures",
      openType: "folder",
    },
    { title: "Music", icon: Music, path: "music", openType: "folder" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        className="fixed bottom-10 left-1 z-[9999] flex h-[500px] w-[410px] overflow-visible rounded-t-lg border border-[#6d8fb0] bg-gradient-to-b from-[#8ec4ec]/95 via-[#3d7cae]/95 to-[#255f94]/95 p-[7px] pb-[5px] pl-[5px] shadow-[0_18px_45px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.75)_inset] backdrop-blur-md"
        initial={{
          y: 20,
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        exit={{
          y: 20,
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
        transition={{
          ease: "easeOut",
          duration: 0.2,
        }}
      >
        <div className="flex h-full w-[262px] min-w-0 flex-col rounded-md border border-white/70 bg-white p-0 shadow-[0_1px_6px_rgba(0,0,0,0.18)]">
          <div className="min-h-0 flex-1 overflow-hidden p-2">
            {pinnedApps.map((app, index) => (
              <motion.button
                key={app.id}
                className="group flex h-[58px] w-full items-center gap-2 rounded-sm border border-transparent px-1 text-left transition-all hover:border-[#7da2ce] hover:bg-gradient-to-r hover:from-[#e8f4ff] hover:to-[#c9e7ff]"
                onClick={() => handleOpenRegistryApp(app)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <Image
                  src={app.icon}
                  alt={app.title}
                  width={32}
                  height={32}
                  className="size-10 shrink-0 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-gray-900">
                    {app.title}
                  </span>
                  <span className="block truncate text-[11px] leading-4 text-slate-500">
                    {app.description}
                  </span>
                </div>
                <ChevronRight className="size-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}

            <div className="mx-2 my-3 h-px bg-gray-300" />
          </div>
          <div className="relative border-t border-gray-200 p-2">
            <div
              className="relative"
              onMouseEnter={() => {
                setShowAllPrograms(true);
              }}
              onMouseLeave={() => {
                setShowAllPrograms(false);
              }}
            >
              <button
                className={`w-full flex items-center justify-between px-2 py-2 text-sm transition-all rounded-sm border ${
                  showAllPrograms
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300"
                    : "border-transparent hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    All Programs
                  </span>
                </div>
              </button>

              {showAllPrograms && (
                <div
                  className="absolute left-full bottom-0 w-[250px] sm:w-[280px] md:w-[300px] h-fit bg-white border border-gray-400 shadow-2xl rounded-tr-lg overflow-hidden z-[10000]"
                  style={{ marginLeft: "1px" }}
                >
                  <div className="max-h-[330px] overflow-y-auto p-2">
                    <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
                      All Programs
                    </div>
                    {allPrograms.length > 0 ? (
                      allPrograms.map((app) => (
                        <button
                          key={app.id}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 transition-all text-left border border-transparent hover:border-blue-300"
                          onClick={() => handleOpenRegistryApp(app)}
                        >
                          <Image
                            src={
                              typeof app.icon === "string"
                                ? app.icon
                                : app.icon.src
                            }
                            alt={app.title}
                            width={16}
                            height={16}
                          />
                          <span className="text-sm text-gray-900">
                            {app.title}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-gray-500">
                        No programs available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 p-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search programs and files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchResults[0]) {
                    event.preventDefault();
                    handleOpenRegistryApp(searchResults[0]);
                  }
                }}
                className="h-8 w-full rounded-sm border border-gray-400 px-2 text-[13px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
              {searchQuery.trim() && (
                <div className="absolute bottom-full left-0 mb-1 max-h-56 w-full overflow-auto rounded-sm border border-gray-400 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((app) => (
                      <button
                        key={app.id}
                        className="flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-[#dbeeff]"
                        onClick={() => handleOpenRegistryApp(app)}
                      >
                        <Image
                          src={
                            typeof app.icon === "string"
                              ? app.icon
                              : app.icon.src
                          }
                          alt={app.title}
                          width={18}
                          height={18}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-gray-900">
                            {app.title}
                          </span>
                          <span className="block truncate text-[11px] text-gray-500">
                            {app.category}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-xs text-gray-500">
                      No apps found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex h-full w-[138px] shrink-0 flex-col justify-between bg-gradient-to-b from-[#6ea6d2]/35 via-[#2f73a8]/35 to-[#174d80]/35 p-2 pt-12 shadow-[1px_0_0_rgba(255,255,255,0.22)_inset]">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-xl bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] p-1">
            <Image
              src={avatar}
              alt="User Avatar"
              width={64}
              height={64}
              className="size-16 rounded-lg object-cover shadow-lg"
              priority
            />
          </div>
          <div className="mb-3">
            <div className="flex items-center gap-1 rounded-sm border border-white/25 bg-white/10 p-2 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]">
              <div>
                <div className="text-[13px] font-semibold leading-5 text-white">
                  Syed Abdul Muneeb
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-0">
            {rightPanelItems.map((item) => (
              <button
                key={item.title}
                className="group flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-white/95 transition-colors hover:bg-white/15"
                onClick={() => handleRightPanelItemClick(item)}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <item.icon className="size-4 text-white" />
                  <span className="text-[13px] text-white">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center">
            <button
              className="flex w-full items-center justify-center rounded-sm border border-[#184b76] bg-gradient-to-b from-[#8fc6ec] via-[#4f91c3] to-[#2f6f9e] px-2 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_1px_4px_rgba(0,0,0,0.35)] transition-all hover:from-[#a7d8f4] hover:via-[#5da3d5] hover:to-[#337bac]"
              onClick={handleShutdownClick}
            >
              <Power className="mr-1.5 size-4 text-white" />
              <span className="text-[13px] font-medium text-white">
                Shut down
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
