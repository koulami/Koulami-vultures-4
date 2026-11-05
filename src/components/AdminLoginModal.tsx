/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  language?: 'el' | 'en';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language = 'el',
}) => {
  const isEn = language === 'en';
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validPins = ['2026', 'admin', 'vulture', 'gypes'];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (validPins.includes(pinInput.trim().toLowerCase())) {
      setErrorMsg(null);
      onLoginSuccess();
      onClose();
    } else {
      setErrorMsg(isEn ? 'Incorrect administrator password. Try: 2026' : 'Λανθασμένος κωδικός πρόσβασης διαχειριστή. Δοκιμάστε: 2026');
    }
  };

  const handleQuickLogin = () => {
    setPinInput('2026');
    setErrorMsg(null);
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
              🔐
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400">
                {isEn ? 'Administrator Login' : 'Σύνδεση Διαχειριστή (Admin Access)'}
              </h2>
              <p className="text-xs text-stone-400">
                {isEn ? 'Full management access to questions, teams & settings' : 'Πλήρης πρόσβαση σε αλλαγές ερωτήσεων, ομάδων & δεδομένων'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-200 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {isEn ? 'Enter Administrator PIN' : 'Εισαγωγή Κωδικού PIN Διαχειριστή'}
            </h3>
            <p className="text-xs text-stone-500">
              {isEn
                ? 'Enter your PIN to manage questions, teams, points, and posters.'
                : 'Εισάγετε τον κωδικό σας για να επεξεργαστείτε ερωτήσεις, ομάδες, πόντους και αφίσες.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {isEn ? 'Security PIN / Password:' : 'Κωδικός Πρόσβασης:'}
            </label>
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={isEn ? 'Enter PIN (e.g. 2026)' : 'Εισαγωγή PIN (π.χ. 2026)'}
              className="w-full text-center text-lg tracking-widest font-mono bg-stone-50 border border-stone-300 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Quick Demo Access Button */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="text-amber-900">
              <span className="font-bold block">{isEn ? 'Default PIN:' : 'Προκαθορισμένος κωδικός:'}</span>
              <code className="font-mono font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                2026
              </code>
            </div>
            <button
              type="button"
              onClick={handleQuickLogin}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isEn ? 'Instant Login' : 'Άμεση Είσοδος'}
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              {isEn ? 'Cancel' : 'Ακύρωση'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isEn ? 'Log In as Admin' : 'Σύνδεση ως Διαχειριστής'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
