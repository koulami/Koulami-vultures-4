/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Team } from '../types/game';
import { Award, Clock, CheckCircle2, FileText, ChevronRight, Sparkles, X, ShieldAlert } from 'lucide-react';

interface GameTimeExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | undefined;
  score: number;
  answeredCount: number;
  totalQuestions: number;
  language: 'el' | 'en';
  onViewPoster: () => void;
  onReviewQuestions: () => void;
  isAdminLoggedIn?: boolean;
  onAdminRecover?: () => void;
}

export const GameTimeExpiredModal: React.FC<GameTimeExpiredModalProps> = ({
  isOpen,
  onClose,
  team,
  score,
  answeredCount,
  totalQuestions,
  language,
  onViewPoster,
  onReviewQuestions,
  isAdminLoggedIn = false,
  onAdminRecover,
}) => {
  if (!isOpen) return null;

  const isEn = language === 'en';
  const teamTitle = team ? (isEn ? team.titleEn || team.title : team.title) : (isEn ? 'Research Team' : 'Ερευνητική Ομάδα');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center text-white relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Dismiss button (allows pupil to see their read-only screen) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
          title={isEn ? 'Close' : 'Κλείσιμο'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="space-y-3 pt-2">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-4xl mx-auto shadow-xl">
            🏁
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              {isEn ? 'Time Expired • Game Ended' : 'Ο Χρόνος Έληξε • Τέλος Αποστολής'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isEn ? 'Mission Time is Up!' : 'Ο Χρόνος της Αρένας Έληξε!'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
              {isEn
                ? 'All teams have completed their scheduled field time. All of your submitted answers and photos have been permanently saved.'
                : 'Όλες οι ομάδες ολοκλήρωσαν τον διαθέσιμο χρόνο πεδίου. Όλες οι απαντήσεις και οι φωτογραφίες σας έχουν αποθηκευτεί με ασφάλεια.'}
            </p>
          </div>
        </div>

        {/* Team Performance Summary Card */}
        {team && (
          <div
            className="bg-stone-950/80 border rounded-2xl p-5 text-left space-y-4"
            style={{ borderColor: `${team.color}60` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                  style={{
                    backgroundColor: `${team.color}20`,
                    borderColor: team.color,
                  }}
                >
                  {team.avatar}
                </div>
                <div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white inline-block mb-0.5"
                    style={{ backgroundColor: team.color }}
                  >
                    {isEn ? `Team ${team.number}` : `Ομάδα ${team.number}`}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {teamTitle}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  {isEn ? 'Total Points' : 'Βαθμολογία'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {score} <span className="text-xs font-normal text-stone-400">{isEn ? 'pts' : 'πτ'}</span>
                </span>
              </div>
            </div>

            {/* Answered Progress bar */}
            <div className="pt-2 border-t border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-400">
                  {isEn ? 'Completed Questions:' : 'Ολοκληρωμένες Ερωτήσεις:'}
                </span>
                <span className="text-white font-mono font-bold">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: team.color || '#f59e0b',
                    width: `${totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Administrator Recovery Section (When Admin is logged in) */}
        {isAdminLoggedIn && onAdminRecover && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Administrator Session Recovery' : 'Ανάκτηση Συνεδρίας Διαχειριστή'}</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              {isEn
                ? 'Return all teams safely to the waiting lobby. Clears expired session state while preserving all submitted answers, photos, scores, and questions.'
                : 'Επαναφέρετε όλες τις ομάδες με ασφάλεια στην αίθουσα αναμονής. Εκκαθαρίζει τη ληγμένη συνεδρία διατηρώντας όλες τις απαντήσεις, φωτογραφίες, σκορ και ερωτήσεις.'}
            </p>
            <button
              type="button"
              onClick={onAdminRecover}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>🔄</span>
              <span>
                {isEn ? 'Clear Expired State & Return to Lobby' : 'Επαναφορά στην Αίθουσα Αναμονής'}
              </span>
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onViewPoster}
            className="w-full sm:w-1/2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>{isEn ? 'View Team Poster' : 'Προβολή Αφίσας Ομάδας'}</span>
          </button>

          <button
            type="button"
            onClick={onReviewQuestions}
            className="w-full sm:w-1/2 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Review Questions' : 'Επισκόπηση Ερωτήσεων'}</span>
          </button>
        </div>

        {/* Explicit Dismiss Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
          >
            {isEn ? 'Dismiss and view current screen' : 'Κλείσιμο παραθύρου και προβολή οθόνης'}
          </button>
        </div>
      </div>
    </div>
  );
};
