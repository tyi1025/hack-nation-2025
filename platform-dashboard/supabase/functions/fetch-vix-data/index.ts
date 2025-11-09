import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VixResponse {
  value: number;
  change: number;
  changePercent: number;
  marketFearScore: number;
  status: "low" | "moderate" | "high" | "extreme";
  lastUpdate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching VIX data from Yahoo Finance...');
    
    // Fetch VIX data from Yahoo Finance
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1m&range=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the latest VIX value
    const chart = data.chart.result[0];
    const meta = chart.meta;
    const quote = chart.indicators.quote[0];
    
    const currentValue = meta.regularMarketPrice || quote.close[quote.close.length - 1];
    const previousClose = meta.chartPreviousClose;
    const change = currentValue - previousClose;
    const changePercent = (change / previousClose) * 100;

    console.log(`VIX Data: Current=${currentValue}, Change=${change}, ChangePercent=${changePercent}%`);

    // Calculate Market Fear Score (0-100)
    let marketFearScore = 0;
    let status: "low" | "moderate" | "high" | "extreme" = "low";
    
    if (currentValue < 15) {
      marketFearScore = (currentValue / 15) * 25;
      status = "low";
    } else if (currentValue < 20) {
      marketFearScore = 25 + ((currentValue - 15) / 5) * 25;
      status = "moderate";
    } else if (currentValue < 30) {
      marketFearScore = 50 + ((currentValue - 20) / 10) * 25;
      status = "high";
    } else {
      marketFearScore = 75 + Math.min(25, ((currentValue - 30) / 20) * 25);
      status = "extreme";
    }

    const vixData: VixResponse = {
      value: parseFloat(currentValue.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      marketFearScore: Math.round(marketFearScore),
      status,
      lastUpdate: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(vixData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching VIX data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch VIX data',
        fallback: true,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
