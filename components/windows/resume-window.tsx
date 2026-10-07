"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, FileText, ExternalLink, Share } from "lucide-react";
import { usePhone } from "@/lib/phone";

const PDF_URL = "/syedabdulmuneebresume.pdf";
const DOWNLOAD_NAME = "syedabdulmuneebresume.pdf";
// The PDF's pages, pre-rendered, for browsers that can't show a PDF inside a
// page (phones and some in-app browsers). Re-export when the PDF changes.
const PAGES = [{ src: "/resume/page-1.webp", width: 1240, height: 1755 }];

function PageImages() {
  return (
    <div className="resume-pages">
      {PAGES.map((page, i) => (
        <Image
          key={page.src}
          src={page.src}
          alt={`Resume, page ${i + 1}`}
          width={page.width}
          height={page.height}
          sizes="(max-width: 699px) 100vw, 800px"
          priority={i === 0}
          className="resume-page"
        />
      ))}
    </div>
  );
}

export function ResumeWindow() {
  const phone = usePhone();
  // Android Chrome and some in-app browsers can't show a PDF inside a page.
  const [canEmbedPdf, setCanEmbedPdf] = useState(true);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanEmbedPdf(navigator.pdfViewerEnabled !== false);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const share = () =>
    navigator
      .share({
        title: "Syed Abdul Muneeb — Resume",
        url: new URL(PDF_URL, location.href).href,
      })
      .catch(() => {});

  if (phone) {
    // iPhone Quick Look: the pages on grey, Share and Download in the bar.
    return (
      <div className="resume-app flex h-full flex-col">
        <div className="mac-toolbar">
          <h2>Resume</h2>
          {canShare && (
            <button className="mac-icon-button" aria-label="Share" onClick={share}>
              <Share size={18} />
            </button>
          )}
          <a
            className="mac-icon-button"
            aria-label="Download"
            href={PDF_URL}
            download={DOWNLOAD_NAME}
          >
            <Download size={18} />
          </a>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <PageImages />
          <a
            className="resume-open-pdf"
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open as PDF <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mac-toolbar">
        <FileText size={17} />
        <h2>Resume.pdf</h2>
        <a
          className="mac-button"
          href={PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} />
          Open
        </a>
        <a className="mac-button" href={PDF_URL} download={DOWNLOAD_NAME}>
          <Download size={13} />
          Download
        </a>
      </div>
      <div className="min-h-0 flex-1 bg-[#646466] p-3">
        {canEmbedPdf ? (
          <iframe
            src={PDF_URL}
            title="Resume PDF"
            className="h-full w-full border-0 rounded-sm bg-white"
          />
        ) : (
          <div className="h-full overflow-auto">
            <PageImages />
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
