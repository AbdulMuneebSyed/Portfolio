"use client";

import type React from "react";
import { ChevronRight, CloudDownload } from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { useAppName } from "@/lib/phone";
import { getApp, isAppInstalled } from "@/lib/app-registry";
import { launchApp } from "@/lib/launch-app";
import { getStoreItem, type StoreItem } from "@/lib/app-store/catalog";
import type { Feature } from "@/lib/app-store/editorial";
import { installApp } from "@/lib/app-store/actions";
import { useInstalledApps } from "@/lib/app-store/installed";
import { StoreArt } from "./store-art";
import { useStoreNav } from "./nav";

// What the item's main button does right now.
export type ItemAction = "get" | "installing" | "open" | "view";

export function useItemAction(item: StoreItem): {
  action: ItemAction;
  progress: number;
} {
  // Subscribe so the button changes as soon as an install finishes.
  useInstalledApps((s) => s.overrides);
  const progress = useInstalledApps((s) =>
    item.appId ? s.progress[item.appId] : undefined,
  );
  if (progress !== undefined) return { action: "installing", progress };
  if (item.kind === "project") return { action: item.website ? "view" : "open", progress: 0 };
  if (item.appId && !isAppInstalled(item.appId)) return { action: "get", progress: 0 };
  return { action: "open", progress: 0 };
}

export function runItemAction(item: StoreItem, action: ItemAction) {
  if (action === "installing") return;
  if (action === "get" && item.appId) {
    void installApp(item.appId);
    return;
  }
  // A job opens its company's site in Safari.
  if ((action === "view" || item.kind === "experience") && item.website) {
    launchApp("ie", { url: item.website, at: Date.now() });
    return;
  }
  if (item.kind === "project") {
    launchApp("projects");
    return;
  }
  if (item.appId) launchApp(item.appId, item.aboutTab ? { tab: item.aboutTab } : undefined);
}

const LABELS: Record<ItemAction, string> = {
  get: "Get",
  installing: "Installing",
  open: "Open",
  view: "View",
};

export function GetButton({
  item,
  prominent = false,
}: {
  item: StoreItem;
  prominent?: boolean;
}) {
  const { action, progress } = useItemAction(item);
  if (action === "installing") {
    const r = 11;
    const c = 2 * Math.PI * r;
    return (
      <span
        className="store-progress"
        role="progressbar"
        aria-label={`Installing ${item.name}`}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <circle cx="14" cy="14" r={r} className="store-progress-track" />
          <circle
            cx="14"
            cy="14"
            r={r}
            className="store-progress-bar"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
          />
          <rect x="11" y="11" width="6" height="6" rx="1" className="store-progress-stop" />
        </svg>
      </span>
    );
  }
  return (
    <button
      className="store-get"
      data-prominent={prominent}
      aria-label={`${LABELS[action]} ${item.name}`}
      onClick={(e) => {
        e.stopPropagation();
        runItemAction(item, action);
      }}
    >
      {LABELS[action]}
    </button>
  );
}

export function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="store-section-header">
      <h2>{title}</h2>
      {onSeeAll && (
        <button className="store-link" onClick={onSeeAll}>
          See All
        </button>
      )}
    </div>
  );
}

export function AppRow({ item }: { item: StoreItem }) {
  const nav = useStoreNav();
  const appName = useAppName();
  return (
    <div className="store-row">
      <button
        className="store-row-main"
        onClick={() => nav.openItem(item.id)}
        aria-label={`${item.name}, ${item.subtitle}`}
      >
        <AppIcon appId={item.id} size={64} />
        <span className="min-w-0">
          <strong>{appName(item.id, item.name)}</strong>
          <small>{item.subtitle}</small>
        </span>
      </button>
      <GetButton item={item} />
    </div>
  );
}

const SHELF_LIMIT = 9;

export function Shelf({ title, itemIds }: { title: string; itemIds: string[] }) {
  const nav = useStoreNav();
  const items = itemIds
    .map((id) => getStoreItem(id))
    .filter((item): item is StoreItem => !!item);
  return (
    <section className="store-section">
      <SectionHeader
        title={title}
        onSeeAll={
          items.length > 3
            ? () => nav.push({ kind: "see-all", title, itemIds })
            : undefined
        }
      />
      <AppGrid items={items.slice(0, SHELF_LIMIT)} />
    </section>
  );
}

export function AppGrid({ items }: { items: StoreItem[] }) {
  return (
    <div className="store-grid">
      {items.map((item) => (
        <AppRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function FeatureText({ feature, large }: { feature: Feature; large?: boolean }) {
  return (
    <>
      <span className="store-eyebrow">{feature.eyebrow}</span>
      {large ? <h3 className="store-hero-title">{feature.title}</h3> : <h3>{feature.title}</h3>}
      <p>{feature.subtitle}</p>
    </>
  );
}

export function Hero({ feature }: { feature: Feature }) {
  const nav = useStoreNav();
  return (
    <button className="store-hero" onClick={() => nav.openItem(feature.itemId)}>
      <span className="store-hero-text" style={{ "--tint": feature.art.colors[1] } as React.CSSProperties}>
        <span>
          <FeatureText feature={feature} large />
        </span>
      </span>
      <StoreArt art={feature.art} className="store-hero-art" />
    </button>
  );
}

export function FeatureCards({ cards }: { cards: Feature[] }) {
  const nav = useStoreNav();
  return (
    <section className="store-cards">
      {cards.map((card) => (
        <button key={card.itemId + card.title} className="store-card" onClick={() => nav.openItem(card.itemId)}>
          <span className="store-card-text">
            <FeatureText feature={card} />
          </span>
          <StoreArt art={card.art} className="store-card-art" round />
        </button>
      ))}
    </section>
  );
}

export function Stories({ stories }: { stories: Feature[] }) {
  const nav = useStoreNav();
  return (
    <section className="store-stories">
      {stories.map((story) => (
        <button key={story.itemId + story.title} className="store-story" onClick={() => nav.openItem(story.itemId)}>
          <StoreArt art={story.art} className="store-story-art" />
          <span className="store-story-text">
            <FeatureText feature={story} />
          </span>
        </button>
      ))}
    </section>
  );
}

// An installed-apps tile for Account › My Apps.
export function AppTile({ item, installedLabel }: { item: StoreItem; installedLabel: string }) {
  const nav = useStoreNav();
  const appName = useAppName();
  const { action } = useItemAction(item);
  const app = item.appId ? getApp(item.appId) : undefined;
  return (
    <div className="store-tile">
      <button onClick={() => nav.openItem(item.id)} aria-label={item.name}>
        <AppIcon appId={item.id} size={112} />
      </button>
      <div className="min-w-0">
        <strong>{appName(item.id, item.name)}</strong>
        <small>{app?.installable ? installedLabel : "Built in"}</small>
        {action === "get" ? (
          <button
            className="store-cloud"
            aria-label={`Download ${item.name}`}
            onClick={() => runItemAction(item, action)}
          >
            <CloudDownload size={22} />
          </button>
        ) : (
          <GetButton item={item} />
        )}
      </div>
    </div>
  );
}

export function LinkRow({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button className="store-link-row" onClick={onClick}>
      {icon}
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}
