import { CardFormModal } from './CardFormModal';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Quick add modal for creating new cards.
 * Thin wrapper around CardFormModal for backward compatibility.
 */
export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  return <CardFormModal open={open} onOpenChange={onOpenChange} card={null} />;
}
