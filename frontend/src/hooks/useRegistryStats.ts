import { useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { REGISTRY_ID } from "@/lib/constants";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

export function useRegistryStats() {
  const suiClient = useSuiClient();
  const [totalProofs, setTotalProofs] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await suiClient.getObject({
          id: REGISTRY_ID,
          options: { showContent: true },
        });

        if (res.data?.content?.dataType === "moveObject") {
          const fields = asRecord(res.data.content.fields);
          setTotalProofs(Number(fields?.total_proofs || 0));
        }
      } catch (err) {
        console.error("Failed to fetch registry stats:", err);
        setTotalProofs(0);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [suiClient]);

  return { totalProofs, loading };
}