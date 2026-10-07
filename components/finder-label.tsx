"use client";

import { useEffect, useState } from "react";
import { fitFinderName } from "@/lib/finder-name";

// Measured after mount so the server render and first client render match.
export function FinderLabel({ name }: { name: string }) {
  const [lines, setLines] = useState([name]);
  useEffect(() => setLines(fitFinderName(name)), [name]);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}
