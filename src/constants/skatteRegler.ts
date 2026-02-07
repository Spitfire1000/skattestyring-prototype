/**
 * SKATTEREGLER
 *
 * Baseret på SKATTE_FLOW_RETTET.md
 * Med dynamiske progressionsgrænser baseret på skatteår
 */

import type { KontoType, AktivType, TabsPulje } from '../types/skat';

// ============================================================
// TYPES
// ============================================================

export type IndkomstType =
  | 'AKTIEINDKOMST'
  | 'KAPITALINDKOMST'
  | 'ASK_INDKOMST'
  | 'PAL_INDKOMST'
  | 'SKATTEFRI';

export type Skatteår = 2023 | 2024 | 2025 | 2026;

interface ÅrligeSatser {
  aktieindkomst: {
    lavSats: number;
    højSats: number;
    grænseEnlig: number;
    grænseGift: number;
  };
  kapitalindkomst: {
    gevinstSats: number;
    // Fradragsværdi for tab består af TO komponenter (PSL § 11 + kommuneskat)
    kommuneskatFradrag: number;          // ~25% kommuneskat (gælder ALT negativt)
    psl11Nedslag: number;                // 8% ekstra nedslag (kun op til grænsen)
    psl11Grænse: number;                 // Enlig: 50.000 kr
    psl11GrænseÆgtepar: number;          // Ægtepar: 100.000 kr
    tabFradragsværdiUnderGrænse: number; // ~33% (25% + 8%)
    tabFradragsværdiOverGrænse: number;  // ~25% (kun kommuneskat)
    harTabsbank: boolean;                // ⚠️ KRITISK: Ingen tabsbank!
  };
  ask: {
    sats: number;
    indskudsgrænse: number;
  };
  pension: {
    palSats: number;
  };
  børneopsparing: {
    sats: number;
  };
}

// ============================================================
// DYNAMISKE SATSER PER ÅR
// ============================================================

export const SKATTESATSER_PER_ÅR: Record<Skatteår, ÅrligeSatser> = {
  2023: {
    aktieindkomst: {
      lavSats: 0.27,
      højSats: 0.42,
      grænseEnlig: 58900,
      grænseGift: 117800,
    },
    kapitalindkomst: {
      gevinstSats: 0.37,
      kommuneskatFradrag: 0.25,
      psl11Nedslag: 0.08,
      psl11Grænse: 50000,
      psl11GrænseÆgtepar: 100000,
      tabFradragsværdiUnderGrænse: 0.33,
      tabFradragsværdiOverGrænse: 0.25,
      harTabsbank: false,
    },
    ask: {
      sats: 0.17,
      indskudsgrænse: 131400,
    },
    pension: {
      palSats: 0.153,
    },
    børneopsparing: {
      sats: 0,
    },
  },
  2024: {
    aktieindkomst: {
      lavSats: 0.27,
      højSats: 0.42,
      grænseEnlig: 61000,
      grænseGift: 122000,
    },
    kapitalindkomst: {
      gevinstSats: 0.37,
      kommuneskatFradrag: 0.25,
      psl11Nedslag: 0.08,
      psl11Grænse: 50000,
      psl11GrænseÆgtepar: 100000,
      tabFradragsværdiUnderGrænse: 0.33,
      tabFradragsværdiOverGrænse: 0.25,
      harTabsbank: false,
    },
    ask: {
      sats: 0.17,
      indskudsgrænse: 140900,
    },
    pension: {
      palSats: 0.153,
    },
    børneopsparing: {
      sats: 0,
    },
  },
  2025: {
    aktieindkomst: {
      lavSats: 0.27,
      højSats: 0.42,
      grænseEnlig: 67500,
      grænseGift: 135000,
    },
    kapitalindkomst: {
      gevinstSats: 0.37,
      // Fradragsværdi for tab består af TO komponenter (PSL § 11 + kommuneskat)
      kommuneskatFradrag: 0.25,        // ~25% kommuneskat (gælder ALT negativt)
      psl11Nedslag: 0.08,              // 8% ekstra nedslag (kun op til grænsen)
      psl11Grænse: 50000,              // Enlig: 50.000 kr
      psl11GrænseÆgtepar: 100000,      // Ægtepar: 100.000 kr
      tabFradragsværdiUnderGrænse: 0.33, // ~33% (25% + 8%)
      tabFradragsværdiOverGrænse: 0.25,  // ~25% (kun kommuneskat)
      harTabsbank: false,              // ⚠️ KRITISK: Ingen tabsbank for kapitalindkomst!
    },
    ask: {
      sats: 0.17,
      indskudsgrænse: 166200,  // Korrekt værdi fra SKM.dk
    },
    pension: {
      palSats: 0.153,
    },
    børneopsparing: {
      sats: 0,
    },
  },
  2026: {
    aktieindkomst: {
      lavSats: 0.27,
      højSats: 0.42,
      grænseEnlig: 79400,
      grænseGift: 158800,
    },
    kapitalindkomst: {
      gevinstSats: 0.37,
      // Fradragsværdi for tab består af TO komponenter (PSL § 11 + kommuneskat)
      kommuneskatFradrag: 0.25,        // ~25% kommuneskat (gælder ALT negativt)
      psl11Nedslag: 0.08,              // 8% ekstra nedslag (kun op til grænsen)
      psl11Grænse: 50000,              // Enlig: 50.000 kr
      psl11GrænseÆgtepar: 100000,      // Ægtepar: 100.000 kr
      tabFradragsværdiUnderGrænse: 0.33, // ~33% (25% + 8%)
      tabFradragsværdiOverGrænse: 0.25,  // ~25% (kun kommuneskat)
      harTabsbank: false,              // ⚠️ KRITISK: Ingen tabsbank for kapitalindkomst!
    },
    // PSL §11 grænse for negativ kapitalindkomst
    // Fast beløb – reguleres IKKE årligt (50.000 kr enlige / 100.000 kr ægtepar)
    ask: {
      sats: 0.17,
      indskudsgrænse: 174200,  // Korrekt værdi fra SKM.dk
    },
    pension: {
      palSats: 0.153,
    },
    børneopsparing: {
      sats: 0,
    },
  },
};

// ============================================================
// HELPER: Hent satser for et givet år
// ============================================================

export function getSatserForÅr(år: number): ÅrligeSatser {
  const skatteår = år as Skatteår;
  if (SKATTESATSER_PER_ÅR[skatteår]) {
    return SKATTESATSER_PER_ÅR[skatteår];
  }
  // Fallback til 2025 hvis året ikke findes
  return SKATTESATSER_PER_ÅR[2025];
}

// ============================================================
// LEGACY – behold kun til bagudkompatibilitet
// Brug i stedet getSatserForÅr(skatteår) overalt i nye komponenter
// ============================================================

export const SKATTESATSER = {
  // Aktieindkomst
  AKTIE_LAV: 0.27,
  AKTIE_HØJ: 0.42,

  // 2026-værdier (opdateret januar 2026)
  PROGRESSIONSGRÆNSE_ENLIG: 79400,
  PROGRESSIONSGRÆNSE_GIFT: 158800,

  // ASK
  ASK_SATS: 0.17,
  ASK_INDSKUDSGRÆNSE: 174200,   // 2026-værdi

  // PAL + øvrigt uændret
  PAL_SATS: 0.153,
  BØRNEOPSPARING_SATS: 0,

  // PSL §11 grænse for negativ kapitalindkomst
  // Fast beløb – reguleres IKKE årligt (50.000 kr enlige / 100.000 kr ægtepar)
  PSL11_GRÆNSE_ENLIG: 50000,
  PSL11_GRÆNSE_ÆGTEPAR: 100000,
} as const;

// ============================================================
// KLASSIFICERINGSFUNKTION
// ============================================================

/**
 * Klassificerer indkomsttype baseret på kontotype og aktivtype.
 *
 * VIGTIGT: Kontotypen bestemmer FØRST om klassificering er relevant.
 * Kun for FRIT_DEPOT afhænger klassificeringen af aktivtypen.
 */
export function klassificerIndkomst(
  kontoType: KontoType,
  aktivType: AktivType
): IndkomstType {
  // Børneopsparing er ALTID skattefri - uanset aktivtype
  if (kontoType === 'BOERNEOPSPARING') {
    return 'SKATTEFRI';
  }

  // ASK er ALTID 17% lager - uanset aktivtype
  if (kontoType === 'ASK') {
    return 'ASK_INDKOMST';
  }

  // Pension er ALTID 15,3% PAL - uanset aktivtype
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(kontoType)) {
    return 'PAL_INDKOMST';
  }

  // FRIT_DEPOT: Her afhænger klassificeringen af aktivtypen
  if (kontoType === 'FRIT_DEPOT') {
    // Kapitalindkomst-typer:
    // - ETF IKKE på positivliste
    // - ETF obligationsbaseret (ALTID kapitalindkomst)
    // - Akkumulerende fond IKKE på positivliste
    // - Blandet fond med >50% obligationer
    // - Direkte obligationer
    // - Finansielle kontrakter
    if (
      aktivType === 'ETF_IKKE_POSITIVLISTE' ||
      aktivType === 'ETF_OBLIGATIONSBASERET' ||
      aktivType === 'INVF_AKKUMULERENDE_KAPITAL' ||
      aktivType === 'BLANDET_FOND_OBLIGATION' ||
      aktivType === 'OBLIGATION' ||
      aktivType === 'FINANSIEL_KONTRAKT'
    ) {
      return 'KAPITALINDKOMST';
    }

    // Alt andet på frit depot → Aktieindkomst
    // (Aktier, ETF positivliste, udbyttebetalende fonde, akkumulerende på positivliste, blandet fond >50% aktier)
    return 'AKTIEINDKOMST';
  }

  throw new Error(`Ukendt kontotype: ${kontoType}`);
}

// ============================================================
// TABSPULJE-FUNKTION
// ============================================================

/**
 * Bestemmer hvilken tabspulje et tab havner i.
 *
 * VIGTIGT: For ASK og pension er tabspuljen ISOLERET til kontoen.
 * For frit depot afhænger puljen af aktivtypen.
 */
export function getTabspulje(
  kontoType: KontoType,
  aktivType: AktivType
): TabsPulje | null {
  // Børneopsparing har INGEN tabspulje (skattefri)
  if (kontoType === 'BOERNEOPSPARING') {
    return null;
  }

  // ASK har ISOLERET pulje - tab kan KUN bruges på samme ASK
  if (kontoType === 'ASK') {
    return 'ASK_ISOLERET';
  }

  // Pension har ISOLERET pulje - tab kan KUN bruges på samme pensionskonto
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(kontoType)) {
    return 'PENSION_ISOLERET';
  }

  // FRIT_DEPOT: Tabspulje afhænger af aktivtype
  if (kontoType === 'FRIT_DEPOT') {
    switch (aktivType) {
      case 'AKTIE_UNOTERET':
        // Unoterede aktier: Fuldt fradrag i AL aktieindkomst
        return 'UNOTERET_AKTIE';

      case 'ETF_IKKE_POSITIVLISTE':
      case 'ETF_OBLIGATIONSBASERET':
      case 'INVF_AKKUMULERENDE_KAPITAL':
      case 'BLANDET_FOND_OBLIGATION':
      case 'OBLIGATION':
        // ⚠️ Kapitalindkomst-typer: INGEN tabsbank! Tab modregnes straks i årets kapitalindkomst
        return null;

      case 'FINANSIEL_KONTRAKT':
        // Finansielle kontrakter: Kildeartsbegr. isoleret tabspool
        return 'FINANSIEL_KONTRAKT';

      case 'BLANDET_FOND_AKTIE':
        // Blandet fond >50% aktier: Noteret aktie pulje (aktieindkomst)
        return 'NOTERET_AKTIE';

      default:
        // Aktier, ETF positivliste, inv.foreninger: Noteret aktie pulje
        // OBS: Kildeartsbegrænset - kan kun bruges mod noterede gevinster/udbytter
        return 'NOTERET_AKTIE';
    }
  }

  throw new Error(`Ukendt kontotype: ${kontoType}`);
}

// ============================================================
// SKATTEBEREGNINGSFUNKTION
// ============================================================

interface SkatteBeregning {
  bruttoGevinst: number;
  skat: number;
  nettoGevinst: number;
  effektivSats: number;
  detaljer: {
    // Aktieindkomst progression
    lavSkatBeløb?: number;
    lavSkat?: number;
    højSkatBeløb?: number;
    højSkat?: number;
    // Kapitalindkomst PSL § 11
    psl11Grænse?: number;
    underGrænse?: number;
    fradragUnder?: number;
    overGrænse?: number;
    fradragOver?: number;
  };
}

/**
 * Beregner skat baseret på kontotype, indkomsttype og beløb.
 */
export function beregnSkat(
  _kontoType: KontoType,
  indkomstType: IndkomstType,
  gevinst: number,
  år: number,
  erGift: boolean,
  aktieindkomstFørDetteSalg: number = 0
): SkatteBeregning {
  const satser = getSatserForÅr(år);

  // Skattefri (børneopsparing)
  if (indkomstType === 'SKATTEFRI') {
    return {
      bruttoGevinst: gevinst,
      skat: 0,
      nettoGevinst: gevinst,
      effektivSats: 0,
      detaljer: {},
    };
  }

  // ASK: Flat 17%
  if (indkomstType === 'ASK_INDKOMST') {
    const skat = gevinst > 0 ? gevinst * satser.ask.sats : 0;
    return {
      bruttoGevinst: gevinst,
      skat,
      nettoGevinst: gevinst - skat,
      effektivSats: satser.ask.sats,
      detaljer: {},
    };
  }

  // Pension: Flat 15,3% PAL
  if (indkomstType === 'PAL_INDKOMST') {
    const skat = gevinst > 0 ? gevinst * satser.pension.palSats : 0;
    return {
      bruttoGevinst: gevinst,
      skat,
      nettoGevinst: gevinst - skat,
      effektivSats: satser.pension.palSats,
      detaljer: {},
    };
  }

  // Aktieindkomst: Progressiv 27%/42%
  if (indkomstType === 'AKTIEINDKOMST') {
    if (gevinst <= 0) {
      return {
        bruttoGevinst: gevinst,
        skat: 0,
        nettoGevinst: gevinst,
        effektivSats: 0,
        detaljer: {},
      };
    }

    const grænse = erGift ? satser.aktieindkomst.grænseGift : satser.aktieindkomst.grænseEnlig;

    // Beregn hvor meget af grænsen der er brugt
    const grænseResterende = Math.max(0, grænse - aktieindkomstFørDetteSalg);

    // Beløb under og over grænsen
    const lavSkatBeløb = Math.min(gevinst, grænseResterende);
    const højSkatBeløb = Math.max(0, gevinst - lavSkatBeløb);

    // Beregn skat
    const lavSkat = lavSkatBeløb * satser.aktieindkomst.lavSats;
    const højSkat = højSkatBeløb * satser.aktieindkomst.højSats;
    const skat = lavSkat + højSkat;

    return {
      bruttoGevinst: gevinst,
      skat,
      nettoGevinst: gevinst - skat,
      effektivSats: gevinst > 0 ? skat / gevinst : 0,
      detaljer: {
        lavSkatBeløb,
        lavSkat,
        højSkatBeløb,
        højSkat,
      },
    };
  }

  // Kapitalindkomst: ~37% gevinst, ~33% fradrag (asymmetrisk!)
  if (indkomstType === 'KAPITALINDKOMST') {
    if (gevinst > 0) {
      const skat = gevinst * satser.kapitalindkomst.gevinstSats;
      return {
        bruttoGevinst: gevinst,
        skat,
        nettoGevinst: gevinst - skat,
        effektivSats: satser.kapitalindkomst.gevinstSats,
        detaljer: {},
      };
    } else {
      // Tab: Fradragsværdi afhænger af PSL § 11 grænse
      const absTab = Math.abs(gevinst);
      const psl11Grænse = erGift
        ? satser.kapitalindkomst.psl11GrænseÆgtepar
        : satser.kapitalindkomst.psl11Grænse;

      // Beløb under og over PSL § 11 grænsen
      const underGrænse = Math.min(absTab, psl11Grænse);
      const overGrænse = Math.max(0, absTab - psl11Grænse);

      // Fradrag: ~33% under grænsen (25% kommuneskat + 8% PSL § 11), ~25% over grænsen
      const fradragUnder = underGrænse * satser.kapitalindkomst.tabFradragsværdiUnderGrænse;
      const fradragOver = overGrænse * satser.kapitalindkomst.tabFradragsværdiOverGrænse;
      const totalFradrag = fradragUnder + fradragOver;
      const effektivSats = absTab > 0 ? totalFradrag / absTab : 0;

      return {
        bruttoGevinst: gevinst,
        skat: -totalFradrag, // Negativt = fradrag
        nettoGevinst: gevinst + totalFradrag,
        effektivSats,
        detaljer: {
          psl11Grænse,
          underGrænse,
          fradragUnder,
          overGrænse,
          fradragOver,
        },
      };
    }
  }

  throw new Error(`Ukendt indkomsttype: ${indkomstType}`);
}

// ============================================================
// KAPITALINDKOMST HELPERS
// ============================================================

/**
 * Beregn PSL § 11 fradrag for negativ kapitalindkomst.
 *
 * VIGTIG: Kapitalindkomst har INGEN tabsbank!
 * - Tab skal bruges i SAMME skatteår som de opstår
 * - Ingen fremførsel til næste år
 * - Asymmetrisk: Gevinst ~37%, tab kun ~33%/~25%
 *
 * @param tab - Tabsbeløb (positivt tal)
 * @param skatteår - Skatteår for beregning
 * @param erGift - Om skatteyderen er gift
 * @returns Detaljeret fradragsberegning
 */
export interface KapitalindkomstFradragResultat {
  bruttoTab: number;
  underGrænse: number;
  overGrænse: number;
  fradragUnder: number;
  fradragOver: number;
  totalFradrag: number;
  effektivSats: number;
  psl11Grænse: number;
}

export function beregnKapitalindkomstFradrag(
  tab: number,
  skatteår: number,
  erGift: boolean
): KapitalindkomstFradragResultat {
  const satser = getSatserForÅr(skatteår);
  const psl11Grænse = erGift
    ? satser.kapitalindkomst.psl11GrænseÆgtepar
    : satser.kapitalindkomst.psl11Grænse;

  const absTab = Math.abs(tab);

  // Beløb under og over PSL § 11 grænsen
  const underGrænse = Math.min(absTab, psl11Grænse);
  const overGrænse = Math.max(0, absTab - psl11Grænse);

  // Fradrag: ~33% under grænsen, ~25% over grænsen
  const fradragUnder = underGrænse * satser.kapitalindkomst.tabFradragsværdiUnderGrænse;
  const fradragOver = overGrænse * satser.kapitalindkomst.tabFradragsværdiOverGrænse;
  const totalFradrag = fradragUnder + fradragOver;
  const effektivSats = absTab > 0 ? totalFradrag / absTab : 0;

  return {
    bruttoTab: absTab,
    underGrænse,
    overGrænse,
    fradragUnder,
    fradragOver,
    totalFradrag,
    effektivSats,
    psl11Grænse,
  };
}

/**
 * Check om en aktivtype giver kapitalindkomst (og dermed INGEN tabsbank)
 */
export function erKapitalindkomstAktiv(aktivType: AktivType): boolean {
  return [
    'ETF_IKKE_POSITIVLISTE',
    'ETF_OBLIGATIONSBASERET',
    'INVF_AKKUMULERENDE_KAPITAL',
    'BLANDET_FOND_OBLIGATION',
    'OBLIGATION',
  ].includes(aktivType);
}

/**
 * Aktivtyper der er kapitalindkomst (INGEN tabsbank)
 */
export const KAPITALINDKOMST_AKTIVTYPER: AktivType[] = [
  'ETF_IKKE_POSITIVLISTE',
  'ETF_OBLIGATIONSBASERET',
  'INVF_AKKUMULERENDE_KAPITAL',
  'BLANDET_FOND_OBLIGATION',
  'OBLIGATION',
];

// ============================================================
// KONTOTYPE-REGLER
// ============================================================

interface KontoSkatteRegel {
  beskatningsmetode: 'REALISATION' | 'LAGER' | 'MIXED';
  skattesats: 'AKTIEINDKOMST' | 'ASK_17' | 'PAL_15_3' | 'SKATTEFRI';
  isoleret: boolean;
  ægtefælleOverførsel: boolean;
}

export const KONTO_SKATTEREGLER: Record<KontoType, KontoSkatteRegel> = {
  FRIT_DEPOT: {
    beskatningsmetode: 'MIXED',
    skattesats: 'AKTIEINDKOMST',
    isoleret: false,
    ægtefælleOverførsel: true
  },
  ASK: {
    beskatningsmetode: 'LAGER',
    skattesats: 'ASK_17',
    isoleret: true,
    ægtefælleOverførsel: false
  },
  RATEPENSION: {
    beskatningsmetode: 'LAGER',
    skattesats: 'PAL_15_3',
    isoleret: true,
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
  BOERNEOPSPARING: {
    beskatningsmetode: 'LAGER',
    skattesats: 'SKATTEFRI',
    isoleret: true,
    ægtefælleOverførsel: false
  }
};

// ============================================================
// AKTIVTYPE-REGLER
// ============================================================

interface AktivSkatteRegel {
  indkomsttype: 'AKTIEINDKOMST' | 'KAPITALINDKOMST';
  beskatningsmetode: 'REALISATION' | 'LAGER';
  tabspulje: TabsPulje | null;  // null = ingen tabsbank (fx kapitalindkomst)
}

export const AKTIV_SKATTEREGLER: Record<AktivType, AktivSkatteRegel> = {
  AKTIE_DK: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'NOTERET_AKTIE'
  },
  AKTIE_UDENLANDSK: {
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
    tabspulje: null  // ⚠️ INGEN tabsbank! Tab modregnes straks i årets kapitalindkomst
  },
  ETF_OBLIGATIONSBASERET: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: null  // ⚠️ ALTID kapitalindkomst - INGEN tabsbank!
  },
  INVF_UDBYTTEBETALTENDE: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: 'NOTERET_AKTIE'
  },
  INVF_AKKUMULERENDE: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'NOTERET_AKTIE'
  },
  INVF_AKKUMULERENDE_KAPITAL: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: null  // ⚠️ IKKE på positivliste - kapitalindkomst, INGEN tabsbank!
  },
  BLANDET_FOND_AKTIE: {
    indkomsttype: 'AKTIEINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'NOTERET_AKTIE'  // >50% aktier = aktieindkomst
  },
  BLANDET_FOND_OBLIGATION: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: null  // >50% obligationer = kapitalindkomst, INGEN tabsbank!
  },
  OBLIGATION: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'REALISATION',
    tabspulje: null  // ⚠️ Direkte obligationer - kapitalindkomst, INGEN tabsbank!
  },
  FINANSIEL_KONTRAKT: {
    indkomsttype: 'KAPITALINDKOMST',
    beskatningsmetode: 'LAGER',
    tabspulje: 'FINANSIEL_KONTRAKT'  // Kildeartsbegr. isoleret tabspool
  }
};

// ============================================================
// MODREGNINGSREGLER
// ============================================================

interface ModregningRegel {
  kanModregnesI: string[];
  ægtefælleOverførsel: boolean;
  obligatoriskÆgtefælle: boolean;
  fremførsel: 'UBEGRÆNSET' | 'TABES_VED_LUKNING' | 'INGEN';
  note?: string;
}

export const MODREGNING_REGLER: Record<TabsPulje, ModregningRegel> = {
  NOTERET_AKTIE: {
    kanModregnesI: ['KUN noterede aktier + positivliste-ETF/fonde', 'Udbytter (aktieindkomst)'],
    ægtefælleOverførsel: true,
    obligatoriskÆgtefælle: true,  // ABL § 13A, stk. 3: OBLIGATORISK overførsel!
    fremførsel: 'UBEGRÆNSET',
    note: 'Kildeartsbegr. ABL § 13A - Ægtefælleoverførsel er OBLIGATORISK hvis egen gevinst ikke kan dække tab. ⚠️ KRÆVER MANUEL HÅNDTERING i nuværende implementation.'
  },
  UNOTERET_AKTIE: {
    kanModregnesI: ['AL aktieindkomst (inkl. noterede aktier, udbytter, positivliste)'],
    ægtefælleOverførsel: true,
    obligatoriskÆgtefælle: false,  // Valgfri ægtefælle-overførsel
    fremførsel: 'UBEGRÆNSET',
    note: 'IKKE kildeartsbegr. ABL § 13 - Fuldt fradrag i AL aktieindkomst. Negativ aktieindkomst giver skatteværdi i slutskat.'
  },
  KAPITAL_GENEREL: {
    // ⚠️ BEMÆRK: Denne pulje bruges IKKE direkte af aktivtyper (tabspulje = null for kapitalindkomst)
    // Den eksisterer kun for at dokumentere reglerne. Tab håndteres via beregnSkat().
    kanModregnesI: ['Kapitalindkomst i SAMME år (ETF ikke-positivliste, obligationer, krypto)'],
    ægtefælleOverførsel: true,  // Ægtefæller kan dele kapitalindkomst
    obligatoriskÆgtefælle: false,
    fremførsel: 'INGEN',  // ⚠️ KRITISK: Kapitalindkomst har INGEN tabsbank!
    note: '⚠️ KRITISK: Kapitalindkomst har INGEN tabsbank! Tab modregnes STRAKS i årets kapitalindkomst. Negativt resultat giver PSL § 11 fradrag (~33% under 50.000 kr, ~25% over). INGEN fremførsel til næste år!'
  },
  FINANSIEL_KONTRAKT: {
    kanModregnesI: ['KUN andre finansielle kontrakter (optioner, warrants, CFD, futures)'],
    ægtefælleOverførsel: true,   // KGL § 32 stk. 2: Tab KAN overføres til ægtefælles nettogevinster på kontrakter
    obligatoriskÆgtefælle: false,
    fremførsel: 'UBEGRÆNSET',
    note: '⚠️ Kildeartsbegr. isoleret tabspool - Ægtefælle KAN overføre tab (KGL § 32 stk. 2). Kræver samliv ved årsslut.'
  },
  ASK_ISOLERET: {
    kanModregnesI: ['Kun gevinster på SAMME ASK-konto'],
    ægtefælleOverførsel: false,
    obligatoriskÆgtefælle: false,
    fremførsel: 'TABES_VED_LUKNING',
    note: '⚠️ KRITISK: Tab TABES permanent hvis kontoen lukkes!'
  },
  PENSION_ISOLERET: {
    kanModregnesI: ['Kun gevinster på SAMME pensionskonto'],
    ægtefælleOverførsel: false,
    obligatoriskÆgtefælle: false,
    fremførsel: 'UBEGRÆNSET',
    note: '⚠️ Kan IKKE bruges på andre pensionskonti - isoleret per konto'
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
