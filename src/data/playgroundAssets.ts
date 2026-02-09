/**
 * PLAYGROUND ASSETS
 *
 * Pre-loaded aktiver til test af simulatoren.
 * Inkluderer aktiver til alle kontotyper:
 * - Frit Depot (alle aktivtyper)
 * - ASK (kun tilladt: aktier, positivliste-ETF, visse inv.foreninger)
 * - Børneopsparing (som ASK)
 * - Ratepension (de fleste aktivtyper undtagen unoterede og fin. kontrakter)
 */

import type { PortfolioAsset } from '../services/csvParser';

// ============================================================
// BASE AKTIVER (bruges til at generere konto-specifikke versioner)
// ============================================================

interface BaseAktiv {
  id: string;
  navn: string;
  isin: string;
  valuta: string;
  antal: number;
  anskaffelseskurs: number;
  aktuelKurs: number;
  aktivType: PortfolioAsset['aktivType'];
  gruppe: PortfolioAsset['gruppe'];
}

// Aktier der er tilladt på alle konti (noterede)
const NOTEREDE_AKTIER: BaseAktiv[] = [
  // Danske aktier
  { id: 'novo', navn: 'Novo Nordisk B', isin: 'DK0062498333', valuta: 'DKK', antal: 50, anskaffelseskurs: 680, aktuelKurs: 920, aktivType: 'AKTIE_DK', gruppe: 'DANSKE_AKTIER' },
  { id: 'dsv', navn: 'DSV A/S', isin: 'DK0060079531', valuta: 'DKK', antal: 20, anskaffelseskurs: 1250, aktuelKurs: 1485, aktivType: 'AKTIE_DK', gruppe: 'DANSKE_AKTIER' },
  { id: 'vestas', navn: 'Vestas Wind Systems', isin: 'DK0061539921', valuta: 'DKK', antal: 100, anskaffelseskurs: 142, aktuelKurs: 119, aktivType: 'AKTIE_DK', gruppe: 'DANSKE_AKTIER' },
  { id: 'orsted', navn: 'Ørsted A/S', isin: 'DK0060094928', valuta: 'DKK', antal: 40, anskaffelseskurs: 385, aktuelKurs: 298, aktivType: 'AKTIE_DK', gruppe: 'DANSKE_AKTIER' },
  { id: 'maersk', navn: 'Mærsk A', isin: 'DK0010244508', valuta: 'DKK', antal: 5, anskaffelseskurs: 12400, aktuelKurs: 10280, aktivType: 'AKTIE_DK', gruppe: 'DANSKE_AKTIER' },
  // Udenlandske aktier
  { id: 'apple', navn: 'Apple Inc', isin: 'US0378331005', valuta: 'USD', antal: 25, anskaffelseskurs: 143, aktuelKurs: 185, aktivType: 'AKTIE_UDENLANDSK', gruppe: 'UDENLANDSKE_AKTIER' },
  { id: 'nvidia', navn: 'NVIDIA Corp', isin: 'US67066G1040', valuta: 'USD', antal: 15, anskaffelseskurs: 450, aktuelKurs: 890, aktivType: 'AKTIE_UDENLANDSK', gruppe: 'UDENLANDSKE_AKTIER' },
  { id: 'tesla', navn: 'Tesla Inc', isin: 'US88160R1014', valuta: 'USD', antal: 20, anskaffelseskurs: 249, aktuelKurs: 175, aktivType: 'AKTIE_UDENLANDSK', gruppe: 'UDENLANDSKE_AKTIER' },
  { id: 'microsoft', navn: 'Microsoft Corp', isin: 'US5949181045', valuta: 'USD', antal: 12, anskaffelseskurs: 320, aktuelKurs: 415, aktivType: 'AKTIE_UDENLANDSK', gruppe: 'UDENLANDSKE_AKTIER' },
];

// ETF'er på positivlisten (tilladt på ASK, børneopsparing, pension)
const ETF_POSITIVLISTE: BaseAktiv[] = [
  { id: 'ishares-world', navn: 'iShares Core MSCI World', isin: 'IE00B4L5Y983', valuta: 'EUR', antal: 80, anskaffelseskurs: 65, aktuelKurs: 82, aktivType: 'ETF_POSITIVLISTE', gruppe: 'ETF_POSITIVLISTE' },
  { id: 'ishares-sp500', navn: 'iShares Core S&P 500', isin: 'IE00B5BMR087', valuta: 'USD', antal: 60, anskaffelseskurs: 380, aktuelKurs: 520, aktivType: 'ETF_POSITIVLISTE', gruppe: 'ETF_POSITIVLISTE' },
  { id: 'vanguard-ftse', navn: 'Vanguard FTSE All-World', isin: 'IE00B3RBWM25', valuta: 'EUR', antal: 100, anskaffelseskurs: 95, aktuelKurs: 112, aktivType: 'ETF_POSITIVLISTE', gruppe: 'ETF_POSITIVLISTE' },
];

// Danske inv.foreninger (tilladt på ASK, børneopsparing, pension)
const INVF_DANSKE: BaseAktiv[] = [
  { id: 'sparindex-global', navn: 'Sparindex INDEX Globale Aktier', isin: 'DK0060747822', valuta: 'DKK', antal: 200, anskaffelseskurs: 185, aktuelKurs: 218, aktivType: 'INVF_UDBYTTEBETALTENDE', gruppe: 'INVF_UDBYTTEBETALTENDE' },
  { id: 'sparindex-akk', navn: 'Sparindex INDEX Globale Aktier Akk.', isin: 'DK0061410420', valuta: 'DKK', antal: 150, anskaffelseskurs: 142, aktuelKurs: 168, aktivType: 'INVF_AKKUMULERENDE', gruppe: 'INVF_AKKUMULERENDE' },
  { id: 'danske-inv', navn: 'Danske Invest Danmark Indeks', isin: 'DK0060238178', valuta: 'DKK', antal: 120, anskaffelseskurs: 210, aktuelKurs: 245, aktivType: 'INVF_UDBYTTEBETALTENDE', gruppe: 'INVF_UDBYTTEBETALTENDE' },
];

// ETF'er IKKE på positivlisten (kun frit depot og pension - LAGER/KAPITALINDKOMST)
const ETF_IKKE_POSITIVLISTE: BaseAktiv[] = [
  { id: 'vanguard-sp500-us', navn: 'Vanguard S&P 500 ETF (US)', isin: 'US9229083632', valuta: 'USD', antal: 30, anskaffelseskurs: 420, aktuelKurs: 485, aktivType: 'ETF_IKKE_POSITIVLISTE', gruppe: 'ETF_IKKE_POSITIVLISTE' },
  { id: 'invesco-qqq', navn: 'Invesco QQQ Trust', isin: 'US46090E1038', valuta: 'USD', antal: 15, anskaffelseskurs: 320, aktuelKurs: 425, aktivType: 'ETF_IKKE_POSITIVLISTE', gruppe: 'ETF_IKKE_POSITIVLISTE' },
  { id: 'ark-innovation', navn: 'ARK Innovation ETF', isin: 'US00214Q1040', valuta: 'USD', antal: 50, anskaffelseskurs: 42, aktuelKurs: 38, aktivType: 'ETF_IKKE_POSITIVLISTE', gruppe: 'ETF_IKKE_POSITIVLISTE' },
];

// Obligationsbaserede ETF'er (kun frit depot og pension - KAPITALINDKOMST)
const ETF_OBLIGATIONER: BaseAktiv[] = [
  { id: 'ishares-corp-bond', navn: 'iShares Euro Corp Bond', isin: 'IE0032523478', valuta: 'EUR', antal: 100, anskaffelseskurs: 125, aktuelKurs: 118, aktivType: 'ETF_OBLIGATIONSBASERET', gruppe: 'ETF_OBLIGATIONSBASERET' },
  { id: 'xtrackers-govt', navn: 'Xtrackers Global Govt Bond', isin: 'LU0378818131', valuta: 'EUR', antal: 80, anskaffelseskurs: 210, aktuelKurs: 228, aktivType: 'ETF_OBLIGATIONSBASERET', gruppe: 'ETF_OBLIGATIONSBASERET' },
];

// Unoterede aktier (KUN frit depot)
const UNOTEREDE_AKTIER: BaseAktiv[] = [
  { id: 'startup-ai', navn: 'AI Startup ApS', isin: '', valuta: 'DKK', antal: 500, anskaffelseskurs: 100, aktuelKurs: 45, aktivType: 'AKTIE_UNOTERET', gruppe: 'UDENLANDSKE_AKTIER' },
  { id: 'greentech', navn: 'GreenTech Solutions A/S', isin: '', valuta: 'DKK', antal: 1000, anskaffelseskurs: 50, aktuelKurs: 72, aktivType: 'AKTIE_UNOTERET', gruppe: 'UDENLANDSKE_AKTIER' },
];

// Finansielle kontrakter (KUN frit depot)
const FINANSIELLE_KONTRAKTER: BaseAktiv[] = [
  { id: 'tesla-call', navn: 'Tesla Call Option Mar26', isin: '', valuta: 'USD', antal: 10, anskaffelseskurs: 1500, aktuelKurs: 850, aktivType: 'FINANSIEL_KONTRAKT', gruppe: 'FINANSIEL_KONTRAKT' },
  { id: 'apple-call', navn: 'Apple Call Option Jun26', isin: '', valuta: 'USD', antal: 20, anskaffelseskurs: 450, aktuelKurs: 1250, aktivType: 'FINANSIEL_KONTRAKT', gruppe: 'FINANSIEL_KONTRAKT' },
];

// ============================================================
// HELPER: Opret PortfolioAsset fra base
// ============================================================

function createAsset(
  base: BaseAktiv,
  kontoType: PortfolioAsset['kontoType'],
  kontoNavn: string,
  tabsPulje: PortfolioAsset['tabsPulje']
): PortfolioAsset {
  const værdi = base.antal * base.aktuelKurs;
  const anskaffelsessum = base.antal * base.anskaffelseskurs;
  const urealiseret = værdi - anskaffelsessum;

  return {
    id: `${base.id}-${kontoType}`,
    navn: base.navn,
    isin: base.isin,
    valuta: base.valuta,
    antal: base.antal,
    anskaffelseskurs: base.anskaffelseskurs,
    aktuelKurs: base.aktuelKurs,
    værdi,
    urealiseret,
    ureasliseretPct: anskaffelsessum > 0 ? (urealiseret / anskaffelsessum) * 100 : 0,
    kontoNavn,
    aktivType: base.aktivType,
    kontoType,
    tabsPulje,
    gruppe: base.gruppe,
  };
}

// ============================================================
// PLAYGROUND ASSETS - GENERERET
// ============================================================

export const PLAYGROUND_ASSETS: PortfolioAsset[] = [
  // ============================================================
  // FRIT DEPOT - Alle aktivtyper tilladt
  // ============================================================

  // Noterede aktier (aktieindkomst, realisation)
  ...NOTEREDE_AKTIER.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', 'NOTERET_AKTIE')),

  // ETF positivliste (aktieindkomst, LAGER)
  ...ETF_POSITIVLISTE.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', 'NOTERET_AKTIE')),

  // Danske inv.foreninger
  ...INVF_DANSKE.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', 'NOTERET_AKTIE')),

  // ETF ikke-positivliste (KAPITALINDKOMST, LAGER - ingen tabsbank!)
  ...ETF_IKKE_POSITIVLISTE.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', null)),

  // Obligationsbaserede ETF'er (KAPITALINDKOMST, LAGER)
  ...ETF_OBLIGATIONER.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', null)),

  // Unoterede aktier (aktieindkomst, realisation, UNOTERET_AKTIE pulje)
  ...UNOTEREDE_AKTIER.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', 'UNOTERET_AKTIE')),

  // Finansielle kontrakter (KAPITALINDKOMST, LAGER, isoleret pulje)
  ...FINANSIELLE_KONTRAKTER.map(a => createAsset(a, 'FRIT_DEPOT', 'Frie midler', 'FINANSIEL_KONTRAKT')),

  // ============================================================
  // ASK - Kun noterede aktier, positivliste-ETF, visse inv.foreninger
  // 17% lagerbeskatning, ALLE aktiver nettes på kontoen
  // ============================================================

  // Noterede aktier (et udvalg)
  createAsset(NOTEREDE_AKTIER[0], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // Novo
  createAsset(NOTEREDE_AKTIER[4], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // Mærsk (tab)
  createAsset(NOTEREDE_AKTIER[5], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // Apple
  createAsset(NOTEREDE_AKTIER[6], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // Nvidia

  // ETF positivliste
  createAsset(ETF_POSITIVLISTE[0], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // iShares World
  createAsset(ETF_POSITIVLISTE[1], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // iShares S&P 500

  // Danske inv.foreninger
  createAsset(INVF_DANSKE[0], 'ASK', 'Aktiesparekonto Nordnet', 'ASK_ISOLERET'), // Sparindex Global

  // ============================================================
  // BØRNEOPSPARING - Samme tilladelser som ASK, skattefri
  // ============================================================

  // Noterede aktier
  createAsset(NOTEREDE_AKTIER[0], 'BOERNEOPSPARING', 'Børneopsparing Nordea', null), // Novo (skattefri)
  createAsset(NOTEREDE_AKTIER[7], 'BOERNEOPSPARING', 'Børneopsparing Nordea', null), // Tesla (tab, skattefri)

  // ETF positivliste
  createAsset(ETF_POSITIVLISTE[2], 'BOERNEOPSPARING', 'Børneopsparing Nordea', null), // Vanguard All-World

  // Danske inv.foreninger
  createAsset(INVF_DANSKE[1], 'BOERNEOPSPARING', 'Børneopsparing Nordea', null), // Sparindex Akk.

  // ============================================================
  // RATEPENSION - De fleste aktivtyper (undtagen unoterede, fin. kontrakter)
  // 15,3% PAL lagerbeskatning, ALLE aktiver nettes på kontoen
  // ============================================================

  // Noterede aktier
  createAsset(NOTEREDE_AKTIER[0], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Novo
  createAsset(NOTEREDE_AKTIER[1], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // DSV
  createAsset(NOTEREDE_AKTIER[3], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Ørsted (tab)
  createAsset(NOTEREDE_AKTIER[8], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Microsoft

  // ETF positivliste
  createAsset(ETF_POSITIVLISTE[0], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // iShares World
  createAsset(ETF_POSITIVLISTE[2], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Vanguard

  // ETF ikke-positivliste (tilladt på pension!)
  createAsset(ETF_IKKE_POSITIVLISTE[0], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Vanguard S&P 500 (US)

  // Obligationsbaserede ETF'er (tilladt på pension)
  createAsset(ETF_OBLIGATIONER[0], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // iShares Corp Bond
  createAsset(ETF_OBLIGATIONER[1], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Xtrackers Govt

  // Danske inv.foreninger
  createAsset(INVF_DANSKE[2], 'RATEPENSION', 'Ratepension PFA', 'PENSION_ISOLERET'), // Danske Invest

  // ============================================================
  // ALDERSOPSPARING - Samme tilladelser som ratepension
  // 15,3% PAL lagerbeskatning
  // ============================================================

  createAsset(NOTEREDE_AKTIER[5], 'ALDERSOPSPARING', 'Aldersopsparing Saxo', 'PENSION_ISOLERET'), // Apple
  createAsset(NOTEREDE_AKTIER[2], 'ALDERSOPSPARING', 'Aldersopsparing Saxo', 'PENSION_ISOLERET'), // Vestas (tab)
  createAsset(ETF_POSITIVLISTE[1], 'ALDERSOPSPARING', 'Aldersopsparing Saxo', 'PENSION_ISOLERET'), // iShares S&P 500
  createAsset(ETF_IKKE_POSITIVLISTE[1], 'ALDERSOPSPARING', 'Aldersopsparing Saxo', 'PENSION_ISOLERET'), // Invesco QQQ
];

// ============================================================
// STATISTIK
// ============================================================

export const PLAYGROUND_STATS = {
  totalAssets: PLAYGROUND_ASSETS.length,
  totalVærdi: PLAYGROUND_ASSETS.reduce((sum, a) => sum + a.værdi, 0),
  totalUrealiseret: PLAYGROUND_ASSETS.reduce((sum, a) => sum + a.urealiseret, 0),
  medGevinst: PLAYGROUND_ASSETS.filter(a => a.urealiseret > 0).length,
  medTab: PLAYGROUND_ASSETS.filter(a => a.urealiseret < 0).length,
  kontoer: [...new Set(PLAYGROUND_ASSETS.map(a => a.kontoNavn))],
  perKontoType: {
    FRIT_DEPOT: PLAYGROUND_ASSETS.filter(a => a.kontoType === 'FRIT_DEPOT').length,
    ASK: PLAYGROUND_ASSETS.filter(a => a.kontoType === 'ASK').length,
    BOERNEOPSPARING: PLAYGROUND_ASSETS.filter(a => a.kontoType === 'BOERNEOPSPARING').length,
    RATEPENSION: PLAYGROUND_ASSETS.filter(a => a.kontoType === 'RATEPENSION').length,
    ALDERSOPSPARING: PLAYGROUND_ASSETS.filter(a => a.kontoType === 'ALDERSOPSPARING').length,
  },
};
