/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ClearGameDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => Promise<void> | void;
  language?: 'el' | 'en';
}

export const ClearGameDataModal: React.FC<ClearGameDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  language = 'el',
}) => {
  const isEn = language === 'en';
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleProceed = async () => {
    if (!isChecked || isClearing) return;
    setIsClearing(true);
    try {
      await onConfirmClear();
      setIsChecked(false);
      onClose();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-300 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {isEn
                  ? 'New Game – Clear Previous Game Data'
                  : 'Νέο παιχνίδι – Καθαρισμός προηγούμενων δεδομένων'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Administrator Action • Permanent Reset for a Fresh Session'
                  : 'Ενέργεια Διαχειριστή • Οριστικός Καθαρισμός για Νέα Σχολική Τάξη'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isClearing}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Κλείσιμο'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 flex-1">
          {/* Main Warning Box */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 font-black text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {isEn
                  ? 'Attention: Double confirmation required'
                  : 'Προσοχή: Απαιτείται διπλή επιβεβαίωση'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-rose-800">
              {isEn
                ? 'This action resets the educational game so you can start a fresh session with a new group of students. Please review what will be erased:'
                : 'Αυτή η ενέργεια επαναφέρει το εκπαιδευτικό παιχνίδι για να ξεκινήσετε μια νέα συνεδρία με νέα τάξη μαθητών. Ελέγξτε αναλυτικά τι θα διαγραφεί:'}
            </p>
          </div>

          {/* Breakdown: Deleted vs Preserved */}
          <div className="space-y-3.5">
            {/* Deleted list */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                {isEn ? 'Will be permanently deleted:' : 'Τι θα διαγραφεί οριστικά:'}
              </span>
              <ul className="text-xs text-stone-700 space-y-1.5 pl-5 list-disc">
                <li>
                  {isEn
                    ? 'All 4 student team posters (reverted to default scientific templates)'
                    : 'Και οι 4 αφίσες των ομάδων (επαναφορά στα αρχικά επιστημονικά πρότυπα)'}
                </li>
                <li>
                  {isEn
                    ? 'All student-uploaded photographs and authentic mission evidence'
                    : 'Όλα τα επιτόπια φωτογραφικά τεκμήρια που τράβηξαν/ανέβασαν οι μαθητές'}
                </li>
                <li>
                  {isEn
                    ? 'All student reflections and wow-moment quotes'
                    : 'Όλοι οι αναστοχασμοί των ομάδων («Κάτι που μας εντυπωσίασε»)'}
                </li>
                <li>
                  {isEn
                    ? 'All team scores, submitted answers, and quest progress'
                    : 'Όλα τα σκορ ομάδων, οι υποβολές απαντήσεων και η πρόοδος αποστολών'}
                </li>
                <li>
                  {isEn
                    ? 'Central server poster database (posters.json & submissions.json)'
                    : 'Η συγχρονισμένη βάση δεδομένων στον διακομιστή (posters.json & submissions.json)'}
                </li>
              </ul>
            </div>

            {/* Preserved list */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {isEn ? 'Safe & kept untouched:' : 'Τι ΔΕΝ θα διαγραφεί (Ασφαλές):'}
              </span>
              <ul className="text-xs text-emerald-900 space-y-1.5 pl-5 list-disc">
                <li>
                  <strong>
                    {isEn
                      ? 'Teacher-uploaded QR Station Videos and Photos'
                      : 'Τα επίσημα βίντεο & φωτογραφίες των σταθμών QR'}
                  </strong>{' '}
                  ({isEn ? 'e.g. VA-PARK-VALUES-2026.mp4' : 'π.χ. VA-PARK-VALUES-2026.mp4'})
                </li>
                <li>
                  {isEn
                    ? 'The complete question pool (all 75 official educational questions)'
                    : 'Η τράπεζα ερωτήσεων (όλες οι 75 ερωτήσεις και τυχόν τροποποιήσεις)'}
                </li>
                <li>
                  {isEn
                    ? 'The 4 research team profiles and configurations'
                    : 'Η βασική διαμόρφωση των 4 ερευνητικών ομάδων'}
                </li>
                <li>
                  {isEn ? 'Your administrator login session' : 'Η σύνδεση διαχειριστή (παραμένετε συνδεδεμένοι)'}
                </li>
              </ul>
            </div>
          </div>

          {/* Double-confirmation Checkbox */}
          <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                {isEn
                  ? 'I confirm that I want to permanently clear the previous game data and start a new game session.'
                  : 'Επιβεβαιώνω ότι επιθυμώ την οριστική διαγραφή των δεδομένων του προηγούμενου παιχνιδιού για την έναρξη νέου παιχνιδιού.'}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            {isEn ? 'Cancel' : 'Ακύρωση'}
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!isChecked || isClearing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm ${
              isChecked && !isClearing
                ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer shadow-rose-900/20 ring-2 ring-rose-500'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isClearing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>{isEn ? 'Clearing Data...' : 'Εκκαθάριση δεδομένων...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {isEn
                    ? 'Confirm & Clear for New Game'
                    : 'Οριστικός Καθαρισμός για Νέο Παιχνίδι'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
