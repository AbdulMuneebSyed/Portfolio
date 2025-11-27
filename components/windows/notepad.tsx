"use client";

import { useState } from "react";

export function Notepad() {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col h-full bg-white font-mono text-sm">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-200 bg-[#f0f0f0] text-xs">
        <button className="hover:bg-[#d0d0d0] px-2 py-0.5 rounded">File</button>
        <button className="hover:bg-[#d0d0d0] px-2 py-0.5 rounded">Edit</button>
        <button className="hover:bg-[#d0d0d0] px-2 py-0.5 rounded">
          Format
        </button>
        <button className="hover:bg-[#d0d0d0] px-2 py-0.5 rounded">View</button>
        <button className="hover:bg-[#d0d0d0] px-2 py-0.5 rounded">Help</button>
      </div>
      <textarea
        className="flex-1 w-full h-full p-2 resize-none focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      <div className="border-t border-gray-200 px-2 py-0.5 text-xs text-gray-500 bg-[#f0f0f0] flex justify-end">
        Ln {text.split("\n").length}, Col {text.length}
      </div>
    </div>
  );
}
