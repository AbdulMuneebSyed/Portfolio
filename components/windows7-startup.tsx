"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function Windows7Startup() {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 500);

    const timer2 = setTimeout(() => {
      setAnimationStage(2);
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden cursor-pointer">
      {animationStage >= 1 && (
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div
              className="relative z-10 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.8s" }}
            >
              <Image
                src="/windowslogo.png"
                alt="Windows Logo"
                width={200}
                height={200}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <div
            className="text-white text-2xl font-light tracking-wide opacity-0 animate-fade-in"
            style={{
              fontFamily: "Segoe UI, sans-serif",
              animationDelay: "1.2s",
            }}
          >
            Starting Windows
          </div>
        </div>
      )}
    </div>
  );
}
