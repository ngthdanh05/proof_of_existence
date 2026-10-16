import { useState, useCallback } from "react";
import { uploadToWalrus, getWalrusViewUrl } from "@/lib/walrus";

interface UseWalrusUploadResult {
  uploading: boolean;
  blobId: string | null;
  viewUrl: string | null;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  reset: () => void;
}

export function useWalrusUpload(): UseWalrusUploadResult {
  const [uploading, setUploading] = useState<boolean>(false);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setBlobId(null);
    setViewUrl(null);

    try {
      const id = await uploadToWalrus(file);
      const url = getWalrusViewUrl(id);
      
      setBlobId(id);
      setViewUrl(url);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setBlobId(null);
    setViewUrl(null);
    setError(null);
  }, []);

  return {
    uploading,
    blobId,
    viewUrl,
    error,
    upload,
    reset,
  };
}