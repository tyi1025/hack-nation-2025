import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface VixData {
  value: number;
  change: number;
  marketFearScore: number;
  status: "low" | "moderate" | "high" | "extreme";
  lastUpdate?: string;
}

export const VixTracker = () => {
  const [vixData, setVixData] = useState<VixData>({
    value: 18.45,
    change: -0.72,
    marketFearScore: 35,
    status: "moderate",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();

  const fetchVixData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-vix-data`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch VIX data');
      }

      const data = await response.json();
      
      if (data.fallback) {
        throw new Error(data.error);
      }

      setVixData({
        value: data.value,
        change: data.change,
        marketFearScore: data.marketFearScore,
        status: data.status,
        lastUpdate: data.lastUpdate,
      });
      setIsLive(true);
    } catch (error) {
      console.error('Error fetching VIX data:', error);
      toast({
        title: "Unable to fetch live data",
        description: "Using simulated data. Market may be closed or API unavailable.",
        variant: "destructive",
      });
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchVixData();

    // Fetch every 5 seconds for live data
    const interval = setInterval(() => {
      fetchVixData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = () => {
    if (vixData.change > 0.1) return <TrendingUp className="h-5 w-5" />;
    if (vixData.change < -0.1) return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getStatusColor = () => {
    switch (vixData.status) {
      case "low": return "text-bullish";
      case "moderate": return "text-neutral";
      case "high": return "text-bearish";
      case "extreme": return "text-bearish";
    }
  };

  const getStatusLabel = () => {
    switch (vixData.status) {
      case "low": return "Complacent Market";
      case "moderate": return "Normal Volatility";
      case "high": return "Elevated Fear";
      case "extreme": return "Extreme Fear";
    }
  };

  return (
    <Card className="p-6 border-institutional/30 bg-card/50 backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">CBOE VIX Index</h3>
              {isLive ? (
                <Badge variant="outline" className="border-bullish/30 text-bullish bg-bullish/10 text-xs">
                  ● LIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="border-neutral/30 text-neutral bg-neutral/10 text-xs">
                  SIMULATED
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {isLive ? 'Yahoo Finance data feed' : 'Demo mode - market closed or unavailable'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVixData}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50"
              title="Refresh VIX data"
            >
              <RefreshCw className={`h-4 w-4 text-institutional ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className={`flex items-center gap-1 ${vixData.change >= 0 ? 'text-bearish' : 'text-bullish'}`}>
              {getTrendIcon()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-institutional">{vixData.value.toFixed(2)}</span>
            <span className={`text-lg font-medium ${vixData.change >= 0 ? 'text-bearish' : 'text-bullish'}`}>
              {vixData.change >= 0 ? '+' : ''}{vixData.change.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Market Fear Score</span>
            <span className={`font-bold ${getStatusColor()}`}>{vixData.marketFearScore.toFixed(0)}/100</span>
          </div>

          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                vixData.status === 'low' ? 'bg-bullish' :
                vixData.status === 'moderate' ? 'bg-neutral' :
                'bg-bearish'
              }`}
              style={{ width: `${vixData.marketFearScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className={`text-xs font-semibold ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Signal Impact</p>
              <p className="font-semibold mt-1">
                {vixData.status === 'low' ? 'Amplifies Bubble Signals' : 
                 vixData.status === 'extreme' ? 'Amplifies Crash Signals' :
                 'Neutral Modifier'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Trade Context</p>
              <p className="font-semibold mt-1">
                {vixData.status === 'low' ? 'Shock Event Risk' :
                 vixData.status === 'extreme' ? 'Recovery Opportunity' :
                 'Standard Conditions'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
