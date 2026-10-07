// Finder icon labels wrap onto two lines; if the name still doesn't fit,
// Finder keeps the first line and shortens the second in the middle
// ("Hackath…Platform"), so the end of the name stays visible.

export type Measure = (text: string) => number;

// Greedy wrap that breaks after spaces and hyphens, like Finder.
function wrap(text: string, width: number, measure: Measure): string[] {
  const parts = text.match(/[^\s-]+-?\s*|\s+/g) ?? [text];
  const lines: string[] = [];
  let line = "";
  for (const part of parts) {
    if (line && measure((line + part).trimEnd()) > width) {
      lines.push(line.trimEnd());
      line = part.trimStart();
    } else {
      line += part;
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}

export function finderNameLines(
  name: string,
  width: number,
  measure: Measure,
): string[] {
  const lines = wrap(name, width, measure);
  if (lines.length <= 2) return lines;
  const first = lines[0];
  const rest = name.slice(name.indexOf(first) + first.length).trimStart();
  // Keep as much of both ends of the rest as fits on one line.
  for (let keep = rest.length - 1; keep > 1; keep--) {
    const head = Math.ceil(keep / 2);
    const second = `${rest.slice(0, head).trimEnd()}…${rest.slice(rest.length - (keep - head)).trimStart()}`;
    if (measure(second) <= width) return [first, second];
  }
  return [first, "…"];
}

let canvas: HTMLCanvasElement | null = null;
const cache = new Map<string, string[]>();

// Measures with the label's own font: 12px system UI.
export function fitFinderName(name: string, width = 100): string[] {
  const key = `${width}:${name}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return [name];
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [name];
  ctx.font =
    '12px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
  const lines = finderNameLines(name, width, (t) => ctx.measureText(t).width);
  cache.set(key, lines);
  return lines;
}
