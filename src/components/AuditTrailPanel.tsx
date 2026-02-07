/**
 * AUDIT TRAIL PANEL
 *
 * Kronologisk liste over alle handlinger med lovhenvisninger.
 * Eksporter til clipboard/tekst til PwC review.
 */

import { useMemo, useState } from 'react';
import type { Transaktion } from './TransaktionsPanel';
import type { TabsbankState, TabsPulje } from '../types/skat';

// ============================================================
// TYPES
// ============================================================

interface AuditTrailPanelProps {
  transaktioner: Transaktion[];
  tabsbank: TabsbankState;
  skatteår: number;
  erGift: boolean;
}

interface AuditEntry {
  id: string;
  år: number;
  dato: Date;
  type: 'SALG' | 'TAB_TILFØJET' | 'TAB_BRUGT' | 'FREMFØRSEL';
  beskrivelse: string;
  beløb: number;
  tabsPulje?: TabsPulje;
  lovhenvisning?: string;
  detaljer?: string;
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
    year: 'numeric',
  }).format(date);
}

const PULJE_LABELS: Record<TabsPulje, string> = {
  NOTERET_AKTIE: 'Noterede aktier',
  UNOTERET_AKTIE: 'Unoterede aktier',
  KAPITAL_GENEREL: 'Kapitalindkomst',
  FINANSIEL_KONTRAKT: 'Finansielle kontrakter',
  ASK_ISOLERET: 'ASK (isoleret)',
  PENSION_ISOLERET: 'Pension (isoleret)',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AuditTrailPanel({
  transaktioner,
  tabsbank,
  skatteår,
  erGift,
}: AuditTrailPanelProps) {
  const [copied, setCopied] = useState(false);

  // Generer audit entries
  const auditEntries = useMemo(() => {
    const entries: AuditEntry[] = [];

    // Konverter transaktioner til audit entries
    for (const t of transaktioner) {
      if (t.type === 'SALG') {
        // Salg entry
        entries.push({
          id: `${t.id}-salg`,
          år: t.år,
          dato: t.dato,
          type: 'SALG',
          beskrivelse: `Solgt ${t.assetNavn}`,
          beløb: t.gevinstTab,
          tabsPulje: t.tabsPulje || undefined,
          lovhenvisning: t.lovhenvisning,
          detaljer: `${t.antal} stk @ ${formatKr(t.kurs)} kr = ${formatKr(t.beløb)} kr`,
        });

        // Tab tilføjet til pulje
        if (t.gevinstTab < 0 && t.tabsPulje) {
          entries.push({
            id: `${t.id}-tab`,
            år: t.år,
            dato: t.dato,
            type: 'TAB_TILFØJET',
            beskrivelse: `Tab tilføjet til ${PULJE_LABELS[t.tabsPulje]}`,
            beløb: Math.abs(t.gevinstTab),
            tabsPulje: t.tabsPulje,
            lovhenvisning: 'ABL § 13 A (fremførsel)',
          });
        }

        // Modregning brugt
        if (t.modregnet > 0) {
          entries.push({
            id: `${t.id}-modregnet`,
            år: t.år,
            dato: t.dato,
            type: 'TAB_BRUGT',
            beskrivelse: `Tab modregnet i gevinst`,
            beløb: t.modregnet,
            tabsPulje: t.tabsPulje || undefined,
            lovhenvisning: 'ABL § 13 A (modregning)',
          });
        }
      }
    }

    // Sorter kronologisk (nyeste først)
    return entries.sort((a, b) => {
      if (a.år !== b.år) return b.år - a.år;
      return b.dato.getTime() - a.dato.getTime();
    });
  }, [transaktioner]);

  // Grupper efter år
  const entriesPerÅr = useMemo(() => {
    const grouped = new Map<number, AuditEntry[]>();

    for (const entry of auditEntries) {
      const existing = grouped.get(entry.år) || [];
      existing.push(entry);
      grouped.set(entry.år, existing);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => b - a);
  }, [auditEntries]);

  // Eksporter til tekst
  const exportAuditTrail = () => {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════════',
      `  AUDIT TRAIL - SKAT-SIMULATOR`,
      `  Genereret: ${formatDato(new Date())}`,
      `  Skatteår: ${skatteår}`,
      `  Civilstand: ${erGift ? 'Gift' : 'Enlig'}`,
      '═══════════════════════════════════════════════════════════',
      '',
    ];

    // Transaktioner per år
    for (const [år, entries] of entriesPerÅr) {
      lines.push(`── ${år} ${'─'.repeat(50)}`);
      lines.push('');

      for (const entry of entries) {
        const beløbStr = entry.beløb >= 0 ? `+${formatKr(entry.beløb)}` : `-${formatKr(Math.abs(entry.beløb))}`;

        lines.push(`  ${formatDato(entry.dato)} | ${entry.beskrivelse}`);
        lines.push(`              | Beløb: ${beløbStr} kr`);

        if (entry.detaljer) {
          lines.push(`              | ${entry.detaljer}`);
        }
        if (entry.tabsPulje) {
          lines.push(`              | Pulje: ${PULJE_LABELS[entry.tabsPulje]}`);
        }
        if (entry.lovhenvisning) {
          lines.push(`              | Lov: ${entry.lovhenvisning}`);
        }
        lines.push('');
      }
    }

    // Tabsbank status
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('  TABSBANK STATUS');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');

    for (const [pulje, status] of Object.entries(tabsbank)) {
      const puljeLabel = PULJE_LABELS[pulje as TabsPulje] || pulje;
      lines.push(`  ${puljeLabel}: ${formatKr(status.beløb)} kr`);

      if (status.posteringer.length > 0) {
        for (const post of status.posteringer) {
          lines.push(`    └─ ${post.år}: ${formatKr(post.beløb)} kr - ${post.beskrivelse}`);
        }
      }
    }

    lines.push('');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  Til brug for PwC review af skattemæssig behandling');
    lines.push('───────────────────────────────────────────────────────────');

    return lines.join('\n');
  };

  // Kopier til clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportAuditTrail());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunne ikke kopiere:', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1321]">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">AUDIT TRAIL</h2>
            <p className="text-[10px] text-white/40">Til PwC review</p>
          </div>
          <button
            onClick={handleCopy}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {copied ? 'Kopieret!' : 'Eksporter'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {auditEntries.length === 0 ? (
          <div className="p-4 text-center text-white/40 text-xs">
            <p className="mb-2">Ingen audit entries endnu</p>
            <p className="text-[10px]">Transaktioner vil blive logget her</p>
          </div>
        ) : (
          <div className="p-2">
            {entriesPerÅr.map(([år, entries]) => (
              <div key={år} className="mb-4">
                <div className="text-xs font-bold text-white mb-2 px-1">
                  År {år}
                </div>
                <div className="space-y-1">
                  {entries.map((entry) => (
                    <AuditEntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabsbank summary */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="text-[10px] text-white/50 mb-2">Tabsbank status:</div>
        <div className="space-y-1">
          {Object.entries(tabsbank).map(([pulje, status]) => {
            if (status.beløb === 0) return null;
            return (
              <div key={pulje} className="flex justify-between text-[10px]">
                <span className="text-white/60">{PULJE_LABELS[pulje as TabsPulje]}:</span>
                <span className="text-red-400">{formatKr(status.beløb)} kr</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AUDIT ENTRY ROW
// ============================================================

interface AuditEntryRowProps {
  entry: AuditEntry;
}

function AuditEntryRow({ entry }: AuditEntryRowProps) {
  const getTypeColor = () => {
    switch (entry.type) {
      case 'SALG':
        return entry.beløb >= 0 ? 'text-green-400' : 'text-red-400';
      case 'TAB_TILFØJET':
        return 'text-red-400';
      case 'TAB_BRUGT':
        return 'text-yellow-400';
      case 'FREMFØRSEL':
        return 'text-blue-400';
      default:
        return 'text-white/60';
    }
  };

  const getTypeBadge = () => {
    switch (entry.type) {
      case 'SALG':
        return entry.beløb >= 0 ? 'Gevinst' : 'Tab';
      case 'TAB_TILFØJET':
        return 'Tab→Bank';
      case 'TAB_BRUGT':
        return 'Modregn';
      case 'FREMFØRSEL':
        return 'Fremført';
      default:
        return entry.type;
    }
  };

  return (
    <div className="bg-white/[0.02] rounded p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`text-[9px] px-1 rounded ${
              entry.type === 'SALG'
                ? entry.beløb >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                : entry.type === 'TAB_BRUGT'
                  ? 'bg-yellow-500/20'
                  : 'bg-white/10'
            } ${getTypeColor()}`}>
              {getTypeBadge()}
            </span>
            <span className="text-[10px] text-white truncate">
              {entry.beskrivelse}
            </span>
          </div>

          {entry.lovhenvisning && (
            <div className="text-[9px] text-blue-400/70 mt-0.5">
              {entry.lovhenvisning}
            </div>
          )}

          {entry.detaljer && (
            <div className="text-[9px] text-white/30 mt-0.5">
              {entry.detaljer}
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-[10px] font-medium ${getTypeColor()}`}>
            {entry.beløb >= 0 ? '+' : '-'}{formatKr(Math.abs(entry.beløb))}
          </div>
          <div className="text-[9px] text-white/30">
            {formatDato(entry.dato).split(' ').slice(0, 2).join(' ')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditTrailPanel;
