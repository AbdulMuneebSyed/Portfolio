"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AppIcon, PhoneAppIcon } from "@/lib/app-icons";
import { launchApp, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import { useNotifications } from "@/lib/notifications";
import { usePhone } from "@/lib/phone";

// Banners slide in from the right edge below the menu bar, like macOS. On a
// phone they drop down under the Dynamic Island and are swiped up to dismiss.
export function NotificationBanners() {
  const banners = useNotifications((state) => state.banners);
  const dismiss = useNotifications((state) => state.dismiss);
  const phone = usePhone();
  const hidden = phone ? { y: -120, opacity: 0 } : { x: 380, opacity: 0 };

  return (
    <div
      className={`pointer-events-none fixed z-[9500] flex flex-col gap-2 ${
        phone
          ? "inset-x-2 top-[54px]"
          : "right-2.5 w-[356px] max-w-[calc(100vw-20px)]"
      }`}
      style={phone ? undefined : { top: MENU_BAR_HEIGHT + 8 }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            layout
            initial={hidden}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ ...hidden, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="group pointer-events-auto relative"
            {...(phone && {
              drag: "y" as const,
              dragConstraints: { top: 0, bottom: 0 },
              dragElastic: { top: 0.6, bottom: 0.1 },
              onDragEnd: (_: unknown, info: { offset: { y: number } }) => {
                if (info.offset.y < -24) dismiss(banner.id);
              },
            })}
          >
            <button
              className="flex w-full items-start gap-2.5 rounded-[18px] max-[699px]:items-center max-[699px]:rounded-[24px] max-[699px]:px-3.5 max-[699px]:py-3 bg-white/75 px-3 py-2.5 text-left text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_8px_28px_rgba(0,0,0,0.18)] backdrop-blur-3xl hover:bg-white/85 dark:bg-[#2c2c2e]/75 dark:text-white dark:hover:bg-[#3a3a3c]/80"
              onClick={() => {
                dismiss(banner.id);
                launchApp(banner.appId);
              }}
            >
              {phone ? (
                <PhoneAppIcon appId={banner.appId} size={38} />
              ) : (
                <AppIcon appId={banner.appId} size={40} />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold max-[699px]:text-[15px]">
                    {banner.title}
                  </span>
                  <span className="shrink-0 text-[11px] opacity-50">now</span>
                </span>
                <span className="line-clamp-2 text-[13px] leading-snug opacity-80 max-[699px]:text-[15px]">
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
