import * as React from 'react';
import { cn } from '@/lib/utils';
import { Latex } from '@/components/ui/latex';
import { Badge } from '@/components/ui/badge';
import type { Card, Topic } from '@mnemonic/core';

interface ReviewCardProps {
  card: Card;
  topics: Topic[];
  revealed: boolean;
  onReveal: () => void;
  className?: string;
}

export function ReviewCard({
  card,
  topics,
  revealed,
  onReveal,
  className,
}: ReviewCardProps) {
  // Get topic names for display
  const topicPath = React.useMemo(() => {
    const cardTopics = topics.filter((t) => card.topicIds.includes(t.id));
    if (cardTopics.length === 0) return null;

    // Build path from first topic
    const buildPath = (topic: Topic): string[] => {
      const parent = topics.find((t) => t.id === topic.parentId);
      if (parent) {
        return [...buildPath(parent), topic.name];
      }
      return [topic.name];
    };

    return buildPath(cardTopics[0]).join(' › ');
  }, [card.topicIds, topics]);

  return (
    <div
      className={cn(
        'relative w-full max-w-xl mx-auto',
        'bg-card rounded-lg border shadow-lg',
        'min-h-[400px] flex flex-col',
        'transition-all duration-300',
        className
      )}
    >
      {/* Topic badge */}
      {topicPath && (
        <div className="px-8 pt-6">
          <Badge variant="secondary" className="font-normal text-xs">
            {topicPath}
          </Badge>
        </div>
      )}

      {/* Card content */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        {/* Front (question) */}
        <div className="text-xl font-serif leading-relaxed">
          <Latex>{card.front}</Latex>
        </div>

        {/* Divider when revealed */}
        {revealed && (
          <div className="w-24 h-px bg-border my-8" />
        )}

        {/* Back (answer) - only shown when revealed */}
        {revealed && (
          <div
            className="text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            <Latex>{card.back}</Latex>
          </div>
        )}
      </div>

      {/* Show answer button - only when not revealed */}
      {!revealed && (
        <div className="px-8 pb-8 flex justify-center">
          <button
            onClick={onReveal}
            className={cn(
              'px-8 py-3 rounded-md',
              'bg-secondary text-secondary-foreground',
              'font-medium text-sm',
              'hover:bg-secondary/80',
              'transition-all duration-150',
              'hover:-translate-y-0.5',
              'shadow-sm hover:shadow'
            )}
          >
            Show Answer
          </button>
        </div>
      )}
    </div>
  );
}
