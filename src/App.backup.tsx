/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  defaultTeams,
  defaultQuestions,
  calculateTotalPoints,
  getQuestionsByTeam,
  getQuestionsByType,
} from './data/defaultGame';
import {
  Question,
  QuestionType,
  Team,
  MultipleChoiceQuestion,
  MultipleChoiceMultiQuestion,
  TrueFalseQuestion,
  TextMatchingQuestion,
  ImageMatchingQuestion,
  QRScanQuestion,
  PhotoUploadQuestion,
  VideoUploadQuestion,
} from './types/game';
import { TeamPosterData, TeamPhotoSubmission } from './types/posters';
import { initialDefaultPosters } from './data/teamScientificFacts';
import { selectPosterFactsForTeam } from './utils/posterContentSelector';
import {
  loadAllPhotoSubmissions,
  savePhotoSubmission,
  getAuthenticPhotosForTeam,
} from './utils/teamPhotoManager';
import { TeamPoster } from './components/TeamPoster';
import { CreatePosterModal } from './components/CreatePosterModal';
import { TeacherPresentationModal } from './components/TeacherPresentationModal';
import { AdminReportModal } from './components/AdminReportModal';
import { JoinQRModal } from './components/JoinQRModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditQuestionModal } from './components/EditQuestionModal';
import { EditTeamModal } from './components/EditTeamModal';
import { Language, translations } from './i18n/translations';
import {
  Feather,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
  QrCode,
  Camera,
  Video,
  Layers,
  BookOpen,
  Users,
  Search,
  Filter,
  RefreshCw,
  Check,
  ChevronRight,
  Info,
  MapPin,
  Flame,
  FileCode,
  Eye,
  SlidersHorizontal,
  Compass,
  Palette,
  Tv,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Smartphone,
  Lock,
  Unlock,
  KeyRound,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  LogOut,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Target,
  Film,
} from 'lucide-react';

export default function App() {
  // Language Selection ('el' | 'en')
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('vulture_app_lang');
      if (savedLang === 'el' || savedLang === 'en') return savedLang;
    }
    return 'el';
  });

  useEffect(() => {
    localStorage.setItem('vulture_app_lang', language);
  }, [language]);

  const t = translations[language];

  // State for Teams (editable by Admin)
  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_teams_custom_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaultTeams;
  });

  // State for Questions (75 questions mapped directly from JSON, reorderable, togglable, reassignable)
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_questions_custom_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 70) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaultQuestions;
  });

  // State for Posters
  const [posters, setPosters] = useState<Record<string, TeamPosterData>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_posters_custom_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialDefaultPosters;
  });

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<'arena' | 'teams' | 'posters' | 'pool' | 'guide'>('arena');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPosterTeamId, setSelectedPosterTeamId] = useState<string>('team-characteristics');

  // Admin Mode State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vulture_admin_auth') === 'true';
    }
    return false;
  });

  // Modals state
  const [isJoinQROpen, setIsJoinQROpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isCreatePosterOpen, setIsCreatePosterOpen] = useState<boolean>(false);
  const [modalInitialTeamId, setModalInitialTeamId] = useState<string>('team-characteristics');
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [presentationIndex, setPresentationIndex] = useState<number>(0);
  const [isAdminReportOpen, setIsAdminReportOpen] = useState<boolean>(false);

  // Edit Question & Team Modals
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState<boolean>(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState<boolean>(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('vulture_questions_custom_v2', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('vulture_teams_custom_v2', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(posters));
  }, [posters]);

  useEffect(() => {
    localStorage.setItem('vulture_admin_auth', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Active question in the Play/Arena simulator
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userSingleChoice, setUserSingleChoice] = useState<string | null>(null);
  const [userMultiChoice, setUserMultiChoice] = useState<string[]>([]);
  const [userTrueFalse, setUserTrueFalse] = useState<boolean | null>(null);
  const [userMatches, setUserMatches] = useState<Record<string, string>>({});
  const [userSelectedLeft, setUserSelectedLeft] = useState<string | null>(null);
  const [userImageChoice, setUserImageChoice] = useState<string | null>(null);
  const [userQrInput, setUserQrInput] = useState<string>('');
  const [userUploadedFile, setUserUploadedFile] = useState<string | null>(null);
  const [userUploadedDataUrl, setUserUploadedDataUrl] = useState<string | null>(null);
  const [teamPhotoSubmissions, setTeamPhotoSubmissions] = useState<TeamPhotoSubmission[]>(() => {
    return loadAllPhotoSubmissions();
  });
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

// YouTube URL helpers
function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

  // Filtered list of questions for the Arena
  const activeQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesActive = q.isActive;
      const matchesTeam = selectedTeamFilter === 'all' || q.assignedTeamIds.includes(selectedTeamFilter);
      const matchesType = selectedTypeFilter === 'all' || q.type === selectedTypeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.missionTitle && q.missionTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesActive && matchesTeam && matchesType && matchesSearch;
    });
  }, [questions, selectedTeamFilter, selectedTypeFilter, searchQuery]);

  const currentQ: Question | undefined = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Reset interactive inputs when changing question
  const resetQuestionState = () => {
    setUserSingleChoice(null);
    setUserMultiChoice([]);
    setUserTrueFalse(null);
    setUserMatches({});
    setUserSelectedLeft(null);
    setUserImageChoice(null);
    setUserQrInput('');
    setUserUploadedFile(null);
    setUserUploadedDataUrl(null);
    setIsAnswerSubmitted(false);
  };

  const handleNextQuestion = () => {
    resetQuestionState();
    setCurrentQuestionIndex((prev) => (prev + 1) % (activeQuestions.length || 1));
  };

  const handlePrevQuestion = () => {
    resetQuestionState();
    setCurrentQuestionIndex((prev) => (prev - 1 + activeQuestions.length) % (activeQuestions.length || 1));
  };

  // Toggle active status for question
  const toggleQuestionActive = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q))
    );
  };

  // Change which team a question is assigned to
  const handleChangeQuestionTeam = (id: string, newTeamId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, assignedTeamIds: [newTeamId] } : q))
    );
  };

  // Move Question UP
  const handleMoveQuestionUp = (id: string) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      if (index <= 0) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move Question DOWN
  const handleMoveQuestionDown = (id: string) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Bulk active/inactive
  const handleActivateAll = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, isActive: true })));
  };

  const handleDeactivateAll = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, isActive: false })));
  };

  // Check correctness of currently selected question
  const isAnswerCorrect = useMemo(() => {
    if (!currentQ || !isAnswerSubmitted) return false;

    switch (currentQ.type) {
      case 'multiple_choice':
        return userSingleChoice === (currentQ as MultipleChoiceQuestion).correctAnswer;
      case 'multiple_choice_multi': {
        const correct = (currentQ as MultipleChoiceMultiQuestion).correctAnswers.sort();
        const selected = [...userMultiChoice].sort();
        return JSON.stringify(correct) === JSON.stringify(selected);
      }
      case 'true_false':
        return userTrueFalse === (currentQ as TrueFalseQuestion).correctAnswer;
      case 'text_matching': {
        const pairs = (currentQ as TextMatchingQuestion).pairs;
        return pairs.every((p) => userMatches[p.id] === p.right);
      }
      case 'image_matching':
        return userImageChoice === (currentQ as ImageMatchingQuestion).correctAnswer;
      case 'qr_scan':
        return (
          userQrInput.trim().toUpperCase() ===
          (currentQ as QRScanQuestion).qrPayload.trim().toUpperCase()
        );
      case 'photo_upload':
      case 'video_upload':
        return Boolean(userUploadedFile);
      default:
        return false;
    }
  }, [
    currentQ,
    isAnswerSubmitted,
    userSingleChoice,
    userMultiChoice,
    userTrueFalse,
    userMatches,
    userImageChoice,
    userQrInput,
    userUploadedFile,
  ]);

  const handleSubmitAnswer = () => {
    setIsAnswerSubmitted(true);
    setAnsweredCount((prev) => prev + 1);
    if (isAnswerCorrect) {
      setScore((prev) => prev + (currentQ?.points || 0));
    }

    // If this was an authentic photo challenge and image data was selected:
    if (currentQ?.type === 'photo_upload' && userUploadedDataUrl) {
      const targetTeamId =
        (currentQ.assignedTeamIds && currentQ.assignedTeamIds[0]) || 'team-characteristics';
      const promptText = (currentQ as PhotoUploadQuestion).taskPrompt || currentQ.title;
      const newSub: TeamPhotoSubmission = {
        id: `photo-sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        teamId: targetTeamId,
        questionId: currentQ.id,
        activityTitle: currentQ.missionTitle || currentQ.title,
        taskPrompt: promptText,
        photoUrl: userUploadedDataUrl,
        fileName: userUploadedFile || 'authentic-team-photo.jpg',
        submittedAt: new Date().toISOString(),
        caption: `${currentQ.missionTitle || 'Αποστολή Φωτογράφισης'}: ${userUploadedFile || 'Τεκμήριο Ομάδας'}`,
      };

      const updatedSubs = savePhotoSubmission(newSub);
      setTeamPhotoSubmissions(updatedSubs);

      // Also persist directly into the team's poster record
      setPosters((prev) => {
        const existing = prev[targetTeamId];
        if (!existing) return prev;
        const currentList = existing.submittedPhotos || [];
        const filtered = currentList.filter((s) => s.questionId !== currentQ.id);
        const updated = {
          ...existing,
          photoUrl: userUploadedDataUrl,
          photoCaption: newSub.caption || 'Επιτόπια φωτογραφία τεκμηρίωσης.',
          submittedPhotos: [...filtered, newSub],
        };
        const next = { ...prev, [targetTeamId]: updated };
        if (typeof window !== 'undefined') {
          localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  const totalPoints = useMemo(() => {
    return questions.filter((q) => q.isActive).reduce((acc, q) => acc + q.points, 0);
  }, [questions]);

  const activeCount = useMemo(() => {
    return questions.filter((q) => q.isActive).length;
  }, [questions]);

  // Admin Actions for Questions
  const handleOpenAddQuestion = () => {
    setQuestionToEdit(null);
    setIsEditQuestionOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setQuestionToEdit(q);
    setIsEditQuestionOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την ερώτηση;')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleSaveQuestion = (savedQuestion: Question) => {
    setQuestions((prev) => {
      const exists = prev.some((q) => q.id === savedQuestion.id);
      if (exists) {
        return prev.map((q) => (q.id === savedQuestion.id ? savedQuestion : q));
      } else {
        return [savedQuestion, ...prev];
      }
    });
  };

  // Admin Actions for Teams
  const handleOpenEditTeam = (team: Team) => {
    setTeamToEdit(team);
    setIsEditTeamOpen(true);
  };

  const handleSaveTeam = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
    );
  };

  // Reset to original defaults
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'ΠΡΟΣΟΧΗ: Θέλετε να επαναφέρετε όλες τις 75 ερωτήσεις και τις ομάδες στις αρχικές ρυθμίσεις του ekpaideytiki-anafora-gypes-2026-10-29_1818ef45.json;'
      )
    ) {
      setQuestions(defaultQuestions);
      setTeams(defaultTeams);
      setPosters(initialDefaultPosters);
      localStorage.removeItem('vulture_questions_custom_v2');
      localStorage.removeItem('vulture_teams_custom_v2');
      localStorage.removeItem('vulture_posters_custom_v2');
    }
  };

  // Open Create Poster modal
  const handleOpenCreatePoster = (teamId?: string) => {
    const targetTeam = teamId || selectedPosterTeamId || 'team-characteristics';
    setModalInitialTeamId(targetTeam);
    setIsCreatePosterOpen(true);
  };

  const handleSavePoster = (newPoster: TeamPosterData) => {
    setPosters((prev) => ({
      ...prev,
      [newPoster.teamId]: newPoster,
    }));
    setSelectedPosterTeamId(newPoster.teamId);
    setActiveTab('posters');
  };

  const handleOpenPresentation = (teamIndex: number = 0) => {
    setPresentationIndex(teamIndex);
    setIsPresentationOpen(true);
  };

  const renderTypeBadge = (type: QuestionType) => {
    const config: Record<QuestionType, { label: string; icon: any; color: string }> = {
      multiple_choice: { label: 'Πολλαπλή Επιλογή (Μονή)', icon: CheckCircle2, color: 'bg-amber-100 text-amber-800 border-amber-300' },
      multiple_choice_multi: { label: 'Πολλαπλή Επιλογή (Πολλαπλή)', icon: Layers, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      true_false: { label: 'Σωστό / Λάθος', icon: Check, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      text_matching: { label: 'Αντιστοίχιση Κειμένου', icon: SlidersHorizontal, color: 'bg-sky-100 text-sky-800 border-sky-300' },
      image_matching: { label: 'Αναγνώριση Εικόνας / Σιλουέτας', icon: Eye, color: 'bg-purple-100 text-purple-800 border-purple-300' },
      qr_scan: { label: 'Σάρωση Σταθμού QR', icon: QrCode, color: 'bg-rose-100 text-rose-800 border-rose-300' },
      photo_upload: { label: 'Αποστολή Φωτογραφίας Πεδίου', icon: Camera, color: 'bg-teal-100 text-teal-800 border-teal-300' },
      video_upload: { label: 'Αποστολή Βίντεο Δράσης', icon: Video, color: 'bg-orange-100 text-orange-800 border-orange-300' },
    };

    const item = config[type] || { label: type, icon: Info, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${item.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  // Helper to ensure poster scientific facts and authentic photographs are derived exclusively from questions assigned to that team
  const getPosterWithDynamicFacts = (basePoster: TeamPosterData, lang: 'el' | 'en' = language): TeamPosterData => {
    if (!basePoster) return basePoster;
    const dynamicFacts = selectPosterFactsForTeam(basePoster.teamId, questions, lang);
    const authenticPhotos = getAuthenticPhotosForTeam(
      basePoster.teamId,
      basePoster,
      teamPhotoSubmissions
    );
    return {
      ...basePoster,
      scientificFacts: dynamicFacts,
      submittedPhotos: authenticPhotos,
      photoUrl: authenticPhotos.length > 0 ? authenticPhotos[0].photoUrl : '',
      photoCaption:
        authenticPhotos.length > 0
          ? (authenticPhotos[0].caption || authenticPhotos[0].taskPrompt)
          : '',
    };
  };

  const rawPosterData = posters[selectedPosterTeamId] || Object.values(posters)[0];
  const currentPosterData = useMemo(() => {
    return rawPosterData ? getPosterWithDynamicFacts(rawPosterData, language) : null;
  }, [rawPosterData, questions, teamPhotoSubmissions, language]);

  const dynamicPostersList = useMemo(() => {
    return Object.values(posters).map((p) => getPosterWithDynamicFacts(p, language));
  }, [posters, questions, teamPhotoSubmissions, language]);

  const dynamicPostersMap = useMemo(() => {
    const res: Record<string, TeamPosterData> = {};
    for (const [key, val] of Object.entries(posters)) {
      res[key] = getPosterWithDynamicFacts(val, language);
    }
    return res;
  }, [posters, questions, teamPhotoSubmissions, language]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Admin Sticky Control Bar (When Logged In) */}
      {isAdminLoggedIn && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-3 border-b border-amber-600 shadow-sm z-50">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-stone-950" />
            <span>
              🛡️ <strong>Λειτουργία Διαχειριστή Ενεργή:</strong> Έχετε πλήρη δικαιώματα διαχείρισης: ενεργοποίηση/απενεργοποίηση, ανάθεση ομάδας και μετακίνηση πάνω/κάτω.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddQuestion}
              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Νέα Ερώτηση
            </button>
            <button
              onClick={() => {
                setActiveTab('teams');
              }}
              className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Επεξεργασία Ομάδων
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1"
              title="Επαναφορά αρχικών δεδομένων αναφοράς (75 ερωτήσεις)"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Επαναφορά
            </button>
            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="px-2.5 py-1 bg-stone-950 text-amber-300 hover:bg-black rounded-lg transition-colors flex items-center gap-1"
              title="Έξοδος από λειτουργία διαχειριστή"
            >
              <LogOut className="w-3.5 h-3.5" /> Αποσύνδεση
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Header with EXACT User-Requested Title */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner">
              🦅
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* EXACT USER TITLE (supports EL / EN) */}
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span className="text-amber-400">{t.appTitleMain}</span>
                  <span className="text-stone-400 font-light">-</span>
                  <span>{t.appTitleSub}</span>
                </h1>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                  {t.projectBadge}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {language === 'el'
                  ? `Διαδραστική Εκπαιδευτική Πλατφόρμα & Αρένα Γνώσεων • ${questions.length} Ερωτήσεις Πεδίου • 4 Ομάδες`
                  : `Interactive Educational Platform & Arena • ${questions.length} Field Questions • 4 Teams`}
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Selector Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
            {/* LANGUAGE SELECTOR (ΕΛΛΗΝΙΚΑ / ENGLISH - REQUESTED) */}
            <div className="flex items-center bg-stone-950/80 border border-stone-700 rounded-xl p-0.5 shadow-2xs mr-1">
              <button
                type="button"
                onClick={() => setLanguage('el')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'el'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Ελληνική Γλώσσα"
              >
                <span>🇬🇷</span>
                <span className="font-extrabold">ΕΛ</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="English Language"
              >
                <span>🇬🇧</span>
                <span className="font-extrabold">EN</span>
              </button>
            </div>

            {/* 1. DEDICATED QR CODE BUTTON FOR CONNECTION */}
            <button
              onClick={() => setIsJoinQROpen(true)}
              className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 ring-2 ring-emerald-400/30 cursor-pointer"
              title={t.joinQrTooltip}
            >
              <QrCode className="w-4 h-4 text-emerald-200" />
              <span>{t.joinQrBtn}</span>
            </button>

            {/* Quick Action: Create Poster */}
            <button
              onClick={() => handleOpenCreatePoster()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t.createPosterBtn}</span>
            </button>

            {/* Quick Action: Teacher Presentation Mode */}
            <button
              onClick={() => handleOpenPresentation(0)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={t.presentationTooltip}
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.presentationBtn}</span>
            </button>

            {/* Quick Action: Admin Reports */}
            <button
              onClick={() => setIsAdminReportOpen(true)}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={t.reportsTooltip}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">{t.reportsBtn}</span>
            </button>

            {/* 2. DEDICATED ADMIN LOGIN / EDIT BUTTON */}
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveTab('pool');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
              }`}
              title={isAdminLoggedIn ? t.adminLoggedInTooltip : t.adminLoginTooltip}
            >
              {isAdminLoggedIn ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.adminBtn}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.adminBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto border-t border-stone-800/80 pt-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'arena'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50 rounded-t-lg font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            {t.tabArena}
          </button>
          <button
            onClick={() => setActiveTab('pool')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pool'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50 rounded-t-lg font-bold'
                : 'border-transparent text-amber-300 hover:text-amber-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            {t.tabPool} ({questions.length})
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
              {activeCount} {language === 'el' ? 'ενεργές' : 'active'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('posters')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'posters'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50 rounded-t-lg font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            {t.tabPosters}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'teams'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50 rounded-t-lg font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.tabTeams}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-400 bg-stone-800/50 rounded-t-lg font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {language === 'el' ? 'Εκπαιδευτικός Οδηγός' : 'Field Guide'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* TAB 1: QUESTION POOL MANAGER (WITH INLINE TEAM SELECTOR, ACTIVE TOGGLES, AND UP/DOWN ARROWS) */}
        {activeTab === 'pool' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {t.poolTitle.replace('{count}', String(questions.length))}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {t.poolDesc}
                </p>
              </div>

              {/* Action Buttons: Add Question & Bulk Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleActivateAll}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.activateAll}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.activateAll}
                </button>

                <button
                  onClick={handleDeactivateAll}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.deactivateAll}
                >
                  <XCircle className="w-3.5 h-3.5 text-stone-500" />
                  {t.deactivateAll}
                </button>

                <button
                  onClick={handleOpenAddQuestion}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {t.newQuestion}
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> {t.filterStatus}
                </span>

                <select
                  value={selectedTeamFilter}
                  onChange={(e) => setSelectedTeamFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">{t.allTeams}</option>
                  {teams.map((teamItem) => (
                    <option key={teamItem.id} value={teamItem.id}>
                      {teamItem.avatar} {language === 'el' ? `Ομάδα ${teamItem.number}: ${teamItem.title}` : `Team ${teamItem.number}: ${teamItem.titleEn}`}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="active">{t.onlyActive} ({activeCount})</option>
                  <option value="inactive">{t.onlyInactive} ({questions.length - activeCount})</option>
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="multiple_choice">{t.type_multiple_choice}</option>
                  <option value="multiple_choice_multi">{t.type_multiple_choice_multi}</option>
                  <option value="true_false">{t.type_true_false}</option>
                  <option value="text_matching">{t.type_text_matching}</option>
                  <option value="image_matching">{t.type_image_matching}</option>
                  <option value="qr_scan">{t.type_qr_scan}</option>
                  <option value="photo_upload">{t.type_photo_upload}</option>
                  <option value="video_upload">{t.type_video_upload}</option>
                </select>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Questions Table with Up/Down Arrows and Inline Team Selection */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] sm:text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3 text-center w-16">{t.tableOrder}</th>
                      <th className="py-3 px-3 w-28">{t.tableStatus}</th>
                      <th className="py-3 px-4">{t.tableQuestionTitle}</th>
                      <th className="py-3 px-4 w-48">{t.tableTeamAssign}</th>
                      <th className="py-3 px-3 w-32">{t.tableType}</th>
                      <th className="py-3 px-3 w-20">{t.tablePoints}</th>
                      <th className="py-3 px-4 text-right w-36">{t.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {questions
                      .filter((q) => {
                        const matchesTeam =
                          selectedTeamFilter === 'all' || q.assignedTeamIds.includes(selectedTeamFilter);
                        const matchesStatus =
                          selectedStatusFilter === 'all' ||
                          (selectedStatusFilter === 'active' && q.isActive) ||
                          (selectedStatusFilter === 'inactive' && !q.isActive);
                        const matchesType =
                          selectedTypeFilter === 'all' || q.type === selectedTypeFilter;
                        const matchesSearch =
                          searchQuery.trim() === '' ||
                          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.missionTitle && q.missionTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          q.explanation.toLowerCase().includes(searchQuery.toLowerCase());

                        return matchesTeam && matchesStatus && matchesType && matchesSearch;
                      })
                      .map((q, filteredIdx) => {
                        const actualIdx = questions.findIndex((item) => item.id === q.id);
                        const currentTeamId = q.assignedTeamIds[0] || 'team-characteristics';
                        const currentTeamObj = teams.find((t) => t.id === currentTeamId);

                        return (
                          <tr key={q.id} className="hover:bg-amber-50/40 transition-colors">
                            {/* 1. UP / DOWN MOVE ARROWS */}
                            <td className="py-3 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveQuestionUp(q.id)}
                                  disabled={actualIdx === 0}
                                  className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                  title="Μετακίνηση Ερώτησης Πάνω"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono text-[11px] font-bold text-stone-400 w-5 text-center">
                                  {actualIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveQuestionDown(q.id)}
                                  disabled={actualIdx === questions.length - 1}
                                  className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                  title="Μετακίνηση Ερώτησης Κάτω"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* 2. ACTIVE / INACTIVE TOGGLE */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleQuestionActive(q.id)}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                  q.isActive
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-stone-100 text-stone-400 border-stone-300 hover:bg-stone-200'
                                }`}
                                title="Toggle Active / Inactive"
                              >
                                {q.isActive ? t.activeBadge : t.inactiveBadge}
                              </button>
                            </td>

                            {/* 3. QUESTION TITLE & DETAILS (WITH MISSION TITLE & MEDIA INDICATOR) */}
                            <td className="py-3 px-4 font-medium text-stone-900">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                {q.missionTitle && (
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                    <Target className="w-3 h-3 text-amber-700" />
                                    <span>{q.missionTitle}</span>
                                  </span>
                                )}
                                {q.mediaUrl && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                    {q.mediaType === 'video' ? '🎥 ' + t.mediaTypeVideo : '📷 ' + t.mediaTypeImage}
                                  </span>
                                )}
                              </div>
                              <div className="leading-snug text-xs sm:text-sm font-semibold text-stone-900">{q.title}</div>
                              {q.explanation && q.explanation !== '-' && (
                                <p className="text-[11px] text-stone-500 mt-1 line-clamp-1 italic">
                                  {q.explanation}
                                </p>
                              )}
                            </td>

                            {/* 4. CHOOSE WHICH TEAM IT BELONGS TO */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={currentTeamId}
                                onChange={(e) => handleChangeQuestionTeam(q.id, e.target.value)}
                                className="text-xs bg-stone-50 hover:bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                                style={{
                                  borderLeftColor: currentTeamObj?.color || '#D97706',
                                  borderLeftWidth: '4px',
                                }}
                              >
                                {teams.map((tm) => (
                                  <option key={tm.id} value={tm.id}>
                                    {tm.avatar} {language === 'el' ? `Ομάδα ${tm.number}: ${tm.title}` : `Team ${tm.number}: ${tm.titleEn}`}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* 5. TYPE BADGE */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {renderTypeBadge(q.type)}
                            </td>

                            {/* 6. POINTS */}
                            <td className="py-3 px-3 whitespace-nowrap font-bold text-stone-800 text-xs">
                              {q.points} pts
                            </td>

                            {/* 7. ACTIONS (TEST, EDIT, DELETE) */}
                            <td className="py-3 px-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const idx = activeQuestions.findIndex((item) => item.id === q.id);
                                    if (idx !== -1) {
                                      setCurrentQuestionIndex(idx);
                                      setActiveTab('arena');
                                      resetQuestionState();
                                    } else {
                                      toggleQuestionActive(q.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                  Δοκιμή
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditQuestion(q)}
                                  className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors border border-stone-200"
                                  title="Επεξεργασία Ερώτησης"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors border border-stone-200"
                                  title="Διαγραφή Ερώτησης"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAY ARENA */}
        {activeTab === 'arena' && (
          <div className="space-y-6">
            {/* Quick Join QR Banner */}
            <div className="p-4 bg-linear-to-r from-emerald-600/10 via-teal-600/15 to-emerald-600/10 rounded-3xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  📱
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>Σύνδεση Μαθητών & Ομάδων μέσω QR Κωδικού</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-stone-600">
                    Προβάλετε τον κωδικό QR στον προβολέα της αίθουσας για να συνδεθούν οι ομάδες κατευθείαν από τις συσκευές τους.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsJoinQROpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <QrCode className="w-4 h-4" />
                Άνοιγμα QR Σύνδεσης
              </button>
            </div>

            {/* Quest Completion Callout for Poster Creation */}
            {answeredCount > 0 && (
              <div className="p-4 bg-linear-to-r from-amber-500/10 via-amber-500/20 to-emerald-500/10 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Απαντήσατε σε {answeredCount} αποστολές! (Τρέχον Σκορ: {score} πόντοι)
                    </h3>
                    <p className="text-xs text-stone-600">
                      Είστε έτοιμοι να συνοψίσετε τα ευρήματα της ομάδας σας σε μια εντυπωσιακή επιστημονική αφίσα;
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCreatePoster(selectedTeamFilter !== 'all' ? selectedTeamFilter : undefined)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Δημιουργία Αφίσας Ομάδας
                </button>
              </div>
            )}

            {/* Filter & Selector Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Φίλτρο Ομάδας:
                </span>
                <select
                  value={selectedTeamFilter}
                  onChange={(e) => {
                    setSelectedTeamFilter(e.target.value);
                    setCurrentQuestionIndex(0);
                    resetQuestionState();
                  }}
                  className="text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Όλες οι Ομάδες (All 4 Teams)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.avatar} Ομάδα {t.number}: {t.title}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => {
                    setSelectedTypeFilter(e.target.value);
                    setCurrentQuestionIndex(0);
                    resetQuestionState();
                  }}
                  className="text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Όλοι οι Τύποι Ερωτήσεων</option>
                  <option value="multiple_choice">Πολλαπλή Επιλογή (Μονή)</option>
                  <option value="multiple_choice_multi">Πολλαπλή Επιλογή (Πολλαπλή)</option>
                  <option value="true_false">Σωστό / Λάθος</option>
                  <option value="text_matching">Αντιστοίχιση Κειμένου</option>
                  <option value="image_matching">Αναγνώριση Εικόνας / Σιλουέτας</option>
                  <option value="qr_scan">Σάρωση Σταθμού QR</option>
                  <option value="photo_upload">Αποστολή Φωτογραφίας</option>
                  <option value="video_upload">Αποστολή Βίντεο</option>
                </select>
              </div>

              {/* Arena Navigation Counter */}
              <div className="flex items-center justify-between md:justify-end gap-3">
                <span className="text-xs text-stone-500">
                  {t.questionOf
                    .replace('{current}', String(activeQuestions.length > 0 ? currentQuestionIndex + 1 : 0))
                    .replace('{total}', String(activeQuestions.length))}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeQuestions.length <= 1}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                  >
                    {t.previous}
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={activeQuestions.length <= 1}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    {t.next} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question Interactive Card */}
            {currentQ ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
                {/* Header Strip */}
                <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderTypeBadge(currentQ.type)}
                    {currentQ.missionTitle && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-700" />
                        <span>{currentQ.missionTitle}</span>
                      </span>
                    )}
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      +{currentQ.points} Πόντοι
                    </span>
                    {currentQ.mediaUrl && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        {currentQ.mediaType === 'video' ? <Video className="w-3 h-3 text-blue-600" /> : <Camera className="w-3 h-3 text-blue-600" />}
                        {currentQ.mediaType === 'video' ? 'Βίντεο' : 'Φωτογραφία'}
                      </span>
                    )}
                    {currentQ.locationFocus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {currentQ.locationFocus === 'Cyprus' ? 'Κύπρος' : currentQ.locationFocus === 'Greece' ? 'Ελλάδα' : 'Κύπρος & Ελλάδα'}
                      </span>
                    )}

                    {/* Admin quick edit for this question */}
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => handleOpenEditQuestion(currentQ)}
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-950 flex items-center gap-1 transition-colors ml-1"
                      >
                        <Edit3 className="w-3 h-3" /> Επεξεργασία
                      </button>
                    )}
                  </div>

                  {/* Assigned Teams Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-400">Ομάδα:</span>
                    {currentQ.assignedTeamIds.map((teamId) => {
                      const t = teams.find((item) => item.id === teamId);
                      return t ? (
                        <span
                          key={t.id}
                          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${t.badgeColor}`}
                          title={t.slogan}
                        >
                          {t.avatar} {t.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    {currentQ.missionTitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-black uppercase tracking-wider mb-2.5">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span>Τίτλος Αποστολής: {currentQ.missionTitle}</span>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                      {currentQ.title}
                    </h2>
                    {currentQ.instruction && (
                      <p className="mt-2 text-sm text-stone-600 italic">
                        💡 {currentQ.instruction}
                      </p>
                    )}
                  </div>

                  {/* Attached Media Presentation (Photo or Video) */}
                  {currentQ.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 shadow-md">
                      {currentQ.mediaType === 'video' ? (
                        isYouTubeUrl(currentQ.mediaUrl) ? (
                          <div className="aspect-video w-full max-h-96">
                            <iframe
                              src={getYouTubeEmbedUrl(currentQ.mediaUrl)}
                              title="Εκπαιδευτικό Βίντεο Αποστολής"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <video
                            src={currentQ.mediaUrl}
                            controls
                            className="w-full max-h-96 mx-auto bg-black"
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center p-3 bg-stone-900/60">
                          <img
                            src={currentQ.mediaUrl}
                            alt={currentQ.title}
                            className="max-h-80 w-auto object-contain rounded-xl shadow-xs"
                          />
                          <p className="text-[11px] text-stone-300 mt-2 italic text-center flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Επισυναπτόμενο φωτογραφικό υλικό παρατήρησης πεδίου</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE INPUTS BY QUESTION TYPE */}

                  {/* 1. Multiple Choice Single */}
                  {currentQ.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 gap-3">
                      {(currentQ as MultipleChoiceQuestion).options.map((option) => {
                        const isSelected = userSingleChoice === option.id;
                        const isCorrect = (currentQ as MultipleChoiceQuestion).correctAnswer === option.id;

                        let style =
                          'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800';
                        if (isSelected && !isAnswerSubmitted) {
                          style = 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400';
                        }
                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
                          } else if (isSelected && !isCorrect) {
                            style = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400';
                          } else {
                            style = 'border-stone-200 bg-stone-50 opacity-60 text-stone-600';
                          }
                        }

                        return (
                          <button
                            key={option.id}
                            disabled={isAnswerSubmitted}
                            onClick={() => setUserSingleChoice(option.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${style}`}
                          >
                            <span className="text-sm sm:text-base leading-relaxed">{option.text}</span>
                            <div className="mt-0.5 shrink-0">
                              {isAnswerSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              )}
                              {isAnswerSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-rose-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Multiple Choice Multi */}
                  {currentQ.type === 'multiple_choice_multi' && (
                    <div className="space-y-3">
                      <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                        Επιλέξτε όλες τις σωστές επιλογές:
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {(currentQ as MultipleChoiceMultiQuestion).options.map((option) => {
                          const isSelected = userMultiChoice.includes(option.id);
                          const isCorrect = (currentQ as MultipleChoiceMultiQuestion).correctAnswers.includes(option.id);

                          let style = 'border-stone-200 bg-stone-50 hover:bg-stone-100';
                          if (isSelected && !isAnswerSubmitted) {
                            style = 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400';
                          }
                          if (isAnswerSubmitted) {
                            if (isCorrect) {
                              style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
                            } else if (isSelected && !isCorrect) {
                              style = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400';
                            } else {
                              style = 'border-stone-200 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={option.id}
                              disabled={isAnswerSubmitted}
                              onClick={() => {
                                setUserMultiChoice((prev) =>
                                  prev.includes(option.id)
                                    ? prev.filter((item) => item !== option.id)
                                    : [...prev, option.id]
                                );
                              }}
                              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${style}`}
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={isSelected}
                                className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm sm:text-base leading-relaxed">{option.text}</span>
                              </div>
                              {isAnswerSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. True / False */}
                  {currentQ.type === 'true_false' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { val: true, label: 'ΣΩΣΤΟ (True)', color: 'emerald' },
                        { val: false, label: 'ΛΑΘΟΣ (False)', color: 'rose' },
                      ].map((item) => {
                        const isSelected = userTrueFalse === item.val;
                        const isCorrect = (currentQ as TrueFalseQuestion).correctAnswer === item.val;

                        let style = 'border-stone-200 bg-stone-50 hover:bg-stone-100';
                        if (isSelected && !isAnswerSubmitted) {
                          style = 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400';
                        }
                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 font-bold';
                          } else if (isSelected && !isCorrect) {
                            style = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400';
                          } else {
                            style = 'border-stone-200 opacity-50';
                          }
                        }

                        return (
                          <button
                            key={String(item.val)}
                            disabled={isAnswerSubmitted}
                            onClick={() => setUserTrueFalse(item.val)}
                            className={`p-6 rounded-2xl border text-center font-bold text-lg transition-all flex flex-col items-center justify-center gap-2 ${style}`}
                          >
                            <span>{item.label}</span>
                            {isAnswerSubmitted && isCorrect && (
                              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                                ✓ Ορθή απάντηση
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. Text Matching */}
                  {currentQ.type === 'text_matching' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                        📌 <strong>Οδηγία:</strong> Επιλέξτε πρώτα ένα στοιχείο από την αριστερή στήλη και έπειτα κάντε κλικ στο αντίστοιχο ταίρι του στη δεξιά στήλη.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            {(currentQ as TextMatchingQuestion).leftHeader || 'Στήλη Α'}
                          </h4>
                          {(currentQ as TextMatchingQuestion).pairs.map((p) => {
                            const isMatched = Boolean(userMatches[p.id]);
                            const isCurrentSelected = userSelectedLeft === p.id;
                            return (
                              <button
                                key={p.id}
                                disabled={isAnswerSubmitted}
                                onClick={() => setUserSelectedLeft(p.id)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                                  isCurrentSelected
                                    ? 'border-amber-500 bg-amber-100 text-amber-950 ring-2 ring-amber-400 font-semibold'
                                    : isMatched
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                                    : 'border-stone-200 bg-white hover:bg-stone-50'
                                }`}
                              >
                                <div className="font-medium">{p.left}</div>
                                {isMatched && (
                                  <div className="mt-1 text-xs text-emerald-700 truncate">
                                    ↳ {userMatches[p.id]}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            {(currentQ as TextMatchingQuestion).rightHeader || 'Στήλη Β'}
                          </h4>
                          {(currentQ as TextMatchingQuestion).pairs.map((p) => {
                            const isAssigned = Object.values(userMatches).includes(p.right);
                            return (
                              <button
                                key={p.id}
                                disabled={isAnswerSubmitted || !userSelectedLeft}
                                onClick={() => {
                                  if (userSelectedLeft) {
                                    setUserMatches((prev) => ({
                                      ...prev,
                                      [userSelectedLeft]: p.right,
                                    }));
                                    setUserSelectedLeft(null);
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                                  isAssigned
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                                    : userSelectedLeft
                                    ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                                    : 'border-stone-200 bg-white opacity-80'
                                }`}
                              >
                                {p.right}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Image / Visual Matching */}
                  {currentQ.type === 'image_matching' && (
                    <div className="space-y-4">
                      {(currentQ as ImageMatchingQuestion).promptDescription && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-sm">
                          <strong>Οπτική Περιγραφή / Στοιχείο Αναγνώρισης:</strong>{' '}
                          {(currentQ as ImageMatchingQuestion).promptDescription}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(currentQ as ImageMatchingQuestion).options.map((opt) => {
                          const isSelected = userImageChoice === opt.id;
                          const isCorrect = (currentQ as ImageMatchingQuestion).correctAnswer === opt.id;

                          let style = 'border-stone-200 bg-stone-50 hover:bg-stone-100';
                          if (isSelected && !isAnswerSubmitted) {
                            style = 'border-purple-500 bg-purple-50 ring-2 ring-purple-400';
                          }
                          if (isAnswerSubmitted) {
                            if (isCorrect) {
                              style = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400';
                            } else if (isSelected && !isCorrect) {
                              style = 'border-rose-400 bg-rose-50 ring-2 ring-rose-400';
                            } else {
                              style = 'opacity-60 border-stone-200';
                            }
                          }

                          return (
                            <button
                              key={opt.id}
                              disabled={isAnswerSubmitted}
                              onClick={() => setUserImageChoice(opt.id)}
                              className={`p-4 rounded-2xl border text-left transition-all ${style}`}
                            >
                              <div className="font-semibold text-sm sm:text-base text-stone-900">{opt.label}</div>
                              {opt.description && (
                                <p className="mt-1 text-xs text-stone-600">{opt.description}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 6. QR Code Scan Station */}
                  {currentQ.type === 'qr_scan' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center text-rose-700 shrink-0">
                          <QrCode className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-base">
                            {(currentQ as QRScanQuestion).stationName}
                          </h4>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {(currentQ as QRScanQuestion).stationLocation}
                          </p>
                          <p className="mt-2 text-xs bg-white p-2.5 rounded-lg border border-stone-200 text-stone-700">
                            🔍 <strong>Ένδειξη Πεδίου:</strong> {(currentQ as QRScanQuestion).fieldClue}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Κωδικός Σάρωσης QR ή Προσομοίωση Εισόδου Token:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            disabled={isAnswerSubmitted}
                            value={userQrInput}
                            onChange={(e) => setUserQrInput(e.target.value)}
                            placeholder="π.χ. VA-STATION-EPISKOPI-CLIFFS-2026"
                            className="flex-1 text-sm bg-white border border-stone-300 rounded-xl px-4 py-2 font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
                          />
                          <button
                            type="button"
                            onClick={() => setUserQrInput((currentQ as QRScanQuestion).qrPayload)}
                            className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
                          >
                            Αυτόματη Σάρωση QR
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Αναμενόμενο αναγνωριστικό πεδίου: <code className="text-stone-600 font-mono">{(currentQ as QRScanQuestion).qrPayload}</code>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 7. Photo Upload Challenge */}
                  {currentQ.type === 'photo_upload' && (
                    <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 border border-teal-300 rounded-2xl flex items-center justify-center text-teal-700 shrink-0">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-teal-950 text-base">
                            Πρόκληση Φωτογράφισης Πεδίου
                          </h4>
                          <p className="text-xs text-teal-800">
                            {(currentQ as PhotoUploadQuestion).taskPrompt}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-teal-100 space-y-2">
                        <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Κριτήρια Επαλήθευσης:
                        </h5>
                        <ul className="text-xs text-stone-600 space-y-1">
                          {(currentQ as PhotoUploadQuestion).verificationCriteria?.map((c, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs">
                            <Camera className="w-4 h-4" />
                            {userUploadedFile ? 'Αλλαγή Φωτογραφίας' : 'Επιλογή/Λήψη Φωτογραφίας'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onload = (uploadEv) => {
                                    if (uploadEv.target?.result) {
                                      setUserUploadedDataUrl(uploadEv.target.result as string);
                                      setUserUploadedFile(file.name);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {userUploadedFile && (
                            <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                              ✓ Επιλέχθηκε: {userUploadedFile}
                            </span>
                          )}
                        </div>

                        {/* Live Photo Preview */}
                        {userUploadedDataUrl && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-teal-200">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-stone-900 border border-teal-300 shrink-0">
                              <img src={userUploadedDataUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-teal-950 block truncate">
                                Αυθεντικό Τεκμήριο Ομάδας
                              </span>
                              <span className="text-[11px] text-teal-700 block truncate">
                                Θα συνδεθεί αυτόματα με την αφίσα της ομάδας κατά την υποβολή
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 8. Video Upload Challenge */}
                  {currentQ.type === 'video_upload' && (
                    <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 border border-orange-300 rounded-2xl flex items-center justify-center text-orange-700 shrink-0">
                          <Video className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-orange-950 text-base">
                              Πρόκληση Καταγραφής Βίντεο
                            </h4>
                            <span className="text-xs bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-semibold">
                              Έως {(currentQ as VideoUploadQuestion).durationSecondsMax}"
                            </span>
                          </div>
                          <p className="text-xs text-orange-900">
                            {(currentQ as VideoUploadQuestion).taskPrompt}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-orange-100 space-y-2">
                        <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Κριτήρια Αξιολόγησης Βίντεο:
                        </h5>
                        <ul className="text-xs text-stone-600 space-y-1">
                          {(currentQ as VideoUploadQuestion).verificationCriteria?.map((c, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition-colors">
                          <Video className="w-4 h-4" />
                          {userUploadedFile ? 'Αλλαγή Βίντεο' : 'Επιλογή Αρχείου Βίντεο'}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setUserUploadedFile(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                        {userUploadedFile && (
                          <span className="text-xs font-semibold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">
                            ✓ Βίντεο έτοιμο: {userUploadedFile}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission & Action Bar */}
                  <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                    <button
                      disabled={isAnswerSubmitted}
                      onClick={handleSubmitAnswer}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      {t.submitAnswer}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetQuestionState}
                        className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {language === 'el' ? 'Επαναφορά' : 'Reset'}
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                      >
                        {t.nextMissionBtn} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scientific Explanation Card (Visible upon submission) */}
                  {isAnswerSubmitted && (
                    <div
                      className={`p-6 rounded-2xl border transition-all ${
                        isAnswerCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-base mb-2">
                        {isAnswerCorrect ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-900">
                              {t.correctAnswerTitle} ({t.correctAnswerSubtitle.replace('{points}', String(currentQ.points))})
                            </span>
                          </>
                        ) : (
                          <>
                            <Info className="w-5 h-5 text-stone-700" />
                            <span>{t.incorrectAnswerTitle} {t.explanationHeader}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-stone-800">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                <p className="text-stone-500">
                  Δεν βρέθηκαν ενεργές ερωτήσεις με τα επιλεγμένα κριτήρια.
                </p>
                <button
                  onClick={() => {
                    setSelectedTeamFilter('all');
                    setSelectedTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Καθαρισμός Φίλτρων
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEAM POSTERS & INFOGRAPHICS */}
        {activeTab === 'posters' && (
          <div className="space-y-6">
            {/* Header with Title and Global Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {language === 'en'
                      ? 'Final Scientific Posters & Team Infographics'
                      : 'Τελικές Επιστημονικές Αφίσες & Infographics Ομάδων'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {language === 'en'
                    ? '«On the Brink of Extinction - Vultures in Cyprus». Each poster dynamically combines authentic field photo evidence, team reflections («Something that impressed us:»), and verified scientific data.'
                    : '«Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο». Κάθε αφίσα συνδυάζει δυναμικά το φωτογραφικό τεκμήριο, τον αναστοχασμό της ομάδας («Κάτι που μας εντυπωσίασε») και τα επίσημα επιστημονικά δεδομένα.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenCreatePoster(selectedPosterTeamId)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  {language === 'en' ? 'Create / Edit Poster' : 'Δημιουργία / Επεξεργασία Αφίσας'}
                </button>

                <button
                  onClick={() => {
                    const idx = Object.keys(posters).indexOf(selectedPosterTeamId);
                    handleOpenPresentation(idx >= 0 ? idx : 0);
                  }}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-amber-400" />
                  {language === 'en' ? 'Classroom Presentation' : 'Παρουσίαση στην Τάξη'}
                </button>

                <button
                  onClick={() => setIsAdminReportOpen(true)}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                  {language === 'en' ? 'Export Reports' : 'Εξαγωγή Αναφορών'}
                </button>
              </div>
            </div>

            {/* Team Poster Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {teams.map((team) => {
                const isSelected = selectedPosterTeamId === team.id;
                const p = posters[team.id];

                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedPosterTeamId(team.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-white ring-2 ring-amber-400 shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${team.color}15`, color: team.color }}
                    >
                      {team.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider"
                          style={{ color: team.color }}
                        >
                          {language === 'en' ? `TEAM ${team.number}` : `ΟΜΑΔΑ ${team.number}`}
                        </span>
                        {p && (
                          <span className="text-[10px] font-bold text-stone-500">
                            {p.score} pts
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {language === 'en' ? (team.titleEn || team.title) : team.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Team Poster Display */}
            {currentPosterData && (
              <TeamPoster
                poster={currentPosterData}
                onEdit={() => handleOpenCreatePoster(currentPosterData.teamId)}
                onPresent={() => {
                  const idx = Object.keys(posters).indexOf(currentPosterData.teamId);
                  handleOpenPresentation(idx >= 0 ? idx : 0);
                }}
                language={language}
                allSubmissions={teamPhotoSubmissions}
                allQuestions={questions}
              />
            )}
          </div>
        )}

        {/* TAB 4: TEAMS HUB */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-stone-900">
                  Οι 4 Επίσημες Ομάδες της Αρένας
                </h2>
                <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                  «Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο». Επιλέξτε ομάδα για είσοδο στην αρένα, δημιουργήστε αφίσα ή επεξεργαστείτε τα στοιχεία της σαν διαχειριστής!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPresentation(0)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  Παρουσίαση Αφισών
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => {
                const teamQuestions = questions.filter((q) => q.assignedTeamIds.includes(team.id));
                const activeTeamQuestions = teamQuestions.filter((q) => q.isActive);
                const teamPoints = activeTeamQuestions.reduce((acc, q) => acc + q.points, 0);

                return (
                  <div
                    key={team.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Color Accent Bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-2.5"
                      style={{ backgroundColor: team.color }}
                    />

                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-stone-200"
                            style={{ backgroundColor: `${team.color}15` }}
                          >
                            {team.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: team.color }}
                              >
                                Ομάδα {team.number}
                              </span>
                              <span className="text-xs text-stone-400 font-medium">
                                {team.titleEn}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                              {team.title}
                            </h3>
                          </div>
                        </div>

                        {/* Theme Category Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                            {team.themeCategory}
                          </span>
                          {/* Admin edit button for team */}
                          {isAdminLoggedIn && (
                            <button
                              onClick={() => handleOpenEditTeam(team)}
                              className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300"
                            >
                              <Edit3 className="w-3 h-3" /> Επεξεργασία
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Slogan */}
                      <blockquote
                        className="text-xs sm:text-sm font-semibold italic p-3 rounded-xl border"
                        style={{
                          backgroundColor: `${team.color}10`,
                          borderColor: `${team.color}30`,
                          color: team.color,
                        }}
                      >
                        {team.slogan}
                      </blockquote>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {team.description}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Ερωτήσεις
                          </span>
                          <span className="font-bold text-stone-900">
                            {activeTeamQuestions.length}/{teamQuestions.length}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-stone-200" />
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Πόντοι
                          </span>
                          <span className="font-bold text-stone-900">
                            {teamPoints} pts
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Create Poster Button */}
                        <button
                          onClick={() => handleOpenCreatePoster(team.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1"
                          style={{
                            borderColor: `${team.color}50`,
                            backgroundColor: `${team.color}10`,
                            color: team.color,
                          }}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          Αφίσα Ομάδας
                        </button>

                        <button
                          onClick={() => {
                            setSelectedTeamFilter(team.id);
                            setActiveTab('arena');
                            setCurrentQuestionIndex(0);
                            resetQuestionState();
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: team.color }}
                        >
                          Αρένα <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATIONAL GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">
                Εκπαιδευτικός Οδηγός Πεδίου: Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο
              </h2>
              <p className="mt-1 text-sm text-stone-600 max-w-3xl leading-relaxed">
                Επιστημονική σύνοψη των 4 ειδών γυπών και των μέτρων διατήρησης στο πλαίσιο του έργου «LIFE with Vultures» στην Κύπρο και των δράσεων προστασίας στην Ελλάδα (Δαδιά, Κρήτη, Μετέωρα).
              </p>
            </div>

            {/* The 4 Vulture Species Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Gyps fulvus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🦅</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">Όρνιο (Gyps fulvus)</h3>
                      <p className="text-xs text-amber-700 font-medium">Griffon Vulture • Το μοναδικό είδος που αναπαράγεται στην Κύπρο</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                    2.40 - 2.80μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Κοινωνικός γύπας με ξανθοκάστανο πτέρωμα και λευκό κολάρο. Στην Κύπρο φωλιάζει στους απόκρημνους λευκούς γκρεμούς της Επισκοπής και στις κοιλάδες Διαρίζου και Ξερού. Στην Ελλάδα, η Κρήτη φιλοξενεί τον μεγαλύτερο νησιωτικό πληθυσμό με πάνω από 1.000 πουλιά.
                </p>
              </div>

              {/* 2. Aegypius monachus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪶</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">Μαυρόγυπας (Aegypius monachus)</h3>
                      <p className="text-xs text-stone-700 font-medium">Cinereous / Black Vulture • Ο βαρύτερος γύπας της Ευρώπης</p>
                    </div>
                  </div>
                  <span className="text-xs bg-stone-200 text-stone-900 px-2.5 py-1 rounded-full font-bold">
                    2.50 - 2.95μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Επιβλητικός, σκουρόχρωμος γύπας με τεράστιο ράμφος. Στην Ελλάδα επιβιώνει στο Εθνικό Πάρκο Δάσους Δαδιάς-Λευκίμης-Σουφλίου στον Έβρο, όπου χτίζει γιγάντιες φωλιές στις κορυφές των ώριμων μαύρων πεύκων.
                </p>
              </div>

              {/* 3. Gypaetus barbatus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🦴</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">Γυπαετός / Κοκκαλάς (Gypaetus barbatus)</h3>
                      <p className="text-xs text-orange-700 font-medium">Bearded Vulture / Lammergeier • Ο οστεοφάγος των βουνών</p>
                    </div>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-900 px-2.5 py-1 rounded-full font-bold">
                    2.60 - 2.85μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Τρέφεται κατά 85-90% με οστά. Σπάει τα μεγάλα κόκκαλα ρίχνοντάς τα από ύψος 50-100μ στις «οστεοθήκες». Στην Ελλάδα επιβιώνει αποκλειστικά στα ψηλά φαράγγια και ορθοπλαγιές της Κρήτης (περίπου 6-8 αναπαραγωγικά ζευγάρια).
                </p>
              </div>

              {/* 4. Neophron percnopterus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌍</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">Ασπροπάρης (Neophron percnopterus)</h3>
                      <p className="text-xs text-emerald-700 font-medium">Egyptian Vulture • Ο μικρότερος και μεταναστευτικός γύπας</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-bold">
                    1.55 - 1.70μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Αναγνωρίζεται από το κίτρινο πρόσωπο και το λευκό-μαύρο πτέρωμα. Είναι το μόνο είδος που μεταναστεύει το φθινόπωρο νότια της Σαχάρας και χρησιμοποιεί πέτρες ως εργαλεία. Στην Ελλάδα βρίσκεται σε κρίσιμο κίνδυνο εξαφάνισης (Μετέωρα, Θράκη).
                </p>
              </div>
            </div>

            {/* Cyprus LIFE with Vultures Highlights */}
            <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-amber-400">
                    Έργο «LIFE with Vultures» στην Κύπρο (LIFE18 NAT/CY/001018)
                  </h4>
                  <p className="text-xs text-stone-400">
                    BirdLife Cyprus • Υπηρεσία Θήρας & Πανίδας • VCF • Terra Cypria
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">🐕 Σκύλοι Ανίχνευσης</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Ο Echo και ο Patrouch (με τους χειριστές της Υπηρεσίας Θήρας) περιπολούν ακούραστα στην ύπαιθρο για να εντοπίσουν και να απομακρύνουν δηλητηριασμένα δολώματα πριν τα βρουν τα πουλιά.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">🛰️ Δορυφορικοί Πομποί</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Κάθε απελευθερωμένο Όρνιο φέρει ηλιακό πομπό GPS/GSM. Αν το πουλί παραμείνει ακίνητο, αποστέλλεται αυτόματο σήμα συναγερμού (mortality alert) για άμεση επέμβαση στο πεδίο.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">🇪🇸 Ενίσχυση από Ισπανία</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Δεκάδες νεαρά Όρνια από την Ανδαλουσία και την Εξτρεμαδούρα μεταφέρθηκαν στην Κύπρο, εγκλιματίστηκαν στον κλωβό προσαρμογής και απελευθερώθηκαν για να σωθεί ο τοπικός πληθυσμός.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο •{' '}
            <span className="text-amber-400 font-mono">ekpaideytiki-anafora-gypes-2026-10-29_1818ef45.json</span>
          </p>
          <div className="flex items-center gap-3 text-stone-400">
            <button
              onClick={() => setIsJoinQROpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-bold text-emerald-400"
            >
              <QrCode className="w-3.5 h-3.5" /> QR Σύνδεσης
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenCreatePoster()}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Palette className="w-3.5 h-3.5" /> Δημιουργία Αφίσας
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenPresentation(0)}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Tv className="w-3.5 h-3.5" /> Παρουσίαση
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveTab('pool');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              {isAdminLoggedIn ? 'Διαχειριστής (Ενεργός)' : 'Είσοδος Διαχειριστή'}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Join QR Code Modal */}
      <JoinQRModal
        isOpen={isJoinQROpen}
        onClose={() => setIsJoinQROpen(false)}
        roomPin="GYPES-2026"
      />

      {/* 2. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
        }}
      />

      {/* 3. Create / Edit Poster Modal */}
      <CreatePosterModal
        isOpen={isCreatePosterOpen}
        onClose={() => setIsCreatePosterOpen(false)}
        initialTeamId={modalInitialTeamId}
        existingPoster={dynamicPostersMap[modalInitialTeamId] || posters[modalInitialTeamId]}
        onSavePoster={handleSavePoster}
        teamPhotoSubmissions={teamPhotoSubmissions}
        allQuestions={questions}
      />

      {/* 4. Teacher Presentation Mode Modal */}
      <TeacherPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        posters={dynamicPostersList}
        initialIndex={presentationIndex}
        language={language}
        allSubmissions={teamPhotoSubmissions}
        allQuestions={questions}
      />

      {/* 5. Admin Report Modal (PDF / CSV / JSON) */}
      <AdminReportModal
        isOpen={isAdminReportOpen}
        onClose={() => setIsAdminReportOpen(false)}
        posters={dynamicPostersMap}
      />

      {/* 6. Admin Edit Question Modal */}
      <EditQuestionModal
        isOpen={isEditQuestionOpen}
        onClose={() => setIsEditQuestionOpen(false)}
        questionToEdit={questionToEdit}
        onSaveQuestion={handleSaveQuestion}
        language={language}
      />

      {/* 7. Admin Edit Team Modal */}
      <EditTeamModal
        isOpen={isEditTeamOpen}
        onClose={() => setIsEditTeamOpen(false)}
        team={teamToEdit}
        onSaveTeam={handleSaveTeam}
      />
    </div>
  );
}
