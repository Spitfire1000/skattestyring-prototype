/**
 * SKATTEBEREGNER
 *
 * Beregner skat for investeringer baseret på danske skatteregler.
 *
 * VIGTIGT: Dette er ESTIMATER - ikke skattefaglig rådgivning!
 * Alle beregninger skal valideres af revisor/skatterådgiver.
 *
 * @version 1.0
 * @author Skattestyring-prototype
 */

import type {
  Konto,
  KontoType,
  Aktiv,
  AktivType,
  Handel,
  Udbytte,
  KontoSkatteBeregning,
  SamletSkatteBeregning,
} from '../types/skat';

import {
  SKATTESATSER,
  KONTO_SKATTEREGLER,
  AKTIV_SKATTEREGLER,
} from '../constants/skatteRegler';

// ============================================================
// HJÆLPEFUNKTIONER
// ============================================================

/**
 * Bestem om et aktiv beskattes som aktieindkomst eller kapitalindkomst
 *
 * REGEL:
 * - Aktier (noteret/unoteret) → Aktieindkomst
 * - ETF på positivliste → Aktieindkomst (lagerbeskatning)
 * - ETF IKKE på positivliste → Kapitalindkomst (lagerbeskatning)
 * - Investeringsforeninger → Aktieindkomst
 * - Obligationer, krypto, derivater → Kapitalindkomst
 */
function getIndkomsttype(aktivType: AktivType): 'AKTIEINDKOMST' | 'KAPITALINDKOMST' {
  return AKTIV_SKATTEREGLER[aktivType].indkomsttype;
}

/**
 * Bestem beskatningsmetode for et aktiv
 *
 * REGEL:
 * - REALISATION: Skat betales kun ved salg (aktier, obligationer, krypto)
 * - LAGER: Skat betales årligt af urealiseret gevinst/tab (ETF'er, ASK, pension)
 */
function getBeskatningsmetode(aktivType: AktivType): 'REALISATION' | 'LAGER' {
  return AKTIV_SKATTEREGLER[aktivType].beskatningsmetode;
}

/**
 * Beregn realiseret gevinst/tab fra en handel
 *
 * FORMEL:
 * Gevinst/Tab = Salgssum - Anskaffelsessum - Kurtage
 *
 * EKSEMPEL:
 * Køb: 100 aktier á 100 kr = 10.000 kr + 29 kr kurtage = 10.029 kr anskaffelse
 * Salg: 100 aktier á 120 kr = 12.000 kr - 29 kr kurtage = 11.971 kr
 * Gevinst: 11.971 - 10.029 = 1.942 kr
 */
function beregnRealiseretGevinstTab(handel: Handel): number {
  if (handel.type !== 'SALG' || !handel.anskaffelsessum) {
    return 0;
  }

  // Salgsbeløb minus anskaffelsessum (kurtage er typisk inkluderet i beløb)
  return handel.beløb - handel.anskaffelsessum;
}

/**
 * Beregn lagerbeskatning for et aktiv
 *
 * FORMEL:
 * Lagergevinst = Værdi ultimo år - Værdi primo år
 *
 * BEMÆRK:
 * - Bruger værdi ved årets start og slut
 * - Hvis købt i løbet af året: primo = anskaffelsessum
 * - Hvis solgt i løbet af året: ultimo = salgssum
 *
 * EKSEMPEL:
 * ETF værdi 1/1: 100.000 kr
 * ETF værdi 31/12: 110.000 kr
 * Lagergevinst: 10.000 kr (beskattes selvom ikke solgt)
 */
function beregnLagergevinstTab(aktiv: Aktiv): number {
  const primo = aktiv.værdiPrimoÅr ?? aktiv.anskaffelsessum;
  const ultimo = aktiv.værdiUltimoÅr ?? aktiv.aktuelVærdi;

  return ultimo - primo;
}

// ============================================================
// KONTO-SKATTEBEREGNING
// ============================================================

/**
 * Beregn skat for en enkelt konto
 *
 * Denne funktion håndterer forskellig skattebehandling afhængig af kontotype:
 *
 * FRIT DEPOT:
 * - Aktier: Realisationsbeskatning → Aktieindkomst (27%/42%)
 * - ETF positivliste: Lagerbeskatning → Aktieindkomst
 * - ETF ikke-positivliste: Lagerbeskatning → Kapitalindkomst (~37%)
 * - Tab kan modregnes/fremføres
 *
 * ASK (Aktiesparekonto):
 * - ALLE aktiver: Lagerbeskatning → 17% flat
 * - Tab isoleret til kontoen (kan IKKE bruges andre steder!)
 * - Maks indskud: 174.200 kr (2025)
 *
 * PENSION (Rate, Alders, Liv, Kapital):
 * - ALLE aktiver: Lagerbeskatning → 15,3% PAL
 * - Tab isoleret til hver enkelt pensionskonto
 * - Kan IKKE overføres til ægtefælle
 *
 * BØRNEOPSPARING:
 * - Skattefri (0%)
 * - Bundet til barnet fylder 21 år
 */
export function beregnKontoSkat(
  konto: Konto,
  aktiver: Aktiv[],
  handler: Handel[],
  udbytter: Udbytte[] = [],
  skatteår: number = new Date().getFullYear()
): KontoSkatteBeregning {

  const kontoRegler = KONTO_SKATTEREGLER[konto.type];

  // Initialiser resultat
  const resultat: KontoSkatteBeregning = {
    kontoId: konto.id,
    kontoType: konto.type,
    skatteår,
    aktieindkomst: {
      realiseretGevinst: 0,
      realiseretTab: 0,
      udbytter: 0,
      lagerbeskatning: 0,
      netto: 0,
    },
    kapitalindkomst: {
      obligationer: 0,
      etfIkkePositivliste: 0,
      finansielleKontrakter: 0,
      krypto: 0,
      netto: 0,
    },
  };

  // ============================================================
  // SPECIAL CASE: ASK, Pension, Børneopsparing (ren lagerbeskatning)
  // ============================================================

  if (kontoRegler.beskatningsmetode === 'LAGER') {
    // For disse konti beskattes HELE kontoen som én enhed
    // Beregn samlet værdiændring
    let værdiFørste = 0;
    let værdiSidste = 0;

    for (const aktiv of aktiver) {
      værdiFørste += aktiv.værdiPrimoÅr ?? aktiv.anskaffelsessum;
      værdiSidste += aktiv.værdiUltimoÅr ?? aktiv.aktuelVærdi;
    }

    resultat.lagerbeskatning = {
      værdiFørste,
      værdiSidste,
      ændring: værdiSidste - værdiFørste,
    };

    return resultat;
  }

  // ============================================================
  // FRIT DEPOT: Blandet beskatning
  // ============================================================

  // 1. REALISEREDE HANDLER (aktier, obligationer, krypto)
  for (const handel of handler) {
    if (handel.skatteår !== skatteår) continue;
    if (handel.type !== 'SALG') continue;

    const gevinstTab = beregnRealiseretGevinstTab(handel);
    const indkomsttype = getIndkomsttype(handel.aktivType);

    if (indkomsttype === 'AKTIEINDKOMST') {
      // Aktier og investeringsforeninger
      if (gevinstTab >= 0) {
        resultat.aktieindkomst.realiseretGevinst += gevinstTab;
      } else {
        resultat.aktieindkomst.realiseretTab += Math.abs(gevinstTab);
      }
    } else {
      // Kapitalindkomst (obligationer, krypto, derivater)
      switch (handel.aktivType) {
        case 'OBLIGATION':
          resultat.kapitalindkomst.obligationer += gevinstTab;
          break;
        case 'KRYPTO':
          resultat.kapitalindkomst.krypto += gevinstTab;
          break;
        case 'OPTION':
        case 'WARRANT':
        case 'CFD':
        case 'FUTURE':
          resultat.kapitalindkomst.finansielleKontrakter += gevinstTab;
          break;
        default:
          // ETF ikke-positivliste håndteres nedenfor (lager)
          break;
      }
    }
  }

  // 2. LAGERBESKATNING (ETF'er og akkumulerende investeringsforeninger)
  for (const aktiv of aktiver) {
    const beskatningsmetode = getBeskatningsmetode(aktiv.type);

    if (beskatningsmetode === 'LAGER') {
      const lagerGevinst = beregnLagergevinstTab(aktiv);
      const indkomsttype = getIndkomsttype(aktiv.type);

      if (indkomsttype === 'AKTIEINDKOMST') {
        // ETF på positivliste, akkumulerende investeringsforeninger
        resultat.aktieindkomst.lagerbeskatning += lagerGevinst;
      } else {
        // ETF IKKE på positivliste
        resultat.kapitalindkomst.etfIkkePositivliste += lagerGevinst;
      }
    }
  }

  // 3. UDBYTTER
  for (const udbytte of udbytter) {
    if (udbytte.skatteår !== skatteår) continue;

    // Udbytter er altid aktieindkomst
    resultat.aktieindkomst.udbytter += udbytte.bruttoBeløbDKK;
  }

  // 4. BEREGN NETTO
  resultat.aktieindkomst.netto =
    resultat.aktieindkomst.realiseretGevinst -
    resultat.aktieindkomst.realiseretTab +
    resultat.aktieindkomst.udbytter +
    resultat.aktieindkomst.lagerbeskatning;

  resultat.kapitalindkomst.netto =
    resultat.kapitalindkomst.obligationer +
    resultat.kapitalindkomst.etfIkkePositivliste +
    resultat.kapitalindkomst.finansielleKontrakter +
    resultat.kapitalindkomst.krypto;

  return resultat;
}

// ============================================================
// SAMLET SKATTEBEREGNING
// ============================================================

/**
 * Input til samlet skatteberegning
 */
export interface KontoMedData {
  konto: Konto;
  aktiver: Aktiv[];
  handler: Handel[];
  udbytter: Udbytte[];
}

/**
 * Beregn samlet skat for alle konti
 *
 * FLOW:
 * 1. Beregn skat for hver enkelt konto
 * 2. Saml aktieindkomst fra alle FRIE DEPOTER
 * 3. Saml kapitalindkomst fra alle FRIE DEPOTER
 * 4. Beregn skat på aktieindkomst (27%/42% progression)
 * 5. Beregn skat på kapitalindkomst (~37%)
 * 6. Beregn ASK-skat separat (17% lager)
 * 7. Beregn PAL-skat for hver pension separat (15,3% lager)
 * 8. Summer total skat
 *
 * VIGTIGT:
 * - Frit depot: Samles på CPR-niveau (kan modregnes på tværs af banker)
 * - ASK: Isoleret konto (tab kan KUN bruges på denne konto)
 * - Pension: Hver konto er isoleret (tab kan KUN bruges på denne ene pension)
 * - Børneopsparing: Skattefri
 */
export function beregnSamletSkat(
  kontiMedData: KontoMedData[],
  profilId: string,
  skatteår: number = new Date().getFullYear(),
  erGift: boolean = false
): SamletSkatteBeregning {

  // Beregn skat for hver konto
  const kontoBeregninger = kontiMedData.map(({ konto, aktiver, handler, udbytter }) =>
    beregnKontoSkat(konto, aktiver, handler, udbytter, skatteår)
  );

  // Initialiser resultat
  const resultat: SamletSkatteBeregning = {
    profilId,
    skatteår,
    aktieindkomst: {
      netto: 0,
      underProgressionsgrænse: 0,
      overProgressionsgrænse: 0,
      skatLav27: 0,
      skatHøj42: 0,
      totalSkat: 0,
      kildeskatBetalt: 0,
      restskat: 0,
    },
    kapitalindkomst: {
      netto: 0,
      skat: 0,
    },
    pensioner: [],
    totalSkat: 0,
    viaÅrsopgørelse: 0,
    trækkerAutomatisk: 0,
  };

  // ============================================================
  // 1. SAML FRA FRIE DEPOTER
  // ============================================================

  for (let i = 0; i < kontiMedData.length; i++) {
    const konto = kontiMedData[i].konto;
    const beregning = kontoBeregninger[i];

    if (konto.type === 'FRIT_DEPOT') {
      // Aktieindkomst samles
      resultat.aktieindkomst.netto += beregning.aktieindkomst.netto;

      // Kapitalindkomst samles
      resultat.kapitalindkomst.netto += beregning.kapitalindkomst.netto;

      // Kildeskat betalt (fra udbytter)
      const udbytter = kontiMedData[i].udbytter;
      for (const udbytte of udbytter) {
        if (udbytte.skatteår === skatteår) {
          resultat.aktieindkomst.kildeskatBetalt +=
            udbytte.danskKildeskat + udbytte.udenlandskKildeskat;
        }
      }
    }
  }

  // ============================================================
  // 2. BEREGN AKTIEINDKOMSTSKAT (27%/42%)
  // ============================================================

  /**
   * PROGRESSIONSBEREGNING:
   *
   * Aktieindkomst op til progressionsgrænsen: 27%
   * Aktieindkomst over progressionsgrænsen: 42%
   *
   * Progressionsgrænse 2025:
   * - Enlig: 79.400 kr
   * - Gift: 158.800 kr (kan dele med ægtefælle)
   *
   * EKSEMPEL (enlig, 100.000 kr aktieindkomst):
   * - Første 79.400 kr: 79.400 × 27% = 21.438 kr
   * - Rest 20.600 kr: 20.600 × 42% = 8.652 kr
   * - Total: 30.090 kr
   */

  const progressionsgrænse = erGift
    ? SKATTESATSER.PROGRESSIONSGRÆNSE_GIFT
    : SKATTESATSER.PROGRESSIONSGRÆNSE_ENLIG;

  if (resultat.aktieindkomst.netto > 0) {
    // Under grænsen
    resultat.aktieindkomst.underProgressionsgrænse = Math.min(
      resultat.aktieindkomst.netto,
      progressionsgrænse
    );

    // Over grænsen
    resultat.aktieindkomst.overProgressionsgrænse = Math.max(
      0,
      resultat.aktieindkomst.netto - progressionsgrænse
    );

    // Beregn skat
    resultat.aktieindkomst.skatLav27 =
      resultat.aktieindkomst.underProgressionsgrænse * SKATTESATSER.AKTIE_LAV;

    resultat.aktieindkomst.skatHøj42 =
      resultat.aktieindkomst.overProgressionsgrænse * SKATTESATSER.AKTIE_HØJ;

    resultat.aktieindkomst.totalSkat =
      resultat.aktieindkomst.skatLav27 + resultat.aktieindkomst.skatHøj42;

    // Træk kildeskat fra
    resultat.aktieindkomst.restskat = Math.max(
      0,
      resultat.aktieindkomst.totalSkat - resultat.aktieindkomst.kildeskatBetalt
    );
  }

  // ============================================================
  // 3. BEREGN KAPITALINDKOMSTSKAT (~37%)
  // ============================================================

  /**
   * KAPITALINDKOMST:
   *
   * Positiv kapitalindkomst beskattes med ca. 37%
   * (afhænger af kommune og kirkeskat)
   *
   * Negativ kapitalindkomst giver fradrag på ca. 25%
   *
   * BEMÆRK: Kapitalindkomst fra finansielle kontrakter
   * (optioner, warrants, CFD, futures) har særlige regler
   * og kan kun modregnes i hinanden!
   */

  if (resultat.kapitalindkomst.netto > 0) {
    resultat.kapitalindkomst.skat =
      resultat.kapitalindkomst.netto * SKATTESATSER.KAPITAL_POSITIV;
  } else if (resultat.kapitalindkomst.netto < 0) {
    // Negativ kapitalindkomst giver fradrag (ikke direkte skat-reduktion)
    // Her viser vi fradragsværdien
    resultat.kapitalindkomst.skat =
      resultat.kapitalindkomst.netto * SKATTESATSER.KAPITAL_NEGATIV_FRADRAG;
  }

  // ============================================================
  // 4. BEREGN ASK-SKAT (17% LAGER)
  // ============================================================

  /**
   * AKTIESPAREKONTO (ASK):
   *
   * - Flat 17% lagerbeskatning
   * - Trækkes automatisk fra kontoen hvert år
   * - Maks indskud: 174.200 kr (2025)
   * - Tab isoleret til kontoen (kan IKKE bruges andre steder!)
   * - Ved lukning af kontoen: Tab tabes!
   *
   * EKSEMPEL:
   * Værdi 1/1: 100.000 kr
   * Værdi 31/12: 115.000 kr
   * Gevinst: 15.000 kr
   * Skat: 15.000 × 17% = 2.550 kr (trækkes fra kontoen)
   */

  for (let i = 0; i < kontiMedData.length; i++) {
    const konto = kontiMedData[i].konto;
    const beregning = kontoBeregninger[i];

    if (konto.type === 'ASK' && beregning.lagerbeskatning) {
      resultat.ask = {
        værdiFørste: beregning.lagerbeskatning.værdiFørste,
        værdiSidste: beregning.lagerbeskatning.værdiSidste,
        ændring: beregning.lagerbeskatning.ændring,
        skat17: Math.max(0, beregning.lagerbeskatning.ændring * SKATTESATSER.ASK_SATS),
      };

      // Negativ ASK-skat (tab) gemmes som fremførbart tab på kontoen
      // men reducerer ikke skat andre steder
    }
  }

  // ============================================================
  // 5. BEREGN PAL-SKAT FOR PENSIONER (15,3% LAGER)
  // ============================================================

  /**
   * PENSIONSAFKASTSKAT (PAL):
   *
   * - Flat 15,3% lagerbeskatning
   * - Gælder: Ratepension, aldersopsparing, livrente, kapitalpension
   * - Trækkes automatisk af pensionsselskabet
   * - Tab isoleret til HVER ENKELT pensionskonto
   * - Kan IKKE overføres til ægtefælle
   *
   * VIGTIGT: Hver pension er isoleret!
   * Tab på Nordnet ratepension kan IKKE bruges på PFA aldersopsparing
   */

  const pensionsTyper: KontoType[] = [
    'RATEPENSION',
    'ALDERSOPSPARING',
    'LIVRENTE',
    'KAPITALPENSION',
  ];

  for (let i = 0; i < kontiMedData.length; i++) {
    const konto = kontiMedData[i].konto;
    const beregning = kontoBeregninger[i];

    if (pensionsTyper.includes(konto.type) && beregning.lagerbeskatning) {
      resultat.pensioner.push({
        kontoId: konto.id,
        kontoNavn: konto.navn,
        værdiFørste: beregning.lagerbeskatning.værdiFørste,
        værdiSidste: beregning.lagerbeskatning.værdiSidste,
        ændring: beregning.lagerbeskatning.ændring,
        palSkat15_3: Math.max(0, beregning.lagerbeskatning.ændring * SKATTESATSER.PAL_SATS),
      });
    }
  }

  // ============================================================
  // 6. SUMMER TOTAL SKAT
  // ============================================================

  // Via årsopgørelse (betales selv)
  resultat.viaÅrsopgørelse =
    resultat.aktieindkomst.restskat +
    Math.max(0, resultat.kapitalindkomst.skat);

  // Trækkes automatisk (ASK + pensioner)
  resultat.trækkerAutomatisk =
    (resultat.ask?.skat17 ?? 0) +
    resultat.pensioner.reduce((sum, p) => sum + p.palSkat15_3, 0);

  // Total
  resultat.totalSkat = resultat.viaÅrsopgørelse + resultat.trækkerAutomatisk;

  return resultat;
}

// ============================================================
// HJÆLPEFUNKTIONER TIL UI
// ============================================================

/**
 * Formater beløb til dansk format
 */
export function formatBeløb(beløb: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(beløb);
}

/**
 * Formater procent
 */
export function formatProcent(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

/**
 * Beregn effektiv skatteprocent
 */
export function beregnEffektivSkat(skat: number, indkomst: number): number {
  if (indkomst <= 0) return 0;
  return skat / indkomst;
}
