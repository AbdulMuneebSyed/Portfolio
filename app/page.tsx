"use client";
import { Desktop } from "@/components/desktop";
import { LoginScreen } from "@/components/login-screen";
import { MuneebOS } from "@/components/muneebOS";
import React from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return (
    <div className="!h-dvh !w-dvw overflow-clip">
      <main className="!h-dvh !w-dvw overflow-clip">
        {isMobile === null ? (
          <div className="h-dvh w-dvw bg-black" />
        ) : isMobile ? (
          <MuneebOS />
        ) : isLoggedIn ? (
          <Desktop />
        ) : (
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        )}
      </main>
    </div>
  );
}
