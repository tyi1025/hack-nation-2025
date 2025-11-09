import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Author {
  platform_author_id: string;
  username: string;
  bio: string;
  follower_count: number;
  is_verified: boolean;
  disinformation_incidents: any[];
  account_created_at: string;
}

interface Topic {
  topic_id: string;
  topic_name: string;
  status: string;
  aggregate_velocity_score: number;
  total_posts: number;
  total_views: number;
  total_reposts: number;
  total_replies: number;
  first_detected_at: string;
  last_updated_at: string;
}

const sampleTopics = [
  'Climate Change Policy', 'AI Regulation', 'Economic Recession', 'Space Exploration',
  'Cryptocurrency Market', 'Healthcare Reform', 'Election Security', 'Tech Layoffs',
  'Energy Crisis', 'Social Media Regulation', 'Cybersecurity Threats', 'Pandemic Response'
];

const sampleUsernames = [
  'tech_analyst', 'policy_expert', 'data_scientist', 'news_reporter',
  'industry_insider', 'research_lead', 'political_observer', 'market_watcher',
  'climate_activist', 'security_expert', 'health_official', 'crypto_enthusiast'
];

function generateRandomAuthor(): Author {
  const username = sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)] + '_' + Math.floor(Math.random() * 10000);
  
  // Generate realistic account creation dates
  // 70% established accounts (6 months - 5 years old)
  // 20% young accounts (1-6 months old)
  // 10% new accounts (0-30 days old) - potential bots
  const now = Date.now();
  let accountAge: number;
  const random = Math.random();
  
  if (random < 0.7) {
    // Established account: 6 months to 5 years
    accountAge = Math.random() * (5 * 365 - 180) + 180;
  } else if (random < 0.9) {
    // Young account: 1-6 months
    accountAge = Math.random() * 150 + 30;
  } else {
    // New account: 0-30 days (likely bot)
    accountAge = Math.random() * 30;
  }
  
  const accountCreatedAt = new Date(now - accountAge * 24 * 60 * 60 * 1000);
  
  return {
    platform_author_id: 'auth_' + Math.random().toString(36).substring(7),
    username,
    bio: `Expert in ${sampleTopics[Math.floor(Math.random() * sampleTopics.length)]}`,
    follower_count: Math.floor(Math.random() * 100000) + 1000,
    is_verified: Math.random() > 0.7,
    disinformation_incidents: Math.random() > 0.9 ? [{ date: new Date().toISOString(), description: 'Minor incident' }] : [],
    account_created_at: accountCreatedAt.toISOString()
  };
}

function generateRandomTopic(): Topic {
  const topicName = sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
  const now = new Date();
  const firstDetected = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  return {
    topic_id: 'topic_' + Math.random().toString(36).substring(7),
    topic_name: topicName,
    status: 'active',
    aggregate_velocity_score: Math.random() * 100,
    total_posts: Math.floor(Math.random() * 1000),
    total_views: Math.floor(Math.random() * 100000),
    total_reposts: Math.floor(Math.random() * 5000),
    total_replies: Math.floor(Math.random() * 10000),
    first_detected_at: firstDetected.toISOString(),
    last_updated_at: now.toISOString()
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting data generation...');

    // Generate 3-5 new authors
    const numAuthors = Math.floor(Math.random() * 3) + 3;
    const authors: Author[] = [];
    for (let i = 0; i < numAuthors; i++) {
      authors.push(generateRandomAuthor());
    }

    const { data: insertedAuthors, error: authorsError } = await supabase
      .from('authors')
      .insert(authors)
      .select();

    if (authorsError) {
      console.error('Error inserting authors:', authorsError);
      throw authorsError;
    }

    console.log(`Inserted ${insertedAuthors?.length} authors`);

    // Generate 2-4 new topics or update existing ones
    const numTopics = Math.floor(Math.random() * 3) + 2;
    const topics: Topic[] = [];
    
    // First, get existing topics to potentially update them
    const { data: existingTopics } = await supabase
      .from('trending_topics')
      .select('*')
      .limit(5);

    for (let i = 0; i < numTopics; i++) {
      if (existingTopics && existingTopics.length > 0 && Math.random() > 0.5) {
        // Update existing topic
        const topic = existingTopics[Math.floor(Math.random() * existingTopics.length)];
        const { error: updateError } = await supabase
          .from('trending_topics')
          .update({
            total_posts: topic.total_posts + Math.floor(Math.random() * 10) + 1,
            total_views: topic.total_views + Math.floor(Math.random() * 1000) + 100,
            total_reposts: topic.total_reposts + Math.floor(Math.random() * 50) + 5,
            total_replies: topic.total_replies + Math.floor(Math.random() * 100) + 10,
            aggregate_velocity_score: Math.random() * 100,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', topic.id);

        if (updateError) {
          console.error('Error updating topic:', updateError);
        } else {
          console.log(`Updated topic: ${topic.topic_name}`);
        }
      } else {
        // Create new topic
        topics.push(generateRandomTopic());
      }
    }

    if (topics.length > 0) {
      const { data: insertedTopics, error: topicsError } = await supabase
        .from('trending_topics')
        .insert(topics)
        .select();

      if (topicsError) {
        console.error('Error inserting topics:', topicsError);
        throw topicsError;
      }

      console.log(`Inserted ${insertedTopics?.length} topics`);
    }

    // Get all topics for creating posts
    const { data: allTopics } = await supabase
      .from('trending_topics')
      .select('*');

    // Generate 5-15 new posts
    const numPosts = Math.floor(Math.random() * 11) + 5;
    const posts = [];
    
    for (let i = 0; i < numPosts; i++) {
      const author = insertedAuthors[Math.floor(Math.random() * insertedAuthors.length)];
      const topic = allTopics?.[Math.floor(Math.random() * (allTopics?.length || 1))];
      
      if (author && topic) {
        posts.push({
          post_id: 'post_' + Math.random().toString(36).substring(7),
          author_id: author.platform_author_id,
          topic_id: topic.topic_id,
          platform: 'twitter',
          post_timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    const { data: insertedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(posts)
      .select();

    if (postsError) {
      console.error('Error inserting posts:', postsError);
      throw postsError;
    }

    console.log(`Inserted ${insertedPosts?.length} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data generated successfully',
        stats: {
          authors: insertedAuthors?.length || 0,
          topics: topics.length,
          posts: insertedPosts?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
