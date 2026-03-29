import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        });

        // Get Presigned URL
        const res = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: compressedFile.name.replace(/\.[^/.]+$/, "") + ".webp",
            contentType: 'image/webp'
          })
        });
        const { url, key } = await res.json();

        // Upload to R2
        await fetch(url, {
          method: 'PUT',
          body: compressedFile,
          headers: { 'Content-Type': 'image/webp' }
        });

        uploadedUrls.push(`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setIsUploading(false);
    return uploadedUrls;
  };

  return { uploadImages, isUploading };
}
