import { WALRUS_PUBLISHER_URL, WALRUS_AGGREGATOR_URL } from "./constants";

export async function uploadToWalrus(file: File): Promise<string> {
  // Giới hạn file tối đa 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit for Walrus storage.");
  }

  try {
    const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/blobs`, {
      method: "PUT",
      body: file,
      headers: { 
        "Content-Type": "application/octet-stream" 
      },
    });

    if (!response.ok) {
      throw new Error(`Walrus upload failed with status ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Xử lý cả 2 trường hợp: File mới upload (newlyCreated) hoặc File đã tồn tại trên mạng (alreadyCertified)
    const blobId = 
      result.newlyCreated?.blobObject?.blobId ?? 
      result.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error("Invalid response format from Walrus Publisher");
    }

    return blobId;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred while uploading to Walrus");
  }
}

export function getWalrusViewUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
}
export async function getWalrusFileUrl(blobId: string, mimeType: string = "image/png"): Promise<string> {
  const response = await fetch(getWalrusViewUrl(blobId));
  const blob = await response.blob();
  const fileBlob = new Blob([blob], { type: mimeType });
  return URL.createObjectURL(fileBlob);
}