/**
 * INTERACTIVE FLOWCHART
 *
 * Interaktivt flowchart der viser hele skattestien med farve-highlight.
 * Klik på en node for at vælge den og se hele stien lyse op.
 */

import type { KontoType, AktivType, TabsPulje } from '../types/skat';
import {
  getSatserForÅr,
  klassificerIndkomst,
  getTabspulje,
  MODREGNING_REGLER,
  type IndkomstType
} from '../constants/skatteRegler';

// ============================================================
// TYPES
// ============================================================

export interface FlowSelection {
  konto: KontoType | null;
  aktiv: AktivType | null;
}

interface FlowChartProps {
  selection: FlowSelection;
  onSelectionChange: (selection: FlowSelection) => void;
  erGift: boolean;
  skatteår: number;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatKr(n: number): string {
  return new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);
}

// ============================================================
// FARVE DEFINITIONER
// ============================================================

const KONTO_FARVER: Record<KontoType, { bg: string; border: string; text: string; glow: string }> = {
  FRIT_DEPOT: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/50' },
  ASK: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' },
  BOERNEOPSPARING: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/50' },
  RATEPENSION: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  ALDERSOPSPARING: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  LIVRENTE: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  KAPITALPENSION: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
};

// ============================================================
// NODE COMPONENT
// ============================================================

interface FlowNodeProps {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  isInPath: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  colorClass?: { bg: string; border: string; text: string; glow: string };
  children?: React.ReactNode;
}

function FlowNode({ label, sublabel, isSelected, isInPath, isDisabled, onClick, colorClass, children }: FlowNodeProps) {
  const baseClasses = "rounded-lg p-3 transition-all duration-200 cursor-pointer";

  let stateClasses: string;
  if (isDisabled) {
    stateClasses = "bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed opacity-50";
  } else if (isSelected && colorClass) {
    stateClasses = `${colorClass.bg} border-2 ${colorClass.border} ${colorClass.text} shadow-lg ${colorClass.glow}`;
  } else if (isInPath && colorClass) {
    stateClasses = `${colorClass.bg} border ${colorClass.border} ${colorClass.text}`;
  } else {
    stateClasses = "bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40";
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className="font-semibold text-sm">{label}</div>
      {sublabel && <div className="text-xs opacity-70 mt-0.5">{sublabel}</div>}
      {children}
    </div>
  );
}

// ============================================================
// CONNECTION ARROW
// ============================================================

function FlowArrow({ isActive, colorClass }: { isActive: boolean; colorClass?: { text: string } }) {
  return (
    <div className={`text-center py-1 ${isActive && colorClass ? colorClass.text : 'text-white/30'}`}>
      <span className="text-lg">↓</span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function InteractiveFlowChart({ selection, onSelectionChange, erGift, skatteår }: FlowChartProps) {
  const selectedKonto = selection.konto;
  const selectedAktiv = selection.aktiv;

  // Hent satser for det valgte skatteår
  const satser = getSatserForÅr(skatteår);
  const progressionsgrænse = erGift
    ? satser.aktieindkomst.grænseGift
    : satser.aktieindkomst.grænseEnlig;

  // Hent farve baseret på valgt konto
  const activeColor = selectedKonto ? KONTO_FARVER[selectedKonto] : undefined;

  // Brug de nye klassificerings- og tabspulje-funktioner
  let indkomsttype: IndkomstType | null = null;
  let tabsPulje: TabsPulje | null = null;

  if (selectedKonto && selectedAktiv) {
    try {
      indkomsttype = klassificerIndkomst(selectedKonto, selectedAktiv);
      tabsPulje = getTabspulje(selectedKonto, selectedAktiv);
    } catch (error) {
      console.error('Fejl i klassificering:', error);
      // Nulstil hvis der er en fejl
      indkomsttype = null;
      tabsPulje = null;
    }
  }

  const modregningRegler = tabsPulje ? MODREGNING_REGLER[tabsPulje] : null;

  // Handlers
  const handleKontoClick = (konto: KontoType) => {
    if (selection.konto === konto) {
      // Klik på samme konto = nulstil alt
      onSelectionChange({ konto: null, aktiv: null });
    } else {
      // Skift til ny konto = nulstil aktiv
      onSelectionChange({ konto, aktiv: null });
    }
  };

  const handleAktivClick = (aktiv: AktivType) => {
    if (!selectedKonto) return;
    onSelectionChange({
      ...selection,
      aktiv: selection.aktiv === aktiv ? null : aktiv
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4">
      {/* TRIN 1: KONTOTYPE */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">1</span>
          VÆLG KONTOTYPE
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <FlowNode
            label="FRIT DEPOT"
            sublabel="27%/42%"
            isSelected={selectedKonto === 'FRIT_DEPOT'}
            isInPath={false}
            colorClass={KONTO_FARVER.FRIT_DEPOT}
            onClick={() => handleKontoClick('FRIT_DEPOT')}
          />
          <FlowNode
            label="ASK"
            sublabel="17% lager"
            isSelected={selectedKonto === 'ASK'}
            isInPath={false}
            colorClass={KONTO_FARVER.ASK}
            onClick={() => handleKontoClick('ASK')}
          />
          <FlowNode
            label="BØRNEOPSPARING"
            sublabel="0% skattefri"
            isSelected={selectedKonto === 'BOERNEOPSPARING'}
            isInPath={false}
            colorClass={KONTO_FARVER.BOERNEOPSPARING}
            onClick={() => handleKontoClick('BOERNEOPSPARING')}
          />
          <FlowNode
            label="PENSION"
            sublabel="15,3% PAL"
            isSelected={selectedKonto === 'RATEPENSION' || selectedKonto === 'ALDERSOPSPARING' || selectedKonto === 'LIVRENTE' || selectedKonto === 'KAPITALPENSION'}
            isInPath={false}
            colorClass={KONTO_FARVER.RATEPENSION}
            onClick={() => handleKontoClick('RATEPENSION')}
          />
        </div>
      </div>

      <FlowArrow isActive={!!selectedKonto} colorClass={activeColor} />

      {/* TRIN 2: AKTIVTYPE */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
          VÆLG AKTIVTYPE
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <FlowNode
            label="AKTIE (DK/Udl.)"
            sublabel="Realisation"
            isSelected={selectedAktiv === 'AKTIE_DK' || selectedAktiv === 'AKTIE_UDENLANDSK'}
            isInPath={!!selectedKonto && (selectedAktiv === 'AKTIE_DK' || selectedAktiv === 'AKTIE_UDENLANDSK')}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('AKTIE_DK')}
          />
          <FlowNode
            label="ETF (Positivliste)"
            sublabel="Lager → Aktieindkomst"
            isSelected={selectedAktiv === 'ETF_POSITIVLISTE'}
            isInPath={!!selectedKonto && selectedAktiv === 'ETF_POSITIVLISTE'}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('ETF_POSITIVLISTE')}
          />
          <FlowNode
            label="ETF (Ikke positivliste)"
            sublabel="Lager → Kapitalindkomst"
            isSelected={selectedAktiv === 'ETF_IKKE_POSITIVLISTE'}
            isInPath={!!selectedKonto && selectedAktiv === 'ETF_IKKE_POSITIVLISTE'}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('ETF_IKKE_POSITIVLISTE')}
          />
          <FlowNode
            label="INV.FOR. (Udbyttebet.)"
            sublabel="Realisation"
            isSelected={selectedAktiv === 'INVF_UDBYTTEBETALTENDE'}
            isInPath={!!selectedKonto && selectedAktiv === 'INVF_UDBYTTEBETALTENDE'}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('INVF_UDBYTTEBETALTENDE')}
          />
          <FlowNode
            label="INV.FOR. (Akkum.)"
            sublabel="Lager"
            isSelected={selectedAktiv === 'INVF_AKKUMULERENDE'}
            isInPath={!!selectedKonto && selectedAktiv === 'INVF_AKKUMULERENDE'}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('INVF_AKKUMULERENDE')}
          />
          <FlowNode
            label="FINANSIEL KONTRAKT"
            sublabel="Option/CFD/Future"
            isSelected={selectedAktiv === 'FINANSIEL_KONTRAKT'}
            isInPath={!!selectedKonto && selectedAktiv === 'FINANSIEL_KONTRAKT'}
            isDisabled={!selectedKonto}
            colorClass={activeColor}
            onClick={() => handleAktivClick('FINANSIEL_KONTRAKT')}
          />
        </div>
      </div>

      <FlowArrow isActive={!!selectedKonto && !!selectedAktiv} colorClass={activeColor} />

      {/* TRIN 3: KLASSIFICERING */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
          KLASSIFICERING
        </div>

        {/* For FRIT_DEPOT: Vis aktie/kapitalindkomst valg */}
        {selectedKonto === 'FRIT_DEPOT' ? (
          <div className="grid grid-cols-2 gap-2">
            <FlowNode
              label="AKTIEINDKOMST"
              sublabel={`27% / 42% (grænse: ${formatKr(progressionsgrænse)} kr)`}
              isSelected={indkomsttype === 'AKTIEINDKOMST'}
              isInPath={!!selectedAktiv && indkomsttype === 'AKTIEINDKOMST'}
              isDisabled={!selectedAktiv}
              colorClass={activeColor}
            >
              <div className="text-[10px] mt-1 opacity-60">PSL § 8a ({skatteår})</div>
            </FlowNode>
            <FlowNode
              label="KAPITALINDKOMST"
              sublabel={`~${Math.round(satser.kapitalindkomst.gevinstSats * 100)}% gevinst / ~${Math.round(satser.kapitalindkomst.tabFradragsværdiUnderGrænse * 100)}% tab fradrag`}
              isSelected={indkomsttype === 'KAPITALINDKOMST'}
              isInPath={!!selectedAktiv && indkomsttype === 'KAPITALINDKOMST'}
              isDisabled={!selectedAktiv}
              colorClass={activeColor}
            >
              <div className="text-[10px] mt-1 opacity-60">PSL § 4 - ASYMMETRISK!</div>
            </FlowNode>
          </div>
        ) : selectedKonto === 'ASK' ? (
          /* ASK: 17% flat - klassificering irrelevant */
          <div className={`rounded-lg p-4 ${activeColor?.bg} border ${activeColor?.border}`}>
            <div className={activeColor?.text}>
              <div className="font-bold">IKKE RELEVANT FOR ASK</div>
              <div className="text-sm opacity-70 mt-1">
                ASK beskattes med 17% uanset aktivtype (aktier, ETF, inv.foreninger)
              </div>
              <div className="text-xs mt-2 opacity-50">ASKL § 13 - Lagerbeskatning af alt afkast</div>
            </div>
          </div>
        ) : selectedKonto === 'BOERNEOPSPARING' ? (
          /* Børneopsparing: Skattefri - klassificering irrelevant */
          <div className={`rounded-lg p-4 ${activeColor?.bg} border ${activeColor?.border}`}>
            <div className={activeColor?.text}>
              <div className="font-bold">IKKE RELEVANT FOR BØRNEOPSPARING</div>
              <div className="text-sm opacity-70 mt-1">
                Børneopsparing er skattefri uanset aktivtype
              </div>
              <div className="text-xs mt-2 opacity-50">PBL § 51 - Renter, udbytter og avancer er skattefri</div>
            </div>
          </div>
        ) : selectedKonto && ['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(selectedKonto) ? (
          /* Pension: 15,3% PAL - klassificering irrelevant */
          <div className={`rounded-lg p-4 ${activeColor?.bg} border ${activeColor?.border}`}>
            <div className={activeColor?.text}>
              <div className="font-bold">IKKE RELEVANT FOR PENSION</div>
              <div className="text-sm opacity-70 mt-1">
                Pension beskattes med 15,3% PAL-skat uanset aktivtype
              </div>
              <div className="text-xs mt-2 opacity-50">PAL § 2 - Lagerbeskatning af pensionsafkast</div>
            </div>
          </div>
        ) : (
          /* Ingen konto valgt */
          <div className="grid grid-cols-2 gap-2">
            <FlowNode
              label="AKTIEINDKOMST"
              sublabel="27% / 42%"
              isSelected={false}
              isInPath={false}
              isDisabled={true}
              colorClass={activeColor}
            >
              <div className="text-[10px] mt-1 opacity-60">PSL § 8a</div>
            </FlowNode>
            <FlowNode
              label="KAPITALINDKOMST"
              sublabel="~37%"
              isSelected={false}
              isInPath={false}
              isDisabled={true}
              colorClass={activeColor}
            >
              <div className="text-[10px] mt-1 opacity-60">PSL § 4</div>
            </FlowNode>
          </div>
        )}
      </div>

      <FlowArrow isActive={!!selectedKonto && !!selectedAktiv} colorClass={activeColor} />

      {/* TRIN 4: SKATTEBEREGNING */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">4</span>
          SKATTEBEREGNING
        </div>
        <div className={`rounded-lg p-4 ${selectedKonto && selectedAktiv ? `${activeColor?.bg} border ${activeColor?.border}` : 'bg-white/5 border border-white/20'}`}>
          {selectedKonto === 'BOERNEOPSPARING' ? (
            <div className={selectedKonto ? activeColor?.text : 'text-white/50'}>
              <div className="text-lg font-bold">0% SKATTEFRI</div>
              <div className="text-sm opacity-70">Intet at betale - børneopsparing er fritaget</div>
              <div className="text-xs mt-2 opacity-50">PBL § 51</div>
            </div>
          ) : selectedKonto === 'ASK' ? (
            <div className={selectedKonto ? activeColor?.text : 'text-white/50'}>
              <div className="text-lg font-bold">17% LAGERBESKATNING</div>
              <div className="text-sm opacity-70">Automatisk hvert år af værdistigningen</div>
              <div className="text-xs mt-2 opacity-50">ASKL § 13</div>
            </div>
          ) : selectedKonto && ['RATEPENSION', 'ALDERSOPSPARING', 'LIVRENTE', 'KAPITALPENSION'].includes(selectedKonto) ? (
            <div className={selectedKonto ? activeColor?.text : 'text-white/50'}>
              <div className="text-lg font-bold">15,3% PAL-SKAT</div>
              <div className="text-sm opacity-70">Automatisk hvert år af pensionsudbyder</div>
              <div className="text-xs mt-2 opacity-50">PAL § 2</div>
            </div>
          ) : selectedKonto === 'FRIT_DEPOT' && selectedAktiv ? (
            <div className={activeColor?.text}>
              {indkomsttype === 'AKTIEINDKOMST' ? (
                <>
                  <div className="text-lg font-bold">27% / 42% PROGRESSION</div>
                  <div className="text-sm opacity-70">
                    27% op til {formatKr(progressionsgrænse)} kr, derefter 42%
                  </div>
                  <div className="text-xs mt-2 opacity-50">PSL § 8a, stk. 1-2 ({skatteår})</div>
                </>
              ) : indkomsttype === 'KAPITALINDKOMST' ? (
                <>
                  <div className="text-lg font-bold">~{Math.round(satser.kapitalindkomst.gevinstSats * 100)}% KAPITALINDKOMST</div>
                  <div className="text-sm opacity-70">
                    Gevinst: ~{Math.round(satser.kapitalindkomst.gevinstSats * 100)}% | Tab: kun ~{Math.round(satser.kapitalindkomst.tabFradragsværdiUnderGrænse * 100)}% fradrag
                  </div>
                  <div className="text-xs mt-2 opacity-50 text-yellow-400">⚠️ PSL § 4 - ASYMMETRISK beskatning!</div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="text-white/40 text-center">
              Vælg konto og aktiv for at se skatteberegning
            </div>
          )}
        </div>
      </div>

      <FlowArrow isActive={!!selectedKonto && !!selectedAktiv} colorClass={activeColor} />

      {/* TRIN 5: FRADRAG / TAB */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">5</span>
          TAB / FRADRAG
        </div>
        {tabsPulje && modregningRegler ? (
          <div className={`rounded-lg p-4 ${activeColor?.bg} border ${activeColor?.border}`}>
            <div className={`font-bold ${activeColor?.text}`}>
              PULJE: {getPuljeNavn(tabsPulje)}
            </div>
            <div className="mt-2 text-sm text-white/70">
              <div className="font-semibold mb-1">Kan modregnes i:</div>
              <ul className="list-disc list-inside text-xs space-y-0.5">
                {modregningRegler.kanModregnesI.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex gap-4 text-xs">
              <span className={modregningRegler.ægtefælleOverførsel ? 'text-green-400' : 'text-red-400'}>
                Ægtefælle: {modregningRegler.ægtefælleOverførsel ? 'JA' : 'NEJ'}
              </span>
              <span className={modregningRegler.fremførsel === 'UBEGRÆNSET' ? 'text-green-400' : 'text-yellow-400'}>
                Fremførsel: {modregningRegler.fremførsel === 'UBEGRÆNSET' ? 'Ubegrænset' : 'Tabes ved lukning!'}
              </span>
            </div>
            {modregningRegler.note && (
              <div className="mt-2 text-xs text-yellow-400/80 bg-yellow-500/10 rounded p-2">
                {modregningRegler.note}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg p-4 bg-white/5 border border-white/20 text-white/40 text-center">
            Vælg konto og aktiv for at se fradragsregler
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function
function getPuljeNavn(pulje: TabsPulje): string {
  const navne: Record<TabsPulje, string> = {
    'NOTERET_AKTIE': 'Noterede aktier',
    'UNOTERET_AKTIE': 'Unoterede aktier',
    'KAPITAL_GENEREL': 'Kapitalindkomst (generel)',
    'FINANSIEL_KONTRAKT': 'Finansielle kontrakter',
    'ASK_ISOLERET': 'ASK (isoleret til kontoen)',
    'PENSION_ISOLERET': 'Pension (isoleret til kontoen)',
  };
  return navne[pulje] || pulje;
}

export default InteractiveFlowChart;
