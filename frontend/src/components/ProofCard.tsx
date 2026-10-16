"use client";

import React from "react";
import { QRGenerator } from "./QRGenerator";
import { getWalrusViewUrl } from "@/lib/walrus";

interface ProofCardProps {
  txDigest: string;
  proofObjectId?: string;
  contentHash: string;
  blobId: string;
  fileName: string;
  ownerAddress: string;
}

export function ProofCard({
  txDigest,
  proofObjectId,
  contentHash,
  blobId,
  fileName,
  ownerAddress,
}: ProofCardProps) {
  const truncatedHash = `${contentHash.slice(0, 10)}...${contentHash.slice(-10)}`;
  const truncatedOwner = ownerAddress 
    ? `${ownerAddress.slice(0, 8)}...${ownerAddress.slice(-6)}`
    : "Anonymous";

  return (
    <div className="w-full max-w-2xl mx-auto border-2 border-amber-500/40 rounded-2xl p-6 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-xl my-6">
      <div className="border border-amber-500/20 rounded-xl p-6 relative">
        {/* Header Certificate */}
        <div className="text-center mb-6 border-b pb-4 border-amber-500/20">
          <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Sui Blockchain On-Chain Record
          </p>
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mt-1">
            Certificate of Existence
          </h2>
        </div>

        {/* Thông tin Chi tiết & Mã QR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Document Name</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{fileName}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">SHA-256 Content Hash</p>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">{truncatedHash}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Owner Address</p>
              <p className="font-mono text-xs">{truncatedOwner}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Issued Timestamp</p>
              <p className="text-xs">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <QRGenerator contentHash={contentHash} proofObjectId={proofObjectId} />
          </div>
        </div>

        {/* Links Tra Cứu */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-medium justify-between">
          <a
            href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            🔍 View Transaction on Suiscan ↗
          </a>

          {blobId && (
            <a
              href={getWalrusViewUrl(blobId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline flex items-center gap-1"
            >
              📦 View Blob on Walrus ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}