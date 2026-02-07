/**
 * CSV PARSER SERVICE
 *
 * Parser portefølje-data fra CSV-filer og mapper til interne typer.
 * Understøtter Nordnet CSV format.
 */

import type { KontoType, AktivType, TabsPulje } from '../types/skat';
import { getTabspulje } from '../constants/skatteRegler';

// ============================================================
// TYPES
// ============================================================

export interface PortfolioAsset {
  id: string;
  navn: string;
  isin: string;
  valuta: string;
  antal: number;
  anskaffelseskurs: number;  // Per enhed
  aktuelKurs: number;        // Per enhed
  værdi: number;             // Total værdi
  urealiseret: number;       // Afkast i kr
  ureasliseretPct: number;   // Afkast i %
  kontoNavn: string;         // Original streng fra CSV

  // Afledt
  aktivType: AktivType;
  kontoType: KontoType;
  tabsPulje: TabsPulje | null;

  // Gruppering
  gruppe: AssetGruppe;
}

export type AssetGruppe =
  | 'DANSKE_AKTIER'
  | 'UDENLANDSKE_AKTIER'
  | 'ETF_POSITIVLISTE'
  | 'ETF_IKKE_POSITIVLISTE'
  | 'ETF_OBLIGATIONSBASERET'
  | 'INVF_UDBYTTEBETALTENDE'
  | 'INVF_AKKUMULERENDE'
  | 'INVF_AKKUMULERENDE_KAPITAL'
  | 'BLANDET_FOND'
  | 'OBLIGATION'
  | 'FINANSIEL_KONTRAKT';

// ============================================================
// ISIN-BASERET POSITIVLISTE (ETF'er på SKATs positivliste)
// ============================================================

const POSITIVLISTE_ISINS = new Set([
  // iShares
  'IE00B4L5Y983',  // iShares Core MSCI World
  'IE00B5BMR087',  // iShares Core S&P 500
  'IE00B4L5YC18',  // iShares MSCI EM
  'IE00BJ0KDQ92',  // Xtrackers MSCI World
  'IE00BJ0KDR00',  // Xtrackers MSCI Japan
  'IE00B53L3W79',  // iShares Euro Stoxx 50

  // Vanguard
  'IE00B3RBWM25',  // Vanguard FTSE All-World
]);

// ============================================================
// DANSKE INVESTERINGSFORENINGER
// ============================================================

const DANSKE_INVF_PATTERNS = [
  /sparindex/i,
  /danske\s*inv/i,
  /nordea\s*invest/i,
  /bankinvest/i,
  /nykredit\s*invest/i,
  /maj\s*invest/i,
  /sydinvest/i,
  /jyske\s*invest/i,
  /seb\s*invest/i,
];

const AKKUMULERENDE_PATTERN = /akk(umulerende)?/i;

// ============================================================
// PARSER FUNKTIONER
// ============================================================

/**
 * Parse dansk tal (1.234,56 → 1234.56)
 */
function parseDanskTal(str: string | undefined): number {
  if (!str || str.trim() === '' || str === '-') return 0;

  let cleaned = str.replace(/\s/g, '').replace('%', '');

  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Mapper konto-streng fra CSV til KontoType
 */
export function mapKontoType(kontoStr: string): KontoType {
  const lower = kontoStr.toLowerCase();

  if (lower.includes('aktiesparekonto') || lower === 'ask') {
    return 'ASK';
  }
  if (lower.includes('ratepension')) {
    return 'RATEPENSION';
  }
  if (lower.includes('aldersopsparing')) {
    return 'ALDERSOPSPARING';
  }
  if (lower.includes('kapitalpension')) {
    return 'KAPITALPENSION';
  }
  if (lower.includes('livrente')) {
    return 'LIVRENTE';
  }
  if (lower.includes('børneopsparing') || lower.includes('boerneopsparing')) {
    return 'BOERNEOPSPARING';
  }

  return 'FRIT_DEPOT';
}

// Patterns for obligationsbaserede ETF'er
const OBLIGATION_ETF_PATTERNS = [
  /bond/i,
  /obligat/i,
  /fixed.?income/i,
  /treasury/i,
  /govt/i,
  /government/i,
  /corporate/i,
  /credit/i,
  /aggregate/i,
];

// Patterns for blandede fonde
const BLANDET_FOND_PATTERNS = [
  /blandet/i,
  /balanced/i,
  /mixed/i,
  /multi.?asset/i,
];

/**
 * Detekterer aktivtype baseret på ISIN og navn
 */
export function detectAktivType(isin: string, navn: string): AktivType {
  const upperIsin = isin.toUpperCase();
  const lowerNavn = navn.toLowerCase();

  // Check for direkte obligationer (typisk DK-præfiks med obligation/statsobligation i navn)
  if (lowerNavn.includes('obligation') && !lowerNavn.includes('fond') && !lowerNavn.includes('etf')) {
    return 'OBLIGATION';
  }

  // Check for danske investeringsforeninger først (DK-præfiks + invest-pattern)
  if (upperIsin.startsWith('DK')) {
    const erInvf = DANSKE_INVF_PATTERNS.some(p => p.test(lowerNavn));

    if (erInvf) {
      // Check for obligationsbaseret fond
      if (OBLIGATION_ETF_PATTERNS.some(p => p.test(lowerNavn))) {
        return 'ETF_OBLIGATIONSBASERET';
      }

      // Check for blandet fond
      if (BLANDET_FOND_PATTERNS.some(p => p.test(lowerNavn))) {
        // Default til aktie-blandet, da vi ikke kan afgøre fordelingen
        return 'BLANDET_FOND_AKTIE';
      }

      if (AKKUMULERENDE_PATTERN.test(lowerNavn)) {
        // Check om den er på positivlisten
        if (POSITIVLISTE_ISINS.has(upperIsin)) {
          return 'INVF_AKKUMULERENDE';
        }
        // Ellers kapitalindkomst
        return 'INVF_AKKUMULERENDE_KAPITAL';
      }
      return 'INVF_UDBYTTEBETALTENDE';
    }

    return 'AKTIE_DK';
  }

  // Check for ETF'er (IE, LU præfiks eller kendte navne)
  if (upperIsin.startsWith('IE') || upperIsin.startsWith('LU') ||
      lowerNavn.includes('etf') || lowerNavn.includes('ishares') ||
      lowerNavn.includes('vanguard') || lowerNavn.includes('xtrackers')) {

    // Check for obligationsbaseret ETF
    if (OBLIGATION_ETF_PATTERNS.some(p => p.test(lowerNavn))) {
      return 'ETF_OBLIGATIONSBASERET';
    }

    if (POSITIVLISTE_ISINS.has(upperIsin)) {
      return 'ETF_POSITIVLISTE';
    }
    return 'ETF_IKKE_POSITIVLISTE';
  }

  // US-præfiks = udenlandsk aktie
  if (upperIsin.startsWith('US')) {
    return 'AKTIE_UDENLANDSK';
  }

  // Andre præfikser = udenlandsk aktie
  if (upperIsin.length >= 2 && /^[A-Z]{2}/.test(upperIsin) && !upperIsin.startsWith('DK')) {
    return 'AKTIE_UDENLANDSK';
  }

  return 'AKTIE_DK';
}

/**
 * Bestemmer gruppering for visning i UI
 */
function getAssetGruppe(aktivType: AktivType): AssetGruppe {
  switch (aktivType) {
    case 'AKTIE_DK':
      return 'DANSKE_AKTIER';
    case 'AKTIE_UDENLANDSK':
    case 'AKTIE_UNOTERET':
      return 'UDENLANDSKE_AKTIER';
    case 'ETF_POSITIVLISTE':
      return 'ETF_POSITIVLISTE';
    case 'ETF_IKKE_POSITIVLISTE':
      return 'ETF_IKKE_POSITIVLISTE';
    case 'ETF_OBLIGATIONSBASERET':
      return 'ETF_OBLIGATIONSBASERET';
    case 'INVF_UDBYTTEBETALTENDE':
      return 'INVF_UDBYTTEBETALTENDE';
    case 'INVF_AKKUMULERENDE':
      return 'INVF_AKKUMULERENDE';
    case 'INVF_AKKUMULERENDE_KAPITAL':
      return 'INVF_AKKUMULERENDE_KAPITAL';
    case 'BLANDET_FOND_AKTIE':
    case 'BLANDET_FOND_OBLIGATION':
      return 'BLANDET_FOND';
    case 'OBLIGATION':
      return 'OBLIGATION';
    case 'FINANSIEL_KONTRAKT':
      return 'FINANSIEL_KONTRAKT';
    default:
      return 'DANSKE_AKTIER';
  }
}

/**
 * Parse CSV til PortfolioAsset array
 */
export function parsePortfolioCSV(csvText: string): PortfolioAsset[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV-filen er tom eller har ingen data');
  }

  // Find header-linje
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('værdipapir') || line.includes('isin') || line.includes('antal')) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = lines[headerIndex];

  // Detect separator
  let separator = '\t';
  if (!headerLine.includes('\t')) {
    separator = headerLine.includes(';') ? ';' : ',';
  }

  const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());

  // Find kolonneindekser
  const findCol = (patterns: string[]): number => {
    return headers.findIndex(h => patterns.some(p => h.includes(p)));
  };

  const colId = findCol(['id']);
  const colNavn = findCol(['værdipapir', 'instrument', 'navn']);
  const colISIN = findCol(['isin']);
  const colValuta = findCol(['valuta', 'currency']);
  const colAntal = findCol(['antal', 'quantity']);
  const colGnsKurs = findCol(['anskaffelseskurs', 'anskaffelse']);
  const colAktuelKurs = headers.findIndex(h => h === 'kurs' || h === 'seneste kurs' || h === 'aktuel kurs');
  const colVærdi = findCol(['værdi', 'markedsværdi']);
  const colAfkast = headers.findIndex(h => h === 'afkast');
  const colAfkastPct = headers.findIndex(h => h.includes('afkast') && h.includes('%'));
  const colKonto = findCol(['konto', 'depot']);

  const positions: PortfolioAsset[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(separator).map(c => c.trim());
    if (cols.length < 5) continue;

    const firstCol = cols[0]?.toLowerCase() || '';
    if (firstCol.includes('sum') || firstCol.includes('total') || firstCol.includes('i alt') || firstCol === '') {
      continue;
    }

    const id = colId >= 0 ? cols[colId] : String(i);
    const navn = colNavn >= 0 ? cols[colNavn] : cols[1] || 'Ukendt';
    const isin = colISIN >= 0 ? cols[colISIN] : '';
    const valuta = colValuta >= 0 ? cols[colValuta] : 'DKK';
    const antal = colAntal >= 0 ? parseDanskTal(cols[colAntal]) : 0;
    const anskaffelseskurs = colGnsKurs >= 0 ? parseDanskTal(cols[colGnsKurs]) : 0;
    const aktuelKurs = colAktuelKurs >= 0 ? parseDanskTal(cols[colAktuelKurs]) : 0;
    const værdi = colVærdi >= 0 ? parseDanskTal(cols[colVærdi]) : antal * aktuelKurs;
    const afkast = colAfkast >= 0 ? parseDanskTal(cols[colAfkast]) : 0;
    const afkastPct = colAfkastPct >= 0 ? parseDanskTal(cols[colAfkastPct]) : 0;
    const kontoNavn = colKonto >= 0 ? cols[colKonto] : 'Frie midler';

    if (antal === 0) continue;

    const anskaffelsessum = antal * anskaffelseskurs;
    const urealiseret = afkast !== 0 ? afkast : (værdi - anskaffelsessum);
    const ureasliseretPct = afkastPct !== 0 ? afkastPct : (anskaffelsessum > 0 ? (urealiseret / anskaffelsessum) * 100 : 0);

    const aktivType = detectAktivType(isin, navn);
    const kontoType = mapKontoType(kontoNavn);
    const tabsPulje = getTabspulje(kontoType, aktivType);
    const gruppe = getAssetGruppe(aktivType);

    positions.push({
      id: `${id}-${isin || navn}`,
      navn,
      isin,
      valuta,
      antal,
      anskaffelseskurs,
      aktuelKurs,
      værdi,
      urealiseret,
      ureasliseretPct,
      kontoNavn,
      aktivType,
      kontoType,
      tabsPulje,
      gruppe,
    });
  }

  return positions;
}

// ============================================================
// GRUPPERING
// ============================================================

export interface GroupedAssets {
  gruppe: AssetGruppe;
  label: string;
  beskrivelse: string;
  assets: PortfolioAsset[];
  totalVærdi: number;
  totalUrealiseret: number;
}

const GRUPPE_INFO: Record<AssetGruppe, { label: string; beskrivelse: string }> = {
  DANSKE_AKTIER: {
    label: 'Danske aktier',
    beskrivelse: 'Noterede danske aktier (DK-ISIN)',
  },
  UDENLANDSKE_AKTIER: {
    label: 'Udenlandske aktier',
    beskrivelse: 'Noterede udenlandske aktier',
  },
  ETF_POSITIVLISTE: {
    label: 'ETF (positivliste)',
    beskrivelse: 'ETF\'er på SKATs positivliste - aktieindkomst',
  },
  ETF_IKKE_POSITIVLISTE: {
    label: 'ETF (ikke-positivliste)',
    beskrivelse: 'ETF\'er IKKE på positivliste - kapitalindkomst',
  },
  ETF_OBLIGATIONSBASERET: {
    label: 'ETF (obligationsbaseret)',
    beskrivelse: 'Obligationsbaserede ETF\'er - ALTID kapitalindkomst',
  },
  INVF_UDBYTTEBETALTENDE: {
    label: 'Invf. udbyttebet.',
    beskrivelse: 'Danske investeringsforeninger med udbytte',
  },
  INVF_AKKUMULERENDE: {
    label: 'Invf. akkumulerende',
    beskrivelse: 'Danske akkumulerende investeringsforeninger på positivliste',
  },
  INVF_AKKUMULERENDE_KAPITAL: {
    label: 'Invf. akk. (kapital)',
    beskrivelse: 'Akkumulerende fonde IKKE på positivliste - kapitalindkomst',
  },
  BLANDET_FOND: {
    label: 'Blandede fonde',
    beskrivelse: 'Fonde med blanding af aktier og obligationer',
  },
  OBLIGATION: {
    label: 'Obligationer',
    beskrivelse: 'Direkte obligationer og renter - kapitalindkomst',
  },
  FINANSIEL_KONTRAKT: {
    label: 'Finansielle kontrakter',
    beskrivelse: 'CFD, futures, optioner, warrants - kapitalindkomst med isoleret tabspool',
  },
};

/**
 * Grupperer assets efter aktivtype
 */
export function groupAssetsByType(assets: PortfolioAsset[]): GroupedAssets[] {
  const grouped = new Map<AssetGruppe, PortfolioAsset[]>();

  for (const asset of assets) {
    const existing = grouped.get(asset.gruppe) || [];
    existing.push(asset);
    grouped.set(asset.gruppe, existing);
  }

  const result: GroupedAssets[] = [];

  const gruppeOrder: AssetGruppe[] = [
    'DANSKE_AKTIER',
    'UDENLANDSKE_AKTIER',
    'ETF_POSITIVLISTE',
    'ETF_IKKE_POSITIVLISTE',
    'ETF_OBLIGATIONSBASERET',
    'INVF_UDBYTTEBETALTENDE',
    'INVF_AKKUMULERENDE',
    'INVF_AKKUMULERENDE_KAPITAL',
    'BLANDET_FOND',
    'OBLIGATION',
    'FINANSIEL_KONTRAKT',
  ];

  for (const gruppe of gruppeOrder) {
    const assets = grouped.get(gruppe);
    if (assets && assets.length > 0) {
      const info = GRUPPE_INFO[gruppe];
      result.push({
        gruppe,
        label: info.label,
        beskrivelse: info.beskrivelse,
        assets: assets.sort((a, b) => Math.abs(b.urealiseret) - Math.abs(a.urealiseret)),
        totalVærdi: assets.reduce((sum, a) => sum + a.værdi, 0),
        totalUrealiseret: assets.reduce((sum, a) => sum + a.urealiseret, 0),
      });
    }
  }

  return result;
}

/**
 * Grupperer assets efter konto
 */
export function groupAssetsByKonto(assets: PortfolioAsset[]): Map<string, PortfolioAsset[]> {
  const grouped = new Map<string, PortfolioAsset[]>();

  for (const asset of assets) {
    const key = asset.kontoNavn;
    const existing = grouped.get(key) || [];
    existing.push(asset);
    grouped.set(key, existing);
  }

  return grouped;
}
