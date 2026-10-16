import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { PACKAGE_ID, REGISTRY_ID } from "@/lib/constants";

export interface CreateProofParams {
  contentHash: string;
  blobId: string;
  name: string;
  description: string;
  location: string;
  category: string;
}

export function useCreateProof() {
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProof = async (params: CreateProofParams) => {
    setLoading(true);
    setError(null);

    try {
      const tx = new Transaction();

      // Gọi đúng module proof_of_existence::core::create_proof
      tx.moveCall({
        target: `${PACKAGE_ID}::core::create_proof`,
        arguments: [
          tx.object(REGISTRY_ID),             // registry: &mut ProofRegistry
          tx.pure.string(params.contentHash), // content_hash: String
          tx.pure.string(params.blobId),      // blob_id: String
          tx.pure.string(params.name),        // name: String
          tx.pure.string(params.description), // description: String
          tx.pure.string(params.location),    // location: String
          tx.pure.string(params.category),    // category: String
          tx.object("0x6"),                   // clock: &Clock (Object ID cố định của Sui Clock)
        ],
      });

      const response = await signAndExecuteTransaction({
        transaction: tx,
      });

      const txDigest = response.digest;

      // Chờ transaction hoàn tất và đọc objectChanges
      const txDetails = await suiClient.waitForTransaction({
        digest: txDigest,
        options: {
          showObjectChanges: true,
        },
      });

      // Tìm ProofObject vừa được khởi tạo
      const createdObject = txDetails.objectChanges?.find(
        (change) =>
          change.type === "created" && 
          change.objectType?.includes("::core::ProofObject")
      );

      const proofObjectId =
        createdObject && createdObject.type === "created"
          ? createdObject.objectId
          : "";

      return { txDigest, proofObjectId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create proof";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { createProof, loading, error };
}