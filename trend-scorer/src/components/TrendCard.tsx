import { RankedTopic } from "@/lib/trendRanking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricBadge } from "@/components/MetricBadge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Shield, 
  Users, 
  Eye, 
  Clock, 
  BarChart3,
  CheckCircle2,
  Share2
} from "lucide-react";

interface TrendCardProps {
  topic: RankedTopic;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'hot':
      return 'warning';
    case 'rising':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4" />;
    case 'hot':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export function TrendCard({ topic }: TrendCardProps) {
  const credibilityVariant = topic.averageSourceCredibility >= 70 ? 'success' : 
                             topic.averageSourceCredibility >= 40 ? 'warning' : 'destructive';
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Card className="p-6 border-border bg-card hover:bg-card/80 transition-colors">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-mono text-xl font-bold">
            #{topic.rank}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{topic.topicName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(topic.status)} className="gap-1">
                {getStatusIcon(topic.status)}
                {topic.status.toUpperCase()}
              </Badge>
              {topic.verifiedSourceCount > 0 && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {topic.verifiedSourceCount} Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary font-mono">
            {topic.finalTrendScore.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Trend Score</div>
        </div>
      </div>

      {/* Signal Reason */}
      <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Signal Analysis</span>
            <span className="text-sm text-foreground font-medium">{topic.signalReason}</span>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricBadge
          icon={BarChart3}
          label="Velocity"
          value={topic.velocityScore}
          variant="default"
        />
        <MetricBadge
          icon={Share2}
          label="Frequency"
          value={`${topic.totalPosts} posts`}
          variant="default"
        />
        <MetricBadge
          icon={Shield}
          label="Source Quality"
          value={`${topic.earlySignalerBonus.toFixed(0)}/100`}
          variant={credibilityVariant}
        />
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
        <MetricBadge
          icon={Shield}
          label="Avg Credibility"
          value={`${topic.averageSourceCredibility.toFixed(0)}%`}
          variant={credibilityVariant}
        />
        <MetricBadge
          icon={Users}
          label="Unique Authors"
          value={topic.totalUniqueAuthors}
          variant="default"
        />
        <MetricBadge
          icon={Eye}
          label="Engagement"
          value={formatNumber(topic.totalEngagement)}
          variant="default"
        />
        <MetricBadge
          icon={Clock}
          label="Time Active"
          value={topic.timeActive}
          variant="default"
        />
      </div>

      {/* Platform Distribution */}
      {topic.platformDistribution.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Platforms:</span>
            {topic.platformDistribution.map(({ platform, count }) => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
