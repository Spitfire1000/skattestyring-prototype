# Aktieindkomst

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PSL § 4 a** | Definition af aktieindkomst | https://danskelove.dk/personskatteloven/4a |
| **PSL § 8 a** | Skattesatser og progressionsgrænse | https://danskelove.dk/personskatteloven/8a |
| **ABL** | Aktieavancebeskatningsloven | https://danskelove.dk/aktieavancebeskatningsloven |

**Officiel kilde for satser:**  
https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven

---

## Hvad er aktieindkomst?

Aktieindkomst omfatter (PSL § 4 a):

| Type | Eksempler |
|------|-----------|
| **Gevinst ved salg af aktier** | Noterede og unoterede |
| **Udbytte fra aktier** | Dansk og udenlandsk |
| **Gevinst på aktiebaserede investeringsinstitutter** | ETF positivliste, inv.foreninger |
| **Udbytte fra aktiebaserede investeringsinstitutter** | Udbyttebetalende inv.foreninger |

---

## Skattesatser

### Progressiv beskatning

| Indkomst | Skattesats |
|----------|------------|
| Op til progressionsgrænse | **27%** |
| Over progressionsgrænse | **42%** |

### Progressionsgrænser (verificeret fra SKM.dk)

| År | Enlig | Ægtefæller |
|----|-------|------------|
| **2025** | **67.500 kr** | **135.000 kr** |
| **2026** | **79.400 kr** | **158.800 kr** |

---

## Ægtefællers udnyttelse af bundfradrag

Fra **PSL § 8 a, stk. 4**:

Hvis en ægtefælles aktieindkomst er lavere end progressionsgrænsen, forhøjes den anden ægtefælles grænse med forskelsbeløbet.

### Betingelse
Ægtefællerne skal være **samlevende ved indkomstårets udgang**.

### Eksempel (2025)

```
Ægtefælle A: Aktieindkomst 30.000 kr
Ægtefælle B: Aktieindkomst 100.000 kr

Beregning:
  A's uudnyttede bundfradrag: 67.500 - 30.000 = 37.500 kr
  B's forhøjede grænse: 67.500 + 37.500 = 105.000 kr

Skat:
  A: 30.000 × 27% = 8.100 kr
  B: 100.000 × 27% = 27.000 kr (hele beløbet under forhøjet grænse)
  
  Total: 35.100 kr

Uden overførsel:
  A: 30.000 × 27% = 8.100 kr
  B: 67.500 × 27% + 32.500 × 42% = 18.225 + 13.650 = 31.875 kr
  
  Total: 39.975 kr
  
Besparelse: 4.875 kr
```

---

## Beregningseksempler

### Eksempel 1: Enlig under progressionsgrænse (2025)

**Situation:**
- Gevinst ved salg af aktier: 50.000 kr
- Udbytte: 10.000 kr

**Beregning:**

```
Samlet aktieindkomst: 60.000 kr
Progressionsgrænse: 67.500 kr

60.000 kr < 67.500 kr → Alt beskattes med 27%

Skat: 60.000 × 27% = 16.200 kr
```

### Eksempel 2: Enlig over progressionsgrænse (2025)

**Situation:**
- Gevinst ved salg af aktier: 100.000 kr

**Beregning:**

```
Samlet aktieindkomst: 100.000 kr
Progressionsgrænse: 67.500 kr

Under grænse: 67.500 × 27% = 18.225 kr
Over grænse: 32.500 × 42% = 13.650 kr

Total skat: 31.875 kr
Effektiv skatteprocent: 31,88%
```

### Eksempel 3: Udbytte med udenlandsk kildeskat

**Situation:**
- Udbytte fra Apple (USA): 1.000 USD
- Kildeskat USA (med W-8BEN): 15%
- Valutakurs: 7,00 DKK/USD

**Beregning:**

```
Bruttoudbytte: 1.000 × 7,00 = 7.000 kr
Kildeskat USA: 7.000 × 15% = 1.050 kr
Nettoudbytte: 5.950 kr

Dansk skat (27%): 7.000 × 27% = 1.890 kr
Credit for kildeskat: -1.050 kr
Dansk skat at betale: 840 kr

Total skat betalt: 1.050 + 840 = 1.890 kr (27%)
```

---

## Tabsbehandling

Se detaljeret beskrivelse i [05_TAB_AKTIEINDKOMST.md](05_TAB_AKTIEINDKOMST.md)

### Oversigt

| Type | Fradrag | Ægtefælle |
|------|---------|-----------|
| Tab noterede aktier | Kildeartsbegrænset | OBLIGATORISK overførsel |
| Tab unoterede aktier | Fuldt fradrag i AL aktieindkomst | Valgfri |
| Tab ETF positivliste | Som noterede aktier | OBLIGATORISK overførsel |
| Tab investeringsforeninger | Som noterede aktier | OBLIGATORISK overførsel |

---

## Systemimplementering

### TypeScript

```typescript
interface ShareIncomeCalculation {
  year: number;
  isMarried: boolean;
  
  // Indkomst
  gains: number;         // Gevinster
  dividends: number;     // Udbytter
  losses: number;        // Tab (negativt tal)
  
  // Fremført tab
  carryForwardLossUsed: number;
  
  // Netto
  netShareIncome: number;
  
  // Progression
  threshold: number;     // 67.500 / 79.400 kr
  spouseUnusedThreshold: number;  // Fra ægtefælle
  effectiveThreshold: number;     // threshold + spouseUnusedThreshold
  
  // Beregning
  taxedAtLowRate: number;   // Op til effectiveThreshold
  taxedAtHighRate: number;  // Over effectiveThreshold
  
  // Skat
  lowRateTax: number;       // × 27%
  highRateTax: number;      // × 42%
  totalTax: number;
  effectiveRate: number;    // totalTax / netShareIncome
}
```

### Beregningsfunktion

```typescript
function calculateShareIncomeTax(
  netShareIncome: number,
  isMarried: boolean,
  spouseShareIncome: number,
  year: 2025 | 2026
): ShareIncomeTaxResult {
  
  const baseThreshold = year === 2025 ? 67500 : 79400;
  
  // Beregn ægtefælles uudnyttede bundfradrag
  let effectiveThreshold = baseThreshold;
  if (isMarried && spouseShareIncome < baseThreshold) {
    const spouseUnused = baseThreshold - spouseShareIncome;
    effectiveThreshold += spouseUnused;
  }
  
  if (netShareIncome <= 0) {
    return { totalTax: 0, effectiveRate: 0 };
  }
  
  const taxedAtLowRate = Math.min(netShareIncome, effectiveThreshold);
  const taxedAtHighRate = Math.max(0, netShareIncome - effectiveThreshold);
  
  const lowRateTax = taxedAtLowRate * 0.27;
  const highRateTax = taxedAtHighRate * 0.42;
  const totalTax = lowRateTax + highRateTax;
  
  return {
    taxedAtLowRate,
    taxedAtHighRate,
    lowRateTax,
    highRateTax,
    totalTax,
    effectiveRate: totalTax / netShareIncome
  };
}
```

---

## Advarsler til brugeren

### Ved overskridelse af progressionsgrænse:

```
⚠️ PROGRESSIONSGRÆNSE OVERSKREDET

Din aktieindkomst: 100.000 kr
Progressionsgrænse: 67.500 kr
Overskridelse: 32.500 kr

De første 67.500 kr beskattes med 27%: 18.225 kr
De næste 32.500 kr beskattes med 42%: 13.650 kr

Total skat: 31.875 kr
```

### Ved gift med uudnyttet bundfradrag:

```
💡 ÆGTEFÆLLEOPTIMERING

Din ægtefælles aktieindkomst: 30.000 kr
Uudnyttet bundfradrag: 37.500 kr

Dit forhøjede bundfradrag: 105.000 kr
Besparelse: ca. 4.875 kr
```

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| PSL § 4 a (definition) | https://danskelove.dk/personskatteloven/4a | 02-02-2025 |
| PSL § 8 a (satser) | https://danskelove.dk/personskatteloven/8a | 02-02-2025 |
| SKM satser | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven | 02-02-2025 |
| SKAT aktieindkomst | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
