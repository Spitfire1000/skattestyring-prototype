/**
 * LOVHENVISNINGER OG KILDER
 *
 * Samlet reference til alle relevante love og skat.dk sider
 * til brug i audit-trail og forklaringer.
 */

// ============================================================
// LOVE OG BEKENDTGØRELSER
// ============================================================

export const LOVE = {
  // Aktieavancebeskatningsloven (ABL)
  ABL: {
    navn: 'Aktieavancebeskatningsloven',
    forkortelse: 'ABL',
    url: 'https://www.retsinformation.dk/eli/lta/2023/172',
    paragraffer: {
      '§12': {
        tekst: 'Gevinst og tab på aktier optaget til handel',
        beskrivelse: 'Noterede aktier beskattes som aktieindkomst',
      },
      '§13': {
        tekst: 'Tab på unoterede aktier',
        beskrivelse: 'Tab kan modregnes i al aktieindkomst',
      },
      '§13A': {
        tekst: 'Tab på aktier optaget til handel (noterede)',
        beskrivelse: 'Tab kan kun modregnes i gevinst på noterede aktier og udbytter',
      },
      '§19': {
        tekst: 'Investeringsselskaber (ETF\'er)',
        beskrivelse: 'Lagerbeskatning af ETF\'er',
      },
      '§26': {
        tekst: 'Gennemsnitsmetoden',
        beskrivelse: 'Anskaffelsessum beregnes som gennemsnit af alle køb',
      },
    },
  },

  // Personskatteloven (PSL)
  PSL: {
    navn: 'Personskatteloven',
    forkortelse: 'PSL',
    url: 'https://www.retsinformation.dk/eli/lta/2023/1284',
    paragraffer: {
      '§4a': {
        tekst: 'Aktieindkomst',
        beskrivelse: 'Definition af aktieindkomst',
      },
      '§8a': {
        tekst: 'Skat af aktieindkomst',
        beskrivelse: '27% op til progressionsgrænsen, 42% over',
        stk: {
          1: 'Grundsats 27%',
          2: 'Topsats 42% af beløb over progressionsgrænsen',
          4: 'Ægtefællers fælles progressionsgrænse',
        },
      },
    },
  },

  // Kursgevinstloven (KGL)
  KGL: {
    navn: 'Kursgevinstloven',
    forkortelse: 'KGL',
    url: 'https://www.retsinformation.dk/eli/lta/2023/1390',
    paragraffer: {
      '§29': {
        tekst: 'Finansielle kontrakter',
        beskrivelse: 'Beskatning af optioner, futures, CFD\'er mv.',
      },
      '§32': {
        tekst: 'Tab på finansielle kontrakter',
        beskrivelse: 'Tab kan KUN modregnes i gevinst på andre finansielle kontrakter',
      },
    },
  },

  // Pensionsafkastbeskatningsloven (PAL)
  PAL: {
    navn: 'Pensionsafkastbeskatningsloven',
    forkortelse: 'PAL',
    url: 'https://www.retsinformation.dk/eli/lta/2023/185',
    paragraffer: {
      '§2': {
        tekst: 'Skattepligtig del af afkastet',
        beskrivelse: 'Pensionsafkast beskattes med 15,3%',
      },
    },
  },

  // Aktiesparekontoloven (ASKL)
  ASKL: {
    navn: 'Aktiesparekontoloven',
    forkortelse: 'ASKL',
    url: 'https://www.retsinformation.dk/eli/lta/2019/1113',
    paragraffer: {
      '§3': {
        tekst: 'Loft for indskud',
        beskrivelse: 'Maksimalt indskud på aktiesparekonto',
      },
      '§13': {
        tekst: 'Beskatning',
        beskrivelse: '17% lagerbeskatning af afkast på ASK',
      },
    },
  },
} as const;

// ============================================================
// SKAT.DK LINKS
// ============================================================

export const SKAT_DK = {
  aktier: {
    titel: 'Skat af aktier',
    url: 'https://skat.dk/borger/aktier/skat-af-aktier',
    beskrivelse: 'Generel vejledning om aktiebeskatning',
  },
  aktiesparekonto: {
    titel: 'Aktiesparekonto',
    url: 'https://skat.dk/borger/aktier/aktiesparekonto',
    beskrivelse: 'Regler for aktiesparekonto (ASK)',
  },
  tab: {
    titel: 'Tab på aktier',
    url: 'https://skat.dk/borger/aktier/tab-paa-aktier',
    beskrivelse: 'Regler for fradrag af tab',
  },
  etf: {
    titel: 'ETF\'er og investeringsforeninger',
    url: 'https://skat.dk/borger/aktier/etf-investeringsforeninger',
    beskrivelse: 'Beskatning af ETF\'er',
  },
  positivliste: {
    titel: 'Skats positivliste',
    url: 'https://skat.dk/borger/aktier/positivlisten',
    beskrivelse: 'Liste over aktiebaserede ETF\'er med aktieindkomstbeskatning',
  },
  udbytter: {
    titel: 'Udbytte fra aktier',
    url: 'https://skat.dk/borger/aktier/udbytte',
    beskrivelse: 'Beskatning af udbytter',
  },
  pension: {
    titel: 'Pensionsopsparing',
    url: 'https://skat.dk/borger/pension',
    beskrivelse: 'PAL-skat og pensionsbeskatning',
  },
} as const;

// ============================================================
// HJÆLPEFUNKTIONER
// ============================================================

import type { AktivType, TabsPulje, KontoType } from '../types/skat';

/**
 * Hent lovhenvisning for en aktivtype
 */
export function getLovhenvisningForAktiv(aktivType: AktivType): { paragraf: string; tekst: string; lov: string } {
  switch (aktivType) {
    case 'AKTIE_NOTERET':
      return { paragraf: 'ABL § 12', tekst: LOVE.ABL.paragraffer['§12'].beskrivelse, lov: LOVE.ABL.navn };
    case 'AKTIE_UNOTERET':
      return { paragraf: 'ABL § 12', tekst: 'Unoterede aktier beskattes som aktieindkomst', lov: LOVE.ABL.navn };
    case 'ETF_POSITIVLISTE':
      return { paragraf: 'ABL § 19', tekst: LOVE.ABL.paragraffer['§19'].beskrivelse, lov: LOVE.ABL.navn };
    case 'ETF_IKKE_POSITIVLISTE':
      return { paragraf: 'ABL § 19', tekst: 'ETF ikke på positivliste → Kapitalindkomst', lov: LOVE.ABL.navn };
    case 'INVESTERINGSFORENING_UDBYTTE':
      return { paragraf: 'ABL § 21', tekst: 'Udloddende investeringsforening → Realisationsbeskatning', lov: LOVE.ABL.navn };
    case 'INVESTERINGSFORENING_AKKUM':
      return { paragraf: 'ABL § 19', tekst: 'Akkumulerende investeringsforening → Lagerbeskatning', lov: LOVE.ABL.navn };
    default:
      return { paragraf: 'ABL', tekst: 'Se aktieavancebeskatningsloven', lov: LOVE.ABL.navn };
  }
}

/**
 * Hent lovhenvisning for tabspulje
 */
export function getLovhenvisningForTabspulje(pulje: TabsPulje): { paragraf: string; tekst: string } {
  switch (pulje) {
    case 'NOTERET_AKTIE':
      return { paragraf: 'ABL § 13A', tekst: LOVE.ABL.paragraffer['§13A'].beskrivelse };
    case 'UNOTERET_AKTIE':
      return { paragraf: 'ABL § 13', tekst: LOVE.ABL.paragraffer['§13'].beskrivelse };
    case 'KAPITAL_GENEREL':
      return { paragraf: 'SL § 6', tekst: 'Tab på kapitalindkomst kan modregnes i kapitalindkomst' };
    case 'FINANSIEL_KONTRAKT':
      return { paragraf: 'KGL § 32', tekst: LOVE.KGL.paragraffer['§32'].beskrivelse };
    case 'ASK_ISOLERET':
      return { paragraf: 'ASKL § 13', tekst: 'Tab på ASK er isoleret til kontoen' };
    case 'PENSION_ISOLERET':
      return { paragraf: 'PAL § 2', tekst: 'Tab på pension er isoleret til den specifikke konto' };
  }
}

/**
 * Hent lovhenvisning for kontotype
 */
export function getLovhenvisningForKonto(kontoType: KontoType): { paragraf: string; tekst: string; url: string } {
  switch (kontoType) {
    case 'ASK':
      return {
        paragraf: 'ASKL § 13',
        tekst: LOVE.ASKL.paragraffer['§13'].beskrivelse,
        url: SKAT_DK.aktiesparekonto.url,
      };
    case 'RATEPENSION':
    case 'ALDERSOPSPARING':
    case 'LIVRENTE':
    case 'KAPITALPENSION':
      return {
        paragraf: 'PAL § 2',
        tekst: LOVE.PAL.paragraffer['§2'].beskrivelse,
        url: SKAT_DK.pension.url,
      };
    case 'BØRNEOPSPARING':
      return {
        paragraf: 'PBL § 51',
        tekst: 'Børneopsparing er skattefri',
        url: SKAT_DK.pension.url,
      };
    case 'FRIT_DEPOT':
    default:
      return {
        paragraf: 'PSL § 8a',
        tekst: LOVE.PSL.paragraffer['§8a'].beskrivelse,
        url: SKAT_DK.aktier.url,
      };
  }
}

/**
 * Hent alle relevante kilder for en beregning
 */
export function getKilderForBeregning(
  aktivType: AktivType,
  kontoType: KontoType,
  harTab: boolean
): { titel: string; url: string }[] {
  const kilder: { titel: string; url: string }[] = [];

  // Altid inkluder hovedsiden
  kilder.push({ titel: SKAT_DK.aktier.titel, url: SKAT_DK.aktier.url });

  // Kontotype-specifik
  if (kontoType === 'ASK') {
    kilder.push({ titel: SKAT_DK.aktiesparekonto.titel, url: SKAT_DK.aktiesparekonto.url });
  }
  if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(kontoType)) {
    kilder.push({ titel: SKAT_DK.pension.titel, url: SKAT_DK.pension.url });
  }

  // Aktivtype-specifik
  if (aktivType.includes('ETF') || aktivType.includes('INVESTERINGSFORENING')) {
    kilder.push({ titel: SKAT_DK.etf.titel, url: SKAT_DK.etf.url });
  }

  // Tab-specifik
  if (harTab) {
    kilder.push({ titel: SKAT_DK.tab.titel, url: SKAT_DK.tab.url });
  }

  // Lovkilder
  kilder.push({ titel: LOVE.ABL.navn, url: LOVE.ABL.url });
  kilder.push({ titel: LOVE.PSL.navn, url: LOVE.PSL.url });

  return kilder;
}
