// ============================================================
// KONTOTYPER
// ============================================================

export type KontoType =
  | 'FRIT_DEPOT'
  | 'ASK'
  | 'RATEPENSION'
  | 'ALDERSOPSPARING'
  | 'KAPITALPENSION'
  | 'LIVRENTE'
  | 'BØRNEOPSPARING';

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
  | 'AKTIE_NOTERET'
  | 'AKTIE_UNOTERET'
  | 'ETF_POSITIVLISTE'
  | 'ETF_IKKE_POSITIVLISTE'
  | 'INVESTERINGSFORENING_UDBYTTE'
  | 'INVESTERINGSFORENING_AKKUM'
  | 'OBLIGATION'
  | 'OPTION'
  | 'WARRANT'
  | 'CFD'
  | 'FUTURE'
  | 'KRYPTO';

export type IndkomstType = 'AKTIEINDKOMST' | 'KAPITALINDKOMST';

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
    obligationer: number;
    etfIkkePositivliste: number;
    finansielleKontrakter: number;
    krypto: number;
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
