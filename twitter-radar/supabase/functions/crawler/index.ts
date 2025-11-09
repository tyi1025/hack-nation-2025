import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EngagementSnapshot {
  views: number;
  reposts: number;
  replies: number;
  likes?: number;
}

interface CrawlerConfig {
  keywords: Record<string, string[]>;
  velocity_threshold: {
    min_engagement_per_hour: number;
    min_views: number;
  };
  platforms: Record<string, { enabled: boolean }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch crawler configuration
    const { data: configData, error: configError } = await supabaseClient
      .from('crawler_config')
      .select('*');

    if (configError) {
      throw new Error(`Failed to fetch config: ${configError.message}`);
    }

    const config: CrawlerConfig = {
      keywords: {},
      velocity_threshold: { min_engagement_per_hour: 100, min_views: 500 },
      platforms: {},
    };

    configData.forEach((item) => {
      config[item.config_key as keyof CrawlerConfig] = item.config_value as any;
    });

    console.log('Crawler started with config:', config);

    // NOTE: Platform API integration will require API keys
    // Users will need to add these as secrets:
    // - TWITTER_API_KEY
    // - TWITTER_API_SECRET
    // - TWITTER_BEARER_TOKEN
    // - TRUTHSOCIAL_API_KEY (if available)

    const results = {
      status: 'success',
      message: 'Crawler logic executed',
      note: 'Platform API integration pending. Add platform API keys as secrets to enable data collection.',
      config_loaded: true,
    };

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'See logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * CRAWLER IMPLEMENTATION GUIDE
 * 
 * To complete the crawler, you'll need to:
 * 
 * 1. Add platform API keys as secrets (Cloud -> Secrets):
 *    - TWITTER_BEARER_TOKEN (from Twitter Developer Portal)
 *    - TRUTHSOCIAL_API_KEY (if TruthSocial provides API access)
 * 
 * 2. Implement platform-specific crawling functions:
 *    - fetchTwitterPosts(keywords, bearerToken)
 *    - fetchTruthSocialPosts(keywords, apiKey)
 * 
 * 3. For each post collected:
 *    a. Check if it matches keyword filters
 *    b. Calculate velocity score (engagement per hour since posting)
 *    c. If velocity exceeds threshold, store in database
 * 
 * 4. Store data using:
 *    - First upsert author to 'authors' table
 *    - Then insert post to 'posts' table with author_id reference
 * 
 * 5. Example velocity calculation:
 *    const hoursOld = (Date.now() - postTimestamp) / (1000 * 60 * 60);
 *    const velocityScore = engagement.views / Math.max(hoursOld, 0.1);
 * 
 * 6. Schedule the crawler:
 *    - Run manually via endpoint call
 *    - Or set up cron job to run every X minutes
 *    - Consider rate limits for each platform
 * 
 * 7. Twitter API v2 endpoints to use:
 *    - Search Recent Tweets: GET /2/tweets/search/recent
 *    - Tweet metrics: expansions=author_id&tweet.fields=public_metrics,created_at
 *    - Author info: user.fields=verified,public_metrics
 */
