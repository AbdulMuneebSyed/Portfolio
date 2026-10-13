"use client";

import Image from "next/image";
import type React from "react";
import { getStoreItem } from "@/lib/app-store/catalog";
import { MockScreen } from "@/components/windows/app-store/store-art";
import { AppIcon } from "@/lib/app-icons";

// A project's picture: its App Store screenshot (a capture, or a drawn
// screen where the live site can't be captured) on its tint.
export function ProjectShot({ id }: { id: string }) {
  const item = getStoreItem(id);
  const slide = item?.slides[0];
  const tint = item?.tint ?? "#111111";
  return (
    <div className="mj-shot" style={{ "--tint": tint } as React.CSSProperties}>
      <div className="mj-screen">
        {slide?.image ? (
          <Image src={slide.image} alt="" fill sizes="(min-width: 810px) 520px, 90vw" />
        ) : slide?.mock ? (
          <MockScreen kind={slide.mock} tint={tint} />
        ) : null}
      </div>
    </div>
  );
}

// A company's App Store icon, for the experience cards.
export function CompanyIcon({ id }: { id: string }) {
  return <AppIcon appId={`exp-${id}`} size={44} />;
}
