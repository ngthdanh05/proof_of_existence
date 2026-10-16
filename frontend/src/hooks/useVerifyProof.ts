import { useSuiClient } from "@mysten/dapp-kit";
import { useState, useCallback } from "react";
import { REGISTRY_ID } from "@/lib/constants";
import { ProofData } from "@/types/proof";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

// Định nghĩa Union Type rõ ràng cho kết quả Verify
export type VerifyResult =
  | { exists: true; proofData: ProofData }
  | { exists: false; proofData?: undefined };

export function useVerifyProof() {
  const suiClient = useSuiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Verify theo Object ID
  const verifyByObjectId = useCallback(
    async (objectId: string): Promise<VerifyResult> => {
      setLoading(true);
      setError(null);

      try {
        const res = await suiClient.getObject({
          id: objectId,
          options: { showContent: true, showOwner: true },
        });

        if (!res.data || !res.data.content) {
          return { exists: false };
        }

        if (res.data.content.dataType !== "moveObject") {
          return { exists: false };
        }

        const content = res.data.content;
        const fields = asRecord(content.fields) ?? {};

        const ownerObj = res.data.owner;
        let ownerAddress = typeof fields.owner === "string" ? fields.owner : "";
        if (ownerObj && typeof ownerObj === "object" && "AddressOwner" in ownerObj) {
          ownerAddress = (ownerObj as { AddressOwner: string }).AddressOwner;
        }

        const proofData: ProofData = {
          id: res.data.objectId,
          fileHash: typeof fields.hash === "string" ? fields.hash : "",
          owner: ownerAddress,
          blobId: typeof fields.blob_id === "string" ? fields.blob_id : "",
          timestamp: Number(fields.created_at || 0),
        };

        return { exists: true, proofData };
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to verify proof by ID");
        return { exists: false };
      } finally {
        setLoading(false);
      }
    },
    [suiClient]
  );

  // 2. Verify theo Content Hash
  const verifyByHash = useCallback(
    async (contentHash: string): Promise<VerifyResult> => {
      setLoading(true);
      setError(null);

      try {
        const registryObj = await suiClient.getObject({
          id: REGISTRY_ID,
          options: { showContent: true },
        });

        if (!registryObj.data || !registryObj.data.content) {
          return { exists: false };
        }

        if (registryObj.data.content.dataType !== "moveObject") {
          return { exists: false };
        }

        const registryFields = asRecord(registryObj.data.content.fields);
        const proofs = asRecord(registryFields?.proofs);
        const proofsFields = asRecord(proofs?.fields);
        const proofsId = asRecord(proofsFields?.id);
        const proofsTableId = proofsId?.id;

        if (typeof proofsTableId !== "string") {
          return { exists: false };
        }

        const dynamicField = await suiClient.getDynamicFieldObject({
          parentId: proofsTableId,
          name: {
            type: "0x1::string::String",
            value: contentHash,
          },
        });

        if (!dynamicField.data || !dynamicField.data.content) {
          return { exists: false };
        }

        if (dynamicField.data.content.dataType !== "moveObject") {
          return { exists: false };
        }

        const dynamicFields = asRecord(dynamicField.data.content.fields);
        const proofId = dynamicFields?.value;

        if (typeof proofId !== "string") {
          return { exists: false };
        }

        return await verifyByObjectId(proofId);
      } catch {
        return { exists: false };
      } finally {
        setLoading(false);
      }
    },
    [suiClient, verifyByObjectId]
  );

  return { verifyByHash, verifyByObjectId, loading, error };
}