# High-Velocity Trend-Spotting Crawler

A data-first tool for detecting emerging market-moving discussions on social media platforms before they become mainstream news.

## Overview

This crawler identifies high-velocity discussions by combining:
- **Topic Filtering**: Dynamic keyword-based filtering across multiple categories
- **Velocity Detection**: Engagement-per-hour analysis to find rapidly spreading content
- **Author Intelligence**: Tracks credibility metrics including verification, followers, and disinformation flags
- **Platform Agnostic**: Designed to work with X (Twitter), TruthSocial, and future platforms

## Current Status

✅ **Completed**:
- Database schema with posts, authors, and configuration tables
- Backoffice UI for viewing collected data
- Configuration management system
- Edge function structure for crawler logic
- Data export capabilities

⚠️ **Pending Setup**:
- Platform API credentials (see setup instructions below)
- Platform-specific crawling implementation
- Scheduling/automation setup

## Data Structure

### Posts Table
Stores collected posts with:
- Platform and post identifiers
- Author information (linked to authors table)
- Post content and timestamp
- Matched keywords that triggered collection
- Engagement snapshot (views, reposts, replies)
- Velocity score (engagement per hour)
- Collection timestamp

### Authors Table
Tracks social media accounts with:
- Platform and author identifiers
- Username and display name
- Follower count
- Verification status
- Disinformation flags counter
- Metadata for additional tracking

### Configuration Table
Manages crawler settings:
- **Keywords**: Organized by category (trade, central_banks, geopolitics, political)
- **Velocity Threshold**: Minimum engagement/hour and views to trigger collection
- **Platforms**: Enable/disable specific platforms

## Setup Instructions

### 1. Add Platform API Credentials

Navigate to **Cloud → Secrets** and add:

#### For X (Twitter):
- `TWITTER_BEARER_TOKEN` - From [Twitter Developer Portal](https://developer.twitter.com/)

#### For TruthSocial:
- `TRUTHSOCIAL_API_KEY` - If/when API becomes available

### 2. Configure Keywords and Thresholds

1. Go to the **Configuration** page
2. Edit the JSON configurations:
   - **keywords**: Add or modify keyword categories
   - **velocity_threshold**: Adjust sensitivity (default: 100 engagement/hour, 500 min views)
   - **platforms**: Enable/disable platforms

Example keyword configuration:
```json
{
  "trade": ["tariffs", "trade war", "sanctions"],
  "central_banks": ["the fed", "interest rates", "SEC"],
  "geopolitics": ["coup", "military action", "embargo"],
  "political": ["executive order"]
}
```

### 3. Implement Platform Crawling

The edge function at `supabase/functions/crawler/index.ts` contains detailed implementation guidance. Key steps:

1. **Twitter API v2 Integration**:
   - Use `/2/tweets/search/recent` endpoint
   - Include `tweet.fields=public_metrics,created_at&expansions=author_id`
   - Request `user.fields=verified,public_metrics` for author data

2. **Velocity Calculation**:
   ```typescript
   const hoursOld = (Date.now() - postTimestamp) / (1000 * 60 * 60);
   const velocityScore = engagement.views / Math.max(hoursOld, 0.1);
   ```

3. **Data Storage**:
   - First upsert author to `authors` table
   - Then insert post to `posts` table with `author_id` reference

### 4. Schedule the Crawler

Options:
- **Manual**: Run via Dashboard "Run Crawler" button
- **Cron Job**: Set up scheduled execution (every 15-30 minutes recommended)
- **Continuous**: Implement streaming for real-time detection

## Usage

### Dashboard
- View statistics: total posts, tracked authors, average velocity
- Run crawler manually
- See setup status and next steps

### Posts
- Browse collected high-velocity posts
- Filter by platform, keywords, velocity
- View engagement metrics and author credibility
- Export data for analysis

### Authors
- Track monitored social media accounts
- View follower counts and verification status
- Identify authors with disinformation flags

### Configuration
- Manage keyword categories
- Adjust velocity thresholds
- Enable/disable platforms

## Data Export

All tables can be exported from the Cloud interface:
1. Navigate to **Cloud → Database → Tables**
2. Select the table (posts, authors, or crawler_config)
3. Click the export button
4. Choose format (CSV, JSON)

## Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Tanstack Query for data fetching
- Dark theme optimized for data monitoring

### Backend (Lovable Cloud)
- PostgreSQL database
- Edge Functions for crawler logic
- Row Level Security policies
- Real-time updates supported

## Security & Best Practices

1. **API Keys**: Always store in Cloud Secrets, never in code
2. **Rate Limiting**: Respect platform API limits
3. **Ethical Scraping**: Follow robots.txt and terms of service
4. **Data Privacy**: Posts are public data, but handle responsibly
5. **RLS Policies**: Database has public read access for monitoring tool use

## Next Steps

1. **Add API credentials** in Cloud → Secrets
2. **Customize keywords** in Configuration page
3. **Implement platform APIs** in crawler edge function
4. **Test manually** with Dashboard "Run Crawler" button
5. **Set up automation** for continuous monitoring
6. **Build analysis tools** on top of collected data

## Support

For questions or issues:
- Check edge function logs in Cloud → Functions
- Review database queries in Cloud → Database
- Consult implementation guide in `supabase/functions/crawler/index.ts`
