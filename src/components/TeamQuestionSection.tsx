/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Question, QuestionType, Team } from '../types/game';
import { getLocalizedQuestion } from '../i18n/questionTranslations';
import { translations } from '../i18n/translations';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Target,
  Edit3,
  Trash2,
  Check,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface TeamQuestionSectionProps {
  team: Team;
  teams: Team[];
  questions: Question[];
  language: 'el' | 'en';
  onToggleActive: (id: string) => void;
  onMoveUp: (id: string, contextList: Question[]) => void;
  onMoveDown: (id: string, contextList: Question[]) => void;
  onChangeTeam: (id: string, newTeamId: string) => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onTestQuestion: (q: Question) => void;
  renderTypeBadge: (type: QuestionType) => React.ReactNode;
  selectedTypeFilter?: string;
  searchQuery?: string;
  selectedStatusFilter?: 'all' | 'active' | 'inactive';
  collapsible?: boolean;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const TeamQuestionSection: React.FC<TeamQuestionSectionProps> = ({
  team,
  teams,
  questions,
  language,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onChangeTeam,
  onEditQuestion,
  onDeleteQuestion,
  onTestQuestion,
  renderTypeBadge,
  selectedTypeFilter = 'all',
  searchQuery = '',
  selectedStatusFilter = 'all',
  collapsible = false,
  defaultExpanded = true,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const t = translations[language];
  const isEn = language === 'en';

  // 1. Get all questions assigned to this team
  const teamQuestions = questions.filter((q) => q.assignedTeamIds.includes(team.id));

  // 2. Filter by question type and search query
  const filteredQuestions = teamQuestions.filter((q) => {
    const matchesType = !selectedTypeFilter || selectedTypeFilter === 'all' || q.type === selectedTypeFilter;
    const matchesSearch =
      !searchQuery ||
      searchQuery.trim() === '' ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.missionTitle && q.missionTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // 3. Separate into Active Questions and Inactive Questions
  const activeQuestions = filteredQuestions.filter((q) => q.isActive);
  const inactiveQuestions = filteredQuestions.filter((q) => !q.isActive);

  const teamPoints = activeQuestions.reduce((acc, q) => acc + q.points, 0);

  const showActiveSection = selectedStatusFilter === 'all' || selectedStatusFilter === 'active';
  const showInactiveSection = selectedStatusFilter === 'all' || selectedStatusFilter === 'inactive';

  return (
    <div
      className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm overflow-hidden transition-all mb-8"
      style={{
        borderLeftColor: team.color,
        borderLeftWidth: '8px',
      }}
    >
      {/* Team Section Header Banner */}
      <div className="bg-stone-50/80 border-b border-stone-200 px-5 sm:px-7 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border"
            style={{
              backgroundColor: `${team.color}15`,
              borderColor: `${team.color}40`,
            }}
          >
            {team.avatar}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span
                className="text-[11px] font-black px-2.5 py-0.5 rounded-full text-white shadow-2xs uppercase tracking-wider"
                style={{ backgroundColor: team.color }}
              >
                {isEn ? `Team ${team.number}` : `Ομάδα ${team.number}`}
              </span>
              <span className="text-xs font-bold text-stone-500 bg-stone-200/70 px-2 py-0.5 rounded-md">
                🏷️ {isEn ? (team.themeCategoryEn || team.themeCategory) : team.themeCategory}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              {isEn ? (team.titleEn || team.title) : team.title}
            </h3>
            {team.slogan && (
              <p className="text-xs text-stone-500 italic mt-0.5 line-clamp-1">
                «{isEn ? (team.sloganEn || team.slogan) : team.slogan}»
              </p>
            )}
          </div>
        </div>

        {/* Counters & Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {/* Active Questions Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {activeQuestions.length} {isEn ? 'Active' : 'Ενεργές'}
            </span>
          </span>

          {/* Inactive Questions Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs">
            <EyeOff className="w-3.5 h-3.5 text-stone-500" />
            <span>
              {inactiveQuestions.length} {isEn ? 'Inactive' : 'Ανενεργές'}
            </span>
          </span>

          {/* Team Active Points */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black bg-amber-100 text-amber-950 border border-amber-300">
            <span>⭐ {teamPoints} {isEn ? 'pts' : 'πτ'}</span>
          </span>

          {/* Collapsible toggle button (if enabled) */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl border border-stone-300 hover:bg-stone-200/70 text-stone-600 transition-colors cursor-pointer"
              title={isExpanded ? (isEn ? 'Collapse' : 'Σύμπτυξη') : (isEn ? 'Expand' : 'Ανάπτυξη')}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Active Questions List + Separate Bottom Inactive Section */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* 1. MAIN QUESTION LIST: ACTIVE QUESTIONS FOR THIS TEAM                     */}
          {/* ========================================================================= */}
          {showActiveSection && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h4 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
                    {isEn ? 'Active Questions' : 'Ενεργές Ερωτήσεις'}{' '}
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                      {activeQuestions.length}
                    </span>
                  </h4>
                </div>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  {isEn
                    ? 'Only active questions are visible to students during the game.'
                    : 'Μόνο οι ενεργές ερωτήσεις εμφανίζονται στους μαθητές κατά το παιχνίδι.'}
                </span>
              </div>

              {activeQuestions.length === 0 ? (
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-6 text-center space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-stone-600">
                    {isEn
                      ? 'No active questions for this team.'
                      : 'Δεν υπάρχουν ενεργές ερωτήσεις για αυτή την ομάδα.'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {isEn
                      ? 'You can activate questions from the Inactive Questions section below.'
                      : 'Μπορείτε να ενεργοποιήσετε ερωτήσεις από την ενότητα Ανενεργές Ερωτήσεις παρακάτω.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] sm:text-[11px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-16">{t.tableOrder}</th>
                          <th className="py-2.5 px-3 w-28">{t.tableStatus}</th>
                          <th className="py-2.5 px-4">{t.tableQuestionTitle}</th>
                          <th className="py-2.5 px-4 w-44">{t.tableTeamAssign}</th>
                          <th className="py-2.5 px-3 w-32">{t.tableType}</th>
                          <th className="py-2.5 px-3 w-20">{t.tablePoints}</th>
                          <th className="py-2.5 px-4 text-right w-36">{t.tableActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {activeQuestions.map((q, idxInActive) => {
                          const localizedQ = getLocalizedQuestion(q, language);
                          const globalIdx = questions.findIndex((item) => item.id === q.id);

                          return (
                            <tr key={q.id} className="hover:bg-amber-50/40 transition-colors">
                              {/* 1. UP / DOWN MOVE ARROWS (Within active sequence of this team) */}
                              <td className="py-3 px-2 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => onMoveUp(q.id, activeQuestions)}
                                    disabled={idxInActive === 0}
                                    className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                    title={t.moveUp}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-mono text-[11px] font-bold text-stone-600 w-5 text-center">
                                    {idxInActive + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onMoveDown(q.id, activeQuestions)}
                                    disabled={idxInActive === activeQuestions.length - 1}
                                    className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                    title={t.moveDown}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* 2. ACTIVE / INACTIVE TOGGLE */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onToggleActive(q.id)}
                                  className="px-2.5 py-1 rounded-full text-xs font-black border transition-all cursor-pointer bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 flex items-center gap-1 shadow-2xs"
                                  title={isEn ? 'Click to deactivate question' : 'Κάντε κλικ για απενεργοποίηση'}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>{t.activeBadge}</span>
                                </button>
                              </td>

                              {/* 3. QUESTION TITLE & DETAILS */}
                              <td className="py-3 px-4 font-medium text-stone-900">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {localizedQ.missionTitle && (
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                      <Target className="w-3 h-3 text-amber-700" />
                                      <span>{localizedQ.missionTitle}</span>
                                    </span>
                                  )}
                                  {q.mediaUrl && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                      {q.mediaType === 'video' ? '🎥 ' + t.mediaTypeVideo : '📷 ' + t.mediaTypeImage}
                                    </span>
                                  )}
                                  {q.type === 'qr_scan' && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                                      🎟️ {(q as any).qrPayload}
                                    </span>
                                  )}
                                  {q.type === 'qr_scan' && !q.mediaUrl && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200">
                                      {isEn ? '⚠️ No Media Assigned' : '⚠️ Χωρίς Εκπ. Υλικό'}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-stone-400">
                                    #{globalIdx + 1}
                                  </span>
                                </div>
                                <div className="leading-snug text-xs sm:text-sm font-semibold text-stone-900">
                                  {localizedQ.title}
                                </div>
                                {localizedQ.explanation && localizedQ.explanation !== '-' && (
                                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-1 italic">
                                    {localizedQ.explanation}
                                  </p>
                                )}
                              </td>

                              {/* 4. CHOOSE TEAM */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <select
                                  value={team.id}
                                  onChange={(e) => onChangeTeam(q.id, e.target.value)}
                                  className="text-xs bg-stone-50 hover:bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                                  style={{
                                    borderLeftColor: team.color,
                                    borderLeftWidth: '4px',
                                  }}
                                >
                                  {teams.map((tm) => (
                                    <option key={tm.id} value={tm.id}>
                                      {tm.avatar} {isEn ? `Team ${tm.number}: ${tm.titleEn || tm.title}` : `Ομάδα ${tm.number}: ${tm.title}`}
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
                                {q.points} {isEn ? 'pts' : 'πτ'}
                              </td>

                              {/* 7. ACTIONS (TEST, EDIT, DELETE) */}
                              <td className="py-3 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onTestQuestion(q)}
                                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    {t.testButton}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onEditQuestion(q)}
                                    className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                                    title={t.editQuestionTooltip}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onDeleteQuestion(q.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                                    title={t.deleteQuestionTooltip}
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
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CLEARLY LABELLED INACTIVE QUESTIONS SECTION AT THE BOTTOM OF TEAM LIST */}
          {/* Greek: “Ανενεργές ερωτήσεις” / English: “Inactive Questions”                */}
          {/* ========================================================================= */}
          {showInactiveSection && (
            <div className="bg-stone-50/90 rounded-2xl border-2 border-stone-300/80 p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-600">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-stone-800 tracking-tight">
                        {isEn ? 'Inactive Questions' : 'Ανενεργές ερωτήσεις'}
                      </h4>
                      <span className="text-xs font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-full border border-stone-300 font-mono">
                        {inactiveQuestions.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-tight">
                      {isEn
                        ? 'Questions currently deactivated for this team. All original data is preserved and can be reactivated with one click.'
                        : 'Ερωτήσεις που έχουν απενεργοποιηθεί για αυτή την ομάδα. Διατηρούν όλα τα δεδομένα τους και μπορούν να επανενεργοποιηθούν άμεσα.'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200/80 px-2.5 py-1 rounded-md self-start sm:self-center">
                  {isEn ? `Team ${team.number} Archive` : `Αρχείο Ομάδας ${team.number}`}
                </span>
              </div>

              {inactiveQuestions.length === 0 ? (
                <div className="py-3 px-4 bg-white/70 border border-stone-200 rounded-xl text-center flex items-center justify-center gap-2 text-stone-500 text-xs font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isEn
                      ? 'No inactive questions for this team (all questions are currently active).'
                      : 'Δεν υπάρχουν ανενεργές ερωτήσεις για αυτή την ομάδα (όλες οι ερωτήσεις είναι ενεργές).'}
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-300 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] sm:text-[11px] tracking-wider">
                        <tr>
                          <th className="py-2 px-3 text-center w-16">{t.tableOrder}</th>
                          <th className="py-2 px-3 w-28">{t.tableStatus}</th>
                          <th className="py-2 px-4">{t.tableQuestionTitle}</th>
                          <th className="py-2 px-4 w-44">{t.tableTeamAssign}</th>
                          <th className="py-2 px-3 w-32">{t.tableType}</th>
                          <th className="py-2 px-3 w-20">{t.tablePoints}</th>
                          <th className="py-2 px-4 text-right w-36">{t.tableActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {inactiveQuestions.map((q, idxInInactive) => {
                          const localizedQ = getLocalizedQuestion(q, language);
                          const globalIdx = questions.findIndex((item) => item.id === q.id);

                          return (
                            <tr
                              key={q.id}
                              className="hover:bg-amber-50/50 transition-colors bg-stone-50/40 text-stone-700"
                            >
                              {/* 1. UP / DOWN MOVE ARROWS (Within inactive sequence of this team) */}
                              <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => onMoveUp(q.id, inactiveQuestions)}
                                    disabled={idxInInactive === 0}
                                    className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                    title={t.moveUp}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-mono text-[11px] font-bold text-stone-500 w-5 text-center">
                                    {idxInInactive + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onMoveDown(q.id, inactiveQuestions)}
                                    disabled={idxInInactive === inactiveQuestions.length - 1}
                                    className="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                    title={t.moveDown}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* 2. ACTIVE / INACTIVE TOGGLE (Click to activate) */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onToggleActive(q.id)}
                                  className="px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer bg-stone-200 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border-stone-300 hover:border-emerald-300 flex items-center gap-1 shadow-2xs"
                                  title={isEn ? 'Click to reactivate question' : 'Κάντε κλικ για επανενεργοποίηση'}
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{t.inactiveBadge}</span>
                                </button>
                              </td>

                              {/* 3. QUESTION TITLE & DETAILS (ALL ORIGINAL DATA PRESERVED) */}
                              <td className="py-2.5 px-4 font-medium text-stone-800">
                                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                  {localizedQ.missionTitle && (
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1">
                                      <Target className="w-3 h-3 text-stone-600" />
                                      <span>{localizedQ.missionTitle}</span>
                                    </span>
                                  )}
                                  {q.mediaUrl && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                      {q.mediaType === 'video' ? '🎥 ' + t.mediaTypeVideo : '📷 ' + t.mediaTypeImage}
                                    </span>
                                  )}
                                  {q.type === 'qr_scan' && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                                      🎟️ {(q as any).qrPayload}
                                    </span>
                                  )}
                                  {q.type === 'qr_scan' && !q.mediaUrl && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200">
                                      {isEn ? '⚠️ No Media Assigned' : '⚠️ Χωρίς Εκπ. Υλικό'}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-stone-400">
                                    #{globalIdx + 1}
                                  </span>
                                </div>
                                <div className="leading-snug text-xs sm:text-sm font-semibold text-stone-800">
                                  {localizedQ.title}
                                </div>
                                {localizedQ.explanation && localizedQ.explanation !== '-' && (
                                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 italic">
                                    {localizedQ.explanation}
                                  </p>
                                )}
                              </td>

                              {/* 4. CHOOSE TEAM (Original assignment preserved) */}
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                <select
                                  value={team.id}
                                  onChange={(e) => onChangeTeam(q.id, e.target.value)}
                                  className="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                                  style={{
                                    borderLeftColor: team.color,
                                    borderLeftWidth: '4px',
                                  }}
                                >
                                  {teams.map((tm) => (
                                    <option key={tm.id} value={tm.id}>
                                      {tm.avatar} {isEn ? `Team ${tm.number}: ${tm.titleEn || tm.title}` : `Ομάδα ${tm.number}: ${tm.title}`}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* 5. TYPE BADGE (Original type preserved) */}
                              <td className="py-2.5 px-3 whitespace-nowrap opacity-85">
                                {renderTypeBadge(q.type)}
                              </td>

                              {/* 6. POINTS (Original points preserved) */}
                              <td className="py-2.5 px-3 whitespace-nowrap font-bold text-stone-600 text-xs">
                                {q.points} {isEn ? 'pts' : 'πτ'}
                              </td>

                              {/* 7. ACTIONS (TEST, EDIT, DELETE) */}
                              <td className="py-2.5 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onTestQuestion(q)}
                                    className="px-2 py-1 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    {t.testButton}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onEditQuestion(q)}
                                    className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                                    title={t.editQuestionTooltip}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onDeleteQuestion(q.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                                    title={t.deleteQuestionTooltip}
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
