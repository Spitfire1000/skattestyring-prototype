/**
 * LAGERBESKATNING TYPER
 *
 * Typer for dynamisk lagerbeskatning - viser løbende skattepligt
 * på lagerbeskattede aktiver (ASK, pension, ETF'er, akkumulerende fonde).
 *
 * ⚠️ VIGTIG: Lagerbeskatning betales ved årsskiftet uanset om man sælger eller ej.
 */

import type { KontoType, AktivType, IndkomstType } from './skat';

// ============================================================
// AKTIV-NIVEAU
// ============================================================

/**
 * Lagerbeskatning for ét enkelt aktiv
 */
export interface AktivLagerSkat {
  aktivId: string;
  navn: string;
  isin?: string;
  kontoType: KontoType;
  aktivType: AktivType;

  // Værdier
  primo: number;              // Værdi ved årets start (eller købstidspunkt)
  aktuelVærdi: number;        // Nuværende værdi
  ændring: number;            // aktuelVærdi - primo

  // Skattesats og beregning
  skattesats: number;         // 0.17, 0.153, 0.27, 0.42, 0.37, 0
  indkomstType: IndkomstType; // 'ASK_INDKOMST', 'PAL_INDKOMST', 'AKTIEINDKOMST', 'KAPITALINDKOMST', 'SKATTEFRI'
  beskatningsmetode: 'LAGER'; // Altid lager i denne kontekst

  // Estimeret skat (positivt = skylder, negativt = fradrag)
  // ⚠️ For ASK/pension: Dette er INDIKATIVT - reel skat beregnes på nettet resultat
  estimeretSkat: number;

  // Note om beregning
  note?: string;
}

// ============================================================
// KONTO-NIVEAU
// ============================================================

/**
 * Samlet lagerbeskatning for én konto
 */
export interface KontoLagerSkat {
  kontoId: string;
  kontoNavn: string;
  kontoType: KontoType;

  // Konto-niveau totaler
  samletPrimo: number;
  samletAktuelVærdi: number;
  samletÆndring: number;

  // For ASK/pension: nettes på kontoniveau FØR skat beregnes
  // For frit depot: summeres per indkomsttype
  nettetBeskatningsgrundlag: number;
  estimeretSkat: number;
  skattesats: number;         // Flat sats for ASK/pension/børneopsparing

  // Per-aktiv detaljer
  aktiver: AktivLagerSkat[];

  // Metadata
  erIsoleret: boolean;        // ASK/pension: ja, frit depot: nej
  erLagerbeskattet: boolean;  // true for ASK, pension, børneopsparing
  note?: string;              // Fx "Tab nettes internt på kontoen"
}

// ============================================================
// FRIT DEPOT OPDELING
// ============================================================

/**
 * Frit depot opdelt efter indkomsttype (kun lagerbeskattede aktiver)
 */
export interface FritDepotLagerOpdeling {
  // Aktieindkomst-lager: Positivliste-ETF + akkumulerende inv.foreninger
  aktieindkomst: {
    aktiver: AktivLagerSkat[];
    samletÆndring: number;
    // Progression: samles med evt. realiseret aktieindkomst
    estimeretSkat: number;
    // Breakdown af progression
    under27pctBeløb: number;
    over42pctBeløb: number;
  };

  // Kapitalindkomst-lager: ETF ikke-positivliste, obligationsbaseret, finansielle kontrakter
  kapitalindkomst: {
    aktiver: AktivLagerSkat[];
    samletÆndring: number;
    estimeretSkat: number;
    // For tab: PSL § 11 fradragsværdi
    erTab: boolean;
    fradragsværdi?: number;
  };
}

// ============================================================
// SAMLET OVERSIGT
// ============================================================

/**
 * Samlet oversigt over al dynamisk lagerbeskatning
 */
export interface DynamiskLagerOversigt {
  skatteår: number;
  civilstand: 'ENLIG' | 'GIFT';
  beregnetTidspunkt: Date;

  // Per konto (ASK, pensioner, børneopsparing)
  konti: KontoLagerSkat[];

  // Frit depot opdelt efter indkomsttype (kun lagerbeskattet)
  fritDepot: FritDepotLagerOpdeling;

  // ─────────────────────────────────────────────────────────────
  // SAMLET ESTIMERET LAGERSKAT
  // ─────────────────────────────────────────────────────────────

  samletEstimeretSkat: number;

  // Opdeling efter betalingsmetode
  skatAutomatiskTrukket: number;  // ASK + pension (trækkes af udbyder)
  skatViaÅrsopgørelse: number;    // Frit depot lager (betales via årsopgørelse)
  skattefriÆndring: number;       // Børneopsparing (altid 0 skat)

  // ─────────────────────────────────────────────────────────────
  // FREMFØRTE TAB (kun for isolerede konti)
  // ─────────────────────────────────────────────────────────────

  fremførteTilNæsteÅr: {
    kontoId: string;
    kontoNavn: string;
    kontoType: KontoType;
    beløb: number;          // Negativt beskatningsgrundlag → fremføres
    note: string;
  }[];
}

// ============================================================
// INPUT PARAMETRE
// ============================================================

/**
 * Input til beregning af dynamisk lagerbeskatning
 */
export interface DynamiskLagerInput {
  skatteår: number;
  civilstand: 'ENLIG' | 'GIFT';

  // Valgfri: primo-værdier per aktiv (hvis ikke angivet bruges anskaffelsessum)
  primoOverrides?: Map<string, number>;

  // Valgfri: allerede realiseret aktieindkomst i året (påvirker progression)
  realiseretAktieindkomstIÅret?: number;

  // Valgfri: allerede realiseret kapitalindkomst i året
  realiseretKapitalindkomstIÅret?: number;
}

// ============================================================
// HELPER TYPER
// ============================================================

/**
 * Resultat af skatteberegning for én position
 */
export interface LagerSkatBeregning {
  bruttoÆndring: number;
  skattesats: number;
  skat: number;               // Positivt = betale, negativt = fradrag
  indkomstType: IndkomstType;
  note?: string;
}

/**
 * Konto-kategorier for gruppering
 */
export type KontoKategori =
  | 'ASK'
  | 'PENSION'
  | 'BOERNEOPSPARING'
  | 'FRIT_DEPOT_AKTIE'
  | 'FRIT_DEPOT_KAPITAL';
