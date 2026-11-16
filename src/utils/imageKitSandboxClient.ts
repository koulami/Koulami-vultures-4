/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SANDBOX_FOLDER = '/vulture-arena/test-sandbox/';
export const SANDBOX_QR_TOKEN = 'VA-TEST-IMAGEKIT-2026';
export const SANDBOX_CLEANUP_CONFIRM_PHRASE = 'DELETE_SANDBOX_MEDIA';

export const SANDBOX_TAGS = {
  image: 'test-ik-image-1',
  video: 'test-ik-video-1',
} as const;

export const MAX_IMAGEKIT_FREE_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_IMAGEKIT_FREE_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export type SandboxSlot = 'image' | 'video';

export interface ImageKitStatusResponse {
  success: boolean;
  configured: boolean;
  missingVars: string[];
  sandboxFolder: string;
  sandboxQrToken: string;
}

export interface SandboxMediaRef {
  url: string;
  name: string;
  size: number;
  fileType: string;
  mime: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SandboxTestRefResponse {
  success: boolean;
  configured: boolean;
  missingVars?: string[];
  found: boolean;
  slot: SandboxSlot;
  expectedFolder?: string;
  expectedTag?: string;
  duplicateCount: number;
  hasDuplicates: boolean;
  media: SandboxMediaRef | null;
  message?: string;
}

export interface RangeProbeResult {
  supported: boolean;
  status: number;
  acceptRanges: string | null;
  contentRange: string | null;
  contentLength: string | null;
  receivedBytes?: number;
  corsFilteredHeaders?: boolean;
  error?: string;
}

interface ImageKitUploadAuthResponse {
  success: boolean;
  slot: SandboxSlot;
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
  folder: string;
  tag: string;
  useUniqueFileName: boolean;
  message?: string;
}

export async function fetchImageKitStatus(): Promise<ImageKitStatusResponse> {
  const res = await fetch('/api/imagekit/status', {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return data;
}

export async function fetchSandboxMediaRef(slot: SandboxSlot): Promise<SandboxTestRefResponse> {
  const res = await fetch(`/api/imagekit/test-ref?slot=${encodeURIComponent(slot)}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return data;
}

export function validateSandboxFile(file: File, slot: SandboxSlot): string | null {
  if (!file || file.size <= 0) {
    return 'Empty file selected (0 bytes).';
  }

  if (slot === 'image') {
    const isImageMime = file.type.startsWith('image/');
    const hasImageExt = /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name);
    if (!isImageMime && !hasImageExt) {
      return 'Please select a valid image file (JPG, PNG, WebP, etc.).';
    }
    if (file.size > MAX_IMAGEKIT_FREE_IMAGE_BYTES) {
      return `Image exceeds ImageKit Free single-file cap of 25 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  }

  const isMp4 =
    file.type === 'video/mp4' ||
    file.name.toLowerCase().endsWith('.mp4') ||
    file.type.startsWith('video/');
  if (!isMp4) {
    return 'Please select a valid MP4 video file.';
  }
  if (file.size > MAX_IMAGEKIT_FREE_VIDEO_BYTES) {
    return `Video exceeds ImageKit Free single-file cap of 100 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
  }
  return null;
}

export async function uploadSandboxFileToImageKit(params: {
  file: File;
  slot: SandboxSlot;
  idToken: string;
  onProgress?: (percent: number) => void;
}): Promise<{
  url: string;
  fileId: string;
  name: string;
  size: number;
}> {
  const { file, slot, idToken, onProgress } = params;

  const validationError = validateSandboxFile(file, slot);
  if (validationError) {
    throw new Error(validationError);
  }

  // 1. Obtain short-lived upload signature from server after verifying Admin Firebase ID token
  const authRes = await fetch('/api/imagekit/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ slot }),
    cache: 'no-store',
  });

  const authData = (await authRes.json()) as ImageKitUploadAuthResponse;
  if (!authRes.ok || !authData.success) {
    throw new Error(authData.message || `Upload authorization failed (HTTP ${authRes.status}).`);
  }

  // 2. Upload file directly from teacher browser to ImageKit Upload API v1
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name || (slot === 'video' ? 'sandbox-video.mp4' : 'sandbox-image.jpg'));
  formData.append('publicKey', authData.publicKey);
  formData.append('signature', authData.signature);
  formData.append('expire', String(authData.expire));
  formData.append('token', authData.token);
  formData.append('folder', authData.folder);
  formData.append('tags', authData.tag);
  formData.append('useUniqueFileName', 'true');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0 && onProgress) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
          onProgress?.(100);
          resolve({
            url: payload.url,
            fileId: payload.fileId || '',
            name: payload.name || file.name,
            size: typeof payload.size === 'number' ? payload.size : file.size,
          });
        } else {
          reject(
            new Error(
              payload?.message || `ImageKit upload failed with HTTP ${xhr.status}.`
            )
          );
        }
      } catch {
        reject(new Error(`ImageKit upload returned non-JSON response (HTTP ${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during direct upload to ImageKit.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Timed out while uploading file to ImageKit.'));
    };

    xhr.send(formData);
  });
}

export async function cleanupSandboxMedia(params: {
  slot: SandboxSlot;
  idToken: string;
}): Promise<{ deletedCount: number; deletedNames: string[] }> {
  const res = await fetch('/api/imagekit/sandbox-cleanup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
    body: JSON.stringify({
      slot: params.slot,
      confirmPhrase: SANDBOX_CLEANUP_CONFIRM_PHRASE,
    }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Cleanup failed (HTTP ${res.status}).`);
  }
  return {
    deletedCount: data.deletedCount || 0,
    deletedNames: Array.isArray(data.deletedNames) ? data.deletedNames : [],
  };
}

export async function probeVideoRangeSupport(url: string): Promise<RangeProbeResult> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-1023',
      },
      cache: 'no-store',
    });
    const acceptRanges = res.headers.get('accept-ranges');
    const contentRange = res.headers.get('content-range');
    const contentLength = res.headers.get('content-length');
    const buf = await res.arrayBuffer();
    const receivedBytes = buf.byteLength;
    const isPartialSlice = res.status === 206 && (Boolean(contentRange) || receivedBytes === 1024);

    return {
      supported: isPartialSlice,
      status: res.status,
      acceptRanges,
      contentRange,
      contentLength,
      receivedBytes,
      corsFilteredHeaders: res.status === 206 && !contentRange,
    };
  } catch (err: unknown) {
    return {
      supported: false,
      status: 0,
      acceptRanges: null,
      contentRange: null,
      contentLength: null,
      error: err instanceof Error ? err.message : 'Range probe failed',
    };
  }
}

export function formatBytesCompact(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
