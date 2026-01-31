/**
 * CSV Parser for Nordnet format
 *
 * Nordnet CSV eksporterer positioner i dette format:
 * - Tab-separeret eller semicolon-separeret
 * - Dansk talformat (komma som decimal)
 * - Headers på dansk
 */

import type { AktivType } from '../types/skat';

export interface ParsedPosition {
  id: string;
  navn: string;
  isin: string;
  ticker: string;
  antal: number;
  gnsKurs: number;           // Gennemsnitlig anskaffelseskurs
  aktuelKurs: number;
  anskaffelsessum: number;   // antal * gnsKurs
  aktuelVærdi: number;       // antal * aktuelKurs
  urealiseret: number;       // aktuelVærdi - anskaffelsessum
  ureasliseretPct: number;
  valuta: string;
  aktivType: AktivType;
  konto: string;             // "Aktiesparekonto", "Frie midler", etc.
}

/**
 * Parse dansk tal (1.234,56 → 1234.56 eller 1234,56 → 1234.56)
 */
function parseDanskTal(str: string): number {
  if (!str || str.trim() === '' || str === '-') return 0;

  // Fjern whitespace og %-tegn
  let cleaned = str.replace(/\s/g, '').replace('%', '');

  // Hvis der er både . og , - antag . er tusindtalsseparator
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // Hvis kun komma - det er decimal
  else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Gæt aktivtype baseret på navn og ISIN
 */
function gætAktivType(navn: string): AktivType {
  const navnLower = navn.toLowerCase();

  // ETF'er (typisk indeholder "ETF" eller kendte navne)
  if (
    navnLower.includes('etf') ||
    navnLower.includes('ishares') ||
    navnLower.includes('vanguard') ||
    navnLower.includes('xtrackers') ||
    navnLower.includes('invesco') ||
    navnLower.includes('spdr')
  ) {
    return 'ETF_POSITIVLISTE';
  }

  // Investeringsforeninger (danske)
  if (
    navnLower.includes('sparindex') ||
    navnLower.includes('danske invest') ||
    navnLower.includes('nordea invest') ||
    navnLower.includes('jyske invest') ||
    navnLower.includes('sydinvest')
  ) {
    if (navnLower.includes('akk') || navnLower.includes('accumulating')) {
      return 'INVESTERINGSFORENING_AKKUM';
    }
    return 'INVESTERINGSFORENING_UDBYTTE';
  }

  // Obligationer
  if (
    navnLower.includes('obligation') ||
    navnLower.includes('realkredit') ||
    navnLower.includes('bond') ||
    navnLower.includes('nykredit') ||
    navnLower.includes('totalkredit')
  ) {
    return 'OBLIGATION';
  }

  // Krypto
  if (
    navnLower.includes('bitcoin') ||
    navnLower.includes('ethereum') ||
    navnLower.includes('crypto') ||
    navnLower.includes('coinbase')
  ) {
    return 'KRYPTO';
  }

  // Default: Aktie (noteret)
  return 'AKTIE_NOTERET';
}

/**
 * Parse Nordnet CSV
 *
 * Understøtter format:
 * Id	Værdipapir	ISIN	Valuta	Antal	Anskaffelseskurs	Kurs	Værdi	Afkast	Afkast %	Konto
 */
export function parseNordnetCSV(csvText: string): ParsedPosition[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV-filen er tom eller har ingen data');
  }

  // Find header-linje
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (
      line.includes('værdipapir') ||
      line.includes('instrument') ||
      line.includes('isin') ||
      line.includes('antal')
    ) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = lines[headerIndex];

  // Detect separator (tab eller semicolon)
  let separator = '\t';
  if (!headerLine.includes('\t')) {
    separator = headerLine.includes(';') ? ';' : ',';
  }

  const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());

  // Find kolonneindekser
  const findCol = (test: (h: string) => boolean): number => {
    return headers.findIndex(test);
  };

  // Log headers for debugging
  console.log('[CSV Parser] Headers:', headers);

  const colId = findCol(h => h === 'id');
  const colNavn = findCol(h => h === 'værdipapir' || h === 'instrument' || h === 'navn');
  const colISIN = findCol(h => h === 'isin');
  const colValuta = findCol(h => h === 'valuta' || h === 'currency');
  const colAntal = findCol(h => h === 'antal' || h === 'quantity');
  const colGnsKurs = findCol(h => h === 'anskaffelseskurs' || h === 'gns. kurs' || h.includes('anskaffelse'));
  // "kurs" eksakt match - IKKE "anskaffelseskurs"
  const colAktuelKurs = findCol(h => h === 'kurs' || h === 'seneste kurs' || h === 'aktuel kurs');
  const colVærdi = findCol(h => h === 'værdi' || h === 'markedsværdi');
  const colAfkast = findCol(h => h === 'afkast');
  const colAfkastPct = findCol(h => h === 'afkast %' || h.endsWith('%'));
  const colKonto = findCol(h => h === 'konto' || h === 'depot');

  console.log('[CSV Parser] Column indices:');
  console.log('  colGnsKurs (anskaffelseskurs):', colGnsKurs, '→ header:', colGnsKurs >= 0 ? headers[colGnsKurs] : 'NOT FOUND!');
  console.log('  colAktuelKurs (kurs):', colAktuelKurs, '→ header:', colAktuelKurs >= 0 ? headers[colAktuelKurs] : 'NOT FOUND!');
  console.log('  colVærdi:', colVærdi, '→ header:', colVærdi >= 0 ? headers[colVærdi] : 'NOT FOUND!');
  console.log('  colAfkast:', colAfkast, '→ header:', colAfkast >= 0 ? headers[colAfkast] : 'NOT FOUND!');

  // ADVARSEL hvis kritiske kolonner mangler
  if (colGnsKurs < 0) {
    console.warn('[CSV Parser] ⚠️ ADVARSEL: Anskaffelseskurs-kolonne IKKE FUNDET! Anskaffelsessum bliver 0.');
  }

  const positions: ParsedPosition[] = [];

  // Parse data-linjer
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(separator).map(c => c.trim());

    // Skip hvis ikke nok kolonner
    if (cols.length < 5) continue;

    // Skip summary/total linjer
    const firstCol = cols[0]?.toLowerCase() || '';
    if (
      firstCol.includes('sum') ||
      firstCol.includes('total') ||
      firstCol.includes('i alt') ||
      firstCol === ''
    ) {
      continue;
    }

    // Log første række for debugging
    if (i === headerIndex + 1) {
      console.log('[CSV Parser] Første række cols:', cols);
      console.log('[CSV Parser] cols[5] (anskaffelseskurs):', cols[5]);
      console.log('[CSV Parser] cols[6] (kurs):', cols[6]);
      console.log('[CSV Parser] cols[7] (værdi):', cols[7]);
    }

    const id = colId >= 0 ? cols[colId] : String(i);
    const navn = colNavn >= 0 ? cols[colNavn] : cols[1] || 'Ukendt';
    const isin = colISIN >= 0 ? cols[colISIN] : '';
    const valuta = colValuta >= 0 ? cols[colValuta] : 'DKK';
    const antal = colAntal >= 0 ? parseDanskTal(cols[colAntal]) : 0;
    const gnsKurs = colGnsKurs >= 0 ? parseDanskTal(cols[colGnsKurs]) : 0;
    const aktuelKurs = colAktuelKurs >= 0 ? parseDanskTal(cols[colAktuelKurs]) : 0;
    const værdi = colVærdi >= 0 ? parseDanskTal(cols[colVærdi]) : antal * aktuelKurs;
    const afkast = colAfkast >= 0 ? parseDanskTal(cols[colAfkast]) : 0;
    const afkastPct = colAfkastPct >= 0 ? parseDanskTal(cols[colAfkastPct]) : 0;
    const konto = colKonto >= 0 ? cols[colKonto] : 'Frie midler';

    // Log parsed værdier for første række
    if (i === headerIndex + 1) {
      console.log('[CSV Parser] Parsed: gnsKurs=', gnsKurs, 'aktuelKurs=', aktuelKurs, 'værdi=', værdi);
    }

    // Skip hvis ingen antal
    if (antal === 0) continue;

    // Beregn anskaffelsessum
    const anskaffelsessum = antal * gnsKurs;

    // Brug afkast fra CSV hvis tilgængelig, ellers beregn
    const urealiseret = afkast !== 0 ? afkast : (værdi - anskaffelsessum);
    const ureasliseretPct = afkastPct !== 0 ? afkastPct : (anskaffelsessum > 0 ? (urealiseret / anskaffelsessum) * 100 : 0);

    positions.push({
      id: `${id}-${isin || navn}`,
      navn,
      isin,
      ticker: '',
      antal,
      gnsKurs,
      aktuelKurs,
      anskaffelsessum,
      aktuelVærdi: værdi,
      urealiseret,
      ureasliseretPct,
      valuta,
      aktivType: gætAktivType(navn),
      konto,
    });
  }

  return positions;
}

/**
 * Eksempel på manuelt oprettet testdata
 */
export function getTestPositioner(): ParsedPosition[] {
  return [
    {
      id: '1',
      navn: 'Novo Nordisk B',
      isin: 'DK0062498333',
      ticker: 'NOVO B',
      antal: 50,
      gnsKurs: 650,
      aktuelKurs: 780,
      anskaffelsessum: 32500,
      aktuelVærdi: 39000,
      urealiseret: 6500,
      ureasliseretPct: 20,
      valuta: 'DKK',
      aktivType: 'AKTIE_NOTERET',
      konto: 'Frie midler',
    },
    {
      id: '2',
      navn: 'Apple Inc',
      isin: 'US0378331005',
      ticker: 'AAPL',
      antal: 20,
      gnsKurs: 1200,
      aktuelKurs: 1350,
      anskaffelsessum: 24000,
      aktuelVærdi: 27000,
      urealiseret: 3000,
      ureasliseretPct: 12.5,
      valuta: 'DKK',
      aktivType: 'AKTIE_NOTERET',
      konto: 'Aktiesparekonto',
    },
    {
      id: '3',
      navn: 'iShares Core MSCI World ETF',
      isin: 'IE00B4L5Y983',
      ticker: 'IWDA',
      antal: 100,
      gnsKurs: 550,
      aktuelKurs: 620,
      anskaffelsessum: 55000,
      aktuelVærdi: 62000,
      urealiseret: 7000,
      ureasliseretPct: 12.7,
      valuta: 'DKK',
      aktivType: 'ETF_POSITIVLISTE',
      konto: 'Frie midler',
    },
    {
      id: '4',
      navn: 'Sparindex INDEX Globale Aktier',
      isin: 'DK0060747822',
      ticker: 'SPVIGAKL',
      antal: 200,
      gnsKurs: 180,
      aktuelKurs: 165,
      anskaffelsessum: 36000,
      aktuelVærdi: 33000,
      urealiseret: -3000,
      ureasliseretPct: -8.3,
      valuta: 'DKK',
      aktivType: 'INVESTERINGSFORENING_AKKUM',
      konto: 'Frie midler',
    },
    {
      id: '5',
      navn: 'Tesla Inc',
      isin: 'US88160R1014',
      ticker: 'TSLA',
      antal: 10,
      gnsKurs: 2800,
      aktuelKurs: 2200,
      anskaffelsessum: 28000,
      aktuelVærdi: 22000,
      urealiseret: -6000,
      ureasliseretPct: -21.4,
      valuta: 'DKK',
      aktivType: 'AKTIE_NOTERET',
      konto: 'Aktiesparekonto',
    },
  ];
}
