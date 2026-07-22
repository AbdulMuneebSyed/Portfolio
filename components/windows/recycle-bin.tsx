"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileCode2,
  FileImage,
  FileText,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

type DeletedItem = {
  id: string;
  name: string;
  type: "Document" | "Image" | "Code";
  size: string;
  deletedAt: string;
  originalPath: string;
};

const storageKey = "muneebos-recycle-bin-v1";

const seedItems: DeletedItem[] = [
  {
    id: "draft",
    name: "old-resume-draft.docx",
    type: "Document",
    size: "48 KB",
    deletedAt: "2026-07-03",
    originalPath: "C:\\Users\\Muneeb\\Documents",
  },
  {
    id: "screenshot",
    name: "unused-dashboard-shot.png",
    type: "Image",
    size: "1.2 MB",
    deletedAt: "2026-07-05",
    originalPath: "C:\\Users\\Muneeb\\Pictures",
  },
  {
    id: "snippet",
    name: "prototype-api-snippet.ts",
    type: "Code",
    size: "9 KB",
    deletedAt: "2026-07-07",
    originalPath: "C:\\Users\\Muneeb\\Projects",
  },
];

const nextDeletedNames = [
  "temp-notes.txt",
  "wireframe-export.png",
  "unused-helper.ts",
  "portfolio-backup.zip",
];

function ItemIcon({ type }: { type: DeletedItem["type"] }) {
  if (type === "Image") return <FileImage className="size-5 text-sky-700" />;
  if (type === "Code") return <FileCode2 className="size-5 text-violet-700" />;
  return <FileText className="size-5 text-slate-700" />;
}

export function RecycleBin() {
  const [items, setItems] = useState<DeletedItem[]>(seedItems);
  const [selectedId, setSelectedId] = useState(seedItems[0]?.id ?? "");
  const [lastAction, setLastAction] = useState("Ready");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setHasLoadedStorage(true);
        return;
      }
      const parsed = JSON.parse(saved) as DeletedItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
        setSelectedId(parsed[0]?.id ?? "");
      }
    } catch {
      setLastAction("Recycle Bin data could not be loaded.");
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hasLoadedStorage, items]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  );

  const removeSelected = (action: "restore" | "delete") => {
    if (!selectedItem) return;

    setItems((current) => {
      const nextItems = current.filter((item) => item.id !== selectedItem.id);
      setSelectedId(nextItems[0]?.id ?? "");
      return nextItems;
    });
    setLastAction(
      action === "restore"
        ? `Restored ${selectedItem.name} to ${selectedItem.originalPath}.`
        : `Permanently deleted ${selectedItem.name}.`
    );
  };

  const emptyBin = () => {
    setItems([]);
    setSelectedId("");
    setLastAction("Recycle Bin emptied.");
  };

  const addDeletedItem = () => {
    const name = nextDeletedNames[items.length % nextDeletedNames.length];
    const type: DeletedItem["type"] = name.endsWith(".png")
      ? "Image"
      : name.endsWith(".ts")
        ? "Code"
        : "Document";
    const item: DeletedItem = {
      id: `${Date.now()}`,
      name,
      type,
      size: type === "Image" ? "640 KB" : type === "Code" ? "6 KB" : "18 KB",
      deletedAt: new Date().toISOString().slice(0, 10),
      originalPath: "C:\\Users\\Muneeb\\Desktop",
    };
    setItems((current) => [item, ...current]);
    setSelectedId(item.id);
    setLastAction(`${item.name} moved to Recycle Bin.`);
  };

  return (
    <div className="flex h-full flex-col bg-[#f4f8fc] text-slate-900">
      <div className="border-b border-slate-300 bg-gradient-to-b from-white to-[#dce8f4]">
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            File
          </button>
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            Edit
          </button>
          <button className="rounded border border-transparent px-2 py-1 hover:border-sky-300 hover:bg-sky-100">
            View
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-white/80 px-3 py-2">
          <div className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm">
            Recycle Bin
          </div>
          <button
            onClick={addDeletedItem}
            className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
          >
            Simulate delete
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,1fr)_270px]">
        <main className="overflow-auto bg-white">
          <div className="sticky top-0 grid grid-cols-[1.4fr_100px_90px_130px] border-b border-slate-300 bg-[#edf5fc] px-3 py-2 text-xs font-semibold uppercase text-slate-500">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Date Deleted</span>
          </div>
          {items.length === 0 ? (
            <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-slate-500">
              Recycle Bin is empty.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`grid w-full grid-cols-[1.4fr_100px_90px_130px] items-center border-b border-slate-200 px-3 py-3 text-left text-sm hover:bg-sky-50 ${
                  selectedItem?.id === item.id ? "bg-[#dff0ff]" : "bg-white"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ItemIcon type={item.type} />
                  <span className="truncate font-medium">{item.name}</span>
                </span>
                <span>{item.type}</span>
                <span>{item.size}</span>
                <span>{item.deletedAt}</span>
              </button>
            ))
          )}
        </main>

        <aside className="border-l border-slate-300 bg-[#f8fbff] p-4">
          <div className="mb-3 flex size-14 items-center justify-center rounded border border-slate-300 bg-white">
            <Trash2 className="size-8 text-slate-700" />
          </div>
          <h2 className="mb-1 text-lg font-semibold">
            {selectedItem?.name ?? "No item selected"}
          </h2>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {selectedItem
              ? `Deleted from ${selectedItem.originalPath}. Restore it or permanently remove it.`
              : "Add a simulated deleted file to test the bin."}
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => removeSelected("restore")}
              disabled={!selectedItem}
              className="flex items-center justify-center gap-2 rounded border border-sky-400 bg-[#e5f3ff] px-3 py-2 text-sm font-medium hover:bg-[#d8edff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              Restore
            </button>
            <button
              onClick={() => removeSelected("delete")}
              disabled={!selectedItem}
              className="flex items-center justify-center gap-2 rounded border border-rose-300 bg-[#fff1f2] px-3 py-2 text-sm font-medium text-rose-800 hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="size-4" />
              Delete permanently
            </button>
            <button
              onClick={emptyBin}
              disabled={items.length === 0}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Empty Recycle Bin
            </button>
          </div>
        </aside>
      </div>

      <div className="border-t border-slate-300 bg-gradient-to-b from-white to-[#e7eef6] px-3 py-1 text-xs text-slate-600">
        {items.length} item{items.length === 1 ? "" : "s"} - {lastAction}
      </div>
    </div>
  );
}
