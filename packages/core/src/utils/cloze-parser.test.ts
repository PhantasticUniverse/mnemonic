import { describe, it, expect } from 'vitest';
import {
  parseCloze,
  renderClozeFront,
  renderClozeBack,
  hasCloze,
  countClozeDeletions,
  generateClozeCards,
  parseFormula,
  hasFormula,
  generateFormulaCards,
} from './cloze-parser';

describe('cloze-parser', () => {
  describe('parseCloze', () => {
    it('should parse basic cloze syntax', () => {
      const result = parseCloze('The {{c1::capital}} of France is Paris');

      expect(result.deletions).toHaveLength(1);
      expect(result.deletions[0]).toEqual({
        index: 1,
        text: 'capital',
        hint: undefined,
      });
      expect(result.maxIndex).toBe(1);
    });

    it('should parse cloze with hints', () => {
      const result = parseCloze('{{c1::Paris::city name}} is the capital of France');

      expect(result.deletions).toHaveLength(1);
      expect(result.deletions[0]).toEqual({
        index: 1,
        text: 'Paris',
        hint: 'city name',
      });
    });

    it('should parse multiple clozes', () => {
      const result = parseCloze('{{c1::Paris}} is the capital of {{c2::France}}');

      expect(result.deletions).toHaveLength(2);
      expect(result.deletions[0].text).toBe('Paris');
      expect(result.deletions[1].text).toBe('France');
      expect(result.maxIndex).toBe(2);
    });

    it('should handle non-sequential indices', () => {
      const result = parseCloze('{{c1::first}} {{c3::third}} {{c5::fifth}}');

      expect(result.deletions).toHaveLength(3);
      expect(result.maxIndex).toBe(5);
    });

    it('should handle empty text', () => {
      const result = parseCloze('');

      expect(result.deletions).toHaveLength(0);
      expect(result.maxIndex).toBe(0);
    });

    it('should handle text without cloze', () => {
      const result = parseCloze('Just regular text');

      expect(result.deletions).toHaveLength(0);
      expect(result.maxIndex).toBe(0);
    });
  });

  describe('renderClozeFront', () => {
    it('should show [...] for target cloze', () => {
      const result = renderClozeFront('The {{c1::capital}} of France', 1);

      expect(result).toBe('The [...] of France');
    });

    it('should show hint when available', () => {
      const result = renderClozeFront('{{c1::Paris::city}} is beautiful', 1);

      expect(result).toBe('[city] is beautiful');
    });

    it('should reveal non-target clozes', () => {
      const result = renderClozeFront('{{c1::Paris}} is in {{c2::France}}', 1);

      expect(result).toBe('[...] is in France');
    });

    it('should handle multiple clozes correctly', () => {
      const template = '{{c1::A}} and {{c2::B}} and {{c3::C}}';

      expect(renderClozeFront(template, 1)).toBe('[...] and B and C');
      expect(renderClozeFront(template, 2)).toBe('A and [...] and C');
      expect(renderClozeFront(template, 3)).toBe('A and B and [...]');
    });
  });

  describe('renderClozeBack', () => {
    it('should highlight target answer in bold', () => {
      const result = renderClozeBack('The {{c1::capital}} of France', 1);

      expect(result).toBe('The **capital** of France');
    });

    it('should reveal all clozes on back', () => {
      const result = renderClozeBack('{{c1::Paris}} is in {{c2::France}}', 1);

      expect(result).toBe('**Paris** is in France');
    });
  });

  describe('hasCloze', () => {
    it('should detect cloze syntax', () => {
      expect(hasCloze('This has {{c1::cloze}}')).toBe(true);
    });

    it('should return false for no cloze', () => {
      expect(hasCloze('This has no cloze')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasCloze('')).toBe(false);
    });

    it('should handle regex reset correctly', () => {
      // Test multiple calls to ensure regex is reset properly
      expect(hasCloze('{{c1::test}}')).toBe(true);
      expect(hasCloze('no cloze')).toBe(false);
      expect(hasCloze('{{c1::another}}')).toBe(true);
    });
  });

  describe('countClozeDeletions', () => {
    it('should return max cloze index', () => {
      // countClozeDeletions returns the maxIndex (highest cloze number)
      expect(countClozeDeletions('{{c1::one}}')).toBe(1);
      expect(countClozeDeletions('{{c1::one}} {{c2::two}}')).toBe(2);
      // With {{c3::...}}, maxIndex is 3 even if c2 is missing
      expect(countClozeDeletions('{{c1::one}} {{c3::three}}')).toBe(3);
    });

    it('should return 0 for no deletions', () => {
      expect(countClozeDeletions('no cloze here')).toBe(0);
    });
  });

  describe('generateClozeCards', () => {
    it('should generate correct number of cards', () => {
      const cards = generateClozeCards('{{c1::A}} and {{c2::B}}');

      expect(cards).toHaveLength(2);
    });

    it('should generate correct front/back for each card', () => {
      const template = '{{c1::Paris}} is the capital of {{c2::France}}';
      const cards = generateClozeCards(template);

      expect(cards[0]).toEqual({
        front: '[...] is the capital of France',
        back: '**Paris** is the capital of France',
        clozeIndex: 1,
      });

      expect(cards[1]).toEqual({
        front: 'Paris is the capital of [...]',
        back: 'Paris is the capital of **France**',
        clozeIndex: 2,
      });
    });

    it('should return empty array for no clozes', () => {
      const cards = generateClozeCards('no cloze here');

      expect(cards).toHaveLength(0);
    });

    it('should handle special characters in cloze text', () => {
      const cards = generateClozeCards('Formula: {{c1::$E = mc^2$}}');

      expect(cards).toHaveLength(1);
      expect(cards[0].back).toContain('$E = mc^2$');
    });
  });

  // Formula card tests
  describe('parseFormula', () => {
    it('should parse basic formula syntax', () => {
      const result = parseFormula('{{f::Chain Rule::f\'(g(x)) * g\'(x)}}');

      expect(result).toEqual({
        name: "Chain Rule",
        formula: "f'(g(x)) * g'(x)",
      });
    });

    it('should trim whitespace', () => {
      const result = parseFormula('{{f:: Quadratic Formula :: x = (-b ± √(b²-4ac)) / 2a }}');

      expect(result).toEqual({
        name: 'Quadratic Formula',
        formula: 'x = (-b ± √(b²-4ac)) / 2a',
      });
    });

    it('should return null for no formula', () => {
      expect(parseFormula('regular text')).toBeNull();
      expect(parseFormula('{{c1::cloze}}')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseFormula('')).toBeNull();
    });
  });

  describe('hasFormula', () => {
    it('should detect formula syntax', () => {
      expect(hasFormula('{{f::name::formula}}')).toBe(true);
    });

    it('should return false for no formula', () => {
      expect(hasFormula('no formula')).toBe(false);
      expect(hasFormula('{{c1::cloze}}')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasFormula('')).toBe(false);
    });

    it('should handle regex reset correctly', () => {
      expect(hasFormula('{{f::a::b}}')).toBe(true);
      expect(hasFormula('no formula')).toBe(false);
      expect(hasFormula('{{f::c::d}}')).toBe(true);
    });
  });

  describe('generateFormulaCards', () => {
    it('should generate two cards (forward and reverse)', () => {
      const cards = generateFormulaCards('{{f::Determinant 2x2::ad - bc}}');

      expect(cards).toHaveLength(2);
    });

    it('should generate correct forward card', () => {
      const cards = generateFormulaCards('{{f::Pythagorean::a² + b² = c²}}');

      expect(cards[0]).toEqual({
        front: 'Pythagorean',
        back: '$a² + b² = c²$',
        isReverse: false,
      });
    });

    it('should generate correct reverse card', () => {
      const cards = generateFormulaCards('{{f::Pythagorean::a² + b² = c²}}');

      expect(cards[1]).toEqual({
        front: '$a² + b² = c²$',
        back: 'Pythagorean',
        isReverse: true,
      });
    });

    it('should not double-wrap already wrapped formulas', () => {
      const cards = generateFormulaCards('{{f::Test::$already wrapped$}}');

      expect(cards[0].back).toBe('$already wrapped$');
      expect(cards[1].front).toBe('$already wrapped$');
    });

    it('should return empty array for no formula', () => {
      const cards = generateFormulaCards('no formula');

      expect(cards).toHaveLength(0);
    });
  });
});
