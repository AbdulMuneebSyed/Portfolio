"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

export function Notepad() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setText(
      localStorage.getItem("muneebos-notes") ??
        "Project Notes\n\nA little space for your ideas.",
    );
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("muneebos-notes", text);
  }, [text, loaded]);
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
