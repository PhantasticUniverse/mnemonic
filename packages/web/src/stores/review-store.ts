import { create } from 'zustand';
import {
  type Card,
  type ReviewSession,
  type SessionStats,
  type SessionMode,
  buildQueue,
  cardService,
  sessionService,
  statsService,
  scheduleReview,
  previewIntervals,
  type IntervalPreview,
  State,
} from '@mnemonic/core';

interface ReviewState {
  // Session state
  session: ReviewSession | null;
  isActive: boolean;
  isLoading: boolean;

  // Current card
  currentCard: Card | null;
  currentIndex: number;
  revealed: boolean;
  intervals: IntervalPreview | null;

  // Queue
  queue: Card[];
  totalCards: number;

  // Stats for current session
  cardsReviewed: number;
  cardsRemembered: number;
  cardsForgot: number;
  startTime: number;

  // Actions
  startSession: (mode: SessionMode, topicIds?: string[]) => Promise<void>;
  revealAnswer: () => void;
  submitResponse: (remembered: boolean) => Promise<void>;
  endSession: () => Promise<SessionStats>;
  resetSession: () => void;

  // Resume
  resumeSession: () => Promise<boolean>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  // Initial state
  session: null,
  isActive: false,
  isLoading: false,
  currentCard: null,
  currentIndex: 0,
  revealed: false,
  intervals: null,
  queue: [],
  totalCards: 0,
  cardsReviewed: 0,
  cardsRemembered: 0,
  cardsForgot: 0,
  startTime: 0,

  startSession: async (mode, topicIds) => {
    set({ isLoading: true });

    try {
      // Build the queue
      const result = await buildQueue({
        mode,
        topicIds,
        microLimit: mode === 'micro' ? 12 : undefined,
      });

      if (result.cardIds.length === 0) {
        set({ isLoading: false });
        return;
      }

      // Load all cards
      const cards: Card[] = [];
      for (const id of result.cardIds) {
        const card = await cardService.getById(id);
        if (card) cards.push(card);
      }

      // Create session in database
      const session = await sessionService.create({
        mode,
        topicIds,
        cardIds: result.cardIds,
      });

      // Get first card intervals
      const firstCard = cards[0];
      const intervals = previewIntervals(firstCard);

      set({
        session,
        isActive: true,
        isLoading: false,
        currentCard: firstCard,
        currentIndex: 0,
        revealed: false,
        intervals,
        queue: cards,
        totalCards: cards.length,
        cardsReviewed: 0,
        cardsRemembered: 0,
        cardsForgot: 0,
        startTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      set({ isLoading: false });
    }
  },

  revealAnswer: () => {
    set({ revealed: true });
  },

  submitResponse: async (remembered) => {
    const state = get();
    const { currentCard, session, queue, currentIndex } = state;

    if (!currentCard || !session) return;

    // Schedule the card
    const isNew = currentCard.state === State.New;
    const result = scheduleReview(currentCard, remembered ? 'remembered' : 'forgot');

    // Update card in database
    await cardService.updateAfterReview(result.card);

    // Record stats
    await statsService.recordReview(remembered, isNew);

    // Update session stats
    const newReviewed = state.cardsReviewed + 1;
    const newRemembered = remembered ? state.cardsRemembered + 1 : state.cardsRemembered;
    const newForgot = remembered ? state.cardsForgot : state.cardsForgot + 1;

    // Move to next card
    const nextIndex = currentIndex + 1;
    const isComplete = nextIndex >= queue.length;

    if (isComplete) {
      // Session complete
      set({
        cardsReviewed: newReviewed,
        cardsRemembered: newRemembered,
        cardsForgot: newForgot,
        currentCard: null,
        revealed: false,
        intervals: null,
      });
    } else {
      // Next card
      const nextCard = queue[nextIndex];
      const nextIntervals = previewIntervals(nextCard);

      set({
        currentCard: nextCard,
        currentIndex: nextIndex,
        revealed: false,
        intervals: nextIntervals,
        cardsReviewed: newReviewed,
        cardsRemembered: newRemembered,
        cardsForgot: newForgot,
      });
    }

    // Update session in database
    session.currentIndex = nextIndex;
    session.cardsReviewed = newReviewed;
    session.cardsRemembered = newRemembered;
    session.cardsForgot = newForgot;
    session.completedCardIds.push(currentCard.id);
    await sessionService.update(session);
  },

  endSession: async () => {
    const state = get();
    const { session, cardsReviewed, cardsRemembered, cardsForgot, startTime } = state;

    const totalTimeMs = Date.now() - startTime;
    const accuracy = cardsReviewed > 0 ? cardsRemembered / cardsReviewed : 0;
    const averageTimePerCard = cardsReviewed > 0 ? totalTimeMs / cardsReviewed : 0;

    // Complete session in database
    if (session) {
      await sessionService.complete(session.id);
      await statsService.addTime(totalTimeMs);
    }

    const stats: SessionStats = {
      cardsReviewed,
      cardsRemembered,
      cardsForgot,
      accuracy,
      averageTimePerCard,
      totalTimeMs,
    };

    // Reset state
    set({
      session: null,
      isActive: false,
      currentCard: null,
      currentIndex: 0,
      revealed: false,
      intervals: null,
      queue: [],
      totalCards: 0,
    });

    return stats;
  },

  resetSession: () => {
    set({
      session: null,
      isActive: false,
      isLoading: false,
      currentCard: null,
      currentIndex: 0,
      revealed: false,
      intervals: null,
      queue: [],
      totalCards: 0,
      cardsReviewed: 0,
      cardsRemembered: 0,
      cardsForgot: 0,
      startTime: 0,
    });
  },

  resumeSession: async () => {
    const activeSession = await sessionService.getActive();
    if (!activeSession) return false;

    // Load remaining cards
    const remainingIds = activeSession.cardIds.slice(activeSession.currentIndex);
    const cards: Card[] = [];
    for (const id of remainingIds) {
      const card = await cardService.getById(id);
      if (card) cards.push(card);
    }

    if (cards.length === 0) return false;

    const firstCard = cards[0];
    const intervals = previewIntervals(firstCard);

    set({
      session: activeSession,
      isActive: true,
      currentCard: firstCard,
      currentIndex: activeSession.currentIndex,
      revealed: false,
      intervals,
      queue: cards,
      totalCards: activeSession.cardIds.length,
      cardsReviewed: activeSession.cardsReviewed,
      cardsRemembered: activeSession.cardsRemembered,
      cardsForgot: activeSession.cardsForgot,
      startTime: Date.now() - activeSession.totalTimeMs,
    });

    return true;
  },
}));
