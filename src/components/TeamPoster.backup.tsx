/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * RECOVERABLE BACKUP OF TeamPoster.tsx
 */

import React from 'react';
import { TeamPosterData } from '../types/posters';
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
  Dog,
  Radio,
  HeartHandshake,
  ZapOff,
  Quote,
  Printer,
  Share2,
} from 'lucide-react';

interface TeamPosterProps {
  poster: TeamPosterData;
  onEdit?: () => void;
  onPresent?: () => void;
  showActions?: boolean;
}

export const TeamPosterBackup: React.FC<TeamPosterProps> = ({
  poster,
  onEdit,
  onPresent,
  showActions = true,
}) => {
  const renderFactIcon = (iconName: string) => {
    const iconClass = 'w-5 h-5';
    switch (iconName) {
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

  return (
    <div className="space-y-4">
      {/* Action Toolbar (Hidden during print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200 print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: poster.teamColor }}>
              Ομάδα {poster.teamNumber}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Επιστημονική Αφίσα Ολοκλήρωσης Αποστολών
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                ✏️ Επεξεργασία Στοιχείων
              </button>
            )}
            {onPresent && (
              <button
                onClick={onPresent}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                📽️ Προβολή Παρουσίασης
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Εκτύπωση / PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Infographic Poster Board */}
      <div
        id={`poster-${poster.teamId}`}
        className="bg-white rounded-3xl border-2 border-stone-300 p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all print:p-6 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Top Decorative Color Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-3"
          style={{ backgroundColor: poster.teamColor }}
        />

        {/* Poster Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-stone-200">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-sm border-2 shrink-0"
              style={{
                backgroundColor: `${poster.teamColor}15`,
                borderColor: `${poster.teamColor}40`,
              }}
            >
              {poster.teamAvatar}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: poster.teamColor }}
                >
                  ΟΜΑΔΑ {poster.teamNumber}
                </span>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  VULTURE ARENA CYPRUS & GREECE
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Πιστοποιημένη Έρευνα
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {poster.teamTitle}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-stone-500">
                {poster.teamTitleEn} • Πρόγραμμα LIFE with Vultures (LIFE18 NAT/CY/001018)
              </p>
            </div>
          </div>

          {/* Score & Stamp Badge */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <div className="text-right">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Επίδοση Ομάδας
              </div>
              <div className="text-2xl sm:text-3xl font-black text-stone-900">
                {poster.score} <span className="text-sm font-bold text-amber-600">pts</span>
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                {poster.completedQuestsCount} από {poster.totalQuestsCount} Αποστολές
              </div>
            </div>

            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-inner text-center p-1"
              style={{
                borderColor: poster.teamColor,
                backgroundColor: `${poster.teamColor}10`,
                color: poster.teamColor,
              }}
            >
              <Award className="w-6 h-6 mb-0.5" />
              <span className="text-[9px] font-black uppercase tracking-tighter leading-none">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Slogan Banner */}
        <div
          className="my-6 p-4 rounded-2xl border font-bold text-sm sm:text-base text-center italic leading-relaxed"
          style={{
            backgroundColor: `${poster.teamColor}0c`,
            borderColor: `${poster.teamColor}30`,
            color: poster.teamColor,
          }}
        >
          {poster.slogan}
        </div>

        {/* Dynamic Hero Section: Photo + "Wow Moment" Reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-stretch">
          {/* Team Photo Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 shadow-xs">
            <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
              <img
                src={poster.photoUrl}
                alt={poster.photoCaption}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                📸 Επιτόπιο Τεκμήριο Πεδίου
              </div>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-stone-700 italic font-medium leading-relaxed">
                «{poster.photoCaption}»
              </p>
              <div className="mt-2 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                <span>Τεκμηρίωση Πεδίου</span>
                <span className="font-semibold text-stone-700">Cyprus & Greece 2026</span>
              </div>
            </div>
          </div>

          {/* Team "Wow Moment" Reflection Quote (7 cols) */}
          <div
            className="lg:col-span-7 rounded-2xl border-2 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-xs"
            style={{
              borderColor: `${poster.teamColor}40`,
              background: `linear-gradient(135deg, ${poster.teamColor}08 0%, #ffffff 100%)`,
            }}
          >
            <div className="absolute -right-4 -bottom-4 text-stone-100 opacity-60 pointer-events-none">
              <Quote className="w-36 h-36" style={{ color: `${poster.teamColor}15` }} />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-xs"
                  style={{ backgroundColor: poster.teamColor }}
                >
                  <Sparkles className="w-3 h-3" /> Το Δικό μας "WOW MOMENT"
                </span>
                <span className="text-xs text-stone-400 font-semibold">
                  Αναστοχασμός Ομάδας
                </span>
              </div>

              <blockquote className="text-sm sm:text-base font-semibold text-stone-900 leading-relaxed italic">
                {poster.wowMomentQuote}
              </blockquote>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: poster.teamColor }} />
                {poster.quoteAuthor || 'Εκπρόσωπος Ομάδας'}
              </div>

              {poster.members && poster.members.length > 0 && (
                <div className="text-stone-500 text-[11px]">
                  <strong>Ερευνητική Ομάδα:</strong> {poster.members.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scientific Infographic Facts Grid */}
        <div className="my-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" style={{ color: poster.teamColor }} />
              Κορυφαία Επιστημονικά Δεδομένα & Μετρήσεις (Infographic Core Facts)
            </h3>
            <span className="text-[11px] text-stone-400 font-medium">
              Βασισμένο στο ekpaideytiki-anafora-gypes-2026-10-29.json
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {poster.scientificFacts.map((fact) => (
              <div
                key={fact.id}
                className="bg-stone-50/80 rounded-2xl border border-stone-200 p-4 hover:bg-stone-50 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center border text-xs"
                      style={{
                        backgroundColor: `${poster.teamColor}15`,
                        borderColor: `${poster.teamColor}30`,
                        color: poster.teamColor,
                      }}
                    >
                      {renderFactIcon(fact.icon)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {fact.category}
                    </span>
                  </div>

                  {fact.stat && (
                    <div
                      className="text-lg font-black tracking-tight"
                      style={{ color: poster.teamColor }}
                    >
                      {fact.stat}
                    </div>
                  )}

                  <h4 className="text-xs font-bold text-stone-900 leading-snug">
                    {fact.headline}
                  </h4>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {fact.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Poster Footer Stamp */}
        <div className="mt-8 pt-4 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Vulture Cyprus & Greece Arena</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {poster.createdAt}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
            <span>Κωδικός Πιστοποίησης:</span>
            <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-700">
              VA-{poster.teamId.toUpperCase()}-{poster.createdAt.replace(/-/g, '')}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
