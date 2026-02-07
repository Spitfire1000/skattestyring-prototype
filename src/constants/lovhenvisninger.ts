/**
 * LOVHENVISNINGER OG KILDER
 *
 * Bruger centraliserede kilder fra lovkilder.ts
 * Eksporterer funktioner til brug i komponenter
 */

import type { AktivType, TabsPulje, KontoType } from '../types/skat';
import {
  LOVE,
  SKAT_DK,
  JURIDISK_VEJLEDNING,
  getParagrafUrl,
  getLovUrl,
  formatLovhenvisning,
} from './lovkilder';

// Re-eksporter fra lovkilder for bagudkompatibilitet
export {
  LOVE,
  SKAT_DK,
  JURIDISK_VEJLEDNING,
  getParagrafUrl,
  getLovUrl,
  formatLovhenvisning,
};

// ============================================================
// HJÆLPEFUNKTIONER
// ============================================================

/**
 * Hent lovhenvisning for en aktivtype
 */
export function getLovhenvisningForAktiv(aktivType: AktivType): { paragraf: string; tekst: string; lov: string; url: string } {
  switch (aktivType) {
    case 'AKTIE_DK':
    case 'AKTIE_UDENLANDSK':
      return {
        paragraf: formatLovhenvisning('ABL', '§12'),
        tekst: LOVE.ABL.paragraffer['§12'].beskrivelse,
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§12'),
      };
    case 'AKTIE_UNOTERET':
      return {
        paragraf: formatLovhenvisning('ABL', '§12'),
        tekst: 'Unoterede aktier beskattes som aktieindkomst',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§12'),
      };
    case 'ETF_POSITIVLISTE':
      return {
        paragraf: formatLovhenvisning('ABL', '§19B'),
        tekst: LOVE.ABL.paragraffer['§19B'].beskrivelse,
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19B'),
      };
    case 'ETF_IKKE_POSITIVLISTE':
      return {
        paragraf: formatLovhenvisning('ABL', '§19C'),
        tekst: LOVE.ABL.paragraffer['§19C'].beskrivelse,
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19C'),
      };
    case 'ETF_OBLIGATIONSBASERET':
      return {
        paragraf: formatLovhenvisning('ABL', '§19C'),
        tekst: 'Obligationsbaseret ETF/fond - ALTID kapitalindkomst uanset akkumulerende/udbyttebetalende',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19C'),
      };
    case 'INVF_UDBYTTEBETALTENDE':
      return {
        paragraf: formatLovhenvisning('ABL', '§19'),
        tekst: 'Udloddende investeringsforening - realisationsbeskatning',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19'),
      };
    case 'INVF_AKKUMULERENDE':
      return {
        paragraf: formatLovhenvisning('ABL', '§19'),
        tekst: 'Akkumulerende investeringsforening på positivliste - aktieindkomst, lagerbeskatning',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19'),
      };
    case 'INVF_AKKUMULERENDE_KAPITAL':
      return {
        paragraf: formatLovhenvisning('ABL', '§19C'),
        tekst: 'Akkumulerende fond IKKE på positivliste - kapitalindkomst, lagerbeskatning',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19C'),
      };
    case 'BLANDET_FOND_AKTIE':
      return {
        paragraf: formatLovhenvisning('ABL', '§19'),
        tekst: 'Blandet fond >50% aktier - aktieindkomst',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19'),
      };
    case 'BLANDET_FOND_OBLIGATION':
      return {
        paragraf: formatLovhenvisning('ABL', '§19C'),
        tekst: 'Blandet fond >50% obligationer - kapitalindkomst',
        lov: LOVE.ABL.navn,
        url: getParagrafUrl('ABL', '§19C'),
      };
    case 'OBLIGATION':
      return {
        paragraf: formatLovhenvisning('KGL', '§14'),
        tekst: 'Direkte obligationer - kapitalindkomst, realisationsbeskatning',
        lov: LOVE.KGL.navn,
        url: getParagrafUrl('KGL', '§14'),
      };
    case 'FINANSIEL_KONTRAKT':
      return {
        paragraf: formatLovhenvisning('KGL', '§29'),
        tekst: LOVE.KGL.paragraffer['§29'].beskrivelse,
        lov: LOVE.KGL.navn,
        url: getParagrafUrl('KGL', '§29'),
      };
    default:
      return {
        paragraf: 'ABL',
        tekst: 'Se aktieavancebeskatningsloven',
        lov: LOVE.ABL.navn,
        url: getLovUrl('ABL'),
      };
  }
}

/**
 * Hent lovhenvisning for tabspulje
 */
export function getLovhenvisningForTabspulje(pulje: TabsPulje): { paragraf: string; tekst: string; url: string } {
  switch (pulje) {
    case 'NOTERET_AKTIE':
      return {
        paragraf: formatLovhenvisning('ABL', '§13A'),
        tekst: LOVE.ABL.paragraffer['§13A'].beskrivelse,
        url: getParagrafUrl('ABL', '§13A'),
      };
    case 'UNOTERET_AKTIE':
      return {
        paragraf: formatLovhenvisning('ABL', '§13'),
        tekst: LOVE.ABL.paragraffer['§13'].beskrivelse,
        url: getParagrafUrl('ABL', '§13'),
      };
    case 'KAPITAL_GENEREL':
      return {
        paragraf: formatLovhenvisning('PSL', '§4'),
        tekst: 'Tab på kapitalindkomst kan modregnes i kapitalindkomst',
        url: getParagrafUrl('PSL', '§4'),
      };
    case 'FINANSIEL_KONTRAKT':
      return {
        paragraf: formatLovhenvisning('KGL', '§32'),
        tekst: LOVE.KGL.paragraffer['§32'].beskrivelse,
        url: getParagrafUrl('KGL', '§32'),
      };
    case 'ASK_ISOLERET':
      return {
        paragraf: formatLovhenvisning('ASKL', '§13'),
        tekst: 'Tab på ASK er isoleret til kontoen',
        url: getParagrafUrl('ASKL', '§13'),
      };
    case 'PENSION_ISOLERET':
      return {
        paragraf: formatLovhenvisning('PAL', '§2'),
        tekst: 'Tab på pension er isoleret til den specifikke konto',
        url: getParagrafUrl('PAL', '§2'),
      };
  }
}

/**
 * Hent lovhenvisning for kontotype
 */
export function getLovhenvisningForKonto(kontoType: KontoType): { paragraf: string; tekst: string; url: string; skatDkUrl: string } {
  switch (kontoType) {
    case 'ASK':
      return {
        paragraf: formatLovhenvisning('ASKL', '§13'),
        tekst: LOVE.ASKL.paragraffer['§13'].beskrivelse,
        url: getParagrafUrl('ASKL', '§13'),
        skatDkUrl: SKAT_DK.ask.url,
      };
    case 'RATEPENSION':
    case 'ALDERSOPSPARING':
    case 'LIVRENTE':
    case 'KAPITALPENSION':
      return {
        paragraf: formatLovhenvisning('PAL', '§2'),
        tekst: LOVE.PAL.paragraffer['§2'].beskrivelse,
        url: getParagrafUrl('PAL', '§2'),
        skatDkUrl: SKAT_DK.palSkat.url,
      };
    case 'BOERNEOPSPARING':
      return {
        paragraf: formatLovhenvisning('PBL', '§51'),
        tekst: LOVE.PBL.paragraffer['§51'].beskrivelse,
        url: getParagrafUrl('PBL', '§51'),
        skatDkUrl: SKAT_DK.palSkat.url,
      };
    case 'FRIT_DEPOT':
    default:
      return {
        paragraf: formatLovhenvisning('PSL', '§8a'),
        tekst: LOVE.PSL.paragraffer['§8a'].beskrivelse,
        url: getParagrafUrl('PSL', '§8a'),
        skatDkUrl: SKAT_DK.aktier.url,
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
    kilder.push({ titel: SKAT_DK.ask.titel, url: SKAT_DK.ask.url });
  }
  if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(kontoType)) {
    kilder.push({ titel: SKAT_DK.palSkat.titel, url: SKAT_DK.palSkat.url });
  }

  // Aktivtype-specifik
  if (aktivType.includes('ETF') || aktivType.includes('INVF')) {
    kilder.push({ titel: SKAT_DK.etf.titel, url: SKAT_DK.etf.url });
    kilder.push({ titel: SKAT_DK.positivliste.titel, url: SKAT_DK.positivliste.url });
  }

  // Tab-specifik
  if (harTab) {
    kilder.push({ titel: SKAT_DK.tabsfradrag.titel, url: SKAT_DK.tabsfradrag.url });
    kilder.push({ titel: JURIDISK_VEJLEDNING.tabNoteredeAktier.emne, url: JURIDISK_VEJLEDNING.tabNoteredeAktier.url });
  }

  // Lovkilder
  kilder.push({ titel: LOVE.ABL.navn, url: getLovUrl('ABL') });
  kilder.push({ titel: LOVE.PSL.navn, url: getLovUrl('PSL') });

  return kilder;
}

// ============================================================
// LOVTEKST CITATER (til audit-trail)
// ============================================================

export interface LovtekstCitat {
  id: string;
  paragraf: string;
  lov: string;
  citat: string;
  note?: string;
  retsinformationUrl: string;
  skatDkUrl?: string;
}

export const LOVTEKST_CITATER: Record<string, LovtekstCitat> = {
  // PERSONSKATTELOVEN - Aktieindkomst
  'PSL_4': {
    id: 'PSL_4',
    paragraf: '§ 4',
    lov: 'Personskatteloven',
    citat: 'Kapitalindkomst omfatter det samlede nettobeløb af renteindtægter, renteudgifter, skattepligtige kursgevinster og kurstab mv.',
    retsinformationUrl: getParagrafUrl('PSL', '§4'),
    skatDkUrl: SKAT_DK.kapitalindkomst.url,
  },
  'PSL_4a': {
    id: 'PSL_4a',
    paragraf: '§ 4a',
    lov: 'Personskatteloven',
    citat: 'Aktieindkomst omfatter det samlede beløb af: 1) Aktieudbytte, 2) Skattepligtig fortjeneste og tab ved afståelse af aktier.',
    retsinformationUrl: getParagrafUrl('PSL', '§4a'),
  },
  'PSL_8a_stk1': {
    id: 'PSL_8a_stk1',
    paragraf: '§ 8a, stk. 1',
    lov: 'Personskatteloven',
    citat: 'Skatten af aktieindkomst, der ikke overstiger et grundbeløb på 61.000 kr. (2010-niveau), udgør 27 pct.',
    note: 'Grundbeløbet reguleres årligt. 2026: 79.400 kr (enlig) / 158.800 kr (gift).',
    retsinformationUrl: getParagrafUrl('PSL', '§8a'),
    skatDkUrl: SKAT_DK.aktier.url,
  },
  'PSL_8a_stk2': {
    id: 'PSL_8a_stk2',
    paragraf: '§ 8a, stk. 2',
    lov: 'Personskatteloven',
    citat: 'Skatten af aktieindkomst, der overstiger grundbeløbet i stk. 1, udgør 42 pct.',
    retsinformationUrl: getParagrafUrl('PSL', '§8a'),
    skatDkUrl: SKAT_DK.aktier.url,
  },
  'PSL_8a_stk4': {
    id: 'PSL_8a_stk4',
    paragraf: '§ 8a, stk. 4',
    lov: 'Personskatteloven',
    citat: 'For ægtefæller, der er samlevende ved indkomstårets udløb, beregnes skatten af deres samlede aktieindkomst. Den samlede skat fordeles forholdsmæssigt.',
    note: 'Gifte har dobbelt progressionsgrænse.',
    retsinformationUrl: getParagrafUrl('PSL', '§8a'),
    skatDkUrl: JURIDISK_VEJLEDNING.aegtefaelleberegning.url,
  },

  // AKTIEAVANCEBESKATNINGSLOVEN
  'ABL_12': {
    id: 'ABL_12',
    paragraf: '§ 12',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Gevinst og tab ved afståelse af aktier medregnes ved opgørelsen af den skattepligtige indkomst.',
    note: 'Gælder aktier optaget til handel på et reguleret marked (noterede aktier).',
    retsinformationUrl: getParagrafUrl('ABL', '§12'),
    skatDkUrl: SKAT_DK.aktier.url,
  },
  'ABL_13': {
    id: 'ABL_13',
    paragraf: '§ 13',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Tab ved afståelse af aktier, der ikke er optaget til handel på et reguleret marked, kan fradrages i indkomstårets gevinster efter § 12.',
    note: 'Tab på UNOTEREDE aktier kan modregnes i AL aktieindkomst.',
    retsinformationUrl: getParagrafUrl('ABL', '§13'),
    skatDkUrl: SKAT_DK.tabsfradrag.url,
  },
  'ABL_13A': {
    id: 'ABL_13A',
    paragraf: '§ 13 A',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Tab ved afståelse af aktier optaget til handel på et reguleret marked kan kun modregnes i gevinst ved afståelse af aktier optaget til handel på et reguleret marked og i udbytter fra sådanne aktier.',
    note: 'Tab på NOTEREDE aktier er kildeartsbegrænset - kan kun bruges mod noterede gevinster/udbytter.',
    retsinformationUrl: getParagrafUrl('ABL', '§13A'),
    skatDkUrl: SKAT_DK.tabsfradrag.url,
  },
  'ABL_14': {
    id: 'ABL_14',
    paragraf: '§ 14',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Det er en betingelse for fradrag efter §§ 13 og 13 A, at SKAT inden udløbet af oplysningsfristen har modtaget oplysninger om erhvervelsen af de pågældende aktier.',
    note: 'Du skal have indberettet købet for at få tabsfradrag!',
    retsinformationUrl: getParagrafUrl('ABL', '§14'),
    skatDkUrl: SKAT_DK.tabsfradrag.url,
  },
  'ABL_19': {
    id: 'ABL_19',
    paragraf: '§ 19',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Gevinst og tab på aktier og investeringsbeviser m.v. i investeringsselskaber medregnes ved opgørelsen af den skattepligtige indkomst.',
    note: 'ETF\'er og akkumulerende investeringsforeninger lagerbeskattes.',
    retsinformationUrl: getParagrafUrl('ABL', '§19'),
    skatDkUrl: SKAT_DK.etf.url,
  },
  'ABL_19B': {
    id: 'ABL_19B',
    paragraf: '§ 19 B',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Gevinst og tab på investeringsbeviser i aktiebaserede investeringsselskaber medregnes ved opgørelsen af aktieindkomsten.',
    note: 'ETF\'er på positivlisten (ABIS) beskattes som aktieindkomst (27%/42%).',
    retsinformationUrl: getParagrafUrl('ABL', '§19B'),
    skatDkUrl: SKAT_DK.positivliste.url,
  },
  'ABL_19C': {
    id: 'ABL_19C',
    paragraf: '§ 19 C',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Gevinst og tab på investeringsbeviser i obligationsbaserede investeringsselskaber medregnes ved opgørelsen af kapitalindkomsten.',
    note: 'ETF\'er IKKE på positivlisten beskattes som kapitalindkomst (~37%).',
    retsinformationUrl: getParagrafUrl('ABL', '§19C'),
    skatDkUrl: SKAT_DK.kapitalindkomst.url,
  },
  'ABL_23': {
    id: 'ABL_23',
    paragraf: '§ 23',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Ved lagerprincippet medregnes urealiseret gevinst og tab løbende i indkomstopgørelsen.',
    note: 'Lagerbeskatning: Du beskattes af værdistigningen hvert år, selvom du ikke sælger.',
    retsinformationUrl: getParagrafUrl('ABL', '§23'),
  },
  'ABL_26': {
    id: 'ABL_26',
    paragraf: '§ 26',
    lov: 'Aktieavancebeskatningsloven',
    citat: 'Anskaffelsessummen for aktier opgøres efter gennemsnitsmetoden.',
    note: 'Ved køb af aktier i flere omgange beregnes en gennemsnitlig anskaffelsessum.',
    retsinformationUrl: getParagrafUrl('ABL', '§26'),
  },

  // KURSGEVINSTLOVEN - Finansielle kontrakter
  'KGL_29': {
    id: 'KGL_29',
    paragraf: '§ 29',
    lov: 'Kursgevinstloven',
    citat: 'Gevinst og tab på terminskontrakter og aftaler om køberetter og salgsretter medregnes ved opgørelsen af den skattepligtige indkomst.',
    note: 'Gælder optioner, futures, CFD\'er, warrants mv. Beskattes som kapitalindkomst.',
    retsinformationUrl: getParagrafUrl('KGL', '§29'),
  },
  'KGL_32': {
    id: 'KGL_32',
    paragraf: '§ 32',
    lov: 'Kursgevinstloven',
    citat: 'Tab på kontrakter som nævnt i § 29 kan alene fradrages i gevinst på sådanne kontrakter.',
    note: 'KRITISK: Tab på finansielle kontrakter kan KUN modregnes i gevinst på andre finansielle kontrakter - ikke i andet!',
    retsinformationUrl: getParagrafUrl('KGL', '§32'),
  },

  // AKTIESPAREKONTOLOVEN
  'ASKL_5': {
    id: 'ASKL_5',
    paragraf: '§ 5',
    lov: 'Aktiesparekontoloven',
    citat: 'Midlerne på en aktiesparekonto kan anbringes i aktier mv. optaget til handel på et reguleret marked.',
    note: 'Du kan investere i noterede aktier, danske investeringsforeninger og ETF\'er på positivlisten.',
    retsinformationUrl: getParagrafUrl('ASKL', '§5'),
    skatDkUrl: SKAT_DK.ask.url,
  },
  'ASKL_9': {
    id: 'ASKL_9',
    paragraf: '§ 9',
    lov: 'Aktiesparekontoloven',
    citat: 'Der kan højst indskydes et grundbeløb på 135.000 kr. (2019-niveau) på en aktiesparekonto.',
    note: 'Loftet reguleres årligt. I 2026: 174.200 kr.',
    retsinformationUrl: getParagrafUrl('ASKL', '§9'),
    skatDkUrl: SKAT_DK.ask.url,
  },
  'ASKL_13': {
    id: 'ASKL_13',
    paragraf: '§ 13',
    lov: 'Aktiesparekontoloven',
    citat: 'Det skattepligtige afkast opgøres som forskellen mellem værdien af aktiesparekontoen ved årets udgang og værdien ved årets begyndelse.',
    note: 'Lagerbeskatning - du beskattes af værdistigningen hvert år.',
    retsinformationUrl: getParagrafUrl('ASKL', '§13'),
    skatDkUrl: SKAT_DK.ask.url,
  },
  'ASKL_14': {
    id: 'ASKL_14',
    paragraf: '§ 14',
    lov: 'Aktiesparekontoloven',
    citat: 'Af det skattepligtige afkast beregnes en skat på 17 pct.',
    note: 'Skatten trækkes automatisk fra kontoen. Tab kan kun bruges på samme ASK-konto.',
    retsinformationUrl: getParagrafUrl('ASKL', '§14'),
    skatDkUrl: SKAT_DK.ask.url,
  },

  // PENSIONSAFKASTBESKATNINGSLOVEN
  'PAL_2': {
    id: 'PAL_2',
    paragraf: '§ 2',
    lov: 'Pensionsafkastbeskatningsloven',
    citat: 'Den skattepligtige del af afkastet udgør det samlede afkast af de i § 1 nævnte ordninger. Skatten udgør 15,3 pct. af det skattepligtige afkast.',
    note: 'PAL-skat på 15,3% betales automatisk af pensionsudbyder.',
    retsinformationUrl: getParagrafUrl('PAL', '§2'),
    skatDkUrl: SKAT_DK.palSkat.url,
  },

  // PENSIONSBESKATNINGSLOVEN - Børneopsparing
  'PBL_51': {
    id: 'PBL_51',
    paragraf: '§ 51',
    lov: 'Pensionsbeskatningsloven',
    citat: 'Renter, udbytter og avancer af en børneopsparing er skattefri.',
    note: 'Børneopsparing er fuldstændig skattefri.',
    retsinformationUrl: getParagrafUrl('PBL', '§51'),
  },

  // LIGNINGSLOVEN - Creditlempelse
  'LL_33': {
    id: 'LL_33',
    paragraf: '§ 33',
    lov: 'Ligningsloven',
    citat: 'Skat betalt til fremmed stat kan fradrages i den danske skat efter reglerne i denne paragraf.',
    note: 'Creditlempelse for udenlandsk kildeskat på udbytter (max DK-skatteprocenten).',
    retsinformationUrl: getParagrafUrl('LL', '§33'),
  },
};

/**
 * Hent relevante lovtekst-citater baseret på kontotype og aktivtype
 */
export function getRelevanteCitater(
  kontoType: KontoType,
  aktivType?: AktivType,
  harTab?: boolean
): LovtekstCitat[] {
  const citater: LovtekstCitat[] = [];

  // Kontotype-specifikke
  switch (kontoType) {
    case 'ASK':
      citater.push(LOVTEKST_CITATER['ASKL_14']);
      citater.push(LOVTEKST_CITATER['ASKL_13']);
      citater.push(LOVTEKST_CITATER['ASKL_9']);
      citater.push(LOVTEKST_CITATER['ASKL_5']);
      break;
    case 'RATEPENSION':
    case 'ALDERSOPSPARING':
    case 'LIVRENTE':
    case 'KAPITALPENSION':
      citater.push(LOVTEKST_CITATER['PAL_2']);
      break;
    case 'BOERNEOPSPARING':
      citater.push(LOVTEKST_CITATER['PBL_51']);
      break;
    case 'FRIT_DEPOT':
    default:
      // For kapitalindkomst-aktiver vises PSL § 4 i stedet for PSL § 8a
      if (
        aktivType === 'FINANSIEL_KONTRAKT' ||
        aktivType === 'ETF_IKKE_POSITIVLISTE' ||
        aktivType === 'ETF_OBLIGATIONSBASERET' ||
        aktivType === 'INVF_AKKUMULERENDE_KAPITAL' ||
        aktivType === 'BLANDET_FOND_OBLIGATION' ||
        aktivType === 'OBLIGATION'
      ) {
        citater.push(LOVTEKST_CITATER['PSL_4']);
      } else {
        // Aktieindkomst: PSL § 8a
        citater.push(LOVTEKST_CITATER['PSL_8a_stk1']);
        citater.push(LOVTEKST_CITATER['PSL_8a_stk2']);
        citater.push(LOVTEKST_CITATER['PSL_8a_stk4']);
      }
      break;
  }

  // Aktivtype-specifikke (kun relevant for FRIT_DEPOT)
  if (aktivType && kontoType === 'FRIT_DEPOT') {
    switch (aktivType) {
      case 'AKTIE_DK':
      case 'AKTIE_UDENLANDSK':
        citater.push(LOVTEKST_CITATER['ABL_12']);
        if (harTab) {
          citater.push(LOVTEKST_CITATER['ABL_13A']);
          citater.push(LOVTEKST_CITATER['ABL_14']);
        }
        break;
      case 'AKTIE_UNOTERET':
        citater.push(LOVTEKST_CITATER['ABL_12']);
        if (harTab) {
          citater.push(LOVTEKST_CITATER['ABL_13']);
        }
        break;
      case 'ETF_POSITIVLISTE':
        citater.push(LOVTEKST_CITATER['ABL_19B']);
        citater.push(LOVTEKST_CITATER['ABL_23']);
        if (harTab) citater.push(LOVTEKST_CITATER['ABL_13A']);
        break;
      case 'ETF_IKKE_POSITIVLISTE':
        citater.push(LOVTEKST_CITATER['ABL_19C']);
        citater.push(LOVTEKST_CITATER['ABL_23']);
        // PSL_4 tilføjes allerede ovenfor for kapitalindkomst-aktiver
        break;
      case 'INVF_AKKUMULERENDE':
        citater.push(LOVTEKST_CITATER['ABL_19']);
        citater.push(LOVTEKST_CITATER['ABL_23']);
        break;
      case 'FINANSIEL_KONTRAKT':
        citater.push(LOVTEKST_CITATER['KGL_29']);
        citater.push(LOVTEKST_CITATER['KGL_32']); // Altid vis tabsreglerne - de er kritiske!
        break;
    }
  }

  // Gennemsnitsmetode (relevant for realisation)
  if (aktivType && !aktivType.includes('ETF') && aktivType !== 'FINANSIEL_KONTRAKT') {
    citater.push(LOVTEKST_CITATER['ABL_26']);
  }

  return citater;
}
