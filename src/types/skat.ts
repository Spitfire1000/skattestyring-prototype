// ============================================================
// KONTOTYPER
// ============================================================

export type KontoType =
  | 'FRIT_DEPOT'
  | 'ASK'
  | 'BOERNEOPSPARING'
  | 'RATEPENSION'
  | 'ALDERSOPSPARING'
  | 'KAPITALPENSION'
  | 'LIVRENTE';

// Alias for bagudkompatibilitet
export type KontoTypeLegacy = KontoType | 'BØRNEOPSPARING';

export interface Konto {
  id: string;
  profilId: string;               // Link til ProfileContext
  navn: string;                   // "Nordnet", "Saxo", etc.
  type: KontoType;
  mægler: string;
  oprettetDato: Date;
}

// ============================================================
// AKTIVTYPER
// ============================================================

export type AktivType =
  | 'AKTIE_DK'                    // Dansk noteret aktie
  | 'AKTIE_UDENLANDSK'            // Udenlandsk noteret aktie
  | 'AKTIE_UNOTERET'              // Unoteret aktie
  | 'ETF_POSITIVLISTE'            // ETF på SKATs positivliste (aktiebaseret)
  | 'ETF_IKKE_POSITIVLISTE'       // ETF IKKE på positivliste (aktiebaseret)
  | 'ETF_OBLIGATIONSBASERET'      // Obligationsbaseret ETF/fond - ALTID kapitalindkomst
  | 'INVF_UDBYTTEBETALTENDE'      // Dansk inv.forening, udbyttebetalende (aktiebaseret)
  | 'INVF_AKKUMULERENDE'          // Dansk inv.forening, akkumulerende (aktiebaseret på positivliste)
  | 'INVF_AKKUMULERENDE_KAPITAL'  // Dansk inv.forening, akkumulerende IKKE på positivliste
  | 'BLANDET_FOND_AKTIE'          // Blandet fond >50% aktier - aktieindkomst
  | 'BLANDET_FOND_OBLIGATION'     // Blandet fond >50% obligationer - kapitalindkomst
  | 'OBLIGATION'                  // Direkte obligationer og renter
  | 'FINANSIEL_KONTRAKT';         // Option, CFD, Future, Warrant

// Legacy types (for backwards compatibility with existing data)
export type AktivTypeLegacy =
  | AktivType
  | 'AKTIE_NOTERET'               // → maps to AKTIE_DK
  | 'INVESTERINGSFORENING_UDBYTTE'// → maps to INVF_UDBYTTEBETALTENDE
  | 'INVESTERINGSFORENING_AKKUM'  // → maps to INVF_AKKUMULERENDE
  | 'OPTION'                      // → maps to FINANSIEL_KONTRAKT
  | 'WARRANT'                     // → maps to FINANSIEL_KONTRAKT
  | 'CFD'                         // → maps to FINANSIEL_KONTRAKT
  | 'FUTURE'                      // → maps to FINANSIEL_KONTRAKT
  | 'KRYPTO';                     // → maps to ETF_IKKE_POSITIVLISTE (kapitalindkomst)
  // FJERNET: 'OBLIGATION' - nu en rigtig AktivType

// ============================================================
// INDKOMST- OG SKATTETYPER
// ============================================================

export type IndkomstType =
  | 'AKTIEINDKOMST'
  | 'KAPITALINDKOMST'
  | 'ASK_INDKOMST'
  | 'PAL_INDKOMST'
  | 'SKATTEFRI';

export type BeskatningsMetode = 'REALISATION' | 'LAGER';

export type TabsPulje =
  | 'NOTERET_AKTIE'
  | 'UNOTERET_AKTIE'
  | 'KAPITAL_GENEREL'
  | 'FINANSIEL_KONTRAKT'
  | 'ASK_ISOLERET'
  | 'PENSION_ISOLERET';

// ============================================================
// AKTIVER
// ============================================================

export interface Aktiv {
  id: string;
  kontoId: string;
  navn: string;
  type: AktivType;
  isin?: string;
  ticker?: string;

  // Beholdning
  antal: number;
  anskaffelsessum: number;        // Total, ikke per enhed
  anskaffelsesdato: Date;
  aktuelVærdi: number;

  // Beregnet
  urealiseret: number;            // aktuelVærdi - anskaffelsessum

  // Lagerbeskatning (hvis relevant)
  værdiPrimoÅr?: number;
  værdiUltimoÅr?: number;
}

// ============================================================
// HANDLER (KØB/SALG)
// ============================================================

export interface Handel {
  id: string;
  kontoId: string;
  aktivId?: string;
  aktivNavn: string;
  aktivType: AktivType;

  type: 'KØB' | 'SALG';
  dato: Date;
  antal: number;
  kurs: number;
  beløb: number;                  // Positiv ved salg, negativ ved køb
  kurtage: number;

  // Ved salg
  anskaffelsessum?: number;
  gevinstTab?: number;
  skatteår: number;
}

// ============================================================
// UDBYTTE
// ============================================================

export interface Udbytte {
  id: string;
  kontoId: string;
  aktivNavn: string;
  isin?: string;
  land: string;                   // 'DK', 'US', 'CH', etc.

  dato: Date;
  bruttoBeløb: number;
  valuta: string;
  bruttoBeløbDKK: number;

  // Kildeskat
  udenlandskKildeskat: number;
  danskKildeskat: number;
  nettoBeløb: number;

  skatteår: number;
}

// ============================================================
// SKATTEBEREGNING
// ============================================================

export interface KontoSkatteBeregning {
  kontoId: string;
  kontoType: KontoType;
  skatteår: number;

  // Aktieindkomst
  aktieindkomst: {
    realiseretGevinst: number;
    realiseretTab: number;
    udbytter: number;
    lagerbeskatning: number;      // ETF'er på positivliste
    netto: number;
  };

  // Kapitalindkomst
  kapitalindkomst: {
    etfIkkePositivliste: number;
    finansielleKontrakter: number;
    netto: number;
  };

  // For ASK/Pension
  lagerbeskatning?: {
    værdiFørste: number;
    værdiSidste: number;
    ændring: number;
  };
}

export interface SamletSkatteBeregning {
  profilId: string;
  skatteår: number;

  // Aktieindkomst (fra alle frie depoter)
  aktieindkomst: {
    netto: number;
    underProgressionsgrænse: number;
    overProgressionsgrænse: number;
    skatLav27: number;
    skatHøj42: number;
    totalSkat: number;
    kildeskatBetalt: number;
    restskat: number;
  };

  // Kapitalindkomst (fra alle frie depoter)
  kapitalindkomst: {
    netto: number;
    skat: number;
  };

  // ASK (separat)
  ask?: {
    værdiFørste: number;
    værdiSidste: number;
    ændring: number;
    skat17: number;
  };

  // Pensioner (per konto - isoleret!)
  pensioner: {
    kontoId: string;
    kontoNavn: string;
    værdiFørste: number;
    værdiSidste: number;
    ændring: number;
    palSkat15_3: number;
  }[];

  // Samlet
  totalSkat: number;
  viaÅrsopgørelse: number;        // Aktie + kapital
  trækkerAutomatisk: number;      // ASK + pension
}

// ============================================================
// KAPITALINDKOMST-SALDO (ÅRS-BASERET)
// ============================================================

/**
 * Kapitalindkomst-saldo – ÅRSKONTO (nulstilles 1. januar)
 *
 * ⚠️ KRITISK: Dette er IKKE en tabsbank-pulje!
 * - Tab kan ALDRIG fremføres til næste år
 * - Kun PSL § 11-fradrag i SAMME skatteår
 * - Gevinster og tab modregnes STRAKS i saldoen
 * - Nulstilles automatisk ved årsskift
 *
 * PSL § 11 fradragsværdi (brug getSatserForÅr() for dynamiske værdier):
 * - Op til 50.000 kr (enlig) / 100.000 kr (gift): ~33% (25% kommuneskat + 8% PSL § 11 nedslag)
 * - Over grænsen: ~25% (kun kommuneskat)
 *
 * Aktivtyper der påvirker saldoen:
 * - ETF_IKKE_POSITIVLISTE
 * - ETF_OBLIGATIONSBASERET
 * - INVF_AKKUMULERENDE_KAPITAL
 * - BLANDET_FOND_OBLIGATION
 * - OBLIGATION
 */
export interface KapitalindkomstSaldo {
  skatteår: number;
  beløb: number;               // Positivt = gevinst, negativt = tab
  gevinster: number;           // Sum af alle gevinster
  tab: number;                 // Sum af alle tab (positivt tal)
  posteringer: KapitalindkomstPost[];
}

export interface KapitalindkomstPost {
  id: string;
  dato: Date;
  aktivNavn: string;
  aktivType: AktivType;
  beløb: number;               // Positivt = gevinst, negativt = tab
  beskrivelse: string;
}

/**
 * Beregnet PSL § 11 fradrag for kapitalindkomst
 */
export interface KapitalindkomstFradrag {
  bruttoTab: number;           // Samlet tab (absolut værdi)
  underGrænse: number;         // Beløb under PSL § 11 grænsen
  overGrænse: number;          // Beløb over PSL § 11 grænsen
  fradragUnder: number;        // Fradragsværdi (~33%)
  fradragOver: number;         // Fradragsværdi (~25%)
  totalFradrag: number;        // Samlet fradragsværdi
  effektivSats: number;        // Effektiv fradragssats
}

// ============================================================
// FRADRAGSBANK
// ============================================================

export interface FradragsbankPost {
  id: string;
  profilId: string;
  pulje: TabsPulje;
  kontoId?: string;               // Kun for isolerede (ASK, pension)

  beløb: number;
  oprindelsesÅr: number;
  beskrivelse: string;

  ægtefælleOverførsel: boolean;
}

export interface Fradragsbank {
  profilId: string;
  poster: FradragsbankPost[];
}

// ============================================================
// TABSBANK UI STATE
// ============================================================

export interface TabPost {
  id: string;
  år: number;
  beløb: number;
  beskrivelse: string;
  kontoId?: string;  // For ASK/pension isolation
}

export interface TabspuljeStatus {
  beløb: number;
  posteringer: TabPost[];
}

export type TabsbankState = Record<TabsPulje, TabspuljeStatus>;

// ============================================================
// HELPER: Konverter legacy types
// ============================================================

export function normalizeAktivType(type: AktivTypeLegacy): AktivType {
  switch (type) {
    case 'AKTIE_NOTERET':
      return 'AKTIE_DK';
    case 'INVESTERINGSFORENING_UDBYTTE':
      return 'INVF_UDBYTTEBETALTENDE';
    case 'INVESTERINGSFORENING_AKKUM':
      return 'INVF_AKKUMULERENDE';
    case 'OPTION':
    case 'WARRANT':
    case 'CFD':
    case 'FUTURE':
      return 'FINANSIEL_KONTRAKT';
    case 'KRYPTO':
      return 'ETF_IKKE_POSITIVLISTE'; // Behandles som kapitalindkomst
    // OBLIGATION er nu en selvstændig AktivType - ingen mapping nødvendig
    default:
      return type as AktivType;
  }
}

export function normalizeKontoType(type: KontoTypeLegacy): KontoType {
  if (type === 'BØRNEOPSPARING') {
    return 'BOERNEOPSPARING';
  }
  return type as KontoType;
}
