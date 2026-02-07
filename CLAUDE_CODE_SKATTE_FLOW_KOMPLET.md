# CLAUDE CODE OPGAVE: Skatte-Flow Overblik

**Formål:** Dette dokument beskriver det komplette skatte-flow for dansk investeringsbeskatning. Brug dette som reference til at bygge skatteberegning i Portfolio Risk Analyzer.

**Dato:** 2. februar 2025  
**Version:** 2.1

---

## OVERSIGT: De 5 trin

```
TRIN 1: KONTOTYPE      → Bestemmer HVILKEN skattemodel der bruges
TRIN 2: AKTIVTYPE      → Bestemmer beskatningsmetode (realisation/lager)
TRIN 3: KLASSIFICERING → KUN relevant for Frit Depot
TRIN 4: SKATTEBEREGNING → Beregner skat baseret på kontotype
TRIN 5: TAB/FRADRAG    → Hvilken pulje tab havner i
```

**VIGTIGT:** Trin 3 (Klassificering) er KUN relevant for FRIT DEPOT. For ASK, Pension og Børneopsparing springes dette trin over.

---

## TRIN 1: KONTOTYPER

| Kontotype | Skattesats | Princip | Klassificering relevant? |
|-----------|------------|---------|--------------------------|
| **FRIT_DEPOT** | 27%/42% eller ~37% | Afhænger af aktivtype | ✅ JA |
| **ASK** | 17% flat | Lager | ❌ NEJ |
| **BOERNEOPSPARING** | 0% | Skattefri | ❌ NEJ |
| **RATEPENSION** | 15,3% PAL | Lager | ❌ NEJ |
| **ALDERSOPSPARING** | 15,3% PAL | Lager | ❌ NEJ |
| **KAPITALPENSION** | 15,3% PAL | Lager | ❌ NEJ |
| **LIVRENTE** | 15,3% PAL | Lager | ❌ NEJ |

---

## TRIN 2: AKTIVTYPER

| Aktivtype | Beskatningsprincip | Beskrivelse |
|-----------|-------------------|-------------|
| **AKTIE_DK** | Realisation | Dansk noteret aktie |
| **AKTIE_UDENLANDSK** | Realisation | Udenlandsk noteret aktie |
| **AKTIE_UNOTERET** | Realisation | Unoteret aktie |
| **ETF_POSITIVLISTE** | Lager | ETF på SKATs positivliste |
| **ETF_IKKE_POSITIVLISTE** | Lager | ETF IKKE på positivliste |
| **INVF_UDBYTTEBETALTENDE** | Realisation | Dansk inv.forening, udbyttebetalende |
| **INVF_AKKUMULERENDE** | Lager | Dansk inv.forening, akkumulerende |
| **FINANSIEL_KONTRAKT** | Lager | Option, CFD, Future |

---

## TRIN 3: KLASSIFICERING (KUN FOR FRIT DEPOT)

### Klassificeringsmatrix

| Aktivtype | → Indkomsttype | Skattesats |
|-----------|----------------|------------|
| AKTIE_DK | AKTIEINDKOMST | 27%/42% |
| AKTIE_UDENLANDSK | AKTIEINDKOMST | 27%/42% |
| AKTIE_UNOTERET | AKTIEINDKOMST | 27%/42% |
| ETF_POSITIVLISTE | AKTIEINDKOMST | 27%/42% |
| INVF_UDBYTTEBETALTENDE | AKTIEINDKOMST | 27%/42% |
| INVF_AKKUMULERENDE | AKTIEINDKOMST | 27%/42% |
| **ETF_IKKE_POSITIVLISTE** | **KAPITALINDKOMST** | ~37% |
| **FINANSIEL_KONTRAKT** | **KAPITALINDKOMST** | ~37% |

### Klassificeringsfunktion

```typescript
function classifyIncome(
  accountType: AccountType, 
  assetType: AssetType
): IncomeType {
  
  // Børneopsparing er altid skattefri
  if (accountType === 'BOERNEOPSPARING') {
    return 'SKATTEFRI';
  }
  
  // ASK er altid 17% lager
  if (accountType === 'ASK') {
    return 'ASK_INDKOMST';
  }
  
  // Pension er altid 15,3% PAL
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(accountType)) {
    return 'PAL_INDKOMST';
  }
  
  // Frit depot: Afhænger af aktivtype
  if (accountType === 'FRIT_DEPOT') {
    // Kapitalindkomst-typer
    if (assetType === 'ETF_IKKE_POSITIVLISTE' || assetType === 'FINANSIEL_KONTRAKT') {
      return 'KAPITALINDKOMST';
    }
    
    // Alt andet → Aktieindkomst
    return 'AKTIEINDKOMST';
  }
  
  throw new Error(`Unknown account type: ${accountType}`);
}
```

---

## TRIN 4: SKATTEBEREGNING

### Progressionsgrænser (DYNAMISK PER ÅR)

| År | Enlig | Ægtefæller | Kilde |
|----|-------|------------|-------|
| **2025** | **67.500 kr** | **135.000 kr** | PSL § 8a |
| **2026** | **79.400 kr** | **158.800 kr** | PSL § 8a |

### Skattesatser per indkomsttype

| Indkomsttype | Skattesats | Bemærkning |
|--------------|------------|------------|
| **AKTIEINDKOMST** | 27% op til grænse, 42% over | Progressiv |
| **KAPITALINDKOMST** | ~37-42% gevinst, ~25-33% tab | ⚠️ ASYMMETRISK |
| **ASK_INDKOMST** | 17% flat | Lagerbeskatning |
| **PAL_INDKOMST** | 15,3% flat | Lagerbeskatning |
| **SKATTEFRI** | 0% | Børneopsparing |

### ⚠️ ADVARSEL: Kapitalindkomst er ASYMMETRISK

```
Gevinst beskattes med ~37-42%
Tab giver KUN fradrag med ~25-33%
Brugeren får IKKE fuld skatteværdi af tab!
```

---

## TRIN 5: TAB / FRADRAG

### Tabspuljer for FRIT DEPOT

| Tab fra aktivtype | Tabspulje | Kan modregnes i | Ægtefælle |
|-------------------|-----------|-----------------|-----------|
| AKTIE_DK | NOTERET_AKTIE | Noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| AKTIE_UDENLANDSK | NOTERET_AKTIE | Noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| AKTIE_UNOTERET | UNOTERET_AKTIE | **AL aktieindkomst** | ✅ JA |
| ETF_POSITIVLISTE | NOTERET_AKTIE | Noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| ETF_IKKE_POSITIVLISTE | KAPITAL_GENEREL | Kapitalindkomst (ikke fin.kontr.) | ✅ JA |
| INVF_UDBYTTEBETALTENDE | NOTERET_AKTIE | Noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| INVF_AKKUMULERENDE | NOTERET_AKTIE | Noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| FINANSIEL_KONTRAKT | FINANSIEL_KONTRAKT | ⚠️ **KUN andre fin. kontrakter** | ✅ JA |

### Tabspuljer for ISOLEREDE KONTI

| Kontotype | Tabspulje | Kan modregnes i | Ægtefælle | Særlig risiko |
|-----------|-----------|-----------------|-----------|---------------|
| ASK | ASK_ISOLERET | Kun samme ASK | ❌ NEJ | ⚠️ **Tabes ved lukning!** |
| PENSION (alle) | PENSION_ISOLERET | Kun samme pension | ❌ NEJ | - |
| BOERNEOPSPARING | (ingen) | Ikke relevant | - | - |

### Tabspulje-funktion

```typescript
function getLossPool(
  accountType: AccountType, 
  assetType: AssetType
): LossPool | null {
  
  // Børneopsparing har ingen tabspulje (skattefri)
  if (accountType === 'BOERNEOPSPARING') {
    return null;
  }
  
  // ASK har isoleret pulje
  if (accountType === 'ASK') {
    return 'ASK_ISOLERET';
  }
  
  // Pension har isoleret pulje
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(accountType)) {
    return 'PENSION_ISOLERET';
  }
  
  // Frit depot: Afhænger af aktivtype
  if (accountType === 'FRIT_DEPOT') {
    switch (assetType) {
      case 'AKTIE_UNOTERET':
        return 'UNOTERET_AKTIE';  // Fuldt fradrag i AL aktieindkomst
      case 'ETF_IKKE_POSITIVLISTE':
        return 'KAPITAL_GENEREL';
      case 'FINANSIEL_KONTRAKT':
        return 'FINANSIEL_KONTRAKT';  // Isoleret - kun mod andre fin.kontr.
      default:
        return 'NOTERET_AKTIE';  // Kildeartsbegrænset
    }
  }
  
  throw new Error(`Unknown account type: ${accountType}`);
}
```

---

## KOMPLET FLOW PER KONTOTYPE

### 1. FRIT DEPOT

```
FRIT DEPOT
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING
    ├── Aktier, ETF positivliste, Inv.foreninger → AKTIEINDKOMST
    └── ETF ikke-positivliste, Fin. kontrakter → KAPITALINDKOMST
    ↓
SKATTEBEREGNING
    ├── Aktieindkomst: 27% op til grænse, 42% over
    └── Kapitalindkomst: ~37% (⚠️ asymmetrisk ved tab)
    ↓
TAB/FRADRAG
    ├── Noterede aktier/ETF pos./Inv.for. → NOTERET_AKTIE (ægtefælle OBLIGATORISK)
    ├── Unoterede aktier → UNOTERET_AKTIE (fuldt fradrag)
    ├── ETF ikke-positivliste → KAPITAL_GENEREL
    └── Finansielle kontrakter → FINANSIEL_KONTRAKT (⚠️ isoleret!)
```

### 2. ASK

```
ASK
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER
    ↓
SKATTEBEREGNING → 17% FLAT (lager)
    ↓
TAB/FRADRAG → ASK_ISOLERET
    └── ⚠️ Tab TABES hvis kontoen lukkes!
```

### 3. PENSION (alle typer)

```
PENSION
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER
    ↓
SKATTEBEREGNING → 15,3% PAL (lager)
    ↓
TAB/FRADRAG → PENSION_ISOLERET
    └── Tab kun på samme pensionskonto
```

### 4. BØRNEOPSPARING

```
BØRNEOPSPARING
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER
    ↓
SKATTEBEREGNING → 0% SKATTEFRI
    ↓
TAB/FRADRAG → Ikke relevant
```

---

## TYPESCRIPT TYPES

```typescript
export type AccountType = 
  | 'FRIT_DEPOT' 
  | 'ASK' 
  | 'BOERNEOPSPARING' 
  | 'RATEPENSION' 
  | 'ALDERSOPSPARING' 
  | 'KAPITALPENSION' 
  | 'LIVRENTE';

export type AssetType = 
  | 'AKTIE_DK' 
  | 'AKTIE_UDENLANDSK' 
  | 'AKTIE_UNOTERET'
  | 'ETF_POSITIVLISTE' 
  | 'ETF_IKKE_POSITIVLISTE' 
  | 'INVF_UDBYTTEBETALTENDE' 
  | 'INVF_AKKUMULERENDE'
  | 'FINANSIEL_KONTRAKT';

export type IncomeType = 
  | 'AKTIEINDKOMST' 
  | 'KAPITALINDKOMST' 
  | 'ASK_INDKOMST' 
  | 'PAL_INDKOMST' 
  | 'SKATTEFRI';

export type LossPool = 
  | 'NOTERET_AKTIE' 
  | 'UNOTERET_AKTIE' 
  | 'KAPITAL_GENEREL' 
  | 'FINANSIEL_KONTRAKT'
  | 'ASK_ISOLERET' 
  | 'PENSION_ISOLERET';
```

---

## TYPESCRIPT KONSTANTER

```typescript
export const TAX_RATES = {
  2025: {
    shareIncome: {
      lowRate: 0.27,
      highRate: 0.42,
      threshold: 67500,
      thresholdMarried: 135000
    },
    capitalIncome: {
      gainRate: 0.37,
      lossDeduction: 0.25  // ⚠️ LAVERE end gevinstskat!
    },
    ask: {
      rate: 0.17
    },
    pension: {
      palRate: 0.153
    },
    childSavings: {
      rate: 0
    }
  },
  2026: {
    shareIncome: {
      lowRate: 0.27,
      highRate: 0.42,
      threshold: 79400,
      thresholdMarried: 158800
    },
    capitalIncome: {
      gainRate: 0.37,
      lossDeduction: 0.25
    },
    ask: {
      rate: 0.17
    },
    pension: {
      palRate: 0.153
    },
    childSavings: {
      rate: 0
    }
  }
} as const;
```

---

## ADVARSLER TIL BRUGEREN

### ⚠️ Kapitalindkomst asymmetri
```
ADVARSEL: Kapitalindkomst er ASYMMETRISK!
- Gevinst beskattes med ~37-42%
- Tab giver KUN fradrag med ~25-33%
- Du får IKKE fuld skatteværdi af tab
```

### ⚠️ Finansielle kontrakter isoleret
```
ADVARSEL: Tab på finansielle kontrakter er ISOLERET!
- Kan KUN modregnes i gevinst på andre finansielle kontrakter
- Kan IKKE bruges mod ETF-tab eller anden kapitalindkomst
- Meget begrænset anvendelse
```

### ⚠️ ASK lukning
```
ADVARSEL: Hvis du lukker din ASK, MISTER du fremført tab!
Tab på ASK kan kun bruges på samme konto.
```

### ⚠️ Obligatorisk ægtefælleoverførsel
```
INFO: Tab på noterede aktier overføres AUTOMATISK til ægtefælle.
Dette er obligatorisk - ikke valgfrit.
Rækkefølge:
1. Først mod egen gevinst/udbytte
2. Derefter mod ægtefælles gevinst/udbytte
3. Resterende fremføres til næste år
```

---

## LOVHENVISNINGER

| Emne | Lov/paragraf |
|------|--------------|
| Aktieindkomst satser | PSL § 8a, stk. 1-2 |
| Ægtefælle bundfradrag | PSL § 8a, stk. 4 |
| Tab noterede aktier | ABL § 13 A |
| Tab unoterede aktier | ABL § 13 |
| ETF positivliste | ABL § 19 B |
| ETF ikke-positivliste | ABL § 19 C |
| Finansielle kontrakter | KGL § 29-33 |
| ASK beskatning | ASKL § 13-14 |
| PAL-skat | PAL § 2 |

---

## VISUELT OVERBLIK

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRIN 1: KONTOTYPE                            │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ FRIT DEPOT  │    ASK      │ BØRNEOPSPARING  │      PENSION          │
│  27%/42%    │    17%      │      0%         │      15,3%            │
│  eller ~37% │   flat      │   skattefri     │      PAL              │
└──────┬──────┴──────┬──────┴────────┬────────┴───────────┬───────────┘
       │             │               │                    │
       ▼             ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TRIN 2: AKTIVTYPE                            │
│  Aktier, ETF, Investeringsforeninger, Finansielle kontrakter        │
└──────┬──────────────┬──────────────┬────────────────────┬───────────┘
       │              │              │                    │
       ▼              │              │                    │
┌──────────────┐      │              │                    │
│   TRIN 3:    │   SPRINGES      SPRINGES             SPRINGES
│KLASSIFICERING│     OVER          OVER                 OVER
├──────────────┤      │              │                    │
│AKTIEINDKOMST │      │              │                    │
│    eller     │      │              │                    │
│KAPITALINDKOMST      │              │                    │
└──────┬───────┘      │              │                    │
       │              │              │                    │
       ▼              ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     TRIN 4: SKATTEBEREGNING                         │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ 27%/42%     │    17%      │      0%         │      15,3%            │
│  eller ~37% │   FLAT      │   SKATTEFRI     │      PAL              │
└──────┬──────┴──────┬──────┴────────┬────────┴───────────┬───────────┘
       │             │               │                    │
       ▼             ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TRIN 5: TAB/FRADRAG                            │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ NOTERET     │ASK_ISOLERET │  Ikke relevant  │  PENSION_ISOLERET     │
│ UNOTERET    │             │                 │                       │
│ KAPITAL     │ ⚠️ tabes ved │                 │                       │
│ FIN.KONTR.  │   lukning!  │                 │                       │
└─────────────┴─────────────┴─────────────────┴───────────────────────┘
```

---

*Dokument klar til implementering*
