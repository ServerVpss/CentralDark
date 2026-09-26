# COMANDO - full-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\references\full-guide.md
**SHA:** e1a0980c29d734c2
**Timestamp:** 2026-08-26T18:42:56.920662
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
# /build-zoom-video-sdk-app

Background reference for fully custom video-session products. Prefer `plan-zoom-product` first when the boundary between Meeting SDK and Video SDK is still unclear.

Build custom video experiences powered by Zoom's infrastructure.

## Hard Routing Guardrail (Read First)

- If the user asks for custom real-time video app behavior (topic/session join, custom rendering, attach/detach), route to Video SDK.
- Do not switch to REST meeting endpoints for Video SDK join flows.
- Video SDK does not use Meeting IDs, `join_url`, or Meeting SDK join payload fields (`meetingNumber`, `passWord`).

## Meeting SDK vs Video SDK

| Feature | Meeting SDK | Video SDK |
|---------|-------------|-----------|
| UI | Default Zoom UI or Custom UI | **Fully custom UI** (you build it) |
| Experience | Zoom meetings | Video sessions |
| Branding | Limited customization | **Full branding control** |
| Features | Full Zoom features | Core video features |

## UI Options (Web)

Video SDK gives you **full control over the UI**:

| Option | Description |
|--------|-------------|
| **UI Toolkit** | Pre-built React components (low-code) |
| **Custom UI** | Build your own UI using the SDK APIs |

## Prerequisites

- Zoom Video SDK credentials from Marketplace
- SDK Key and Secret
- Web development environment

> **Need help with OAuth or signatures?** See the **[zoom-oauth](../../oauth/SKILL.md)** skill for authentication flows.

> **Need pre-join diagnostics on web?** Use **[probe-sdk](../../probe-sdk/SKILL.md)** before Video SDK `join()` to reduce first-minute failures.

> **Start troubleshooting fast:** Use the **[5-Minute Runbook](../RUNBOOK.md)** before deep debugging.

## Quick Start (Web)

### NPM Usage (Bundler like Vite/Webpack)

```javascript
import ZoomVideo from '@zoom/videosdk';

const client = ZoomVideo.createClient();
await client.init('en-US', 'Global', { patchJsMedia: true });
await client.join(topic, signature, userName, password);

// IMPORTANT: getMediaStream() ONLY works AFTER join()
const stream = client.getMediaStream();
await stream.startVideo();
await stream.startAudio();
```

### CDN Usage (No Bundler)

> **WARNING: Ad blockers block `source.zoom.us`**. Self-host the SDK to avoid issues.

```bash
# Download SDK locally
curl "https://source.zoom.us/videosdk/zoom-video-1.12.0.min.js" -o js/zoom-video-sdk.min.js
```

```html
<script src="js/zoom-video-sdk.min.js"></script>
```

```javascript
// CDN exports as WebVideoSDK, NOT ZoomVideo
// Must use .default property
const ZoomVideo = WebVideoSDK.default;
const client = ZoomVideo.createClient();

await client.init('en-US', 'Global', { patchJsMedia: true });
await client.join(topic, signature, userName, password);

// IMPORTANT: getMediaStream() ONLY works AFTER join()
const stream = client.getMediaStream();
await stream.startVideo();
await stream.startAudio();
```

### ES Module with CDN (Race Condition Fix)

When using `<script type="module">` with CDN, SDK may not be loaded yet:

```javascript
// Wait for SDK to load before using
function waitForSDK(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (typeof WebVideoSDK !== 'undefined') {
      resolve();
      return;
    }
    const start = Date.now();
    const check = setInterval(() => {
      if (typeof WebVideoSDK !== 'undefined') {
        clearInterval(check);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(check);
        reject(new Error('SDK failed to load'));
      }
    }, 100);
  });
}

// Usage
await waitForSDK();
const ZoomVideo = WebVideoSDK.default;
const client = ZoomVideo.createClient();
```

## SDK Lifecycle (CRITICAL ORDER)

The SDK has a strict lifecycle. Violating it causes silent failures.

```
1. Create client:     client = ZoomVideo.createClient()
2. Initialize:        await client.init('en-US', 'Global', options)
3. Join session:      await client.join(topic, signature, userName, password)
4. Get stream:        stream = client.getMediaStream()  ← ONLY AFTER JOIN
5. Start media:       await stream.startVideo() / await stream.startAudio()
```

**Common Mistake (Silent Failure):**

```javascript
// ❌ WRONG: Getting stream before joining
const client = ZoomVideo.createClient();
await client.init('en-US', 'Global');
const stream = client.getMediaStream();  // Returns undefined!
await client.join(...);

// ✅ CORRECT: Get stream after joining
const client = ZoomVideo.createClient();
await client.init('en-US', 'Global');
await client.join(...);
const stream = client.getMediaStream();  // Works!
```

## Video Rendering (Event-Driven)

**The SDK is event-driven.** You must listen for events and render videos accordingly.

### Use `attachVideo()` NOT `renderVideo()`

```javascript
import { VideoQuality } from '@zoom/videosdk';

// Start your camera
await stream.startVideo();

// Attach video - returns element to append to DOM
const element = await stream.attachVideo(userId, VideoQuality.Video_360P);
container.append
```