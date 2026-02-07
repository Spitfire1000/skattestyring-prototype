/**
 * LOVKILDER - Centrale kilder til skattelovgivning
 *
 * Alle URLs er verificeret og opdateret d. 2. februar 2026.
 * Brug helper-funktioner til at bygge URLs.
 *
 * GÆLDENDE LOVBEKENDTGØRELSER:
 * - PSL: LBK nr 1284 af 14/06/2021
 * - ABL: LBK nr 1098 af 27/08/2025
 * - KGL: LBK nr 1390 af 29/09/2022
 * - ASKL: LBK nr 281 af 13/03/2025
 * - PAL: LBK nr 12 af 06/01/2023
 * - PBL: LBK nr 1243 af 26/11/2024
 * - LL: LBK nr 1500 af 24/11/2025
 */

// ============================================================
// TYPER
// ============================================================

export interface LovKilde {
  navn: string;
  forkortelse: string;
  baseUrl: string;
  paragraffer: Record<string, ParagrafInfo>;
}

export interface ParagrafInfo {
  nummer: string;
  titel: string;
  beskrivelse: string;
  anchor: string;
  stk?: Record<number, string>;
}

export interface SkatDkKilde {
  titel: string;
  url: string;
  beskrivelse: string;
}

export interface JuridiskVejledning {
  emne: string;
  url: string;
  oid: string;
}

// ============================================================
// LOVBEKENDTGØRELSER (retsinformation.dk)
// ============================================================

export const LOVE: Record<string, LovKilde> = {
  PSL: {
    navn: 'Personskatteloven',
    forkortelse: 'PSL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2021/1284',
    paragraffer: {
      '§4': {
        nummer: '§ 4',
        titel: 'Kapitalindkomst',
        beskrivelse: 'Definition af kapitalindkomst',
        anchor: 'P4',
      },
      '§4a': {
        nummer: '§ 4a',
        titel: 'Aktieindkomst',
        beskrivelse: 'Definition af aktieindkomst - udbytter og gevinst/tab ved afståelse',
        anchor: 'P4a',
      },
      '§8a': {
        nummer: '§ 8a',
        titel: 'Skat af aktieindkomst',
        beskrivelse: '27% op til progressionsgrænsen, 42% over',
        anchor: 'P8a',
        stk: {
          1: 'Grundsats 27% op til grundbeløb',
          2: 'Topsats 42% af beløb over grundbeløbet',
          4: 'Ægtefællers samlede aktieindkomst beregnes samlet',
        },
      },
      '§11': {
        nummer: '§ 11',
        titel: 'Negativ kapitalindkomst',
        beskrivelse: 'Nedslag i skatten ved negativ kapitalindkomst',
        anchor: 'P11',
      },
    },
  },

  ABL: {
    navn: 'Aktieavancebeskatningsloven',
    forkortelse: 'ABL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2025/1098',
    paragraffer: {
      '§12': {
        nummer: '§ 12',
        titel: 'Gevinst og tab på aktier',
        beskrivelse: 'Gevinst og tab ved afståelse af aktier medregnes i indkomsten',
        anchor: 'P12',
      },
      '§13': {
        nummer: '§ 13',
        titel: 'Tab på unoterede aktier',
        beskrivelse: 'Tab kan modregnes i AL aktieindkomst (fuldt fradrag)',
        anchor: 'P13',
      },
      '§13A': {
        nummer: '§ 13 A',
        titel: 'Tab på noterede aktier',
        beskrivelse: 'Kildeartsbegrænset - kun mod noterede gevinster og udbytter',
        anchor: 'P13a',
      },
      '§14': {
        nummer: '§ 14',
        titel: 'Oplysningspligt for tabsfradrag',
        beskrivelse: 'Betingelser for at få fradrag for tab',
        anchor: 'P14',
      },
      '§19': {
        nummer: '§ 19',
        titel: 'Investeringsselskaber',
        beskrivelse: 'Definition og lagerbeskatning af investeringsselskaber',
        anchor: 'P19',
      },
      '§19B': {
        nummer: '§ 19 B',
        titel: 'Aktiebaserede investeringsselskaber (ABIS)',
        beskrivelse: 'ETF\'er på positivlisten - beskattes som aktieindkomst',
        anchor: 'P19b',
      },
      '§19C': {
        nummer: '§ 19 C',
        titel: 'Obligationsbaserede investeringsselskaber',
        beskrivelse: 'ETF\'er IKKE på positivlisten - kapitalindkomst',
        anchor: 'P19c',
      },
      '§23': {
        nummer: '§ 23',
        titel: 'Lagerprincippet',
        beskrivelse: 'Urealiseret gevinst/tab medregnes løbende i indkomsten',
        anchor: 'P23',
      },
      '§26': {
        nummer: '§ 26',
        titel: 'Gennemsnitsmetoden',
        beskrivelse: 'Anskaffelsessum beregnes som gennemsnit af alle køb',
        anchor: 'P26',
      },
    },
  },

  KGL: {
    navn: 'Kursgevinstloven',
    forkortelse: 'KGL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2022/1390',
    paragraffer: {
      '§29': {
        nummer: '§ 29',
        titel: 'Finansielle kontrakter',
        beskrivelse: 'Beskatning af optioner, futures, CFD\'er, warrants mv.',
        anchor: 'P29',
      },
      '§32': {
        nummer: '§ 32',
        titel: 'Tab på finansielle kontrakter',
        beskrivelse: 'Tab kan KUN modregnes i gevinst på andre finansielle kontrakter',
        anchor: 'P32',
      },
      '§33': {
        nummer: '§ 33',
        titel: 'Finansielle kontrakter (fortsat)',
        beskrivelse: 'Yderligere regler for finansielle kontrakter',
        anchor: 'P33',
      },
    },
  },

  ASKL: {
    navn: 'Aktiesparekontoloven',
    forkortelse: 'ASKL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2025/281',
    paragraffer: {
      '§5': {
        nummer: '§ 5',
        titel: 'Investeringsbegrænsninger',
        beskrivelse: 'Hvad må man investere i på en aktiesparekonto',
        anchor: 'P5',
      },
      '§9': {
        nummer: '§ 9',
        titel: 'Indskudsloft',
        beskrivelse: 'Maksimalt indskud på aktiesparekonto (reguleres årligt)',
        anchor: 'P9',
      },
      '§13': {
        nummer: '§ 13',
        titel: 'Beskatningsgrundlag',
        beskrivelse: 'Det skattepligtige afkast opgøres efter lagerprincippet',
        anchor: 'P13',
      },
      '§14': {
        nummer: '§ 14',
        titel: 'Skattesats',
        beskrivelse: '17% skat af det skattepligtige afkast',
        anchor: 'P14',
      },
    },
  },

  PAL: {
    navn: 'Pensionsafkastbeskatningsloven',
    forkortelse: 'PAL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2023/12',
    paragraffer: {
      '§2': {
        nummer: '§ 2',
        titel: 'PAL-skat',
        beskrivelse: '15,3% skat af pensionsafkast (lagerbeskatning)',
        anchor: 'P2',
      },
    },
  },

  PBL: {
    navn: 'Pensionsbeskatningsloven',
    forkortelse: 'PBL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2024/1243',
    paragraffer: {
      '§51': {
        nummer: '§ 51',
        titel: 'Børneopsparing',
        beskrivelse: 'Renter, udbytter og avancer er skattefri',
        anchor: 'P51',
      },
    },
  },

  LL: {
    navn: 'Ligningsloven',
    forkortelse: 'LL',
    baseUrl: 'https://www.retsinformation.dk/eli/lta/2025/1500',
    paragraffer: {
      '§33': {
        nummer: '§ 33',
        titel: 'Creditlempelse',
        beskrivelse: 'Lempelse for betalt udenlandsk skat',
        anchor: 'P33',
      },
    },
  },
};

// ============================================================
// SKAT.DK KILDER
// ============================================================

export const SKAT_DK: Record<string, SkatDkKilde> = {
  aktier: {
    titel: 'Skat af aktier',
    url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier',
    beskrivelse: 'Hovedside om aktiebeskatning',
  },
  ask: {
    titel: 'Aktiesparekonto',
    url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto',
    beskrivelse: 'Regler for aktiesparekonto (ASK)',
  },
  tabsfradrag: {
    titel: 'Betingelser for tabsfradrag',
    url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier/betingelser-for-fradrag-for-tab-paa-aktier-og-investeringsbeviser',
    beskrivelse: 'Krav for at få fradrag for tab på aktier',
  },
  positivliste: {
    titel: 'Positivlisten (ABIS)',
    url: 'https://skat.dk/erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa',
    beskrivelse: 'Info om aktiebaserede investeringsselskaber',
  },
  positivlisteExcel: {
    titel: 'Positivliste Excel-fil',
    url: 'https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx',
    beskrivelse: 'Download liste over godkendte ETF\'er',
  },
  palSkat: {
    titel: 'PAL-skat (pension)',
    url: 'https://skat.dk/borger/pension-og-efterloen/skat-af-pensionsafkast',
    beskrivelse: '15,3% skat af pensionsafkast',
  },
  boerneopsparing: {
    titel: 'Børneopsparing',
    url: 'https://info.skat.dk/data.aspx?oid=2048447',
    beskrivelse: 'Skattefri opsparing til børn (max 6.000 kr/år)',
  },
  kapitalindkomst: {
    titel: 'Kapitalindkomst',
    url: 'https://info.skat.dk/data.aspx?oid=2061679',
    beskrivelse: 'Definition og beskatning af kapitalindkomst',
  },
  udenlandskeInvesteringer: {
    titel: 'Udenlandske investeringer',
    url: 'https://skat.dk/borger/udlandsforhold/du-bor-i-danmark-og-har-indkomst-fra-udlandet/giv-os-besked-om-dine-udenlandske-investeringer-senest-1-juli',
    beskrivelse: 'Oplysningspligt for udenlandske investeringer',
  },
  udbytte: {
    titel: 'Udbytte fra aktier',
    url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/udbytte-fra-aktier',
    beskrivelse: 'Beskatning af udbytter og kildeskat',
  },
  etf: {
    titel: 'ETF\'er og investeringsforeninger',
    url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/etfer-og-investeringsforeninger',
    beskrivelse: 'Beskatning af ETF\'er',
  },
};

// ============================================================
// JURIDISK VEJLEDNING (info.skat.dk)
// ============================================================

export const JURIDISK_VEJLEDNING: Record<string, JuridiskVejledning> = {
  aegtefaelleberegning: {
    emne: 'Ægtefælleberegning',
    url: 'https://info.skat.dk/data.aspx?oid=1976883',
    oid: '1976883',
  },
  tabNoteredeAktier: {
    emne: 'Tab på noterede aktier',
    url: 'https://info.skat.dk/data.aspx?oid=1946315',
    oid: '1946315',
  },
  aktiebaseretInvesteringsselskab: {
    emne: 'Aktiebaserede investeringsselskaber (ABIS)',
    url: 'https://info.skat.dk/data.aspx?oid=2292808',
    oid: '2292808',
  },
  obligationsbaseretInvesteringsselskab: {
    emne: 'Obligationsbaserede investeringsselskaber',
    url: 'https://info.skat.dk/data.aspx?oid=2292809',
    oid: '2292809',
  },
  negativKapitalindkomst: {
    emne: 'Negativ kapitalindkomst',
    url: 'https://info.skat.dk/data.aspx?oid=2047228',
    oid: '2047228',
  },
};

// ============================================================
// HELPER FUNKTIONER
// ============================================================

/**
 * Hent fuld URL til en specifik paragraf
 */
export function getParagrafUrl(lov: string, paragraf: string): string {
  const lovInfo = LOVE[lov];
  if (!lovInfo) return '';

  const paragrafInfo = lovInfo.paragraffer[paragraf];
  if (!paragrafInfo) return lovInfo.baseUrl;

  return `${lovInfo.baseUrl}#${paragrafInfo.anchor}`;
}

/**
 * Hent basis-URL for en lov
 */
export function getLovUrl(lov: string): string {
  return LOVE[lov]?.baseUrl ?? '';
}

/**
 * Hent paragraf-info
 */
export function getParagrafInfo(lov: string, paragraf: string): ParagrafInfo | null {
  return LOVE[lov]?.paragraffer[paragraf] ?? null;
}

/**
 * Hent lov-info
 */
export function getLovInfo(lov: string): LovKilde | null {
  return LOVE[lov] ?? null;
}

/**
 * Formater lovhenvisning som tekst
 */
export function formatLovhenvisning(lov: string, paragraf: string): string {
  const lovInfo = LOVE[lov];
  if (!lovInfo) return '';

  const paragrafInfo = lovInfo.paragraffer[paragraf];
  if (!paragrafInfo) return lovInfo.forkortelse;

  return `${lovInfo.forkortelse} ${paragrafInfo.nummer}`;
}

/**
 * Hent SKAT.dk kilde
 */
export function getSkatDkKilde(key: string): SkatDkKilde | null {
  return SKAT_DK[key] ?? null;
}

/**
 * Hent juridisk vejledning
 */
export function getJuridiskVejledning(key: string): JuridiskVejledning | null {
  return JURIDISK_VEJLEDNING[key] ?? null;
}
