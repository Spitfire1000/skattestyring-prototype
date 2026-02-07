# Claude Code Opgave: Opret Skattestyring som SelvstÃ¦ndigt Projekt

## MÃ¥l

Opret et **helt selvstÃ¦ndigt React-projekt** for Skattestyring-prototypen. Det skal:

1. **KÃ¸re pÃ¥ egen port** - `localhost:5174` (sÃ¥ det ikke konflikter med hovedprojektet pÃ¥ 5173)
2. **VÃ¦re selvstÃ¦ndigt** - Eget projekt der kan udvikles uafhÃ¦ngigt
3. **Kunne integreres senere** - Koden kan flyttes til hovedprojektet nÃ¥r det er klar

---

## Trin 1: Opret nyt Vite + React + TypeScript projekt

```bash
# Opret nyt projekt i en separat mappe
cd ~/projects  # eller hvor du har dine projekter
npm create vite@latest skattestyring-prototype -- --template react-ts

# GÃ¥ ind i mappen
cd skattestyring-prototype

# Installer dependencies
npm install

# Installer Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Trin 2: Konfigurer til port 5174

Opdater `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,        // KÃ¸rer pÃ¥ 5174 i stedet for 5173
    strictPort: true,  // Fejl hvis porten er optaget (i stedet for at vÃ¦lge anden)
  }
})
```

---

## Trin 3: Konfigurer Tailwind

Opdater `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Opdater `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* MÃ¸rk baggrund som hovedprojektet */
body {
  background-color: #0a0f1c;
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
}
```

---

## Trin 4: Mappestruktur

```
skattestyring-prototype/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ FlowBox.tsx              # Genbrugelig boks
â”‚   â”‚   â”œâ”€â”€ FlowArrow.tsx            # Pil/streg mellem bokse
â”‚   â”‚   â”œâ”€â”€ FlowSection.tsx          # Sektion med titel
â”‚   â”‚   â””â”€â”€ index.ts                 # Eksporter
â”‚   â”‚
â”‚   â”œâ”€â”€ sections/
â”‚   â”‚   â”œâ”€â”€ KontiSektion.tsx         # Mine konti
â”‚   â”‚   â”œâ”€â”€ AktiverSektion.tsx       # Mine aktiver  
â”‚   â”‚   â”œâ”€â”€ KlassificeringSektion.tsx# Aktie/Kapitalindkomst
â”‚   â”‚   â”œâ”€â”€ BeregningSektion.tsx     # Skatteberegning
â”‚   â”‚   â””â”€â”€ FradragsbankSektion.tsx  # Tab-tracking
â”‚   â”‚
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â””â”€â”€ skat.ts                  # TypeScript types
â”‚   â”‚
â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â””â”€â”€ testdata.ts              # Dummy data til prototype
â”‚   â”‚
â”‚   â”œâ”€â”€ App.tsx                      # Hovedkomponent
â”‚   â”œâ”€â”€ main.tsx                     # Entry point
â”‚   â””â”€â”€ index.css                    # Tailwind + basis styling
â”‚
â”œâ”€â”€ README.md                        # Dokumentation
â”œâ”€â”€ vite.config.ts
â”œâ”€â”€ tailwind.config.js
â”œâ”€â”€ package.json
â””â”€â”€ tsconfig.json
```

---

## Trin 5: Komponenter

### FlowBox.tsx

```tsx
interface FlowBoxProps {
  title: string;
  subtitle?: string;
  items?: string[];
  highlight?: boolean;
  className?: string;
}

export function FlowBox({ title, subtitle, items, highlight, className = '' }: FlowBoxProps) {
  return (
    <div className={`
      border border-white/30 
      rounded-lg 
      p-4 
      min-w-[140px]
      ${highlight ? 'border-white/60' : ''}
      ${className}
    `}>
      <div className="text-sm font-medium text-white">{title}</div>
      {subtitle && (
        <div className="text-xs text-white/50 mt-1">{subtitle}</div>
      )}
      {items && items.length > 0 && (
        <ul className="mt-2 text-xs text-white/70 space-y-1">
          {items.map((item, i) => (
            <li key={i}>â€¢ {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### FlowArrow.tsx

```tsx
interface FlowArrowProps {
  direction?: 'down' | 'right';
  label?: string;
}

export function FlowArrow({ direction = 'down', label }: FlowArrowProps) {
  if (direction === 'down') {
    return (
      <div className="flex flex-col items-center py-2">
        <div className="w-px h-6 bg-white/30"></div>
        <div className="text-white/50 text-lg">â†“</div>
        {label && <div className="text-xs text-white/40 mt-1">{label}</div>}
      </div>
    );
  }
  
  return (
    <div className="flex items-center px-2">
      <div className="h-px w-6 bg-white/30"></div>
      <div className="text-white/50">â†’</div>
      {label && <div className="text-xs text-white/40 ml-1">{label}</div>}
    </div>
  );
}
```

### FlowSection.tsx

```tsx
interface FlowSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FlowSection({ title, description, children }: FlowSectionProps) {
  return (
    <div className="border border-white/20 rounded-xl p-6">
      <div className="text-lg font-semibold text-white mb-1">{title}</div>
      {description && (
        <div className="text-sm text-white/50 mb-4">{description}</div>
      )}
      <div className="flex flex-wrap gap-4">
        {children}
      </div>
    </div>
  );
}
```

---

## Trin 6: App.tsx - Hovedvisning

```tsx
import { FlowBox } from './components/FlowBox';
import { FlowArrow } from './components/FlowArrow';
import { FlowSection } from './components/FlowSection';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">SKATTESTYRING - PROTOTYPE</h1>
        <p className="text-white/50 mt-2">Visuel oversigt over dataflow</p>
        <p className="text-xs text-white/30 mt-1">localhost:5174 â€¢ Separat udvikling</p>
      </div>

      {/* Flow */}
      <div className="max-w-4xl mx-auto space-y-2">
        
        {/* Profil */}
        <div className="flex justify-center">
          <FlowBox 
            title="PROFIL" 
            subtitle="Fra ProfileContext"
            highlight
          />
        </div>

        <FlowArrow direction="down" label="Brugerens data" />

        {/* Konti */}
        <FlowSection 
          title="MINE KONTI" 
          description="Hvor har brugeren sine penge?"
        >
          <FlowBox title="FRIT DEPOT" subtitle="Nordnet" />
          <FlowBox title="FRIT DEPOT" subtitle="Saxo" />
          <FlowBox title="ASK" subtitle="Nordnet" />
          <FlowBox title="RATEPENSION" subtitle="Nordea" />
          <FlowBox title="ALDERSOPSPARING" subtitle="PFA" />
        </FlowSection>

        <FlowArrow direction="down" label="Indeholder" />

        {/* Aktiver */}
        <FlowSection 
          title="MINE AKTIVER" 
          description="Data fra 'Mine Positioner' i hovedprojektet"
        >
          <FlowBox 
            title="AKTIER" 
            subtitle="Noterede"
            items={['Novo Nordisk', 'Apple', 'Tesla']}
          />
          <FlowBox 
            title="ETF'er" 
            subtitle="Positivliste"
            items={['iShares World', 'Sparindex']}
          />
          <FlowBox 
            title="ETF'er" 
            subtitle="IKKE positivliste"
            items={['iShares Gold']}
          />
          <FlowBox 
            title="OBLIGATIONER" 
            items={['Realkredit DK']}
          />
          <FlowBox 
            title="KRYPTO" 
            items={['Bitcoin', 'Ethereum']}
          />
        </FlowSection>

        <FlowArrow direction="down" label="Klassificeres til" />

        {/* Klassificering */}
        <FlowSection 
          title="KLASSIFICERING" 
          description="Hvilken indkomsttype?"
        >
          <FlowBox 
            title="AKTIEINDKOMST" 
            subtitle="27% / 42%"
            items={[
              'Aktier (realisation)',
              'ETF positivliste (lager)',
              'Udbytter'
            ]}
          />
          <FlowBox 
            title="KAPITALINDKOMST" 
            subtitle="~37% (asymmetrisk)"
            items={[
              'ETF ikke-positivliste',
              'Obligationer',
              'Optioner/Warrants/CFD',
              'Krypto'
            ]}
          />
        </FlowSection>

        <FlowArrow direction="down" label="Beregner" />

        {/* Skatteberegning */}
        <FlowSection 
          title="SKATTEBEREGNING" 
          description="Hvad skal betales?"
        >
          <FlowBox 
            title="VIA Ã…RSOPGÃ˜RELSE" 
            subtitle="Rubrik 66/67/39"
            items={[
              'Aktieindkomst (27%/42%)',
              'Kapitalindkomst (~37%)'
            ]}
          />
          <FlowBox 
            title="ASK" 
            subtitle="17% lager"
            items={['TrÃ¦kkes automatisk']}
          />
          <FlowBox 
            title="PENSION" 
            subtitle="15,3% PAL"
            items={['TrÃ¦kkes automatisk']}
          />
          <FlowBox 
            title="BÃ˜RNEOPSPARING" 
            subtitle="0%"
            items={['Skattefri']}
          />
        </FlowSection>

        <FlowArrow direction="down" label="Tab gemmes i" />

        {/* Fradragsbank */}
        <FlowSection 
          title="FRADRAGSBANK" 
          description="Tab der kan bruges til at reducere fremtidig skat"
        >
          <FlowBox 
            title="AKTIE-TAB" 
            subtitle="Noterede"
            items={[
              'Mod aktiegevinster',
              'Mod udbytter',
              'Ã†gtefÃ¦lle: JA'
            ]}
          />
          <FlowBox 
            title="AKTIE-TAB" 
            subtitle="Unoterede"
            items={[
              'Mod AL aktieindkomst',
              'Ã†gtefÃ¦lle: JA'
            ]}
          />
          <FlowBox 
            title="KAPITAL-TAB" 
            subtitle="Generel"
            items={[
              'Mod kapitalindkomst',
              'IKKE mod fin. kontrakter',
              'Ã†gtefÃ¦lle: JA'
            ]}
          />
          <FlowBox 
            title="KAPITAL-TAB" 
            subtitle="Finansielle kontrakter"
            items={[
              'âš ï¸ KUN mod andre fin.kontr.',
              'Meget begrÃ¦nset!',
              'Ã†gtefÃ¦lle: JA'
            ]}
          />
          <FlowBox 
            title="ISOLERET TAB" 
            subtitle="ASK"
            items={[
              'Kun samme ASK',
              'âš ï¸ Tabes ved lukning!',
              'Ã†gtefÃ¦lle: NEJ'
            ]}
          />
          <FlowBox 
            title="ISOLERET TAB" 
            subtitle="Pension"
            items={[
              'Kun samme pension',
              'Kan IKKE deles',
              'Ã†gtefÃ¦lle: NEJ'
            ]}
          />
        </FlowSection>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="text-white/30 text-sm">
            Dette er en visuel prototype. Ingen beregninger udfÃ¸res endnu.
          </p>
          <p className="text-white/20 text-xs mt-2">
            NÃ¥r strukturen er godkendt, integreres dette i hovedprojektet.
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;
```

---

## Trin 7: Start projektet

```bash
npm run dev
```

Ã…bn browser pÃ¥: **http://localhost:5174**

---

## Forventet resultat

En side der viser hele skatteberegnings-flowet med:
- Simple hvide bokse med tynde rammer
- Pile der viser dataflow
- Gruppering i sektioner
- Ingen rigtig funktionalitet - kun visuel struktur

---

## NÃ¥r prototypen er klar

1. **Review strukturen** med makker
2. **TilfÃ¸j/fjern bokse** efter behov
3. **NÃ¥r godkendt:** Kopier `src/`-indholdet til hovedprojektets `src/Skattestyring/`
4. **Integrer** med eksisterende ProfileContext og Position-data

---

## Vigtige noter

- **Port 5174** - Konflikter ikke med hovedprojektet (5173)
- **SelvstÃ¦ndigt** - Kan udvikles mens makker arbejder pÃ¥ andet
- **Tailwind CSS** - Samme styling-system som hovedprojektet
- **Samme farver** - `bg-[#0a0f1c]` matcher hovedprojektet
