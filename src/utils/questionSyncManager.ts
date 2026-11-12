/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/game';

export interface ServerQuestionsResponse {
  success: boolean;
  exists: boolean;
  questions: Question[] | null;
  version?: number;
  updatedAt?: number;
  serverTimeMs?: number;
  message?: string;
}

export interface SyncQuestionsResult {
  success: boolean;
  version?: number;
  updatedAt?: number;
  message?: string;
  error?: string;
}

let inFlightSyncPromise: Promise<SyncQuestionsResult> | null = null;

/**
 * Fetch the authoritative question bank from the central server.
 * Uses cache: 'no-store' to ensure devices always receive fresh data.
 */
export async function fetchServerQuestions(): Promise<ServerQuestionsResponse | null> {
  try {
    const res = await fetch(`/api/game/questions?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data: ServerQuestionsResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('[questionSyncManager] Failed to fetch server questions:', err);
    return null;
  }
}

/**
 * Synchronize the complete question bank to the central server.
 * STRICT PROTECTION: Only an authenticated administrator may perform this action.
 * Student devices calling this will be rejected client-side and server-side.
 */
export async function syncQuestionsToServer(
  questions: Question[],
  isAdmin: boolean,
  version?: number
): Promise<SyncQuestionsResult> {
  if (!isAdmin) {
    return {
      success: false,
      error: 'Unauthorized: Only an authenticated administrator may synchronize questions',
    };
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      success: false,
      error: 'Invalid question bank payload: questions array is empty or undefined',
    };
  }

  // If another sync is in-flight, await it to prevent race conditions
  if (inFlightSyncPromise) {
    try {
      await inFlightSyncPromise;
    } catch {}
  }

  const syncPromise = (async (): Promise<SyncQuestionsResult> => {
    try {
      const payload = {
        questions,
        version: typeof version === 'number' ? version : undefined,
        updatedAt: Date.now(),
        updatedBy: 'admin',
      };

      const res = await fetch('/api/game/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        return {
          success: false,
          error: errorData?.message || `Server returned HTTP ${res.status}`,
          message: errorData?.message || `Server returned HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      return {
        success: Boolean(data?.success),
        version: data?.version,
        updatedAt: data?.updatedAt,
        message: data?.message,
      };
    } catch (err: any) {
      console.warn('[questionSyncManager] Failed to sync questions to server:', err);
      return {
        success: false,
        error: err?.message || 'Network error syncing questions',
        message: err?.message || 'Network error syncing questions',
      };
    }
  })();

  inFlightSyncPromise = syncPromise;
  try {
    return await syncPromise;
  } finally {
    inFlightSyncPromise = null;
  }
}
