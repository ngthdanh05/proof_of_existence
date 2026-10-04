"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useState, ChangeEvent } from "react";
import { hashFile } from "@/lib/hash";

export default function Home() {
  const account = useCurrentAccount();
  const [hash, setHash] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const computedHash = await hashFile(file);
      setHash(computedHash);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <h1 className="text-2xl font-bold">Sui Proof App</h1>
        <ConnectButton />
      </div>

      <div className="flex flex-col items-center gap-6 p-8 border rounded-xl bg-slate-50 dark:bg-slate-900 w-full max-w-xl">
        <h2 className="text-lg font-semibold">Test SHA-256 Hashing</h2>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {fileName && (
          <div className="w-full break-all space-y-2">
            <p><strong>File:</strong> {fileName}</p>
            <p><strong>SHA-256 Hash:</strong> <span className="font-mono text-blue-500">{hash}</span></p>
          </div>
        )}
        {account && (
          <p className="text-green-600 text-xs">Connected: {account.address}</p>
        )}
      </div>
    </main>
  );
}