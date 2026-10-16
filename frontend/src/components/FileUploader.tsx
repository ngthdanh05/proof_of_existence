"use client";

import React, { useState, ChangeEvent } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { hashFile } from "@/lib/hash";
import { useWalrusUpload } from "@/hooks/useWalrusUpload";
import { useCreateProof } from "@/hooks/useCreateProof";
import { getWalrusViewUrl } from "@/lib/walrus";

export function FileUploader() {
  const account = useCurrentAccount();
  const { upload, uploading } = useWalrusUpload();
  const { createProof, loading: creatingContract } = useCreateProof();

  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form metadata
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Document");

  // Status state
  const [step, setStep] = useState<number>(1);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    setTxDigest(null);

    if (selected) {
      setFile(selected);
      setName(selected.name);

      // Hiển thị preview nếu là file ảnh
      if (selected.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }

      // 1. Hash File
      const computedHash = await hashFile(selected);
      setFileHash(computedHash);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your Sui Wallet first.");
      return;
    }
    if (!file || !fileHash) {
      setError("Please select a valid file.");
      return;
    }

    try {
      setError(null);

      // Step 1: Upload lên Walrus Storage
      setStep(1);
      const blobId = await upload(file);
      if (!blobId) throw new Error("Failed to upload file to Walrus.");

      // Step 2: Tạo Proof trên Sui Network
      setStep(2);
      const result = await createProof({
        contentHash: fileHash,
        blobId,
        name,
        description,
        location,
        category,
      });

      setTxDigest(result.txDigest);
      setStep(3); // Hoàn thành
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during submission.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">Create Proof of Existence</h2>

      {!account && (
        <div className="p-3 mb-4 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
          ⚠️ Please connect your Sui wallet above to create a proof.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Chọn File */}
        <div>
          <label className="block text-sm font-medium mb-1">Select File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        {/* File Preview */}
        {previewUrl && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1">Image Preview:</p>
            <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg border object-contain" />
          </div>
        )}

        {/* Thông tin Hash & Size */}
        {fileHash && file && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1 break-all">
            <p><strong>SHA-256 Hash:</strong> <span className="font-mono text-blue-500">{fileHash}</span></p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {/* Metadata Inputs */}
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

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location / Metadata</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Ho Chi Minh City, Vietnam"
            className="w-full p-2 border rounded-lg text-sm dark:bg-slate-800"
          />
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={!file || uploading || creatingContract || !account}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-400 transition text-sm"
        >
          {uploading
            ? "Step 1/2: Uploading to Walrus..."
            : creatingContract
            ? "Step 2/2: Confirming Transaction in Wallet..."
            : "Create Proof on Sui"}
        </button>
      </form>

      {/* Hiển thị Lỗi */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 break-all">
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Kết quả thành công */}
      {txDigest && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-slate-800 border border-green-200 rounded-lg space-y-2 text-sm break-all">
          <p className="text-green-700 dark:text-green-400 font-semibold">🎉 Proof Created Successfully!</p>
          <p>
            <strong>Transaction Explorer:</strong>{" "}
            <a
              href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on Suiscan ↗
            </a>
          </p>
        </div>
      )}
    </div>
  );
}