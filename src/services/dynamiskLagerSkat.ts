/**
 * DYNAMISK LAGERBESKATNING SERVICE
 *
 * Beregner løbende skattepligt på lagerbeskattede aktiver.
 * Viser hvad brugeren skylder i skat ved årsskiftet - uanset om de sælger eller ej.
 *
 * Regler:
 * - ASK: 17% lager, nettes på kontoniveau
 * - Pension: 15,3% PAL, nettes på kontoniveau
 * - Børneopsparing: 0% (skattefri)
 * - Frit depot: Afhænger af aktivtype (aktieindkomst vs. kapitalindkomst)
 *
 * ⚠️ VIGTIG: ASK og pension nettes FØRST, derefter beregnes skat.
 * Per-aktiv skat er kun indikativ!
 */

import type { PortfolioAsset } from './csvParser';
import type {
  DynamiskLagerOversigt,
  DynamiskLagerInput,
  KontoLagerSkat,
  AktivLagerSkat,
  FritDepotLagerOpdeling,
} from '../types/lagerSkat';
import type { AktivType, IndkomstType } from '../types/skat';
import {
  getSatserForÅr,
  klassificerIndkomst,
  beregnSkat,
  KONTO_SKATTEREGLER,
  AKTIV_SKATTEREGLER,
} from '../constants/skatteRegler';

// ============================================================
// HOVEDFUNKTION
// ============================================================

/**
 * Beregner dynamisk lagerbeskatning for alle aktiver i porteføljen.
 *
 * @param aktiver - Portefølje-aktiver fra csvParser eller playgroundAssets
 * @param input - Skatteår, civilstand, og valgfri overrides
 * @returns Komplet oversigt over dynamisk lagerbeskatning
 */
export function beregnDynamiskLagerSkat(
  aktiver: PortfolioAsset[],
  input: DynamiskLagerInput
): DynamiskLagerOversigt {
  const { skatteår, civilstand, primoOverrides, realiseretAktieindkomstIÅret = 0 } = input;
  const erGift = civilstand === 'GIFT';

  // ─────────────────────────────────────────────────────────────
  // TRIN 1: Filtrér og gruppér lagerbeskattede aktiver
  // ─────────────────────────────────────────────────────────────

  const lagerAktiver = filtrerLagerbeskattedeAktiver(aktiver);

  // Gruppér efter konto
  const kontoGrupper = grupperEfterKonto(lagerAktiver);

  // ─────────────────────────────────────────────────────────────
  // TRIN 2: Beregn per konto (ASK, pension, børneopsparing)
  // ─────────────────────────────────────────────────────────────

  const konti: KontoLagerSkat[] = [];
  const fritDepotAktiver: PortfolioAsset[] = [];
  const fremførteTilNæsteÅr: DynamiskLagerOversigt['fremførteTilNæsteÅr'] = [];

  for (const [kontoKey, kontoAktiver] of kontoGrupper) {
    const førsteAktiv = kontoAktiver[0];
    const kontoType = førsteAktiv.kontoType;

    // Frit depot behandles separat (opdeles efter indkomsttype)
    if (kontoType === 'FRIT_DEPOT') {
      fritDepotAktiver.push(...kontoAktiver);
      continue;
    }

    // Beregn konto-lagerbeskatning
    const kontoSkat = beregnKontoLagerSkat(
      kontoKey,
      kontoAktiver,
      skatteår,
      erGift,
      primoOverrides
    );

    konti.push(kontoSkat);

    // Check for fremført tab (negativt beskatningsgrundlag på isoleret konto)
    if (kontoSkat.erIsoleret && kontoSkat.nettetBeskatningsgrundlag < 0) {
      fremførteTilNæsteÅr.push({
        kontoId: kontoSkat.kontoId,
        kontoNavn: kontoSkat.kontoNavn,
        kontoType: kontoSkat.kontoType,
        beløb: Math.abs(kontoSkat.nettetBeskatningsgrundlag),
        note: kontoType === 'ASK'
          ? 'Tab fremføres på ASK. ⚠️ Tabes ved lukning!'
          : 'Tab fremføres på pensionskontoen.',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TRIN 3: Beregn frit depot opdelt efter indkomsttype
  // ─────────────────────────────────────────────────────────────

  const fritDepot = beregnFritDepotLager(
    fritDepotAktiver,
    skatteår,
    erGift,
    realiseretAktieindkomstIÅret,
    primoOverrides
  );

  // ─────────────────────────────────────────────────────────────
  // TRIN 4: Saml totaler
  // ─────────────────────────────────────────────────────────────

  // ASK + pension (automatisk trukket)
  const askPensionKonti = konti.filter(k =>
    k.kontoType === 'ASK' ||
    ['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(k.kontoType)
  );
  const skatAutomatiskTrukket = askPensionKonti.reduce((sum, k) => sum + k.estimeretSkat, 0);

  // Børneopsparing (skattefri)
  const børnekonti = konti.filter(k => k.kontoType === 'BOERNEOPSPARING');
  const skattefriÆndring = børnekonti.reduce((sum, k) => sum + k.samletÆndring, 0);

  // Frit depot lager (via årsopgørelse)
  const skatViaÅrsopgørelse =
    fritDepot.aktieindkomst.estimeretSkat +
    fritDepot.kapitalindkomst.estimeretSkat;

  const samletEstimeretSkat = skatAutomatiskTrukket + skatViaÅrsopgørelse;

  return {
    skatteår,
    civilstand,
    beregnetTidspunkt: new Date(),
    konti,
    fritDepot,
    samletEstimeretSkat,
    skatAutomatiskTrukket,
    skatViaÅrsopgørelse,
    skattefriÆndring,
    fremførteTilNæsteÅr,
  };
}

// ============================================================
// FILTRERING
// ============================================================

/**
 * Filtrér aktiver der er lagerbeskattede.
 *
 * Lagerbeskattede aktiver:
 * - ALLE aktiver på ASK, pension, børneopsparing (kontoen bestemmer)
 * - På frit depot: Kun aktivtyper med beskatningsmetode = 'LAGER'
 */
function filtrerLagerbeskattedeAktiver(aktiver: PortfolioAsset[]): PortfolioAsset[] {
  return aktiver.filter(aktiv => {
    const kontoType = aktiv.kontoType;
    const aktivType = aktiv.aktivType as AktivType;

    // ASK, pension, børneopsparing: ALT er lagerbeskattet
    const kontoRegel = KONTO_SKATTEREGLER[kontoType];
    if (kontoRegel.beskatningsmetode === 'LAGER') {
      return true;
    }

    // Frit depot: Check aktivtype
    if (kontoType === 'FRIT_DEPOT') {
      const aktivRegel = AKTIV_SKATTEREGLER[aktivType];
      return aktivRegel?.beskatningsmetode === 'LAGER';
    }

    return false;
  });
}

/**
 * Gruppér aktiver efter konto (bruger kontoNavn + kontoType som nøgle)
 */
function grupperEfterKonto(aktiver: PortfolioAsset[]): Map<string, PortfolioAsset[]> {
  const grupper = new Map<string, PortfolioAsset[]>();

  for (const aktiv of aktiver) {
    // Brug kontoNavn som primær nøgle, fald tilbage til kontoType
    const key = `${aktiv.kontoType}:${aktiv.kontoNavn || aktiv.kontoType}`;
    const existing = grupper.get(key) || [];
    existing.push(aktiv);
    grupper.set(key, existing);
  }

  return grupper;
}

// ============================================================
// KONTO-BEREGNING (ASK, PENSION, BØRNEOPSPARING)
// ============================================================

/**
 * Beregn lagerbeskatning for én konto (ASK, pension, børneopsparing).
 *
 * ⚠️ VIGTIG: Alle aktiver på kontoen NETTES først, derefter beregnes skat.
 */
function beregnKontoLagerSkat(
  kontoKey: string,
  aktiver: PortfolioAsset[],
  skatteår: number,
  _erGift: boolean,  // Reserveret til fremtidig ægtefælle-logik
  primoOverrides?: Map<string, number>
): KontoLagerSkat {
  const satser = getSatserForÅr(skatteår);
  const førsteAktiv = aktiver[0];
  const kontoType = førsteAktiv.kontoType;
  const kontoNavn = førsteAktiv.kontoNavn || kontoType;

  // Bestem skattesats
  let skattesats = 0;
  let indkomstType: IndkomstType = 'SKATTEFRI';

  if (kontoType === 'ASK') {
    skattesats = satser.ask.sats;
    indkomstType = 'ASK_INDKOMST';
  } else if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(kontoType)) {
    skattesats = satser.pension.palSats;
    indkomstType = 'PAL_INDKOMST';
  } else if (kontoType === 'BOERNEOPSPARING') {
    skattesats = 0;
    indkomstType = 'SKATTEFRI';
  }

  // Beregn per-aktiv (indikativt)
  const aktiverMedSkat: AktivLagerSkat[] = aktiver.map(aktiv => {
    const primo = getPrimo(aktiv, primoOverrides);
    const ændring = aktiv.værdi - primo;
    const estimeretSkat = ændring > 0 ? ændring * skattesats : 0;

    return {
      aktivId: aktiv.id,
      navn: aktiv.navn,
      isin: aktiv.isin,
      kontoType: aktiv.kontoType,
      aktivType: aktiv.aktivType as AktivType,
      primo,
      aktuelVærdi: aktiv.værdi,
      ændring,
      skattesats,
      indkomstType,
      beskatningsmetode: 'LAGER' as const,
      estimeretSkat,
      note: 'Indikativ skat - kontoen nettes',
    };
  });

  // Beregn konto-totaler (NETTING)
  const samletPrimo = aktiverMedSkat.reduce((sum, a) => sum + a.primo, 0);
  const samletAktuelVærdi = aktiverMedSkat.reduce((sum, a) => sum + a.aktuelVærdi, 0);
  const samletÆndring = aktiverMedSkat.reduce((sum, a) => sum + a.ændring, 0);

  // Nettet beskatningsgrundlag (kan være negativt)
  const nettetBeskatningsgrundlag = samletÆndring;

  // Skat af nettet resultat (negativt → 0 skat, fremføres)
  const estimeretSkat = nettetBeskatningsgrundlag > 0
    ? nettetBeskatningsgrundlag * skattesats
    : 0;

  const erIsoleret = kontoType === 'ASK' ||
    ['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(kontoType);

  return {
    kontoId: kontoKey,
    kontoNavn,
    kontoType,
    samletPrimo,
    samletAktuelVærdi,
    samletÆndring,
    nettetBeskatningsgrundlag,
    estimeretSkat,
    skattesats,
    aktiver: aktiverMedSkat,
    erIsoleret,
    erLagerbeskattet: true,
    note: erIsoleret
      ? 'Tab nettes internt på kontoen. Negativt resultat fremføres.'
      : undefined,
  };
}

// ============================================================
// FRIT DEPOT BEREGNING
// ============================================================

/**
 * Beregn lagerbeskatning for frit depot, opdelt efter indkomsttype.
 *
 * Aktieindkomst-lager: ETF positivliste, akkumulerende inv.foreninger
 * Kapitalindkomst-lager: ETF ikke-positivliste, obligationsbaseret, finansielle kontrakter
 */
function beregnFritDepotLager(
  aktiver: PortfolioAsset[],
  skatteår: number,
  erGift: boolean,
  realiseretAktieindkomstIÅret: number,
  primoOverrides?: Map<string, number>
): FritDepotLagerOpdeling {
  const satser = getSatserForÅr(skatteår);

  // Opdel efter indkomsttype
  const aktieindkomstAktiver: PortfolioAsset[] = [];
  const kapitalindkomstAktiver: PortfolioAsset[] = [];

  for (const aktiv of aktiver) {
    const indkomstType = klassificerIndkomst('FRIT_DEPOT', aktiv.aktivType as AktivType);
    if (indkomstType === 'AKTIEINDKOMST') {
      aktieindkomstAktiver.push(aktiv);
    } else if (indkomstType === 'KAPITALINDKOMST') {
      kapitalindkomstAktiver.push(aktiv);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // AKTIEINDKOMST-LAGER
  // ─────────────────────────────────────────────────────────────

  const aktieAktiver: AktivLagerSkat[] = aktieindkomstAktiver.map(aktiv => {
    const primo = getPrimo(aktiv, primoOverrides);
    const ændring = aktiv.værdi - primo;

    return {
      aktivId: aktiv.id,
      navn: aktiv.navn,
      isin: aktiv.isin,
      kontoType: 'FRIT_DEPOT',
      aktivType: aktiv.aktivType as AktivType,
      primo,
      aktuelVærdi: aktiv.værdi,
      ændring,
      skattesats: 0, // Beregnes samlet
      indkomstType: 'AKTIEINDKOMST',
      beskatningsmetode: 'LAGER' as const,
      estimeretSkat: 0, // Beregnes samlet med progression
    };
  });

  const samletAktieÆndring = aktieAktiver.reduce((sum, a) => sum + a.ændring, 0);

  // Beregn skat med progression (inkl. evt. realiseret aktieindkomst)
  let aktieSkat = 0;
  let under27pctBeløb = 0;
  let over42pctBeløb = 0;

  if (samletAktieÆndring > 0) {
    const skatBeregning = beregnSkat(
      'FRIT_DEPOT',
      'AKTIEINDKOMST',
      samletAktieÆndring,
      skatteår,
      erGift,
      realiseretAktieindkomstIÅret
    );
    aktieSkat = skatBeregning.skat;
    under27pctBeløb = skatBeregning.detaljer.lavSkatBeløb || 0;
    over42pctBeløb = skatBeregning.detaljer.højSkatBeløb || 0;
  }

  // Opdater per-aktiv med indikativ skat
  const effektivAktieSats = samletAktieÆndring > 0 ? aktieSkat / samletAktieÆndring : 0;
  for (const aktiv of aktieAktiver) {
    aktiv.skattesats = effektivAktieSats;
    aktiv.estimeretSkat = aktiv.ændring > 0 ? aktiv.ændring * effektivAktieSats : 0;
    aktiv.note = 'Progressiv aktieindkomst (27%/42%)';
  }

  // ─────────────────────────────────────────────────────────────
  // KAPITALINDKOMST-LAGER
  // ─────────────────────────────────────────────────────────────

  const kapitalAktiver: AktivLagerSkat[] = kapitalindkomstAktiver.map(aktiv => {
    const primo = getPrimo(aktiv, primoOverrides);
    const ændring = aktiv.værdi - primo;

    return {
      aktivId: aktiv.id,
      navn: aktiv.navn,
      isin: aktiv.isin,
      kontoType: 'FRIT_DEPOT',
      aktivType: aktiv.aktivType as AktivType,
      primo,
      aktuelVærdi: aktiv.værdi,
      ændring,
      skattesats: 0, // Beregnes individuelt
      indkomstType: 'KAPITALINDKOMST',
      beskatningsmetode: 'LAGER' as const,
      estimeretSkat: 0,
    };
  });

  const samletKapitalÆndring = kapitalAktiver.reduce((sum, a) => sum + a.ændring, 0);
  const erTab = samletKapitalÆndring < 0;

  // Beregn skat (asymmetrisk: gevinst ~37%, tab ~33%/~25%)
  let kapitalSkat = 0;
  let fradragsværdi: number | undefined;

  if (samletKapitalÆndring !== 0) {
    const skatBeregning = beregnSkat(
      'FRIT_DEPOT',
      'KAPITALINDKOMST',
      samletKapitalÆndring,
      skatteår,
      erGift
    );
    kapitalSkat = skatBeregning.skat;

    if (erTab) {
      fradragsværdi = Math.abs(kapitalSkat);
    }
  }

  // Opdater per-aktiv med skat
  for (const aktiv of kapitalAktiver) {
    if (aktiv.ændring > 0) {
      aktiv.skattesats = satser.kapitalindkomst.gevinstSats;
      aktiv.estimeretSkat = aktiv.ændring * satser.kapitalindkomst.gevinstSats;
      aktiv.note = 'Kapitalindkomst ~37%';
    } else if (aktiv.ændring < 0) {
      // Fradragsværdi (asymmetrisk)
      const absÆndring = Math.abs(aktiv.ændring);
      const underGrænse = Math.min(
        absÆndring,
        erGift ? satser.kapitalindkomst.psl11GrænseÆgtepar : satser.kapitalindkomst.psl11Grænse
      );
      const overGrænse = Math.max(0, absÆndring - underGrænse);
      const fradrag =
        underGrænse * satser.kapitalindkomst.tabFradragsværdiUnderGrænse +
        overGrænse * satser.kapitalindkomst.tabFradragsværdiOverGrænse;
      aktiv.estimeretSkat = -fradrag;
      aktiv.skattesats = fradrag / absÆndring;
      aktiv.note = 'Kapitalindkomst fradrag ~33%/~25%';
    }
  }

  return {
    aktieindkomst: {
      aktiver: aktieAktiver,
      samletÆndring: samletAktieÆndring,
      estimeretSkat: aktieSkat,
      under27pctBeløb,
      over42pctBeløb,
    },
    kapitalindkomst: {
      aktiver: kapitalAktiver,
      samletÆndring: samletKapitalÆndring,
      estimeretSkat: kapitalSkat,
      erTab,
      fradragsværdi,
    },
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Hent primo-værdi for et aktiv.
 *
 * Prioritet:
 * 1. primoOverrides (manuelt sat)
 * 2. antal × anskaffelseskurs (default)
 */
function getPrimo(aktiv: PortfolioAsset, primoOverrides?: Map<string, number>): number {
  if (primoOverrides?.has(aktiv.id)) {
    return primoOverrides.get(aktiv.id)!;
  }
  // Default: anskaffelsessum
  return aktiv.antal * aktiv.anskaffelseskurs;
}

/**
 * Formatér beløb til dansk format
 */
export function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

/**
 * Formatér procent
 */
export function formatPct(n: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
}

// ============================================================
// TEST FUNKTION
// ============================================================

/**
 * Test med playground-data
 *
 * Kør i browser console:
 * import { testDynamiskLagerSkat } from './services/dynamiskLagerSkat';
 * testDynamiskLagerSkat();
 */
export function testDynamiskLagerSkat(): void {
  // Importér dynamisk for at undgå cirkulær dependency
  import('../data/playgroundAssets').then(({ PLAYGROUND_ASSETS }) => {
    console.log('=== TEST: Dynamisk Lagerbeskatning ===\n');

    const resultat = beregnDynamiskLagerSkat(PLAYGROUND_ASSETS, {
      skatteår: 2025,
      civilstand: 'ENLIG',
    });

    console.log('Skatteår:', resultat.skatteår);
    console.log('Civilstand:', resultat.civilstand);
    console.log('Beregnet:', resultat.beregnetTidspunkt.toLocaleString('da-DK'));
    console.log('');

    // Konti (ASK, pension, børneopsparing)
    console.log('=== KONTI ===');
    for (const konto of resultat.konti) {
      console.log(`\n${konto.kontoNavn} (${konto.kontoType}):`);
      console.log(`  Primo: ${formatKr(konto.samletPrimo)} kr`);
      console.log(`  Aktuel: ${formatKr(konto.samletAktuelVærdi)} kr`);
      console.log(`  Ændring: ${formatKr(konto.samletÆndring)} kr`);
      console.log(`  Nettet grundlag: ${formatKr(konto.nettetBeskatningsgrundlag)} kr`);
      console.log(`  Estimeret skat (${formatPct(konto.skattesats)}): ${formatKr(konto.estimeretSkat)} kr`);
      console.log(`  Aktiver: ${konto.aktiver.length}`);
    }

    // Frit depot
    console.log('\n=== FRIT DEPOT - LAGERBESKATTET ===');

    console.log('\nAktieindkomst (positivliste-ETF, akk. fonde):');
    console.log(`  Aktiver: ${resultat.fritDepot.aktieindkomst.aktiver.length}`);
    console.log(`  Samlet ændring: ${formatKr(resultat.fritDepot.aktieindkomst.samletÆndring)} kr`);
    console.log(`  Under 27%: ${formatKr(resultat.fritDepot.aktieindkomst.under27pctBeløb)} kr`);
    console.log(`  Over 42%: ${formatKr(resultat.fritDepot.aktieindkomst.over42pctBeløb)} kr`);
    console.log(`  Estimeret skat: ${formatKr(resultat.fritDepot.aktieindkomst.estimeretSkat)} kr`);

    console.log('\nKapitalindkomst (ETF ikke-positivliste, obligationer):');
    console.log(`  Aktiver: ${resultat.fritDepot.kapitalindkomst.aktiver.length}`);
    console.log(`  Samlet ændring: ${formatKr(resultat.fritDepot.kapitalindkomst.samletÆndring)} kr`);
    console.log(`  Er tab: ${resultat.fritDepot.kapitalindkomst.erTab}`);
    if (resultat.fritDepot.kapitalindkomst.fradragsværdi) {
      console.log(`  Fradragsværdi: ${formatKr(resultat.fritDepot.kapitalindkomst.fradragsværdi)} kr`);
    }
    console.log(`  Estimeret skat: ${formatKr(resultat.fritDepot.kapitalindkomst.estimeretSkat)} kr`);

    // Totaler
    console.log('\n=== TOTALER ===');
    console.log(`Skat automatisk trukket (ASK+pension): ${formatKr(resultat.skatAutomatiskTrukket)} kr`);
    console.log(`Skat via årsopgørelse (frit depot): ${formatKr(resultat.skatViaÅrsopgørelse)} kr`);
    console.log(`Skattefri ændring (børneopsp.): ${formatKr(resultat.skattefriÆndring)} kr`);
    console.log(`\nSAMLET ESTIMERET LAGERSKAT: ${formatKr(resultat.samletEstimeretSkat)} kr`);

    // Fremførte tab
    if (resultat.fremførteTilNæsteÅr.length > 0) {
      console.log('\n=== FREMFØRTE TAB ===');
      for (const tab of resultat.fremførteTilNæsteÅr) {
        console.log(`${tab.kontoNavn}: ${formatKr(tab.beløb)} kr - ${tab.note}`);
      }
    }

    console.log('\n=== TEST AFSLUTTET ===');
  });
}
