import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialSignal {
  id: string;
  source: string;
  topic: string;
  velocity: number;
  sentiment: "bullish" | "bearish" | "neutral";
  politicianMatch?: string;
  influenceScore: number;
}

export const SocialSignalsPanel = () => {
  const [signals, setSignals] = useState<SocialSignal[]>([
    {
      id: "1",
      source: "Twitter",
      topic: "Infrastructure Bill Vote",
      velocity: 87,
      sentiment: "bullish",
      politicianMatch: "Sen. Warren (D-MA)",
      influenceScore: 92,
    },
    {
      id: "2",
      source: "TruthSocial",
      topic: "Federal Reserve Rate Decision",
      velocity: 94,
      sentiment: "bearish",
      politicianMatch: "Former President",
      influenceScore: 88,
    },
    {
      id: "3",
      source: "Twitter",
      topic: "Tech Regulation Hearing",
      velocity: 76,
      sentiment: "neutral",
      politicianMatch: "Rep. Johnson (R-TX)",
      influenceScore: 71,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((prev) =>
        prev.map((signal) => ({
          ...signal,
          velocity: Math.max(50, Math.min(100, signal.velocity + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return "bg-bullish/20 text-bullish border-bullish/30";
      case "bearish": return "bg-bearish/20 text-bearish border-bearish/30";
      default: return "bg-neutral/20 text-neutral border-neutral/30";
    }
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Twitter className="h-5 w-5 text-institutional" />
              Social Signals
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time trend velocity tracking
            </p>
          </div>
          <Badge variant="outline" className="border-institutional/30 text-institutional">
            {signals.length} Active
          </Badge>
        </div>

        <div className="space-y-3">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{signal.topic}</span>
                    <Badge className={getSentimentColor(signal.sentiment)} variant="outline">
                      {signal.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  {signal.politicianMatch && (
                    <p className="text-xs text-muted-foreground">
                      Matched: {signal.politicianMatch}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-institutional">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-bold">{signal.velocity.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Velocity</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Influence Score</span>
                  <span className="font-semibold">{signal.influenceScore.toFixed(0)}/100</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-institutional transition-all duration-500"
                    style={{ width: `${signal.influenceScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{signal.source}</span>
                  <span>Updated 2m ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
