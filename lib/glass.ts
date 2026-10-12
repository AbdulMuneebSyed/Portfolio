// Liquid Glass refraction. Real glass bends what's behind it most at its
// rim, like a lens, so the edges of a pane magnify and warp the content
// underneath. Chromium can run an SVG displacement filter as a
// backdrop-filter, which does exactly that; WebKit (every iOS browser) and
// Firefox can't, so they keep the CSS frost from .liquid-glass.

export const canRefract = () =>
  typeof navigator !== "undefined" &&
  /Chrome\//.test(navigator.userAgent) &&
  !/iPhone|iPad|iPod/.test(navigator.userAgent);

let svg: SVGSVGElement | null = null;
const filters = new Map<string, string>();

// A displacement map for a rounded rectangle: red and green hold how far to
// sample sideways and up/down, 128 meaning "straight through". Inside the
// bezel the sample is pulled towards the centre, increasingly near the edge,
// so the rim reads as a convex lens.
function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(w, h);
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(radius, hw, hh);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      let dist: number; // distance in from the edge
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy);
        dist = r - len;
        nx = (qx / len) * Math.sign(px);
        ny = (qy / len) * Math.sign(py);
      } else if (qx > qy) {
        dist = r - qx;
        nx = Math.sign(px);
      } else {
        dist = r - qy;
        ny = Math.sign(py);
      }
      const t = Math.max(0, 1 - dist / bezel);
      const k = t * t;
      const i = (y * w + x) * 4;
      img.data[i] = 128 - nx * k * 127;
      img.data[i + 1] = 128 - ny * k * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function filterFor(w: number, h: number, radius: number, bezel: number, strength: number) {
  const key = `${w}x${h}-${radius}-${bezel}-${strength}`;
  const known = filters.get(key);
  if (known) return known;
  const map = displacementMap(w, h, radius, bezel);
  if (!map) return null;
  const ns = "http://www.w3.org/2000/svg";
  if (!svg) {
    svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:fixed;width:0;height:0;pointer-events:none";
    document.body.append(svg);
  }
  const id = `glass-${filters.size}`;
  const filter = document.createElementNS(ns, "filter");
  filter.id = id;
  for (const [k, v] of Object.entries({
    x: "0", y: "0", width: `${w}`, height: `${h}`,
    filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB",
  }))
    filter.setAttribute(k, v);
  const image = document.createElementNS(ns, "feImage");
  for (const [k, v] of Object.entries({ href: map, x: "0", y: "0", width: `${w}`, height: `${h}`, result: "map" }))
    image.setAttribute(k, v);
  const displace = document.createElementNS(ns, "feDisplacementMap");
  for (const [k, v] of Object.entries({
    in: "SourceGraphic", in2: "map", scale: `${strength}`,
    xChannelSelector: "R", yChannelSelector: "G",
  }))
    displace.setAttribute(k, v);
  filter.append(image, displace);
  svg.append(filter);
  const url = `url(#${id})`;
  filters.set(key, url);
  return url;
}

export interface RefractionOptions {
  bezel?: number; // how far in from the edge the bending reaches, px
  strength?: number; // how far the rim pulls the backdrop, px
  after?: string; // backdrop filters applied after the bend
}

// Bends the backdrop of `el` and keeps the map sized to it. Returns a
// cleanup that puts back the CSS backdrop.
export function attachRefraction(el: HTMLElement, options: RefractionOptions = {}) {
  if (!canRefract()) return () => {};
  const { bezel = 14, strength = 36, after = "blur(3px) saturate(1.6) brightness(1.05)" } = options;
  const apply = () => {
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    if (!w || !h) return;
    const raw = getComputedStyle(el).borderTopLeftRadius;
    const radius = raw.endsWith("%")
      ? (parseFloat(raw) / 100) * Math.min(w, h)
      : parseFloat(raw) || 0;
    const url = filterFor(w, h, Math.round(radius), bezel, strength);
    if (url) el.style.backdropFilter = `${url} ${after}`;
  };
  apply();
  const observer = new ResizeObserver(apply);
  observer.observe(el);
  return () => {
    observer.disconnect();
    el.style.backdropFilter = "";
  };
}
