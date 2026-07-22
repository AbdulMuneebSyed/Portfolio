"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Power, Wifi, Volume2 } from "lucide-react";
import avatar from "../public/avatar.jpg";
import windowsLogo from "../public/windowsstart.png";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogin = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isWelcoming) return;

    setIsWelcoming(true);
    window.setTimeout(onLogin, 950);
  };

  const formattedTime =
    time?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
  const formattedDate =
    time?.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    }) ?? "";

  return (
    <div className="relative flex h-dvh w-dvw overflow-hidden bg-[#0d315f] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/xp.jpg')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.38),transparent_26%),linear-gradient(180deg,rgba(1,32,78,0.18),rgba(2,16,35,0.45)_58%,rgba(1,8,17,0.72))]" />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex flex-1 items-center justify-center pb-12">
          <div className="flex min-w-[420px] flex-col items-center">
            <div className="mb-5 flex size-28 items-center justify-center rounded-md border border-white/70 bg-white/20 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md">
              <Image
                src={avatar}
                alt="Syed Abdul Muneeb"
                className="size-full rounded-sm object-cover"
                priority
              />
            </div>

            {isWelcoming ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 text-[28px] font-light drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)]">
                  Welcome
                </div>
                <div className="h-2 w-48 overflow-hidden rounded-full border border-white/40 bg-black/25">
                  <div className="h-full w-1/2 animate-[loginProgress_0.95s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#6db6ff] via-white to-[#6db6ff]" />
                </div>
              </div>
            ) : (
              <>
                <h1 className="mb-3 text-[28px] font-light drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)]">
                  Syed Abdul Muneeb
                </h1>
                <form
                  onSubmit={handleLogin}
                  className="flex items-center rounded-sm border border-[#526b82] bg-white p-0.5 shadow-[0_2px_7px_rgba(0,0,0,0.45)]"
                >
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    aria-label="Password"
                    placeholder="Password"
                    className="h-8 w-56 bg-white px-2 text-sm text-black outline-none placeholder:text-slate-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    aria-label="Log in"
                    className="flex size-8 items-center justify-center rounded-sm border border-[#496579] bg-gradient-to-b from-[#eef7ff] to-[#8eb8d6] text-[#193c57] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] hover:from-white hover:to-[#a8cbe2]"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </form>
                <button
                  onClick={() => handleLogin()}
                  className="mt-4 rounded px-3 py-1 text-xs text-white/85 drop-shadow hover:bg-white/10"
                >
                  Log on without password
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex h-16 items-center justify-between border-t border-white/20 bg-black/25 px-6 shadow-[0_-1px_0_rgba(255,255,255,0.16)_inset] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image
              src={windowsLogo}
              alt="Windows"
              width={34}
              height={34}
              className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]"
            />
            <div>
              <div className="text-sm font-semibold drop-shadow">MuneebOS 7</div>
              <div className="text-xs text-white/75">Portfolio workstation</div>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="text-right">
              <div className="font-medium">{formattedTime}</div>
              <div className="text-xs text-white/75">{formattedDate}</div>
            </div>
            <div className="flex items-center gap-3 text-white/85">
              <Volume2 className="size-4" />
              <Wifi className="size-4" />
              <button
                aria-label="Power"
                className="flex size-9 items-center justify-center rounded-sm border border-white/20 bg-white/10 hover:bg-white/20"
              >
                <Power className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
