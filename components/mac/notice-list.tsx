"use client";

import { useEffect, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AppIcon, PhoneAppIcon } from "@/lib/app-icons";
import { type Notice, timeAgo, useNotifications } from "@/lib/notifications";
import { usePhone } from "@/lib/phone";

// Unread notifications, newest first: in Notification Center ("center", the
// light material) and over the wallpaper on the lock screen ("lock", glass).
// Tapping one opens it; X, or a swipe left on a phone, clears it.

function useMinuteClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const CARD = {
  center:
    "bg-white/70 text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl hover:bg-white/85 dark:bg-[#2c2c2e]/70 dark:text-white dark:hover:bg-[#3a3a3c]/80",
  lock: "bg-white/[0.22] text-white shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.3)] backdrop-blur-[24px] backdrop-saturate-[1.6] hover:bg-white/30",
};

export function NoticeList({
  variant,
  onOpen,
  limit,
  header = false,
}: {
  variant: "center" | "lock";
  onOpen: (notice: Notice) => void;
  limit?: number;
  header?: boolean;
}) {
  const notices = useNotifications((state) => state.notices);
  const remove = useNotifications((state) => state.remove);
  const clearAll = useNotifications((state) => state.clearAll);
  const phone = usePhone();
  const now = useMinuteClock();
  const shown = limit ? notices.slice(0, limit) : notices;
  const more = notices.length - shown.length;
  const muted = variant === "lock" ? "text-white/70" : "opacity-60";

  if (notices.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 [text-shadow:none]">
      {header && (
        <div
          className={`flex items-center justify-between px-1 text-[13px] font-semibold ${
            variant === "lock" ? "text-white" : "text-[#1d1d1f] dark:text-white"
          }`}
        >
          <span>Notifications</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
              variant === "lock" ? "bg-white/20" : "bg-black/[0.06] dark:bg-white/10"
            }`}
          >
            Clear All
          </button>
        </div>
      )}
      <AnimatePresence initial={false}>
        {shown.map((notice) => (
          <motion.div
            key={notice.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -60, transition: { duration: 0.18 } }}
            className="group relative"
            {...(phone && {
              drag: "x" as const,
              dragConstraints: { left: 0, right: 0 },
              dragElastic: { left: 0.7, right: 0.05 },
              onPointerDown: (e: PointerEvent) => e.stopPropagation(),
              onDragEnd: (_: unknown, info: { offset: { x: number } }) => {
                if (info.offset.x < -80) remove(notice.id);
              },
            })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(notice);
              }}
              className={`flex w-full items-start gap-2.5 rounded-[18px] px-3 py-2.5 text-left max-[699px]:items-center max-[699px]:rounded-[24px] max-[699px]:px-3.5 max-[699px]:py-3 ${CARD[variant]}`}
            >
              {phone ? (
                <PhoneAppIcon appId={notice.appId} size={38} />
              ) : (
                <AppIcon appId={notice.appId} size={36} />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold max-[699px]:text-[15px]">
                    {notice.title}
                  </span>
                  <span className={`shrink-0 text-[11px] max-[699px]:text-[13px] ${muted}`}>
                    {timeAgo(notice.at, now)}
                  </span>
                </span>
                <span className="line-clamp-2 text-[13px] leading-snug opacity-85 max-[699px]:text-[15px]">
                  {notice.body}
                </span>
              </span>
            </button>
            {!phone && (
              <button
                aria-label="Clear notification"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(notice.id);
                }}
                className="absolute -left-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow ring-1 ring-black/10 group-hover:flex focus-visible:flex dark:bg-[#3a3a3c] dark:text-white"
              >
                <X className="size-3" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {more > 0 && (
        <div className={`text-center text-[12px] font-medium ${muted}`}>
          {more} more notification{more === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
