# Kapitalindkomst

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PSL § 4** | Definition af kapitalindkomst | https://danskelove.dk/personskatteloven/4 |
| **PSL § 11** | Nedslag for negativ nettokapitalindkomst | https://danskelove.dk/personskatteloven/11 |
| **ABL § 19 C** | Obligationsbaserede investeringsselskaber | https://danskelove.dk/aktieavancebeskatningsloven/19c |
| **KGL § 29-33** | Finansielle kontrakter | https://danskelove.dk/kursgevinstloven |

**Officiel kilde for satser:**  
https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven

---

## Hvad er kapitalindkomst?

Kapitalindkomst omfatter (udtømmende liste i PSL § 4):

| Type | Eksempler | Beskatningsprincip |
|------|-----------|-------------------|
| **Renter** | Bankrente, obligationsrente | Løbende |
| **ETF IKKE på positivliste** | Obligationsbaserede ETF'er | Lager |
| **Finansielle kontrakter** | CFD, optioner, futures | Lager |
| **Kursgevinst obligationer** | Realkreditobligationer | Realisation |

---

## ⚠️ KRITISK: Asymmetrisk beskatning

Kapitalindkomst er **ASYMMETRISK** - gevinst og tab behandles forskelligt:

| Situation | Skattesats | Beregning |
|-----------|------------|-----------|
| **Positiv kapitalindkomst** | ~37-42% | Indgår i bundskat + evt. mellemskat |
| **Negativ kapitalindkomst** | ~33% fradrag | PSL § 11 nedslag + kommuneskat |

### PSL § 11 - Kompensation for negativ kapitalindkomst

Fra **skm.dk** (verificeret 02-02-2025):

| Parameter | 2025 | 2026 |
|-----------|------|------|
| **Kompensationsprocent** | 8% | 8% |
| **Beløbsgrænse (enlig)** | 50.000 kr | 50.000 kr |
| **Beløbsgrænse (ægtepar)** | 100.000 kr | 100.000 kr |

### Beregning af fradragsværdi

```
Total fradragsværdi = Kommuneskat (~25%) + PSL § 11 nedslag (8%)
                    = ca. 33%

For negativ kapitalindkomst over 50.000 kr:
Kun kommuneskat (~25%) gælder for overskydende beløb
```

---

## ⚠️ KRITISK: INGEN Tabsbank for kapitalindkomst

**VIGTIGT:** Tab på kapitalindkomst håndteres ANDERLEDES end aktieindkomst:

| Aktieindkomst | Kapitalindkomst |
|---------------|-----------------|
| Tab gemmes i tabsbank | ❌ INGEN tabsbank |
| Fremføres ubegrænset | Tab modregnes STRAKS |
| Kan ikke bruges før gevinst | Reducerer samlet kapitalindkomst |
| Ægtefælleoverførsel mulig | Automatisk via sambeskatning |

### Korrekt systemhåndtering

```typescript
// FORKERT - Kapitalindkomst har IKKE tabsbank
if (incomeType === 'KAPITALINDKOMST' && amount < 0) {
  taxLossBank.add(amount); // ❌ FORKERT!
}

// KORREKT - Modregnes straks i årets kapitalindkomst
if (incomeType === 'KAPITALINDKOMST') {
  netCapitalIncome += amount; // Positiv eller negativ
  // Hvis netCapitalIncome er negativ → PSL § 11 fradrag
}
```

---

## Beregningseksempel

### Eksempel 1: Negativ kapitalindkomst (tab på ETF ikke på positivliste)

**Situation:**
- Tab på ETF (ikke positivliste): -17.370 kr
- Ingen anden kapitalindkomst i året

**Beregning:**

```
Negativ nettokapitalindkomst: -17.370 kr

Da beløbet er under 50.000 kr:
- PSL § 11 nedslag: 17.370 × 8% = 1.390 kr
- Kommuneskat-fradrag: 17.370 × 25% = 4.343 kr
- Total skatteværdi af tab: ca. 5.733 kr (33%)

NB: Tabet er FORBRUGT - ingen fremførsel til næste år!
```

### Eksempel 2: Blandet kapitalindkomst

**Situation:**
- Renteindtægter: +10.000 kr
- Tab på CFD: -25.000 kr
- Netto: -15.000 kr

**Beregning:**

```
Negativ nettokapitalindkomst: -15.000 kr

Fradragsværdi:
- PSL § 11 nedslag: 15.000 × 8% = 1.200 kr
- Kommuneskat-fradrag: 15.000 × 25% = 3.750 kr
- Total: 4.950 kr (33%)
```

---

## Hvad beskattes som kapitalindkomst i Frit Depot?

| Aktivtype | Indkomsttype | Bemærkning |
|-----------|--------------|------------|
| ETF **IKKE** på positivliste | Kapitalindkomst | Tjek ABIS-listen |
| Finansielle kontrakter | Kapitalindkomst | CFD, optioner, futures |
| Obligationer | Kapitalindkomst | Renter + kursgevinst |
| Crowdlending | Kapitalindkomst | Renter |

---

## Systemimplementering

### TypeScript interface

```typescript
interface CapitalIncomeCalculation {
  year: number;
  
  // Årets bevægelser
  gains: number;           // Positive beløb
  losses: number;          // Negative beløb (som negativt tal)
  
  // Beregnet
  netCapitalIncome: number; // gains + losses
  
  // PSL § 11 beregning (kun ved negativ)
  psl11Threshold: number;   // 50.000 kr (100.000 for ægtepar)
  psl11Rate: number;        // 0.08
  psl11Deduction: number;   // Nedslaget i skat
  
  // Kommuneskat fradrag
  municipalTaxRate: number; // ~0.25
  municipalDeduction: number;
  
  // Total
  totalTaxBenefit: number;  // Ved negativ kapitalindkomst
  totalTax: number;         // Ved positiv kapitalindkomst
  
  // VIGTIGT: Ingen tabsbank!
  carryForwardLoss: 0;      // Altid 0 for kapitalindkomst
}
```

### Beregningsfunktion

```typescript
function calculateCapitalIncomeTax(
  netCapitalIncome: number,
  isMarried: boolean,
  year: 2025 | 2026
): CapitalIncomeResult {
  
  const threshold = isMarried ? 100000 : 50000;
  const psl11Rate = 0.08;
  const municipalRate = 0.25; // Gennemsnit
  
  if (netCapitalIncome >= 0) {
    // Positiv kapitalindkomst - beskattes via bundskat/mellemskat
    return {
      netCapitalIncome,
      taxType: 'POSITIVE',
      // Beregning afhænger af samlet indkomst
      estimatedTaxRate: 0.37, // Cirka
      carryForwardLoss: 0
    };
  }
  
  // Negativ kapitalindkomst
  const absLoss = Math.abs(netCapitalIncome);
  const psl11Eligible = Math.min(absLoss, threshold);
  const psl11Deduction = psl11Eligible * psl11Rate;
  const municipalDeduction = absLoss * municipalRate;
  
  return {
    netCapitalIncome,
    taxType: 'NEGATIVE',
    psl11Deduction,
    municipalDeduction,
    totalTaxBenefit: psl11Deduction + municipalDeduction,
    effectiveDeductionRate: (psl11Deduction + municipalDeduction) / absLoss,
    carryForwardLoss: 0 // ALTID 0 - ingen fremførsel!
  };
}
```

---

## Advarsler til brugeren

### Vis altid ved kapitalindkomst-tab:

```
⚠️ ASYMMETRISK BESKATNING

Dit tab på kapitalindkomst giver et fradrag på ca. 33%.
Hvis du havde haft en tilsvarende gevinst, ville skatten være ca. 37-42%.

Du får altså IKKE fuld skatteværdi af dit tab.

Tab: 17.370 kr
Fradragsværdi: ca. 5.733 kr (33%)
Hvis det var gevinst: ca. 6.427 kr skat (37%)
"Tabt" skatteværdi: ca. 694 kr
```

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| PSL § 11 satser | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven | 02-02-2025 |
| SKAT vejledning negativ kapitalindkomst | https://info.skat.dk/data.aspx?oid=2047228 | 02-02-2025 |
| PSL § 11 lovtekst | https://danskelove.dk/personskatteloven/11 | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
