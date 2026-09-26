---
name: content-configuration
description: Manage externalized content configuration for the NJ Content Sharing Network portal, enabling easy updates to text, links, and data without code changes. Activate when updating portal content, managing configuration, or preparing content changes.
---

# Content Configuration

This skill handles externalized content management, moving hardcoded content from JSX into maintainable configuration files.

## When to Activate

- User wants to update text content on the portal
- Changing partner lists, links, or descriptions
- Managing navigation items
- Updating contact information
- Preparing content for non-technical editors

## Current State

All content is currently hardcoded in `App.jsx`. This skill guides migration to external configuration for easier maintenance.

## Proposed Configuration Structure

```
portal/
  src/
    data/
      config.json       # Main configuration
      navigation.json   # Nav items
      widgets.json      # Widget metadata
      partners.json     # Partner organizations
```

### Main Configuration (config.json)

```json
{
  "site": {
    "title": "NJ Content Sharing Network",
    "description": "A Center for Cooperative Media initiative",
    "contact": {
      "email": "info@centerforcooperativemedia.org",
      "website": "https://centerforcooperativemedia.org"
    }
  },
  "hero": {
    "headline": "Strengthening Local News Through Shared Content",
    "subheadline": "A collaborative network connecting New Jersey news organizations",
    "ctas": [
      { "text": "Explore Widgets", "href": "#widgets", "primary": true },
      { "text": "Join PluckyWire", "href": "#pluckywire", "primary": false }
    ]
  },
  "sections": {
    "widgets": {
      "badge": "Content Widgets",
      "headline": "Ready-to-Use Story Streams",
      "description": "Embed curated content from partner outlets directly on your site."
    },
    "pluckywire": {
      "badge": "Story Sharing",
      "headline": "PluckyWire",
      "description": "Browse and republish individual stories with one click."
    },
    "roundup": {
      "badge": "Daily Digest",
      "headline": "The NJ News Roundup",
      "description": "Essential New Jersey stories delivered to your inbox.",
      "signupUrl": "https://centerforcooperativemedia.us5.list-manage.com/..."
    },
    "attribution": {
      "badge": "Guidelines",
      "headline": "Attribution Requirements",
      "boilerplate": "This article was originally published by [OUTLET NAME] and is republished here as part of the NJ Content Sharing Network..."
    }
  },
  "topics": [
    "State government",
    "Education",
    "Environment",
    "Arts & culture",
    "Health",
    "Community"
  ],
  "externalLinks": {
    "pluckywire": "https://wire.pluckyworks.org/",
    "mailchimp": "https://centerforcooperativemedia.us5.list-manage.com/subscribe?u=..."
  }
}
```

### Navigation Configuration (navigation.json)

```json
{
  "main": [
    { "label": "Widgets", "href": "#widgets" },
    { "label": "PluckyWire", "href": "#pluckywire" },
    { "label": "Roundup", "href": "#roundup" },
    { "label": "Meetings", "href": "#editorial-meetings" },
    { "label": "Guidelines", "href": "#attribution" }
  ],
  "footer": [
    { "label": "Center for Cooperative Media", "href": "https://centerforcooperativemedia.org", "external": true },
    { "label": "Contact", "href": "mailto:info@centerforcooperativemedia.org" }
  ]
}
```

## Loading Configuration in React

```javascript
// portal/src/hooks/useConfig.js
import config from '../data/config.json';
import navigation from '../data/navigation.json';
import widgets from '../data/widgets.json';
import partners from '../data/partners.json';

export const useConfig = () => ({
  config,
  navigation,
  widgets,
  partners
});

// Usage in component
const { config } = useConfig();
return <h1>{config.hero.headline}</h1>;
```

## Benefits of Externalization

1. **Non-technical updates** - Edit JSON, not JSX
2. **Reduced risk** - Can't break React code when editing content
3. **Version control** - Clear diffs showing content changes
4. **Potential CMS** - JSON files can be generated from a CMS later
5. **Validation** - JSON schema validation possible

## Migration Steps

1. **Create data directory**
   ```bash
   mkdir -p portal/src/data
   ```

2. **Extract content to JSON files**
   - Copy text from App.jsx
   - Structure into JSON format
   - Validate JSON syntax

3. **Update App.jsx imports**
   - Import JSON files
   - Replace hardcoded strings with config references

4. **Test thoroughly**
   - Verify all text renders
   - Check all links work
   - Test build process

## Guidelines

1. **Keep JSON flat when possible** - Deep nesting makes editing harder.

2. **Use descriptive keys** - `hero.headline` not `hero.h1`.

3. **Include comments via descriptions** - JSON doesn't support comments, use `_description` keys if needed.

4. **Validate before commit** - Run `npm run build` to catch JSON syntax errors.

5. **Don't externalize everything** - Static UI labels can stay in code. Focus on frequently-changing content.

## Content Update Workflow

1. Edit relevant JSON file in `portal/src/data/`
2. Run `npm run dev` to preview changes
3. Run `npm run build` to verify production build
4. Deploy updated build

## Validation

Consider adding JSON schema validation:

```javascript
// Simple validation helper
export const validateConfig = (config) => {
  const required = ['site', 'hero', 'sections'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config key: ${key}`);
    }
  }
  return true;
};
```

## Related Skills

- portal-development: For implementing config loading
- deployment-workflow: For deploying content updates
