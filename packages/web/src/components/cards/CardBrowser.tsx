import * as React from 'react';
import { useCardStore } from '@/stores/card-store';
import { useTopicStore } from '@/stores/topic-store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Latex } from '@/components/ui/latex';
import { cn } from '@/lib/utils';
import { Search, Trash2, Edit, Filter } from 'lucide-react';
import { getStateName, formatInterval, type Card as CardModel } from '@mnemonic/core';
import { differenceInDays } from 'date-fns';

interface CardBrowserProps {
  onEditCard?: (card: CardModel) => void;
}

export function CardBrowser({ onEditCard }: CardBrowserProps) {
  const {
    searchQuery,
    filterTopicIds,
    setSearchQuery,
    setFilterTopicIds,
    getFilteredCards,
    deleteCard,
  } = useCardStore();
  const { topics } = useTopicStore();

  const filteredCards = getFilteredCards();
  const [showFilters, setShowFilters] = React.useState(false);

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      await deleteCard(id);
    }
  };

  const toggleTopicFilter = (topicId: string) => {
    setFilterTopicIds(
      filterTopicIds.includes(topicId)
        ? filterTopicIds.filter((id) => id !== topicId)
        : [...filterTopicIds, topicId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Topic filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
          {topics.map((topic) => (
            <Badge
              key={topic.id}
              variant={filterTopicIds.includes(topic.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTopicFilter(topic.id)}
            >
              {topic.name}
            </Badge>
          ))}
          {filterTopicIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterTopicIds([])}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
        {(searchQuery || filterTopicIds.length > 0) && ' found'}
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {filteredCards.map((card) => (
          <CardListItem
            key={card.id}
            card={card}
            topics={topics}
            onEdit={() => onEditCard?.(card)}
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}

        {filteredCards.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterTopicIds.length > 0
              ? 'No cards match your filters.'
              : 'No cards yet. Create one with Cmd+K.'}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardListItemProps {
  card: CardModel;
  topics: { id: string; name: string }[];
  onEdit: () => void;
  onDelete: () => void;
}

function CardListItem({ card, topics, onEdit, onDelete }: CardListItemProps) {
  const cardTopics = topics.filter((t) => card.topicIds.includes(t.id));
  const daysUntilDue = differenceInDays(card.due, new Date());
  const isDue = daysUntilDue <= 0;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Card content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Front */}
            <div className="font-medium truncate">
              <Latex>{card.front}</Latex>
            </div>
            {/* Back (truncated) */}
            <div className="text-sm text-muted-foreground truncate">
              <Latex>{card.back}</Latex>
            </div>
            {/* Topics */}
            <div className="flex flex-wrap gap-1">
              {cardTopics.map((topic) => (
                <Badge key={topic.id} variant="secondary" className="text-xs">
                  {topic.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats and actions */}
          <div className="flex flex-col items-end justify-between">
            {/* Status */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {getStateName(card.state)}
              </div>
              <div
                className={cn(
                  'text-xs',
                  isDue ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {isDue
                  ? 'Due now'
                  : `Due in ${formatInterval(daysUntilDue)}`}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
