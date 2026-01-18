import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface SessionProgressProps {
  current: number;
  total: number;
  elapsedMs: number;
  onExit: () => void;
  className?: string;
}

export function SessionProgress({
  current,
  total,
  elapsedMs,
  onExit,
  className,
}: SessionProgressProps) {
  const remaining = total - current;
  const progress = total > 0 ? (current / total) * 100 : 0;

  // Format elapsed time
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-background/80 backdrop-blur-sm border-t',
        'px-6 py-4',
        className
      )}
    >
      <div className="max-w-xl mx-auto flex items-center gap-6">
        {/* Exit button */}
        <button
          onClick={onExit}
          className={cn(
            'p-2 rounded-md',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-muted',
            'transition-colors'
          )}
          title="Exit session"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Remaining count */}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {remaining} remaining
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Elapsed time */}
        <div className="text-sm text-muted-foreground font-mono whitespace-nowrap">
          {formatTime(elapsedMs)}
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile
export function SessionProgressCompact({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i < current ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {current}/{total}
      </span>
    </div>
  );
}
