-- Create authors table to track social media account information
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('X', 'TruthSocial')),
  platform_author_id TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  follower_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  disinformation_flags INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform, platform_author_id)
);

-- Create posts table to store collected posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('X', 'TruthSocial')),
  platform_post_id TEXT NOT NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  trigger_keywords TEXT[] NOT NULL,
  engagement_snapshot JSONB NOT NULL,
  velocity_score DECIMAL,
  crawl_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform, platform_post_id)
);

-- Create crawler_config table for managing keywords and thresholds
CREATE TABLE public.crawler_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default configuration
INSERT INTO public.crawler_config (config_key, config_value, description) VALUES
  ('keywords', '{"trade": ["tariffs", "trade war", "sanctions", "import ban", "export ban"], "central_banks": ["the fed", "central bank", "interest rates", "SEC", "regulation"], "geopolitics": ["coup", "military action", "embargo", "conflict"], "political": ["executive order"]}'::jsonb, 'Keyword categories for filtering posts'),
  ('velocity_threshold', '{"min_engagement_per_hour": 100, "min_views": 500}'::jsonb, 'Velocity thresholds for flagging posts'),
  ('platforms', '{"X": {"enabled": true}, "TruthSocial": {"enabled": false}}'::jsonb, 'Platform enablement status');

-- Enable Row Level Security
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawler_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a monitoring tool)
CREATE POLICY "Allow public read access to authors"
  ON public.authors FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to crawler_config"
  ON public.crawler_config FOR SELECT
  USING (true);

-- Create policies for insert (crawler will use service role)
CREATE POLICY "Allow service role to insert authors"
  ON public.authors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update authors"
  ON public.authors FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update crawler_config"
  ON public.crawler_config FOR UPDATE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_posts_platform ON public.posts(platform);
CREATE INDEX idx_posts_crawl_timestamp ON public.posts(crawl_timestamp DESC);
CREATE INDEX idx_posts_velocity_score ON public.posts(velocity_score DESC);
CREATE INDEX idx_authors_platform ON public.authors(platform);
CREATE INDEX idx_authors_follower_count ON public.authors(follower_count DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawler_config_updated_at
  BEFORE UPDATE ON public.crawler_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();