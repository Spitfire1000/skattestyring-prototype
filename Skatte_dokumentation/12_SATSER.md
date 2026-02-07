# Satser og Beløbsgrænser

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Officielle kilder

| Kilde | URL |
|-------|-----|
| **SKM Personskatteloven** | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven |
| **SKM Aktiesparekontoloven** | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/aktiesparekontoloven |
| **SKM Pensionsbeskatningsloven** | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/pensionsbeskatningsloven |

---

## Aktieindkomst

### Skattesatser

| Sats | Værdi |
|------|-------|
| Under progressionsgrænse | **27%** |
| Over progressionsgrænse | **42%** |

### Progressionsgrænser

| År | Enlig | Ægtefæller |
|----|-------|------------|
| **2025** | **67.500 kr** | **135.000 kr** |
| **2026** | **79.400 kr** | **158.800 kr** |

---

## Kapitalindkomst

### Positiv kapitalindkomst

| Sats | Beskrivelse |
|------|-------------|
| ~37-42% | Afhænger af samlet indkomst |

### Negativ kapitalindkomst (PSL § 11)

| Parameter | 2025 | 2026 |
|-----------|------|------|
| **Kompensationsprocent** | 8% | 8% |
| **Beløbsgrænse (enlig)** | 50.000 kr | 50.000 kr |
| **Beløbsgrænse (ægtepar)** | 100.000 kr | 100.000 kr |

### Samlet fradragsværdi for tab

```
Op til beløbsgrænsen:
  PSL § 11: 8%
  Kommuneskat: ~25%
  Total: ~33%

Over beløbsgrænsen:
  Kun kommuneskat: ~25%
```

---

## Aktiesparekonto (ASK)

| Parameter | 2025 | 2026 |
|-----------|------|------|
| **Skattesats** | 17% | 17% |
| **Maksimalt indskud** | 166.200 kr | 174.200 kr |

---

## Pension (PAL-skat)

| Parameter | 2025 | 2026 |
|-----------|------|------|
| **PAL-skattesats** | 15,3% | 15,3% |

### Indskudsgrænser

| Pensionstype | 2025 | 2026 |
|--------------|------|------|
| **Ratepension** | 65.500 kr | 68.700 kr |
| **Aldersopsparing (standard)** | 9.400 kr | 9.900 kr |
| **Aldersopsparing (≤7 år til folkepension)** | 61.200 kr | 64.200 kr |
| **Livrente (privat)** | 60.300 kr | 63.200 kr |

---

## Børneopsparing

| Parameter | Værdi |
|-----------|-------|
| **Skattesats** | 0% |
| **Årligt maksimum** | 6.000 kr |
| **Samlet maksimum** | 72.000 kr |

---

## Øvrige satser

### Bundskatteprocent

| År | Sats |
|----|------|
| 2025 | 12,01% |
| 2026 | 12,01% |

### Personfradrag

| År | Beløb |
|----|-------|
| 2025 | 51.600 kr |
| 2026 | 54.100 kr |

---

## TypeScript implementation

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
      estimatedGainRate: 0.37,
      psl11Rate: 0.08,
      psl11Threshold: 50000,
      psl11ThresholdMarried: 100000,
      municipalRate: 0.25
    },
    ask: {
      rate: 0.17,
      maxDeposit: 166200
    },
    pension: {
      palRate: 0.153,
      ratepensionMax: 65500,
      aldersopsparingMax: 9400,
      aldersopsparingMaxNearRetirement: 61200,
      livrenteMax: 60300
    },
    childSavings: {
      rate: 0,
      yearlyMax: 6000,
      totalMax: 72000
    },
    general: {
      bundskatteprocent: 0.1201,
      personfradrag: 51600
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
      estimatedGainRate: 0.37,
      psl11Rate: 0.08,
      psl11Threshold: 50000,
      psl11ThresholdMarried: 100000,
      municipalRate: 0.25
    },
    ask: {
      rate: 0.17,
      maxDeposit: 174200
    },
    pension: {
      palRate: 0.153,
      ratepensionMax: 68700,
      aldersopsparingMax: 9900,
      aldersopsparingMaxNearRetirement: 64200,
      livrenteMax: 63200
    },
    childSavings: {
      rate: 0,
      yearlyMax: 6000,
      totalMax: 72000
    },
    general: {
      bundskatteprocent: 0.1201,
      personfradrag: 54100
    }
  }
} as const;

export type TaxYear = keyof typeof TAX_RATES;

export function getTaxRates(year: TaxYear) {
  return TAX_RATES[year];
}

export function getShareIncomeThreshold(
  year: TaxYear, 
  isMarried: boolean
): number {
  const rates = TAX_RATES[year];
  return isMarried 
    ? rates.shareIncome.thresholdMarried 
    : rates.shareIncome.threshold;
}
```

---

## Årlig opdatering

### Hvornår opdateres satserne?

| Tidspunkt | Handling |
|-----------|----------|
| **Oktober/November** | Finansloven fremlægges med næste års satser |
| **December** | Finansloven vedtages |
| **1. januar** | Nye satser træder i kraft |

### Kilder til nye satser

1. **skm.dk** - Officielle satser
2. **Finansloven** - Politisk besluttede ændringer
3. **retsinformation.dk** - Lovtekster

---

## Verificering

| Sats | Kilde | Verificeret |
|------|-------|-------------|
| Aktieindkomst progression | SKM.dk | 02-02-2025 |
| PSL § 11 kompensation | SKM.dk | 02-02-2025 |
| ASK indskudsgrænse | SKM.dk | 02-02-2025 |
| PAL-skat | SKM.dk | 02-02-2025 |
| Pensionsgrænser | SKM.dk | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
