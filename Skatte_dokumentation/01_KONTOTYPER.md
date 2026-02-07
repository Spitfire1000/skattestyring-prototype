# Kontotyper

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Oversigt

| Kontotype | Skattesats | Princip | Klassificering? |
|-----------|------------|---------|-----------------|
| **FRIT_DEPOT** | 27%/42% eller ~37% | Realisation/Lager | ✅ Ja |
| **ASK** | 17% flat | Lager | ❌ Nej |
| **BOERNEOPSPARING** | 0% | Skattefri | ❌ Nej |
| **RATEPENSION** | 15,3% PAL | Lager | ❌ Nej |
| **ALDERSOPSPARING** | 15,3% PAL | Lager | ❌ Nej |
| **KAPITALPENSION** | 15,3% PAL | Lager | ❌ Nej |
| **LIVRENTE** | 15,3% PAL | Lager | ❌ Nej |

---

## 1. Frit Depot (Almindelig investeringskonto)

### Lovgrundlag
- **PSL § 4 a** - Aktieindkomst
- **PSL § 4** - Kapitalindkomst
- **ABL** - Aktieavancebeskatningsloven

### Skattemodel
Beskatning afhænger af **aktivtype**:

| Aktivtype | Indkomsttype | Skattesats |
|-----------|--------------|------------|
| Aktier | Aktieindkomst | 27%/42% |
| ETF positivliste | Aktieindkomst | 27%/42% |
| ETF IKKE positivliste | Kapitalindkomst | ~37% |
| Investeringsforeninger | Aktieindkomst | 27%/42% |

### Tabshåndtering
- Se [05_TAB_AKTIEINDKOMST.md](05_TAB_AKTIEINDKOMST.md)
- Se [06_TAB_KAPITALINDKOMST.md](06_TAB_KAPITALINDKOMST.md)

---

## 2. ASK - Aktiesparekonto

### Lovgrundlag
- **ASKL** - Aktiesparekontoloven
- https://danskelove.dk/aktiesparekontoloven

### Skattemodel
- **17% flat** af årets afkast
- **Lagerbeskatning** - beskattes uanset om der er solgt
- **Isoleret tabspulje** - tab kun på samme konto

### Indskudsgrænser

| År | Maksimalt indskud |
|----|-------------------|
| 2025 | 166.200 kr |
| 2026 | 174.200 kr |

### Tab
- Fremføres på **samme ASK**
- ⚠️ **TABES** hvis kontoen lukkes
- Kan **IKKE** overføres til ægtefælle

Se [07_ASK.md](07_ASK.md) for detaljer.

---

## 3. Børneopsparing

### Lovgrundlag
- **PBL § 51** - Pensionsbeskatningsloven

### Skattemodel
- **0% skat** i hele bindingsperioden
- Afkast er skattefrit

### Vigtige begrænsninger
- Udbetales senest ved **21 år**
- Maksimalt indskud: 6.000 kr/år (72.000 kr total)
- Kun én konto per barn

Se [09_BOERNEOPSPARING.md](09_BOERNEOPSPARING.md) for detaljer.

---

## 4. Pensionskonti

### Typer

| Type | Fradrag ved indbetaling | Skat ved udbetaling |
|------|-------------------------|---------------------|
| **Ratepension** | Ja | Personlig indkomst |
| **Aldersopsparing** | Nej | Skattefri |
| **Kapitalpension** | Ja (lukket for nye) | Personlig indkomst |
| **Livrente** | Ja | Personlig indkomst |

### Fælles for alle pensioner

- **15,3% PAL-skat** på afkast
- **Lagerbeskatning**
- **Isoleret tabspulje** per konto

Se [08_PENSION.md](08_PENSION.md) for detaljer.

---

## Skatteflow per kontotype

### Frit Depot

```
FRIT_DEPOT
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING ← Aktie- eller kapitalindkomst
    ↓
SKATTEBEREGNING (27%/42% eller ~37%)
    ↓
TAB/FRADRAG (tabsbank eller øjeblikkelig)
```

### ASK, Pension, Børneopsparing

```
ASK / PENSION / BØRNEOPSPARING
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER
    ↓
SKATTEBEREGNING (fast sats: 17% / 15,3% / 0%)
    ↓
TAB/FRADRAG (isoleret eller ingen)
```

---

## TypeScript

```typescript
export type AccountType = 
  | 'FRIT_DEPOT' 
  | 'ASK' 
  | 'BOERNEOPSPARING' 
  | 'RATEPENSION' 
  | 'ALDERSOPSPARING' 
  | 'KAPITALPENSION' 
  | 'LIVRENTE';

export const ACCOUNT_TAX_RATES = {
  FRIT_DEPOT: { type: 'VARIABLE', rates: [0.27, 0.42, 0.37] },
  ASK: { type: 'FLAT', rate: 0.17 },
  BOERNEOPSPARING: { type: 'FLAT', rate: 0 },
  RATEPENSION: { type: 'FLAT', rate: 0.153 },
  ALDERSOPSPARING: { type: 'FLAT', rate: 0.153 },
  KAPITALPENSION: { type: 'FLAT', rate: 0.153 },
  LIVRENTE: { type: 'FLAT', rate: 0.153 }
} as const;

export function requiresClassification(accountType: AccountType): boolean {
  return accountType === 'FRIT_DEPOT';
}
```

---

## Kilder

| Kilde | URL |
|-------|-----|
| SKAT Aktiesparekonto | https://skat.dk/borger/aktier-og-andre-vaerdipapirer/aktiesparekonto |
| SKAT Pension | https://skat.dk/borger/pension-og-efterloen |
| Aktiesparekontoloven | https://danskelove.dk/aktiesparekontoloven |
| Pensionsbeskatningsloven | https://danskelove.dk/pensionsbeskatningsloven |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
