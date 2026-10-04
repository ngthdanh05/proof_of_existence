export interface ProofData {
  id: string;
  fileHash: string;
  owner: string;
  blobId?: string;
  timestamp: number;
}

export interface ProofMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
}

export interface CreateProofInput {
  fileHash: string;
  blobId?: string;
}