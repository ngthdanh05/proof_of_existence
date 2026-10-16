"use client";

import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { LogOut, Wallet } from "lucide-react";

export function WalletConnect() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (!account) {
    return (
      <ConnectButton 
        className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !py-2 !px-4 !rounded-lg !text-sm !transition"
      />
    );
  }

  const truncatedAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 pl-3 rounded-lg border border-slate-200 dark:border-slate-700">
      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
        {truncatedAddress}
      </span>
      <button
        onClick={() => disconnect()}
        title="Disconnect Wallet"
        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-red-600 transition"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}