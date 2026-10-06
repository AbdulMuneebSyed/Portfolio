"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { launchApp, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import { useNotifications } from "@/lib/notifications";

// Banners slide in from the right edge below the menu bar, like macOS.
export function NotificationBanners() {
  const banners = useNotifications((state) => state.banners);
  const dismiss = useNotifications((state) => state.dismiss);

  return (
    <div
      className="pointer-events-none fixed right-2.5 z-[9500] flex w-[356px] max-w-[calc(100vw-20px)] flex-col gap-2"
      style={{ top: MENU_BAR_HEIGHT + 8 }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            layout
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="group pointer-events-auto relative"
          >
            <button
              className="flex w-full items-start gap-2.5 rounded-[18px] bg-white/75 px-3 py-2.5 text-left text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_8px_28px_rgba(0,0,0,0.18)] backdrop-blur-3xl hover:bg-white/85 dark:bg-[#2c2c2e]/75 dark:text-white dark:hover:bg-[#3a3a3c]/80"
              onClick={() => {
                dismiss(banner.id);
                launchApp(banner.appId);
              }}
            >
              <AppIcon appId={banner.appId} size={40} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">
                    {banner.title}
                  </span>
                  <span className="shrink-0 text-[11px] opacity-50">now</span>
                </span>
                <span className="line-clamp-2 text-[13px] leading-snug opacity-80">
                  {banner.body}
                </span>
              </span>
            </button>
            <button
              aria-label="Dismiss notification"
              className="absolute -left-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow ring-1 ring-black/10 group-hover:flex focus-visible:flex dark:bg-[#3a3a3c] dark:text-white"
              onClick={() => dismiss(banner.id)}
            >
              <X className="size-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
