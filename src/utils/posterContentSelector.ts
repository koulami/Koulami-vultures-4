/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/game';
import { TeamScientificFact } from '../types/posters';

/**
 * Educational Fact Template strictly focusing on the Griffon Vulture (Gyps fulvus) in Cyprus.
 * Sourced directly and exclusively from the questions in ekpaideytiki-anafora-gypes-2026-10-29.json.
 *
 * Rules strictly followed:
 * 1. ONLY Gyps fulvus in Cyprus. Zero other vulture species (no Black Vulture, Bearded Vulture, Egyptian Vulture).
 * 2. Zero non-Cyprus locations (no Dadia, etc.).
 * 3. Information derived exclusively from assigned question text, correct answers, and scientific explanations.
 * 4. Consolidated closely related facts into clear, impactful cards with large stats.
 * 5. If assigned questions do not provide information for a particular category, that category is omitted.
 * 6. Faithful English translations provided for all fields, ensuring seamless bilingual presentation.
 */
export interface CyprusFactDefinition {
  id: string;
  icon: string;
  stat: string;
  statEn: string;
  headline: string;
  headlineEn: string;
  detail: string;
  detailEn: string;
  category: string;
  categoryEn: string;
  /** Primary question IDs in the educational pool that provide the data for this fact */
  primaryQuestionIds: string[];
}

export const CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS: CyprusFactDefinition[] = [
  // =========================================================================
  // TEAM 1: Γενικά Χαρακτηριστικά (General Characteristics & Morphology)
  // =========================================================================
  {
    id: 'f-char-species',
    icon: 'Sparkles',
    stat: 'Gyps fulvus',
    statEn: 'Gyps fulvus',
    headline: 'Το Μοναδικό Είδος στην Κύπρο',
    headlineEn: 'The Only Vulture Species in Cyprus',
    detail: 'Στην Κύπρο απαντάται αποκλειστικά το Όρνιο (Gyps fulvus), γνωστό και ως Γύπας ο Πυρόχρους, το μεγαλύτερο σε μέγεθος πτηνό του νησιού.',
    detailEn: 'Only the Griffon Vulture (Gyps fulvus) occurs in Cyprus, representing the island’s largest and most majestic bird of prey.',
    category: 'Είδος & Ταυτότητα',
    categoryEn: 'Species & Identity',
    primaryQuestionIds: ['gypes-q-1', 'gypes-q-2', 'gypes-q-3'],
  },
  {
    id: 'f-char-wingspan',
    icon: 'Maximize2',
    stat: '2.4–2.8 m',
    statEn: '2.4–2.8 m',
    headline: 'Άνοιγμα Πτερύγων',
    headlineEn: 'Wingspan',
    detail: 'Με άνοιγμα 2.40 έως 2.80 μέτρα, είναι από τα μεγαλύτερα πουλιά της Ευρώπης.',
    detailEn: 'With a 2.40 to 2.80 m wingspan, it is among Europe’s largest birds.',
    category: 'Διαστάσεις',
    categoryEn: 'Morphometrics',
    primaryQuestionIds: ['gypes-q-4'],
  },
  {
    id: 'f-char-weight',
    icon: 'Scale',
    stat: '6–11 kg',
    statEn: '6–11 kg',
    headline: 'Σωματικό Βάρος',
    headlineEn: 'Body Weight',
    detail: 'Βαρύσωμο πουλί (6–11 κιλά) που αξιοποιεί θερμά ανοδικά ρεύματα για να πετάξει.',
    detailEn: 'Heavyset bird (6–11 kg) relying on thermal updrafts to soar.',
    category: 'Βάρος',
    categoryEn: 'Body Mass',
    primaryQuestionIds: ['gypes-q-8'],
  },
  {
    id: 'f-char-status',
    icon: 'AlertTriangle',
    stat: 'CR (Κρίσιμα Κινδυνεύον)',
    statEn: 'CR (Critically Endangered)',
    headline: 'Κατάσταση Πληθυσμού στην Κύπρο',
    headlineEn: 'Cyprus Population Status',
    detail: 'Στο Κόκκινο Βιβλίο των Απειλούμενων Ειδών της Κύπρου κατατάσσεται ως Κρίσιμα Κινδυνεύον (CR), καθώς ο ντόπιος πληθυσμός έφτασε ιστορικά σε λιγότερα από 15-20 άτομα.',
    detailEn: 'Classified as Critically Endangered (CR) in the Cyprus Red Data Book, as the native population historically plummeted to fewer than 15–20 individuals.',
    category: 'Πληθυσμιακή Κατάσταση',
    categoryEn: 'Population Status',
    primaryQuestionIds: ['gypes-q-5'],
  },
  {
    id: 'f-char-lifespan',
    icon: 'Clock',
    stat: '20 - 30 Έτη',
    statEn: '20 - 30 Years',
    headline: 'Προσδόκιμο Επιβίωσης',
    headlineEn: 'Life Expectancy',
    detail: 'Στη φύση οι γύπες ζουν 20 με 30 έτη, ενώ σε προστατευμένο περιβάλλον μπορούν να φτάσουν και να ξεπεράσουν τα 40+ χρόνια.',
    detailEn: 'In the wild, vultures live 20 to 30 years, whereas under protected human care they can exceed 40+ years.',
    category: 'Μακροβιότητα',
    categoryEn: 'Longevity',
    primaryQuestionIds: ['gypes-q-6'],
  },
  {
    id: 'f-char-egg',
    icon: 'Egg',
    stat: '1 Αυγό / Έτος',
    statEn: '1 Egg / Year',
    headline: 'Χαμηλός Αναπαραγωγικός Ρυθμός',
    headlineEn: 'Low Reproductive Rate',
    detail: 'Το Όρνιο γεννά μόνο 1 λευκό αυγό ανά έτος τον χειμώνα (Ιανουάριο-Φεβρουάριο), γεγονός που καθιστά την απώλεια κάθε ενήλικου πουλιού στην Κύπρο ανεπανόρθωτη.',
    detailEn: 'The Griffon Vulture lays only 1 white egg per year in winter (Jan–Feb), making the loss of each adult bird in Cyprus irreplaceable.',
    category: 'Αναπαραγωγή',
    categoryEn: 'Reproduction',
    primaryQuestionIds: ['gypes-q-7'],
  },
  {
    id: 'f-char-monogamy',
    icon: 'Heart',
    stat: 'Ισόβια Ζεύγη',
    statEn: 'Lifelong Pairs',
    headline: 'Μονογαμία & Φυλετικός Μονομορφισμός',
    headlineEn: 'Monogamy & Sexual Monomorphism',
    detail: 'Είναι αυστηρά μονογαμικά πουλιά που μένουν μαζί για όλη τους τη ζωή. Αρσενικό και θηλυκό έχουν πανομοιότυπη εμφάνιση (φυλετικός μονομορφισμός).',
    detailEn: 'They form strictly monogamous lifelong bonds. Males and females share an identical plumage and appearance (sexual monomorphism).',
    category: 'Βιολογία Ζευγαρώματος',
    categoryEn: 'Mating Biology',
    primaryQuestionIds: ['gypes-q-9', 'gypes-q-10', 'gypes-q-11'],
  },
  {
    id: 'f-char-feet',
    icon: 'Footprints',
    stat: 'Επίπεδα Πέλματα',
    statEn: 'Flat Ground Soles',
    headline: 'Προσαρμογή Εδάφους (Όχι Αρπακτικά Νύχια)',
    headlineEn: 'Ground Adaptation (Not Predatory Talons)',
    detail: 'Τα αδύναμα, επίπεδα πέλματα και τα κοντά νύχια είναι προσαρμοσμένα για σταθερό περπάτημα στο έδαφος γύρω από το κουφάρι και όχι για θανάτωση λείας.',
    detailEn: 'Their relatively weak, flat feet and short claws are anatomically adapted for walking around carcasses rather than seizing or killing live prey.',
    category: 'Ανατομία',
    categoryEn: 'Anatomy',
    primaryQuestionIds: ['gypes-q-13'],
  },

  // =========================================================================
  // TEAM 2: Περιβάλλον, Φωλεοποίηση & Πτήση (Habitat, Nesting & Flight)
  // =========================================================================
  {
    id: 'f-hab-episkopi',
    icon: 'Mountain',
    stat: 'Γκρεμοί Επισκοπής',
    statEn: 'Episkopi Cliffs',
    headline: 'Ενδιαίτημα & Κατανομή στην Κύπρο',
    headlineEn: 'Cyprus Habitat & Breeding Sites',
    detail: 'Ζει σε ανοικτές ημιορεινές εκτάσεις και φαράγγια. Στην Κύπρο αναπαράγεται κυρίως στους απόκρημνους ασβεστολιθικούς γκρεμούς της Επισκοπής και στις κοιλάδες Ξερού και Διαρίζου.',
    detailEn: 'Inhabits open semi-mountainous gorges. In Cyprus, it breeds on the sheer limestone sea-cliffs of Episkopi and across the Xeros and Dhiarizos valleys.',
    category: 'Οικότοπος',
    categoryEn: 'Habitat',
    primaryQuestionIds: ['gypes-q-21', 'gypes-q-28', 'gypes-q-29'],
  },
  {
    id: 'f-hab-nests',
    icon: 'Layers',
    stat: 'Κοινωνικές Αποικίες',
    statEn: 'Social Colonies',
    headline: 'Φωλεοποίηση σε Ορθοπλαγιές',
    headlineEn: 'Cliff Face Nesting',
    detail: 'Φωλιάζει σε προεξοχές και κοιλότητες απόκρημνων βράχων σχηματίζοντας χαλαρές αποικίες, στρώνοντας τη φωλιά με κλαδιά, χόρτα, μαλλί προβάτων και πούπουλα.',
    detailEn: 'Nests in crevices on sheer rock cliffs in loose social colonies, lining platforms with twigs, grasses, sheep wool, and soft feathers.',
    category: 'Φωλεοποίηση',
    categoryEn: 'Nesting',
    primaryQuestionIds: ['gypes-q-22', 'gypes-q-23', 'gypes-q-26'],
  },
  {
    id: 'f-hab-soaring',
    icon: 'Wind',
    stat: '0% Φτερούγισμα',
    statEn: '0% Wing Flapping',
    headline: 'Θερμική Ανεμοπορία (Soaring)',
    headlineEn: 'Thermal Soaring Dynamics',
    detail: 'Εκμεταλλεύεται τα θερμά ανοδικά ρεύματα αέρα για να κερδίζει ύψος σε σπείρες και να ταξιδεύει χωρίς μυϊκή κόπωση, περιμένοντας τον πρωινό ήλιο να ζεστάνει το έδαφος.',
    detailEn: 'Rides rising warm air thermals to gain altitude in spirals and glide across vast distances with virtually zero muscle fatigue.',
    category: 'Μηχανική Πτήσης',
    categoryEn: 'Flight Mechanics',
    primaryQuestionIds: ['gypes-q-30', 'gypes-q-33'],
  },
  {
    id: 'f-hab-altitude',
    icon: 'Compass',
    stat: '2.000 - 3.000+ μ.',
    statEn: '2,000 - 3,000+ m',
    headline: 'Υψόμετρο Πτήσης',
    headlineEn: 'Cruising Flight Altitude',
    detail: 'Πετάει άνετα σε υψόμετρο από 2.000 έως 3.000+ μέτρα εκμεταλλευόμενο τα θερμά ρεύματα, σαρώνοντας αχανείς εκτάσεις της Κύπρου.',
    detailEn: 'Effortlessly soars at altitudes between 2,000 and 3,000+ meters on thermal updrafts, scanning vast areas of Cyprus.',
    category: 'Αεροδυναμική',
    categoryEn: 'Aerodynamics',
    primaryQuestionIds: ['gypes-q-31'],
  },
  {
    id: 'f-hab-range-speed',
    icon: 'Gauge',
    stat: '50 - 150+ χλμ.',
    statEn: '50 - 150+ km',
    headline: 'Ακτίνα Έρευνας & Ταχύτητα',
    headlineEn: 'Daily Range & Gliding Speed',
    detail: 'Καλύπτει καθημερινά 50 έως 150+ χλμ. αναζητώντας τροφή, ταξιδεύοντας με ταχύτητες ολίσθησης 60 - 80 χλμ/ώρα (έως και 100+ χλμ/ώρα).',
    detailEn: 'Ranges 50 to 150+ km daily while foraging, cruising at gliding speeds of 60–80 km/h (reaching up to 100+ km/h).',
    category: 'Κινητικότητα',
    categoryEn: 'Mobility',
    primaryQuestionIds: ['gypes-q-32', 'gypes-q-34'],
  },
  {
    id: 'f-hab-fledging',
    icon: 'Clock',
    stat: '110 - 120 Ημέρες',
    statEn: '110 - 120 Days',
    headline: 'Ανάπτυξη Νεοσσού στη Φωλιά',
    headlineEn: 'Nestling Development Period',
    detail: 'Ο νεοσσός του Όρνιου παραμένει στη φωλιά για 110 έως 120 ημέρες (περίπου 4 μήνες) υπό συνεχή γονική φροντίδα πριν επιχειρήσει την πρώτη του πτήση.',
    detailEn: 'The chick stays in the nest for 110 to 120 days (~4 months) under attentive biparental care before fledging.',
    category: 'Ανάπτυξη',
    categoryEn: 'Development',
    primaryQuestionIds: ['gypes-q-36'],
  },

  // =========================================================================
  // TEAM 3: Διατροφή, Συνήθειες & Αξίες (Diet, Habits & Ecological Values)
  // =========================================================================
  {
    id: 'f-diet-scavenger',
    icon: 'ShieldAlert',
    stat: '100% Πτωματοφάγο',
    statEn: '100% Scavenger',
    headline: 'Αποκλειστικός Καθαριστής (Όχι Θηρευτής)',
    headlineEn: 'Obligate Scavenger (Never a Predator)',
    detail: 'Τρέφεται αποκλειστικά με κουφάρια νεκρών κτηνοτροφικών ζώων (πρόβατα, αίγες, αγρινά) και δεν επιτίθεται ποτέ σε ζωντανά ζώα. Είναι ειδικά προσαρμοσμένος στην κατανάλωση μαλακών μυών.',
    detailEn: 'Feeds exclusively on carcasses of fallen livestock (sheep, goats, mouflon) and never attacks live animals. Specialized in consuming soft muscle tissue.',
    category: 'Διατροφή',
    categoryEn: 'Diet',
    primaryQuestionIds: ['gypes-q-43', 'gypes-q-44', 'gypes-q-47'],
  },
  {
    id: 'f-diet-neck',
    icon: 'Sparkles',
    stat: 'Ανατομία Υγιεινής',
    statEn: 'Sanitary Anatomy',
    headline: 'Γυμνός Λαιμός & Ηλιακή Αποστείρωση',
    headlineEn: 'Bare Neck & Solar Sterilization',
    detail: 'Το κεφάλι και ο λαιμός στερούνται μακριών φτερών για να μην λερώνονται μέσα στα κουφάρια, ενώ αποστειρώνονται αυτόματα από την υπεριώδη ηλιακή ακτινοβολία της Κύπρου.',
    detailEn: 'The head and neck lack dense feathers to avoid soiling inside carcasses, and are sterilized by intense Mediterranean solar UV radiation.',
    category: 'Προσαρμογή',
    categoryEn: 'Adaptation',
    primaryQuestionIds: ['gypes-q-45'],
  },
  {
    id: 'f-diet-vision',
    icon: 'Eye',
    stat: '8x - 10x Όραση',
    statEn: '8x - 10x Keen Vision',
    headline: 'Οπτικός Εντοπισμός (Όχι Όσφρηση)',
    headlineEn: 'Visual Foraging (No Sense of Smell)',
    detail: 'Εντοπίζει κουφάρια από χιλιόμετρα μακριά χάρη στην οξύτατη όρασή του, η οποία είναι 8 έως 10 φορές ανώτερη από την ανθρώπινη. Δεν διαθέτει αναπτυγμένη όσφρηση.',
    detailEn: 'Spots carcasses from miles away thanks to acute eyesight 8 to 10 times sharper than human vision, relying on eyesight rather than scent.',
    category: 'Αισθήσεις',
    categoryEn: 'Sensory Biology',
    primaryQuestionIds: ['gypes-q-46'],
  },
  {
    id: 'f-diet-ph',
    icon: 'ShieldCheck',
    stat: 'pH ~ 1.0 - 2.0',
    statEn: 'pH ~ 1.0 - 2.0',
    headline: 'Όξινο Γαστρικό Φίλτρο Παθογόνων',
    headlineEn: 'Hyper-Acidic Gastric Shield',
    detail: 'Το στομάχι του Όρνιου έχει ακραία οξύτητα (pH 1.0 - 2.0), ικανή να εξουδετερώσει θανατηφόρους παθογόνους μικροοργανισμούς όπως ο άνθρακας, η αλλαντίαση και η χολέρα.',
    detailEn: 'Extreme gastric acidity (pH 1.0–2.0) destroys lethal pathogens including anthrax, botulism, and cholera found in decaying carrion.',
    category: 'Βιοχημεία',
    categoryEn: 'Biochemistry',
    primaryQuestionIds: ['gypes-q-50'],
  },
  {
    id: 'f-diet-public-health',
    icon: 'HeartHandshake',
    stat: 'Υγειονομική Ασπίδα',
    statEn: 'Public Health Shield',
    headline: 'Δωρεάν Υπηρεσίες Δημόσιας Υγείας',
    headlineEn: 'Free Ecosystem Sanitation Services',
    detail: 'Καθαρίζει τα κουφάρια από την ύπαιθρο αποτρέποντας την εξάπλωση μολυσματικών ασθενειών και τη ρύπανση των υπόγειων υδάτων, εξοικονομώντας εκατομμύρια ευρώ για την κυπριακή κτηνοτροφία.',
    detailEn: 'Swiftly clears carcasses to halt the spread of infectious disease and prevent groundwater contamination, safeguarding public health.',
    category: 'Οικοσυστημική Αξία',
    categoryEn: 'Ecosystem Value',
    primaryQuestionIds: ['gypes-q-51', 'gypes-q-54', 'gypes-q-55'],
  },
  {
    id: 'f-diet-urohidrosis',
    icon: 'Sun',
    stat: 'Ουροκένωση',
    statEn: 'Urohidrosis Cooling',
    headline: 'Αυτοαπολύμανση & Θερμορύθμιση',
    headlineEn: 'Self-Sanitization & Thermoregulation',
    detail: 'Η αφόδευση στα πόδια (ουροκένωση) δροσίζει το σώμα τις ζεστές μέρες στην Κύπρο μέσω εξάτμισης, ενώ το ουρικό οξύ σκοτώνει τα επικίνδυνα βακτήρια που μαζεύονται στα πέλματα.',
    detailEn: 'Excreting onto legs (urohidrosis) cools the body through evaporation on hot days, while uric acid disinfects bacteria on their soles.',
    category: 'Φυσιολογία',
    categoryEn: 'Physiology',
    primaryQuestionIds: ['gypes-q-53'],
  },

  // =========================================================================
  // TEAM 4: Απειλές & Μέτρα Προστασίας (Threats & Conservation Measures)
  // =========================================================================
  {
    id: 'f-thr-poisons',
    icon: 'AlertOctagon',
    stat: '>80% Θνησιμότητας',
    statEn: '>80% Mortality',
    headline: 'Δηλητηριασμένα Δολώματα (Φόλες)',
    headlineEn: 'Illegal Poison Baits',
    detail: 'Η παράνομη τοποθέτηση δηλητηριασμένων δολωμάτων είναι η υπ’ αριθμόν 1 αιτία θανάτου στην Κύπρο, ευθυνόμενη για πάνω από το 80% των απωλειών και απειλώντας ολόκληρες αποικίες.',
    detailEn: 'Illegal poison baiting is the #1 threat in Cyprus, responsible for over 80% of vulture deaths and threatening entire breeding colonies.',
    category: 'Κύρια Απειλή',
    categoryEn: 'Primary Threat',
    primaryQuestionIds: ['gypes-q-61', 'gypes-q-62', 'gypes-q-63', 'gypes-q-74'],
  },
  {
    id: 'f-thr-k9',
    icon: 'Dog',
    stat: 'Μονάδες Σκύλων K9',
    statEn: 'K9 Detection Units',
    headline: 'Σκύλοι Ανίχνευσης Δηλητηρίων',
    headlineEn: 'Poison Detection Canine Teams',
    detail: 'Ειδικά εκπαιδευμένοι σκύλοι K9 της Υπηρεσίας Θήρας χτενίζουν την κυπριακή ύπαιθρο και εντοπίζουν τα δηλητήρια με την όσφρηση πριν προλάβουν να τα φάνε οι γύπες.',
    detailEn: 'Specially trained Game and Fauna Service K9 dogs patrol countryside habitats to detect and neutralize poisoned baits before scavengers find them.',
    category: 'Πρόληψη Πεδίου',
    categoryEn: 'Field Prevention',
    primaryQuestionIds: ['gypes-q-69'],
  },
  {
    id: 'f-thr-feeders',
    icon: 'ShieldCheck',
    stat: '4 Επίσημες Ταΐστρες',
    statEn: '4 Official Feeding Stations',
    headline: 'Ασφαλές Δίκτυο Σίτισης στην Κύπρο',
    headlineEn: 'Safe Supplementary Feeding Network',
    detail: 'Λειτουργούν 4 περιφραγμένες ταΐστρες (Άγιος Ιωάννης, Λιμνάτι, Δωρά, Σωτήρα) που τροφοδοτούνται με ελεγμένα κουφάρια σε στενή συνεργασία με τους ντόπιους κτηνοτρόφους.',
    detailEn: 'Four fenced vulture restaurants (Agios Ioannis, Limnati, Dora, Sotira) provide veterinary-inspected livestock food sources in partnership with shepherds.',
    category: 'Διατροφική Ασφάλεια',
    categoryEn: 'Food Security',
    primaryQuestionIds: ['gypes-q-66', 'gypes-q-67'],
  },
  {
    id: 'f-thr-reinforcement',
    icon: 'Home',
    stat: 'Ενίσχυση από Ισπανία',
    statEn: 'Translocations from Spain',
    headline: 'Εισαγωγή & Κλωβός Εγκλιματισμού',
    headlineEn: 'Acclimatization Aviary & Release',
    detail: 'Νεαροί γύπες από την Ισπανία μεταφέρονται στην Κύπρο και παραμένουν για μήνες σε ειδικό κλωβό εγκλιματισμού ώστε να εξοικειωθούν με το τοπίο πριν απελευθερωθούν.',
    detailEn: 'Young rehabilitated vultures from Spain are brought to Cyprus and housed in an acclimatization aviary to habituate before entering the wild population.',
    category: 'Ενίσχυση Πληθυσμού',
    categoryEn: 'Population Reinforcement',
    primaryQuestionIds: ['gypes-q-68', 'gypes-q-71'],
  },
  {
    id: 'f-thr-powerlines',
    icon: 'ZapOff',
    stat: 'Μόνωση & Σημαντήρες',
    statEn: 'Insulation & Diverters',
    headline: 'Ασφάλεια Εναέριων Δικτύων ΑΗΚ',
    headlineEn: 'Power Grid Retrofitting',
    detail: 'Μόνωση επικίνδυνων πυλώνων για αποτροπή ηλεκτροπληξίας και τοποθέτηση ειδικών σπειροειδών σημαντήρων (εκτροπέων πτήσης) στα καλώδια για να είναι ορατά.',
    detailEn: 'Insulating electricity pylons prevents electrocution, while spiral bird flight diverters on cables make overhead wires visible to gliding vultures.',
    category: 'Υποδομές',
    categoryEn: 'Infrastructure Safety',
    primaryQuestionIds: ['gypes-q-64', 'gypes-q-65'],
  },
  {
    id: 'f-thr-tech-gps',
    icon: 'Radio',
    stat: 'GPS & AI Ραντάρ',
    statEn: 'GPS & AI Radar',
    headline: 'Δορυφορική Τηλεμετρία & Τεχνολογία',
    headlineEn: 'Satellite Telemetry & AI Systems',
    detail: 'Ηλιακοί πομποί GPS/GSM επιτρέπουν 24ωρη παρακολούθηση και άμεση επέμβαση σε περίπτωση ακινησίας, ενώ ραντάρ και κάμερες AI σταματούν αυτόματα ανεμογεννήτριες όταν πλησιάζει γύπας.',
    detailEn: 'Solar GPS/GSM transmitters provide 24/7 telemetry for rapid rescue, while AI cameras and radar automatically brake wind turbines if a vulture approaches.',
    category: 'Τεχνολογία',
    categoryEn: 'Conservation Technology',
    primaryQuestionIds: ['gypes-q-70', 'gypes-q-72', 'gypes-q-73'],
  },
];

/**
 * Helper to produce concise, readable scientific text derived exclusively
 * from existing question content and explanations without altering the stored data.
 * Safely accepts empty, null, undefined, or whitespace-only values.
 */
export function createConciseExplanation(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';

  // If already concise (under 200 chars), return clean text
  if (trimmed.length <= 200) {
    return trimmed;
  }

  // Extract the first 1-2 complete sentences
  const twoSentencesMatch = trimmed.match(/^([^.!?]+[.!?]\s*[^.!?]+[.!?])/);
  if (twoSentencesMatch && twoSentencesMatch[1] && twoSentencesMatch[1].length <= 220) {
    return twoSentencesMatch[1].trim();
  }

  const oneSentenceMatch = trimmed.match(/^([^.!?]+[.!?])/);
  if (oneSentenceMatch && oneSentenceMatch[1] && oneSentenceMatch[1].length <= 200) {
    return oneSentenceMatch[1].trim();
  }

  // Fallback to nearest word boundary under 180 chars
  const sliced = trimmed.slice(0, 180);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 100 ? sliced.slice(0, lastSpace) : sliced).trim() + '...';
}

/**
 * EXCLUSIVE CONTENT SELECTION LOGIC FOR TEAM POSTERS:
 *
 * 1. Takes the currently selected team ID and the questions assigned to it.
 * 2. Filters strictly for questions assigned to that team (`q.assignedTeamIds.includes(teamId)`).
 * 3. Matches only facts where at least one of its primary backing questions is assigned to this team.
 * 4. Omits any category or fact that has NO assigned questions or content in this team.
 * 5. Returns exclusively facts about the Griffon Vulture (Gyps fulvus) in Cyprus,
 *    filtering out all other vulture species and outside regions.
 * 6. Scientific explanations and optional educational fields accept empty or missing values without errors.
 * 7. When explanations are available, concise readable text is displayed without mutating saved question data.
 * 8. Accepts language parameter ('el' | 'en') and populates localized text while keeping both languages attached.
 */
export function selectPosterFactsForTeam(
  teamId: string,
  allQuestions: Question[],
  language: 'el' | 'en' = 'el'
): TeamScientificFact[] {
  if (!allQuestions || !Array.isArray(allQuestions)) {
    return [];
  }

  // 1. Get ONLY the ACTIVE questions currently assigned to this team
  const assignedQuestions = allQuestions.filter(
    (q) => q && q.isActive && Array.isArray(q.assignedTeamIds) && q.assignedTeamIds.includes(teamId)
  );

  if (assignedQuestions.length === 0) {
    return [];
  }

  // Map of lowercase question ID to question object
  const assignedQuestionMap = new Map<string, Question>();
  for (const q of assignedQuestions) {
    if (q && q.id) {
      assignedQuestionMap.set(q.id.toLowerCase(), q);
    }
  }

  // 2. Select ONLY facts that have at least one primary question assigned to this team
  const selectedFacts: TeamScientificFact[] = [];

  for (const definition of CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS) {
    // Find all assigned questions associated with this fact
    const matchingQuestions: Question[] = [];
    for (const qid of definition.primaryQuestionIds) {
      const found = assignedQuestionMap.get(qid.toLowerCase());
      if (found) {
        matchingQuestions.push(found);
      }
    }

    // If no assigned question is in this team, omit this fact completely
    if (matchingQuestions.length === 0) {
      continue;
    }

    // Check if an explanation is available on the assigned questions
    const questionWithExplanation = matchingQuestions.find(
      (q) => typeof q.explanation === 'string' && q.explanation.trim().length > 0
    );

    // Derive concise Greek explanation
    let greekDetail = '';
    if (questionWithExplanation && questionWithExplanation.explanation) {
      greekDetail = createConciseExplanation(questionWithExplanation.explanation);
    } else if (definition.detail && definition.detail.trim().length > 0) {
      greekDetail = createConciseExplanation(definition.detail);
    }

    // Derive concise English explanation
    let englishDetail = '';
    if (questionWithExplanation && (questionWithExplanation as any).explanationEn) {
      englishDetail = createConciseExplanation((questionWithExplanation as any).explanationEn);
    } else if (definition.detailEn && definition.detailEn.trim().length > 0) {
      englishDetail = createConciseExplanation(definition.detailEn);
    } else {
      englishDetail = greekDetail;
    }

    const statEl = typeof definition.stat === 'string' ? definition.stat.trim() : '';
    const statEn = typeof definition.statEn === 'string' && definition.statEn.trim().length > 0 ? definition.statEn.trim() : statEl;
    const headlineEl = typeof definition.headline === 'string' ? definition.headline.trim() : '';
    const headlineEn = typeof definition.headlineEn === 'string' && definition.headlineEn.trim().length > 0 ? definition.headlineEn.trim() : headlineEl;
    const categoryEl = typeof definition.category === 'string' ? definition.category.trim() : '';
    const categoryEn = typeof definition.categoryEn === 'string' && definition.categoryEn.trim().length > 0 ? definition.categoryEn.trim() : categoryEl;

    const isEnglish = language === 'en';
    const activeStat = isEnglish ? statEn : statEl;
    const activeHeadline = isEnglish ? headlineEn : headlineEl;
    const activeDetail = isEnglish ? englishDetail : greekDetail;
    const activeCategory = isEnglish ? categoryEn : categoryEl;

    // Only include fact if it has at least one educational field populated (stat, headline, or detail)
    if (activeStat.length > 0 || activeHeadline.length > 0 || activeDetail.length > 0) {
      selectedFacts.push({
        id: definition.id,
        icon: definition.icon || 'FileCheck',
        stat: activeStat,
        statEn: statEn,
        headline: activeHeadline,
        headlineEn: headlineEn,
        detail: activeDetail,
        detailEn: englishDetail,
        category: activeCategory,
        categoryEn: categoryEn,
      });
    }
  }

  // 3. Also check any custom/added questions assigned to this team not covered by preset definitions
  const coveredQuestionIds = new Set(
    CYPRUS_GYPS_FULVUS_FACT_DEFINITIONS.flatMap((d) =>
      d.primaryQuestionIds.map((id) => id.toLowerCase())
    )
  );

  const extraAssigned = assignedQuestions.filter(
    (q) => !coveredQuestionIds.has(q.id.toLowerCase())
  );

  for (const eq of extraAssigned) {
    const rawExplanation = typeof eq.explanation === 'string' ? eq.explanation.trim() : '';
    const rawExplanationEn = typeof (eq as any).explanationEn === 'string' ? (eq as any).explanationEn.trim() : '';
    const rawMission = typeof eq.missionTitle === 'string' ? eq.missionTitle.trim() : '';
    const rawMissionEn = typeof (eq as any).missionTitleEn === 'string' ? (eq as any).missionTitleEn.trim() : '';
    const rawTitle = typeof eq.title === 'string' ? eq.title.trim() : '';
    const rawTitleEn = typeof (eq as any).titleEn === 'string' ? (eq as any).titleEn.trim() : '';

    const isEnglish = language === 'en';

    // Only include if there is actual educational explanation or title available
    if (rawExplanation.length > 0 || rawMission.length > 0 || rawTitle.length > 0) {
      const greekDetail = createConciseExplanation(rawExplanation || rawTitle);
      const englishDetail = createConciseExplanation(rawExplanationEn || rawTitleEn || greekDetail);

      const headlineEl = rawMission || (rawTitle.length > 60 ? rawTitle.slice(0, 57) + '...' : rawTitle);
      const headlineEn = rawMissionEn || rawTitleEn || headlineEl;

      const categoryEl = rawMission ? 'Αποστολή Πεδίου' : 'Επιστημονικά Δεδομένα';
      const categoryEn = rawMission ? 'Field Mission' : 'Scientific Data';

      selectedFacts.push({
        id: `extra-fact-${eq.id}`,
        icon: 'Sparkles',
        stat: '',
        statEn: '',
        headline: isEnglish ? headlineEn : headlineEl,
        headlineEn: headlineEn,
        detail: isEnglish ? englishDetail : greekDetail,
        detailEn: englishDetail,
        category: isEnglish ? categoryEn : categoryEl,
        categoryEn: categoryEn,
      });
    }
  }

  // Final validation: reject any fact cards where all text fields are blank or whitespace
  return selectedFacts.filter((f) => {
    const hasStat = typeof f.stat === 'string' && f.stat.trim().length > 0;
    const hasHeadline = typeof f.headline === 'string' && f.headline.trim().length > 0;
    const hasDetail = typeof f.detail === 'string' && f.detail.trim().length > 0;
    return hasStat || hasHeadline || hasDetail;
  });
}
