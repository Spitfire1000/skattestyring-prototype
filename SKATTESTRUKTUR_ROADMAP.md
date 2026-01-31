# Skattestyring - Roadmap & Fremtidige Versioner

**Dato:** 31. januar 2025  
**Status:** Planlægning

---

## Versions-oversigt

| Version | Fokus | Status |
|---------|-------|--------|
| **v1.0** | Private kontotyper med selvvalgte investeringer | 🚧 Under udvikling |
| **v2.0** | Pensionsselskaber (manuel indtastning) | 📋 Planlagt |
| **v3.0** | Pensionsselskaber (automatisk via PensionsInfo) | 💡 Idé |
| **v4.0** | Erhvervskonti (VSO, ApS/A/S) | 💡 Idé |

---

## v1.0 - Private kontotyper (NUVÆRENDE FOKUS)

### Understøttede kontotyper

| Kontotype | Datakilde | Beskatning |
|-----------|-----------|------------|
| FRIT DEPOT | CSV fra mægler | Årsopgørelse (27%/42%) |
| ASK | CSV fra mægler | 17% lager |
| RATEPENSION (selvvalgt) | CSV fra mægler | 15,3% PAL |
| ALDERSOPSPARING (selvvalgt) | CSV fra mægler | 15,3% PAL |
| LIVRENTE (selvvalgt) | CSV fra mægler | 15,3% PAL |
| KAPITALPENSION (selvvalgt) | CSV fra mægler | 15,3% PAL |
| BØRNEOPSPARING | CSV fra mægler | Skattefri |

### Understøttede mæglere

- Nordnet (inkl. pension)
- Saxo Bank (inkl. pension)
- (Flere tilføjes løbende)

### Funktioner

- ✅ Skatteberegning per konto
- ✅ Samlet skatteposition
- ✅ Fradragsbank (tabssporing)
- ✅ Klassificering af aktiver
- ✅ Positivliste-validering (ETF'er)

---

## v2.0 - Pensionsselskaber (manuel)

### Problem

Mange danskere har pension hos selskaber som PFA, Danica, Velliv, AP Pension, hvor de IKKE selv vælger investeringer. Disse selskaber:

- Investerer i egne fonde/puljer
- Giver ikke CSV med enkeltpositioner
- Oplyser kun samlet værdi og afkast

### Løsning: Manuel indtastning

```
PENSIONSSELSKAB (manuel)
┌─────────────────────────────────────────────────────────────┐
│ Selskab: [PFA / Danica / Velliv / AP Pension / Andet]      │
│ Type: [Ratepension / Aldersopsparing / Livrente / ...]     │
│                                                             │
│ Værdi primo år:  [_________] kr                            │
│ Værdi ultimo år: [_________] kr                            │
│                                                             │
│ → Beregnet PAL-skat (15,3%): X.XXX kr                      │
└─────────────────────────────────────────────────────────────┘
```

### Fordele

- Bruger får **samlet overblik** over AL pension
- Korrekt beregning af total PAL-skat
- Ingen integration nødvendig - bruger indtaster selv

### Datakilder for brugeren

- Årsopgørelse fra pensionsselskabet
- PensionsInfo.dk (login med MitID)
- Pensionsoversigt i e-Boks

### Implementation

- Ny kontotype: `PENSION_SELSKAB`
- Felter: selskab, type, værdiPrimo, værdiUltimo
- Beregning: (værdiUltimo - værdiPrimo) × 15,3%
- Isoleret tabspulje (som andre pensioner)

---

## v3.0 - PensionsInfo integration (automatisk)

### Idé

Integration med PensionsInfo.dk API (hvis tilgængeligt) til automatisk at hente:

- Alle brugerens pensionsordninger
- Værdier og afkast
- Indbetalinger

### Udfordringer

- Kræver MitID-integration
- API-adgang skal forhandles
- GDPR/samtykke-håndtering
- Teknisk kompleksitet

### Status

💡 **Idé** - Undersøges om det er muligt/tilladt

---

## v4.0 - Erhvervskonti

### Kontotyper

| Type | Beskatning | Kompleksitet |
|------|------------|--------------|
| Personlig virksomhed (VSO) | 22% virksomhedsskat + ophørsskat | ⚠️ Meget kompleks |
| Selskab (ApS/A/S) | 22% selskabsskat + udbytteskat | ⚠️ Kræver revisor |
| Holding-selskab | Skattefri datterselskabsudbytter | ⚠️ Avanceret |

### Hvorfor vente?

1. **Kompleksitet** - VSO har kapitalafkastordning, hæveregler, etc.
2. **Ansvar** - Fejl kan have store konsekvenser
3. **Målgruppe** - Erhverv har typisk revisor
4. **Bogføringspligt** - Andet regelsæt

### Mulig tilgang

- Separat modul med stor disclaimer
- Anbefaling om revisor-gennemgang
- Fokus på overblik, ikke detailberegning

### Status

💡 **Idé** - Afventer v1-v3 succes

---

## Samlet vision

```
TOTAL OVERBLIK (fremtidig)
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRANKS INVESTERINGER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRIVATE KONTI (v1)                                                    │
│  ├── Frit depot (Nordnet): 450.000 kr                                  │
│  ├── ASK (Nordnet): 174.200 kr                                         │
│  └── Ratepension (Nordnet): 89.000 kr                                  │
│                                                                         │
│  PENSIONSSELSKABER (v2)                                                │
│  ├── PFA Ratepension: 1.200.000 kr                                     │
│  └── Danica Livrente: 340.000 kr                                       │
│                                                                         │
│  ERHVERV (v4)                                                          │
│  └── Holding ApS: 2.500.000 kr                                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  SAMLET FORMUE: 4.753.200 kr                                           │
│  ESTIMERET ÅRLIG SKAT: ~XX.XXX kr                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Prioritering

| Prioritet | Version | Begrundelse |
|-----------|---------|-------------|
| 1️⃣ | v1.0 | Kernefunktionalitet for målgruppen |
| 2️⃣ | v2.0 | Stort behov, lav kompleksitet |
| 3️⃣ | v3.0 | Nice-to-have, høj kompleksitet |
| 4️⃣ | v4.0 | Anden målgruppe, meget kompleks |

---

*Dokument oprettet: 31. januar 2025*
