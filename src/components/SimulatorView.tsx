/**
 * SIMULATOR VIEW
 *
 * Viser fuld audit-trail for skatteberegninger med alle mellemregninger
 * og lovhenvisninger.
 */

import { useState, useMemo } from 'react';
import type { ParsedPosition } from '../services/csvParser';
import type { KontoType, TabsPulje, AktivType } from '../types/skat';
import { SKATTESATSER, AKTIV_SKATTEREGLER, MODREGNING_REGLER } from '../constants/skatteRegler';
import {
  getLovhenvisningForAktiv,
  getLovhenvisningForTabspulje,
  getLovhenvisningForKonto,
  getKilderForBeregning,
  LOVE,
} from '../constants/lovhenvisninger';

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

interface SimulatorState {
  skatteår: number;
  aktieindkomstIÅr: number; // Allerede optjent aktieindkomst i år
  fradragsbank: FradragsbankPulje[];
}

interface SimulatorViewProps {
  position: ParsedPosition;
  kontoType: KontoType;
  erGift: boolean;
  simulatorState: SimulatorState;
  onClose: () => void;
  onGennemfør: (
    resultat: BeregningsResultat
  ) => void;
}

interface BeregningsResultat {
  gevinstTab: number;
  erGevinst: boolean;
  beskatteligGevinst: number;
  skat: number;
  skatUdenModregning: number;
  modregnetBeløb: number;
  tabTilFradragsbank: number;
  pulje: TabsPulje;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' kr';
}

function formatKrHel(n: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + ' kr';
}

function formatPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function getIndkomstTypeNavn(type: 'AKTIEINDKOMST' | 'KAPITALINDKOMST'): string {
  return type === 'AKTIEINDKOMST' ? 'Aktieindkomst' : 'Kapitalindkomst';
}

function getBeskatningsprincipNavn(princip: 'REALISATION' | 'LAGER'): string {
  return princip === 'REALISATION' ? 'Realisation (ved salg)' : 'Lager (årlig)';
}

function getAktivTypeNavn(type: AktivType): string {
  const navne: Record<AktivType, string> = {
    'AKTIE_NOTERET': 'Noteret aktie',
    'AKTIE_UNOTERET': 'Unoteret aktie',
    'ETF_POSITIVLISTE': 'ETF (positivliste)',
    'ETF_IKKE_POSITIVLISTE': 'ETF (ikke positivliste)',
    'INVESTERINGSFORENING_UDBYTTE': 'Investeringsforening (udloddende)',
    'INVESTERINGSFORENING_AKKUM': 'Investeringsforening (akkumulerende)',
    'OBLIGATION': 'Obligation',
    'OPTION': 'Option',
    'WARRANT': 'Warrant',
    'CFD': 'CFD',
    'FUTURE': 'Future',
    'KRYPTO': 'Kryptovaluta',
  };
  return navne[type] || type;
}

function getPuljeNavn(pulje: TabsPulje): string {
  const navne: Record<TabsPulje, string> = {
    'NOTERET_AKTIE': 'Noterede aktier',
    'UNOTERET_AKTIE': 'Unoterede aktier',
    'KAPITAL_GENEREL': 'Kapitalindkomst (generel)',
    'FINANSIEL_KONTRAKT': 'Finansielle kontrakter',
    'ASK_ISOLERET': 'ASK (isoleret)',
    'PENSION_ISOLERET': 'Pension (isoleret)',
  };
  return navne[pulje] || pulje;
}

// ============================================================
// STEP COMPONENTS
// ============================================================

interface StepProps {
  nummer: number;
  titel: string;
  children: React.ReactNode;
}

function Step({ nummer, titel, children }: StepProps) {
  return (
    <div className="border border-white/20 rounded-lg overflow-hidden">
      <div className="bg-white/10 px-4 py-2 border-b border-white/20">
        <h3 className="font-semibold text-white">
          TRIN {nummer}: {titel}
        </h3>
      </div>
      <div className="p-4 space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
}

interface RefBoxProps {
  paragraf: string;
  tekst?: string;
}

function RefBox({ paragraf, tekst }: RefBoxProps) {
  return (
    <div className="flex items-start gap-2 text-xs text-blue-400 mt-2 pt-2 border-t border-white/10">
      <span>📚</span>
      <span>
        <strong>Ref:</strong> {paragraf}
        {tekst && <span className="text-white/50 ml-1">({tekst})</span>}
      </span>
    </div>
  );
}

interface CalcLineProps {
  label: string;
  value: string;
  highlight?: 'green' | 'red' | 'yellow' | 'blue';
  bold?: boolean;
  indent?: boolean;
}

function CalcLine({ label, value, highlight, bold, indent }: CalcLineProps) {
  const colorClass = highlight
    ? highlight === 'green' ? 'text-green-400'
    : highlight === 'red' ? 'text-red-400'
    : highlight === 'yellow' ? 'text-yellow-400'
    : 'text-blue-400'
    : 'text-white';

  return (
    <div className={`flex justify-between ${indent ? 'pl-4' : ''} ${bold ? 'font-semibold' : ''}`}>
      <span className="text-white/70">{label}</span>
      <span className={colorClass}>{value}</span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SimulatorView({
  position,
  kontoType,
  erGift,
  simulatorState,
  onClose,
  onGennemfør,
}: SimulatorViewProps) {
  // Input state
  const [antalSælges, setAntalSælges] = useState(position.antal);
  const [salgskurs, setSalgskurs] = useState(position.aktuelKurs);

  // Hent regler
  const aktivRegler = AKTIV_SKATTEREGLER[position.aktivType];
  const aktivLovRef = getLovhenvisningForAktiv(position.aktivType);
  const kontoLovRef = getLovhenvisningForKonto(kontoType);

  // Beregn tabspulje baseret på kontotype
  const tabsPulje: TabsPulje = useMemo(() => {
    if (kontoType === 'ASK') return 'ASK_ISOLERET';
    if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(kontoType)) {
      return 'PENSION_ISOLERET';
    }
    return aktivRegler.tabspulje;
  }, [kontoType, aktivRegler]);

  const tabspuljeLovRef = getLovhenvisningForTabspulje(tabsPulje);
  const modregningRegler = MODREGNING_REGLER[tabsPulje];

  // ============================================================
  // BEREGNINGER
  // ============================================================

  const beregning = useMemo(() => {
    // TRIN 2: Gevinst/Tab
    const anskaffelseskursPrStk = position.anskaffelsessum / position.antal;
    const anskaffelsessumForSalg = antalSælges * anskaffelseskursPrStk;
    const salgspris = antalSælges * salgskurs;
    const gevinstTab = salgspris - anskaffelsessumForSalg;
    const erGevinst = gevinstTab >= 0;

    // TRIN 3: Fradragsbank check
    const fradragsbankPulje = simulatorState.fradragsbank.find(p => p.pulje === tabsPulje);
    const tilgængeligtTab = fradragsbankPulje ? (fradragsbankPulje.primo - fradragsbankPulje.brugt + fradragsbankPulje.tilføjet) : 0;

    let modregnetBeløb = 0;
    let beskatteligGevinst = gevinstTab;
    let tabTilFradragsbank = 0;

    if (erGevinst && tilgængeligtTab > 0 && kontoType !== 'BØRNEOPSPARING') {
      // Modregn tab i gevinst
      modregnetBeløb = Math.min(gevinstTab, tilgængeligtTab);
      beskatteligGevinst = gevinstTab - modregnetBeløb;
    } else if (!erGevinst && kontoType !== 'BØRNEOPSPARING') {
      // Tab til fradragsbank
      tabTilFradragsbank = Math.abs(gevinstTab);
      beskatteligGevinst = 0;
    }

    // TRIN 4: Progression (kun for FRIT_DEPOT)
    const progressionsgrænse = erGift
      ? SKATTESATSER.PROGRESSIONSGRÆNSE_GIFT
      : SKATTESATSER.PROGRESSIONSGRÆNSE_ENLIG;

    const aktieindkomstFør = simulatorState.aktieindkomstIÅr;
    const aktieindkomstEfter = aktieindkomstFør + beskatteligGevinst;
    const erUnderGrænse = aktieindkomstEfter <= progressionsgrænse;

    // TRIN 5: Skatteberegning
    let skat = 0;
    let skattesats = 0;
    let skatUdenModregning = 0;

    if (kontoType === 'BØRNEOPSPARING') {
      // Skattefri
      skat = 0;
      skattesats = 0;
    } else if (kontoType === 'ASK') {
      // 17% flat
      skattesats = SKATTESATSER.ASK_SATS;
      skat = Math.max(0, beskatteligGevinst * skattesats);
      skatUdenModregning = Math.max(0, gevinstTab * skattesats);
    } else if (['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(kontoType)) {
      // 15,3% PAL
      skattesats = SKATTESATSER.PAL_SATS;
      skat = Math.max(0, beskatteligGevinst * skattesats);
      skatUdenModregning = Math.max(0, gevinstTab * skattesats);
    } else {
      // FRIT_DEPOT - progression
      if (beskatteligGevinst > 0) {
        if (aktivRegler.indkomsttype === 'AKTIEINDKOMST') {
          // Beregn med progression
          const underGrænseBeløb = Math.min(beskatteligGevinst, Math.max(0, progressionsgrænse - aktieindkomstFør));
          const overGrænseBeløb = Math.max(0, beskatteligGevinst - underGrænseBeløb);

          skat = (underGrænseBeløb * SKATTESATSER.AKTIE_LAV) + (overGrænseBeløb * SKATTESATSER.AKTIE_HØJ);
          skattesats = beskatteligGevinst > 0 ? skat / beskatteligGevinst : SKATTESATSER.AKTIE_LAV;

          // Uden modregning
          const underGrænseUden = Math.min(gevinstTab, Math.max(0, progressionsgrænse - aktieindkomstFør));
          const overGrænseUden = Math.max(0, gevinstTab - underGrænseUden);
          skatUdenModregning = (underGrænseUden * SKATTESATSER.AKTIE_LAV) + (overGrænseUden * SKATTESATSER.AKTIE_HØJ);
        } else {
          // Kapitalindkomst
          skattesats = SKATTESATSER.KAPITAL_POSITIV;
          skat = beskatteligGevinst * skattesats;
          skatUdenModregning = gevinstTab * skattesats;
        }
      }
    }

    return {
      // Input
      antalSælges,
      salgskurs,
      anskaffelseskursPrStk,
      anskaffelsessumForSalg,
      salgspris,

      // Trin 2
      gevinstTab,
      erGevinst,

      // Trin 3
      tilgængeligtTab,
      modregnetBeløb,
      beskatteligGevinst,
      tabTilFradragsbank,

      // Trin 4
      progressionsgrænse,
      aktieindkomstFør,
      aktieindkomstEfter,
      erUnderGrænse,

      // Trin 5
      skat,
      skattesats,
      skatUdenModregning,
      skatBesparelse: skatUdenModregning - skat,
    };
  }, [antalSælges, salgskurs, position, kontoType, erGift, simulatorState, aktivRegler, tabsPulje]);

  // Kilder
  const kilder = getKilderForBeregning(position.aktivType, kontoType, !beregning.erGevinst);

  // Handle gennemfør
  const handleGennemfør = () => {
    onGennemfør({
      gevinstTab: beregning.gevinstTab,
      erGevinst: beregning.erGevinst,
      beskatteligGevinst: beregning.beskatteligGevinst,
      skat: beregning.skat,
      skatUdenModregning: beregning.skatUdenModregning,
      modregnetBeløb: beregning.modregnetBeløb,
      tabTilFradragsbank: beregning.tabTilFradragsbank,
      pulje: tabsPulje,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0a0f1c] border border-white/30 rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0f1c] border-b border-white/20 p-4 flex justify-between items-start z-10">
          <div>
            <h2 className="text-xl font-bold text-white">SKAT-SIMULATOR</h2>
            <p className="text-white/50 text-sm">Fuld audit-trail med mellemregninger</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* BEREGNING HEADER */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white">
              BEREGNING: Salg af {position.antal} stk {position.navn}
            </h3>
            <p className="text-white/50 text-sm mt-1">
              Skatteår: {simulatorState.skatteår} | Kontotype: {kontoType} | Civilstand: {erGift ? 'Gift' : 'Enlig'}
            </p>
          </div>

          {/* INPUT */}
          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">JUSTER SALG</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Antal (har: {position.antal})</label>
                <input
                  type="number"
                  value={antalSælges}
                  onChange={(e) => setAntalSælges(Math.min(position.antal, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  min={0}
                  max={position.antal}
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Salgskurs (nu: {position.aktuelKurs.toFixed(2)})</label>
                <input
                  type="number"
                  value={salgskurs}
                  onChange={(e) => setSalgskurs(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  step={0.01}
                />
              </div>
            </div>
          </div>

          {/* TRIN 1: KLASSIFICERING */}
          <Step nummer={1} titel="KLASSIFICERING">
            <CalcLine label="Aktiv" value={position.navn} />
            <CalcLine label="ISIN" value={position.isin || '(ingen)'} />
            <CalcLine label="Type" value={getAktivTypeNavn(position.aktivType)} highlight="blue" />
            <CalcLine label="Indkomsttype" value={getIndkomstTypeNavn(aktivRegler.indkomsttype)} highlight={aktivRegler.indkomsttype === 'AKTIEINDKOMST' ? 'blue' : 'yellow'} />
            <CalcLine label="Beskatningsprincip" value={getBeskatningsprincipNavn(aktivRegler.beskatningsmetode)} />
            <CalcLine label="Tabspulje" value={`${getPuljeNavn(tabsPulje)} (kildeartsbegrænset)`} />
            <RefBox paragraf={aktivLovRef.paragraf} tekst={aktivLovRef.tekst} />
          </Step>

          {/* TRIN 2: GEVINST/TAB BEREGNING */}
          <Step nummer={2} titel="GEVINST/TAB BEREGNING">
            <CalcLine label="Antal solgt" value={`${antalSælges} stk`} />
            <CalcLine label="Salgskurs" value={formatKr(salgskurs)} />
            <div className="bg-white/5 rounded p-2 my-2 font-mono text-xs">
              <div className="text-white/50">Salgspris = {antalSælges} × {salgskurs.toFixed(2)} =</div>
              <div className="text-white">{formatKr(beregning.salgspris)}</div>
            </div>
            <CalcLine label="Gns. anskaffelseskurs" value={formatKr(beregning.anskaffelseskursPrStk)} />
            <div className="bg-white/5 rounded p-2 my-2 font-mono text-xs">
              <div className="text-white/50">Anskaffelsessum = {antalSælges} × {beregning.anskaffelseskursPrStk.toFixed(2)} =</div>
              <div className="text-white">{formatKr(beregning.anskaffelsessumForSalg)}</div>
            </div>
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="bg-white/5 rounded p-2 font-mono text-xs">
                <div className="text-white/50">{beregning.erGevinst ? 'GEVINST' : 'TAB'} = {formatKr(beregning.salgspris)} - {formatKr(beregning.anskaffelsessumForSalg)} =</div>
                <div className={`text-lg font-bold ${beregning.erGevinst ? 'text-green-400' : 'text-red-400'}`}>
                  {beregning.erGevinst ? '+' : ''}{formatKr(beregning.gevinstTab)}
                </div>
              </div>
            </div>
            <RefBox paragraf="ABL § 26" tekst={LOVE.ABL.paragraffer['§26'].beskrivelse} />
          </Step>

          {/* TRIN 3: FRADRAGSBANK CHECK */}
          <Step nummer={3} titel="FRADRAGSBANK CHECK">
            <CalcLine label="Pulje" value={getPuljeNavn(tabsPulje)} highlight="blue" />
            <CalcLine label="Fremført tab (tilgængeligt)" value={formatKrHel(beregning.tilgængeligtTab)} />

            {beregning.erGevinst ? (
              <>
                <CalcLine
                  label="Kan modregnes i denne gevinst"
                  value={beregning.tilgængeligtTab > 0 && kontoType !== 'BØRNEOPSPARING' ? 'JA' : 'NEJ'}
                  highlight={beregning.tilgængeligtTab > 0 ? 'green' : 'red'}
                />
                {beregning.modregnetBeløb > 0 && (
                  <>
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-2 my-2">
                      <CalcLine label="Modregnet beløb" value={`-${formatKrHel(beregning.modregnetBeløb)}`} highlight="green" bold />
                      <CalcLine label="Fremført tab (efter)" value={formatKrHel(beregning.tilgængeligtTab - beregning.modregnetBeløb)} />
                    </div>
                    <div className="bg-white/5 rounded p-2 font-mono text-xs">
                      <div className="text-white/50">Beskattelig gevinst = {formatKrHel(beregning.gevinstTab)} - {formatKrHel(beregning.modregnetBeløb)} =</div>
                      <div className="text-white font-bold">{formatKrHel(beregning.beskatteligGevinst)}</div>
                    </div>
                  </>
                )}
                {beregning.modregnetBeløb === 0 && (
                  <CalcLine label="Beskattelig gevinst" value={formatKrHel(beregning.gevinstTab)} bold />
                )}
              </>
            ) : (
              <>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2 my-2">
                  <CalcLine label="Tab tilføjes til fradragsbank" value={`+${formatKrHel(beregning.tabTilFradragsbank)}`} highlight="yellow" bold />
                  <CalcLine label="Fremført tab (efter)" value={formatKrHel(beregning.tilgængeligtTab + beregning.tabTilFradragsbank)} />
                </div>
                <div className="text-xs text-white/50 mt-2">
                  <strong>Kan modregnes i:</strong> {modregningRegler.kanModregnesI.join(', ')}
                </div>
                <div className="text-xs mt-1">
                  <span className={modregningRegler.ægtefælleOverførsel ? 'text-green-400' : 'text-red-400'}>
                    Ægtefælle kan bruge: {modregningRegler.ægtefælleOverførsel ? 'JA' : 'NEJ'}
                  </span>
                </div>
              </>
            )}
            <RefBox paragraf={tabspuljeLovRef.paragraf} tekst={tabspuljeLovRef.tekst} />
          </Step>

          {/* TRIN 4: PROGRESSIONSBEREGNING (kun for FRIT_DEPOT med aktieindkomst) */}
          {kontoType === 'FRIT_DEPOT' && aktivRegler.indkomsttype === 'AKTIEINDKOMST' && beregning.erGevinst && (
            <Step nummer={4} titel="PROGRESSIONSBEREGNING">
              <CalcLine label="Civilstand" value={erGift ? 'GIFT' : 'ENLIG'} />
              <CalcLine label="Skatteår" value={String(simulatorState.skatteår)} />
              <CalcLine
                label={`Progressionsgrænse (${erGift ? 'gift' : 'enlig'})`}
                value={formatKrHel(beregning.progressionsgrænse)}
                highlight="blue"
              />

              <div className="bg-white/5 rounded p-2 my-2 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/50">Aktieindkomst FØR dette salg:</span>
                  <span className="text-white">{formatKrHel(beregning.aktieindkomstFør)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">+ Denne gevinst (efter modregning):</span>
                  <span className="text-white">{formatKrHel(beregning.beskatteligGevinst)}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-1">
                  <span className="text-white">= Samlet aktieindkomst:</span>
                  <span className="text-white font-bold">{formatKrHel(beregning.aktieindkomstEfter)}</span>
                </div>
              </div>

              <CalcLine
                label="Status"
                value={beregning.erUnderGrænse ? '✅ UNDER progressionsgrænse' : '⚠️ OVER progressionsgrænse'}
                highlight={beregning.erUnderGrænse ? 'green' : 'yellow'}
                bold
              />
              <CalcLine
                label="Sats anvendt"
                value={beregning.erUnderGrænse ? '27%' : '27% + 42% (blandet)'}
              />
              <RefBox paragraf="PSL § 8a, stk. 1 + stk. 4" tekst="Aktieindkomstskat + ægtefællers fælles grænse" />
            </Step>
          )}

          {/* TRIN 5: SKATTEBEREGNING */}
          <Step nummer={5} titel="SKATTEBEREGNING">
            {kontoType === 'BØRNEOPSPARING' ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded p-4 text-center">
                <div className="text-green-400 text-2xl font-bold">SKATTEFRI</div>
                <div className="text-white/50 text-sm mt-1">Børneopsparing er fritaget for skat</div>
              </div>
            ) : beregning.erGevinst ? (
              <>
                <CalcLine label="Beskattelig gevinst" value={formatKrHel(beregning.beskatteligGevinst)} />
                <CalcLine label="Skattesats" value={formatPct(beregning.skattesats)} />

                <div className="bg-white/5 rounded p-2 my-2 font-mono text-xs">
                  <div className="text-white/50">SKAT = {formatKrHel(beregning.beskatteligGevinst)} × {formatPct(beregning.skattesats)} =</div>
                  <div className="text-yellow-400 text-lg font-bold">{formatKrHel(beregning.skat)}</div>
                </div>

                {beregning.modregnetBeløb > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3 my-3">
                    <div className="text-sm font-semibold text-white mb-2">💰 SAMMENLIGNING</div>
                    <CalcLine label="Uden fradragsbank" value={formatKrHel(beregning.skatUdenModregning)} />
                    <CalcLine label="Med fradragsbank" value={formatKrHel(beregning.skat)} highlight="green" />
                    <div className="border-t border-green-500/30 mt-2 pt-2">
                      <CalcLine label="SPARET" value={formatKrHel(beregning.skatBesparelse)} highlight="green" bold />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4">
                <div className="text-orange-400 font-semibold">INGEN SKAT (TAB)</div>
                <div className="text-white/50 text-sm mt-1">
                  Tab på {formatKrHel(beregning.tabTilFradragsbank)} gemmes i fradragsbanken
                  og kan bruges til at reducere fremtidige gevinster.
                </div>
              </div>
            )}
            <RefBox paragraf={kontoLovRef.paragraf} tekst={kontoLovRef.tekst} />
          </Step>

          {/* KILDER */}
          <div className="border border-white/20 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">📚 KILDER</h3>
            <div className="space-y-1">
              {kilder.map((kilde, i) => (
                <div key={i} className="text-xs">
                  <span className="text-blue-400">• </span>
                  <a
                    href={kilde.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {kilde.titel}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* RESULTAT SAMMENFATNING */}
          <div className={`rounded-lg p-4 ${beregning.erGevinst ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
            <h3 className="font-bold text-white text-lg mb-2">RESULTAT</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/50 text-xs uppercase">Gevinst/Tab</div>
                <div className={`text-xl font-bold ${beregning.erGevinst ? 'text-green-400' : 'text-red-400'}`}>
                  {beregning.erGevinst ? '+' : ''}{formatKrHel(beregning.gevinstTab)}
                </div>
              </div>
              <div>
                <div className="text-white/50 text-xs uppercase">Skat</div>
                <div className="text-xl font-bold text-yellow-400">
                  {kontoType === 'BØRNEOPSPARING' ? 'Skattefri' : formatKrHel(beregning.skat)}
                </div>
              </div>
              {beregning.modregnetBeløb > 0 && (
                <div>
                  <div className="text-white/50 text-xs uppercase">Modregnet fra fradragsbank</div>
                  <div className="text-lg font-bold text-green-400">-{formatKrHel(beregning.modregnetBeløb)}</div>
                </div>
              )}
              {beregning.tabTilFradragsbank > 0 && (
                <div>
                  <div className="text-white/50 text-xs uppercase">Tilføjes til fradragsbank</div>
                  <div className="text-lg font-bold text-orange-400">+{formatKrHel(beregning.tabTilFradragsbank)}</div>
                </div>
              )}
            </div>
          </div>

          {/* KNAPPER */}
          <div className="flex gap-3 sticky bottom-0 bg-[#0a0f1c] pt-4 pb-2">
            <button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-3 text-white transition-colors"
            >
              Annuller
            </button>
            <button
              onClick={handleGennemfør}
              className={`flex-1 rounded-lg py-3 font-semibold transition-colors ${
                beregning.erGevinst
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              {beregning.erGevinst ? '✓ Gennemfør salg' : '⚠️ Realisér tab'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulatorView;
