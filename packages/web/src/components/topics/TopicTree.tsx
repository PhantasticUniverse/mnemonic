import * as React from 'react';
import { useTopicStore } from '@/stores/topic-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { TopicWithChildren } from '@mnemonic/core';

export function TopicTree() {
  const { topicTree, loadTopics, createTopic, updateTopic, deleteTopic } = useTopicStore();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [newTopicParentId, setNewTopicParentId] = React.useState<string | null>(null);
  const [newTopicName, setNewTopicName] = React.useState('');

  React.useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateTopic = async (parentId: string | null) => {
    if (!newTopicName.trim()) return;

    await createTopic({
      name: newTopicName.trim(),
      parentId,
    });

    setNewTopicName('');
    setNewTopicParentId(null);

    // Expand parent if creating child
    if (parentId) {
      setExpandedIds((prev) => new Set([...prev, parentId]));
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (confirm('Delete this topic and all its children?')) {
      await deleteTopic(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Root level topics */}
      {topicTree.map((topic) => (
        <TopicNode
          key={topic.id}
          topic={topic}
          level={0}
          expandedIds={expandedIds}
          editingId={editingId}
          onToggleExpand={toggleExpand}
          onStartEdit={setEditingId}
          onSaveEdit={async (id, name) => {
            await updateTopic({ id, name });
            setEditingId(null);
          }}
          onCancelEdit={() => setEditingId(null)}
          onDelete={handleDeleteTopic}
          onAddChild={(parentId) => {
            setNewTopicParentId(parentId);
            setExpandedIds((prev) => new Set([...prev, parentId]));
          }}
        />
      ))}

      {/* Add root topic button */}
      {newTopicParentId === null && (
        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="New topic name..."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTopic(null);
              if (e.key === 'Escape') {
                setNewTopicName('');
              }
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleCreateTopic(null)}
            disabled={!newTopicName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add child topic inline */}
      {newTopicParentId !== null && (
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${(getTopicDepth(topicTree, newTopicParentId) + 1) * 24 + 32}px` }}
        >
          <Input
            autoFocus
            placeholder="New subtopic name..."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTopic(newTopicParentId);
              if (e.key === 'Escape') {
                setNewTopicName('');
                setNewTopicParentId(null);
              }
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleCreateTopic(newTopicParentId)}
            disabled={!newTopicName.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setNewTopicName('');
              setNewTopicParentId(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface TopicNodeProps {
  topic: TopicWithChildren;
  level: number;
  expandedIds: Set<string>;
  editingId: string | null;
  onToggleExpand: (id: string) => void;
  onStartEdit: (id: string) => void;
  onSaveEdit: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

function TopicNode({
  topic,
  level,
  expandedIds,
  editingId,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onAddChild,
}: TopicNodeProps) {
  const [editName, setEditName] = React.useState(topic.name);
  const isExpanded = expandedIds.has(topic.id);
  const isEditing = editingId === topic.id;
  const hasChildren = topic.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 py-2 px-3 rounded-lg',
          'hover:bg-muted/50 transition-colors',
          level > 0 && 'ml-6'
        )}
      >
        {/* Expand/collapse button */}
        <button
          onClick={() => onToggleExpand(topic.id)}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded',
            'text-muted-foreground hover:text-foreground',
            'transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: topic.color }}
        />

        {/* Name */}
        {isEditing ? (
          <Input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit(topic.id, editName);
              if (e.key === 'Escape') onCancelEdit();
            }}
            onBlur={() => onSaveEdit(topic.id, editName)}
            className="h-8 flex-1"
          />
        ) : (
          <span className="flex-1 font-medium">{topic.name}</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddChild(topic.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setEditName(topic.name);
              onStartEdit(topic.id);
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(topic.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="border-l-2 border-muted ml-6">
          {topic.children.map((child) => (
            <TopicNode
              key={child.id}
              topic={child}
              level={level + 1}
              expandedIds={expandedIds}
              editingId={editingId}
              onToggleExpand={onToggleExpand}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTopicDepth(tree: TopicWithChildren[], targetId: string, depth = 0): number {
  for (const topic of tree) {
    if (topic.id === targetId) return depth;
    const childDepth = getTopicDepth(topic.children, targetId, depth + 1);
    if (childDepth >= 0) return childDepth;
  }
  return -1;
}
