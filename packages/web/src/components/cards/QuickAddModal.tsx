import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Latex } from '@/components/ui/latex';
import { useCardStore } from '@/stores/card-store';
import { useTopicStore } from '@/stores/topic-store';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';
import type { CardType } from '@mnemonic/core';
import { hasCloze } from '@mnemonic/core';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { createCard } = useCardStore();
  const { topics } = useTopicStore();

  const [front, setFront] = React.useState('');
  const [back, setBack] = React.useState('');
  const [cardType, setCardType] = React.useState<CardType>('basic');
  const [selectedTopicIds, setSelectedTopicIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showTopicPicker, setShowTopicPicker] = React.useState(false);

  const frontRef = React.useRef<HTMLTextAreaElement>(null);

  // Focus front input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => frontRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-detect card type from content
  React.useEffect(() => {
    if (hasCloze(front)) {
      setCardType('cloze');
    }
  }, [front]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim() || selectedTopicIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await createCard({
        type: cardType,
        front: front.trim(),
        back: back.trim(),
        topicIds: selectedTopicIds,
        template: cardType === 'cloze' ? front.trim() : undefined,
      });

      // Reset form
      setFront('');
      setBack('');
      setCardType('basic');
      setSelectedTopicIds([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add Card
            <kbd className="ml-auto px-2 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">
              Cmd+K
            </kbd>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Front */}
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              ref={frontRef}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question or prompt..."
              className="min-h-[80px]"
            />
          </div>

          {/* Back */}
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer..."
              className="min-h-[80px]"
            />
            {/* LaTeX preview */}
            {back && (back.includes('$') || back.includes('\\')) && (
              <div className="p-3 rounded-md bg-muted/50 text-sm">
                <span className="text-xs text-muted-foreground block mb-1">Preview:</span>
                <Latex>{back}</Latex>
              </div>
            )}
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label>Topics</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <Badge
                  key={topic.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => toggleTopic(topic.id)}
                >
                  {topic.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTopicPicker(!showTopicPicker)}
                className="h-6"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            {/* Topic picker */}
            {showTopicPicker && (
              <div className="p-2 border rounded-md max-h-40 overflow-y-auto">
                {topics
                  .filter((t) => !selectedTopicIds.includes(t.id))
                  .map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        toggleTopic(topic.id);
                        if (selectedTopicIds.length === 0) {
                          setShowTopicPicker(false);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-sm',
                        'hover:bg-muted transition-colors'
                      )}
                    >
                      {topic.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Card type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-4">
              {(['basic', 'cloze', 'formula'] as CardType[]).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cardType"
                    value={type}
                    checked={cardType === type}
                    onChange={(e) => setCardType(e.target.value as CardType)}
                    className="accent-primary"
                  />
                  <span className="text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !front.trim() ||
                !back.trim() ||
                selectedTopicIds.length === 0 ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Saving...' : 'Save Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
