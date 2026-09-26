---
name: attribution-management
description: Manage boilerplate attribution text for republished content in the NJ Content Sharing Network. Activate when working with attribution requirements, crediting sources, or PluckyWire republishing guidelines.
---

# Attribution Management

This skill handles proper attribution for content shared through the NJ Content Sharing Network, ensuring all republished stories credit original sources correctly.

## When to Activate

- User mentions attribution, crediting, or bylines
- Working on PluckyWire republishing setup
- Updating attribution boilerplate text
- Discussing content licensing or usage rights
- Configuring default text for republished stories

## Attribution Requirements

All republished content through the network requires:

1. **Original outlet credit** - Name of publishing organization
2. **Author byline** - Original author's name
3. **Link to original** - Clickable URL to source article
4. **Network membership note** - Mention of NJ Content Sharing Network

## Current Boilerplate Template

Located in App.jsx, the attribution section displays:

```
This article was originally published by [OUTLET NAME] and is
republished here as part of the NJ Content Sharing Network, a
partnership of news organizations across New Jersey coordinated
by the Center for Cooperative Media at Montclair State University.
```

### Outlet-Specific Variants

```javascript
const attributionTemplates = {
  'nj-spotlight': `This article was originally published by NJ Spotlight News and is republished here as part of the NJ Content Sharing Network, a partnership of news organizations across New Jersey coordinated by the Center for Cooperative Media at Montclair State University.`,

  'nj-arts': `This article was originally published by NJ Arts and is republished here as part of the NJ Content Sharing Network, a partnership of news organizations across New Jersey coordinated by the Center for Cooperative Media at Montclair State University.`,

  'nj-statehouse': `This article was originally published by NJ Statehouse News and is republished here as part of the NJ Content Sharing Network, a partnership of news organizations across New Jersey coordinated by the Center for Cooperative Media at Montclair State University.`,

  'sj-climate': `This article was originally published by South Jersey Climate News and is republished here as part of the NJ Content Sharing Network, a partnership of news organizations across New Jersey coordinated by the Center for Cooperative Media at Montclair State University.`
};
```

## PluckyWire Integration

PluckyWire can append default attribution text to copied stories. Configuration steps:

1. **Contact Johnny (PluckyWire)** to set default boilerplate
2. **Provide the template** with `[OUTLET NAME]` placeholder
3. **PluckyWire auto-fills** outlet name based on content source
4. **Partners copy** complete attributed text in one click

## Attribution Placement

### For Web Republishing

Place attribution at the **end of the article**, before comments or related content:

```html
<article>
  <h1>Article Title</h1>
  <p class="byline">By Author Name</p>
  <div class="content">
    <!-- Article content -->
  </div>
  <footer class="attribution">
    <p><em>This article was originally published by...</em></p>
  </footer>
</article>
```

### For Newsletter Inclusion

- Include source name in subject line or intro
- Link directly to original article
- Full attribution at end of excerpt

## Reference: Granite State Model

The attribution language is modeled on the Granite State News Collaborative approach:

> "This article was originally published by [OUTLET] and is republished here through a partnership with [YOUR OUTLET] as part of [COLLABORATIVE NAME]."

Key elements:
- Clear identification of original publisher
- Acknowledgment of partnership
- Named coordinating organization

## Guidelines

1. **Never modify original content** - Attribution only, no editorial changes.

2. **Maintain clickable links** - Always hyperlink to original source.

3. **Credit all authors** - Include all bylines from original, not just primary.

4. **Use consistent formatting** - Italicize attribution block for visual distinction.

5. **Update promptly** - If outlet names change, update all templates.

## Pending Review

- **Stefanie review**: Current boilerplate text awaiting approval
- **Legal considerations**: Verify language meets all partner agreements

## Implementation in Portal

The App.jsx attribution section includes:
- Styled code block displaying the template
- Copy-to-clipboard button with feedback
- Highlighted `[OUTLET NAME]` placeholder
- Dark background for visual emphasis

```jsx
// Copy function implementation
const handleCopy = () => {
  navigator.clipboard.writeText(attributionText);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

## Content Provider Checklist

For each content provider joining the network:

- [ ] Confirm attribution language acceptable
- [ ] Provide preferred outlet name format
- [ ] Specify author credit requirements
- [ ] Agree to linking policy
- [ ] Sign DML agreement (if using widgets)

## Related Skills

- partner-management: For tracking outlet preferences
- rss-content-integration: For automated attribution in feeds
- pluckywire-onboarding: For republishing platform setup
