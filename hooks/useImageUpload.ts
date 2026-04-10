import { useState } from 'react';
import imageCompression from 'browser-image-compression';

type CompressionOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
};

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp'
};

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (
    files: File[],
    options: CompressionOptions = defaultOptions
  ): Promise<string[]> => {
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const compressedFile = await imageCompression(file, options);
        const contentType = options.fileType || 'image/webp';

        // Get Presigned URL
        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType })
        });

        if (!presignedRes.ok) {
          const errorBody = await presignedRes.json().catch(() => ({ error: 'Failed to get presigned URL' }));
          throw new Error(`Failed to get presigned URL: ${presignedRes.status} ${presignedRes.statusText} - ${errorBody.error}`);
        }
        const { url, key } = await presignedRes.json();

        // Upload to R2
        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: compressedFile,
          headers: { 'Content-Type': contentType }
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload to R2 failed: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;

    } catch (err) {
      // Re-throw the error to be handled by the calling component
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading };
}
