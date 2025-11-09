import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Author, Post, Topic } from '@/lib/csvParser';
import { rankTopics, RankedTopic } from '@/lib/trendRanking';

export const useTrendData = () => {
  const [rankedTopics, setRankedTopics] = useState<RankedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAndRankData = async () => {
    try {
      // Fetch all data from database
      const [authorsResult, postsResult, topicsResult] = await Promise.all([
        supabase.from('authors').select('*'),
        supabase.from('posts').select('*'),
        supabase.from('trending_topics').select('*')
      ]);

      if (authorsResult.error) throw authorsResult.error;
      if (postsResult.error) throw postsResult.error;
      if (topicsResult.error) throw topicsResult.error;

      // Transform database results to match CSV parser types
      const authors: Author[] = authorsResult.data.map(a => ({
        id: a.id,
        platform: 'twitter', // Default platform
        platform_author_id: a.platform_author_id,
        display_name: a.username,
        follower_count: a.follower_count || 0,
        following_count: 0, // Not in database
        is_verified: a.is_verified || false,
        disinformation_incidents: JSON.stringify(a.disinformation_incidents || []),
        account_created_at: a.account_created_at || a.created_at || new Date().toISOString(),
        bio: a.bio || '',
        profile_image_url: '',
        created_at: a.created_at || new Date().toISOString(),
        updated_at: a.updated_at || new Date().toISOString(),
        username: a.username
      }));

      const posts: Post[] = postsResult.data.map(p => ({
        id: p.id,
        post_id: p.post_id,
        platform: p.platform,
        author_id: p.author_id,
        post_content: '', // Not in database
        post_timestamp: p.post_timestamp,
        trigger_keyword: '', // Not in database
        engagement_snapshot: '{}', // Not in database
        velocity_score: 0, // Not in database
        crawl_timestamp: p.created_at || new Date().toISOString(),
        topic_id: p.topic_id
      }));

      const topics: Topic[] = topicsResult.data.map(t => ({
        id: t.topic_id,
        topic_name: t.topic_name,
        topic_keywords: '', // Not in database
        first_detected_at: t.first_detected_at || new Date().toISOString(),
        last_updated_at: t.last_updated_at || new Date().toISOString(),
        total_posts: t.total_posts || 0,
        unique_authors: 0, // Will be calculated
        aggregate_velocity_score: parseFloat(String(t.aggregate_velocity_score || 0)),
        total_views: t.total_views || 0,
        total_reposts: t.total_reposts || 0,
        total_replies: t.total_replies || 0,
        platforms: 'twitter', // Not in database
        status: t.status || 'active'
      }));

      // Calculate rankings
      const ranked = rankTopics(topics, posts, authors);
      setRankedTopics(ranked);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAndRankData();

    // Set up polling every second
    const interval = setInterval(fetchAndRankData, 1000);

    // Set up realtime subscription for instant updates
    const channel = supabase
      .channel('trend-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trending_topics' },
        () => fetchAndRankData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchAndRankData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'authors' },
        () => fetchAndRankData()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { rankedTopics, loading, lastUpdate };
};
