"use client";

import { Trash2 } from "lucide-react";

export function RecycleBin() {
  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <Trash2 size={17} />
        <h2>Trash</h2>
        <button className="mac-button" disabled>
          Empty
        </button>
      </div>
      <div className="empty-state">
        <Trash2 size={58} strokeWidth={1} />
        <h2 className="mt-3 text-lg font-semibold">Trash is empty</h2>
        <p className="text-xs">There are no deleted portfolio files.</p>
      </div>
      <div className="mac-statusbar">
        <span>0 items</span>
        <span>Trash</span>
      </div>
    </div>
  );
}
