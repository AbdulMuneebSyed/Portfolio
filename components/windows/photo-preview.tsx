"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

interface PhotoPreviewProps {
  fileName?: string;
  filePath?: string;
}

export function PhotoPreview({
  fileName = "photo.jpg",
  filePath = "/photo.jpg",
}: PhotoPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 25}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={handleRotate}
          className="p-2 rounded hover:bg-gray-100"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 rounded hover:bg-gray-100"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <span className="text-sm text-gray-600">{fileName}</span>
      </div>

      {/* Image Display Area */}
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
        <div className="relative">
          <img
            src={filePath}
            alt={fileName}
            className="max-w-none shadow-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              transition: "transform 0.2s ease",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.jpg";
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200 text-sm text-gray-600">
        <span>Ready</span>
        <span>
          {zoom}% • {rotation}°
        </span>
      </div>
    </div>
  );
}
