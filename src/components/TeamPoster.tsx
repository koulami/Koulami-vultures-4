/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';
import { Question } from '../types/game';
import { getAuthenticPhotosForTeam, getTeamPhotoChallenges } from '../utils/teamPhotoManager';
import {
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  FileCheck,
  Maximize2,
  Sparkles,
  Eye,
  Footprints,
  Layers,
  Mountain,
  Egg,
  Wind,
  Trees,
  ShieldAlert,
  GitCommit,
  Hammer,
  ShieldCheck,
  CloudRain,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Heart,
  Gauge,
  Home,
  Sun,
  Dog,
  Radio,
  HeartHandshake,
  ZapOff,
  Quote,
  Printer,
  Camera,
  Upload,
  Check,
  MapPin,
  Users,
  Scale,
} from 'lucide-react';

interface TeamPosterProps {
  poster: TeamPosterData;
  onEdit?: () => void;
  onPresent?: () => void;
  showActions?: boolean;
  language?: 'el' | 'en';
  allSubmissions?: TeamPhotoSubmission[];
  allQuestions?: Question[];
}

const hasText = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

export const TeamPoster: React.FC<TeamPosterProps> = ({
  poster,
  onEdit,
  onPresent,
  showActions = true,
  language = 'el',
  allSubmissions = [],
  allQuestions = [],
}) => {
  const isEn = language === 'en';

  const authenticPhotos = useMemo(() => {
    return getAuthenticPhotosForTeam(poster.teamId, poster, allSubmissions);
  }, [poster, allSubmissions]);

  const assignedPhotoChallenges = useMemo(() => {
    return getTeamPhotoChallenges(poster.teamId, allQuestions);
  }, [poster.teamId, allQuestions]);

  const validMembers = useMemo(() => {
    if (!poster || !Array.isArray(poster.members)) return [];
    return poster.members
      .filter((m) => typeof m === 'string' && m.trim().length > 0)
      .map((m) => m.trim());
  }, [poster?.members]);

  const validFacts = useMemo(() => {
    if (!poster || !Array.isArray(poster.scientificFacts)) return [];
    return poster.scientificFacts.filter((fact) => {
      if (!fact || typeof fact !== 'object') return false;
      const statVal = isEn ? (fact.statEn || fact.stat) : fact.stat;
      const headlineVal = isEn ? (fact.headlineEn || fact.headline) : fact.headline;
      const detailVal = isEn ? (fact.detailEn || fact.detail) : fact.detail;
      return hasText(statVal) || hasText(headlineVal) || hasText(detailVal);
    });
  }, [poster?.scientificFacts, isEn]);

  // Priority sorting: Key scientific measurements & core metrics appear near the top of the grid
  const sortedFacts = useMemo(() => {
    return [...validFacts].sort((a, b) => {
      const aStat = isEn ? (a.statEn || a.stat) : a.stat;
      const bStat = isEn ? (b.statEn || b.stat) : b.stat;
      const aHasStat = hasText(aStat);
      const bHasStat = hasText(bStat);
      if (aHasStat && !bHasStat) return -1;
      if (!aHasStat && bHasStat) return 1;
      return 0;
    });
  }, [validFacts, isEn]);

  const renderFactIcon = (iconName: string) => {
    const iconClass = 'w-3 h-3 text-[#c2410c] shrink-0';
    switch (iconName) {
      case 'Scale': return <Scale className={iconClass} />;
      case 'Maximize2': return <Maximize2 className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'Eye': return <Eye className={iconClass} />;
      case 'Footprints': return <Footprints className={iconClass} />;
      case 'Layers': return <Layers className={iconClass} />;
      case 'Mountain': return <Mountain className={iconClass} />;
      case 'Egg': return <Egg className={iconClass} />;
      case 'Wind': return <Wind className={iconClass} />;
      case 'Compass': return <Compass className={iconClass} />;
      case 'Trees': return <Trees className={iconClass} />;
      case 'ShieldAlert': return <ShieldAlert className={iconClass} />;
      case 'GitCommit': return <GitCommit className={iconClass} />;
      case 'Hammer': return <Hammer className={iconClass} />;
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
      case 'CloudRain': return <CloudRain className={iconClass} />;
      case 'AlertOctagon': return <AlertOctagon className={iconClass} />;
      case 'AlertTriangle': return <AlertTriangle className={iconClass} />;
      case 'Clock': return <Clock className={iconClass} />;
      case 'Heart': return <Heart className={iconClass} />;
      case 'Gauge': return <Gauge className={iconClass} />;
      case 'Home': return <Home className={iconClass} />;
      case 'Sun': return <Sun className={iconClass} />;
      case 'Dog': return <Dog className={iconClass} />;
      case 'Radio': return <Radio className={iconClass} />;
      case 'HeartHandshake': return <HeartHandshake className={iconClass} />;
      case 'ZapOff': return <ZapOff className={iconClass} />;
      default: return <FileCheck className={iconClass} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Localized title
  const mainTitle = isEn
    ? (poster.teamTitleEn || poster.teamTitle)
    : poster.teamTitle;

  const displaySlogan = isEn && hasText(poster.sloganEn)
    ? poster.sloganEn.trim()
    : (poster.slogan || '').trim();

  const displayReflection = isEn && hasText(poster.wowMomentQuoteEn)
    ? poster.wowMomentQuoteEn.trim()
    : (poster.wowMomentQuote || '').trim();

  const displayReflectionAuthor = isEn && hasText(poster.quoteAuthorEn)
    ? poster.quoteAuthorEn.trim()
    : (poster.quoteAuthor || '').trim();

  return (
    <div className="space-y-4">
      {/* Print landscape configuration */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: #2b1d12 !important;
          }
          .poster-landscape-card {
            box-shadow: none !important;
            border: 1px solid #d4c8b6 !important;
            background-color: #faf7f2 !important;
            page-break-inside: avoid !important;
            max-width: 100% !important;
            padding: 16px !important;
          }
        }
      `}</style>

      {/* Action Toolbar (Hidden during print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#e6decf] print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-2xs"
              style={{ backgroundColor: poster.teamColor }}
            >
              {isEn ? `Team ${poster.teamNumber}` : `Ομάδα ${poster.teamNumber}`}
            </span>
            <span className="text-xs text-[#5c4a3d] font-semibold">
              {isEn
                ? 'Scientific Team Poster • Educational Infographic'
                : 'Επιστημονική Αφίσα Ομάδας • Educational Infographic Poster'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3.5 py-1.5 rounded-xl border border-[#d6c9b8] bg-[#fbf9f5] hover:bg-[#f5eee3] text-xs font-bold text-[#452c1a] transition-colors cursor-pointer"
              >
                {isEn ? '✏️ Edit Poster' : '✏️ Επεξεργασία Στοιχείων'}
              </button>
            )}
            {onPresent && (
              <button
                onClick={onPresent}
                className="px-3.5 py-1.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{isEn ? '📽️ Presentation' : '📽️ Παρουσίαση'}</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#3c2515] hover:bg-[#28180d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / PDF (Landscape)' : 'Εκτύπωση / PDF (Landscape)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Infographic Poster Board: Warm Beige & Cream, Brown/Orange Accents, Landscape Aspect Ratio */}
      <div
        id={`poster-${poster.teamId}`}
        className="poster-landscape-card bg-[#faf7f2] rounded-3xl border border-[#e3dacf] p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all text-[#2b1d12]"
        style={{
          backgroundImage: 'radial-gradient(#e7ded0 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Top Warm Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-2.5"
          style={{ backgroundColor: poster.teamColor || '#c2410c' }}
        />

        {/* 1. COMPACT HEADER AT THE TOP - Displays only the selected team's actual title in the selected language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2d7c5]">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Team Avatar Badge */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-xs border border-[#decbb7] bg-[#f2e9dc]"
            >
              {poster.teamAvatar}
            </div>

            <div className="min-w-0">
              {/* Selected Team's Actual Title in the Selected Language */}
              <h1 className="text-xl sm:text-2xl font-black text-[#382215] tracking-tight leading-snug truncate">
                {mainTitle}
              </h1>
            </div>
          </div>

          {/* Right Performance Pill */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto bg-[#ffffff]/90 px-3.5 py-2 rounded-2xl border border-[#e5dcce] shadow-2xs">
            <div className="text-right">
              <div className="text-[10px] font-extrabold text-[#8c654b] uppercase tracking-wider">
                {isEn ? 'Score' : 'Βαθμολογία'}
              </div>
              <div className="text-lg sm:text-xl font-black text-[#9a3412] leading-none">
                {poster.score} <span className="text-xs font-bold text-[#785b46]">pts</span>
              </div>
            </div>

            <div className="h-7 w-px bg-[#e5dcce]" />

            <div className="text-left">
              <div className="text-[10px] font-extrabold text-[#8c654b] uppercase tracking-wider">
                {isEn ? 'Quests' : 'Αποστολές'}
              </div>
              <div className="text-xs font-bold text-[#382215]">
                {poster.completedQuestsCount} / {poster.totalQuestsCount}
              </div>
            </div>

            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ml-1 shadow-2xs"
              style={{ backgroundColor: poster.teamColor || '#c2410c' }}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Slogan Ribbon (Compact) - Completely omitted if empty or whitespace */}
        {hasText(displaySlogan) && (
          <div className="my-3 px-4 py-1.5 rounded-xl bg-[#f4ebe0] border border-[#e4d6c4] text-xs font-bold text-[#633315] italic flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[#c2410c] font-black">❝</span>
              <span className="truncate">{displaySlogan}</span>
              <span className="text-[#c2410c] font-black">❞</span>
            </div>
            <span className="text-[10px] text-[#9a6747] font-semibold whitespace-nowrap hidden sm:inline">
              {isEn
                ? `Team ${poster.teamNumber} Slogan & Mission`
                : `Σύνθημα & Αποστολή Ομάδας ${poster.teamNumber}`}
            </span>
          </div>
        )}

        {/* 2. MAIN CONTENT IN SPACIOUS LANDSCAPE LAYOUT */}
        {/* Left: Actual Team Activity Photo | Right: Concise Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-start">
          
          {/* LEFT COLUMN: Team's Authentic Activity Photographs */}
          <div className={`${validFacts.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12 max-w-2xl mx-auto w-full'} flex flex-col space-y-3`}>
            {/* CASE 0: No photograph submitted yet -> Display educational message in selected language */}
            {authenticPhotos.length === 0 && (
              <div className="flex flex-col rounded-2xl border border-dashed border-[#d4c6b2] bg-[#fbf9f5] p-5 text-center justify-center items-center shadow-2xs min-h-[300px]">
                <div className="w-12 h-12 rounded-2xl bg-[#ede2d2] border border-[#dccdb9] flex items-center justify-center text-[#8c5738] mb-3">
                  <Camera className="w-6 h-6 text-[#9a3412]" />
                </div>
                <h3 className="text-sm font-bold text-[#3b271a] mb-1.5">
                  {isEn ? 'No Activity Photograph Submitted' : 'Εκκρεμεί Φωτογραφία Δραστηριότητας'}
                </h3>
                <p className="text-xs text-[#735a47] max-w-xs leading-relaxed mb-4">
                  {isEn
                    ? `No authentic photographs have been submitted yet for Team ${poster.teamNumber}'s assigned activities. Complete the field photo challenges in the arena to display genuine team documentation here.`
                    : `Δεν έχει υποβληθεί ακόμη αυθεντική φωτογραφία από τις ανατεθειμένες δραστηριότητες της Ομάδας ${poster.teamNumber}. Ολοκληρώστε τις προκλήσεις φωτογράφισης στην αρένα για να εμφανιστούν αυτόματα εδώ τα τεκμήρια.`}
                </p>

                {/* Display which activities require photo evidence */}
                {assignedPhotoChallenges.filter((ch) => hasText(ch.missionTitle || ch.title)).length > 0 && (
                  <div className="w-full bg-[#f4ebe0] rounded-xl p-3 border border-[#e2d5c3] text-left space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c5738] block">
                      {isEn ? 'Assigned Photo Challenges:' : 'Ανατεθειμένες Αποστολές Φωτογράφισης:'}
                    </span>
                    <div className="space-y-1">
                      {assignedPhotoChallenges
                        .filter((ch) => hasText(ch.missionTitle || ch.title))
                        .map((ch) => {
                          const challengeLabel = isEn
                            ? ((ch as any).missionTitleEn || (ch as any).titleEn || ch.missionTitle || ch.title || '').trim()
                            : (ch.missionTitle || ch.title || '').trim();
                          return (
                            <div key={ch.id} className="text-[11px] text-[#4a3423] flex items-center gap-1.5 font-medium">
                              <span className="text-[#c2410c] shrink-0">📸</span>
                              <span className="truncate">{challengeLabel}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9a3412] hover:bg-[#7c2d12] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isEn ? 'Upload Activity Photo' : 'Μεταφόρτωση Τεκμηρίου Ομάδας'}
                  </button>
                )}

                {validMembers.length > 0 && (
                  <div className="text-[10px] text-[#8c6c55] pt-3 mt-3 border-t border-[#ede4d6] w-full text-left">
                    <strong>{isEn ? 'Team Members:' : 'Μέλη Ομάδας:'}</strong> {validMembers.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* CASE 1: Single authentic photograph submitted */}
            {authenticPhotos.length === 1 && (() => {
              const photo = authenticPhotos[0];
              const pTitle = isEn
                ? (photo.activityTitleEn || photo.activityTitle || '').trim()
                : (photo.activityTitle || '').trim();
              const pCaption = isEn
                ? (photo.captionEn || photo.caption || photo.taskPromptEn || photo.taskPrompt || '').trim()
                : (photo.caption || photo.taskPrompt || '').trim();

              return (
                <div className="flex flex-col rounded-2xl border border-[#ded5c5] bg-[#ffffff] shadow-sm overflow-hidden">
                  <div className="relative aspect-4/3 w-full bg-[#20140c] overflow-hidden group">
                    <img
                      src={photo.photoUrl}
                      alt={pCaption || (isEn ? 'Team Field Evidence' : 'Φωτογραφία Ομάδας')}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    {hasText(pTitle) && (
                      <div className="absolute top-2.5 left-2.5 bg-[#2b190f]/85 backdrop-blur-xs text-[#f7eee4] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#6b472e] flex items-center gap-1.5 shadow-xs truncate max-w-[90%]">
                        <Camera className="w-3 h-3 text-[#f97316] shrink-0" />
                        <span className="truncate">{pTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2 bg-[#fdfcf9]">
                    {hasText(pCaption) && (
                      <p className="text-xs font-semibold text-[#3b271a] leading-relaxed italic">
                        «{pCaption}»
                      </p>
                    )}

                    {(hasText(pTitle) || poster.teamNumber) && (
                      <div className="pt-2 border-t border-[#ede4d6] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7d604c]">
                        {hasText(pTitle) && (
                          <span className="flex items-center gap-1 font-semibold text-[#5c371d] truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-[#c2410c] shrink-0" />
                            <span className="truncate">{pTitle}</span>
                          </span>
                        )}
                        <span className="text-[10px] bg-[#f4ebe0] px-2 py-0.5 rounded-md text-[#784e31] font-bold border border-[#e2d5c3] shrink-0">
                          {isEn ? `Team ${poster.teamNumber}` : `Ομάδα ${poster.teamNumber}`}
                        </span>
                      </div>
                    )}

                    {validMembers.length > 0 && (
                      <div className="text-[10px] text-[#8c6c55] pt-1">
                        <strong>{isEn ? 'Team Members:' : 'Μέλη Ομάδας:'}</strong> {validMembers.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* CASE 2+: Multiple authentic photographs submitted -> Balanced layout */}
            {authenticPhotos.length >= 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#7c5035] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>
                      {isEn
                        ? `Activity Photographs (${authenticPhotos.length})`
                        : `Τεκμήρια Δραστηριοτήτων Ομάδας (${authenticPhotos.length})`}
                    </span>
                  </span>
                  <span className="text-[10px] text-[#9e7a63] font-semibold">
                    {isEn ? 'Authentic Field Evidence' : 'Αυθεντικές Λήψεις Πεδίου'}
                  </span>
                </div>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {authenticPhotos.map((photo, pIdx) => {
                    const captionText = isEn
                      ? (photo.captionEn || photo.caption || photo.taskPromptEn || photo.taskPrompt || '').trim()
                      : (photo.caption || photo.taskPrompt || '').trim();
                    const titleText = isEn
                      ? (photo.activityTitleEn || photo.activityTitle || '').trim()
                      : (photo.activityTitle || '').trim();

                    return (
                      <div
                        key={photo.id || pIdx}
                        className="rounded-2xl border border-[#ded5c5] bg-[#ffffff] shadow-2xs overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-4/3 w-full bg-[#20140c] overflow-hidden group">
                          <img
                            src={photo.photoUrl}
                            alt={captionText || (isEn ? 'Field Evidence' : 'Φωτογραφία Πεδίου')}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          />
                          {titleText && (
                            <div className="absolute top-2 left-2 bg-[#2b190f]/85 backdrop-blur-xs text-[#f7eee4] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#6b472e] flex items-center gap-1 shadow-xs truncate max-w-[90%]">
                              <Camera className="w-2.5 h-2.5 text-[#f97316] shrink-0" />
                              <span className="truncate">{titleText}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 space-y-1.5 bg-[#fdfcf9] flex-1 flex flex-col justify-between">
                          {captionText && (
                            <p className="text-[11px] font-medium text-[#3b271a] leading-snug italic line-clamp-2">
                              «{captionText}»
                            </p>
                          )}

                          <div className="pt-1.5 border-t border-[#ede4d6] flex items-center justify-between text-[10px] text-[#7d604c]">
                            {titleText ? (
                              <span className="font-bold text-[#5c371d] truncate max-w-[140px]">
                                {titleText}
                              </span>
                            ) : (
                              <span />
                            )}
                            <span className="text-[9px] bg-[#f4ebe0] px-1.5 py-0.5 rounded text-[#784e31] font-semibold shrink-0">
                              {isEn ? `Team ${poster.teamNumber}` : `Ομάδα ${poster.teamNumber}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {validMembers.length > 0 && (
                  <div className="text-[10px] text-[#8c6c55] px-1">
                    <strong>{isEn ? 'Team Members:' : 'Μέλη Ομάδας:'}</strong> {validMembers.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Concise Information Cards (Rendered ONLY if valid facts exist) */}
          {sortedFacts.length > 0 && (
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#7c5035] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>
                    {isEn ? 'Core Scientific Data & Metrics' : 'Βασικά Επιστημονικά Δεδομένα & Μετρήσεις'}
                  </span>
                </h2>
                <span className="text-[10px] text-[#9e7a63] font-semibold">
                  LIFE with Vultures Data
                </span>
              </div>

              {/* 2-Column Grid of Concise Info Cards with Key Measurements Prioritized at the Top */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedFacts.map((fact) => {
                  const statText = isEn ? (fact.statEn || fact.stat) : fact.stat;
                  const headlineText = isEn ? (fact.headlineEn || fact.headline) : fact.headline;
                  const detailText = isEn ? (fact.detailEn || fact.detail) : fact.detail;
                  const categoryText = isEn ? (fact.categoryEn || fact.category) : fact.category;

                  const showIcon = hasText(fact.icon);
                  const showCategory = hasText(categoryText);
                  const showStat = hasText(statText);
                  const showHeadline = hasText(headlineText);
                  const showDetail = hasText(detailText);

                  // If empty card with no content, omit completely
                  if (!showStat && !showHeadline && !showDetail) return null;

                  return (
                    <div
                      key={fact.id}
                      className={`rounded-2xl border p-3.5 sm:p-4 shadow-2xs hover:border-[#cb9f7e] hover:shadow-xs transition-all flex flex-col justify-between ${
                        showStat
                          ? 'bg-gradient-to-b from-[#ffffff] to-[#fffdfa] border-[#decbb7]'
                          : 'bg-[#ffffff] border-[#e4d8c7]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        {/* Top Category Tag + Minimal Icon + Optional Metric Label */}
                        {(showCategory || showIcon) && (
                          <div className="flex items-center justify-between gap-1.5 mb-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f6eee2] text-[#8c5738] border border-[#e6d8c3] truncate max-w-full">
                              {showIcon && renderFactIcon(fact.icon)}
                              {showCategory && categoryText && <span className="truncate">{categoryText.trim()}</span>}
                            </span>
                            {showStat && (
                              <span className="text-[9px] font-bold text-[#c2410c] uppercase tracking-wider bg-[#fff2ea] px-1.5 py-0.5 rounded border border-[#fad2be] shrink-0">
                                {isEn ? 'Metric' : 'Μέτρηση'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Large, Bold Typography for Key Measurements & Facts */}
                        {showStat && statText && (
                          <div className="text-2xl sm:text-3xl font-black text-[#9a3412] tracking-tight leading-none mt-1">
                            {statText.trim()}
                          </div>
                        )}

                        {/* Short, punchy headline */}
                        {showHeadline && headlineText && (
                          <h3 className="text-xs sm:text-[13px] font-extrabold text-[#2a170c] leading-snug">
                            {headlineText.trim()}
                          </h3>
                        )}

                        {/* Concise supporting explanation */}
                        {showDetail && detailText && (
                          <p className="text-[11px] sm:text-xs text-[#543e30] leading-relaxed line-clamp-3">
                            {detailText.trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. COMPACT REFLECTION SECTION AT THE BOTTOM - Modest, compact, non-dominating */}
        {hasText(displayReflection) && (
          <div className="mt-3.5 pt-3 border-t border-[#e5dcce] flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-[#f7f2ea]/75 rounded-2xl px-4 py-2.5 border border-[#e3d8c8] shadow-2xs">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="w-5 h-5 rounded-lg bg-[#ede1d3] flex items-center justify-center text-[#9a3412] shrink-0 mt-0.5 border border-[#dccebe]">
                <Sparkles className="w-3 h-3 text-[#c2410c]" />
              </div>

              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#8c5738]">
                    {isEn ? 'Something that impressed us:' : 'Κάτι που μας εντυπωσίασε:'}
                  </span>
                  {hasText(displayReflectionAuthor) && (
                    <span className="text-[10px] text-[#9c7860] font-medium">
                      — {displayReflectionAuthor}
                    </span>
                  )}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="text-[10px] text-[#c2410c] hover:text-[#9a3412] font-semibold ml-1 cursor-pointer print:hidden hover:underline"
                      title={isEn ? 'Edit reflection' : 'Επεξεργασία αναστοχασμού'}
                    >
                      ✏️
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-[13px] font-medium text-[#382315] italic leading-relaxed">
                  {displayReflection}
                </p>
              </div>
            </div>

            {/* Verification Code Stamp */}
            {hasText(poster.teamId) && (
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono text-[9px] sm:text-[10px] text-[#7a5a43] bg-[#ffffff]/90 px-2.5 py-1 rounded-xl border border-[#ded2c0]">
                <span className="font-semibold text-[#8c6b54]">{isEn ? 'Code:' : 'Κωδικός:'}</span>
                <span className="font-extrabold text-[#9a3412]">
                  T{poster.teamNumber}-{poster.teamId.toUpperCase().slice(0, 8)}-{(poster.createdAt || '').replace(/-/g, '')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
