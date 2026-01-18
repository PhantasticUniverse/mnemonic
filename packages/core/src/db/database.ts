import { v4 as uuid } from 'uuid';
import { createEmptyCard, State } from 'ts-fsrs';
import { db } from './schema';
import type { Card, CreateCardInput, UpdateCardInput } from '../models/card';
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../models/topic';
import type {
  ReviewSession,
  CreateSessionInput,
  DailyStats,
  Streak,
} from '../models/session';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

// Card operations
export const cardService = {
  async create(input: CreateCardInput): Promise<Card> {
    const now = new Date();
    const fsrsCard = createEmptyCard(now);

    const card: Card = {
      id: uuid(),
      type: input.type,
      front: input.front,
      back: input.back,
      topicIds: input.topicIds,
      tags: input.tags ?? [],
      fsrs: fsrsCard,
      state: State.New,
      due: now,
      lastReview: null,
      reviewCount: 0,
      contextHistory: [],
      createdAt: now,
      updatedAt: now,
      clozeIndex: input.clozeIndex,
      template: input.template,
    };

    await db.cards.add(card);
    return card;
  },

  async update(input: UpdateCardInput): Promise<Card | undefined> {
    const card = await db.cards.get(input.id);
    if (!card) return undefined;

    const updated: Card = {
      ...card,
      ...input,
      updatedAt: new Date(),
    };

    await db.cards.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.cards.delete(id);
  },

  async getById(id: string): Promise<Card | undefined> {
    return db.cards.get(id);
  },

  async getAll(): Promise<Card[]> {
    return db.cards.toArray();
  },

  async getByTopicIds(topicIds: string[]): Promise<Card[]> {
    return db.cards.where('topicIds').anyOf(topicIds).toArray();
  },

  async getDueCards(before?: Date): Promise<Card[]> {
    const dueDate = before ?? new Date();
    return db.cards.where('due').belowOrEqual(dueDate).toArray();
  },

  async getNewCards(): Promise<Card[]> {
    return db.cards.where('state').equals(State.New).toArray();
  },

  async updateAfterReview(card: Card): Promise<void> {
    await db.cards.put(card);
  },

  async count(): Promise<number> {
    return db.cards.count();
  },

  async getDueCount(): Promise<number> {
    const now = new Date();
    return db.cards.where('due').belowOrEqual(now).count();
  },
};

// Topic operations
export const topicService = {
  async create(input: CreateTopicInput): Promise<Topic> {
    const now = new Date();

    // Get the highest order for this parent
    const parentId = input.parentId ?? null;
    const siblings = parentId === null
      ? await db.topics.filter((t) => t.parentId === null).toArray()
      : await db.topics.where('parentId').equals(parentId).toArray();
    const maxOrder = siblings.reduce((max, t) => Math.max(max, t.order), -1);

    const topic: Topic = {
      id: uuid(),
      name: input.name,
      parentId: input.parentId ?? null,
      color: input.color ?? '#C75D38',
      icon: input.icon,
      relatedTopicIds: input.relatedTopicIds ?? [],
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.topics.add(topic);
    return topic;
  },

  async update(input: UpdateTopicInput): Promise<Topic | undefined> {
    const topic = await db.topics.get(input.id);
    if (!topic) return undefined;

    const updated: Topic = {
      ...topic,
      ...input,
      updatedAt: new Date(),
    };

    await db.topics.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    // Also delete all child topics
    const children = await db.topics.where('parentId').equals(id).toArray();
    for (const child of children) {
      await this.delete(child.id);
    }
    await db.topics.delete(id);
  },

  async getById(id: string): Promise<Topic | undefined> {
    return db.topics.get(id);
  },

  async getAll(): Promise<Topic[]> {
    return db.topics.toArray();
  },

  async getRoots(): Promise<Topic[]> {
    const roots = await db.topics.filter((t) => t.parentId === null).toArray();
    return roots.sort((a, b) => a.order - b.order);
  },

  async getChildren(parentId: string): Promise<Topic[]> {
    return db.topics.where('parentId').equals(parentId).sortBy('order');
  },

  async getRelated(topicId: string): Promise<Topic[]> {
    const topic = await db.topics.get(topicId);
    if (!topic || topic.relatedTopicIds.length === 0) return [];
    return db.topics.where('id').anyOf(topic.relatedTopicIds).toArray();
  },
};

// Session operations
export const sessionService = {
  async create(input: CreateSessionInput): Promise<ReviewSession> {
    const now = new Date();

    const session: ReviewSession = {
      id: uuid(),
      mode: input.mode,
      topicIds: input.topicIds ?? [],
      cardIds: input.cardIds,
      currentIndex: 0,
      completedCardIds: [],
      cardsReviewed: 0,
      cardsRemembered: 0,
      cardsForgot: 0,
      startedAt: now,
      completedAt: null,
      totalTimeMs: 0,
      isActive: true,
    };

    await db.sessions.add(session);
    return session;
  },

  async update(session: ReviewSession): Promise<void> {
    await db.sessions.put(session);
  },

  async complete(id: string): Promise<ReviewSession | undefined> {
    const session = await db.sessions.get(id);
    if (!session) return undefined;

    session.completedAt = new Date();
    session.isActive = false;
    session.totalTimeMs = session.completedAt.getTime() - session.startedAt.getTime();

    await db.sessions.put(session);
    return session;
  },

  async getActive(): Promise<ReviewSession | undefined> {
    return db.sessions.where('isActive').equals(1).first();
  },

  async getById(id: string): Promise<ReviewSession | undefined> {
    return db.sessions.get(id);
  },

  async getRecent(limit = 10): Promise<ReviewSession[]> {
    return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray();
  },
};

// Daily stats operations
export const statsService = {
  async recordReview(remembered: boolean, isNew: boolean): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    let stats = await db.dailyStats.get(today);

    if (!stats) {
      stats = {
        date: today,
        cardsReviewed: 0,
        cardsRemembered: 0,
        cardsForgot: 0,
        newCardsLearned: 0,
        timeSpentMs: 0,
      };
    }

    stats.cardsReviewed += 1;
    if (remembered) {
      stats.cardsRemembered += 1;
    } else {
      stats.cardsForgot += 1;
    }
    if (isNew) {
      stats.newCardsLearned += 1;
    }

    await db.dailyStats.put(stats);
  },

  async addTime(ms: number): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    let stats = await db.dailyStats.get(today);

    if (!stats) {
      stats = {
        date: today,
        cardsReviewed: 0,
        cardsRemembered: 0,
        cardsForgot: 0,
        newCardsLearned: 0,
        timeSpentMs: 0,
      };
    }

    stats.timeSpentMs += ms;
    await db.dailyStats.put(stats);
  },

  async getToday(): Promise<DailyStats | undefined> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return db.dailyStats.get(today);
  },

  async getRange(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    return db.dailyStats.where('date').between(start, end, true, true).toArray();
  },

  async getStreak(): Promise<Streak> {
    const allStats = await db.dailyStats.orderBy('date').reverse().toArray();

    if (allStats.length === 0) {
      return { current: 0, longest: 0, lastReviewDate: null };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const stat of allStats) {
      if (stat.cardsReviewed === 0) continue;

      const statDate = parseISO(stat.date);

      if (lastDate === null) {
        // First day with reviews
        tempStreak = 1;
        if (stat.date === today || stat.date === yesterday) {
          current = 1;
        }
      } else {
        const daysDiff = differenceInDays(lastDate, statDate);
        if (daysDiff === 1) {
          tempStreak += 1;
          if (current > 0) {
            current = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }

      longest = Math.max(longest, tempStreak);
      lastDate = statDate;
    }

    return {
      current,
      longest,
      lastReviewDate: allStats[0]?.date ?? null,
    };
  },

  async getRetentionRate(days = 30): Promise<number> {
    const startDate = subDays(new Date(), days);
    const stats = await this.getRange(startDate, new Date());

    const total = stats.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const remembered = stats.reduce((sum, s) => sum + s.cardsRemembered, 0);

    return total > 0 ? remembered / total : 0;
  },
};

// Database initialization
export async function initializeDatabase(): Promise<void> {
  const topicCount = await db.topics.count();
  if (topicCount === 0) {
    // Import and run seeds
    const { seedDefaultTopics, seedSampleCards } = await import(
      './seeds/default-topics'
    );
    await seedDefaultTopics();
    await seedSampleCards();
  }
}
