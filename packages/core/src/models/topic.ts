export interface Topic {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon?: string;

  // Related topics for interleaving during reviews
  relatedTopicIds: string[];

  // Ordering within parent
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTopicInput {
  name: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
  relatedTopicIds?: string[];
}

export interface UpdateTopicInput {
  id: string;
  name?: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
  relatedTopicIds?: string[];
  order?: number;
}

export interface TopicWithChildren extends Topic {
  children: TopicWithChildren[];
}

// Helper to build tree from flat list
export function buildTopicTree(topics: Topic[]): TopicWithChildren[] {
  const topicMap = new Map<string, TopicWithChildren>();
  const roots: TopicWithChildren[] = [];

  // Create all nodes with empty children arrays
  for (const topic of topics) {
    topicMap.set(topic.id, { ...topic, children: [] });
  }

  // Build tree structure
  for (const topic of topics) {
    const node = topicMap.get(topic.id)!;
    if (topic.parentId === null) {
      roots.push(node);
    } else {
      const parent = topicMap.get(topic.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphaned node, treat as root
        roots.push(node);
      }
    }
  }

  // Sort by order at each level
  const sortByOrder = (nodes: TopicWithChildren[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) {
      sortByOrder(node.children);
    }
  };
  sortByOrder(roots);

  return roots;
}
