import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import type { SessionStats } from '@mnemonic/core';

interface SessionCompleteProps {
  stats: SessionStats;
  onClose: () => void;
  onContinue?: () => void;
  className?: string;
}

export function SessionComplete({
  stats,
  onClose,
  onContinue,
  className,
}: SessionCompleteProps) {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const accuracy = Math.round(stats.accuracy * 100);

  return (
    <div
      className={cn(
        'w-full max-w-md mx-auto animate-fade-up',
        className
      )}
    >
      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl font-serif">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Cards Reviewed"
              value={stats.cardsReviewed.toString()}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Accuracy"
              value={`${accuracy}%`}
              valueColor={accuracy >= 80 ? 'text-success' : accuracy >= 60 ? 'text-warning' : 'text-destructive'}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="Remembered"
              value={stats.cardsRemembered.toString()}
              valueColor="text-success"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Time Spent"
              value={formatTime(stats.totalTimeMs)}
            />
          </div>

          {/* Breakdown */}
          <div className="flex justify-center gap-8 py-4 border-t border-b">
            <div className="text-center">
              <div className="text-2xl font-semibold text-success">
                {stats.cardsRemembered}
              </div>
              <div className="text-xs text-muted-foreground">Remembered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-destructive">
                {stats.cardsForgot}
              </div>
              <div className="text-xs text-muted-foreground">Forgot</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Done
            </Button>
            {onContinue && (
              <Button onClick={onContinue} className="flex-1">
                Continue Reviewing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

function StatCard({ icon, label, value, valueColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className={cn('text-lg font-semibold', valueColor)}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
