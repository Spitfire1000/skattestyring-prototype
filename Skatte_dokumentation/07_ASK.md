# Aktiesparekonto (ASK)

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **ASKL** | Aktiesparekontoloven | https://danskelove.dk/aktiesparekontoloven |
| **ASKL § 5** | Tilladte aktiver | https://danskelove.dk/aktiesparekontoloven/5 |
| **ASKL § 9** | Indskudsloft | https://danskelove.dk/aktiesparekontoloven/9 |
| **ASKL § 13-14** | Beskatning | https://danskelove.dk/aktiesparekontoloven/13 |

**Officiel SKAT-vejledning:**  
https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto

---

## Skattemodel

| Parameter | Værdi |
|-----------|-------|
| **Skattesats** | 17% flat |
| **Princip** | Lagerbeskatning |
| **Klassificering** | Ikke relevant (alt beskattes ens) |
| **Tabshåndtering** | Isoleret pulje |

---

## Indskudsgrænser (verificeret fra SKM.dk)

| År | Maksimalt indskud |
|----|-------------------|
| **2025** | **166.200 kr** |
| **2026** | **174.200 kr** |

**NB:** Grænsen gælder for **samlet indskud** (ikke årligt).

---

## Tilladte aktiver (ASKL § 5)

### ✅ Tilladt på ASK

| Aktivtype | Eksempler |
|-----------|-----------|
| Aktier optaget til handel | Novo, Apple, Tesla |
| ETF'er på positivlisten | iShares MSCI World, Vanguard |
| Aktiebaserede investeringsbeviser | Sparindex, Danske Invest |
| Kontantindeståender | Til køb/salg |

### ❌ IKKE tilladt på ASK

| Aktivtype | Årsag |
|-----------|-------|
| Hovedaktionæraktier | ASKL § 5, stk. 2 |
| Næringsaktier | ASKL § 5, stk. 2 |
| Andelsbeviser | ASKL § 5, stk. 2 |
| Obligationsbaserede ETF'er | Ikke aktiebaseret |
| Guld-ETF'er | Ikke aktiebaseret |
| Unoterede aktier | Ikke optaget til handel |

---

## Lagerbeskatning

### Beregning

```
Beskatningsgrundlag = Værdi 31/12 - Værdi 1/1 - Indskud + Hævninger

Skat = Beskatningsgrundlag × 17%
```

### Eksempel: Positiv afkast

```
Værdi 1. januar: 100.000 kr
Indskud i løbet af året: 20.000 kr
Værdi 31. december: 135.000 kr

Beskatningsgrundlag: 135.000 - 100.000 - 20.000 = 15.000 kr
Skat: 15.000 × 17% = 2.550 kr
```

### Eksempel: Negativt afkast

```
Værdi 1. januar: 100.000 kr
Værdi 31. december: 85.000 kr

Beskatningsgrundlag: 85.000 - 100.000 = -15.000 kr
Skat: 0 kr
Fremført tab: 15.000 kr (til næste år)
```

---

## ⚠️ Tabshåndtering - ISOLERET PULJE

### Grundregel

Tab på ASK kan **KUN** modregnes i **fremtidige gevinster på SAMME ASK**.

| Kan modregnes i | Kan IKKE modregnes i |
|-----------------|----------------------|
| ✅ Fremtidig ASK-gevinst (samme konto) | ❌ Aktieindkomst (frit depot) |
| | ❌ Kapitalindkomst |
| | ❌ Anden ASK-konto |
| | ❌ Ægtefælles ASK |

### ⚠️ KRITISK: Tab tabes ved lukning

```
ADVARSEL: Hvis du lukker din ASK, MISTER du fremført tab!

Fremført tab: 25.000 kr
Potentiel skattebesparelse: 25.000 × 17% = 4.250 kr

Hvis du lukker kontoen → 4.250 kr TABT!
```

### Ingen ægtefælleoverførsel

Tab på ASK kan **IKKE** overføres til ægtefælle.

---

## Beregningseksempler

### Eksempel 1: Første år med gevinst

```
År 1:
  Indskud: 100.000 kr
  Værdi 31/12: 115.000 kr
  
  Beskatningsgrundlag: 115.000 - 100.000 = 15.000 kr
  Skat: 15.000 × 17% = 2.550 kr
```

### Eksempel 2: År med tab efterfulgt af gevinst

```
År 1:
  Værdi 1/1: 100.000 kr
  Værdi 31/12: 80.000 kr
  
  Beskatningsgrundlag: -20.000 kr
  Skat: 0 kr
  Fremført tab: 20.000 kr

År 2:
  Værdi 1/1: 80.000 kr
  Værdi 31/12: 110.000 kr
  
  Årets gevinst: 30.000 kr
  Fremført tab: -20.000 kr
  Beskatningsgrundlag: 10.000 kr
  Skat: 10.000 × 17% = 1.700 kr
```

---

## Sammenligning: ASK vs. Frit Depot

| Aspekt | ASK | Frit Depot |
|--------|-----|------------|
| **Skattesats** | 17% | 27%/42% |
| **Princip** | Lager | Realisation/Lager |
| **Tab** | Isoleret | Tabsbank/Ægtefælle |
| **Indskudsgrænse** | 174.200 kr (2026) | Ingen |
| **Klassificering** | Ikke relevant | Aktie/Kapital |

### Hvornår er ASK bedst?

```
ASK er fordelagtigt når:
✅ Forventet afkast er positivt
✅ Du udnytter indskudsgrænsen
✅ Du investerer i aktier/ETF'er på positivlisten

ASK er IKKE fordelagtigt når:
❌ Du forventer tab (isoleret pulje)
❌ Du vil investere i obligationer/guld
❌ Din aktieindkomst er under progressionsgrænsen i frit depot
```

---

## Systemimplementering

### TypeScript

```typescript
interface ASKCalculation {
  accountId: string;
  year: number;
  
  // Værdier
  valueStartOfYear: number;
  valueEndOfYear: number;
  deposits: number;
  withdrawals: number;
  
  // Beregning
  grossReturn: number;  // valueEndOfYear - valueStartOfYear - deposits + withdrawals
  
  // Fremført tab
  carryForwardLossFromPrevYear: number;
  
  // Beskatningsgrundlag
  taxableAmount: number;  // max(0, grossReturn - carryForwardLossFromPrevYear)
  
  // Skat
  tax: number;  // taxableAmount × 0.17
  
  // Nyt fremført tab
  newCarryForwardLoss: number;  // Kun hvis grossReturn < 0
}

const ASK_TAX_RATE = 0.17;

function calculateASKTax(
  valueStart: number,
  valueEnd: number,
  deposits: number,
  withdrawals: number,
  carryForwardLoss: number
): ASKTaxResult {
  
  const grossReturn = valueEnd - valueStart - deposits + withdrawals;
  
  if (grossReturn <= 0) {
    return {
      tax: 0,
      taxableAmount: 0,
      newCarryForwardLoss: carryForwardLoss + Math.abs(grossReturn)
    };
  }
  
  const taxableAmount = Math.max(0, grossReturn - carryForwardLoss);
  const usedCarryForward = Math.min(grossReturn, carryForwardLoss);
  
  return {
    tax: taxableAmount * ASK_TAX_RATE,
    taxableAmount,
    usedCarryForward,
    newCarryForwardLoss: Math.max(0, carryForwardLoss - grossReturn)
  };
}
```

---

## Advarsler til brugeren

### Ved tab:

```
⚠️ TAB PÅ AKTIESPAREKONTO

Dit tab: 15.000 kr
Potentiel skatteværdi: 2.550 kr (17%)

VIGTIGT:
• Tabet kan KUN bruges på denne ASK
• Tabet kan IKKE overføres til ægtefælle
• Tabet MISTES hvis du lukker kontoen

Overvej at beholde kontoen åben indtil du har gevinst.
```

### Ved nær indskudsgrænse:

```
💰 INDSKUDSGRÆNSE

Dit nuværende indskud: 160.000 kr
Maksimalt indskud (2025): 166.200 kr
Resterende plads: 6.200 kr
```

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| SKAT ASK hovedside | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto | 02-02-2025 |
| Juridisk vejledning ASK | https://info.skat.dk/data.aspx?oid=2284955 | 02-02-2025 |
| SKM satser | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/aktiesparekontoloven | 02-02-2025 |
| Aktiesparekontoloven | https://danskelove.dk/aktiesparekontoloven | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
