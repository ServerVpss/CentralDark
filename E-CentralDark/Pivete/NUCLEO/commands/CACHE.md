# COMANDO - CACHE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\transformers.js\references\CACHE.md
**SHA:** 8f71ede1889bb16f
**Timestamp:** 2026-08-26T18:31:16.903311
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Pattern:** `models--{organization}--{model-name}/`

### Ouro Bruto (primeiros 5000 chars)
```
# Caching Reference

Complete guide to caching strategies for Transformers.js models across different environments.

## Table of Contents

1. [Overview](#overview)
2. [Browser Caching](#browser-caching)
3. [Node.js Caching](#nodejs-caching)
4. [Custom Cache Implementation](#custom-cache-implementation)
5. [Cache Configuration](#cache-configuration)

## Overview

Transformers.js models can be large (from a few MB to several GB), so caching is critical for performance. The caching strategy differs based on the environment:

- **Browser**: Uses the Cache API (browser cache storage)
- **Node.js**: Uses filesystem cache in `~/.cache/huggingface/`
- **Custom**: Implement your own cache (database, cloud storage, etc.)

### Default Behavior

```javascript
import { pipeline } from '@huggingface/transformers';

// First load: downloads model
const pipe = await pipeline('sentiment-analysis');

// Subsequent loads: uses cached model
const pipe2 = await pipeline('sentiment-analysis'); // Fast!
```

Caching is **automatic** and enabled by default. Models are cached after the first download.

## Browser Caching

### Using the Cache API

In browser environments, Transformers.js uses the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) to store models:

```javascript
import { env, pipeline } from '@huggingface/transformers';

// Browser cache is enabled by default
console.log(env.useBrowserCache); // true

// Load model (cached automatically)
const classifier = await pipeline('sentiment-analysis');
```

**How it works:**

1. Model files are downloaded from Hugging Face Hub
2. Files are stored in the browser's Cache Storage
3. Subsequent loads retrieve from cache (no network request)
4. Cache persists across page reloads and browser sessions

### Cache Location

Browser caches are stored in:
- **Chrome/Edge**: `Cache Storage` in DevTools → Application tab → Cache storage
- **Firefox**: `about:cache` → Storage
- **Safari**: Web Inspector → Storage tab

### Disable Browser Cache

```javascript
import { env } from '@huggingface/transformers';

// Disable browser caching (not recommended)
env.useBrowserCache = false;

// Models will be re-downloaded on every page load
```

**Use case:** Testing, development, or debugging cache issues.

### Browser Storage Limits

Browsers impose storage quotas:

- **Chrome**: ~60% of available disk space (but can evict data)
- **Firefox**: ~50% of available disk space
- **Safari**: ~1GB per origin (prompt for more)

**Tip:** Monitor storage usage with the [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API):

```javascript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  const percentUsed = (estimate.usage / estimate.quota) * 100;
  console.log(`Storage: ${percentUsed.toFixed(2)}% used`);
  console.log(`Available: ${((estimate.quota - estimate.usage) / 1024 / 1024).toFixed(2)} MB`);
}
```

## Node.js Caching

### Filesystem Cache

In Node.js, models are cached to the filesystem:

```javascript
import { env, pipeline } from '@huggingface/transformers';

// Default cache directory (Node.js)
console.log(env.cacheDir); // './.cache' (relative to current directory)

// Filesystem cache is enabled by default
console.log(env.useFSCache); // true

// Load model (cached to disk)
const classifier = await pipeline('sentiment-analysis');
```

### Default Cache Location

**Default behavior:**
- Cache directory: `./.cache` (relative to where Node.js process runs)
- Full default path: `~/.cache/huggingface/` when using Hugging Face tools

**Note:** The statement "Models are cached automatically in `~/.cache/huggingface/`" from performance tips is specific to Hugging Face's Python tooling convention. In Transformers.js for Node.js, the default is `./.cache` unless configured otherwise.

### Custom Cache Directory

```javascript
import { env, pipeline } from '@huggingface/transformers';

// Set custom cache directory
env.cacheDir = '/var/cache/transformers';

// Or use environment variable (Node.js convention)
env.cacheDir = process.env.HF_HOME || '~/.cache/huggingface';

// Now load model
const classifier = await pipeline('sentiment-analysis');
// Cached to: /var/cache/transformers/models--Xenova--distilbert-base-uncased-finetuned-sst-2-english/
```

**Pattern:** `models--{organization}--{model-name}/`

### Disable Filesystem Cache

```javascript
import { env } from '@huggingface/transformers';

// Disable filesystem caching (not recommended)
env.useFSCache = false;

// Models will be re-downloaded on every load
```

**Use case:** Testing, CI/CD environments, or containers with ephemeral storage.

## Custom Cache Implementation

Implement your own cache for specialized storage backends.

### Custom Cache Interface

```typescript
interface CacheInterface {
  /**
   * Check if a URL is cached
   */
  match(url: string): Promise<Response | undefined>;
  
  /**
   * Store a URL and its response
   */
 
```