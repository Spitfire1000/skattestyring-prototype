/**
 * SKAT-SIMULATOR
 *
 * Flow: Vælg depot → Se aktiver → Køb/Sælg → System finder aktivtype → Se skatteflow
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { type FlowSelection } from './components/InteractiveFlowChart';
import { AuditPanel } from './components/AuditPanel';
import { TabsbankPanel } from './components/TabsbankPanel';
import { TransaktionsPanel, createSalgsTransaktion, type Transaktion } from './components/TransaktionsPanel';
import { SkatteberegningBar } from './components/SkatteberegningBar';
import { SkatteFlowChart } from './components/SkatteFlowChart';
import { getSatserForÅr, getTabspulje, klassificerIndkomst, MODREGNING_REGLER, erKapitalindkomstAktiv } from './constants/skatteRegler';
import { KONTO_TILLADELSER } from './constants/kontoTilladelser';
import type { TabsPulje, TabsbankState, TabPost, KontoType, AktivType, KapitalindkomstSaldo, KapitalindkomstPost } from './types/skat';
import type { PortfolioAsset } from './services/csvParser';
import { PLAYGROUND_ASSETS } from './data/playgroundAssets';

// ============================================================
// HELPERS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

const DEPOT_INFO: Record<KontoType, { label: string; sats: string; color: string; bgColor: string }> = {
  FRIT_DEPOT: { label: 'Frit Depot', sats: '27%/42%', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  ASK: { label: 'ASK', sats: '17%', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  BOERNEOPSPARING: { label: 'Børneopsp.', sats: '0%', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  RATEPENSION: { label: 'Ratepension', sats: '15,3%', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  ALDERSOPSPARING: { label: 'Aldersopsp.', sats: '15,3%', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  LIVRENTE: { label: 'Livrente', sats: '15,3%', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  KAPITALPENSION: { label: 'Kapitalpens.', sats: '15,3%', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
};

const AKTIVTYPE_INFO: Record<string, { label: string; kort: string }> = {
  'AKTIE_DK': { label: 'Dansk aktie', kort: 'DK' },
  'AKTIE_UDENLANDSK': { label: 'Udenlandsk aktie', kort: 'UDL' },
  'ETF_POSITIVLISTE': { label: 'ETF (positivliste)', kort: 'ETF+' },
  'ETF_IKKE_POSITIVLISTE': { label: 'ETF (ikke positivliste)', kort: 'ETF!' },
  'INVF_UDBYTTEBETALTENDE': { label: 'Inv.forening (udl.)', kort: 'INV' },
  'INVF_AKKUMULERENDE': { label: 'Inv.forening (akk.)', kort: 'INV*' },
  'FINANSIEL_KONTRAKT': { label: 'Finansiel kontrakt', kort: 'FIN' },
};

// ============================================================
// HOVEDAPP
// ============================================================

function App() {
  // STEP 1: Valgt depot
  const [valgtDepot, setValgtDepot] = useState<KontoType | null>(null);

  // Selection state for flowchart (auto-udfyldes ved handel)
  const [selection, setSelection] = useState<FlowSelection>({
    konto: null,
    aktiv: null,
  });

  // Settings
  const [erGift, setErGift] = useState(false);
  const [skatteår, setSkatteår] = useState(2025);

  // Assets
  const [aktivbank] = useState<PortfolioAsset[]>(PLAYGROUND_ASSETS);
  const [portefølje, setPortefølje] = useState<PortfolioAsset[]>([]);
  const [transaktioner, setTransaktioner] = useState<Transaktion[]>([]);

  // Tabsbank
  const emptyPulje = { beløb: 0, posteringer: [] };
  const [tabsbank, setTabsbank] = useState<TabsbankState>({
    NOTERET_AKTIE: { ...emptyPulje },
    UNOTERET_AKTIE: { ...emptyPulje },
    KAPITAL_GENEREL: { ...emptyPulje },  // ⚠️ DEPRECATED - bruges ikke (kun dokumentation)
    FINANSIEL_KONTRAKT: { ...emptyPulje },
    ASK_ISOLERET: { ...emptyPulje },
    PENSION_ISOLERET: { ...emptyPulje },
  });

  // Kapitalindkomst-saldo (nulstilles ved årsskift)
  // ⚠️ VIGTIG: Kapitalindkomst har INGEN tabsbank - kun års-saldo!
  const [kapitalIndkomstSaldo, setKapitalIndkomstSaldo] = useState<KapitalindkomstSaldo>({
    skatteår: skatteår,
    beløb: 0,
    gevinster: 0,
    tab: 0,
    posteringer: [],
  });

  // Auto-nulstil kapitalindkomst-saldo ved årsskift
  useEffect(() => {
    if (kapitalIndkomstSaldo.skatteår !== skatteår) {
      setKapitalIndkomstSaldo({
        skatteår: skatteår,
        beløb: 0,
        gevinster: 0,
        tab: 0,
        posteringer: [],
      });
    }
  }, [skatteår, kapitalIndkomstSaldo.skatteår]);

  // Købte base IDs (uden depot-suffix)
  const købteBaseIds = useMemo(() => {
    // Portefølje har IDs som "rate-jyske-RATEPENSION", vi skal extracte base ID "rate-jyske"
    const baseIds = new Set<string>();
    for (const asset of portefølje) {
      // Find base ID ved at fjerne depot-suffix
      const parts = asset.id.split('-');
      // Sidste del er depot (fx RATEPENSION), resten er base ID
      const baseId = parts.slice(0, -1).join('-');
      if (baseId) baseIds.add(baseId);
    }
    return baseIds;
  }, [portefølje]);

  // Aktiver tilgængelige i valgt depot (filtreret efter kontoregler)
  const aktiverIDepot = useMemo(() => {
    if (!valgtDepot) return [];

    const regel = KONTO_TILLADELSER[valgtDepot];

    return aktivbank
      .filter(asset => !købteBaseIds.has(asset.id))                              // Ikke allerede købt
      .filter(asset => regel.allowedAktivTyper.includes(asset.aktivType as AktivType)); // Tilladt på kontoen
  }, [aktivbank, valgtDepot, købteBaseIds]);

  // Aktiver i portefølje for valgt depot
  const porteføljeIDepot = useMemo(() => {
    if (!valgtDepot) return portefølje;
    return portefølje.filter(a => a.kontoType === valgtDepot);
  }, [portefølje, valgtDepot]);

  // Handlers
  const tilføjTab = useCallback((pulje: TabsPulje, post: Omit<TabPost, 'id'>) => {
    const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTabsbank(prev => ({
      ...prev,
      [pulje]: {
        beløb: prev[pulje].beløb + post.beløb,
        posteringer: [...prev[pulje].posteringer, { ...post, id }],
      },
    }));
  }, []);

  const fjernTab = useCallback((pulje: TabsPulje, postId: string) => {
    setTabsbank(prev => {
      const post = prev[pulje].posteringer.find(p => p.id === postId);
      if (!post) return prev;
      return {
        ...prev,
        [pulje]: {
          beløb: prev[pulje].beløb - post.beløb,
          posteringer: prev[pulje].posteringer.filter(p => p.id !== postId),
        },
      };
    });
  }, []);

  // KØB: Flyt til portefølje med VALGT depot's kontotype
  const handleKøb = useCallback((asset: PortfolioAsset) => {
    if (!valgtDepot) return;
    // Opret kopi med valgt depot's kontotype og korrekt tabspulje
    const købtAktiv: PortfolioAsset = {
      ...asset,
      id: `${asset.id}-${valgtDepot}`, // Unikt ID per depot
      kontoType: valgtDepot,
      kontoNavn: DEPOT_INFO[valgtDepot].label,
      tabsPulje: getTabspulje(valgtDepot, asset.aktivType as AktivType),
    };
    setPortefølje(prev => [...prev, købtAktiv]);
    // Auto-vælg i flowchart
    setSelection({
      konto: valgtDepot,
      aktiv: asset.aktivType as AktivType,
    });
  }, [valgtDepot]);

  // SÆLG: Beregn skat og fjern fra portefølje
  const handleSælg = useCallback((asset: PortfolioAsset) => {
    let modregnet = 0;
    const gevinstTab = asset.urealiseret;
    const aktivType = asset.aktivType as AktivType;
    const kontoType = asset.kontoType as KontoType;

    // Auto-vælg i flowchart
    setSelection({
      konto: kontoType,
      aktiv: aktivType,
    });

    // ─────────────────────────────────────────────────────────────
    // KAPITALINDKOMST: Tilføj til års-saldo (INGEN tabsbank!)
    // ─────────────────────────────────────────────────────────────
    if (kontoType === 'FRIT_DEPOT' && erKapitalindkomstAktiv(aktivType)) {
      const post: KapitalindkomstPost = {
        id: `kap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dato: new Date(),
        aktivNavn: asset.navn,
        aktivType: aktivType,
        beløb: gevinstTab,
        beskrivelse: gevinstTab >= 0 ? `Gevinst ved salg` : `Tab ved salg`,
      };

      setKapitalIndkomstSaldo(prev => ({
        ...prev,
        beløb: prev.beløb + gevinstTab,
        gevinster: gevinstTab >= 0 ? prev.gevinster + gevinstTab : prev.gevinster,
        tab: gevinstTab < 0 ? prev.tab + Math.abs(gevinstTab) : prev.tab,
        posteringer: [...prev.posteringer, post],
      }));

      // Kapitalindkomst bruger IKKE tabsbank - modregning sker automatisk i saldoen
      const transaktion = createSalgsTransaktion(asset, skatteår, 0);
      setTransaktioner(prev => [...prev, transaktion]);
      setPortefølje(prev => prev.filter(a => a.id !== asset.id));
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // AKTIEINDKOMST + FINANSIELLE KONTRAKTER: Brug tabsbank
    // ─────────────────────────────────────────────────────────────
    if (gevinstTab > 0 && asset.tabsPulje) {
      const tilgængeligTab = tabsbank[asset.tabsPulje]?.beløb || 0;
      if (tilgængeligTab > 0) {
        modregnet = Math.min(tilgængeligTab, gevinstTab);
        setTabsbank(prev => {
          const pulje = asset.tabsPulje!;
          const nyBeløb = prev[pulje].beløb - modregnet;
          let resterende = modregnet;
          const opdateretPosteringer = prev[pulje].posteringer.filter(post => {
            if (resterende <= 0) return true;
            if (post.beløb <= resterende) {
              resterende -= post.beløb;
              return false;
            }
            return true;
          });
          return { ...prev, [pulje]: { beløb: Math.max(0, nyBeløb), posteringer: opdateretPosteringer } };
        });
      }
    } else if (gevinstTab < 0 && asset.tabsPulje) {
      tilføjTab(asset.tabsPulje, {
        år: skatteår,
        beløb: Math.abs(gevinstTab),
        beskrivelse: `Salg af ${asset.navn}`,
        kontoId: kontoType === 'ASK' || ['RATEPENSION', 'ALDERSOPSPARING'].includes(kontoType) ? asset.id : undefined,
      });
    }

    const transaktion = createSalgsTransaktion(asset, skatteår, modregnet);
    setTransaktioner(prev => [...prev, transaktion]);
    setPortefølje(prev => prev.filter(a => a.id !== asset.id));
  }, [skatteår, tabsbank, tilføjTab]);

  // FORTRYD KØB
  const handleFortrydKøb = useCallback((asset: PortfolioAsset) => {
    setPortefølje(prev => prev.filter(a => a.id !== asset.id));
  }, []);

  const handleFjernTransaktion = useCallback((transaktionId: string) => {
    setTransaktioner(prev => prev.filter(t => t.id !== transaktionId));
  }, []);

  const highlightPulje = useMemo<TabsPulje | null>(() => {
    if (!selection.konto || !selection.aktiv) return null;
    try { return getTabspulje(selection.konto, selection.aktiv); } catch { return null; }
  }, [selection.konto, selection.aktiv]);

  const satser = useMemo(() => getSatserForÅr(skatteår), [skatteår]);
  const progressionsgrænse = erGift ? satser.aktieindkomst.grænseGift : satser.aktieindkomst.grænseEnlig;

  // Beregn indkomsttype og tabspulje for selection
  const flowInfo = useMemo(() => {
    if (!selection.konto || !selection.aktiv) return null;
    try {
      const indkomsttype = klassificerIndkomst(selection.konto, selection.aktiv);
      const tabspulje = getTabspulje(selection.konto, selection.aktiv);
      const modregning = tabspulje ? MODREGNING_REGLER[tabspulje] : null;
      return { indkomsttype, tabspulje, modregning };
    } catch {
      return null;
    }
  }, [selection]);

  const handleReset = useCallback(() => {
    setValgtDepot(null);
    setSelection({ konto: null, aktiv: null });
    setPortefølje([]);
    setTransaktioner([]);
    setTabsbank({
      NOTERET_AKTIE: { beløb: 0, posteringer: [] },
      UNOTERET_AKTIE: { beløb: 0, posteringer: [] },
      KAPITAL_GENEREL: { beløb: 0, posteringer: [] },
      FINANSIEL_KONTRAKT: { beløb: 0, posteringer: [] },
      ASK_ISOLERET: { beløb: 0, posteringer: [] },
      PENSION_ISOLERET: { beløb: 0, posteringer: [] },
    });
    setKapitalIndkomstSaldo({
      skatteår: skatteår,
      beløb: 0,
      gevinster: 0,
      tab: 0,
      posteringer: [],
    });
  }, [skatteår]);

  const depotInfo = valgtDepot ? DEPOT_INFO[valgtDepot] : null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-[11px] overflow-auto">
      {/* HEADER */}
      <header className="border-b border-white/20 bg-[#0d1321] px-3 py-2 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">SKAT-SIMULATOR</h1>
            <span className="text-white/40">1. Vælg depot → 2. Køb/Sælg → 3. Se skatteflow</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={skatteår}
              onChange={(e) => setSkatteår(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-white text-[11px]"
            >
              {[2023, 2024, 2025, 2026].map(år => (
                <option key={år} value={år} className="bg-[#1a1f2e]">{år}</option>
              ))}
            </select>
            <button
              onClick={() => setErGift(!erGift)}
              className={`px-2 py-0.5 rounded text-[11px] ${erGift ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
            >
              {erGift ? 'Gift' : 'Enlig'}
            </button>
            <span className="text-white/30">Grænse: {formatKr(progressionsgrænse)}</span>
            <button onClick={handleReset} className="text-red-400 hover:text-red-300">Nulstil</button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1800px] mx-auto p-2">
        <div className="grid grid-cols-[1fr_320px_220px] gap-2">

          {/* KOLONNE 1: Depot + Aktiver + Flowchart + Resultat */}
          <div className="space-y-2">

            {/* TRIN 1: VÆLG DEPOT */}
            <div className="border border-white/20 rounded-lg p-2 bg-[#0d1321]">
              <div className="text-[10px] text-white/50 mb-2">TRIN 1: VÆLG DEPOT (hvor handler du fra?)</div>
              <div className="flex flex-wrap gap-1">
                {(Object.entries(DEPOT_INFO) as [KontoType, typeof DEPOT_INFO[KontoType]][]).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setValgtDepot(key);
                      setSelection({ konto: key, aktiv: null });
                    }}
                    className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                      valgtDepot === key
                        ? `${info.bgColor} ${info.color} border-current`
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {info.label} <span className="opacity-60">{info.sats}</span>
                  </button>
                ))}
              </div>

              {/* Vis kontobegrænsninger */}
              {valgtDepot && (
                <div className="text-[10px] bg-emerald-900/50 border border-emerald-500/30 rounded p-2 mt-2">
                  <span className="text-emerald-400">✓ Tilladt på {DEPOT_INFO[valgtDepot].label}:</span>{' '}
                  <span className="text-white/70">{KONTO_TILLADELSER[valgtDepot].beskrivelse}</span>
                  {KONTO_TILLADELSER[valgtDepot].note && (
                    <span className="text-amber-400 block mt-1">⚠️ {KONTO_TILLADELSER[valgtDepot].note}</span>
                  )}
                </div>
              )}
            </div>

            {/* TRIN 2: AKTIVER I DEPOT + PORTEFØLJE */}
            {valgtDepot && (
              <div className="grid grid-cols-2 gap-2">
                {/* Aktiver i depot (kan købes) */}
                <div className="border border-white/20 rounded-lg bg-[#0d1321]">
                  <div className={`px-2 py-1 border-b border-white/10 ${depotInfo?.bgColor}`}>
                    <span className={`text-[10px] font-semibold ${depotInfo?.color}`}>
                      AKTIVER I {depotInfo?.label.toUpperCase()} ({aktiverIDepot.length})
                    </span>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto p-1">
                    {aktiverIDepot.length === 0 ? (
                      <div className="text-white/30 text-center py-2 text-[10px]">Ingen aktiver</div>
                    ) : (
                      aktiverIDepot.map(asset => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between px-1.5 py-0.5 rounded mb-0.5 hover:bg-white/5"
                        >
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className={`text-[8px] px-1 rounded bg-white/10 text-white/50`}>
                              {AKTIVTYPE_INFO[asset.aktivType]?.kort || '?'}
                            </span>
                            <span className="text-white/70 truncate">{asset.navn}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-1">
                            <span className={`w-12 text-right ${asset.urealiseret >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.urealiseret >= 0 ? '+' : ''}{formatKr(asset.urealiseret)}
                            </span>
                            <button
                              onClick={() => handleKøb(asset)}
                              className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-[9px]"
                            >
                              Køb
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Portefølje (kan sælges) */}
                <div className="border border-white/20 rounded-lg bg-[#0d1321]">
                  <div className="px-2 py-1 border-b border-white/10 bg-white/5">
                    <span className="text-[10px] text-white/50">MIN PORTEFØLJE ({porteføljeIDepot.length})</span>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto p-1">
                    {porteføljeIDepot.length === 0 ? (
                      <div className="text-white/30 text-center py-2 text-[10px]">Køb aktiver først</div>
                    ) : (
                      porteføljeIDepot.map(asset => {
                        const info = DEPOT_INFO[asset.kontoType as KontoType];
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between px-1.5 py-0.5 rounded mb-0.5 bg-white/5"
                          >
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <span className={`text-[8px] px-1 rounded ${info?.bgColor} ${info?.color}`}>
                                {AKTIVTYPE_INFO[asset.aktivType]?.kort || '?'}
                              </span>
                              <span className={info?.color || 'text-white/70'}>{asset.navn}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-1">
                              <span className={`w-12 text-right ${asset.urealiseret >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {asset.urealiseret >= 0 ? '+' : ''}{formatKr(asset.urealiseret)}
                              </span>
                              <button
                                onClick={() => handleSælg(asset)}
                                className={`px-1.5 py-0.5 rounded text-[9px] ${
                                  asset.urealiseret >= 0
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                }`}
                              >
                                Sælg
                              </button>
                              <button
                                onClick={() => handleFortrydKøb(asset)}
                                className="px-1 text-white/30 hover:text-white/50"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TRIN 3: SKATTEFLOW (auto-udfyldt) */}
            <div className="border border-white/20 rounded-lg p-2 bg-[#0d1321]">
              <div className="text-[10px] text-white/50 mb-2">TRIN 3: SKATTEFLOW (auto-beregnet ved køb/salg)</div>

              {/* Flowchart som kompakte bokse */}
              <div className="flex items-start gap-2">
                {/* Konto */}
                <div className={`flex-1 p-2 rounded border ${selection.konto ? `${DEPOT_INFO[selection.konto]?.bgColor} border-current ${DEPOT_INFO[selection.konto]?.color}` : 'bg-white/5 border-white/10 text-white/30'}`}>
                  <div className="text-[9px] opacity-60">KONTO</div>
                  <div className="font-semibold">{selection.konto ? DEPOT_INFO[selection.konto]?.label : '—'}</div>
                  {selection.konto && <div className="text-[9px] opacity-70">{DEPOT_INFO[selection.konto]?.sats}</div>}
                </div>

                <div className="text-white/30 self-center">→</div>

                {/* Aktivtype */}
                <div className={`flex-1 p-2 rounded border ${selection.aktiv ? `${DEPOT_INFO[selection.konto!]?.bgColor} border-current ${DEPOT_INFO[selection.konto!]?.color}` : 'bg-white/5 border-white/10 text-white/30'}`}>
                  <div className="text-[9px] opacity-60">AKTIVTYPE</div>
                  <div className="font-semibold">{selection.aktiv ? AKTIVTYPE_INFO[selection.aktiv]?.label : '—'}</div>
                </div>

                <div className="text-white/30 self-center">→</div>

                {/* Klassificering */}
                <div className={`flex-1 p-2 rounded border ${flowInfo ? `${DEPOT_INFO[selection.konto!]?.bgColor} border-current ${DEPOT_INFO[selection.konto!]?.color}` : 'bg-white/5 border-white/10 text-white/30'}`}>
                  <div className="text-[9px] opacity-60">KLASSIFICERING</div>
                  <div className="font-semibold">{flowInfo?.indkomsttype || '—'}</div>
                </div>

                <div className="text-white/30 self-center">→</div>

                {/* Tabspulje */}
                <div className={`flex-1 p-2 rounded border ${flowInfo ? `${DEPOT_INFO[selection.konto!]?.bgColor} border-current ${DEPOT_INFO[selection.konto!]?.color}` : 'bg-white/5 border-white/10 text-white/30'}`}>
                  <div className="text-[9px] opacity-60">TABSPULJE</div>
                  <div className="font-semibold text-[10px]">{flowInfo?.tabspulje || '—'}</div>
                  {flowInfo?.modregning && (
                    <div className="text-[8px] opacity-60">
                      Ægtefælle: {flowInfo.modregning.ægtefælleOverførsel ? 'JA' : 'NEJ'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RESULTAT: Tabsbank + Transaktioner + Skat */}
            <div className="grid grid-cols-3 gap-2 items-start">
              <div className="border border-white/20 rounded-lg overflow-hidden">
                <TabsbankPanel
                  tabsbank={tabsbank}
                  onTilføjTab={tilføjTab}
                  onFjernTab={fjernTab}
                  highlightPulje={highlightPulje}
                  skatteår={skatteår}
                  kapitalIndkomstSaldo={kapitalIndkomstSaldo}
                  erGift={erGift}
                />
              </div>
              <div className="border border-white/20 rounded-lg overflow-hidden">
                <TransaktionsPanel
                  transaktioner={transaktioner}
                  aktivtÅr={skatteår}
                  onFjernTransaktion={handleFjernTransaktion}
                />
              </div>
              <div className="border border-white/20 rounded-lg overflow-hidden p-2 bg-[#0d1321]">
                <div className="text-[10px] text-white/50 mb-1">SKAT {skatteår}</div>
                <SkatteberegningBar
                  transaktioner={transaktioner}
                  skatteår={skatteår}
                  erGift={erGift}
                  kapitalIndkomstSaldo={kapitalIndkomstSaldo}
                />
              </div>
            </div>
          </div>

          {/* KOLONNE 2: Audit Panel */}
          <div className="border border-white/20 rounded-lg overflow-hidden bg-[#0d1321] h-fit max-h-[calc(100vh-80px)] overflow-y-auto">
            <AuditPanel
              selection={selection}
              erGift={erGift}
              skatteår={skatteår}
              transaktioner={transaktioner}
              kapitalIndkomstSaldo={kapitalIndkomstSaldo}
            />
          </div>

          {/* KOLONNE 3: Quick Reference */}
          <div className="border border-white/20 rounded-lg p-2 bg-[#0d1321] h-fit">
            <div className="text-[10px] text-white/50 mb-2">REFERENCE</div>

            <div className="mb-2">
              <div className="text-[9px] text-blue-400 font-semibold mb-0.5">Skattesatser</div>
              <div className="space-y-0 text-white/60 text-[10px]">
                <div className="flex justify-between"><span>Aktie:</span><span className="text-white">27/42%</span></div>
                <div className="flex justify-between"><span>ASK:</span><span className="text-white">17%</span></div>
                <div className="flex justify-between"><span>PAL:</span><span className="text-white">15,3%</span></div>
                <div className="flex justify-between"><span>Kapital:</span><span className="text-white">~37%</span></div>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-[9px] text-green-400 font-semibold mb-0.5">Grænser {skatteår}</div>
              <div className="space-y-0 text-white/60 text-[10px]">
                <div className="flex justify-between"><span>Enlig:</span><span className="text-white">{formatKr(satser.aktieindkomst.grænseEnlig)}</span></div>
                <div className="flex justify-between"><span>Gift:</span><span className="text-white">{formatKr(satser.aktieindkomst.grænseGift)}</span></div>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-[9px] text-purple-400 font-semibold mb-0.5">Tabspuljer</div>
              <div className="space-y-0 text-white/60 text-[10px]">
                <div><span className="text-blue-400">NOTERET:</span> Aktier/ETF+</div>
                <div><span className="text-green-400">ASK:</span> Isoleret</div>
                <div><span className="text-yellow-400">PENSION:</span> Isoleret</div>
                <div><span className="text-orange-400">KAPITAL:</span> ETF!</div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-1">
              <div className="text-yellow-400 text-[9px] font-semibold">KAPITAL</div>
              <div className="text-white/60 text-[9px]">
                Gevinst ~37%<br/>Tab kun ~25%
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FLOWCHART - Komplet beskatningsoversigt */}
      <section className="max-w-[1800px] mx-auto px-2 pb-4">
        <SkatteFlowChart />
      </section>
    </div>
  );
}

export default App;
