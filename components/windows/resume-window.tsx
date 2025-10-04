"use client";

import { Download, FileText, ExternalLink } from "lucide-react";

export function ResumeWindow() {
  const pdfUrl = "/2Syed Abdul Muneeb's SE Resume.pdf";

  const handleDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Syed Abdul Muneeb - Software Engineer Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">
            Syed Abdul Muneeb - Resume.pdf
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openInNewTab}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100 p-4">
        <div className="h-full bg-white rounded-lg shadow-inner overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Resume PDF"
            style={{ minHeight: "600px" }}
          >
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg mb-2">PDF cannot be displayed</p>
              <p className="text-sm mb-4">
                Your browser doesn't support PDF viewing
              </p>
              <div className="flex gap-2">
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </iframe>
        </div>
      </div>
    </div>
  );
}
