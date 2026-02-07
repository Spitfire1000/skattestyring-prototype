/**
 * TRANSAKTIONS PANEL
 *
 * Viser transaktioner grupperet per år med gevinst/tab og modregning.
 */

import { useMemo } from 'react';
import type { TabsPulje } from '../types/skat';
import type { PortfolioAsset } from '../services/csvParser';

// ============================================================
// TYPES
// ============================================================

export interface Transaktion {
  id: string;
  år: number;
  type: 'KØB' | 'SALG';
  assetId: string;
  assetNavn: string;
  aktivType: string;
  kontoType: string;
  kontoNavn: string;
  antal: number;
  kurs: number;
  anskaffelseskurs: number;
  beløb: number;           // Salgssum
  gevinstTab: number;      // Gevinst (+) eller tab (-)
  tabsPulje: TabsPulje | null;
  modregnet: number;       // Hvor meget tab blev brugt til modregning
  nettoGevinstTab: number; // gevinstTab efter modregning
  lovhenvisning: string;
  dato: Date;
}

interface TransaktionsPanelProps {
  transaktioner: Transaktion[];
  aktivtÅr: number;
  onFjernTransaktion?: (id: string) => void;
}

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

function formatDato(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function TransaktionsPanel({
  transaktioner,
  aktivtÅr,
  onFjernTransaktion,
}: TransaktionsPanelProps) {
  // Grupper transaktioner per år
  const transaktionerPerÅr = useMemo(() => {
    const grouped = new Map<number, Transaktion[]>();

    for (const t of transaktioner) {
      const existing = grouped.get(t.år) || [];
      existing.push(t);
      grouped.set(t.år, existing);
    }

    // Sorter årene faldende
    return Array.from(grouped.entries())
      .sort(([a], [b]) => b - a)
      .map(([år, trans]) => ({
        år,
        transaktioner: trans.sort((a, b) => b.dato.getTime() - a.dato.getTime()),
      }));
  }, [transaktioner]);

  // Beregn totaler for aktivt år
  const aktivÅrsTotaler = useMemo(() => {
    const årTransaktioner = transaktioner.filter(t => t.år === aktivtÅr && t.type === 'SALG');

    return {
      gevinst: årTransaktioner.filter(t => t.gevinstTab > 0).reduce((sum, t) => sum + t.gevinstTab, 0),
      tab: årTransaktioner.filter(t => t.gevinstTab < 0).reduce((sum, t) => sum + Math.abs(t.gevinstTab), 0),
      modregnet: årTransaktioner.reduce((sum, t) => sum + t.modregnet, 0),
      netto: årTransaktioner.reduce((sum, t) => sum + t.nettoGevinstTab, 0),
    };
  }, [transaktioner, aktivtÅr]);

  return (
    <div className="flex flex-col bg-[#0d1321]">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <h2 className="text-sm font-bold text-white">TRANSAKTIONER</h2>
        <p className="text-[10px] text-white/40">Simulerede køb og salg</p>
      </div>

      {/* Content */}
      <div>
        {transaktioner.length === 0 ? (
          <div className="p-4 text-center text-white/40 text-xs">
            <p className="mb-2">Ingen transaktioner endnu</p>
            <p className="text-[10px]">Klik "Sælg" på et aktiv for at simulere et salg</p>
          </div>
        ) : (
          <div className="p-2">
            {transaktionerPerÅr.map(({ år, transaktioner }) => (
              <ÅrsGruppe
                key={år}
                år={år}
                transaktioner={transaktioner}
                erAktivtÅr={år === aktivtÅr}
                onFjern={onFjernTransaktion}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer med totaler for aktivt år */}
      {transaktioner.some(t => t.år === aktivtÅr) && (
        <div className="p-3 border-t border-white/10 bg-white/5">
          <div className="text-[10px] text-white/50 mb-1">År {aktivtÅr} total:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div>
              <span className="text-white/50">Gevinst: </span>
              <span className="text-green-400">+{formatKr(aktivÅrsTotaler.gevinst)}</span>
            </div>
            <div>
              <span className="text-white/50">Tab: </span>
              <span className="text-red-400">-{formatKr(aktivÅrsTotaler.tab)}</span>
            </div>
            {aktivÅrsTotaler.modregnet > 0 && (
              <div className="col-span-2">
                <span className="text-white/50">Modregnet: </span>
                <span className="text-yellow-400">-{formatKr(aktivÅrsTotaler.modregnet)}</span>
              </div>
            )}
            <div className="col-span-2 pt-1 border-t border-white/10">
              <span className="text-white/50">Netto: </span>
              <span className={aktivÅrsTotaler.netto >= 0 ? 'text-green-400' : 'text-red-400'}>
                {aktivÅrsTotaler.netto >= 0 ? '+' : ''}{formatKr(aktivÅrsTotaler.netto)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ÅRS GRUPPE
// ============================================================

interface ÅrsGruppeProps {
  år: number;
  transaktioner: Transaktion[];
  erAktivtÅr: boolean;
  onFjern?: (id: string) => void;
}

function ÅrsGruppe({ år, transaktioner, erAktivtÅr, onFjern }: ÅrsGruppeProps) {
  const totalGevinstTab = transaktioner
    .filter(t => t.type === 'SALG')
    .reduce((sum, t) => sum + t.gevinstTab, 0);

  return (
    <div className={`mb-3 ${erAktivtÅr ? '' : 'opacity-60'}`}>
      {/* År header */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{år}</span>
          {erAktivtÅr && (
            <span className="px-1.5 py-0.5 text-[8px] bg-blue-500/30 text-blue-300 rounded">
              AKTIVT
            </span>
          )}
        </div>
        <span className={`text-[10px] ${totalGevinstTab >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalGevinstTab >= 0 ? '+' : ''}{formatKr(totalGevinstTab)}
        </span>
      </div>

      {/* Transaktioner */}
      <div className="space-y-1">
        {transaktioner.map((t) => (
          <TransaktionRow
            key={t.id}
            transaktion={t}
            onFjern={onFjern ? () => onFjern(t.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TRANSAKTION ROW
// ============================================================

interface TransaktionRowProps {
  transaktion: Transaktion;
  onFjern?: () => void;
}

function TransaktionRow({ transaktion: t, onFjern }: TransaktionRowProps) {
  const isGevinst = t.gevinstTab >= 0;
  const harModregning = t.modregnet > 0;

  return (
    <div className="bg-white/[0.02] rounded p-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-[10px] px-1 rounded ${
              t.type === 'SALG'
                ? isGevinst ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {t.type}
            </span>
            <span className="text-xs font-medium text-white truncate">
              {t.assetNavn}
            </span>
          </div>

          <div className="text-[10px] text-white/40 mt-0.5">
            {t.antal} stk @ {formatKr(t.kurs)} kr
            <span className="text-white/20 mx-1">|</span>
            {formatDato(t.dato)}
          </div>

          {t.type === 'SALG' && (
            <div className="mt-1 space-y-0.5">
              <div className="text-[10px]">
                <span className="text-white/40">G/T: </span>
                <span className={isGevinst ? 'text-green-400' : 'text-red-400'}>
                  {isGevinst ? '+' : ''}{formatKr(t.gevinstTab)}
                </span>
              </div>

              {harModregning && (
                <div className="text-[10px]">
                  <span className="text-white/40">Modregnet: </span>
                  <span className="text-yellow-400">-{formatKr(t.modregnet)}</span>
                </div>
              )}

              {harModregning && (
                <div className="text-[10px]">
                  <span className="text-white/40">Netto: </span>
                  <span className={t.nettoGevinstTab >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {t.nettoGevinstTab >= 0 ? '+' : ''}{formatKr(t.nettoGevinstTab)}
                  </span>
                </div>
              )}

              {t.tabsPulje && (
                <div className="text-[9px] text-white/30 mt-1">
                  → {t.tabsPulje.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          )}
        </div>

        {onFjern && (
          <button
            onClick={onFjern}
            className="ml-2 text-white/30 hover:text-red-400 transition-colors"
            title="Fjern transaktion"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPER: Opret transaktion fra asset
// ============================================================

export function createSalgsTransaktion(
  asset: PortfolioAsset,
  år: number,
  modregnet: number = 0,
): Transaktion {
  const gevinstTab = asset.urealiseret;

  return {
    id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    år,
    type: 'SALG',
    assetId: asset.id,
    assetNavn: asset.navn,
    aktivType: asset.aktivType,
    kontoType: asset.kontoType,
    kontoNavn: asset.kontoNavn,
    antal: asset.antal,
    kurs: asset.aktuelKurs,
    anskaffelseskurs: asset.anskaffelseskurs,
    beløb: asset.værdi,
    gevinstTab,
    tabsPulje: asset.tabsPulje,
    modregnet,
    nettoGevinstTab: gevinstTab > 0 ? gevinstTab - modregnet : gevinstTab,
    lovhenvisning: getLovhenvisning(asset),
    dato: new Date(år, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  };
}

function getLovhenvisning(asset: PortfolioAsset): string {
  switch (asset.aktivType) {
    case 'AKTIE_DK':
    case 'AKTIE_UDENLANDSK':
      return 'ABL § 12 (realisation)';
    case 'ETF_POSITIVLISTE':
      return 'ABL § 19 (lager)';
    case 'ETF_IKKE_POSITIVLISTE':
      return 'KGL § 29 (kapitalindkomst)';
    case 'INVF_AKKUMULERENDE':
      return 'ABL § 19 (lager)';
    default:
      return 'ABL § 12';
  }
}

export default TransaktionsPanel;
