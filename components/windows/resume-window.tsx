"use client";

import { useEffect, useState } from "react";
import { Download, FileText, ExternalLink } from "lucide-react";

export function ResumeWindow() {
  const pdfUrl = "/Syed Abdul Muneeb's SDE Resume (15).pdf";
  // Android Chrome and some in-app browsers can't show a PDF inside a page.
  const [canEmbedPdf, setCanEmbedPdf] = useState(true);
  useEffect(() => {
    setCanEmbedPdf(navigator.pdfViewerEnabled !== false);
  }, []);
  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <FileText size={17} />
        <h2>Resume.pdf</h2>
        <a
          className="mac-button"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} />
          Open
        </a>
        <a
          className="mac-button"
          href={pdfUrl}
          download="Syed Abdul Muneeb - SDE Resume.pdf"
        >
          <Download size={13} />
          Download
        </a>
      </div>
      <div className="min-h-0 flex-1 bg-[#646466] p-3">
        {canEmbedPdf ? (
          <iframe
            src={pdfUrl}
            title="Resume PDF"
            className="h-full w-full border-0 rounded-sm bg-white"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-sm bg-white p-6 text-center text-[#1d1d1f]">
            <FileText size={40} className="text-[#e5483f]" />
            <p className="text-sm">
              This browser can&apos;t preview PDFs here.
            </p>
            <a
              className="mac-button primary"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={13} />
              Open Resume
            </a>
          </div>
        )}
      </div>
      <div className="mac-statusbar">
        <span>Preview</span>
        <span>PDF document</span>
      </div>
    </div>
  );
}
