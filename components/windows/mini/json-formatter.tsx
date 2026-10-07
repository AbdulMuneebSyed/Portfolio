"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { parseJson, sortKeys } from "@/lib/games/json";
import { MiniButton } from "./shared";
import type { MiniAppProps } from "./registry";

const SAMPLE = `{"name":"Syed Abdul Muneeb","role":"Full-Stack Engineer","stack":["React","Next.js","Node.js","MongoDB"],"open_to_work":true,"projects":{"shipped":6,"favourite":"MuneebOS"}}`;

// Colours keys, strings, numbers and literals in formatted JSON.
function highlight(json: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(json))) {
    if (match.index > last) parts.push(json.slice(last, match.index));
    const [text, str, colon, literal] = match;
    const kind = str ? (colon ? "key" : "string") : literal ? "literal" : "number";
    parts.push(
      <span key={match.index} className={`json-${kind}`}>
        {str ?? text}
      </span>,
    );
    if (colon) parts.push(colon);
    last = match.index + text.length;
  }
  parts.push(json.slice(last));
  return parts;
}

export function JsonFormatter({ preview }: MiniAppProps) {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [sorted, setSorted] = useState(false);
  const [minified, setMinified] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => parseJson(input), [input]);

  const output = result.ok
    ? JSON.stringify(sorted ? sortKeys(result.value) : result.value, null, minified ? 0 : indent)
    : "";

  const copy = async () => {
    if (preview || !output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="json-app">
      <div className="json-toolbar">
        <div className="mini-segments small" role="tablist" aria-label="Output">
          <button role="tab" aria-selected={!minified} onClick={() => setMinified(false)}>
            Format
          </button>
          <button role="tab" aria-selected={minified} onClick={() => setMinified(true)}>
            Minify
          </button>
        </div>
        <label className="mini-check">
          Indent
          <select value={indent} disabled={minified} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
        </label>
        <label className="mini-check">
          <input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.target.checked)} />
          Sort keys
        </label>
        <span className="flex-1" />
        <MiniButton onClick={() => setInput("")}>Clear</MiniButton>
        <MiniButton primary disabled={!result.ok} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </MiniButton>
      </div>
      <div className="json-panes">
        <textarea
          aria-label="JSON input"
          spellCheck={false}
          value={input}
          placeholder="Paste JSON here"
          onChange={(e) => setInput(e.target.value)}
        />
        <pre aria-label="Formatted JSON" data-minified={minified}>
          {result.ok ? highlight(output) : null}
        </pre>
      </div>
      <div className="json-status" data-ok={result.ok || !input.trim()} role="status">
        {!input.trim()
          ? "Paste or type JSON to format it."
          : result.ok
            ? `Valid JSON · ${output.length.toLocaleString()} characters`
            : `Line ${result.line}, column ${result.column}: ${result.message}`}
      </div>
    </div>
  );
}
