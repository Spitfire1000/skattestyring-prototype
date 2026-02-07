# Aktivtyper

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Verificeret

---

## Oversigt

| Aktivtype | Beskatningsprincip | Indkomsttype (Frit Depot) |
|-----------|-------------------|---------------------------|
| **AKTIE_DK** | Realisation | Aktieindkomst |
| **AKTIE_UDENLANDSK** | Realisation | Aktieindkomst |
| **AKTIE_UNOTERET** | Realisation | Aktieindkomst |
| **ETF_POSITIVLISTE** | Lager | Aktieindkomst |
| **ETF_IKKE_POSITIVLISTE** | Lager | Kapitalindkomst |
| **INVF_UDBYTTEBETALTENDE** | Realisation | Aktieindkomst |
| **INVF_AKKUMULERENDE** | Lager | Aktieindkomst |
| **FINANSIEL_KONTRAKT** | Lager | Kapitalindkomst |

---

## 1. Aktier

### AKTIE_DK - Dansk noteret aktie

- **Definition:** Aktier i danske selskaber optaget til handel på reguleret marked
- **Eksempler:** Novo Nordisk, Mærsk, Ørsted, DSV
- **Børs:** Nasdaq Copenhagen
- **Beskatning:** Realisation (ved salg)
- **Lovhjemmel:** ABL § 12

### AKTIE_UDENLANDSK - Udenlandsk noteret aktie

- **Definition:** Aktier i udenlandske selskaber optaget til handel på reguleret marked
- **Eksempler:** Apple, Microsoft, Tesla, Amazon
- **Børser:** NYSE, NASDAQ, LSE, Xetra, etc.
- **Beskatning:** Realisation (ved salg)
- **Kildeskat:** Kan være udenlandsk kildeskat på udbytte (fx 15% USA med W-8BEN)
- **Lovhjemmel:** ABL § 12

### AKTIE_UNOTERET - Unoteret aktie

- **Definition:** Aktier der IKKE er optaget til handel på reguleret marked
- **Eksempler:** Anparter i ApS, aktier i ikke-børsnoterede A/S
- **Beskatning:** Realisation
- **Tab:** Fuldt fradrag i AL aktieindkomst (ABL § 13)
- **Lovhjemmel:** ABL § 13

---

## 2. ETF'er (Exchange Traded Funds)

### ETF_POSITIVLISTE - ETF på SKATs positivliste

- **Definition:** ETF registreret som aktiebaseret investeringsselskab hos Skattestyrelsen
- **Eksempler:** iShares Core MSCI World, Xtrackers MSCI World, mange Vanguard-fonde
- **Beskatning:** **Lagerbeskatning** som aktieindkomst
- **Tjek:** ABIS-listen (positivlisten)
- **Lovhjemmel:** ABL § 19 B

### ETF_IKKE_POSITIVLISTE - ETF IKKE på positivliste

- **Definition:** ETF der IKKE er registreret som aktiebaseret investeringsselskab
- **Eksempler:** Obligationsbaserede ETF'er, guld-ETF'er, mange udenlandske ETF'er
- **Beskatning:** **Lagerbeskatning** som **kapitalindkomst**
- **Lovhjemmel:** ABL § 19 C

### ⚠️ Vigtigt: Tjek positivlisten

Samme ETF-udbyder kan have fonde på OG udenfor positivlisten:

| iShares fond | På positivliste? | Indkomsttype |
|--------------|------------------|--------------|
| iShares Core MSCI World | ✅ Ja | Aktieindkomst |
| iShares Physical Gold | ❌ Nej | Kapitalindkomst |

Se [11_POSITIVLISTEN.md](11_POSITIVLISTEN.md) for detaljer.

---

## 3. Investeringsforeninger (danske)

### INVF_UDBYTTEBETALTENDE - Udbyttebetalende investeringsforening

- **Definition:** Dansk investeringsforening der udbetaler udbytte
- **Eksempler:** Sparinvest, Danske Invest (udbyttebetalende varianter)
- **Beskatning:** **Realisation** - skat ved salg + udbytte
- **Lovhjemmel:** ABL § 21

### INVF_AKKUMULERENDE - Akkumulerende investeringsforening

- **Definition:** Dansk investeringsforening der geninvesterer afkast
- **Eksempler:** Sparindex (akkumulerende varianter)
- **Beskatning:** **Lagerbeskatning** som aktieindkomst
- **Lovhjemmel:** ABL § 21

---

## 4. Finansielle kontrakter

### FINANSIEL_KONTRAKT - CFD, optioner, futures

- **Definition:** Derivater og finansielle instrumenter
- **Eksempler:** CFD (Contract for Difference), aktieoptioner, futures
- **Beskatning:** **Lagerbeskatning** som **kapitalindkomst**
- **Tab:** Isoleret tabspulje - kun mod andre finansielle kontrakter
- **Lovhjemmel:** KGL § 29-33

---

## Beskatningsprincip: Realisation vs. Lager

### Realisation

```
Skat betales når aktivet SÆLGES

Gevinst = Salgspris - Anskaffelsessum
Skat først ved realisering
```

**Aktiver med realisation:**
- Alle aktier (DK, udenlandske, unoterede)
- Udbyttebetalende investeringsforeninger

### Lager

```
Skat betales HVERT ÅR af værdistigning

Beskatningsgrundlag = Værdi 31/12 - Værdi 1/1
Skat uanset om der er solgt
```

**Aktiver med lager:**
- ETF'er (alle typer)
- Akkumulerende investeringsforeninger
- Finansielle kontrakter

---

## Klassificeringsmatrix for Frit Depot

| Aktivtype | Indkomsttype | Skattesats | Tabsbehandling |
|-----------|--------------|------------|----------------|
| AKTIE_DK | Aktieindkomst | 27%/42% | Noteret tabsbank |
| AKTIE_UDENLANDSK | Aktieindkomst | 27%/42% | Noteret tabsbank |
| AKTIE_UNOTERET | Aktieindkomst | 27%/42% | Fuldt fradrag |
| ETF_POSITIVLISTE | Aktieindkomst | 27%/42% | Noteret tabsbank |
| ETF_IKKE_POSITIVLISTE | Kapitalindkomst | ~37% | Øjeblikkelig |
| INVF_UDBYTTEBETALTENDE | Aktieindkomst | 27%/42% | Noteret tabsbank |
| INVF_AKKUMULERENDE | Aktieindkomst | 27%/42% | Noteret tabsbank |
| FINANSIEL_KONTRAKT | Kapitalindkomst | ~37% | Isoleret pulje |

---

## TypeScript

```typescript
export type AssetType = 
  | 'AKTIE_DK' 
  | 'AKTIE_UDENLANDSK' 
  | 'AKTIE_UNOTERET'
  | 'ETF_POSITIVLISTE' 
  | 'ETF_IKKE_POSITIVLISTE' 
  | 'INVF_UDBYTTEBETALTENDE' 
  | 'INVF_AKKUMULERENDE'
  | 'FINANSIEL_KONTRAKT';

export type TaxationPrinciple = 'REALISATION' | 'LAGER';

export const ASSET_TAX_PRINCIPLE: Record<AssetType, TaxationPrinciple> = {
  AKTIE_DK: 'REALISATION',
  AKTIE_UDENLANDSK: 'REALISATION',
  AKTIE_UNOTERET: 'REALISATION',
  ETF_POSITIVLISTE: 'LAGER',
  ETF_IKKE_POSITIVLISTE: 'LAGER',
  INVF_UDBYTTEBETALTENDE: 'REALISATION',
  INVF_AKKUMULERENDE: 'LAGER',
  FINANSIEL_KONTRAKT: 'LAGER'
};

export function classifyIncomeType(
  accountType: 'FRIT_DEPOT',
  assetType: AssetType
): 'AKTIEINDKOMST' | 'KAPITALINDKOMST' {
  
  if (assetType === 'ETF_IKKE_POSITIVLISTE' || 
      assetType === 'FINANSIEL_KONTRAKT') {
    return 'KAPITALINDKOMST';
  }
  
  return 'AKTIEINDKOMST';
}
```

---

## Kilder

| Kilde | URL |
|-------|-----|
| ABL § 12 (noterede aktier) | https://danskelove.dk/aktieavancebeskatningsloven/12 |
| ABL § 13 (unoterede aktier) | https://danskelove.dk/aktieavancebeskatningsloven/13 |
| ABL § 19 B (positivliste ETF) | https://danskelove.dk/aktieavancebeskatningsloven/19b |
| ABL § 19 C (ikke-positivliste ETF) | https://danskelove.dk/aktieavancebeskatningsloven/19c |
| KGL § 29-33 (finansielle kontrakter) | https://danskelove.dk/kursgevinstloven |

---

*Dokument verificeret mod officielle kilder 02-02-2025*
