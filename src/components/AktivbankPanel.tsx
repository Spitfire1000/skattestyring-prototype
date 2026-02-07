/**
 * AKTIVBANK PANEL
 *
 * Viser ALLE aktiver i en bank.
 * Aktiver er grå som standard, og farves efter kontotype når de matcher flowchart-selection.
 * [SÆLG] knap vises kun på matchende aktiver der ikke allerede er solgt.
 */

import { useMemo } from 'react';
import type { PortfolioAsset } from '../services/csvParser';
import type { FlowSelection } from './InteractiveFlowChart';
import type { KontoType, AktivType } from '../types/skat';

// ============================================================
// TYPES
// ============================================================

interface AktivbankPanelProps {
  assets: PortfolioAsset[];
  selection: FlowSelection;
  solgteIds: Set<string>;
  onSælg: (asset: PortfolioAsset) => void;
}

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

// Matcher aktivtype fra asset til flowchart selection
function matchAktivType(assetType: string, selectionType: AktivType): boolean {
  // AKTIE matcher både DK og udenlandsk
  if (selectionType === 'AKTIE_DK') {
    return assetType === 'AKTIE_DK' || assetType === 'AKTIE_UDENLANDSK';
  }
  return assetType === selectionType;
}

// Farvekodning baseret på kontotype
const KONTO_FARVER: Record<KontoType, { bg: string; border: string; text: string; badge: string }> = {
  FRIT_DEPOT: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    badge: 'bg-blue-500/30 text-blue-300',
  },
  ASK: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    badge: 'bg-green-500/30 text-green-300',
  },
  BOERNEOPSPARING: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/30 text-cyan-300',
  },
  RATEPENSION: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/30 text-yellow-300',
  },
  ALDERSOPSPARING: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/30 text-yellow-300',
  },
  LIVRENTE: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    badge: 'bg-orange-500/30 text-orange-300',
  },
  KAPITALPENSION: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    badge: 'bg-orange-500/30 text-orange-300',
  },
};

// Grå farver for ikke-matchende
const GRAY_FARVER = {
  bg: 'bg-white/[0.02]',
  border: 'border-white/10',
  text: 'text-white/30',
  badge: 'bg-white/10 text-white/30',
};

// Aktivtype labels
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
// MAIN COMPONENT
// ============================================================

export function AktivbankPanel({
  assets,
  selection,
  solgteIds,
  onSælg,
}: AktivbankPanelProps) {
  // Beregn hvilke aktiver der matcher selection
  const assetStates = useMemo(() => {
    return assets.map(asset => {
      const isSolgt = solgteIds.has(asset.id);

      // Ingen selektion = alle grå
      if (!selection.konto) {
        return { asset, isMatching: false, isSolgt };
      }

      // Check konto match
      const kontoMatch = asset.kontoType === selection.konto ||
        // Pension matcher alle pensionstyper
        (selection.konto === 'RATEPENSION' &&
         ['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(asset.kontoType));

      if (!kontoMatch) {
        return { asset, isMatching: false, isSolgt };
      }

      // Kun konto valgt = match
      if (!selection.aktiv) {
        return { asset, isMatching: true, isSolgt };
      }

      // Både konto og aktiv valgt = check aktivtype
      const aktivMatch = matchAktivType(asset.aktivType, selection.aktiv);
      return { asset, isMatching: aktivMatch, isSolgt };
    });
  }, [assets, selection, solgteIds]);

  // Sorter: matchende først, derefter solgte sidst
  const sortedAssets = useMemo(() => {
    return [...assetStates].sort((a, b) => {
      // Solgte sidst
      if (a.isSolgt !== b.isSolgt) return a.isSolgt ? 1 : -1;
      // Matchende først
      if (a.isMatching !== b.isMatching) return a.isMatching ? -1 : 1;
      // Derefter efter absolut urealiseret værdi
      return Math.abs(b.asset.urealiseret) - Math.abs(a.asset.urealiseret);
    });
  }, [assetStates]);

  // Stats
  const matchCount = assetStates.filter(s => s.isMatching && !s.isSolgt).length;
  const totalCount = assets.length;
  const solgtCount = solgteIds.size;

  return (
    <div className="h-full flex flex-col bg-[#0d1321]">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">AKTIVBANK</h2>
          <div className="text-[10px] text-white/50">
            {matchCount > 0 ? (
              <span className="text-blue-400">{matchCount} matchende</span>
            ) : selection.konto ? (
              <span className="text-white/30">Vælg aktivtype</span>
            ) : (
              <span className="text-white/30">Vælg konto i flowchart</span>
            )}
            {' • '}
            {totalCount} aktiver
            {solgtCount > 0 && <span className="text-green-400"> • {solgtCount} solgt</span>}
          </div>
        </div>

        {/* Instruktion */}
        {!selection.konto && (
          <div className="mt-2 text-[10px] text-white/40 bg-white/5 rounded p-2">
            Klik på en kontotype i flowchartet til venstre for at se matchende aktiver
          </div>
        )}
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {sortedAssets.map(({ asset, isMatching, isSolgt }) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              isMatching={isMatching}
              isSolgt={isSolgt}
              canSell={isMatching && !isSolgt && !!selection.aktiv}
              onSælg={() => onSælg(asset)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ASSET ROW
// ============================================================

interface AssetRowProps {
  asset: PortfolioAsset;
  isMatching: boolean;
  isSolgt: boolean;
  canSell: boolean;
  onSælg: () => void;
}

function AssetRow({ asset, isMatching, isSolgt, canSell, onSælg }: AssetRowProps) {
  const isPositive = asset.urealiseret >= 0;
  const farver = isMatching ? KONTO_FARVER[asset.kontoType as KontoType] || GRAY_FARVER : GRAY_FARVER;

  return (
    <div
      className={`
        flex items-center justify-between p-2 rounded-lg border transition-all duration-200
        ${farver.bg} ${farver.border}
        ${isSolgt ? 'opacity-40' : ''}
        ${isMatching && !isSolgt ? 'shadow-sm' : ''}
      `}
    >
      {/* Left: Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {/* Solgt checkmark */}
          {isSolgt && <span className="text-green-400 text-xs">✓</span>}

          {/* Aktivtype badge */}
          <span className={`px-1.5 py-0.5 text-[8px] font-medium rounded ${farver.badge}`}>
            {AKTIVTYPE_LABELS[asset.aktivType] || '?'}
          </span>

          {/* Navn */}
          <span className={`font-medium text-xs truncate ${isSolgt ? 'line-through' : ''} ${farver.text}`}>
            {asset.navn}
          </span>
        </div>

        {/* Konto info */}
        <div className={`text-[9px] mt-0.5 ${isMatching ? 'text-white/40' : 'text-white/20'}`}>
          {asset.kontoNavn} • {asset.antal} stk
        </div>
      </div>

      {/* Right: Value + Button */}
      <div className="flex items-center gap-2 ml-2">
        {/* Urealiseret */}
        <div className="text-right">
          <div className={`text-xs font-medium ${
            isMatching
              ? isPositive ? 'text-green-400' : 'text-red-400'
              : 'text-white/30'
          }`}>
            {isPositive ? '+' : ''}{formatKr(asset.urealiseret)}
          </div>
          <div className={`text-[9px] ${isMatching ? 'text-white/40' : 'text-white/20'}`}>
            {asset.ureasliseretPct >= 0 ? '+' : ''}{asset.ureasliseretPct.toFixed(0)}%
          </div>
        </div>

        {/* Sælg knap */}
        {canSell ? (
          <button
            onClick={onSælg}
            className={`
              px-2 py-1 text-[10px] font-medium rounded transition-colors
              ${isPositive
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }
            `}
          >
            Sælg
          </button>
        ) : (
          <div className="w-[42px]" /> // Placeholder for alignment
        )}
      </div>
    </div>
  );
}

export default AktivbankPanel;
