/**
 * AUDIT PANEL
 *
 * Viser den valgte sti med lovhenvisninger og eksport-mulighed.
 */

import { useMemo, useState } from 'react';
import type { KontoType, AktivType, TabsPulje, KapitalindkomstSaldo } from '../types/skat';
import { SKATTESATSER, AKTIV_SKATTEREGLER, KONTO_SKATTEREGLER, MODREGNING_REGLER, getSatserForÅr, beregnKapitalindkomstFradrag } from '../constants/skatteRegler';
import { LOVTEKST_CITATER, LOVE, SKAT_DK } from '../constants/lovhenvisninger';
import type { FlowSelection } from './InteractiveFlowChart';
import type { Transaktion } from './TransaktionsPanel';

// ============================================================
// TYPES
// ============================================================

interface AuditPanelProps {
  selection: FlowSelection;
  erGift: boolean;
  skatteår: number;
  transaktioner?: Transaktion[];
  kapitalIndkomstSaldo?: KapitalindkomstSaldo;
}

interface AuditStep {
  nummer: number;
  titel: string;
  værdi: string;
  detaljer: string[];
  lovref: string;
  lovtekst?: string;
  links: { label: string; url: string }[];
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getKontoNavn(konto: KontoType): string {
  const navne: Record<KontoType, string> = {
    FRIT_DEPOT: 'Frit Depot',
    ASK: 'Aktiesparekonto (ASK)',
    BOERNEOPSPARING: 'Børneopsparing',
    RATEPENSION: 'Ratepension',
    ALDERSOPSPARING: 'Aldersopsparing',
    LIVRENTE: 'Livrente',
    KAPITALPENSION: 'Kapitalpension',
  };
  return navne[konto] || konto;
}

function getAktivNavn(aktiv: AktivType): string {
  const navne: Record<AktivType, string> = {
    AKTIE_DK: 'Dansk aktie',
    AKTIE_UDENLANDSK: 'Udenlandsk aktie',
    AKTIE_UNOTERET: 'Unoteret aktie',
    ETF_POSITIVLISTE: 'ETF (positivliste)',
    ETF_IKKE_POSITIVLISTE: 'ETF (ikke positivliste)',
    ETF_OBLIGATIONSBASERET: 'ETF (obligationsbaseret)',
    INVF_UDBYTTEBETALTENDE: 'Investeringsforening (udloddende)',
    INVF_AKKUMULERENDE: 'Investeringsforening (akkumulerende)',
    INVF_AKKUMULERENDE_KAPITAL: 'Investeringsforening akkumulerende (kapital)',
    BLANDET_FOND_AKTIE: 'Blandet fond (>50% aktier)',
    BLANDET_FOND_OBLIGATION: 'Blandet fond (>50% obligationer)',
    OBLIGATION: 'Direkte obligation',
    FINANSIEL_KONTRAKT: 'Finansiel kontrakt (option/CFD/future)',
  };
  return navne[aktiv] || aktiv;
}

function getPuljeNavn(pulje: TabsPulje): string {
  const navne: Record<TabsPulje, string> = {
    NOTERET_AKTIE: 'Noterede aktier',
    UNOTERET_AKTIE: 'Unoterede aktier',
    KAPITAL_GENEREL: 'Kapitalindkomst (generel)',
    FINANSIEL_KONTRAKT: 'Finansielle kontrakter',
    ASK_ISOLERET: 'ASK (isoleret)',
    PENSION_ISOLERET: 'Pension (isoleret)',
  };
  return navne[pulje] || pulje;
}

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n) + ' kr';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AuditPanel({ selection, erGift, skatteår, transaktioner = [], kapitalIndkomstSaldo }: AuditPanelProps) {
  const [kopieretTekst, setKopieretTekst] = useState<string | null>(null);

  const { konto, aktiv } = selection;

  // Hent dynamiske satser for skatteåret
  const satser = getSatserForÅr(skatteår);

  // Filtrer transaktioner for valgte skatteår
  const årsTransaktioner = useMemo(() => {
    return transaktioner.filter(t => t.år === skatteår);
  }, [transaktioner, skatteår]);

  // Find alle unikke aktivtyper handlet i året
  const handledeAktivTyper = useMemo(() => {
    const typer = new Map<string, { aktivType: AktivType; gevinst: number; tab: number; antal: number }>();

    årsTransaktioner.forEach(t => {
      const existing = typer.get(t.aktivType) || { aktivType: t.aktivType as AktivType, gevinst: 0, tab: 0, antal: 0 };
      if (t.gevinstTab >= 0) {
        existing.gevinst += t.gevinstTab;
      } else {
        existing.tab += Math.abs(t.gevinstTab);
      }
      existing.antal += 1;
      typer.set(t.aktivType, existing);
    });

    return Array.from(typer.values());
  }, [årsTransaktioner]);

  // Beregn afledte værdier
  const kontoRegler = konto ? KONTO_SKATTEREGLER[konto] : null;
  const aktivRegler = aktiv ? AKTIV_SKATTEREGLER[aktiv] : null;

  // Bestem tabspulje
  let tabsPulje: TabsPulje | null = null;
  if (konto && aktiv) {
    if (konto === 'ASK') {
      tabsPulje = 'ASK_ISOLERET';
    } else if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto)) {
      tabsPulje = 'PENSION_ISOLERET';
    } else {
      tabsPulje = aktivRegler?.tabspulje ?? null;
    }
  }

  const modregningRegler = tabsPulje ? MODREGNING_REGLER[tabsPulje] : null;

  // Progressionsgrænse (dynamisk baseret på skatteår)
  const progressionsgrænse = erGift
    ? satser.aktieindkomst.grænseGift
    : satser.aktieindkomst.grænseEnlig;

  // Byg audit trail
  const auditSteps = useMemo<AuditStep[]>(() => {
    const steps: AuditStep[] = [];

    // Trin 1: Kontotype
    if (konto) {
      const sats = konto === 'BOERNEOPSPARING' ? '0%' :
                   konto === 'ASK' ? '17%' :
                   ['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto) ? '15,3%' :
                   '27%/42%';

      let lovref = 'PSL § 8a';
      let lovtekst = LOVTEKST_CITATER['PSL_8a_stk1']?.citat;
      const links: { label: string; url: string }[] = [];

      if (konto === 'ASK') {
        lovref = 'ASKL § 13';
        lovtekst = LOVTEKST_CITATER['ASKL_13']?.citat;
        links.push({ label: 'SKAT.dk: Aktiesparekonto', url: SKAT_DK.ask.url });
        links.push({ label: 'Aktiesparekontoloven', url: LOVE.ASKL.baseUrl });
      } else if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto)) {
        lovref = 'PAL § 2';
        lovtekst = LOVTEKST_CITATER['PAL_2']?.citat;
        links.push({ label: 'SKAT.dk: Pension', url: SKAT_DK.palSkat.url });
        links.push({ label: 'Pensionsafkastbeskatningsloven', url: LOVE.PAL.baseUrl });
      } else if (konto === 'BOERNEOPSPARING') {
        lovref = 'PBL § 51';
        lovtekst = LOVTEKST_CITATER['PBL_51']?.citat;
        links.push({ label: 'SKAT.dk: Børneopsparing', url: SKAT_DK.boerneopsparing.url });
      } else {
        links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
        links.push({ label: 'Personskatteloven', url: LOVE.PSL.baseUrl });
      }

      // Byg detaljer baseret på kontotype
      const kontoDetaljer: string[] = [
        `Skattesats: ${sats}`,
        `Beskatningsmetode: ${kontoRegler?.beskatningsmetode || 'N/A'}`,
      ];

      // Børneopsparing er skattefri - tab/gevinst er irrelevant
      if (konto === 'BOERNEOPSPARING') {
        kontoDetaljer.push('Tab/gevinst: IRRELEVANT (skattefri)');
        kontoDetaljer.push('Max indskud: 6.000 kr/år (72.000 kr total)');
      } else {
        kontoDetaljer.push(`Tab isoleret: ${kontoRegler?.isoleret ? 'JA (kun denne konto)' : 'NEJ (samles på CPR-niveau)'}`);
      }

      steps.push({
        nummer: 1,
        titel: 'KONTOTYPE',
        værdi: getKontoNavn(konto),
        detaljer: kontoDetaljer,
        lovref,
        lovtekst,
        links,
      });
    }

    // Trin 2+: HANDLEDE AKTIVTYPER - Alle aktivtyper handlet i skatteåret
    // Vises FØR den valgte aktivtype, så brugeren ser alle sine handler
    if (handledeAktivTyper.length > 0) {
      let stepNummer = 2;

      handledeAktivTyper.forEach((item) => {
        const regler = AKTIV_SKATTEREGLER[item.aktivType];
        const aktivNavn = getAktivNavn(item.aktivType);
        const links: { label: string; url: string }[] = [];
        let lovref = 'ABL § 12';
        let lovtekst = LOVTEKST_CITATER['ABL_12']?.citat;

        const aktivDetaljer: string[] = [
          `Antal handler i ${skatteår}: ${item.antal}`,
        ];
        if (item.gevinst > 0) aktivDetaljer.push(`Samlet gevinst: +${formatKr(item.gevinst)}`);
        if (item.tab > 0) aktivDetaljer.push(`Samlet tab: -${formatKr(item.tab)}`);
        aktivDetaljer.push(`Indkomsttype: ${regler?.indkomsttype || 'N/A'}`);
        aktivDetaljer.push(`Beskatningsprincip: ${regler?.beskatningsmetode || 'N/A'}`);
        aktivDetaljer.push(`Tabspulje: ${regler?.tabspulje ? getPuljeNavn(regler.tabspulje) : 'Ingen (kapitalindkomst)'}`);

        // Tilføj specifikke tabsregler baseret på aktivtype
        if (item.aktivType === 'AKTIE_DK' || item.aktivType === 'AKTIE_UDENLANDSK') {
          lovref = 'ABL § 12 + § 13A';
          aktivDetaljer.push('─────────────────────────────');
          aktivDetaljer.push('TABSREGLER (ABL § 13A):');
          aktivDetaljer.push('→ Tab er KILDEARTSBEGRÆNSET');
          aktivDetaljer.push('→ Kan KUN modregnes i: noterede aktier, positivliste-ETF, udbytter');
          aktivDetaljer.push('→ Kan IKKE bruges mod unoterede aktier');
          aktivDetaljer.push('→ Ægtefælle: OBLIGATORISK overførsel hvis egen gevinst ikke dækker');
          aktivDetaljer.push('→ Fremførsel: Ubegrænset (tabsbank)');
          links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
          links.push({ label: 'SKAT.dk: Tabsfradrag', url: SKAT_DK.tabsfradrag.url });
        } else if (item.aktivType === 'AKTIE_UNOTERET') {
          lovref = 'ABL § 12 + § 13';
          lovtekst = LOVTEKST_CITATER['ABL_13']?.citat;
          aktivDetaljer.push('─────────────────────────────');
          aktivDetaljer.push('TABSREGLER (ABL § 13):');
          aktivDetaljer.push('→ Tab er IKKE kildeartsbegrænset');
          aktivDetaljer.push('→ Kan modregnes i AL aktieindkomst (inkl. noterede, udbytter, positivliste)');
          aktivDetaljer.push('→ Negativ aktieindkomst giver skatteværdi i slutskat');
          aktivDetaljer.push('→ Ægtefælle: Valgfri overførsel');
          aktivDetaljer.push('→ Fremførsel: Ubegrænset (tabsbank)');
          links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
          links.push({ label: 'SKAT.dk: Tabsfradrag', url: SKAT_DK.tabsfradrag.url });
        } else if (item.aktivType === 'FINANSIEL_KONTRAKT') {
          lovref = 'KGL § 29 + § 32';
          lovtekst = LOVTEKST_CITATER['KGL_29']?.citat;
          aktivDetaljer.push('─────────────────────────────');
          aktivDetaljer.push('TABSREGLER (KGL § 32):');
          aktivDetaljer.push('→ Tab er KILDEARTSBEGRÆNSET (isoleret tabspool)');
          aktivDetaljer.push('→ Kan KUN modregnes i andre finansielle kontrakter');
          aktivDetaljer.push('→ Kan IKKE bruges mod aktier, ETF\'er eller andet');
          aktivDetaljer.push('→ Ægtefælle: KAN overføre tab (KGL § 32 stk. 2)');
          aktivDetaljer.push('→ Fremførsel: Ubegrænset');
          links.push({ label: 'Kursgevinstloven', url: LOVE.KGL.baseUrl });
        } else if (regler?.indkomsttype === 'KAPITALINDKOMST') {
          const psl11 = erGift ? SKATTESATSER.PSL11_GRÆNSE_ÆGTEPAR : SKATTESATSER.PSL11_GRÆNSE_ENLIG;
          lovref = 'PSL § 4 + § 11';
          lovtekst = 'Kapitalindkomst omfatter det samlede nettobeløb af renteindtægter, renteudgifter, skattepligtige kursgevinster og kurstab mv.';
          aktivDetaljer.push('─────────────────────────────');
          aktivDetaljer.push('TABSREGLER (PSL § 11):');
          aktivDetaljer.push('→ ⚠️ INGEN TABSBANK!');
          aktivDetaljer.push(`→ Tab modregnes øjeblikkeligt i årets netto kapitalindkomst (ingen fremførsel)`);
          aktivDetaljer.push(`→ Fradrag ~33% op til ${formatKr(psl11)} (= 25% kommuneskat + 8% nedslag)`);
          aktivDetaljer.push(`→ Fradrag ~25% over ${formatKr(psl11)} (kun kommuneskat)`);
          aktivDetaljer.push('→ ⚠️ Sælg gevinster SAMME år som tab!');
          links.push({ label: 'SKAT.dk: Kapitalindkomst', url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/kapitalindkomst' });
        } else if (item.aktivType.includes('ETF') || item.aktivType.includes('INVF')) {
          lovref = 'ABL § 19';
          lovtekst = LOVTEKST_CITATER['ABL_19']?.citat;
          if (regler?.tabspulje === 'NOTERET_AKTIE') {
            aktivDetaljer.push('─────────────────────────────');
            aktivDetaljer.push('TABSREGLER (ABL § 13A):');
            aktivDetaljer.push('→ Tab er KILDEARTSBEGRÆNSET');
            aktivDetaljer.push('→ Behandles som noteret aktie i tabsbank');
            aktivDetaljer.push('→ Fremførsel: Ubegrænset');
          }
          links.push({ label: 'SKAT.dk: ETF og inv.foreninger', url: SKAT_DK.etf.url });
          links.push({ label: 'Skats positivliste', url: SKAT_DK.positivliste.url });
        } else {
          links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
        }

        links.push({ label: 'Aktieavancebeskatningsloven', url: LOVE.ABL.baseUrl });

        steps.push({
          nummer: stepNummer,
          titel: `AKTIVTYPE: ${aktivNavn}`,
          værdi: `${item.antal} handler`,
          detaljer: aktivDetaljer,
          lovref,
          lovtekst,
          links,
        });

        stepNummer++;
      });
    }

    // Trin X: Valgt aktivtype fra flowchart (kun hvis ingen handler og en aktivtype er valgt)
    if (handledeAktivTyper.length === 0 && aktiv) {
      const links: { label: string; url: string }[] = [];
      let lovref = 'ABL § 12';
      let lovtekst = LOVTEKST_CITATER['ABL_12']?.citat;
      const aktivDetaljer: string[] = [
        `Indkomsttype: ${aktivRegler?.indkomsttype || 'N/A'}`,
        `Beskatningsprincip: ${aktivRegler?.beskatningsmetode || 'N/A'}`,
        `Tabspulje: ${aktivRegler?.tabspulje ? getPuljeNavn(aktivRegler.tabspulje) : 'N/A'}`,
      ];

      // Noterede aktier (AKTIE_DK, AKTIE_UDENLANDSK)
      if (aktiv === 'AKTIE_DK' || aktiv === 'AKTIE_UDENLANDSK') {
        lovref = 'ABL § 12 + § 13A';
        lovtekst = LOVTEKST_CITATER['ABL_12']?.citat;
        aktivDetaljer.push('─────────────────────────────');
        aktivDetaljer.push('TABSREGLER (ABL § 13A):');
        aktivDetaljer.push('→ Tab er KILDEARTSBEGRÆNSET');
        aktivDetaljer.push('→ Kan KUN modregnes i: noterede aktier, positivliste-ETF, udbytter');
        aktivDetaljer.push('→ Kan IKKE bruges mod unoterede aktier');
        aktivDetaljer.push('→ Ægtefælle: OBLIGATORISK overførsel hvis egen gevinst ikke dækker');
        aktivDetaljer.push('→ Fremførsel: Ubegrænset (tabsbank)');
        links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
        links.push({ label: 'SKAT.dk: Tabsfradrag', url: SKAT_DK.tabsfradrag.url });
      }
      // Unoterede aktier (AKTIE_UNOTERET)
      else if (aktiv === 'AKTIE_UNOTERET') {
        lovref = 'ABL § 12 + § 13';
        lovtekst = LOVTEKST_CITATER['ABL_13']?.citat;
        aktivDetaljer.push('─────────────────────────────');
        aktivDetaljer.push('TABSREGLER (ABL § 13):');
        aktivDetaljer.push('→ Tab er IKKE kildeartsbegrænset');
        aktivDetaljer.push('→ Kan modregnes i AL aktieindkomst (inkl. noterede, udbytter, positivliste)');
        aktivDetaljer.push('→ Negativ aktieindkomst giver skatteværdi i slutskat');
        aktivDetaljer.push('→ Ægtefælle: Valgfri overførsel');
        aktivDetaljer.push('→ Fremførsel: Ubegrænset (tabsbank)');
        links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
        links.push({ label: 'SKAT.dk: Tabsfradrag', url: SKAT_DK.tabsfradrag.url });
      }
      // ETF'er og investeringsforeninger
      else if (aktiv.includes('ETF') || aktiv.includes('INVF')) {
        lovref = 'ABL § 19';
        lovtekst = LOVTEKST_CITATER['ABL_19']?.citat;
        links.push({ label: 'SKAT.dk: ETF og inv.foreninger', url: SKAT_DK.etf.url });
        links.push({ label: 'Skats positivliste', url: SKAT_DK.positivliste.url });
      }
      // Finansielle kontrakter
      else if (aktiv === 'FINANSIEL_KONTRAKT') {
        lovref = 'KGL § 29 + § 32';
        lovtekst = LOVTEKST_CITATER['KGL_29']?.citat;
        aktivDetaljer.push('─────────────────────────────');
        aktivDetaljer.push('TABSREGLER (KGL § 32):');
        aktivDetaljer.push('→ Tab er KILDEARTSBEGRÆNSET (isoleret tabspool)');
        aktivDetaljer.push('→ Kan KUN modregnes i andre finansielle kontrakter');
        aktivDetaljer.push('→ Kan IKKE bruges mod aktier, ETF\'er eller andet');
        aktivDetaljer.push('→ Ægtefælle: KAN overføre tab (KGL § 32 stk. 2)');
        aktivDetaljer.push('→ Fremførsel: Ubegrænset');
        links.push({ label: 'Kursgevinstloven', url: LOVE.KGL.baseUrl });
      }
      // Andre aktivtyper
      else {
        links.push({ label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url });
      }

      links.push({ label: 'Aktieavancebeskatningsloven', url: LOVE.ABL.baseUrl });

      steps.push({
        nummer: 2,
        titel: 'AKTIVTYPE',
        værdi: getAktivNavn(aktiv),
        detaljer: aktivDetaljer,
        lovref,
        lovtekst,
        links,
      });
    }

    // Beregn base step nummer efter aktivtype-steps
    // 1 = konto, derefter kommer aktivtype-steps (antal = handledeAktivTyper.length eller 1 hvis ingen handler men valgt aktiv)
    const aktivStepsCount = handledeAktivTyper.length > 0 ? handledeAktivTyper.length : (aktiv ? 1 : 0);
    const nextStepAfterAktiv = 2 + aktivStepsCount;

    // Trin X: Klassificering
    // OBS: Klassificering er KUN relevant for Frit Depot
    // For ASK, børneopsparing og pension har kontotypen sin egen faste sats
    if (konto && aktiv) {
      if (konto === 'FRIT_DEPOT' && aktivRegler) {
        // Frit Depot: Aktie- eller kapitalindkomst afhængig af aktivtype
        const isAktie = aktivRegler.indkomsttype === 'AKTIEINDKOMST';
        const psl11Grænse = erGift ? SKATTESATSER.PSL11_GRÆNSE_ÆGTEPAR : SKATTESATSER.PSL11_GRÆNSE_ENLIG;
        const lovtekst = isAktie
          ? LOVTEKST_CITATER['PSL_8a_stk1']?.citat
          : 'Negativ nettokapitalindkomst giver fradrag i kommuneskat (~25%) samt et nedslag på 8% for beløb op til ' + formatKr(psl11Grænse) + '.';

        steps.push({
          nummer: nextStepAfterAktiv,
          titel: 'KLASSIFICERING',
          værdi: aktivRegler.indkomsttype,
          detaljer: isAktie ? [
            `27% op til ${formatKr(progressionsgrænse)}`,
            `42% over ${formatKr(progressionsgrænse)}`,
            `Civilstand: ${erGift ? 'Gift (dobbelt grænse)' : 'Enlig'}`,
          ] : [
            `Gevinst beskattes: ~37%`,
            `Tab fradragsværdi: ~33% (op til ${formatKr(psl11Grænse)})`,
            `Tab fradragsværdi: ~25% (over ${formatKr(psl11Grænse)})`,
            `Civilstand: ${erGift ? 'Gift' : 'Enlig'}`,
            `PSL § 11 grænse: ${formatKr(psl11Grænse)}`,
            `⚠️ ASYMMETRISK: Gevinst ~37%, tab kun ~33% fradrag`,
            `⚠️ INGEN tabsbank - tab forbruges straks`,
          ],
          lovref: isAktie ? 'PSL § 8a' : 'PSL § 4 + PSL § 11',
          lovtekst,
          links: isAktie ? [
            { label: 'Personskatteloven', url: LOVE.PSL.baseUrl },
          ] : [
            { label: 'PSL § 11 (negativ kapitalindkomst)', url: 'https://danskelove.dk/personskatteloven/11' },
            { label: 'SKAT.dk: Kapitalindkomst', url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer' },
          ],
        });
      } else if (konto === 'ASK') {
        // ASK: Klassificering er irrelevant - 17% på alt
        steps.push({
          nummer: nextStepAfterAktiv,
          titel: 'KLASSIFICERING',
          værdi: 'IKKE RELEVANT (ASK)',
          detaljer: [
            'ASK beskattes med 17% uanset aktivtype',
            'Klassificering som aktie-/kapitalindkomst gælder IKKE',
            'Alle aktiver i ASK lagerbeskattes med samme sats',
          ],
          lovref: 'ASKL § 13',
          lovtekst: LOVTEKST_CITATER['ASKL_13']?.citat,
          links: [
            { label: 'SKAT.dk: Aktiesparekonto', url: SKAT_DK.ask.url },
            { label: 'Aktiesparekontoloven', url: LOVE.ASKL.baseUrl },
          ],
        });
      } else if (konto === 'BOERNEOPSPARING') {
        // Børneopsparing: Klassificering er irrelevant - skattefri
        steps.push({
          nummer: nextStepAfterAktiv,
          titel: 'KLASSIFICERING',
          værdi: 'IKKE RELEVANT (SKATTEFRI)',
          detaljer: [
            'Børneopsparing er skattefri uanset aktivtype',
            'Klassificering som aktie-/kapitalindkomst gælder IKKE',
            'Ingen skat på gevinst, tab eller udbytte',
          ],
          lovref: 'PBL § 51',
          lovtekst: LOVTEKST_CITATER['PBL_51']?.citat,
          links: [
            { label: 'SKAT.dk: Børneopsparing', url: SKAT_DK.palSkat.url },
          ],
        });
      } else if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto)) {
        // Pension: Klassificering er irrelevant - 15,3% PAL på alt
        steps.push({
          nummer: nextStepAfterAktiv,
          titel: 'KLASSIFICERING',
          værdi: 'IKKE RELEVANT (PENSION)',
          detaljer: [
            'Pension beskattes med 15,3% PAL uanset aktivtype',
            'Klassificering som aktie-/kapitalindkomst gælder IKKE',
            'Alle aktiver lagerbeskattes med PAL-sats',
          ],
          lovref: 'PAL § 2',
          lovtekst: LOVTEKST_CITATER['PAL_2']?.citat,
          links: [
            { label: 'SKAT.dk: Pension', url: SKAT_DK.palSkat.url },
            { label: 'Pensionsafkastbeskatningsloven', url: LOVE.PAL.baseUrl },
          ],
        });
      }
    }

    // Trin 4: Skatteberegning
    if (konto) {
      let sats = '';
      let detaljer: string[] = [];
      let lovref = '';
      let lovtekst = '';

      if (konto === 'BOERNEOPSPARING') {
        sats = '0%';
        detaljer = ['Fuldstændig skattefri', 'Ingen skat på gevinst, tab eller udbytte'];
        lovref = 'PBL § 51';
        lovtekst = LOVTEKST_CITATER['PBL_51']?.citat || '';
      } else if (konto === 'ASK') {
        sats = '17%';
        detaljer = ['Lagerbeskatning hvert år', 'Skatten trækkes fra kontoen', `Max indskud: ${formatKr(satser.ask.indskudsgrænse)}`];
        lovref = 'ASKL § 13';
        lovtekst = LOVTEKST_CITATER['ASKL_13']?.citat || '';
      } else if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto)) {
        sats = '15,3%';
        detaljer = ['PAL-skat på afkast', 'Trækkes automatisk af pensionsudbyder', 'Lagerbeskatning'];
        lovref = 'PAL § 2';
        lovtekst = LOVTEKST_CITATER['PAL_2_stk2']?.citat || '';
      } else if (aktivRegler) {
        if (aktivRegler.indkomsttype === 'AKTIEINDKOMST') {
          sats = '27% / 42%';
          detaljer = [
            `27% af første ${formatKr(progressionsgrænse)}`,
            '42% af resten',
            'Selvangives på årsopgørelsen (rubrik 66/67)',
          ];
          lovref = 'PSL § 8a, stk. 1-2';
          lovtekst = LOVTEKST_CITATER['PSL_8a_stk1']?.citat || '';
        } else {
          const psl11Grænse = erGift ? SKATTESATSER.PSL11_GRÆNSE_ÆGTEPAR : SKATTESATSER.PSL11_GRÆNSE_ENLIG;
          sats = '~37% / ~33%';
          detaljer = [
            'Positiv kapitalindkomst beskattes ~37%',
            `Negativ kapitalindkomst: ~33% fradrag (op til ${formatKr(psl11Grænse)})`,
            `Over PSL § 11 grænse: kun ~25% fradrag`,
            '⚠️ ASYMMETRISK: Gevinst giver mere skat end tab giver fradrag',
            '⚠️ INGEN tabsbank - tab kan ikke fremføres',
          ];
          lovref = 'PSL § 4 + PSL § 11';
          lovtekst = `Negativ nettokapitalindkomst giver fradrag: 8% PSL § 11 nedslag (op til ${formatKr(psl11Grænse)}) + ~25% kommuneskat.`;
        }
      }

      if (sats) {
        steps.push({
          nummer: nextStepAfterAktiv + 1,
          titel: 'SKATTEBEREGNING',
          værdi: sats,
          detaljer,
          lovref,
          lovtekst,
          links: [
            { label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url },
          ],
        });
      }
    }

    // Trin 5: Fradrag/Tab
    if (tabsPulje && modregningRegler) {
      const detaljer = [
        `Kan modregnes i: ${modregningRegler.kanModregnesI.join(', ')}`,
        `Ægtefælle kan bruge: ${modregningRegler.ægtefælleOverførsel ? 'JA' : 'NEJ'}`,
        `Fremførsel: ${modregningRegler.fremførsel === 'UBEGRÆNSET' ? 'Ubegrænset' : 'TABES VED LUKNING'}`,
      ];

      if (modregningRegler.note) {
        detaljer.push(`OBS: ${modregningRegler.note}`);
      }

      let lovref = 'ABL § 13A';
      let lovtekst = LOVTEKST_CITATER['ABL_13A']?.citat || '';

      if (tabsPulje === 'FINANSIEL_KONTRAKT') {
        lovref = 'KGL § 32';
        lovtekst = LOVTEKST_CITATER['KGL_32']?.citat || '';
      } else if (tabsPulje === 'ASK_ISOLERET') {
        lovref = 'ASKL § 13';
        lovtekst = LOVTEKST_CITATER['ASKL_13']?.citat || '';
      } else if (tabsPulje === 'PENSION_ISOLERET') {
        lovref = 'PAL § 2';
        lovtekst = LOVTEKST_CITATER['PAL_2']?.citat || '';
      } else if (tabsPulje === 'UNOTERET_AKTIE') {
        lovref = 'ABL § 13';
        lovtekst = LOVTEKST_CITATER['ABL_13']?.citat || '';
      }

      steps.push({
        nummer: nextStepAfterAktiv + 2,
        titel: 'TAB / FRADRAG',
        værdi: getPuljeNavn(tabsPulje),
        detaljer,
        lovref,
        lovtekst,
        links: [
          { label: 'SKAT.dk: Tab på aktier', url: SKAT_DK.tabsfradrag.url },
          { label: 'Aktieavancebeskatningsloven', url: LOVE.ABL.baseUrl },
        ],
      });
    } else if (konto === 'FRIT_DEPOT' && aktivRegler?.indkomsttype === 'KAPITALINDKOMST') {
      // Kapitalindkomst har INGEN tabsbank (undtagen finansielle kontrakter)
      const psl11Grænse = erGift ? SKATTESATSER.PSL11_GRÆNSE_ÆGTEPAR : SKATTESATSER.PSL11_GRÆNSE_ENLIG;

      steps.push({
        nummer: nextStepAfterAktiv + 2,
        titel: 'TAB / FRADRAG',
        værdi: '⚠️ INGEN TABSBANK',
        detaljer: [
          'Tab modregnes øjeblikkeligt i årets netto kapitalindkomst (ingen fremførsel)',
          `Fradragsværdi: ~33% op til ${formatKr(psl11Grænse)} (= 25% kommuneskat + 8% nedslag)`,
          `Over PSL § 11 grænse: kun ~25% fradrag (kun kommuneskat)`,
          '❌ INGEN fremførsel til senere år',
          '❌ Tab kan IKKE gemmes i tabsbank',
          '⚠️ ASYMMETRISK: Gevinst (~37%) beskattes højere end tab giver fradrag (~33%)',
        ],
        lovref: 'PSL § 4 + § 11',
        lovtekst: 'Kapitalindkomst omfatter det samlede nettobeløb af renteindtægter, renteudgifter, skattepligtige kursgevinster og kurstab mv. For negativ nettokapitalindkomst op til ' + formatKr(psl11Grænse) + ' beregnes et nedslag på 8%.',
        links: [
          { label: 'PSL § 11 (negativ kapitalindkomst)', url: 'https://danskelove.dk/personskatteloven/11' },
          { label: 'SKAT.dk: Kapitalindkomst', url: 'https://skat.dk/borger/aktier-og-andre-vaerdipapirer/kapitalindkomst' },
        ],
      });
    }

    // Trin X: ÅRSOVERSIGT - Komplet oversigt over alle tabspuljer og grænser for skatteåret
    // Nummeret beregnes dynamisk: 1 (konto) + antal handlede aktivtyper + 3 (klassificering, skatteberegning, tab/fradrag) + 1
    if (konto === 'FRIT_DEPOT') {
      const psl11Grænse = erGift ? SKATTESATSER.PSL11_GRÆNSE_ÆGTEPAR : SKATTESATSER.PSL11_GRÆNSE_ENLIG;

      steps.push({
        nummer: nextStepAfterAktiv + 3,
        titel: `ÅRSOVERSIGT ${skatteår}`,
        værdi: 'Alle tabspuljer og grænser',
        detaljer: [
          '═══════════════════════════════════════',
          `PROGRESSIONSGRÆNSE AKTIEINDKOMST (${skatteår}):`,
          `→ ${formatKr(progressionsgrænse)} (${erGift ? 'gift' : 'enlig'})`,
          `→ 27% op til grænsen, 42% over`,
          '',
          '═══════════════════════════════════════',
          'TABSBANK: NOTEREDE AKTIER (ABL § 13A)',
          '→ Inkl: DK aktier, udenlandske aktier, positivliste-ETF',
          '→ Kildeartsbegrænset: KUN mod noterede gevinster/udbytter',
          '→ Ægtefælle: OBLIGATORISK overførsel',
          '→ Fremførsel: Ubegrænset til senere år',
          '',
          '═══════════════════════════════════════',
          'TABSBANK: UNOTEREDE AKTIER (ABL § 13)',
          '→ IKKE kildeartsbegrænset',
          '→ Kan bruges mod AL aktieindkomst',
          '→ Ægtefælle: Valgfri overførsel',
          '→ Fremførsel: Ubegrænset til senere år',
          '',
          '═══════════════════════════════════════',
          'TABSBANK: FINANSIELLE KONTRAKTER (KGL § 32)',
          '→ Isoleret tabspool - KUN mod andre kontrakter',
          '→ Ægtefælle: Kan overføre tab',
          '→ Fremførsel: Ubegrænset til senere år',
          '',
          '═══════════════════════════════════════',
          `⚠️ KAPITALINDKOMST-SALDO ${skatteår} (PSL § 11)`,
          `→ Tab modregnes øjeblikkeligt i årets netto kapitalindkomst (ingen fremførsel)`,
          `→ Fradrag ~${Math.round(satser.kapitalindkomst.tabFradragsværdiUnderGrænse * 100)}% op til ${formatKr(psl11Grænse)} (= 25% kommuneskat + 8% nedslag)`,
          `→ Fradrag ~${Math.round(satser.kapitalindkomst.tabFradragsværdiOverGrænse * 100)}% over ${formatKr(psl11Grænse)} (kun kommuneskat)`,
          '→ Saldoen NULSTILLES automatisk 1. januar',
          '→ ⚠️ Sælg gevinster SAMME år som tab!',
          ...(kapitalIndkomstSaldo && kapitalIndkomstSaldo.beløb !== 0 ? (() => {
            const fradrag = kapitalIndkomstSaldo.beløb < 0
              ? beregnKapitalindkomstFradrag(kapitalIndkomstSaldo.beløb, skatteår, erGift)
              : null;
            return [
              '',
              '─────────────────────────────────────',
              `📊 Kapitalindkomst-saldo ${skatteår}: ${kapitalIndkomstSaldo.beløb >= 0 ? '+' : ''}${formatKr(kapitalIndkomstSaldo.beløb)}`,
              `   Gevinster: +${formatKr(kapitalIndkomstSaldo.gevinster)}`,
              `   Tab: -${formatKr(kapitalIndkomstSaldo.tab)}`,
              ...(fradrag ? [
                `   → Fradrag PSL § 11: ${formatKr(fradrag.totalFradrag)} (~${Math.round(fradrag.effektivSats * 100)}% = 25% kommuneskat + 8% nedslag)`,
                `   → Nulstilles 1. januar ${skatteår + 1} – intet fremføres`,
              ] : []),
            ];
          })() : []),
          '',
          '═══════════════════════════════════════',
          'VIGTIGT FOR DIN PLANLÆGNING:',
          '→ Tab i jan-nov kan modregnes i gevinst dec samme år',
          '→ Aktieindkomst-tab gemmes i tabsbank til senere år',
          '→ Kapitalindkomst-tab SKAL bruges i samme år!',
        ],
        lovref: 'Samlet oversigt',
        lovtekst: `Oversigt over alle tabspuljer og grænser for skatteår ${skatteår}. Brug denne til at planlægge køb/salg henover året.`,
        links: [
          { label: 'SKAT.dk: Tabsfradrag', url: SKAT_DK.tabsfradrag.url },
          { label: 'SKAT.dk: Skat af aktier', url: SKAT_DK.aktier.url },
        ],
      });
    }

    return steps;
  }, [konto, aktiv, kontoRegler, aktivRegler, tabsPulje, modregningRegler, erGift, progressionsgrænse, satser, handledeAktivTyper, skatteår, kapitalIndkomstSaldo]);

  // Generer eksport-tekst
  const genererEksportTekst = () => {
    const linjer: string[] = [];
    linjer.push('═'.repeat(60));
    linjer.push('SKATTE-FLOW AUDIT TRAIL');
    linjer.push('═'.repeat(60));
    linjer.push(`Dato: ${new Date().toLocaleString('da-DK')}`);
    linjer.push(`Skatteår: ${skatteår}`);
    linjer.push(`Civilstand: ${erGift ? 'Gift' : 'Enlig'}`);
    linjer.push('');
    linjer.push('VALGT STI:');
    linjer.push('-'.repeat(40));

    auditSteps.forEach(step => {
      linjer.push(`\n${step.nummer}. ${step.titel}: ${step.værdi}`);
      step.detaljer.forEach(d => linjer.push(`   → ${d}`));
      linjer.push(`   📚 Ref: ${step.lovref}`);
      if (step.lovtekst) {
        linjer.push(`   "${step.lovtekst}"`);
      }
      linjer.push(`   Links:`);
      step.links.forEach(l => linjer.push(`   • ${l.label}: ${l.url}`));
    });

    linjer.push('\n' + '═'.repeat(60));
    linjer.push('ALTERNATIVE MULIGHEDER:');
    linjer.push('-'.repeat(40));

    if (konto === 'FRIT_DEPOT') {
      linjer.push('• ASK: 17% flat skat, men tab er isoleret til kontoen');
      linjer.push('• Pension: 15,3% PAL-skat, men pengene er bundet');
      linjer.push('• Børneopsparing: Skattefri, men begrænset indskud');
    } else if (konto === 'ASK') {
      linjer.push('• Frit Depot: 27%/42% progression, men tab kan bruges på CPR-niveau');
    }

    linjer.push('\n' + '═'.repeat(60));
    linjer.push('Genereret af Skat-Simulator');
    linjer.push('Til brug for PwC audit og krydstjek');
    linjer.push('═'.repeat(60));

    return linjer.join('\n');
  };

  const handleKopier = async () => {
    const tekst = genererEksportTekst();
    try {
      await navigator.clipboard.writeText(tekst);
      setKopieretTekst('Kopieret!');
      setTimeout(() => setKopieretTekst(null), 2000);
    } catch {
      setKopieretTekst('Fejl ved kopiering');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!konto) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">👈</div>
          <div className="text-sm">Vælg en kontotype i flowchartet for at se audit-trail</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/20 p-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-white">AUDIT TRAIL</h2>
            <p className="text-white/50 text-xs">Skatteår {skatteår} • {erGift ? 'Gift' : 'Enlig'}</p>
          </div>
          <button
            onClick={handleKopier}
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded px-3 py-1.5 text-white transition-colors"
          >
            {kopieretTekst || '📋 Eksporter'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {auditSteps.map(step => (
          <div key={step.nummer} className="border border-white/20 rounded-lg overflow-hidden">
            <div className="bg-white/10 px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {step.nummer}
                </span>
                <span className="text-white/70 text-xs uppercase">{step.titel}</span>
              </div>
              <div className="text-white font-semibold mt-1">{step.værdi}</div>
            </div>
            <div className="p-3 space-y-2 text-xs">
              {step.detaljer.map((d, i) => (
                <div key={i} className="text-white/70">→ {d}</div>
              ))}
              <div className="flex items-center gap-2 text-blue-400 pt-2 border-t border-white/10">
                <span>📚</span>
                <span className="font-semibold">{step.lovref}</span>
              </div>
              {step.lovtekst && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-white/60 italic text-[11px]">
                  "{step.lovtekst}"
                </div>
              )}
              <div className="pt-2 space-y-1">
                {step.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 underline"
                  >
                    🔗 {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alternativer */}
      <div className="border-t border-white/20 p-3">
        <div className="text-xs text-white/50 uppercase mb-2">Alternative muligheder</div>
        <div className="space-y-1 text-xs text-white/60">
          {konto === 'FRIT_DEPOT' && (
            <>
              <div>• <span className="text-green-400">ASK</span>: 17% flat, men tab isoleret</div>
              <div>• <span className="text-yellow-400">Pension</span>: 15,3% PAL, men bundet</div>
            </>
          )}
          {konto === 'ASK' && (
            <div>• <span className="text-blue-400">Frit Depot</span>: 27%/42%, men tab på CPR-niveau</div>
          )}
          {['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(konto) && (
            <div>• <span className="text-blue-400">Frit Depot</span>: Højere skat, men frie midler</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditPanel;
