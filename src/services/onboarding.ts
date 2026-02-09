/**
 * ONBOARDING SERVICE
 *
 * Genererer onboarding-flow til opsætning af tabsbank.
 * Dato-intelligent: Ved hvilken årsopgørelse der er tilgængelig.
 */

import { beregnOnboardingKontekst, type OnboardingKontekst } from '../constants/skatteKalender';
import {
  TABSPULJE_ONBOARDING,
  type TabspuljeOnboarding,
  indsætÅrstalIVejledning,
} from '../constants/skatDkVejledning';

// ============================================================
// TYPER
// ============================================================

/**
 * Type af onboarding-trin
 */
export type OnboardingTrinType = 'info' | 'input' | 'upload' | 'summary';

/**
 * Ét trin i onboarding-flowet
 */
export interface OnboardingTrin {
  type: OnboardingTrinType;
  titel: string;
  beskrivelse?: string;
  beskedType?: 'info' | 'warning';

  // For input-trin
  pulje?: string;
  vejledning?: TabspuljeOnboarding;

  // For upload-trin
  uploadÅr?: number[];
}

/**
 * Brugerens input-saldoer
 */
export interface OnboardingSaldoer {
  noteretAktieTab: number;
  unoteretAktieTab: number;
  finansielKontraktIkkeAktie: number;   // Rubrik 85
  finansielKontraktAktie: number;       // Rubrik 86
  askFremførtTab: number;
}

/**
 * Samlet onboarding-state
 */
export interface OnboardingState {
  // Dato-kontekst
  kontekst: OnboardingKontekst;

  // Brugerens input
  saldoer: OnboardingSaldoer;
  saldoÅr: number;  // Hvilket år saldoerne stammer fra (fx 2024)

  // Upload af handler
  handlerUploadet: boolean;
  handlerÅr: number[];  // Fx [2025] — årene der dækkes af uploadede handler

  // Nuværende trin
  aktivtTrin: number;
  trinTotal: number;

  // Status
  erKomplet: boolean;
}

/**
 * Verifikations-påmindelse når ny årsopgørelse bliver tilgængelig
 */
export interface VerifikationsPåmindelse {
  nytÅrTilgængeligt: number;       // 2025
  tidligereKonfigureretMed: number; // 2024
  besked: string;
  handling: 'verificer_saldoer';
}

// ============================================================
// FUNKTIONER
// ============================================================

/**
 * Opret initial onboarding-state
 */
export function opretOnboardingState(dato?: Date): OnboardingState {
  const kontekst = beregnOnboardingKontekst(dato);
  const trin = genererOnboardingTrin(dato);

  return {
    kontekst,
    saldoer: {
      noteretAktieTab: 0,
      unoteretAktieTab: 0,
      finansielKontraktIkkeAktie: 0,
      finansielKontraktAktie: 0,
      askFremførtTab: 0,
    },
    saldoÅr: kontekst.senesteÅrsopgørelse,
    handlerUploadet: false,
    handlerÅr: [],
    aktivtTrin: 0,
    trinTotal: trin.length,
    erKomplet: false,
  };
}

/**
 * Generér onboarding-trin baseret på dags dato.
 *
 * Returnerer en liste af trin med vejledninger og input-felter.
 * UI'et renderer disse trin som en step-by-step wizard.
 */
export function genererOnboardingTrin(dato?: Date): OnboardingTrin[] {
  const kontekst = beregnOnboardingKontekst(dato);

  const trin: OnboardingTrin[] = [];

  // TRIN 0: Velkomst + dato-besked
  trin.push({
    type: 'info',
    titel: 'Opsæt din tabsbank',
    beskrivelse: kontekst.besked,
    beskedType: kontekst.beskedType,
  });

  // TRIN 1: Frit Depot — Noterede aktier
  const noteretVejledning = tilpassVejledning(
    TABSPULJE_ONBOARDING['NOTERET_AKTIE'],
    kontekst.senesteÅrsopgørelse
  );
  trin.push({
    type: 'input',
    pulje: 'NOTERET_AKTIE',
    titel: `Noterede aktier — fra ${kontekst.senesteÅrsopgørelse}-årsopgørelsen`,
    vejledning: noteretVejledning,
  });

  // TRIN 2: Frit Depot — Unoterede aktier
  const unoteretVejledning = tilpassVejledning(
    TABSPULJE_ONBOARDING['UNOTERET_AKTIE'],
    kontekst.senesteÅrsopgørelse
  );
  trin.push({
    type: 'input',
    pulje: 'UNOTERET_AKTIE',
    titel: `Unoterede aktier — fra ${kontekst.senesteÅrsopgørelse}-årsopgørelsen`,
    vejledning: unoteretVejledning,
  });

  // TRIN 3: Frit Depot — Finansielle kontrakter
  const finansielVejledning = tilpassVejledning(
    TABSPULJE_ONBOARDING['FINANSIEL_KONTRAKT'],
    kontekst.senesteÅrsopgørelse
  );
  trin.push({
    type: 'input',
    pulje: 'FINANSIEL_KONTRAKT',
    titel: `Finansielle kontrakter — fra ${kontekst.senesteÅrsopgørelse}-årsopgørelsen`,
    vejledning: finansielVejledning,
  });

  // TRIN 3: ASK
  const askVejledning = tilpassVejledning(
    TABSPULJE_ONBOARDING['ASK_ISOLERET'],
    kontekst.senesteÅrsopgørelse
  );
  trin.push({
    type: 'input',
    pulje: 'ASK_ISOLERET',
    titel: `Aktiesparekonto — fra din banks ${kontekst.senesteÅrsopgørelse}-opgørelse`,
    vejledning: askVejledning,
  });

  // TRIN 4: Info om kapitalindkomst (ingen input)
  trin.push({
    type: 'info',
    titel: 'Kapitalindkomst (ETF ikke-positivliste)',
    beskrivelse: 'Kapitalindkomst har INGEN tabsbank. Tab bruges straks i skatteåret. ' +
                 'Du behøver ikke indtaste noget — systemet beregner automatisk fra dine handler.',
    beskedType: 'info',
  });

  // TRIN 5: Upload handler (hvis der er et "hul")
  if (kontekst.årDerMangler.length > 0) {
    trin.push({
      type: 'upload',
      titel: `Upload dine ${kontekst.årDerMangler.join(' og ')}-handler`,
      beskrivelse: `Din ${kontekst.senesteÅrsopgørelse}-årsopgørelse dækker til og med ` +
                   `31. december ${kontekst.senesteÅrsopgørelse}. ` +
                   `Upload handler fra ${kontekst.årDerMangler.join(' og ')} ` +
                   `så systemet kan beregne hvad der er sket siden.`,
      beskedType: 'warning',
      uploadÅr: kontekst.årDerMangler,
    });
  }

  // TRIN 6: Bekræftelse
  trin.push({
    type: 'summary',
    titel: 'Oversigt over din tabsbank',
    beskrivelse: 'Tjek at tallene ser rigtige ud. Du kan altid rette dem senere.',
  });

  return trin;
}

/**
 * Tilpas vejledning med korrekte årstal
 */
function tilpassVejledning(
  vejledning: TabspuljeOnboarding,
  år: number
): TabspuljeOnboarding {
  return {
    ...vejledning,
    rubrikker: vejledning.rubrikker.map(r => ({
      ...r,
      hvordanFinderDuDet: indsætÅrstalIVejledning(r.hvordanFinderDuDet, år),
    })),
  };
}

/**
 * Opdater onboarding-state med brugerens input
 */
export function opdaterSaldoer(
  state: OnboardingState,
  felt: keyof OnboardingSaldoer,
  værdi: number
): OnboardingState {
  return {
    ...state,
    saldoer: {
      ...state.saldoer,
      [felt]: værdi,
    },
  };
}

/**
 * Marker handler som uploadet
 */
export function markerHandlerUploadet(
  state: OnboardingState,
  år: number[]
): OnboardingState {
  return {
    ...state,
    handlerUploadet: true,
    handlerÅr: år,
  };
}

/**
 * Gå til næste trin
 */
export function næsteTrin(state: OnboardingState): OnboardingState {
  const nytTrin = Math.min(state.aktivtTrin + 1, state.trinTotal - 1);
  return {
    ...state,
    aktivtTrin: nytTrin,
    erKomplet: nytTrin === state.trinTotal - 1,
  };
}

/**
 * Gå til forrige trin
 */
export function forrigeTrin(state: OnboardingState): OnboardingState {
  return {
    ...state,
    aktivtTrin: Math.max(state.aktivtTrin - 1, 0),
    erKomplet: false,
  };
}

/**
 * Tjek om onboarding er komplet
 */
export function erOnboardingKomplet(state: OnboardingState): boolean {
  // Tjek at vi er på sidste trin
  if (state.aktivtTrin < state.trinTotal - 1) {
    return false;
  }

  // Tjek at handler er uploadet hvis nødvendigt
  if (state.kontekst.årDerMangler.length > 0 && !state.handlerUploadet) {
    return false;
  }

  return true;
}

/**
 * Valider onboarding-state
 * Returnerer liste af fejl/advarsler
 */
export function validerOnboarding(state: OnboardingState): string[] {
  const advarsler: string[] = [];

  // Tjek for negative værdier
  Object.entries(state.saldoer).forEach(([felt, værdi]) => {
    if (værdi < 0) {
      advarsler.push(`${felt} kan ikke være negativ`);
    }
  });

  // Tjek handler-upload hvis påkrævet
  if (state.kontekst.årDerMangler.length > 0 && !state.handlerUploadet) {
    advarsler.push(
      `Du mangler at uploade handler for ${state.kontekst.årDerMangler.join(' og ')}`
    );
  }

  return advarsler;
}

/**
 * Når en ny årsopgørelse bliver tilgængelig, kan systemet
 * foreslå brugeren at verificere sine tal.
 *
 * Fx: I april 2026, vis en notifikation:
 * "Din 2025-årsopgørelse er nu tilgængelig!
 *  Tjek at dine tabssaldoer matcher det vi har beregnet."
 */
export function tjekForNyÅrsopgørelse(
  onboardingState: OnboardingState,
  dagsDato?: Date
): VerifikationsPåmindelse | null {
  const kontekst = beregnOnboardingKontekst(dagsDato);

  // Hvis den seneste tilgængelige opgørelse er NYERE end hvad brugeren
  // konfigurerede med, foreslå verificering
  if (kontekst.senesteÅrsopgørelse > onboardingState.saldoÅr) {
    return {
      nytÅrTilgængeligt: kontekst.senesteÅrsopgørelse,
      tidligereKonfigureretMed: onboardingState.saldoÅr,
      besked: `Din ${kontekst.senesteÅrsopgørelse}-årsopgørelse er nu tilgængelig! ` +
              `Du opsatte din tabsbank med ${onboardingState.saldoÅr}-tal. ` +
              `Tjek at saldoerne matcher — gå til skat.dk/tastselv og sammenlign.`,
      handling: 'verificer_saldoer',
    };
  }

  return null;
}

/**
 * Konvertér onboarding-saldoer til fradragsbank-poster
 * Bruges når onboarding er færdig til at initialisere fradragsbanken
 */
export function konverterTilFradragsbankPoster(
  state: OnboardingState
): Array<{
  pulje: string;
  beløb: number;
  oprindelsesÅr: number;
  beskrivelse: string;
}> {
  const poster: Array<{
    pulje: string;
    beløb: number;
    oprindelsesÅr: number;
    beskrivelse: string;
  }> = [];

  const { saldoer, saldoÅr } = state;

  if (saldoer.noteretAktieTab > 0) {
    poster.push({
      pulje: 'NOTERET_AKTIE',
      beløb: saldoer.noteretAktieTab,
      oprindelsesÅr: saldoÅr,
      beskrivelse: `Fremført tab fra ${saldoÅr}-årsopgørelse`,
    });
  }

  if (saldoer.unoteretAktieTab > 0) {
    poster.push({
      pulje: 'UNOTERET_AKTIE',
      beløb: saldoer.unoteretAktieTab,
      oprindelsesÅr: saldoÅr,
      beskrivelse: `Fremført tab fra ${saldoÅr}-årsopgørelse`,
    });
  }

  if (saldoer.finansielKontraktIkkeAktie > 0) {
    poster.push({
      pulje: 'FINANSIEL_KONTRAKT',
      beløb: saldoer.finansielKontraktIkkeAktie,
      oprindelsesÅr: saldoÅr,
      beskrivelse: `Rubrik 85 — ikke-aktiebaserede kontrakter fra ${saldoÅr}`,
    });
  }

  if (saldoer.finansielKontraktAktie > 0) {
    poster.push({
      pulje: 'FINANSIEL_KONTRAKT',
      beløb: saldoer.finansielKontraktAktie,
      oprindelsesÅr: saldoÅr,
      beskrivelse: `Rubrik 86 — aktiebaserede kontrakter fra ${saldoÅr}`,
    });
  }

  if (saldoer.askFremførtTab > 0) {
    poster.push({
      pulje: 'ASK_ISOLERET',
      beløb: saldoer.askFremførtTab,
      oprindelsesÅr: saldoÅr,
      beskrivelse: `Fremført negativt afkast på ASK fra ${saldoÅr}`,
    });
  }

  return poster;
}

// ============================================================
// HJÆLPEFUNKTIONER TIL UI
// ============================================================

/**
 * Hent fremskridtsprocent for onboarding
 */
export function hentFremskridt(state: OnboardingState): number {
  if (state.trinTotal === 0) return 0;
  return Math.round((state.aktivtTrin / (state.trinTotal - 1)) * 100);
}

/**
 * Hent resumé af indtastede saldoer
 */
export function hentSaldoResumé(state: OnboardingState): Array<{
  label: string;
  beløb: number;
  pulje: string;
}> {
  const resumé: Array<{ label: string; beløb: number; pulje: string }> = [];

  if (state.saldoer.noteretAktieTab > 0) {
    resumé.push({
      label: 'Noterede aktier',
      beløb: state.saldoer.noteretAktieTab,
      pulje: 'NOTERET_AKTIE',
    });
  }

  if (state.saldoer.unoteretAktieTab > 0) {
    resumé.push({
      label: 'Unoterede aktier',
      beløb: state.saldoer.unoteretAktieTab,
      pulje: 'UNOTERET_AKTIE',
    });
  }

  if (state.saldoer.finansielKontraktIkkeAktie > 0) {
    resumé.push({
      label: 'Finansielle kontrakter (ikke-aktie)',
      beløb: state.saldoer.finansielKontraktIkkeAktie,
      pulje: 'FINANSIEL_KONTRAKT',
    });
  }

  if (state.saldoer.finansielKontraktAktie > 0) {
    resumé.push({
      label: 'Finansielle kontrakter (aktie)',
      beløb: state.saldoer.finansielKontraktAktie,
      pulje: 'FINANSIEL_KONTRAKT',
    });
  }

  if (state.saldoer.askFremførtTab > 0) {
    resumé.push({
      label: 'Aktiesparekonto (ASK)',
      beløb: state.saldoer.askFremførtTab,
      pulje: 'ASK_ISOLERET',
    });
  }

  return resumé;
}

/**
 * Beregn samlet fremført tab fra alle puljer
 */
export function beregnSamletFremførtTab(state: OnboardingState): number {
  const { saldoer } = state;
  return (
    saldoer.noteretAktieTab +
    saldoer.unoteretAktieTab +
    saldoer.finansielKontraktIkkeAktie +
    saldoer.finansielKontraktAktie +
    saldoer.askFremførtTab
  );
}
