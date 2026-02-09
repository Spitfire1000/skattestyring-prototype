/**
 * DYNAMISK LAGERBESKATNING PANEL
 *
 * Viser løbende skattepligt på lagerbeskattede aktiver.
 * Skat der skal betales ved årsskiftet - uanset om man sælger eller ej.
 *
 * Opdelt per konto:
 * - ASK: 17% lager, nettes på kontoniveau
 * - Pension: 15,3% PAL, nettes på kontoniveau
 * - Børneopsparing: Skattefri
 * - Frit Depot: Opdelt i aktieindkomst (27%/42%) og kapitalindkomst (~37%)
 */

import { useMemo, useState } from 'react';
import type { PortfolioAsset } from '../services/csvParser';
import {
  beregnDynamiskLagerSkat,
  formatKr,
  formatPct,
} from '../services/dynamiskLagerSkat';
import type {
  DynamiskLagerOversigt,
  KontoLagerSkat,
  AktivLagerSkat,
} from '../types/lagerSkat';

// ============================================================
// TYPES
// ============================================================

interface DynamiskLagerSkatPanelProps {
  aktiver: PortfolioAsset[];
  skatteår: number;
  erGift: boolean;
  realiseretAktieindkomst?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const KONTO_FARVER: Record<string, { text: string; bg: string; border: string; accent: string }> = {
  ASK: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    accent: 'bg-green-500/20',
  },
  RATEPENSION: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    accent: 'bg-yellow-500/20',
  },
  ALDERSOPSPARING: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    accent: 'bg-yellow-500/20',
  },
  KAPITALPENSION: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    accent: 'bg-orange-500/20',
  },
  LIVRENTE: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    accent: 'bg-orange-500/20',
  },
  BOERNEOPSPARING: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    accent: 'bg-cyan-500/20',
  },
  FRIT_DEPOT: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accent: 'bg-blue-500/20',
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DynamiskLagerSkatPanel({
  aktiver,
  skatteår,
  erGift,
  realiseretAktieindkomst = 0,
}: DynamiskLagerSkatPanelProps) {
  // Beregn dynamisk lagerbeskatning
  const oversigt = useMemo((): DynamiskLagerOversigt | null => {
    if (aktiver.length === 0) return null;

    return beregnDynamiskLagerSkat(aktiver, {
      skatteår,
      civilstand: erGift ? 'GIFT' : 'ENLIG',
      realiseretAktieindkomstIÅret: realiseretAktieindkomst,
    });
  }, [aktiver, skatteår, erGift, realiseretAktieindkomst]);

  // Ingen aktiver
  if (!oversigt) {
    return (
      <div className="border border-white/20 rounded-lg bg-[#0d1321] p-4">
        <div className="text-[10px] text-white/50 uppercase mb-2">DYNAMISK LAGERBESKATNING</div>
        <div className="text-center text-white/40 text-xs py-4">
          <p>Ingen lagerbeskattede aktiver</p>
          <p className="text-[10px] mt-1">Køb aktiver på ASK, pension, eller lager-ETF'er</p>
        </div>
      </div>
    );
  }

  // Ingen lagerbeskattet
  const harLagerAktiver =
    oversigt.konti.length > 0 ||
    oversigt.fritDepot.aktieindkomst.aktiver.length > 0 ||
    oversigt.fritDepot.kapitalindkomst.aktiver.length > 0;

  if (!harLagerAktiver) {
    return (
      <div className="border border-white/20 rounded-lg bg-[#0d1321] p-4">
        <div className="text-[10px] text-white/50 uppercase mb-2">DYNAMISK LAGERBESKATNING</div>
        <div className="text-center text-white/40 text-xs py-4">
          <p>Ingen lagerbeskattede aktiver i porteføljen</p>
          <p className="text-[10px] mt-1">Kun realisationsbeskattede aktiver (aktier, udb. fonde)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/20 rounded-lg bg-[#0d1321] overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Dynamisk Lagerbeskatning
            </h2>
            <p className="text-[10px] text-white/50 mt-0.5">
              Estimeret skat ved årsskiftet {skatteår} - opdateres løbende
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-400">
              {formatKr(oversigt.samletEstimeretSkat)} kr
            </div>
            <div className="text-[9px] text-white/40">samlet estimeret</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Konti (ASK, pension, børneopsparing) */}
        {oversigt.konti.map((konto) => (
          <KontoSektion key={konto.kontoId} konto={konto} />
        ))}

        {/* Frit Depot - Aktieindkomst */}
        {oversigt.fritDepot.aktieindkomst.aktiver.length > 0 && (
          <FritDepotAktieindkomstSektion
            data={oversigt.fritDepot.aktieindkomst}
            skatteår={skatteår}
          />
        )}

        {/* Frit Depot - Kapitalindkomst */}
        {oversigt.fritDepot.kapitalindkomst.aktiver.length > 0 && (
          <FritDepotKapitalindkomstSektion
            data={oversigt.fritDepot.kapitalindkomst}
            skatteår={skatteår}
            erGift={erGift}
          />
        )}

        {/* Totaler */}
        <div className="pt-3 border-t border-white/20 space-y-2">
          {/* Opdeling */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 rounded p-2">
              <div className="text-white/40 mb-1">Automatisk trukket</div>
              <div className="text-white font-mono">{formatKr(oversigt.skatAutomatiskTrukket)} kr</div>
              <div className="text-[9px] text-white/30 mt-0.5">ASK + pension (af udbyder)</div>
            </div>
            <div className="bg-white/5 rounded p-2">
              <div className="text-white/40 mb-1">Via årsopgørelse</div>
              <div className="text-white font-mono">{formatKr(oversigt.skatViaÅrsopgørelse)} kr</div>
              <div className="text-[9px] text-white/30 mt-0.5">Frit depot lager-aktiver</div>
            </div>
          </div>

          {/* Skattefri */}
          {oversigt.skattefriÆndring !== 0 && (
            <div className="text-[10px] text-cyan-400 bg-cyan-500/10 rounded px-2 py-1">
              Børneopsparing: {oversigt.skattefriÆndring >= 0 ? '+' : ''}{formatKr(oversigt.skattefriÆndring)} kr (skattefri)
            </div>
          )}

          {/* Fremførte tab */}
          {oversigt.fremførteTilNæsteÅr.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
              <div className="text-[10px] text-red-400 font-semibold mb-1">Fremførte tab:</div>
              {oversigt.fremførteTilNæsteÅr.map((tab) => (
                <div key={tab.kontoId} className="text-[10px] text-white/70">
                  {tab.kontoNavn}: {formatKr(tab.beløb)} kr
                  <span className="text-white/40 ml-1">- {tab.note}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-white font-semibold">Samlet estimeret lagerskat:</span>
            <span className="text-xl font-bold text-orange-400">
              {formatKr(oversigt.samletEstimeretSkat)} kr
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <div className="text-[9px] text-white/40 bg-white/5 rounded p-2">
          Beregnet {oversigt.beregnetTidspunkt.toLocaleString('da-DK')} |{' '}
          {erGift ? 'Gift' : 'Enlig'} | Skatteår {skatteår}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KONTO SEKTION (ASK, PENSION, BØRNEOPSPARING)
// ============================================================

interface KontoSektionProps {
  konto: KontoLagerSkat;
}

function KontoSektion({ konto }: KontoSektionProps) {
  const [expanded, setExpanded] = useState(false);
  const farver = KONTO_FARVER[konto.kontoType] || KONTO_FARVER.FRIT_DEPOT;

  const erNegativ = konto.nettetBeskatningsgrundlag < 0;
  const erSkattefri = konto.kontoType === 'BOERNEOPSPARING';

  return (
    <div className={`rounded-lg border ${farver.border} ${farver.bg}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {konto.kontoType === 'ASK' && '💹'}
            {konto.kontoType === 'BOERNEOPSPARING' && '👶'}
            {['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(konto.kontoType) && '🏦'}
          </span>
          <div>
            <div className={`text-sm font-bold ${farver.text}`}>
              {konto.kontoNavn}
            </div>
            <div className="text-[10px] text-white/50">
              {konto.aktiver.length} aktiver | {formatPct(konto.skattesats)} lagerbeskatning
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${
            erSkattefri ? 'text-cyan-400' :
            erNegativ ? 'text-red-400' :
            konto.estimeretSkat > 0 ? 'text-orange-400' : 'text-white/50'
          }`}>
            {erSkattefri ? '0 kr' :
             erNegativ ? `Fremføres: ${formatKr(Math.abs(konto.nettetBeskatningsgrundlag))} kr` :
             `${formatKr(konto.estimeretSkat)} kr`}
          </div>
          <div className="text-[9px] text-white/40">
            {expanded ? '▲' : '▼'} {konto.aktiver.length} aktiver
          </div>
        </div>
      </button>

      {/* Netting info */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div>
            <span className="text-white/40">Primo:</span>
            <span className="text-white ml-1">{formatKr(konto.samletPrimo)}</span>
          </div>
          <div>
            <span className="text-white/40">Aktuel:</span>
            <span className="text-white ml-1">{formatKr(konto.samletAktuelVærdi)}</span>
          </div>
          <div>
            <span className="text-white/40">Ændring:</span>
            <span className={`ml-1 ${konto.samletÆndring >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {konto.samletÆndring >= 0 ? '+' : ''}{formatKr(konto.samletÆndring)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded: Aktiver */}
      {expanded && (
        <div className="border-t border-white/10 p-3">
          <div className="text-[9px] text-white/40 uppercase mb-2">Per-aktiv (indikativt - kontoen nettes)</div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {konto.aktiver.map((aktiv) => (
              <AktivRække key={aktiv.aktivId} aktiv={aktiv} farver={farver} />
            ))}
          </div>

          {/* Beregning */}
          <div className="mt-3 pt-3 border-t border-white/10 bg-white/5 rounded p-2">
            <div className="text-[9px] text-white/40 uppercase mb-1">BEREGNING (NETTET)</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/50">Samlet ændring:</span>
                <span className={konto.samletÆndring >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {konto.samletÆndring >= 0 ? '+' : ''}{formatKr(konto.samletÆndring)} kr
                </span>
              </div>
              {!erSkattefri && konto.nettetBeskatningsgrundlag > 0 && (
                <>
                  <div className="flex justify-between text-white/50">
                    <span>Skat ({formatPct(konto.skattesats)}):</span>
                    <span>{formatKr(konto.samletÆndring)} × {formatPct(konto.skattesats)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-white/10">
                    <span className="text-white">Estimeret skat:</span>
                    <span className="text-orange-400">{formatKr(konto.estimeretSkat)} kr</span>
                  </div>
                </>
              )}
              {!erSkattefri && konto.nettetBeskatningsgrundlag < 0 && (
                <div className="text-red-400 text-[10px] mt-1">
                  Negativt resultat: {formatKr(konto.nettetBeskatningsgrundlag)} kr fremføres til næste år
                </div>
              )}
              {erSkattefri && (
                <div className="text-cyan-400 text-[10px] mt-1">
                  Skattefri konto - ingen skat
                </div>
              )}
            </div>
          </div>

          {konto.note && (
            <div className="mt-2 text-[9px] text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
              {konto.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FRIT DEPOT AKTIEINDKOMST
// ============================================================

interface FritDepotAktieindkomstSektionProps {
  data: {
    aktiver: AktivLagerSkat[];
    samletÆndring: number;
    estimeretSkat: number;
    under27pctBeløb: number;
    over42pctBeløb: number;
  };
  skatteår: number;
}

function FritDepotAktieindkomstSektion({ data, skatteår }: FritDepotAktieindkomstSektionProps) {
  const [expanded, setExpanded] = useState(false);
  const farver = KONTO_FARVER.FRIT_DEPOT;

  return (
    <div className={`rounded-lg border ${farver.border} ${farver.bg}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <div>
            <div className={`text-sm font-bold ${farver.text}`}>
              Frit Depot - Aktieindkomst (lager)
            </div>
            <div className="text-[10px] text-white/50">
              {data.aktiver.length} aktiver | ETF positivliste, akk. inv.foreninger
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${
            data.estimeretSkat > 0 ? 'text-orange-400' : 'text-white/50'
          }`}>
            {formatKr(data.estimeretSkat)} kr
          </div>
          <div className="text-[9px] text-white/40">
            {expanded ? '▲' : '▼'} progressiv 27%/42%
          </div>
        </div>
      </button>

      {/* Summary */}
      <div className="px-3 pb-2">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/40">Samlet ændring:</span>
          <span className={data.samletÆndring >= 0 ? 'text-green-400' : 'text-red-400'}>
            {data.samletÆndring >= 0 ? '+' : ''}{formatKr(data.samletÆndring)} kr
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-white/10 p-3">
          <div className="text-[9px] text-white/40 uppercase mb-2">Aktiver</div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {data.aktiver.map((aktiv) => (
              <AktivRække key={aktiv.aktivId} aktiv={aktiv} farver={farver} />
            ))}
          </div>

          {/* Beregning */}
          {data.samletÆndring > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 bg-white/5 rounded p-2">
              <div className="text-[9px] text-white/40 uppercase mb-1">PROGRESSIV BEREGNING</div>
              <div className="space-y-1 text-[10px]">
                {data.under27pctBeløb > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Under grænse (27%):</span>
                    <span className="text-white">{formatKr(data.under27pctBeløb)} × 27% = {formatKr(data.under27pctBeløb * 0.27)}</span>
                  </div>
                )}
                {data.over42pctBeløb > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Over grænse (42%):</span>
                    <span className="text-white">{formatKr(data.over42pctBeløb)} × 42% = {formatKr(data.over42pctBeløb * 0.42)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-white/10">
                  <span className="text-white">Estimeret skat:</span>
                  <span className="text-orange-400">{formatKr(data.estimeretSkat)} kr</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 text-[9px] text-blue-400 bg-blue-500/10 rounded px-2 py-1">
            Betales via årsopgørelsen for {skatteår}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FRIT DEPOT KAPITALINDKOMST
// ============================================================

interface FritDepotKapitalindkomstSektionProps {
  data: {
    aktiver: AktivLagerSkat[];
    samletÆndring: number;
    estimeretSkat: number;
    erTab: boolean;
    fradragsværdi?: number;
  };
  skatteår: number;
  erGift: boolean;
}

function FritDepotKapitalindkomstSektion({ data, skatteår, erGift }: FritDepotKapitalindkomstSektionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="text-sm font-bold text-amber-400">
              Frit Depot - Kapitalindkomst (lager)
            </div>
            <div className="text-[10px] text-white/50">
              {data.aktiver.length} aktiver | ETF ikke-positivliste, obligationer
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${
            data.erTab ? 'text-green-400' : 'text-orange-400'
          }`}>
            {data.erTab
              ? `-${formatKr(data.fradragsværdi || 0)} kr fradrag`
              : `${formatKr(data.estimeretSkat)} kr`}
          </div>
          <div className="text-[9px] text-white/40">
            {expanded ? '▲' : '▼'} {data.erTab ? '~33%/~25% fradrag' : '~37% skat'}
          </div>
        </div>
      </button>

      {/* Summary */}
      <div className="px-3 pb-2">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/40">Samlet ændring:</span>
          <span className={data.samletÆndring >= 0 ? 'text-green-400' : 'text-red-400'}>
            {data.samletÆndring >= 0 ? '+' : ''}{formatKr(data.samletÆndring)} kr
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-white/10 p-3">
          <div className="text-[9px] text-white/40 uppercase mb-2">Aktiver</div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {data.aktiver.map((aktiv) => (
              <AktivRække
                key={aktiv.aktivId}
                aktiv={aktiv}
                farver={{ text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', accent: 'bg-amber-500/20' }}
              />
            ))}
          </div>

          {/* Beregning */}
          <div className="mt-3 pt-3 border-t border-white/10 bg-white/5 rounded p-2">
            <div className="text-[9px] text-white/40 uppercase mb-1">
              {data.erTab ? 'PSL § 11 FRADRAGSBEREGNING' : 'SKATTEBEREGNING'}
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/50">Samlet ændring:</span>
                <span className={data.samletÆndring >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {data.samletÆndring >= 0 ? '+' : ''}{formatKr(data.samletÆndring)} kr
                </span>
              </div>

              {data.erTab ? (
                <>
                  <div className="text-[9px] text-amber-400 mt-1">
                    Asymmetrisk fradrag: ~33% op til {erGift ? '100.000' : '50.000'} kr, ~25% derover
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-white/10">
                    <span className="text-white">Fradragsværdi:</span>
                    <span className="text-green-400">-{formatKr(data.fradragsværdi || 0)} kr</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-white/50">
                    <span>Skat (~37%):</span>
                    <span>{formatKr(data.samletÆndring)} × 37%</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-white/10">
                    <span className="text-white">Estimeret skat:</span>
                    <span className="text-orange-400">{formatKr(data.estimeretSkat)} kr</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 text-[9px] text-amber-400 bg-amber-500/10 rounded px-2 py-1">
            Betales via årsopgørelsen for {skatteår} | INGEN fremførsel!
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AKTIV RÆKKE
// ============================================================

interface AktivRækkeProps {
  aktiv: AktivLagerSkat;
  farver: { text: string; bg: string; border: string; accent: string };
}

function AktivRække({ aktiv, farver }: AktivRækkeProps) {
  return (
    <div className="flex items-center justify-between text-[10px] bg-black/20 rounded px-2 py-1.5">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`px-1 py-0.5 rounded text-[8px] ${farver.accent} ${farver.text}`}>
          {aktiv.aktivType.replace(/_/g, ' ').substring(0, 6)}
        </span>
        <span className="text-white/70 truncate">{aktiv.navn}</span>
      </div>
      <div className="flex items-center gap-3 ml-2">
        <div className="text-right">
          <div className="text-[9px] text-white/40">
            {formatKr(aktiv.primo)} → {formatKr(aktiv.aktuelVærdi)}
          </div>
          <div className={aktiv.ændring >= 0 ? 'text-green-400' : 'text-red-400'}>
            {aktiv.ændring >= 0 ? '+' : ''}{formatKr(aktiv.ændring)}
          </div>
        </div>
        <div className="text-right w-16">
          <div className="text-[9px] text-white/40">skat</div>
          <div className={aktiv.estimeretSkat >= 0 ? 'text-orange-400' : 'text-green-400'}>
            {aktiv.estimeretSkat >= 0 ? '' : '-'}{formatKr(Math.abs(aktiv.estimeretSkat))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DynamiskLagerSkatPanel;
