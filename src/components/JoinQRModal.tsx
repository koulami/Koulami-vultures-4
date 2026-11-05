/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  Printer,
  Smartphone,
  ExternalLink,
  Users,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

interface JoinQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  roomPin?: string;
  language?: 'el' | 'en';
}

export const JoinQRModal: React.FC<JoinQRModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  roomPin = 'GYPES-2026',
  language = 'el',
}) => {
  const isEn = language === 'en';
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://vulture-arena.cy';
  const currentUrl = appUrl || `${baseUrl}?pin=${roomPin}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
              📱
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400">
                {isEn ? 'Team Connection QR Code' : 'QR Κωδικός Σύνδεσης Ομάδων'}
              </h2>
              <p className="text-xs text-stone-400">
                {isEn ? 'On the Brink of Extinction - Vultures in Cyprus' : 'Στο χείλος της εξαφάνισης - Οι γύπες στην Κύπρο'}
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              {isEn ? 'Live Arena Connected' : 'Ζωντανή Αρένα Συνδεδεμένη'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 pt-2">
              {isEn ? 'Scan to Join Immediately via Mobile or Tablet' : 'Σαρώστε για Άμεση Συμμετοχή από Κινητό ή Tablet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isEn
                ? 'Open your mobile camera, point at the QR code, and select your team to begin field missions.'
                : 'Ανοίξτε την κάμερα της συσκευής σας, στοχεύστε στον κωδικό και επιλέξτε την ομάδα σας για να ξεκινήσετε τις αποστολές.'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-lg inline-block relative group hover:border-amber-500 transition-colors">
              <QRCodeSVG
                value={currentUrl}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=128&q=80',
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>

            {/* Room PIN Tag */}
            <div className="mt-4 inline-flex items-center gap-2 bg-stone-100 border border-stone-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-stone-800">
              <span>{isEn ? 'Arena PIN:' : 'PIN Αρένας:'}</span>
              <span className="text-amber-700 text-sm tracking-wider">{roomPin}</span>
            </div>
          </div>

          {/* Direct Link Action */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>{isEn ? 'Direct URL Link:' : 'Άμεσος Σύνδεσμος (Direct URL):'}</span>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:underline flex items-center gap-1 text-[11px]"
              >
                {isEn ? 'Open' : 'Άνοιγμα'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full text-xs font-mono bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-700 select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{isEn ? 'Copied!' : 'Αντιγράφηκε!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Copy' : 'Αντιγραφή'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-left">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                1
              </span>
              <p className="text-[11px] font-semibold text-stone-800 leading-tight">
                {isEn ? 'Scan QR with camera' : 'Σάρωση QR με κάμερα'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                2
              </span>
              <p className="text-[11px] font-semibold text-stone-800 leading-tight">
                {isEn ? 'Select Team 1 - 4' : 'Επιλογή Ομάδας 1 - 4'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                3
              </span>
              <p className="text-[11px] font-semibold text-stone-800 leading-tight">
                {isEn ? 'Start Field Quests' : 'Έναρξη Αποστολών Πεδίου'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handlePrintQR}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            {isEn ? 'Print Classroom Stand' : 'Εκτύπωση Stand Τάξης'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {isEn ? 'Close' : 'Κλείσιμο'}
          </button>
        </div>
      </div>
    </div>
  );
};
