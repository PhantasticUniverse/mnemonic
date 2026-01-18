import * as React from 'react';
import { useCardStore } from '@/stores/card-store';
import { useTopicStore } from '@/stores/topic-store';
import { CardBrowser } from '@/components/cards/CardBrowser';
import { QuickAddModal } from '@/components/cards/QuickAddModal';
import { CardFormModal } from '@/components/cards/CardFormModal';
import { Button } from '@/components/ui/button';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Plus } from 'lucide-react';
import type { Card } from '@mnemonic/core';

export function CardsPage() {
  const { loadCards } = useCardStore();
  const { loadTopics } = useTopicStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<Card | null>(null);

  // Load data on mount
  React.useEffect(() => {
    loadCards();
    loadTopics();
  }, [loadCards, loadTopics]);

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onQuickAdd: () => setShowAddModal(true),
  });

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
  };

  const handleCloseEditModal = (open: boolean) => {
    if (!open) {
      setEditingCard(null);
    }
  };

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
        <CardBrowser onEditCard={handleEditCard} />

        {/* Quick Add Modal */}
        <QuickAddModal open={showAddModal} onOpenChange={setShowAddModal} />

        {/* Edit Card Modal */}
        <CardFormModal
          open={!!editingCard}
          onOpenChange={handleCloseEditModal}
          card={editingCard}
        />
      </div>
    </div>
  );
}
