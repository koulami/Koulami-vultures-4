/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'vulture_station_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

// In-memory cache for Object URLs to avoid leaking memory and ensure instant playback
const objectUrlCache = new Map<string, string>();

/**
 * Open the native browser IndexedDB database for station media storage.
 * IndexedDB has ample storage (typically 50MB - 1GB+) for video & image Blobs,
 * preventing any localStorage QuotaExceededError.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export interface StoredMediaRecord {
  key: string; // Normalized QR token (uppercase)
  blob: Blob;
  mediaType: 'image' | 'video';
  fileName: string;
  mimeType: string;
  updatedAt: number;
}

// Track latest upload status for UI and diagnostic inspection
export interface StationMediaUploadStatus {
  token: string;
  serverSaved: boolean;
  httpStatus?: number;
  fileName?: string;
  fileSize?: number;
  serverFileSize?: number;
  warning?: string;
  serverError?: string;
  timestamp: number;
}

let latestUploadStatus: StationMediaUploadStatus | null = null;

export function getLatestStationMediaUploadStatus(): StationMediaUploadStatus | null {
  return latestUploadStatus;
}

export interface SaveStationMediaResult {
  success: boolean;
  serverSaved: boolean;
  url: string;
  fileName: string;
  fileSize: number;
  serverFileSize?: number;
  error?: string;
  warning?: string;
}

/**
 * Persistently stores a video or image Blob in IndexedDB AND uploads to the server
 * so that all student devices can retrieve the media.
 * The server upload is an awaited operation that verifies disk persistence and byte
 * count before updating or replacing existing media.
 */
export async function saveStationMediaBlob(
  qrToken: string,
  fileOrBlob: Blob,
  mediaType: 'image' | 'video',
  fileName: string = 'media-file',
  onWarning?: (warningMessage: string) => void
): Promise<SaveStationMediaResult> {
  const normKey = qrToken.trim().toUpperCase();
  const originalBlobSize = fileOrBlob.size;

  // 1. Upload to server for cross-device accessibility (AWAITED OPERATION)
  let serverSaved = false;
  let serverErrorMessage = '';
  let serverHttpStatus: number | undefined;
  let verifiedServerFileSize: number | undefined;

  try {
    const uploadRes = await fetch(`/api/station-media/${encodeURIComponent(normKey)}`, {
      method: 'POST',
      body: fileOrBlob,
      headers: {
        'Content-Type': fileOrBlob.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
        'X-File-Name': encodeURIComponent(fileName),
        'X-Media-Type': mediaType,
        'X-File-Size': String(originalBlobSize),
      },
    });

    serverHttpStatus = uploadRes.status;

    if (uploadRes.ok) {
      const data = await uploadRes.json().catch(() => null);
      if (data && data.success) {
        if (typeof data.size === 'number') {
          verifiedServerFileSize = data.size;
          if (data.size !== originalBlobSize) {
            serverErrorMessage = `Ο διακομιστής αποθήκευσε ${data.size} bytes αντί των αναμενόμενων ${originalBlobSize} bytes.`;
          }
        }

        // Verify disk persistence and file size by checking station media info with cache-busting
        try {
          const verifyRes = await fetch(
            `/api/station-media-info/${encodeURIComponent(normKey)}?_t=${Date.now()}`,
            { cache: 'no-store' }
          );
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json().catch(() => null);
            if (verifyData && verifyData.exists) {
              if (typeof verifyData.size === 'number') {
                verifiedServerFileSize = verifyData.size;
                if (verifyData.size === originalBlobSize) {
                  serverSaved = true;
                } else {
                  serverSaved = false;
                  serverErrorMessage = `Ο διακομιστής διαθέτει αρχείο ${verifyData.size} bytes αντί των ${originalBlobSize} bytes.`;
                }
              } else {
                serverSaved = true;
              }
            } else {
              serverSaved = false;
              serverErrorMessage = 'Ο διακομιστής επέστρεψε επιτυχία αλλά το αρχείο δεν εντοπίστηκε στον δίσκο.';
            }
          } else {
            // If info check request was interrupted, verify whether the upload response reported matching size
            if (typeof data.size === 'number' && data.size === originalBlobSize) {
              serverSaved = true;
            } else {
              serverSaved = false;
              serverErrorMessage = `Αδυναμία επαλήθευσης αρχείου στον δίσκο (HTTP ${verifyRes.status}).`;
            }
          }
        } catch {
          if (typeof data.size === 'number' && data.size === originalBlobSize) {
            serverSaved = true;
          } else {
            serverSaved = false;
            serverErrorMessage = 'Σφάλμα δικτύου κατά τον έλεγχο επαλήθευσης μεγέθους στον διακομιστή.';
          }
        }
      } else {
        serverErrorMessage = data?.message || `Ανεπιτυχής απόκριση διακομιστή (κωδικός ${uploadRes.status})`;
      }
    } else {
      const errData = await uploadRes.json().catch(() => null);
      serverErrorMessage = errData?.message || `Σφάλμα διακομιστή ${uploadRes.status}: ${uploadRes.statusText || 'Αποτυχία εγγραφής αρχείου'}`;
    }
  } catch (err: any) {
    serverErrorMessage = `Σφάλμα δικτύου κατά την αποστολή στον διακομιστή: ${err?.message || 'Αδυναμία σύνδεσης'}`;
  }

  latestUploadStatus = {
    token: normKey,
    serverSaved,
    httpStatus: serverHttpStatus,
    fileName,
    fileSize: originalBlobSize,
    serverFileSize: verifiedServerFileSize,
    serverError: serverErrorMessage || undefined,
    timestamp: Date.now(),
  };

  // If server upload failed, DO NOT overwrite or delete existing media in IndexedDB
  if (!serverSaved) {
    const warningMsg = `⚠️ ΠΡΟΣΟΧΗ: Η μεταφόρτωση του εκπαιδευτικού υλικού στον διακομιστή δεν ολοκληρώθηκε (${serverErrorMessage}). Το τυχόν προϋπάρχον αποθηκευμένο υλικό του σταθμού διατηρήθηκε. Το νέο αρχείο ΔΕΝ είναι διαθέσιμο στους μαθητές σε άλλες συσκευές.`;
    latestUploadStatus.warning = warningMsg;

    console.error('[saveStationMediaBlob]', warningMsg);

    if (onWarning) {
      onWarning(warningMsg);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('station-media-sync-warning', {
          detail: { token: normKey, message: warningMsg, serverError: serverErrorMessage, status: serverHttpStatus },
        })
      );
    }

    // Return local Object URL for admin preview only, explicitly indicating server failure
    const previewUrl = URL.createObjectURL(fileOrBlob);
    return {
      success: false,
      serverSaved: false,
      url: previewUrl,
      fileName,
      fileSize: originalBlobSize,
      serverFileSize: verifiedServerFileSize,
      error: serverErrorMessage,
      warning: warningMsg,
    };
  }

  // 2. Server confirmed successful replacement: Now persist in IndexedDB and update cache
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredMediaRecord = {
      key: normKey,
      blob: fileOrBlob,
      mediaType,
      fileName,
      mimeType: fileOrBlob.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      updatedAt: Date.now(),
    };

    const putReq = store.put(record);

    putReq.onsuccess = () => {
      // Revoke any previous cached object URL
      if (objectUrlCache.has(normKey)) {
        try {
          URL.revokeObjectURL(objectUrlCache.get(normKey)!);
        } catch {
          // ignore
        }
      }
      // Create and cache fresh Object URL
      const objectUrl = URL.createObjectURL(fileOrBlob);
      objectUrlCache.set(normKey, objectUrl);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('station-media-sync-success', {
            detail: { token: normKey, fileName },
          })
        );
      }

      // Return authoritative server endpoint URL for universal cross-device access!
      const serverUrl = `/api/station-media/${encodeURIComponent(normKey)}`;
      resolve({
        success: true,
        serverSaved: true,
        url: serverUrl,
        fileName,
        fileSize: originalBlobSize,
        serverFileSize: verifiedServerFileSize || originalBlobSize,
      });
    };

    putReq.onerror = () => {
      // Even if IndexedDB cache write fails, server has permanently stored the file
      const serverUrl = `/api/station-media/${encodeURIComponent(normKey)}`;
      resolve({
        success: true,
        serverSaved: true,
        url: serverUrl,
        fileName,
        fileSize: originalBlobSize,
        serverFileSize: verifiedServerFileSize || originalBlobSize,
      });
    };
  });
}

/**
 * Retrieves the stored media Object URL for a given station QR token from IndexedDB.
 */
export async function getStationMediaBlobUrl(qrToken: string): Promise<string | null> {
  const normKey = qrToken.trim().toUpperCase();
  if (objectUrlCache.has(normKey)) {
    return objectUrlCache.get(normKey)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(normKey);

      getReq.onsuccess = () => {
        const result = getReq.result as StoredMediaRecord | undefined;
        if (result && result.blob) {
          const url = URL.createObjectURL(result.blob);
          objectUrlCache.set(normKey, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      getReq.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes any media associated with a station QR token from IndexedDB and server.
 */
export async function deleteStationMediaBlob(qrToken: string): Promise<boolean> {
  const normKey = qrToken.trim().toUpperCase();

  // Delete from server (Awaited)
  try {
    const res = await fetch(`/api/station-media/${encodeURIComponent(normKey)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      console.warn('Server media deletion returned status:', res.status);
    }
  } catch (err) {
    console.warn('Server media deletion network error:', err);
  }

  if (objectUrlCache.has(normKey)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(normKey)!);
    } catch {
      // ignore
    }
    objectUrlCache.delete(normKey);
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(normKey);

      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Retrieves the stored media record (including blob, mediaType, fileName) for a given station QR token.
 */
export async function getStationMediaRecord(qrToken: string): Promise<StoredMediaRecord | null> {
  const normKey = qrToken.trim().toUpperCase();
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(normKey);

      getReq.onsuccess = () => {
        resolve((getReq.result as StoredMediaRecord) || null);
      };

      getReq.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error reading media record from IndexedDB:', err);
    return null;
  }
}

/**
 * Resolves full media URL and type for a question/station.
 * Prioritizes the central server so that any student device can stream and view the station media!
 */
export async function resolveQuestionMedia(
  mediaUrl: string | undefined,
  mediaType: 'image' | 'video' | 'none' | undefined,
  qrToken?: string
): Promise<{ url: string | null; mediaType: 'image' | 'video' | 'none' }> {
  const normToken = qrToken?.trim().toUpperCase();

  // 1. If station token is provided, check the central server first (for cross-device access!)
  if (normToken) {
    try {
      const serverInfoRes = await fetch(
        `/api/station-media-info/${encodeURIComponent(normToken)}?_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (serverInfoRes.ok) {
        const info = await serverInfoRes.json();
        // Ignore dummy text placeholders (< 500 bytes) so broken placeholders don't block valid video/image playback
        if (info && info.exists && info.url && (typeof info.size !== 'number' || info.size > 500)) {
          return { url: info.url, mediaType: info.mediaType || mediaType || 'video' };
        }
      }
    } catch {
      // Server check failed or offline; fallback to local storage
    }

    // Fallback: check local IndexedDB
    const record = await getStationMediaRecord(normToken);
    if (record && record.blob) {
      const blobUrl = await getStationMediaBlobUrl(normToken);
      if (blobUrl) {
        return { url: blobUrl, mediaType: record.mediaType || mediaType || 'video' };
      }
    }
  }

  // 2. Check mediaUrl pointer
  if (mediaUrl) {
    const trimmed = mediaUrl.trim();
    if (trimmed.startsWith('/api/station-media/')) {
      return { url: trimmed, mediaType: mediaType || 'video' };
    }
    if (trimmed.startsWith('idb://station-media/')) {
      const extractedToken = decodeURIComponent(trimmed.replace('idb://station-media/', '')).trim().toUpperCase();
      // Check server for extracted token first
      try {
        const serverInfoRes = await fetch(
          `/api/station-media-info/${encodeURIComponent(extractedToken)}?_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (serverInfoRes.ok) {
          const info = await serverInfoRes.json();
          if (info && info.exists && info.url && (typeof info.size !== 'number' || info.size > 500)) {
            return { url: info.url, mediaType: info.mediaType || mediaType || 'video' };
          }
        }
      } catch {}

      const blobUrl = await getStationMediaBlobUrl(extractedToken);
      if (blobUrl) {
        return { url: blobUrl, mediaType: mediaType || 'video' };
      }
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return { url: trimmed, mediaType: mediaType || 'image' };
    }
  }

  return { url: mediaUrl || null, mediaType: mediaType || 'none' };
}

/**
 * Resolves a question's media URL:
 * - If it's a web/http(s) URL or base64 data URL, returns it as-is.
 * - If it references IndexedDB (`idb://...`), queries IndexedDB for the Blob and returns the Object URL.
 */
export async function resolveQuestionMediaUrl(
  mediaUrl: string | undefined,
  qrToken?: string
): Promise<string | null> {
  const result = await resolveQuestionMedia(mediaUrl, undefined, qrToken);
  return result.url;
}
