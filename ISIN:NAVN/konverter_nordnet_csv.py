#!/usr/bin/env python3
"""
Konverterer Nordnet CSV-filer til JSON og TypeScript mapper.
"""

import pandas as pd
import json
from pathlib import Path

# CSV-filer der skal læses
CSV_FILER = [
    "ISIN:NAVN/aktiekurser–sedanskeaktiermedmere_6.2.2026_217.csv",
    "ISIN:NAVN/etf'er–børshandledefonde_6.2.2026_219.csv",
    "ISIN:NAVN/fondsliste_6.2.2026_219.csv"
]

OUTPUT_JSON = "src/data/coreAssets.json"
OUTPUT_MAPPER = "src/constants/isinMapper.ts"

def load_csv_files():
    """Læs alle CSV-filer og kombiner til én DataFrame"""
    dfs = []
    encodings_to_try = ['utf-16', 'utf-16-le', 'utf-8', 'latin-1', 'cp1252']

    for csv_fil in CSV_FILER:
        path = Path(csv_fil)
        if path.exists():
            for encoding in encodings_to_try:
                try:
                    df = pd.read_csv(path, sep=None, engine='python', encoding=encoding, on_bad_lines='skip')
                    print(f"✓ Indlæst {len(df)} rækker fra {path.name} (encoding: {encoding})")
                    dfs.append(df)
                    break
                except Exception as e:
                    continue
            else:
                print(f"✗ Kunne ikke læse {path.name} med nogen encoding")
        else:
            print(f"✗ Fil ikke fundet: {csv_fil}")

    if not dfs:
        print("Ingen CSV-filer kunne læses!")
        return None

    return pd.concat(dfs, ignore_index=True)

def get_aktiv_type(row):
    """Udled aktivType baseret på ISIN og navn"""
    isin = str(row.get('isin', '')).upper()
    navn = str(row.get('navn', '')).upper()

    # ETF-logik først (vigtigst for positivliste)
    if 'ETF' in navn or 'EXCHANGE TRADED' in navn or 'UCITS' in navn or 'XACT' in navn:
        # Simpel positivliste-heuristik (kan udvides)
        positivliste_keywords = ['MSCI', 'S&P 500', 'CORE', 'WORLD', 'SPARINDEX', 'STOXX']
        if any(kw in navn for kw in positivliste_keywords):
            return 'ETF_POSITIVLISTE'
        if 'BOND' in navn or 'OBLIGATION' in navn or 'FIXED INCOME' in navn:
            return 'ETF_OBLIGATIONSBASERET'
        return 'ETF_IKKE_POSITIVLISTE'

    # Investeringsforeninger
    if 'INVESTERINGSFORENING' in navn or 'INV.' in navn:
        if 'AKK' in navn or 'AKKUMULERENDE' in navn:
            return 'INVF_AKKUMULERENDE'
        return 'INVF_UDBYTTEBETALTENDE'

    # Aktier baseret på ISIN-prefix
    if isin.startswith('DK'):
        return 'AKTIE_DK'
    if isin.startswith(('US', 'CA', 'JP', 'HK', 'TW', 'GB', 'DE', 'FR', 'CH', 'SE', 'NO', 'FI')):
        return 'AKTIE_UDENLANDSK'

    # Fallback
    return 'AKTIE_UDENLANDSK'

def main():
    print("=" * 50)
    print("NORDNET CSV KONVERTER")
    print("=" * 50)

    df = load_csv_files()
    if df is None:
        return

    print(f"\nTotal: {len(df)} rækker indlæst")
    print(f"Kolonner: {list(df.columns)}")

    # Normaliser kolonnenavne
    col_mapping = {
        'Navn': 'navn',
        'Navn (kort)': 'navn',
        'Name': 'navn',
        'Ticker': 'ticker',
        'Symbol': 'ticker',
        'ISIN': 'isin',
        'Valuta': 'valuta',
        'Currency': 'valuta',
        'Land': 'land',
        'Country': 'land',
    }
    df = df.rename(columns={k: v for k, v in col_mapping.items() if k in df.columns})

    # Rens data
    if 'isin' in df.columns:
        df['isin'] = df['isin'].astype(str).str.strip().str.upper()
        df = df[df['isin'].str.len() == 12]  # ISIN er altid 12 tegn

    if 'navn' in df.columns:
        df = df.dropna(subset=['navn'])

    # Tilføj aktivType og land
    df['aktivType'] = df.apply(get_aktiv_type, axis=1)
    df['land'] = df['isin'].str[:2] if 'isin' in df.columns else 'XX'

    # Fjern dubletter
    df = df.drop_duplicates(subset=['isin'])

    print(f"\nEfter rensning: {len(df)} unikke værdipapirer")
    print(f"\nAktivtype-fordeling:")
    print(df['aktivType'].value_counts().to_string())

    # Lav JSON-output
    assets = []
    for _, row in df.iterrows():
        assets.append({
            "isin": row.get('isin', ''),
            "navn": row.get('navn', ''),
            "ticker": row.get('ticker', ''),
            "valuta": row.get('valuta', 'DKK'),
            "land": row.get('land', ''),
            "aktivType": row.get('aktivType', 'AKTIE_UDENLANDSK')
        })

    # Gem JSON
    Path(OUTPUT_JSON).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(assets, f, indent=2, ensure_ascii=False)

    # Lav isinMapper.ts
    mapper_lines = [
        '// Auto-genereret fra Nordnet CSV-filer',
        '// Genereret: ' + pd.Timestamp.now().strftime('%Y-%m-%d %H:%M'),
        '',
        'import type { AktivType } from "../types/skat";',
        '',
        'export const ISIN_TO_AKTIVTYPE: Record<string, AktivType> = {'
    ]
    for a in assets:
        mapper_lines.append(f'  "{a["isin"]}": "{a["aktivType"]}",  // {a["navn"][:40]}')
    mapper_lines.append('};')
    mapper_lines.append('')
    mapper_lines.append(f'// Total: {len(assets)} værdipapirer')

    Path(OUTPUT_MAPPER).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MAPPER, 'w', encoding='utf-8') as f:
        f.write('\n'.join(mapper_lines))

    print("\n" + "=" * 50)
    print("FÆRDIG!")
    print("=" * 50)
    print(f"   → {OUTPUT_JSON} ({len(assets)} poster)")
    print(f"   → {OUTPUT_MAPPER} klar til brug i React")

    # Vis de første 10 som eksempel
    print("\nEksempel (første 10):")
    print(json.dumps(assets[:10], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
