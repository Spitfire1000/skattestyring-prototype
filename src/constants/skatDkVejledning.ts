/**
 * SKAT.DK VEJLEDNINGER
 *
 * Indeholder præcise vejledninger for hver tabspulje:
 * - Hvor man finder sit tal på skat.dk
 * - Hvad det betyder
 * - Hvad man skal indtaste
 *
 * VIGTIGT: Det er KUN Frit Depot og ASK der er relevante for brugerinput.
 * Pension og børneopsparing håndteres automatisk af udbyder.
 */

import type { TabsPulje } from '../types/skat';

// ============================================================
// TYPER
// ============================================================

/**
 * Vejledning for en specifik rubrik på skat.dk
 */
export interface RubrikVejledning {
  rubrikNummer: string;
  rubrikNavn: string;
  blanketNummer?: string;         // Fx '04.055' for særskilt bilag
  hvordanFinderDuDet: string[];   // Trin-for-trin (til UI)
  hvadSkalDuIndtaste: string;     // Kort instruktion
  hvisIngenVærdi: string;         // Hvad det betyder hvis tom
  automatisk: boolean;            // Om SKAT beregner det
  vigtigt?: string;               // Vigtig bemærkning
  skatDkUrl?: string;
}

/**
 * Input-felt til onboarding
 */
export interface OnboardingInputFelt {
  id: string;
  label: string;
  hjælpetekst: string;
  rubrikRef: string;              // Hvilken rubrik værdien kommer fra
  type: 'currency';               // Altid beløb
  påkrævet: boolean;
  defaultVærdi: number;           // 0
}

/**
 * Samlet onboarding-info for én tabspulje
 */
export interface TabspuljeOnboarding {
  pulje: TabsPulje | 'KAPITAL_INFO';  // KAPITAL_INFO er ikke en reel pulje, kun info
  titel: string;
  undertitel: string;
  rubrikker: RubrikVejledning[];  // Kan have flere rubrikker (fx fin.kontrakter)
  harFremførsel: boolean;         // Har denne pulje en saldo at hente?
  inputFelter: OnboardingInputFelt[];
  infoTekst?: string;             // Bruges til kapitalindkomst (ingen input)
}

// ============================================================
// VEJLEDNINGER PER TABSPULJE
// ============================================================

/**
 * NOTEREDE AKTIER
 * DK/udenlandske aktier, positivliste-ETF, investeringsforeninger
 */
export const NOTERET_AKTIE_ONBOARDING: TabspuljeOnboarding = {
  pulje: 'NOTERET_AKTIE',
  titel: 'Noterede aktier',
  undertitel: 'DK/udenlandske aktier, positivliste-ETF, inv.foreninger',
  harFremførsel: true,
  rubrikker: [{
    rubrikNummer: 'Specifikation på årsopgørelsen',
    rubrikNavn: 'Tab på aktier optaget til handel til fremførsel',
    hvordanFinderDuDet: [
      'Log ind på skat.dk/tastselv med MitID',
      'Klik på "Årsopgørelse" i menuen',
      'Vælg årsopgørelse for det korrekte år',
      'Scroll ned til "Specifikation"',
      'Find linjen "Tab på aktier optaget til handel til fremførsel"',
      'Beløbet der står er din tabssaldo — det er det du skal indtaste',
    ],
    hvadSkalDuIndtaste: 'Beløbet ud for "Tab på aktier optaget til handel til fremførsel"',
    hvisIngenVærdi: 'Hvis linjen ikke findes eller beløbet er 0, har du intet fremført tab. Lad feltet stå tomt.',
    automatisk: true,
    vigtigt: 'SKAT beregner og modregner automatisk. Du skal bare verificere at saldoen er korrekt.',
    skatDkUrl: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier/overgangsregler-for-uudnyttede-tab-paa-aktier-fra-tidligere-aar',
  }],
  inputFelter: [{
    id: 'noteret_aktie_saldo',
    label: 'Fremført tab på noterede aktier',
    hjælpetekst: 'Find beløbet under "Specifikation" → "Tab på aktier optaget til handel til fremførsel" på din årsopgørelse',
    rubrikRef: 'Specifikation på årsopgørelsen',
    type: 'currency',
    påkrævet: false,
    defaultVærdi: 0,
  }],
};

/**
 * UNOTEREDE AKTIER
 * Startup-aktier, anparter i private selskaber
 */
export const UNOTERET_AKTIE_ONBOARDING: TabspuljeOnboarding = {
  pulje: 'UNOTERET_AKTIE',
  titel: 'Unoterede aktier',
  undertitel: 'Startup-aktier, anparter i private selskaber',
  harFremførsel: false,  // Tab giver skatteværdi direkte, sjældent fremført saldo
  rubrikker: [{
    rubrikNummer: '67',
    rubrikNavn: 'Gevinst/tab på aktier ikke optaget til handel',
    hvordanFinderDuDet: [
      'Unoterede aktier har normalt INGEN fremført tabssaldo',
      'Tab giver fuld skatteværdi (27%/42%) direkte i din slutskat',
      'Har du alligevel ubrugt tab, finder du det i rubrik 67 på årsopgørelsen',
    ],
    hvadSkalDuIndtaste: 'Kun relevant hvis du har tab der ikke blev brugt. De fleste kan springe dette over.',
    hvisIngenVærdi: 'Det er forventet — tab på unoterede aktier bruges normalt med det samme.',
    automatisk: false,
    vigtigt: 'Fra 2024 er aktier på First North, Spotlight mv. rykket til NOTEREDE aktier (rubrik 66). Kun ægte unoterede (private anparter) hører til her.',
  }],
  inputFelter: [{
    id: 'unoteret_aktie_saldo',
    label: 'Fremført tab på unoterede aktier (valgfrit)',
    hjælpetekst: 'De fleste har ikke en saldo her. Spring over hvis du er i tvivl.',
    rubrikRef: '67',
    type: 'currency',
    påkrævet: false,
    defaultVærdi: 0,
  }],
};

/**
 * FINANSIELLE KONTRAKTER
 * Optioner, CFD, futures, warrants
 */
export const FINANSIEL_KONTRAKT_ONBOARDING: TabspuljeOnboarding = {
  pulje: 'FINANSIEL_KONTRAKT',
  titel: 'Finansielle kontrakter',
  undertitel: 'Optioner, CFD, futures, warrants',
  harFremførsel: true,
  rubrikker: [
    {
      rubrikNummer: '85',
      rubrikNavn: 'Tab til fremførsel — ikke-aktiebaserede kontrakter',
      blanketNummer: '04.055',
      hvordanFinderDuDet: [
        'Log ind på skat.dk/tastselv med MitID',
        'Klik på "Ret årsopgørelse/oplysningsskema"',
        'Find blanket 04.055 (særskilt bilag)',
        'Rubrik 85 viser din tabssaldo for ikke-aktiebaserede kontrakter',
        'Det er kontrakter baseret på fx råvarer, valuta, krypto',
      ],
      hvadSkalDuIndtaste: 'Beløbet i rubrik 85 — det er din samlede tabssaldo til fremførsel',
      hvisIngenVærdi: 'Hvis rubrik 85 er tom eller 0, har du intet fremført tab på ikke-aktiebaserede kontrakter.',
      automatisk: false,
      vigtigt: 'Du vedligeholder SELV denne saldo hvert år. Første år = årets tab. Næste år = gammel saldo + nyt tab - brugt fradrag.',
      skatDkUrl: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/finansielle-kontrakter',
    },
    {
      rubrikNummer: '86',
      rubrikNavn: 'Tab til fremførsel — aktiebaserede kontrakter',
      blanketNummer: '04.055',
      hvordanFinderDuDet: [
        'På samme blanket 04.055',
        'Rubrik 86 viser din tabssaldo for aktiebaserede kontrakter',
        'Det er kontrakter baseret på børsnoterede aktier eller aktieindeks',
      ],
      hvadSkalDuIndtaste: 'Beløbet i rubrik 86',
      hvisIngenVærdi: 'Hvis rubrik 86 er tom eller 0, har du intet fremført tab på aktiebaserede kontrakter.',
      automatisk: false,
      vigtigt: 'Aktiebaserede kontrakter har UDVIDET modregning — kan bruges mod aktiegevinster (rubrik 66) via rubrik 87.',
    },
  ],
  inputFelter: [
    {
      id: 'finansiel_kontrakt_saldo_85',
      label: 'Tab ikke-aktiebaserede kontrakter (rubrik 85)',
      hjælpetekst: 'Blanket 04.055, rubrik 85. Kontrakter baseret på råvarer, valuta, krypto mv.',
      rubrikRef: '85',
      type: 'currency',
      påkrævet: false,
      defaultVærdi: 0,
    },
    {
      id: 'finansiel_kontrakt_saldo_86',
      label: 'Tab aktiebaserede kontrakter (rubrik 86)',
      hjælpetekst: 'Blanket 04.055, rubrik 86. Kontrakter baseret på børsnoterede aktier/aktieindeks.',
      rubrikRef: '86',
      type: 'currency',
      påkrævet: false,
      defaultVærdi: 0,
    },
  ],
};

/**
 * ASK (AKTIESPAREKONTO)
 * Tab kan KUN bruges på SAMME ASK-konto
 */
export const ASK_ONBOARDING: TabspuljeOnboarding = {
  pulje: 'ASK_ISOLERET',
  titel: 'Aktiesparekonto (ASK)',
  undertitel: 'Tab kan KUN bruges på SAMME ASK-konto',
  harFremførsel: true,
  rubrikker: [{
    rubrikNummer: 'Bankens ASK-årsopgørelse',
    rubrikNavn: 'Fremført negativt beskatningsgrundlag',
    hvordanFinderDuDet: [
      'Log ind hos din bank/mægler (fx Nordnet eller Saxo Bank)',
      'Find din Aktiesparekonto',
      'Se årsopgørelsen for kontoen for det korrekte år',
      'Kig efter "Fremført negativt beskatningsgrundlag" eller "Fremført tab"',
      'Hvis der står et beløb, er det dit fradrag til gode',
    ],
    hvadSkalDuIndtaste: 'Beløbet for "fremført negativt beskatningsgrundlag" fra din banks ASK-årsopgørelse',
    hvisIngenVærdi: 'Hvis der ikke står noget, har din ASK haft positivt afkast de foregående år. Lad feltet stå tomt.',
    automatisk: true,
    vigtigt: 'ASK-tab er 100% isoleret. Kan IKKE bruges på andre konti. TABES permanent hvis kontoen lukkes!',
    skatDkUrl: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto',
  }],
  inputFelter: [{
    id: 'ask_fremført_tab',
    label: 'Fremført negativt afkast på ASK',
    hjælpetekst: 'Find beløbet på din banks ASK-årsopgørelse under "fremført negativt beskatningsgrundlag"',
    rubrikRef: 'Bankens ASK-opgørelse',
    type: 'currency',
    påkrævet: false,
    defaultVærdi: 0,
  }],
};

/**
 * KAPITALINDKOMST (ETF ikke-positivliste)
 * INGEN onboarding-input nødvendigt!
 * Kapitalindkomst har INGEN tabsbank — tab nulstilles 31. dec.
 */
export const KAPITAL_INFO_ONBOARDING: TabspuljeOnboarding = {
  pulje: 'KAPITAL_INFO',
  titel: 'Kapitalindkomst',
  undertitel: 'ETF ikke-positivliste, obligationer, blandede fonde',
  harFremførsel: false,
  rubrikker: [],
  inputFelter: [],
  infoTekst: 'Kapitalindkomst har INGEN tabsbank. Tab bruges straks i skatteåret og ' +
             'kan ikke fremføres. Du behøver ikke indtaste noget her — systemet ' +
             'beregner automatisk baseret på dine handler.',
};

// ============================================================
// SAMLET MAP
// ============================================================

/**
 * Alle tabspulje-onboardings samlet i et map for nem opslag
 */
export const TABSPULJE_ONBOARDING: Record<string, TabspuljeOnboarding> = {
  'NOTERET_AKTIE': NOTERET_AKTIE_ONBOARDING,
  'UNOTERET_AKTIE': UNOTERET_AKTIE_ONBOARDING,
  'FINANSIEL_KONTRAKT': FINANSIEL_KONTRAKT_ONBOARDING,
  'ASK_ISOLERET': ASK_ONBOARDING,
  'KAPITAL_INFO': KAPITAL_INFO_ONBOARDING,
};

/**
 * Hent onboarding-vejledning for en specifik pulje
 */
export function hentPuljeVejledning(pulje: TabsPulje | 'KAPITAL_INFO'): TabspuljeOnboarding | undefined {
  return TABSPULJE_ONBOARDING[pulje];
}

/**
 * Hent alle puljer der kræver brugerinput (har inputFelter)
 */
export function hentPuljerMedInput(): TabspuljeOnboarding[] {
  return Object.values(TABSPULJE_ONBOARDING).filter(p => p.inputFelter.length > 0);
}

/**
 * Erstat årstal-placeholders i vejlednings-trin
 * Bruges til at indsætte dynamiske årstal baseret på onboarding-kontekst
 *
 * @param trin - Array af vejledningstrin
 * @param år - Årstal der skal indsættes
 * @returns Opdaterede trin med konkrete årstal
 */
export function indsætÅrstalIVejledning(trin: string[], år: number): string[] {
  return trin.map(t =>
    t.replace('det korrekte år', `${år}`)
     .replace('det korrekte år', `${år}`)
  );
}
