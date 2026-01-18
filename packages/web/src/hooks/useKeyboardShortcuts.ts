import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onReveal?: () => void;
  onForgot?: () => void;
  onRemembered?: () => void;
  onEscape?: () => void;
}

export function useReviewKeyboardShortcuts(
  handlers: ShortcutHandlers,
  enabled = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          handlers.onReveal?.();
          break;
        case '1':
        case 'j':
          event.preventDefault();
          handlers.onForgot?.();
          break;
        case '2':
        case 'k':
          event.preventDefault();
          handlers.onRemembered?.();
          break;
        case 'Escape':
          event.preventDefault();
          handlers.onEscape?.();
          break;
      }
    },
    [handlers]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export function useGlobalShortcuts(handlers: {
  onQuickAdd?: () => void;
}) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl + K for quick add
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handlers.onQuickAdd?.();
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
