/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamScientificFact, TeamPosterData } from '../types/posters';

/**
 * Scientifically verified core facts and metrics for each of the 4 teams,
 * extracted directly from ekpaideytiki-anafora-gypes-2026-10-29.json
 */
import { CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS } from '../utils/posterContentSelector';

/**
 * Scientifically verified core facts and metrics for each of the 4 teams,
 * extracted directly and exclusively from the questions assigned to each team
 * in ekpaideytiki-anafora-gypes-2026-10-29.json.
 *
 * Focuses exclusively on the Griffon Vulture (Gyps fulvus) in Cyprus.
 */
export const teamScientificFactsMap: Record<string, TeamScientificFact[]> = {
  // TEAM 1: Γενικά Χαρακτηριστικά (General Characteristics)
  'team-characteristics': CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS.filter((f) =>
    f.id.startsWith('f-char-')
  ).map(({ id, icon, stat, statEn, headline, headlineEn, detail, detailEn, category, categoryEn }) => ({
    id,
    icon,
    stat,
    statEn,
    headline,
    headlineEn,
    detail,
    detailEn,
    category,
    categoryEn,
  })),

  // TEAM 2: Ενδιαίτημα, Φωλεοποίηση & Πτήση (Habitat, Nesting & Flight)
  'team-habitat-flight': CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS.filter((f) =>
    f.id.startsWith('f-hab-')
  ).map(({ id, icon, stat, statEn, headline, headlineEn, detail, detailEn, category, categoryEn }) => ({
    id,
    icon,
    stat,
    statEn,
    headline,
    headlineEn,
    detail,
    detailEn,
    category,
    categoryEn,
  })),

  // TEAM 3: Διατροφή, Συνήθειες & Αξίες (Diet, Habits & Values)
  'team-diet-habits': CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS.filter((f) =>
    f.id.startsWith('f-diet-')
  ).map(({ id, icon, stat, statEn, headline, headlineEn, detail, detailEn, category, categoryEn }) => ({
    id,
    icon,
    stat,
    statEn,
    headline,
    headlineEn,
    detail,
    detailEn,
    category,
    categoryEn,
  })),

  // TEAM 4: Απειλές & Μέτρα Προστασίας (Threats & Conservation Measures)
  'team-threats-protection': CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS.filter((f) =>
    f.id.startsWith('f-thr-')
  ).map(({ id, icon, stat, statEn, headline, headlineEn, detail, detailEn, category, categoryEn }) => ({
    id,
    icon,
    stat,
    statEn,
    headline,
    headlineEn,
    detail,
    detailEn,
    category,
    categoryEn,
  })),
};

/**
 * Curated authentic field photo presets for posters in Cyprus
 */
export const fieldPhotoPresets = [
  {
    id: 'photo-episkopi',
    title: 'Γκρεμοί Επισκοπής (Κύπρος)',
    category: 'Ενδιαίτημα',
    caption: 'Οι ιστορικοί λευκοί ασβεστολιθικοί γκρεμοί της Επισκοπής στη Λεμεσό πάνω από τη Μεσόγειο.',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cyprus Habitat',
  },
  {
    id: 'photo-flight',
    title: 'Πτήση Όρνιου σε Θερμικό Ρεύμα',
    category: 'Πτήση',
    caption: 'Όρνιο (Gyps fulvus) με ανοιγμένα τα ερετικά φτερά («δάχτυλα») σε θερμική ανεμοπορία.',
    url: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
    tag: 'Flight Soaring',
  },
  {
    id: 'photo-dog',
    title: 'Ομάδα Σκύλων Ανίχνευσης Δηλητηρίων',
    category: 'Προστασία',
    caption: 'Ειδικός σκύλος ανίχνευσης της ομάδας LIFE with Vultures σε περιπολία στην κυπριακή ύπαιθρο.',
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Canine Unit',
  },
  {
    id: 'photo-feeding',
    title: 'Τεχνητή Θέση Σίτισης (Ταΐστρα)',
    category: 'Διατροφή',
    caption: 'Όρνια συγκεντρωμένα στην ασφαλή περιφραγμένη ταΐστρα της επαρχίας Λεμεσού.',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    tag: 'Feeding Station',
  },
  {
    id: 'photo-diarizos',
    title: 'Κοιλάδα Διαρίζου (Πάφος - Κύπρος)',
    category: 'Ενδιαίτημα',
    caption: 'Η εύφορη κοιλάδα του ποταμού Διαρίζου, ζωτικός χώρος διατροφής και πτήσης του Όρνιου.',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Dhiarizos Cyprus',
  },
];

/**
 * Default sample team posters pre-populated with high-caliber field reflections
 */
export const initialDefaultPosters: Record<string, TeamPosterData> = {
  'team-characteristics': {
    teamId: 'team-characteristics',
    teamNumber: 1,
    teamTitle: 'Γενικά Χαρακτηριστικά',
    teamTitleEn: 'General Characteristics',
    teamColor: '#D97706',
    teamAvatar: '🦅',
    slogan: '«Οι Γίγαντες των Αιθέρων: Μορφολογία, Οξύτατη Όραση & Ανατομικές Προσαρμογές»',
    sloganEn: '«Giants of the Skies: Morphology, Keen Vision & Anatomical Adaptations»',
    members: ['Ανδρέας Κωνσταντίνου', 'Μαρία Γεωργίου', 'Νικόλας Χριστοδούλου'],
    photoUrl: '',
    photoCaption: '',
    photoCaptionEn: '',
    submittedPhotos: [],
    wowMomentQuote:
      '«Το πιο εκπληκτικό στοιχείο που μάθαμε είναι ότι ο γυμνός λαιμός του γύπα δεν είναι τυχαίος: είναι εξελικτική ασπίδα υγιεινής για να μην σαπίζουν τα φτερά, ενώ τα πόδια του είναι επίπεδα επειδή δεν σκοτώνει ζωντανά ζώα όπως οι αετοί!»',
    wowMomentQuoteEn:
      '«The most impressive fact we discovered is that the vulture’s bare neck is an evolutionary hygiene shield to prevent feather decay, while its feet are flat because it never hunts live animals like eagles do!»',
    quoteAuthor: 'Μαρία Γεωργίου, Ερευνήτρια Ομάδας 1',
    quoteAuthorEn: 'Maria Georgiou, Team 1 Researcher',
    score: 850,
    completedQuestsCount: 6,
    totalQuestsCount: 6,
    scientificFacts: teamScientificFactsMap['team-characteristics'],
    createdAt: '2026-11-01',
    verifiedBy: 'LIFE with Vultures Educational Review',
    verifiedByEn: 'LIFE with Vultures Educational Review',
  },
  'team-habitat-flight': {
    teamId: 'team-habitat-flight',
    teamNumber: 2,
    teamTitle: 'Ενδιαίτημα, Φωλεοποίηση & Πτήση',
    teamTitleEn: 'Habitat, Nesting & Flight',
    teamColor: '#0284C7',
    teamAvatar: '🪨',
    slogan: '«Κυρίαρχοι των Θερμών Ρευμάτων & των Απόκρημνων Βράχων»',
    sloganEn: '«Masters of Thermal Updrafts & Sheer Cliffs»',
    members: ['Χρίστος Παπαδόπουλος', 'Έλενα Βασιλείου', 'Κυριάκος Ιωάννου'],
    photoUrl: '',
    photoCaption: '',
    photoCaptionEn: '',
    submittedPhotos: [],
    wowMomentQuote:
      '«Μας μάγεψε η θερμική ανεμοπορία! Οι γύπες σχεδόν ποτέ δεν φτερουγίζουν: ανεβαίνουν χιλιόμετρα ψηλά σε σπείρες με θερμό αέρα και διανύουν πάνω από 150 χλμ την ημέρα με σχεδόν μηδενική κόπωση. Αλλά γεννούν μόνο 1 αυγό το χρόνο, οπότε κάθε πουλί είναι αναντικατάστατο.»',
    wowMomentQuoteEn:
      '«Thermal soaring completely mesmerized us! Vultures almost never flap their wings: they spiral kilometers high on warm air thermals and cover over 150 km a day with virtually zero fatigue. But they lay only 1 egg a year, making every bird irreplaceable.»',
    quoteAuthor: 'Χρίστος Παπαδόπουλος, Ομάδα 2',
    quoteAuthorEn: 'Christos Papadopoulos, Team 2',
    score: 800,
    completedQuestsCount: 5,
    totalQuestsCount: 5,
    scientificFacts: teamScientificFactsMap['team-habitat-flight'],
    createdAt: '2026-11-01',
    verifiedBy: 'LIFE with Vultures Educational Review',
    verifiedByEn: 'LIFE with Vultures Educational Review',
  },
  'team-diet-habits': {
    teamId: 'team-diet-habits',
    teamNumber: 3,
    teamTitle: 'Διατροφή, Συνήθειες & Αξίες',
    teamTitleEn: 'Diet, Habits & Values',
    teamColor: '#059669',
    teamAvatar: '🌿',
    slogan: '«Οι Καθαριστές της Φύσης: Ασπίδα Υγείας & Οικοσυστημική Ισορροπία»',
    sloganEn: '«Nature’s Cleaners: Health Shield & Ecosystem Balance»',
    members: ['Δημήτρης Αντωνίου', 'Σοφία Μιχαήλ', 'Λουκάς Σάββα'],
    photoUrl: '',
    photoCaption: '',
    photoCaptionEn: '',
    submittedPhotos: [],
    wowMomentQuote:
      '«Το απόλυτο "Wow Moment" μας: Το pH του στομάχου των γυπών είναι 1.0 — όσο το υδροχλωρικό οξύ! Εξουδετερώνουν θανατηφόρα βακτήρια όπως ο άνθρακας και η αλλαντίαση. Χωρίς αυτούς, τα νεκρά ζώα θα μόλυναν τις πηγές νερού. Είναι οι πιο υποτιμημένοι γιατροί της φύσης!»',
    wowMomentQuoteEn:
      '«Our standout discovery: Vulture stomach pH is 1.0 — as acidic as battery acid! They destroy lethal pathogens like anthrax and botulism. Without them, decomposing carcasses would pollute groundwater. They are nature’s most essential public health guardians!»',
    quoteAuthor: 'Σοφία Μιχαήλ, Ομάδα 3',
    quoteAuthorEn: 'Sofia Michael, Team 3',
    score: 900,
    completedQuestsCount: 6,
    totalQuestsCount: 6,
    scientificFacts: teamScientificFactsMap['team-diet-habits'],
    createdAt: '2026-11-01',
    verifiedBy: 'LIFE with Vultures Educational Review',
    verifiedByEn: 'LIFE with Vultures Educational Review',
  },
  'team-threats-protection': {
    teamId: 'team-threats-protection',
    teamNumber: 4,
    teamTitle: 'Απειλές & Μέτρα Προστασίας',
    teamTitleEn: 'Threats & Conservation Measures',
    teamColor: '#E11D48',
    teamAvatar: '🛡️',
    slogan: '«Επιχείρηση Διάσωση: Σκύλοι Ανίχνευσης, Δορυφόροι & Ζωή με τους Γύπες»',
    sloganEn: '«Rescue Mission: Detection Dogs, Satellites & Life with Vultures»',
    members: ['Παναγιώτης Χαραλάμπους', 'Άντρεα Νικολάου', 'Γιώργος Θεοδώρου'],
    photoUrl: '',
    photoCaption: '',
    photoCaptionEn: '',
    submittedPhotos: [],
    wowMomentQuote:
      '«Μας συγκίνησε η αφοσίωση των σκύλων Echo και Patrouch στην Κύπρο. Εκπαιδεύονται να μην τρώνε το δηλητήριο, αλλά να κάθονται ήσυχα για να σώσουν τα πουλιά. Και με τους δορυφορικούς πομπούς, οι βιολόγοι λαμβάνουν σήμα σε πραγματικό χρόνο αν ένα Όρνιο κινδυνεύει!»',
    wowMomentQuoteEn:
      '«We were inspired by the dedication of detection dogs Echo and Patrouch in Cyprus. They are trained not to eat poison, but to sit calmly and alert handlers to save vultures. And with solar GPS tags, conservationists receive real-time alerts if a vulture is immobilized!»',
    quoteAuthor: 'Παναγιώτης Χαραλάμπους, Ομάδα 4',
    quoteAuthorEn: 'Panagiotis Charalambous, Team 4',
    score: 950,
    completedQuestsCount: 6,
    totalQuestsCount: 6,
    scientificFacts: teamScientificFactsMap['team-threats-protection'],
    createdAt: '2026-11-01',
    verifiedBy: 'LIFE with Vultures Educational Review',
    verifiedByEn: 'LIFE with Vultures Educational Review',
  },
};
