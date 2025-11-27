"use client";
import { Desktop } from "@/components/desktop";
import { MuneebOS } from "@/components/muneebOS";
import React, { useEffect } from "react";

export default function Home() {
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 1024; // Less than lg breakpoint

      // If switching to mobile, disable sound to prevent startup sound
      // if (newIsMobile && !isMobile) {
      //   setSoundDisabled(true);
      // }

      setIsMobile(newIsMobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobile]);
  return (
    <>
      {!isMobile ? (
        <main className="w-screen hidden md:block h-screen overflow-hidden">
          <Desktop />
        </main>
      ) : (
        <main className="w-screen md:hidden h-screen overflow-hidden">
          <MuneebOS />
        </main>
      )}
    </>
  );
}
