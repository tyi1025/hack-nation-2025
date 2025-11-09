import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, TrendingDown, TrendingUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HistoricalEvent {
  id: string;
  date: string;
  event: string;
  marketImpact: number;
  vixAtTime: number;
  marketCondition: string;
  relevanceScore: number;
  reasoning: string;
}

export const HistoricalEventsPanel = () => {
  const [openReasoningId, setOpenReasoningId] = useState<string | null>(null);
  
  const events: HistoricalEvent[] = [
    {
      id: "1",
      date: "Mar 2023",
      event: "Silicon Valley Bank Collapse",
      marketImpact: -20,
      vixAtTime: 26.5,
      marketCondition: "Panic (High VIX)",
      relevanceScore: 85.1,
      reasoning: "The Silicon Valley Bank crisis, with its implications of increased regulatory scrutiny and heightened market volatility, is likely to trigger a significant sell-off in the finance sector as investor confidence erodes. Given the current economic environment and the potential for cascading effects on credit availability, a substantial downturn of -20% reflects the severity of this situation and its impact on market sentiment.",
    },
    {
      id: "2",
      date: "Mar 2010",
      event: "Healthcare Reform (ACA)",
      marketImpact: 10,
      vixAtTime: 17.8,
      marketCondition: "Cautious (Moderate VIX)",
      relevanceScore: 32.3,
      reasoning: "While the likelihood of healthcare reform is moderate at 32.3%, positive legislative movements aimed at enhancing access and affordability can galvanize investor interest in the healthcare sector, particularly in biotech and telehealth. Historically, news surrounding healthcare reforms has led to upward movement as investors anticipate long-term growth opportunities and potential for improved market conditions in the sector.",
    },
    {
      id: "3",
      date: "Mar 2020",
      event: "COVID-19 Pandemic Response",
      marketImpact: 8,
      vixAtTime: 22.3,
      marketCondition: "Cautious (Moderate VIX)",
      relevanceScore: 32,
      reasoning: "The potential pandemic response initiatives, even with a lower likelihood of 32%, can foster optimism in the healthcare sector, particularly as markets respond positively to any advances in vaccinations and healthcare delivery solutions. Historical trends show that proactive measures in response to public health crises often lead to increased investments in healthcare, stimulating growth in related stocks and empowering companies focused on innovative solutions.",
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
            <Collapsible
              key={event.id}
              open={openReasoningId === event.id}
              onOpenChange={(open) => setOpenReasoningId(open ? event.id : null)}
            >
              <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
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

                <div className="p-2 rounded bg-background/50 mb-2">
                  <p className="text-xs text-muted-foreground mb-1">Market Condition</p>
                  <p className="text-xs font-semibold">{event.marketCondition}</p>
                </div>

                <CollapsibleTrigger className="w-full p-2 rounded bg-background/50 hover:bg-background/70 transition-colors flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Reasoning</span>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openReasoningId === event.id ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-2 p-3 rounded bg-background/30 border border-border/30">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.reasoning}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
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
