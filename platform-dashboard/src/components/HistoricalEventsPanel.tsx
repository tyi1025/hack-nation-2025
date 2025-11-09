import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";

interface HistoricalEvent {
  id: string;
  date: string;
  event: string;
  marketImpact: number;
  vixAtTime: number;
  marketCondition: string;
  relevanceScore: number;
}

export const HistoricalEventsPanel = () => {
  const events: HistoricalEvent[] = [
    {
      id: "1",
      date: "Mar 2018",
      event: "Trump Tariff Announcement",
      marketImpact: -5.2,
      vixAtTime: 16.5,
      marketCondition: "Complacent (Low VIX)",
      relevanceScore: 94,
    },
    {
      id: "2",
      date: "Dec 2018",
      event: "Federal Reserve Rate Hike",
      marketImpact: -9.2,
      vixAtTime: 24.8,
      marketCondition: "Rising Fear (Moderate VIX)",
      relevanceScore: 89,
    },
    {
      id: "3",
      date: "Aug 2019",
      event: "Inversion of Yield Curve",
      marketImpact: -2.9,
      vixAtTime: 18.2,
      marketCondition: "Cautious (Moderate VIX)",
      relevanceScore: 76,
    },
  ];

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-institutional" />
              Historical Context Engine
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Past events matching current signals
            </p>
          </div>
          <Badge variant="outline" className="border-institutional/30 text-institutional">
            {events.length} Matches
          </Badge>
        </div>

        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg border border-border/50 bg-secondary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-institutional/30 text-institutional"
                    >
                      {event.relevanceScore.toFixed(0)}% Match
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold mb-2">{event.event}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Market Impact</p>
                  <div className="flex items-center gap-1">
                    {event.marketImpact < 0 ? (
                      <TrendingDown className="h-4 w-4 text-bearish" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-bullish" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        event.marketImpact < 0 ? "text-bearish" : "text-bullish"
                      }`}
                    >
                      {event.marketImpact > 0 ? "+" : ""}
                      {event.marketImpact}%
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">VIX at Time</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-institutional">
                      {event.vixAtTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Market Condition</p>
                <p className="text-xs font-semibold">{event.marketCondition}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Context Confidence</span>
            <span className="font-semibold text-institutional">86%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
