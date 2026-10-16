export interface ProofMetadata {
  name: string;
  description: string;
  location: string;
  category: string;
}

export interface ProofData {
  id: string;          // Sui UID
  fileHash: string;    // hash: String
  owner: string;       // owner: address
  blobId: string;      // blob_id: String
  timestamp: number;   // created_at: u64
  metadata?: ProofMetadata;
}