/**
 * LOVTEKST PANEL
 *
 * Viser fulde citater fra relevante love baseret på valgt sti.
 */

import { getRelevanteCitater, type LovtekstCitat } from '../constants/lovhenvisninger';
import type { FlowSelection } from './InteractiveFlowChart';

// ============================================================
// TYPES
// ============================================================

interface LovtekstPanelProps {
  selection: FlowSelection;
}

// ============================================================
// CITAT CARD COMPONENT
// ============================================================

function CitatCard({ citat }: { citat: LovtekstCitat }) {
  return (
    <div className="border border-white/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 px-4 py-2 border-b border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-blue-400 font-semibold text-sm">{citat.lov}</div>
            <div className="text-white text-lg font-bold">{citat.paragraf}</div>
          </div>
          <div className="flex gap-2">
            <a
              href={citat.retsinformationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded px-2 py-1 text-blue-400 transition-colors"
            >
              Retsinformation
            </a>
            {citat.skatDkUrl && (
              <a
                href={citat.skatDkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded px-2 py-1 text-green-400 transition-colors"
              >
                SKAT.dk
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Citat */}
      <div className="p-4">
        <blockquote className="text-white/80 italic border-l-2 border-blue-500 pl-3">
          "{citat.citat}"
        </blockquote>

        {/* Note */}
        {citat.note && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-yellow-400 text-sm">
            <span className="font-semibold">Note:</span> {citat.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LovtekstPanel({ selection }: LovtekstPanelProps) {
  const { konto, aktiv } = selection;

  // Hent relevante citater
  const citater = konto
    ? getRelevanteCitater(konto, aktiv || undefined, false)
    : [];

  if (!konto) {
    return (
      <div className="border border-white/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">LOVTEKST REFERENCER</h2>
        <p className="text-white/40 text-sm">
          Vælg en kontotype og aktivtype i flowchartet for at se relevante lovtekster.
        </p>
      </div>
    );
  }

  if (citater.length === 0) {
    return (
      <div className="border border-white/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">LOVTEKST REFERENCER</h2>
        <p className="text-white/40 text-sm">
          Ingen specifikke lovtekster fundet for denne kombination.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-white/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">LOVTEKST REFERENCER</h2>
          <p className="text-white/50 text-xs">
            Uddrag fra relevante love og bekendtgørelser
          </p>
        </div>
        <div className="text-xs text-white/40">
          {citater.length} referencer
        </div>
      </div>

      <div className="space-y-4">
        {citater.map((citat) => (
          <CitatCard key={citat.id} citat={citat} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-white/30 text-xs">
          Lovtekster er uddrag fra retsinformation.dk og kan være forkortet.
          Se de fulde tekster via links ovenfor.
        </p>
        <p className="text-white/20 text-[10px] mt-1">
          Kontakt revisor for præcis juridisk rådgivning.
        </p>
      </div>
    </div>
  );
}

export default LovtekstPanel;
