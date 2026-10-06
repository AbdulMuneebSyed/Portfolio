"use client";

import { useState } from "react";
import { Desktop } from "@/components/desktop";
import { LockScreen } from "@/components/mac/lock-screen";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return isLoggedIn ? (
    <Desktop onLock={() => setIsLoggedIn(false)} />
  ) : (
    <LockScreen onUnlock={() => setIsLoggedIn(true)} />
  );
}
