import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, AlertCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [postsResult, authorsResult] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("authors").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalPosts: postsResult.count || 0,
        totalAuthors: authorsResult.count || 0,
      };
    },
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, velocity_score, crawl_timestamp")
        .order("crawl_timestamp", { ascending: false })
        .limit(10);
      return data;
    },
  });

  const runCrawler = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("crawler");
      
      if (error) throw error;

      toast({
        title: "Crawler Executed",
        description: data.message || "Crawler completed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Crawler Error",
        description: error.message || "Failed to run crawler",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const avgVelocity =
    recentPosts?.reduce((acc, post) => acc + (Number(post.velocity_score) || 0), 0) /
      (recentPosts?.length || 1) || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor crawler performance and data collection
            </p>
          </div>
          <Button
            onClick={runCrawler}
            disabled={isRunning}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run Crawler"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalPosts || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracked Authors</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalAuthors || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Velocity</p>
                <p className="text-2xl font-bold text-foreground">{avgVelocity.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                To enable data collection, you need to add platform API credentials as secrets:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <strong>TWITTER_BEARER_TOKEN</strong> - Get from Twitter Developer Portal</li>
                <li>• <strong>TRUTHSOCIAL_API_KEY</strong> - If TruthSocial API is available</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Add these in <strong>Cloud → Secrets</strong>, then the crawler will automatically start
                collecting high-velocity posts matching your configured keywords.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                1
              </div>
              <div>
                <strong className="text-foreground">Keyword Filtering:</strong> The crawler searches
                for posts containing your configured keywords across target platforms.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                2
              </div>
              <div>
                <strong className="text-foreground">Velocity Detection:</strong> Engagement metrics are
                analyzed to calculate views/engagement per hour since posting.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                3
              </div>
              <div>
                <strong className="text-foreground">Smart Collection:</strong> Only posts exceeding
                your velocity threshold are stored, focusing on rapidly spreading discussions.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                4
              </div>
              <div>
                <strong className="text-foreground">Author Intelligence:</strong> Author data including
                follower count, verification status, and credibility metrics are tracked automatically.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
