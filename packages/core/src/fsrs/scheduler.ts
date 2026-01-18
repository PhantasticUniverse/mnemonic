import { fsrs, Rating, State, type Card as FSRSCard } from 'ts-fsrs';
import type { Card } from '../models/card';

// Create FSRS instance with default parameters
const f = fsrs();

export type ReviewRating = 'forgot' | 'remembered';

export interface SchedulingResult {
  card: Card;
  nextReviewDate: Date;
  interval: number; // in days
}

export interface IntervalPreview {
  forgot: number; // days until next review if forgot
  remembered: number; // days until next review if remembered
}

/**
 * Get the scheduling info for a card after a review
 */
export function scheduleReview(card: Card, rating: ReviewRating): SchedulingResult {
  const now = new Date();

  // ts-fsrs repeat returns a record indexed by Rating
  const recordLog = f.repeat(card.fsrs, now);
  const fsrsRating = rating === 'forgot' ? Rating.Again : Rating.Good;
  const scheduled = recordLog[fsrsRating];

  const updatedCard: Card = {
    ...card,
    fsrs: scheduled.card,
    state: scheduled.card.state,
    due: scheduled.card.due,
    lastReview: now,
    reviewCount: card.reviewCount + 1,
    updatedAt: now,
  };

  // Calculate interval in days
  const intervalMs = scheduled.card.due.getTime() - now.getTime();
  const intervalDays = Math.max(0, Math.round(intervalMs / (1000 * 60 * 60 * 24)));

  return {
    card: updatedCard,
    nextReviewDate: scheduled.card.due,
    interval: intervalDays,
  };
}

/**
 * Preview what the intervals would be for each rating option
 */
export function previewIntervals(card: Card): IntervalPreview {
  const now = new Date();
  const recordLog = f.repeat(card.fsrs, now);

  const calcInterval = (scheduled: { card: FSRSCard }): number => {
    const intervalMs = scheduled.card.due.getTime() - now.getTime();
    return Math.max(0, Math.round(intervalMs / (1000 * 60 * 60 * 24)));
  };

  return {
    forgot: calcInterval(recordLog[Rating.Again]),
    remembered: calcInterval(recordLog[Rating.Good]),
  };
}

/**
 * Format interval for display
 * e.g., "1 day", "3 days", "2 weeks", "1 month"
 */
export function formatInterval(days: number): string {
  if (days === 0) return '< 1 day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 14) return '1 week';
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 60) return '1 month';
  if (days < 365) return `${Math.round(days / 30)} months`;
  if (days < 730) return '1 year';
  return `${Math.round(days / 365)} years`;
}

/**
 * Check if a card is due for review
 */
export function isDue(card: Card, asOf?: Date): boolean {
  const now = asOf ?? new Date();
  return card.due <= now;
}

/**
 * Get the state name for display
 */
export function getStateName(state: State): string {
  switch (state) {
    case State.New:
      return 'New';
    case State.Learning:
      return 'Learning';
    case State.Review:
      return 'Review';
    case State.Relearning:
      return 'Relearning';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate retention rate from review history
 */
export function calculateRetention(remembered: number, total: number): number {
  if (total === 0) return 0;
  return remembered / total;
}
