# Dansk Investeringsbeskatning - Dokumentation

**Version:** 3.0  
**Dato:** 2. februar 2025  
**Status:** Audit-klar

---

## Formål

Dette er den autoritative dokumentation for dansk investeringsbeskatning i Portfolio Risk Analyzer. Alle oplysninger er verificeret mod officielle kilder og indeholder direkte lovhenvisninger.

---

## Filstruktur

| Fil | Indhold | Kritisk for |
|-----|---------|-------------|
| [01_KONTOTYPER.md](01_KONTOTYPER.md) | Frit Depot, ASK, Pension, Børneopsparing | Routing af skat |
| [02_AKTIVTYPER.md](02_AKTIVTYPER.md) | Aktier, ETF, Investeringsforeninger | Klassificering |
| [03_AKTIEINDKOMST.md](03_AKTIEINDKOMST.md) | 27%/42%, progression, udbytte | Skatteberegning |
| [04_KAPITALINDKOMST.md](04_KAPITALINDKOMST.md) | PSL § 11, ~33% fradrag, INGEN tabsbank | ⚠️ KRITISK |
| [05_TAB_AKTIEINDKOMST.md](05_TAB_AKTIEINDKOMST.md) | Noteret/unoteret, fremførsel, ægtefælle | Tabsbank |
| [06_TAB_KAPITALINDKOMST.md](06_TAB_KAPITALINDKOMST.md) | Øjeblikkelig modregning, ingen fremførsel | ⚠️ KRITISK |
| [07_ASK.md](07_ASK.md) | 17% lager, isoleret tab | Beregning |
| [08_PENSION.md](08_PENSION.md) | 15,3% PAL, typer | Beregning |
| [09_BOERNEOPSPARING.md](09_BOERNEOPSPARING.md) | 0% skat, udbetaling ved 21 år | Edge case |
| [10_AEGTEFAELLER.md](10_AEGTEFAELLER.md) | Obligatorisk vs. valgfri overførsel | Tabsbank |
| [11_POSITIVLISTEN.md](11_POSITIVLISTEN.md) | ABIS-liste, aktie vs. kapital | Klassificering |
| [12_SATSER.md](12_SATSER.md) | Alle satser 2025/2026 | Reference |
| [13_LOVKILDER.md](13_LOVKILDER.md) | Verificerede URL'er | Audit |

---

## Hovedprincipper

### 5-Trins Skatteflow

```
TRIN 1: KONTOTYPE      → Bestemmer skattemodel
TRIN 2: AKTIVTYPE      → Bestemmer beskatningsprincip (realisation/lager)
TRIN 3: KLASSIFICERING → KUN for Frit Depot: aktie- eller kapitalindkomst
TRIN 4: SKATTEBEREGNING → Beregn skat
TRIN 5: TAB/FRADRAG    → Håndter tab korrekt
```

### Kritiske Forskelle

| Indkomsttype | Tabshåndtering | Ægtefælle |
|--------------|----------------|-----------|
| **Aktieindkomst (noteret)** | Tabsbank, fremføres ubegrænset | OBLIGATORISK overførsel |
| **Aktieindkomst (unoteret)** | Fuldt fradrag i AL aktieindkomst | Ja |
| **Kapitalindkomst** | ØJEBLIKKELIG fradrag, INGEN tabsbank | Ja (automatisk) |
| **ASK** | Isoleret på samme konto | Nej |
| **Pension** | Isoleret på samme konto | Nej |

---

## Officielle Kilder

| Kilde | URL | Anvendelse |
|-------|-----|------------|
| **Skatteministeriet satser** | skm.dk/tal-og-metode/satser/ | Beløbsgrænser |
| **SKAT Juridisk Vejledning** | info.skat.dk | Detaljerede regler |
| **Retsinformation** | retsinformation.dk | Lovtekst |
| **SKAT Borger** | skat.dk/borger | Praktisk vejledning |

---

## Ændringslog

| Dato | Ændring | Verifikation |
|------|---------|--------------|
| 02-02-2025 | Oprettet modulær struktur | - |
| 02-02-2025 | Korrigeret kapitalindkomst (PSL § 11) | SKM.dk verificeret |
| 02-02-2025 | Tilføjet obligatorisk ægtefælleoverførsel | ABL § 13A verificeret |

---

*Denne dokumentation opdateres ved lovændringer. Sidst verificeret: 2. februar 2025*
