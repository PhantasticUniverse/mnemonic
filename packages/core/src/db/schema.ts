import Dexie, { type EntityTable } from 'dexie';
import type { Card } from '../models/card';
import type { Topic } from '../models/topic';
import type { ReviewSession, DailyStats } from '../models/session';

export class MnemonicDatabase extends Dexie {
  cards!: EntityTable<Card, 'id'>;
  topics!: EntityTable<Topic, 'id'>;
  sessions!: EntityTable<ReviewSession, 'id'>;
  dailyStats!: EntityTable<DailyStats, 'date'>;

  constructor() {
    super('mnemonic');

    this.version(1).stores({
      cards: 'id, type, state, due, *topicIds, *tags, createdAt, updatedAt',
      topics: 'id, parentId, order, createdAt',
      sessions: 'id, mode, isActive, startedAt, completedAt',
      dailyStats: 'date',
    });
  }
}

export const db = new MnemonicDatabase();
