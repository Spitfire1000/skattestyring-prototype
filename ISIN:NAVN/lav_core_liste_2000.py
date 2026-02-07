#!/usr/bin/env python3
"""
Lav en reduceret core-liste på ~2000 værdipapirer.
Prioriterer: Alle danske + Top USA + Top Europa + Alle ETF'er
"""

import pandas as pd
import json
from pathlib import Path

# ================== KONFIG ==================
CSV_FILER = [
    "ISIN:NAVN/aktiekurser–sedanskeaktiermedmere_6.2.2026_217.csv",
    "ISIN:NAVN/etf'er–børshandledefonde_6.2.2026_219.csv",
    "ISIN:NAVN/fondsliste_6.2.2026_219.csv"
]
OUTPUT_JSON = "src/data/coreAssets.json"
OUTPUT_MAPPER = "src/constants/isinMapper.ts"

# Mål: ca. 2.000 poster
MAX_USA = 1000
MAX_EUROPA = 300
# ============================================

def load_csv_files():
    """Læs alle CSV-filer med korrekt encoding"""
    dfs = []
    encodings = ['utf-16', 'utf-16-le', 'utf-8', 'latin-1']

    for csv_fil in CSV_FILER:
        path = Path(csv_fil)
        if path.exists():
            for enc in encodings:
                try:
                    df = pd.read_csv(path, sep=None, engine='python', encoding=enc, on_bad_lines='skip')
                    print(f"✓ {path.name}: {len(df)} rækker")
                    dfs.append(df)
                    break
                except:
                    continue

    return pd.concat(dfs, ignore_index=True) if dfs else None

print("=" * 50)
print("CORE LISTE 2000")
print("=" * 50)

df = load_csv_files()
if df is None:
    print("Ingen filer kunne læses!")
    exit(1)

print(f"\nTotal: {len(df)} rækker indlæst")

# Ryd kolonnenavne
df = df.rename(columns={
    'Navn': 'navn', 'Ticker': 'ticker', 'ISIN': 'isin',
    'Valuta': 'valuta', 'Market Cap': 'marketCap'
})

df['isin'] = df['isin'].astype(str).str.strip().str.upper()
df = df[df['isin'].str.len() == 12]  # Kun gyldige ISIN'er
df = df.dropna(subset=['navn'])

# Konverter marketCap til numerisk (for sortering)
if 'marketCap' in df.columns:
    df['marketCap'] = pd.to_numeric(df['marketCap'], errors='coerce').fillna(0)
else:
    df['marketCap'] = 0

# Udled aktivType + land
def get_aktiv_type(row):
    isin = str(row.get('isin', '')).upper()
    navn = str(row.get('navn', '')).upper()

    # ETF-logik
    if 'ETF' in navn or 'EXCHANGE TRADED' in navn or 'UCITS' in navn or 'XACT' in navn:
        positivliste = ['MSCI', 'S&P', 'CORE', 'WORLD', 'NASDAQ', 'SPARINDEX', 'STOXX']
        if any(x in navn for x in positivliste):
            return 'ETF_POSITIVLISTE'
        if 'BOND' in navn or 'OBLIGATION' in navn or 'FIXED' in navn:
            return 'ETF_OBLIGATIONSBASERET'
        return 'ETF_IKKE_POSITIVLISTE'

    # Investeringsforeninger
    if 'INVESTERINGSFORENING' in navn or 'INV.' in navn:
        return 'INVF_AKKUMULERENDE' if 'AKK' in navn else 'INVF_UDBYTTEBETALTENDE'

    # Aktier
    if isin.startswith('DK'):
        return 'AKTIE_DK'
    return 'AKTIE_UDENLANDSK'

df['aktivType'] = df.apply(get_aktiv_type, axis=1)
df['land'] = df['isin'].str[:2]

print(f"Efter rensning: {len(df)} værdipapirer")

# === Filtrering til ~2000 poster ===
danske = df[df['land'] == 'DK']
print(f"  Danske: {len(danske)}")

usa = df[df['land'] == 'US'].sort_values('marketCap', ascending=False).head(MAX_USA)
print(f"  USA (top {MAX_USA}): {len(usa)}")

eu_lande = ['DE', 'SE', 'FR', 'NL', 'CH', 'FI', 'NO', 'BE', 'IT', 'ES', 'GB', 'IE']
europa = df[df['land'].isin(eu_lande)].sort_values('marketCap', ascending=False).head(MAX_EUROPA)
print(f"  Europa (top {MAX_EUROPA}): {len(europa)}")

etfs = df[df['aktivType'].str.contains('ETF', na=False)]
print(f"  ETF'er: {len(etfs)}")

result = pd.concat([danske, usa, europa, etfs]).drop_duplicates(subset='isin')

print(f"\n→ Samlet: {len(result)} værdipapirer")

# Aktivtype-fordeling
print("\nFordeling:")
print(result['aktivType'].value_counts().to_string())

# Lav JSON
assets = []
for _, row in result.iterrows():
    assets.append({
        "isin": row['isin'],
        "navn": row['navn'],
        "ticker": row.get('ticker', ''),
        "valuta": row.get('valuta', 'DKK'),
        "land": row['land'],
        "aktivType": row['aktivType']
    })

Path(OUTPUT_JSON).parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(assets, f, indent=2, ensure_ascii=False)

# Lav isinMapper.ts
mapper = [
    '// Auto-genereret core-liste (~2000 værdipapirer)',
    f'// Genereret: {pd.Timestamp.now().strftime("%Y-%m-%d %H:%M")}',
    '',
    'import type { AktivType } from "../types/skat";',
    '',
    'export const ISIN_TO_AKTIVTYPE: Record<string, AktivType> = {'
]
for a in assets:
    mapper.append(f'  "{a["isin"]}": "{a["aktivType"]}",  // {a["navn"][:40]}')
mapper.append('};')
mapper.append('')
mapper.append(f'// Total: {len(assets)} værdipapirer')

Path(OUTPUT_MAPPER).parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT_MAPPER, 'w', encoding='utf-8') as f:
    f.write('\n'.join(mapper))

print("\n" + "=" * 50)
print("FÆRDIG!")
print("=" * 50)
print(f"   → {OUTPUT_JSON} ({len(assets)} poster)")
print(f"   → {OUTPUT_MAPPER} klar til React")
