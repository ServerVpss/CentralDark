# Configuration & Setup

## Creating a Gateway

### Dashboard
AI > AI Gateway > Create Gateway > Configure (auth, caching, rate limiting, logging)

### API
```bash
curl -X POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai-gateway/gateways \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"my-gateway","cache_ttl":3600,"rate_limiting_interval":60,"rate_limiting_limit":100,"collect_logs":true}'
```

**Naming:** lowercase alphanumeric + hyphens (e.g., `prod-api`, `dev-chat`)

## Wrangler Integration

```toml
[ai]
binding = "AI"

[[ai.gateway]]
id = "my-gateway"
```

```bash
wrangler secret put CF_API_TOKEN
wrangler secret put OPENAI_API_KEY  # If not using BYOK
```

## Authentication

### Gateway Auth (protects gateway access)
```typescript
const client = new OpenAI({
  baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/openai`,
  defaultHeaders: { 'cf-aig-authorization': `Bearer ${cfToken}` }
});
```

### Provider Auth Options

**1. Unified Billing (keyless)** - pay through Cloudflare, no provider key:
```typescript
const client = new OpenAI({
  baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/openai`,
  defaultHeaders: { 'cf-aig-authorization': `Bearer ${cfToken}` }
});
```
Supports: OpenAI, Anthropic, Google AI Studio

**2. BYOK** - store keys in dashboard (Provider Keys > Add), no key in code

**3. Request Headers** - pass provider key per request:
```typescript
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/openai`,
  defaultHeaders: { 'cf-aig-authorization': `Bearer ${cfToken}` }
});
```

## API Token Permissions

- **Gateway management:** AI Gateway - Read + Edit
- **Gateway access:** AI Gateway - Read (minimum)

## Gateway Management API

```bash
# List
curl https://api.cloudflare.com/client/v4/accounts/{account_id}/ai-gateway/gateways \
  -H "Authorization: Bearer $CF_API_TOKEN"

# Get
curl .../gateways/{gateway_id}

# Update
curl -X PUT .../gateways/{gateway_id} \
  -d '{"cache_ttl":7200,"rate_limiting_limit":200}'

# Delete
curl -X DELETE .../gateways/{gateway_id}
```

## Getting IDs

- **Account ID:** Dashboard > Overview > Copy
- **Gateway ID:** AI Gateway > Gateway name column

## Python Example

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=f"https://gateway.ai.cloudflare.com/v1/{os.environ['CF_ACCOUNT_ID']}/{os.environ['GATEWAY_ID']}/openai",
    default_headers={"cf-aig-authorization": f"Bearer {os.environ['CF_API_TOKEN']}"}
)
```

## Best Practices

1. **Always authenticate gateways in production**
2. **Use BYOK or unified billing** - secrets out of code
3. **Environment-specific gateways** - separate dev/staging/prod
4. **Set rate limits** - prevent runaway costs
5. **Enable logging** - track usage, debug issues
Purpose:** Reduces false positives from score volatility
- **Scope:** Per-domain, HTTP-only
- **Lifespan:** Session duration
- **Privacy:** No PII—only session classification
- **Automatic:** No configuration required

Bot scores for repeat visitors consider session history via this cookie.

## Static Resource Protection

**File Extensions**: ico, jpg, png, jpeg, gif, css, js, tif, tiff, bmp, pict, webp, svg, svgz, class, jar, txt, csv, doc, docx, xls, xlsx, pdf, ps, pls, ppt, pptx, ttf, otf, woff, woff2, eot, eps, ejs, swf, torrent, midi, mid, m3u8, m4a, mp3, ogg, ts
**Plus**: `/.well-known/` path (all files)

```txt
# Exclude static resources from bot rules
(cf.bot_management.score lt 30 and not cf.bot_management.static_resource)
```

**WARNING**: May block mail clients fetching static images

## JA3/JA4 Fingerprinting (Enterprise)

```txt
# Block specific attack fingerprint
(cf.bot_management.ja3_hash eq "8b8e3d5e3e8b3d5e")

# Allow mobile app by fingerprint
(cf.bot_management.ja4 eq "your_mobile_app_fingerprint")
```

Only available for HTTPS/TLS traffic. Missing for Worker-routed traffic or HTTP requests.

## Verified Bot Categories

```txt
# Allow search engines only
(cf.verified_bot_category eq "Search Engine Crawler")

# Block AI crawlers
(cf.verified_bot_category eq "AI Crawler")
Action: Block

# Or use dashboard: Security > Settings > Bot Management > Block AI Bots
```

| Category | String Value | Example |
|----------|--------------|---------|
| AI Crawler | `AI Crawler` | GPTBot, Claude-Web |
| AI Assistant | `AI Assistant` | Perplexity-User, DuckAssistBot |
| AI Search | `AI Search` | OAI-SearchBot |
| Accessibility | `Accessibility` | Accessible Web Bot |
| Academic Research | `Academic Research` | Library of Congress |
| Advertising & Marketing | `Advertising & Marketing` | Google Adsbot |
| Aggregator | `Aggregator` | Pinterest, Indeed |
| Archiver | `Archiver` | Internet Archive, CommonCrawl |
| Feed Fetcher | `Feed Fetcher` | RSS/Podcast updaters |
| Monitoring & Analytics | `Monitoring & Analytics` | Uptime monitors |
| Page Preview | `Page Preview` | Facebook/Slack link preview |
| SEO | `Search Engine Optimization` | Google Lighthouse |
| Security | `Security` | Vulnerability scanners |
| Social Media Marketing | `Social Media Marketing` | Brandwatch |
| Webhooks | `Webhooks` | Payment processors |
| Other | `Other` | Uncategorized bots |

## Best Practices

- **ML Auto-Updates**: Enable on Enterprise for latest models
- **Start with Managed Challenge**: Test before blocking
- **Always exclude verified bots**: Use `not cf.bot_management.verified_bot`
- **Exempt corporate proxies**: For B2B traffic via `cf.bot_management.corporate_proxy`
- **Use static resource exception**: Improves performance, reduces overhead
`a-z`, `0-9`, `_` only, immutable |
| Snippets per zone | 20 | Soft limit, contact support for more |
| Rules per zone | 20 | One rule per snippet typical |
| Expression length | 4096 chars | Per rule expression |

## Authentication

### API Token (Recommended)
```bash
# Create token at: https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Zone.Snippets:Edit, Zone.Rules:Edit
export CLOUDFLARE_API_TOKEN="your_token_here"
```

### API Key (Legacy)
```bash
export CLOUDFLARE_EMAIL="your@email.com"
export CLOUDFLARE_API_KEY="your_global_api_key"
```