/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';

export interface ServerPostersResponse {
  success: boolean;
  posters: Record<string, TeamPosterData>;
  submissions?: TeamPhotoSubmission[];
  serverTimeMs?: number;
}

/**
 * Fetch all synchronized team posters and photo submissions from the central server.
 */
export async function fetchServerPosters(): Promise<{
  posters: Record<string, TeamPosterData>;
  submissions: TeamPhotoSubmission[];
} | null> {
  try {
    const res = await fetch(`/api/game/posters?_t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data: ServerPostersResponse = await res.json();
    if (data && data.success && data.posters) {
      return {
        posters: data.posters,
        submissions: Array.isArray(data.submissions) ? data.submissions : [],
      };
    }
    return null;
  } catch (err) {
    console.warn('[posterSyncManager] Failed to fetch server posters:', err);
    return null;
  }
}

/**
 * Sync a single team's poster data and optional photo submission to the central server.
 * Ensures that one team's edits NEVER overwrite another team's data.
 */
export async function syncPosterToServer(
  teamId: string,
  poster: TeamPosterData,
  newSubmission?: TeamPhotoSubmission
): Promise<boolean> {
  if (!teamId || !poster) return false;

  try {
    const payload: {
      teamId: string;
      poster: TeamPosterData;
      submission?: TeamPhotoSubmission;
    } = {
      teamId,
      poster,
      submission: newSubmission,
    };

    const res = await fetch('/api/game/posters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data?.success);
    }
    return false;
  } catch (err) {
    console.warn(`[posterSyncManager] Failed to sync poster for ${teamId} to server:`, err);
    return false;
  }
}

/**
 * Sync all local posters and submissions to server (e.g. for initial bootstrap or teacher sync).
 */
export async function syncAllLocalPostersToServer(
  posters: Record<string, TeamPosterData>,
  submissions: TeamPhotoSubmission[] = []
): Promise<boolean> {
  if (!posters || Object.keys(posters).length === 0) return false;

  try {
    const res = await fetch('/api/game/posters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posters,
        submissions,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data?.success);
    }
    return false;
  } catch (err) {
    console.warn('[posterSyncManager] Failed to sync all posters to server:', err);
    return false;
  }
}

/**
 * Permanently clear all synchronized team posters, submissions, and session progress on server for a new game.
 */
export async function clearServerGameData(): Promise<boolean> {
  try {
    const res = await fetch('/api/game/clear-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data?.success);
    }
    return false;
  } catch (err) {
    console.warn('[posterSyncManager] Failed to clear game data on server:', err);
    return false;
  }
}

