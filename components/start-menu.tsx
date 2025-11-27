"use client";

import { useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import calc from "../public/calc.png";
import {
  Search,
  ArrowRight,
  Folder,
  FileText,
  ImageIcon,
  Music,
  Download,
  Settings,
  LogOut,
  Power,
  ChevronRight,
  User,
  HardDrive,
  Wifi,
  Shield,
  Printer,
  HelpCircle,
  Calculator,
  Mail,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import avatar from "../public/avatar.jpg";
import { motion, AnimatePresence } from "framer-motion";
interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow, desktopIcons, shutdown } = useWindowManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  const handleOpenApp = (iconId: string) => {
    const icon = desktopIcons.find((i) => i.id === iconId);
    if (icon) {
      openWindow({
        id: icon.id,
        title: icon.title,
        icon: typeof icon.icon === "string" ? icon.icon : icon.icon.src,
        component: icon.component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
        size: { width: 800, height: 600 },
      });
      onClose();
    }
  };

  const handleOpenPinnedApp = (app: any) => {
    openWindow({
      id: app.id,
      title: app.title,
      icon: app.icon,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
      size: { width: 400, height: 550 },
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

  const pinnedApps = [
    {
      id: "calculator",
      title: "Calculator",
      icon: calc,
      component: "Calculator",
      iconBg: "#4A90E2",
    },
  ];

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
        className="fixed bottom-10 left-1 w-[280px] sm:w-[350px] md:w-[420px] h-[400px] sm:h-[500px] md:h-[580px] bg-white rounded-t-lg overflow-visible z-[9999] flex shadow-2xl border bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] p-2 sm:p-3 md:p-4 pl-1 pb-1 border-gray-400"
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
        <div className="flex-1 rounded-lg bg-white p-0 flex flex-col">
          <div className="flex-1 p-2">
            {pinnedApps.map((app, index) => (
              <motion.button
                key={app.id}
                className="w-full flex items-center gap-2 sm:gap-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 transition-all text-left rounded-sm group border border-transparent hover:border-blue-300"
                onClick={() => handleOpenPinnedApp(app)}
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
                  className="sm:w-[40px] sm:h-[40px] object-contain md:w-[52px] md:h-[52px]"
                />
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                    {app.title}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}

            <div className="h-px bg-gray-300 my-4 mx-2" />
          </div>
          <div className="border-t border-gray-200 p-2 relative">
            <div
              className="relative"
              onMouseEnter={() => {
                console.log("Mouse entered All Programs");
                setShowAllPrograms(true);
              }}
              onMouseLeave={() => {
                console.log("Mouse left All Programs");
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
                  <div className="p-2 max-h-full overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-600 mb-2 px-1">
                      All Programs
                    </div>
                    {desktopIcons && desktopIcons.length > 0 ? (
                      desktopIcons.map((icon) => (
                        <button
                          key={icon.id}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 transition-all text-left border border-transparent hover:border-blue-300"
                          onClick={() => {
                            if (icon.id === "linkedin") {
                              window.open(
                                "https://www.linkedin.com/in/syed-abdul-muneeb/",
                                "_blank"
                              );
                              onClose();
                            } else {
                              handleOpenApp(icon.id);
                            }
                          }}
                        >
                          <Image
                            src={
                              typeof icon.icon === "string"
                                ? icon.icon
                                : icon.icon.src
                            }
                            alt={icon.title}
                            width={16}
                            height={16}
                          />
                          <span className="text-sm text-gray-900">
                            {icon.title}
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

          <div className="p-1 sm:p-2 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search programs and files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-2 pr-6 sm:pr-8 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-400 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        <div className="w-[120px] sm:w-[150px] md:w-[180px] pt-6 sm:pt-8 md:pt-10 relative bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] p-1 sm:p-2 flex flex-col justify-between">
          <div className="rounded-xl absolute -top-10 sm:-top-12 md:-top-16 left-1/2 bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] p-1 -translate-x-1/2">
            <Image
              src={avatar}
              alt="User Avatar"
              width={50}
              height={50}
              className="sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px] rounded-lg shadow-lg"
              priority
            />
          </div>
          <div className="mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-black/10 rounded-sm border border-white/20">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  Syed Abdul Muneeb
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-0">
            {rightPanelItems.map((item) => (
              <button
                key={item.title}
                className="w-full flex items-center justify-between px-1 sm:px-2 py-1 sm:py-1.5 text-left hover:bg-white/10 transition-colors rounded-sm group"
                onClick={() => handleRightPanelItemClick(item)}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm text-white">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center mt-2 sm:mt-3 md:mt-4">
            <button
              className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-sm bg-gradient-to-b from-[#4F8CB8] to-[#326EA0] hover:from-[#5A96C2] hover:to-[#3A7BB0] transition-all shadow-md border border-[#326EA0]"
              onClick={handleShutdownClick}
            >
              <Power className="w-3 h-3 sm:w-4 sm:h-4 text-white mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm font-medium text-white">
                Shut down
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
