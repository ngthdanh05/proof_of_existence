"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import React, { useState, ChangeEvent } from "react";
import { hashFile } from "@/lib/hash";
import { useWalrusUpload } from "@/hooks/useWalrusUpload";
import { useCreateProof } from "@/hooks/useCreateProof";
import { ProofCard } from "@/components/ProofCard";
import { ShieldCheck } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import Link from "next/link";


export default function CreatePage() {
  const account = useCurrentAccount();
  const { upload, uploading } = useWalrusUpload();
  const { createProof, loading: creatingContract } = useCreateProof();

  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Document");

  const [activeStep, setActiveStep] = useState<number>(1);
  const [txResult, setTxResult] = useState<{ txDigest: string; proofObjectId: string; blobId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    setTxResult(null);

    if (selected) {
      setFile(selected);
      setName(selected.name);
      const computedHash = await hashFile(selected);
      setFileHash(computedHash);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !file || !fileHash) return;

    try {
      setError(null);

      // Step 2: Upload Walrus
      setActiveStep(2);
      const blobId = await upload(file);
      if (!blobId) throw new Error("Walrus Upload failed");

      // Step 3: Call Move Contract
      setActiveStep(3);
      const res = await createProof({
        contentHash: fileHash,
        blobId,
        name,
        description,
        location,
        category,
      });

      setTxResult({
        txDigest: res.txDigest,
        proofObjectId: res.proofObjectId,
        blobId,
      });
      
      // Step 4: Complete
      setActiveStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Creation failed");
      setActiveStep(1);
    }
  };

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
            <Link href="/verify" className="text-sm font-medium hover:text-blue-600 transition">
              Verify
            </Link>
            <WalletConnect />
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Stepper UI */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b pb-4">
          <span className={activeStep >= 1 ? "text-blue-600 font-bold" : ""}>1. Select File</span>
          <span>→</span>
          <span className={activeStep >= 2 ? "text-blue-600 font-bold" : ""}>2. Store on Walrus</span>
          <span>→</span>
          <span className={activeStep >= 3 ? "text-blue-600 font-bold" : ""}>3. Register Sui</span>
          <span>→</span>
          <span className={activeStep >= 4 ? "text-blue-600 font-bold" : ""}>4. Done</span>
        </div>

        {/* Form Input */}
        {!txResult && (
          <form onSubmit={handleCreate} className="p-6 bg-white dark:bg-slate-900 border rounded-xl space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Document / Media</label>
              <input type="file" onChange={handleFileSelect} className="w-full text-sm" />
            </div>

            {fileHash && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs break-all">
                <p><strong>SHA-256 Hash:</strong> <span className="font-mono text-blue-500">{fileHash}</span></p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800"
                >
                  <option value="Document">Document</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Identity">Identity</option>
                  <option value="Media">Media</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || uploading || creatingContract || !account}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition disabled:bg-slate-400"
            >
              {uploading ? "Uploading to Walrus..." : creatingContract ? "Signing on Sui..." : "Create On-Chain Proof"}
            </button>
          </form>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 break-all">
            ❌ <strong>Error:</strong> {error}
          </div>
        )}

        {/* Certificate Result */}
        {txResult && (
          <ProofCard
            txDigest={txResult.txDigest}
            proofObjectId={txResult.proofObjectId}
            contentHash={fileHash}
            blobId={txResult.blobId}
            fileName={name}
            ownerAddress={account?.address || ""}
          />
        )}
      </div>
    </main>
  );
}