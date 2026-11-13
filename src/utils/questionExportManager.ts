/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Team, MultipleChoiceQuestion, MultipleChoiceMultiQuestion, TrueFalseQuestion, TextMatchingQuestion, ImageMatchingQuestion, QRScanQuestion, PhotoUploadQuestion, VideoUploadQuestion } from '../types/game';
import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';

export interface FullBackupPayload {
  backupFormatVersion: string;
  exportedAt: string;
  metadata: {
    title: string;
    titleEn: string;
    datasetSource: string;
    systemVersion: string;
    totalQuestions: number;
    activeQuestions: number;
    inactiveQuestions: number;
    totalTeams: number;
    totalPosters: number;
    totalPhotoSubmissions: number;
    activeLanguage: string;
  };
  settings: {
    language: string;
    roomPin: string;
    selectedPosterTeamId: string;
    exportScope: string;
  };
  teams: Team[];
  questions: Question[];
  posters: Record<string, TeamPosterData>;
  savedPhotoSubmissions: TeamPhotoSubmission[];
  savedReflections?: Record<string, any>;
  storageAudit: {
    questionsSource: string;
    teamsSource: string;
    postersSource: string;
    submissionsSource: string;
    nonExportableItemsNote: string;
  };
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  totalRecords: number;
  message: string;
  messageEn: string;
  details?: Record<string, any>;
}

/**
 * Format all answer options into a clear, readable text representation for CSV/Register
 */
export function formatAllAnswersText(q: Question, language: 'el' | 'en' = 'el'): string {
  switch (q.type) {
    case 'multiple_choice':
    case 'multiple_choice_multi': {
      const mc = q as MultipleChoiceQuestion | MultipleChoiceMultiQuestion;
      if (!Array.isArray(mc.options) || mc.options.length === 0) return '—';
      return mc.options
        .map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          return `[${letter}] ${opt.text}`;
        })
        .join(' | ');
    }
    case 'true_false':
      return language === 'en' ? '[A] True | [B] False' : '[A] Σωστό | [B] Λάθος';
    case 'text_matching': {
      const tm = q as TextMatchingQuestion;
      if (!Array.isArray(tm.pairs) || tm.pairs.length === 0) return '—';
      return tm.pairs.map((p, idx) => `(${idx + 1}) ${p.left} ↔ ${p.right}`).join(' | ');
    }
    case 'image_matching': {
      const im = q as ImageMatchingQuestion;
      if (!Array.isArray(im.options) || im.options.length === 0) return '—';
      return im.options.map((opt, idx) => `[${idx + 1}] ${opt.label || opt.id}`).join(' | ');
    }
    case 'qr_scan': {
      const qr = q as QRScanQuestion;
      return `${qr.stationName || 'Σταθμός Πεδίου'} (Payload: ${qr.qrPayload || '—'})`;
    }
    case 'photo_upload': {
      const pu = q as PhotoUploadQuestion;
      return `${pu.taskPrompt || 'Υποβολή φωτογραφίας τεκμηρίωσης'}`;
    }
    case 'video_upload': {
      const vu = q as VideoUploadQuestion;
      return `${vu.taskPrompt || 'Υποβολή βίντεο δράσης'}`;
    }
    default:
      return '—';
  }
}

/**
 * Format the correct answer into human-readable text for CSV/Register
 */
export function formatCorrectAnswerText(q: Question, language: 'el' | 'en' = 'el'): string {
  if (q.isPendingAnswer) {
    return language === 'en' ? '[Pending Answer]' : '[Εκκρεμεί Απάντηση]';
  }
  switch (q.type) {
    case 'multiple_choice': {
      const mc = q as MultipleChoiceQuestion;
      const match = mc.options?.find((o) => o.id === mc.correctAnswer);
      return match ? match.text : String(mc.correctAnswer || '—');
    }
    case 'multiple_choice_multi': {
      const mcm = q as MultipleChoiceMultiQuestion;
      if (!Array.isArray(mcm.correctAnswers) || mcm.correctAnswers.length === 0) return '—';
      const matchedTexts = mcm.correctAnswers.map((ansId) => {
        const match = mcm.options?.find((o) => o.id === ansId);
        return match ? match.text : ansId;
      });
      return matchedTexts.join('; ');
    }
    case 'true_false': {
      const tf = q as TrueFalseQuestion;
      if (tf.correctAnswer === true) {
        return language === 'en' ? 'True (Σωστό)' : 'Σωστό';
      }
      return language === 'en' ? 'False (Λάθος)' : 'Λάθος';
    }
    case 'text_matching': {
      const tm = q as TextMatchingQuestion;
      if (!Array.isArray(tm.pairs) || tm.pairs.length === 0) return '—';
      return tm.pairs.map((p) => `${p.left} = ${p.right}`).join('; ');
    }
    case 'image_matching': {
      const im = q as ImageMatchingQuestion;
      const match = im.options?.find((o) => o.id === im.correctAnswer);
      return match ? match.label : String(im.correctAnswer || '—');
    }
    case 'qr_scan': {
      const qr = q as QRScanQuestion;
      return `QR Token: ${qr.qrPayload || 'Επαλήθευση Σταθμού'}`;
    }
    case 'photo_upload': {
      const pu = q as PhotoUploadQuestion;
      return Array.isArray(pu.verificationCriteria) && pu.verificationCriteria.length > 0
        ? `Κριτήρια: ${pu.verificationCriteria.join(', ')}`
        : 'Επιτόπιο φωτογραφικό εύρημα';
    }
    case 'video_upload': {
      const vu = q as VideoUploadQuestion;
      return Array.isArray(vu.verificationCriteria) && vu.verificationCriteria.length > 0
        ? `Κριτήρια: ${vu.verificationCriteria.join(', ')}`
        : 'Επιτόπια βιντεοσκόπηση δράσης';
    }
    default:
      return '—';
  }
}

/**
 * Format assigned team names
 */
export function formatAssignedTeams(assignedTeamIds: string[], teams: Team[], language: 'el' | 'en' = 'el'): string {
  if (!Array.isArray(assignedTeamIds) || assignedTeamIds.length === 0) {
    return language === 'en' ? 'All Teams / General Pool' : 'Όλες οι Ομάδες / Γενική Δεξαμενή';
  }
  return assignedTeamIds
    .map((tid) => {
      const team = teams.find((t) => t.id === tid);
      if (!team) return tid;
      return language === 'en'
        ? `Team ${team.number}: ${team.titleEn || team.title}`
        : `Ομάδα ${team.number}: ${team.title}`;
    })
    .join('; ');
}

/**
 * BUTTON 1: FULL JSON BACKUP
 * Downloads a complete, dated JSON file with all recoverable application data.
 */
export function exportFullJSONBackup(
  questions: Question[],
  teams: Team[],
  posters: Record<string, TeamPosterData>,
  savedPhotoSubmissions: TeamPhotoSubmission[],
  language: 'el' | 'en' = 'el',
  savedReflections?: Record<string, any>
): ExportResult {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `vulture-arena-full-backup-${dateStr}_${timeStr}.json`;

  const activeQuestionsCount = questions.filter((q) => q.isActive).length;

  const payload: FullBackupPayload = {
    backupFormatVersion: '2.1.0',
    exportedAt: now.toISOString(),
    metadata: {
      title: 'Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο',
      titleEn: 'On the Brink of Extinction - Vultures in Cyprus',
      datasetSource: 'ekpaideytiki-anafora-gypes-2026-10-29.json',
      systemVersion: '2.1.0-LIFE-CYPRUS',
      totalQuestions: questions.length,
      activeQuestions: activeQuestionsCount,
      inactiveQuestions: questions.length - activeQuestionsCount,
      totalTeams: teams.length,
      totalPosters: Object.keys(posters).length,
      totalPhotoSubmissions: savedPhotoSubmissions.length,
      activeLanguage: language,
    },
    settings: {
      language,
      roomPin: 'GYPES-2026',
      selectedPosterTeamId: 'team-characteristics',
      exportScope: 'ALL_QUESTIONS_ACTIVE_AND_INACTIVE_TEAMS_POSTERS_SUBMISSIONS',
    },
    teams,
    questions,
    posters,
    savedPhotoSubmissions,
    savedReflections: savedReflections || undefined,
    storageAudit: {
      questionsSource: 'localStorage(vulture_questions_custom_v2) with fallback to defaultGame/importedQuestions',
      teamsSource: 'localStorage(vulture_teams_custom_v2) with fallback to defaultTeams',
      postersSource: 'localStorage(vulture_posters_custom_v2) with fallback to initialDefaultPosters',
      submissionsSource: 'localStorage(vulture_team_photo_submissions)',
      nonExportableItemsNote: 'Όλα τα εσωτερικά δεδομένα (ενεργά/ανενεργά) εξήχθησαν πλήρως. Προσωρινές συνεδρίες ενεργού παίκτη (τρέχουσα απάντηση στη μνήμη) εξαιρούνται από στατικές αναφορές.',
    },
  };

  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      fileName,
      totalRecords: questions.length,
      message: `Το πλήρες αντίγραφο ασφαλείας δημιουργήθηκε επιτυχώς (${questions.length} ερωτήσεις, ${teams.length} ομάδες, ${Object.keys(posters).length} αφίσες, ${savedPhotoSubmissions.length} τεκμήρια).`,
      messageEn: `Full backup created successfully (${questions.length} questions, ${teams.length} teams, ${Object.keys(posters).length} posters, ${savedPhotoSubmissions.length} field submissions).`,
      details: payload.metadata,
    };
  } catch (error: any) {
    console.error('Failed to export JSON backup:', error);
    return {
      success: false,
      fileName,
      totalRecords: 0,
      message: `Σφάλμα κατά τη δημιουργία αντιγράφου ασφαλείας: ${error?.message || 'Άγνωστο σφάλμα'}`,
      messageEn: `Error creating backup: ${error?.message || 'Unknown error'}`,
    };
  }
}

/**
 * BUTTON 2: COMPLETE CSV EXPORT
 * Download a CSV file with one row per question and all required columns.
 * Preserves Greek characters via UTF-8 BOM (\uFEFF) and escapes RFC4180 properly.
 */
export function exportQuestionsCSV(
  questions: Question[],
  teams: Team[],
  language: 'el' | 'en' = 'el'
): ExportResult {
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `vulture-questions-register-${dateStr}.csv`;

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'ID Ερώτησης (Question ID)',
    'Σειρά (Order)',
    'Κατάσταση (Active Status)',
    'Ομάδα / Υποομάδα (Assigned Team)',
    'Εκφώνηση Ερώτησης (Greek Title)',
    'Question Title (English)',
    'Τύπος Ερώτησης (Question Type)',
    'Πόντοι (Points)',
    'Βαθμός Δυσκολίας (Difficulty)',
    'Τίτλος Αποστολής / Κατηγορία (Mission Title)',
    'Όλες οι Επιλογές Απάντησης (All Possible Answers)',
    'Σωστή Απάντηση (Correct Answer)',
    'Επιστημονική Επεξήγηση (Greek Scientific Explanation)',
    'Scientific Explanation (English)',
    'Τύπος Πολυμέσου (Media Type)',
    'Σύνδεσμος Πολυμέσου (Media URL)',
    'Γεωγραφική Εστίαση (Location Focus)',
    'Είδη Γυπών (Species Focus)',
    'Ετικέτες (Tags)',
  ];

  try {
    const rows = questions.map((q, idx) => {
      const qAny = q as any;
      const order = idx + 1;
      const activeStatus = q.isActive ? 'Active (Ενεργή)' : 'Inactive (Ανενεργή)';
      const assignedTeams = formatAssignedTeams(q.assignedTeamIds, teams, language);
      const titleEl = q.title || '';
      const titleEn = qAny.titleEn || titleEl;
      const qType = q.type || '';
      const points = q.points || 0;
      const difficulty = q.difficulty || 'medium';
      const missionTitle = q.missionTitle || '';
      const allAnswers = formatAllAnswersText(q, language);
      const correctAnswer = formatCorrectAnswerText(q, language);
      const explanationEl = q.explanation || '';
      const explanationEn = qAny.explanationEn || explanationEl;
      const mediaType = q.mediaType || 'none';
      const mediaUrl = q.mediaUrl || '';
      const locationFocus = q.locationFocus || 'Cyprus';
      const speciesFocus = Array.isArray(q.speciesFocus) ? q.speciesFocus.join(', ') : 'Gyps fulvus';
      const tags = Array.isArray(q.tags) ? q.tags.join(', ') : '';

      return [
        escapeCSV(q.id),
        escapeCSV(order),
        escapeCSV(activeStatus),
        escapeCSV(assignedTeams),
        escapeCSV(titleEl),
        escapeCSV(titleEn),
        escapeCSV(qType),
        escapeCSV(points),
        escapeCSV(difficulty),
        escapeCSV(missionTitle),
        escapeCSV(allAnswers),
        escapeCSV(correctAnswer),
        escapeCSV(explanationEl),
        escapeCSV(explanationEn),
        escapeCSV(mediaType),
        escapeCSV(mediaUrl),
        escapeCSV(locationFocus),
        escapeCSV(speciesFocus),
        escapeCSV(tags),
      ].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel Greek character encoding support
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      fileName,
      totalRecords: questions.length,
      message: `Η εξαγωγή CSV ολοκληρώθηκε επιτυχώς (${questions.length} ερωτήσεις, ενεργές & ανενεργές).`,
      messageEn: `CSV export completed successfully (${questions.length} questions, active & inactive).`,
    };
  } catch (error: any) {
    console.error('Failed to export CSV:', error);
    return {
      success: false,
      fileName,
      totalRecords: 0,
      message: `Σφάλμα κατά την εξαγωγή CSV: ${error?.message || 'Άγνωστο σφάλμα'}`,
      messageEn: `Error exporting CSV: ${error?.message || 'Unknown error'}`,
    };
  }
}
