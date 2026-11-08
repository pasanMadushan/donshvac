/**
 * Browser upload to a Supabase Storage signed upload URL with progress events.
 *
 * Mirrors @supabase/storage-js `uploadToSignedUrl` (v2.119): a PUT to
 * `${storageUrl}/object/upload/sign/${bucket}/${path}?token=…` (the exact
 * `signedUrl` returned by createSignedUploadUrl) with a multipart body that
 * holds a `cacheControl` field followed by the file under an empty field
 * name, and an `x-upsert: false` header. The publishable key is sent as
 * `apikey` for the API gateway; the token in the URL authorises the write.
 */
export interface UploadOptions {
  signedUrl: string;
  apiKey: string;
  file: File;
  cacheControl?: string;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function uploadToSignedUrl({
  signedUrl,
  apiKey,
  file,
  cacheControl = "3600",
  onProgress,
  signal,
}: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    if (apiKey) xhr.setRequestHeader("apikey", apiKey);

    const body = new FormData();
    body.append("cacheControl", cacheControl);
    body.append("", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.min(1, e.loaded / e.total));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new UploadError(uploadMessage(xhr.status), xhr.status));
      }
    };
    xhr.onerror = () => reject(new UploadError("The upload was interrupted. Check your connection and retry.", 0));
    xhr.ontimeout = () => reject(new UploadError("The upload timed out. Check your connection and retry.", 0));
    xhr.onabort = () => reject(new UploadError("The upload was cancelled.", 0));
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}

function uploadMessage(status: number): string {
  if (status === 413) return "This photo is too large for the server (15 MB limit).";
  if (status === 415) return "This file type is not accepted. Use JPEG, PNG or WebP.";
  if (status === 401 || status === 403) return "The upload link expired. Retry to get a new one.";
  if (status === 409) return "This photo was already uploaded. Retry to continue.";
  return "The upload failed. Retry in a moment.";
}
