/**
 * SKATTEKALENDER
 *
 * Bestemmer hvilken årsopgørelse der er tilgængelig baseret på dato.
 * Bruges til at guide brugeren korrekt ved onboarding.
 */

/**
 * Årsopgørelsen for skatteår X bliver typisk tilgængelig
 * i midten af marts år X+1.
 *
 * Vi bruger 15. marts som skæringsdato (konservativt estimat).
 * Nogle borgere får den tidligere, andre senere.
 */
const ÅRSOPGØRELSE_TILGÆNGELIG_MÅNED = 3;  // Marts
const ÅRSOPGØRELSE_TILGÆNGELIG_DAG = 15;

/**
 * Kontekst for onboarding baseret på dags dato.
 * Fortæller systemet hvilken årsopgørelse der er tilgængelig,
 * og hvilke år brugeren skal uploade handler for.
 */
export interface OnboardingKontekst {
  dagsDato: Date;
  indeværendeÅr: number;          // Fx 2026

  // Seneste tilgængelige årsopgørelse
  senesteÅrsopgørelse: number;     // Fx 2024 (hvis vi er i feb 2026)
  årsopgørelseErKlar: boolean;     // Er opgørelsen for forrige år klar?

  // Hvilke år brugeren skal dække med handler
  årDerMangler: number[];          // Fx [2025] (perioden mellem opgørelse og nu)

  // Informationsbesked til brugeren
  besked: string;
  beskedType: 'info' | 'warning';
}

/**
 * Beregn onboarding-kontekst baseret på dags dato.
 *
 * EKSEMPLER:
 *
 * Dato: 8. feb 2026
 * → senesteÅrsopgørelse: 2024
 * → årDerMangler: [2025]
 * → besked: "Din 2025-årsopgørelse er endnu ikke klar.
 *            Hent tal fra 2024-opgørelsen og upload 2025-handler."
 *
 * Dato: 1. maj 2026
 * → senesteÅrsopgørelse: 2025
 * → årDerMangler: []
 * → besked: "Hent tal fra din 2025-årsopgørelse."
 *
 * Dato: 15. jan 2027
 * → senesteÅrsopgørelse: 2025
 * → årDerMangler: [2026]
 * → besked: "Din 2026-årsopgørelse er endnu ikke klar.
 *            Hent tal fra 2025-opgørelsen og upload 2026-handler."
 */
export function beregnOnboardingKontekst(dato?: Date): OnboardingKontekst {
  const dagsDato = dato ?? new Date();
  const indeværendeÅr = dagsDato.getFullYear();
  const måned = dagsDato.getMonth() + 1; // 1-indexed
  const dag = dagsDato.getDate();

  // Er årsopgørelsen for FORRIGE år klar?
  const forrigeÅr = indeværendeÅr - 1;
  const opgørelseForForrigeÅrKlar =
    måned > ÅRSOPGØRELSE_TILGÆNGELIG_MÅNED ||
    (måned === ÅRSOPGØRELSE_TILGÆNGELIG_MÅNED && dag >= ÅRSOPGØRELSE_TILGÆNGELIG_DAG);

  let senesteÅrsopgørelse: number;
  let årDerMangler: number[];
  let besked: string;
  let beskedType: 'info' | 'warning';

  if (opgørelseForForrigeÅrKlar) {
    // Opgørelse for forrige år ER klar
    // Fx: april 2026 → 2025-opgørelsen er klar
    senesteÅrsopgørelse = forrigeÅr;
    årDerMangler = []; // Indeværende år dækkes løbende
    besked = `Hent dine tabssaldoer fra din ${forrigeÅr}-årsopgørelse.`;
    beskedType = 'info';
  } else {
    // Opgørelse for forrige år er IKKE klar endnu
    // Fx: feb 2026 → 2025-opgørelsen er ikke klar, brug 2024
    senesteÅrsopgørelse = forrigeÅr - 1;
    årDerMangler = [forrigeÅr]; // Hele forrige år mangler
    besked = `Din ${forrigeÅr}-årsopgørelse er endnu ikke klar (forventes marts ${indeværendeÅr}). ` +
             `Hent tabssaldoer fra din ${forrigeÅr - 1}-årsopgørelse, ` +
             `og upload dine ${forrigeÅr}-handler så systemet kan beregne det der skete i ${forrigeÅr}.`;
    beskedType = 'warning';
  }

  return {
    dagsDato,
    indeværendeÅr,
    senesteÅrsopgørelse,
    årsopgørelseErKlar: opgørelseForForrigeÅrKlar,
    årDerMangler,
    besked,
    beskedType,
  };
}

/**
 * Hjælpefunktion til at formatere årstal i brugervendte tekster.
 * Bruges til at dynamisk indsætte årstal i vejledninger.
 */
export function formatÅrstal(år: number): string {
  return år.toString();
}

/**
 * Tjek om en specifik årsopgørelse er tilgængelig på en given dato.
 */
export function erÅrsopgørelseTilgængelig(skatteår: number, dato?: Date): boolean {
  const dagsDato = dato ?? new Date();
  const tilgængeligFraÅr = skatteår + 1;
  const tilgængeligFraDato = new Date(
    tilgængeligFraÅr,
    ÅRSOPGØRELSE_TILGÆNGELIG_MÅNED - 1, // 0-indexed måned
    ÅRSOPGØRELSE_TILGÆNGELIG_DAG
  );

  return dagsDato >= tilgængeligFraDato;
}
