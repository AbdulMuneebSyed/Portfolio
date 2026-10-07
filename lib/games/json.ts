// JSON Formatter helpers: parse with a line/column for errors.
export type JsonResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string; line: number; column: number };

export function lineColumn(text: string, position: number) {
  const before = text.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  return { line, column };
}

export function parseJson(text: string): JsonResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const pos = message.match(/position (\d+)/);
    const lc = message.match(/line (\d+) column (\d+)/);
    if (lc) return { ok: false, message, line: Number(lc[1]), column: Number(lc[2]) };
    const at = pos ? Number(pos[1]) : text.length;
    return { ok: false, message, ...lineColumn(text, at) };
  }
}

export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  return value;
}
