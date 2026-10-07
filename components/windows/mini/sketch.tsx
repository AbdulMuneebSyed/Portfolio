"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Download, Eraser, Trash2, Undo2 } from "lucide-react";
import type { MiniAppProps } from "./registry";

const COLORS = ["#1d1d1f", "#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#0a84ff", "#5e5ce6", "#ff2d55", "#ffffff"];
const SIZES = [3, 8, 16, 28];
const W = 1200;
const H = 800;
const UNDO_LIMIT = 20;

export function Sketch({ preview }: MiniAppProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[5]);
  const [size, setSize] = useState(SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const history = useRef<ImageData[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const ctx = () => canvas.current?.getContext("2d") ?? null;

  const clear = () => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  };

  useEffect(() => {
    clear();
    if (!preview) return;
    // A small doodle for the App Store screenshot.
    const c = ctx()!;
    c.lineCap = "round";
    c.lineJoin = "round";
    const strokes: [string, number, [number, number][]][] = [
      ["#0a84ff", 24, [[200, 520], [320, 380], [440, 520], [560, 380], [680, 520]]],
      ["#ff9500", 18, [[820, 300], [900, 220], [980, 300], [900, 380], [820, 300]]],
      ["#34c759", 14, [[160, 660], [1040, 660]]],
      ["#ff2d55", 10, [[260, 220], [420, 160], [580, 220]]],
    ];
    for (const [stroke, width, points] of strokes) {
      c.strokeStyle = stroke;
      c.lineWidth = width;
      c.beginPath();
      points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  const snapshot = () => {
    const c = ctx();
    if (!c) return;
    history.current = [...history.current.slice(-UNDO_LIMIT + 1), c.getImageData(0, 0, W, H)];
    setCanUndo(true);
  };

  const drawTo = (p: { x: number; y: number }) => {
    const c = ctx();
    if (!c || !last.current) return;
    c.strokeStyle = erasing ? "#ffffff" : color;
    c.lineWidth = erasing ? size * 2 : size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.lineTo(p.x, p.y);
    c.stroke();
    last.current = p;
  };

  const undo = () => {
    const c = ctx();
    const prev = history.current.pop();
    if (c && prev) c.putImageData(prev, 0, 0);
    setCanUndo(history.current.length > 0);
  };

  const save = () => {
    const link = document.createElement("a");
    link.download = "sketch.png";
    link.href = canvas.current!.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="sketch-app">
      <div className="sketch-toolbar" role="toolbar" aria-label="Brush">
        <div className="sketch-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              className="sketch-swatch"
              style={{ background: c }}
              aria-label={`Colour ${c}`}
              aria-pressed={!erasing && color === c}
              onClick={() => {
                setColor(c);
                setErasing(false);
              }}
            />
          ))}
        </div>
        <div className="sketch-sizes">
          {SIZES.map((s) => (
            <button key={s} aria-label={`Brush size ${s}`} aria-pressed={size === s} onClick={() => setSize(s)}>
              <span style={{ width: Math.min(s, 20), height: Math.min(s, 20) }} />
            </button>
          ))}
        </div>
        <div className="sketch-actions">
          <button className="mini-icon-button" aria-label="Eraser" aria-pressed={erasing} onClick={() => setErasing(!erasing)}>
            <Eraser size={17} />
          </button>
          <button className="mini-icon-button" aria-label="Undo" disabled={!canUndo} onClick={undo}>
            <Undo2 size={17} />
          </button>
          <button
            className="mini-icon-button"
            aria-label="Clear"
            onClick={() => {
              snapshot();
              clear();
            }}
          >
            <Trash2 size={17} />
          </button>
          <button className="mini-icon-button" aria-label="Save as PNG" onClick={save}>
            <Download size={17} />
          </button>
        </div>
      </div>
      <div className="sketch-stage">
        <canvas
          ref={canvas}
          width={W}
          height={H}
          aria-label="Drawing canvas"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            snapshot();
            last.current = point(e);
            drawTo({ x: last.current.x + 0.01, y: last.current.y });
          }}
          onPointerMove={(e) => last.current && drawTo(point(e))}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
      </div>
    </div>
  );
}
