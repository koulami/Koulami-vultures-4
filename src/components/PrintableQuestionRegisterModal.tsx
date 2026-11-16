/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Question, Team } from '../types/game';
import { formatAllAnswersText, formatCorrectAnswerText, formatAssignedTeams } from '../utils/questionExportManager';
import {
  X,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  BookOpen,
  Image,
  AlertTriangle,
} from 'lucide-react';

interface PrintableQuestionRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  teams: Team[];
  language?: 'el' | 'en';
}

export const PrintableQuestionRegisterModal: React.FC<PrintableQuestionRegisterModalProps> = ({
  isOpen,
  onClose,
  questions,
  teams,
  language = 'el',
}) => {
  const isEn = language === 'en';

  // Filters for printing register
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [languageMode, setLanguageMode] = useState<'both' | 'el' | 'en'>('both');
  const [printBlockedNotice, setPrintBlockedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setPrintBlockedNotice(false);
    }
  }, [isOpen]);

  // Filtered question set
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Team filter
      if (teamFilter !== 'all') {
        if (!q.assignedTeamIds || !q.assignedTeamIds.includes(teamFilter)) {
          return false;
        }
      }
      // 2. Status filter
      if (statusFilter === 'active' && !q.isActive) return false;
      if (statusFilter === 'inactive' && q.isActive) return false;
      // 3. Type filter
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;

      return true;
    });
  }, [questions, teamFilter, statusFilter, typeFilter]);

  const totalPoints = useMemo(() => {
    return filteredQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
  }, [filteredQuestions]);

  const activeCount = useMemo(() => {
    return filteredQuestions.filter((q) => q.isActive).length;
  }, [filteredQuestions]);

  if (!isOpen) return null;

  const escapeHtml = (val: unknown): string => {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const handleDownloadPrintableHtml = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const docTitle = isEn
      ? 'Official Educational Question Register'
      : 'Επίσημο Μητρώο Εκπαιδευτικών Ερωτήσεων & Αποστολών';

    const cardsHtml = filteredQuestions
      .map((q, idx) => {
        const qAny = q as any;
        const assignedTeamsText = formatAssignedTeams(q.assignedTeamIds, teams, language);
        const allAnswers = formatAllAnswersText(q, language);
        const correctAnswer = formatCorrectAnswerText(q, language);
        const showGreek = languageMode === 'both' || languageMode === 'el';
        const showEnglish = (languageMode === 'both' || languageMode === 'en') && (qAny.titleEn || qAny.explanationEn);

        return `
          <article class="card">
            <div class="card-top">
              <div class="badges">
                <span class="num">#${idx + 1}</span>
                <span class="qid">${escapeHtml(q.id)}</span>
                <span class="status ${q.isActive ? 'active' : 'inactive'}">${q.isActive ? (isEn ? 'Active' : 'Ενεργή') : (isEn ? 'Inactive' : 'Ανενεργή')}</span>
                <span class="qtype">${escapeHtml(getTypeLabel(q.type))}</span>
              </div>
              <div class="meta-right">
                <span class="diff">${escapeHtml(getDifficultyBadge(q.difficulty))}</span>
                <span class="pts">${escapeHtml(q.points)} pts</span>
              </div>
            </div>
            <div class="sub">
              <div><strong>${isEn ? 'Assigned Teams:' : 'Ανατεθειμένη Ομάδα:'}</strong> ${escapeHtml(assignedTeamsText)}</div>
              ${q.missionTitle ? `<div class="mission">🎯 ${escapeHtml(q.missionTitle)}</div>` : ''}
            </div>
            ${showGreek ? `<div class="prompt"><span class="lbl">${isEn ? 'Greek Question Prompt:' : 'Εκφώνηση Ερώτησης:'}</span><h3>${escapeHtml(q.title)}</h3></div>` : ''}
            ${showEnglish && qAny.titleEn ? `<div class="prompt-en"><span class="lbl">English Translation:</span><p>${escapeHtml(qAny.titleEn)}</p></div>` : ''}
            <div class="box">
              <span class="lbl">${isEn ? 'All Answer Options:' : 'Όλες οι Επιλογές Απάντησης:'}</span>
              <div class="mono">${escapeHtml(allAnswers)}</div>
            </div>
            <div class="box answer">
              <span class="lbl">${isEn ? 'Verified Correct Answer:' : 'Επίσημη Σωστή Απάντηση:'}</span>
              <div><strong>${escapeHtml(correctAnswer)}</strong></div>
            </div>
            ${
              q.explanation || qAny.explanationEn
                ? `<div class="box notes">
                    <span class="lbl">${isEn ? 'Scientific Explanation & Notes:' : 'Επιστημονική Επεξήγηση Πεδίου:'}</span>
                    ${showGreek && q.explanation ? `<p>${escapeHtml(q.explanation)}</p>` : ''}
                    ${showEnglish && qAny.explanationEn ? `<p class="en">${escapeHtml(qAny.explanationEn)}</p>` : ''}
                  </div>`
                : ''
            }
            ${q.mediaUrl ? `<div class="media"><strong>${isEn ? 'Media Resource:' : 'Πολυμέσο:'}</strong> ${escapeHtml(q.mediaUrl)}</div>` : ''}
          </article>
        `;
      })
      .join('\n');

    const html = `<!doctype html>
<html lang="${isEn ? 'en' : 'el'}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1917; background: #f5f5f4; margin: 0; padding: 20px; }
    .toolbar { max-width: 900px; margin: 0 auto 16px; background: #1c1917; color: #fff; padding: 12px 18px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .toolbar button { background: #d97706; color: #1c1917; border: none; font-weight: 800; padding: 9px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .page { max-width: 900px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 16px; border: 1px solid #e7e5e4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #1c1917; padding-bottom: 14px; margin-bottom: 20px; }
    .header h1 { margin: 6px 0 4px; font-size: 20px; }
    .header p { margin: 0; font-size: 12px; color: #57534e; }
    .badge { display: inline-block; font-size: 11px; font-weight: 800; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; padding: 2px 8px; border-radius: 6px; }
    .summary { text-align: right; background: #fafaf9; border: 1px solid #e7e5e4; padding: 10px 14px; border-radius: 10px; font-size: 12px; white-space: nowrap; }
    .card { border: 1px solid #d6d3d1; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; background: #fff; }
    .card-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px; margin-bottom: 8px; font-size: 11px; }
    .badges, .meta-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .num { background: #1c1917; color: #fff; font-weight: 800; padding: 2px 7px; border-radius: 6px; }
    .qid { font-family: monospace; background: #fafaf9; border: 1px solid #e7e5e4; padding: 2px 6px; border-radius: 5px; }
    .status.active { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 7px; border-radius: 5px; font-weight: 700; }
    .status.inactive { background: #e7e5e4; color: #57534e; padding: 2px 7px; border-radius: 5px; font-weight: 700; }
    .qtype { background: #fef3c7; color: #78350f; border: 1px solid #fcd34d; padding: 2px 7px; border-radius: 5px; font-weight: 700; }
    .pts { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 5px; font-weight: 800; }
    .sub { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; font-size: 11px; color: #57534e; margin-bottom: 8px; }
    .mission { background: #f5f5f4; padding: 2px 8px; border-radius: 5px; font-weight: 600; }
    .lbl { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #78716c; margin-bottom: 2px; }
    .prompt h3 { margin: 0 0 8px; font-size: 14px; line-height: 1.4; }
    .prompt-en p { margin: 0 0 8px; font-size: 12px; font-style: italic; color: #44403c; }
    .box { border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px 10px; margin-top: 6px; font-size: 12px; }
    .box.answer { background: #ecfdf5; border-color: #a7f3d0; color: #064e3b; }
    .box.notes { background: #f5f5f4; }
    .box.notes p { margin: 2px 0; line-height: 1.4; }
    .box.notes p.en { font-style: italic; color: #57534e; border-top: 1px solid #e7e5e4; padding-top: 4px; margin-top: 4px; }
    .mono { font-family: monospace; font-size: 11px; line-height: 1.45; }
    .media { margin-top: 6px; font-size: 11px; color: #57534e; word-break: break-all; }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .page { border: none; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span><strong>${escapeHtml(docTitle)}</strong> (${filteredQuestions.length} ${isEn ? 'questions' : 'ερωτήσεις'})</span>
    <button onclick="window.print()">🖨️ ${isEn ? 'Print / Save as PDF' : 'Εκτύπωση / Αποθήκευση PDF'}</button>
  </div>
  <main class="page">
    <header class="header">
      <div>
        <span class="badge">LIFE with Vultures • LIFE18 NAT/CY/001018</span>
        <h1>${escapeHtml(docTitle)}</h1>
        <p>«Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο» (Gyps fulvus) • ${escapeHtml(new Date().toLocaleDateString())}</p>
      </div>
      <div class="summary">
        <div><strong>${filteredQuestions.length}</strong> ${isEn ? 'Questions' : 'Ερωτήσεις'}</div>
        <div>${totalPoints} pts • ${activeCount} ${isEn ? 'active' : 'ενεργές'}</div>
      </div>
    </header>
    ${cardsHtml}
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vulture-questions-register-${dateStr}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setPrintBlockedNotice(false);
  };

  const handlePrint = () => {
    setPrintBlockedNotice(false);
    let printDialogTriggered = false;
    const onBeforePrint = () => {
      printDialogTriggered = true;
    };
    window.addEventListener('beforeprint', onBeforePrint, { once: true });

    try {
      window.print();
    } catch {
      printDialogTriggered = false;
    }

    // In embedded preview iframes without allow-modals, window.print() fails silently
    setTimeout(() => {
      window.removeEventListener('beforeprint', onBeforePrint);
      if (!printDialogTriggered) {
        setPrintBlockedNotice(true);
      }
    }, 400);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return isEn ? 'Multiple Choice (Single)' : 'Πολλαπλή Επιλογή (Μονή)';
      case 'multiple_choice_multi':
        return isEn ? 'Multiple Choice (Multi)' : 'Πολλαπλή Επιλογή (Πολλαπλή)';
      case 'true_false':
        return isEn ? 'True / False' : 'Σωστό / Λάθος';
      case 'text_matching':
        return isEn ? 'Text Matching' : 'Αντιστοίχιση Εννοιών';
      case 'image_matching':
        return isEn ? 'Image Matching' : 'Οπτική Αναγνώριση';
      case 'qr_scan':
        return isEn ? 'QR Station Scan' : 'Σάρωση QR Σταθμού';
      case 'photo_upload':
        return isEn ? 'Photo Challenge' : 'Επιτόπια Φωτογραφία';
      case 'video_upload':
        return isEn ? 'Video Challenge' : 'Επιτόπιο Βίντεο Δράσης';
      default:
        return type;
    }
  };

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case 'easy':
        return isEn ? 'Easy (100 pts)' : 'Εύκολο (100 πόντοι)';
      case 'hard':
        return isEn ? 'Hard (200 pts)' : 'Δύσκολο (200 πόντοι)';
      default:
        return isEn ? 'Medium (150 pts)' : 'Μέτριο (150 πόντοι)';
    }
  };

  const modalContent = (
    <div className="printable-register-overlay fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-6">
      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: #1c1917 !important;
          }
          #root {
            display: none !important;
          }
          .printable-register-overlay {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
          }
          .print-area {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .print-scroll-body {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
          }
          .print-question-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #d6d3d1 !important;
            background: #ffffff !important;
            margin-bottom: 12px !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto print-area">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-stone-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {isEn ? 'Printable Question Register' : 'Εκτύπωση Λίστας Ερωτήσεων'}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {filteredQuestions.length} / {questions.length}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {isEn
                  ? 'Complete question pool register ready for classroom print or PDF export.'
                  : 'Πλήρες μητρώο δεξαμενής ερωτήσεων για εκτύπωση ή αποθήκευση σε PDF.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPrintableHtml}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title={isEn ? 'Download Printable Document (.html)' : 'Λήψη Εκτυπώσιμου Αρχείου (.html)'}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Save Printable (.html)' : 'Αποθήκευση Αρχείου (.html)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isEn ? 'Print / Save as PDF' : 'Εκτύπωση / Αποθήκευση PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title={isEn ? 'Close' : 'Κλείσιμο'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sandboxed Iframe Print Notice (if browser blocked window.print()) */}
        {printBlockedNotice && (
          <div className="no-print bg-amber-50 border-b border-amber-300 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>
                  {isEn
                    ? 'The preview frame blocked the system print dialog.'
                    : 'Το παράθυρο προεπισκόπησης μπλόκαρε τον διάλογο εκτύπωσης του προγράμματος περιήγησης.'}
                </strong>{' '}
                <span>
                  {isEn
                    ? 'Click "Save Printable (.html)" to download the formatted register and print/save as PDF from your browser, or open the Shared App URL in a regular browser tab.'
                    : 'Πατήστε «Αποθήκευση Αρχείου (.html)» για να κατεβάσετε τη διαμορφωμένη λίστα και να την εκτυπώσετε/αποθηκεύσετε ως PDF, ή ανοίξτε την εφαρμογή σε κανονική καρτέλα.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPrintableHtml}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download Printable (.html)' : 'Λήψη Εκτυπώσιμου (.html)'}</span>
            </button>
          </div>
        )}

        {/* Filter Controls Row (Hidden during print) */}
        <div className="no-print bg-stone-50 border-b border-stone-200 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEn ? 'Register Filters & Language Options:' : 'Φίλτρα Μητρώου & Επιλογές Γλώσσας:'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* 1. Team filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {isEn ? 'Team Assignment' : 'Ανάθεση σε Ομάδα'}
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{isEn ? 'All Teams (4)' : 'Όλες οι Ομάδες (4)'}</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.avatar} {isEn ? `Team ${t.number}: ${t.titleEn || t.title}` : `Ομάδα ${t.number}: ${t.title}`}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Status filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {isEn ? 'Active Status' : 'Κατάσταση Ερωτήσεων'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{isEn ? 'All Questions (Active + Inactive)' : 'Όλες (Ενεργές & Ανενεργές)'}</option>
                <option value="active">{isEn ? 'Active Only' : 'Μόνο Ενεργές'}</option>
                <option value="inactive">{isEn ? 'Inactive Only' : 'Μόνο Ανενεργές'}</option>
              </select>
            </div>

            {/* 3. Type filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {isEn ? 'Question Type' : 'Τύπος Ερώτησης'}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{isEn ? 'All Question Types' : 'Όλοι οι Τύποι'}</option>
                <option value="multiple_choice">{isEn ? 'Multiple Choice (Single)' : 'Πολλαπλή (Μονή)'}</option>
                <option value="multiple_choice_multi">{isEn ? 'Multiple Choice (Multi)' : 'Πολλαπλή (Πολλαπλή)'}</option>
                <option value="true_false">{isEn ? 'True / False' : 'Σωστό / Λάθος'}</option>
                <option value="text_matching">{isEn ? 'Text Matching' : 'Αντιστοίχιση Κειμένου'}</option>
                <option value="image_matching">{isEn ? 'Image Matching' : 'Οπτική Αναγνώριση'}</option>
                <option value="qr_scan">{isEn ? 'QR Scan' : 'Σάρωση QR'}</option>
                <option value="photo_upload">{isEn ? 'Photo Challenge' : 'Φωτογραφία Πεδίου'}</option>
                <option value="video_upload">{isEn ? 'Video Challenge' : 'Βίντεο Δράσης'}</option>
              </select>
            </div>

            {/* 4. Language Display Mode */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {isEn ? 'Language Display' : 'Εμφάνιση Γλώσσας'}
              </label>
              <select
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value as any)}
                className="w-full text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="both">{isEn ? 'Bilingual (Greek & English)' : 'Δίγλωσσο (Ελληνικά & Αγγλικά)'}</option>
                <option value="el">{isEn ? 'Greek Only' : 'Μόνο Ελληνικά'}</option>
                <option value="en">{isEn ? 'English Only' : 'Μόνο Αγγλικά'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="print-scroll-body p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Document Header (Shown on Paper and Screen) */}
          <div className="border-b-2 border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🦅</span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                  LIFE with Vultures • LIFE18 NAT/CY/001018
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {isEn
                  ? 'Official Educational Question Register'
                  : 'Επίσημο Μητρώο Εκπαιδευτικών Ερωτήσεων & Αποστολών'}
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                «Στο χείλος της εξαφάνισης - οι Γύπες στην Κύπρο» (Gyps fulvus) • Dataset Source: ekpaideytiki-anafora-gypes-2026-10-29.json
              </p>
            </div>

            <div className="text-right shrink-0 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {isEn ? 'Register Summary' : 'Σύνοψη Μητρώου'}
              </div>
              <div className="text-base font-black text-stone-900">
                {filteredQuestions.length} {isEn ? 'Questions' : 'Ερωτήσεις'}
              </div>
              <div className="text-xs text-stone-600 font-medium">
                {totalPoints} pts • {activeCount} {isEn ? 'active' : 'ενεργές'}
              </div>
            </div>
          </div>

          {/* List of Questions */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <p className="font-bold">
                {isEn ? 'No questions match the selected filters.' : 'Δεν βρέθηκαν ερωτήσεις με τα επιλεγμένα φίλτρα.'}
              </p>
              <button
                onClick={() => {
                  setTeamFilter('all');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-xs text-amber-700 underline font-bold"
              >
                {isEn ? 'Reset Filters' : 'Επαναφορά Φίλτρων'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const qAny = q as any;
                const assignedTeamsText = formatAssignedTeams(q.assignedTeamIds, teams, language);
                const allAnswers = formatAllAnswersText(q, language);
                const correctAnswer = formatCorrectAnswerText(q, language);

                const showGreek = languageMode === 'both' || languageMode === 'el';
                const showEnglish = (languageMode === 'both' || languageMode === 'en') && (qAny.titleEn || qAny.explanationEn);

                return (
                  <div
                    key={q.id}
                    className="print-question-card bg-stone-50/60 rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3"
                  >
                    {/* Top Row: Order, ID, Status, Type, Points */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-stone-900 text-white font-black flex items-center justify-center text-xs shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                          {q.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            q.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-200 text-stone-600 border-stone-300'
                          }`}
                        >
                          {q.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-stone-500" />}
                          <span>{q.isActive ? (isEn ? 'Active' : 'Ενεργή') : (isEn ? 'Inactive' : 'Ανενεργή')}</span>
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                          {getTypeLabel(q.type)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-500 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                          {getDifficultyBadge(q.difficulty)}
                        </span>
                        <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          {q.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Team & Mission Sub-header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                      <div>
                        <strong>{isEn ? 'Assigned Teams:' : 'Ανατεθειμένη Ομάδα:'}</strong>{' '}
                        <span className="font-medium text-stone-800">{assignedTeamsText}</span>
                      </div>
                      {q.missionTitle && (
                        <div className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-semibold text-stone-700">
                          🎯 {q.missionTitle}
                        </div>
                      )}
                    </div>

                    {/* Question Title (Greek / English) */}
                    <div className="space-y-1.5">
                      {showGreek && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                            {isEn ? 'Greek Question Prompt:' : 'Εκφώνηση Ερώτησης:'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                            {q.title}
                          </h3>
                        </div>
                      )}

                      {showEnglish && qAny.titleEn && (
                        <div className="pt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                            English Translation:
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-stone-700 italic leading-snug">
                            {qAny.titleEn}
                          </h4>
                        </div>
                      )}
                    </div>

                    {/* All Answer Options */}
                    <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                        {isEn ? 'All Answer Options:' : 'Όλες οι Επιλογές Απάντησης:'}
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-mono">
                        {allAnswers}
                      </p>
                    </div>

                    {/* Correct Answer Box */}
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-emerald-950 block">
                          {isEn ? 'Verified Correct Answer:' : 'Επίσημη Σωστή Απάντηση:'}
                        </span>
                        <span className="font-semibold text-emerald-900">
                          {correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Scientific Explanation */}
                    {(q.explanation || qAny.explanationEn) && (
                      <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200 space-y-1 text-xs text-stone-700">
                        <span className="font-bold text-stone-900 block flex items-center gap-1 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          {isEn ? 'Scientific Explanation & Notes:' : 'Επιστημονική Επεξήγηση Πεδίου:'}
                        </span>
                        {showGreek && q.explanation && (
                          <p className="leading-relaxed text-stone-800">{q.explanation}</p>
                        )}
                        {showEnglish && qAny.explanationEn && (
                          <p className="leading-relaxed text-stone-600 italic pt-1 border-t border-stone-200">
                            {qAny.explanationEn}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Media Reference (if present) */}
                    {q.mediaUrl && (
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-1">
                        <Image className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">
                          <strong>{isEn ? 'Media Resource:' : 'Πολυμέσο:'}</strong> {q.mediaUrl}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer (Hidden during print) */}
        <div className="no-print bg-stone-100 px-6 py-3.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div>
            <strong>{isEn ? 'Tip:' : 'Συμβουλή:'}</strong>{' '}
            {isEn
              ? 'Select "Save as PDF" in your browser print window to create an electronic document.'
              : 'Επιλέξτε «Αποθήκευση ως PDF» στον διάλογο εκτύπωσης για ψηφιακό αρχείο.'}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPrintableHtml}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Save Printable (.html)' : 'Αποθήκευση Αρχείου (.html)'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Print / Export PDF' : 'Εκτύπωση / Εξαγωγή PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isEn ? 'Close' : 'Κλείσιμο'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
