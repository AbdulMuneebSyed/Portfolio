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
  const [failed, setFailed] = useState(false);
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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="mac-toolbar">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 25}
          className="mac-icon-button"
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
          className="mac-icon-button"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={handleRotate}
          className="mac-icon-button"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownload}
          className="mac-icon-button"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <span className="text-xs mac-muted truncate">{fileName}</span>
      </div>

      {/* Image Display Area */}
      <div className="photo-canvas min-h-0 flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="relative max-w-full">
          {failed ? (
            <p className="mac-muted">This image could not be opened.</p>
          ) : (
            <img
              src={filePath}
              alt={fileName}
              className="max-w-full max-h-[65vh] object-contain shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                transition: "transform 0.2s ease",
              }}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mac-statusbar">
        <span>Ready</span>
        <span>
          {zoom}% • {rotation}°
        </span>
      </div>
    </div>
  );
}
