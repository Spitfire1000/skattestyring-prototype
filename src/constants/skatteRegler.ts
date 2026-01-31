import type { KontoType, AktivType, TabsPulje } from '../types/skat';

// ============================================================
// SATSER 2025/2026
// ============================================================

export const SKATTESATSER = {
  // Aktieindkomst
  AKTIE_LAV: 0.27,                // 27%
  AKTIE_HØJ: 0.42,                // 42%

  // Progressionsgrænse
  PROGRESSIONSGRÆNSE_ENLIG: 79400,
  PROGRESSIONSGRÆNSE_GIFT: 158800,

  // Kapitalindkomst (ca.)
  KAPITAL_POSITIV: 0.37,          // ~37% (afhænger af samlet indkomst)
  KAPITAL_NEGATIV_FRADRAG: 0.25,  // ~25% fradragsværdi

  // ASK
  ASK_SATS: 0.17,                 // 17%
  ASK_INDSKUDSGRÆNSE: 174200,

  // PAL
  PAL_SATS: 0.153,                // 15,3%

  // Børneopsparing
  BØRNEOPSPARING_SATS: 0,         // 0%
} as const;

// ============================================================
// KONTOTYPE-REGLER
// ============================================================

interface KontoSkatteRegel {
  beskatningsmetode: 'REALISATION' | 'LAGER' | 'MIXED';
  skattesats: 'AKTIEINDKOMST' | 'ASK_17' | 'PAL_15_3' | 'SKATTEFRI';
  isoleret: boolean;              // Tab isoleret til denne konto?
  ægtefælleOverførsel: boolean;
}

export const KONTO_SKATTEREGLER: Record<KontoType, KontoSkatteRegel> = {
  FRIT_DEPOT: {
    beskatningsmetode: 'MIXED',   // Aktier=realisation, ETF=lager
    skattesats: 'AKTIEINDKOMST',
    isoleret: false,              // Samles på CPR-niveau
    ægtefælleOverførsel: true
  },
  ASK: {
    beskatningsmetode: 'LAGER',
    skattesats: 'ASK_17',
    isoleret: true,               // Tab kun på denne konto!
    ægtefælleOverførsel: false
  },
  RATEPENSION: {
    beskatningsmetode: 'LAGER',
    skattesats: 'PAL_15_3',
    isoleret: true,               // Tab kun på denne konto!
    ægtefælleOverførsel: false
  },
  ALDERSOPSPARING: {
    beskatningsmetode: 'LAGER',
    skattesats: 'PAL_15_3',
    isoleret: true,
    ægtefælleOverførsel: false
  },
  KAPITALPENSION: {
    beskatningsmetode: 'LAGER',
    skattesats: 'PAL_15_3',
    isoleret: true,
    ægtefælleOverførsel: false
  },
  LIVRENTE: {
    beskatningsmetode: 'LAGER',
    skattesats: 'PAL_15_3',
    isoleret: true,
    ægtefælleOverførsel: false
  },
  BØRNEOPSPARING: {
    beskatningsmetode: 'LAGER',
    skattesats: 'SKATTEFRI',
    isoleret: true,               // Ikke relevant (skattefri)
    ægtefælleOverførsel: false
  }
};

// ============================================================
// AKTIVTYPE-REGLER
// ============================================================

interface AktivSkatteRegel {
  indkomsttype: 'AKTIEINDKOMST' | 'KAPITALINDKOMST';
  beskatningsmetode: 'REALISATION' | 'LAGER';
  tabspulje: TabsPulje;
}

export const AKTIV_SKATTEREGLER: Record<AktivType, AktivSkatteRegel> = {
  AKTIE_NOTERET: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'NOTERET_AKTIE'
  },
  AKTIE_UNOTERET: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'UNOTERET_AKTIE'
  },
  ETF_POSITIVLISTE: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'NOTERET_AKTIE'
  },
  ETF_IKKE_POSITIVLISTE: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'KAPITAL_GENEREL'
  },
  INVESTERINGSFORENING_UDBYTTE: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'NOTERET_AKTIE'
  },
  INVESTERINGSFORENING_AKKUM: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'NOTERET_AKTIE'
  },
  OBLIGATION: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'KAPITAL_GENEREL'
  },
  OPTION: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'FINANSIEL_KONTRAKT'   // Isoleret!
  },
  WARRANT: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'FINANSIEL_KONTRAKT'
  },
  CFD: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'FINANSIEL_KONTRAKT'
  },
  FUTURE: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'FINANSIEL_KONTRAKT'
  },
  KRYPTO: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'KAPITAL_GENEREL'
  }
};

// ============================================================
// MODREGNINGSREGLER
// ============================================================

interface ModregningRegel {
  kanModregnesI: string[];
  ægtefælleOverførsel: boolean;
  fremførsel: 'UBEGRÆNSET' | 'TABES_VED_LUKNING';
  note?: string;
}

export const MODREGNING_REGLER: Record<TabsPulje, ModregningRegel> = {
  NOTERET_AKTIE: {
    kanModregnesI: ['Gevinst på noterede aktier', 'Udbytter (aktieindkomst)'],
    ægtefælleOverførsel: true,
    fremførsel: 'UBEGRÆNSET'
  },
  UNOTERET_AKTIE: {
    kanModregnesI: ['AL aktieindkomst (inkl. noterede)'],
    ægtefælleOverførsel: true,
    fremførsel: 'UBEGRÆNSET',
    note: 'Bredere anvendelse end noterede'
  },
  KAPITAL_GENEREL: {
    kanModregnesI: ['Kapitalindkomst (obligationer, ETF ikke-positivliste, krypto)'],
    ægtefælleOverførsel: true,
    fremførsel: 'UBEGRÆNSET',
    note: 'Kan IKKE bruges mod finansielle kontrakter'
  },
  FINANSIEL_KONTRAKT: {
    kanModregnesI: ['KUN andre finansielle kontrakter (optioner, warrants, CFD, futures)'],
    ægtefælleOverførsel: true,
    fremførsel: 'UBEGRÆNSET',
    note: '⚠️ Stærkt begrænset - kan ikke bruges mod andet!'
  },
  ASK_ISOLERET: {
    kanModregnesI: ['Kun gevinster på SAMME ASK-konto'],
    ægtefælleOverførsel: false,
    fremførsel: 'TABES_VED_LUKNING',
    note: '⚠️ Tab tabes hvis kontoen lukkes!'
  },
  PENSION_ISOLERET: {
    kanModregnesI: ['Kun gevinster på SAMME pensionskonto'],
    ægtefælleOverførsel: false,
    fremførsel: 'UBEGRÆNSET',
    note: '⚠️ Kan ikke bruges på andre pensioner!'
  }
};

// ============================================================
// KILDESKAT-SATSER (UDBYTTE)
// ============================================================

interface KildeskatLand {
  navn: string;
  standardSats: number;
  overenskomstSats: number;
  dkCreditMax: number;
  formular?: string;
  note?: string;
}

export const KILDESKAT_LANDE: Record<string, KildeskatLand> = {
  DK: {
    navn: 'Danmark',
    standardSats: 0.27,
    overenskomstSats: 0.27,
    dkCreditMax: 0.27,
    note: 'Trækkes automatisk, ingen handling nødvendig'
  },
  US: {
    navn: 'USA',
    standardSats: 0.30,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'W-8BEN',
    note: 'Kræver W-8BEN for 15% sats'
  },
  GB: {
    navn: 'Storbritannien',
    standardSats: 0,
    overenskomstSats: 0,
    dkCreditMax: 0,
    note: 'Ingen kildeskat - hele beløbet beskattes i DK'
  },
  DE: {
    navn: 'Tyskland',
    standardSats: 0.26375,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'Antrag auf Erstattung',
    note: '11,375% kan tilbagesøges'
  },
  CH: {
    navn: 'Schweiz',
    standardSats: 0.35,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'Form 85',
    note: '20% kan tilbagesøges'
  },
  FR: {
    navn: 'Frankrig',
    standardSats: 0.30,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: '5000-SD'
  },
  SE: {
    navn: 'Sverige',
    standardSats: 0.30,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'SKV 3740'
  },
  NO: {
    navn: 'Norge',
    standardSats: 0.25,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'RF-1037'
  },
  FI: {
    navn: 'Finland',
    standardSats: 0.35,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    formular: 'VERO online',
    note: '20% kan tilbagesøges'
  },
  NL: {
    navn: 'Holland',
    standardSats: 0.15,
    overenskomstSats: 0.15,
    dkCreditMax: 0.15,
    note: 'Ingen tilbagesøgning nødvendig'
  }
};
