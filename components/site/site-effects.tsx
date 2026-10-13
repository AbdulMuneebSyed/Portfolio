"use client";

import { useEffect } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

// The website's motion, added on top of the server HTML:
// - the nav pill's menu
// - the portrait that rides down from the hero into "Hey!", flipping from
//   its black-and-white back to its colour front
// - the quote whose words darken as you scroll through it
// - titles and cards that sharpen into view
export function SiteEffects() {
  useEffect(() => {
    const site = document.getElementById("site");
    if (!site) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    site.dataset.js = "";

    // Menu
    const nav = site.querySelector<HTMLElement>(".mj-nav");
    const toggle = nav?.querySelector<HTMLButtonElement>(".mj-nav-toggle");
    const setOpen = (open: boolean) => {
      if (!nav || !toggle) return;
      nav.toggleAttribute("data-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const onToggle = () => setOpen(!nav?.hasAttribute("data-open"));
    const onNavClick = (e: MouseEvent) => {
      if ((e.target as Element).closest(".mj-nav-links a")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onOutside = (e: PointerEvent) => {
      if (nav && !nav.contains(e.target as Node)) setOpen(false);
    };
    toggle?.addEventListener("click", onToggle);
    nav?.addEventListener("click", onNavClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);

    // Sharpen into view
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          seen.unobserve(entry.target);
        }
      },
      { root: site, rootMargin: "0px 0px -12% 0px" },
    );
    site.querySelectorAll("[data-reveal]").forEach((el) => seen.observe(el));

    // Scroll-driven: portrait and quote
    const stage = site.querySelector<HTMLElement>(".mj-stage");
    const hero = site.querySelector<HTMLElement>(".mj-hero");
    const card = site.querySelector<HTMLElement>(".mj-portrait-card");
    const quote = site.querySelector<HTMLElement>(".mj-quote");
    const words = quote ? [...quote.querySelectorAll<HTMLElement>("span")] : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = site.clientHeight;
      if (stage && hero && card) {
        const p = still ? 1 : clamp(-stage.getBoundingClientRect().top / hero.offsetHeight);
        card.style.setProperty("--p", p.toFixed(4));
        card.style.setProperty("--drop", `${((1 - p) * (vh / 2 - 130)).toFixed(1)}px`);
      }
      if (quote) {
        const top = quote.getBoundingClientRect().top;
        const p = still ? 1 : clamp((vh * 0.8 - top) / (vh * 0.55));
        const lit = Math.round(p * words.length);
        words.forEach((w, i) => w.toggleAttribute("data-lit", i < lit));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    site.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      toggle?.removeEventListener("click", onToggle);
      nav?.removeEventListener("click", onNavClick);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      seen.disconnect();
      site.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
