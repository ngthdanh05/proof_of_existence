export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "devnet") || "testnet";

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x56a51cb422b069f443ff2e5157584f3235e3ad6f2018b051183c0d2c7c542a9e";
export const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID || "0x68e1db437480f79f88f1883750fef0eca4983c9bf736af84ec57b3e4e08f4dfc";

export const WALRUS_PUBLISHER_URL = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || "https://publisher.walrus-testnet.walrus.space";
export const WALRUS_AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || "https://aggregator.walrus-testnet.walrus.space";
