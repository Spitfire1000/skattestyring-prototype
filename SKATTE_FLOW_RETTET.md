# Skatte-Flow Struktur - Rettet Version

**Version:** 2.0  
**Dato:** 2. februar 2025  
**Status:** Klar til implementering

---

## Grundprincip

Flowet er bygget op i 5 trin, men ikke alle trin er relevante for alle kontotyper:

```
TRIN 1: KONTOTYPE      → Bestemmer HVILKEN skattemodel der bruges
TRIN 2: AKTIVTYPE      → Bestemmer beskatningsmetode (realisation/lager)
TRIN 3: KLASSIFICERING → KUN relevant for Frit Depot
TRIN 4: SKATTEBEREGNING → Beregner skat baseret på kontotype
TRIN 5: TAB/FRADRAG    → Hvilken pulje tab havner i
```

---

## Skattesatser (DYNAMISK - baseret på år)

### Progressionsgrænser

| År | Enlig | Ægtefæller | Kilde |
|----|-------|------------|-------|
| **2025** | 67.500 kr | 135.000 kr | PSL § 8a |
| **2026** | 79.400 kr | 158.800 kr | PSL § 8a |

### Faste satser

| Kontotype | Sats | Princip |
|-----------|------|---------|
| Frit Depot (aktieindkomst lav) | 27% | Progressiv |
| Frit Depot (aktieindkomst høj) | 42% | Progressiv |
| Frit Depot (kapitalindkomst) | ~37-42% | Asymmetrisk |
| ASK | 17% | Flat, lager |
| Pension (alle typer) | 15,3% | PAL, lager |
| Børneopsparing | 0% | Skattefri |

---

## Kontotype-Flows

### 1. FRIT DEPOT (27%/42% eller ~37%)

```
FRIT DEPOT
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING ← Her bestemmes om det er aktie- eller kapitalindkomst
    ├── Aktier (DK + udenlandske) ──────────→ AKTIEINDKOMST (27%/42%)
    ├── ETF positivliste ───────────────────→ AKTIEINDKOMST (27%/42%)
    ├── Inv.forening udbyttebetalende ──────→ AKTIEINDKOMST (27%/42%)
    ├── Inv.forening akkumulerende ─────────→ AKTIEINDKOMST (27%/42%)
    └── ETF IKKE-positivliste ──────────────→ KAPITALINDKOMST (~37%)
    ↓
SKATTEBEREGNING
    ├── Aktieindkomst:
    │   ├── Op til progressionsgrænse: 27%
    │   └── Over progressionsgrænse: 42%
    │
    └── Kapitalindkomst:
        ├── Gevinst: ~37-42% (afhænger af samlet indkomst)
        └── ⚠️ ADVARSEL: Tab har LAVERE fradragsværdi (~25-33%)
    ↓
TAB/FRADRAG
    ├── Noterede aktier ────→ Pulje: NOTERET_AKTIE
    │   └── ⚠️ Ægtefælleoverførsel er OBLIGATORISK
    ├── Unoterede aktier ───→ Pulje: UNOTERET_AKTIE (fuldt fradrag)
    ├── ETF positivliste ───→ Pulje: NOTERET_AKTIE
    ├── Inv.foreninger ─────→ Pulje: NOTERET_AKTIE
    └── Kapital (ETF ikke-pos.) → Pulje: KAPITAL_GENEREL
```

**Nøglepunkt:** For Frit Depot er KLASSIFICERING vigtig - den afgør skattesatsen.

---

### 2. ASK - Aktiesparekonto (17%)

```
ASK
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER (irrelevant)
    ↓
SKATTEBEREGNING → 17% FLAT på ALT (uanset aktivtype)
    ↓
TAB/FRADRAG → Pulje: ASK_ISOLERET
    ├── Tab KUN på samme ASK-konto
    └── ⚠️ Tab TABES hvis kontoen lukkes!
```

**Nøglepunkt:** ASK har sin egen flade sats på 17%. Det er ligegyldigt om du køber aktier, ETF'er eller inv.foreninger - alt beskattes med 17% lagerbeskatning.

---

### 3. BØRNEOPSPARING (0%)

```
BØRNEOPSPARING
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER (irrelevant)
    ↓
SKATTEBEREGNING → 0% SKATTEFRI på ALT
    ↓
TAB/FRADRAG → Ikke relevant (ingen skat = ingen fradrag)
```

**Nøglepunkt:** Børneopsparing er fuldstændig skattefri. Klassificering er meningsløs.

---

### 4. PENSION (Ratepension, Aldersopsparing, Livrente, Kapitalpension) (15,3%)

```
PENSION
    ↓
AKTIVTYPE (vælges)
    ↓
KLASSIFICERING → SPRINGES OVER (irrelevant)
    ↓
SKATTEBEREGNING → 15,3% PAL på ALT (uanset aktivtype)
    ↓
TAB/FRADRAG → Pulje: PENSION_ISOLERET
    ├── Tab KUN på samme pensionskonto
    └── Kan IKKE bruges på andre pensioner
```

**Nøglepunkt:** Alle pensionstyper har samme 15,3% PAL-skat. Klassificering er irrelevant.

---

## Klassificeringsmatrix (KUN for Frit Depot)

| Aktivtype | Indkomsttype | Beskatningsprincip | Skattesats |
|-----------|--------------|-------------------|------------|
| Aktie (DK, noteret) | Aktieindkomst | Realisation | 27%/42% |
| Aktie (udenlandsk, noteret) | Aktieindkomst | Realisation | 27%/42% |
| Aktie (unoteret) | Aktieindkomst | Realisation | 27%/42% |
| ETF på positivliste | Aktieindkomst | **Lager** | 27%/42% |
| ETF IKKE på positivliste | **Kapitalindkomst** | **Lager** | ~37% |
| Inv.forening (udbyttebetalende) | Aktieindkomst | Realisation | 27%/42% |
| Inv.forening (akkumulerende) | Aktieindkomst | **Lager** | 27%/42% |

---

## Tabspuljer - Detaljeret

### For Frit Depot

| Tab fra | Pulje | Kan bruges mod | Ægtefælle |
|---------|-------|----------------|-----------|
| Noteret aktie | NOTERET_AKTIE | Gevinst på noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| Unoteret aktie | UNOTERET_AKTIE | **AL aktieindkomst** (fuldt fradrag) | ✅ JA |
| ETF positivliste | NOTERET_AKTIE | Gevinst på noterede aktier + udbytter | ✅ **OBLIGATORISK** |
| ETF ikke-positivliste | KAPITAL_GENEREL | Kun kapitalindkomst | ✅ JA |
| Inv.forening (begge typer) | NOTERET_AKTIE | Gevinst på noterede aktier + udbytter | ✅ **OBLIGATORISK** |

### For isolerede konti

| Kontotype | Pulje | Kan bruges mod | Ægtefælle | Særlig risiko |
|-----------|-------|----------------|-----------|---------------|
| ASK | ASK_ISOLERET | Kun samme ASK | ❌ NEJ | ⚠️ Tabes ved lukning |
| Pension | PENSION_ISOLERET | Kun samme pension | ❌ NEJ | - |

---

## Vigtige advarsler til brugeren

### ⚠️ Kapitalindkomst asymmetri
```
ADVARSEL: Kapitalindkomst er ASYMMETRISK!
- Gevinst beskattes med ~37-42%
- Tab giver KUN fradrag med ~25-33%
- Du får IKKE fuld skatteværdi af tab
```

### ⚠️ ASK lukning
```
ADVARSEL: Hvis du lukker din ASK, MISTER du fremført tab!
Tab på ASK kan kun bruges på samme konto.
```

### ⚠️ Obligatorisk ægtefælleoverførsel
```
INFO: Tab på noterede aktier overføres AUTOMATISK til ægtefælle.
Dette er obligatorisk - ikke valgfrit.
Rækkefølge:
1. Først mod egen gevinst/udbytte
2. Derefter mod ægtefælles gevinst/udbytte
3. Resterende fremføres
```

---

## Korrekt Flow-Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRIN 1: KONTOTYPE                            │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ FRIT DEPOT  │    ASK      │ BØRNEOPSPARING  │      PENSION          │
│  27%/42%    │    17%      │      0%         │      15,3%            │
│  eller ~37% │             │                 │                       │
└──────┬──────┴──────┬──────┴────────┬────────┴───────────┬───────────┘
       │             │               │                    │
       ▼             ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TRIN 2: AKTIVTYPE                            │
│  (Aktier, ETF, Investeringsforeninger)                              │
└──────┬──────────────┬──────────────┬────────────────────┬───────────┘
       │              │              │                    │
       ▼              │              │                    │
┌──────────────┐      │              │                    │
│   TRIN 3:    │      │              │                    │
│KLASSIFICERING│   SPRINGES      SPRINGES             SPRINGES
├──────────────┤     OVER          OVER                 OVER
│Aktieindkomst │      │              │                    │
│    ELLER     │      │              │                    │
│Kapitalindkomst│     │              │                    │
└──────┬───────┘      │              │                    │
       │              │              │                    │
       ▼              ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     TRIN 4: SKATTEBEREGNING                         │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ 27%/42%     │    17%      │      0%         │      15,3%            │
│   ELLER     │   FLAT      │   SKATTEFRI     │      PAL              │
│   ~37%      │             │                 │                       │
└──────┬──────┴──────┬──────┴────────┬────────┴───────────┬───────────┘
       │             │               │                    │
       ▼             ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TRIN 5: TAB/FRADRAG                            │
├─────────────┬─────────────┬─────────────────┬───────────────────────┤
│ Flere       │ASK_ISOLERET │  Ikke relevant  │  PENSION_ISOLERET     │
│ puljer      │(tabes ved   │  (skattefri)    │  (kun samme konto)    │
│             │ lukning!)   │                 │                       │
└─────────────┴─────────────┴─────────────────┴───────────────────────┘
```

---

## TypeScript Konstanter

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
      gainRate: 0.37,        // Cirka - afhænger af samlet indkomst
      lossDeduction: 0.25    // Cirka - LAVERE end gevinstskat!
    },
    ask: {
      rate: 0.17
    },
    pension: {
      palRate: 0.153
    },
    childSavings: {
      rate: 0
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
      gainRate: 0.37,
      lossDeduction: 0.25
    },
    ask: {
      rate: 0.17
    },
    pension: {
      palRate: 0.153
    },
    childSavings: {
      rate: 0
    }
  }
} as const;

export type AccountType = 
  | 'FRIT_DEPOT' 
  | 'ASK' 
  | 'BOERNEOPSPARING' 
  | 'RATEPENSION' 
  | 'ALDERSOPSPARING' 
  | 'KAPITALPENSION' 
  | 'LIVRENTE';

export type AssetType = 
  | 'AKTIE_DK' 
  | 'AKTIE_UDENLANDSK' 
  | 'AKTIE_UNOTERET'
  | 'ETF_POSITIVLISTE' 
  | 'ETF_IKKE_POSITIVLISTE' 
  | 'INVF_UDBYTTEBETALTENDE' 
  | 'INVF_AKKUMULERENDE';

export type IncomeType = 
  | 'AKTIEINDKOMST' 
  | 'KAPITALINDKOMST' 
  | 'ASK_INDKOMST' 
  | 'PAL_INDKOMST' 
  | 'SKATTEFRI';

export type LossPool = 
  | 'NOTERET_AKTIE' 
  | 'UNOTERET_AKTIE' 
  | 'KAPITAL_GENEREL' 
  | 'ASK_ISOLERET' 
  | 'PENSION_ISOLERET';
```

---

## Klassificeringsfunktion

```typescript
function classifyIncome(
  accountType: AccountType, 
  assetType: AssetType
): IncomeType {
  
  // Børneopsparing er altid skattefri
  if (accountType === 'BOERNEOPSPARING') {
    return 'SKATTEFRI';
  }
  
  // ASK er altid 17% lager
  if (accountType === 'ASK') {
    return 'ASK_INDKOMST';
  }
  
  // Pension er altid 15,3% PAL
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(accountType)) {
    return 'PAL_INDKOMST';
  }
  
  // Frit depot: Afhænger af aktivtype
  if (accountType === 'FRIT_DEPOT') {
    // ETF ikke på positivliste → Kapitalindkomst
    if (assetType === 'ETF_IKKE_POSITIVLISTE') {
      return 'KAPITALINDKOMST';
    }
    
    // Alt andet → Aktieindkomst
    return 'AKTIEINDKOMST';
  }
  
  throw new Error(`Unknown account type: ${accountType}`);
}
```

---

## Tabspulje-funktion

```typescript
function getLossPool(
  accountType: AccountType, 
  assetType: AssetType
): LossPool | null {
  
  // Børneopsparing har ingen tabspulje
  if (accountType === 'BOERNEOPSPARING') {
    return null;
  }
  
  // ASK har isoleret pulje
  if (accountType === 'ASK') {
    return 'ASK_ISOLERET';
  }
  
  // Pension har isoleret pulje
  if (['RATEPENSION', 'ALDERSOPSPARING', 'KAPITALPENSION', 'LIVRENTE'].includes(accountType)) {
    return 'PENSION_ISOLERET';
  }
  
  // Frit depot: Afhænger af aktivtype
  if (accountType === 'FRIT_DEPOT') {
    switch (assetType) {
      case 'AKTIE_UNOTERET':
        return 'UNOTERET_AKTIE';  // Fuldt fradrag i al aktieindkomst
      case 'ETF_IKKE_POSITIVLISTE':
        return 'KAPITAL_GENEREL';
      default:
        return 'NOTERET_AKTIE';  // Kildeartsbegrænset
    }
  }
  
  throw new Error(`Unknown account type: ${accountType}`);
}
```

---

## Lovhenvisninger

| Emne | Lov/paragraf |
|------|--------------|
| Aktieindkomst satser | PSL § 8a, stk. 1-2 |
| Ægtefælle bundfradrag | PSL § 8a, stk. 4 |
| Tab noterede aktier | ABL § 13 A |
| Tab unoterede aktier | ABL § 13 |
| ETF positivliste | ABL § 19 B |
| ETF ikke-positivliste | ABL § 19 C |
| ASK beskatning | ASKL § 13-14 |
| PAL-skat | PAL § 2 |

---

*Dokument klar til implementering i Claude Code*
