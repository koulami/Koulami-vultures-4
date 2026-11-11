/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';
import { Question } from '../types/game';
import { getAuthenticPhotosForTeam } from '../utils/teamPhotoManager';
import { Printer } from 'lucide-react';

interface TeamPosterProps {
  poster: TeamPosterData;
  onEdit?: () => void;
  onPresent?: () => void;
  showActions?: boolean;
  language?: 'el' | 'en';
  allSubmissions?: TeamPhotoSubmission[];
  allQuestions?: Question[];
}

/**
 * Approved, specific presentation topic headings for oral presentation.
 * Guides oral presentation without revealing answers or explanatory text.
 */
const TEAM_PRESENTATION_TOPICS: Record<
  string,
  { el: string[]; en: string[] }
> = {
  // TEAM 1 – ΓΕΝΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ & ΑΝΑΓΝΩΡΙΣΗ
  'team-characteristics': {
    el: [
      'Είδος γύπα στην Κύπρο',
      'Μέγεθος',
      'Βάρος',
      'Άνοιγμα φτερούγων',
      'Διάρκεια ζωής',
      'Αναπαραγωγή',
      'Κατάσταση διατήρησης',
    ],
    en: [
      'Vulture species in Cyprus',
      'Size',
      'Weight',
      'Wingspan',
      'Lifespan',
      'Reproduction',
      'Conservation status',
    ],
  },

  // TEAM 2 – ΠΕΡΙΒΑΛΛΟΝ, ΦΩΛΕΟΠΟΙΗΣΗ & ΠΤΗΣΗ
  'team-habitat-flight': {
    el: [
      'Φυσικός βιότοπος γύπα',
      'Φωλιά: τοποθεσία και υλικά κατασκευής',
      'Αναζήτηση τροφής',
      'Χρήση θερμών ανοδικών ρευμάτων',
      'Ύψος πτήσης',
      'Ενεργή αποικία φωλεοποίησης',
    ],
    en: [
      'Natural vulture habitat',
      'Nest: location and building materials',
      'Foraging for food',
      'Use of thermal updrafts',
      'Flight altitude',
      'Active breeding colony',
    ],
  },

  // TEAM 3 – ΔΙΑΤΡΟΦΗ, ΣΥΝΗΘΕΙΕΣ & ΑΞΙΕΣ
  'team-diet-habits': {
    el: [
      'Διατροφικές προτιμήσεις',
      'Προσαρμογή λαιμού',
      'Οξύτητα στομαχιού',
      'Ουροκένωση',
      'Κοινωνικότητα',
      'Εντοπισμός τροφής',
      'Αξία γύπα',
    ],
    en: [
      'Dietary preferences',
      'Neck adaptation',
      'Stomach acidity',
      'Urohidrosis',
      'Social behavior',
      'Locating food',
      'Value of vultures',
    ],
  },

  // TEAM 4 – ΑΠΕΙΛΕΣ, ΠΡΟΣΤΑΣΙΑ & ΛΥΣΕΙΣ
  'team-threats-protection': {
    el: [
      'Απειλές',
      'Δηλητηριασμένα δολώματα',
      'Έλλειψη τροφής',
      'Ηλεκτροπληξία',
      'Η πιο σημαντική απειλή',
      '«Εστιατόρια» για γύπες',
      'Ενίσχυση πληθυσμού',
      'Ειδική ομάδα σκύλων',
      'GPS',
    ],
    en: [
      'Threats',
      'Poisoned baits',
      'Food shortage',
      'Electrocution',
      'Most critical threat',
      'Vulture "restaurants"',
      'Population reinforcement',
      'Specialized dog unit',
      'GPS',
    ],
  },
};

export const TeamPoster: React.FC<TeamPosterProps> = ({
  poster,
  onEdit,
  onPresent,
  showActions = true,
  language = 'el',
  allSubmissions = [],
}) => {
  const isEn = language === 'en';

  const authenticPhotos = useMemo(() => {
    return getAuthenticPhotosForTeam(poster.teamId, poster, allSubmissions);
  }, [poster, allSubmissions]);

  const validMembers = useMemo(() => {
    if (!poster || !poster.members) return [];
    if (Array.isArray(poster.members)) {
      return poster.members
        .filter((m) => typeof m === 'string' && m.trim().length > 0)
        .map((m) => m.trim());
    }
    if (typeof poster.members === 'string') {
      return (poster.members as string)
        .split(/[,;&]/)
        .map((m) => m.trim())
        .filter((m) => m.length > 0);
    }
    return [];
  }, [poster?.members]);

  // Retrieve the approved presentation topic headings for the active team
  const topicHeadings = useMemo(() => {
    const predefined = TEAM_PRESENTATION_TOPICS[poster.teamId];
    if (predefined) {
      return isEn ? predefined.en : predefined.el;
    }

    // Fallback for custom teams: extract clean short headings without answers
    if (Array.isArray(poster.scientificFacts) && poster.scientificFacts.length > 0) {
      return poster.scientificFacts
        .slice(0, 9)
        .map((f) => {
          const headline = isEn ? (f.headlineEn || f.headline) : f.headline;
          if (typeof headline === 'string' && headline.trim().length > 0) {
            const words = headline.trim().split(/\s+/);
            return words.slice(0, 5).join(' ');
          }
          return isEn ? 'Presentation topic' : 'Θέμα παρουσίασης';
        });
    }

    return [];
  }, [poster.teamId, poster.scientificFacts, isEn]);

  const handlePrint = () => {
    window.print();
  };

  // Localized title
  const mainTitle = isEn
    ? (poster.teamTitleEn || poster.teamTitle)
    : poster.teamTitle;

  return (
    <div className="space-y-4">
      {/* Print stylesheet: natural landscape educational poster */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: #26241e !important;
          }
          .poster-natural-card {
            box-shadow: none !important;
            border: 1px solid #d8cfbe !important;
            background-color: #faf7f0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-width: 100% !important;
            padding: 24px !important;
          }
        }
      `}</style>

      {/* Action Toolbar (Screen only, hidden during print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#faf8f2] rounded-2xl border border-[#ded5c5] print:hidden shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-[#36462c] bg-[#e3ecd9] border border-[#c6d7b8]">
              {isEn ? `Team ${poster.teamNumber}` : `Ομάδα ${poster.teamNumber}`}
            </span>
            <span className="text-xs text-[#5c5647] font-medium">
              {isEn
                ? 'Environmental Presentation Poster'
                : 'Περιβαλλοντική Αφίσα Παρουσίασης'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3.5 py-1.5 rounded-xl border border-[#d2c7b5] bg-[#fbf9f4] hover:bg-[#f3ede1] text-xs font-semibold text-[#3b362c] transition-colors cursor-pointer"
              >
                {isEn ? 'Edit Poster' : 'Επεξεργασία Στοιχείων'}
              </button>
            )}
            {onPresent && (
              <button
                onClick={onPresent}
                className="px-3.5 py-1.5 rounded-xl bg-[#4d5d42] hover:bg-[#3c4a33] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {isEn ? 'Presentation' : 'Παρουσίαση'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#765d44] hover:bg-[#634e38] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / PDF' : 'Εκτύπωση / PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Educational Poster Board: Natural Earthy Palette, Soft Olive/Sage Accents */}
      <div
        id={`poster-${poster.teamId}`}
        className="poster-natural-card bg-[#faf7f0] rounded-[28px] border border-[#e2d9ca] p-6 sm:p-10 shadow-lg relative text-[#2b271f] transition-all overflow-hidden"
      >
        {/* Subtle Decorative Nature Corner Watermark (Botanical leaf contour) */}
        <svg
          aria-hidden="true"
          className="absolute -top-10 -right-10 w-48 h-48 text-[#5b6e4e]/8 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M42.7,-64.2C54.9,-57.8,64,-46.3,71.2,-33.5C78.4,-20.7,83.7,-6.6,80.7,6.3C77.7,19.2,66.4,30.9,56.1,42.4C45.8,53.9,36.5,65.2,24.6,71.5C12.7,77.8,-1.8,79.1,-15.7,75.7C-29.6,72.3,-42.9,64.2,-53.4,53.4C-63.9,42.6,-71.6,29.1,-75.7,14.3C-79.8,-0.5,-80.3,-16.6,-74.7,-30.2C-69.1,-43.8,-57.4,-54.9,-44.4,-61C-31.4,-67.1,-17.1,-68.2,-1.8,-65.4C13.5,-62.6,30.5,-70.6,42.7,-64.2Z" transform="translate(100 100)" />
        </svg>

        {/* Top Organic Sage Accent Line */}
        <div className="absolute top-0 left-10 right-10 h-1.5 rounded-b-full bg-gradient-to-r from-[#6e825e] via-[#8fa37d] to-[#6e825e]" />

        {/* 1. TOP SECTION: Team Number, Full Title & Discreet Score */}
        <header className="pb-5 border-b border-[#dfd6c4] relative">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-0.5 rounded-full bg-[#e7eee0] text-[#3c4e30] border border-[#c9d6be]">
                {isEn ? `TEAM ${poster.teamNumber}` : `ΟΜΑΔΑ ${poster.teamNumber}`}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#26231c] leading-tight">
                {mainTitle}
              </h1>
            </div>

            {/* Discreet score and completed missions */}
            <div className="self-start sm:self-auto bg-[#f0eae0]/90 px-3.5 py-1.5 rounded-xl border border-[#d8cdb9] text-xs sm:text-sm font-semibold text-[#544d3f] tabular-nums whitespace-nowrap shadow-2xs">
              <span className="text-[#2c281e] font-black">{poster.score}</span>{' '}
              <span className="text-[#726956]">{isEn ? 'pts' : 'βαθμοί'}</span>
              <span className="mx-2 text-[#9a917f]">·</span>
              <span className="text-[#2c281e] font-black">
                {poster.completedQuestsCount}/{poster.totalQuestsCount}
              </span>{' '}
              <span className="text-[#726956]">{isEn ? 'missions' : 'αποστολές'}</span>
            </div>
          </div>
        </header>

        {/* 2. MAIN SECTION: Authentic Photographs (Left) & Topic Headings (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 my-7 sm:my-9 items-center">
          
          {/* THE AUTHENTIC PHOTOGRAPHS OF THE CHILDREN, PROMINENTLY DISPLAYED */}
          <div className="lg:col-span-6 w-full">
            {authenticPhotos.length === 0 && (
              <div className="aspect-4/3 w-full rounded-2xl border border-dashed border-[#c5bba8] bg-[#f2eee3]/60 flex items-center justify-center p-6 text-center shadow-2xs">
                <span className="text-xs font-bold text-[#7d7463] tracking-widest uppercase">
                  {isEn ? 'Team Field Photograph' : 'Φωτογραφία Πεδίου Ομάδας'}
                </span>
              </div>
            )}

            {authenticPhotos.length === 1 && (() => {
              const photo = authenticPhotos[0];
              return (
                <div className="bg-[#ffffff] p-3 sm:p-3.5 rounded-2xl border border-[#ded5c5] shadow-sm">
                  <img
                    src={photo.photoUrl}
                    alt={isEn ? 'Team field photograph' : 'Φωτογραφία ομάδας'}
                    className="w-full aspect-4/3 object-cover rounded-xl"
                  />
                </div>
              );
            })()}

            {authenticPhotos.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {authenticPhotos.slice(0, 2).map((photo, pIdx) => (
                  <div
                    key={photo.id || pIdx}
                    className="bg-[#ffffff] p-2.5 rounded-2xl border border-[#ded5c5] shadow-xs"
                  >
                    <img
                      src={photo.photoUrl}
                      alt={isEn ? 'Team field photograph' : 'Φωτογραφία ομάδας'}
                      className="w-full aspect-4/3 object-cover rounded-xl"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPECIFIC TOPIC HEADINGS: Natural, Earthy, Elegant List */}
          <div className="lg:col-span-6 w-full space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#dfd6c4]">
              <span className="w-2 h-2 rounded-full bg-[#5b6e4e]" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#506144]">
                {isEn ? 'Presentation Topics' : 'Θέματα Παρουσίασης'}
              </h2>
            </div>

            <ul className="space-y-2.5 sm:space-y-3">
              {topicHeadings.map((heading, idx) => (
                <li
                  key={idx}
                  className="text-base sm:text-lg font-bold tracking-tight text-[#28251e] flex items-start gap-3 leading-snug"
                >
                  <span className="w-2 h-2 rounded-full bg-[#627754] shrink-0 mt-2 shadow-2xs" />
                  <span className="break-words">{heading}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. POSTER FOOTER: Discreet Team Members & Environmental Project Context */}
        <footer className="pt-4 mt-7 border-t border-[#dfd6c4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#635c4d]">
          <div>
            {validMembers.length > 0 && (
              <span>
                <strong className="font-bold text-[#353026]">
                  {isEn ? 'Team Members: ' : 'Μέλη Ομάδας: '}
                </strong>
                {validMembers.join(', ')}
              </span>
            )}
          </div>

          <div className="font-semibold text-[#5a6b4d] flex items-center gap-1.5">
            <span>●</span>
            <span>{isEn ? 'LIFE with Vultures Project • Cyprus' : 'Πρόγραμμα LIFE with Vultures • Κύπρος'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
