"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRGeneratorProps {
  contentHash: string;
  proofObjectId?: string;
}

export function QRGenerator({ contentHash, proofObjectId }: QRGeneratorProps) {
  const [size, setSize] = useState<number>(180);
  const qrRef = useRef<SVGSVGElement>(null);

  // Tạo URL verify động theo hostname hiện tại
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${baseUrl}/verify?hash=${encodeURIComponent(contentHash)}${
    proofObjectId ? `&proof=${encodeURIComponent(proofObjectId)}` : ""
  }`;

  // Hàm chuyển đổi từ SVG sang PNG để download
  const handleDownloadPNG = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `proof-qr-${contentHash.slice(0, 8)}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
      <div className="p-3 bg-white rounded-lg shadow-sm">
        <QRCodeSVG
          ref={qrRef}
          value={verifyUrl}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* Tùy chọn kích thước QR */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">Size:</span>
        <button
          type="button"
          onClick={() => setSize(120)}
          className={`px-2 py-1 rounded ${size === 120 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => setSize(180)}
          className={`px-2 py-1 rounded ${size === 180 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
        >
          M
        </button>
        <button
          type="button"
          onClick={() => setSize(240)}
          className={`px-2 py-1 rounded ${size === 240 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
        >
          L
        </button>
      </div>

      <button
        type="button"
        onClick={handleDownloadPNG}
        className="w-full text-xs font-medium py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition"
      >
        Download QR (PNG)
      </button>
    </div>
  );
}