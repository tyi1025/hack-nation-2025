import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ExternalLink, TrendingUp } from "lucide-react";

export default function Posts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("crawl_timestamp", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data;
    },
  });

  // Group posts by topic/keyword
  const topicData = posts?.reduce((acc: any[], post) => {
    post.trigger_keywords?.forEach((keyword: string) => {
      const existing = acc.find(t => t.topic === keyword);
      const engagement = post.engagement_snapshot as any;
      
      if (existing) {
        existing.postCount++;
        existing.totalViews += engagement?.views || 0;
        existing.totalReposts += engagement?.reposts || 0;
        existing.totalReplies += engagement?.replies || 0;
        existing.velocityScores.push(post.velocity_score || 0);
        existing.platforms.add(post.platform);
        if (new Date(post.crawl_timestamp) > new Date(existing.lastActivity)) {
          existing.lastActivity = post.crawl_timestamp;
        }
      } else {
        acc.push({
          topic: keyword,
          postCount: 1,
          totalViews: engagement?.views || 0,
          totalReposts: engagement?.reposts || 0,
          totalReplies: engagement?.replies || 0,
          velocityScores: [post.velocity_score || 0],
          platforms: new Set([post.platform]),
          lastActivity: post.crawl_timestamp
        });
      }
    });
    return acc;
  }, []) || [];

  // Calculate average velocity and sort by post count
  const sortedTopics = topicData
    .map(topic => ({
      ...topic,
      avgVelocity: topic.velocityScores.reduce((a: number, b: number) => a + b, 0) / topic.velocityScores.length,
      platforms: Array.from(topic.platforms)
    }))
    .sort((a, b) => b.postCount - a.postCount);

  const getVelocityBadge = (score: number) => {
    if (score > 500) return <Badge className="bg-destructive">Critical</Badge>;
    if (score > 200) return <Badge className="bg-warning text-warning-foreground">High</Badge>;
    return <Badge className="bg-success">Normal</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Trending Topics
            </h1>
            <p className="text-muted-foreground mt-1">
              Topics grouped by crowd activity and engagement
            </p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {sortedTopics?.length || 0} Topics
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {posts?.length || 0} Posts
            </Badge>
          </div>
        </div>

        <Card className="border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Topic</TableHead>
                  <TableHead className="text-muted-foreground">Posts</TableHead>
                  <TableHead className="text-muted-foreground">Platforms</TableHead>
                  <TableHead className="text-muted-foreground">Total Engagement</TableHead>
                  <TableHead className="text-muted-foreground">Avg Velocity</TableHead>
                  <TableHead className="text-muted-foreground">Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading topics...
                    </TableCell>
                  </TableRow>
                ) : sortedTopics?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No topics detected yet. Configure the crawler and start monitoring.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTopics?.map((topic, idx) => (
                    <TableRow key={idx} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <div className="font-semibold text-foreground text-lg">
                          {topic.topic}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-base px-3 py-1">
                          {topic.postCount} posts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {topic.platforms.map((platform: string, pIdx: number) => (
                            <Badge key={pIdx} variant="secondary" className="text-xs font-mono">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="text-foreground font-medium">
                            {topic.totalViews.toLocaleString()} views
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {topic.totalReposts.toLocaleString()} reposts · {topic.totalReplies.toLocaleString()} replies
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVelocityBadge(topic.avgVelocity)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(topic.lastActivity), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
