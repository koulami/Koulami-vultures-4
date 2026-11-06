/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Team } from '../types/game';
import {
  Users,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Wifi,
  ChevronRight,
  Clock,
  Compass,
  ArrowRight,
  Check,
  Info,
  RotateCcw,
  Play,
} from 'lucide-react';

interface StudentEntryFlowProps {
  teams: Team[];
  language: 'el' | 'en';
  onSetLanguage: (lang: 'el' | 'en') => void;
  isStudentConnected: boolean;
  onConnectWithCode: (code: string) => boolean;
  selectedTeamId: string | null;
  isTeamLocked: boolean;
  onConfirmAndLockTeam: (teamId: string) => void;
  isGameStarted: boolean;
  onOpenAdminLogin: () => void;
  roomPin?: string;
  durationMinutes?: number;
  isReturningStudent?: boolean;
  onContinueSession?: () => void;
  onStartOverThisDeviceOnly?: () => void;
}

export const StudentEntryFlow: React.FC<StudentEntryFlowProps> = ({
  teams,
  language,
  onSetLanguage,
  isStudentConnected,
  onConnectWithCode,
  selectedTeamId,
  isTeamLocked,
  onConfirmAndLockTeam,
  isGameStarted,
  onOpenAdminLogin,
  roomPin = 'GYPES-2026',
  durationMinutes = 15,
  isReturningStudent = false,
  onContinueSession,
  onStartOverThisDeviceOnly,
}) => {
  const isEn = language === 'en';

  // Local state for entering game access code
  const [codeInput, setCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Local state for team selection (before final confirmation)
  const [tentativeTeamId, setTentativeTeamId] = useState<string | null>(selectedTeamId);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Sync tentativeTeamId when selectedTeamId changes (e.g. when Start Over resets selectedTeamId to null)
  useEffect(() => {
    setTentativeTeamId(selectedTeamId);
    setShowConfirmModal(false);
  }, [selectedTeamId]);

  // Find selected team object
  const activeLockedTeam = teams.find((t) => t.id === selectedTeamId);
  const tentativeTeamObj = teams.find((t) => t.id === tentativeTeamId);

  const handleCodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = onConnectWithCode(codeInput.trim());
    if (!success) {
      setCodeError(
        isEn
          ? `Invalid access code. Please use the classroom PIN (e.g. ${roomPin}).`
          : `Μη έγκυρος κωδικός πρόσβασης. Χρησιμοποιήστε το PIN της τάξης (π.χ. ${roomPin}).`
      );
    } else {
      setCodeError(null);
    }
  };

  const handleConfirmTeam = () => {
    if (tentativeTeamId) {
      onConfirmAndLockTeam(tentativeTeamId);
      setShowConfirmModal(false);
    }
  };

  // =========================================================================
  // STATE 0: RETURNING STUDENT CHOICE SCREEN (Continue vs Start Over on This Device)
  // Must be the FIRST rendering condition, depending on isReturningStudent alone.
  // =========================================================================
  if (isReturningStudent) {
    const lockedTeam = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : null;
    const teamTitle = lockedTeam ? (isEn ? (lockedTeam.titleEn || lockedTeam.title) : lockedTeam.title) : '';
    const teamNumber = lockedTeam?.number || 1;
    const teamColor = lockedTeam?.color || '#d97706';
    const teamAvatar = lockedTeam?.avatar || '🦅';

    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
        {/* Top Minimal Bar */}
        <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
              🦅
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                LIFE with Vultures
              </span>
              <span className="text-sm font-extrabold text-white block">
                {isEn ? 'On the Brink of Extinction - Vultures in Cyprus' : 'Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-950/80 border border-stone-800 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onSetLanguage('el')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                  language === 'el' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                }`}
              >
                🇬🇷 ΕΛ
              </button>
              <button
                type="button"
                onClick={() => onSetLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                  language === 'en' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Admin Login Modal Trigger */}
            <button
              onClick={onOpenAdminLogin}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isEn ? 'Administrator Access' : 'Σύνδεση Διαχειριστή'}
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">{isEn ? 'Admin' : 'Διαχειριστής'}</span>
            </button>
          </div>
        </header>

        {/* Center Choice Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl space-y-6 text-center backdrop-blur-md">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner border-2"
              style={{
                backgroundColor: `${teamColor}20`,
                borderColor: teamColor,
              }}
            >
              {teamAvatar}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                {isEn ? 'Returning Student' : 'Επιστροφή Μαθητή'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isEn ? 'Welcome Back!' : 'Καλώς Ήρθατε Πάλι!'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {isEn
                  ? 'An active game session for this device was found.'
                  : 'Εντοπίστηκε ενεργή συνεδρία παιχνιδιού για αυτή τη συσκευή.'}
              </p>

              {lockedTeam ? (
                <div
                  className="mt-3 p-3.5 rounded-2xl bg-stone-900 border text-left flex items-center gap-3.5"
                  style={{ borderColor: `${teamColor}60` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${teamColor}30` }}
                  >
                    {teamAvatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-block mb-0.5"
                      style={{ backgroundColor: teamColor }}
                    >
                      {isEn ? `Team ${teamNumber}` : `Ομάδα ${teamNumber}`}
                    </span>
                    <h4 className="text-sm font-black text-white truncate">
                      {teamTitle}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-2xl bg-stone-900 border border-stone-800 text-left text-xs text-stone-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isEn
                      ? 'Previous team details could not be identified, but your session is saved.'
                      : 'Δεν ήταν δυνατή η πλήρης αναγνώριση της προηγούμενης ομάδας, αλλά η συνεδρία σας είναι αποθηκευμένη.'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2 text-left">
              {/* Option 1: Continue */}
              <button
                type="button"
                onClick={onContinueSession}
                className="w-full p-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl text-sm sm:text-base transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-950/20 flex items-center justify-center text-stone-950 shrink-0">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="block font-black leading-tight text-stone-950">
                      {isEn ? 'Continue Previous Session' : 'Συνέχεια Προηγούμενης Συνεδρίας'}
                    </span>
                    <span className="block text-xs font-semibold text-stone-800 leading-tight">
                      {isEn ? 'Resume with existing locked team' : 'Συνέχεια με την τρέχουσα ομάδα'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-950 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Option 2: Start Over on this device only */}
              <button
                type="button"
                onClick={() => {
                  setTentativeTeamId(null);
                  if (onStartOverThisDeviceOnly) {
                    onStartOverThisDeviceOnly();
                  }
                }}
                className="w-full p-4 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-white border border-stone-700 hover:border-amber-500/50 font-bold rounded-2xl text-sm transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold leading-tight text-white">
                      {isEn ? 'Start Over on This Device' : 'Νέα αρχή σε αυτή τη συσκευή'}
                    </span>
                    <span className="block text-xs font-normal text-stone-400 leading-tight">
                      {isEn ? 'Choose a team again (PIN preserved)' : 'Επιλογή νέας ομάδας (διατήρηση PIN)'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STATE 1: NOT CONNECTED YET - ENTER GAME ACCESS CODE
  // =========================================================================
  if (!isStudentConnected) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
        {/* Top Minimal Bar */}
        <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
              🦅
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                LIFE with Vultures
              </span>
              <span className="text-sm font-extrabold text-white block">
                {isEn ? 'On the Brink of Extinction - Vultures in Cyprus' : 'Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-950/80 border border-stone-800 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onSetLanguage('el')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                  language === 'el' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                }`}
              >
                🇬🇷 ΕΛ
              </button>
              <button
                type="button"
                onClick={() => onSetLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                  language === 'en' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Admin Login Modal Trigger */}
            <button
              onClick={onOpenAdminLogin}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isEn ? 'Administrator Access' : 'Σύνδεση Διαχειριστή'}
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">{isEn ? 'Admin' : 'Διαχειριστής'}</span>
            </button>
          </div>
        </header>

        {/* Center Entry Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl space-y-6 text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔑
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                {isEn ? 'Student Portal' : 'Πύλη Μαθητή'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isEn ? 'Enter Game Access Code' : 'Εισαγωγή Κωδικού Παιχνιδιού'}
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isEn
                  ? 'Connect using the classroom access PIN displayed on the board or provided by your teacher.'
                  : 'Συνδεθείτε πληκτρολογώντας τον κωδικό πρόσβασης που προβάλλεται στον πίνακα από τον καθηγητή σας.'}
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  {isEn ? 'Game Access PIN / Code:' : 'Κωδικός Πρόσβασης Αρένας:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setCodeError(null);
                    }}
                    placeholder={`π.χ. ${roomPin}`}
                    className="w-full text-center tracking-widest font-mono text-base sm:text-lg font-black bg-stone-900 border-2 border-stone-700 focus:border-amber-500 rounded-2xl py-3 px-4 text-white focus:outline-none uppercase placeholder:text-stone-600 transition-colors"
                    autoFocus
                  />
                </div>
                {codeError && (
                  <p className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5 justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{codeError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!codeInput.trim()}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isEn ? 'Connect to Arena' : 'Σύνδεση στην Αρένα'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Connect Helper */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCodeInput(roomPin);
                    onConnectWithCode(roomPin);
                  }}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  {isEn ? `Quick Join with ${roomPin}` : `Γρήγορη Σύνδεση με ${roomPin}`}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: CONNECTED WITH CODE - FIRST & ONLY SCREEN IS TEAM SELECTION
  // =========================================================================
  if (isStudentConnected && !isTeamLocked) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
        {/* Header */}
        <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
                🦅
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-amber-400">{isEn ? 'Vulture Arena' : 'Αρένα Γύπα'}</span>
                  <span className="text-stone-500">•</span>
                  <span>{isEn ? 'Cyprus' : 'Κύπρος'}</span>
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isEn ? `Connected: ${roomPin}` : `Συνδεδεμένο: ${roomPin}`}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {/* Language Switcher */}
              <div className="flex items-center bg-stone-950/80 border border-stone-800 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => onSetLanguage('el')}
                  className={`px-2 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                    language === 'el' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  🇬🇷 ΕΛ
                </button>
                <button
                  type="button"
                  onClick={() => onSetLanguage('en')}
                  className={`px-2 py-1 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                    language === 'en' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>

              {/* Admin login button for teacher */}
              <button
                onClick={onOpenAdminLogin}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer text-xs"
                title={isEn ? 'Teacher Admin' : 'Είσοδος Καθηγητή'}
              >
                <Lock className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Team Selection Content */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                {isEn ? 'Step 1 of 1: Team Selection' : 'Βήμα 1 από 1: Επιλογή Ομάδας'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {isEn ? 'Select Your Research Team' : 'Επιλέξτε την Ερευνητική σας Ομάδα'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isEn
                  ? 'Select one team below. Once you confirm, you will be permanently locked to this team for this game session.'
                  : 'Επιλέξτε μία από τις διαθέσιμες ομάδες. Μετά την επιβεβαίωση, η επιλογή κλειδώνει οριστικά για όλη τη διάρκεια της σημερινής συνεδρίας.'}
              </p>
            </div>

            {/* Teams Grid - Displaying all currently available teams clearly with names and visual identities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {teams.map((team) => {
                const isSelected = tentativeTeamId === team.id;
                const teamTitle = isEn ? (team.titleEn || team.title) : team.title;
                const teamSlogan = isEn ? (team.sloganEn || team.slogan) : team.slogan;
                const teamTheme = isEn ? (team.themeCategoryEn || team.themeCategory) : team.themeCategory;
                const teamDesc = isEn ? (team.descriptionEn || team.description) : team.description;

                return (
                  <div
                    key={team.id}
                    onClick={() => setTentativeTeamId(team.id)}
                    className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer border-2 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-amber-600 bg-white ring-4 ring-amber-400/30 -translate-y-1'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                    style={{
                      borderLeftColor: team.color,
                      borderLeftWidth: '8px',
                    }}
                  >
                    {/* Top Info & Avatar */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs border"
                            style={{
                              backgroundColor: `${team.color}15`,
                              borderColor: `${team.color}40`,
                            }}
                          >
                            {team.avatar}
                          </div>
                          <div>
                            <span
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1 text-white shadow-2xs"
                              style={{ backgroundColor: team.color }}
                            >
                              {isEn ? `Team ${team.number}` : `Ομάδα ${team.number}`}
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                              {teamTitle}
                            </h3>
                          </div>
                        </div>

                        {/* Radio Check Indicator */}
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-stone-300 bg-stone-50'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Theme Category Badge */}
                      {teamTheme && (
                        <div className="pt-1">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                            🏷️ {teamTheme}
                          </span>
                        </div>
                      )}

                      {/* Slogan */}
                      {teamSlogan && (
                        <p className="text-xs sm:text-sm font-semibold text-stone-800 italic leading-snug">
                          {teamSlogan}
                        </p>
                      )}

                      {/* Description */}
                      {teamDesc && (
                        <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
                          {teamDesc}
                        </p>
                      )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: team.color }}
                      >
                        {isSelected ? (isEn ? '✓ Selected' : '✓ Επιλεγμένη') : (isEn ? 'Click to select' : 'Κάντε κλικ για επιλογή')}
                      </span>
                      <span className="text-stone-400 text-[11px]">
                        {isEn ? 'Session Locking' : 'Μόνιμο Κλείδωμα'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Confirmation Action Bar */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border shadow-sm">
            <div className="text-center sm:text-left">
              <span className="text-xs text-stone-400 uppercase tracking-wider font-bold block">
                {isEn ? 'Selected Team for Lock:' : 'Επιλεγμένη Ομάδα προς Κλείδωμα:'}
              </span>
              <span className="text-sm sm:text-base font-black text-stone-900">
                {tentativeTeamObj
                  ? (isEn ? tentativeTeamObj.titleEn : tentativeTeamObj.title)
                  : (isEn ? 'No team selected yet' : 'Δεν έχει επιλεγεί ομάδα ακόμα')}
              </span>
            </div>

            <button
              disabled={!tentativeTeamId}
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isEn ? 'Confirm Selection & Lock Team' : 'Επιβεβαίωση Επιλογής & Κλείδωμα Ομάδας'}</span>
            </button>
          </div>
        </main>

        {/* Confirmation Modal */}
        {showConfirmModal && tentativeTeamObj && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-inner border-2"
                style={{
                  backgroundColor: `${tentativeTeamObj.color}15`,
                  borderColor: tentativeTeamObj.color,
                }}
              >
                {tentativeTeamObj.avatar}
              </div>

              <div className="space-y-2">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white inline-block shadow-2xs"
                  style={{ backgroundColor: tentativeTeamObj.color }}
                >
                  {isEn ? `Team ${tentativeTeamObj.number}` : `Ομάδα ${tentativeTeamObj.number}`}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  {isEn ? tentativeTeamObj.titleEn : tentativeTeamObj.title}
                </h3>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{isEn ? 'Permanent Team Lock' : 'Οριστικό Κλείδωμα Ομάδας'}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {isEn
                      ? 'You are about to lock into this team for the entire game session. You will NOT be able to switch to another team or reset this selection.'
                      : 'Πρόκειται να κλειδώσετε σε αυτή την ομάδα για όλη τη σημερινή συνεδρία. ΔΕΝ θα μπορείτε να αλλάξετε ομάδα ή να ακυρώσετε την επιλογή σας.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isEn ? 'Back / Change' : 'Επιστροφή / Αλλαγή'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTeam}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Yes, Lock My Team' : 'Ναι, Κλείδωμα Ομάδας'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STATE 3: TEAM LOCKED, WAITING FOR ADMINISTRATOR TO START GAME (WAITING LOBBY)
  // =========================================================================
  if (isStudentConnected && isTeamLocked && !isGameStarted) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
        {/* Top Minimal Bar */}
        <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full border-b border-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🦅
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                {isEn ? 'Waiting Lobby' : 'Αίθουσα Αναμονής'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white block">
                {isEn ? 'On the Brink of Extinction - Vultures in Cyprus' : 'Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-stone-900 border border-stone-700 px-2.5 py-1 rounded-lg text-stone-300">
              PIN: {roomPin}
            </span>
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onSetLanguage('el')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all font-bold cursor-pointer ${
                  language === 'el' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                🇬🇷
              </button>
              <button
                type="button"
                onClick={() => onSetLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded transition-all font-bold cursor-pointer ${
                  language === 'en' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                🇬🇧
              </button>
            </div>
            <button
              onClick={onOpenAdminLogin}
              className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800 text-xs"
              title={isEn ? 'Teacher Admin' : 'Είσοδος Καθηγητή'}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Main Waiting Lobby Screen */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full space-y-6 text-center">
            {/* Pulsing Status Radar */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 animate-ping absolute" />
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-xl z-10 relative">
                ⏳
              </div>
            </div>

            {/* Waiting Message */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                {isEn ? 'Synchronized Lobby • Live' : 'Συγχρονισμένη Αίθουσα Αναμονής'}
              </span>
              
              {/* Selected Team Name Display */}
              {activeLockedTeam && (
                <div className="py-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    {isEn ? 'Your Selected Team:' : 'Η Επιλεγμένη σας Ομάδα:'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
                    <span>{activeLockedTeam.avatar}</span>
                    <span>{isEn ? activeLockedTeam.titleEn : activeLockedTeam.title}</span>
                  </div>
                </div>
              )}

              {/* Exact Required Waiting Message */}
              <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                <h2 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight leading-snug">
                  {isEn
                    ? 'Waiting for the administrator to start the game.'
                    : 'Περιμένετε την έναρξη του παιχνιδιού από τον διαχειριστή.'}
                </h2>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  {isEn
                    ? 'All teams will start at exactly the same time. The first mission will appear automatically without refreshing.'
                    : 'Όλες οι ομάδες θα ξεκινήσουν ταυτόχρονα. Η πρώτη ερώτηση θα εμφανιστεί αυτόματα χωρίς να χρειάζεται ανανέωση.'}
                </p>
                <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {isEn ? `Configured Game Duration: ${durationMinutes} minutes` : `Διάρκεια Παιχνιδιού: ${durationMinutes} λεπτά`}
                  </span>
                </div>
              </div>
            </div>

            {/* Locked Team Visual Identity Card */}
            {activeLockedTeam && (
              <div
                className="bg-stone-900/90 border-2 rounded-3xl p-6 text-left space-y-3 shadow-2xl backdrop-blur-sm relative overflow-hidden"
                style={{
                  borderColor: activeLockedTeam.color,
                }}
              >
                {/* Team Watermark Background */}
                <div className="absolute right-2 -bottom-4 text-7xl opacity-10 select-none pointer-events-none">
                  {activeLockedTeam.avatar}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border"
                      style={{
                        backgroundColor: `${activeLockedTeam.color}25`,
                        borderColor: activeLockedTeam.color,
                      }}
                    >
                      {activeLockedTeam.avatar}
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white inline-block mb-0.5"
                        style={{ backgroundColor: activeLockedTeam.color }}
                      >
                        {isEn ? `Team ${activeLockedTeam.number}` : `Ομάδα ${activeLockedTeam.number}`}
                      </span>
                      <h3 className="text-base font-black text-white">
                        {isEn ? activeLockedTeam.titleEn : activeLockedTeam.title}
                      </h3>
                    </div>
                  </div>

                  {/* Permanently Locked Indicator Badge */}
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? 'Locked' : 'Κλειδωμένη'}</span>
                  </span>
                </div>

                {activeLockedTeam.slogan && (
                  <p className="text-xs text-stone-300 italic pt-1 border-t border-stone-800">
                    «{isEn ? (activeLockedTeam.sloganEn || activeLockedTeam.slogan) : activeLockedTeam.slogan}»
                  </p>
                )}

                <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isEn
                      ? 'Team is locked for this session. Refreshing or reconnecting will restore your team automatically.'
                      : 'Η ομάδα είναι κλειδωμένη για αυτή τη συνεδρία. Ανανέωση της σελίδας θα επαναφέρει αυτόματα την ομάδα σας.'}
                  </span>
                </div>
              </div>
            )}

            {/* Start Over on this device option */}
            {onStartOverThisDeviceOnly && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onStartOverThisDeviceOnly}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-amber-400 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Change Team / Start Over on this device' : 'Αλλαγή Ομάδας / Νέα αρχή σε αυτή τη συσκευή'}</span>
                </button>
              </div>
            )}

            {/* Waiting Tips */}
            <div className="text-[11px] text-stone-500 flex items-center justify-center gap-2 pt-2">
              <Clock className="w-3.5 h-3.5 animate-spin text-stone-500" />
              <span>
                {isEn
                  ? 'Keep this window open on your phone or tablet'
                  : 'Κρατήστε αυτό το παράθυρο ανοιχτό στη συσκευή σας'}
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};
