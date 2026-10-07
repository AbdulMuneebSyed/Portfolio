"use client";

import { Plus, X } from "lucide-react";
import { MAX_SPACES, spaceOf, useWindowManager } from "@/lib/window-manager";
import { useMissionControl } from "@/lib/mission-control";

const THUMB_WIDTH = 168;

// Mission Control's strip of desktops: click one to switch to it, + to add
// one, × to remove one (its windows and files move to its neighbour).
export function SpacesBar({ onPick }: { onPick: () => void }) {
  const spaces = useWindowManager((s) => s.spaces);
  const active = useWindowManager((s) => s.activeSpaceId);
  const windows = useWindowManager((s) => s.windows);
  const icons = useWindowManager((s) => s.desktopIcons);
  const wallpaper = useWindowManager((s) => s.wallpaper);
  const wm = useWindowManager.getState;
  // The desktop a window is being dragged over, highlighted as a drop target.
  const dropTarget = useMissionControl((s) => s.drag?.target ?? null);

  const scale = THUMB_WIDTH / (typeof window === "undefined" ? 1440 : innerWidth);
  const thumbHeight = Math.round(
    (typeof window === "undefined" ? 900 : innerHeight) * scale,
  );

  return (
    <div className="spaces-bar" role="toolbar" aria-label="Desktops">
      {spaces.map((id, index) => {
        const name = `Desktop ${index + 1}`;
        const own = windows.filter(
          (w) => !w.isMinimized && spaceOf(w, spaces) === id,
        );
        const files = icons.filter((i) => spaceOf(i, spaces) === id);
        return (
          <div key={id} className="spaces-item" data-active={id === active}>
            <button
              className="spaces-thumb"
              data-space-target={id}
              data-drop={dropTarget === id}
              aria-label={`${name}${id === active ? ", current" : ""}, ${own.length} windows`}
              aria-current={id === active}
              style={{ width: THUMB_WIDTH, height: thumbHeight, backgroundImage: wallpaper }}
              onClick={() => {
                wm().switchSpace(id);
                onPick();
              }}
            >
              {files.map((f) => (
                <span
                  key={f.id}
                  className="spaces-file"
                  style={{ right: (f.position.x + 28) * scale, top: (f.position.y + 44) * scale }}
                />
              ))}
              {[...own]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((w) => (
                  <span
                    key={w.id}
                    className="spaces-window"
                    style={
                      w.isMaximized
                        ? { left: 0, top: 24 * scale, right: 0, bottom: 0 }
                        : {
                            left: w.position.x * scale,
                            top: w.position.y * scale,
                            width: w.size.width * scale,
                            height: w.size.height * scale,
                          }
                    }
                  />
                ))}
            </button>
            <span className="spaces-label">{name}</span>
            {spaces.length > 1 && (
              <button
                className="spaces-remove"
                aria-label={`Remove ${name}`}
                title={`Remove ${name}`}
                onClick={() => wm().removeSpace(id)}
              >
                <X size={11} strokeWidth={3} />
              </button>
            )}
          </div>
        );
      })}
      {spaces.length < MAX_SPACES && (
        <button
          className="spaces-add"
          data-space-target="new"
          data-drop={dropTarget === "new"}
          style={{ height: thumbHeight }}
          aria-label="Add desktop"
          title="Add desktop"
          onClick={() => wm().addSpace()}
        >
          <Plus size={22} />
        </button>
      )}
    </div>
  );
}
