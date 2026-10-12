"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Download } from "lucide-react";
import { readString, writeString } from "@/lib/storage";

const STORAGE_KEY = "muneebos-notes";

export function Notepad() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const saved = readString(STORAGE_KEY);
    setText(
      saved ??
        "Project Notes\n\nA little space for your ideas.",
    );
    setLoaded(true);
  }, []);
  // Saved a beat after typing stops, not on every keystroke; the latest text
  // is also written when the window closes or the page is hidden, so nothing
  // typed is lost.
  const latest = useRef<string | null>(null);
  const save = () => {
    if (latest.current === null) return;
    writeString(STORAGE_KEY, latest.current);
    latest.current = null;
  };
  useEffect(() => {
    if (!loaded) return;
    latest.current = text;
    const id = window.setTimeout(save, 400);
    return () => window.clearTimeout(id);
  }, [text, loaded]);
  useEffect(() => {
    addEventListener("pagehide", save);
    return () => {
      removeEventListener("pagehide", save);
      save();
    };
  }, []);
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Project Notes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mac-split notes-app">
      <aside className="mac-sidebar">
        <div className="sidebar-heading"><span className="desktop-only">On My Mac</span><span className="mobile-only">On My iPhone</span></div>
        <div className="sidebar-item" data-selected="true">
          <FileText />
          <span>All Notes</span>
          <span className="ml-auto mac-muted">1</span>
        </div>
      </aside>
      <main className="finder-main">
        <div className="mac-toolbar">
          <h2>Notes</h2>
          <button
            className="mac-icon-button"
            aria-label="Export note"
            onClick={download}
          >
            <Download size={17} />
          </button>
        </div>
        <textarea
          aria-label="Note contents"
          className="notes-editor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck
        />
        <div className="mac-statusbar">
          <span>Saved in this browser</span>
          <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
        </div>
      </main>
    </div>
  );
}
