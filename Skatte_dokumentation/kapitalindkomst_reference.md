# Kapitalindkomst — Komplet Referencedokument

**Version:** 2026-02-03  
**Formål:** Referencedokument til Portfolio Risk Analyzer skattesimulator  
**Status:** Audit-ready dokumentation  

---

## 1. Hvad er kapitalindkomst?

Kapitalindkomst er en af de tre indkomsttyper i dansk skattelovgivning (de to andre er personlig indkomst og aktieindkomst). Kapitalindkomst omfatter afkast fra finansielle investeringer der **ikke** kvalificerer som aktieindkomst.

**Hjemmel:** Personskattelovens (PSL) §4

### 1.1 Hvad hører under kapitalindkomst (investeringsrelevant)

| Aktivtype | Beskatningsprincip | Hjemmel |
|---|---|---|
| ETF'er IKKE på positivlisten | Lagerbeskatning | ABL §19 |
| Akkumulerende fonde IKKE på positivlisten | Lagerbeskatning | ABL §19 |
| Finansielle kontrakter (CFD, futures, optioner) | Lagerbeskatning | KGL §29 |
| Obligationer | Realisationsbeskatning | KGL §14 |
| Renteindtægter | Løbende beskatning | SL §4 |
| Valutakursgevinster (visse) | Realisationsbeskatning | KGL §16 |

### 1.2 Hvad hører IKKE under kapitalindkomst

| Aktivtype | Indkomsttype | Beskatning |
|---|---|---|
| Aktier (alle — noterede og unoterede) | Aktieindkomst | 27%/42% |
| ETF'er PÅ positivlisten | Aktieindkomst | 27%/42% lager |
| Akkumulerende fonde PÅ positivlisten | Aktieindkomst | 27%/42% lager |
| Udbyttebetalende aktiebaserede fonde | Aktieindkomst | 27%/42% realisation |
| Alt på ASK | Særskilt 17% | Flat |
| Alt på pension | PAL-skat 15,3% | Flat |
| Alt på børneopsparing | 0% | Skattefrit |

---

## 2. Beskatning af positiv kapitalindkomst

Positiv kapitalindkomst (nettogevinst) beskattes som personlig indkomst. Det betyder at den lægges ovenpå din øvrige indkomst og beskattes med de gældende indkomstskattesatser.

### 2.1 Skattekomponenter (2026-satser)

| Komponent | Sats | Hjemmel |
|---|---|---|
| Bundskat | 12,09% | PSL §6 |
| Kommuneskat | ca. 23,39–26,30% (varierer) | Kommuneskatteloven |
| Kirkeskat (medlem) | ca. 0,44–1,30% | Lov om folkekirkens økonomi |
| Topskat (kun over grænse) | 15% | PSL §7 |

### 2.2 Samlet effektiv sats

**Uden topskat:** ca. 36–39% (afhængigt af kommune og kirkeskat)  
**Med topskat:** ca. 51–54% (dog reduceret af skatteloftet — se afsnit 2.3)

### 2.3 Topskattens påvirkning af kapitalindkomst

Positiv nettokapitalindkomst over et bestemt bundfradrag udløser topskat:

| Parameter | 2026-værdi | Hjemmel |
|---|---|---|
| Topskattegrænse (personlig indkomst) | 588.900 kr | PSL §7 stk. 1 |
| Bundfradrag for positiv kapitalindkomst (topskat) | 51.000 kr (enlig) / 102.000 kr (gift samlet) | PSL §7 stk. 2 |

**Vigtigt:** Kun positiv nettokapitalindkomst *over* bundfradraget lægges til personlig indkomst ved beregning af topskat. Den resterende beskattes stadig med bundskat + kommuneskat.

### 2.4 Skatteloft

Det samlede skatteloft sikrer at den marginale skatteprocent ikke overstiger et maksimum:

| Parameter | 2026-værdi | Hjemmel |
|---|---|---|
| Skatteloft (ekskl. kirkeskat) | 52,07% | PSL §19 |

**Effekt:** Hvis kommuneskat + bundskat + topskat overstiger 52,07%, nedsættes topskatten tilsvarende. Kirkeskat indgår IKKE i skatteloftet.

---

## 3. Beskatning af negativ kapitalindkomst (tab)

**KRITISK ASYMMETRI:** Tab i kapitalindkomst giver LAVERE fradragsværdi end den skat man betaler af gevinster. Dette er en af de vigtigste mekanismer at forstå for skattesimulatoren.

### 3.1 Fradragsværdi — to trin

| Interval | Fradragsværdi | Sammensætning | Hjemmel |
|---|---|---|---|
| Op til 50.000 kr (enlig) / 100.000 kr (gift) | ca. 33,6% | Kommuneskat (~25%) + 8% ekstra nedslag | LL §6 stk. 2 |
| Over grænsen | ca. 25,6% | Kun kommuneskat + evt. kirkeskat | PSL §11 |

### 3.2 Det 8% ekstra nedslag (kompensationsordning)

For at kompensere for den asymmetriske beskatning har man indført et ekstra nedslag:

- **Sats:** 8% af negativ nettokapitalindkomst (ekstra skatteværdi)
- **Grænse:** Max 50.000 kr negativ kapitalindkomst (enlig) → maks 4.000 kr i nedslag
- **Gift:** Grænsen er 100.000 kr samlet → maks 8.000 kr i nedslag
- **Ægtefælle:** Uudnyttet nedslag kan overføres til ægtefællen
- **Hjemmel:** Ligningslovens §6 stk. 2

### 3.3 Asymmetrien illustreret

**Eksempel — ETF ikke på positivlisten, kommune: København (23,39%)**

| Scenarie | Beløb | Skat/fradrag | Effektiv sats |
|---|---|---|---|
| Gevinst 100.000 kr | +100.000 kr | Betaler ~37.500 kr | ~37,5% |
| Tab 100.000 kr | -100.000 kr | Sparer ~29.400 kr | ~29,4% |
| **Asymmetri** | | **8.100 kr forskel** | **~8 procentpoint** |

Beregning af fradrag ved tab:
- Første 50.000 kr: 23,39% + 8% = 31,39% → 15.695 kr
- Næste 50.000 kr: 23,39% + 0,7% kirkeskat ≈ 24,09% → 12.045 kr  
- Samlet fradrag: ~27.740 kr → effektiv sats ~27,7%

*(Præcise tal afhænger af individuelle skatteforhold, kommune og kirkeskat)*

### 3.4 INGEN fremførsel af tab

**KRITISK REGEL:** Negativ kapitalindkomst kan IKKE fremføres til næste år. Fradraget gælder KUN i det indkomstår tabet opstår.

**Undtagelse:** Finansielle kontrakter — se afsnit 4.

### 3.5 Ægtefælleeffekt ved negativ kapitalindkomst

| Regel | Detalje |
|---|---|
| 100.000 kr grænsen | Deles mellem ægtefæller (50.000 + 50.000) |
| 8% nedslaget | Uudnyttet nedslag fra den ene kan overføres til den anden |
| Kapitalindkomst generelt | Ægtefællers kapitalindkomst opgøres individuelt, men nedslaget kan deles |

---

## 4. Finansielle kontrakter — særregler (KGL §29)

Finansielle kontrakter har HELT EGNE regler der adskiller sig markant fra øvrig kapitalindkomst.

### 4.1 Hvad er en finansiel kontrakt?

| Type | Eksempler | Hjemmel |
|---|---|---|
| Differencekontrakter | CFD'er | KGL §29 stk. 1 |
| Terminskontrakter | Futures, forwards | KGL §29 stk. 1 |
| Optioner | Call, put | KGL §29 stk. 1 |
| Warrants | Strukturerede warrants | KGL §29 stk. 1 |
| Swaps | Renteswaps, valutaswaps | KGL §29 stk. 1 |

### 4.2 Beskatningsprincip

- **Lagerbeskatning:** Urealiserede gevinster og tab beskattes årligt pr. 31. december
- **Indkomsttype:** Kapitalindkomst
- **Sats:** ca. 37–42% (som øvrig kapitalindkomst)
- **Hjemmel:** KGL §33 stk. 1

### 4.3 Kildeartsbegrænsning (den vigtigste regel)

**Tab på finansielle kontrakter kan KUN modregnes i gevinster på ANDRE finansielle kontrakter.**

| Regel | Detalje | Hjemmel |
|---|---|---|
| Tab kan modregnes i | Gevinster på andre finansielle kontrakter (samme år) | KGL §29 stk. 3 |
| Tab kan IKKE modregnes i | Øvrig kapitalindkomst (renter, ETF-gevinster etc.) | KGL §29 stk. 3 |
| Tab kan IKKE modregnes i | Aktieindkomst | KGL §29 stk. 3 |
| Fremførsel | Uendeligt — tab fremføres til fremtidige år | KGL §29 stk. 3 |
| Ægtefælle | INGEN overførsel af tab fra finansielle kontrakter | KGL §29 stk. 3 |

### 4.4 Tabsbank for finansielle kontrakter

I modsætning til øvrig kapitalindkomst FINDES der en tabsbank for finansielle kontrakter:

- Tab akkumuleres år for år
- Modregnes FØRST i gevinster fra finansielle kontrakter i efterfølgende år
- Fremføres uendeligt (ingen tidsbegrænsning)
- Kan ALDRIG bruges mod andet end finansielle kontrakter
- Mistes IKKE (medmindre personen dør eller emigrerer)

### 4.5 Eksempel — finansielle kontrakter

| År | CFD-gevinst | CFD-tab | Tabsbank primo | Beskatningsgrundlag | Tabsbank ultimo |
|---|---|---|---|---|---|
| 2024 | 0 kr | -80.000 kr | 0 kr | 0 kr (tab fremføres) | 80.000 kr |
| 2025 | 50.000 kr | 0 kr | 80.000 kr | 0 kr (modregnet) | 30.000 kr |
| 2026 | 40.000 kr | 0 kr | 30.000 kr | 10.000 kr (rest beskattes) | 0 kr |

---

## 5. Lagerbeskatning vs. realisationsbeskatning

### 5.1 Lagerbeskatning (de fleste kapitalindkomst-aktiver)

- Beskatning af urealiserede gevinster/tab hvert år pr. 31. december
- Beregning: (Værdi 31/12) – (Værdi 1/1 eller købspris) = årets gevinst/tab
- Gælder: ETF'er (uanset positivliste), akkumulerende fonde, finansielle kontrakter
- **Hjemmel:** ABL §23 stk. 7 (for investeringsselskaber), KGL §33 (for finansielle kontrakter)

### 5.2 Realisationsbeskatning (obligationer, visse andre)

- Beskatning kun ved salg/indfrielse
- Beregning: Salgspris – Købspris = gevinst/tab
- Gælder: Obligationer, valutagevinster
- **Hjemmel:** KGL §14, KGL §16

### 5.3 Implikationer for skattesimulatoren

| Princip | Skattetidspunkt | Cash flow-effekt |
|---|---|---|
| Lagerbeskatning | Årligt 31/12 | Kan udløse skattebetaling UDEN at man har solgt |
| Realisationsbeskatning | Ved salg | Skat først når gevinsten realiseres |

**Vigtigt for simulatoren:** Ved lagerbeskatning skal systemet beregne urealiseret gevinst/tab for HVERT aktiv pr. 31. december og summere til kapitalindkomst.

---

## 6. Positivlistens rolle

### 6.1 Hvad er positivlisten?

SKATs liste over godkendte ETF'er og investeringsforeninger der beskattes som aktieindkomst i stedet for kapitalindkomst.

- **Opdateres:** Årligt af Skattestyrelsen
- **Findes på:** skat.dk (søg "positivlisten")
- **Hjemmel:** ABL §19, jf. §20A og §21

### 6.2 Hvor gælder positivlisten?

| Kontotype | Positivlisten relevant? | Effekt |
|---|---|---|
| Fri Depot | JA — afgørende | Bestemmer aktieindkomst vs. kapitalindkomst |
| ASK | JA — men kun som adgangsfilter | Kun positivliste-aktiver er TILLADT |
| Pension | NEJ — irrelevant | Alt beskattes med 15,3% PAL uanset |
| Børneopsparing | NEJ — irrelevant | 0% skat uanset |

### 6.3 Konsekvens af at investere i aktiver IKKE på positivlisten (Fri Depot)

| Parameter | Positivliste | Ikke positivliste |
|---|---|---|
| Indkomsttype | Aktieindkomst | Kapitalindkomst |
| Skattesats gevinst | 27%/42% | ~37–42% |
| Tab — fradragsværdi | Tabsbank + ægtefælle | ~25–33%, intet fremførsel |
| Beskatningsprincip | Lagerbeskatning | Lagerbeskatning |
| Ægtefælleoverførsel af tab | Ja, obligatorisk | Begrænset (kun nedslaget) |

**Konklusion:** Forskellen mellem positivliste og ikke-positivliste kan betyde op til 15 procentpoint forskel i effektiv beskatning, plus markant dårligere tabsbehandling.

---

## 7. Samlet overblik — tabsbehandling pr. kategori

| Kategori | Fradrag | Fremførsel | Ægtefælle | Tabsbank |
|---|---|---|---|---|
| Aktieindkomst (noteret) — ABL §13A | Kun mod andre noterede + positivliste (kildeartsbegrænset) | Uendeligt | Obligatorisk | Ja |
| Aktieindkomst (unoteret) — ABL §13 | Fuldt fradrag i AL aktieindkomst (IKKE kildeartsbegrænset) | Uendeligt | Valgfri | Nej (modregnes direkte) |
| Kapitalindkomst (generel) | ~25–33% fradrag | INTET | Delvist (nedslag) | Nej |
| Finansielle kontrakter | Kun mod fin. kontrakter | Uendeligt | Nej | Ja (isoleret) |
| ASK | Kun på samme konto | Ja (på kontoen) | Nej | Isoleret |
| Pension | Kun på samme ordning | Ja (på ordningen) | Nej | Isoleret |
| Børneopsparing | Intet fradrag | Nej | Nej | Nej |

---

## 8. Implementeringsnoter til skattesimulatoren

### 8.1 Nødvendige datafelter pr. investering

For at beregne kapitalindkomst korrekt skal simulatoren for hvert aktiv registrere:

1. **Kontotype** — Fri Depot / ASK / Pension / Børneopsparing
2. **Aktivtype** — Aktie / ETF / Fond / Obligation / Finansiel kontrakt
3. **Positivliste-status** — Ja / Nej (lookup mod SKATs liste via ISIN)
4. **Beskatningsprincip** — Lager / Realisation (afledt af aktivtype)
5. **Indkomsttype** — Aktieindkomst / Kapitalindkomst (afledt af ovenstående)
6. **Anskaffelsessum** — Oprindelig købspris
7. **Markedsværdi primo** — Værdi 1. januar (for lager)
8. **Markedsværdi ultimo** — Værdi 31. december (for lager)
9. **Realiseret gevinst/tab** — Ved salg (for realisation)

### 8.2 Beregningsrækkefølge

1. Klassificer hvert aktiv → kontotype → aktivtype → positivliste → indkomsttype
2. Beregn gevinst/tab pr. aktiv (lager eller realisation)
3. Summér aktieindkomst (alle aktieindkomst-aktiver)
4. Summér kapitalindkomst ekskl. finansielle kontrakter
5. Summér finansielle kontrakter separat (kildeartsbegrænset)
6. Anvend tabsbanker (aktieindkomst-tabsbank, finansiel kontrakt-tabsbank)
7. Beregn netto kapitalindkomst → anvend asymmetrisk beskatning
8. Beregn ægtefælleoverførsler (aktieindkomst obligatorisk, kapitalindkomst nedslag)
9. Beregn samlet skat

### 8.3 Kritiske edge cases

| Edge case | Håndtering |
|---|---|
| ETF skifter positivliste-status | Tjek ISIN mod gældende års liste |
| Lagerbeskatning giver tab → næste år gevinst | Nulstil kostpris til ultimo-værdi |
| Negativ kapitalindkomst præcis 50.000 kr | Fuld 8% nedslag på hele beløbet |
| Gift med fælles kapitalindkomst | Opgør individuelt, del 100.000 kr grænsen |
| Finansiel kontrakt-tab + ETF-gevinst | ADSKIL — kan ikke modregnes |
| Investor har BÅDE positivliste og ikke-positivliste ETF | Beregn indkomsttype pr. ISIN |
| First North / Spotlight aktier (fra 2024) | Behandles som NOTEREDE (ABL §13A) — kildeartsbegrænset |
| Unoteret tab + ingen anden aktieindkomst | Negativ aktieindkomst → skatteværdi (27%/42%) modregnes direkte i slutskat |
| Noteret tab vs. unoteret tab | NOTEREDE er kildeartsbegrænset (ABL §13A), UNOTEREDE har fuldt fradrag (ABL §13) |

---

## 9. Lovhenvisninger (komplet)

| Lov | Forkortelse | Relevante paragraffer |
|---|---|---|
| Personskatteloven | PSL | §4 (kapitalindkomst), §6 (bundskat), §7 (topskat), §11 (fradrag), §19 (skatteloft) |
| Aktieavancebeskatningsloven | ABL | §19 (investeringsselskaber), §20A, §21, §23 stk. 7 (lager) |
| Kursgevinstloven | KGL | §14 (obligationer), §16 (valuta), §29 (finansielle kontrakter), §33 (lager) |
| Ligningsloven | LL | §6 stk. 2 (8% nedslag negativ kapitalindkomst) |
| Pensionsbeskatningsloven | PBL | §51 (børneopsparing) |
| Statsskatteloven | SL | §4 (renter) |

### 9.1 SKAT.dk-links

| Emne | URL |
|---|---|
| Kapitalindkomst oversigt | skat.dk/borger/selvangivelse-og-aarsopgoerelse/kapitalindkomst |
| Aktier og investeringer | skat.dk/skat-af-aktier |
| Aktiesparekonto | skat.dk/aktiesparekonto |
| Pensionsafkast | skat.dk/skat-af-pensionsafkast |
| Positivlisten | skat.dk (søg "positivlisten for aktiesparekontoen") |
| Finansielle kontrakter | skat.dk/borger/selvangivelse-og-aarsopgoerelse/kapitalindkomst |

---

## 10. Ændringslog

| Dato | Ændring | Af |
|---|---|---|
| 2026-02-03 | Oprettet — komplet kapitalindkomst-reference | Claude / Frank |
| 2026-02-03 | RETTET: Unoterede aktier tab er IKKE kildeartsbegrænset (ABL §13). Fuldt fradrag i al aktieindkomst, valgfri ægtefælleoverførsel. Noterede aktier (ABL §13A) er kildeartsbegrænset med obligatorisk ægtefælleoverførsel. | Frank (korrektur) |
