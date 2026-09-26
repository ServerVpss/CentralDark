---
name: rss-content-integration
description: Process RSS feeds from NJ news partners, extract articles, parse content, and prepare data for DML widgets and PluckyWire distribution. Activate when working with RSS feeds, content ingestion, or partner story syndication.
---

# RSS Content Integration

This skill enables efficient processing of RSS feeds from New Jersey news partner outlets for the NJ Content Sharing Network.

## When to Activate

- User mentions RSS feeds, content feeds, or syndication
- Working with partner content ingestion
- Updating widget data sources
- Debugging feed parsing issues
- Adding new partner RSS sources

## Known Partner Feeds

| Partner | Feed URL | Status |
|---------|----------|--------|
| NJ Spotlight | https://www.njspotlightnews.org/feed/rss_full/ | Active - Full text available |
| NJ Arts | TBD | Pending discovery |
| NJ Statehouse News | TBD | Pending discovery |
| South Jersey Climate News | TBD | Pending discovery |

## Feed Processing Approach

### 1. Fetch and Validate

```javascript
// RSS feeds return XML - parse to extract items
const parseRSSFeed = async (feedUrl) => {
  const response = await fetch(feedUrl);
  const xml = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  return Array.from(doc.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent,
    link: item.querySelector('link')?.textContent,
    pubDate: item.querySelector('pubDate')?.textContent,
    description: item.querySelector('description')?.textContent,
    content: item.querySelector('content\\:encoded')?.textContent,
    author: item.querySelector('dc\\:creator')?.textContent,
    categories: Array.from(item.querySelectorAll('category')).map(c => c.textContent)
  }));
};
```

### 2. Content Extraction Keys

For NJ Spotlight full-text feed:
- `<content:encoded>` contains full article HTML
- `<dc:creator>` contains author name
- `<category>` tags indicate topic areas
- `<pubDate>` in RFC 822 format

### 3. Data Storage Pattern

Store processed feed data in a JSON file for the portal:

```
portal/
  src/
    data/
      feeds/
        nj-spotlight.json
        nj-arts.json
```

Each JSON file structure:
```json
{
  "source": "NJ Spotlight",
  "lastUpdated": "2025-12-25T10:00:00Z",
  "articles": [
    {
      "id": "unique-slug",
      "title": "Article Title",
      "url": "https://...",
      "author": "Author Name",
      "publishedAt": "2025-12-24T15:00:00Z",
      "excerpt": "First 200 chars...",
      "topics": ["Education", "Policy"],
      "imageUrl": null
    }
  ]
}
```

## Integration Points

### For DML Widgets
DML handles its own feed processing. The portal displays widget embeds, not parsed content. Use this skill only for:
- Verifying feed availability before DML setup
- Troubleshooting widget display issues
- Building preview features

### For PluckyWire
PluckyWire also handles feed ingestion. This skill helps with:
- Onboarding new partners by validating their feeds
- Debugging content availability issues
- Understanding what content partners provide

## Guidelines

1. **Always check feed format first** - Not all RSS feeds include full text. Look for `content:encoded` or similar.

2. **Cache feed responses** - RSS feeds update infrequently. Cache for at least 15 minutes.

3. **Handle missing fields gracefully** - Partner feeds vary in completeness. Default to null, not empty strings.

4. **Preserve original URLs** - Never rewrite or proxy partner article links. Attribution requires direct links.

5. **Extract images carefully** - Some feeds embed images in content HTML. Parse with DOMParser, not regex.

## Common Issues

**CORS blocking feed requests:**
Server-side fetch required for production. Use Vite proxy in development:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api/feeds': {
        target: 'https://www.njspotlightnews.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feeds/, '/feed/rss_full/')
      }
    }
  }
}
```

**Feed validation fails:**
Check for XML declaration and proper encoding. Some feeds return CDATA-wrapped content.

## Related Skills

- widget-management: For displaying feed content in DML widgets
- attribution-management: For proper source crediting
- partner-management: For tracking partner feed status
