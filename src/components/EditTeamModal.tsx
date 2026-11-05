/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Team } from '../types/game';
import { X, Check, Palette } from 'lucide-react';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSaveTeam: (updatedTeam: Team) => void;
  language?: 'el' | 'en';
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  onSaveTeam,
  language = 'el',
}) => {
  const isEn = language === 'en';
  const [title, setTitle] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string>('#D97706');

  useEffect(() => {
    if (team) {
      setTitle(team.title);
      setTitleEn(team.titleEn);
      setAvatar(team.avatar);
      setSlogan(team.slogan);
      setDescription(team.description);
      setColor(team.color);
    }
  }, [team, isOpen]);

  if (!isOpen || !team) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTeam: Team = {
      ...team,
      title: title.trim(),
      titleEn: titleEn.trim(),
      avatar: avatar.trim(),
      slogan: slogan.trim(),
      description: description.trim(),
      color,
    };

    onSaveTeam(updatedTeam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${color}30`, color }}
            >
              {avatar || '🦅'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400">
                {isEn ? `Edit Team ${team.number} Details` : `Επεξεργασία Στοιχείων Ομάδας ${team.number}`}
              </h2>
              <p className="text-xs text-stone-400">
                {isEn ? 'Customize title, slogan, avatar, and color theme' : 'Προσαρμόστε τίτλο, σλόγκαν, avatar και χρώμα'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Avatar:
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                maxLength={4}
                className="w-full text-center text-2xl bg-stone-50 border border-stone-300 rounded-xl py-2 text-stone-900"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {isEn ? 'Team Title (Greek): *' : 'Τίτλος Ομάδας: *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {isEn ? 'English Team Title: *' : 'English Subtitle / Title:'}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {isEn ? 'Official Slogan: *' : 'Επίσημο Σλόγκαν: *'}
            </label>
            <textarea
              required
              rows={2}
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 italic"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {isEn ? 'Description & Focus: *' : 'Περιγραφή & Θεματολογία:'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {isEn ? 'Theme Accent (Hex Color):' : 'Χρώμα Θέματος (Hex Color):'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 p-0.5"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 uppercase"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Ακύρωση'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isEn ? 'Save Team' : 'Αποθήκευση Ομάδας'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
