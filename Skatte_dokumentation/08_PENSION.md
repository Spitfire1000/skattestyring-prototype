# Pensionskonti

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PBL** | Pensionsbeskatningsloven | https://danskelove.dk/pensionsbeskatningsloven |
| **PAL** | Pensionsafkastbeskatningsloven | https://danskelove.dk/pensionsafkastbeskatningsloven |
| **PAL § 2** | PAL-skattesatsen (15,3%) | https://danskelove.dk/pensionsafkastbeskatningsloven/2 |
| **PBL § 16** | Beløbsgrænser | https://danskelove.dk/pensionsbeskatningsloven/16 |

**Officiel SKAT-vejledning:**  
https://skat.dk/borger/pension-og-efterloen

---

## Pensionstyper - Oversigt

| Type | Fradrag | Skat ved udbetaling | Max indskud 2025 | Max indskud 2026 |
|------|---------|---------------------|------------------|------------------|
| **Ratepension** | Ja | Personlig indkomst | 65.500 kr | 68.700 kr |
| **Aldersopsparing** | Nej | Skattefri | 9.400 kr* | 9.900 kr* |
| **Kapitalpension** | Ja | 40% afgift | Lukket | Lukket |
| **Livrente (privat)** | Ja | Personlig indkomst | 60.300 kr | 63.200 kr |
| **Livrente (arbejdsgiver)** | Bortseelsesret | Personlig indkomst | Ingen grænse | Ingen grænse |

*Aldersopsparing: Forhøjet grænse (61.200 kr / 64.200 kr) hvis ≤7 år til folkepension.

---

## PAL-skat (Pensionsafkastbeskatning)

### Fælles for alle pensionstyper

| Parameter | Værdi |
|-----------|-------|
| **Skattesats** | 15,3% |
| **Princip** | Lagerbeskatning |
| **Beregning** | Værdi 31/12 - Værdi 1/1 |
| **Tab** | Isoleret pulje per konto |

### Beregning

```
PAL-skat = (Værdi ultimo - Værdi primo) × 15,3%

Ved negativt afkast:
  Negativ skat fremføres til modregning i fremtidige års skat
```

---

## 1. Ratepension

### Karakteristika

| Aspekt | Værdi |
|--------|-------|
| **Fradrag ved indbetaling** | Ja (personlig indkomst) |
| **Skat ved udbetaling** | Personlig indkomst (~37-52%) |
| **Udbetalingsperiode** | 10-30 år |
| **Tidligste udbetaling** | 5 år før folkepension |

### Indskudsgrænser

| År | Maksimalt fradrag |
|----|-------------------|
| 2025 | 65.500 kr |
| 2026 | 68.700 kr |

### Eksempel

```
Indbetaling: 50.000 kr
Marginalskatteprocent: 52%
Skattebesparelse NU: 50.000 × 52% = 26.000 kr

Ved udbetaling om 20 år:
  Antaget marginalskatteprocent: 40%
  Skat: 50.000 × 40% = 20.000 kr
  
  Nettofordel: 6.000 kr + afkast
```

---

## 2. Aldersopsparing

### Karakteristika

| Aspekt | Værdi |
|--------|-------|
| **Fradrag ved indbetaling** | Nej |
| **Skat ved udbetaling** | Skattefri |
| **Fordelere** | Påvirker ikke modregning i offentlige ydelser |

### Indskudsgrænser

| Situation | 2025 | 2026 |
|-----------|------|------|
| Standard | 9.400 kr | 9.900 kr |
| ≤7 år til folkepension | 61.200 kr | 64.200 kr |

### Fordele

```
Aldersopsparing er fordelagtig fordi:
✅ Udbetaling er skattefri
✅ Påvirker IKKE folkepension, boligstøtte, etc.
✅ PAL-skat (15,3%) er lavere end aktieindkomst (27-42%)
```

---

## 3. Kapitalpension (lukket)

### Karakteristika

| Aspekt | Værdi |
|--------|-------|
| **Status** | Lukket for nye indskud siden 2013 |
| **Eksisterende ordninger** | Kan fortsat bestå |
| **Skat ved udbetaling** | 40% afgift |

---

## 4. Livrente

### Karakteristika

| Aspekt | Privat | Arbejdsgiver |
|--------|--------|--------------|
| **Fradrag** | Ja (opfyldningsfradrag) | Bortseelsesret |
| **Skat ved udbetaling** | Personlig indkomst | Personlig indkomst |
| **Indskudsgrænse** | 60.300 kr (2025) | Ingen grænse |
| **Udbetalingsperiode** | Livsvarig | Livsvarig |

---

## Tabshåndtering - ISOLERET PULJE

### Grundregel

Tab (negativ PAL-skat) kan **KUN** modregnes i **fremtidige positive afkast på SAMME pensionskonto**.

| Kan modregnes i | Kan IKKE modregnes i |
|-----------------|----------------------|
| ✅ Fremtidig positiv PAL på samme konto | ❌ Anden pensionskonto |
| | ❌ Aktieindkomst |
| | ❌ Kapitalindkomst |
| | ❌ Ægtefælles pension |

### Ingen ægtefælleoverførsel

Tab på pension kan **IKKE** overføres til ægtefælle.

---

## Beregningseksempler

### Eksempel 1: Ratepension med positivt afkast

```
Værdi 1. januar: 500.000 kr
Indbetaling: 50.000 kr
Værdi 31. december: 600.000 kr

Afkast: 600.000 - 500.000 - 50.000 = 50.000 kr
PAL-skat: 50.000 × 15,3% = 7.650 kr
```

### Eksempel 2: Pension med negativt afkast

```
År 1:
  Værdi 1/1: 500.000 kr
  Værdi 31/12: 450.000 kr
  
  Afkast: -50.000 kr
  PAL-skat: 0 kr
  Fremført negativ skat: 50.000 × 15,3% = 7.650 kr

År 2:
  Værdi 1/1: 450.000 kr
  Værdi 31/12: 520.000 kr
  
  Afkast: 70.000 kr
  Beregnet PAL-skat: 70.000 × 15,3% = 10.710 kr
  Modregning af fremført: -7.650 kr
  PAL-skat at betale: 3.060 kr
```

---

## Systemimplementering

### TypeScript

```typescript
type PensionType = 
  | 'RATEPENSION' 
  | 'ALDERSOPSPARING' 
  | 'KAPITALPENSION' 
  | 'LIVRENTE';

interface PensionCalculation {
  accountId: string;
  pensionType: PensionType;
  year: number;
  
  // Værdier
  valueStartOfYear: number;
  valueEndOfYear: number;
  contributions: number;
  withdrawals: number;
  
  // Afkast
  grossReturn: number;
  
  // Fremført negativ skat
  carryForwardNegativeTax: number;
  
  // PAL-beregning
  grossPALTax: number;           // grossReturn × 15,3%
  usedCarryForward: number;
  netPALTax: number;             // Faktisk skat at betale
  newCarryForwardNegativeTax: number;
}

const PAL_TAX_RATE = 0.153;

function calculatePALTax(
  grossReturn: number,
  carryForwardNegativeTax: number
): PALTaxResult {
  
  if (grossReturn <= 0) {
    return {
      tax: 0,
      newCarryForward: carryForwardNegativeTax + Math.abs(grossReturn) * PAL_TAX_RATE
    };
  }
  
  const grossTax = grossReturn * PAL_TAX_RATE;
  const usedCarryForward = Math.min(grossTax, carryForwardNegativeTax);
  
  return {
    tax: grossTax - usedCarryForward,
    usedCarryForward,
    newCarryForward: Math.max(0, carryForwardNegativeTax - grossTax)
  };
}
```

---

## Sammenligning af pensionstyper

| Aspekt | Ratepension | Aldersopsparing | Livrente |
|--------|-------------|-----------------|----------|
| **Fradrag nu** | ✅ Ja | ❌ Nej | ✅ Ja |
| **Skat ved udbetaling** | ~37-52% | 0% | ~37-52% |
| **Påvirker ydelser** | Ja | Nej | Ja |
| **Udbetalingsperiode** | 10-30 år | Valgfri | Livsvarig |
| **Typisk målgruppe** | Høj marginalskatteprocent nu | Lav skat nu, vil undgå modregning | Ønsker livsvarig udbetaling |

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| SKAT PAL-skat | https://skat.dk/borger/pension-og-efterloen/skat-af-pensionsafkast | 02-02-2025 |
| SKAT Ratepension | https://skat.dk/borger/pension-og-efterloen/ratepension | 02-02-2025 |
| SKAT Aldersopsparing | https://skat.dk/borger/pension-og-efterloen/aldersopsparing-og-aldersforsikring | 02-02-2025 |
| SKM satser PBL | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/pensionsbeskatningsloven | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
