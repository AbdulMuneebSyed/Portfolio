// What Safari does with whatever is typed into the Smart Search field: a
// website name opens that site, anything else becomes a web search.

export const START_PAGE = "safari:start";

const SEARCH = "https://www.google.com/search?igu=1&q=";

export function resolveAddress(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  if (text === START_PAGE) return text;
  const looksLikeSite =
    !/\s/.test(text) &&
    (/^https?:\/\//i.test(text) || /^[^/]+\.[a-z]{2,}(?::\d+)?(\/.*)?$/i.test(text) || /^localhost(:\d+)?(\/.*)?$/i.test(text));
  if (looksLikeSite) {
    try {
      const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch {
      /* fall through to a search */
    }
  }
  return SEARCH + encodeURIComponent(text);
}

// The search terms, when the URL is one of our searches.
export function searchQuery(url: string): string | null {
  return url.startsWith(SEARCH) ? decodeURIComponent(url.slice(SEARCH.length)) : null;
}

// Safari shows just the site name ("apple.com") while you aren't editing.
export function hostLabel(url: string): string {
  if (url === START_PAGE) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Bookmarks and history match even if one has a trailing slash.
export function sameUrl(a: string, b: string): boolean {
  const strip = (u: string) => u.replace(/\/+$/, "").toLowerCase();
  return strip(a) === strip(b);
}
