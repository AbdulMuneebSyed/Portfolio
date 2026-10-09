"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Laptop,
  Smartphone,
  Globe,
  Mail,
  Trash2,
  UserRound,
  Briefcase,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { useAppName } from "@/lib/phone";
import { getApp, isAppInstalled } from "@/lib/app-registry";
import { launchApp } from "@/lib/launch-app";
import {
  STORE_DEVELOPER,
  STORE_ITEMS,
  moreLikeThis,
  type Slide,
  type StoreItem,
} from "@/lib/app-store/catalog";
import { uninstallApp } from "@/lib/app-store/actions";
import { useInstalledApps } from "@/lib/app-store/installed";
import { AppGrid, GetButton, SectionHeader } from "./parts";
import { MockScreen } from "./store-art";
import { LivePreview } from "./live-preview";
import { useStoreNav } from "./nav";
import { categoryIcon } from "./category-icons";

// A job reads as a job: role, dates and place, not chart rank, age rating
// and download size.
function experienceFacts(item: StoreItem) {
  const [role, period] = item.subtitle.split(" · ");
  return { role, period: period ?? item.versions[0]?.date ?? "", location: item.size };
}

function Stats({ item }: { item: StoreItem }) {
  const CategoryIcon = categoryIcon(item.category);
  if (item.kind === "experience") {
    const facts = experienceFacts(item);
    const stats = [
      { label: "Role", value: <Briefcase size={22} />, sub: facts.role },
      { label: "When", value: <CalendarDays size={22} />, sub: facts.period },
      { label: "Where", value: <MapPin size={22} />, sub: facts.location },
    ];
    return (
      <div className="store-stats" role="list">
        {stats.map((s) => (
          <div key={s.label} role="listitem">
            <small>{s.label}</small>
            <strong>{s.value}</strong>
            <span>{s.sub}</span>
          </div>
        ))}
      </div>
    );
  }
  const stats = [
    item.chart && {
      label: "Chart",
      value: `No. ${item.chart.rank}`,
      sub: item.chart.list,
    },
    item.award && { label: "Award", value: "★", sub: item.award },
    { label: "Age", value: item.age, sub: "Years" },
    { label: "Category", value: <CategoryIcon size={22} />, sub: item.category },
    { label: "Developer", value: <UserRound size={22} />, sub: STORE_DEVELOPER },
    item.techStack && {
      label: "Built with",
      value: item.techStack[0],
      sub:
        item.techStack.length > 1
          ? `+ ${item.techStack.length - 1} more`
          : "Stack",
    },
    { label: "Size", value: item.size, sub: "Download" },
  ].filter(Boolean) as { label: string; value: React.ReactNode; sub: string }[];

  return (
    <div className="store-stats" role="list">
      {stats.map((s) => (
        <div key={s.label} role="listitem">
          <small>{s.label}</small>
          <strong>{s.value}</strong>
          <span>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}


function SlideView({ slide, item }: { slide: Slide; item: StoreItem }) {
  return (
    <figure className="store-slide" style={{ background: `linear-gradient(160deg, ${item.tint}, ${item.tint}99)` }}>
      <figcaption>
        <b>{slide.strong}</b> {slide.caption}
      </figcaption>
      <div className="store-slide-frame">
        {slide.image ? (
          <Image src={slide.image} alt="" fill sizes="(max-width: 700px) 90vw, 560px" className="object-cover object-top" />
        ) : slide.live ? (
          <LivePreview appId={slide.live} />
        ) : slide.mock ? (
          <MockScreen kind={slide.mock} tint={item.tint} />
        ) : null}
      </div>
    </figure>
  );
}

function Screenshots({ item }: { item: StoreItem }) {
  const [index, setIndex] = useState(0);
  const count = item.slides.length;
  const scrollTo = (strip: HTMLElement | null, i: number) => {
    const next = Math.max(0, Math.min(count - 1, i));
    setIndex(next);
    const child = strip?.children[next] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  return (
    <section className="store-shots">
      <div
        className="store-shots-strip"
        tabIndex={0}
        aria-label={`${item.name} screenshots`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollTo(e.currentTarget, index + 1);
          if (e.key === "ArrowLeft") scrollTo(e.currentTarget, index - 1);
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
          setIndex(Math.round(el.scrollLeft / w));
        }}
      >
        {item.slides.map((slide, i) => (
          <SlideView key={i} slide={slide} item={item} />
        ))}
      </div>
      {count > 2 && (
        <div className="store-shots-nav">
          <button
            aria-label="Previous screenshot"
            disabled={index === 0}
            onClick={(e) => scrollTo(e.currentTarget.parentElement!.previousElementSibling as HTMLElement, index - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Next screenshot"
            disabled={index >= count - 2}
            onClick={(e) => scrollTo(e.currentTarget.parentElement!.previousElementSibling as HTMLElement, index + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <div className="store-platforms">
        {item.platforms.map((p) => (
          <span key={p}>
            {p === "Mac" ? <Laptop size={16} /> : p === "Web" ? <Globe size={16} /> : <Smartphone size={16} />}
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}

function Description({ item }: { item: StoreItem }) {
  const [expanded, setExpanded] = useState(false);
  const long = item.description.length > 180 || (item.highlights?.length ?? 0) > 0;
  return (
    <section className="store-description">
      <div className="store-description-text">
        <p data-expanded={expanded}>{item.description}</p>
        {expanded && item.highlights && item.kind !== "experience" && (
          <ul>
            {item.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        {long && !expanded && (
          <button className="store-link" onClick={() => setExpanded(true)}>
            more
          </button>
        )}
      </div>
      <div className="store-description-links">
        <button className="store-link" onClick={() => launchApp("about")}>
          {STORE_DEVELOPER}
        </button>
        {item.website && (
          <button className="store-aside-link" onClick={() => launchApp("ie", { url: item.website, at: Date.now() })}>
            Website <Compass size={18} />
          </button>
        )}
        <button className="store-aside-link" onClick={() => launchApp("contact")}>
          Support <Mail size={18} />
        </button>
      </div>
    </section>
  );
}

function WhatsNew({ item }: { item: StoreItem }) {
  const [all, setAll] = useState(false);
  const [latest, ...older] = item.versions;
  return (
    <section className="store-section">
      <SectionHeader
        title={all ? "Version History" : "What's New"}
        onSeeAll={older.length ? () => setAll(!all) : undefined}
      />
      <div className="store-versions">
        {(all ? item.versions : [latest]).map((v) => (
          <div key={v.version + v.date} className="store-version">
            <div>
              <strong>{v.version.match(/^\d/) ? `Version ${v.version}` : v.version}</strong>
              <small>{v.date}</small>
            </div>
            <p>{v.notes}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Information({ item }: { item: StoreItem }) {
  const app = item.appId ? getApp(item.appId) : undefined;
  if (item.kind === "experience") {
    const facts = experienceFacts(item);
    const rows: [string, string][] = [
      ["Company", item.name],
      ["Role", facts.role],
      ["Dates", facts.period],
      ["Location", facts.location],
      ...(item.website ? ([["Website", item.website.replace(/^https?:\/\/(www\.)?|\/$/g, "")]] as [string, string][]) : []),
    ];
    return (
      <section className="store-section">
        <SectionHeader title="Information" />
        <dl className="store-info">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  const rows: [string, string][] = [
    ["Developer", STORE_DEVELOPER],
    ["Category", item.category],
    ["Size", item.size],
    ["Compatibility", item.platforms.join(", ")],
    ["Languages", "English"],
    ["Age Rating", item.age],
    ...(item.techStack ? ([["Built with", item.techStack.join(", ")]] as [string, string][]) : []),
    ...(app?.launchAliases?.length
      ? ([["Terminal", `open ${app.launchAliases[0]}`]] as [string, string][])
      : []),
    ["Price", "Free"],
    ["Copyright", `© 2026 ${STORE_DEVELOPER}`],
  ];
  return (
    <section className="store-section">
      <SectionHeader title="Information" />
      <dl className="store-info">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductPage({ item }: { item: StoreItem }) {
  const nav = useStoreNav();
  useInstalledApps((s) => s.overrides);
  const app = item.appId ? getApp(item.appId) : undefined;
  const removable = !!app?.installable && isAppInstalled(app.id);
  const related = moreLikeThis(item);
  const appName = useAppName();
  const byDeveloper = STORE_ITEMS.filter(
    (other) => other.kind === "project" && other.id !== item.id,
  ).slice(0, 6);

  return (
    <article className="store-product">
      <header className="store-product-header">
        <AppIcon appId={item.id} size={nav.narrow ? 104 : 148} />
        <div className="min-w-0">
          <h1>{appName(item.id, item.name)}</h1>
          <p>{item.subtitle}</p>
          <button className="store-link" onClick={() => launchApp("about")}>
            {STORE_DEVELOPER}
          </button>
          <div className="store-product-actions">
            <GetButton item={item} prominent />
            {removable && (
              <button
                className="store-remove"
                aria-label={`Delete ${item.name}`}
                title="Delete app"
                onClick={() => uninstallApp(app.id)}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </header>
      <Stats item={item} />
      <Screenshots item={item} />
      <Description item={item} />
      <WhatsNew item={item} />
      <Information item={item} />
      {related.length > 0 && (
        <section className="store-section">
          <SectionHeader title="You Might Also Like" />
          <AppGrid items={related} />
        </section>
      )}
      {item.kind !== "project" && (
        <section className="store-section">
          <SectionHeader title={`More by ${STORE_DEVELOPER}`} />
          <AppGrid items={byDeveloper} />
        </section>
      )}
    </article>
  );
}
