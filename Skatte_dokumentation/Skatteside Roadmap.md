# Skatteside Roadmap

**Projekt:** Portfolio Risk Analyzer - Skattemodul  
**Dato:** 31. januar 2025  
**Princip:** Byg først, design bagefter

---

## 🎯 Hvad bygger vi?

En skatteside hvor brugeren kan:
1. Se **estimeret skat** på deres portefølje
2. Se **opdeling** per konto (ASK, frit depot, pension)
3. Få **advarsler** om skattefælder (fx ETF ikke på positivliste)

---

## 📊 Dataflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BRUGER INPUT                              │
│                                                                  │
│   Portefølje fra CSV     Kontotype        Civilstand            │
│   ┌──────────────┐      ┌──────────┐     ┌──────────┐          │
│   │ • Ticker     │      │ • ASK    │     │ • Enlig  │          │
│   │ • Antal      │      │ • Depot  │     │ • Gift   │          │
│   │ • Købspris   │      │ • Pension│     └──────────┘          │
│   │ • Nuv. pris  │      └──────────┘                           │
│   └──────────────┘                                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     KLASSIFICERING                               │
│                                                                  │
│   For hver position:                                            │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 1. Er det en ETF? ──► Tjek positivlisten               │  │
│   │    • På listen = Aktieindkomst (27%/42%)                │  │
│   │    • Ikke på listen = Kapitalindkomst (~42%)            │  │
│   │                                                          │  │
│   │ 2. Er det en aktie? ──► Aktieindkomst (27%/42%)        │  │
│   │                                                          │
│   │ 3. Er det en obligation? ──► Kapitalindkomst (~42%)    │  │
│   └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SKATTEBEREGNING                                │
│                                                                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│   │   ASK (17%)     │  │  FRIT DEPOT     │  │   PENSION      │ │
│   │                 │  │                 │  │                │ │
│   │ Gevinst × 17%   │  │ Aktieindkomst:  │  │ PAL-skat:      │ │
│   │                 │  │ ≤67.500: 27%    │  │ Afkast × 15,3% │ │
│   │ Lagerbeskatning │  │ >67.500: 42%    │  │                │ │
│   │ (årlig)         │  │                 │  │ Lagerbeskatning│ │
│   │                 │  │ Kapitalindkomst:│  │ (årlig)        │ │
│   │                 │  │ ~37-42%         │  │                │ │
│   └─────────────────┘  └─────────────────┘  └────────────────┘ │
│                                                                  │
│   Gift? ──► Dobbelt progressionsgrænse (135.000 kr i 2025)     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OUTPUT                                    │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                  SKATTEOVERSIGT                          │  │
│   │                                                          │  │
│   │  Samlet estimeret skat: 12.450 kr                       │  │
│   │  ────────────────────────────────────────               │  │
│   │  ASK:           2.100 kr  (17% af 12.350 kr gevinst)   │  │
│   │  Frit depot:    8.350 kr  (27% af 30.925 kr)           │  │
│   │  Pension:       2.000 kr  (15,3% af 13.072 kr)         │  │
│   │                                                          │  │
│   │  ⚠️ ADVARSLER:                                          │  │
│   │  • VWCE er IKKE på positivlisten - beskattes hårdere   │  │
│   │  • Du har uudnyttet progressionsgrænse (36.575 kr)     │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Byggefaser

### FASE 1: Grundstruktur (1-2 dage)
**Mål:** Få noget på skærmen der virker

| Opgave | Detaljer |
|--------|----------|
| ☐ Opret `TaxPage.tsx` | Ny side i appen |
| ☐ Tilføj route | `/tax` eller `/skat` |
| ☐ Simpel layout | Header + tom container |
| ☐ Hardcoded testdata | 3-4 positioner til test |

**Resultat:** En side der viser "Skatteoversigt" med dummy data.

---

### FASE 2: Skatteberegner (2-3 dage)
**Mål:** Beregn skat korrekt for frit depot

| Opgave | Detaljer |
|--------|----------|
| ☐ Opret `taxCalculator.ts` | Ren funktion, ingen UI |
| ☐ Implementer progressiv skat | 27% under grænse, 42% over |
| ☐ Tilføj ægtefælle-logik | Dobbelt grænse hvis gift |
| ☐ Unit tests | Test med kendte beløb |

**Kode-struktur:**
```typescript
// services/taxCalculator.ts

interface TaxInput {
  positions: Position[];
  accountType: 'ask' | 'depot' | 'pension';
  isMarried: boolean;
  year: 2025 | 2026;
}

interface TaxResult {
  totalTax: number;
  breakdown: {
    shareIncome: number;      // Aktieindkomst
    capitalIncome: number;    // Kapitalindkomst
    askTax: number;
    pensionTax: number;
  };
  warnings: string[];
}

function calculateTax(input: TaxInput): TaxResult {
  // ...
}
```

**Resultat:** Funktion der returnerer korrekt skat for en portefølje.

---

### FASE 3: Positivliste-tjek (1-2 dage)
**Mål:** Afgør om ETF beskattes som aktie- eller kapitalindkomst

| Opgave | Detaljer |
|--------|----------|
| ☐ Download ABIS-listen | Excel fra skat.dk |
| ☐ Konverter til JSON | ISIN → boolean lookup |
| ☐ Opret `positiveList.ts` | `isOnPositiveList(isin): boolean` |
| ☐ Integrer i beregner | Klassificer ETF korrekt |

**Datakilde:**
```
https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx
```

**Resultat:** System ved om en ETF er på positivlisten.

---

### FASE 4: Kontotype-håndtering (2 dage)
**Mål:** Beregn forskelligt for ASK, depot, pension

| Opgave | Detaljer |
|--------|----------|
| ☐ ASK-beregning | Flat 17%, lagerbeskatning |
| ☐ Pension-beregning | 15,3% PAL-skat |
| ☐ Kombiner alle konti | Samlet skattebillede |
| ☐ Vis per konto | Opdelt visning i UI |

**Resultat:** Brugeren ser skat per kontotype.

---

### FASE 5: Advarsler og optimering (2 dage)
**Mål:** Hjælp brugeren med at optimere

| Opgave | Detaljer |
|--------|----------|
| ☐ ETF-advarsel | "Ikke på positivlisten" |
| ☐ Progressionsgrænse | "Du har plads til X kr mere" |
| ☐ ASK-loft | "Du nærmer dig grænsen" |
| ☐ Ægtefælle-tip | "I kan spare X kr ved..." |

**Resultat:** Brugeren får konkrete handlingsanvisninger.

---

### FASE 6: Integration (1-2 dage)
**Mål:** Forbind til resten af appen

| Opgave | Detaljer |
|--------|----------|
| ☐ Brug rigtig portefølje | Fra brugerens upload |
| ☐ Gem indstillinger | Civilstand, kontotype |
| ☐ Navigation | Link fra dashboard |

**Resultat:** Skattesiden virker med rigtige data.

---

## 📁 Filstruktur

```
src/
├── pages/
│   └── TaxPage.tsx              # Hovedside
│
├── components/
│   └── Tax/
│       ├── TaxSummary.tsx       # Samlet oversigt
│       ├── TaxBreakdown.tsx     # Per konto
│       ├── TaxWarnings.tsx      # Advarsler
│       └── TaxSettings.tsx      # Civilstand etc.
│
├── services/
│   ├── taxCalculator.ts         # Beregningslogik
│   └── positiveList.ts          # ABIS-liste lookup
│
├── data/
│   └── taxRates.ts              # Satser og grænser
│
└── types/
    └── tax.ts                   # TypeScript interfaces
```

---

## 📋 Konstanter (taxRates.ts)

```typescript
export const TAX_RATES = {
  2025: {
    shareIncome: {
      lowRate: 0.27,
      highRate: 0.42,
      threshold: 67500,        // Enlig
      thresholdMarried: 135000 // Ægtepar
    },
    ask: {
      rate: 0.17,
      maxDeposit: 166200
    },
    pension: {
      palRate: 0.153
    }
  },
  2026: {
    shareIncome: {
      lowRate: 0.27,
      highRate: 0.42,
      threshold: 79400,
      thresholdMarried: 158800
    },
    ask: {
      rate: 0.17,
      maxDeposit: 174200
    },
    pension: {
      palRate: 0.153
    }
  }
} as const;
```

---

## ✅ Definition of Done

Skattesiden er FÆRDIG når:

1. ☐ Brugeren kan se estimeret skat på sin portefølje
2. ☐ Skat beregnes korrekt for ASK, depot og pension
3. ☐ ETF'er klassificeres korrekt (positivliste)
4. ☐ Ægtefæller får dobbelt progressionsgrænse
5. ☐ Brugeren får relevante advarsler
6. ☐ Der er unit tests for beregningerne

---

## 🔗 Officielle kilder

| Emne | Link |
|------|------|
| Aktieindkomst satser | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier |
| ASK regler | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto |
| Positivlisten (Excel) | https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx |
| PAL-skat | https://skat.dk/borger/pension-og-efterloen/skat-af-pensionsafkast |
| Tabsregler | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier/betingelser-for-fradrag-for-tab-paa-aktier-og-investeringsbeviser |

---

## 🚀 Næste skridt

**Start med FASE 1 i dag:**
1. Opret `TaxPage.tsx`
2. Tilføj route
3. Vis hardcoded testdata

Vil du starte?
