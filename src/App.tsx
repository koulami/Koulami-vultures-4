/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { TeamPosterData, TeamPhotoSubmission, SavedTeamReflection } from './types/posters';
import { initialDefaultPosters } from './data/teamScientificFacts';
import { selectPosterFactsForTeam } from './utils/posterContentSelector';

export function isReflectionQuestion(q?: Question | null): boolean {
  if (!q) return false;
  if (['gypes-q-16', 'gypes-q-35', 'gypes-q-54', 'gypes-q-74'].includes(q.id)) return true;
  const title = (q.title || '').toLowerCase();
  const mission = (q.missionTitle || '').toLowerCase();
  const prompt = ((q as any).taskPrompt || '').toLowerCase();
  return (
    title.includes('αναστοχασμός') ||
    title.includes('reflection') ||
    title.includes('wow moment') ||
    mission.includes('αναστοχασμός') ||
    mission.includes('reflection') ||
    mission.includes('wow moment') ||
    prompt.includes('αναστοχασμός') ||
    prompt.includes('reflection') ||
    prompt.includes('wow moment')
  );
}
import {
  loadAllPhotoSubmissions,
  savePhotoSubmission,
  getAuthenticPhotosForTeam,
  compressAndResizeImage,
} from './utils/teamPhotoManager';
import { TeamPoster } from './components/TeamPoster';
import { CreatePosterModal } from './components/CreatePosterModal';
import { TeacherPresentationModal } from './components/TeacherPresentationModal';
import { AdminReportModal } from './components/AdminReportModal';
import { JoinQRModal } from './components/JoinQRModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditQuestionModal } from './components/EditQuestionModal';
import { EditTeamModal } from './components/EditTeamModal';
import { PrintableQuestionRegisterModal } from './components/PrintableQuestionRegisterModal';
import { StudentEntryFlow } from './components/StudentEntryFlow';
import { LiveGameTimer } from './components/LiveGameTimer';
import { GameTimeExpiredModal } from './components/GameTimeExpiredModal';
import { TeamQuestionSection } from './components/TeamQuestionSection';
import { QRCameraScanner } from './components/QRCameraScanner';
import { resolveQuestionMedia, resolveQuestionMediaUrl } from './utils/qrStationMediaStorage';
import { exportFullJSONBackup, exportQuestionsCSV } from './utils/questionExportManager';
import {
  fetchServerPosters,
  syncPosterToServer,
  syncAllLocalPostersToServer,
  clearServerGameData,
} from './utils/posterSyncManager';
import { ClearGameDataModal } from './components/ClearGameDataModal';
import { Language, translations } from './i18n/translations';
import { getLocalizedQuestion } from './i18n/questionTranslations';
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
  ImageIcon,
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
  Clock,
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
  Download,
  Database,
  X,
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

  // Helper to ensure poster.members is always a string array
  const normalizePosterObject = (poster: any) => {
    if (!poster || typeof poster !== 'object') return poster;
    if (typeof poster.members === 'string') {
      return {
        ...poster,
        members: poster.members
          .split(/[,;&]/)
          .map((m: string) => m.trim())
          .filter((m: string) => m.length > 0),
      };
    }
    return poster;
  };

  const normalizePostersMap = (postersMap: Record<string, any>) => {
    if (!postersMap || typeof postersMap !== 'object') return postersMap;
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(postersMap)) {
      res[k] = normalizePosterObject(v);
    }
    return res;
  };

  // State for Posters
  const [posters, setPosters] = useState<Record<string, TeamPosterData>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_posters_custom_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return normalizePostersMap(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return initialDefaultPosters;
  });

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<'arena' | 'teams' | 'posters' | 'pool' | 'guide'>('arena');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const locked = localStorage.getItem('vulture_student_team_locked') === 'true';
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      if (locked && teamId) return teamId;
    }
    return 'all';
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPosterTeamId, setSelectedPosterTeamId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      if (teamId) return teamId;
    }
    return 'team-characteristics';
  });

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
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isClearGameDataOpen, setIsClearGameDataOpen] = useState<boolean>(false);

  // Edit Question & Team Modals
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState<boolean>(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState<boolean>(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  // Expanded team question lists in Teams Hub view
  const [expandedTeamsInHub, setExpandedTeamsInHub] = useState<Record<string, boolean>>({});
  const toggleTeamHubQuestions = (teamId: string) => {
    setExpandedTeamsInHub((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('vulture_questions_custom_v2', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('vulture_teams_custom_v2', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(posters));
    } catch (e) {
      console.warn('LocalStorage quota reached when saving posters state, keeping in-memory:', e);
    }
  }, [posters]);

  useEffect(() => {
    localStorage.setItem('vulture_admin_auth', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Cross-device poster sync: fetch latest server-stored posters and submissions on mount
  useEffect(() => {
    let isMounted = true;
    fetchServerPosters().then((serverData) => {
      if (!isMounted || !serverData) return;
      const { posters: sPosters, submissions: sSubs } = serverData;
      if (sPosters && Object.keys(sPosters).length > 0) {
        setPosters((prev) => {
          const next = { ...prev, ...normalizePostersMap(sPosters) };
          try {
            localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
      if (Array.isArray(sSubs) && sSubs.length > 0) {
        setTeamPhotoSubmissions((prev) => {
          const merged = [...prev];
          for (const sub of sSubs) {
            const idx = merged.findIndex(
              (m) => m.id === sub.id || (m.teamId === sub.teamId && m.questionId === sub.questionId)
            );
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...sub };
            } else {
              merged.push(sub);
            }
          }
          try {
            localStorage.setItem('vulture_team_photo_submissions_v2', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Student Session & Team Lock State
  const [isStudentConnected, setIsStudentConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const pinParam =
        new URLSearchParams(window.location.search).get('pin') ||
        new URLSearchParams(window.location.search).get('code');
      if (
        pinParam &&
        (pinParam.toUpperCase() === 'GYPES-2026' ||
          pinParam.toUpperCase() === '2026' ||
          pinParam.toUpperCase() === 'GYPES' ||
          pinParam.toUpperCase() === 'VULTURE')
      ) {
        localStorage.setItem('vulture_student_connected', 'true');
        return true;
      }
      return localStorage.getItem('vulture_student_connected') === 'true';
    }
    return false;
  });

  const [studentSelectedTeamId, setStudentSelectedTeamId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vulture_student_locked_team_id') || null;
    }
    return null;
  });

  const [isStudentTeamLocked, setIsStudentTeamLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const locked = localStorage.getItem('vulture_student_team_locked') === 'true';
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      return Boolean(locked && teamId);
    }
    return false;
  });

  // Track whether a returning student with an existing locked team has made their choice (Continue or Start Over)
  const [hasConfirmedReturningStudent, setHasConfirmedReturningStudent] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isLocked =
        localStorage.getItem('vulture_student_team_locked') === 'true' &&
        Boolean(localStorage.getItem('vulture_student_locked_team_id'));
      // If student has an existing locked team on this device, ALWAYS require explicit choice on entry/reload
      if (isLocked) {
        return false;
      }
    }
    return true;
  });

  // Game active state (authoritative across all student and teacher screens)
  const [isGameStarted, setIsGameStarted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedEnds = localStorage.getItem('vulture_game_ends_at_ms');
      if (savedEnds) {
        const parsedEnds = parseInt(savedEnds, 10);
        if (!isNaN(parsedEnds) && Date.now() >= parsedEnds) {
          // Stale expired state from prior session - clear it
          localStorage.setItem('vulture_game_started_v2', 'false');
          localStorage.removeItem('vulture_game_ends_at_ms');
          return false;
        }
      }
      return localStorage.getItem('vulture_game_started_v2') === 'true';
    }
    return false;
  });

  const [gameStartedAtMs, setGameStartedAtMs] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_authoritative_start_time');
      return saved ? parseInt(saved, 10) : null;
    }
    return null;
  });

  // Administrator configurable game duration in minutes (default: 15 minutes)
  const [gameDurationMinutes, setGameDurationMinutes] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_game_duration_minutes');
      if (saved) {
        const val = parseInt(saved, 10);
        if (val > 0) return val;
      }
    }
    return 15;
  });

  // Synchronized end timestamp across all teams (starts together, ends together)
  const [gameEndsAtMs, setGameEndsAtMs] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_game_ends_at_ms');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > Date.now()) {
          return parsed;
        } else {
          localStorage.removeItem('vulture_game_ends_at_ms');
          return null;
        }
      }
    }
    return null;
  });

  // Game expiration and Game Over modal state
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);
  const [showTimeExpiredModal, setShowTimeExpiredModal] = useState<boolean>(false);
  // User or admin dismissed the expired modal to view/review screens without immediate re-trigger
  const [hasDismissedExpiredModal, setHasDismissedExpiredModal] = useState<boolean>(false);
  const hasDismissedExpiredModalRef = useRef<boolean>(false);

  useEffect(() => {
    hasDismissedExpiredModalRef.current = hasDismissedExpiredModal;
  }, [hasDismissedExpiredModal]);

  // Authoritative server clock skew correction
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState<number>(0);
  const serverClockOffsetMsRef = useRef<number>(0);

  // Real-time status of all teams for Administrator monitoring
  const [allTeamsProgress, setAllTeamsProgress] = useState<
    Record<
      string,
      {
        teamId: string;
        answeredCount: number;
        score: number;
        totalAssigned: number;
        lastUpdateMs: number;
      }
    >
  >({});

  // Cross-tab broadcast channel on same origin
  const syncChannel = useMemo(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel('vulture_arena_sync');
    }
    return null;
  }, []);

  // Real-time synchronization across devices and tabs via SSE + REST fallback
  useEffect(() => {
    let sse: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const startFallbackPolling = () => {
      if (pollInterval !== null) return;
      pollInterval = setInterval(checkServerState, 3000);
    };

    const stopFallbackPolling = () => {
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const applySyncedState = (data: {
      isStarted?: boolean;
      startedAtMs?: number | null;
      durationMinutes?: number;
      endsAtMs?: number | null;
      isExpired?: boolean;
      serverTimeMs?: number;
      teamProgress?: Record<string, any>;
    }) => {
      if (typeof data.serverTimeMs === 'number') {
        const skew = data.serverTimeMs - Date.now();
        // Always assign exact skew to ref on every sync
        serverClockOffsetMsRef.current = skew;
        // 500ms threshold only gates React state updates to prevent re-render churn
        setServerClockOffsetMs((prev) => (Math.abs(prev - skew) > 500 ? skew : prev));
      }

      if (typeof data.durationMinutes === 'number' && data.durationMinutes > 0) {
        setGameDurationMinutes(data.durationMinutes);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vulture_game_duration_minutes', String(data.durationMinutes));
        }
      }

      if (data.endsAtMs !== undefined) {
        setGameEndsAtMs(data.endsAtMs);
        if (typeof window !== 'undefined') {
          if (data.endsAtMs) {
            localStorage.setItem('vulture_game_ends_at_ms', String(data.endsAtMs));
          } else {
            localStorage.removeItem('vulture_game_ends_at_ms');
          }
        }
      }

      if (typeof data.isStarted === 'boolean') {
        setIsGameStarted(data.isStarted);
        if (data.isStarted) {
          if (data.startedAtMs) {
            setGameStartedAtMs(data.startedAtMs);
            if (typeof window !== 'undefined') {
              localStorage.setItem('vulture_authoritative_start_time', String(data.startedAtMs));
            }
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('vulture_game_started_v2', 'true');
          }
        } else {
          // Game is not running (waiting lobby or stopped)
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vulture_game_started_v2', 'false');
          }
        }
      }

      if (data.isStarted) {
        const effectiveNow = Date.now() + (data.serverTimeMs ? data.serverTimeMs - Date.now() : serverClockOffsetMsRef.current);
        const expired = Boolean(data.isExpired || (data.endsAtMs && effectiveNow >= data.endsAtMs));
        setIsTimeExpired(expired);
        if (expired && !hasDismissedExpiredModalRef.current) {
          setShowTimeExpiredModal(true);
        } else if (!expired) {
          setShowTimeExpiredModal(false);
        }
      } else {
        setIsTimeExpired(false);
        setShowTimeExpiredModal(false);
      }

      if (data.teamProgress) {
        setAllTeamsProgress(data.teamProgress);
      }
    };

    // 1. Initial REST check
    const checkServerState = async () => {
      try {
        const res = await fetch('/api/game/state');
        if (res.ok) {
          const json = await res.json();
          if (json?.state) {
            applySyncedState({
              ...json.state,
              serverTimeMs: json.serverTimeMs,
            });
          }
        }
      } catch {
        // Fallback gracefully
      }
    };

    checkServerState();

    // 2. Connect to SSE stream (native browser auto-reconnect preserved)
    try {
      sse = new EventSource('/api/game/stream');

      sse.onopen = () => {
        stopFallbackPolling();
        checkServerState(); // Authoritative state snapshot catch-up on connect and reconnect
      };

      sse.onerror = () => {
        startFallbackPolling(); // Single-interval fallback while SSE attempts auto-reconnect
      };

      sse.addEventListener('state', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          applySyncedState(parsed);
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('settings_updated', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          applySyncedState(parsed);
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('game_started', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          setHasDismissedExpiredModal(false);
          hasDismissedExpiredModalRef.current = false;
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
          applySyncedState(parsed);
          setCurrentQuestionIndex(0);
          resetQuestionState();
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('game_paused', (e: MessageEvent) => {
        try {
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
          }
          setIsFeedbackPeriodActive(false);
          const parsed = JSON.parse(e.data);
          applySyncedState(parsed);
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('game_expired', (e: MessageEvent) => {
        try {
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
          }
          setIsFeedbackPeriodActive(false);
          const parsed = JSON.parse(e.data);
          applySyncedState(parsed);
          setIsTimeExpired(true);
          if (!hasDismissedExpiredModalRef.current) {
            setShowTimeExpiredModal(true);
          }
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('game_reset', (e: MessageEvent) => {
        try {
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
          }
          setIsFeedbackPeriodActive(false);
          const parsed = JSON.parse(e.data);
          setHasDismissedExpiredModal(true);
          hasDismissedExpiredModalRef.current = true;
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
          applySyncedState(parsed);
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('game_recovered', (e: MessageEvent) => {
        try {
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
          }
          setIsFeedbackPeriodActive(false);
          const parsed = JSON.parse(e.data);
          setHasDismissedExpiredModal(true);
          hasDismissedExpiredModalRef.current = true;
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
          applySyncedState(parsed);
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('team_progress', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed?.teamProgress) {
            setAllTeamsProgress(parsed.teamProgress);
          }
        } catch (err) {
          console.error(err);
        }
      });
      sse.addEventListener('poster_updated', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed?.posters && typeof parsed.posters === 'object') {
            setPosters((prev) => {
              const next = { ...prev, ...normalizePostersMap(parsed.posters) };
              try {
                localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
              } catch {}
              return next;
            });
          } else if (parsed?.teamId && parsed?.poster) {
            setPosters((prev) => {
              const next = { ...prev, [parsed.teamId]: normalizePosterObject(parsed.poster) };
              try {
                localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
              } catch {}
              return next;
            });
          }

          if (Array.isArray(parsed?.submissions) && parsed.submissions.length > 0) {
            setTeamPhotoSubmissions((prev) => {
              const merged = [...prev];
              for (const sub of parsed.submissions) {
                const idx = merged.findIndex(
                  (m) => m.id === sub.id || (m.teamId === sub.teamId && m.questionId === sub.questionId)
                );
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...sub };
                } else {
                  merged.push(sub);
                }
              }
              try {
                localStorage.setItem('vulture_team_photo_submissions_v2', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        } catch (err) {
          console.warn('[SSE] Error handling poster_updated event:', err);
        }
      });
      sse.addEventListener('game_cleared', () => {
        try {
          if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
          }
          setIsFeedbackPeriodActive(false);
          setPosters(initialDefaultPosters);
          setTeamPhotoSubmissions([]);
          setSavedReflections({});
          setSubmittedQuestionIds([]);
          setCurrentQuestionIndex(0);
          setAllTeamsProgress({});
          setIsGameStarted(false);
          setGameStartedAtMs(null);
          setGameEndsAtMs(null);
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
          setHasDismissedExpiredModal(true);
          try {
            localStorage.removeItem('vulture_posters_custom_v2');
            localStorage.removeItem('vulture_team_photo_submissions_v2');
            localStorage.removeItem('vulture_team_reflections_v2');
            localStorage.removeItem('vulture_submitted_questions_v2');
            localStorage.removeItem('vulture_team_scores');
            localStorage.setItem('vulture_game_started_v2', 'false');
            localStorage.removeItem('vulture_game_ends_at_ms');
            localStorage.removeItem('vulture_authoritative_start_time');
          } catch {}
        } catch (err) {
          console.error('[SSE] Error handling game_cleared:', err);
        }
      });
    } catch {
      startFallbackPolling();
    }

    // 4. Cross-tab BroadcastChannel listener
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'GAME_STATE_CHANGED' && event.data?.state) {
          if (event.data.state.isStarted) {
            setHasDismissedExpiredModal(false);
            hasDismissedExpiredModalRef.current = false;
            setIsTimeExpired(false);
            setShowTimeExpiredModal(false);
            setCurrentQuestionIndex(0);
            resetQuestionState();
          } else {
            setIsTimeExpired(false);
            setShowTimeExpiredModal(false);
          }
          applySyncedState(event.data.state);
        } else if (event.data?.type === 'SETTINGS_CHANGED' && event.data?.durationMinutes) {
          setGameDurationMinutes(event.data.durationMinutes);
        }
      };
    }

    // 5. Cross-tab storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vulture_game_started_v2') {
        const started = e.newValue === 'true';
        setIsGameStarted(started);
        if (!started) {
          setIsTimeExpired(false);
          setShowTimeExpiredModal(false);
        }
      } else if (e.key === 'vulture_game_ends_at_ms') {
        const val = e.newValue ? parseInt(e.newValue, 10) : null;
        setGameEndsAtMs(val);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (sse) sse.close();
      stopFallbackPolling();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncChannel]);

  // Administrator changes game duration
  const handleDurationChange = async (minutes: number) => {
    const clamped = Math.max(1, Math.min(180, Math.round(minutes)));
    setGameDurationMinutes(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vulture_game_duration_minutes', String(clamped));
    }

    if (syncChannel) {
      syncChannel.postMessage({
        type: 'SETTINGS_CHANGED',
        durationMinutes: clamped,
      });
    }

    try {
      await fetch('/api/game/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: clamped }),
      });
    } catch (err) {
      console.error('Failed to update duration on server:', err);
    }
  };

  // Helper to report student progress to server for administrator monitoring
  // Helper to report student progress to server for administrator monitoring
  const reportProgressToServer = (tId: string, answered: number, currentScore: number) => {
    if (!tId) return;
    try {
      const teamQuestionsCount = questions.filter(
        (q) => q.isActive && q.assignedTeamIds.includes(tId)
      ).length;

      // CRITICAL DATA SAFETY: Never overwrite server progress if existing server progress has higher count or score
      const existingReport = allTeamsProgress[tId];
      if (existingReport) {
        if (
          answered < existingReport.answeredCount ||
          (answered === existingReport.answeredCount && currentScore < existingReport.score)
        ) {
          return;
        }
      }

      fetch('/api/game/team-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: tId,
          answeredCount: answered,
          score: currentScore,
          totalAssigned: teamQuestionsCount,
        }),
      });
    } catch {
      // Non-blocking
    }
  };

  // Keep student locked to their selected team across tabs and sessions
  useEffect(() => {
    if (isStudentTeamLocked && studentSelectedTeamId) {
      setSelectedTeamFilter(studentSelectedTeamId);
      setSelectedPosterTeamId(studentSelectedTeamId);
    }
  }, [isStudentTeamLocked, studentSelectedTeamId]);

  const handleStudentConnectWithCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (
      trimmed === 'GYPES-2026' ||
      trimmed === '2026' ||
      trimmed === 'GYPES' ||
      trimmed === 'VULTURE'
    ) {
      setIsStudentConnected(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vulture_student_connected', 'true');
      }
      return true;
    }
    return false;
  };

  const handleConfirmAndLockTeam = (teamId: string) => {
    setStudentSelectedTeamId(teamId);
    setIsStudentTeamLocked(true);
    setHasConfirmedReturningStudent(true);
    setSelectedTeamFilter(teamId);
    setSelectedPosterTeamId(teamId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vulture_student_team_locked', 'true');
      localStorage.setItem('vulture_student_locked_team_id', teamId);
    }
  };

  // Administrator simultaneous game start handler:
  // Starts game for all teams at exactly the same scheduled start time and synchronized end timestamp
  const handleStartGameForAllTeams = async () => {
    const nowMs = Date.now() + serverClockOffsetMsRef.current;
    const nowIso = new Date(nowMs).toISOString();
    const durationMs = gameDurationMinutes * 60 * 1000;
    const endsAtMs = nowMs + durationMs;

    const newState = {
      isStarted: true,
      startedAt: nowIso,
      startedAtMs: nowMs,
      scheduledStartTime: nowIso,
      durationMinutes: gameDurationMinutes,
      durationMs,
      endsAtMs,
      isExpired: false,
      roomPin: 'GYPES-2026',
    };

    setHasDismissedExpiredModal(false);
    hasDismissedExpiredModalRef.current = false;
    setIsGameStarted(true);
    setGameStartedAtMs(nowMs);
    setGameEndsAtMs(endsAtMs);
    setIsTimeExpired(false);
    setShowTimeExpiredModal(false);
    setCurrentQuestionIndex(0);
    resetQuestionState();

    if (typeof window !== 'undefined') {
      localStorage.setItem('vulture_game_started_v2', 'true');
      localStorage.setItem('vulture_authoritative_start_time', String(nowMs));
      localStorage.setItem('vulture_game_ends_at_ms', String(endsAtMs));
      localStorage.setItem('vulture_game_duration_minutes', String(gameDurationMinutes));
      window.dispatchEvent(new Event('storage'));
    }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'GAME_STATE_CHANGED', state: newState });
    }

    try {
      await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMinutes: gameDurationMinutes,
          scheduledStartTime: nowIso,
        }),
      });
    } catch (err) {
      console.error('Failed to trigger server game start:', err);
    }
  };

  // Administrator pause handler
  const handlePauseGame = async () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);
    setIsGameStarted(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vulture_game_started_v2', 'false');
      window.dispatchEvent(new Event('storage'));
    }
    const newState = {
      isStarted: false,
    };
    if (syncChannel) {
      syncChannel.postMessage({ type: 'GAME_STATE_CHANGED', state: newState });
    }
    try {
      await fetch('/api/game/pause', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to pause game on server:', err);
    }
  };

  // Administrator safe recovery: Clears stuck expired state, disarms modal, returns all to waiting lobby
  // PRESERVES all 75 questions, teams, answers, scores, and photos intact!
  const handleAdminSafeRecovery = async () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);
    setIsGameStarted(false);
    setGameStartedAtMs(null);
    setGameEndsAtMs(null);
    setIsTimeExpired(false);
    setShowTimeExpiredModal(false);
    setHasDismissedExpiredModal(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vulture_game_started_v2', 'false');
      localStorage.removeItem('vulture_game_ends_at_ms');
      localStorage.removeItem('vulture_authoritative_start_time');
      window.dispatchEvent(new Event('storage'));
    }

    const recoveredState = {
      isStarted: false,
      startedAtMs: null,
      endsAtMs: null,
      isExpired: false,
    };

    if (syncChannel) {
      syncChannel.postMessage({
        type: 'GAME_STATE_CHANGED',
        state: recoveredState,
      });
    }

    try {
      await fetch('/api/game/recover', { method: 'POST' });
    } catch (err) {
      console.error('Failed to recover game on server:', err);
    }
  };

  // Administrator reset game timer & state
  const handleResetGame = async () => {
    if (
      window.confirm(
        language === 'en'
          ? 'Are you sure you want to reset the game timer and return all students to the waiting lobby?'
          : 'Είστε βέβαιοι ότι θέλετε να επαναφέρετε το χρονόμετρο και να επιστρέψετε όλους τους μαθητές στην αίθουσα αναμονής;'
      )
    ) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      setIsFeedbackPeriodActive(false);
      setIsGameStarted(false);
      setGameStartedAtMs(null);
      setGameEndsAtMs(null);
      setIsTimeExpired(false);
      setShowTimeExpiredModal(false);
      setHasDismissedExpiredModal(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem('vulture_game_started_v2', 'false');
        localStorage.removeItem('vulture_game_ends_at_ms');
        localStorage.removeItem('vulture_authoritative_start_time');
        window.dispatchEvent(new Event('storage'));
      }

      const newState = {
        isStarted: false,
        endsAtMs: null,
        isExpired: false,
      };

      if (syncChannel) {
        syncChannel.postMessage({ type: 'GAME_STATE_CHANGED', state: newState });
      }

      try {
        await fetch('/api/game/reset', { method: 'POST' });
      } catch (err) {
        console.error('Failed to reset game on server:', err);
      }
    }
  };

  const handleResetStudentLocks = () => {
    const confirmMsg =
      language === 'en'
        ? 'Are you sure you want to reset student team locks and sessions for a new class?'
        : 'Είστε βέβαιοι ότι θέλετε να επαναφέρετε το κλείδωμα ομάδων και τις συνεδρίες των μαθητών για μια νέα τάξη;';
    if (window.confirm(confirmMsg)) {
      setIsStudentTeamLocked(false);
      setStudentSelectedTeamId(null);
      setIsStudentConnected(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vulture_student_team_locked');
        localStorage.removeItem('vulture_student_locked_team_id');
        localStorage.removeItem('vulture_student_connected');
      }
    }
  };

  // --- STUDENT DEVICE SESSION PROGRESS RESTORATION HELPERS ---
  interface SubmittedAnswerRecord {
    isCorrect: boolean;
    pointsAwarded: number;
    submittedAtMs: number;
  }

  interface StudentDeviceProgress {
    teamId: string;
    currentQuestionIndex: number;
    currentQuestionId: string;
    answeredCount: number;
    score: number;
    submittedQuestionIds: string[];
    submittedAnswers?: Record<string, SubmittedAnswerRecord>;
    feedbackActiveForQuestionId?: string | null;
    feedbackEndsAtMs?: number | null;
    lastSavedAtMs: number;
  }

  const getStudentProgressKey = (teamId: string) => `vulture_student_progress_${teamId}`;

  const loadStudentDeviceProgress = (teamId: string | null): StudentDeviceProgress | null => {
    if (typeof window === 'undefined' || !teamId) return null;
    try {
      const raw = localStorage.getItem(getStudentProgressKey(teamId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to parse student device progress:', err);
      return null;
    }
  };

  const saveStudentDeviceProgress = (data: StudentDeviceProgress) => {
    if (typeof window === 'undefined' || !data.teamId) return;
    try {
      localStorage.setItem(getStudentProgressKey(data.teamId), JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save student device progress:', err);
    }
  };

  // Active question in the Play/Arena simulator
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      const saved = loadStudentDeviceProgress(teamId);
      if (saved && typeof saved.currentQuestionIndex === 'number') {
        return saved.currentQuestionIndex;
      }
    }
    return 0;
  });

  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      const saved = loadStudentDeviceProgress(teamId);
      if (saved && Array.isArray(saved.submittedQuestionIds)) {
        return saved.submittedQuestionIds;
      }
    }
    return [];
  });
  const submittedQuestionIdsRef = useRef<string[]>(submittedQuestionIds);
  submittedQuestionIdsRef.current = submittedQuestionIds;

  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, SubmittedAnswerRecord>>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      const saved = loadStudentDeviceProgress(teamId);
      if (saved && saved.submittedAnswers) {
        return saved.submittedAnswers;
      }
    }
    return {};
  });

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

  // Saved Reflections & Drafts
  const [savedReflections, setSavedReflections] = useState<Record<string, SavedTeamReflection>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_team_reflections_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {};
  });

  const [reflectionDrafts, setReflectionDrafts] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vulture_reflection_drafts_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {};
  });

  const [userReflectionText, setUserReflectionText] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isFeedbackPeriodActive, setIsFeedbackPeriodActive] = useState<boolean>(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, []);

  // Clear pending automatic advance if game stops, pauses, or expires
  useEffect(() => {
    if (!isGameStarted || isTimeExpired) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      setIsFeedbackPeriodActive(false);
    }
  }, [isGameStarted, isTimeExpired]);

  const [score, setScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      const saved = loadStudentDeviceProgress(teamId);
      if (saved && typeof saved.score === 'number') {
        return saved.score;
      }
    }
    return 0;
  });

  const [answeredCount, setAnsweredCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const teamId = localStorage.getItem('vulture_student_locked_team_id');
      const saved = loadStudentDeviceProgress(teamId);
      if (saved && typeof saved.answeredCount === 'number') {
        return saved.answeredCount;
      }
    }
    return 0;
  });

  // Report progress updates to server if confirmed returning student and progress exists
  useEffect(() => {
    if (isStudentTeamLocked && studentSelectedTeamId && hasConfirmedReturningStudent && answeredCount > 0) {
      reportProgressToServer(studentSelectedTeamId, answeredCount, score);
    }
  }, [isStudentTeamLocked, studentSelectedTeamId, hasConfirmedReturningStudent, answeredCount, score]);

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
  const localizedCurrentQ = useMemo(() => {
    return currentQ ? getLocalizedQuestion(currentQ, language) : undefined;
  }, [currentQ, language]);

  // Resolve media for the current question (including video and image Blobs stored in IndexedDB for QR stations)
  const [resolvedStationMediaUrl, setResolvedStationMediaUrl] = useState<string | null>(null);
  const [resolvedStationMediaType, setResolvedStationMediaType] = useState<'image' | 'video' | 'none'>('none');

  useEffect(() => {
    let isMounted = true;
    if (!currentQ) {
      setResolvedStationMediaUrl(null);
      setResolvedStationMediaType('none');
      return;
    }

    const token = currentQ.type === 'qr_scan' ? (currentQ as QRScanQuestion).qrPayload : undefined;

    resolveQuestionMedia(currentQ.mediaUrl, currentQ.mediaType, token).then((res) => {
      if (isMounted) {
        setResolvedStationMediaUrl(res.url);
        setResolvedStationMediaType(res.mediaType);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentQ?.id, currentQ?.mediaUrl, currentQ?.mediaType, (currentQ as any)?.qrPayload]);

  // Ensure reflection text and media state open completely empty without prepopulated content
  useEffect(() => {
    setUserReflectionText('');
    if (isReflectionQuestion(currentQ)) {
      setUserUploadedFile(null);
      setUserUploadedDataUrl(null);
    }
  }, [currentQ?.id]);

  // Helper to advance to next question
  const advanceToNextQuestion = (explicitSubmittedIds?: string[]) => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);

    const currentSubmittedIds = explicitSubmittedIds || submittedQuestionIdsRef.current || submittedQuestionIds;

    // Stop student navigation when their team has completed all active assigned questions or reached the last question
    if (!isAdminLoggedIn && studentSelectedTeamId) {
      const teamAssigned = questions.filter(
        (q) => q.isActive && q.assignedTeamIds.includes(studentSelectedTeamId)
      );
      const submittedSet = new Set(currentSubmittedIds);
      const allCompleted = teamAssigned.length > 0 && teamAssigned.every((q) => submittedSet.has(q.id));
      const isAtLastQuestion = currentQuestionIndex >= activeQuestions.length - 1;

      if (allCompleted || isAtLastQuestion) {
        resetQuestionState();
        const lastIndex = Math.max(0, activeQuestions.length - 1);
        setCurrentQuestionIndex(lastIndex);
        const currentTargetQ = activeQuestions[lastIndex];
        if (currentTargetQ) {
          saveStudentDeviceProgress({
            teamId: studentSelectedTeamId,
            currentQuestionIndex: lastIndex,
            currentQuestionId: currentTargetQ.id,
            answeredCount,
            score,
            submittedQuestionIds: currentSubmittedIds,
            submittedAnswers,
            feedbackActiveForQuestionId: null,
            feedbackEndsAtMs: null,
            lastSavedAtMs: Date.now(),
          });
        }
        return;
      }
    }

    resetQuestionState();

    // Never use modulo arithmetic for students: students progress linearly without wrapping to 0.
    // Circular navigation is preserved for administrators only.
    let nextIndex = 0;
    if (!isAdminLoggedIn) {
      nextIndex = Math.min(currentQuestionIndex + 1, Math.max(0, activeQuestions.length - 1));
    } else {
      nextIndex = (currentQuestionIndex + 1) % (activeQuestions.length || 1);
    }
    setCurrentQuestionIndex(nextIndex);

    const nextQ = activeQuestions[nextIndex];
    const isAlreadySubmitted = Boolean(nextQ && currentSubmittedIds.includes(nextQ.id));
    setIsAnswerSubmitted(isAlreadySubmitted);

    if (!isAdminLoggedIn && studentSelectedTeamId && nextQ) {
      saveStudentDeviceProgress({
        teamId: studentSelectedTeamId,
        currentQuestionIndex: nextIndex,
        currentQuestionId: nextQ.id,
        answeredCount,
        score,
        submittedQuestionIds: currentSubmittedIds,
        submittedAnswers,
        feedbackActiveForQuestionId: null,
        feedbackEndsAtMs: null,
        lastSavedAtMs: Date.now(),
      });
    }
  };

  // Reset interactive inputs when changing question
  const resetQuestionState = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);
    setUserSingleChoice(null);
    setUserMultiChoice([]);
    setUserTrueFalse(null);
    setUserMatches({});
    setUserSelectedLeft(null);
    setUserImageChoice(null);
    setUserQrInput('');
    setUserUploadedFile(null);
    setUserUploadedDataUrl(null);
    setUserReflectionText('');
    setIsAnswerSubmitted(false);
    setIsQRScannerOpen(false);
  };

  // Close QR camera scanner if active question changes
  useEffect(() => {
    setIsQRScannerOpen(false);
  }, [currentQuestionIndex, currentQ?.id]);

  // Safe reset for pupils with confirmation if reflection text exists
  const handleResetQuestion = () => {
    // In student mode, do not allow resetting after an answer has been submitted or during feedback
    if (!isAdminLoggedIn && (isAnswerSubmitted || isFeedbackPeriodActive)) {
      return;
    }
    if (currentQ && isReflectionQuestion(currentQ) && userReflectionText.trim().length > 0) {
      const confirmMsg =
        language === 'en'
          ? 'Are you sure you want to clear your reflection draft?'
          : 'Είστε βέβαιοι ότι θέλετε να διαγράψετε το κείμενο του αναστοχασμού σας;';
      if (!window.confirm(confirmMsg)) {
        return;
      }
      setUserReflectionText('');
      setReflectionDrafts((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        if (typeof window !== 'undefined') {
          localStorage.setItem('vulture_reflection_drafts_v1', JSON.stringify(copy));
        }
        return copy;
      });
    }
    resetQuestionState();
  };

  const handleCompleteStationAndContinue = () => {
    if (!currentQ || currentQ.type !== 'qr_scan') {
      advanceToNextQuestion();
      return;
    }

    const targetTeamId =
      (currentQ.assignedTeamIds && currentQ.assignedTeamIds[0]) || studentSelectedTeamId || 'team-characteristics';

    const isAlreadySubmitted = (submittedQuestionIdsRef.current || submittedQuestionIds).includes(currentQ.id);
    const updatedSubmittedIds = isAlreadySubmitted
      ? (submittedQuestionIdsRef.current || submittedQuestionIds)
      : [...submittedQuestionIds, currentQ.id];

    if (!isAlreadySubmitted) {
      const pointsAwarded = currentQ.points || 0;
      const newScore = score + pointsAwarded;
      const newAnswered = answeredCount + 1;

      setScore(newScore);
      setAnsweredCount(newAnswered);

      setSubmittedQuestionIds(updatedSubmittedIds);
      submittedQuestionIdsRef.current = updatedSubmittedIds;

      const updatedSubmittedAnswers: Record<string, SubmittedAnswerRecord> = {
        ...submittedAnswers,
        [currentQ.id]: {
          isCorrect: true,
          pointsAwarded,
          submittedAtMs: Date.now(),
        },
      };
      setSubmittedAnswers(updatedSubmittedAnswers);

      reportProgressToServer(targetTeamId, newAnswered, newScore);

      if (!isAdminLoggedIn) {
        saveStudentDeviceProgress({
          teamId: targetTeamId,
          currentQuestionIndex,
          currentQuestionId: currentQ.id,
          answeredCount: newAnswered,
          score: newScore,
          submittedQuestionIds: updatedSubmittedIds,
          submittedAnswers: updatedSubmittedAnswers,
          feedbackActiveForQuestionId: null,
          feedbackEndsAtMs: null,
          lastSavedAtMs: Date.now(),
        });
      }
    }

    advanceToNextQuestion(updatedSubmittedIds);
  };

  const handleNextQuestion = () => {
    if (currentQ?.type === 'qr_scan') {
      const qrExpected = (currentQ as QRScanQuestion).qrPayload?.trim().toUpperCase() || '';
      const enteredQrClean = userQrInput.trim().toUpperCase();
      const isQrValidMatch = enteredQrClean.length > 0 && enteredQrClean === qrExpected;
      const isStationUnlocked = isQrValidMatch || submittedQuestionIds.includes(currentQ.id);
      if (!isAdminLoggedIn && !isStationUnlocked) {
        return;
      }
      handleCompleteStationAndContinue();
      return;
    }

    // In student mode, disable manual next before submission or during feedback
    if (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive)) {
      return;
    }

    // In student mode, if already at the final assigned question, do not wrap around
    if (!isAdminLoggedIn && currentQuestionIndex >= activeQuestions.length - 1) {
      return;
    }

    advanceToNextQuestion();
  };

  const handlePrevQuestion = () => {
    // In student mode, disable manual previous before submission or during feedback
    if (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive)) {
      return;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);
    resetQuestionState();

    // In student mode, clamp at Question 0 without wrapping backwards. Admin preserves circular navigation.
    let prevIndex = 0;
    if (!isAdminLoggedIn) {
      prevIndex = Math.max(0, currentQuestionIndex - 1);
    } else {
      prevIndex = (currentQuestionIndex - 1 + activeQuestions.length) % (activeQuestions.length || 1);
    }
    setCurrentQuestionIndex(prevIndex);

    const prevQ = activeQuestions[prevIndex];
    const isAlreadySubmitted = Boolean(prevQ && submittedQuestionIds.includes(prevQ.id));
    setIsAnswerSubmitted(isAlreadySubmitted);

    if (!isAdminLoggedIn && studentSelectedTeamId && prevQ) {
      saveStudentDeviceProgress({
        teamId: studentSelectedTeamId,
        currentQuestionIndex: prevIndex,
        currentQuestionId: prevQ.id,
        answeredCount,
        score,
        submittedQuestionIds,
        submittedAnswers,
        feedbackActiveForQuestionId: null,
        feedbackEndsAtMs: null,
        lastSavedAtMs: Date.now(),
      });
    }
  };

  // Synchronize submitted state when viewing a question in submittedQuestionIds
  useEffect(() => {
    if (currentQ && submittedQuestionIds.includes(currentQ.id)) {
      setIsAnswerSubmitted(true);
    }
  }, [currentQ?.id, submittedQuestionIds]);

  // Returning student choice 1: Continue with existing locked team and restore saved question position
  const handleContinueStudentSession = () => {
    const teamId = studentSelectedTeamId || (typeof window !== 'undefined' ? localStorage.getItem('vulture_student_locked_team_id') : null);
    if (teamId) {
      setSelectedTeamFilter(teamId);
      setSelectedPosterTeamId(teamId);

      const teamQuestions = questions.filter((q) => q.isActive && q.assignedTeamIds.includes(teamId));
      const savedData = loadStudentDeviceProgress(teamId);

      if (savedData) {
        if (typeof savedData.score === 'number') {
          setScore(savedData.score);
        }
        if (typeof savedData.answeredCount === 'number') {
          setAnsweredCount(savedData.answeredCount);
        }
        if (Array.isArray(savedData.submittedQuestionIds)) {
          setSubmittedQuestionIds(savedData.submittedQuestionIds);
        }
        if (savedData.submittedAnswers) {
          setSubmittedAnswers(savedData.submittedAnswers);
        }

        const now = Date.now();
        // Check if reconnection occurred during the 8-second feedback period
        if (
          savedData.feedbackActiveForQuestionId &&
          typeof savedData.feedbackEndsAtMs === 'number'
        ) {
          if (now < savedData.feedbackEndsAtMs) {
            // Still within the 8-second window: restore feedback view & set timer for remaining ms
            const qIndex = teamQuestions.findIndex((q) => q.id === savedData.feedbackActiveForQuestionId);
            const resolvedIndex = qIndex !== -1 ? qIndex : Math.max(0, Math.min(savedData.currentQuestionIndex, teamQuestions.length - 1));
            setCurrentQuestionIndex(resolvedIndex);
            setIsAnswerSubmitted(true);
            setIsFeedbackPeriodActive(true);

            const remainingMs = Math.max(1000, savedData.feedbackEndsAtMs - now);
            if (autoAdvanceTimeoutRef.current) {
              clearTimeout(autoAdvanceTimeoutRef.current);
            }
            autoAdvanceTimeoutRef.current = setTimeout(() => {
              advanceToNextQuestion();
            }, remainingMs);
          } else {
            // 8-second feedback period elapsed while away: advance cleanly to the next question or preserve completion
            const qIndex = teamQuestions.findIndex((q) => q.id === savedData.feedbackActiveForQuestionId);
            const resolvedIndex = qIndex !== -1 ? qIndex : savedData.currentQuestionIndex;

            const savedSubmittedSet = new Set(savedData.submittedQuestionIds || []);
            const allTeamQuestionsCompleted =
              teamQuestions.length > 0 && teamQuestions.every((q) => savedSubmittedSet.has(q.id));

            if (allTeamQuestionsCompleted) {
              const lastIndex = Math.max(0, teamQuestions.length - 1);
              setCurrentQuestionIndex(lastIndex);
              setIsAnswerSubmitted(true);
              setIsFeedbackPeriodActive(false);
              resetQuestionState();

              const lastQ = teamQuestions[lastIndex];
              if (lastQ) {
                saveStudentDeviceProgress({
                  ...savedData,
                  currentQuestionIndex: lastIndex,
                  currentQuestionId: lastQ.id,
                  feedbackActiveForQuestionId: null,
                  feedbackEndsAtMs: null,
                  lastSavedAtMs: now,
                });
              }
            } else {
              const nextIndex = Math.min(resolvedIndex + 1, Math.max(0, teamQuestions.length - 1));
              setCurrentQuestionIndex(nextIndex);
              setIsAnswerSubmitted(false);
              setIsFeedbackPeriodActive(false);
              resetQuestionState();

              // Save the resolved question position
              const nextQ = teamQuestions[nextIndex];
              if (nextQ) {
                saveStudentDeviceProgress({
                  ...savedData,
                  currentQuestionIndex: nextIndex,
                  currentQuestionId: nextQ.id,
                  feedbackActiveForQuestionId: null,
                  feedbackEndsAtMs: null,
                  lastSavedAtMs: now,
                });
              }
            }
          }
        } else {
          // Standard question position restoration
          const savedSubmittedSet = new Set(savedData.submittedQuestionIds || []);
          const allTeamQuestionsCompleted =
            teamQuestions.length > 0 && teamQuestions.every((q) => savedSubmittedSet.has(q.id));

          let resolvedIndex = 0;
          if (allTeamQuestionsCompleted) {
            resolvedIndex = Math.max(0, teamQuestions.length - 1);
          } else if (savedData.currentQuestionId) {
            const idx = teamQuestions.findIndex((q) => q.id === savedData.currentQuestionId);
            if (idx !== -1) {
              resolvedIndex = idx;
            } else if (typeof savedData.currentQuestionIndex === 'number') {
              resolvedIndex = Math.max(0, Math.min(savedData.currentQuestionIndex, teamQuestions.length - 1));
            }
          } else if (typeof savedData.currentQuestionIndex === 'number') {
            resolvedIndex = Math.max(0, Math.min(savedData.currentQuestionIndex, teamQuestions.length - 1));
          }

          setCurrentQuestionIndex(resolvedIndex);
          const currentTargetQ = teamQuestions[resolvedIndex];
          const isAlreadySubmitted = Boolean(currentTargetQ && savedData.submittedQuestionIds?.includes(currentTargetQ.id));
          setIsAnswerSubmitted(isAlreadySubmitted);
          setIsFeedbackPeriodActive(false);
        }
      }
    }
    setHasConfirmedReturningStudent(true);
  };

  // Returning student choice 2: Start over on this device only
  // Clears ONLY vulture_student_team_locked, vulture_student_locked_team_id, vulture_reflection_drafts_v1,
  // and this device's question-position checkpoint (vulture_student_progress_${teamId}).
  // Keeps vulture_student_connected, does not touch server progress, shared posters, submissions or timer
  const handleStartOverThisDeviceOnly = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vulture_student_team_locked');
      localStorage.removeItem('vulture_student_locked_team_id');
      localStorage.removeItem('vulture_reflection_drafts_v1');
      if (studentSelectedTeamId) {
        localStorage.removeItem(getStudentProgressKey(studentSelectedTeamId));
      }
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsStudentTeamLocked(false);
    setStudentSelectedTeamId(null);
    setHasConfirmedReturningStudent(true);
    setReflectionDrafts({});
    setUserReflectionText('');
    setScore(0);
    setAnsweredCount(0);
    setSubmittedQuestionIds([]);
    setSubmittedAnswers({});
    setCurrentQuestionIndex(0);
    resetQuestionState();
  };

  // Safely adjust question index if active questions list updates (e.g., administrator deactivates question)
  useEffect(() => {
    if (activeQuestions.length > 0 && currentQuestionIndex >= activeQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, activeQuestions.length - 1));
      resetQuestionState();
    }
  }, [activeQuestions.length, currentQuestionIndex]);

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

  // Move Question UP (within team context or globally)
  const handleMoveQuestionUp = (id: string, contextList?: Question[]) => {
    setQuestions((prev) => {
      if (contextList && contextList.length > 1) {
        const listIdx = contextList.findIndex((q) => q.id === id);
        if (listIdx <= 0) return prev;
        const targetId = contextList[listIdx - 1].id;
        const idxA = prev.findIndex((q) => q.id === id);
        const idxB = prev.findIndex((q) => q.id === targetId);
        if (idxA === -1 || idxB === -1) return prev;
        const copy = [...prev];
        const temp = copy[idxA];
        copy[idxA] = copy[idxB];
        copy[idxB] = temp;
        return copy;
      }
      const index = prev.findIndex((q) => q.id === id);
      if (index <= 0) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move Question DOWN (within team context or globally)
  const handleMoveQuestionDown = (id: string, contextList?: Question[]) => {
    setQuestions((prev) => {
      if (contextList && contextList.length > 1) {
        const listIdx = contextList.findIndex((q) => q.id === id);
        if (listIdx === -1 || listIdx >= contextList.length - 1) return prev;
        const targetId = contextList[listIdx + 1].id;
        const idxA = prev.findIndex((q) => q.id === id);
        const idxB = prev.findIndex((q) => q.id === targetId);
        if (idxA === -1 || idxB === -1) return prev;
        const copy = [...prev];
        const temp = copy[idxA];
        copy[idxA] = copy[idxB];
        copy[idxB] = temp;
        return copy;
      }
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
        if (isReflectionQuestion(currentQ)) {
          return userReflectionText.trim().length > 0;
        }
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
    userReflectionText,
    savedReflections,
  ]);

  // Check whether the student has made a valid selection/input for the current question
  const isAnswerSelected = useMemo(() => {
    if (!currentQ) return false;

    switch (currentQ.type) {
      case 'multiple_choice':
        return userSingleChoice !== null && userSingleChoice !== '';
      case 'multiple_choice_multi':
        return Array.isArray(userMultiChoice) && userMultiChoice.length > 0;
      case 'true_false':
        return userTrueFalse !== null;
      case 'text_matching': {
        const pairs = (currentQ as TextMatchingQuestion).pairs;
        // Require at least one pair to be matched by the student
        return pairs && pairs.length > 0 && Object.keys(userMatches).length > 0;
      }
      case 'image_matching':
        return userImageChoice !== null && userImageChoice !== '';
      case 'qr_scan':
        return userQrInput.trim().length > 0;
      case 'photo_upload':
      case 'video_upload':
        if (isReflectionQuestion(currentQ)) {
          return userReflectionText.trim().length > 0;
        }
        return Boolean(userUploadedFile);
      default:
        return true;
    }
  }, [
    currentQ,
    userSingleChoice,
    userMultiChoice,
    userTrueFalse,
    userMatches,
    userImageChoice,
    userQrInput,
    userUploadedFile,
    userReflectionText,
    savedReflections,
  ]);

  const handleSubmitAnswer = () => {
    // Automatically stop accepting new answers when time expires
    if (isTimeExpired) {
      setShowTimeExpiredModal(true);
      return;
    }

    // Prevent duplicate submissions and submissions while feedback/explanation is active
    if (
      isAnswerSubmitted ||
      isFeedbackPeriodActive ||
      Boolean(currentQ && submittedQuestionIds.includes(currentQ.id))
    ) {
      return;
    }

    // Require an answer to be selected before submitting
    if (!isAnswerSelected) {
      return;
    }

    setIsAnswerSubmitted(true);
    const pointsAwarded = isAnswerCorrect ? (currentQ?.points || 0) : 0;
    const newScore = score + pointsAwarded;
    const newAnswered = answeredCount + 1;

    setAnsweredCount(newAnswered);
    if (isAnswerCorrect) {
      setScore(newScore);
    }

    const updatedSubmittedIds = currentQ && !submittedQuestionIds.includes(currentQ.id)
      ? [...submittedQuestionIds, currentQ.id]
      : submittedQuestionIds;
    setSubmittedQuestionIds(updatedSubmittedIds);
    submittedQuestionIdsRef.current = updatedSubmittedIds;

    const updatedSubmittedAnswers: Record<string, SubmittedAnswerRecord> = {
      ...submittedAnswers,
      ...(currentQ
        ? {
            [currentQ.id]: {
              isCorrect: isAnswerCorrect,
              pointsAwarded,
              submittedAtMs: Date.now(),
            },
          }
        : {}),
    };
    setSubmittedAnswers(updatedSubmittedAnswers);

    if (currentQ) {
      const targetTeamId =
        (currentQ.assignedTeamIds && currentQ.assignedTeamIds[0]) || studentSelectedTeamId || 'team-characteristics';

      // Report progress to server for administrator live monitoring
      reportProgressToServer(targetTeamId, newAnswered, newScore);

      // Save student progress checkpoint locally on device
      if (!isAdminLoggedIn) {
        saveStudentDeviceProgress({
          teamId: targetTeamId,
          currentQuestionIndex,
          currentQuestionId: currentQ.id,
          answeredCount: newAnswered,
          score: newScore,
          submittedQuestionIds: updatedSubmittedIds,
          submittedAnswers: updatedSubmittedAnswers,
          feedbackActiveForQuestionId: currentQ.id,
          feedbackEndsAtMs: Date.now() + 8000,
          lastSavedAtMs: Date.now(),
        });
      }

      // 1. If this is a reflection question: save reflection text to savedReflections and update the team's poster
      if (isReflectionQuestion(currentQ) && userReflectionText.trim()) {
        const trimmedReflection = userReflectionText.trim();
        const newReflection: SavedTeamReflection = {
          questionId: currentQ.id,
          teamId: targetTeamId,
          text: trimmedReflection,
          submittedAt: new Date().toISOString(),
        };

        setSavedReflections((prev) => {
          const updated = { ...prev, [currentQ.id]: newReflection };
          if (typeof window !== 'undefined') {
            localStorage.setItem('vulture_team_reflections_v2', JSON.stringify(updated));
          }
          return updated;
        });

        // Also update the specific team's poster reflection without altering photos
        setPosters((prev) => {
          const existing = prev[targetTeamId];
          if (!existing) return prev;
          const updated = {
            ...existing,
            wowMomentQuote: trimmedReflection,
            wowMomentQuoteEn: language === 'en' ? trimmedReflection : (existing.wowMomentQuoteEn || trimmedReflection),
          };
          const next = { ...prev, [targetTeamId]: updated };
          if (typeof window !== 'undefined') {
            localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
          }
          // Sync updated poster to central server for teacher/admin projection
          syncPosterToServer(targetTeamId, updated);
          return next;
        });
      }

      // 2. If this was an authentic photo challenge and image data was selected:
      if (currentQ.type === 'photo_upload' && userUploadedDataUrl) {
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

        // Also persist photo directly into the team's poster record WITHOUT erasing existing wowMomentQuote
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
            try {
              localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
            } catch (storageErr) {
              console.warn('LocalStorage quota reached when saving poster update, keeping in-memory:', storageErr);
            }
          }
          // Sync updated poster and photo submission to central server
          syncPosterToServer(targetTeamId, updated, newSub);
          return next;
        });
      }
    }

    // For students: keep feedback/explanation active for 8 seconds, then automatically advance
    if (!isAdminLoggedIn) {
      setIsFeedbackPeriodActive(true);
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion(updatedSubmittedIds);
      }, 8000);
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

  // Administrator Action: New Game - Clear Previous Game Data
  const handleConfirmClearGameData = async () => {
    // 1. Cancel any active auto-advance timers
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsFeedbackPeriodActive(false);

    // 2. Call central server to clear posters, submissions, and session data
    try {
      await clearServerGameData();
    } catch (err) {
      console.warn('Failed to clear server game data:', err);
    }

    // 3. Reset local poster data to initial scientific defaults
    setPosters(initialDefaultPosters);
    setTeamPhotoSubmissions([]);
    setSavedReflections({});
    setSubmittedQuestionIds([]);
    setCurrentQuestionIndex(0);
    setAllTeamsProgress({});

    // 4. Reset game session & lobby timers
    setIsGameStarted(false);
    setGameStartedAtMs(null);
    setGameEndsAtMs(null);
    setIsTimeExpired(false);
    setShowTimeExpiredModal(false);
    setHasDismissedExpiredModal(true);

    // 5. Clean local storage for this device (preserving admin auth, custom questions, and team configs)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vulture_posters_custom_v2');
        localStorage.removeItem('vulture_team_photo_submissions_v2');
        localStorage.removeItem('vulture_team_reflections_v2');
        localStorage.removeItem('vulture_submitted_questions_v2');
        localStorage.removeItem('vulture_team_scores');
        localStorage.setItem('vulture_game_started_v2', 'false');
        localStorage.removeItem('vulture_game_ends_at_ms');
        localStorage.removeItem('vulture_authoritative_start_time');
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn('Error clearing localStorage for new game:', e);
      }
    }

    // 6. Broadcast across local browser tabs
    if (syncChannel) {
      syncChannel.postMessage({
        type: 'GAME_STATE_CHANGED',
        state: { isStarted: false, endsAtMs: null, isExpired: false },
      });
      syncChannel.postMessage({ type: 'GAME_CLEARED' });
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
    // Sync to central server so teacher/admin immediately receives it
    syncPosterToServer(newPoster.teamId, newPoster);
  };

  const handleRefreshPosters = async () => {
    const serverData = await fetchServerPosters();
    if (!serverData) return;
    if (serverData.posters && Object.keys(serverData.posters).length > 0) {
      setPosters((prev) => {
        const next = { ...prev, ...normalizePostersMap(serverData.posters) };
        try {
          localStorage.setItem('vulture_posters_custom_v2', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
    if (Array.isArray(serverData.submissions) && serverData.submissions.length > 0) {
      setTeamPhotoSubmissions((prev) => {
        const merged = [...prev];
        for (const sub of serverData.submissions) {
          const idx = merged.findIndex(
            (m) => m.id === sub.id || (m.teamId === sub.teamId && m.questionId === sub.questionId)
          );
          if (idx >= 0) merged[idx] = { ...merged[idx], ...sub };
          else merged.push(sub);
        }
        try {
          localStorage.setItem('vulture_team_photo_submissions_v2', JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  };

  // Re-sync when opening teacher presentation mode
  useEffect(() => {
    if (isPresentationOpen) {
      handleRefreshPosters();
    }
  }, [isPresentationOpen]);

  const handleOpenPresentation = (teamIndex: number = 0) => {
    setPresentationIndex(teamIndex);
    setIsPresentationOpen(true);
  };

  // Export & Printable Register Modal State & Handlers
  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (exportToast) {
      const timer = setTimeout(() => {
        setExportToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [exportToast]);

  const handleExportFullBackup = () => {
    const result = exportFullJSONBackup(questions, teams, posters, teamPhotoSubmissions, language, savedReflections);
    if (result.success) {
      setExportToast({
        type: 'success',
        title: language === 'en' ? 'Full Backup (JSON) Created' : 'Πλήρες Αντίγραφο Ασφαλείας (JSON)',
        message: language === 'en' ? result.messageEn : result.message,
      });
    } else {
      setExportToast({
        type: 'error',
        title: language === 'en' ? 'Backup Error' : 'Σφάλμα Αντιγράφου Ασφαλείας',
        message: language === 'en' ? result.messageEn : result.message,
      });
    }
  };

  const handleExportAllQuestionsCSV = () => {
    const result = exportQuestionsCSV(questions, teams, language);
    if (result.success) {
      setExportToast({
        type: 'success',
        title: language === 'en' ? 'Questions CSV Exported' : 'Εξαγωγή Ερωτήσεων (CSV)',
        message: language === 'en' ? result.messageEn : result.message,
      });
    } else {
      setExportToast({
        type: 'error',
        title: language === 'en' ? 'CSV Export Error' : 'Σφάλμα Εξαγωγής CSV',
        message: language === 'en' ? result.messageEn : result.message,
      });
    }
  };

  const renderTypeBadge = (type: QuestionType) => {
    const config: Record<QuestionType, { label: string; icon: any; color: string }> = {
      multiple_choice: { label: t.type_multiple_choice, icon: CheckCircle2, color: 'bg-amber-100 text-amber-800 border-amber-300' },
      multiple_choice_multi: { label: t.type_multiple_choice_multi, icon: Layers, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      true_false: { label: t.type_true_false, icon: Check, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      text_matching: { label: t.type_text_matching, icon: SlidersHorizontal, color: 'bg-sky-100 text-sky-800 border-sky-300' },
      image_matching: { label: t.type_image_matching, icon: Eye, color: 'bg-purple-100 text-purple-800 border-purple-300' },
      qr_scan: { label: t.type_qr_scan, icon: QrCode, color: 'bg-rose-100 text-rose-800 border-rose-300' },
      photo_upload: { label: t.type_photo_upload, icon: Camera, color: 'bg-teal-100 text-teal-800 border-teal-300' },
      video_upload: { label: t.type_video_upload, icon: Video, color: 'bg-orange-100 text-orange-800 border-orange-300' },
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

    // Look for reflection submitted for this team only
    const teamSavedReflection = Object.values(savedReflections).find(
      (r) => r.teamId === basePoster.teamId && r.text && r.text.trim().length > 0
    );
    const dynamicQuote = teamSavedReflection?.text?.trim() || (basePoster.wowMomentQuote || '').trim();
    const dynamicQuoteEn = (lang === 'en' && teamSavedReflection?.text?.trim())
      ? teamSavedReflection.text.trim()
      : ((basePoster.wowMomentQuoteEn || dynamicQuote) || '').trim();

    return {
      ...basePoster,
      scientificFacts: dynamicFacts,
      submittedPhotos: authenticPhotos,
      photoUrl: authenticPhotos.length > 0 ? authenticPhotos[0].photoUrl : '',
      photoCaption:
        authenticPhotos.length > 0
          ? (authenticPhotos[0].caption || authenticPhotos[0].taskPrompt)
          : '',
      wowMomentQuote: dynamicQuote,
      wowMomentQuoteEn: dynamicQuoteEn,
    };
  };

  const effectiveSelectedPosterTeamId = (!isAdminLoggedIn && studentSelectedTeamId)
    ? studentSelectedTeamId
    : selectedPosterTeamId;
  const rawPosterData = posters[effectiveSelectedPosterTeamId] || Object.values(posters)[0];
  const currentPosterData = useMemo(() => {
    return rawPosterData ? getPosterWithDynamicFacts(rawPosterData, language) : null;
  }, [rawPosterData, questions, teamPhotoSubmissions, savedReflections, language]);

  const dynamicPostersList = useMemo(() => {
    return Object.values(posters).map((p) => getPosterWithDynamicFacts(p, language));
  }, [posters, questions, teamPhotoSubmissions, savedReflections, language]);

  const dynamicPostersMap = useMemo(() => {
    const res: Record<string, TeamPosterData> = {};
    for (const [key, val] of Object.entries(posters)) {
      res[key] = getPosterWithDynamicFacts(val, language);
    }
    return res;
  }, [posters, questions, teamPhotoSubmissions, savedReflections, language]);

  // Determine whether the student's locked team has completed all its assigned activities
  const isCurrentTeamActivitiesCompleted = useMemo(() => {
    if (!studentSelectedTeamId) return false;
    const teamAssignedQuestions = questions.filter(
      (q) => q.isActive && q.assignedTeamIds.includes(studentSelectedTeamId)
    );
    const totalAssigned = teamAssignedQuestions.length;
    if (totalAssigned === 0) return false;
    const submittedSet = new Set(submittedQuestionIds);
    return teamAssignedQuestions.every((q) => submittedSet.has(q.id));
  }, [studentSelectedTeamId, questions, submittedQuestionIds]);

  // STUDENT FLOW GATE: If user is not an administrator, enforce access code, team selection, returning student choice, and waiting lobby
  if (
    !isAdminLoggedIn &&
    (!isStudentConnected || !isStudentTeamLocked || !isGameStarted || !hasConfirmedReturningStudent)
  ) {
    return (
      <>
        <StudentEntryFlow
          teams={teams}
          language={language}
          onSetLanguage={setLanguage}
          isStudentConnected={isStudentConnected}
          onConnectWithCode={handleStudentConnectWithCode}
          selectedTeamId={studentSelectedTeamId}
          isTeamLocked={isStudentTeamLocked}
          onConfirmAndLockTeam={handleConfirmAndLockTeam}
          isGameStarted={isGameStarted}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          roomPin="GYPES-2026"
          durationMinutes={gameDurationMinutes}
          isReturningStudent={isStudentTeamLocked && !hasConfirmedReturningStudent}
          onContinueSession={handleContinueStudentSession}
          onStartOverThisDeviceOnly={handleStartOverThisDeviceOnly}
        />

        {/* Admin Login Modal (Accessible from student flow) */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
          }}
          language={language}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Admin Sticky Control Bar (When Logged In) */}
      {isAdminLoggedIn && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-3 border-b border-amber-600 shadow-sm z-50">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-stone-950" />
            <span>
              🛡️ {t.adminBarText}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Administrator Game Duration Setting & Synchronized Start/Pause */}
            {!isGameStarted ? (
              <div className="flex items-center gap-1.5 bg-stone-900/90 border border-amber-600/60 rounded-xl px-2 py-1 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-200">
                  {language === 'en' ? 'Duration:' : 'Διάρκεια:'}
                </span>

                {/* Preset Chips */}
                <div className="flex items-center gap-1">
                  {[10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleDurationChange(mins)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        gameDurationMinutes === mins
                          ? 'bg-amber-500 text-stone-950 shadow-2xs'
                          : 'bg-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {mins}'
                    </button>
                  ))}
                </div>

                {/* Stepper controls */}
                <div className="flex items-center gap-1 border-l border-stone-700 pl-1.5 ml-0.5">
                  <button
                    type="button"
                    onClick={() => handleDurationChange(Math.max(1, gameDurationMinutes - 1))}
                    className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-xs cursor-pointer"
                    title="-1 min"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-black text-amber-400 w-6 text-center">
                    {gameDurationMinutes}m
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDurationChange(Math.min(180, gameDurationMinutes + 1))}
                    className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-xs cursor-pointer"
                    title="+1 min"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LiveGameTimer
                  isStarted={isGameStarted}
                  endsAtMs={gameEndsAtMs}
                  serverClockOffsetMs={serverClockOffsetMs}
                  language={language}
                  size="sm"
                  onExpire={() => {
                    setIsTimeExpired(true);
                    if (!hasDismissedExpiredModal) {
                      setShowTimeExpiredModal(true);
                    }
                  }}
                />
              </div>
            )}

            {/* Start / Pause Game for All Connected Teams */}
            {!isGameStarted ? (
              <button
                onClick={handleStartGameForAllTeams}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer ring-2 ring-emerald-300/60"
                title={
                  language === 'en'
                    ? `Simultaneously start the game for all connected teams (${gameDurationMinutes} minutes)`
                    : `Ταυτόχρονη έναρξη του παιχνιδιού για όλες τις συνδεδεμένες ομάδες (${gameDurationMinutes} λεπτά)`
                }
              >
                <span className="text-sm">▶️</span>
                <span className="tracking-wide">
                  {language === 'en' ? 'Start Game for All Teams' : 'Έναρξη παιχνιδιού για όλες τις ομάδες'}
                </span>
                <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.5 rounded font-mono font-bold">
                  {gameDurationMinutes}'
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePauseGame}
                  className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title={
                    language === 'en'
                      ? 'Pause Game (Students return to Waiting Lobby)'
                      : 'Παύση Παιχνιδιού (Επιστρέφει τους μαθητές στην Αίθουσα Αναμονής)'
                  }
                >
                  <span>⏸️</span>
                  <span>
                    {language === 'en' ? 'Pause for All Teams' : 'Παύση για όλες τις ομάδες'}
                  </span>
                </button>

                <button
                  onClick={handleResetGame}
                  className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-600/50 shadow-2xs transition-colors cursor-pointer"
                  title={language === 'en' ? 'Reset Game Timer' : 'Επαναφορά Χρονομέτρου'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reset Student Session Locks */}
            <button
              onClick={handleResetStudentLocks}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-600/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-xs"
              title={
                language === 'en'
                  ? 'Reset student locks for new classroom session'
                  : 'Επαναφορά κλειδωμάτων μαθητών για νέα τάξη'
              }
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{language === 'en' ? 'Reset Student Locks' : 'Επαναφορά Κλειδωμάτων'}</span>
            </button>

            {/* Administrator New Game Clear Button */}
            <button
              onClick={() => setIsClearGameDataOpen(true)}
              className="px-2.5 py-1 bg-rose-900/90 hover:bg-rose-900 text-rose-100 border border-rose-500/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-xs font-bold shadow-xs"
              title={
                language === 'en'
                  ? 'New Game – Clear Previous Game Data'
                  : 'Νέο παιχνίδι – Καθαρισμός προηγούμενων δεδομένων'
              }
            >
              <RotateCcw className="w-3 h-3 text-rose-300" />
              <span>
                {language === 'en'
                  ? 'New Game – Clear Previous Game Data'
                  : 'Νέο παιχνίδι – Καθαρισμός προηγούμενων δεδομένων'}
              </span>
            </button>

            <button
              onClick={handleOpenAddQuestion}
              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> {t.newQuestion}
            </button>
            <button
              onClick={() => {
                setActiveTab('teams');
              }}
              className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> {t.editTeams}
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'el' ? 'Επαναφορά αρχικών δεδομένων αναφοράς (75 ερωτήσεις)' : 'Reset to default reference data (75 questions)'}
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t.resetDefaults}
            </button>
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                if (activeTab === 'guide' || activeTab === 'pool' || activeTab === 'teams') {
                  setActiveTab('arena');
                }
              }}
              className="px-2.5 py-1 bg-stone-950 text-amber-300 hover:bg-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title={language === 'el' ? 'Έξοδος από λειτουργία διαχειριστή' : 'Exit administrator mode'}
            >
              <LogOut className="w-3.5 h-3.5" /> {t.logout}
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Header */}
      {!isAdminLoggedIn ? (
        /* Compact Student Active Gameplay Header: No large title/logo/desc, no admin login button, team identity once, single timer, language selector */
        <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            {/* Team Identity - Displayed only once */}
            <div className="flex items-center gap-2.5 min-w-0">
              {studentSelectedTeamId ? (
                (() => {
                  const tm = teams.find((t) => t.id === studentSelectedTeamId);
                  return (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">{tm?.avatar || '🦅'}</span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-black text-amber-400 truncate block">
                          {language === 'el'
                            ? `Ομάδα ${tm?.number || ''}: ${tm?.title || ''}`
                            : `Team ${tm?.number || ''}: ${tm?.titleEn || tm?.title || ''}`}
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">🦅</span>
                  <span className="text-xs sm:text-sm font-black text-amber-400">
                    {language === 'el' ? 'Ομάδα Πεδίου' : 'Field Team'}
                  </span>
                </div>
              )}
            </div>

            {/* Center/Right: The SINGLE Countdown Timer & Language Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Single Countdown Timer */}
              {isGameStarted && gameEndsAtMs && (
                <LiveGameTimer
                  isStarted={isGameStarted}
                  endsAtMs={gameEndsAtMs}
                  serverClockOffsetMs={serverClockOffsetMs}
                  language={language}
                  size="sm"
                  onExpire={() => {
                    setIsTimeExpired(true);
                    if (!hasDismissedExpiredModal) {
                      setShowTimeExpiredModal(true);
                    }
                  }}
                />
              )}

              {/* Poster Creation Shortcut - ONLY when team activities completed */}
              {isCurrentTeamActivitiesCompleted && (
                <button
                  onClick={() => handleOpenCreatePoster()}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.createPosterBtn}</span>
                </button>
              )}

              {/* Compact Language Selector (ΕΛΛΗΝΙΚΑ / ENGLISH) */}
              <div className="flex items-center bg-stone-950/80 border border-stone-700 rounded-xl p-0.5 shadow-2xs">
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
                  <span className="font-extrabold text-[11px]">ΕΛ</span>
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
                  <span className="font-extrabold text-[11px]">EN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Students - Only when team activities are completed */}
          {isCurrentTeamActivitiesCompleted && (
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
            </div>
          )}
        </header>
      ) : (
        /* Full Administrator Header with EXACT User-Requested Title, controls, and tabs */
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

              {/* 1. DEDICATED QR CODE BUTTON FOR CONNECTION (Admin only) */}
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

              {/* Quick Action: Teacher Presentation Mode (Admin) */}
              <button
                onClick={() => handleOpenPresentation(0)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={t.presentationTooltip}
              >
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.presentationBtn}</span>
              </button>

              {/* Quick Action: Admin Reports (Admin) */}
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
                  setActiveTab('pool');
                }}
                className="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border cursor-pointer bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                title={t.adminLoggedInTooltip}
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.adminBtn}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs for Administrators */}
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
              {t.tabGuide}
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto px-3 sm:px-6 ${isAdminLoggedIn ? 'py-6' : 'py-3 sm:py-4'} w-full flex-1`}>
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

            {/* Administration & Question Pool Export Actions: Full Backup, CSV, Printable Register */}
            <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-3xl border border-stone-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-stone-100 uppercase tracking-wider">
                      {language === 'el' ? 'Διαχείριση & Εξαγωγή Δεδομένων' : 'Data Management & Export Register'}
                    </h3>
                    <span className="text-[10px] bg-stone-800 text-amber-400 px-2 py-0.5 rounded-full border border-stone-700 font-mono">
                      v2.1
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {language === 'el'
                      ? 'Πλήρη αντίγραφα ασφαλείας, επίσημη εξαγωγή CSV όλων των ερωτήσεων και εκτυπώσιμο μητρώο για την τάξη.'
                      : 'Recoverable full system backups, complete question pool CSV export, and printable classroom register.'}
                  </p>
                </div>
              </div>

              {/* THREE NEW FULLY FUNCTIONAL BUTTONS */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* BUTTON 1: FULL JSON BACKUP */}
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 hover:text-white border border-stone-700 hover:border-amber-500/50 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  title={language === 'el' ? 'Πλήρες αντίγραφο ασφαλείας (JSON)' : 'Full Backup (JSON)'}
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'el' ? 'Πλήρες αντίγραφο ασφαλείας (JSON)' : 'Full Backup (JSON)'}</span>
                </button>

                {/* BUTTON 2: COMPLETE CSV EXPORT */}
                <button
                  type="button"
                  onClick={handleExportAllQuestionsCSV}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 hover:text-white border border-stone-700 hover:border-emerald-500/50 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  title={language === 'el' ? 'Εξαγωγή όλων των ερωτήσεων (CSV)' : 'Export All Questions (CSV)'}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'el' ? 'Εξαγωγή όλων των ερωτήσεων (CSV)' : 'Export All Questions (CSV)'}</span>
                </button>

                {/* BUTTON 3: PRINTABLE QUESTION REGISTER */}
                <button
                  type="button"
                  onClick={() => setIsPrintRegisterOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  title={language === 'el' ? 'Εκτύπωση λίστας ερωτήσεων' : 'Print Question Register'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'el' ? 'Εκτύπωση λίστας ερωτήσεων' : 'Print Question Register'}</span>
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

            {/* Per-Team Question Organization: Active in main list, Inactive in clearly labelled bottom section */}
            <div className="space-y-6">
              {(selectedTeamFilter === 'all'
                ? teams
                : teams.filter((t) => t.id === selectedTeamFilter)
              ).map((tm) => (
                <TeamQuestionSection
                  key={tm.id}
                  team={tm}
                  teams={teams}
                  questions={questions}
                  language={language}
                  onToggleActive={toggleQuestionActive}
                  onMoveUp={handleMoveQuestionUp}
                  onMoveDown={handleMoveQuestionDown}
                  onChangeTeam={handleChangeQuestionTeam}
                  onEditQuestion={handleOpenEditQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onTestQuestion={(q) => {
                    const idx = activeQuestions.findIndex((item) => item.id === q.id);
                    if (idx !== -1) {
                      setCurrentQuestionIndex(idx);
                      setActiveTab('arena');
                      resetQuestionState();
                    } else {
                      toggleQuestionActive(q.id);
                    }
                  }}
                  renderTypeBadge={renderTypeBadge}
                  selectedTypeFilter={selectedTypeFilter}
                  searchQuery={searchQuery}
                  selectedStatusFilter={selectedStatusFilter}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PLAY ARENA */}
        {activeTab === 'arena' && (
          <div className={isAdminLoggedIn ? "space-y-6" : "space-y-3 sm:space-y-4"}>
            {/* Administrator Simultaneous Game Control Card */}
            {isAdminLoggedIn && (
              <div
                className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm space-y-5 ${
                  isGameStarted
                    ? 'bg-emerald-950/10 border-emerald-400 text-stone-900'
                    : 'bg-white border-amber-400 text-stone-900'
                }`}
              >
                {/* Top Header & Mode Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs border ${
                        isGameStarted
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-amber-500 text-stone-950 border-amber-400'
                      }`}
                    >
                      {isGameStarted ? '🚀' : '⏱️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isGameStarted
                              ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                              : 'bg-amber-200 text-amber-900 border-amber-400'
                          }`}
                        >
                          {isGameStarted
                            ? (language === 'en' ? 'Synchronized Session Live' : 'Συγχρονισμένη Συνεδρία σε Εξέλιξη')
                            : (language === 'en' ? 'Configurable Game Duration' : 'Ρύθμιση Διάρκειας Παιχνιδιού')}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black mt-1">
                        {isGameStarted
                          ? (language === 'en' ? 'Live Arena Countdown & All Teams Status' : 'Ζωντανό Χρονόμετρο Αρένας & Κατάσταση Ομάδων')
                          : (language === 'en' ? 'Set Total Time & Start Game for All Teams' : 'Ορίστε Συνολικό Χρόνο & Έναρξη για Όλες τις Ομάδες')}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {isGameStarted
                          ? (language === 'en'
                              ? `All teams share the same start & end timestamps (${gameDurationMinutes} min total). Device clocks are synchronized.`
                              : `Όλες οι ομάδες μοιράζονται ταυτόχρονη έναρξη και λήξη (${gameDurationMinutes} λεπτά συνολικά). Όλα τα ρολόγια είναι συγχρονισμένα.`)
                          : (language === 'en'
                              ? 'Set the total time available for teams to complete their assigned questions before starting.'
                              : 'Ορίστε τον διαθέσιμο χρόνο για την ολοκλήρωση των ερωτήσεων πριν ξεκινήσετε το παιχνίδι.')}
                      </p>
                    </div>
                  </div>

                  {/* Right Action / Countdown Display */}
                  <div className="flex flex-wrap items-center gap-3">
                    {isGameStarted && (
                      <LiveGameTimer
                        isStarted={isGameStarted}
                        endsAtMs={gameEndsAtMs}
                        serverClockOffsetMs={serverClockOffsetMs}
                        language={language}
                        size="lg"
                        onExpire={() => {
                          setIsTimeExpired(true);
                          if (!hasDismissedExpiredModal) {
                            setShowTimeExpiredModal(true);
                          }
                        }}
                      />
                    )}

                    {!isGameStarted ? (
                      <button
                        onClick={handleStartGameForAllTeams}
                        className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/50"
                      >
                        <span className="text-base">▶️</span>
                        <span>{language === 'en' ? 'Start Game for All Teams' : 'Έναρξη παιχνιδιού για όλες τις ομάδες'}</span>
                        <span className="text-xs bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded-lg font-mono">
                          {gameDurationMinutes}'
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={handlePauseGame}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>⏸️</span>
                          <span>{language === 'en' ? 'Pause for All Teams' : 'Παύση για όλες τις ομάδες'}</span>
                        </button>
                        <button
                          onClick={handleResetGame}
                          className="px-3 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title={language === 'en' ? 'Reset Timer & Lobby' : 'Επαναφορά Χρονομέτρου & Αναμονής'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Reset' : 'Επαναφορά'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Configuration Section (When Not Started) */}
                {!isGameStarted && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                          {language === 'en' ? 'Configure Duration (Minutes):' : 'Ρύθμιση Διάρκειας (Λεπτά):'}
                        </span>
                      </div>

                      {/* Confirmation badge */}
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                        {language === 'en'
                          ? `⏱️ Selected duration: ${gameDurationMinutes} minutes`
                          : `⏱️ Επιλεγμένη διάρκεια: ${gameDurationMinutes} λεπτά`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Presets */}
                      <span className="text-[11px] text-stone-500 font-bold uppercase mr-1">
                        {language === 'en' ? 'Presets:' : 'Επιλογές:'}
                      </span>
                      {[5, 10, 15, 20, 30, 45].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleDurationChange(preset)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            gameDurationMinutes === preset
                              ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/40'
                              : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {preset} {language === 'en' ? 'min' : 'λεπ'}
                        </button>
                      ))}

                      {/* Stepper +/- */}
                      <div className="flex items-center gap-1.5 ml-auto bg-white border border-stone-300 rounded-xl px-2 py-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleDurationChange(Math.max(1, gameDurationMinutes - 1))}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={gameDurationMinutes}
                          onChange={(e) => handleDurationChange(parseInt(e.target.value, 10) || 1)}
                          className="w-14 text-center font-mono font-black text-sm text-stone-900 border-none focus:outline-none"
                        />
                        <span className="text-xs text-stone-500 font-bold pr-1">
                          {language === 'en' ? 'min' : 'λεπ'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDurationChange(Math.min(180, gameDurationMinutes + 1))}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-Time Status of All 4 Teams (Visible during or after start) */}
                {isGameStarted && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'en' ? 'Live Status of All Teams' : 'Κατάσταση Όλων των Ομάδων σε Πραγματικό Χρόνο'}</span>
                      </h4>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {language === 'en' ? 'Auto-updating via SSE' : 'Αυτόματη ζωντανή ενημέρωση'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {teams.map((tm) => {
                        const progress = allTeamsProgress[tm.id];
                        const teamQuestions = questions.filter(
                          (q) => q.isActive && q.assignedTeamIds.includes(tm.id)
                        );
                        const totalAssigned = teamQuestions.length || 1;
                        const answered = progress?.answeredCount || 0;
                        const teamScore = progress?.score || 0;
                        const percent = Math.min(100, Math.round((answered / totalAssigned) * 100));

                        return (
                          <div
                            key={tm.id}
                            className="bg-white border rounded-2xl p-3.5 space-y-2.5 shadow-2xs"
                            style={{ borderLeftColor: tm.color, borderLeftWidth: '5px' }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{tm.avatar}</span>
                                <div>
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase text-white inline-block"
                                    style={{ backgroundColor: tm.color }}
                                  >
                                    {language === 'en' ? `Team ${tm.number}` : `Ομάδα ${tm.number}`}
                                  </span>
                                  <h5 className="text-xs font-black text-stone-900 truncate max-w-[120px]">
                                    {language === 'en' ? tm.titleEn || tm.title : tm.title}
                                  </h5>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-black text-amber-600">
                                {teamScore} {language === 'en' ? 'pts' : 'πτ'}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-stone-500">
                                <span>{language === 'en' ? 'Completed:' : 'Ολοκληρώθηκαν:'}</span>
                                <span className="font-mono font-bold text-stone-800">
                                  {answered}/{totalAssigned} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    backgroundColor: tm.color,
                                    width: `${percent}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Join QR Banner (Admin only) */}
            {isAdminLoggedIn && (
              <div className="p-4 bg-linear-to-r from-emerald-600/10 via-teal-600/15 to-emerald-600/10 rounded-3xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    📱
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <span>{t.qrCalloutTitle}</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      {t.qrCalloutDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsJoinQROpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  {t.openQrBtn}
                </button>
              </div>
            )}

            {/* Quest Completion Callout for Poster Creation (Visible for admin) */}
            {isAdminLoggedIn && answeredCount > 0 && (
              <div className="p-4 bg-linear-to-r from-amber-500/10 via-amber-500/20 to-emerald-500/10 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      {t.answersSoFar.replace('{count}', String(answeredCount)).replace('{score}', String(score))}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {t.answersCalloutDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCreatePoster(selectedTeamFilter !== 'all' ? selectedTeamFilter : undefined)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  {t.createTeamPoster}
                </button>
              </div>
            )}

            {/* STUDENT LIVE SYNCHRONIZED COUNTDOWN & MISSION STATUS (Shown in full for Administrator) */}
            {isAdminLoggedIn && isGameStarted && gameEndsAtMs && (
              <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 border-2 border-amber-500/50 shadow-xl flex flex-wrap items-center justify-between gap-4 sticky top-14 z-30 backdrop-blur-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {studentSelectedTeamId ? teams.find((t) => t.id === studentSelectedTeamId)?.avatar || '🦅' : '🦅'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {language === 'en' ? 'Synchronized Arena Countdown' : 'Συγχρονισμένη Αντίστροφη Μέτρηση'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {studentSelectedTeamId
                        ? (language === 'en'
                            ? teams.find((t) => t.id === studentSelectedTeamId)?.titleEn || teams.find((t) => t.id === studentSelectedTeamId)?.title
                            : teams.find((t) => t.id === studentSelectedTeamId)?.title)
                        : (language === 'en' ? 'All Teams Live' : 'Όλες οι Ομάδες')}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Current Points & Progress (Admin only during gameplay) */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {language === 'en' ? 'Points Earned' : 'Συνολικοί Πόντοι'}
                    </span>
                    <span className="text-sm sm:text-base font-mono font-black text-amber-400">
                      {score} <span className="text-xs font-normal text-stone-300">{language === 'en' ? 'pts' : 'πτ'}</span>
                    </span>
                  </div>

                  {/* Real-Time Live Countdown Timer */}
                  <LiveGameTimer
                    isStarted={isGameStarted}
                    endsAtMs={gameEndsAtMs}
                    serverClockOffsetMs={serverClockOffsetMs}
                    language={language}
                    size="lg"
                    onExpire={() => {
                      setIsTimeExpired(true);
                      if (!hasDismissedExpiredModal) {
                        setShowTimeExpiredModal(true);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {!isAdminLoggedIn && isCurrentTeamActivitiesCompleted && !isFeedbackPeriodActive ? (
              /* Student Team Completion Screen */
              <div className="bg-white rounded-3xl border-2 border-amber-400 p-8 sm:p-12 text-center shadow-lg space-y-6 max-w-2xl mx-auto my-6 sm:my-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-md">
                  🎉
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
                    {studentSelectedTeamId ? (
                      <>
                        <span>{teams.find((t) => t.id === studentSelectedTeamId)?.avatar || '🦅'}</span>
                        <span>
                          {language === 'en'
                            ? teams.find((t) => t.id === studentSelectedTeamId)?.titleEn || teams.find((t) => t.id === studentSelectedTeamId)?.title
                            : teams.find((t) => t.id === studentSelectedTeamId)?.title}
                        </span>
                      </>
                    ) : (
                      <span>🦅</span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
                    {language === 'el'
                      ? 'Συγχαρητήρια! Ολοκληρώσατε όλες τις αποστολές σας!'
                      : 'Congratulations! You have completed all your missions!'}
                  </h2>

                  <p className="text-sm sm:text-base text-stone-600 font-medium max-w-md mx-auto">
                    {language === 'el'
                      ? 'Όλες οι ερωτήσεις και οι δραστηριότητες πεδίου της ομάδας σας καταγράφηκαν με επιτυχία.'
                      : 'All field questions and activities for your team have been successfully completed.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (studentSelectedTeamId) {
                        setSelectedPosterTeamId(studentSelectedTeamId);
                      }
                      setActiveTab('posters');
                    }}
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2.5 cursor-pointer"
                  >
                    <Palette className="w-5 h-5 text-stone-950" />
                    <span>
                      {language === 'el'
                        ? 'Δείτε την αφίσα της ομάδας σας'
                        : 'View your team poster'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filter & Navigation Bar */}
                <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-3 ${
              isAdminLoggedIn ? 'p-4 flex-col md:flex-row' : 'px-4 py-2.5'
            }`}>
              {isAdminLoggedIn ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" /> {t.filterTeam}
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
                    <option value="all">{t.allTeamsOption}</option>
                    {teams.map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.avatar}{' '}
                        {language === 'el'
                          ? `Ομάδα ${tm.number}: ${tm.title}`
                          : `Team ${tm.number}: ${tm.titleEn || tm.title}`}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedTypeFilter}
                    disabled={!isAdminLoggedIn && isFeedbackPeriodActive}
                    onChange={(e) => {
                      setSelectedTypeFilter(e.target.value);
                      setCurrentQuestionIndex(0);
                      resetQuestionState();
                    }}
                    className={`text-xs sm:text-sm bg-stone-100 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      !isAdminLoggedIn && isFeedbackPeriodActive ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="all">{t.allQuestionTypes}</option>
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
              ) : (
                /* Student: Clear, prominent Question X of Y indicator */
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-stone-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                    {t.questionOf
                      .replace('{current}', String(activeQuestions.length > 0 ? currentQuestionIndex + 1 : 0))
                      .replace('{total}', String(activeQuestions.length))}
                  </span>
                </div>
              )}

              {/* Arena Navigation Counter & Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 ml-auto">
                {isAdminLoggedIn && (
                  <span className="text-xs text-stone-500">
                    {t.questionOf
                      .replace('{current}', String(activeQuestions.length > 0 ? currentQuestionIndex + 1 : 0))
                      .replace('{total}', String(activeQuestions.length))}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeQuestions.length <= 1 || (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      activeQuestions.length <= 1 || (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive))
                        ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed opacity-40'
                        : 'border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer'
                    }`}
                  >
                    {t.previous}
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={activeQuestions.length <= 1 || (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      activeQuestions.length <= 1 || (!isAdminLoggedIn && (!isAnswerSubmitted || isFeedbackPeriodActive))
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-40'
                        : 'bg-stone-900 text-stone-100 hover:bg-stone-800 cursor-pointer'
                    }`}
                  >
                    {t.next} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question Interactive Card */}
            {currentQ ? (() => {
              const activeQ = localizedCurrentQ || currentQ;
              return (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
                {/* Header Strip - Streamlined for students, full metadata preserved for administrators */}
                <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderTypeBadge(activeQ.type)}
                    {isAdminLoggedIn && activeQ.missionTitle && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-700" />
                        <span>{activeQ.missionTitle}</span>
                      </span>
                    )}
                    {isAdminLoggedIn && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        +{activeQ.points} {language === 'el' ? 'Πόντοι' : 'Points'}
                      </span>
                    )}
                    {activeQ.mediaUrl && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        {activeQ.mediaType === 'video' ? <Video className="w-3 h-3 text-blue-600" /> : <Camera className="w-3 h-3 text-blue-600" />}
                        {activeQ.mediaType === 'video' ? t.mediaTypeVideo : t.mediaTypeImage}
                      </span>
                    )}
                    {isAdminLoggedIn && activeQ.locationFocus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activeQ.locationFocus === 'Cyprus' ? (language === 'el' ? 'Κύπρος' : 'Cyprus') : activeQ.locationFocus === 'Greece' ? (language === 'el' ? 'Ελλάδα' : 'Greece') : (language === 'el' ? 'Κύπρος & Ελλάδα' : 'Cyprus & Greece')}
                      </span>
                    )}

                    {/* Admin quick edit for this question */}
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => handleOpenEditQuestion(currentQ)}
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-950 flex items-center gap-1 transition-colors ml-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> {language === 'el' ? 'Επεξεργασία' : 'Edit'}
                      </button>
                    )}

                    {/* Admin Live Synchronized Countdown inside Question Header */}
                    {isAdminLoggedIn && isGameStarted && gameEndsAtMs && (
                      <LiveGameTimer
                        isStarted={isGameStarted}
                        endsAtMs={gameEndsAtMs}
                        serverClockOffsetMs={serverClockOffsetMs}
                        language={language}
                        size="sm"
                        onExpire={() => {
                          setIsTimeExpired(true);
                          setShowTimeExpiredModal(true);
                        }}
                      />
                    )}
                  </div>

                  {/* Assigned Teams Badges - Admin only to avoid duplication for students */}
                  {isAdminLoggedIn && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-stone-400">{language === 'el' ? 'Ομάδα:' : 'Team:'}</span>
                      {activeQ.assignedTeamIds.map((teamId) => {
                        const tm = teams.find((item) => item.id === teamId);
                        return tm ? (
                          <span
                            key={tm.id}
                            className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${tm.badgeColor}`}
                            title={language === 'en' ? (tm.sloganEn || tm.slogan) : tm.slogan}
                          >
                            {tm.avatar} {language === 'en' ? (tm.titleEn || tm.title) : tm.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Question Body */}
                <div className={`space-y-5 sm:space-y-6 ${isAdminLoggedIn ? 'p-6 sm:p-8' : 'p-4 sm:p-6'}`}>
                  <div>
                    {activeQ.missionTitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-black uppercase tracking-wider mb-2.5">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'el' ? 'Αποστολή: ' : 'Mission: '}{activeQ.missionTitle}</span>
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                      {activeQ.title}
                    </h2>
                    {activeQ.instruction && (
                      <p className="mt-2 text-sm text-stone-600 italic">
                        💡 {activeQ.instruction}
                      </p>
                    )}

                    {/* Notice if time expired */}
                    {isTimeExpired && (
                      <div className="mt-3 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
                        <div className="text-xs">
                          <span className="font-black block uppercase tracking-wider text-rose-800">
                            {language === 'en' ? 'Time Expired • Game Ended' : 'Ο Χρόνος Έληξε • Λήξη Αποστολής'}
                          </span>
                          <span className="text-stone-700">
                            {language === 'en'
                              ? 'Your submitted answers and score have been preserved. No further changes can be submitted.'
                              : 'Όλες οι καταχωρημένες απαντήσεις και η βαθμολογία σας έχουν διατηρηθεί με ασφάλεια. Δεν γίνονται δεκτές νέες υποβολές.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attached Media Presentation (Photo or Video) */}
                  {/* For standard questions, show attached media. For QR stations, educational material is shown after QR code verification or for admin preview. */}
                  {resolvedStationMediaUrl && (activeQ.type !== 'qr_scan' || isAdminLoggedIn) && (
                    <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 shadow-md">
                      {resolvedStationMediaType === 'video' ? (
                        isYouTubeUrl(resolvedStationMediaUrl) ? (
                          <div className="aspect-video w-full max-h-96">
                            <iframe
                              src={getYouTubeEmbedUrl(resolvedStationMediaUrl)}
                              title={language === 'el' ? 'Εκπαιδευτικό Βίντεο Αποστολής' : 'Mission Educational Video'}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <video
                            src={resolvedStationMediaUrl}
                            controls
                            className="w-full max-h-96 mx-auto bg-black"
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center p-3 bg-stone-900/60">
                          <img
                            src={resolvedStationMediaUrl}
                            alt={activeQ.title}
                            className="max-h-80 w-auto object-contain rounded-xl shadow-xs"
                          />
                          <p className="text-[11px] text-stone-300 mt-2 italic text-center flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>{language === 'el' ? 'Επισυναπτόμενο φωτογραφικό υλικό παρατήρησης πεδίου' : 'Attached field observation photographic material'}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE INPUTS BY QUESTION TYPE */}

                  {/* 1. Multiple Choice Single */}
                  {activeQ.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 gap-3">
                      {(activeQ as MultipleChoiceQuestion).options.map((option) => {
                        const isSelected = userSingleChoice === option.id;
                        const isCorrect = (activeQ as MultipleChoiceQuestion).correctAnswer === option.id;

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
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${style}`}
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
                  {activeQ.type === 'multiple_choice_multi' && (
                    <div className="space-y-3">
                      <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                        {t.selectMultiplePrompt}
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {(activeQ as MultipleChoiceMultiQuestion).options.map((option) => {
                          const isSelected = userMultiChoice.includes(option.id);
                          const isCorrect = (activeQ as MultipleChoiceMultiQuestion).correctAnswers.includes(option.id);

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
                              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${style}`}
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
                  {activeQ.type === 'true_false' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { val: true, label: t.trueLabel, color: 'emerald' },
                        { val: false, label: t.falseLabel, color: 'rose' },
                      ].map((item) => {
                        const isSelected = userTrueFalse === item.val;
                        const isCorrect = (activeQ as TrueFalseQuestion).correctAnswer === item.val;

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
                            className={`p-6 rounded-2xl border text-center font-bold text-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${style}`}
                          >
                            <span>{item.label}</span>
                            {isAnswerSubmitted && isCorrect && (
                              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                                {t.correctAnswerBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. Text Matching */}
                  {activeQ.type === 'text_matching' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                        {t.selectMatchingInstruction}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            {(activeQ as TextMatchingQuestion).leftHeader || t.columnA}
                          </h4>
                          {(activeQ as TextMatchingQuestion).pairs.map((p) => {
                            const isMatched = Boolean(userMatches[p.id]);
                            const isCurrentSelected = userSelectedLeft === p.id;
                            return (
                              <button
                                key={p.id}
                                disabled={isAnswerSubmitted}
                                onClick={() => setUserSelectedLeft(p.id)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
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
                            {(activeQ as TextMatchingQuestion).rightHeader || t.columnB}
                          </h4>
                          {(activeQ as TextMatchingQuestion).pairs.map((p) => {
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
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
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
                  {activeQ.type === 'image_matching' && (
                    <div className="space-y-4">
                      {(activeQ as ImageMatchingQuestion).promptDescription && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-sm">
                          <strong>{t.visualDescriptionTitle}</strong>{' '}
                          {(activeQ as ImageMatchingQuestion).promptDescription}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(activeQ as ImageMatchingQuestion).options.map((opt) => {
                          const isSelected = userImageChoice === opt.id;
                          const isCorrect = (activeQ as ImageMatchingQuestion).correctAnswer === opt.id;

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
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${style}`}
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
                  {activeQ.type === 'qr_scan' && (() => {
                    const qrExpected = (activeQ as QRScanQuestion).qrPayload?.trim().toUpperCase() || '';
                    const enteredQrClean = userQrInput.trim().toUpperCase();
                    const isQrValidMatch = enteredQrClean.length > 0 && enteredQrClean === qrExpected;
                    const isStationUnlocked = isQrValidMatch || isAnswerSubmitted;
                    const isQrInvalid = enteredQrClean.length > 0 && enteredQrClean !== qrExpected && !isAnswerSubmitted;

                    return (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-5">
                        {/* Admin Educational Material Management Bar (visible to admins) */}
                        {isAdminLoggedIn && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-900 flex items-center gap-1">
                                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                                {language === 'el' ? 'Διαχείριση Εκπαιδευτικού Υλικού Σταθμού:' : 'Station Educational Media Admin:'}
                              </span>
                              {resolvedStationMediaUrl ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {resolvedStationMediaType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                                  {resolvedStationMediaType === 'video'
                                    ? (language === 'el' ? 'Εκπαιδευτικό Βίντεο Συνδεδεμένο' : 'Educational Video Linked')
                                    : (language === 'el' ? 'Εκπαιδευτική Εικόνα Συνδεδεμένη' : 'Educational Image Linked')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-200 text-stone-700">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  {language === 'el' ? 'Δεν έχει οριστεί υλικό' : 'No media configured'}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => currentQ && handleOpenEditQuestion(currentQ)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs text-xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>{language === 'el' ? 'Μεταφόρτωση / Επεξεργασία Υλικού Σταθμού' : 'Upload / Edit Station Media'}</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center text-rose-700 shrink-0">
                            <QrCode className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 text-base">
                              {(activeQ as QRScanQuestion).stationName}
                            </h4>
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {(activeQ as QRScanQuestion).stationLocation}
                            </p>
                            <p className="mt-2 text-xs bg-white p-2.5 rounded-lg border border-stone-200 text-stone-700">
                              🔍 <strong>{language === 'el' ? 'Ένδειξη Πεδίου:' : 'Field Clue:'}</strong> {(activeQ as QRScanQuestion).fieldClue}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            {t.qrScanLabel}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              disabled={isAnswerSubmitted}
                              value={userQrInput}
                              onChange={(e) => setUserQrInput(e.target.value)}
                              placeholder="π.χ. VA-STATION-EPISKOPI-CLIFFS-2026"
                              className={`flex-1 text-sm bg-white border rounded-xl px-4 py-2 font-mono text-stone-900 focus:outline-none focus:ring-2 uppercase ${
                                isQrInvalid
                                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40'
                                  : isQrValidMatch
                                  ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/40'
                                  : 'border-stone-300 focus:ring-rose-500'
                              }`}
                            />
                            <button
                              type="button"
                              disabled={isAnswerSubmitted}
                              onClick={() => setIsQRScannerOpen(true)}
                              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <Camera className="w-4 h-4" />
                              <span>{t.autoScanQr}</span>
                            </button>
                          </div>

                          {/* Instructions for students (no expected token revealed) */}
                          {!isAdminLoggedIn ? (
                            <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>
                                {language === 'el'
                                  ? 'Εντοπίστε την πινακίδα του σταθμού στο πεδίο και σαρώστε τον κωδικό QR με την κάμερα ή πληκτρολογήστε τον κωδικό.'
                                  : 'Locate the station marker in the field and scan the QR code with your camera or enter the token.'}
                              </span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-stone-400 mt-1">
                              {t.expectedToken} <code className="text-stone-600 font-mono">{(activeQ as QRScanQuestion).qrPayload}</code>
                            </p>
                          )}

                          {/* Invalid QR Token Alert (Does NOT reveal or display educational media) */}
                          {isQrInvalid && (
                            <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block">
                                  {language === 'el' ? 'Μη έγκυρος κωδικός σταθμού' : 'Invalid station QR token'}
                                </span>
                                <span>
                                  {language === 'el'
                                    ? 'Ο κωδικός QR που καταχωρήθηκε δεν αντιστοιχεί σε αυτόν τον σταθμό πεδίου. Παρακαλούμε ελέγξτε την πινακίδα του σταθμού και σαρώστε ξανά.'
                                    : 'The scanned/entered QR token does not match this field station. Please check the physical station marker and scan again.'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Automatic Educational Media Display upon successful QR verification */}
                        {isStationUnlocked && (
                          <div className="pt-2 border-t border-stone-200 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                  {language === 'el'
                                    ? '✓ Επιτυχής Ταυτοποίηση Σταθμού! Το εκπαιδευτικό υλικό ξεκλειδώθηκε:'
                                    : '✓ Station Identified Successfully! Educational material unlocked:'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setUserQrInput('')}
                                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                              >
                                {language === 'el' ? 'Κλείσιμο υλικού' : 'Close media'}
                              </button>
                            </div>

                            {resolvedStationMediaUrl ? (
                              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 shadow-md">
                                {resolvedStationMediaType === 'video' ? (
                                  isYouTubeUrl(resolvedStationMediaUrl) ? (
                                    <div className="aspect-video w-full max-h-96">
                                      <iframe
                                        src={getYouTubeEmbedUrl(resolvedStationMediaUrl)}
                                        title={(activeQ as QRScanQuestion).stationName}
                                        className="w-full h-full"
                                        allowFullScreen
                                      />
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-stone-950 flex flex-col items-center">
                                      <video
                                        src={resolvedStationMediaUrl}
                                        controls
                                        playsInline
                                        className="w-full max-h-96 mx-auto rounded-xl bg-black shadow-inner"
                                      />
                                      <p className="text-[11px] text-stone-300 mt-2 flex items-center gap-1">
                                        <Video className="w-3.5 h-3.5 text-amber-400" />
                                        <span>
                                          {language === 'el'
                                            ? 'Εκπαιδευτικό βίντεο σταθμού πεδίου - Παρακολουθήστε προσεκτικά για την ολοκλήρωση της αποστολής'
                                            : 'Field station educational video - Watch carefully to complete your mission'}
                                        </span>
                                      </p>
                                    </div>
                                  )
                                ) : (
                                  <div className="flex flex-col items-center p-3 bg-stone-900/70">
                                    <img
                                      src={resolvedStationMediaUrl}
                                      alt={(activeQ as QRScanQuestion).stationName}
                                      className="max-h-96 w-auto object-contain rounded-xl shadow-md"
                                    />
                                    <p className="text-[11px] text-stone-300 mt-2 italic text-center flex items-center gap-1">
                                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                                      <span>
                                        {language === 'el'
                                          ? 'Εκπαιδευτικό φωτογραφικό υλικό σταθμού πεδίου'
                                          : 'Field station educational photographic material'}
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 text-xs flex items-center gap-2">
                                <Info className="w-4 h-4 text-stone-500 shrink-0" />
                                <span>
                                  {language === 'el'
                                    ? 'Ο κωδικός σταθμού επαληθεύτηκε επιτυχώς. Δεν έχει μεταφορτωθεί επιπρόσθετο εκπαιδευτικό βίντεο ή φωτογραφία για αυτόν τον σταθμό από τον εκπαιδευτικό.'
                                    : 'Station token verified successfully. No additional educational video or photo has been uploaded for this station yet by the administrator.'}
                                </span>
                              </div>
                            )}

                            {/* Explicit Action to Continue after studying the station material */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                              <p className="text-xs text-stone-600">
                                {language === 'el'
                                  ? 'Παρακολουθήστε το εκπαιδευτικό υλικό. Όταν είστε έτοιμοι, πατήστε συνέχεια για την επόμενη αποστολή.'
                                  : 'Explore the educational material. When ready, proceed to the next mission.'}
                              </p>
                              <button
                                type="button"
                                onClick={handleCompleteStationAndContinue}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{language === 'el' ? 'Συνέχεια στην Επόμενη Αποστολή' : 'Continue to Next Mission'}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Live Camera-Based QR Code Scanner Modal */}
                        {isQRScannerOpen && (
                          <QRCameraScanner
                            expectedToken={(activeQ as QRScanQuestion).qrPayload}
                            language={language}
                            onScanSuccess={(decodedToken) => {
                              setUserQrInput(decodedToken);
                              setIsQRScannerOpen(false);
                            }}
                            onClose={() => setIsQRScannerOpen(false)}
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* 7. Photo Upload Challenge & Team Reflection Activity */}
                  {activeQ.type === 'photo_upload' && (
                    <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 border border-teal-300 rounded-2xl flex items-center justify-center text-teal-700 shrink-0">
                          {isReflectionQuestion(activeQ) ? (
                            <Sparkles className="w-6 h-6 text-amber-600" />
                          ) : (
                            <Camera className="w-6 h-6" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-teal-950 text-base">
                            {isReflectionQuestion(activeQ)
                              ? (language === 'en' ? 'Team Reflection Activity' : 'Δραστηριότητα Αναστοχασμού Ομάδας')
                              : t.photoChallengeTitle}
                          </h4>
                          <p className="text-xs text-teal-800">
                            {(activeQ as PhotoUploadQuestion).taskPrompt}
                          </p>
                        </div>
                      </div>

                      {/* VISIBLE EDITABLE TEXTAREA (Directly below reflection instructions and before field photography section) */}
                      {isReflectionQuestion(activeQ) && (
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-2xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor="team-reflection-textarea"
                              className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                {language === 'en'
                                  ? 'Team Reflection & Conclusion:'
                                  : 'Αναστοχασμός & Συμπέρασμα Ομάδας:'}
                              </span>
                            </label>
                            {userReflectionText.trim().length > 0 && (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {language === 'en' ? 'Draft preserved' : 'Αποθηκευμένο'}
                              </span>
                            )}
                          </div>

                          <textarea
                            id="team-reflection-textarea"
                            rows={4}
                            disabled={isAnswerSubmitted}
                            value={userReflectionText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserReflectionText(val);
                              setReflectionDrafts((prev) => {
                                const updated = { ...prev, [activeQ.id]: val };
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('vulture_reflection_drafts_v1', JSON.stringify(updated));
                                }
                                return updated;
                              });
                            }}
                            placeholder={
                              language === 'en'
                                ? 'Write what impressed you most and what you learned about the Griffon Vulture in Cyprus…'
                                : 'Γράψτε εδώ τι σας εντυπωσίασε περισσότερο και τι μάθατε για τον γύπα πυρόχρου στην Κύπρο…'
                            }
                            className="w-full p-3.5 sm:p-4 text-xs sm:text-sm text-stone-900 bg-amber-50/20 border border-stone-300 focus:border-amber-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed placeholder:text-stone-400 resize-y transition-all"
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-0.5">
                            <span>
                              {language === 'en'
                                ? '💡 Automatically featured in the “Something that impressed us:” section on your team poster.'
                                : '💡 Εμφανίζεται αυτόματα στην ενότητα «Κάτι που μας εντυπωσίασε:» στην αφίσα της ομάδας σας.'}
                            </span>
                            <span className="font-mono text-stone-400">
                              {userReflectionText.trim().length} {language === 'en' ? 'chars' : 'χαρ.'}
                            </span>
                          </div>
                        </div>
                      )}


                      {/* Photo Capture & Upload Controls (Only for authentic photo challenges, completely omitted for reflection questions) */}
                      {!isReflectionQuestion(activeQ) && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Option 1: Take Photo directly via device camera */}
                            <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs ${
                              isAnswerSubmitted ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                            }`}>
                              <Camera className="w-4 h-4" />
                              <span>{t.takePhoto}</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                disabled={isAnswerSubmitted}
                                className="hidden"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const compressedDataUrl = await compressAndResizeImage(file, 1200, 0.82);
                                    if (compressedDataUrl) {
                                      setUserUploadedDataUrl(compressedDataUrl);
                                      setUserUploadedFile(file.name || 'camera-capture.jpg');
                                    }
                                  }
                                }}
                              />
                            </label>

                            {/* Option 2: Choose from Gallery */}
                            <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs ${
                              isAnswerSubmitted ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                            }`}>
                              <ImageIcon className="w-4 h-4" />
                              <span>{t.chooseFromGallery}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isAnswerSubmitted}
                                className="hidden"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const compressedDataUrl = await compressAndResizeImage(file, 1200, 0.82);
                                    if (compressedDataUrl) {
                                      setUserUploadedDataUrl(compressedDataUrl);
                                      setUserUploadedFile(file.name);
                                    }
                                  }
                                }}
                              />
                            </label>

                            {userUploadedFile && (
                              <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-3 py-1.5 rounded-full border border-teal-200 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-teal-600" />
                                <span>{t.selectedFile} {userUploadedFile}</span>
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
                                  {t.authenticPhotoEvidence}
                                </span>
                                <span className="text-[11px] text-teal-700 block truncate">
                                  {t.willLinkToPoster}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 8. Video Upload Challenge */}
                  {activeQ.type === 'video_upload' && (
                    <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 border border-orange-300 rounded-2xl flex items-center justify-center text-orange-700 shrink-0">
                          <Video className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-orange-950 text-base">
                              {t.videoChallengeTitle}
                            </h4>
                            <span className="text-xs bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-semibold">
                              {t.upToDuration.replace('{seconds}', String((activeQ as VideoUploadQuestion).durationSecondsMax || 60))}
                            </span>
                          </div>
                          <p className="text-xs text-orange-900">
                            {(activeQ as VideoUploadQuestion).taskPrompt}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-orange-100 space-y-2">
                        <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          {t.videoCriteriaTitle}
                        </h5>
                        <ul className="text-xs text-stone-600 space-y-1">
                          {(activeQ as VideoUploadQuestion).verificationCriteria?.map((c, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition-colors ${
                          isAnswerSubmitted ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                        }`}>
                          <Video className="w-4 h-4" />
                          {userUploadedFile ? t.changeVideo : t.chooseVideo}
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isAnswerSubmitted}
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
                            {t.videoReady} {userUploadedFile}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission & Action Bar */}
                  <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                    {activeQ.type === 'qr_scan' ? (
                      (() => {
                        const qrExpected = (activeQ as QRScanQuestion).qrPayload?.trim().toUpperCase() || '';
                        const enteredQrClean = userQrInput.trim().toUpperCase();
                        const isQrValidMatch = enteredQrClean.length > 0 && enteredQrClean === qrExpected;
                        const isStationUnlocked = isQrValidMatch || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id));

                        return isStationUnlocked ? (
                          <button
                            onClick={handleCompleteStationAndContinue}
                            className="px-6 py-3 font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{language === 'en' ? 'Continue to Next Mission' : 'Συνέχεια στην Επόμενη Αποστολή'}</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsQRScannerOpen(true)}
                            className="px-6 py-3 font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            <Camera className="w-5 h-5" />
                            <span>{language === 'en' ? 'Scan Station QR Code' : 'Σάρωση QR Σταθμού'}</span>
                          </button>
                        );
                      })()
                    ) : (
                      <button
                        disabled={
                          isAnswerSubmitted ||
                          isTimeExpired ||
                          (!isAdminLoggedIn && isFeedbackPeriodActive) ||
                          !isAnswerSelected ||
                          Boolean(currentQ && submittedQuestionIds.includes(currentQ.id))
                        }
                        onClick={handleSubmitAnswer}
                        title={
                          !isAnswerSubmitted && !isAnswerSelected && !Boolean(currentQ && submittedQuestionIds.includes(currentQ.id))
                            ? (language === 'en' ? 'Please select or provide an answer first' : 'Παρακαλούμε επιλέξτε πρώτα μία απάντηση')
                            : undefined
                        }
                        className={`px-6 py-3 font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                          isTimeExpired
                            ? 'bg-stone-400 text-stone-200 cursor-not-allowed'
                            : (isAnswerSubmitted || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                            ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                            : !isAnswerSelected
                            ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                            : 'bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {isTimeExpired
                          ? (language === 'en' ? 'Time Expired (Closed)' : 'Ο χρόνος έληξε (Κλειστό)')
                          : (isAnswerSubmitted || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                          ? (language === 'en' ? 'Answer Submitted' : 'Απάντηση Καταχωρήθηκε')
                          : !isAnswerSelected
                          ? (language === 'en' ? 'Select an Answer' : 'Επιλέξτε Απάντηση')
                          : t.submitAnswer}
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetQuestion}
                        disabled={!isAdminLoggedIn && (isAnswerSubmitted || isFeedbackPeriodActive || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                          !isAdminLoggedIn && (isAnswerSubmitted || isFeedbackPeriodActive || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                            ? 'text-stone-400 border border-stone-200 bg-stone-50 cursor-not-allowed opacity-40'
                            : 'text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100 cursor-pointer'
                        }`}
                        title={
                          !isAdminLoggedIn && (isAnswerSubmitted || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                            ? (language === 'en' ? 'Answer already submitted' : 'Η απάντηση έχει ήδη καταχωρηθεί')
                            : undefined
                        }
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.resetButton}
                      </button>
                      <button
                        onClick={activeQ.type === 'qr_scan' ? handleCompleteStationAndContinue : handleNextQuestion}
                        disabled={
                          activeQ.type === 'qr_scan'
                            ? !isAdminLoggedIn && !(userQrInput.trim().toUpperCase() === ((activeQ as QRScanQuestion).qrPayload?.trim().toUpperCase()) || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                            : !isAdminLoggedIn && (!isAnswerSubmitted && !Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)) || isFeedbackPeriodActive)
                        }
                        className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                          activeQ.type === 'qr_scan'
                            ? (!isAdminLoggedIn && !(userQrInput.trim().toUpperCase() === ((activeQ as QRScanQuestion).qrPayload?.trim().toUpperCase()) || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-40'
                                : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer')
                            : (!isAdminLoggedIn && (!isAnswerSubmitted && !Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)) || isFeedbackPeriodActive)
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-40'
                                : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer')
                        }`}
                        title={
                          activeQ.type === 'qr_scan' && !isAdminLoggedIn && !(userQrInput.trim().toUpperCase() === ((activeQ as QRScanQuestion).qrPayload?.trim().toUpperCase()) || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id)))
                            ? (language === 'en' ? 'Scan station QR code to unlock and continue' : 'Σαρώστε τον κωδικό QR του σταθμού για να συνεχίσετε')
                            : !isAdminLoggedIn && !isAnswerSubmitted && !Boolean(currentQ && submittedQuestionIds.includes(currentQ.id))
                            ? (language === 'en' ? 'Submit your answer before continuing' : 'Υποβάλετε πρώτα την απάντηση για να συνεχίσετε')
                            : !isAdminLoggedIn && isFeedbackPeriodActive
                            ? (language === 'en' ? 'Reviewing explanation (auto-advancing)...' : 'Ανάγνωση επεξήγησης (αυτόματη μετάβαση)...')
                            : undefined
                        }
                      >
                        {t.nextMissionBtn} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scientific Explanation Card (Visible upon submission for standard questions) */}
                  {activeQ.type !== 'qr_scan' && (isAnswerSubmitted || Boolean(currentQ && submittedQuestionIds.includes(currentQ.id))) && (
                    <div
                      className={`p-6 rounded-2xl border transition-all ${
                        (currentQ && submittedAnswers[currentQ.id] !== undefined
                          ? submittedAnswers[currentQ.id].isCorrect
                          : isAnswerCorrect)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-base mb-2">
                        <div className="flex items-center gap-2">
                          {(currentQ && submittedAnswers[currentQ.id] !== undefined
                            ? submittedAnswers[currentQ.id].isCorrect
                            : isAnswerCorrect) ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span className="text-emerald-900">
                                {t.correctAnswerTitle} ({t.correctAnswerSubtitle.replace('{points}', String(activeQ.points))})
                              </span>
                            </>
                          ) : (
                            <>
                              <Info className="w-5 h-5 text-stone-700 shrink-0" />
                              <span>{t.incorrectAnswerTitle} {t.explanationHeader}</span>
                            </>
                          )}
                        </div>
                        {!isAdminLoggedIn && isFeedbackPeriodActive && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-900/10 text-stone-700 flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {language === 'en'
                                ? 'Next mission in 8s…'
                                : 'Επόμενη αποστολή σε 8δ…'}
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-stone-800">
                        {activeQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              );
            })() : (
              <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
                <p className="text-stone-500">
                  {t.noActiveQuestions}
                </p>
                <button
                  onClick={() => {
                    setSelectedTeamFilter('all');
                    setSelectedTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}
              </>
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

                {isAdminLoggedIn && (
                  <>
                    <button
                      onClick={handleRefreshPosters}
                      className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title={language === 'en' ? 'Sync posters from student devices' : 'Συγχρονισμός αφισών από τις συσκευές μαθητών'}
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-600" />
                      {language === 'en' ? 'Sync Posters' : 'Συγχρονισμός'}
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

                    <button
                      onClick={() => setIsClearGameDataOpen(true)}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-900 font-bold text-xs sm:text-sm rounded-xl border border-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title={
                        language === 'en'
                          ? 'New Game – Clear Previous Game Data'
                          : 'Νέο παιχνίδι – Καθαρισμός προηγούμενων δεδομένων'
                      }
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>
                        {language === 'en'
                          ? 'New Game – Clear Previous Game Data'
                          : 'Νέο παιχνίδι – Καθαρισμός προηγούμενων δεδομένων'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Team Poster Selector Pills - Admin only, students are locked to their own team */}
            {isAdminLoggedIn && (
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
            )}

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
                  {t.teamsHubTitle}
                </h2>
                <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                  {t.teamsHubSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPresentation(0)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  {t.presentationOfPosters}
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
                                {t.teamPrefix} {team.number}
                              </span>
                              <span className="text-xs text-stone-400 font-medium">
                                {language === 'en' ? team.title : team.titleEn}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                              {language === 'en' ? (team.titleEn || team.title) : team.title}
                            </h3>
                          </div>
                        </div>

                        {/* Theme Category Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                            {language === 'en' ? (team.themeCategoryEn || team.themeCategory) : team.themeCategory}
                          </span>
                          {/* Admin edit button for team */}
                          {isAdminLoggedIn && (
                            <button
                              onClick={() => handleOpenEditTeam(team)}
                              className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> {language === 'el' ? 'Επεξεργασία' : 'Edit'}
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
                        {language === 'en' ? (team.sloganEn || team.slogan) : team.slogan}
                      </blockquote>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {language === 'en' ? (team.descriptionEn || team.description) : team.description}
                      </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            {t.teamQuestionsLabel}
                          </span>
                          <span className="font-bold text-stone-900">
                            {activeTeamQuestions.length}/{teamQuestions.length}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-stone-200" />
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            {t.teamPointsLabel}
                          </span>
                          <span className="font-bold text-stone-900">
                            {teamPoints} {language === 'el' ? 'πτ' : 'pts'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Create Poster Button */}
                        <button
                          onClick={() => handleOpenCreatePoster(team.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer"
                          style={{
                            borderColor: `${team.color}50`,
                            backgroundColor: `${team.color}10`,
                            color: team.color,
                          }}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          {t.teamPosterBtn}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedTeamFilter(team.id);
                            setActiveTab('arena');
                            setCurrentQuestionIndex(0);
                            resetQuestionState();
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-1 shadow-xs cursor-pointer"
                          style={{ backgroundColor: team.color }}
                        >
                          {t.playArenaBtn} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Team Questions Section: Active in main list, Inactive in clearly labelled bottom section */}
            <div className="space-y-6 pt-6 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                    <span>📋</span>
                    <span>{language === 'el' ? 'Διαχείριση Ερωτήσεων ανά Ομάδα' : 'Team Questions Management'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {language === 'el'
                      ? 'Κάθε ομάδα εμφανίζει τις ενεργές ερωτήσεις της στην κύρια λίστα και τις ανενεργές ερωτήσεις ξεχωριστά στο κάτω μέρος.'
                      : 'Each team displays its active questions in the main list and inactive questions separately at the bottom.'}
                  </p>
                </div>
              </div>

              {teams.map((tm) => (
                <TeamQuestionSection
                  key={tm.id}
                  team={tm}
                  teams={teams}
                  questions={questions}
                  language={language}
                  onToggleActive={toggleQuestionActive}
                  onMoveUp={handleMoveQuestionUp}
                  onMoveDown={handleMoveQuestionDown}
                  onChangeTeam={handleChangeQuestionTeam}
                  onEditQuestion={handleOpenEditQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onTestQuestion={(q) => {
                    const idx = activeQuestions.findIndex((item) => item.id === q.id);
                    if (idx !== -1) {
                      setCurrentQuestionIndex(idx);
                      setActiveTab('arena');
                      resetQuestionState();
                    } else {
                      toggleQuestionActive(q.id);
                    }
                  }}
                  renderTypeBadge={renderTypeBadge}
                  collapsible={true}
                  defaultExpanded={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATIONAL GUIDE (ADMIN ONLY) */}
        {activeTab === 'guide' && isAdminLoggedIn && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">
                {t.guideTitle}
              </h2>
              <p className="mt-1 text-sm text-stone-600 max-w-3xl leading-relaxed">
                {t.guideSubtitle}
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
                      <h3 className="font-bold text-lg text-stone-900">{t.speciesGypsTitle}</h3>
                      <p className="text-xs text-amber-700 font-medium">{t.speciesGypsSub}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                    2.40 - 2.80μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.speciesGypsDesc}
                </p>
              </div>

              {/* 2. Aegypius monachus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪶</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">{t.speciesAegypiusTitle}</h3>
                      <p className="text-xs text-stone-700 font-medium">{t.speciesAegypiusSub}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-stone-200 text-stone-900 px-2.5 py-1 rounded-full font-bold">
                    2.50 - 2.95μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.speciesAegypiusDesc}
                </p>
              </div>

              {/* 3. Gypaetus barbatus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🦴</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">{t.speciesGypaetusTitle}</h3>
                      <p className="text-xs text-orange-700 font-medium">{t.speciesGypaetusSub}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-900 px-2.5 py-1 rounded-full font-bold">
                    2.60 - 2.85μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.speciesGypaetusDesc}
                </p>
              </div>

              {/* 4. Neophron percnopterus */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌍</span>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">{t.speciesNeophronTitle}</h3>
                      <p className="text-xs text-emerald-700 font-medium">{t.speciesNeophronSub}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-bold">
                    1.55 - 1.70μ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {t.speciesNeophronDesc}
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
                    {t.lifeProjectTitle}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {t.lifeProjectPartners}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">{t.k9DogsTitle}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {t.k9DogsDesc}
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">{t.gpsTransmittersTitle}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {t.gpsTransmittersDesc}
                  </p>
                </div>

                <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1.5">
                  <h5 className="font-bold text-sm text-stone-200">{t.spainTransfersTitle}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {t.spainTransfersDesc}
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
            {t.appTitle} •{' '}
            <span className="text-amber-400 font-mono">ekpaideytiki-anafora-gypes-2026-10-29_1818ef45.json</span>
          </p>
          <div className="flex items-center gap-3 text-stone-400">
            {isAdminLoggedIn && (
              <>
                <button
                  onClick={() => setIsJoinQROpen(true)}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-bold text-emerald-400 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> {t.joinQrBtn}
                </button>
                <span>•</span>
              </>
            )}
            {(isAdminLoggedIn || isCurrentTeamActivitiesCompleted) && (
              <>
                <button
                  onClick={() => handleOpenCreatePoster()}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" /> {t.createPosterBtn}
                </button>
                <span>•</span>
              </>
            )}
            {isAdminLoggedIn && (
              <>
                <button
                  onClick={() => handleOpenPresentation(0)}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5" /> {t.presentationBtn}
                </button>
                <span>•</span>
              </>
            )}
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveTab('pool');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {isAdminLoggedIn
                ? (language === 'el' ? 'Διαχειριστής (Ενεργός)' : 'Admin (Active)')
                : (language === 'el' ? 'Είσοδος Διαχειριστή' : 'Admin Login')}
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
        language={language}
      />

      {/* 2. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
        }}
        language={language}
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
        language={language}
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
        onRefresh={handleRefreshPosters}
      />

      {/* 5. Admin Report Modal (PDF / CSV / JSON) */}
      <AdminReportModal
        isOpen={isAdminReportOpen}
        onClose={() => setIsAdminReportOpen(false)}
        posters={dynamicPostersMap}
        language={language}
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
        language={language}
      />

      {/* 8. Printable Question Register Modal */}
      <PrintableQuestionRegisterModal
        isOpen={isPrintRegisterOpen}
        onClose={() => setIsPrintRegisterOpen(false)}
        questions={questions}
        teams={teams}
        language={language}
      />

      {/* 9. Game Time Expired Modal (Automatic Game-End Overlay) */}
      <GameTimeExpiredModal
        isOpen={showTimeExpiredModal && !hasDismissedExpiredModal}
        onClose={() => {
          setShowTimeExpiredModal(false);
          setHasDismissedExpiredModal(true);
        }}
        team={teams.find((t) => t.id === (studentSelectedTeamId || (selectedTeamFilter !== 'all' ? selectedTeamFilter : undefined)))}
        score={score}
        answeredCount={answeredCount}
        totalQuestions={activeQuestions.length}
        language={language}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminRecover={handleAdminSafeRecovery}
        onViewPoster={() => {
          setShowTimeExpiredModal(false);
          setHasDismissedExpiredModal(true);
          setActiveTab('posters');
          if (studentSelectedTeamId) {
            setSelectedPosterTeamId(studentSelectedTeamId);
          }
        }}
        onReviewQuestions={() => {
          setShowTimeExpiredModal(false);
          setHasDismissedExpiredModal(true);
          setActiveTab('arena');
        }}
      />

      {/* 10. Clear Game Data for New Game Modal */}
      <ClearGameDataModal
        isOpen={isClearGameDataOpen}
        onClose={() => setIsClearGameDataOpen(false)}
        onConfirmClear={handleConfirmClearGameData}
        language={language}
      />

      {/* Toast Notification for Export Actions */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl border transition-all animate-bounce-in bg-stone-900 text-white border-stone-700 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {exportToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              {exportToast.title}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {exportToast.message}
            </p>
          </div>
          <button
            onClick={() => setExportToast(null)}
            className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
