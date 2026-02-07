/**
 * FRADRAGSBANK
 *
 * Håndterer tab der kan fremføres til modregning i fremtidige gevinster.
 *
 * GRUNDREGEL:
 * Tab kan IKKE trækkes fra i andre indkomsttyper (løn, etc.)
 * Tab kan KUN modregnes i gevinster af samme type.
 *
 * ⚠️ VIGTIGE BEGRÆNSNINGER:
 * - Ægtefælleberegninger (obligatorisk overførsel for noterede aktier) kræver MANUEL håndtering
 * - Kapitalindkomst-tab håndteres IKKE via fradragsbank (bruger beregnSkat() direkte)
 *
 * TABSPULJER:
 *
 * 1. NOTERET_AKTIE (tab på børsnoterede aktier)
 *    - Kan modregnes i: Gevinst på noterede aktier, udbytter, positivliste-ETF
 *    - Ægtefælle: OBLIGATORISK overførsel (ABL § 13A, stk. 3) - kræver manuel håndtering!
 *    - Fremførsel: Ubegrænset
 *
 * 2. UNOTERET_AKTIE (tab på unoterede aktier)
 *    - Kan modregnes i: AL aktieindkomst (bredere end noterede)
 *    - Ægtefælle: JA (valgfri)
 *    - Fremførsel: Ubegrænset
 *
 * 3. KAPITAL_GENEREL (⚠️ DEPRECATED - BRUGES IKKE!)
 *    ─────────────────────────────────────────────────────────────
 *    ⚠️ VIGTIG: Kapitalindkomst har INGEN tabsbank!
 *
 *    Kapitalindkomst håndteres via KapitalindkomstSaldo i App.tsx:
 *    - Tab/gevinst samles i en ÅRS-SALDO (nulstilles 1. januar)
 *    - Beregning sker via beregnKapitalindkomstFradrag() i skatteRegler.ts
 *    - PSL § 11 fradrag: ~33% under 50.000 kr, ~25% over
 *    - INGEN fremførsel til næste år!
 *
 *    Denne pulje-type eksisterer kun for dokumentation.
 *    Ingen aktivtype mapper til den (tabspulje = null for kapitalindkomst).
 *    ─────────────────────────────────────────────────────────────
 *
 * 4. FINANSIEL_KONTRAKT (tab på optioner, warrants, CFD, futures)
 *    - Kan KUN modregnes i: Andre finansielle kontrakter!
 *    - Ægtefælle: JA (KGL § 32 stk. 2 - kan overføres til ægtefælles kontrakt-gevinster)
 *    - Fremførsel: Ubegrænset
 *    - ⚠️ MEGET BEGRÆNSET - kan ikke bruges mod andet!
 *
 * 5. ASK_ISOLERET (tab på Aktiesparekonto)
 *    - Kan KUN modregnes i: Gevinster på SAMME ASK
 *    - Ægtefælle: NEJ
 *    - Fremførsel: TABES ved lukning af kontoen!
 *
 * 6. PENSION_ISOLERET (tab på pensionskonto)
 *    - Kan KUN modregnes i: Gevinster på SAMME pensionskonto
 *    - Ægtefælle: NEJ
 *    - Fremførsel: Ubegrænset (men isoleret til kontoen)
 *
 * @version 1.1
 * @author Skattestyring-prototype
 */

import type {
  TabsPulje,
  FradragsbankPost,
  Fradragsbank,
} from '../types/skat';

import { MODREGNING_REGLER } from '../constants/skatteRegler';

// ============================================================
// IN-MEMORY STORAGE (erstattes med Firebase senere)
// ============================================================

/**
 * Midlertidig in-memory storage
 * I produktion erstattes dette med Firebase
 */
const fradragsbanker: Map<string, Fradragsbank> = new Map();

/**
 * Generer unikt ID
 */
function genererID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================
// TILFØJ TAB
// ============================================================

/**
 * Tilføj et tab til fradragsbanken
 *
 * @param profilId - Brugerens profil-ID
 * @param beløb - Tabsbeløb (positivt tal)
 * @param pulje - Hvilken tabspulje
 * @param kontoId - Kun for isolerede tab (ASK, pension)
 * @param beskrivelse - Beskrivelse af tabet
 * @param oprindelsesÅr - Hvilket år tabet opstod
 *
 * EKSEMPEL:
 * tilføjTab('profil-123', 5000, 'NOTERET_AKTIE', undefined, 'Tab på Novo Nordisk', 2024)
 *
 * VIGTIGT:
 * - For ASK og pension SKAL kontoId angives
 * - Tab er isoleret til den specifikke konto
 */
export function tilføjTab(
  profilId: string,
  beløb: number,
  pulje: TabsPulje,
  kontoId?: string,
  beskrivelse: string = '',
  oprindelsesÅr: number = new Date().getFullYear()
): FradragsbankPost {

  // Valider: ASK og pension kræver kontoId
  if ((pulje === 'ASK_ISOLERET' || pulje === 'PENSION_ISOLERET') && !kontoId) {
    throw new Error(`Pulje ${pulje} kræver kontoId (tab er isoleret til kontoen)`);
  }

  // Hent eller opret fradragsbank for profilen
  let fradragsbank = fradragsbanker.get(profilId);
  if (!fradragsbank) {
    fradragsbank = { profilId, poster: [] };
    fradragsbanker.set(profilId, fradragsbank);
  }

  // Hent modregningsregler
  const regler = MODREGNING_REGLER[pulje];

  // Opret ny post
  const post: FradragsbankPost = {
    id: genererID(),
    profilId,
    pulje,
    kontoId,
    beløb: Math.abs(beløb), // Gem altid som positivt tal
    oprindelsesÅr,
    beskrivelse,
    ægtefælleOverførsel: regler.ægtefælleOverførsel,
  };

  // Tilføj til fradragsbank
  fradragsbank.poster.push(post);

  console.log(`[Fradragsbank] Tilføjet tab: ${beløb} kr til pulje ${pulje}`);

  return post;
}

// ============================================================
// BEREGN MODREGNING
// ============================================================

/**
 * Beregn hvor meget tab der kan bruges til at reducere en gevinst
 *
 * @param profilId - Brugerens profil-ID
 * @param gevinst - Gevinsten der skal modregnes (positivt tal)
 * @param pulje - Hvilken tabspulje der skal bruges
 * @param kontoId - Kun for isolerede tab (ASK, pension)
 * @returns Object med modregningsbeløb og resterende tab/gevinst
 *
 * EKSEMPEL:
 * Gevinst: 10.000 kr
 * Tab i banken: 7.000 kr
 * → Modregning: 7.000 kr
 * → Beskattelig gevinst: 3.000 kr
 * → Resterende tab: 0 kr
 *
 * VIGTIGE REGLER:
 *
 * 1. NOTERET_AKTIE tab:
 *    - Bruges først mod gevinst på noterede aktier
 *    - Derefter mod udbytter
 *    - Kan IKKE bruges mod unoteret aktiegevinst (omvendt virker dog)
 *
 * 2. UNOTERET_AKTIE tab:
 *    - Kan bruges mod AL aktieindkomst
 *    - Bredere anvendelse end noterede
 *
 * 3. KAPITAL_GENEREL tab:
 *    - Kan bruges mod kapitalindkomst
 *    - Men IKKE mod finansielle kontrakter!
 *
 * 4. FINANSIEL_KONTRAKT tab:
 *    - KUN mod andre finansielle kontrakter
 *    - Meget isoleret og begrænset
 *
 * 5. ASK_ISOLERET:
 *    - Kun mod gevinster på SAMME ASK
 *    - Tab TABES hvis kontoen lukkes!
 *
 * 6. PENSION_ISOLERET:
 *    - Kun mod gevinster på SAMME pension
 */
export interface ModregningResultat {
  gevinstFør: number;
  tabBrugt: number;
  gevinstEfter: number;
  resterendeTab: number;
  poster: FradragsbankPost[]; // Hvilke poster der blev brugt
}

export function beregnModregning(
  profilId: string,
  gevinst: number,
  pulje: TabsPulje,
  kontoId?: string
): ModregningResultat {

  const fradragsbank = fradragsbanker.get(profilId);

  // Ingen fradragsbank = ingen modregning
  if (!fradragsbank) {
    return {
      gevinstFør: gevinst,
      tabBrugt: 0,
      gevinstEfter: gevinst,
      resterendeTab: 0,
      poster: [],
    };
  }

  // Find relevante tabsposter
  let relevantePoser = fradragsbank.poster.filter(post => {
    // Samme pulje
    if (post.pulje !== pulje) return false;

    // For isolerede tab: samme konto
    if (pulje === 'ASK_ISOLERET' || pulje === 'PENSION_ISOLERET') {
      if (post.kontoId !== kontoId) return false;
    }

    // Kun poster med resterende beløb
    return post.beløb > 0;
  });

  // Sortér efter år (ældste først - FIFO)
  relevantePoser.sort((a, b) => a.oprindelsesÅr - b.oprindelsesÅr);

  // Beregn modregning
  let gevinstEfter = gevinst;
  let tabBrugt = 0;
  const brugtePoser: FradragsbankPost[] = [];

  for (const post of relevantePoser) {
    if (gevinstEfter <= 0) break;

    const brugesNu = Math.min(post.beløb, gevinstEfter);
    gevinstEfter -= brugesNu;
    tabBrugt += brugesNu;
    post.beløb -= brugesNu;

    if (brugesNu > 0) {
      brugtePoser.push(post);
    }
  }

  // Beregn samlet resterende tab i puljen
  const resterendeTab = relevantePoser.reduce((sum, post) => sum + post.beløb, 0);

  console.log(`[Fradragsbank] Modregning: ${tabBrugt} kr brugt af ${gevinst} kr gevinst`);

  return {
    gevinstFør: gevinst,
    tabBrugt,
    gevinstEfter: Math.max(0, gevinstEfter),
    resterendeTab,
    poster: brugtePoser,
  };
}

// ============================================================
// HENT FRADRAGSBANK
// ============================================================

/**
 * Hent alle tabspuljer for en profil
 *
 * @param profilId - Brugerens profil-ID
 * @returns Fradragsbank med alle poster, eller tom hvis ingen findes
 *
 * BRUG:
 * Vis oversigt over alle fremførbare tab til brugeren
 */
export function hentFradragsbank(profilId: string): Fradragsbank {
  const fradragsbank = fradragsbanker.get(profilId);

  if (!fradragsbank) {
    return {
      profilId,
      poster: [],
    };
  }

  // Returner kun poster med resterende beløb
  return {
    profilId,
    poster: fradragsbank.poster.filter(post => post.beløb > 0),
  };
}

/**
 * Hent tab for en specifik pulje
 */
export function hentTabIPulje(
  profilId: string,
  pulje: TabsPulje,
  kontoId?: string
): number {
  const fradragsbank = hentFradragsbank(profilId);

  return fradragsbank.poster
    .filter(post => {
      if (post.pulje !== pulje) return false;
      if (kontoId && post.kontoId !== kontoId) return false;
      return true;
    })
    .reduce((sum, post) => sum + post.beløb, 0);
}

/**
 * Hent samlet oversigt over fradragsbank
 */
export interface FradragsbankOversigt {
  pulje: TabsPulje;
  samletBeløb: number;
  antalPoster: number;
  kanModregnesI: string[];
  ægtefælleOverførsel: boolean;
  note?: string;
}

export function hentFradragsbankOversigt(profilId: string): FradragsbankOversigt[] {
  const fradragsbank = hentFradragsbank(profilId);
  const oversigt: FradragsbankOversigt[] = [];

  // Gruppér efter pulje
  const puljer = new Set(fradragsbank.poster.map(p => p.pulje));

  for (const pulje of puljer) {
    const posterIPulje = fradragsbank.poster.filter(p => p.pulje === pulje);
    const regler = MODREGNING_REGLER[pulje];

    oversigt.push({
      pulje,
      samletBeløb: posterIPulje.reduce((sum, p) => sum + p.beløb, 0),
      antalPoster: posterIPulje.length,
      kanModregnesI: regler.kanModregnesI,
      ægtefælleOverførsel: regler.ægtefælleOverførsel,
      note: regler.note,
    });
  }

  return oversigt;
}

// ============================================================
// ÆGTEFÆLLE-OVERFØRSEL
// ============================================================

/**
 * Overfør tab til ægtefælle
 *
 * REGEL:
 * Tab kan overføres til ægtefælle HVIS:
 * - Puljen tillader det (ikke ASK, ikke pension)
 * - Ægtefællen har gevinst i samme pulje
 *
 * @param fraProfilId - Profil der afgiver tab
 * @param tilProfilId - Ægtefælle der modtager tab
 * @param pulje - Hvilken tabspulje
 * @param beløb - Hvor meget der overføres
 */
export function overførTilÆgtefælle(
  fraProfilId: string,
  tilProfilId: string,
  pulje: TabsPulje,
  beløb: number
): boolean {

  const regler = MODREGNING_REGLER[pulje];

  // Check om overførsel er tilladt
  if (!regler.ægtefælleOverførsel) {
    console.warn(`[Fradragsbank] Pulje ${pulje} tillader ikke ægtefælle-overførsel`);
    return false;
  }

  // Hent afsenders fradragsbank
  const fraBank = fradragsbanker.get(fraProfilId);
  if (!fraBank) {
    console.warn(`[Fradragsbank] Ingen fradragsbank for profil ${fraProfilId}`);
    return false;
  }

  // Find poster at overføre fra
  const poster = fraBank.poster.filter(p => p.pulje === pulje && p.beløb > 0);
  let resterende = beløb;

  for (const post of poster) {
    if (resterende <= 0) break;

    const overføres = Math.min(post.beløb, resterende);
    post.beløb -= overføres;
    resterende -= overføres;

    // Tilføj til modtager
    tilføjTab(
      tilProfilId,
      overføres,
      pulje,
      undefined,
      `Overført fra ægtefælle: ${post.beskrivelse}`,
      post.oprindelsesÅr
    );
  }

  console.log(`[Fradragsbank] Overført ${beløb - resterende} kr til ægtefælle`);

  return resterende === 0;
}

// ============================================================
// SLET TAB (VED KONTO-LUKNING)
// ============================================================

/**
 * Slet alle tab for en konto (bruges når ASK lukkes)
 *
 * VIGTIGT: Tab på ASK TABES hvis kontoen lukkes!
 * Dette er en af de største fælder ved ASK.
 *
 * @param profilId - Brugerens profil-ID
 * @param kontoId - Konto-ID der lukkes
 */
export function sletTabForKonto(profilId: string, kontoId: string): number {
  const fradragsbank = fradragsbanker.get(profilId);
  if (!fradragsbank) return 0;

  let slettetBeløb = 0;

  fradragsbank.poster = fradragsbank.poster.filter(post => {
    if (post.kontoId === kontoId) {
      slettetBeløb += post.beløb;
      console.warn(`[Fradragsbank] ⚠️ SLETTET tab: ${post.beløb} kr (konto lukket)`);
      return false;
    }
    return true;
  });

  return slettetBeløb;
}

// ============================================================
// NULSTIL (TIL TESTING)
// ============================================================

/**
 * Nulstil fradragsbank for en profil (kun til testing)
 */
export function nulstilFradragsbank(profilId: string): void {
  fradragsbanker.delete(profilId);
  console.log(`[Fradragsbank] Nulstillet for profil ${profilId}`);
}

/**
 * Nulstil alle fradragsbanker (kun til testing)
 */
export function nulstilAlleFradragsbanker(): void {
  fradragsbanker.clear();
  console.log(`[Fradragsbank] Alle fradragsbanker nulstillet`);
}
