"use client";

import { useState } from "react";
import {
  Gift,
  Github,
  Linkedin,
  Search,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { getApp } from "@/lib/app-registry";
import { launchApp } from "@/lib/launch-app";
import { skillGroups } from "@/lib/portfolio-data";
import {
  MUNEEBOS_VERSION,
  STORE_ITEMS,
  getStoreItem,
  projectsUsing,
  searchStore,
  storeCategories,
  type StoreItem,
  type StoreTab,
} from "@/lib/app-store/catalog";
import { EDITORIAL, type Section } from "@/lib/app-store/editorial";
import { redeemCode } from "@/lib/app-store/actions";
import { useInstalledApps } from "@/lib/app-store/installed";
import {
  AppGrid,
  AppTile,
  FeatureCards,
  GetButton,
  Hero,
  SectionHeader,
  Shelf,
  Stories,
} from "./parts";
import { useStoreNav } from "./nav";
import { useAppName } from "@/lib/phone";
import { categoryIcon } from "./category-icons";

function Skills({ title }: { title: string }) {
  const nav = useStoreNav();
  return (
    <section className="store-section">
      <SectionHeader title={title} />
      <div className="store-skills">
        {skillGroups.map((group) => (
          <div key={group.label} className="store-skill-group">
            <h3>{group.label}</h3>
            <div>
              {group.items.map((skill) => {
                const used = projectsUsing(skill).length;
                return (
                  <button
                    key={skill}
                    className="store-skill"
                    onClick={() => nav.push({ kind: "search", query: skill.split(" (")[0] })}
                  >
                    <strong>{skill}</strong>
                    {used > 0 && (
                      <small>
                        Used in {used} {used === 1 ? "app" : "apps"}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionView({ section }: { section: Section }) {
  switch (section.type) {
    case "hero":
      return <Hero feature={section.feature} />;
    case "cards":
      return <FeatureCards cards={section.cards} />;
    case "stories":
      return <Stories stories={section.stories} />;
    case "shelf":
      return <Shelf title={section.title} itemIds={section.itemIds} />;
    case "skills":
      return <Skills title={section.title} />;
  }
}

export function TabPage({ tab }: { tab: StoreTab }) {
  return (
    <>
      {EDITORIAL[tab].map((section, i) => (
        <SectionView key={i} section={section} />
      ))}
    </>
  );
}


export function CategoriesPage() {
  const nav = useStoreNav();
  return (
    <div className="store-categories">
      {storeCategories().map(({ name, count }) => {
        const Icon = categoryIcon(name);
        return (
          <button key={name} className="store-category" onClick={() => nav.push({ kind: "category", id: name })}>
            <Icon />
            <span>
              <strong>{name}</strong>
              <small>
                {count} {count === 1 ? "item" : "items"}
              </small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ItemsPage({ items }: { items: StoreItem[] }) {
  return <AppGrid items={items} />;
}

export function CategoryPage({ category }: { category: string }) {
  return <ItemsPage items={STORE_ITEMS.filter((i) => i.category === category)} />;
}

export function SeeAllPage({ itemIds }: { itemIds: string[] }) {
  return (
    <ItemsPage
      items={itemIds.map((id) => getStoreItem(id)).filter((i): i is StoreItem => !!i)}
    />
  );
}

const SUGGESTIONS = ["React", "AI", "Games", "Next.js", "MongoDB", "Typing"];

export function SearchPage({ query }: { query: string }) {
  const nav = useStoreNav();
  const results = searchStore(query);
  if (!results.length)
    return (
      <div className="store-empty">
        <Search size={36} />
        <p>No results for “{query}”.</p>
        <div className="store-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => nav.push({ kind: "search", query: s })}>
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  return <ItemsPage items={results} />;
}

export function UpdatesPage() {
  const muneebos = getStoreItem("muneebos")!;
  // Apps that arrived with this MuneebOS version.
  const recent = STORE_ITEMS.filter(
    (item) =>
      item.kind === "app" &&
      getApp(item.appId!)?.installable &&
      item.versions[0]?.date === muneebos.versions[0].date,
  );

  return (
    <>
      <section className="store-section">
        <SectionHeader title={`New in MuneebOS ${MUNEEBOS_VERSION}`} />
        <div className="store-updates">
          {recent.map((item) => (
            <UpdateRow key={item.id} item={item} />
          ))}
        </div>
      </section>
      <section className="store-section">
        <SectionHeader title="MuneebOS Version History" />
        <div className="store-versions">
          {muneebos.versions.map((v) => (
            <div key={v.version} className="store-version">
              <div>
                <strong>Version {v.version}</strong>
                <small>{v.date}</small>
              </div>
              <p>{v.notes}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function UpdateRow({ item }: { item: StoreItem }) {
  const nav = useStoreNav();
  const appName = useAppName();
  return (
    <div className="store-update-row">
      <button onClick={() => nav.openItem(item.id)} aria-label={item.name}>
        <AppIcon appId={item.id} size={64} />
      </button>
      <div className="min-w-0 flex-1">
        <strong>{appName(item.id, item.name)}</strong>
        <small>{item.versions[0].date}</small>
        <p>{item.versions[0].notes}</p>
      </div>
      <GetButton item={item} />
    </div>
  );
}

export function AccountPage() {
  const nav = useStoreNav();
  const overrides = useInstalledApps((s) => s.overrides);
  const [view, setView] = useState<"installed" | "available">("installed");
  const [redeeming, setRedeeming] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const appItems = STORE_ITEMS.filter((item) => item.kind === "app" && item.appId);
  const installable = appItems.filter((item) => getApp(item.appId!)?.installable);
  const installed = installable.filter(
    (item) => overrides[item.appId!] ?? getApp(item.appId!)?.preinstalled === true,
  );
  const shown =
    view === "installed"
      ? [...installed, ...appItems.filter((item) => !getApp(item.appId!)?.installable)]
      : installable.filter((item) => !installed.includes(item));

  return (
    <>
      <div className="store-account-links">
        <button className="store-link" onClick={() => launchApp("github-activity")}>
          <Github size={18} /> GitHub Profile
        </button>
        <button className="store-link" onClick={() => launchApp("linkedin")}>
          <Linkedin size={18} /> LinkedIn
        </button>
        <button className="store-link" onClick={() => setRedeeming(!redeeming)}>
          <Gift size={18} /> Redeem Gift Card
        </button>
      </div>
      {redeeming && (
        <form
          className="store-redeem"
          onSubmit={(e) => {
            e.preventDefault();
            const ids = redeemCode(code);
            setMessage(
              ids
                ? { ok: true, text: `Redeemed! Installing ${ids.length} apps.` }
                : { ok: false, text: "That code isn't valid. Try ARCADE or HIREME." },
            );
            if (ids) setCode("");
          }}
        >
          <label>
            Enter your code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code"
              autoCapitalize="characters"
              aria-describedby="redeem-message"
            />
          </label>
          <button className="store-get" data-prominent="true" disabled={!code.trim()}>
            Redeem
          </button>
          {message && (
            <p id="redeem-message" data-ok={message.ok} role="status">
              {message.text}
            </p>
          )}
        </form>
      )}
      <section className="store-section">
        <SectionHeader title="You Have 1 Developer to Adopt" />
        <div className="store-adopt">
          <p>
            Syed Abdul Muneeb is open to full-time software engineering roles. Adopting him assigns a
            full-stack engineer to your team; no hardware identifier required.
          </p>
          <button className="store-get" data-prominent="true" onClick={() => launchApp("contact")}>
            Hire
          </button>
        </div>
        <div className="store-adopt-apps">
          {["resume", "about"].map((id) => (
            <button key={id} onClick={() => nav.openItem(id)}>
              <AppIcon appId={id} size={56} />
              <span>
                <strong>{getStoreItem(id)!.name}</strong>
                <small>{getStoreItem(id)!.subtitle}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="store-section">
        <div className="store-section-header">
          <h2>My Apps</h2>
          <span className="mac-muted text-[15px] font-semibold">Free</span>
        </div>
        <div className="store-segments" role="tablist">
          {(["installed", "available"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}>
              {v === "installed" ? "Installed" : "Not Installed"}
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="store-tiles">
            {shown.map((item) => (
              <AppTile key={item.id} item={item} installedLabel="Installed" />
            ))}
          </div>
        ) : (
          <p className="mac-muted py-6 text-sm">
            {view === "installed" ? "Nothing installed yet." : "You've got every app. Nice."}
          </p>
        )}
      </section>
    </>
  );
}
