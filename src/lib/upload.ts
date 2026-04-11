import { getPresignedUploadURL } from "@/lib/api";

export interface UploadResult {
  s3Key: string;
}

/**
 * Upload a file to S3 via presigned URL.
 * 1. Get presigned URL from backend
 * 2. PUT the file directly to S3
 * 3. Return the s3Key for referencing the uploaded file
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const { uploadUrl, s3Key } = await getPresignedUploadURL(
    file.name,
    file.type,
  );

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return { s3Key };
}

/**
 * Upload multiple files and return their s3Keys.
 * Updates the status callback for each file as it progresses.
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (index: number, status: "uploading" | "done" | "error") => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, "uploading");
    try {
      const result = await uploadFile(files[i]);
      results.push(result);
      onProgress?.(i, "done");
    } catch {
      onProgress?.(i, "error");
      throw new Error(`Failed to upload file: ${files[i].name}`);
    }
  }

  return results;
}
