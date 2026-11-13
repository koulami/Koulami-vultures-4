/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType =
  | 'multiple_choice'        // Single correct option
  | 'multiple_choice_multi'  // Multiple correct options
  | 'true_false'             // True / False
  | 'text_matching'          // Matching terms / concepts / definitions
  | 'image_matching'         // Visual recognition & matching
  | 'qr_scan'                // Field station QR code verification
  | 'photo_upload'           // Field photo challenge & observation
  | 'video_upload';          // Interactive video action challenge

export interface Team {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  avatar: string;
  color: string;
  secondaryColor: string;
  badgeColor: string;
  accentBorder: string;
  slogan: string;
  sloganEn?: string;
  description: string;
  descriptionEn?: string;
  iconName: string;
  themeCategory: string;
  themeCategoryEn?: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  category?: string;
  imageLeft?: string;
  imageRight?: string;
}

export interface ImageOption {
  id: string;
  label: string;
  imageUrl?: string;
  icon?: string;
  description?: string;
  attributeTag?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  missionTitle?: string; // Τίτλος Αποστολής (π.χ. Βάρος, pH Στομαχιού)
  title: string;         // Εκφώνηση / Ερώτηση
  instruction?: string;
  assignedTeamIds: string[];
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation: string;
  isActive: boolean;
  isPendingAnswer?: boolean; // When true, correct answer has not yet been entered
  tags?: string[];
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;     // Επισυναπτόμενο αρχείο ή URL από διαδίκτυο
  locationFocus?: 'Cyprus' | 'Greece' | 'Both' | 'Mediterranean';
  speciesFocus?: ('Gyps fulvus' | 'Aegypius monachus' | 'Gypaetus barbatus' | 'Neophron percnopterus' | 'All')[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: { id: string; text: string; detail?: string }[];
  correctAnswer?: string; // option id (optional or empty string when isPendingAnswer is true)
}

export interface MultipleChoiceMultiQuestion extends BaseQuestion {
  type: 'multiple_choice_multi';
  options: { id: string; text: string; detail?: string }[];
  correctAnswers?: string[]; // array of correct option ids (optional or empty array when isPendingAnswer is true)
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer?: boolean; // (optional when isPendingAnswer is true)
}

export interface TextMatchingQuestion extends BaseQuestion {
  type: 'text_matching';
  leftHeader?: string;
  rightHeader?: string;
  pairs: MatchingPair[];
}

export interface ImageMatchingQuestion extends BaseQuestion {
  type: 'image_matching';
  promptImage?: string;
  promptDescription?: string;
  options: ImageOption[];
  correctAnswer: string; // option id or structured map
  matchType?: 'identify_species' | 'identify_silhouette' | 'pair_equipment' | 'identify_nest';
}

export interface QRScanQuestion extends BaseQuestion {
  type: 'qr_scan';
  stationName: string;
  stationLocation: string;
  qrPayload: string; // Expected scan token or URL
  fieldClue: string;
  stationType: 'nesting_cliff' | 'feeding_station' | 'patrol_post' | 'information_center' | 'acclimatization_aviary';
}

export interface PhotoUploadQuestion extends BaseQuestion {
  type: 'photo_upload';
  taskPrompt: string;
  verificationCriteria: string[];
  exampleDescription: string;
  targetSubject: 'wingspan_measurement' | 'observation_gear' | 'habitat_cliff' | 'feeding_station' | 'canine_unit';
}

export interface VideoUploadQuestion extends BaseQuestion {
  type: 'video_upload';
  taskPrompt: string;
  durationSecondsMax: number;
  verificationCriteria: string[];
  targetSubject: 'thermal_flight_simulation' | 'anti_poison_speech' | 'field_interview' | 'species_presentation';
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleChoiceMultiQuestion
  | TrueFalseQuestion
  | TextMatchingQuestion
  | ImageMatchingQuestion
  | QRScanQuestion
  | PhotoUploadQuestion
  | VideoUploadQuestion;

export interface GameArenaConfig {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  version: string;
  datasetSource: string;
  academicReviewDate: string;
  regionsCovered: string[];
  teams: Team[];
  questions: Question[];
}
