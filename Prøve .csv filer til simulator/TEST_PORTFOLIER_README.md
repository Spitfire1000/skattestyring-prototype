# Test Porteføljer til Skat-Simulator

**Oprettet:** 31. januar 2025  
**Formål:** Test af alle skattescenarier i Portfolio Risk Analyzer

---

## Oversigt over testfiler

| Fil | Fokus | Konti | Særlige testcases |
|-----|-------|-------|-------------------|
| `test_portfolio_1_dansk_fokus.csv` | Danske aktier + ETF positivliste | Frie midler | Aktieindkomst progression |
| `test_portfolio_2_ask_international.csv` | US tech + internationale ETF | ASK | 17% lagerbeskatning |
| `test_portfolio_3_kapitalindkomst_etf.csv` | Obligations-ETF + guld | Blandet | Kapitalindkomst vs aktieindkomst |
| `test_portfolio_4_pension.csv` | Stabile aktier | Pension | 15,3% PAL-skat |
| `test_portfolio_5_komplex_blandet.csv` | Alt blandet | Alle typer | Kompleks modregning |

---

## Fil 1: Dansk fokus (Frie midler)

**Kontotype:** Kun Frie midler  
**Skattetest:** Aktieindkomst med progression (27%/42%)

### Indhold:
| Type | Antal | Gevinst | Tab |
|------|-------|---------|-----|
| Danske aktier | 7 | 4 | 3 |
| ETF (positivliste) | 5 | 3 | 2 |
| Inv.fond (udloddende) | 4 | 2 | 2 |
| Inv.fond (akkumulerende) | 4 | 2 | 2 |

### Specifikke testcases:
- **Novo Nordisk:** +36.075 kr gevinst (27% skat under grænse)
- **Vestas + Ørsted + Coloplast:** Tab der kan modregnes
- **iShares Core MSCI World (IE00B4L5Y983):** PÅ positivliste → aktieindkomst
- **Danske Inv Global Indeks Akk:** Akkumulerende → lagerbeskatning

---

## Fil 2: ASK International

**Kontotype:** Kun Aktiesparekonto (ASK)  
**Skattetest:** 17% lagerbeskatning, isoleret tab

### Indhold:
| Type | Antal | Gevinst | Tab |
|------|-------|---------|-----|
| US aktier | 10 | 6 | 4 |
| ETF (positivliste) | 3 | 2 | 1 |
| ETF (IKKE positivliste) | 2 | 2 | 0 |
| Inv.fond | 4 | 2 | 2 |

### Specifikke testcases:
- **NVIDIA:** +102.270 kr gevinst (ASK = 17%, ikke 27%)
- **Tesla + Netflix + PayPal:** Tab på ASK → KAN IKKE overføres!
- **iShares Physical Gold (IE00B4ND3602):** IKKE på positivliste, men ASK = stadig 17%
- **Xtrackers EUR Overnight (LU0290358497):** Obligations-ETF på ASK

### ⚠️ VIGTIGT ASK-TEST:
Tab på ASK kan IKKE modregnes i andre konti. Simuler lukning af ASK = tab tabes!

---

## Fil 3: Kapitalindkomst ETF

**Kontotype:** Blandet (Frie midler + ASK)  
**Skattetest:** Kapitalindkomst vs aktieindkomst for ETF'er

### Indhold:
| Type | Antal | Gevinst | Tab |
|------|-------|---------|-----|
| Danske aktier | 7 | 4 | 3 |
| ETF (positivliste) | 3 | 2 | 1 |
| ETF (IKKE positivliste) | 5 | 2 | 3 |
| Inv.fond | 7 | 4 | 3 |

### ETF'er IKKE på positivliste (kapitalindkomst ~42%):
| ISIN | Navn | Type |
|------|------|------|
| IE0032523478 | iShares Euro Corp Bond | Obligations-ETF |
| IE00B66F4759 | iShares EUR High Yield Bond | Obligations-ETF |
| IE00BZ163L38 | Xtrackers Global Aggregate Bond | Obligations-ETF |
| IE00B4ND3602 | iShares Physical Gold | Råvare-ETF |
| JE00B78CGV99 | WisdomTree Brent Crude Oil | Råvare-ETF |

### Specifikke testcases:
- **Sammenlign:** iShares Core MSCI World (aktieindkomst) vs iShares Physical Gold (kapitalindkomst)
- **Obligations-ETF tab:** Kan KUN modregnes i kapitalindkomst!
- **WisdomTree Brent Crude Oil:** Råvare-ETF → kapitalindkomst

---

## Fil 4: Pension

**Kontotype:** Ratepension + Aldersopsparing  
**Skattetest:** 15,3% PAL-skat, lagerbeskatning

### Indhold:
| Type | Antal | Gevinst | Tab |
|------|-------|---------|-----|
| Danske aktier | 7 | 4 | 3 |
| US aktier | 5 | 3 | 2 |
| ETF (positivliste) | 3 | 2 | 1 |
| Inv.fond | 6 | 3 | 3 |

### Specifikke testcases:
- **Alle positioner:** 15,3% PAL-skat (uanset aktivtype!)
- **Tab på pension:** Isoleret til HVER konto separat
- **Ratepension vs Aldersopsparing:** Samme skattesats, forskellig fradragsregel

### ⚠️ VIGTIGT PENSION-TEST:
- Tab på Ratepension kan IKKE modregnes i Aldersopsparing (og omvendt)
- Hver pensionskonto har sin egen fradragsbank

---

## Fil 5: Kompleks blandet

**Kontotype:** Alle typer (Frie midler, ASK, Pension)  
**Skattetest:** Fuld kompleksitet med alle regler

### Indhold:
| Type | Antal | Gevinst | Tab |
|------|-------|---------|-----|
| Danske aktier | 7 | 3 | 4 |
| US aktier | 5 | 3 | 2 |
| ETF (positivliste) | 5 | 4 | 1 |
| ETF (IKKE positivliste) | 3 | 2 | 1 |
| Inv.fond (udloddende) | 4 | 2 | 2 |
| Inv.fond (akkumulerende) | 4 | 2 | 2 |

### Specifikke testcases:
- **Palantir:** +126.888 kr på ASK (stor gevinst, lav skat)
- **Intel + Rivian:** Store tab på ASK (kan ikke bruges!)
- **Zealand Pharma + Netcompany:** Store tab på Frie midler (kan modregnes)
- **iShares Physical Gold:** Gevinst på kapitalindkomst
- **iShares EUR Corp Bond:** Tab på kapitalindkomst (kildeartsbegrænset!)

---

## Skattemæssig klassificering af aktiverne

### ETF'er PÅ positivliste (aktieindkomst 27%/42%):
| ISIN | Navn |
|------|------|
| IE00B4L5Y983 | iShares Core MSCI World |
| IE00B5BMR087 | iShares Core S&P 500 |
| IE00B3RBWM25 | Vanguard FTSE All-World |
| IE00B3XXRP09 | Vanguard S&P 500 |
| IE00B4L5YC18 | iShares MSCI EM |
| IE00BJ0KDQ92 | Xtrackers MSCI World |
| IE00B1XNHC34 | iShares Global Clean Energy |
| IE00BJ0KDR00 | Xtrackers MSCI Japan |
| IE00B53L3W79 | iShares Euro Stoxx 50 |
| IE00B1YZSC51 | iShares MSCI Europe |
| IE00B8FHGS14 | iShares MSCI World Min Vol |

### ETF'er IKKE på positivliste (kapitalindkomst ~42%):
| ISIN | Navn | Årsag |
|------|------|-------|
| IE00B4ND3602 | iShares Physical Gold | Råvare-ETF |
| JE00B78CGV99 | WisdomTree Brent Crude Oil | Råvare-ETF |
| IE0032523478 | iShares Euro Corp Bond | Obligations-ETF |
| IE00B66F4759 | iShares EUR High Yield Bond | Obligations-ETF |
| IE00BZ163L38 | Xtrackers Global Aggregate Bond | Obligations-ETF |
| LU0290358497 | Xtrackers II EUR Overnight Rate | Pengemarked-ETF |

### Investeringsforeninger (UDLODDENDE = realisation):
| ISIN | Navn |
|------|------|
| DK0010028861 | Sparindex INDEX Globale Aktier |
| DK0010274115 | Danske Inv Danmark Indeks |
| DK0060300663 | Sparindex INDEX OMX C25 |
| DK0060655009 | Maj Invest Value Aktier |
| DK0010274388 | Danske Inv USA Indeks |
| DK0060747251 | Sparindex INDEX Emerging Markets |
| DK0016262132 | Danske Inv Global Indeks |
| DK0060534683 | Sparindex INDEX USA Growth |
| DK0060748069 | Sparindex INDEX DJSI World |
| DK0060004190 | BankInvest Højt Udbytte Aktier |
| DK0060534766 | Sparindex INDEX USA Small Cap |
| DK0060747095 | Sparindex INDEX Stabile Aktier |

### Investeringsforeninger (AKKUMULERENDE = lager):
| ISIN | Navn |
|------|------|
| DK0060238558 | Danske Inv Global Indeks Akk |
| DK0060786960 | Nordea Invest Globale Aktier Akk |
| DK0060713972 | BankInvest Globale Aktier Akk |
| DK0060950590 | Nykredit Invest Globale Aktier Akk |
| DK0060013084 | Nordea Invest Stabile Aktier Akk |
| DK0060655264 | Maj Invest Value Aktier Akk |
| DK0060568913 | Nordea Invest Basis 3 Akk |
| DK0060237089 | Danske Inv Mix Offensiv Akk |

---

## Test-scenarier at køre

### Scenarie 1: Simpel aktieindkomst
1. Upload `test_portfolio_1_dansk_fokus.csv`
2. Simuler salg af Novo Nordisk (+36.075 kr)
3. Verificer: 27% skat (under progressionsgrænse)

### Scenarie 2: Over progressionsgrænse
1. Upload `test_portfolio_1_dansk_fokus.csv`
2. Simuler salg af ALLE positioner med gevinst
3. Verificer: 27% op til 67.500 kr, 42% derover

### Scenarie 3: Tab-modregning
1. Upload `test_portfolio_1_dansk_fokus.csv`
2. Simuler: Først sælg Vestas (tab), derefter Novo (gevinst)
3. Verificer: Tab modregnes i gevinst

### Scenarie 4: ASK isoleret tab
1. Upload `test_portfolio_2_ask_international.csv`
2. Simuler salg af Tesla (tab)
3. Verificer: Tab kan KUN bruges på samme ASK

### Scenarie 5: Kapitalindkomst vs aktieindkomst
1. Upload `test_portfolio_3_kapitalindkomst_etf.csv`
2. Sammenlign: iShares MSCI World vs iShares Physical Gold
3. Verificer: Forskellig skattesats og tabspulje

### Scenarie 6: Multi-år fremførsel
1. År 1: Upload fil, simuler tab på 50.000 kr
2. År 2: Upload samme fil, simuler gevinst
3. Verificer: Fremført tab modregnes korrekt

---

## Kilder til verifikation

| Emne | URL |
|------|-----|
| Aktieindkomst satser | https://skat.dk/borger/aktier/skat-af-aktier |
| Positivlisten (Excel) | https://skat.dk/media/w5odv3qn/januar-2026-abis-liste-2021-2026.xlsx |
| ASK regler | https://skat.dk/borger/aktier/aktiesparekonto |
| PAL-skat | https://skat.dk/borger/pension/skat-af-pensionsafkast |
| Tabsregler | https://skat.dk/borger/aktier/skat-af-aktier/betingelser-for-fradrag |

---

*Disse testfiler dækker alle skattescenarier beskrevet i SKATTESIDE_ROADMAP.md*
