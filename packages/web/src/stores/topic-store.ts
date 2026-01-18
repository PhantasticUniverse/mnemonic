import { create } from 'zustand';
import {
  type Topic,
  type TopicWithChildren,
  type CreateTopicInput,
  type UpdateTopicInput,
  topicService,
  buildTopicTree,
} from '@mnemonic/core';

interface TopicState {
  topics: Topic[];
  topicTree: TopicWithChildren[];
  isLoading: boolean;
  selectedTopicId: string | null;

  // Actions
  loadTopics: () => Promise<void>;
  createTopic: (input: CreateTopicInput) => Promise<Topic>;
  updateTopic: (input: UpdateTopicInput) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  selectTopic: (id: string | null) => void;
  getTopicById: (id: string) => Topic | undefined;
  getTopicPath: (id: string) => string;
}

export const useTopicStore = create<TopicState>((set, get) => ({
  topics: [],
  topicTree: [],
  isLoading: false,
  selectedTopicId: null,

  loadTopics: async () => {
    set({ isLoading: true });
    try {
      const topics = await topicService.getAll();
      const topicTree = buildTopicTree(topics);
      set({ topics, topicTree, isLoading: false });
    } catch (error) {
      console.error('Failed to load topics:', error);
      set({ isLoading: false });
    }
  },

  createTopic: async (input) => {
    const topic = await topicService.create(input);
    await get().loadTopics();
    return topic;
  },

  updateTopic: async (input) => {
    await topicService.update(input);
    await get().loadTopics();
  },

  deleteTopic: async (id) => {
    await topicService.delete(id);
    if (get().selectedTopicId === id) {
      set({ selectedTopicId: null });
    }
    await get().loadTopics();
  },

  selectTopic: (id) => {
    set({ selectedTopicId: id });
  },

  getTopicById: (id) => {
    return get().topics.find((t) => t.id === id);
  },

  getTopicPath: (id) => {
    const { topics } = get();
    const topic = topics.find((t) => t.id === id);
    if (!topic) return '';

    const buildPath = (t: Topic): string[] => {
      const parent = topics.find((p) => p.id === t.parentId);
      if (parent) {
        return [...buildPath(parent), t.name];
      }
      return [t.name];
    };

    return buildPath(topic).join(' › ');
  },
}));
