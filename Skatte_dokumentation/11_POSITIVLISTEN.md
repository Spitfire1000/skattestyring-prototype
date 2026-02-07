# Positivlisten (ABIS-listen)

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Lovgrundlag

| Paragraf | Indhold | URL |
|----------|---------|-----|
| **ABL § 19** | Definition af investeringsselskab | https://danskelove.dk/aktieavancebeskatningsloven/19 |
| **ABL § 19 B** | Aktiebaserede investeringsselskaber | https://danskelove.dk/aktieavancebeskatningsloven/19b |
| **ABL § 19 C** | Obligationsbaserede investeringsselskaber | https://danskelove.dk/aktieavancebeskatningsloven/19c |
| **BEK 1173** | Bekendtgørelse om ABIS | https://www.retsinformation.dk/eli/lta/2022/1173 |

---

## Hvad er positivlisten?

Positivlisten (officielt: ABIS-listen) er Skattestyrelsens liste over **aktiebaserede investeringsselskaber**.

ETF'er på denne liste beskattes som **aktieindkomst** (27%/42%) i stedet for **kapitalindkomst** (~37%).

---

## Officiel download

| Ressource | URL |
|-----------|-----|
| **Positivlisten (Excel)** | https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx |
| **SKAT side om positivlisten** | https://skat.dk/erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa |

---

## Skattemæssig konsekvens

| ETF-type | Indkomsttype | Skattesats | Beskatningsprincip |
|----------|--------------|------------|-------------------|
| **På positivlisten** | Aktieindkomst | 27%/42% | Lager |
| **IKKE på positivlisten** | Kapitalindkomst | ~37% | Lager |

### Eksempel på forskel

```
Gevinst på ETF: 50.000 kr

På positivlisten:
  Skat (27%): 13.500 kr

IKKE på positivlisten:
  Skat (~37%): 18.500 kr

Forskel: 5.000 kr
```

---

## Sådan tjekker du positivlisten

### Metode 1: ISIN-nummer

1. Find ETF'ens ISIN-nummer (fx IE00B4L5Y983)
2. Download Excel-filen fra skat.dk
3. Søg efter ISIN

### Metode 2: Fondsens navn

1. Søg i Excel-filen efter fondsens navn
2. Vær opmærksom på at navnet kan være lidt anderledes

### Metode 3: Mæglers information

Nordnet og Saxo angiver ofte om en ETF er på positivlisten.

---

## Populære ETF'er og deres status

### ✅ På positivlisten (aktieindkomst)

| ETF | ISIN | Udbyder |
|-----|------|---------|
| iShares Core MSCI World | IE00B4L5Y983 | BlackRock |
| iShares Core S&P 500 | IE00B5BMR087 | BlackRock |
| Xtrackers MSCI World | IE00BJ0KDQ92 | DWS |
| Vanguard FTSE All-World | IE00BK5BQT80 | Vanguard |
| iShares Core MSCI EM IMI | IE00BKM4GZ66 | BlackRock |

### ❌ IKKE på positivlisten (kapitalindkomst)

| ETF | ISIN | Årsag |
|-----|------|-------|
| iShares Physical Gold | IE00B4ND3602 | Guld, ikke aktier |
| iShares Core € Corp Bond | IE00B3F81R35 | Obligationer |
| Xtrackers II EUR Overnight Rate | LU0290358497 | Pengemarked |

---

## ⚠️ Vigtigt: Samme udbyder, forskellig status

En udbyder kan have fonde **både** på og udenfor positivlisten:

| iShares fond | På positivliste? |
|--------------|------------------|
| iShares Core MSCI World | ✅ Ja |
| iShares Physical Gold | ❌ Nej |
| iShares Core € Corp Bond | ❌ Nej |

**Tjek ALTID den specifikke fond!**

---

## Opdateringsfrekvens

| Tidspunkt | Handling |
|-----------|----------|
| **November/December** | Ny liste offentliggøres for næste år |
| **Løbende** | Fonde kan tilføjes/fjernes |

### Hvornår gælder en ændring?

- Fond tilføjet til listen: Gælder fra **tilføjelsesdatoen**
- Fond fjernet fra listen: Gælder fra **fjernelsesdatoen**

---

## KUN relevant for Frit Depot

Positivlisten er **kun relevant for Frit Depot**.

| Kontotype | Positivliste relevant? |
|-----------|------------------------|
| Frit Depot | ✅ Ja (bestemmer indkomsttype) |
| ASK | ❌ Nej (alt er 17%) |
| Pension | ❌ Nej (alt er 15,3%) |
| Børneopsparing | ❌ Nej (alt er 0%) |

---

## Systemimplementering

### Data-struktur

```typescript
interface PositiveListEntry {
  isin: string;
  name: string;
  validFrom: Date;
  validTo?: Date;  // undefined = stadig aktiv
}

// Eksempel på data
const positiveList: PositiveListEntry[] = [
  {
    isin: 'IE00B4L5Y983',
    name: 'iShares Core MSCI World UCITS ETF',
    validFrom: new Date('2019-01-01')
  },
  // ... flere fonde
];
```

### Opslagsfunktion

```typescript
function isOnPositiveList(
  isin: string, 
  date: Date = new Date()
): boolean {
  
  const entry = positiveList.find(e => e.isin === isin);
  
  if (!entry) return false;
  
  if (entry.validFrom > date) return false;
  if (entry.validTo && entry.validTo < date) return false;
  
  return true;
}

function classifyETF(
  isin: string,
  accountType: AccountType,
  date: Date = new Date()
): IncomeType {
  
  // Kun relevant for frit depot
  if (accountType !== 'FRIT_DEPOT') {
    return getDefaultIncomeType(accountType);
  }
  
  if (isOnPositiveList(isin, date)) {
    return 'AKTIEINDKOMST';
  } else {
    return 'KAPITALINDKOMST';
  }
}
```

### Årlig opdatering

```typescript
async function updatePositiveList(): Promise<void> {
  const url = 'https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx';
  
  // Download og parse Excel
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  // Parse med xlsx-bibliotek
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  // Gem i database
  await savePositiveListToDatabase(data);
}
```

---

## Advarsler til brugeren

### Ved køb af ETF ikke på positivliste:

```
⚠️ ETF IKKE PÅ POSITIVLISTEN

Denne ETF (iShares Physical Gold) er IKKE på SKATs positivliste.

Konsekvens:
• Beskattes som kapitalindkomst (~37%)
• I stedet for aktieindkomst (27%/42%)
• Tab har lavere fradragsværdi (~33% vs 27-42%)

Overvej om der findes en lignende ETF på positivlisten.
```

### Ved status-ændring:

```
ℹ️ ETF STATUS ÆNDRET

Denne ETF er blevet [tilføjet til/fjernet fra] positivlisten.

Ny status fra [dato]: [Aktieindkomst/Kapitalindkomst]

Dette påvirker beskatningen af fremtidige afkast.
```

---

## Kilder

| Kilde | URL | Verificeret |
|-------|-----|-------------|
| Positivlisten (Excel) | https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx | 02-02-2025 |
| SKAT side om positivlisten | https://skat.dk/erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa | 02-02-2025 |
| ABL § 19 B | https://danskelove.dk/aktieavancebeskatningsloven/19b | 02-02-2025 |
| ABL § 19 C | https://danskelove.dk/aktieavancebeskatningsloven/19c | 02-02-2025 |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
