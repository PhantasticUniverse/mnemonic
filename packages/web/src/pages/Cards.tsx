import * as React from 'react';
import { useCardStore } from '@/stores/card-store';
import { useTopicStore } from '@/stores/topic-store';
import { CardBrowser } from '@/components/cards/CardBrowser';
import { QuickAddModal } from '@/components/cards/QuickAddModal';
import { Button } from '@/components/ui/button';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Plus } from 'lucide-react';

export function CardsPage() {
  const { loadCards } = useCardStore();
  const { loadTopics } = useTopicStore();
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Load data on mount
  React.useEffect(() => {
    loadCards();
    loadTopics();
  }, [loadCards, loadTopics]);

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onQuickAdd: () => setShowAddModal(true),
  });

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Cards</h1>
            <p className="text-muted-foreground text-sm">
              Manage your flashcard collection
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        {/* Card Browser */}
        <CardBrowser />

        {/* Quick Add Modal */}
        <QuickAddModal open={showAddModal} onOpenChange={setShowAddModal} />
      </div>
    </div>
  );
}
