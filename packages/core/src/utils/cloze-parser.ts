/**
 * Parse cloze deletion syntax: {{c1::hidden text}} or {{c1::hidden::hint}}
 */

export interface ClozeDeletion {
  index: number;
  text: string;
  hint?: string;
}

export interface ParsedCloze {
  deletions: ClozeDeletion[];
  maxIndex: number;
}

const CLOZE_REGEX = /\{\{c(\d+)::([^}]+?)(?:::([^}]+))?\}\}/g;

/**
 * Parse all cloze deletions from a template string
 */
export function parseCloze(template: string): ParsedCloze {
  // Reset regex state at start to avoid issues from previous calls
  CLOZE_REGEX.lastIndex = 0;

  const deletions: ClozeDeletion[] = [];
  let maxIndex = 0;

  let match;
  while ((match = CLOZE_REGEX.exec(template)) !== null) {
    const index = parseInt(match[1], 10);
    const text = match[2];
    const hint = match[3];

    deletions.push({ index, text, hint });
    maxIndex = Math.max(maxIndex, index);
  }

  // Reset regex state for next call
  CLOZE_REGEX.lastIndex = 0;

  return { deletions, maxIndex };
}

/**
 * Render a cloze template for a specific cloze index
 * Shows [...] or [hint] for the target cloze, reveals all others
 */
export function renderClozeFront(template: string, targetIndex: number): string {
  return template.replace(CLOZE_REGEX, (_match, indexStr, text, hint) => {
    const index = parseInt(indexStr, 10);
    if (index === targetIndex) {
      return hint ? `[${hint}]` : '[...]';
    }
    return text;
  });
}

/**
 * Render a cloze template for the back (answer) side
 * Shows the target cloze answer highlighted, all others revealed
 */
export function renderClozeBack(template: string, targetIndex: number): string {
  return template.replace(CLOZE_REGEX, (_match, indexStr, text) => {
    const index = parseInt(indexStr, 10);
    if (index === targetIndex) {
      return `**${text}**`; // Highlight the answer
    }
    return text;
  });
}

/**
 * Check if a string contains cloze deletions
 */
export function hasCloze(text: string): boolean {
  CLOZE_REGEX.lastIndex = 0;
  return CLOZE_REGEX.test(text);
}

/**
 * Count number of unique cloze deletions
 */
export function countClozeDeletions(template: string): number {
  const { maxIndex } = parseCloze(template);
  return maxIndex;
}

/**
 * Generate cards from a cloze template
 * Returns array of front/back pairs for each unique cloze index
 */
export function generateClozeCards(
  template: string
): Array<{ front: string; back: string; clozeIndex: number }> {
  const { maxIndex } = parseCloze(template);
  const cards: Array<{ front: string; back: string; clozeIndex: number }> = [];

  for (let i = 1; i <= maxIndex; i++) {
    cards.push({
      front: renderClozeFront(template, i),
      back: renderClozeBack(template, i),
      clozeIndex: i,
    });
  }

  return cards;
}

// ============================================================================
// Formula Card Support
// ============================================================================

/**
 * Formula pair parsed from template
 * Syntax: {{f::name::formula}}
 * Example: {{f::Determinant 2×2::ad - bc}}
 */
export interface FormulaPair {
  name: string;
  formula: string;
}

// Match formula syntax: {{f::name::formula}}
// Use lazy match with lookahead to find the closing }} instead of stopping at first }
const FORMULA_REGEX = /\{\{f::([^:]+?)::([\s\S]+?)\}\}/g;

/**
 * Parse a formula pair from a template string
 * Returns the first formula found, or null if none
 */
export function parseFormula(template: string): FormulaPair | null {
  FORMULA_REGEX.lastIndex = 0;
  const match = FORMULA_REGEX.exec(template);
  if (!match) return null;

  return {
    name: match[1].trim(),
    formula: match[2].trim(),
  };
}

/**
 * Check if a string contains formula syntax
 */
export function hasFormula(text: string): boolean {
  FORMULA_REGEX.lastIndex = 0;
  return FORMULA_REGEX.test(text);
}

/**
 * Generate reversible card pairs from a formula template
 * Creates:
 *   - Forward: name → $formula$
 *   - Reverse: $formula$ → name
 */
export function generateFormulaCards(
  template: string
): Array<{ front: string; back: string; isReverse: boolean }> {
  const formula = parseFormula(template);
  if (!formula) return [];

  // Wrap formula in $ for LaTeX rendering if not already wrapped
  const formulaDisplay = formula.formula.startsWith('$')
    ? formula.formula
    : `$${formula.formula}$`;

  return [
    {
      front: formula.name,
      back: formulaDisplay,
      isReverse: false,
    },
    {
      front: formulaDisplay,
      back: formula.name,
      isReverse: true,
    },
  ];
}
