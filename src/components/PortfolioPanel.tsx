/**
 * PORTFOLIO PANEL
 *
 * Viser portefølje med køb/sælg funktionalitet.
 * Grupperet efter KONTO først, derefter aktivtype.
 */

import { useState, useRef, useMemo } from 'react';
import type { PortfolioAsset } from '../services/csvParser';
import { parsePortfolioCSV } from '../services/csvParser';
import type { Transaktion } from './TransaktionsPanel';

// ============================================================
// TYPES
// ============================================================

interface PortfolioPanelProps {
  portfolio: PortfolioAsset[];
  onPortfolioChange: (assets: PortfolioAsset[]) => void;
  transaktioner: Transaktion[];
  onSælg: (asset: PortfolioAsset) => void;
  aktivtÅr: number;
}

interface KontoGruppe {
  kontoNavn: string;
  kontoType: string;
  assets: PortfolioAsset[];
  totalVærdi: number;
  totalUrealiseret: number;
  color: string;
  skatteBeskrivelse: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

const KONTO_INFO: Record<string, { color: string; skatte: string }> = {
  'FRIT_DEPOT': { color: 'blue', skatte: '27%/42%' },
  'ASK': { color: 'green', skatte: '17% lager' },
  'RATEPENSION': { color: 'purple', skatte: '15,3% PAL' },
  'ALDERSOPSPARING': { color: 'purple', skatte: '15,3% PAL' },
  'KAPITALPENSION': { color: 'purple', skatte: '15,3% PAL' },
  'LIVRENTE': { color: 'purple', skatte: '15,3% PAL' },
  'BOERNEOPSPARING': { color: 'yellow', skatte: '0% skattefri' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PortfolioPanel({
  portfolio,
  onPortfolioChange,
  transaktioner,
  onSælg,
  aktivtÅr,
}: PortfolioPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedKonti, setExpandedKonti] = useState<Set<string>>(
    new Set(['Frie midler', 'Aktiesparekonto', 'Ratepension', 'Aldersopsparing'])
  );

  // Grupper assets efter konto
  const kontoGrupper = useMemo((): KontoGruppe[] => {
    const grouped = new Map<string, PortfolioAsset[]>();

    for (const asset of portfolio) {
      const key = asset.kontoNavn;
      const existing = grouped.get(key) || [];
      existing.push(asset);
      grouped.set(key, existing);
    }

    const result: KontoGruppe[] = [];

    // Sorter i fast rækkefølge
    const kontoOrder = ['Frie midler', 'Aktiesparekonto', 'Ratepension', 'Aldersopsparing', 'Kapitalpension', 'Livrente', 'Børneopsparing'];

    for (const kontoNavn of kontoOrder) {
      const assets = grouped.get(kontoNavn);
      if (assets && assets.length > 0) {
        const kontoType = assets[0].kontoType;
        const info = KONTO_INFO[kontoType] || { color: 'gray', skatte: '?' };

        result.push({
          kontoNavn,
          kontoType,
          assets: assets.sort((a, b) => Math.abs(b.urealiseret) - Math.abs(a.urealiseret)),
          totalVærdi: assets.reduce((sum, a) => sum + a.værdi, 0),
          totalUrealiseret: assets.reduce((sum, a) => sum + a.urealiseret, 0),
          color: info.color,
          skatteBeskrivelse: info.skatte,
        });
      }
    }

    // Tilføj evt. ukendte konti
    for (const [kontoNavn, assets] of grouped) {
      if (!kontoOrder.includes(kontoNavn)) {
        const kontoType = assets[0].kontoType;
        const info = KONTO_INFO[kontoType] || { color: 'gray', skatte: '?' };

        result.push({
          kontoNavn,
          kontoType,
          assets: assets.sort((a, b) => Math.abs(b.urealiseret) - Math.abs(a.urealiseret)),
          totalVærdi: assets.reduce((sum, a) => sum + a.værdi, 0),
          totalUrealiseret: assets.reduce((sum, a) => sum + a.urealiseret, 0),
          color: info.color,
          skatteBeskrivelse: info.skatte,
        });
      }
    }

    return result;
  }, [portfolio]);

  // Find solgte assets i det aktive år
  const solgteIÅr = useMemo(() => {
    return new Set(
      transaktioner
        .filter(t => t.år === aktivtÅr && t.type === 'SALG')
        .map(t => t.assetId)
    );
  }, [transaktioner, aktivtÅr]);

  // Handle CSV upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const assets = parsePortfolioCSV(content);
        onPortfolioChange(assets);
      } catch (error) {
        console.error('Fejl ved parsing af CSV:', error);
        alert('Kunne ikke læse CSV-filen. Kontroller formatet.');
      }
    };
    reader.readAsText(file);
  };

  // Toggle konto
  const toggleKonto = (kontoNavn: string) => {
    setExpandedKonti(prev => {
      const next = new Set(prev);
      if (next.has(kontoNavn)) {
        next.delete(kontoNavn);
      } else {
        next.add(kontoNavn);
      }
      return next;
    });
  };

  // Total stats
  const totalVærdi = portfolio.reduce((sum, a) => sum + a.værdi, 0);
  const totalUrealiseret = portfolio.reduce((sum, a) => sum + a.urealiseret, 0);

  return (
    <div className="h-full flex flex-col bg-[#0d1321]">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white">PORTEFØLJE</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-[10px] bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
          >
            Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Totals */}
        {portfolio.length > 0 && (
          <div className="text-[10px] text-white/50">
            <div>Værdi: <span className="text-white">{formatKr(totalVærdi)} kr</span></div>
            <div>
              Urealiseret:{' '}
              <span className={totalUrealiseret >= 0 ? 'text-green-400' : 'text-red-400'}>
                {totalUrealiseret >= 0 ? '+' : ''}{formatKr(totalUrealiseret)} kr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {portfolio.length === 0 ? (
          <div className="p-4 text-center text-white/40 text-xs">
            <p className="mb-2">Ingen portefølje indlæst</p>
            <p className="text-[10px]">Upload en CSV-fil fra Nordnet eller Saxo</p>
          </div>
        ) : (
          <div className="p-2">
            {kontoGrupper.map((gruppe) => (
              <KontoSection
                key={gruppe.kontoNavn}
                gruppe={gruppe}
                isExpanded={expandedKonti.has(gruppe.kontoNavn)}
                onToggle={() => toggleKonto(gruppe.kontoNavn)}
                solgteIÅr={solgteIÅr}
                onSælg={onSælg}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// KONTO SECTION
// ============================================================

interface KontoSectionProps {
  gruppe: KontoGruppe;
  isExpanded: boolean;
  onToggle: () => void;
  solgteIÅr: Set<string>;
  onSælg: (asset: PortfolioAsset) => void;
}

function KontoSection({ gruppe, isExpanded, onToggle, solgteIÅr, onSælg }: KontoSectionProps) {
  const isPositive = gruppe.totalUrealiseret >= 0;

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    gray: { bg: 'bg-white/5', border: 'border-white/20', text: 'text-white/60' },
  };

  const colors = colorClasses[gruppe.color] || colorClasses.gray;

  return (
    <div className="mb-3">
      {/* Konto header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2 ${colors.bg} border ${colors.border} rounded-lg transition-colors hover:brightness-110`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">{isExpanded ? '▼' : '▶'}</span>
          <div>
            <div className={`text-xs font-bold ${colors.text}`}>{gruppe.kontoNavn}</div>
            <div className="text-[9px] text-white/40">{gruppe.skatteBeskrivelse} • {gruppe.assets.length} aktiver</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatKr(gruppe.totalUrealiseret)}
          </div>
          <div className="text-[9px] text-white/40">{formatKr(gruppe.totalVærdi)} kr</div>
        </div>
      </button>

      {/* Assets */}
      {isExpanded && (
        <div className="mt-1 ml-2 space-y-1">
          {gruppe.assets.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              isSolgt={solgteIÅr.has(asset.id)}
              onSælg={() => onSælg(asset)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ASSET ROW
// ============================================================

interface AssetRowProps {
  asset: PortfolioAsset;
  isSolgt: boolean;
  onSælg: () => void;
}

function AssetRow({ asset, isSolgt, onSælg }: AssetRowProps) {
  const isPositive = asset.urealiseret >= 0;

  // Aktivtype badge
  const getTypeBadge = () => {
    switch (asset.aktivType) {
      case 'AKTIE_DK': return { label: 'DK', color: 'text-blue-400 bg-blue-500/20' };
      case 'AKTIE_UDENLANDSK': return { label: 'UDL', color: 'text-cyan-400 bg-cyan-500/20' };
      case 'ETF_POSITIVLISTE': return { label: 'ETF+', color: 'text-green-400 bg-green-500/20' };
      case 'ETF_IKKE_POSITIVLISTE': return { label: 'ETF!', color: 'text-yellow-400 bg-yellow-500/20' };
      case 'INVF_UDBYTTEBETALTENDE': return { label: 'INV', color: 'text-purple-400 bg-purple-500/20' };
      case 'INVF_AKKUMULERENDE': return { label: 'INV•', color: 'text-purple-400 bg-purple-500/20' };
      default: return { label: '?', color: 'text-white/40 bg-white/10' };
    }
  };

  const badge = getTypeBadge();

  return (
    <div
      className={`flex items-center justify-between p-2 rounded text-xs ${
        isSolgt
          ? 'bg-white/5 opacity-40'
          : 'bg-white/[0.02] hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isSolgt && <span className="text-green-400 text-[10px]">✓</span>}
          <span className={`px-1 py-0.5 text-[8px] rounded ${badge.color}`}>{badge.label}</span>
          <span className={`font-medium truncate ${isSolgt ? 'text-white/50 line-through' : 'text-white'}`}>
            {asset.navn}
          </span>
        </div>
        <div className="text-[9px] text-white/40 mt-0.5">
          {asset.antal} stk @ {formatKr(asset.anskaffelseskurs)} kr
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <div className="text-right">
          <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatKr(asset.urealiseret)}
          </div>
          <div className="text-[9px] text-white/40">
            {asset.ureasliseretPct >= 0 ? '+' : ''}{asset.ureasliseretPct.toFixed(0)}%
          </div>
        </div>

        {!isSolgt && (
          <button
            onClick={onSælg}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              isPositive
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
          >
            Sælg
          </button>
        )}
      </div>
    </div>
  );
}

export default PortfolioPanel;
