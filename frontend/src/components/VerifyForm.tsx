"use client";

import React, { useState, ChangeEvent } from "react";
import { hashFile } from "@/lib/hash";
import { useVerifyProof } from "@/hooks/useVerifyProof";
import { getWalrusViewUrl } from "@/lib/walrus";
import { ProofData } from "@/types/proof";

export function VerifyForm() {
  const { verifyByHash, verifyByObjectId, loading } = useVerifyProof();

  const [activeTab, setActiveTab] = useState<"file" | "hash" | "id">("file");
  const [inputHash, setInputHash] = useState("");
  const [inputObjectId, setInputObjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [result, setResult] = useState<{ checked: boolean; exists: boolean; proofData?: ProofData } | null>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResult(null);
    if (file) {
      setSelectedFile(file);
      const computedHash = await hashFile(file);
      setInputHash(computedHash);
    }
  };

const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setResult(null);

  if (activeTab === "file" || activeTab === "hash") {
    if (!inputHash) return;
    const res = await verifyByHash(inputHash);
    if (res.exists) {
      setResult({ checked: true, exists: true, proofData: res.proofData });
    } else {
      setResult({ checked: true, exists: false });
    }
  } else if (activeTab === "id") {
    if (!inputObjectId) return;
    const res = await verifyByObjectId(inputObjectId);
    if (res.exists) {
      setResult({ checked: true, exists: true, proofData: res.proofData });
    } else {
      setResult({ checked: true, exists: false });
    }
  }
};

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm mt-8">
      <h2 className="text-xl font-bold mb-4">Verify Proof Authenticity</h2>

      {/* Tabs Chuyển đổi phương thức Verify */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => { setActiveTab("file"); setResult(null); }}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "file" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
          }`}
        >
          Re-upload File
        </button>
        <button
          onClick={() => { setActiveTab("hash"); setResult(null); }}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "hash" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
          }`}
        >
          SHA-256 Hash String
        </button>
        <button
          onClick={() => { setActiveTab("id"); setResult(null); }}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "id" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
          }`}
        >
          Proof Object ID
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {activeTab === "file" && (
          <div>
            <label className="block text-sm font-medium mb-1">Select File to Verify</label>
            <input type="file" onChange={handleFileSelect} className="w-full text-sm" />
            {inputHash && (
              <p className="mt-2 text-xs font-mono break-all text-slate-500">
                Computed Hash: {inputHash}
              </p>
            )}
          </div>
        )}

        {activeTab === "hash" && (
          <div>
            <label className="block text-sm font-medium mb-1">Enter SHA-256 Hash String</label>
            <input
              type="text"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="e.g. 73305bf28d04e377d0e70cf421c7f34170717542bf136c60ea197ba33fb25f4e"
              className="w-full p-2 border rounded-lg text-sm font-mono dark:bg-slate-800"
            />
          </div>
        )}

        {activeTab === "id" && (
          <div>
            <label className="block text-sm font-medium mb-1">Enter Proof Object ID</label>
            <input
              type="text"
              value={inputObjectId}
              onChange={(e) => setInputObjectId(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded-lg text-sm font-mono dark:bg-slate-800"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition"
        >
          {loading ? "Verifying on Sui Network..." : "Verify Proof"}
        </button>
      </form>

      {/* Hiển thị Kết quả Verify */}
      {result && result.checked && (
        <div className="mt-6">
          {result.exists && result.proofData ? (
            <div className="p-4 bg-green-50 dark:bg-slate-800 border border-green-200 rounded-lg space-y-2 text-sm break-all">
              <p className="text-green-700 dark:text-green-400 font-bold text-base">
                ✅ Proof Verified! Document exists on Sui Network.
              </p>
              <p><strong>Proof Object ID:</strong> <span className="font-mono text-xs">{result.proofData.id}</span></p>
              <p><strong>Owner Address:</strong> <span className="font-mono text-xs">{result.proofData.owner}</span></p>
              {result.proofData.timestamp > 0 && (
                <p><strong>Timestamp:</strong> {new Date(result.proofData.timestamp).toLocaleString()}</p>
              )}
              {result.proofData.blobId && (
                <p>
                  <strong>Walrus Link:</strong>{" "}
                  <a
                    href={getWalrusViewUrl(result.proofData.blobId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Original File ↗
                  </a>
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-slate-800 border border-red-200 rounded-lg text-sm">
              <p className="text-red-700 dark:text-red-400 font-bold">
                ❌ No Proof Found! This document/hash has not been recorded on Sui.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}