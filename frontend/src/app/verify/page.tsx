"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyProof } from "@/hooks/useVerifyProof";
import { ProofData } from "@/types/proof";
import { getWalrusViewUrl } from "@/lib/walrus";
import { 
  ShieldCheck, 
  Search, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  FileText, 
  Copy, 
  Check, 
  Loader2,
  Calendar,
  User,
  Hash,
  Box
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const hashParam = searchParams.get("hash");
  const proofParam = searchParams.get("proof");

  const { verifyByHash, verifyByObjectId, loading } = useVerifyProof();
  const [result, setResult] = useState<{ checked: boolean; exists: boolean; proofData?: ProofData } | null>(null);
  
  // Custom search input states
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleVerify = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("0x")) {
      const res = await verifyByObjectId(trimmed);
      setResult({ checked: true, exists: res.exists, proofData: res.proofData });
    } else {
      const res = await verifyByHash(trimmed);
      setResult({ checked: true, exists: res.exists, proofData: res.proofData });
    }
  }, [verifyByHash, verifyByObjectId]);

  useEffect(() => {
    if (proofParam) {
      setSearchQuery(proofParam);
      handleVerify(proofParam);
    } else if (hashParam) {
      setSearchQuery(hashParam);
      handleVerify(hashParam);
    }
  }, [hashParam, proofParam, handleVerify]);

  // File Upload to SHA-256 local calculation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    setSearchQuery(hashHex);
    const res = await verifyByHash(hashHex);
    setResult({ checked: true, exists: res.exists, proofData: res.proofData });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      {/* Page Header Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Verify Proof of Existence
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Authenticate documents on-chain. Verify ownership, timestamp, and Walrus storage integrity in real-time.
        </p>
      </div>

      {/* Interactive Search Box & Drag-Drop Upload Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Paste Object ID (0x...) or SHA-256 Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Now"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            OR UPLOAD FILE
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
          <Upload className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Click to upload or drag and drop document
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Hash will be computed locally in browser. Your document is never uploaded without consent.
          </span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Querying Sui Blockchain & Walrus Storage Nodes...
          </p>
        </div>
      )}

      {/* Verification Result Certificate Box */}
      {!loading && result && result.checked && (
        <div className="transition-all duration-300 animate-in fade-in-50">
          {result.exists && result.proofData ? (
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 shadow-md space-y-6 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      Proof Verified & Authenticated
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Valid Record Found on Sui Testnet Registry
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                  On-Chain Verified
                </span>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> Proof Object ID</span>
                    <button onClick={() => copyToClipboard(result.proofData!.id, "id")} className="hover:text-blue-500">
                      {copiedField === "id" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                    {result.proofData.id}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> SHA-256 Hash</span>
                    <button onClick={() => copyToClipboard(result.proofData!.fileHash, "hash")} className="hover:text-blue-500">
                      {copiedField === "hash" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate">
                    {result.proofData.fileHash}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Owner Address</span>
                    <button onClick={() => copyToClipboard(result.proofData!.owner, "owner")} className="hover:text-blue-500">
                      {copiedField === "owner" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                    {result.proofData.owner}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Registered Timestamp
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {result.proofData.timestamp > 0
                      ? new Date(result.proofData.timestamp).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Walrus Blob Viewer Link */}
              {result.proofData.blobId && (
                <div className="pt-2">
                  <a
                    href={getWalrusViewUrl(result.proofData.blobId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Decentralized Original File on Walrus Protocol</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-500/20 rounded-2xl p-8 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Invalid Proof / Document Not Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                This document hash or Object ID does not exist in the Sui Proof Registry. It may have been revoked or never registered.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-6 h-6" />
            <span>SuiProof</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/create" className="text-sm font-medium hover:text-blue-600 transition">
              Create Proof
            </Link>
            <Link href="/verify" className="text-sm font-medium text-blue-600 transition">
              Verify
            </Link>
            <WalletConnect />
          </nav>
        </div>
      </header>

      <Suspense fallback={<p className="text-center py-12 text-sm text-slate-400">Loading parameters...</p>}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}