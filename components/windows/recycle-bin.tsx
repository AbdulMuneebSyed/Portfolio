"use client";

import { Trash2 } from "lucide-react";

export function RecycleBin() {
  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <Trash2 size={17} />
        <h2><span className="desktop-only">Trash</span><span className="mobile-only">Recently Deleted</span></h2>
        <button className="mac-button" disabled>
          Empty
        </button>
      </div>
      <div className="empty-state">
        <Trash2 size={58} strokeWidth={1} />
        <h2 className="mt-3 text-lg font-semibold"><span className="desktop-only">Trash is empty</span><span className="mobile-only">No recently deleted files</span></h2>
        <p className="text-xs">There are no deleted portfolio files.</p>
      </div>
      <div className="mac-statusbar">
        <span>0 items</span>
        <span><span className="desktop-only">Trash</span><span className="mobile-only">Recently Deleted</span></span>
      </div>
    </div>
  );
}
