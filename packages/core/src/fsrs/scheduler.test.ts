import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyCard, State } from 'ts-fsrs';
import {
  scheduleReview,
  previewIntervals,
  formatInterval,
  isDue,
  getStateName,
  calculateRetention,
} from './scheduler';
import type { Card } from '../models/card';

// Helper to create a test card
function createTestCard(overrides: Partial<Card> = {}): Card {
  const now = new Date();
  const fsrsCard = createEmptyCard(now);

  return {
    id: 'test-card-1',
    type: 'basic',
    front: 'Test question',
    back: 'Test answer',
    topicIds: ['topic-1'],
    tags: [],
    fsrs: fsrsCard,
    state: State.New,
    due: now,
    lastReview: null,
    reviewCount: 0,
    contextHistory: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('scheduler', () => {
  describe('scheduleReview', () => {
    it('should update card after "forgot" rating', () => {
      const card = createTestCard();
      const result = scheduleReview(card, 'forgot');

      expect(result.card.reviewCount).toBe(1);
      expect(result.card.lastReview).toBeDefined();
      expect(result.nextReviewDate).toBeInstanceOf(Date);
      expect(result.interval).toBeGreaterThanOrEqual(0);
    });

    it('should update card after "remembered" rating', () => {
      const card = createTestCard();
      const result = scheduleReview(card, 'remembered');

      expect(result.card.reviewCount).toBe(1);
      expect(result.card.lastReview).toBeDefined();
      expect(result.nextReviewDate).toBeInstanceOf(Date);
      expect(result.interval).toBeGreaterThanOrEqual(0);
    });

    it('should produce longer interval for remembered vs forgot', () => {
      const card = createTestCard();

      const forgotResult = scheduleReview(card, 'forgot');
      const rememberedResult = scheduleReview(card, 'remembered');

      expect(rememberedResult.interval).toBeGreaterThanOrEqual(forgotResult.interval);
    });

    it('should update state after review', () => {
      const card = createTestCard({ state: State.New });
      const result = scheduleReview(card, 'remembered');

      // After first review, card should transition from New
      expect(result.card.state).not.toBe(State.New);
    });
  });

  describe('previewIntervals', () => {
    it('should return interval previews without mutating card', () => {
      const card = createTestCard();
      const originalFsrs = { ...card.fsrs };

      const preview = previewIntervals(card);

      expect(preview.forgot).toBeGreaterThanOrEqual(0);
      expect(preview.remembered).toBeGreaterThanOrEqual(0);
      expect(card.fsrs.due).toEqual(originalFsrs.due);
    });

    it('should show longer interval for remembered', () => {
      const card = createTestCard();
      const preview = previewIntervals(card);

      expect(preview.remembered).toBeGreaterThanOrEqual(preview.forgot);
    });
  });

  describe('formatInterval', () => {
    it('should format 0 days correctly', () => {
      expect(formatInterval(0)).toBe('< 1 day');
    });

    it('should format 1 day correctly', () => {
      expect(formatInterval(1)).toBe('1 day');
    });

    it('should format days correctly (< 7)', () => {
      expect(formatInterval(3)).toBe('3 days');
      expect(formatInterval(6)).toBe('6 days');
    });

    it('should format 1 week correctly', () => {
      expect(formatInterval(7)).toBe('1 week');
      expect(formatInterval(10)).toBe('1 week');
    });

    it('should format weeks correctly', () => {
      expect(formatInterval(14)).toBe('2 weeks');
      expect(formatInterval(21)).toBe('3 weeks');
    });

    it('should format 1 month correctly', () => {
      expect(formatInterval(30)).toBe('1 month');
      expect(formatInterval(45)).toBe('1 month');
    });

    it('should format months correctly', () => {
      expect(formatInterval(60)).toBe('2 months');
      expect(formatInterval(180)).toBe('6 months');
    });

    it('should format 1 year correctly', () => {
      expect(formatInterval(365)).toBe('1 year');
      expect(formatInterval(500)).toBe('1 year');
    });

    it('should format years correctly', () => {
      expect(formatInterval(730)).toBe('2 years');
      expect(formatInterval(1095)).toBe('3 years');
    });
  });

  describe('isDue', () => {
    it('should return true for past due dates', () => {
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 1);

      const card = createTestCard({ due: pastDue });
      expect(isDue(card)).toBe(true);
    });

    it('should return true for current due date', () => {
      const card = createTestCard({ due: new Date() });
      expect(isDue(card)).toBe(true);
    });

    it('should return false for future due dates', () => {
      const futureDue = new Date();
      futureDue.setDate(futureDue.getDate() + 1);

      const card = createTestCard({ due: futureDue });
      expect(isDue(card)).toBe(false);
    });

    it('should respect optional asOf parameter', () => {
      const cardDue = new Date('2024-01-15');
      const card = createTestCard({ due: cardDue });

      const before = new Date('2024-01-14');
      const after = new Date('2024-01-16');

      expect(isDue(card, before)).toBe(false);
      expect(isDue(card, after)).toBe(true);
    });
  });

  describe('getStateName', () => {
    it('should return correct names for each state', () => {
      expect(getStateName(State.New)).toBe('New');
      expect(getStateName(State.Learning)).toBe('Learning');
      expect(getStateName(State.Review)).toBe('Review');
      expect(getStateName(State.Relearning)).toBe('Relearning');
    });
  });

  describe('calculateRetention', () => {
    it('should return 0 when total is 0', () => {
      expect(calculateRetention(0, 0)).toBe(0);
    });

    it('should calculate correct retention rate', () => {
      expect(calculateRetention(80, 100)).toBe(0.8);
      expect(calculateRetention(5, 10)).toBe(0.5);
      expect(calculateRetention(100, 100)).toBe(1);
    });

    it('should handle zero remembered', () => {
      expect(calculateRetention(0, 10)).toBe(0);
    });
  });
});
