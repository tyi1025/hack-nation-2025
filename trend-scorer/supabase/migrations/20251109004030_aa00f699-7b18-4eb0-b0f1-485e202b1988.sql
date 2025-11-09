-- Create authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_author_id TEXT NOT NULL,
  username TEXT NOT NULL,
  bio TEXT DEFAULT '',
  follower_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  disinformation_incidents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform_author_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  post_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id)
);

-- Create trending_topics table
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id TEXT NOT NULL UNIQUE,
  topic_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  aggregate_velocity_score NUMERIC DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_reposts INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_topic_id ON public.posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON public.posts(post_timestamp);
CREATE INDEX IF NOT EXISTS idx_topics_updated ON public.trending_topics(last_updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (since this is a public dashboard)
CREATE POLICY "Allow public read access to authors"
  ON public.authors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to posts"
  ON public.posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to trending_topics"
  ON public.trending_topics FOR SELECT
  TO public
  USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.authors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trending_topics;