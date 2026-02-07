# Børneopsparing

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **PBL § 51** | Børneopsparingskonti | https://danskelove.dk/pensionsbeskatningsloven/51 |
| **PBL § 51, stk. 5** | Udbetaling senest ved 21 år | https://danskelove.dk/pensionsbeskatningsloven/51 |

**Officiel SKAT-vejledning:**  
https://info.skat.dk/data.aspx?oid=2244445

---

## Skattemodel

| Parameter | Værdi |
|-----------|-------|
| **Skattesats** | **0%** (skattefri) |
| **PAL-skat** | Nej |
| **Skat ved udbetaling** | Nej |
| **Bindingsperiode** | Indtil barnet fylder 21 år |

---

## ⚠️ KRITISK: Udbetaling senest ved 21 år

Fra **PBL § 51, stk. 5**:

> "Indeståendet, herunder tilskrevne renter m.v., kan tidligst udbetales ved udløbet af en aftalt bindingsperiode på mindst 7 år og **skal senest udbetales, når kontohaveren fylder 21 år.**"

### Konsekvens

```
Børneopsparing SKAL udbetales senest når barnet fylder 21 år.

Eksempel:
  Barn født: 15. marts 2010
  Fylder 21: 15. marts 2031
  
  → Seneste udbetaling: 15. marts 2031
```

---

## Indskudsgrænser

| Parameter | Værdi |
|-----------|-------|
| **Årligt maksimum** | 6.000 kr |
| **Samlet maksimum** | 72.000 kr |
| **Hvem kan indbetale** | Forældre, bedsteforældre, andre |
| **Antal konti per barn** | Én |

---

## Hvad kan investeres i?

### ✅ Tilladt

| Aktivtype | Eksempler |
|-----------|-----------|
| Aktier | Alle noterede aktier |
| ETF'er | Alle typer (positivliste irrelevant) |
| Investeringsbeviser | Alle typer |
| Obligationer | Alle typer |
| Kontant | Bankindeståender |

### Positivlisten er IRRELEVANT

Da der er 0% skat, er det ligegyldigt om en ETF er på positivlisten eller ej.

```
Børneopsparing:
  ETF på positivliste → 0% skat
  ETF IKKE på positivliste → 0% skat

Frit depot:
  ETF på positivliste → 27%/42% aktieindkomst
  ETF IKKE på positivliste → ~37% kapitalindkomst
```

---

## Tab på børneopsparing

### Ingen skatterelevans

Da der er 0% skat, har tab ingen skattemæssig konsekvens:

| Situation | Frit Depot | Børneopsparing |
|-----------|------------|----------------|
| Tab 10.000 kr | Fradragsværdi ~2.700-4.200 kr | Ingen skatteeffekt |
| Gevinst 10.000 kr | Skat ~2.700-4.200 kr | Ingen skat |

---

## Beregningseksempel

### Eksempel: 18 års opsparing

```
Årlig indbetaling: 6.000 kr
Periode: 18 år (fra 0-18 år)
Samlet indbetalt: 6.000 × 18 = 108.000 kr (begrænset til 72.000 kr)

Faktisk indbetalt: 72.000 kr (over 12 år)
Antaget årligt afkast: 7%
Periode efter sidste indbetaling: 6 år

Slutværdi (ca.): 165.000 kr
Afkast: 93.000 kr
Skat: 0 kr

Hvis samme i frit depot (27% skat):
  Skat: 93.000 × 27% = 25.110 kr
  
Besparelse: 25.110 kr
```

---

## Systemimplementering

### TypeScript

```typescript
interface ChildSavingsAccount {
  accountId: string;
  childBirthDate: Date;
  
  // Indskud
  totalContributed: number;       // Max 72.000 kr
  yearlyContributions: Map<number, number>;  // Max 6.000 kr per år
  
  // Værdier
  currentValue: number;
  
  // Skatteberegning
  tax: 0;  // Altid 0
  
  // Udbetalingsdato
  mandatoryPayoutDate: Date;      // Barnets 21 års fødselsdag
}

function calculateChildSavingsTax(): 0 {
  return 0;  // Altid skattefri
}

function getMandatoryPayoutDate(birthDate: Date): Date {
  const payoutDate = new Date(birthDate);
  payoutDate.setFullYear(payoutDate.getFullYear() + 21);
  return payoutDate;
}

function validateContribution(
  existingTotal: number,
  yearContribution: number,
  newContribution: number
): ValidationResult {
  
  const MAX_YEARLY = 6000;
  const MAX_TOTAL = 72000;
  
  if (yearContribution + newContribution > MAX_YEARLY) {
    return {
      valid: false,
      error: `Årligt maksimum overskredet. Resterende plads i år: ${MAX_YEARLY - yearContribution} kr`
    };
  }
  
  if (existingTotal + newContribution > MAX_TOTAL) {
    return {
      valid: false,
      error: `Samlet maksimum overskredet. Resterende plads total: ${MAX_TOTAL - existingTotal} kr`
    };
  }
  
  return { valid: true };
}
```

---

## Advarsler til brugeren

### Ved oprettelse:

```
ℹ️ BØRNEOPSPARING

Skattefri opsparing til dit barn.

Regler:
• Maksimalt 6.000 kr per år
• Maksimalt 72.000 kr i alt
• SKAL udbetales senest ved barnets 21 års fødselsdag
• Kun én konto per barn
```

### Ved nærmer sig 21 år:

```
⚠️ OBLIGATORISK UDBETALING

Barnets fødselsdag: 15. marts 2031
Seneste udbetaling: 15. marts 2031 (om 6 år)

Husk at planlægge for udbetaling.
Kontoen SKAL være tom inden denne dato.
```

---

## Sammenligning: Børneopsparing vs. Andre konti

| Aspekt | Børneopsparing | ASK | Frit Depot |
|--------|----------------|-----|------------|
| **Skattesats** | 0% | 17% | 27-42% |
| **Indskudsgrænse** | 72.000 kr | 174.200 kr | Ingen |
| **Bindingsperiode** | Til 21 år | Ingen | Ingen |
| **Ejer** | Barnet | Dig | Dig |
| **Tab skattemæssigt** | Ingen effekt | Isoleret | Tabsbank |

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| PBL § 51 | https://danskelove.dk/pensionsbeskatningsloven/51 | 02-02-2025 |
| SKAT Juridisk Vejledning | https://info.skat.dk/data.aspx?oid=2244445 | 02-02-2025 |
| SKAT Børneopsparing | https://skat.dk/borger/pension-og-efterloen/boerneopsparing | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
