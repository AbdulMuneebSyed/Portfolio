"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { useWindowManager } from "@/lib/window-manager";

// Folders moved to the Trash from the desktop. Put Back returns them to the
// desktop they came from; Empty Trash deletes them for good.
export function RecycleBin() {
  const trash = useWindowManager((s) => s.trash);
  const spaces = useWindowManager((s) => s.spaces);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const { putBack, emptyTrash } = useWindowManager.getState();
  const chosen = selected.filter((id) => trash.some((t) => t.id === id));

  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <h2>
          <span className="desktop-only">Trash</span>
          <span className="mobile-only">Recently Deleted</span>
        </h2>
        <button
          className="mac-button"
          disabled={!chosen.length}
          onClick={() => {
            putBack(chosen);
            setSelected([]);
          }}
        >
          Put Back
        </button>
        <button
          className="mac-button"
          disabled={!trash.length}
          onClick={() => setConfirming(true)}
        >
          Empty
        </button>
      </div>
      {confirming && (
        <div className="trash-confirm" role="alertdialog" aria-label="Empty Trash">
          <p>
            Permanently erase {trash.length} {trash.length === 1 ? "item" : "items"}? You
            can&apos;t undo this.
          </p>
          <button className="mac-button" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button
            className="mac-button primary"
            onClick={() => {
              emptyTrash();
              setConfirming(false);
              setSelected([]);
            }}
          >
            Empty Trash
          </button>
        </div>
      )}
      {trash.length ? (
        <div className="finder-grid flex-1 overflow-auto">
          {trash.map((item) => {
            const desktop = spaces.indexOf(item.spaceId ?? "") + 1;
            return (
              <button
                key={item.id}
                className="finder-file"
                aria-pressed={chosen.includes(item.id)}
                data-selected={chosen.includes(item.id)}
                onClick={(e) =>
                  setSelected((s) =>
                    e.metaKey || e.shiftKey
                      ? s.includes(item.id)
                        ? s.filter((id) => id !== item.id)
                        : [...s, item.id]
                      : [item.id],
                  )
                }
                onDoubleClick={() => putBack([item.id])}
              >
                <AppIcon appId="projects" size={64} />
                <span className="finder-file-name">{item.title}</span>
                <span className="finder-file-info">
                  {desktop > 0 ? `From Desktop ${desktop}` : "Folder"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Trash2 size={58} strokeWidth={1} />
          <h2 className="mt-3 text-lg font-semibold">
            <span className="desktop-only">Trash is empty</span>
            <span className="mobile-only">No recently deleted files</span>
          </h2>
          <p className="text-xs">Folders you delete from the desktop appear here.</p>
        </div>
      )}
      <div className="mac-statusbar">
        <span>
          {trash.length} {trash.length === 1 ? "item" : "items"}
        </span>
        <span>Double-click to put back</span>
      </div>
    </div>
  );
}
