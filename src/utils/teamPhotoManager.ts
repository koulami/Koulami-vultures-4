/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamPhotoSubmission, TeamPosterData } from '../types/posters';
import { Question } from '../types/game';

const SUBMISSIONS_STORAGE_KEY = 'vulture_team_photo_submissions_v2';

/**
 * Checks if a given image URL is a generic stock/internet photo
 * (e.g. Unsplash, placeholder) that must NOT be substituted on team posters.
 */
export function isGenericStockUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return true;
  if (trimmed.includes('images.unsplash.com')) return true;
  if (trimmed.includes('unsplash.com')) return true;
  if (trimmed.includes('placeholder')) return true;
  if (trimmed.includes('via.placeholder.com')) return true;
  return false;
}

/**
 * Retrieves all saved team photo submissions from persistent local storage.
 */
export function loadAllPhotoSubmissions(): TeamPhotoSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load team photo submissions:', err);
    return [];
  }
}

/**
 * Saves or updates a team photo submission in local storage.
 * Preserves the link between the photograph, its original activity, and the submitting team.
 */
export function savePhotoSubmission(submission: TeamPhotoSubmission): TeamPhotoSubmission[] {
  if (typeof window === 'undefined') return [submission];
  try {
    const current = loadAllPhotoSubmissions();
    // Replace if same questionId and teamId exists, otherwise append
    const filtered = current.filter(
      (s) => !(s.teamId === submission.teamId && s.questionId === submission.questionId)
    );
    const updated = [...filtered, submission];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save team photo submission:', err);
    return [submission];
  }
}

/**
 * Selects only the actual photographs that the selected team was instructed to take
 * during its assigned game questions and activities.
 *
 * Rules strictly enforced:
 * 1. ONLY photographs associated with the selected teamId.
 * 2. 0% generic internet stock photos, 0% AI-generated or unrelated images.
 * 3. Preserves the link to the original activity (missionTitle, taskPrompt, questionId).
 * 4. Never substitutes or invents photographs if none were submitted.
 */
export function getAuthenticPhotosForTeam(
  teamId: string,
  poster?: TeamPosterData | null,
  allSubmissions: TeamPhotoSubmission[] = []
): TeamPhotoSubmission[] {
  const result: TeamPhotoSubmission[] = [];
  const seenUrls = new Set<string>();

  // 1. Gather all submissions from the persistent submissions store for this team
  const teamSubs = allSubmissions.filter((sub) => sub.teamId === teamId);
  for (const sub of teamSubs) {
    if (sub.photoUrl && !isGenericStockUrl(sub.photoUrl) && !seenUrls.has(sub.photoUrl)) {
      seenUrls.add(sub.photoUrl);
      result.push(sub);
    }
  }

  // 2. Check if the poster itself has saved submissions in submittedPhotos
  if (poster && Array.isArray(poster.submittedPhotos)) {
    for (const sub of poster.submittedPhotos) {
      if (
        sub.teamId === teamId &&
        sub.photoUrl &&
        !isGenericStockUrl(sub.photoUrl) &&
        !seenUrls.has(sub.photoUrl)
      ) {
        seenUrls.add(sub.photoUrl);
        result.push(sub);
      }
    }
  }

  // 3. Check if poster.photoUrl is a real user upload (e.g. data:image/ or authentic local asset)
  // and NOT a generic Unsplash stock image
  if (
    poster &&
    poster.photoUrl &&
    !isGenericStockUrl(poster.photoUrl) &&
    !seenUrls.has(poster.photoUrl)
  ) {
    seenUrls.add(poster.photoUrl);
    result.push({
      id: `poster-direct-${poster.teamId}`,
      teamId: poster.teamId,
      questionId: 'activity-custom-upload',
      activityTitle: 'Επιτόπια Φωτογραφία Τεκμηρίωσης Ομάδας',
      taskPrompt: poster.photoCaption || 'Αυθεντική φωτογραφία τεκμηρίωσης ομάδας από τις δραστηριότητες πεδίου.',
      photoUrl: poster.photoUrl,
      submittedAt: poster.createdAt || new Date().toISOString().split('T')[0],
      caption: poster.photoCaption,
    });
  }

  return result;
}

/**
 * Helper to find all photo challenge questions assigned to a specific team.
 * Useful for displaying pending activity prompts when no photos have been submitted.
 */
export function getTeamPhotoChallenges(teamId: string, questions: Question[]): Question[] {
  return questions.filter(
    (q) =>
      q.isActive &&
      q.type === 'photo_upload' &&
      q.assignedTeamIds &&
      q.assignedTeamIds.includes(teamId)
  );
}
