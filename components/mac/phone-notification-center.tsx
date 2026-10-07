"use client";

import type React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { launchApp } from "@/lib/launch-app";
import { useNotifications } from "@/lib/notifications";
import { NoticeList } from "./notice-list";

// iPhone Notification Center: pulled down from the top-left of the status
// bar, a blurred sheet like the lock screen with every unread notification.
// Swipe up or tap an empty spot to put it away.
export function PhoneNotificationCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const empty = useNotifications((state) => state.notices.length === 0);
  const [swipe, setSwipe] = useState<number | null>(null);
  const now = new Date();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pnc"
          className="pnc"
          role="dialog"
          aria-label="Notification Center"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 40 }}
          onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
          onPointerDown={(e: React.PointerEvent) => setSwipe(e.clientY)}
          onPointerUp={(e: React.PointerEvent) => {
            if (swipe !== null && swipe - e.clientY > 60) onClose();
            setSwipe(null);
          }}
        >
          <div className="pnc-clock" onClick={onClose}>
            <div>
              {now.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <div>
              {now
                .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                .replace(/\s?[AP]M$/i, "")}
            </div>
          </div>
          <div className="pnc-list">
            {empty ? (
              <p className="pnc-empty">No Older Notifications</p>
            ) : (
              <NoticeList
                variant="lock"
                header
                onOpen={(notice) => {
                  useNotifications.getState().remove(notice.id);
                  onClose();
                  launchApp(notice.appId);
                }}
              />
            )}
          </div>
          <span className="pnc-handle" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
