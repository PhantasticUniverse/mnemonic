import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '@/stores/review-store';
import { useTopicStore } from '@/stores/topic-store';
import {
  ReviewCard,
  ReviewControls,
  ReviewKeyboardHints,
  SessionProgress,
  SessionComplete,
} from '@/components/review';
import { useReviewKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { SessionStats } from '@mnemonic/core';

export function ReviewPage() {
  const navigate = useNavigate();
  const {
    isActive,
    isLoading,
    currentCard,
    revealed,
    intervals,
    totalCards,
    cardsReviewed,
    startTime,
    startSession,
    revealAnswer,
    submitResponse,
    endSession,
    resetSession,
  } = useReviewStore();

  const { topics, loadTopics } = useTopicStore();
  const [sessionStats, setSessionStats] = React.useState<SessionStats | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  // Load topics on mount
  React.useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // Update elapsed time
  React.useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Keyboard shortcuts
  useReviewKeyboardShortcuts(
    {
      onReveal: () => {
        if (currentCard && !revealed) {
          revealAnswer();
        }
      },
      onForgot: () => {
        if (currentCard && revealed) {
          submitResponse(false);
        }
      },
      onRemembered: () => {
        if (currentCard && revealed) {
          submitResponse(true);
        }
      },
      onEscape: () => {
        handleExit();
      },
    },
    isActive
  );

  const handleStartSession = async (mode: 'micro' | 'standard') => {
    await startSession(mode);
  };

  const handleExit = async () => {
    if (isActive && cardsReviewed > 0) {
      const stats = await endSession();
      setSessionStats(stats);
    } else {
      resetSession();
      navigate('/');
    }
  };

  const handleSessionComplete = async () => {
    if (currentCard === null && cardsReviewed > 0) {
      const stats = await endSession();
      setSessionStats(stats);
    }
  };

  // Check for session completion
  React.useEffect(() => {
    if (isActive && currentCard === null && cardsReviewed > 0) {
      handleSessionComplete();
    }
  }, [currentCard, isActive, cardsReviewed]);

  // Show completion screen
  if (sessionStats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SessionComplete
          stats={sessionStats}
          onClose={() => {
            setSessionStats(null);
            navigate('/');
          }}
        />
      </div>
    );
  }

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show session mode selection
  if (!isActive) {
    return <SessionModeSelection onStart={handleStartSession} />;
  }

  // Show review interface
  return (
    <div className="min-h-screen pb-24 pt-8 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        {currentCard && (
          <>
            <ReviewCard
              card={currentCard}
              topics={topics}
              revealed={revealed}
              onReveal={revealAnswer}
            />

            {revealed && intervals && (
              <ReviewControls
                intervals={intervals}
                onForgot={() => submitResponse(false)}
                onRemembered={() => submitResponse(true)}
              />
            )}

            <ReviewKeyboardHints className="mt-8" />
          </>
        )}
      </div>

      <SessionProgress
        current={cardsReviewed}
        total={totalCards}
        elapsedMs={elapsedMs}
        onExit={handleExit}
      />
    </div>
  );
}

function SessionModeSelection({
  onStart,
}: {
  onStart: (mode: 'micro' | 'standard') => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-semibold">Start Review</h1>
          <p className="text-muted-foreground">Choose your session type</p>
        </div>

        <div className="space-y-4">
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary hover:shadow-md',
              'hover:-translate-y-0.5'
            )}
            onClick={() => onStart('micro')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                10-15 cards. Perfect for a 5-minute break.
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary hover:shadow-md',
              'hover:-translate-y-0.5'
            )}
            onClick={() => onStart('standard')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Full Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All due cards. Recommended for daily review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
