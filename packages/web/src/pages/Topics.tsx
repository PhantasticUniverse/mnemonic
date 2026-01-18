import { TopicTree } from '@/components/topics/TopicTree';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function TopicsPage() {
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-semibold">Topics</h1>
          <p className="text-muted-foreground text-sm">
            Organize your cards into topics and subtopics
          </p>
        </div>

        {/* Topic Tree */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topic Hierarchy</CardTitle>
            <CardDescription>
              Click a topic to expand, hover for actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopicTree />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
