import { State } from 'ts-fsrs';
import type { Card } from '../models/card';
import { cardService, topicService } from '../db/database';

export type SessionMode = 'micro' | 'standard' | 'topic';

export interface QueueOptions {
  mode: SessionMode;
  topicIds?: string[];
  microLimit?: number; // For micro sessions, default 12
  newCardLimit?: number; // Max new cards to inject, default 5
  interleaveRelated?: boolean; // Whether to interleave related topics
}

export interface QueueResult {
  cardIds: string[];
  totalDue: number;
  totalNew: number;
}

/**
 * Build a review queue based on session options
 */
export async function buildQueue(options: QueueOptions): Promise<QueueResult> {
  const {
    mode,
    topicIds,
    microLimit = 12,
    newCardLimit = 5,
    interleaveRelated = true,
  } = options;

  // Get all due cards
  let dueCards = await cardService.getDueCards();

  // Filter by topics if specified
  if (topicIds && topicIds.length > 0) {
    dueCards = dueCards.filter((card) =>
      card.topicIds.some((tid) => topicIds.includes(tid))
    );
  }

  // Separate by state
  const reviewCards = dueCards.filter((c) => c.state !== State.New);
  const learningCards = reviewCards.filter(
    (c) => c.state === State.Learning || c.state === State.Relearning
  );
  const reviewDueCards = reviewCards.filter((c) => c.state === State.Review);

  // Get new cards to inject
  let newCards = await cardService.getNewCards();
  if (topicIds && topicIds.length > 0) {
    newCards = newCards.filter((card) =>
      card.topicIds.some((tid) => topicIds.includes(tid))
    );
  }
  newCards = newCards.slice(0, newCardLimit);

  // Build initial queue: learning first, then due reviews, then new
  let queue: Card[] = [...learningCards, ...reviewDueCards, ...newCards];

  // Apply interleaving for related topics
  if (interleaveRelated) {
    queue = await interleaveByTopic(queue);
  }

  // Apply mode limits
  if (mode === 'micro') {
    queue = queue.slice(0, microLimit);
  }

  return {
    cardIds: queue.map((c) => c.id),
    totalDue: dueCards.length,
    totalNew: newCards.length,
  };
}

/**
 * Interleave cards to avoid showing same-topic cards consecutively
 * Uses a spacing algorithm to maximize topic variety
 */
async function interleaveByTopic(cards: Card[]): Promise<Card[]> {
  if (cards.length <= 2) return cards;

  // Group cards by their primary topic
  const byTopic = new Map<string, Card[]>();
  for (const card of cards) {
    const topicId = card.topicIds[0] ?? 'none';
    if (!byTopic.has(topicId)) {
      byTopic.set(topicId, []);
    }
    byTopic.get(topicId)!.push(card);
  }

  // Get related topics for better interleaving
  const relatedMap = new Map<string, string[]>();
  const topics = await topicService.getAll();
  for (const topic of topics) {
    relatedMap.set(topic.id, topic.relatedTopicIds);
  }

  // Round-robin through topics, avoiding consecutive same/related topics
  const result: Card[] = [];
  const topicQueues = Array.from(byTopic.entries());
  let lastTopicId: string | null = null;
  let lastRelated: string[] = [];

  while (result.length < cards.length) {
    let added = false;

    // Find next topic that's not the same as or related to last
    for (let i = 0; i < topicQueues.length; i++) {
      const [topicId, queue] = topicQueues[i];

      if (queue.length === 0) continue;

      // Avoid same topic or related topics if possible
      if (lastTopicId !== null) {
        if (topicId === lastTopicId) continue;
        if (lastRelated.includes(topicId)) continue;
      }

      // Add card from this topic
      const card = queue.shift()!;
      result.push(card);
      lastTopicId = topicId;
      lastRelated = relatedMap.get(topicId) ?? [];
      added = true;
      break;
    }

    // If we couldn't find a non-related topic, just take any available card
    if (!added) {
      for (const [topicId, queue] of topicQueues) {
        if (queue.length > 0) {
          const card = queue.shift()!;
          result.push(card);
          lastTopicId = topicId;
          lastRelated = relatedMap.get(topicId) ?? [];
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Get count of cards due now
 */
export async function getDueCount(topicIds?: string[]): Promise<number> {
  let dueCards = await cardService.getDueCards();

  if (topicIds && topicIds.length > 0) {
    dueCards = dueCards.filter((card) =>
      card.topicIds.some((tid) => topicIds.includes(tid))
    );
  }

  return dueCards.length;
}

/**
 * Get breakdown of due cards by state
 */
export async function getDueBreakdown(topicIds?: string[]): Promise<{
  learning: number;
  review: number;
  new: number;
}> {
  let dueCards = await cardService.getDueCards();
  const newCards = await cardService.getNewCards();

  if (topicIds && topicIds.length > 0) {
    dueCards = dueCards.filter((card) =>
      card.topicIds.some((tid) => topicIds.includes(tid))
    );
  }

  const learning = dueCards.filter(
    (c) => c.state === State.Learning || c.state === State.Relearning
  ).length;
  const review = dueCards.filter((c) => c.state === State.Review).length;

  return {
    learning,
    review,
    new: topicIds
      ? newCards.filter((c) => c.topicIds.some((tid) => topicIds.includes(tid)))
          .length
      : newCards.length,
  };
}
