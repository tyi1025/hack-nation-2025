import { Author, Post, Topic } from './csvParser';

const CREDIBLE_KEYWORDS = ['analyst', 'journalist', 'trader', 'official', 'economist', 'expert', 'senior', 'verified'];

export interface AuthorWithScore extends Author {
  credibilityScore: number;
}

export interface RankedTopic {
  rank: number;
  topicName: string;
  finalTrendScore: number;
  signalReason: string;
  status: string;
  velocityScore: number;
  totalPosts: number;
  earlySignalerBonus: number;
  topicId: string;
  // Detailed metrics
  averageSourceCredibility: number;
  verifiedSourceCount: number;
  totalUniqueAuthors: number;
  platformDistribution: { platform: string; count: number }[];
  totalEngagement: number;
  avgEngagementPerPost: number;
  firstDetectedAt: string;
  timeActive: string;
}

// Calculate Author Credibility Score (0-100)
export function calculateAuthorCredibilityScore(author: Author): number {
  let score = 0;
  
  // +20 if verified
  if (author.is_verified) {
    score += 20;
  }
  
  // +30 if follower_count > 100,000
  if (author.follower_count > 100000) {
    score += 30;
  }
  
  // +20 if bio contains credible keywords
  const bioLower = author.bio.toLowerCase();
  const hasCredibleKeywords = CREDIBLE_KEYWORDS.some(keyword => bioLower.includes(keyword));
  if (hasCredibleKeywords) {
    score += 20;
  }
  
  // -50 if disinformation_incidents is NOT empty
  try {
    const incidents = JSON.parse(author.disinformation_incidents);
    if (Array.isArray(incidents) && incidents.length > 0) {
      score -= 50;
    }
  } catch (e) {
    // If parsing fails, check if string is not empty array representation
    if (author.disinformation_incidents !== '[]' && author.disinformation_incidents.trim() !== '') {
      score -= 50;
    }
  }
  
  // Account age factor - penalize new accounts (bot protection)
  if (author.account_created_at) {
    const accountAge = Date.now() - new Date(author.account_created_at).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysOld < 30) {
      // New account: significant penalty (likely bot)
      score -= 30;
    } else if (daysOld < 90) {
      // Young account: moderate penalty
      score -= 15;
    } else if (daysOld > 730) {
      // Established account (2+ years): small bonus
      score += 5;
    }
    // Accounts 90 days - 2 years: no penalty or bonus
  }
  
  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Calculate Early Signaler Bonus for a topic
export function calculateEarlySignalerBonus(
  topicId: string,
  posts: Post[],
  authorsWithScores: AuthorWithScore[]
): number {
  // Get posts for this topic, sorted by timestamp
  const topicPosts = posts
    .filter(post => post.topic_id === topicId)
    .sort((a, b) => new Date(a.post_timestamp).getTime() - new Date(b.post_timestamp).getTime());
  
  // Get first 5 posts
  const earlyPosts = topicPosts.slice(0, 5);
  
  if (earlyPosts.length === 0) return 0;
  
  // Calculate average ACS of early authors
  const earlyAuthorScores = earlyPosts
    .map(post => {
      const author = authorsWithScores.find(a => a.platform_author_id === post.author_id);
      return author ? author.credibilityScore : 0;
    });
  
  const averageScore = earlyAuthorScores.reduce((sum, score) => sum + score, 0) / earlyAuthorScores.length;
  
  return averageScore;
}

// Normalize values to 0-1 scale
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

// Calculate Final Trend Score and rank topics
export function rankTopics(
  topics: Topic[],
  posts: Post[],
  authors: Author[]
): RankedTopic[] {
  // Calculate credibility scores for all authors
  const authorsWithScores: AuthorWithScore[] = authors.map(author => ({
    ...author,
    credibilityScore: calculateAuthorCredibilityScore(author)
  }));
  
  // Calculate scores for each topic
  const topicsWithScores = topics.map(topic => {
    const earlySignalerBonus = calculateEarlySignalerBonus(topic.id, posts, authorsWithScores);
    
    // Get posts for this topic
    const topicPosts = posts.filter(p => p.topic_id === topic.id);
    
    // Calculate average source credibility
    const authorIds = [...new Set(topicPosts.map(p => p.author_id))];
    const authorScores = authorIds
      .map(id => authorsWithScores.find(a => a.platform_author_id === id)?.credibilityScore || 0)
      .filter(score => score > 0);
    const averageSourceCredibility = authorScores.length > 0
      ? authorScores.reduce((sum, score) => sum + score, 0) / authorScores.length
      : 0;
    
    // Count verified sources
    const verifiedSourceCount = authorIds.filter(id => {
      const author = authorsWithScores.find(a => a.platform_author_id === id);
      return author?.is_verified;
    }).length;
    
    // Calculate platform distribution
    const platformCounts = topicPosts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const platformDistribution = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count
    }));
    
    // Calculate engagement metrics
    const totalEngagement = topic.total_views + topic.total_reposts + topic.total_replies;
    const avgEngagementPerPost = topic.total_posts > 0 ? totalEngagement / topic.total_posts : 0;
    
    // Calculate time active
    const firstDetected = new Date(topic.first_detected_at);
    const lastUpdated = new Date(topic.last_updated_at);
    const hoursActive = Math.round((lastUpdated.getTime() - firstDetected.getTime()) / (1000 * 60 * 60) * 10) / 10;
    const timeActive = hoursActive < 1 ? `${Math.round(hoursActive * 60)}m` : `${hoursActive}h`;
    
    return {
      ...topic,
      earlySignalerBonus,
      averageSourceCredibility,
      verifiedSourceCount,
      totalUniqueAuthors: authorIds.length,
      platformDistribution,
      totalEngagement,
      avgEngagementPerPost,
      firstDetectedAt: topic.first_detected_at,
      timeActive
    };
  });
  
  // Find min/max for normalization
  const velocities = topicsWithScores.map(t => t.aggregate_velocity_score);
  const postCounts = topicsWithScores.map(t => t.total_posts);
  const esbScores = topicsWithScores.map(t => t.earlySignalerBonus);
  
  const minVelocity = Math.min(...velocities);
  const maxVelocity = Math.max(...velocities);
  const minPosts = Math.min(...postCounts);
  const maxPosts = Math.max(...postCounts);
  const minESB = Math.min(...esbScores);
  const maxESB = Math.max(...esbScores);
  
  // Calculate final scores
  const rankedTopics: RankedTopic[] = topicsWithScores.map(topic => {
    const normalizedVelocity = normalize(topic.aggregate_velocity_score, minVelocity, maxVelocity);
    const normalizedPosts = normalize(topic.total_posts, minPosts, maxPosts);
    const normalizedESB = normalize(topic.earlySignalerBonus, minESB, maxESB);
    
    // Final formula: (Velocity * 0.5) + (Posts * 0.2) + (ESB * 0.3)
    const finalScore = (normalizedVelocity * 0.5) + (normalizedPosts * 0.2) + (normalizedESB * 0.3);
    
    // Scale to 0-100 for readability
    const finalTrendScore = finalScore * 100;
    
    // Generate signal reason
    let signalReason = '';
    if (normalizedESB > 0.7) {
      signalReason = 'High credibility early signalers';
    } else if (normalizedVelocity > 0.7) {
      signalReason = 'Explosive velocity growth';
    } else if (normalizedPosts > 0.7) {
      signalReason = 'High volume engagement';
    } else {
      signalReason = 'Mixed signals from multiple factors';
    }
    
    // Add context about verified sources
    const topicPosts = posts.filter(p => p.topic_id === topic.id);
    const verifiedCount = topicPosts.filter(p => {
      const author = authorsWithScores.find(a => a.platform_author_id === p.author_id);
      return author?.is_verified;
    }).length;
    
    if (verifiedCount > 0) {
      signalReason += ` (${verifiedCount} verified source${verifiedCount > 1 ? 's' : ''})`;
    }
    
    return {
      rank: 0, // Will be set after sorting
      topicName: topic.topic_name,
      finalTrendScore,
      signalReason,
      status: topic.status,
      velocityScore: topic.aggregate_velocity_score,
      totalPosts: topic.total_posts,
      earlySignalerBonus: topic.earlySignalerBonus,
      topicId: topic.id,
      averageSourceCredibility: topic.averageSourceCredibility,
      verifiedSourceCount: topic.verifiedSourceCount,
      totalUniqueAuthors: topic.totalUniqueAuthors,
      platformDistribution: topic.platformDistribution,
      totalEngagement: topic.totalEngagement,
      avgEngagementPerPost: topic.avgEngagementPerPost,
      firstDetectedAt: topic.firstDetectedAt,
      timeActive: topic.timeActive
    };
  });
  
  // Sort by final score descending and assign ranks
  rankedTopics.sort((a, b) => b.finalTrendScore - a.finalTrendScore);
  rankedTopics.forEach((topic, index) => {
    topic.rank = index + 1;
  });
  
  return rankedTopics;
}
