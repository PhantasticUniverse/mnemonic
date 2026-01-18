import type { Card as FSRSCard, State } from 'ts-fsrs';

export type CardType = 'basic' | 'cloze' | 'formula';

export interface Card {
  id: string;
  type: CardType;
  front: string;
  back: string;
  topicIds: string[];
  tags: string[];

  // FSRS scheduling state
  fsrs: FSRSCard;
  state: State;
  due: Date;
  lastReview: Date | null;
  reviewCount: number;

  // Context history for related card interleaving
  contextHistory: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // For cloze cards: which cloze deletion this card represents
  clozeIndex?: number;
  // For cloze/formula: the original template
  template?: string;
}

export interface CreateCardInput {
  type: CardType;
  front: string;
  back: string;
  topicIds: string[];
  tags?: string[];
  template?: string;
  clozeIndex?: number;
}

export interface UpdateCardInput {
  id: string;
  front?: string;
  back?: string;
  topicIds?: string[];
  tags?: string[];
}
