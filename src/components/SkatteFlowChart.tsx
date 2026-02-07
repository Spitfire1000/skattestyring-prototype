import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const DIAGRAM = `
flowchart TD
    START[Investor har en investering] --> KONTO{Hvilken kontotype?}

    %% ====== FRI DEPOT ======
    KONTO -->|Fri Depot| FD_AKTIV{Aktivtype i Fri Depot}

    FD_AKTIV -->|Finansielle kontrakter - CFD futures optioner| FD_FIN[Kapitalindkomst<br>Lagerbeskatning<br>KGL paragraf 29<br>Kildeartsbegr. tab isoleret]
    FD_AKTIV -->|Obligationer direkte og renter| FD_OBL[Kapitalindkomst<br>Realisationsbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|Obligationsbaseret ETF eller fond| FD_OBL_FOND[Kapitalindkomst<br>ALTID - uanset akk eller udb<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|ETF IKKE paa positivlisten| FD_ETF_NEG[Kapitalindkomst<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|Akkumulerende fond IKKE paa positivlisten| FD_AKK_NEG[Kapitalindkomst<br>Lagerbeskatning<br>ca 37-42 pct]
    FD_AKTIV -->|ETF paa positivlisten| FD_ETF_POS[Aktieindkomst<br>Lagerbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Akkumulerende fond paa positivlisten| FD_AKK_POS[Aktieindkomst<br>Lagerbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Udbyttebetalende fond - aktiebaseret| FD_UDB[Aktieindkomst<br>Realisationsbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Aktier - alle| FD_AKT_IND[Aktieindkomst<br>Realisationsbeskatning<br>27 pct / 42 pct]
    FD_AKTIV -->|Blandet fond over 50 pct obligationer| FD_BLANDET_OBL[Kapitalindkomst<br>ca 37-42 pct]
    FD_AKTIV -->|Blandet fond over 50 pct aktier| FD_BLANDET_AKT[Aktieindkomst<br>27 pct / 42 pct]

    %% ====== KAPITALINDKOMST DETALJE ======
    FD_OBL --> KAP_FLOW
    FD_OBL_FOND --> KAP_FLOW
    FD_ETF_NEG --> KAP_FLOW
    FD_AKK_NEG --> KAP_FLOW
    FD_BLANDET_OBL --> KAP_FLOW
    FD_FIN --> FIN_FLOW

    KAP_FLOW{Positiv eller negativ kapitalindkomst?}
    KAP_FLOW -->|Positiv gevinst| KAP_POS[Beskattes som personlig indkomst<br>Bundskat 12,01 pct<br>Kommuneskat ca 25 pct<br>Kirkeskat ca 0,7 pct<br>Over 55.000 kr indgaar i mellemskat PSL 7<br>Skatteloft kapitalindkomst 42 pct PSL 19 stk 2<br>Samlet ca 37-42 pct]
    KAP_FLOW -->|Negativt tab| KAP_NEG{Negativ kapitalindkomst<br>Er samlet negativt under 50.000 kr?}

    KAP_NEG -->|Under 50.000 kr enlig<br>Under 100.000 kr gift| KAP_NEG_LAV[Fradragsvaerdi ca 33 pct<br>8 pct ekstra nedslag<br>plus kommuneskat ca 25 pct<br>Bruges KUN i samme aar<br>INTET fremfoersel]
    KAP_NEG -->|Over graensen| KAP_NEG_HOJ[Fradragsvaerdi ca 25 pct<br>Kun kommuneskat<br>Bruges KUN i samme aar<br>INTET fremfoersel]

    %% ====== FINANSIELLE KONTRAKTER DETALJE ======
    FIN_FLOW{Finansielle kontrakter<br>Gevinst eller tab?}
    FIN_FLOW -->|Gevinst| FIN_GEV[Kapitalindkomst<br>Beskattes ca 37-42 pct<br>Lagerbeskatning aarligt]
    FIN_FLOW -->|Tab| FIN_TAB[Kildeartsbegr. - isoleret tabspool<br>Tab KUN mod andre finansielle kontrakter<br>Fremfoeres uendeligt<br>Aegtefaelle KAN overfoere tab<br>KGL paragraf 32]

    %% ====== AKTIEINDKOMST TAB ======
    FD_ETF_POS --> AKT_TAB_FLOW
    FD_AKK_POS --> AKT_TAB_FLOW
    FD_UDB --> AKT_TAB_FLOW
    FD_AKT_IND --> AKT_TAB_FLOW
    FD_BLANDET_AKT --> AKT_TAB_FLOW

    AKT_TAB_FLOW{Aktieindkomst<br>Gevinst eller tab?}
    AKT_TAB_FLOW -->|Gevinst| AKT_GEV[27 pct op til 79.400 kr enlig<br>42 pct derover<br>Progressionsgraense deles med aegtefaelle]
    AKT_TAB_FLOW -->|Tab noterede| AKT_TAB[Kildeartsbegr ABL 13A<br>KUN mod andre noterede plus positivliste<br>Obligatorisk overfoersel til aegtefaelle<br>Fremfoer uendeligt - tabsbank]
    AKT_TAB_FLOW -->|Tab unoterede| AKT_TAB_UNOT[Fuldt fradrag i AL aktieindkomst<br>IKKE kildeartsbegr ABL 13<br>Negativ aktieindkomst giver skattevaerdi i slutskat<br>Valgfri aegtefaelle-overfoersel<br>Fremfoeres uendeligt]

    %% ====== ASK ======
    KONTO -->|ASK| ASK[17 pct lagerbeskatning<br>KUN aktieindkomst-papirer tilladt<br>Obligationsfonde IKKE tilladt<br>Personfradrag kan IKKE bruges<br>Loft 174.200 kr 2026]
    ASK --> ASK_TAB{Gevinst eller tab?}
    ASK_TAB -->|Gevinst| ASK_GEV[17 pct af aarets afkast]
    ASK_TAB -->|Tab| ASK_TABD[Fremfoeres KUN paa samme ASK<br>Mistes HELT ved lukning<br>Ingen aegtefaelle]

    %% ====== PENSION ======
    KONTO -->|Pension| PENS[15,3 pct PAL-skat<br>Alt tilladt<br>Lagerbeskatning]
    PENS --> PENS_TAB{Gevinst eller tab?}
    PENS_TAB -->|Gevinst| PENS_GEV[15,3 pct af aarets afkast]
    PENS_TAB -->|Tab| PENS_TABD[Fremfoeres paa samme ordning<br>Ingen aegtefaelle]

    %% ====== BOERNEOPSPARING ======
    KONTO -->|Boerneopsparing| BOERN[0 pct skat<br>Alt tilladt<br>Max 6.000 kr pr aar<br>Max 72.000 kr total<br>Udbetaling senest 21 aar]

    %% ====== STYLING ======
    style START fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style KONTO fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style FD_AKTIV fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style KAP_FLOW fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style KAP_NEG fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style FIN_FLOW fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style AKT_TAB_FLOW fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style ASK_TAB fill:#334155,stroke:#94a3b8,color:#f1f5f9
    style PENS_TAB fill:#334155,stroke:#94a3b8,color:#f1f5f9

    style FD_AKT_IND fill:#e3f2fd,stroke:#1565c0,color:#0d1b2a
    style FD_ETF_POS fill:#e3f2fd,stroke:#1565c0,color:#0d1b2a
    style FD_UDB fill:#e3f2fd,stroke:#1565c0,color:#0d1b2a
    style FD_AKK_POS fill:#e3f2fd,stroke:#1565c0,color:#0d1b2a
    style FD_BLANDET_AKT fill:#e3f2fd,stroke:#1565c0,color:#0d1b2a

    style FD_ETF_NEG fill:#fce4ec,stroke:#c62828,color:#1a0000
    style FD_AKK_NEG fill:#fce4ec,stroke:#c62828,color:#1a0000
    style FD_FIN fill:#fce4ec,stroke:#c62828,color:#1a0000
    style FD_OBL fill:#fce4ec,stroke:#c62828,color:#1a0000
    style FD_OBL_FOND fill:#fce4ec,stroke:#c62828,color:#1a0000
    style FD_BLANDET_OBL fill:#fce4ec,stroke:#c62828,color:#1a0000

    style KAP_POS fill:#ffebee,stroke:#b71c1c,color:#1a0000
    style KAP_NEG_LAV fill:#ffcdd2,stroke:#c62828,color:#1a0000
    style KAP_NEG_HOJ fill:#ef9a9a,stroke:#b71c1c,color:#1a0000

    style FIN_GEV fill:#ffebee,stroke:#b71c1c,color:#1a0000
    style FIN_TAB fill:#d50000,stroke:#b71c1c,color:#ffffff

    style AKT_GEV fill:#bbdefb,stroke:#1565c0,color:#0d1b2a
    style AKT_TAB fill:#90caf9,stroke:#0d47a1,color:#0d1b2a
    style AKT_TAB_UNOT fill:#64b5f6,stroke:#0d47a1,color:#0d1b2a

    style ASK fill:#f3e5f5,stroke:#6a1b9a,color:#1a0020
    style ASK_GEV fill:#e1bee7,stroke:#6a1b9a,color:#1a0020
    style ASK_TABD fill:#ce93d8,stroke:#4a148c,color:#1a0020

    style PENS fill:#e8f5e9,stroke:#2e7d32,color:#0a1a0a
    style PENS_GEV fill:#c8e6c9,stroke:#2e7d32,color:#0a1a0a
    style PENS_TABD fill:#a5d6a7,stroke:#1b5e20,color:#0a1a0a

    style BOERN fill:#fff3e0,stroke:#ef6c00,color:#1a0f00
`;

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#1e3a5f',
    primaryTextColor: '#000000',
    primaryBorderColor: '#475569',
    lineColor: '#cbd5e1',
    secondaryColor: '#1e3a5f',
    tertiaryColor: '#0f172a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    nodeBorder: '#475569',
    clusterBkg: '#1e293b',
    edgeLabelBackground: '#1e293b',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 16,
  },
});

let renderCounter = 0;

export function SkatteFlowChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!containerRef.current) return;
      try {
        // Unikt ID for hver render (undgår konflikt ved React strict mode dobbelt-mount)
        const id = `skatte-flowchart-${++renderCounter}`;
        // Fjern evt. gammelt orphaned SVG fra mermaid
        document.getElementById(id)?.remove();
        const { svg } = await mermaid.render(id, DIAGRAM);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Fix: Udvid foreignObject-elementer i edge labels så teksten ikke klippes
          const edgeLabels = containerRef.current.querySelectorAll('.edgeLabel foreignObject');
          edgeLabels.forEach((fo) => {
            const div = fo.querySelector('div');
            if (div) {
              // Mål den faktiske størrelse af indholdet
              const rect = div.getBoundingClientRect();
              fo.setAttribute('width', String(Math.ceil(rect.width) + 16));
              fo.setAttribute('height', String(Math.ceil(rect.height) + 8));
            }
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          console.error('Mermaid render error:', e);
        }
      }
    };
    render();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="skatte-flow-wrapper border border-white/20 rounded-lg bg-[#0d1321] p-4">
      <div className="text-[10px] text-white/50 mb-3 font-semibold">
        KOMPLET BESKATNINGSOVERSIGT - DANSK INVESTERINGSBESKATNING
      </div>
      {error && (
        <div className="text-red-400 text-[10px] mb-2">Fejl: {error}</div>
      )}
      <div
        ref={containerRef}
        className="overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto"
        style={{
          // Edge labels og generel SVG tekst - hvid mod mørk baggrund
          // @ts-expect-error CSS custom properties
          '--tw-text-opacity': 1,
        }}
      />
      <style>{`
        .skatte-flow-wrapper .edgeLabel {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          border: 1px solid #475569 !important;
          overflow: visible !important;
          max-width: none !important;
          white-space: normal !important;
        }
        .skatte-flow-wrapper .edgeLabel span,
        .skatte-flow-wrapper .edgeLabel p {
          color: #f8fafc !important;
          overflow: visible !important;
          white-space: normal !important;
          text-overflow: unset !important;
        }
        .skatte-flow-wrapper .edgeLabel .label {
          overflow: visible !important;
          max-width: none !important;
        }
        .skatte-flow-wrapper .edgeLabel foreignObject {
          overflow: visible !important;
        }
        .skatte-flow-wrapper .edgeLabel foreignObject > div {
          overflow: visible !important;
          white-space: normal !important;
        }
        .skatte-flow-wrapper .edgePath .path {
          stroke: #cbd5e1 !important;
          stroke-width: 2px !important;
        }
        .skatte-flow-wrapper .marker {
          fill: #cbd5e1 !important;
          stroke: #cbd5e1 !important;
        }
        .skatte-flow-wrapper .node .label {
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .skatte-flow-wrapper .node .label div {
          line-height: 1.4 !important;
        }
      `}</style>
    </div>
  );
}
