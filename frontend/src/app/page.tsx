"use client";

import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ShieldCheck, ArrowRight, FileCheck, HardDriveUpload, Award, CheckCircle2 } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useRegistryStats } from "@/hooks/useRegistryStats";

export default function LandingPage() {
  const { totalProofs, loading: loadingStats } = useRegistryStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Toaster position="top-right" />

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

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Powered by Sui Network & Walrus Storage
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Immutable <span className="text-blue-600 dark:text-blue-400">Proof of Existence</span> for Your Digital Assets
        </h1>

        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
          Cryptographically register, store, and verify the authenticity and ownership of any document, artwork, or contract on the Sui blockchain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            Create Proof Now <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/verify"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            Verify a Document
          </Link>
        </div>

        {/* Total Proofs Stat Counter */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 max-w-sm mx-auto">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Total On-Chain Proofs</p>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {loadingStats ? (
              <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ) : (
              totalProofs ?? 0
            )}
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works in 3 Steps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 w-fit rounded-lg text-blue-600 dark:text-blue-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">1. SHA-256 Hashing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your file is processed client-side to generate a unique cryptographic hash without exposing sensitive content.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 w-fit rounded-lg text-emerald-600 dark:text-emerald-400">
                <HardDriveUpload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">2. Walrus Storage</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The file binary is securely preserved in Walrus decentralized storage, generating a immutable Blob ID.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 w-fit rounded-lg text-purple-600 dark:text-purple-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">3. Sui Certification</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A Move smart contract registers the proof on Sui Testnet and issues a verifiable Digital Certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
        © 2026 SuiProof — Built on Sui Network & Walrus Storage
      </footer>
    </div>
  );
}