/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { defaultTeams } from '../data/defaultGame';
import { teamScientificFactsMap } from '../data/teamScientificFacts';
import { TeamPosterData, TeamPhotoSubmission } from '../types/posters';
import { Question } from '../types/game';
import { isGenericStockUrl, getAuthenticPhotosForTeam, savePhotoSubmission } from '../utils/teamPhotoManager';
import {
  X,
  Upload,
  Sparkles,
  Camera,
  Check,
  Users,
  Image as ImageIcon,
  Quote,
  Lightbulb,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface CreatePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePoster: (poster: TeamPosterData) => void;
  initialTeamId?: string;
  existingPoster?: TeamPosterData;
  teamPhotoSubmissions?: TeamPhotoSubmission[];
  allQuestions?: Question[];
  language?: 'el' | 'en';
}

export const CreatePosterModal: React.FC<CreatePosterModalProps> = ({
  isOpen,
  onClose,
  onSavePoster,
  initialTeamId = 'team-characteristics',
  existingPoster,
  teamPhotoSubmissions = [],
  allQuestions = [],
  language = 'el',
}) => {
  const isEn = language === 'en';
  const formatMembers = (members: any): string => {
    if (!members) {
      return isEn
        ? 'Andreas Constantinou, Maria Georgiou, Nicolas Christodoulou'
        : 'Ανδρέας Κωνσταντίνου, Μαρία Γεωργίου, Νικόλας Χριστοδούλου';
    }
    if (Array.isArray(members)) {
      return members
        .filter((m) => typeof m === 'string' && m.trim().length > 0)
        .join(', ');
    }
    if (typeof members === 'string') {
      return members;
    }
    return '';
  };

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    existingPoster?.teamId || initialTeamId
  );
  const [membersInput, setMembersInput] = useState<string>(() =>
    formatMembers(existingPoster?.members)
  );

  // Filter out any legacy stock URLs
  const initialPhotoUrl =
    existingPoster?.photoUrl && !isGenericStockUrl(existingPoster.photoUrl)
      ? existingPoster.photoUrl
      : '';

  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl);
  const [photoCaption, setPhotoCaption] = useState<string>(
    initialPhotoUrl ? (existingPoster?.photoCaption || '') : ''
  );
  const [selectedActivityTitle, setSelectedActivityTitle] = useState<string>(
    'Επιτόπια Φωτογραφία Τεκμηρίου Ομάδας'
  );

  const [wowMomentQuote, setWowMomentQuote] = useState<string>(
    existingPoster?.wowMomentQuote ||
      '«Το πιο εκπληκτικό στοιχείο που μάθαμε ήταν ότι ο γυμνός λαιμός του γύπα αποτελεί εξελικτική προσαρμογή υγιεινής, ενώ τα πόδια του είναι επίπεδα επειδή δεν σκοτώνει ζωντανά ζώα όπως οι αετοί!»'
  );
  const [quoteAuthor, setQuoteAuthor] = useState<string>(
    existingPoster?.quoteAuthor || 'Μαρία Γεωργίου, Ερευνήτρια Ομάδας'
  );

  // Synchronize form fields when opening modal or when existingPoster changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTeamId(existingPoster?.teamId || initialTeamId);
      setMembersInput(formatMembers(existingPoster?.members));
      const validPhoto =
        existingPoster?.photoUrl && !isGenericStockUrl(existingPoster.photoUrl)
          ? existingPoster.photoUrl
          : '';
      setPhotoUrl(validPhoto);
      setPhotoCaption(validPhoto ? (existingPoster?.photoCaption || '') : '');
      if (existingPoster?.wowMomentQuote) {
        setWowMomentQuote(existingPoster.wowMomentQuote);
      }
      if (existingPoster?.quoteAuthor) {
        setQuoteAuthor(existingPoster.quoteAuthor);
      }
    }
  }, [isOpen, existingPoster, initialTeamId, isEn]);

  if (!isOpen) return null;

  const currentTeam = defaultTeams.find((t) => t.id === selectedTeamId) || defaultTeams[0];

  // Authentic photo submissions available for the selected team
  const availableTeamPhotos = getAuthenticPhotosForTeam(
    currentTeam.id,
    existingPoster,
    teamPhotoSubmissions
  );

  // Quick reflection inspiration prompts by team
  const inspirationPrompts: Record<string, string[]> = {
    'team-characteristics': [
      '«Μας εντυπωσίασε ότι το άνοιγμα πτερύγων φτάνει τα 2.80 μέτρα, αλλά τα πόδια τους είναι αδύναμα και επίπεδα γιατί δεν είναι κυνηγοί όπως οι αετοί!»',
      '«Ανακαλύψαμε ότι ο γυμνός λαιμός είναι μια θαυμαστή εξελικτική ασπίδα υγιεινής που αποστειρώνεται απευθείας από τον μεσογειακό ήλιο!»',
      '«Η όρασή τους είναι 8-10 φορές πιο οξεία από του ανθρώπου. Μπορούν να δουν ένα κουφάρι από 1.000 μέτρα ψηλά, χωρίς να βασίζονται καθόλου στην όσφρηση!»',
    ],
    'team-habitat-flight': [
      '«Μας μάγεψε η θερμική ανεμοπορία! Οι γύπες σχεδόν ποτέ δεν φτερουγίζουν: ανεβαίνουν σε σπείρες με θερμό αέρα και πετούν 150 χλμ την ημέρα με ελάχιστη ενέργεια.»',
      '«Συνειδητοποιήσαμε πόσο ευάλωτοι είναι: γεννούν μόνο 1 αυγό το χρόνο, οπότε ο θάνατος έστω και ενός ενήλικου πουλιού είναι ανεπανόρθωτο πλήγμα!»',
      '«Οι Λευκοί Γκρεμοί της Επισκοπής στην Κύπρο είναι ένα από τα πιο εντυπωσιακά παράκτια ενδιαιτήματα φωλεοποίησης σε όλη τη Μεσόγειο!»',
    ],
    'team-diet-habits': [
      '«Μας εντυπωσίασε ιδιαίτερα: Το στομάχι τους έχει pH 1.0 (υδροχλωρικό οξύ) και σκοτώνει άνθρακα, αλλαντίαση και χολέρα, προστατεύοντας τις πηγές νερού!»',
      '«Εντυπωσιαστήκαμε με τον ρόλο του αποκλειστικού πτωματοφάγου καθαριστή που δεν επιτίθεται ποτέ σε ζωντανά ζώα!»',
      '«Χωρίς τους γύπες, η κτηνοτροφία θα ξόδευε εκατομμύρια ευρώ σε καύσεις κουφαριών, επιβαρύνοντας την ατμόσφαιρα με χιλιάδες τόνους διοξειδίου του άνθρακα.»',
    ],
    'team-threats-protection': [
      '«Μας συγκίνησε η δουλειά των σκύλων Echo και Patrouch στην Κύπρο που εκπαιδεύονται να εντοπίζουν τα δηλητήρια με ασφάλεια πριν τα βρουν τα πουλιά!»',
      '«Οι δορυφορικοί πομποί σώζουν ζωές: αν ένα Όρνιο παραμείνει ακίνητο, οι βιολόγοι του LIFE with Vultures λαμβάνουν άμεσο σήμα συναγερμού!»',
      '«Η μεταφορά πουλιών από την Ισπανία και η απελευθέρωσή τους στην Κύπρο είναι ένα πραγματικό θαύμα συνεργασίας για τη σωτηρία του είδους.»',
    ],
  };

  const inspirationPromptsEn: Record<string, string[]> = {
    'team-characteristics': [
      '“We were amazed that the wingspan reaches 2.80 meters, but their talons are weak and flat because they walk on the ground and do not hunt live prey!”',
      '“We discovered that the bare neck is a marvelous hygienic adaptation that is sterilized directly by the Mediterranean sun!”',
      '“Their eyesight is 8-10 times sharper than a human’s, allowing them to spot a carcass from thousands of meters high without relying on smell!”',
    ],
    'team-habitat-flight': [
      '“We were captivated by thermal soaring! Vultures rarely flap: they spiral upwards on warm air and travel 150 km a day with minimal energy.”',
      '“We realized how vulnerable they are: laying only 1 egg per year, so the loss of even one adult bird is an irreparable blow!”',
      '“The white cliffs of Episkopi in Cyprus are one of the most magnificent coastal nesting habitats in the entire Mediterranean!”',
    ],
    'team-diet-habits': [
      '“We were deeply impressed: Their stomach has a pH of 1.0 (hydrochloric acid) and destroys anthrax, botulism, and cholera, protecting water sources!”',
      '“We admired their vital role as nature’s cleaners who strictly eat dead animals and never attack live livestock!”',
      '“Without vultures, the livestock sector would spend millions incinerating carcasses, releasing thousands of tons of CO2 into the atmosphere.”',
    ],
    'team-threats-protection': [
      '“We were inspired by the work of detection dogs Echo and Patrouch in Cyprus, trained to locate illegal poisons before vultures find them!”',
      '“GPS solar transmitters save lives: if a Griffon stops moving, biologists immediately receive an emergency alarm to intervene!”',
      '“Bringing young vultures from Spain and releasing them in Cyprus is a remarkable international partnership to save the species.”',
    ],
  };

  const activeInspirationPrompts = isEn ? inspirationPromptsEn : inspirationPrompts;

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const dataUrl = uploadEvent.target.result as string;
          setPhotoUrl(dataUrl);
          const caption = `Επιτόπια φωτογραφία τεκμηρίωσης: ${file.name}`;
          setPhotoCaption(caption);

          // Save submission associated with this team
          const newSub: TeamPhotoSubmission = {
            id: `photo-sub-${Date.now()}`,
            teamId: currentTeam.id,
            questionId: 'manual-poster-upload',
            activityTitle: selectedActivityTitle,
            taskPrompt: caption,
            photoUrl: dataUrl,
            fileName: file.name,
            submittedAt: new Date().toISOString(),
            caption,
          };
          savePhotoSubmission(newSub);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectExistingPhoto = (sub: TeamPhotoSubmission) => {
    setPhotoUrl(sub.photoUrl);
    setPhotoCaption(sub.caption || sub.taskPrompt || sub.activityTitle);
    setSelectedActivityTitle(sub.activityTitle);
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const membersList = membersInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // Build authentic submitted photos list
    let updatedSubmissions = availableTeamPhotos;
    if (photoUrl && !isGenericStockUrl(photoUrl)) {
      const exists = updatedSubmissions.some((s) => s.photoUrl === photoUrl);
      if (!exists) {
        const newSub: TeamPhotoSubmission = {
          id: `photo-sub-${Date.now()}`,
          teamId: currentTeam.id,
          questionId: 'poster-activity-photo',
          activityTitle: selectedActivityTitle,
          taskPrompt: photoCaption || 'Αυθεντική φωτογραφία τεκμηρίωσης ομάδας.',
          photoUrl: photoUrl,
          submittedAt: new Date().toISOString(),
          caption: photoCaption,
        };
        updatedSubmissions = [newSub, ...updatedSubmissions];
        savePhotoSubmission(newSub);
      }
    }

    const newPoster: TeamPosterData = {
      teamId: currentTeam.id,
      teamNumber: currentTeam.number,
      teamTitle: currentTeam.title,
      teamTitleEn: currentTeam.titleEn,
      teamColor: currentTeam.color,
      teamAvatar: currentTeam.avatar,
      slogan: currentTeam.slogan,
      members: membersList.length > 0 ? membersList : ['Ερευνητές Ομάδας'],
      photoUrl: photoUrl,
      photoCaption: photoCaption,
      submittedPhotos: updatedSubmissions,
      wowMomentQuote:
        wowMomentQuote.trim() ||
        '«Ανακαλύψαμε τη σπουδαιότητα των γυπών ως αναντικατάστατων φυλάκων της οικολογικής ισορροπίας!»',
      quoteAuthor: quoteAuthor.trim() || 'Εκπρόσωπος Ομάδας',
      score: existingPoster?.score || 850,
      completedQuestsCount: existingPoster?.completedQuestsCount || 6,
      totalQuestsCount: existingPoster?.totalQuestsCount || 6,
      scientificFacts:
        teamScientificFactsMap[currentTeam.id] ||
        teamScientificFactsMap['team-characteristics'],
      createdAt: new Date().toISOString().split('T')[0],
      verifiedBy: 'LIFE with Vultures Educational Review',
    };

    onSavePoster(newPoster);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
              🎨
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {isEn ? 'Create / Edit Scientific Team Poster' : 'Δημιουργία Επιστημονικής Αφίσας Ομάδας'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Organize your team’s findings, authentic field photograph, and reflection.'
                  : 'Οργανώστε τα ευρήματα, τη φωτογραφία πεδίου και το "Wow Moment" της ομάδας σας.'}
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

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 flex-1">
          {/* 1. Team Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              {isEn ? '1. Select Team:' : '1. Επιλογή Ομάδας:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {defaultTeams.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setSelectedTeamId(t.id);
                    // auto pick appropriate reflection suggestion
                    const prompts = activeInspirationPrompts[t.id];
                    if (prompts && prompts.length > 0) {
                      setWowMomentQuote(prompts[0]);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    selectedTeamId === t.id
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-2xl">{t.avatar}</span>
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 block">
                      {isEn ? `Team ${t.number}: ${t.titleEn || t.title}` : `Ομάδα ${t.number}: ${t.title}`}
                    </span>
                    <span className="text-stone-500 text-[11px] truncate block">
                      {isEn ? (t.themeCategoryEn || t.themeCategory) : t.titleEn}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Team Members */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              {isEn ? '2. Team Members (Student / researcher names):' : '2. Μέλη Ομάδας (Ονόματα μαθητών/ερευνητών):'}
            </label>
            <input
              type="text"
              value={membersInput}
              onChange={(e) => setMembersInput(e.target.value)}
              placeholder={isEn ? 'e.g. Andreas C., Maria G., Nicolas C.' : 'π.χ. Ανδρέας Κ., Μαρία Γ., Νικόλας Χ.'}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              {isEn ? 'Separate names with a comma.' : 'Διαχωρίστε τα ονόματα με κόμμα.'}
            </p>
          </div>

          {/* 3. Authentic Photo Source (Activity Submissions & Device Upload) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-stone-500" />
                {isEn ? '3. Activity Photograph / Authentic Field Evidence:' : '3. Φωτογραφία Δραστηριότητας / Αυθεντικό Τεκμήριο:'}
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  {isEn ? 'Remove Photo' : 'Αφαίρεση Φωτογραφίας'}
                </button>
              )}
            </div>

            {/* If team has already submitted authentic activity photos in the arena */}
            {availableTeamPhotos.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-600 block">
                  {isEn
                    ? `Select from authentic activity submissions for ${currentTeam.titleEn || currentTeam.title}:`
                    : `Επιλέξτε από τα υποβληθέντα τεκμήρια δραστηριοτήτων της ${currentTeam.title}:`}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableTeamPhotos.map((sub, idx) => {
                    const isSelected = photoUrl === sub.photoUrl;
                    return (
                      <button
                        type="button"
                        key={sub.id || idx}
                        onClick={() => handleSelectExistingPhoto(sub)}
                        className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all aspect-4/3 flex flex-col justify-end p-2 bg-stone-900 ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-400'
                            : 'border-stone-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={sub.photoUrl}
                          alt={sub.caption || sub.activityTitle}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                        <div className="relative z-10 space-y-0.5">
                          <span className="text-[9px] font-bold text-amber-300 block truncate">
                            {sub.activityTitle}
                          </span>
                          <span className="text-[9px] text-stone-200 truncate block">
                            {sub.caption || (isEn ? 'Team Submission' : 'Υποβολή Ομάδας')}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-bold shadow-xs">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Device File Upload Option */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors">
                <Upload className="w-4 h-4" />
                {isEn ? 'Upload Activity Photograph' : 'Ανέβασμα Φωτογραφίας Δραστηριότητας'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomFileUpload}
                />
              </label>
              <span className="text-xs text-stone-500">
                {isEn
                  ? '(Authentic evidence from assigned field quests)'
                  : '(Αυθεντικό τεκμήριο από τις επιτόπιες αποστολές της ομάδας)'}
              </span>
            </div>

            {/* Selected Photo Preview / Empty State Info */}
            {photoUrl ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-amber-300">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-amber-950 block truncate">
                    {isEn ? '✓ Selected Authentic Team Evidence' : '✓ Επιλεγμένο Αυθεντικό Τεκμήριο Ομάδας'}
                  </span>
                  <span className="text-[11px] text-amber-800 truncate block">
                    {photoCaption || (isEn ? 'Field activity photo' : 'Επιτόπια φωτογραφία τεκμηρίωσης')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-600">
                ℹ️ <strong>{isEn ? 'Note:' : 'Σημείωση:'}</strong>{' '}
                {isEn
                  ? 'If no photograph has been taken, the poster will display a short informative message in expectation of the activity, never substituting generic stock photos.'
                  : 'Εάν δεν υποβληθεί φωτογραφία, η αφίσα θα εμφανίζει ενημερωτικό μήνυμα σε αναμονή της δραστηριότητας, χωρίς να υποκαθιστά γενικές εικόνες του διαδικτύου.'}
              </div>
            )}

            {/* Photo Caption */}
            {photoUrl && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isEn ? 'Caption / Activity Title:' : 'Λεζάντα / Τίτλος Δραστηριότητας:'}
                </label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder={isEn ? 'Brief description of the finding or activity...' : 'Σύντομη περιγραφή του ευρήματος ή της αποστολής...'}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* 4. "Something that impressed us:" Custom Reflection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isEn ? '4. Something that impressed us: (Team Reflection)' : '4. Κάτι που μας εντυπωσίασε: (Αναστοχασμός Ομάδας)'}
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                {isEn ? 'What impressed you most?' : 'Τι σας εντυπωσίασε περισσότερο;'}
              </span>
            </div>

            {/* Quick Suggestions Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                {isEn ? 'Ready scientific reflection ideas (click to select):' : 'Έτοιμες επιστημονικές ιδέες αναστοχασμού (κάντε κλικ για επιλογή):'}
              </span>
              <div className="flex flex-col gap-1.5">
                {(activeInspirationPrompts[selectedTeamId] || activeInspirationPrompts['team-characteristics']).map(
                  (prompt, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setWowMomentQuote(prompt)}
                      className="text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 border border-stone-200 text-xs text-stone-700 hover:text-stone-900 transition-colors italic truncate"
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </div>

            <textarea
              rows={3}
              value={wowMomentQuote}
              onChange={(e) => setWowMomentQuote(e.target.value)}
              placeholder={isEn ? 'Write your team’s reflection or impression...' : 'Γράψτε τη δική σας σκέψη ή αναστοχασμό...'}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed italic"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isEn ? 'Author / Signature:' : 'Συντάκτης / Υπογραφή Σκέψης:'}
                </label>
                <input
                  type="text"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder={isEn ? 'e.g. Maria Georgiou, Team 1' : 'π.χ. Μαρία Γεωργίου, Ομάδα 1'}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              {isEn ? 'Cancel' : 'Ακύρωση'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEn ? 'Save & Display Poster' : 'Δημιουργία & Προβολή Αφίσας'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
