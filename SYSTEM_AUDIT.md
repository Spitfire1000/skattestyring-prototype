# SYSTEM_AUDIT.md

## Overblik

Skat-Simulator er et dansk skatteberegningssystem til investeringsbeskatning. Systemet håndterer:
- Aktieindkomst (27%/42% progression)
- Kapitalindkomst (~37% gevinst / ~33% fradrag)
- ASK (17% lagerbeskatning)
- PAL/Pension (15,3% lagerbeskatning)
- Børneopsparing (skattefri)

**Dato:** 8. februar 2026

---

## 1. Typeoversigt

### 1.1 Kontotyper (`src/types/skat.ts`)

```typescript
type KontoType =
  | 'FRIT_DEPOT'       // Frie midler
  | 'ASK'              // Aktiesparekonto (17% lager)
  | 'BOERNEOPSPARING'  // Skattefri
  | 'RATEPENSION'      // 15,3% PAL
  | 'ALDERSOPSPARING'  // 15,3% PAL
  | 'KAPITALPENSION'   // 15,3% PAL
  | 'LIVRENTE';        // 15,3% PAL
```

### 1.2 Aktivtyper (`src/types/skat.ts`)

```typescript
type AktivType =
  | 'AKTIE_DK'                    // Dansk noteret aktie
  | 'AKTIE_UDENLANDSK'            // Udenlandsk noteret aktie
  | 'AKTIE_UNOTERET'              // Unoteret aktie (startup, anparter)
  | 'ETF_POSITIVLISTE'            // ETF på SKATs positivliste
  | 'ETF_IKKE_POSITIVLISTE'       // ETF IKKE på positivliste → kapitalindkomst
  | 'ETF_OBLIGATIONSBASERET'      // Obligationsbaseret ETF → ALTID kapitalindkomst
  | 'INVF_UDBYTTEBETALTENDE'      // Dansk inv.forening med udbytte
  | 'INVF_AKKUMULERENDE'          // Akkumulerende på positivliste
  | 'INVF_AKKUMULERENDE_KAPITAL'  // Akkumulerende IKKE på positivliste
  | 'BLANDET_FOND_AKTIE'          // >50% aktier
  | 'BLANDET_FOND_OBLIGATION'     // >50% obligationer → kapitalindkomst
  | 'OBLIGATION'                  // Direkte obligationer
  | 'FINANSIEL_KONTRAKT';         // Option, CFD, Future, Warrant
```

### 1.3 Indkomst- og skattetyper (`src/types/skat.ts`)

```typescript
type IndkomstType =
  | 'AKTIEINDKOMST'     // 27%/42% progression
  | 'KAPITALINDKOMST'   // ~37% gevinst / ~33% fradrag
  | 'ASK_INDKOMST'      // Flat 17%
  | 'PAL_INDKOMST'      // Flat 15,3%
  | 'SKATTEFRI';        // 0%

type BeskatningsMetode = 'REALISATION' | 'LAGER';
```

### 1.4 Tabspuljer (`src/types/skat.ts`)

```typescript
type TabsPulje =
  | 'NOTERET_AKTIE'       // Kildeartsbegr. – kun mod noterede gevinster
  | 'UNOTERET_AKTIE'      // Fuldt fradrag i AL aktieindkomst
  | 'KAPITAL_GENEREL'     // ⚠️ DEPRECATED – bruges ikke!
  | 'FINANSIEL_KONTRAKT'  // Isoleret tabspool (KGL § 32)
  | 'ASK_ISOLERET'        // Kun på samme ASK – TABES ved lukning!
  | 'PENSION_ISOLERET';   // Kun på samme pensionskonto
```

### 1.5 Lagerbeskatningstyper (`src/types/lagerSkat.ts`)

| Type | Beskrivelse |
|------|-------------|
| `AktivLagerSkat` | Lagerbeskatning for ét aktiv |
| `KontoLagerSkat` | Samlet for én konto (ASK/pension nettes) |
| `FritDepotLagerOpdeling` | Frit depot opdelt efter indkomsttype |
| `DynamiskLagerOversigt` | Samlet oversigt med totaler |
| `DynamiskLagerInput` | Input-parametre til beregning |
| `KontoKategori` | `'ASK' | 'PENSION' | 'BOERNEOPSPARING' | 'FRIT_DEPOT_AKTIE' | 'FRIT_DEPOT_KAPITAL'` |

### 1.6 Onboarding-typer (`src/services/onboarding.ts`)

| Type | Beskrivelse |
|------|-------------|
| `OnboardingTrinType` | `'info' | 'input' | 'upload' | 'summary'` |
| `OnboardingTrin` | Ét trin i wizard-flowet |
| `OnboardingSaldoer` | Brugerens indtastede tabssaldoer |
| `OnboardingState` | Samlet onboarding-tilstand |
| `VerifikationsPåmindelse` | Påmindelse når ny årsopgørelse er klar |

---

## 2. Funktionsoversigt

### 2.1 Skatteberegning (`src/constants/skatteRegler.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `getSatserForÅr(år)` | `number` | `ÅrligeSatser` | Hent skattesatser for et skatteår |
| `klassificerIndkomst(kontoType, aktivType)` | `KontoType, AktivType` | `IndkomstType` | Bestem indkomsttype |
| `getTabspulje(kontoType, aktivType)` | `KontoType, AktivType` | `TabsPulje | null` | Bestem tabspulje (null = ingen tabsbank) |
| `beregnSkat(kontoType, indkomst, gevinst, år, erGift, tidligereIndkomst)` | ... | `SkatteBeregning` | Beregn skat med progression |
| `beregnKapitalindkomstFradrag(tab, skatteår, erGift)` | ... | `KapitalindkomstFradragResultat` | PSL § 11 fradrag |
| `erKapitalindkomstAktiv(aktivType)` | `AktivType` | `boolean` | Check om aktivtype er kapitalindkomst |

### 2.2 Fradragsbank (`src/services/fradragsbank.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `tilføjTab(profilId, beløb, pulje, kontoId?, beskrivelse?, år?)` | ... | `FradragsbankPost` | Tilføj tab til pulje |
| `beregnModregning(profilId, gevinst, pulje, kontoId?)` | ... | `ModregningResultat` | Beregn modregning mod gevinst |
| `hentFradragsbank(profilId)` | `string` | `Fradragsbank` | Hent alle tabspuljer |
| `hentTabIPulje(profilId, pulje, kontoId?)` | ... | `number` | Sum af tab i én pulje |
| `hentFradragsbankOversigt(profilId)` | `string` | `FradragsbankOversigt[]` | Grupperet oversigt |
| `overførTilÆgtefælle(fra, til, pulje, beløb)` | ... | `boolean` | Overfør tab til ægtefælle |
| `sletTabForKonto(profilId, kontoId)` | `string, string` | `number` | Slet tab ved konto-lukning |
| `nulstilFradragsbank(profilId)` | `string` | `void` | Nulstil (test) |
| `nulstilAlleFradragsbanker()` | — | `void` | Nulstil alle (test) |

### 2.3 Dynamisk lagerbeskatning (`src/services/dynamiskLagerSkat.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `beregnDynamiskLagerSkat(aktiver, input)` | `PortfolioAsset[], DynamiskLagerInput` | `DynamiskLagerOversigt` | Hovedberegning |
| `formatKr(n)` | `number` | `string` | Formater til dansk beløb |
| `formatPct(n)` | `number` | `string` | Formater til procent |
| `testDynamiskLagerSkat()` | — | `void` | Test med playground-data |

### 2.4 CSV Parser (`src/services/csvParser.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `parsePortfolioCSV(csvText)` | `string` | `PortfolioAsset[]` | Parse Nordnet CSV |
| `mapKontoType(kontoStr)` | `string` | `KontoType` | Map konto-streng til type |
| `detectAktivType(isin, navn)` | `string, string` | `AktivType` | Detekter aktivtype fra ISIN/navn |
| `groupAssetsByType(assets)` | `PortfolioAsset[]` | `GroupedAssets[]` | Gruppér efter aktivtype |
| `groupAssetsByKonto(assets)` | `PortfolioAsset[]` | `Map<string, PortfolioAsset[]>` | Gruppér efter konto |

### 2.5 Onboarding (`src/services/onboarding.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `opretOnboardingState(dato?)` | `Date?` | `OnboardingState` | Initial state |
| `genererOnboardingTrin(dato?)` | `Date?` | `OnboardingTrin[]` | Generer trin baseret på dato |
| `opdaterSaldoer(state, felt, værdi)` | ... | `OnboardingState` | Opdater saldo-felt |
| `markerHandlerUploadet(state, år)` | ... | `OnboardingState` | Marker handler som uploadet |
| `næsteTrin(state)` | `OnboardingState` | `OnboardingState` | Gå til næste trin |
| `forrigeTrin(state)` | `OnboardingState` | `OnboardingState` | Gå til forrige trin |
| `erOnboardingKomplet(state)` | `OnboardingState` | `boolean` | Tjek komplethed |
| `validerOnboarding(state)` | `OnboardingState` | `string[]` | Valider og returner advarsler |
| `tjekForNyÅrsopgørelse(state, dato?)` | ... | `VerifikationsPåmindelse | null` | Tjek for ny opgørelse |
| `konverterTilFradragsbankPoster(state)` | `OnboardingState` | `{pulje, beløb, år, beskrivelse}[]` | Konverter til fradragsbank |
| `hentFremskridt(state)` | `OnboardingState` | `number` | Fremskridtsprocent |
| `hentSaldoResumé(state)` | `OnboardingState` | `{label, beløb, pulje}[]` | Saldo-resumé til UI |
| `beregnSamletFremførtTab(state)` | `OnboardingState` | `number` | Sum af alle saldoer |

### 2.6 Skattekalender (`src/constants/skatteKalender.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `beregnOnboardingKontekst(dato?)` | `Date?` | `OnboardingKontekst` | Bestem hvilken årsopgørelse der er klar |
| `formatÅrstal(år)` | `number` | `string` | Formater årstal |
| `erÅrsopgørelseTilgængelig(skatteår, dato?)` | `number, Date?` | `boolean` | Er opgørelsen tilgængelig? |

### 2.7 Konto-tilladelser (`src/constants/kontoTilladelser.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `erAktivTilladt(kontoType, aktivType)` | `KontoType, AktivType` | `boolean` | Er aktivtypen tilladt? |
| `getForbudteAktivTyper(kontoType)` | `KontoType` | `AktivType[]` | Forbudte aktivtyper |
| `getASKIndskudsgrænse(skatteår)` | `number` | `number` | ASK indskudsgrænse |
| `getKontoBegrænsning(kontoType)` | `KontoType` | `string | undefined` | Note om begrænsninger |
| `validerKøb(kontoType, aktivType)` | `KontoType, AktivType` | `{tilladt, fejl?}` | Valider køb |

### 2.8 Lovkilder (`src/constants/lovkilder.ts`)

| Funktion | Parametre | Returnerer | Beskrivelse |
|----------|-----------|------------|-------------|
| `getParagrafUrl(lov, paragraf)` | `string, string` | `string` | URL til paragraf |
| `getLovUrl(lov)` | `string` | `string` | Basis-URL til lov |
| `getParagrafInfo(lov, paragraf)` | `string, string` | `ParagrafInfo | null` | Paragraf-info |
| `getLovInfo(lov)` | `string` | `LovKilde | null` | Lov-info |
| `formatLovhenvisning(lov, paragraf)` | `string, string` | `string` | Formater henvisning |
| `getSkatDkKilde(key)` | `string` | `SkatDkKilde | null` | Hent SKAT.dk kilde |
| `getJuridiskVejledning(key)` | `string` | `JuridiskVejledning | null` | Hent juridisk vejledning |

---

## 3. Konstanter

### 3.1 Skattesatser (`src/constants/skatteRegler.ts`)

| Konstant | Værdi (2026) | Beskrivelse |
|----------|--------------|-------------|
| `AKTIE_LAV` | 27% | Aktieindkomst under grænsen |
| `AKTIE_HØJ` | 42% | Aktieindkomst over grænsen |
| `PROGRESSIONSGRÆNSE_ENLIG` | 79.400 kr | 2026-grænse for enlige |
| `PROGRESSIONSGRÆNSE_GIFT` | 158.800 kr | 2026-grænse for ægtepar |
| `ASK_SATS` | 17% | Aktiesparekonto |
| `ASK_INDSKUDSGRÆNSE` | 174.200 kr | 2026-indskudsgrænse |
| `PAL_SATS` | 15,3% | Pensionsafkast |
| `BØRNEOPSPARING_SATS` | 0% | Skattefri |
| `PSL11_GRÆNSE_ENLIG` | 50.000 kr | Negativ kapitalindkomst-grænse |
| `PSL11_GRÆNSE_ÆGTEPAR` | 100.000 kr | Negativ kapitalindkomst-grænse |

**Kapitalindkomst-satser:**
- Gevinst: ~37%
- Tab under PSL § 11 grænse: ~33% fradrag (25% kommuneskat + 8% PSL § 11)
- Tab over PSL § 11 grænse: ~25% fradrag (kun kommuneskat)

### 3.2 Modregningsregler (`src/constants/skatteRegler.ts`)

| Pulje | Kan modregnes i | Ægtefælle | Fremførsel |
|-------|-----------------|-----------|------------|
| `NOTERET_AKTIE` | Kun noterede + positivliste + udbytter | Obligatorisk (ABL § 13A stk. 3) | Ubegrænset |
| `UNOTERET_AKTIE` | AL aktieindkomst | Ja (valgfri) | Ubegrænset |
| `KAPITAL_GENEREL` | ⚠️ INGEN TABSBANK | — | ⚠️ INGEN FREMFØRSEL |
| `FINANSIEL_KONTRAKT` | Kun andre kontrakter | Ja (KGL § 32) | Ubegrænset |
| `ASK_ISOLERET` | Kun SAMME ASK | Nej | ⚠️ TABES ved lukning! |
| `PENSION_ISOLERET` | Kun SAMME pension | Nej | Ubegrænset |

### 3.3 Aktivskatteregler (`src/constants/skatteRegler.ts`)

| Aktivtype | Indkomsttype | Metode | Tabspulje |
|-----------|--------------|--------|-----------|
| `AKTIE_DK` | Aktieindkomst | Realisation | NOTERET_AKTIE |
| `AKTIE_UDENLANDSK` | Aktieindkomst | Realisation | NOTERET_AKTIE |
| `AKTIE_UNOTERET` | Aktieindkomst | Realisation | UNOTERET_AKTIE |
| `ETF_POSITIVLISTE` | Aktieindkomst | Lager | NOTERET_AKTIE |
| `ETF_IKKE_POSITIVLISTE` | Kapitalindkomst | Lager | ⚠️ null (ingen tabsbank) |
| `ETF_OBLIGATIONSBASERET` | Kapitalindkomst | Lager | ⚠️ null (ingen tabsbank) |
| `INVF_UDBYTTEBETALTENDE` | Aktieindkomst | Realisation | NOTERET_AKTIE |
| `INVF_AKKUMULERENDE` | Aktieindkomst | Lager | NOTERET_AKTIE |
| `INVF_AKKUMULERENDE_KAPITAL` | Kapitalindkomst | Lager | ⚠️ null (ingen tabsbank) |
| `BLANDET_FOND_AKTIE` | Aktieindkomst | Lager | NOTERET_AKTIE |
| `BLANDET_FOND_OBLIGATION` | Kapitalindkomst | Lager | ⚠️ null (ingen tabsbank) |
| `OBLIGATION` | Kapitalindkomst | Realisation | ⚠️ null (ingen tabsbank) |
| `FINANSIEL_KONTRAKT` | Kapitalindkomst | Lager | FINANSIEL_KONTRAKT |

### 3.4 Konto-tilladelser (`src/constants/kontoTilladelser.ts`)

| Kontotype | Tilladt | Forbudt |
|-----------|---------|---------|
| FRIT_DEPOT | Alt | — |
| ASK | Noterede aktier, positivliste-ETF, udbyttebet. fonde | Unoterede, obligationer, ikke-positivliste |
| BOERNEOPSPARING | Som ASK (bankregler) | Som ASK |
| PENSION | De fleste (ej unoterede, ej fin. kontrakter) | AKTIE_UNOTERET, FINANSIEL_KONTRAKT |

### 3.5 Lovkilder (`src/constants/lovkilder.ts`)

| Lov | Forkortelse | Gældende version |
|-----|-------------|------------------|
| Personskatteloven | PSL | LBK nr 1284 af 14/06/2021 |
| Aktieavancebeskatningsloven | ABL | LBK nr 1098 af 27/08/2025 |
| Kursgevinstloven | KGL | LBK nr 1390 af 29/09/2022 |
| Aktiesparekontoloven | ASKL | LBK nr 281 af 13/03/2025 |
| Pensionsafkastbeskatningsloven | PAL | LBK nr 12 af 06/01/2023 |
| Pensionsbeskatningsloven | PBL | LBK nr 1243 af 26/11/2024 |
| Ligningsloven | LL | LBK nr 1500 af 24/11/2025 |

---

## 4. Dataflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ONBOARDING                                   │
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────────────┐  │
│  │ skatteKalender│───▶│ onboarding.ts │───▶│ OnboardingWizard.tsx  │  │
│  │ (dato-logik)  │    │ (trin-gener.) │    │ (UI)                   │  │
│  └──────────────┘    └────────────────┘    └────────────────────────┘  │
│                              │                          │              │
│                              │                          ▼              │
│                              │              ┌────────────────────────┐ │
│                              └─────────────▶│ OnboardingSaldoer      │ │
│                                             │ (bruger-input)         │ │
│                                             └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             APP STATE                                   │
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────────────┐  │
│  │ TabsbankState│◀──▶│ App.tsx        │◀──▶│ KapitalindkomstSaldo  │  │
│  │ (per pulje)  │    │ (useState)     │    │ (årsbaseret, nulstil) │  │
│  └──────────────┘    └────────────────┘    └────────────────────────┘  │
│         │                   │                          │               │
│         │                   │ PortfolioAsset[]         │               │
│         │                   ▼                          │               │
│         │     ┌────────────────────────┐               │               │
│         │     │ PLAYGROUND_ASSETS /    │               │               │
│         │     │ csvParser.ts           │               │               │
│         │     └────────────────────────┘               │               │
└─────────│───────────────────│──────────────────────────│───────────────┘
          │                   │                          │
          ▼                   ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BEREGNING                                     │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                      skatteRegler.ts                               ││
│  │  ┌─────────────────┐  ┌───────────────────┐  ┌──────────────────┐ ││
│  │  │klassificerIndkomst│  │beregnSkat()       │  │beregnKapitalind- ││
│  │  │(kontoType,       │  │(progression,      │  │komstFradrag()   │ ││
│  │  │ aktivType)       │  │ PSL § 11)         │  │(PSL § 11)       │ ││
│  │  └─────────────────┘  └───────────────────┘  └──────────────────┘ ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                │                                       │
│                                ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                  dynamiskLagerSkat.ts                              ││
│  │  beregnDynamiskLagerSkat(aktiver, input) → DynamiskLagerOversigt  ││
│  │  - Filtrerer lagerbeskattede aktiver                              ││
│  │  - Grupperer efter konto (ASK/pension nettes)                     ││
│  │  - Beregner frit depot efter indkomsttype                         ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                │                                       │
│                                ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                    fradragsbank.ts                                 ││
│  │  - In-memory Map<profilId, Fradragsbank>                          ││
│  │  - tilføjTab() / beregnModregning()                               ││
│  │  - FIFO modregning (ældste tab først)                             ││
│  └────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          UI KOMPONENTER                                 │
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ TabsbankPanel.tsx   │  │ DynamiskLagerSkat-  │  │ AuditTrailPanel │ │
│  │ (viser tabspuljer)  │  │ Panel.tsx (lager)   │  │ .tsx            │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────┘ │
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ PortfolioPanel.tsx  │  │ SkatteberegningBar  │  │ LovtekstPanel   │ │
│  │ (portefølje)        │  │ .tsx (totaler)      │  │ .tsx            │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Afhængigheder

### 5.1 Fil-afhængigheder

```
src/
├── types/
│   ├── skat.ts                   # Basis-typer (ingen afhængigheder)
│   └── lagerSkat.ts              # Importerer types fra skat.ts
│
├── constants/
│   ├── skatteRegler.ts           # Importerer types fra skat.ts
│   ├── skatteKalender.ts         # Ingen afhængigheder
│   ├── skatDkVejledning.ts       # Importerer TabsPulje fra skat.ts
│   ├── lovkilder.ts              # Ingen afhængigheder
│   ├── lovhenvisninger.ts        # Importerer fra lovkilder.ts
│   ├── kontoTilladelser.ts       # Importerer types fra skat.ts, skatteRegler.ts
│   └── isinMapper.ts             # Importerer AktivType fra skat.ts
│
├── services/
│   ├── csvParser.ts              # Importerer types fra skat.ts, getTabspulje fra skatteRegler.ts
│   ├── fradragsbank.ts           # Importerer types fra skat.ts, MODREGNING_REGLER fra skatteRegler.ts
│   ├── dynamiskLagerSkat.ts      # Importerer fra csvParser.ts, lagerSkat.ts, skat.ts, skatteRegler.ts
│   └── onboarding.ts             # Importerer fra skatteKalender.ts, skatDkVejledning.ts
│
├── data/
│   └── playgroundAssets.ts       # Importerer PortfolioAsset fra csvParser.ts
│
├── components/
│   ├── OnboardingWizard.tsx      # Importerer fra onboarding.ts, skatDkVejledning.ts
│   ├── TabsbankPanel.tsx         # Importerer types fra skat.ts
│   ├── DynamiskLagerSkatPanel.tsx# Importerer fra dynamiskLagerSkat.ts, lagerSkat.ts
│   ├── PortfolioPanel.tsx        # Importerer fra csvParser.ts
│   └── ...
│
└── App.tsx                       # Importerer alle panels, state, onboarding
```

### 5.2 Ekstern afhængigheder

| Pakke | Version | Brug |
|-------|---------|------|
| react | ^18 | UI framework |
| tailwindcss | ^3 | Styling |
| lucide-react | — | Ikoner |

---

## 6. Huller og uklarheder

### 6.1 Kritiske mangler

| Kategori | Problem | Placering | Påvirkning |
|----------|---------|-----------|------------|
| **In-memory storage** | Fradragsbank gemmes i `Map` – tabes ved refresh | `fradragsbank.ts:76` | Data tabes |
| **Ingen persistering** | TabsbankState, KapitalindkomstSaldo i React state | `App.tsx` | Data tabes |
| **Ægtefælleberegning** | Obligatorisk overførsel for noterede aktier ikke implementeret | `fradragsbank.ts:731-733` | Forkert beregning |
| **Positivliste** | Kun ~7 ISIN-numre hardcodet | `csvParser.ts:54-66` | Falske positiver |
| **ISIN-mapper** | ~2000 entries – ikke komplet | `isinMapper.ts` | Manuel klassificering nødvendig |

### 6.2 TODOs og kommentarer

```typescript
// fradragsbank.ts:69-70
// In-memory storage (erstattes med Firebase senere)
const fradragsbanker: Map<string, Fradragsbank> = new Map();

// skatteRegler.ts:731-733
note: 'Kildeartsbegr. ABL § 13A - Ægtefælleoverførsel er OBLIGATORISK hvis egen
       gevinst ikke kan dække tab. ⚠️ KRÆVER MANUEL HÅNDTERING i nuværende
       implementation.'
```

### 6.3 Kendte begrænsninger

1. **Kapitalindkomst-tab nulstilles ikke automatisk ved årsskift**
   - `KapitalindkomstSaldo` skal nulstilles manuelt
   - Ingen automatisk håndtering af skatteårsskift

2. **Ingen validering af ISIN mod positivliste-API**
   - Hardcodet liste bruges i stedet for dynamisk opslag

3. **Ingen håndtering af valutakurser**
   - Udenlandske værdipapirer vises i original valuta
   - Ingen konvertering til DKK

4. **Finansielle kontrakter**
   - Rubrik 85/86 kræver manuel vedligeholdelse
   - Ingen automatisk beregning af nettoresultat

---

## 7. Eksporterede funktioner (alfabetisk)

| Funktion | Fil | Beskrivelse |
|----------|-----|-------------|
| `beregnDynamiskLagerSkat` | dynamiskLagerSkat.ts | Hovedberegning af lagerbeskatning |
| `beregnKapitalindkomstFradrag` | skatteRegler.ts | PSL § 11 fradragsberegning |
| `beregnModregning` | fradragsbank.ts | Modregn tab mod gevinst |
| `beregnOnboardingKontekst` | skatteKalender.ts | Dato-intelligent kontekst |
| `beregnSamletFremførtTab` | onboarding.ts | Sum af alle onboarding-saldoer |
| `beregnSkat` | skatteRegler.ts | Skatteberegning med progression |
| `detectAktivType` | csvParser.ts | Detekter aktivtype fra ISIN/navn |
| `erAktivTilladt` | kontoTilladelser.ts | Tjek konto-tilladelser |
| `erKapitalindkomstAktiv` | skatteRegler.ts | Check kapitalindkomst-aktivtype |
| `erOnboardingKomplet` | onboarding.ts | Tjek onboarding-komplethed |
| `erÅrsopgørelseTilgængelig` | skatteKalender.ts | Er opgørelsen klar? |
| `formatKr` | dynamiskLagerSkat.ts | Formater til dansk beløb |
| `formatLovhenvisning` | lovkilder.ts | Formater lovhenvisning |
| `formatPct` | dynamiskLagerSkat.ts | Formater til procent |
| `formatÅrstal` | skatteKalender.ts | Formater årstal |
| `forrigeTrin` | onboarding.ts | Gå til forrige trin |
| `genererOnboardingTrin` | onboarding.ts | Generer onboarding-trin |
| `getASKIndskudsgrænse` | kontoTilladelser.ts | Dynamisk ASK-grænse |
| `getForbudteAktivTyper` | kontoTilladelser.ts | Forbudte aktivtyper |
| `getJuridiskVejledning` | lovkilder.ts | Hent juridisk vejledning |
| `getKontoBegrænsning` | kontoTilladelser.ts | Hent konto-note |
| `getLovInfo` | lovkilder.ts | Hent lov-info |
| `getLovUrl` | lovkilder.ts | Hent lov-URL |
| `getParagrafInfo` | lovkilder.ts | Hent paragraf-info |
| `getParagrafUrl` | lovkilder.ts | Hent paragraf-URL |
| `getSatserForÅr` | skatteRegler.ts | Dynamiske skattesatser |
| `getSkatDkKilde` | lovkilder.ts | Hent SKAT.dk kilde |
| `getTabspulje` | skatteRegler.ts | Bestem tabspulje |
| `groupAssetsByKonto` | csvParser.ts | Gruppér efter konto |
| `groupAssetsByType` | csvParser.ts | Gruppér efter type |
| `hentFradragsbank` | fradragsbank.ts | Hent fradragsbank |
| `hentFradragsbankOversigt` | fradragsbank.ts | Grupperet oversigt |
| `hentFremskridt` | onboarding.ts | Fremskridtsprocent |
| `hentPuljerMedInput` | skatDkVejledning.ts | Puljer der kræver input |
| `hentPuljeVejledning` | skatDkVejledning.ts | Vejledning for pulje |
| `hentSaldoResumé` | onboarding.ts | Saldo-resumé |
| `hentTabIPulje` | fradragsbank.ts | Sum i pulje |
| `indsætÅrstalIVejledning` | skatDkVejledning.ts | Erstat årstal i tekst |
| `klassificerIndkomst` | skatteRegler.ts | Bestem indkomsttype |
| `konverterTilFradragsbankPoster` | onboarding.ts | Konverter saldoer |
| `mapKontoType` | csvParser.ts | Map konto-streng |
| `markerHandlerUploadet` | onboarding.ts | Marker upload |
| `normalizeAktivType` | skat.ts | Legacy type-mapping |
| `normalizeKontoType` | skat.ts | Legacy type-mapping |
| `nulstilAlleFradragsbanker` | fradragsbank.ts | Nulstil alle (test) |
| `nulstilFradragsbank` | fradragsbank.ts | Nulstil profil (test) |
| `næsteTrin` | onboarding.ts | Gå til næste trin |
| `opdaterSaldoer` | onboarding.ts | Opdater saldo |
| `opretOnboardingState` | onboarding.ts | Initial state |
| `overførTilÆgtefælle` | fradragsbank.ts | Overfør til ægtefælle |
| `parsePortfolioCSV` | csvParser.ts | Parse CSV |
| `sletTabForKonto` | fradragsbank.ts | Slet ved konto-lukning |
| `testDynamiskLagerSkat` | dynamiskLagerSkat.ts | Test-funktion |
| `tilføjTab` | fradragsbank.ts | Tilføj tab |
| `tjekForNyÅrsopgørelse` | onboarding.ts | Tjek ny opgørelse |
| `validerKøb` | kontoTilladelser.ts | Valider køb |
| `validerOnboarding` | onboarding.ts | Valider state |

---

## 8. Vedligeholdelse

### 8.1 Årlig opdatering

Disse værdier skal opdateres hvert år:

| Konstant | 2025 | 2026 | Fil |
|----------|------|------|-----|
| Progressionsgrænse (enlig) | 67.500 kr | 79.400 kr | skatteRegler.ts |
| Progressionsgrænse (gift) | 135.000 kr | 158.800 kr | skatteRegler.ts |
| ASK indskudsgrænse | 166.200 kr | 174.200 kr | skatteRegler.ts |

### 8.2 Positivliste

Positivlisten opdateres løbende af SKAT. Download seneste version:
- [ABIS liste 2021-2026 (Excel)](https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx)

---

*Genereret: 8. februar 2026*
