/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/game';

export interface QuestionTranslationItem {
  missionTitleEn?: string;
  titleEn: string;
  explanationEn?: string;
  instructionEn?: string;
  optionsEn?: Record<string, string>;
  pairsEn?: Array<{ id: string; left: string; right: string }>;
  promptDescriptionEn?: string;
  taskPromptEn?: string;
  verificationCriteriaEn?: string[];
  stationNameEn?: string;
  stationLocationEn?: string;
  fieldClueEn?: string;
}

export const QUESTION_TRANSLATIONS: Record<string, QuestionTranslationItem> = {
  "gypes-q-1": {
    "missionTitleEn": "Vulture Species",
    "titleEn": "Look carefully at the photograph. Which photo depicts the vulture species found in Cyprus?",
    "explanationEn": "In Cyprus, only the Griffon Vulture (Gyps fulvus) occurs naturally.",
    "optionsEn": {
      "opt-1": "1 (Griffon Vulture)",
      "opt-2": "2 (Bearded Vulture)",
      "opt-3": "3 (Egyptian Vulture)",
      "opt-4": "4 (Cinereous Vulture)"
    }
  },
  "gypes-q-2": {
    "missionTitleEn": "Vulture Name",
    "titleEn": "What is the name of the vulture species present in Cyprus?",
    "explanationEn": "The species present in Cyprus is called the Griffon Vulture or Gyps fulvus (Γύπας ο Πυρόχρους / Όρνιο).",
    "optionsEn": {
      "opt-1": "Griffon Vulture (Gyps fulvus)",
      "opt-2": "Egyptian Vulture (Neophron percnopterus)",
      "opt-3": "Bearded Vulture (Gypaetus barbatus)"
    }
  },
  "gypes-q-3": {
    "missionTitleEn": "Body Size",
    "titleEn": "The vulture is the largest bird species in Cyprus.",
    "explanationEn": "True! The Griffon Vulture is the largest bird in both body size and wingspan inhabiting Cyprus."
  },
  "gypes-q-4": {
    "missionTitleEn": "Weight",
    "titleEn": "On average, how much does an adult vulture weigh?",
    "explanationEn": "Weighing 6–11 kg, the Griffon Vulture is among the heaviest flight-capable birds in Europe.",
    "optionsEn": {
      "opt-1": "6 to 11 kg",
      "opt-2": "1 to 2 kg",
      "opt-3": "25 to 30 kg",
      "opt-4": "500 grams"
    }
  },
  "gypes-q-5": {
    "missionTitleEn": "Cyprus Population Status",
    "titleEn": "What is the conservation status of the Griffon Vulture in Cyprus according to the Red Data Book of Endangered Species?",
    "explanationEn": "In Cyprus, the Griffon Vulture is classified as Critically Endangered (CR), as the native wild population plummeted to fewer than 15–20 individuals.",
    "optionsEn": {
      "opt-1": "Critically Endangered (CR) - the population counts very few breeding pairs",
      "opt-2": "Common and abundant species facing no threats",
      "opt-3": "Species with overpopulation in the countryside",
      "opt-4": "Least Concern (LC)"
    }
  },
  "gypes-q-6": {
    "missionTitleEn": "Lifespan",
    "titleEn": "What is the natural lifespan of a vulture in the wild when unaffected by human threats?",
    "explanationEn": "Vultures are long-lived raptors. In the wild they reach 20 to 30 years, and under protected care they can live 40+ years.",
    "optionsEn": {
      "opt-1": "20 to 30 years",
      "opt-2": "Only 2 to 3 years",
      "opt-3": "About 70 to 80 years",
      "opt-4": "About 6 months"
    }
  },
  "gypes-q-7": {
    "missionTitleEn": "Egg Count & Breeding Rate",
    "titleEn": "How many eggs does a pair of Griffon Vultures lay in their nest each year?",
    "explanationEn": "The Griffon Vulture has a very low reproduction rate: it lays only 1 white egg per year (typically in January–February).",
    "optionsEn": {
      "opt-1": "Only 1 egg per year",
      "opt-2": "4 to 6 eggs",
      "opt-3": "8 to 12 eggs",
      "opt-4": "Lays eggs every month"
    }
  },
  "gypes-q-8": {
    "missionTitleEn": "Wingspan",
    "titleEn": "What is the impressive wingspan reached by an adult Griffon Vulture in Cyprus?",
    "explanationEn": "The vulture is one of Europe's largest birds, boasting an impressive wingspan reaching 2.4 to 2.8 meters (~2.5m).",
    "optionsEn": {
      "opt-1": "About 2.5 meters (2.4–2.8m)",
      "opt-2": "About 1 meter",
      "opt-3": "About 4 meters",
      "opt-4": "Barely 60 centimeters"
    }
  },
  "gypes-q-9": {
    "missionTitleEn": "True or False: Lifelong Monogamy",
    "titleEn": "Examine the following statement: Vultures are monogamous birds and remain with the same partner for their entire life.",
    "explanationEn": "True! Vultures form strong lifelong pairs and equally share egg incubation and chick rearing duties."
  },
  "gypes-q-10": {
    "missionTitleEn": "Age Identification: Juvenile vs Adult",
    "titleEn": "How can field researchers distinguish a juvenile vulture from an adult using binoculars?",
    "explanationEn": "Young vultures (up to 4–5 years old) have a dark beak and brown, pointed ruff feathers. Adults develop a yellowish beak and fluffy white ruff.",
    "optionsEn": {
      "opt-1": "Juveniles have a dark bill and brown pointed ruff feathers, whereas adults possess a pale bill and fluffy white ruff.",
      "opt-2": "The juvenile is twice the size of the adult.",
      "opt-3": "The adult has a green bill.",
      "opt-4": "There is no visual way to distinguish them."
    }
  },
  "gypes-q-11": {
    "missionTitleEn": "True or False: Sexual Monomorphism",
    "titleEn": "Is it possible to distinguish a male vulture from a female solely by their plumage color and feathers?",
    "explanationEn": "False! Vultures exhibit sexual monomorphism: males and females look identical externally. Sex determination requires DNA molecular analysis from blood or feather pulp."
  },
  "gypes-q-12": {
    "missionTitleEn": "Matching Core Griffon Characteristics",
    "titleEn": "Match each core biological metric of the Griffon Vulture in Cyprus with its accurate scientific value:",
    "explanationEn": "The Griffon Vulture (Gyps fulvus) is Cyprus's winged giant. With a 2.5m wingspan and weight up to 11kg, it lays only 1 egg per year and is strictly protected.",
    "pairsEn": [
      {
        "id": "pair-1",
        "left": "Wingspan",
        "right": "2.40 - 2.80 meters"
      },
      {
        "id": "pair-2",
        "left": "Adult Body Weight",
        "right": "6 - 11 kilograms"
      },
      {
        "id": "pair-3",
        "left": "Annual Egg Production",
        "right": "Only 1 egg per breeding season"
      },
      {
        "id": "pair-4",
        "left": "Cyprus Conservation Status",
        "right": "Critically Endangered (CR)"
      }
    ]
  },
  "gypes-q-13": {
    "missionTitleEn": "Feet & Talons: Terrestrial Adaptation",
    "titleEn": "Why are a vulture's talons not as curved and needle-sharp as an eagle's or falcon's?",
    "explanationEn": "A vulture's feet are anatomically adapted for walking, balance, and standing on the ground around carcasses, not for seizing and killing live prey.",
    "optionsEn": {
      "opt-1": "Because it does not kill live prey but walks on the ground around carcasses.",
      "opt-2": "Because they wear down on rocks during landing.",
      "opt-3": "To enable swimming in lakes.",
      "opt-4": "Because they are born with a defect."
    }
  },
  "gypes-q-14": {
    "missionTitleEn": "Indoor Observation Station: Vulture Replica (#36)",
    "titleEn": "Locate the full-scale model or large photograph of the vulture in the briefing room and submit your team's photo or video documentation (#36).",
    "explanationEn": "Direct visual inspection of the life-sized replica helps students comprehend the immense size, majestic wing area, and unique anatomy of the Griffon Vulture.",
    "taskPromptEn": "Photograph your team next to the full-size vulture model or exhibit in the visitor center.",
    "verificationCriteriaEn": [
      "The full-scale vulture model or display photo is clearly visible",
      "At least one team member or team badge is in the frame",
      "Lighting is clear and focused"
    ]
  },
  "gypes-q-15": {
    "missionTitleEn": "Two-Dimensional Vulture Representation",
    "titleEn": "Find which of the birds hanging from the ceiling in the Center's rooms represents a Griffon Vulture. Then photograph it.",
    "explanationEn": "Scientific identification of vulture silhouette and plumage highlights from the LIFE with Vultures educational guide in Cyprus.",
    "taskPromptEn": "Take a clear photo of the suspended bird representing the Griffon Vulture hanging from the ceiling.",
    "verificationCriteriaEn": [
      "Clear overhead angle showing the hanging bird model",
      "Identification features: broad rectangular wings and short dark tail visible"
    ]
  },
  "gypes-q-16": {
    "missionTitleEn": "Team 1 Reflection: Something that impressed us",
    "titleEn": "Share in your own words what impressed you most about the Griffon Vulture's identity and morphology (e.g. 2.5m wingspan, lifelong monogamy, 1 egg per year). Your reflection will appear directly in your team's poster!",
    "explanationEn": "Team reflection synthesizes inquiry-based field learning into a concise personal statement on the team's poster.",
    "taskPromptEn": "Write a short team reflection about the morphology or life cycle of the Griffon Vulture in Cyprus."
  },
  "gypes-q-17": {
    "missionTitleEn": "Fledging Period of the Chick",
    "titleEn": "How long does a young Griffon chick remain in the cliff nest from hatching until its maiden flight?",
    "explanationEn": "The chick spends approximately 3.5 to 4 months (110–130 days) in the nest being nourished with regurgitated food before fledging.",
    "optionsEn": {
      "opt-1": "About 3.5 to 4 months (110–130 days)",
      "opt-2": "Barely 10 days",
      "opt-3": "Over 2 full years",
      "opt-4": "It leaves the nest the day after hatching"
    }
  },
  "gypes-q-18": {
    "missionTitleEn": "Response to Adverse Weather",
    "titleEn": "What do Griffon Vultures do during torrential rain or dense fog in Cyprus?",
    "explanationEn": "In adverse weather without thermal updrafts, vultures stay grounded in sheltered cliff alcoves, comfortably fasting for several days until conditions improve.",
    "optionsEn": {
      "opt-1": "They remain sheltered on cliff ledges fasting until the weather clears",
      "opt-2": "They fly above storm clouds into space",
      "opt-3": "They swim in riverbeds",
      "opt-4": "They walk along highways"
    }
  },
  "gypes-q-19": {
    "missionTitleEn": "Acclimatization Aviary",
    "titleEn": "Why do vultures imported from Spain remain for several months in a specialized aviary before release?",
    "explanationEn": "The acclimatization period in the Limassol district aviary allows birds to imprint on local landmarks and prevents disorientation upon release.",
    "optionsEn": {
      "opt-1": "To acclimatize to local Cyprus climate and imprint on regional topography so they stay on the island",
      "opt-2": "Because they don't know how to fly",
      "opt-3": "To lay eggs before exiting",
      "opt-4": "To be viewed by tourists"
    }
  },
  "gypes-q-20": {
    "missionTitleEn": "Vulture 'Restaurants' (Feeding Stations)",
    "titleEn": "How many vulture 'restaurants' (feeding stations) operate in Cyprus to ensure tested, poison-free food supplies?",
    "explanationEn": "The Game and Fauna Service operates 4 fenced vulture restaurants stocked regularly with safe carcasses, securing clean food especially in winter.",
    "optionsEn": {
      "opt-1": "4 fenced feeding stations (Agios Ioannis, Limnitis/Kato Pyrgos, etc.)",
      "opt-2": "Only 1 station",
      "opt-3": "12 stations in every village",
      "opt-4": "No stations exist"
    }
  },
  "gypes-q-21": {
    "missionTitleEn": "Natural Habitat",
    "titleEn": "In which of the following environments are you most likely to encounter a Griffon Vulture in Cyprus?",
    "explanationEn": "Vultures thrive in rugged mountainous landscapes, sheer cliffs, deep gorges, and open pastoral scrublands.",
    "optionsEn": {
      "opt-1": "Steep rocky cliffs, river gorges, and open scrub valleys",
      "opt-2": "Dense urban centers and highway junctions",
      "opt-3": "Deep dense wetlands",
      "opt-4": "Suburban public gardens"
    }
  },
  "gypes-q-22": {
    "missionTitleEn": "Nesting Sites",
    "titleEn": "In which of the following environments/positions is a vulture nest most likely to be found?",
    "explanationEn": "Griffon Vultures nest exclusively in colonies situated on inaccessible cliff niches, steep ledges, and cave crevices.",
    "optionsEn": {
      "opt-1": "1 (Steep sea cliffs and gorge faces)",
      "opt-2": "2 (Treetop branches)",
      "opt-3": "3 (Ground reeds)",
      "opt-4": "4 (Building roofs)"
    }
  },
  "gypes-q-23": {
    "missionTitleEn": "Nest Construction Materials",
    "titleEn": "What materials does a pair of vultures carry in their beaks to line their cliff nest?",
    "explanationEn": "The nest base consists of sturdy dry branches, lined comfortably with soft sheep wool, dry grass, and hair collected from shrubs.",
    "optionsEn": {
      "opt-1": "Sturdy branches for the foundation, dry grasses and soft sheep wool for lining",
      "opt-2": "Mud and sea pebbles",
      "opt-3": "Wires and plastic bottles",
      "opt-4": "They do not use any materials at all"
    }
  },
  "gypes-q-24": {
    "missionTitleEn": "Matching Habitat & Nesting Metrics",
    "titleEn": "Match each habitat and nesting feature of the Griffon Vulture with its correct biological description:",
    "explanationEn": "The Griffon Vulture nests in cliff colonies, utilizing branches and wool, and guards a single egg laid in the heart of winter.",
    "pairsEn": [
      {
        "id": "p-1",
        "left": "Primary Nesting Substrate",
        "right": "Inaccessible cliff niches and sea ledges"
      },
      {
        "id": "p-2",
        "left": "Internal Nest Insulation",
        "right": "Sheep wool and dry grass bedding"
      },
      {
        "id": "p-3",
        "left": "Colonial Nesting Structure",
        "right": "Loose colonies with multiple pairs on adjacent ledges"
      },
      {
        "id": "p-4",
        "left": "Breeding Season Onset",
        "right": "Winter (January - February)"
      }
    ]
  },
  "gypes-q-25": {
    "missionTitleEn": "Field Photo: Cliff Diorama (#36)",
    "titleEn": "Locate the cliff habitat diorama or landscape representation in the center and submit your photo documentation.",
    "explanationEn": "Observing cliff dioramas illustrates the nesting ecology and thermal wind generation along Cyprus's southern coastline.",
    "taskPromptEn": "Capture a photo of the cliff diorama or nesting wall display in the educational center.",
    "verificationCriteriaEn": [
      "Cliff wall or gorge representation clearly visible",
      "Displays natural rock cavities suitable for vulture nesting"
    ]
  },
  "gypes-q-26": {
    "missionTitleEn": "True or False: Colonial Nesting",
    "titleEn": "Vultures are solitary birds that do not tolerate other vultures near their nesting territory.",
    "explanationEn": "False! Griffon Vultures are highly social and colonial birds. Multiple pairs nest in proximity on the same rock face, soaring together."
  },
  "gypes-q-27": {
    "missionTitleEn": "Exhibition Space: Optimal Nesting Habitat",
    "titleEn": "Locate within the exhibition hall the most suitable habitat display for a vulture to build its nest, and photograph it.",
    "explanationEn": "Field identification of coastal cliffs and deep valley gorges as the sole breeding terrain of Gyps fulvus in Cyprus.",
    "taskPromptEn": "Photograph the exhibition diorama depicting the optimal nesting cliffs of Cyprus.",
    "verificationCriteriaEn": [
      "Photo shows rocky coastal or mountain gorge habitat",
      "Clear framing of nesting ledges"
    ]
  },
  "gypes-q-28": {
    "missionTitleEn": "Historical Distribution in Cyprus",
    "titleEn": "In which areas of Cyprus did vultures live during the 1950s–1960s?",
    "explanationEn": "Historically, Griffon Vultures were abundant across all mountain ranges of Cyprus, including Pentadaktylos, Troodos, and southern coastal cliffs.",
    "optionsEn": {
      "opt-1": "Across almost all mountainous and semi-mountainous regions (Pentadaktylos, Troodos, Episkopi, Akamas)",
      "opt-2": "Only in zoo aviaries",
      "opt-3": "Exclusively in the coastal marshes of Larnaca",
      "opt-4": "Vultures never existed in Cyprus historically"
    }
  },
  "gypes-q-29": {
    "missionTitleEn": "Active Breeding Colonies in Cyprus",
    "titleEn": "Today vultures may be seen in several valleys, but which location hosts the only consistently active breeding cliff colony?",
    "explanationEn": "The Episkopi Cliffs (Zapalo Bay) represent the last and most critical active coastal breeding colony for wild Griffon Vultures in Cyprus.",
    "optionsEn": {
      "opt-1": "Episkopi Cliffs (Zapalo Bay)",
      "opt-2": "Akrotiri Salt Lake",
      "opt-3": "Troodos Summit",
      "opt-4": "Cape Greco"
    }
  },
  "gypes-q-30": {
    "missionTitleEn": "Thermal Updrafts & Soaring Flight",
    "titleEn": "How do vultures utilize the thermal updrafts forming near cliffs and mountains across Cyprus?",
    "explanationEn": "Thermals are columns of rising warm air. Vultures circle within them to gain thousands of meters of altitude with almost zero wing flapping, conserving vital energy.",
    "optionsEn": {
      "opt-1": "Thermals lift them high into the sky without tiring wing beats",
      "opt-2": "They attract other birds",
      "opt-3": "They cool them down in summer",
      "opt-4": "They shield them from ground predators"
    }
  },
  "gypes-q-31": {
    "missionTitleEn": "Flight Altitude",
    "titleEn": "To what altitude can vultures soar by exploiting thermal columns and their specialized hemoglobin?",
    "explanationEn": "Vultures routinely soar between 2,000 and 6,000 meters above sea level, aided by specialized hemoglobin with extraordinary oxygen-binding affinity.",
    "optionsEn": {
      "opt-1": "Between 2,000 and 6,000 meters (higher than Mount Olympus)",
      "opt-2": "Up to 500 meters only",
      "opt-3": "Up to 12,000 meters (where passenger jets fly)",
      "opt-4": "They never exceed 100 meters above ground"
    }
  },
  "gypes-q-32": {
    "missionTitleEn": "Foraging Range",
    "titleEn": "How much distance can a foraging vulture cover in a single day across Cyprus?",
    "explanationEn": "A soaring vulture can effortlessly cover 100 to 150+ kilometers daily, patrolling vast expanses across multiple districts in search of food.",
    "optionsEn": {
      "opt-1": "100+ kilometers",
      "opt-2": "20 - 40 kilometers",
      "opt-3": "40 - 60 kilometers",
      "opt-4": "Barely 5 kilometers"
    }
  },
  "gypes-q-33": {
    "missionTitleEn": "Flight Takeoff Time & the Sun",
    "titleEn": "Why do vultures usually wait several hours after sunrise before taking off to forage?",
    "explanationEn": "Without solar heating to warm the terrain and initiate thermal air columns, a heavy 8kg vulture would expend too much metabolic energy flapping its huge wings.",
    "optionsEn": {
      "opt-1": "Because they require solar heating of the ground to generate thermal updrafts",
      "opt-2": "Because they fear the morning dew",
      "opt-3": "Because they sleep until midday",
      "opt-4": "Because there are no carcasses in the morning"
    }
  },
  "gypes-q-34": {
    "missionTitleEn": "Gliding Speed between Thermals",
    "titleEn": "At what speed does a vulture glide through the air when traveling from one thermal current to another?",
    "explanationEn": "After circling to the apex of a thermal, a vulture glides toward the next thermal at cruise speeds of 60 to 80 km/h, reaching over 120 km/h in dives.",
    "optionsEn": {
      "opt-1": "60 to 80 km/h (and exceeding 100 km/h during descents)",
      "opt-2": "Barely 10 km/h",
      "opt-3": "300 km/h",
      "opt-4": "5 km/h"
    }
  },
  "gypes-q-35": {
    "missionTitleEn": "Team 2 Reflection: Something that impressed us",
    "titleEn": "Which aspect of the Episkopi coastal cliffs, energy-efficient thermal soaring, or 100+ km flight range impressed your team most? Write your reflection for the team poster!",
    "explanationEn": "Reflective inquiry synthesizing flight dynamics, habitat requirements, and colonial cliff nesting into a cohesive team perspective.",
    "taskPromptEn": "Compose a short reflection on thermal soaring and the majestic cliff colonies of Episkopi."
  },
  "gypes-q-36": {
    "missionTitleEn": "Nestling Development Time",
    "titleEn": "How long does a young Griffon chick remain dependent in the nest before taking its maiden flight?",
    "explanationEn": "The chick remains in the nest for about 120 days (approx. 4 months), meticulously nurtured by both parents before mastering flight.",
    "optionsEn": {
      "opt-1": "About 4 months (110–130 days)",
      "opt-2": "15 days",
      "opt-3": "One year",
      "opt-4": "One week"
    }
  },
  "gypes-q-37": {
    "missionTitleEn": "Adverse Weather Inactivity",
    "titleEn": "How do vultures cope with prolonged rainstorms or dense fog in Cyprus?",
    "explanationEn": "They remain perched securely on cliff alcoves. Vultures possess slow metabolisms allowing them to fast for days without adverse effects.",
    "optionsEn": {
      "opt-1": "They remain perched on cliff ledges fasting until favorable thermal conditions return",
      "opt-2": "They fly through thunderclouds",
      "opt-3": "They seek food inside caves",
      "opt-4": "They migrate to another continent"
    }
  },
  "gypes-q-38": {
    "missionTitleEn": "Acclimatization Process",
    "titleEn": "Why is an acclimatization aviary essential before releasing imported Spanish vultures into Cyprus?",
    "explanationEn": "The pre-release enclosure helps birds bond with local topography, social groups, and food resources, preventing attempts to fly back to Western Europe.",
    "optionsEn": {
      "opt-1": "To bond with the Cyprus landscape and join local wild birds at feeding stations",
      "opt-2": "To fatten them up",
      "opt-3": "To clip their wing feathers",
      "opt-4": "Because wild vultures attack them"
    }
  },
  "gypes-q-39": {
    "missionTitleEn": "Matching Flight & Aerodynamics",
    "titleEn": "Connect each aerodynamic flight feature of Gyps fulvus with its scientific function:",
    "explanationEn": "Slotted wingtips reduce drag, broad wings provide high lift, and thermal soaring enables effortless travel across hundreds of kilometers.",
    "pairsEn": [
      {
        "id": "p-fl-1",
        "left": "Slotted Wingtip Feathers ('Fingers')",
        "right": "Reduces wingtip vortices and turbulence during low-speed soaring"
      },
      {
        "id": "p-fl-2",
        "left": "Broad Wing Profile",
        "right": "Generates maximum lift at slow circling speeds in thermals"
      },
      {
        "id": "p-fl-3",
        "left": "Thermal Soaring Technique",
        "right": "Gains altitude without metabolic energy expenditure"
      },
      {
        "id": "p-fl-4",
        "left": "Gliding Speed (60–80 km/h)",
        "right": "Rapid transit between consecutive thermal air columns"
      }
    ]
  },
  "gypes-q-40": {
    "missionTitleEn": "Field Photo: Flight Silhouette (#36)",
    "titleEn": "Locate the flight silhouette or flight model illustration and upload your team's photo verification.",
    "explanationEn": "Recognizing the straight, rectangular wing silhouette with spread primary feathers is essential for field monitoring.",
    "taskPromptEn": "Take a photo of the vulture flight silhouette diagram or wing display.",
    "verificationCriteriaEn": [
      "Vulture in-flight silhouette clearly shown",
      "Distinct rectangular wings and short tail visible"
    ]
  },
  "gypes-q-41": {
    "missionTitleEn": "Chick Parental Care Duration",
    "titleEn": "For how many weeks do both parents feed and warm the vulnerable chick in the cliff nest?",
    "explanationEn": "Parental care is intensive: both parents take turns brooding and regurgitating food for over 16–18 weeks until fledging.",
    "optionsEn": {
      "opt-1": "16 to 18 weeks (about 4 months)",
      "opt-2": "2 to 3 weeks",
      "opt-3": "Only 3 days",
      "opt-4": "One full calendar year"
    }
  },
  "gypes-q-42": {
    "missionTitleEn": "Thermal Flight Strategy",
    "titleEn": "What strategy allows a vulture to cross vast stretches of sea or mountain terrain?",
    "explanationEn": "By spiraling up to high altitudes in warm thermals over land, the vulture then converts altitude into distance through continuous straight glides.",
    "optionsEn": {
      "opt-1": "Gaining maximum altitude in a thermal and gliding progressively to the next destination",
      "opt-2": "Continuous rapid wing flapping",
      "opt-3": "Resting on floating sea debris",
      "opt-4": "Riding exclusively on nocturnal winds"
    }
  },
  "gypes-q-43": {
    "missionTitleEn": "Dietary Classification",
    "titleEn": "What do vultures feed upon in the natural environment?",
    "explanationEn": "Vultures are obligate scavengers (πτωματοφάγα), feeding exclusively on the carcasses of dead animals.",
    "optionsEn": {
      "opt-1": "They are obligate scavengers, feeding strictly on animal carcasses",
      "opt-2": "They are herbivores feeding on mountain grasses and pine cones",
      "opt-3": "They are granivores feeding on seeds and cereals",
      "opt-4": "They are active predators hunting live sheep and hares"
    }
  },
  "gypes-q-44": {
    "missionTitleEn": "True or False: Predators or Scavengers",
    "titleEn": "Vultures frequently attack and kill healthy live sheep and goats in rural pastures.",
    "explanationEn": "False! Vultures lack predatory gripping talons and cannot kill healthy live livestock. They feed exclusively on dead livestock and wildlife."
  },
  "gypes-q-45": {
    "missionTitleEn": "Bare Neck & Head Anatomy",
    "titleEn": "Why are the head and neck of the Griffon Vulture devoid of dense feathers, covered only in soft down?",
    "explanationEn": "An evolutionary marvel for sanitation: a bare neck allows deep probing into carcasses without fouling feathers with blood and bacteria, and UV sunlight easily sterilizes the skin.",
    "optionsEn": {
      "opt-1": "For sanitary reasons: to prevent decaying matter from sticking and facilitate UV sun sterilization",
      "opt-2": "Because other vultures pluck their feathers",
      "opt-3": "To look fiercer to competitors",
      "opt-4": "Due to a chronic skin condition"
    }
  },
  "gypes-q-46": {
    "missionTitleEn": "Vision vs Smell: Locating Food",
    "titleEn": "Is it true that Old World Griffon Vultures smell carcasses from kilometers away?",
    "explanationEn": "No! European and Mediterranean vultures rely almost entirely on phenomenal eyesight, spotting a small carcass from kilometers high. Only certain American vultures possess keen olfaction.",
    "optionsEn": {
      "opt-1": "No! European vultures rely on razor-sharp eyesight, not smell, to spot food from miles away",
      "opt-2": "Yes, they smell rotting meat from 50 km away",
      "opt-3": "They use facial whiskers to smell",
      "opt-4": "They follow wind scents"
    }
  },
  "gypes-q-47": {
    "missionTitleEn": "Feeding Niche & Tissue Preferences",
    "titleEn": "Which parts of a carcass is the Griffon Vulture anatomically specialized to consume?",
    "explanationEn": "In the guild of scavengers, Gyps fulvus specializes in consuming soft muscle tissue, visceral organs, and intestines with its long neck and hooked beak.",
    "optionsEn": {
      "opt-1": "Soft meat, visceral organs, and muscle tissues",
      "opt-2": "Tough hide, cartilage, and heavy tendons",
      "opt-3": "Large dry bones which it swallows whole",
      "opt-4": "Insects and decaying maggots exclusively"
    }
  },
  "gypes-q-48": {
    "missionTitleEn": "Field Observation: Vulture Feather Exhibit",
    "titleEn": "Examine the cliff diorama. On the lower rock shelves several feathers have fallen. Identify and photograph the authentic vulture flight feather.",
    "explanationEn": "Griffon flight feathers are exceptionally broad, sturdy, and dark brown, adapted to withstand massive aerodynamic pressures.",
    "taskPromptEn": "Locate and photograph the authentic vulture feather specimen in the diorama display.",
    "verificationCriteriaEn": [
      "Broad raptor primary feather clearly centered",
      "Characteristic dark brown/grey coloration shown"
    ]
  },
  "gypes-q-49": {
    "missionTitleEn": "Gradual Symmetrical Molting",
    "titleEn": "How does the Griffon Vulture maintain continuous flight capability during annual feather renewal (molting)?",
    "explanationEn": "Flight feathers molt gradually and symmetrically in pairs (one from each wing), ensuring aerodynamic balance is never compromised.",
    "optionsEn": {
      "opt-1": "It sheds flight feathers symmetrically in pairs over several seasons to preserve aerodynamic balance",
      "opt-2": "It sheds all flight feathers at once and remains grounded for a month",
      "opt-3": "It never renews its feathers during its lifetime",
      "opt-4": "It plucks its feathers only during winter"
    }
  },
  "gypes-q-50": {
    "missionTitleEn": "Stomach Acidity (pH ~1.0)",
    "titleEn": "How acidic is a vulture's stomach environment, and what vital protection does this provide?",
    "explanationEn": "With an astonishing pH close to 1.0 (equivalent to battery acid), a vulture's gastric juices neutralize deadly pathogens including Anthrax, Botulism, and Cholera.",
    "optionsEn": {
      "opt-1": "Extremely acidic (pH ~1.0), neutralizing deadly pathogens like anthrax, botulism, and cholera",
      "opt-2": "Completely neutral like pure distilled water (pH 7.0)",
      "opt-3": "Identical to a human stomach (pH 3–4)",
      "opt-4": "Completely free of any acid"
    }
  },
  "gypes-q-51": {
    "missionTitleEn": "Public Health: Nature's Sanitation Brigade",
    "titleEn": "How do vultures directly benefit local livestock farmers and human communities across Cyprus?",
    "explanationEn": "By consuming dead livestock quickly and cleanly at no cost, they halt the spread of infectious livestock diseases and eliminate breeding grounds for flies and rodents.",
    "optionsEn": {
      "opt-1": "They quickly consume livestock carcasses for free, preventing disease outbreaks and pest swarms",
      "opt-2": "They help plow crop fields",
      "opt-3": "They guard goat pens at night",
      "opt-4": "They offer no benefit to human communities"
    }
  },
  "gypes-q-52": {
    "missionTitleEn": "Pre-Release Health Screening",
    "titleEn": "Why undergo rigorous clinical screening and quarantine in the aviary before release?",
    "explanationEn": "Quarantine guarantees that introduced Spanish birds carry no infectious pathogens and are fully habituated to Cyprus feeding stations.",
    "optionsEn": {
      "opt-1": "To verify pristine clinical health, administer vaccines, and habituate them to Cyprus feeding stations",
      "opt-2": "To keep them away from other birds",
      "opt-3": "To train them to perform tricks",
      "opt-4": "Because Cyprus law forbids free-flying vultures"
    }
  },
  "gypes-q-53": {
    "missionTitleEn": "Urohidrosis Cooling Behavior",
    "titleEn": "Why do vultures intentionally excrete onto their own bare legs during hot Mediterranean summer days?",
    "explanationEn": "This behavior (urohidrosis) uses evaporative cooling through blood vessels in their unfeathered legs to lower core body temperature, while acidic uric acid disinfects their feet.",
    "optionsEn": {
      "opt-1": "For evaporative cooling to lower core body temperature and disinfect legs with uric acid",
      "opt-2": "By accident due to poor coordination",
      "opt-3": "To change leg color to white",
      "opt-4": "Because they are frightened by enemies"
    }
  },
  "gypes-q-54": {
    "missionTitleEn": "QR Station: Ecosystem Values",
    "titleEn": "Proceed outside to the rest area (park). On the magnetic board on your left, scan the QR code to hear the environmental officer explain the ecological value of vultures.",
    "explanationEn": "Field station providing direct audio-visual briefing on the sanitation services and carbon reduction provided by scavengers.",
    "stationNameEn": "Visitor Center Park Station: Vulture Ecosystem Values",
    "stationLocationEn": "Outdoor Magnetic Educational Board, Center Courtyard",
    "fieldClueEn": "Look for the large QR code board next to the shaded picnic rest area."
  },
  "gypes-q-55": {
    "missionTitleEn": "Ecological Value Verification",
    "titleEn": "According to the environmental officer in the QR audio briefing, what is the primary way vultures benefit us and nature?",
    "explanationEn": "Vultures act as nature's ultimate waste sanitizers, eliminating dead animals and preventing contamination of groundwater and pastoral land.",
    "optionsEn": {
      "opt-1": "They sanitize the environment by rapidly disposing of carcasses, preventing disease propagation",
      "opt-2": "They protect crops from insect pests",
      "opt-3": "They disperse forest seeds across mountains",
      "opt-4": "They provide hunting entertainment"
    }
  },
  "gypes-q-56": {
    "missionTitleEn": "Team 3 Reflection: Something that impressed us",
    "titleEn": "Which biological superpower of the vulture inspired the greatest awe (pH 1.0 acid stomach neutralizing anthrax, obligate scavenger role, bare neck sanitation)? Write your reflection for the team poster!",
    "explanationEn": "Inquiry reflection highlighting ecological sanitation and evolutionary adaptations of Gyps fulvus in Cyprus.",
    "taskPromptEn": "Compose a team reflection on the vital sanitation role and disease-fighting adaptations of the Griffon Vulture."
  },
  "gypes-q-57": {
    "missionTitleEn": "Matching Scavenger Adaptations",
    "titleEn": "Match each anatomical and dietary adaptation with its crucial survival function:",
    "explanationEn": "Strong hooked bills tear muscle tissue, acidic gastric fluid neutralizes deadly bacteria, bare skin prevents contamination, and keen vision locates food from 3,000m.",
    "pairsEn": [
      {
        "id": "p-d-1",
        "left": "Gastric Fluid Acidity (pH 1.0)",
        "right": "Destroys anthrax, cholera, and botulinum toxins"
      },
      {
        "id": "p-d-2",
        "left": "Bare Neck & Head Down",
        "right": "Prevents bacterial growth and enables easy cleaning"
      },
      {
        "id": "p-d-3",
        "left": "Sharp Hooked Bill",
        "right": "Tears and strips muscle tissue from animal carcasses"
      },
      {
        "id": "p-d-4",
        "left": "Exceptional Telescopic Vision",
        "right": "Detects dead livestock from thousands of meters in flight"
      }
    ]
  },
  "gypes-q-58": {
    "missionTitleEn": "Field Photo: Beak & Neck Model (#36)",
    "titleEn": "Locate the educational display showcasing the vulture's head, beak, and neck adaptations, and upload your team's photo.",
    "explanationEn": "Direct observation of skull and beak morphology reinforces understanding of the obligate scavenging feeding niche.",
    "taskPromptEn": "Photograph the anatomical display illustrating the head, neck, and beak adaptations of the Griffon Vulture.",
    "verificationCriteriaEn": [
      "Clear view of vulture beak and bare neck feature",
      "Good illumination highlighting the anatomical details"
    ]
  },
  "gypes-q-59": {
    "missionTitleEn": "Digestion Speed & Crop Capacity",
    "titleEn": "How much food can a hungry vulture consume in a single feeding session at a carcass?",
    "explanationEn": "A vulture can gorge up to 1.5–2 kg of meat (approx. 20% of its body weight) in a single meal, storing it in its distensible crop.",
    "optionsEn": {
      "opt-1": "Up to 1.5 to 2 kilograms (approx. 20% of its own body weight)",
      "opt-2": "Barely 50 grams",
      "opt-3": "Over 15 kilograms",
      "opt-4": "Vultures never eat more than 200 grams at a time"
    }
  },
  "gypes-q-60": {
    "missionTitleEn": "Weather Adaptation & Metabolism",
    "titleEn": "How does a vulture survive when prolonged winter gales prevent flight for multiple consecutive days?",
    "explanationEn": "A vulture stores metabolic fat from large feeding bouts and enters a resting energy-saving state, easily fasting for 1–2 weeks without harm.",
    "optionsEn": {
      "opt-1": "It enters a low-energy resting state on cliffs, utilizing fat reserves to fast for up to 2 weeks",
      "opt-2": "It begs food from human houses",
      "opt-3": "It dies within 24 hours without food",
      "opt-4": "It consumes dirt and pebbles"
    }
  },
  "gypes-q-61": {
    "missionTitleEn": "QR Station: Critical Threats in Cyprus",
    "titleEn": "Locate the QR code mounted on the partition panel in the library hall, scan it, and listen carefully to the officer outline the grave threats facing vultures.",
    "explanationEn": "Interactive audio briefing exposing the devastating impact of illegal poisoned baits, power line collisions, and disturbance.",
    "stationNameEn": "Library Hall Station: Critical Threats to Cyprus Vultures",
    "stationLocationEn": "Library Hall, Center Partition Panel",
    "fieldClueEn": "Search the educational library partition wall near the LIFE with Vultures information desk."
  },
  "gypes-q-62": {
    "missionTitleEn": "Identifying Main Threats (Multi-Select)",
    "titleEn": "Which of the following are the primary threats confronting the Griffon Vulture in Cyprus according to the conservation briefing? Select all that apply.",
    "explanationEn": "Illegal poisoned baits, power line electrocution/collision, and human disturbance near nesting cliffs are the main threats. Natural predators and tree felling do not threaten cliff-nesting vultures in Cyprus.",
    "optionsEn": {
      "opt-1": "Illegal poisoned baits placed in the countryside",
      "opt-2": "Electrocution on high-voltage power pylons and cable collisions",
      "opt-3": "Disturbance of breeding cliffs by human activities",
      "opt-4": "Attacks from brown bears and wolves",
      "opt-5": "Felling of forest trees where they nest"
    }
  },
  "gypes-q-63": {
    "missionTitleEn": "The #1 Primary Threat in Cyprus",
    "titleEn": "Of all threats confronting the vulture, what has been the number 1 cause of mortality bringing them to the brink of extinction in Cyprus?",
    "explanationEn": "Poisoned baits are the single most destructive threat. Because vultures feed communally, a single poisoned carcass can annihilate an entire flock of 10–15 vultures in one afternoon.",
    "optionsEn": {
      "opt-1": "Illegal poisoned baits placed in rural areas",
      "opt-2": "Shortage of water during summer",
      "opt-3": "Climate change",
      "opt-4": "Death from old age"
    }
  },
  "gypes-q-64": {
    "missionTitleEn": "Power Line Electrocution & Collision",
    "titleEn": "Why do overhead high-voltage power lines pose such a serious hazard for large raptors like vultures?",
    "explanationEn": "Because of their massive 2.5m wingspan, a vulture easily bridges two live electrical wires or a wire and grounded crossarm when perching, suffering fatal electrocution.",
    "optionsEn": {
      "opt-1": "Their huge 2.5m wingspan can bridge live cables causing fatal electrocution, and low maneuverability leads to wire collisions",
      "opt-2": "Because electricity causes dizziness",
      "opt-3": "Because they enjoy eating electrical cables",
      "opt-4": "Because they cannot see black wires in daylight"
    }
  },
  "gypes-q-65": {
    "missionTitleEn": "Power Line Markers (Flight Diverters)",
    "titleEn": "What devices are installed on overhead electricity cables in Cyprus to prevent vulture collisions?",
    "explanationEn": "Spiral flappers and high-visibility flight diverters make cables conspicuous from a distance, prompting vultures to steer clear.",
    "optionsEn": {
      "opt-1": "Special spiral flight diverters / markers and insulating pylon caps",
      "opt-2": "Neon advertising signs",
      "opt-3": "Sound sirens",
      "opt-4": "Nothing is installed"
    }
  },
  "gypes-q-66": {
    "missionTitleEn": "The 4 Fenced Feeding Stations in Cyprus",
    "titleEn": "How many official fenced vulture feeding stations operate in Cyprus under the Game and Fauna Service?",
    "explanationEn": "Four specialized feeding stations in strategic districts supply safe, poison-free, veterinarian-certified carcasses to sustain the population.",
    "optionsEn": {
      "opt-1": "4 feeding stations in strategic locations (Agios Ioannis, Limnitis, etc.)",
      "opt-2": "1 station",
      "opt-3": "5 stations",
      "opt-4": "10 stations across Cyprus"
    }
  },
  "gypes-q-67": {
    "missionTitleEn": "Collaboration with Local Pastoral Farmers",
    "titleEn": "How do local livestock farmers actively contribute to the rescue of the Griffon Vulture in Cyprus?",
    "explanationEn": "Pastoral farmers legally deposit dead sheep and goats at safe feeding stations, eliminating the need to leave carcasses in open fields where poisons might be set.",
    "optionsEn": {
      "opt-1": "They deliver dead livestock to official feeding stations and report poisoned baits",
      "opt-2": "They spray pastures with toxic chemicals",
      "opt-3": "They abandon dead animals on roadsides",
      "opt-4": "There is no cooperation with farmers"
    }
  },
  "gypes-q-68": {
    "missionTitleEn": "Vulture Translocation & Restocking",
    "titleEn": "From which European country were young rescued vultures translocated to Cyprus to replenish the wild population?",
    "explanationEn": "Spain, which harbors over 90% of Europe's vulture population, translocated dozens of rehabilitated young birds to Cyprus under the LIFE project.",
    "optionsEn": {
      "opt-1": "Spain (the country with Europe's largest, healthiest vulture population)",
      "opt-2": "England",
      "opt-3": "Iceland",
      "opt-4": "Germany"
    }
  },
  "gypes-q-69": {
    "missionTitleEn": "K9 Poison Detection Dog Units",
    "titleEn": "What is the specialized role of the K9 detection dog units operated by the Game and Fauna Service in Cyprus?",
    "explanationEn": "Trained detection dogs (like Dixie and Sophie) patrol rural hills, sniffing out and confiscating poisoned baits before any wildlife consumes them.",
    "optionsEn": {
      "opt-1": "They detect illegal poisoned baits and carcasses by scent across rural patrol routes",
      "opt-2": "They chase vultures to capture them",
      "opt-3": "They guard nests on cliffs",
      "opt-4": "They herd sheep and goats"
    }
  },
  "gypes-q-70": {
    "missionTitleEn": "Wind Farms & Automatic Shutdown Systems",
    "titleEn": "What cutting-edge technology is installed near wind turbines to prevent collisions with soaring vultures?",
    "explanationEn": "AI camera and radar systems (like DTBird) continuously track incoming raptors and automatically brake turbine blades to a stop within seconds.",
    "optionsEn": {
      "opt-1": "AI cameras and radar systems that detect soaring vultures and trigger automatic turbine shutdown",
      "opt-2": "Blaring sirens",
      "opt-3": "Large protective nets around blades",
      "opt-4": "Painting blades with glow-in-the-dark paint"
    }
  },
  "gypes-q-71": {
    "missionTitleEn": "Acclimatization Aviary Enclosure",
    "titleEn": "Why must vultures imported from Spain spend several months in a specialized aviary before release into Cyprus?",
    "explanationEn": "Enclosure habituation establishes geographical imprinting and bonding with local wild birds at nearby feeding stations, anchoring them to Cyprus.",
    "optionsEn": {
      "opt-1": "To acclimatize to local conditions, bond with Cyprus topography, and prevent disorientation",
      "opt-2": "Because they cannot fly",
      "opt-3": "To lay eggs before exiting",
      "opt-4": "For tourist exhibitions"
    }
  },
  "gypes-q-72": {
    "missionTitleEn": "GPS Solar Satellite Transmitters",
    "titleEn": "Equipping vultures with solar GPS satellite transmitters is a cornerstone of conservation in Cyprus. What is the primary utility of this technology?",
    "explanationEn": "Real-time satellite tracking provides continuous position data. If a bird becomes stationary, an automatic mortality alarm alerts field rangers to intervene immediately and investigate potential poisoning.",
    "optionsEn": {
      "opt-1": "Real-time location tracking and automatic mortality alerts enabling rapid intervention by field teams",
      "opt-2": "Recording flight speed only",
      "opt-3": "Providing the bird with automated navigation instructions",
      "opt-4": "Measuring environmental air temperature"
    }
  },
  "gypes-q-73": {
    "missionTitleEn": "Matching LIFE with Vultures Conservation Measures",
    "titleEn": "Connect each groundbreaking conservation measure with its direct contribution to saving the Griffon Vulture in Cyprus:",
    "explanationEn": "K9 dog patrols remove deadly baits, GPS telemetry triggers emergency rescues, insulated pylons prevent electrocution, and Spanish translocations replenish numbers.",
    "pairsEn": [
      {
        "id": "p-c-1",
        "left": "K9 Anti-Poison Dog Patrols",
        "right": "Sniffs out and confiscates illegal poison baits in the countryside"
      },
      {
        "id": "p-c-2",
        "left": "GPS Solar Satellite Transmitters",
        "right": "Transmits real-time location and immediate mortality alarm signals"
      },
      {
        "id": "p-c-3",
        "left": "Pylon Insulation & Spiral Markers",
        "right": "Prevents fatal electrocution and power cable collisions"
      },
      {
        "id": "p-c-4",
        "left": "Fenced Safe Feeding Stations",
        "right": "Guarantees veterinarian-tested, poison-free food supplies"
      }
    ]
  },
  "gypes-q-74": {
    "missionTitleEn": "Team Poll: Most Critical Conservation Priority",
    "titleEn": "In your team's assessment, which conservation action is the most urgent and vital to guarantee the vulture's survival in Cyprus?",
    "explanationEn": "While all measures under the LIFE with Vultures project are interconnected, eliminating illegal poison baits is acknowledged as the essential prerequisite for population recovery.",
    "optionsEn": {
      "opt-1": "Definitive elimination of illegal poisoned baits through strict enforcement and K9 patrols",
      "opt-2": "Network of fenced, safe supplementary feeding stations",
      "opt-3": "Marking and insulating overhead electrical transmission lines",
      "opt-4": "Population restocking through translocation of young birds from Spain",
      "opt-5": "Education and close collaboration with local rural and pastoral communities"
    }
  },
  "gypes-q-75": {
    "missionTitleEn": "Team 4 Reflection: Something that impressed us",
    "titleEn": "As official Ambassadors for Vulture Conservation, what touched your team most in the rescue campaign (anti-poison K9 dogs, GPS transmitters, safe feeding stations, Spanish birds)? Write your reflection for the team poster!",
    "explanationEn": "Inquiry reflection articulating civic stewardship, biodiversity conservation ethics, and practical protection measures in Cyprus.",
    "taskPromptEn": "Compose an inspiring team message about defending the Griffon Vulture against poisons and securing its future in Cyprus."
  }
};

/**
 * Returns a localized view of a Question object without altering the underlying data.
 * When language is 'el', returns the question as-is.
 * When language is 'en', maps all present fields to their faithful English translation.
 */
export function getLocalizedQuestion(question: Question, language: 'el' | 'en'): Question {
  if (language === 'el') {
    return question;
  }

  const trans = QUESTION_TRANSLATIONS[question.id];
  if (!trans) {
    // Return original question if no translation is found (e.g. user-created question)
    return question;
  }

  const localized = { ...question } as any;

  if (trans.titleEn) {
    localized.title = trans.titleEn;
  }
  if (trans.missionTitleEn && localized.missionTitle) {
    localized.missionTitle = trans.missionTitleEn;
  }
  if (trans.explanationEn && localized.explanation && localized.explanation !== '-') {
    localized.explanation = trans.explanationEn;
  }
  if (trans.instructionEn && localized.instruction) {
    localized.instruction = trans.instructionEn;
  }

  // Options for multiple choice
  if (localized.options && trans.optionsEn) {
    localized.options = localized.options.map((opt: any) => ({
      ...opt,
      text: trans.optionsEn![opt.id] || opt.text,
    }));
  }

  // Pairs for matching questions
  if (localized.pairs && trans.pairsEn) {
    localized.pairs = localized.pairs.map((pair: any) => {
      const match = trans.pairsEn!.find((p) => p.id === pair.id);
      if (match) {
        return {
          ...pair,
          left: match.left,
          right: match.right,
        };
      }
      return pair;
    });
  }

  // Task prompt and criteria for photo / video questions
  if (trans.taskPromptEn && localized.taskPrompt) {
    localized.taskPrompt = trans.taskPromptEn;
  }
  if (trans.verificationCriteriaEn && localized.verificationCriteria) {
    localized.verificationCriteria = trans.verificationCriteriaEn;
  }

  // QR station fields
  if (trans.stationNameEn && localized.stationName) {
    localized.stationName = trans.stationNameEn;
  }
  if (trans.stationLocationEn && localized.stationLocation) {
    localized.stationLocation = trans.stationLocationEn;
  }
  if (trans.fieldClueEn && localized.fieldClue) {
    localized.fieldClue = trans.fieldClueEn;
  }

  // Visual matching
  if (trans.promptDescriptionEn && localized.promptDescription) {
    localized.promptDescription = trans.promptDescriptionEn;
  }

  return localized as Question;
}
