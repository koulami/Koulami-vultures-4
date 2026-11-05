/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Question,
  QuestionType,
  MultipleChoiceQuestion,
  MultipleChoiceMultiQuestion,
  TrueFalseQuestion,
  QRScanQuestion,
} from '../types/game';
import { defaultTeams } from '../data/defaultGame';
import {
  X,
  Check,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Link as LinkIcon,
  Eye,
  Target,
  FileCheck,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
  onSaveQuestion: (question: Question) => void;
  language?: Language;
}

// Helper to convert YouTube URL to Embed format
function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  questionToEdit,
  onSaveQuestion,
  language = 'el',
}) => {
  const isCreating = !questionToEdit;
  const t = translations[language];

  // Question Fields
  const [missionTitle, setMissionTitle] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [instruction, setInstruction] = useState<string>('');
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [points, setPoints] = useState<number>(100);
  const [explanation, setExplanation] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [assignedTeamIds, setAssignedTeamIds] = useState<string[]>(['team-characteristics']);
  const [locationFocus, setLocationFocus] = useState<'Cyprus' | 'Greece' | 'Both'>('Cyprus');

  // Media Attachment state (Photo or Video via Device Upload or Web URL)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options for multiple choice single / multi
  const [mcOptions, setMcOptions] = useState<Array<{ id: string; text: string }>>([
    { id: 'opt-a', text: 'Επιλογή 1' },
    { id: 'opt-b', text: 'Επιλογή 2' },
    { id: 'opt-c', text: 'Επιλογή 3' },
    { id: 'opt-d', text: 'Επιλογή 4' },
  ]);
  const [correctAnswerSingle, setCorrectAnswerSingle] = useState<string>('opt-a');
  const [correctAnswersMulti, setCorrectAnswersMulti] = useState<string[]>(['opt-a']);
  const [tfCorrect, setTfCorrect] = useState<boolean>(true);
  const [qrPayload, setQrPayload] = useState<string>('VA-STATION-NEW-2026');
  const [stationName, setStationName] = useState<string>('Σταθμός Πεδίου');

  useEffect(() => {
    if (questionToEdit) {
      setMissionTitle(questionToEdit.missionTitle || '');
      setTitle(questionToEdit.title);
      setInstruction(questionToEdit.instruction || '');
      setType(questionToEdit.type);
      setPoints(questionToEdit.points);
      setExplanation(questionToEdit.explanation || '');
      setIsActive(questionToEdit.isActive);
      setAssignedTeamIds(questionToEdit.assignedTeamIds);
      setLocationFocus((questionToEdit.locationFocus as any) || 'Both');

      // Populate media attachments if present
      if (questionToEdit.mediaUrl && questionToEdit.mediaType && questionToEdit.mediaType !== 'none') {
        setMediaType(questionToEdit.mediaType);
        setMediaUrl(questionToEdit.mediaUrl);
        setUploadedFileName(questionToEdit.mediaUrl.startsWith('data:') ? 'Επισυναπτόμενο αρχείο' : '');
      } else {
        setMediaType('none');
        setMediaUrl('');
        setUploadedFileName('');
      }

      if (questionToEdit.type === 'multiple_choice') {
        const mc = questionToEdit as MultipleChoiceQuestion;
        setMcOptions(mc.options && mc.options.length > 0 ? mc.options : [
          { id: 'opt-a', text: '' },
          { id: 'opt-b', text: '' },
          { id: 'opt-c', text: '' },
          { id: 'opt-d', text: '' },
        ]);
        setCorrectAnswerSingle(mc.correctAnswer || 'opt-a');
      } else if (questionToEdit.type === 'multiple_choice_multi') {
        const mcm = questionToEdit as MultipleChoiceMultiQuestion;
        setMcOptions(mcm.options && mcm.options.length > 0 ? mcm.options : [
          { id: 'opt-a', text: '' },
          { id: 'opt-b', text: '' },
          { id: 'opt-c', text: '' },
          { id: 'opt-d', text: '' },
        ]);
        setCorrectAnswersMulti(mcm.correctAnswers || ['opt-a']);
      } else if (questionToEdit.type === 'true_false') {
        setTfCorrect((questionToEdit as TrueFalseQuestion).correctAnswer);
      } else if (questionToEdit.type === 'qr_scan') {
        const qr = questionToEdit as QRScanQuestion;
        setQrPayload(qr.qrPayload);
        setStationName(qr.stationName);
      }
    } else {
      // Default empty question
      setMissionTitle('');
      setTitle('');
      setInstruction('');
      setType('multiple_choice');
      setPoints(100);
      setExplanation('');
      setIsActive(true);
      setAssignedTeamIds(['team-characteristics']);
      setLocationFocus('Cyprus');
      setMediaType('none');
      setMediaUrl('');
      setUploadedFileName('');
      setMcOptions([
        { id: 'opt-1', text: '' },
        { id: 'opt-2', text: '' },
        { id: 'opt-3', text: '' },
        { id: 'opt-4', text: '' },
      ]);
      setCorrectAnswerSingle('opt-1');
      setCorrectAnswersMulti(['opt-1']);
      setTfCorrect(true);
      setQrPayload('VA-STATION-CUSTOM-2026');
      setStationName('Σταθμός Πεδίου');
    }
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload (photo or video from user's files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type.startsWith('image/')) {
      setMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseId = questionToEdit?.id || `q-custom-${Date.now()}`;
    const cleanMediaType = mediaUrl.trim() !== '' ? mediaType : 'none';
    const cleanMediaUrl = mediaType !== 'none' ? mediaUrl.trim() : '';

    let finalQuestion: Question;

    const baseProps = {
      id: baseId,
      missionTitle: missionTitle.trim() || undefined,
      title: title.trim(),
      instruction: instruction.trim() || undefined,
      assignedTeamIds,
      points: Number(points),
      explanation: explanation.trim(),
      isActive,
      locationFocus,
      mediaType: cleanMediaType,
      mediaUrl: cleanMediaUrl || undefined,
      tags: questionToEdit?.tags || [],
    };

    if (type === 'multiple_choice') {
      finalQuestion = {
        ...baseProps,
        type: 'multiple_choice',
        options: mcOptions.filter((o) => o.text.trim().length > 0),
        correctAnswer: correctAnswerSingle,
      };
    } else if (type === 'multiple_choice_multi') {
      finalQuestion = {
        ...baseProps,
        type: 'multiple_choice_multi',
        options: mcOptions.filter((o) => o.text.trim().length > 0),
        correctAnswers: correctAnswersMulti,
      };
    } else if (type === 'true_false') {
      finalQuestion = {
        ...baseProps,
        type: 'true_false',
        correctAnswer: tfCorrect,
      };
    } else if (type === 'qr_scan') {
      finalQuestion = {
        ...baseProps,
        type: 'qr_scan',
        stationName,
        stationLocation: 'Κύπρος',
        qrPayload,
        fieldClue: 'Αναζητήστε τον κωδικό στον εκπαιδευτικό στύλο.',
        stationType: 'nesting_cliff',
      };
    } else {
      finalQuestion = {
        ...(questionToEdit || {}),
        ...baseProps,
        type,
      } as Question;
    }

    onSaveQuestion(finalQuestion);
    onClose();
  };

  const handleToggleTeam = (teamId: string) => {
    setAssignedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 flex items-center justify-between border-b border-stone-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
              ✏️
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400">
                {isCreating
                  ? language === 'el'
                    ? 'Προσθήκη Νέας Ερώτησης'
                    : 'Add New Question'
                  : language === 'el'
                  ? 'Επεξεργασία Ερώτησης'
                  : 'Edit Question'}
              </h2>
              <p className="text-xs text-stone-400">
                {language === 'el'
                  ? 'Ορίστε τίτλο αποστολής, εκφώνηση, επιλογές και επισυνάψτε φωτογραφία ή βίντεο από τα αρχεία σας.'
                  : 'Configure mission title, prompt, options, and attach reference photo or video.'}
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 flex-1">
          {/* 1. MISSION TITLE (ΤΙΤΛΟΣ ΑΠΟΣΤΟΛΗΣ - REQUESTED) */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-600" />
              <span>{t.missionTitleLabel}</span>
            </label>
            <input
              type="text"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder={
                language === 'el'
                  ? 'π.χ. Βάρος, pH Στομαχιού, Άνοιγμα Πτερύγων, Δηλητηριασμένα Δολώματα, Αναγνώριση...'
                  : 'e.g. Weight, Stomach pH, Wingspan, Poison Baits, Identification...'
              }
              className="w-full text-xs sm:text-sm bg-white border border-amber-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:font-normal placeholder:text-stone-400"
            />
            <p className="text-[11px] text-amber-800/80 mt-1">
              {language === 'el'
                ? 'Σύντομος τίτλος θέματος που θα εμφανίζεται ως επικεφαλίδα στην αποστολή της ομάδας.'
                : 'Short mission topic heading displayed on the team quest.'}
            </p>
          </div>

          {/* 2. QUESTION TITLE / PROMPT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {language === 'el' ? 'Εκφώνηση / Ερώτηση: *' : 'Prompt / Question Text: *'}
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === 'el'
                  ? 'π.χ. Ποιο είναι το μέσο άνοιγμα πτερύγων ενός ενήλικου Όρνιου (Gyps fulvus);'
                  : 'e.g. What is the average wingspan of an adult Griffon Vulture (Gyps fulvus)?'
              }
              className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* 3. MEDIA ATTACHMENT CARD (MATCHING USER SCREENSHOT EXACTLY) */}
          <div className="bg-[#0b101b] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            {/* Header Row of the Card: Title + Subtitle on Left, Pill Buttons on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-amber-400">
                    {t.mediaSectionTitle}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
                  {t.mediaSectionSubtitle}
                </p>
              </div>

              {/* Pill Button Group: [Εικόνα] [Βίντεο] [Χωρίς] */}
              <div className="inline-flex p-1 bg-[#060a12] border border-stone-800 rounded-xl self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('image');
                    if (!mediaUrl) handleTriggerFilePicker();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mediaType === 'image'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t.mediaTypeImage}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaType('video');
                    if (!mediaUrl) handleTriggerFilePicker();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mediaType === 'video'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{t.mediaTypeVideo}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMediaType('none');
                    setMediaUrl('');
                    setUploadedFileName('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mediaType === 'none'
                      ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.mediaTypeNone}
                </button>
              </div>
            </div>

            {/* Inner Row: Direct Upload from Device Button (Requested by user) */}
            <div className="bg-[#050811] border border-stone-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-stone-200">
                <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold">
                  {t.mediaDirectUpload}
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleTriggerFilePicker}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>{t.mediaChooseFile}</span>
              </button>
            </div>

            {/* Alternative Web URL Input & File Status */}
            <div className="space-y-2 pt-1 border-t border-stone-800/80">
              {uploadedFileName && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
                  <span className="flex items-center gap-1.5 font-medium truncate">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Επιλεγμένο αρχείο: <strong>{uploadedFileName}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setUploadedFileName('');
                      setMediaType('none');
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold ml-2 underline cursor-pointer"
                  >
                    Αφαίρεση
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="text-[11px] font-semibold text-stone-400">
                  {t.mediaWebUrlLabel}
                </span>
              </div>
              <input
                type="url"
                value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setMediaUrl(val);
                  setUploadedFileName('');
                  if (val.trim()) {
                    if (val.includes('youtube.com') || val.includes('youtu.be') || val.endsWith('.mp4')) {
                      setMediaType('video');
                    } else if (mediaType === 'none') {
                      setMediaType('image');
                    }
                  }
                }}
                placeholder={
                  mediaType === 'video'
                    ? 'https://www.youtube.com/watch?v=... ή https://...video.mp4'
                    : 'https://images.unsplash.com/... ή URL εικόνας διαδικτύου'
                }
                className="w-full text-xs bg-[#060a12] border border-stone-700 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono placeholder:text-stone-500"
              />
            </div>

            {/* Live Media Preview inside the modal */}
            {mediaUrl && (
              <div className="mt-3 p-3 bg-black/60 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.mediaPreviewTitle}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
                      {mediaType === 'image' ? t.mediaTypeImage : t.mediaTypeVideo}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setUploadedFileName('');
                        setMediaType('none');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> {t.mediaRemove}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center items-center overflow-hidden rounded-xl bg-black max-h-52">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt="Προεπισκόπηση ερώτησης"
                      className="max-h-52 w-auto object-contain rounded-lg"
                    />
                  ) : isYouTubeUrl(mediaUrl) ? (
                    <div className="aspect-video w-full max-h-52">
                      <iframe
                        src={getYouTubeEmbedUrl(mediaUrl)}
                        title="Προεπισκόπηση βίντεο YouTube"
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      className="max-h-52 w-full rounded-lg"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. TYPE & POINTS (NO DIFFICULTY OR TAGS AS REQUESTED) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {t.filterType}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="multiple_choice">{t.type_multiple_choice}</option>
                <option value="multiple_choice_multi">{t.type_multiple_choice_multi}</option>
                <option value="true_false">{t.type_true_false}</option>
                <option value="text_matching">{t.type_text_matching}</option>
                <option value="image_matching">{t.type_image_matching}</option>
                <option value="qr_scan">{t.type_qr_scan}</option>
                <option value="photo_upload">{t.type_photo_upload}</option>
                <option value="video_upload">{t.type_video_upload}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {t.tablePoints} (Points):
              </label>
              <input
                type="number"
                min={20}
                max={500}
                step={10}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>
          </div>

          {/* 5. ASSIGNED TEAMS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              {t.tableTeamAssign}:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {defaultTeams.map((item) => {
                const isAssigned = assignedTeamIds.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleToggleTeam(item.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                      isAssigned
                        ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-400 shadow-2xs'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{item.avatar}</span>
                    <span className="truncate">
                      {language === 'el' ? `Ομάδα ${item.number}` : `Team ${item.number}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. TYPE-SPECIFIC CONFIGURATION */}
          {type === 'multiple_choice' && (
            <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                {language === 'el' ? 'Επιλογές Απάντησης (Επιλέξτε τη σωστή):' : 'Answer Options (Select correct):'}
              </label>
              {mcOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-mc"
                    checked={correctAnswerSingle === opt.id}
                    onChange={() => setCorrectAnswerSingle(opt.id)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMcOptions((prev) =>
                        prev.map((o) => (o.id === opt.id ? { ...o, text: val } : o))
                      );
                    }}
                    placeholder={`${language === 'el' ? 'Επιλογή' : 'Option'} ${idx + 1}...`}
                    className="flex-1 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800"
                  />
                </div>
              ))}
            </div>
          )}

          {type === 'multiple_choice_multi' && (
            <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                {language === 'el' ? 'Επιλογές Απάντησης (Επιλέξτε όλες τις σωστές):' : 'Answer Options (Select all correct):'}
              </label>
              {mcOptions.map((opt, idx) => {
                const isChecked = correctAnswersMulti.includes(opt.id);
                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setCorrectAnswersMulti((prev) =>
                          isChecked ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                        );
                      }}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMcOptions((prev) =>
                          prev.map((o) => (o.id === opt.id ? { ...o, text: val } : o))
                        );
                      }}
                      placeholder={`${language === 'el' ? 'Επιλογή' : 'Option'} ${idx + 1}...`}
                      className="flex-1 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {type === 'true_false' && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                {language === 'el' ? 'Ορθή Απάντηση:' : 'Correct Answer:'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="tf-correct"
                    checked={tfCorrect === true}
                    onChange={() => setTfCorrect(true)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span>{language === 'el' ? 'ΣΩΣΤΟ (True)' : 'TRUE'}</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="tf-correct"
                    checked={tfCorrect === false}
                    onChange={() => setTfCorrect(false)}
                    className="w-4 h-4 text-rose-600"
                  />
                  <span>{language === 'el' ? 'ΛΑΘΟΣ (False)' : 'FALSE'}</span>
                </label>
              </div>
            </div>
          )}

          {type === 'qr_scan' && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  {language === 'el' ? 'Όνομα Σταθμού:' : 'Station Name:'}
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  {language === 'el' ? 'Αναμενόμενος Κωδικός QR Token:' : 'Expected QR Token:'}
                </label>
                <input
                  type="text"
                  value={qrPayload}
                  onChange={(e) => setQrPayload(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg p-2 uppercase"
                />
              </div>
            </div>
          )}

          {/* 7. EXPLANATION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {language === 'el' ? 'Επιστημονική Επεξήγηση Πεδίου (Explanation): *' : 'Scientific Field Explanation: *'}
            </label>
            <textarea
              required
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={
                language === 'el'
                  ? 'Αναλυτική εξήγηση με βάση τα επιστημονικά δεδομένα του LIFE with Vultures...'
                  : 'Detailed explanation based on LIFE with Vultures scientific data...'
              }
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* 8. ACTIVE IN POOL TOGGLE */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                {language === 'el' ? 'Κατάσταση στη Δεξαμενή Ερωτήσεων' : 'Status in Game Pool'}
              </span>
              <span className="text-[11px] text-stone-500 block">
                {language === 'el'
                  ? 'Εάν είναι ενεργή, θα περιλαμβάνεται στον γύρο του παιχνιδιού.'
                  : 'If active, will be included in the game round.'}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className={isActive ? 'text-emerald-700 font-extrabold' : 'text-stone-400'}>
                {isActive ? t.activeBadge : t.inactiveBadge}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'el' ? 'Ακύρωση' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isCreating
                ? language === 'el'
                  ? 'Προσθήκη Ερώτησης'
                  : 'Add Question'
                : language === 'el'
                ? 'Αποθήκευση Αλλαγών'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
