import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDown, ArrowUp, AlertTriangle, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface SignalData {
  direction: "buy" | "sell" | "hold";
  confidence: number;
  vixConfirmation: boolean;
  signalType: string;
  reasoning: string;
}

export const FinalSynthesisSignal = () => {
  const [signal, setSignal] = useState<SignalData>({
    direction: "sell",
    confidence: 87,
    vixConfirmation: true,
    signalType: "High Conviction Shock Event",
    reasoning: "Social signals indicate crash risk. VIX is low (complacent market). Historical precedent: 2018 tariff shock in low-VIX environment resulted in -5.2% drop.",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSignal((prev) => ({
        ...prev,
        confidence: Math.max(60, Math.min(95, prev.confidence + (Math.random() - 0.5) * 5)),
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = () => {
    switch (signal.direction) {
      case "buy": return <ArrowUp className="h-6 w-6" />;
      case "sell": return <ArrowDown className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  const getSignalColor = () => {
    switch (signal.direction) {
      case "buy": return "text-bullish";
      case "sell": return "text-bearish";
      default: return "text-neutral";
    }
  };

  const getConfidenceColor = () => {
    if (signal.confidence >= 80) return "text-bullish";
    if (signal.confidence >= 60) return "text-neutral";
    return "text-bearish";
  };

  return (
    <Card className="p-6 border-institutional/30 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-institutional" />
              Final Synthesis Signal
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              VIX-Weighted Trade Recommendation
            </p>
          </div>
          {signal.vixConfirmation && (
            <Badge className="bg-institutional/20 text-institutional border-institutional/30">
              ✓ Institutional Confirmation
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg bg-secondary ${getSignalColor()}`}>
                {getSignalIcon()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Direction</p>
                <p className={`text-3xl font-bold uppercase ${getSignalColor()}`}>
                  {signal.direction}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Trade Confidence Score</p>
              <p className={`text-4xl font-bold ${getConfidenceColor()}`}>
                {signal.confidence.toFixed(0)}%
              </p>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    signal.confidence >= 80 ? 'bg-bullish' :
                    signal.confidence >= 60 ? 'bg-neutral' : 'bg-bearish'
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Alert className="border-institutional/30 bg-institutional/10">
          <AlertTriangle className="h-4 w-4 text-institutional" />
          <AlertDescription className="text-sm">
            <span className="font-semibold text-institutional">{signal.signalType}</span>
            <p className="mt-2 text-foreground/90">{signal.reasoning}</p>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Social Velocity</p>
            <p className="text-lg font-bold text-institutional">89%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Political Impact</p>
            <p className="text-lg font-bold text-institutional">92%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">VIX Multiplier</p>
            <p className="text-lg font-bold text-institutional">1.4x</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Signal generated: 2m ago</span>
          <span>Next update: 45s</span>
        </div>
      </div>
    </Card>
  );
};
