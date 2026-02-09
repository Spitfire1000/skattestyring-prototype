/**
 * ONBOARDING WIZARD
 *
 * Step-by-step wizard til opsætning af tabsbank.
 * Dato-intelligent: Ved hvilken årsopgørelse der er tilgængelig.
 *
 * Trin:
 * 1. Velkomst + dato-kontekst
 * 2. Noterede aktier (specifikation på årsopgørelsen)
 * 3. Finansielle kontrakter (rubrik 85/86)
 * 4. ASK (bankens opgørelse)
 * 5. Info om kapitalindkomst (ingen input)
 * 6. Upload handler (hvis der er hul mellem opgørelse og nu)
 * 7. Opsummering
 */

import { useState, useMemo, useCallback } from 'react';
import {
  opretOnboardingState,
  genererOnboardingTrin,
  opdaterSaldoer,
  næsteTrin,
  forrigeTrin,
  hentFremskridt,
  hentSaldoResumé,
  beregnSamletFremførtTab,
  validerOnboarding,
  markerHandlerUploadet,
  type OnboardingState,
  type OnboardingTrin,
  type OnboardingSaldoer,
} from '../services/onboarding';
import type { RubrikVejledning } from '../constants/skatDkVejledning';

// ============================================================
// TYPES
// ============================================================

interface OnboardingWizardProps {
  onKomplet?: (state: OnboardingState) => void;
  onAfbryd?: () => void;
}

// ============================================================
// FORMATERING
// ============================================================

function formatKr(beløb: number): string {
  return beløb.toLocaleString('da-DK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function OnboardingWizard({ onKomplet, onAfbryd }: OnboardingWizardProps) {
  // State
  const [state, setState] = useState<OnboardingState>(() => opretOnboardingState());

  // Generér trin baseret på kontekst
  const trin = useMemo(() => genererOnboardingTrin(), []);

  // Nuværende trin
  const aktivtTrin = trin[state.aktivtTrin];

  // Fremskridt
  const fremskridt = hentFremskridt(state);

  // Handlers
  const handleNæste = useCallback(() => {
    setState((prev) => {
      const nyt = næsteTrin(prev);
      // Tjek om vi er færdige
      if (nyt.aktivtTrin === trin.length - 1 && nyt.erKomplet) {
        onKomplet?.(nyt);
      }
      return nyt;
    });
  }, [trin.length, onKomplet]);

  const handleForrige = useCallback(() => {
    setState((prev) => forrigeTrin(prev));
  }, []);

  const handleSaldoChange = useCallback((felt: keyof OnboardingSaldoer, værdi: number) => {
    setState((prev) => opdaterSaldoer(prev, felt, værdi));
  }, []);

  const handleUploadKomplet = useCallback(() => {
    setState((prev) => markerHandlerUploadet(prev, prev.kontekst.årDerMangler));
  }, []);

  const handleFærdig = useCallback(() => {
    onKomplet?.(state);
  }, [state, onKomplet]);

  // Validering
  const advarsler = validerOnboarding(state);

  return (
    <div className="border border-white/20 rounded-lg bg-[#0d1321] overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Opsæt din Tabsbank
            </h2>
            <p className="text-[10px] text-white/50 mt-0.5">
              Trin {state.aktivtTrin + 1} af {trin.length}
            </p>
          </div>
          {onAfbryd && (
            <button
              onClick={onAfbryd}
              className="text-white/40 hover:text-white/60 text-xs px-2 py-1"
            >
              Afbryd
            </button>
          )}
        </div>

        {/* Fremskridtsbar */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${fremskridt}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {aktivtTrin.type === 'info' && (
          <InfoTrin trin={aktivtTrin} kontekst={state.kontekst} />
        )}

        {aktivtTrin.type === 'input' && aktivtTrin.vejledning && (
          <InputTrin
            trin={aktivtTrin}
            state={state}
            onSaldoChange={handleSaldoChange}
          />
        )}

        {aktivtTrin.type === 'upload' && (
          <UploadTrin
            trin={aktivtTrin}
            erUploadet={state.handlerUploadet}
            onUploadKomplet={handleUploadKomplet}
          />
        )}

        {aktivtTrin.type === 'summary' && (
          <SummaryTrin state={state} advarsler={advarsler} />
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-white/20 flex justify-between items-center">
        <button
          onClick={handleForrige}
          disabled={state.aktivtTrin === 0}
          className={`px-4 py-2 rounded text-sm transition-colors ${
            state.aktivtTrin === 0
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          ← Forrige
        </button>

        {state.aktivtTrin < trin.length - 1 ? (
          <button
            onClick={handleNæste}
            className="px-4 py-2 rounded text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            Næste →
          </button>
        ) : (
          <button
            onClick={handleFærdig}
            disabled={advarsler.length > 0}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              advarsler.length > 0
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            Færdig ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INFO TRIN
// ============================================================

interface InfoTrinProps {
  trin: OnboardingTrin;
  kontekst: OnboardingState['kontekst'];
}

function InfoTrin({ trin, kontekst }: InfoTrinProps) {
  const isWarning = trin.beskedType === 'warning';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{trin.titel}</h3>

      {trin.beskrivelse && (
        <div
          className={`p-4 rounded-lg border ${
            isWarning
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{isWarning ? '⚠️' : 'ℹ️'}</span>
            <p className="text-sm leading-relaxed">{trin.beskrivelse}</p>
          </div>
        </div>
      )}

      {/* Vis dato-kontekst */}
      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <div className="text-[10px] text-white/50 uppercase">Dato-kontekst</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/40 text-xs">Seneste årsopgørelse</div>
            <div className="text-white font-mono">{kontekst.senesteÅrsopgørelse}</div>
          </div>
          <div>
            <div className="text-white/40 text-xs">Indeværende år</div>
            <div className="text-white font-mono">{kontekst.indeværendeÅr}</div>
          </div>
        </div>
        {kontekst.årDerMangler.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-white/40 text-xs">Skal dækkes med handler</div>
            <div className="text-orange-400 font-mono">
              {kontekst.årDerMangler.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INPUT TRIN
// ============================================================

interface InputTrinProps {
  trin: OnboardingTrin;
  state: OnboardingState;
  onSaldoChange: (felt: keyof OnboardingSaldoer, værdi: number) => void;
}

function InputTrin({ trin, state, onSaldoChange }: InputTrinProps) {
  const vejledning = trin.vejledning!;

  // Map pulje til saldo-felt
  const feltMap: Record<string, keyof OnboardingSaldoer> = {
    'noteret_aktie_saldo': 'noteretAktieTab',
    'unoteret_aktie_saldo': 'unoteretAktieTab',
    'finansiel_kontrakt_saldo_85': 'finansielKontraktIkkeAktie',
    'finansiel_kontrakt_saldo_86': 'finansielKontraktAktie',
    'ask_fremført_tab': 'askFremførtTab',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{vejledning.titel}</h3>
        <p className="text-sm text-white/60">{vejledning.undertitel}</p>
      </div>

      {/* Rubrik-vejledninger */}
      {vejledning.rubrikker.map((rubrik, idx) => (
        <RubrikVejledningBox key={idx} rubrik={rubrik} />
      ))}

      {/* Input-felter */}
      <div className="space-y-3 pt-2">
        {vejledning.inputFelter.map((felt) => {
          const saldoFelt = feltMap[felt.id];
          const værdi = saldoFelt ? state.saldoer[saldoFelt] : 0;

          return (
            <div key={felt.id} className="space-y-1">
              <label className="text-sm text-white/80 block">
                {felt.label}
                {!felt.påkrævet && (
                  <span className="text-white/40 ml-1">(valgfrit)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={værdi || ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    if (saldoFelt) {
                      onSaldoChange(saldoFelt, v);
                    }
                  }}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 pr-12 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                  kr
                </span>
              </div>
              <p className="text-[10px] text-white/40">{felt.hjælpetekst}</p>
            </div>
          );
        })}
      </div>

      {/* Info-tekst (for kapitalindkomst) */}
      {vejledning.infoTekst && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-200">{vejledning.infoTekst}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RUBRIK VEJLEDNING BOX
// ============================================================

interface RubrikVejledningBoxProps {
  rubrik: RubrikVejledning;
}

function RubrikVejledningBox({ rubrik }: RubrikVejledningBoxProps) {
  const [erÅben, setErÅben] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setErÅben(!erÅben)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm">
              {rubrik.rubrikNummer}
            </span>
            {rubrik.blanketNummer && (
              <span className="text-[10px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                Blanket {rubrik.blanketNummer}
              </span>
            )}
          </div>
          <div className="text-white text-sm mt-0.5">{rubrik.rubrikNavn}</div>
        </div>
        <span className="text-white/40 text-lg">{erÅben ? '−' : '+'}</span>
      </button>

      {/* Indhold */}
      {erÅben && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          {/* Trin-for-trin */}
          <div>
            <div className="text-[10px] text-white/50 uppercase mb-2">
              Sådan finder du det
            </div>
            <ol className="space-y-1.5">
              {rubrik.hvordanFinderDuDet.map((step, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-white/80">
                  <span className="text-emerald-400 font-mono text-xs mt-0.5">
                    {idx + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Hvad skal du indtaste */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
            <div className="text-[10px] text-emerald-400 uppercase mb-1">
              Hvad skal du indtaste?
            </div>
            <p className="text-sm text-white/90">{rubrik.hvadSkalDuIndtaste}</p>
          </div>

          {/* Hvis ingen værdi */}
          <div className="text-sm text-white/60">
            <span className="text-white/40">Hvis tom: </span>
            {rubrik.hvisIngenVærdi}
          </div>

          {/* Vigtigt */}
          {rubrik.vigtigt && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
              <div className="text-[10px] text-yellow-400 uppercase mb-1">
                Vigtigt
              </div>
              <p className="text-sm text-yellow-200">{rubrik.vigtigt}</p>
            </div>
          )}

          {/* Link til skat.dk */}
          {rubrik.skatDkUrl && (
            <a
              href={rubrik.skatDkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Læs mere på skat.dk →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// UPLOAD TRIN
// ============================================================

interface UploadTrinProps {
  trin: OnboardingTrin;
  erUploadet: boolean;
  onUploadKomplet: () => void;
}

function UploadTrin({ trin, erUploadet, onUploadKomplet }: UploadTrinProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{trin.titel}</h3>

      {trin.beskrivelse && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-sm text-yellow-200 leading-relaxed">
              {trin.beskrivelse}
            </p>
          </div>
        </div>
      )}

      {/* Upload-zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          erUploadet
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        {erUploadet ? (
          <div className="space-y-2">
            <div className="text-4xl">✓</div>
            <div className="text-emerald-400 font-semibold">Handler uploadet</div>
            <div className="text-white/40 text-sm">
              {trin.uploadÅr?.join(' og ')}-handler er klar til beregning
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl text-white/20">📁</div>
            <div className="text-white/60">
              Træk CSV-filer hertil eller klik for at vælge
            </div>
            <div className="text-[10px] text-white/40">
              Understøtter Nordnet og Saxo Bank eksporter
            </div>

            {/* Simulér upload-knap */}
            <button
              onClick={onUploadKomplet}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
            >
              Vælg filer...
            </button>

            <div className="pt-2">
              <button
                onClick={onUploadKomplet}
                className="text-xs text-white/40 hover:text-white/60 underline"
              >
                Spring over (ingen handler at uploade)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY TRIN
// ============================================================

interface SummaryTrinProps {
  state: OnboardingState;
  advarsler: string[];
}

function SummaryTrin({ state, advarsler }: SummaryTrinProps) {
  const resumé = hentSaldoResumé(state);
  const samletTab = beregnSamletFremførtTab(state);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Oversigt over din tabsbank</h3>

      {/* Advarsler */}
      {advarsler.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-1">
          <div className="text-[10px] text-red-400 uppercase font-semibold">
            Mangler
          </div>
          {advarsler.map((advarsel, idx) => (
            <div key={idx} className="text-sm text-red-200 flex items-center gap-2">
              <span>•</span>
              {advarsel}
            </div>
          ))}
        </div>
      )}

      {/* Saldoer */}
      <div className="space-y-2">
        <div className="text-[10px] text-white/50 uppercase">
          Fremførte tab fra {state.saldoÅr}-årsopgørelse
        </div>

        {resumé.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-4 text-center text-white/40 text-sm">
            Ingen fremførte tab indtastet
          </div>
        ) : (
          <div className="space-y-2">
            {resumé.map((post, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white/5 rounded px-3 py-2"
              >
                <span className="text-white/80 text-sm">{post.label}</span>
                <span className="text-white font-mono">{formatKr(post.beløb)} kr</span>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2">
              <span className="text-emerald-400 font-semibold text-sm">Samlet fremført tab</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {formatKr(samletTab)} kr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Handler-status */}
      {state.kontekst.årDerMangler.length > 0 && (
        <div
          className={`rounded-lg p-3 flex items-center gap-3 ${
            state.handlerUploadet
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-yellow-500/10 border border-yellow-500/30'
          }`}
        >
          <span className="text-xl">{state.handlerUploadet ? '✓' : '⚠️'}</span>
          <div>
            <div
              className={`text-sm font-semibold ${
                state.handlerUploadet ? 'text-emerald-400' : 'text-yellow-400'
              }`}
            >
              {state.handlerUploadet
                ? `${state.kontekst.årDerMangler.join(' og ')}-handler uploadet`
                : `Mangler ${state.kontekst.årDerMangler.join(' og ')}-handler`}
            </div>
            {!state.handlerUploadet && (
              <div className="text-xs text-yellow-200/60">
                Gå tilbage og upload dine handler
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-white/5 rounded-lg p-3 text-[10px] text-white/40">
        Du kan altid redigere disse værdier senere under indstillinger.
      </div>
    </div>
  );
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default OnboardingWizard;
