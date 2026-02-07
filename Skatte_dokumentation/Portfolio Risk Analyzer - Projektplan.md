# Portfolio Risk Analyzer - Projektplan

**Sidst opdateret:** 22. januar 2025
**Status:** I udvikling

---

## ðŸ“‹ Overblik

### Vision
En webapplikation hvor familier kan uploade deres investeringsportefÃ¸ljer og fÃ¥ en letforstÃ¥elig risikoanalyse. Hver bruger kan have flere profiler (sig selv, partner, bÃ¸rn, fÃ¦lles) og holde styr pÃ¥ hver persons risiko.

### NuvÃ¦rende status
- âœ… Landing page (basis - skal forbedres senere)
- âœ… Login/Signup med email
- âœ… Firebase authentication
- âœ… Upload flow (virker, men skal redesignes)
- âœ… CSV parsing (Nordnet format)
- âœ… Verification modal
- âœ… Risk dashboard og analyse (FÃ†RDIGT DESIGN)

---

## ðŸŽ¯ Udviklingsplan

### FASE 0: Login forbedringer
**MÃ¥l:** GÃ¸r det nemmere at oprette konto

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 0.1 | AktivÃ©r Google login i Firebase Console | â¬œ | HÃ¸j |
| 0.2 | TilfÃ¸j "FortsÃ¦t med Google" knap pÃ¥ login-side | â¬œ | HÃ¸j |
| 0.3 | TilfÃ¸j "FortsÃ¦t med Google" knap pÃ¥ signup-side | â¬œ | HÃ¸j |
| 0.4 | Test at Google login virker | â¬œ | HÃ¸j |
| 0.5 | (Senere) Apple login nÃ¥r developer konto er klar | â¬œ | Lav |

**Definition of done:** Brugere kan oprette konto og logge ind med Google med Ã©t klik.

---

### FASE 1: Profil-system
**MÃ¥l:** Brugere kan oprette og administrere familie-profiler

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 1.1 | Design profil-vÃ¦lger komponent | â¬œ | HÃ¸j |
| 1.2 | Opret profil-side/modal med felter (navn, relation) | â¬œ | HÃ¸j |
| 1.3 | Gem profiler i Firebase under brugerens konto | â¬œ | HÃ¸j |
| 1.4 | Vis liste over profiler med avatars/farver | â¬œ | HÃ¸j |
| 1.5 | VÃ¦lg aktiv profil fÃ¸r upload | â¬œ | HÃ¸j |
| 1.6 | Rediger eksisterende profil | â¬œ | Medium |
| 1.7 | Slet profil (med bekrÃ¦ftelse) | â¬œ | Medium |
| 1.8 | Automatisk "Mig selv" profil ved fÃ¸rste login | â¬œ | HÃ¸j |

**Definition of done:** Bruger kan oprette profiler for hele familien og vÃ¦lge hvem de uploader for.

---

### FASE 2: Nyt upload-layout
**MÃ¥l:** SimplificÃ©r upload til Ã©n side med alt synligt

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 2.1 | Design nyt layout (se wireframe nedenfor) | â¬œ | HÃ¸j |
| 2.2 | Fjern 3-step flow (mÃ¦gler â†’ guide â†’ upload) | â¬œ | HÃ¸j |
| 2.3 | Byg profil-vÃ¦lger i venstre side | â¬œ | HÃ¸j |
| 2.4 | Byg hjÃ¦lpe-guides sidebar til hÃ¸jre | â¬œ | HÃ¸j |
| 2.5 | Central drop-zone med "Upload til: [Profil]" | â¬œ | HÃ¸j |
| 2.6 | Kollapsbare guide-sektioner (Nordnet, Saxo, etc.) | â¬œ | Medium |
| 2.7 | Vis "Vi analyserer: Aktier, ETF'er, Fonde" | â¬œ | Lav |

**Wireframe:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header: RiskView logo          [Profil dropdown] [Log ud] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚                 â”‚  â”‚               â”‚  â”‚               â”‚ â”‚
â”‚  â”‚  PROFIL VÃ†LGER  â”‚  â”‚   DROP-ZONE   â”‚  â”‚    GUIDES     â”‚ â”‚
â”‚  â”‚                 â”‚  â”‚               â”‚  â”‚               â”‚ â”‚
â”‚  â”‚  [Frank] â†      â”‚  â”‚  TrÃ¦k fil     â”‚  â”‚ ðŸ“˜ Nordnet    â”‚ â”‚
â”‚  â”‚  [Partner]      â”‚  â”‚  hertil       â”‚  â”‚ ðŸ“— Saxo       â”‚ â”‚
â”‚  â”‚  [Barn]         â”‚  â”‚               â”‚  â”‚ ðŸ“™ Anden      â”‚ â”‚
â”‚  â”‚  [+ TilfÃ¸j]     â”‚  â”‚  Upload til:  â”‚  â”‚               â”‚ â”‚
â”‚  â”‚                 â”‚  â”‚  Frank        â”‚  â”‚               â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                             â”‚
â”‚  Vi analyserer: âœ“ Aktier  âœ“ ETF'er  âœ“ Fonde                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Definition of done:** Upload-siden er Ã©n overskuelig side hvor brugeren kan vÃ¦lge profil, se guides, og uploade fil.

---

### FASE 3: PortefÃ¸lje-historik
**MÃ¥l:** Brugere kan se tidligere uploads per profil

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 3.1 | Gem hver upload med tidsstempel i Firebase | â¬œ | HÃ¸j |
| 3.2 | Vis liste over tidligere uploads per profil | â¬œ | HÃ¸j |
| 3.3 | Klik pÃ¥ tidligere upload for at se analyse igen | â¬œ | HÃ¸j |
| 3.4 | Slet gammel upload | â¬œ | Medium |
| 3.5 | Vis Ã¦ndring over tid (simpel graf) | â¬œ | Lav |

**Definition of done:** Bruger kan se historik over tidligere analyser og sammenligne.

---

### FASE 4: Familie-oversigt (fremtidig)
**MÃ¥l:** Se samlet risiko for flere profiler

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 4.1 | Design familie-dashboard | â¬œ | Medium |
| 4.2 | AggregÃ©r risiko fra flere profiler | â¬œ | Medium |
| 4.3 | Vis sammenligning mellem familiemedlemmer | â¬œ | Lav |
| 4.4 | "FÃ¦lles" profil der kombinerer flere | â¬œ | Lav |

**Definition of done:** Bruger kan se samlet familierisiko og sammenligne medlemmer.

---

### FASE 5: Landing page redesign (fremtidig)
**MÃ¥l:** Professionel landing page der konverterer besÃ¸gende

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 5.1 | Ny hero sektion med animation/video | â¬œ | Medium |
| 5.2 | Bedre produktbeskrivelse | â¬œ | Medium |
| 5.3 | Testimonials/social proof | â¬œ | Lav |
| 5.4 | Pricing sektion (nÃ¥r betalingsplaner er klar) | â¬œ | Lav |
| 5.5 | FAQ sektion | â¬œ | Lav |

---

### FASE 6: Betalingssystem (fremtidig)
**MÃ¥l:** Monetisering med abonnementer

| # | Opgave | Status | Prioritet |
|---|--------|--------|-----------|
| 6.1 | Definer pricing tiers (Free, Plus, Pro) | â¬œ | - |
| 6.2 | Integrer Stripe | â¬œ | - |
| 6.3 | BegrÃ¦nsninger per tier | â¬œ | - |
| 6.4 | Upgrade/downgrade flow | â¬œ | - |

---

## ðŸŽ¨ Design-principper

**BEHOLD disse fra analyse-dashboardet:**
- MÃ¸rkt tema: `bg-[#0a0f1c]`
- Gradient accenter: `from-sky-500 to-indigo-600`
- Runde hjÃ¸rner: `rounded-xl` / `rounded-2xl`
- Subtle borders: `border-slate-700/50`
- Glassmorphism: `bg-slate-800/30 backdrop-blur`
- Farve-kodning: GrÃ¸n=god, Gul=advarsel, RÃ¸d=risiko

**Fonts:**
- Headings: Bold, white
- Body: slate-300/400
- Labels: slate-500, uppercase, text-xs

---

## ðŸ“ Filstruktur (nuvÃ¦rende)

```
src/
â”œâ”€â”€ App.tsx                     # Routing og providers
â”œâ”€â”€ main.tsx                    # Entry point
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ Layout/                 # Header, Footer
â”‚   â”œâ”€â”€ Upload/                 # UploadFlow, BrokerSelector, etc.
â”‚   â”œâ”€â”€ Verification/           # VerificationModal
â”‚   â”œâ”€â”€ Risk/                   # RiskDashboard, VaRDisplay, etc. âœ…
â”‚   â”œâ”€â”€ Portfolio/              # PositionTable, PortfolioSummary
â”‚   â””â”€â”€ FileUpload/             # DropZone, FilePreview
â”œâ”€â”€ contexts/
â”‚   â”œâ”€â”€ AuthContext.tsx         # Firebase auth
â”‚   â””â”€â”€ ProfileContext.tsx      # Profil-hÃ¥ndtering
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ LandingPage.tsx
â”‚   â”œâ”€â”€ LoginPage.tsx
â”‚   â”œâ”€â”€ SignupPage.tsx
â”‚   â””â”€â”€ MainApp.tsx             # Hovedapp efter login
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ firebase.ts             # Firebase config
â”‚   â”œâ”€â”€ csvParser.ts            # CSV parsing
â”‚   â”œâ”€â”€ riskCalculator.ts       # Risk beregninger
â”‚   â””â”€â”€ api.ts                  # Backend API kald
â”œâ”€â”€ hooks/
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ types/
â”‚   â””â”€â”€ index.ts                # TypeScript interfaces
â””â”€â”€ utils/
    â””â”€â”€ index.ts                # Formattering, hjÃ¦lpefunktioner
```

---

## ðŸ”§ Teknisk stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Build | Vite |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Analytics | Firebase Analytics (+ Plausible senere) |
| Backend | Python FastAPI (din makkers domÃ¦ne) |
| Hosting | (TBD - Vercel, Firebase Hosting, eller andet) |

---

## ðŸ“… NÃ¦ste skridt

**Start med Fase 0.1:**
1. GÃ¥ til Firebase Console â†’ Authentication â†’ Sign-in method
2. AktivÃ©r Google provider
3. Sig til Claude nÃ¥r det er gjort

---

## ðŸ“ Noter

- Risk dashboard designet er LÃ…ST - det skal ikke Ã¦ndres
- Backend (VaR beregninger) hÃ¥ndteres af makker
- CSV parsing virker for Nordnet, Saxo kommer senere
- Apple login krÃ¦ver Apple Developer konto ($99/Ã¥r)

---

*Denne plan opdateres lÃ¸bende. MarkÃ©r opgaver med âœ… nÃ¥r de er fÃ¦rdige.*
