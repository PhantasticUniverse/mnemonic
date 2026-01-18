import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '@/stores/card-store';
import { useTopicStore } from '@/stores/topic-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Play, Flame, Target, BookOpen } from 'lucide-react';
import { statsService, type Streak } from '@mnemonic/core';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dueCount, dueBreakdown, loadDueCounts, cards } = useCardStore();
  const { topics, loadTopics } = useTopicStore();
  const [streak, setStreak] = React.useState<Streak>({ current: 0, longest: 0, lastReviewDate: null });
  const [retentionRate, setRetentionRate] = React.useState(0);

  // Load data on mount
  React.useEffect(() => {
    loadDueCounts();
    loadTopics();

    statsService.getStreak().then(setStreak);
    statsService.getRetentionRate(30).then(setRetentionRate);
  }, [loadDueCounts, loadTopics]);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-semibold">{greeting}</h1>
          <p className="text-muted-foreground">
            Ready to learn something new today?
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="border-2 bg-gradient-to-br from-card to-secondary/30">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-5xl font-serif font-semibold text-primary">
                {dueCount}
              </div>
              <div className="text-lg text-muted-foreground">
                card{dueCount !== 1 ? 's' : ''} due today
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/review')}
              disabled={dueCount === 0}
              className="px-8 py-6 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Review Session
            </Button>

            {dueCount > 12 && (
              <p className="text-sm text-muted-foreground">
                or try a <button
                  onClick={() => navigate('/review')}
                  className="text-primary hover:underline"
                >
                  quick 5-minute session
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Streak"
            value={`${streak.current} days`}
            subtext={streak.longest > streak.current ? `Best: ${streak.longest}` : undefined}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-green-500" />}
            label="Retention"
            value={`${Math.round(retentionRate * 100)}%`}
            subtext="Last 30 days"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-blue-500" />}
            label="Total Cards"
            value={cards.length.toString()}
          />
        </div>

        {/* Due Breakdown */}
        {dueCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Due Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BreakdownRow
                label="Learning"
                count={dueBreakdown.learning}
                total={dueCount}
                color="bg-yellow-500"
              />
              <BreakdownRow
                label="Review"
                count={dueBreakdown.review}
                total={dueCount}
                color="bg-blue-500"
              />
              <BreakdownRow
                label="New"
                count={dueBreakdown.new}
                total={dueCount}
                color="bg-green-500"
              />
            </CardContent>
          </Card>
        )}

        {/* Topic Stats */}
        {topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topics
                .filter((t) => t.parentId === null)
                .slice(0, 5)
                .map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    cards={cards}
                  />
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
          <div>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
            {subtext && (
              <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BreakdownRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function BreakdownRow({ label, count, total, color }: BreakdownRowProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface TopicRowProps {
  topic: { id: string; name: string; color: string };
  cards: { topicIds: string[]; due: Date }[];
}

function TopicRow({ topic, cards }: TopicRowProps) {
  const topicCards = cards.filter((c) => c.topicIds.includes(topic.id));
  const dueCards = topicCards.filter((c) => new Date(c.due) <= new Date());
  const masteryPercentage = topicCards.length > 0
    ? ((topicCards.length - dueCards.length) / topicCards.length) * 100
    : 0;

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: topic.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{topic.name}</div>
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {dueCards.length} due
      </div>
      <div className="w-24">
        <Progress value={masteryPercentage} className="h-2" />
      </div>
      <div className="w-12 text-right text-sm font-medium">
        {Math.round(masteryPercentage)}%
      </div>
    </div>
  );
}
