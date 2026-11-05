/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeamPosterData, ArenaRunReport } from '../types/posters';
import { defaultQuestions } from '../data/defaultGame';
import {
  X,
  FileSpreadsheet,
  FileCode,
  Printer,
  Download,
  CheckCircle2,
  Table,
  Layers,
  Award,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  posters: Record<string, TeamPosterData>;
  language?: 'el' | 'en';
}

export const AdminReportModal: React.FC<AdminReportModalProps> = ({
  isOpen,
  onClose,
  posters,
  language = 'el',
}) => {
  const isEn = language === 'en';
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const posterList = Object.values(posters);
  const totalScore = posterList.reduce((acc, p) => acc + p.score, 0);
  const totalQuestsCompleted = posterList.reduce((acc, p) => acc + p.completedQuestsCount, 0);

  // Generate CSV data string
  const generateCSV = (): string => {
    const headers = [
      'Αριθμός Ομάδας',
      'Τίτλος Ομάδας',
      'English Title',
      'Μέλη Ομάδας',
      'Σκορ (Πόντοι)',
      'Ολοκληρωμένες Αποστολές',
      'Σύνολο Αποστολών',
      'Wow Moment Αναστοχασμός',
      'Συντάκτης Σκέψης',
      'Ημερομηνία',
    ];

    const rows = posterList.map((p) => [
      `"${p.teamNumber}"`,
      `"${p.teamTitle}"`,
      `"${p.teamTitleEn}"`,
      `"${p.members.join('; ')}"`,
      `"${p.score}"`,
      `"${p.completedQuestsCount}"`,
      `"${p.totalQuestsCount}"`,
      `"${p.wowMomentQuote.replace(/"/g, '""')}"`,
      `"${p.quoteAuthor}"`,
      `"${p.createdAt}"`,
    ]);

    // UTF-8 BOM for Excel Greek character support
    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Vulture-Arena-Report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate JSON report
  const generateJSON = (): ArenaRunReport => {
    return {
      arenaId: 'vulture-cyprus-greece-arena-2026',
      arenaTitle: 'Αρένα Γυπών Κύπρου & Ελλάδας',
      reportDate: new Date().toISOString(),
      datasetSource: 'ekpaideytiki-anafora-gypes-2026-10-29.json',
      totalTeams: posterList.length,
      totalScore,
      totalQuestsCompleted,
      posters,
    };
  };

  const handleDownloadJSON = () => {
    const jsonReport = generateJSON();
    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Vulture-Arena-Report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSON = () => {
    const jsonReport = generateJSON();
    navigator.clipboard.writeText(JSON.stringify(jsonReport, null, 2));
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {isEn ? 'Management Dashboard & Field Reports' : 'Πίνακας Διαχείρισης & Εξαγωγή Αναφορών (Admin Panel)'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Export complete educational reports to PDF, CSV (Excel), and JSON.'
                  : 'Εξαγωγή πλήρων εκπαιδευτικών εκθέσεων σε PDF, CSV (Excel) και JSON.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isEn ? 'Active Teams' : 'Ενεργές Ομάδες'}
              </span>
              <span className="text-2xl font-black text-stone-900">
                {posterList.length} / 4
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isEn ? 'Total Points' : 'Συνολικοί Πόντοι'}
              </span>
              <span className="text-2xl font-black text-amber-600">
                {totalScore} pts
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isEn ? 'Completed Quests' : 'Ολοκληρωμένες Αποστολές'}
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {totalQuestsCompleted}
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isEn ? 'Dataset Source' : 'Βάση Δεδομένων'}
              </span>
              <span className="text-xs font-mono font-bold text-stone-700 truncate block mt-1">
                2026-10-29.json
              </span>
            </div>
          </div>

          {/* Export Action Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              {isEn ? 'Report Export Options' : 'Επιλογές Εξαγωγής Αναφοράς (Export Actions)'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. PDF / Print */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isEn ? 'PDF Export / Print' : 'Εξαγωγή σε PDF / Εκτύπωση'}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isEn
                      ? 'Official printable edition of team posters and reports for educators and classroom review.'
                      : 'Επίσημη εκτυπώσιμη έκδοση των αφισών και της αναφοράς για τον εκπαιδευτικό και τη σχολική μονάδα.'}
                  </p>
                </div>

                <button
                  onClick={handlePrintPDF}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {isEn ? 'Open PDF Print View' : 'Άνοιγμα Εκτύπωσης PDF'}
                </button>
              </div>

              {/* 2. CSV / Excel */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isEn ? 'Export to CSV (Excel)' : 'Εξαγωγή σε CSV (Excel)'}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isEn
                      ? 'Spreadsheet data table with scores, team members, quests, and reflections compatible with Excel and Google Sheets.'
                      : 'Πίνακας δεδομένων με βαθμολογία, μέλη ομάδων, αποστολές και αναστοχασμούς συμβατός με Microsoft Excel και Google Sheets.'}
                  </p>
                </div>

                <button
                  onClick={handleDownloadCSV}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isEn ? 'Download CSV File' : 'Λήψη Αρχείου CSV'}
                </button>
              </div>

              {/* 3. JSON Data Dump */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isEn ? 'Export to JSON' : 'Εξαγωγή σε JSON'}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isEn
                      ? 'Structured hierarchical JSON data package containing full educational records and poster metrics.'
                      : 'Πλήρες δομημένο ιεραρχικό αρχείο JSON με όλα τα δεδομένα της εκπαιδευτικής αναφοράς και των αφισών.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadJSON}
                    className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isEn ? 'Download JSON' : 'Λήψη JSON'}
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="px-3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
                    title={isEn ? 'Copy to clipboard' : 'Αντιγραφή στο πρόχειρο'}
                  >
                    {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Team Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5" />
              {isEn ? 'Team Summary Table' : 'Συγκεντρωτικός Πίνακας Ομάδων'}
            </h3>

            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{isEn ? 'Team' : 'Ομάδα'}</th>
                    <th className="py-3 px-4">{isEn ? 'Members' : 'Μέλη'}</th>
                    <th className="py-3 px-4">{isEn ? 'Score' : 'Σκορ'}</th>
                    <th className="py-3 px-4">{isEn ? 'Quests' : 'Αποστολές'}</th>
                    <th className="py-3 px-4">{isEn ? 'Team Reflection' : '«Κάτι που μας εντυπωσίασε»'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {posterList.map((p) => (
                    <tr key={p.teamId} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-900 whitespace-nowrap">
                        <span className="mr-1.5">{p.teamAvatar}</span>
                        {isEn ? (p.teamTitleEn || p.teamTitle) : p.teamTitle}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {p.members.join(', ')}
                      </td>
                      <td className="py-3 px-4 font-black text-amber-600 whitespace-nowrap">
                        {p.score} pts
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-stone-700 font-semibold">
                        {p.completedQuestsCount} / {p.totalQuestsCount}
                      </td>
                      <td className="py-3 px-4 text-stone-600 italic max-w-xs truncate" title={p.wowMomentQuote}>
                        {p.wowMomentQuote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 flex items-center justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
          >
            {isEn ? 'Close Panel' : 'Κλείσιμο Πίνακα'}
          </button>
        </div>
      </div>
    </div>
  );
};
