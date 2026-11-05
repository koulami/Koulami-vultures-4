/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';
import { Question } from '../types/game';
import { TeamPoster } from './TeamPoster';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Printer,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface TeacherPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  posters: TeamPosterData[];
  initialIndex?: number;
  language?: 'el' | 'en';
  allSubmissions?: TeamPhotoSubmission[];
  allQuestions?: Question[];
}

export const TeacherPresentationModal: React.FC<TeacherPresentationModalProps> = ({
  isOpen,
  onClose,
  posters,
  initialIndex = 0,
  language = 'el',
  allSubmissions = [],
  allQuestions = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isAutoPlay || !isOpen || posters.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 15000); // 15 seconds per poster

    return () => clearInterval(timer);
  }, [isAutoPlay, isOpen, posters.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % posters.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, posters.length, onClose]);

  if (!isOpen || posters.length === 0) return null;

  const currentPoster = posters[currentIndex] || posters[0];

  const isEn = language === 'en';

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-stone-950/95 text-stone-100 backdrop-blur-md'
      }`}
    >
      {/* Top Presentation Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">📽️</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-amber-400">
                {isEn ? 'Classroom Presentation Mode' : 'Λειτουργία Παρουσίασης Τάξης'}
              </h2>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                {currentIndex + 1} / {posters.length}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              {isEn
                ? 'Display Posters on Projector / Interactive Classroom Whiteboard'
                : 'Προβολή Αφισών στην Κεντρική Οθόνη / Διαδραστικό Πίνακα Τάξης'}
            </p>
          </div>
        </div>

        {/* Team Quick Jump Tabs */}
        <div className="hidden md:flex items-center gap-1.5 bg-stone-800/80 p-1 rounded-xl border border-stone-700">
          {posters.map((p, idx) => (
            <button
              key={p.teamId}
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentIndex === idx
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{p.teamAvatar}</span>
              <span>{isEn ? `Team ${p.teamNumber}` : `Ομάδα ${p.teamNumber}`}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Slideshow button */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isEn ? 'Auto slideshow every 15s (Spacebar)' : 'Αυτόματη εναλλαγή ανά 15 δευτερόλεπτα (Πλήκτρο Space)'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              isAutoPlay
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isEn ? (isAutoPlay ? 'Pause (15s)' : 'Auto Flow') : (isAutoPlay ? 'Παύση (15s)' : 'Αυτόματη Ροή')}
            </span>
          </button>

          {/* High contrast toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
              highContrast
                ? 'bg-amber-400 text-black border-amber-300'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title={isEn ? 'High contrast mode for classroom projectors' : 'Υψηλή αντίθεση για προβολείς'}
          >
            {highContrast ? (isEn ? 'Natural' : 'Φυσικό') : (isEn ? 'High Contrast' : 'Υψηλή Αντίθεση')}
          </button>

          {/* Print current poster */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 cursor-pointer"
            title={isEn ? 'Print current poster to PDF' : 'Εκτύπωση τρέχουσας αφίσας σε PDF'}
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 cursor-pointer"
            title={isEn ? 'Close (Escape)' : 'Κλείσιμο (Escape)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center relative">
        {/* Navigation Arrow Left */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length)}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 hover:border-amber-500 items-center justify-center transition-all shadow-xl z-20 group cursor-pointer"
          title={isEn ? 'Previous Poster (Left Arrow)' : 'Προηγούμενη Αφίσα (Αριστερό βέλος)'}
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Poster Container */}
        <div className="w-full transition-all duration-300">
          <TeamPoster
            poster={currentPoster}
            showActions={false}
            language={language}
            allSubmissions={allSubmissions}
            allQuestions={allQuestions}
          />
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % posters.length)}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 hover:border-amber-500 items-center justify-center transition-all shadow-xl z-20 group cursor-pointer"
          title={isEn ? 'Next Poster (Right Arrow)' : 'Επόμενη Αφίσα (Δεξί βέλος)'}
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Floating Keyboard Navigation Helper */}
      <div className="bg-stone-900/90 border-t border-stone-800 py-2.5 px-6 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-stone-300">
            {currentPoster.teamAvatar} {isEn ? `Team ${currentPoster.teamNumber}: ` : `Ομάδα ${currentPoster.teamNumber}: `}
            {isEn ? (currentPoster.teamTitleEn || currentPoster.teamTitle) : currentPoster.teamTitle}
          </span>
          {Array.isArray(currentPoster.members) &&
            currentPoster.members.some((m) => typeof m === 'string' && m.trim().length > 0) && (
              <>
                <span>•</span>
                <span>
                  {currentPoster.members
                    .filter((m) => typeof m === 'string' && m.trim().length > 0)
                    .join(', ')}
                </span>
              </>
            )}
        </div>

        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-stone-500">
          <span>{isEn ? 'Navigation: ← / →' : 'Πλοήγηση: ← / →'}</span>
          <span>•</span>
          <span>{isEn ? 'Space: Auto Flow' : 'Space: Αυτόματη Ροή'}</span>
          <span>•</span>
          <span>{isEn ? 'Esc: Exit' : 'Esc: Έξοδος'}</span>
        </div>
      </div>
    </div>
  );
};
