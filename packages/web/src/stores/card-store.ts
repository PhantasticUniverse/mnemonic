import { create } from 'zustand';
import {
  type Card,
  type CreateCardInput,
  type UpdateCardInput,
  cardService,
  getDueCount,
  getDueBreakdown,
  hasCloze,
  generateClozeCards,
  hasFormula,
  generateFormulaCards,
} from '@mnemonic/core';

interface CardState {
  cards: Card[];
  isLoading: boolean;
  dueCount: number;
  dueBreakdown: { learning: number; review: number; new: number };

  // Filters
  searchQuery: string;
  filterTopicIds: string[];

  // Actions
  loadCards: () => Promise<void>;
  loadDueCounts: () => Promise<void>;
  createCard: (input: CreateCardInput) => Promise<Card>;
  updateCard: (input: UpdateCardInput) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterTopicIds: (ids: string[]) => void;
  getFilteredCards: () => Card[];
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  isLoading: false,
  dueCount: 0,
  dueBreakdown: { learning: 0, review: 0, new: 0 },
  searchQuery: '',
  filterTopicIds: [],

  loadCards: async () => {
    set({ isLoading: true });
    try {
      const cards = await cardService.getAll();
      set({ cards, isLoading: false });
    } catch (error) {
      console.error('Failed to load cards:', error);
      set({ isLoading: false });
    }
  },

  loadDueCounts: async () => {
    try {
      const dueCount = await getDueCount();
      const dueBreakdown = await getDueBreakdown();
      set({ dueCount, dueBreakdown });
    } catch (error) {
      console.error('Failed to load due counts:', error);
    }
  },

  createCard: async (input) => {
    // Check if this is a cloze card that needs to be expanded
    if (input.type === 'cloze' && input.template && hasCloze(input.template)) {
      const clozeCards = generateClozeCards(input.template);
      let firstCard: Card | null = null;

      for (const cloze of clozeCards) {
        const card = await cardService.create({
          type: 'cloze',
          front: cloze.front,
          back: cloze.back,
          topicIds: input.topicIds,
          tags: input.tags,
          template: input.template,
          clozeIndex: cloze.clozeIndex,
        });
        if (!firstCard) firstCard = card;
      }

      await get().loadCards();
      await get().loadDueCounts();
      return firstCard!;
    }

    // Check if this is a formula card that needs to be expanded
    if (input.type === 'formula' && input.template && hasFormula(input.template)) {
      const formulaCards = generateFormulaCards(input.template);
      let firstCard: Card | null = null;

      for (const formula of formulaCards) {
        const card = await cardService.create({
          type: 'formula',
          front: formula.front,
          back: formula.back,
          topicIds: input.topicIds,
          tags: input.tags,
          template: input.template,
        });
        if (!firstCard) firstCard = card;
      }

      await get().loadCards();
      await get().loadDueCounts();
      return firstCard!;
    }

    // Regular card creation
    const card = await cardService.create(input);
    await get().loadCards();
    await get().loadDueCounts();
    return card;
  },

  updateCard: async (input) => {
    await cardService.update(input);
    await get().loadCards();
    await get().loadDueCounts();
  },

  deleteCard: async (id) => {
    await cardService.delete(id);
    await get().loadCards();
    await get().loadDueCounts();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilterTopicIds: (ids) => {
    set({ filterTopicIds: ids });
  },

  getFilteredCards: () => {
    const { cards, searchQuery, filterTopicIds } = get();
    let filtered = cards;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query)
      );
    }

    // Filter by topics
    if (filterTopicIds.length > 0) {
      filtered = filtered.filter((card) =>
        card.topicIds.some((tid) => filterTopicIds.includes(tid))
      );
    }

    return filtered;
  },
}));
