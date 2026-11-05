/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamScientificFact {
  id: string;
  icon: string;
  stat?: string;
  statEn?: string;
  headline: string;
  headlineEn?: string;
  detail: string;
  detailEn?: string;
  category: string;
  categoryEn?: string;
}

export interface TeamPhotoSubmission {
  id: string;
  teamId: string;
  questionId: string;
  activityTitle: string;
  activityTitleEn?: string;
  taskPrompt: string;
  taskPromptEn?: string;
  photoUrl: string;
  fileName?: string;
  submittedAt: string;
  caption?: string;
  captionEn?: string;
}

export interface TeamPosterData {
  teamId: string;
  teamNumber: number;
  teamTitle: string;
  teamTitleEn: string;
  teamColor: string;
  teamAvatar: string;
  slogan: string;
  sloganEn?: string;
  members: string[];
  photoUrl: string;
  photoCaption: string;
  photoCaptionEn?: string;
  submittedPhotos?: TeamPhotoSubmission[];
  wowMomentQuote: string;
  wowMomentQuoteEn?: string;
  quoteAuthor: string;
  quoteAuthorEn?: string;
  score: number;
  completedQuestsCount: number;
  totalQuestsCount: number;
  scientificFacts: TeamScientificFact[];
  createdAt: string;
  verifiedBy: string;
  verifiedByEn?: string;
}

export interface ArenaRunReport {
  arenaId: string;
  arenaTitle: string;
  reportDate: string;
  datasetSource: string;
  totalTeams: number;
  totalScore: number;
  totalQuestsCompleted: number;
  posters: Record<string, TeamPosterData>;
}

export interface SavedTeamReflection {
  questionId: string;
  teamId: string;
  text: string;
  submittedAt: string;
}

