/**
 * SKAT-SIMULATOR
 *
 * Hovedapplikation med fuld audit-trail og gennemsigtighed.
 */

import { useState, useCallback } from 'react';
import type { ParsedPosition } from './services/csvParser';
import { parseNordnetCSV, getTestPositioner } from './services/csvParser';
import { SKATTESATSER } from './constants/skatteRegler';
import type { KontoType, TabsPulje } from './types/skat';
import { SimulatorView } from './components/SimulatorView';

// ============================================================
// TYPES
// ============================================================

interface FradragsbankPulje {
  pulje: TabsPulje;
  primo: number;
  brugt: number;
  tilføjet: number;
  ultimo: number;
}

interface TransaktionsLog {
  id: string;
  dato: string;
  type: 'GEVINST' | 'TAB' | 'MODREGNING';
  beskrivelse: string;
  beløb: number;
  skat: number;
  pulje: TabsPulje;
}

interface SimulatorState {
  skatteår: number;
  aktieindkomstIÅr: number;
  fradragsbank: FradragsbankPulje[];
  transaktioner: TransaktionsLog[];
}

// ============================================================
// KONTOTYPE DEFINITIONER
// ============================================================

const KONTOTYPER: { value: KontoType; label: string; sats: string }[] = [
  { value: 'FRIT_DEPOT', label: 'Frit depot', sats: '27%/42%' },
  { value: 'ASK', label: 'Aktiesparekonto (ASK)', sats: '17%' },
  { value: 'RATEPENSION', label: 'Ratepension', sats: '15,3%' },
  { value: 'ALDERSOPSPARING', label: 'Aldersopsparing', sats: '15,3%' },
  { value: 'LIVRENTE', label: 'Livrente', sats: '15,3%' },
  { value: 'KAPITALPENSION', label: 'Kapitalpension', sats: '15,3%' },
  { value: 'BØRNEOPSPARING', label: 'Børneopsparing', sats: '0%' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

function getPuljeNavn(pulje: TabsPulje): string {
  const navne: Record<TabsPulje, string> = {
    'NOTERET_AKTIE': 'Noterede aktier',
    'UNOTERET_AKTIE': 'Unoterede aktier',
    'KAPITAL_GENEREL': 'Kapitalindkomst',
    'FINANSIEL_KONTRAKT': 'Fin. kontrakter',
    'ASK_ISOLERET': 'ASK (isoleret)',
    'PENSION_ISOLERET': 'Pension (isoleret)',
  };
  return navne[pulje] || pulje;
}

function genererID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================
// INITIAL STATE
// ============================================================

function getInitialSimulatorState(): SimulatorState {
  return {
    skatteår: 2025,
    aktieindkomstIÅr: 0,
    fradragsbank: [
      { pulje: 'NOTERET_AKTIE', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
      { pulje: 'UNOTERET_AKTIE', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
      { pulje: 'KAPITAL_GENEREL', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
      { pulje: 'FINANSIEL_KONTRAKT', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
      { pulje: 'ASK_ISOLERET', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
      { pulje: 'PENSION_ISOLERET', primo: 0, brugt: 0, tilføjet: 0, ultimo: 0 },
    ],
    transaktioner: [],
  };
}

// ============================================================
// FRADRAGSBANK PANEL
// ============================================================

interface FradragsbankPanelProps {
  state: SimulatorState;
  onÅrSkift: (nytÅr: number) => void;
  onNulstil: () => void;
  onTilføjTestTab: () => void;
}

function FradragsbankPanel({ state, onÅrSkift, onNulstil, onTilføjTestTab }: FradragsbankPanelProps) {
  const aktivePuljer = state.fradragsbank.filter(p =>
    p.primo > 0 || p.brugt > 0 || p.tilføjet > 0 || p.ultimo > 0
  );

  const samletTilgængeligt = state.fradragsbank.reduce((sum, p) =>
    sum + p.primo - p.brugt + p.tilføjet, 0
  );

  return (
    <div className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-orange-400">📊 FRADRAGSBANK - STATUS</h2>
          <p className="text-white/50 text-xs">Tab der kan modregnes i fremtidige gevinster</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">Skatteår</div>
          <select
            value={state.skatteår}
            onChange={(e) => onÅrSkift(Number(e.target.value))}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
          >
            {[2023, 2024, 2025, 2026].map(år => (
              <option key={år} value={år} className="bg-[#1a1f2e]">{år}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Samlet */}
      <div className="bg-orange-500/10 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Samlet tilgængeligt tab:</span>
          <span className="text-2xl font-bold text-orange-400">{formatKr(samletTilgængeligt)} kr</span>
        </div>
        <div className="text-xs text-white/40 mt-1">
          Aktieindkomst i år: {formatKr(state.aktieindkomstIÅr)} kr
        </div>
      </div>

      {/* Tabel */}
      {aktivePuljer.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 text-white/50">PULJE</th>
                <th className="text-right py-2 text-white/50">PRIMO</th>
                <th className="text-right py-2 text-white/50">BRUGT</th>
                <th className="text-right py-2 text-white/50">TILFØJET</th>
                <th className="text-right py-2 text-white/50">ULTIMO</th>
              </tr>
            </thead>
            <tbody>
              {aktivePuljer.map(p => {
                const ultimo = p.primo - p.brugt + p.tilføjet;
                return (
                  <tr key={p.pulje} className="border-b border-white/10">
                    <td className="py-2 text-white">{getPuljeNavn(p.pulje)}</td>
                    <td className="py-2 text-right text-white/70">{formatKr(p.primo)}</td>
                    <td className="py-2 text-right text-red-400">{p.brugt > 0 ? `-${formatKr(p.brugt)}` : '0'}</td>
                    <td className="py-2 text-right text-green-400">{p.tilføjet > 0 ? `+${formatKr(p.tilføjet)}` : '0'}</td>
                    <td className="py-2 text-right text-white font-semibold">{formatKr(ultimo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-white/30">
          <div className="text-2xl mb-1">📭</div>
          <p className="text-sm">Ingen tab i fradragsbanken</p>
        </div>
      )}

      {/* Isolerede tab advarsel */}
      {state.fradragsbank.some(p => (p.pulje === 'ASK_ISOLERET' || p.pulje === 'PENSION_ISOLERET') && (p.primo + p.tilføjet - p.brugt) > 0) && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
          ⚠️ <strong>Isolerede tab:</strong> ASK og pension tab kan kun bruges på samme konto!
        </div>
      )}

      {/* Lovhenvisning */}
      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
        📚 Ref: ABL § 13A (noterede), ABL § 13 (unoterede), KGL § 32 (fin. kontrakter)
      </div>

      {/* Knapper */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onTilføjTestTab}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          + Tilføj test-tab (10.000 kr)
        </button>
        <button
          onClick={onNulstil}
          className="text-xs text-red-400 hover:text-red-300 underline ml-auto"
        >
          🗑️ Nulstil
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TRANSAKTIONSLOG
// ============================================================

function TransaktionsLog({ transaktioner }: { transaktioner: TransaktionsLog[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (transaktioner.length === 0) return null;

  // Beregn statistik
  const samletGevinst = transaktioner.filter(t => t.type === 'GEVINST').reduce((sum, t) => sum + t.beløb, 0);
  const samletTab = transaktioner.filter(t => t.type === 'TAB').reduce((sum, t) => sum + t.beløb, 0);
  const samletModregnet = transaktioner.filter(t => t.type === 'MODREGNING').reduce((sum, t) => sum + t.beløb, 0);
  const samletSkat = transaktioner.reduce((sum, t) => sum + t.skat, 0);

  return (
    <div className="border border-white/20 rounded-xl p-4">
      {/* Header med toggle */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-white">
          📋 TRANSAKTIONSLOG ({transaktioner.length})
        </h3>
        <button className="text-white/50 hover:text-white text-sm">
          {isExpanded ? '▼ Skjul' : '▶ Vis alle'}
        </button>
      </div>

      {/* Statistik (altid synlig) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 mb-3 text-xs">
        <div className="bg-green-500/10 rounded p-2">
          <div className="text-white/50">Gevinster</div>
          <div className="text-green-400 font-semibold">+{formatKr(samletGevinst)} kr</div>
        </div>
        <div className="bg-orange-500/10 rounded p-2">
          <div className="text-white/50">Tab → Bank</div>
          <div className="text-orange-400 font-semibold">{formatKr(samletTab)} kr</div>
        </div>
        <div className="bg-blue-500/10 rounded p-2">
          <div className="text-white/50">Modregnet</div>
          <div className="text-blue-400 font-semibold">-{formatKr(samletModregnet)} kr</div>
        </div>
        <div className="bg-yellow-500/10 rounded p-2">
          <div className="text-white/50">Skat betalt</div>
          <div className="text-yellow-400 font-semibold">{formatKr(samletSkat)} kr</div>
        </div>
      </div>

      {/* Transaktionsliste */}
      <div className={`space-y-2 overflow-y-auto transition-all duration-300 ${
        isExpanded ? 'max-h-[600px]' : 'max-h-32'
      }`}>
        {transaktioner.slice().reverse().map((t, index) => (
          <div
            key={t.id}
            className={`text-xs p-2 rounded ${
              t.type === 'GEVINST' ? 'bg-green-500/10 border border-green-500/20' :
              t.type === 'TAB' ? 'bg-orange-500/10 border border-orange-500/20' :
              'bg-blue-500/10 border border-blue-500/20'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-white/30 font-mono">#{transaktioner.length - index}</span>
                <span className="text-white/50">{t.dato}</span>
              </div>
              <span className={`font-semibold ${
                t.type === 'GEVINST' ? 'text-green-400' :
                t.type === 'TAB' ? 'text-orange-400' :
                'text-blue-400'
              }`}>
                {t.type === 'GEVINST' ? '+' : t.type === 'TAB' ? '→' : '←'} {formatKr(t.beløb)} kr
              </span>
            </div>
            <div className="text-white mt-1 ml-6">{t.beskrivelse}</div>
            <div className="flex gap-4 mt-1 ml-6">
              {t.skat > 0 && (
                <span className="text-yellow-400">Skat: {formatKr(t.skat)} kr</span>
              )}
              <span className="text-white/30">Pulje: {getPuljeNavn(t.pulje)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Vis mere/mindre indikator */}
      {transaktioner.length > 2 && !isExpanded && (
        <div
          className="text-center text-white/30 text-xs mt-2 cursor-pointer hover:text-white/50"
          onClick={() => setIsExpanded(true)}
        >
          ... og {transaktioner.length - 2} mere (klik for at vise)
        </div>
      )}
    </div>
  );
}

// ============================================================
// HOVEDAPP
// ============================================================

function App() {
  // Positioner og indstillinger
  const [positioner, setPositioner] = useState<ParsedPosition[]>([]);
  const [kontoType, setKontoType] = useState<KontoType>('FRIT_DEPOT');
  const [erGift, setErGift] = useState(false);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulator state
  const [simulatorState, setSimulatorState] = useState<SimulatorState>(getInitialSimulatorState());
  const [selectedPosition, setSelectedPosition] = useState<ParsedPosition | null>(null);

  // ============================================================
  // FILE HANDLERS
  // ============================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file?.name.endsWith('.csv')) {
      setError('Filen skal være en CSV-fil');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseNordnetCSV(text);
        setPositioner(parsed);
      } catch (err) {
        setError(`Parse fejl: ${err instanceof Error ? err.message : 'Ukendt'}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseNordnetCSV(text);
        setPositioner(parsed);
        setError(null);
      } catch (err) {
        setError(`Parse fejl: ${err instanceof Error ? err.message : 'Ukendt'}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  // ============================================================
  // SIMULATOR HANDLERS
  // ============================================================

  const handleGennemførSalg = useCallback((resultat: {
    gevinstTab: number;
    erGevinst: boolean;
    beskatteligGevinst: number;
    skat: number;
    modregnetBeløb: number;
    tabTilFradragsbank: number;
    pulje: TabsPulje;
  }) => {
    setSimulatorState(prev => {
      const nyState = { ...prev };
      const dato = new Date().toLocaleString('da-DK');

      if (resultat.erGevinst) {
        // Opdater aktieindkomst
        nyState.aktieindkomstIÅr += resultat.beskatteligGevinst;

        // Opdater fradragsbank (brug tab)
        if (resultat.modregnetBeløb > 0) {
          nyState.fradragsbank = prev.fradragsbank.map(p =>
            p.pulje === resultat.pulje
              ? { ...p, brugt: p.brugt + resultat.modregnetBeløb }
              : p
          );
        }

        // Log transaktion
        nyState.transaktioner = [...prev.transaktioner, {
          id: genererID(),
          dato,
          type: 'GEVINST',
          beskrivelse: `Gevinst realiseret (${selectedPosition?.navn})`,
          beløb: resultat.gevinstTab,
          skat: resultat.skat,
          pulje: resultat.pulje,
        }];

        if (resultat.modregnetBeløb > 0) {
          nyState.transaktioner.push({
            id: genererID(),
            dato,
            type: 'MODREGNING',
            beskrivelse: `Modregnet fra ${getPuljeNavn(resultat.pulje)}`,
            beløb: resultat.modregnetBeløb,
            skat: 0,
            pulje: resultat.pulje,
          });
        }
      } else {
        // Tilføj tab til fradragsbank
        nyState.fradragsbank = prev.fradragsbank.map(p =>
          p.pulje === resultat.pulje
            ? { ...p, tilføjet: p.tilføjet + resultat.tabTilFradragsbank }
            : p
        );

        // Log transaktion
        nyState.transaktioner = [...prev.transaktioner, {
          id: genererID(),
          dato,
          type: 'TAB',
          beskrivelse: `Tab realiseret (${selectedPosition?.navn}) → ${getPuljeNavn(resultat.pulje)}`,
          beløb: resultat.tabTilFradragsbank,
          skat: 0,
          pulje: resultat.pulje,
        }];
      }

      return nyState;
    });

    setSelectedPosition(null);
  }, [selectedPosition]);

  const handleÅrSkift = useCallback((nytÅr: number) => {
    setSimulatorState(prev => {
      // Overfør ultimo til primo for næste år
      const nyFradragsbank = prev.fradragsbank.map(p => ({
        pulje: p.pulje,
        primo: p.primo - p.brugt + p.tilføjet,
        brugt: 0,
        tilføjet: 0,
        ultimo: 0,
      }));

      return {
        skatteår: nytÅr,
        aktieindkomstIÅr: 0, // Nulstil årets indkomst
        fradragsbank: nyFradragsbank,
        transaktioner: [], // Ny log for nyt år
      };
    });
  }, []);

  const handleNulstil = useCallback(() => {
    setSimulatorState(getInitialSimulatorState());
  }, []);

  const handleTilføjTestTab = useCallback(() => {
    setSimulatorState(prev => ({
      ...prev,
      fradragsbank: prev.fradragsbank.map(p =>
        p.pulje === 'NOTERET_AKTIE'
          ? { ...p, primo: p.primo + 10000 }
          : p
      ),
      transaktioner: [...prev.transaktioner, {
        id: genererID(),
        dato: new Date().toLocaleString('da-DK'),
        type: 'TAB' as const,
        beskrivelse: 'Test-tab tilføjet (noterede aktier)',
        beløb: 10000,
        skat: 0,
        pulje: 'NOTERET_AKTIE' as TabsPulje,
      }],
    }));
  }, []);

  // ============================================================
  // BEREGNINGER
  // ============================================================

  const totalVærdi = positioner.reduce((sum, p) => sum + p.aktuelVærdi, 0);
  const totalUrealiseret = positioner.reduce((sum, p) => sum + p.urealiseret, 0);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">SKAT-SIMULATOR</h1>
        <p className="text-white/50 text-sm mt-1">Med fuld audit-trail og lovhenvisninger</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VENSTRE KOLONNE: Indstillinger + Fradragsbank */}
          <div className="space-y-4">
            {/* Kontotype og civilstand */}
            <div className="border border-white/20 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">INDSTILLINGER</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Kontotype</label>
                  <select
                    value={kontoType}
                    onChange={(e) => setKontoType(e.target.value as KontoType)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                  >
                    {KONTOTYPER.map(k => (
                      <option key={k.value} value={k.value} className="bg-[#1a1f2e]">
                        {k.label} ({k.sats})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Civilstand</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setErGift(false)}
                      className={`flex-1 py-2 rounded text-sm transition-colors ${
                        !erGift ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      Enlig
                    </button>
                    <button
                      onClick={() => setErGift(true)}
                      className={`flex-1 py-2 rounded text-sm transition-colors ${
                        erGift ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                      }`}
                    >
                      Gift
                    </button>
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    Progressionsgrænse: {formatKr(erGift ? SKATTESATSER.PROGRESSIONSGRÆNSE_GIFT : SKATTESATSER.PROGRESSIONSGRÆNSE_ENLIG)} kr
                  </div>
                </div>
              </div>
            </div>

            {/* Fradragsbank */}
            <FradragsbankPanel
              state={simulatorState}
              onÅrSkift={handleÅrSkift}
              onNulstil={handleNulstil}
              onTilføjTestTab={handleTilføjTestTab}
            />

            {/* Transaktionslog */}
            <TransaktionsLog transaktioner={simulatorState.transaktioner} />
          </div>

          {/* HØJRE KOLONNE: Upload + Positioner */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload */}
            <div className="border border-white/20 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">UPLOAD POSITIONER</h3>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-blue-400 bg-blue-400/10' : 'border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">📁</div>
                <p className="text-white/70 text-sm mb-2">Træk Nordnet CSV hertil</p>
                <label className="inline-block">
                  <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                  <span className="bg-white/10 hover:bg-white/20 border border-white/30 rounded px-3 py-1 text-white text-sm cursor-pointer">
                    Vælg fil
                  </span>
                </label>
                <span className="mx-2 text-white/30">eller</span>
                <button
                  onClick={() => { setPositioner(getTestPositioner()); setError(null); }}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Brug testdata
                </button>
              </div>

              {error && (
                <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Positioner */}
            {positioner.length > 0 && (
              <div className="border border-white/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">POSITIONER ({positioner.length})</h3>
                  <div className="text-right text-sm">
                    <span className="text-white/50">Samlet: </span>
                    <span className="text-white font-semibold">{formatKr(totalVærdi)} kr</span>
                    <span className="ml-3 text-white/50">Urealiseret: </span>
                    <span className={totalUrealiseret >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {totalUrealiseret >= 0 ? '+' : ''}{formatKr(totalUrealiseret)} kr
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20 text-white/50 text-xs">
                        <th className="text-left py-2">Navn</th>
                        <th className="text-right py-2">Antal</th>
                        <th className="text-right py-2">Gns. kurs</th>
                        <th className="text-right py-2">Nu</th>
                        <th className="text-right py-2">Værdi</th>
                        <th className="text-right py-2">+/-</th>
                        <th className="text-center py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {positioner.map(pos => (
                        <tr key={pos.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-2">
                            <div className="text-white font-medium">{pos.navn}</div>
                            <div className="text-white/40 text-xs">{pos.isin}</div>
                          </td>
                          <td className="py-2 text-right text-white">{pos.antal}</td>
                          <td className="py-2 text-right text-white/70">{pos.gnsKurs.toFixed(2)}</td>
                          <td className="py-2 text-right text-white">{pos.aktuelKurs.toFixed(2)}</td>
                          <td className="py-2 text-right text-white font-medium">{formatKr(pos.aktuelVærdi)}</td>
                          <td className="py-2 text-right">
                            <span className={pos.urealiseret >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {pos.urealiseret >= 0 ? '+' : ''}{formatKr(pos.urealiseret)}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => setSelectedPosition(pos)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded px-3 py-1 text-blue-400 text-xs transition-colors"
                            >
                              Simuler
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Instruktioner */}
            {positioner.length === 0 && (
              <div className="border border-white/10 rounded-xl p-6 text-center text-white/40">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-lg mb-2">Upload positioner for at starte simulering</p>
                <p className="text-sm">
                  1. Upload CSV fra Nordnet<br />
                  2. Klik "Simuler" på en position<br />
                  3. Se fuld skatteberegning med alle trin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DATAFLOW DIAGRAM */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="border border-white/20 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">DATAFLOW OVERSIGT</h2>
            <p className="text-white/50 text-sm">Sådan fungerer skattesystemet</p>
          </div>

          {/* MINE KONTI */}
          <div className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">MINE KONTI</div>
            <div className="text-xs text-white/40 mb-2">Investeringskonti (frie midler) → Pensionskonti (bundne midler)</div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <div className="text-blue-400 font-semibold text-xs">FRIT DEPOT</div>
                <div className="text-white/40 text-[10px]">27%/42%</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                <div className="text-green-400 font-semibold text-xs">ASK</div>
                <div className="text-white/40 text-[10px]">17% lager</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-2">
                <div className="text-cyan-400 font-semibold text-xs">BØRNEOPSPARING</div>
                <div className="text-white/40 text-[10px]">Skattefri</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <div className="text-yellow-400 font-semibold text-xs">RATEPENSION</div>
                <div className="text-white/40 text-[10px]">15,3% PAL</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <div className="text-yellow-400 font-semibold text-xs">ALDERSOPSPARING</div>
                <div className="text-white/40 text-[10px]">15,3% PAL</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <div className="text-yellow-400 font-semibold text-xs">LIVRENTE</div>
                <div className="text-white/40 text-[10px]">15,3% PAL</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2">
                <div className="text-orange-400 font-semibold text-xs">KAPITALPENSION</div>
                <div className="text-white/40 text-[10px]">Udgået 2013</div>
              </div>
            </div>
          </div>

          {/* Pil ned */}
          <div className="text-center text-white/30 my-3">↓ <span className="text-xs">Indeholder</span></div>

          {/* MINE AKTIVER */}
          <div className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">MINE AKTIVER</div>
            <div className="text-xs text-white/40 mb-2">Hovedfokus: Aktier, ETF'er og Investeringsfonde</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              <div className="bg-white/5 border border-white/20 rounded p-2">
                <div className="text-blue-400 font-semibold text-xs">AKTIER</div>
                <div className="text-white/50 text-[10px]">Noterede</div>
                <div className="text-white/30 text-[9px] mt-1">Realisation</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded p-2">
                <div className="text-purple-400 font-semibold text-xs">ETF'er</div>
                <div className="text-white/50 text-[10px]">Positivliste</div>
                <div className="text-white/30 text-[9px] mt-1">Lager → Aktieindkomst</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded p-2">
                <div className="text-purple-400 font-semibold text-xs">ETF'er</div>
                <div className="text-white/50 text-[10px]">IKKE positivliste</div>
                <div className="text-white/30 text-[9px] mt-1">Lager → Kapitalindkomst</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded p-2">
                <div className="text-green-400 font-semibold text-xs">INV.FONDE</div>
                <div className="text-white/50 text-[10px]">Akkumulerende</div>
                <div className="text-white/30 text-[9px] mt-1">Lagerbeskatning</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded p-2">
                <div className="text-green-400 font-semibold text-xs">INV.FONDE</div>
                <div className="text-white/50 text-[10px]">Udloddende</div>
                <div className="text-white/30 text-[9px] mt-1">Realisation</div>
              </div>
            </div>
          </div>

          {/* Pil ned */}
          <div className="text-center text-white/30 my-3">↓ <span className="text-xs">Klassificeres til</span></div>

          {/* KLASSIFICERING */}
          <div className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">KLASSIFICERING</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                <div className="text-blue-400 font-semibold text-sm">AKTIEINDKOMST</div>
                <div className="text-white/50 text-xs">27% / 42% (progression)</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• Aktier (realisation)</li>
                  <li>• ETF positivliste (lager)</li>
                  <li>• Investeringsforeninger</li>
                  <li>• Udbytter</li>
                </ul>
                <div className="text-blue-400/60 text-[9px] mt-2">📚 PSL § 8a</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                <div className="text-purple-400 font-semibold text-sm">KAPITALINDKOMST</div>
                <div className="text-white/50 text-xs">~37% (asymmetrisk)</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• ETF ikke-positivliste</li>
                  <li>• Obligationer</li>
                  <li>• Finansielle kontrakter</li>
                  <li>• Krypto</li>
                </ul>
                <div className="text-purple-400/60 text-[9px] mt-2">📚 PSL § 4</div>
              </div>
            </div>
          </div>

          {/* Pil ned */}
          <div className="text-center text-white/30 my-3">↓ <span className="text-xs">Beregner skat</span></div>

          {/* SKATTEBEREGNING */}
          <div className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">SKATTEBEREGNING</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white/5 border border-white/20 rounded p-3">
                <div className="text-white font-semibold text-xs">ÅRSOPGØRELSE</div>
                <div className="text-white/50 text-[10px]">Rubrik 66/67</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• Aktieindkomst 27%/42%</li>
                  <li>• Kapitalindkomst ~37%</li>
                  <li>• Betales selv</li>
                </ul>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                <div className="text-green-400 font-semibold text-xs">ASK</div>
                <div className="text-white/50 text-[10px]">17% lager</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• Trækkes automatisk</li>
                  <li>• Max 174.200 kr</li>
                </ul>
                <div className="text-green-400/60 text-[9px] mt-2">📚 ASKL § 13</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <div className="text-yellow-400 font-semibold text-xs">PENSION</div>
                <div className="text-white/50 text-[10px]">15,3% PAL</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• Trækkes automatisk</li>
                  <li>• Af pensionsselskab</li>
                </ul>
                <div className="text-yellow-400/60 text-[9px] mt-2">📚 PAL § 2</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                <div className="text-cyan-400 font-semibold text-xs">BØRNEOPSPARING</div>
                <div className="text-white/50 text-[10px]">0%</div>
                <ul className="text-white/40 text-[10px] mt-2">
                  <li>• Skattefri</li>
                  <li>• Bundet til 21 år</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pil ned */}
          <div className="text-center text-white/30 my-3">↓ <span className="text-xs">Tab gemmes i</span></div>

          {/* FRADRAGSBANK */}
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">FRADRAGSBANK (TAB)</div>
            <div className="text-xs text-white/40 mb-2">Tab kan fremføres ubegrænset og bruges til at reducere fremtidig skat</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <div className="text-blue-400 font-semibold text-[10px]">NOTERET AKTIE</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li>• Mod aktiegevinst</li>
                  <li>• Mod udbytter</li>
                  <li>• Ægtefælle: JA</li>
                </ul>
                <div className="text-blue-400/60 text-[8px] mt-1">ABL § 13A</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <div className="text-blue-400 font-semibold text-[10px]">UNOTERET AKTIE</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li>• Mod AL aktieindkomst</li>
                  <li>• Ægtefælle: JA</li>
                </ul>
                <div className="text-blue-400/60 text-[8px] mt-1">ABL § 13</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                <div className="text-purple-400 font-semibold text-[10px]">KAPITAL GENEREL</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li>• Mod kapitalindkomst</li>
                  <li>• IKKE fin.kontrakter</li>
                  <li>• Ægtefælle: JA</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                <div className="text-red-400 font-semibold text-[10px]">FIN. KONTRAKTER</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li className="text-yellow-400">⚠️ KUN mod fin.kontr.</li>
                  <li>• Meget begrænset</li>
                </ul>
                <div className="text-red-400/60 text-[8px] mt-1">KGL § 32</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                <div className="text-green-400 font-semibold text-[10px]">ASK ISOLERET</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li>• Kun samme ASK</li>
                  <li className="text-yellow-400">⚠️ Tabes ved lukning</li>
                  <li>• Ægtefælle: NEJ</li>
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <div className="text-yellow-400 font-semibold text-[10px]">PENSION ISOLERET</div>
                <ul className="text-white/30 text-[8px] mt-1">
                  <li>• Kun samme konto</li>
                  <li>• Ægtefælle: NEJ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-white/30 text-xs">
              📚 Kilder: Aktieavancebeskatningsloven (ABL), Personskatteloven (PSL), Kursgevinstloven (KGL), PAL-loven, ASKL
            </p>
            <p className="text-white/20 text-[10px] mt-1">
              ⚠️ Dette er til uddannelsesformål. Kontakt revisor for præcis rådgivning.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {selectedPosition && (
        <SimulatorView
          position={selectedPosition}
          kontoType={kontoType}
          erGift={erGift}
          simulatorState={simulatorState}
          onClose={() => setSelectedPosition(null)}
          onGennemfør={handleGennemførSalg}
        />
      )}
    </div>
  );
}

export default App;
