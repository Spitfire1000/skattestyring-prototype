// src/constants/kontoTilladelser.ts

/**
 * KONTO-TILLADELSER
 *
 * Definerer hvilke aktivtyper der er tilladt på hver kontotype.
 * Bruges til at validere køb og vise begrænsninger i UI.
 *
 * Lovgrundlag:
 * - ASK: ASKL § 5 (kun noterede aktier og positivliste)
 * - Børneopsparing: Afhænger af bankens regler
 * - Pension: Afhænger af pensionsselskabet
 */

import type { KontoType, AktivType } from '../types/skat';
import { getSatserForÅr } from './skatteRegler';

export interface KontoRegel {
  allowedAktivTyper: AktivType[];           // Hvad må købes?
  beskrivelse: string;                      // Til UI
  note?: string;                            // Advarsel / begrænsning
  maxIndskud?: number;                      // Fx ASK 174.200 kr i 2026
  kunPositivliste?: boolean;                // Til senere brug
}

// Standard pension-tilladelser (genbruges af flere pensionstyper)
const PENSION_TILLADELSER: KontoRegel = {
  allowedAktivTyper: [
    'AKTIE_DK', 'AKTIE_UDENLANDSK',
    'ETF_POSITIVLISTE', 'ETF_IKKE_POSITIVLISTE', 'ETF_OBLIGATIONSBASERET',
    'INVF_UDBYTTEBETALTENDE', 'INVF_AKKUMULERENDE', 'INVF_AKKUMULERENDE_KAPITAL',
    'BLANDET_FOND_AKTIE', 'BLANDET_FOND_OBLIGATION', 'OBLIGATION'
  ],
  beskrivelse: "De fleste aktier, ETF'er og fonde er tilladt",
  note: "Afhænger af pensionsselskabet – unoterede aktier og finansielle kontrakter er typisk ikke tilladt",
};

export const KONTO_TILLADELSER: Record<KontoType, KontoRegel> = {
  FRIT_DEPOT: {
    allowedAktivTyper: [
      'AKTIE_DK', 'AKTIE_UDENLANDSK', 'AKTIE_UNOTERET',
      'ETF_POSITIVLISTE', 'ETF_IKKE_POSITIVLISTE', 'ETF_OBLIGATIONSBASERET',
      'INVF_UDBYTTEBETALTENDE', 'INVF_AKKUMULERENDE', 'INVF_AKKUMULERENDE_KAPITAL',
      'BLANDET_FOND_AKTIE', 'BLANDET_FOND_OBLIGATION', 'OBLIGATION', 'FINANSIEL_KONTRAKT'
    ],
    beskrivelse: "Alt er tilladt",
  },

  ASK: {
    allowedAktivTyper: [
      'AKTIE_DK', 'AKTIE_UDENLANDSK',           // Noterede aktier
      'ETF_POSITIVLISTE',                       // Kun positivliste
      'INVF_UDBYTTEBETALTENDE',                 // Danske udloddende
      'INVF_AKKUMULERENDE',                     // Akkumulerende på positivliste
    ],
    beskrivelse: "Kun noterede aktier, positivliste-ETF og visse danske investeringsforeninger",
    note: "ASKL § 5 – unoterede aktier, obligationer og ikke-positivliste ETF er forbudt",
    maxIndskud: 174200, // 2026 – opdateres via getASKIndskudsgrænse()
    kunPositivliste: true,
  },

  BOERNEOPSPARING: {
    allowedAktivTyper: [
      'AKTIE_DK', 'AKTIE_UDENLANDSK',
      'ETF_POSITIVLISTE',
      'INVF_UDBYTTEBETALTENDE',
      'INVF_AKKUMULERENDE',
    ],
    beskrivelse: "Kun udvalgte aktier og fonde (meget begrænset)",
    note: "Afhænger af bankens børneopsparingsdepot – mange banker tillader kun udvalgte fonde",
  },

  RATEPENSION: { ...PENSION_TILLADELSER },
  ALDERSOPSPARING: { ...PENSION_TILLADELSER },
  LIVRENTE: { ...PENSION_TILLADELSER },
  KAPITALPENSION: { ...PENSION_TILLADELSER },
};

// ============================================================
// HJÆLPEFUNKTIONER
// ============================================================

/**
 * Tjek om en aktivtype er tilladt på en given kontotype
 */
export function erAktivTilladt(kontoType: KontoType, aktivType: AktivType): boolean {
  const regel = KONTO_TILLADELSER[kontoType];
  return regel.allowedAktivTyper.includes(aktivType);
}

/**
 * Hent liste af aktivtyper der IKKE er tilladt på en kontotype
 */
export function getForbudteAktivTyper(kontoType: KontoType): AktivType[] {
  const regel = KONTO_TILLADELSER[kontoType];
  const alleAktivTyper: AktivType[] = [
    'AKTIE_DK', 'AKTIE_UDENLANDSK', 'AKTIE_UNOTERET',
    'ETF_POSITIVLISTE', 'ETF_IKKE_POSITIVLISTE', 'ETF_OBLIGATIONSBASERET',
    'INVF_UDBYTTEBETALTENDE', 'INVF_AKKUMULERENDE', 'INVF_AKKUMULERENDE_KAPITAL',
    'BLANDET_FOND_AKTIE', 'BLANDET_FOND_OBLIGATION', 'OBLIGATION', 'FINANSIEL_KONTRAKT'
  ];
  return alleAktivTyper.filter(type => !regel.allowedAktivTyper.includes(type));
}

/**
 * Hent ASK indskudsgrænse for et givet skatteår (dynamisk)
 */
export function getASKIndskudsgrænse(skatteår: number): number {
  const satser = getSatserForÅr(skatteår);
  return satser.ask.indskudsgrænse;
}

/**
 * Hent beskrivelse af begrænsninger for en kontotype
 */
export function getKontoBegrænsning(kontoType: KontoType): string | undefined {
  return KONTO_TILLADELSER[kontoType].note;
}

/**
 * Valider om et køb er tilladt og returner fejlbesked hvis ikke
 */
export function validerKøb(
  kontoType: KontoType,
  aktivType: AktivType
): { tilladt: boolean; fejl?: string } {
  if (erAktivTilladt(kontoType, aktivType)) {
    return { tilladt: true };
  }

  const regel = KONTO_TILLADELSER[kontoType];
  return {
    tilladt: false,
    fejl: `${aktivType} er ikke tilladt på ${kontoType}. ${regel.note || ''}`.trim(),
  };
}
