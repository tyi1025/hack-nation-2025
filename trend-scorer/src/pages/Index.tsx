import { TrendCard } from '@/components/TrendCard';
import { MetricCard } from '@/components/MetricCard';
import { useTrendData } from '@/hooks/useTrendData';
import { SeedDataButton } from '@/components/SeedDataButton';
import { Activity, TrendingUp, Users, Target, Clock } from 'lucide-react';

const Index = () => {
  const { rankedTopics, loading, lastUpdate } = useTrendData();

  const topTenTopics = rankedTopics.slice(0, 10);
  const totalTopics = rankedTopics.length;
  const criticalCount = rankedTopics.filter(t => t.status.toLowerCase() === 'critical').length;
  const avgScore = rankedTopics.length > 0 
    ? (rankedTopics.reduce((sum, t) => sum + t.finalTrendScore, 0) / rankedTopics.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-primary text-xl font-mono">Loading trend data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Trend Ranking Engine</h1>
            </div>
            <div className="flex items-center gap-3">
              <SeedDataButton />
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-lg border border-border">
                <Clock className="h-4 w-4 text-primary animate-pulse" />
                <span>Live • Updated {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Real-time market signal detection • Outrun the crowd
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Active Topics"
            value={totalTopics}
            icon={Activity}
            trend="neutral"
          />
          <MetricCard
            title="Critical Alerts"
            value={criticalCount}
            icon={TrendingUp}
            trend="up"
            subtitle={`${((criticalCount / totalTopics) * 100).toFixed(0)}% of total`}
          />
          <MetricCard
            title="Avg Trend Score"
            value={avgScore}
            icon={Target}
            trend="neutral"
          />
          <MetricCard
            title="Data Sources"
            value="3"
            subtitle="X, TruthSocial"
            icon={Users}
            trend="neutral"
          />
        </div>

        {/* Top 10 Topics */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Top 10 Trending Topics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topTenTopics.map((topic) => (
            <TrendCard key={topic.topicId} topic={topic} />
          ))}
        </div>

        {topTenTopics.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No trending topics found. Check your data sources.
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Algorithm:</strong> Final Trend Score = (Velocity × 0.5) + (Volume × 0.2) + (Early Signaler Bonus × 0.3)
            <br />
            <strong className="text-foreground">Author Credibility:</strong> Verified (+20) • High Reach (+30) • Expert Bio (+20) • Disinformation Penalty (-50)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
