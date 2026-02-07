# Tab på Kapitalindkomst

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PSL § 4** | Definition af kapitalindkomst | https://danskelove.dk/personskatteloven/4 |
| **PSL § 11** | Nedslag for negativ nettokapitalindkomst | https://danskelove.dk/personskatteloven/11 |
| **KGL § 14** | Tab på finansielle kontrakter | https://danskelove.dk/kursgevinstloven/14 |

---

## ⚠️ KRITISK FORSKEL: Ingen tabsbank

| Aktieindkomst | Kapitalindkomst |
|---------------|-----------------|
| Tab gemmes i tabsbank | ❌ **INGEN tabsbank** |
| Fremføres ubegrænset | Tab forbruges STRAKS |
| Venter på fremtidig gevinst | Reducerer årets samlede kapitalindkomst |
| Specifik modregning | Automatisk nettoberegning |

---

## Hvordan kapitalindkomst-tab håndteres

### Princip: Nettoberegning

Kapitalindkomst beregnes som **nettotal** af alle poster:

```
Nettokapitalindkomst = 
  + Renteindtægter
  + Kursgevinst obligationer
  + Gevinst ETF (ikke positivliste)
  + Gevinst finansielle kontrakter
  - Renteudgifter
  - Kurstab obligationer
  - Tab ETF (ikke positivliste)
  - Tab finansielle kontrakter
```

### Positiv netto → Skat
### Negativ netto → Fradrag (PSL § 11)

---

## Fradragsværdi ved negativt netto

### PSL § 11 - Kompensation

| Parameter | Værdi |
|-----------|-------|
| **Kompensationsprocent** | 8% |
| **Beløbsgrænse (enlig)** | 50.000 kr |
| **Beløbsgrænse (ægtepar)** | 100.000 kr |

### Samlet fradragsværdi

```
Under 50.000 kr:
  Fradragsværdi = (8% + ~25%) = ~33%

Over 50.000 kr:
  Første 50.000 kr: ~33%
  Overskydende: ~25% (kun kommuneskat)
```

---

## Finansielle kontrakter - Isoleret tabspulje

### ⚠️ SÆRREGEL: KGL § 14

Tab på finansielle kontrakter (CFD, optioner, futures) har en **isoleret tabspulje**:

| Tab fra | Kan modregnes i |
|---------|-----------------|
| Finansielle kontrakter | **KUN** gevinst på andre finansielle kontrakter |
| | ❌ IKKE almindelig kapitalindkomst |
| | ❌ IKKE renteindtægter |
| | ❌ IKKE ETF-gevinst |

### Fremførsel af tab på finansielle kontrakter

- Tab kan fremføres **ubegrænset**
- Men **KUN** mod fremtidige gevinster på finansielle kontrakter
- Meget begrænset anvendelse!

---

## Beregningseksempler

### Eksempel 1: Tab på ETF (ikke positivliste)

**Situation:**
- Tab på iShares Gold ETF: -30.000 kr
- Renteindtægter: +5.000 kr

**Beregning:**

```
Nettokapitalindkomst: -30.000 + 5.000 = -25.000 kr

Fradragsværdi:
  PSL § 11 (8%): 25.000 × 0,08 = 2.000 kr
  Kommuneskat (~25%): 25.000 × 0,25 = 6.250 kr
  Total: 8.250 kr (~33%)

VIGTIGT: Tabet er nu FORBRUGT.
Der er INGEN tabsbank - intet fremføres til næste år.
```

### Eksempel 2: Tab på finansielle kontrakter

**Situation:**
- Tab på CFD: -50.000 kr
- Renteindtægter: +10.000 kr
- Ingen gevinst på andre finansielle kontrakter

**Beregning:**

```
Finansielle kontrakter:
  Tab: -50.000 kr
  Gevinst: 0 kr
  → Netto: -50.000 kr
  → HELE tabet fremføres (isoleret pulje)

Øvrig kapitalindkomst:
  Renteindtægter: +10.000 kr
  → Beskattes normalt

NB: CFD-tabet kan IKKE modregnes i renteindtægterne!
```

### Eksempel 3: Blandet situation

**Situation:**
- Renteindtægter: +8.000 kr
- Tab på ETF (ikke positivliste): -20.000 kr
- Gevinst på CFD: +15.000 kr
- Tab på anden CFD: -25.000 kr

**Beregning:**

```
Almindelig kapitalindkomst:
  Renter: +8.000 kr
  ETF-tab: -20.000 kr
  Netto: -12.000 kr → Fradrag via PSL § 11

Finansielle kontrakter (isoleret):
  Gevinst: +15.000 kr
  Tab: -25.000 kr
  Netto: -10.000 kr → Fremføres til næste år

Total fradragsværdi (kun almindelig kapital):
  12.000 × 33% = 3.960 kr
```

---

## Systemimplementering

### TypeScript interfaces

```typescript
interface CapitalIncomeTaxCalculation {
  year: number;
  
  // Almindelig kapitalindkomst (nettoberegning)
  regularCapitalIncome: {
    interestIncome: number;
    bondGains: number;
    etfGains: number;      // ETF ikke på positivliste
    interestExpenses: number;
    bondLosses: number;
    etfLosses: number;
    net: number;
  };
  
  // Finansielle kontrakter (isoleret)
  financialContracts: {
    gains: number;
    losses: number;
    net: number;
    carryForwardLoss: number;  // Kun denne har fremførsel
  };
  
  // Beregnet skat/fradrag
  regularCapitalTax: number;      // Positiv = skat, negativ = fradrag
  financialContractTax: number;   // Positiv = skat, 0 hvis tab
  
  // INGEN generel tabsbank for kapitalindkomst
  generalCarryForward: 0;  // Altid 0
}
```

### Beregningsfunktion

```typescript
function calculateCapitalIncomeTax(
  regularIncome: number,
  financialContractNet: number,
  prevFinContractLoss: number,
  isMarried: boolean
): CapitalIncomeTaxResult {
  
  const psl11Threshold = isMarried ? 100000 : 50000;
  const psl11Rate = 0.08;
  const municipalRate = 0.25;
  
  // Finansielle kontrakter (isoleret)
  let finContractTax = 0;
  let finContractCarryForward = 0;
  
  if (financialContractNet > 0) {
    // Brug fremført tab først
    const taxableNet = Math.max(0, financialContractNet - prevFinContractLoss);
    finContractTax = taxableNet * 0.37; // Cirka
  } else if (financialContractNet < 0) {
    // Tab fremføres (isoleret pulje)
    finContractCarryForward = Math.abs(financialContractNet) + prevFinContractLoss;
  }
  
  // Almindelig kapitalindkomst
  let regularTax = 0;
  let regularDeduction = 0;
  
  if (regularIncome > 0) {
    regularTax = regularIncome * 0.37; // Cirka
  } else if (regularIncome < 0) {
    const absLoss = Math.abs(regularIncome);
    const psl11Eligible = Math.min(absLoss, psl11Threshold);
    regularDeduction = psl11Eligible * psl11Rate + absLoss * municipalRate;
  }
  
  return {
    regularCapitalTax: regularIncome > 0 ? regularTax : -regularDeduction,
    financialContractTax: finContractTax,
    financialContractCarryForward: finContractCarryForward,
    generalCarryForward: 0  // ALTID 0
  };
}
```

---

## Advarsler til brugeren

### Ved tab på ETF (ikke positivliste):

```
ℹ️ TAB PÅ KAPITALINDKOMST

Dit tab på denne ETF er kapitalindkomst og håndteres anderledes end aktietab:

Tab: 30.000 kr
Fradragsværdi (ca. 33%): 9.900 kr

⚠️ VIGTIGT: Dette tab gemmes IKKE i en tabsbank.
Fradragsværdien beregnes NU og kan ikke fremføres.
```

### Ved tab på finansielle kontrakter:

```
⚠️ ISOLERET TAB - FINANSIELLE KONTRAKTER

Dit tab på CFD/optioner kan KUN modregnes i gevinst
på andre finansielle kontrakter.

Tab: 25.000 kr
Årets CFD-gevinst: 0 kr
→ Hele tabet fremføres til næste år

NB: Tabet kan IKKE bruges mod:
❌ Renteindtægter
❌ Obligationsgevinst
❌ ETF-gevinst
❌ Aktiegevinst
```

---

## Sammenligning: Aktie- vs. Kapitalindkomst tab

| Aspekt | Aktieindkomst (noteret) | Kapitalindkomst |
|--------|-------------------------|-----------------|
| **Tabsbank** | Ja | Nej (undtagen fin. kontrakter) |
| **Fremførsel** | Ubegrænset | Nej (forbruges straks) |
| **Fradragsværdi** | 27% / 42% | ~33% |
| **Symmetrisk** | Ja | Nej (asymmetrisk) |
| **Ægtefælle** | Obligatorisk overførsel | Automatisk via sambeskatning |

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| PSL § 11 | https://danskelove.dk/personskatteloven/11 | 02-02-2025 |
| KGL § 14 (fin. kontrakter) | https://danskelove.dk/kursgevinstloven/14 | 02-02-2025 |
| SKAT Juridisk Vejledning | https://info.skat.dk/data.aspx?oid=2047228 | 02-02-2025 |
| SKM satser PSL | https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
