/**
 * SKATTEBEREGNING BAR
 *
 * Viser årets samlede skatteberegning OPDELT PER KONTO
 * med fuld gennemsigtighed: transaktioner → beregning → skat
 */

import { useMemo } from 'react';
import type { Transaktion } from './TransaktionsPanel';
import type { KontoType, TabsPulje, KapitalindkomstSaldo } from '../types/skat';
import { getSatserForÅr, beregnKapitalindkomstFradrag } from '../constants/skatteRegler';

// ============================================================
// TYPES
// ============================================================

interface SkatteberegningBarProps {
  transaktioner: Transaktion[];
  skatteår: number;
  erGift: boolean;
  kapitalIndkomstSaldo?: KapitalindkomstSaldo;
}

interface TransaktionDetalje {
  id: string;
  navn: string;
  aktivType: string;
  aktivLabel: string;
  gevinstTab: number;
  modregnet: number;
  netto: number;
  tabsPulje: TabsPulje | null;
}

interface KontoBeregning {
  kontoType: KontoType;
  kontoNavn: string;
  farve: { text: string; bg: string; border: string };
  transaktioner: TransaktionDetalje[];

  // For FRIT_DEPOT: separat aktie- og kapitalindkomst
  aktieindkomst?: {
    transaktioner: TransaktionDetalje[];
    gevinst: number;
    tab: number;
    modregnet: number;
    netto: number;
    lavSkatBeløb: number;
    højSkatBeløb: number;
    skat: number;
  };

  kapitalindkomst?: {
    transaktioner: TransaktionDetalje[];
    netto: number;
    skat: number;
    erFradrag: boolean;
  };

  // For ASK, Pension, Børneopsparing: simpel beregning
  simpel?: {
    netto: number;
    skat: number;
    sats: number;
  };

  totalSkat: number;
  totalFradrag: number;
  advarsel?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const KONTO_INFO: Record<KontoType, { navn: string; farve: { text: string; bg: string; border: string } }> = {
  FRIT_DEPOT: {
    navn: 'Frit Depot',
    farve: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  },
  ASK: {
    navn: 'Aktiesparekonto (ASK)',
    farve: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  },
  BOERNEOPSPARING: {
    navn: 'Børneopsparing',
    farve: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  },
  RATEPENSION: {
    navn: 'Ratepension',
    farve: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  },
  ALDERSOPSPARING: {
    navn: 'Aldersopsparing',
    farve: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  },
  LIVRENTE: {
    navn: 'Livrente',
    farve: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  },
  KAPITALPENSION: {
    navn: 'Kapitalpension',
    farve: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  },
};

const AKTIVTYPE_LABELS: Record<string, string> = {
  'AKTIE_DK': 'DK',
  'AKTIE_UDENLANDSK': 'UDL',
  'ETF_POSITIVLISTE': 'ETF+',
  'ETF_IKKE_POSITIVLISTE': 'ETF!',
  'INVF_UDBYTTEBETALTENDE': 'INV',
  'INVF_AKKUMULERENDE': 'INV*',
  'FINANSIEL_KONTRAKT': 'FIN',
};

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

function erKapitalindkomst(aktivType: string): boolean {
  return ['ETF_IKKE_POSITIVLISTE', 'FINANSIEL_KONTRAKT'].includes(aktivType);
}

function erPensionskonto(kontoType: string): boolean {
  return ['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(kontoType);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SkatteberegningBar({
  transaktioner,
  skatteår,
  erGift,
  kapitalIndkomstSaldo,
}: SkatteberegningBarProps) {
  const satser = useMemo(() => getSatserForÅr(skatteår), [skatteår]);
  const grænse = erGift ? satser.aktieindkomst.grænseGift : satser.aktieindkomst.grænseEnlig;

  // Beregn kapitalindkomst fra saldo (hvis tilgængelig)
  const kapitalindkomstBeregning = useMemo(() => {
    if (!kapitalIndkomstSaldo || kapitalIndkomstSaldo.beløb === 0) return null;

    const netto = kapitalIndkomstSaldo.beløb;
    const erFradrag = netto < 0;

    if (erFradrag) {
      const fradrag = beregnKapitalindkomstFradrag(netto, skatteår, erGift);
      return {
        netto,
        skat: fradrag.totalFradrag,
        erFradrag: true,
        detaljer: fradrag,
      };
    } else {
      const skat = netto * satser.kapitalindkomst.gevinstSats;
      return {
        netto,
        skat,
        erFradrag: false,
        detaljer: null,
      };
    }
  }, [kapitalIndkomstSaldo, skatteår, erGift, satser]);

  // Beregn skatteposition per konto
  const kontoBeregninger = useMemo((): KontoBeregning[] => {
    const årTransaktioner = transaktioner.filter(t => t.år === skatteår && t.type === 'SALG');

    // Gruppér per kontotype
    const grouped = new Map<string, Transaktion[]>();
    for (const t of årTransaktioner) {
      const key = t.kontoType;
      const existing = grouped.get(key) || [];
      existing.push(t);
      grouped.set(key, existing);
    }

    const result: KontoBeregning[] = [];

    for (const [kontoType, trans] of grouped) {
      const info = KONTO_INFO[kontoType as KontoType];
      if (!info) continue;

      // Konverter til detaljer
      const allDetaljer: TransaktionDetalje[] = trans.map(t => ({
        id: t.id,
        navn: t.assetNavn,
        aktivType: t.aktivType,
        aktivLabel: AKTIVTYPE_LABELS[t.aktivType] || '?',
        gevinstTab: t.gevinstTab,
        modregnet: t.modregnet,
        netto: t.nettoGevinstTab,
        tabsPulje: t.tabsPulje,
      }));

      const beregning: KontoBeregning = {
        kontoType: kontoType as KontoType,
        kontoNavn: info.navn,
        farve: info.farve,
        transaktioner: allDetaljer,
        totalSkat: 0,
        totalFradrag: 0,
      };

      // FRIT DEPOT: Kun aktieindkomst (kapitalindkomst håndteres via saldo)
      if (kontoType === 'FRIT_DEPOT') {
        const aktieTrans = allDetaljer.filter(t => !erKapitalindkomst(t.aktivType));
        // Kapitalindkomst filtreres fra her - håndteres via kapitalIndkomstSaldo i stedet

        // Aktieindkomst
        if (aktieTrans.length > 0) {
          const gevinst = aktieTrans.filter(t => t.gevinstTab > 0).reduce((s, t) => s + t.gevinstTab, 0);
          const tab = aktieTrans.filter(t => t.gevinstTab < 0).reduce((s, t) => s + Math.abs(t.gevinstTab), 0);
          const modregnet = aktieTrans.reduce((s, t) => s + t.modregnet, 0);
          const netto = gevinst - tab - modregnet;

          // Progressiv skat
          const lavSkatBeløb = Math.min(Math.max(0, netto), grænse);
          const højSkatBeløb = Math.max(0, netto - grænse);
          const skat = netto > 0
            ? lavSkatBeløb * satser.aktieindkomst.lavSats + højSkatBeløb * satser.aktieindkomst.højSats
            : 0;

          beregning.aktieindkomst = {
            transaktioner: aktieTrans,
            gevinst,
            tab,
            modregnet,
            netto,
            lavSkatBeløb,
            højSkatBeløb,
            skat,
          };
          beregning.totalSkat += skat;
        }

        // Kapitalindkomst - BRUG SALDO (ikke transaktioner direkte)
        // Kapitalindkomst håndteres via års-saldo, ikke via transaktion-sum
        // (dette sikrer korrekt PSL § 11 beregning på tværs af alle handler)
      }
      // ASK
      else if (kontoType === 'ASK') {
        const netto = allDetaljer.reduce((s, t) => s + t.netto, 0);
        const skat = netto > 0 ? netto * satser.ask.sats : 0;

        beregning.simpel = {
          netto,
          skat,
          sats: satser.ask.sats,
        };
        beregning.totalSkat = skat;
        beregning.advarsel = 'Tab i ASK kan KUN modregnes i samme ASK-konto';
      }
      // BØRNEOPSPARING
      else if (kontoType === 'BOERNEOPSPARING') {
        const netto = allDetaljer.reduce((s, t) => s + t.netto, 0);

        beregning.simpel = {
          netto,
          skat: 0,
          sats: 0,
        };
        beregning.totalSkat = 0;
        beregning.advarsel = 'Skattefri konto - ingen skat af gevinst';
      }
      // PENSION
      else if (erPensionskonto(kontoType)) {
        const netto = allDetaljer.reduce((s, t) => s + t.netto, 0);
        const skat = netto > 0 ? netto * satser.pension.palSats : 0;

        beregning.simpel = {
          netto,
          skat,
          sats: satser.pension.palSats,
        };
        beregning.totalSkat = skat;
        beregning.advarsel = 'PAL-skat betales automatisk af pensionsselskabet';
      }

      result.push(beregning);
    }

    // Sortér: Frit Depot først, derefter ASK, derefter resten
    const order: KontoType[] = ['FRIT_DEPOT', 'ASK', 'BOERNEOPSPARING', 'RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'];
    result.sort((a, b) => order.indexOf(a.kontoType) - order.indexOf(b.kontoType));

    return result;
  }, [transaktioner, skatteår, satser, grænse]);

  // Totaler (inkl. kapitalindkomst fra saldo)
  const totalSkat = kontoBeregninger.reduce((s, k) => s + k.totalSkat, 0)
    + (kapitalindkomstBeregning && !kapitalindkomstBeregning.erFradrag ? kapitalindkomstBeregning.skat : 0);
  const totalFradrag = kontoBeregninger.reduce((s, k) => s + k.totalFradrag, 0)
    + (kapitalindkomstBeregning?.erFradrag ? kapitalindkomstBeregning.skat : 0);
  const harTransaktioner = kontoBeregninger.length > 0 || (kapitalIndkomstSaldo && kapitalIndkomstSaldo.beløb !== 0);

  if (!harTransaktioner) {
    return (
      <div className="text-center text-white/40 text-xs py-4">
        <p>Ingen transaktioner i {skatteår}</p>
        <p className="text-[10px] mt-1">Køb og sælg aktiver for at se skatteberegning</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/50">Progressionsgrænse:</span>
        <span className="text-white">{formatKr(grænse)} kr ({erGift ? 'gift' : 'enlig'})</span>
      </div>

      {/* Konto-sektioner */}
      {kontoBeregninger.map((konto) => (
        <KontoSektion key={konto.kontoType} konto={konto} satser={satser} />
      ))}

      {/* Kapitalindkomst-saldo (separat fra kontotyper) */}
      {kapitalindkomstBeregning && kapitalIndkomstSaldo && (
        <div className="rounded-lg border bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center justify-between p-2 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-yellow-400">KAPITALINDKOMST-SALDO</span>
              <span className="text-[9px] text-yellow-300/60 ml-2">({skatteår} – nulstilles 31. dec.)</span>
            </div>
            <span className={`text-xs font-mono ${
              kapitalindkomstBeregning.erFradrag ? 'text-green-400' : 'text-orange-400'
            }`}>
              {kapitalindkomstBeregning.erFradrag ? '-' : ''}{formatKr(kapitalindkomstBeregning.skat)} kr
            </span>
          </div>
          <div className="p-2 space-y-2">
            {/* Posteringer */}
            <div className="space-y-0.5">
              <div className="text-[9px] text-white/40 uppercase">Posteringer:</div>
              {kapitalIndkomstSaldo.posteringer.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[10px]">
                  <span className="text-white/70 truncate max-w-[120px]">{p.aktivNavn}</span>
                  <span className={p.beløb >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {p.beløb >= 0 ? '+' : ''}{formatKr(p.beløb)}
                  </span>
                </div>
              ))}
            </div>

            {/* Beregning */}
            <div className="bg-white/5 rounded p-2">
              <div className="text-[9px] text-white/40 uppercase mb-1">BEREGNING</div>
              <BeregningLinje label="Netto" værdi={kapitalindkomstBeregning.netto} bold />

              {kapitalindkomstBeregning.erFradrag && kapitalindkomstBeregning.detaljer && (
                <div className="mt-1 pt-1 border-t border-white/10 space-y-0.5">
                  <div className="text-[9px] text-yellow-400">PSL § 11 fradrag:</div>
                  <div className="text-[9px] text-white/50">
                    {formatKr(kapitalindkomstBeregning.detaljer.underGrænse)} × 33% = {formatKr(kapitalindkomstBeregning.detaljer.fradragUnder)}
                  </div>
                  {kapitalindkomstBeregning.detaljer.overGrænse > 0 && (
                    <div className="text-[9px] text-white/50">
                      {formatKr(kapitalindkomstBeregning.detaljer.overGrænse)} × 25% = {formatKr(kapitalindkomstBeregning.detaljer.fradragOver)}
                    </div>
                  )}
                  <BeregningLinje label="Fradrag" værdi={kapitalindkomstBeregning.skat} fradrag />
                </div>
              )}

              {!kapitalindkomstBeregning.erFradrag && (
                <div className="mt-1 pt-1 border-t border-white/10">
                  <div className="text-[9px] text-white/50">
                    {formatKr(kapitalindkomstBeregning.netto)} × 37% = {formatKr(kapitalindkomstBeregning.skat)}
                  </div>
                  <BeregningLinje label="Skat" værdi={kapitalindkomstBeregning.skat} skat />
                </div>
              )}
            </div>

            {/* Advarsel */}
            <div className="text-[9px] text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
              ⚠️ INGEN fremførsel – tab/gevinst modregnes straks i {skatteår}
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="pt-2 border-t border-white/20 space-y-1">
        {totalFradrag > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Samlet fradrag:</span>
            <span className="text-green-400">-{formatKr(totalFradrag)} kr</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span className="text-white">Samlet skat {skatteår}:</span>
          <span className="text-orange-400">{formatKr(totalSkat)} kr</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KONTO SEKTION
// ============================================================

interface KontoSektionProps {
  konto: KontoBeregning;
  satser: ReturnType<typeof getSatserForÅr>;
}

function KontoSektion({ konto, satser }: KontoSektionProps) {
  return (
    <div className={`rounded-lg border ${konto.farve.bg} ${konto.farve.border}`}>
      {/* Konto header */}
      <div className="flex items-center justify-between p-2 border-b border-white/10">
        <span className={`text-xs font-bold ${konto.farve.text}`}>
          {konto.kontoNavn}
        </span>
        <span className={`text-xs font-mono ${konto.totalSkat > 0 ? 'text-orange-400' : 'text-white/50'}`}>
          {konto.totalSkat > 0 ? `${formatKr(konto.totalSkat)} kr` : '0 kr'}
        </span>
      </div>

      <div className="p-2 space-y-2">
        {/* Transaktioner */}
        <div className="space-y-0.5">
          <div className="text-[9px] text-white/40 uppercase">Transaktioner:</div>
          {konto.transaktioner.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className={`px-1 py-0.5 rounded text-[8px] ${konto.farve.bg} ${konto.farve.text}`}>
                  {t.aktivLabel}
                </span>
                <span className="text-white/70 truncate max-w-[120px]">{t.navn}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={t.gevinstTab >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {t.gevinstTab >= 0 ? '+' : ''}{formatKr(t.gevinstTab)}
                </span>
                {t.tabsPulje && t.gevinstTab < 0 && (
                  <span className="text-[8px] text-white/30">
                    → {t.tabsPulje.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FRIT DEPOT: Aktieindkomst beregning */}
        {konto.aktieindkomst && (
          <BeregningBoks
            titel="AKTIEINDKOMST"
            farve={konto.farve}
          >
            <BeregningLinje label="Gevinst" værdi={konto.aktieindkomst.gevinst} positiv />
            {konto.aktieindkomst.tab > 0 && (
              <BeregningLinje label="Tab" værdi={-konto.aktieindkomst.tab} />
            )}
            {konto.aktieindkomst.modregnet > 0 && (
              <BeregningLinje label="Modregnet (tabsbank)" værdi={-konto.aktieindkomst.modregnet} highlight />
            )}
            <BeregningLinje label="Netto" værdi={konto.aktieindkomst.netto} bold />

            {konto.aktieindkomst.netto > 0 && (
              <div className="mt-1 pt-1 border-t border-white/10 space-y-0.5">
                {konto.aktieindkomst.lavSkatBeløb > 0 && (
                  <div className="text-[9px] text-white/50">
                    {formatKr(konto.aktieindkomst.lavSkatBeløb)} × 27% = {formatKr(konto.aktieindkomst.lavSkatBeløb * satser.aktieindkomst.lavSats)}
                  </div>
                )}
                {konto.aktieindkomst.højSkatBeløb > 0 && (
                  <div className="text-[9px] text-white/50">
                    {formatKr(konto.aktieindkomst.højSkatBeløb)} × 42% = {formatKr(konto.aktieindkomst.højSkatBeløb * satser.aktieindkomst.højSats)}
                    <span className="text-yellow-400 ml-1">(over grænse)</span>
                  </div>
                )}
                <BeregningLinje label="Skat" værdi={konto.aktieindkomst.skat} skat />
              </div>
            )}
          </BeregningBoks>
        )}

        {/* FRIT DEPOT: Kapitalindkomst beregning */}
        {konto.kapitalindkomst && (
          <BeregningBoks
            titel="KAPITALINDKOMST"
            farve={konto.farve}
          >
            <BeregningLinje label="Netto" værdi={konto.kapitalindkomst.netto} bold />
            <div className="text-[9px] text-white/50 mt-1">
              {formatKr(Math.abs(konto.kapitalindkomst.netto))} × {konto.kapitalindkomst.erFradrag ? '8%' : '37%'} = {formatKr(konto.kapitalindkomst.skat)}
            </div>
            {konto.kapitalindkomst.erFradrag ? (
              <BeregningLinje label="Fradrag" værdi={konto.kapitalindkomst.skat} fradrag />
            ) : (
              <BeregningLinje label="Skat" værdi={konto.kapitalindkomst.skat} skat />
            )}
            {konto.kapitalindkomst.erFradrag && (
              <div className="text-[9px] text-yellow-400 mt-1">
                OBS: Tab giver kun ~8% fradrag (PSL § 11), gevinst beskattes 37%
              </div>
            )}
          </BeregningBoks>
        )}

        {/* SIMPEL beregning (ASK, Pension, Børneopsparing) */}
        {konto.simpel && (
          <BeregningBoks titel="BEREGNING" farve={konto.farve}>
            <BeregningLinje label="Netto" værdi={konto.simpel.netto} bold />
            {konto.simpel.sats > 0 && konto.simpel.netto > 0 && (
              <>
                <div className="text-[9px] text-white/50 mt-1">
                  {formatKr(konto.simpel.netto)} × {(konto.simpel.sats * 100).toFixed(1).replace('.', ',')}% = {formatKr(konto.simpel.skat)}
                </div>
                <BeregningLinje label="Skat" værdi={konto.simpel.skat} skat />
              </>
            )}
            {konto.simpel.sats === 0 && (
              <div className="text-[9px] text-green-400 mt-1">Skattefri</div>
            )}
          </BeregningBoks>
        )}

        {/* Advarsel */}
        {konto.advarsel && (
          <div className="text-[9px] text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
            {konto.advarsel}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BEREGNING BOKS
// ============================================================

interface BeregningBoksProps {
  titel: string;
  farve: { text: string; bg: string; border: string };
  children: React.ReactNode;
}

function BeregningBoks({ titel, children }: BeregningBoksProps) {
  return (
    <div className="bg-white/5 rounded p-2">
      <div className="text-[9px] text-white/40 uppercase mb-1">{titel}</div>
      {children}
    </div>
  );
}

// ============================================================
// BEREGNING LINJE
// ============================================================

interface BeregningLinjeProps {
  label: string;
  værdi: number;
  positiv?: boolean;
  bold?: boolean;
  highlight?: boolean;
  skat?: boolean;
  fradrag?: boolean;
}

function BeregningLinje({ label, værdi, positiv, bold, highlight, skat, fradrag }: BeregningLinjeProps) {
  let farve = 'text-white/70';
  if (positiv || værdi > 0) farve = 'text-green-400';
  if (værdi < 0) farve = 'text-red-400';
  if (highlight) farve = 'text-yellow-400';
  if (skat) farve = 'text-orange-400';
  if (fradrag) farve = 'text-green-400';

  return (
    <div className={`flex justify-between text-[10px] ${bold ? 'font-semibold' : ''}`}>
      <span className="text-white/50">{label}:</span>
      <span className={farve}>
        {værdi >= 0 && !skat && !fradrag ? '+' : ''}{formatKr(værdi)} kr
      </span>
    </div>
  );
}

export default SkatteberegningBar;
