import { cn } from '@/lib/utils';
import { formatInterval, type IntervalPreview } from '@mnemonic/core';

interface ReviewControlsProps {
  intervals: IntervalPreview;
  onForgot: () => void;
  onRemembered: () => void;
  disabled?: boolean;
  className?: string;
}

export function ReviewControls({
  intervals,
  onForgot,
  onRemembered,
  disabled = false,
  className,
}: ReviewControlsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-6',
        'animate-fade-up',
        className
      )}
      style={{ animationDelay: '150ms' }}
    >
      {/* Forgot button */}
      <button
        onClick={onForgot}
        disabled={disabled}
        className={cn(
          'min-w-[160px] px-8 py-5 rounded-lg',
          'flex flex-col items-center gap-1',
          'bg-destructive/10 text-destructive',
          'border border-transparent',
          'font-medium',
          'transition-all duration-150',
          'hover:bg-destructive hover:text-destructive-foreground',
          'hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        <span className="text-base">Forgot</span>
        <span className="text-xs opacity-70">~{formatInterval(intervals.forgot)}</span>
      </button>

      {/* Remembered button */}
      <button
        onClick={onRemembered}
        disabled={disabled}
        className={cn(
          'min-w-[160px] px-8 py-5 rounded-lg',
          'flex flex-col items-center gap-1',
          'bg-success/10 text-success',
          'border border-transparent',
          'font-medium',
          'transition-all duration-150',
          'hover:bg-success hover:text-success-foreground',
          'hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        <span className="text-base">Remembered</span>
        <span className="text-xs opacity-70">~{formatInterval(intervals.remembered)}</span>
      </button>
    </div>
  );
}

// Keyboard shortcut hints
export function ReviewKeyboardHints({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-8 text-xs text-muted-foreground',
        className
      )}
    >
      <span>
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mr-1">Space</kbd>
        Show answer
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mr-1">1</kbd>
        Forgot
      </span>
      <span>
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mr-1">2</kbd>
        Remembered
      </span>
    </div>
  );
}
