/**
 * TABSBANK PANEL
 *
 * Opdelt efter kontotype:
 * - FRIT DEPOT: Viser alle tabspuljer (noteret, unoteret, kapital, finansiel)
 *   → Kan deles med ægtefælles frie midler (OBLIGATORISK for noteret)
 * - ASK: Isoleret per konto (kan IKKE deles)
 * - BØRNEOPSPARING: Ikke relevant (skattefri)
 * - PENSION: Isoleret per konto (kan IKKE deles på tværs)
 */

import { useState } from 'react';
import type { TabsPulje, TabsbankState, TabPost, KontoType, AktivType, KapitalindkomstSaldo } from '../types/skat';
import { MODREGNING_REGLER, beregnKapitalindkomstFradrag, getSatserForÅr } from '../constants/skatteRegler';

// ============================================================
// TYPES
// ============================================================

interface TabsbankPanelProps {
  tabsbank: TabsbankState;
  onTilføjTab: (pulje: TabsPulje, post: Omit<TabPost, 'id'>) => void;
  onFjernTab: (pulje: TabsPulje, postId: string) => void;
  highlightPulje?: TabsPulje | null;
  skatteår: number;
  kapitalIndkomstSaldo?: KapitalindkomstSaldo;
  erGift?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const FRIT_DEPOT_PULJER: { pulje: TabsPulje; navn: string; ikon: string; beskrivelse: string; harTabsbank: boolean }[] = [
  {
    pulje: 'NOTERET_AKTIE',
    navn: 'Noterede aktier',
    ikon: '📈',
    beskrivelse: 'DK/udenlandske aktier, ETF+, inv.foreninger',
    harTabsbank: true,
  },
  {
    pulje: 'UNOTERET_AKTIE',
    navn: 'Unoterede aktier',
    ikon: '🏢',
    beskrivelse: 'Startup-aktier, anparter',
    harTabsbank: true,
  },
  {
    pulje: 'FINANSIEL_KONTRAKT',
    navn: 'Finansielle kontrakter',
    ikon: '📊',
    beskrivelse: 'Optioner, CFD, futures - isoleret pulje',
    harTabsbank: true,
  },
];

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n) + ' kr';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function TabsbankPanel({
  tabsbank,
  onTilføjTab,
  onFjernTab,
  highlightPulje,
  skatteår,
  kapitalIndkomstSaldo,
  erGift = false,
}: TabsbankPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [kapitalExpanded, setKapitalExpanded] = useState(false);

  // Hent dynamiske satser for skatteåret
  const satser = getSatserForÅr(skatteår);
  const fradragsSatsUnder = Math.round(satser.kapitalindkomst.tabFradragsværdiUnderGrænse * 100);
  const fradragsSatsOver = Math.round(satser.kapitalindkomst.tabFradragsværdiOverGrænse * 100);

  // Beregn totaler (kun puljer med tabsbank)
  const fritDepotTotal = FRIT_DEPOT_PULJER.filter(p => p.harTabsbank).reduce((sum, p) => sum + tabsbank[p.pulje].beløb, 0);
  const askTotal = tabsbank.ASK_ISOLERET.beløb;
  const pensionTotal = tabsbank.PENSION_ISOLERET.beløb;

  // Beregn kapitalindkomst PSL § 11 fradrag
  const kapitalFradrag = kapitalIndkomstSaldo && kapitalIndkomstSaldo.beløb < 0
    ? beregnKapitalindkomstFradrag(kapitalIndkomstSaldo.beløb, skatteår, erGift)
    : null;

  return (
    <div className="flex flex-col bg-gray-900/50">
      {/* Header */}
      <div className="p-3 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Tabsbank</h2>
          <span className="text-xs text-white/50">{skatteår}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 space-y-3">

        {/* ============================================ */}
        {/* FRIT DEPOT SEKTION */}
        {/* ============================================ */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5">
          <div className="p-2 border-b border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold text-xs">FRIT DEPOT</span>
              </div>
              {fritDepotTotal > 0 && (
                <span className="text-red-400 font-mono text-xs">-{formatKr(fritDepotTotal)}</span>
              )}
            </div>
            <div className="text-[9px] text-blue-300/70 mt-1">
              Tab kan bruges på ALLE dine og din ægtefælles frie depot-konti
            </div>
          </div>

          <div className="p-2 space-y-1">
            {FRIT_DEPOT_PULJER.filter(p => p.harTabsbank).map((config) => {
              const status = tabsbank[config.pulje];
              const regler = MODREGNING_REGLER[config.pulje];
              const isHighlighted = highlightPulje === config.pulje;

              return (
                <PuljeRow
                  key={config.pulje}
                  ikon={config.ikon}
                  navn={config.navn}
                  beskrivelse={config.beskrivelse}
                  beløb={status.beløb}
                  posteringer={status.posteringer}
                  isHighlighted={isHighlighted}
                  ægtefælleInfo={regler.obligatoriskÆgtefælle ? '👫 SKAL deles med ægtefælle' : '👫 Kan deles'}
                  onFjernPost={(postId) => onFjernTab(config.pulje, postId)}
                />
              );
            })}
          </div>

          {/* Forklaring */}
          <div className="px-2 pb-2">
            <div className="text-[9px] bg-blue-500/10 rounded p-1.5 text-blue-300/80">
              <strong>Ægtefælledeling:</strong> Tab i noterede aktier SKAL først bruges mod egen gevinst,
              derefter mod ægtefælles gevinst (obligatorisk). Ubrugt tab fremføres tidsubegrænset.
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* KAPITALINDKOMST-SALDO (SEPARAT - INGEN TABSBANK!) */}
        {/* ============================================ */}
        <div className={`rounded-xl border-2 ${
          kapitalIndkomstSaldo && kapitalIndkomstSaldo.beløb !== 0
            ? 'border-amber-500/50 bg-amber-900/30'
            : 'border-amber-500/30 bg-amber-900/20'
        }`}>
          <div className="p-3 border-b border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <span className="text-amber-400 font-bold text-xs">KAPITALINDKOMST-SALDO</span>
                  <span className="text-[9px] text-amber-300/60 ml-1">(nulstilles 31. dec. {skatteår})</span>
                </div>
              </div>
              {kapitalIndkomstSaldo && kapitalIndkomstSaldo.beløb !== 0 ? (
                <span className={`font-mono text-sm font-bold ${kapitalIndkomstSaldo.beløb >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {kapitalIndkomstSaldo.beløb >= 0 ? '+' : ''}{formatKr(kapitalIndkomstSaldo.beløb)}
                </span>
              ) : (
                <span className="text-[10px] text-amber-400/60 font-mono">0 kr</span>
              )}
            </div>
          </div>

          <button
            onClick={() => kapitalIndkomstSaldo && kapitalIndkomstSaldo.posteringer.length > 0 && setKapitalExpanded(!kapitalExpanded)}
            className="w-full text-left p-3"
            disabled={!kapitalIndkomstSaldo || kapitalIndkomstSaldo.posteringer.length === 0}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div className="flex-1">
                <div className="text-white text-[11px] font-medium">ETF ikke-positivliste, obligationer, blandede fonde</div>
                <div className="text-[9px] text-white/40">Gevinst/tab modregnes løbende i samme skatteår</div>
              </div>
              {kapitalIndkomstSaldo && kapitalIndkomstSaldo.posteringer.length > 0 && (
                <span className="text-[9px] text-white/30">{kapitalExpanded ? '▲' : '▼'}</span>
              )}
            </div>

            {/* Vis gevinst/tab opdeling */}
            {kapitalIndkomstSaldo && (kapitalIndkomstSaldo.gevinster > 0 || kapitalIndkomstSaldo.tab > 0) && (
              <div className="mt-2 flex gap-3 text-[10px]">
                {kapitalIndkomstSaldo.gevinster > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/40">Gevinst:</span>
                    <span className="text-green-400">+{formatKr(kapitalIndkomstSaldo.gevinster)}</span>
                  </div>
                )}
                {kapitalIndkomstSaldo.tab > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/40">Tab:</span>
                    <span className="text-red-400">-{formatKr(kapitalIndkomstSaldo.tab)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Vis PSL § 11 fradrag beregning hvis negativt */}
            {kapitalFradrag && (
              <div className="mt-3 pt-3 border-t border-amber-500/30">
                <div className="text-[10px] text-amber-400 font-semibold mb-2">PSL § 11 FRADRAGSVÆRDI:</div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/50">Under {formatKr(kapitalFradrag.psl11Grænse)} ({erGift ? 'gift' : 'enlig'}):</span>
                    <span className="text-white/70">{formatKr(kapitalFradrag.underGrænse)} × {fradragsSatsUnder}% = <span className="text-green-400">{formatKr(kapitalFradrag.fradragUnder)}</span></span>
                  </div>
                  {kapitalFradrag.overGrænse > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Over grænsen:</span>
                      <span className="text-white/70">{formatKr(kapitalFradrag.overGrænse)} × {fradragsSatsOver}% = <span className="text-green-400">{formatKr(kapitalFradrag.fradragOver)}</span></span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t border-amber-500/30">
                    <span className="text-white/80">Samlet fradrag:</span>
                    <span className="text-green-400 text-sm">{formatKr(kapitalFradrag.totalFradrag)}</span>
                  </div>
                </div>
              </div>
            )}
          </button>

          {/* Expanded: Posteringer */}
          {kapitalExpanded && kapitalIndkomstSaldo && kapitalIndkomstSaldo.posteringer.length > 0 && (
            <div className="border-t border-amber-500/30 p-3 space-y-1">
              <div className="text-[10px] text-amber-400/70 mb-2 font-semibold">POSTERINGER {skatteår}:</div>
              {kapitalIndkomstSaldo.posteringer.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between text-[10px] bg-black/20 rounded px-2 py-1.5"
                >
                  <span className="text-white/70 truncate">{post.aktivNavn}</span>
                  <span className={`font-mono ${post.beløb >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {post.beløb >= 0 ? '+' : ''}{formatKr(post.beløb)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Advarsel */}
          <div className="px-3 pb-3">
            <div className="text-[10px] bg-amber-950/50 border border-amber-500/30 rounded-lg p-2.5 text-amber-200">
              <strong>⚠️ VIGTIGT:</strong> Kapitalindkomst har INGEN tabsbank! Tab bruges straks i {skatteår}.
              <br />Negativ saldo → PSL § 11 fradrag (~{fradragsSatsUnder}%/~{fradragsSatsOver}%). Nulstilles 31. dec. – ingen fremførsel!
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ASK SEKTION */}
        {/* ============================================ */}
        <div className="rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="p-2 border-b border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold text-xs">AKTIESPAREKONTO (ASK)</span>
              {askTotal > 0 && (
                <span className="text-red-400 font-mono text-xs">-{formatKr(askTotal)}</span>
              )}
            </div>
            <div className="text-[9px] text-green-300/70 mt-1">
              Tab kan KUN bruges på SAMME ASK-konto
            </div>
          </div>

          <div className="p-2">
            <PuljeRow
              ikon="⚠️"
              navn="ASK (isoleret)"
              beskrivelse="Kun gevinster på samme konto"
              beløb={tabsbank.ASK_ISOLERET.beløb}
              posteringer={tabsbank.ASK_ISOLERET.posteringer}
              isHighlighted={highlightPulje === 'ASK_ISOLERET'}
              ægtefælleInfo="🔒 Kan IKKE deles"
              onFjernPost={(postId) => onFjernTab('ASK_ISOLERET', postId)}
            />
          </div>

          {/* Advarsel */}
          <div className="px-2 pb-2">
            <div className="text-[9px] bg-red-500/10 rounded p-1.5 text-red-300">
              <strong>⚠️ VIGTIGT:</strong> Tab i ASK TABES permanent hvis kontoen lukkes!
              Kan ikke overføres til andre konti eller ægtefælle.
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* BØRNEOPSPARING SEKTION */}
        {/* ============================================ */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 opacity-60">
          <div className="p-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold text-xs">BØRNEOPSPARING</span>
              <span className="text-cyan-400/50 text-[9px]">Skattefri</span>
            </div>
            <div className="text-[9px] text-cyan-300/50 mt-1">
              Ingen tabsbank - kontoen er skattefri (tab og gevinst er irrelevant skattemæssigt)
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PENSION SEKTION */}
        {/* ============================================ */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <div className="p-2 border-b border-yellow-500/20">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-bold text-xs">PENSION (PAL)</span>
              {pensionTotal > 0 && (
                <span className="text-red-400 font-mono text-xs">-{formatKr(pensionTotal)}</span>
              )}
            </div>
            <div className="text-[9px] text-yellow-300/70 mt-1">
              Tab er isoleret PER pensionskonto
            </div>
          </div>

          <div className="p-2">
            <PuljeRow
              ikon="🏦"
              navn="Pension (isoleret)"
              beskrivelse="Kun gevinster på samme pensionskonto"
              beløb={tabsbank.PENSION_ISOLERET.beløb}
              posteringer={tabsbank.PENSION_ISOLERET.posteringer}
              isHighlighted={highlightPulje === 'PENSION_ISOLERET'}
              ægtefælleInfo="🔒 Kan IKKE deles"
              onFjernPost={(postId) => onFjernTab('PENSION_ISOLERET', postId)}
            />
          </div>

          {/* Forklaring */}
          <div className="px-2 pb-2">
            <div className="text-[9px] bg-yellow-500/10 rounded p-1.5 text-yellow-300/80">
              <strong>OBS:</strong> Tab på én pensionskonto (fx Ratepension) kan IKKE bruges på
              en anden pensionskonto (fx Aldersopsparing). Hver konto er isoleret.
            </div>
          </div>
        </div>

      </div>

      {/* Add button */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors"
        >
          + Tilføj tab
        </button>
      </div>

      {/* Modal */}
      <AddTabModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onTilføjTab}
        skatteår={skatteår}
      />
    </div>
  );
}

// ============================================================
// PULJE ROW
// ============================================================

interface PuljeRowProps {
  ikon: string;
  navn: string;
  beskrivelse: string;
  beløb: number;
  posteringer: TabPost[];
  isHighlighted: boolean;
  ægtefælleInfo: string;
  onFjernPost: (postId: string) => void;
}

function PuljeRow({
  ikon,
  navn,
  beskrivelse,
  beløb,
  posteringer,
  isHighlighted,
  ægtefælleInfo,
  onFjernPost,
}: PuljeRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasTab = beløb > 0;

  return (
    <div className={`rounded border transition-all ${
      isHighlighted ? 'border-white/50 bg-white/10' : 'border-white/10 bg-white/5'
    } ${!hasTab ? 'opacity-50' : ''}`}>
      <button
        onClick={() => hasTab && setExpanded(!expanded)}
        className="w-full text-left p-2"
        disabled={!hasTab}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{ikon}</span>
            <div>
              <div className="text-white text-[11px] font-medium">{navn}</div>
              <div className="text-[9px] text-white/40">{beskrivelse}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-mono text-xs ${hasTab ? 'text-red-400' : 'text-white/30'}`}>
              {hasTab ? `-${formatKr(beløb)}` : '0'}
            </div>
            {hasTab && (
              <div className="text-[8px] text-white/40">
                {expanded ? '▲' : '▼'}
              </div>
            )}
          </div>
        </div>

        {/* Ægtefælle info */}
        <div className="text-[9px] mt-1 text-white/40">
          {ægtefælleInfo}
        </div>
      </button>

      {/* Expanded: Posteringer */}
      {expanded && hasTab && (
        <div className="border-t border-white/10 p-2 space-y-1">
          {posteringer.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between text-[10px] bg-white/5 rounded px-2 py-1"
            >
              <span className="text-white/70">
                {post.år}: {post.beskrivelse}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-mono">-{formatKr(post.beløb)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFjernPost(post.id);
                  }}
                  className="text-white/30 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADD TAB MODAL
// ============================================================

interface AddTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pulje: TabsPulje, post: Omit<TabPost, 'id'>) => void;
  skatteår: number;
}

function AddTabModal({ isOpen, onClose, onAdd, skatteår }: AddTabModalProps) {
  const [år, setÅr] = useState(skatteår);
  const [konto, setKonto] = useState<KontoType>('FRIT_DEPOT');
  const [aktiv, setAktiv] = useState<AktivType>('AKTIE_DK');
  const [beløb, setBeløb] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');

  if (!isOpen) return null;

  // Beregn pulje baseret på valg
  const beregnPulje = (): TabsPulje | null => {
    if (konto === 'ASK') return 'ASK_ISOLERET';
    if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(konto)) {
      return 'PENSION_ISOLERET';
    }
    // FRIT_DEPOT - afhænger af aktiv
    if (aktiv === 'AKTIE_UNOTERET') return 'UNOTERET_AKTIE';
    // Kapitalindkomst-typer har INGEN tabsbank!
    if (['ETF_IKKE_POSITIVLISTE', 'ETF_OBLIGATIONSBASERET', 'INVF_AKKUMULERENDE_KAPITAL',
         'BLANDET_FOND_OBLIGATION', 'OBLIGATION'].includes(aktiv)) {
      return null; // Ingen tabsbank for kapitalindkomst
    }
    if (aktiv === 'FINANSIEL_KONTRAKT') return 'FINANSIEL_KONTRAKT';
    return 'NOTERET_AKTIE';
  };

  const pulje = beregnPulje();
  const erKapitalindkomst = pulje === null && konto === 'FRIT_DEPOT';

  const PULJE_LABELS: Record<TabsPulje, string> = {
    NOTERET_AKTIE: 'Noterede aktier (Frit Depot)',
    UNOTERET_AKTIE: 'Unoterede aktier (Frit Depot)',
    KAPITAL_GENEREL: 'Kapitalindkomst (INGEN tabsbank!)',
    FINANSIEL_KONTRAKT: 'Finansielle kontrakter (Frit Depot)',
    ASK_ISOLERET: 'ASK (isoleret)',
    PENSION_ISOLERET: 'Pension (isoleret)',
  };

  const handleSubmit = () => {
    if (!pulje) return; // Kan ikke tilføje tab for kapitalindkomst
    const beløbNum = parseInt(beløb.replace(/\D/g, ''), 10);
    if (isNaN(beløbNum) || beløbNum <= 0) return;

    onAdd(pulje, {
      år,
      beløb: beløbNum,
      beskrivelse: beskrivelse || `Tab ${år}`,
    });

    setBeløb('');
    setBeskrivelse('');
    onClose();
  };

  const KONTO_OPTIONS: { value: KontoType; label: string }[] = [
    { value: 'FRIT_DEPOT', label: 'Frit Depot' },
    { value: 'ASK', label: 'Aktiesparekonto (ASK)' },
    { value: 'RATEPENSION', label: 'Ratepension' },
    { value: 'ALDERSOPSPARING', label: 'Aldersopsparing' },
  ];

  const AKTIV_OPTIONS: { value: AktivType; label: string; gruppe: string }[] = [
    // Aktieindkomst (har tabsbank)
    { value: 'AKTIE_DK', label: 'Dansk aktie (noteret)', gruppe: 'Aktieindkomst' },
    { value: 'AKTIE_UDENLANDSK', label: 'Udenlandsk aktie (noteret)', gruppe: 'Aktieindkomst' },
    { value: 'AKTIE_UNOTERET', label: 'Unoteret aktie', gruppe: 'Aktieindkomst' },
    { value: 'ETF_POSITIVLISTE', label: 'ETF (positivliste)', gruppe: 'Aktieindkomst' },
    { value: 'INVF_UDBYTTEBETALTENDE', label: 'Invf. udbyttebetalende', gruppe: 'Aktieindkomst' },
    { value: 'INVF_AKKUMULERENDE', label: 'Invf. akkumulerende (positivliste)', gruppe: 'Aktieindkomst' },
    { value: 'BLANDET_FOND_AKTIE', label: 'Blandet fond (>50% aktier)', gruppe: 'Aktieindkomst' },
    // Kapitalindkomst (INGEN tabsbank!)
    { value: 'ETF_IKKE_POSITIVLISTE', label: '⚠️ ETF (ikke positivliste)', gruppe: 'Kapitalindkomst' },
    { value: 'ETF_OBLIGATIONSBASERET', label: '⚠️ ETF obligationsbaseret', gruppe: 'Kapitalindkomst' },
    { value: 'INVF_AKKUMULERENDE_KAPITAL', label: '⚠️ Invf. akkumulerende (kapital)', gruppe: 'Kapitalindkomst' },
    { value: 'BLANDET_FOND_OBLIGATION', label: '⚠️ Blandet fond (>50% obl.)', gruppe: 'Kapitalindkomst' },
    { value: 'OBLIGATION', label: '⚠️ Direkte obligation', gruppe: 'Kapitalindkomst' },
    // Finansielle kontrakter (isoleret tabspool)
    { value: 'FINANSIEL_KONTRAKT', label: 'Finansiel kontrakt', gruppe: 'Finansiel' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-white/20 rounded-lg w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Tilføj tab</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">×</button>
        </div>

        <div className="space-y-4">
          {/* År */}
          <div>
            <label className="block text-xs text-white/50 mb-1">År</label>
            <select
              value={år}
              onChange={(e) => setÅr(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Konto */}
          <div>
            <label className="block text-xs text-white/50 mb-1">Kontotype</label>
            <select
              value={konto}
              onChange={(e) => setKonto(e.target.value as KontoType)}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            >
              {KONTO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Aktiv (kun for frit depot) */}
          {konto === 'FRIT_DEPOT' && (
            <div>
              <label className="block text-xs text-white/50 mb-1">Aktivtype</label>
              <select
                value={aktiv}
                onChange={(e) => setAktiv(e.target.value as AktivType)}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                {AKTIV_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Beløb */}
          <div>
            <label className="block text-xs text-white/50 mb-1">Beløb (kr)</label>
            <input
              type="text"
              value={beløb}
              onChange={(e) => setBeløb(e.target.value)}
              placeholder="10000"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Beskrivelse */}
          <div>
            <label className="block text-xs text-white/50 mb-1">Beskrivelse (valgfri)</label>
            <input
              type="text"
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              placeholder="Tab på Novo Nordisk"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          {/* Pulje preview */}
          <div className={`p-3 rounded border ${erKapitalindkomst ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-xs text-white/50">Havner i pulje:</div>
            {pulje ? (
              <div className="text-white font-medium text-sm mt-1">
                {PULJE_LABELS[pulje]}
              </div>
            ) : (
              <div className="mt-1">
                <div className="text-yellow-400 font-medium text-sm">⚠️ INGEN TABSBANK</div>
                <div className="text-[10px] text-yellow-300/70 mt-1">
                  Kapitalindkomst har ingen tabsbank. Tab modregnes STRAKS i årets kapitalindkomst via PSL § 11.
                  Du kan IKKE fremføre tab til næste år!
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!beløb || !pulje}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white py-2 rounded font-medium transition-colors"
          >
            {pulje ? 'Tilføj tab' : 'Kan ikke tilføjes (ingen tabsbank)'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TabsbankPanel;
