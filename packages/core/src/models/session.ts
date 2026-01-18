export type SessionMode = 'micro' | 'standard' | 'topic';

export interface ReviewSession {
  id: string;
  mode: SessionMode;

  // If topic mode, which topic(s)
  topicIds: string[];

  // Queue state
  cardIds: string[];
  currentIndex: number;
  completedCardIds: string[];

  // Stats for this session
  cardsReviewed: number;
  cardsRemembered: number;
  cardsForgot: number;

  // Timing
  startedAt: Date;
  completedAt: Date | null;
  totalTimeMs: number;

  // For resuming interrupted sessions
  isActive: boolean;
}

export interface SessionStats {
  cardsReviewed: number;
  cardsRemembered: number;
  cardsForgot: number;
  accuracy: number;
  averageTimePerCard: number;
  totalTimeMs: number;
}

export interface CreateSessionInput {
  mode: SessionMode;
  topicIds?: string[];
  cardIds: string[];
}

export interface DailyStats {
  date: string; // ISO date string (YYYY-MM-DD)
  cardsReviewed: number;
  cardsRemembered: number;
  cardsForgot: number;
  newCardsLearned: number;
  timeSpentMs: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastReviewDate: string | null;
}
