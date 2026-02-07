# Ægtefælleregler

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PSL § 8 a, stk. 4** | Overførsel af bundfradrag | https://danskelove.dk/personskatteloven/8a |
| **ABL § 13 A, stk. 3** | Obligatorisk overførsel af aktietab | https://danskelove.dk/aktieavancebeskatningsloven/13a |
| **PSL § 11, stk. 3** | Overførsel af negativ kapitalindkomst nedslag | https://danskelove.dk/personskatteloven/11 |

---

## Grundbetingelse

Alle ægtefælleregler kræver at ægtefællerne er **samlevende ved indkomstårets udgang** (31. december).

---

## 1. Overførsel af aktieindkomst-bundfradrag

### Regel (PSL § 8 a, stk. 4)

Hvis en ægtefælles aktieindkomst er **lavere end progressionsgrænsen**, forhøjes den anden ægtefælles grænse med det uudnyttede beløb.

### Progressionsgrænser

| År | Enlig | Ægtefæller (samlet) |
|----|-------|---------------------|
| 2025 | 67.500 kr | 135.000 kr |
| 2026 | 79.400 kr | 158.800 kr |

### Beregningseksempel

```
2025:
  Ægtefælle A: Aktieindkomst 30.000 kr
  Ægtefælle B: Aktieindkomst 100.000 kr

  A's uudnyttede bundfradrag: 67.500 - 30.000 = 37.500 kr
  B's forhøjede grænse: 67.500 + 37.500 = 105.000 kr

  Skat:
    A: 30.000 × 27% = 8.100 kr
    B: 100.000 × 27% = 27.000 kr (under forhøjet grænse)
    Total: 35.100 kr

  Uden overførsel:
    A: 30.000 × 27% = 8.100 kr
    B: 67.500 × 27% + 32.500 × 42% = 31.875 kr
    Total: 39.975 kr

  Besparelse: 4.875 kr
```

---

## 2. Obligatorisk overførsel af aktietab (noterede)

### ⚠️ KRITISK: Dette er OBLIGATORISK, ikke valgfrit

### Regel (ABL § 13 A, stk. 3)

Tab på noterede aktier **SKAL** overføres til ægtefælle, hvis der ikke er egen gevinst/udbytte at modregne i.

### Rækkefølge

```
1. Tab modregnes først i EGEN gevinst og udbytte på noterede aktier
2. Resterende tab OVERFØRES OBLIGATORISK til ægtefælle
3. Modregnes i ægtefælles gevinst og udbytte
4. Resterende tab fremføres (i egen persons navn)
```

### Beregningseksempel

```
2025:
  Person A: Tab på Ørsted: -50.000 kr
  Person A: Udbytte Novo: +10.000 kr
  Person B: Gevinst Mærsk: +60.000 kr

  Beregning A:
    Tab: -50.000 kr
    Eget udbytte: +10.000 kr
    Netto: -40.000 kr → OBLIGATORISK overførsel til B

  Beregning B:
    Gevinst: +60.000 kr
    Overført tab fra A: -40.000 kr
    Netto: +20.000 kr
    Skat: 20.000 × 27% = 5.400 kr

  Samlet familieskat: 5.400 kr

  Uden overførsel (ikke tilladt, men til illustration):
    A: 0 kr skat, 40.000 kr fremført
    B: 60.000 × 27% = 16.200 kr
    Total: 16.200 kr
    
  Besparelse ved obligatorisk overførsel: 10.800 kr
```

### Omfattede aktiver

Obligatorisk overførsel gælder for tab på:
- ✅ Noterede aktier (danske og udenlandske)
- ✅ ETF'er på positivlisten
- ✅ Investeringsforeninger (begge typer)
- ❌ Unoterede aktier (valgfri overførsel)

---

## 3. Overførsel af negativ kapitalindkomst-nedslag

### Regel (PSL § 11, stk. 3)

Hvis en ægtefælle ikke kan udnytte sit PSL § 11 nedslag fuldt ud, kan det uudnyttede overføres til ægtefællen.

### Beregningseksempel

```
  Person A: Negativ kapitalindkomst: -70.000 kr
  Person A: Bundskat: 5.000 kr (lille indkomst)
  
  A's PSL § 11 nedslag: 50.000 × 8% = 4.000 kr
  A kan kun bruge: 5.000 kr nedslag (begrænset af bundskat)
  
  Uudnyttet: 4.000 - 5.000 = -1.000 kr (kan ikke være negativt)
  
  I praksis: Ægtefæller sambeskattes, så beløbsgrænsen er 100.000 kr samlet.
```

---

## 4. INGEN overførsel for isolerede konti

### ASK

```
Tab på ASK kan IKKE overføres til ægtefælle.
Tab er isoleret til den specifikke ASK-konto.
```

### Pension

```
Tab på pension kan IKKE overføres til ægtefælle.
Tab er isoleret til den specifikke pensionskonto.
```

---

## Oversigt: Hvad kan overføres?

| Type | Kan overføres til ægtefælle | Obligatorisk? |
|------|------------------------------|---------------|
| Bundfradrag aktieindkomst | ✅ Ja | Automatisk |
| Tab noterede aktier | ✅ Ja | **OBLIGATORISK** |
| Tab unoterede aktier | ✅ Ja | Valgfri |
| PSL § 11 nedslag | ✅ Ja | Automatisk |
| Tab på ASK | ❌ Nej | - |
| Tab på pension | ❌ Nej | - |
| Fremført aktietab | ❌ Nej | - |

---

## Systemimplementering

### TypeScript

```typescript
interface SpouseCalculation {
  personA: {
    shareIncome: number;
    shareLoss: number;          // Tab noterede aktier
    dividends: number;
    capitalIncome: number;
  };
  personB: {
    shareIncome: number;
    shareLoss: number;
    dividends: number;
    capitalIncome: number;
  };
  year: 2025 | 2026;
}

function calculateSpouseTransfer(calc: SpouseCalculation) {
  const baseThreshold = calc.year === 2025 ? 67500 : 79400;
  
  // 1. Bundfradrag overførsel
  const aUnusedThreshold = Math.max(0, baseThreshold - calc.personA.shareIncome);
  const bUnusedThreshold = Math.max(0, baseThreshold - calc.personB.shareIncome);
  
  const aEffectiveThreshold = baseThreshold + bUnusedThreshold;
  const bEffectiveThreshold = baseThreshold + aUnusedThreshold;
  
  // 2. Obligatorisk tabsoverførsel (noterede aktier)
  const aNetLoss = Math.max(0, 
    Math.abs(calc.personA.shareLoss) - calc.personA.shareIncome - calc.personA.dividends
  );
  const bNetLoss = Math.max(0,
    Math.abs(calc.personB.shareLoss) - calc.personB.shareIncome - calc.personB.dividends
  );
  
  // A's tab overføres til B (og omvendt)
  const aTransferToB = aNetLoss;
  const bTransferToA = bNetLoss;
  
  // B's skattegrundlag reduceres med A's overførte tab
  const bTaxableAfterTransfer = Math.max(0,
    calc.personB.shareIncome + calc.personB.dividends - aTransferToB
  );
  
  const aTaxableAfterTransfer = Math.max(0,
    calc.personA.shareIncome + calc.personA.dividends - bTransferToA
  );
  
  return {
    personA: {
      effectiveThreshold: aEffectiveThreshold,
      taxableShareIncome: aTaxableAfterTransfer,
      transferredLoss: aTransferToB
    },
    personB: {
      effectiveThreshold: bEffectiveThreshold,
      taxableShareIncome: bTaxableAfterTransfer,
      transferredLoss: bTransferToA
    }
  };
}
```

---

## Advarsler til brugeren

### Ved tab på noterede aktier (gift):

```
ℹ️ OBLIGATORISK TABSOVERFØRSEL

Dit tab på noterede aktier overføres AUTOMATISK til din ægtefælle,
når du ikke selv har gevinst/udbytte at modregne i.

Dit tab: 50.000 kr
Din gevinst/udbytte: 10.000 kr
Overført til ægtefælle: 40.000 kr

Dette er OBLIGATORISK ifølge ABL § 13 A, stk. 3.
Du kan ikke vælge at fremføre tabet i stedet.
```

### Ved uudnyttet bundfradrag:

```
💡 ÆGTEFÆLLEOPTIMERING AKTIV

Din aktieindkomst: 30.000 kr
Dit uudnyttede bundfradrag: 37.500 kr

Din ægtefælles forhøjede bundfradrag: 105.000 kr
(67.500 kr + 37.500 kr)

Estimeret besparelse: 4.875 kr
```

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| PSL § 8 a, stk. 4 | https://danskelove.dk/personskatteloven/8a | 02-02-2025 |
| ABL § 13 A, stk. 3 | https://danskelove.dk/aktieavancebeskatningsloven/13a | 02-02-2025 |
| PSL § 11, stk. 3 | https://danskelove.dk/personskatteloven/11 | 02-02-2025 |
| SKAT Juridisk Vejledning | https://info.skat.dk/data.aspx?oid=1976883 | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
