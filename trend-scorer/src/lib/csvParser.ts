export interface Author {
  id: string;
  platform: string;
  platform_author_id: string;
  display_name: string;
  follower_count: number;
  following_count: number;
  is_verified: boolean;
  disinformation_incidents: string;
  account_created_at: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
  username: string;
}

export interface Post {
  id: string;
  post_id: string;
  platform: string;
  author_id: string;
  post_content: string;
  post_timestamp: string;
  trigger_keyword: string;
  engagement_snapshot: string;
  velocity_score: number;
  crawl_timestamp: string;
  topic_id: string;
}

export interface Topic {
  id: string;
  topic_name: string;
  topic_keywords: string;
  first_detected_at: string;
  last_updated_at: string;
  total_posts: number;
  unique_authors: number;
  aggregate_velocity_score: number;
  total_views: number;
  total_reposts: number;
  total_replies: number;
  platforms: string;
  status: string;
}

export function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(';');
  const data: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      
      // Type conversion
      if (value === 'true') obj[header] = true;
      else if (value === 'false') obj[header] = false;
      else if (!isNaN(Number(value)) && value !== '') obj[header] = Number(value);
      else obj[header] = value;
    });
    
    data.push(obj as T);
  }
  
  return data;
}
