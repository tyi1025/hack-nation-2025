import { VixTracker } from "@/components/VixTracker";
import { SocialSignalsPanel } from "@/components/SocialSignalsPanel";
import { HistoricalEventsPanel } from "@/components/HistoricalEventsPanel";
import { FinalSynthesisSignal } from "@/components/FinalSynthesisSignal";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Activity className="h-10 w-10 text-institutional" />
              <span className="bg-gradient-to-r from-institutional to-primary bg-clip-text text-transparent">
                Market Intelligence Terminal
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time social sentiment analysis with institutional validation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-bullish animate-pulse" />
                <span className="text-sm font-semibold text-bullish">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - VIX & Social Signals */}
          <div className="space-y-6">
            <VixTracker />
            <SocialSignalsPanel />
          </div>

          {/* Middle Column - Historical Events */}
          <div className="space-y-6">
            <HistoricalEventsPanel />
          </div>

          {/* Right Column - Final Signal */}
          <div className="space-y-6">
            <FinalSynthesisSignal />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              Market data simulated for demonstration • Not financial advice • For research purposes only
            </p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
