"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { readString, writeString } from "@/lib/storage";

// Mini-apps take keys only while focused, so typing in another window never
// reaches them. The app root takes focus when the window opens.
export function useFocusRoot<T extends HTMLElement>(preview?: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!preview) ref.current?.focus({ preventScroll: true });
  }, [preview]);
  return ref;
}

export function useStoredNumber(key: string, initial = 0) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const saved = Number(readString(key));
    if (Number.isFinite(saved) && saved > 0) setValue(saved);
  }, [key]);
  const save = (next: number) => {
    setValue(next);
    writeString(key, String(next));
  };
  return [value, save] as const;
}

export function MiniHeader({
  title,
  stats = [],
  action,
}: {
  title: string;
  stats?: { label: string; value: React.ReactNode }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mini-header">
      <h2>{title}</h2>
      <div className="mini-stats">
        {stats.map((s) => (
          <span key={s.label} className="mini-stat">
            <small>{s.label}</small>
            <strong>{s.value}</strong>
          </span>
        ))}
      </div>
      {action}
    </div>
  );
}

export function MiniButton({
  children,
  primary,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button className="mini-button" data-primary={primary} {...props}>
      {children}
    </button>
  );
}
