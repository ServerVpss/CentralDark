# COMANDO - web.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\web\references\web.md
**SHA:** a092bb9bd8926d36
**Timestamp:** 2026-08-26T18:42:53.021229
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
# Video SDK - Web

Build custom video experiences in the browser with Zoom Video SDK.

## Overview

The Zoom Video SDK for Web enables fully customized video applications using Zoom's infrastructure. You control the UI, branding, and user experience.

## Prerequisites

- Video SDK credentials from [Marketplace](https://marketplace.zoom.us/) (sign-in required)
- SDK Key and Secret
- Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

### NPM (Recommended)

```bash
npm install @zoom/videosdk
```

### CDN (Fallback Strategy)

> **Note**: Some networks/ad blockers can block `source.zoom.us`. Prefer allowlisting the domain in managed environments. If you need a fallback, consider mirroring/self-hosting only if permitted and you can keep versions in sync.

```bash
# Download SDK locally
curl "https://source.zoom.us/videosdk/zoom-video-1.12.0.min.js" -o public/js/zoom-video-sdk.min.js
```

```html
<!-- Use local copy instead of CDN -->
<script src="js/zoom-video-sdk.min.js"></script>
```

**Note:** Remember to update your local copy when new SDK versions are released.

## Quick Start

### NPM Usage (Bundler)

```javascript
import ZoomVideo from '@zoom/videosdk';

const client = ZoomVideo.createClient();
await client.init('en-US', 'Global', { patchJsMedia: true });
await client.join(topic, signature, userName, password);

// CRITICAL: getMediaStream() ONLY works AFTER join()
const stream = client.getMediaStream();
await stream.startVideo();
await stream.startAudio();
```

### CDN Usage (No Bundler)

```javascript
// CDN exports as WebVideoSDK, NOT ZoomVideo
// Must use .default property
const ZoomVideo = WebVideoSDK.default;
const client = ZoomVideo.createClient();

await client.init('en-US', 'Global', { patchJsMedia: true });
await client.join(topic, signature, userName, password);

// CRITICAL: getMediaStream() ONLY works AFTER join()
const stream = client.getMediaStream();
await stream.startVideo();
await stream.startAudio();
```

### ES Module with CDN (Race Condition)

When using `<script type="module">` with CDN, the SDK may not be loaded yet:

```javascript
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

The SDK has a strict lifecycle. Violating it causes **silent failures**.

```
1. Create client:     client = ZoomVideo.createClient()
2. Initialize:        await client.init('en-US', 'Global', options)
3. Join session:      await client.join(topic, signature, userName, password)
4. Get stream:        stream = client.getMediaStream()  ← ONLY AFTER JOIN
5. Start media:       await stream.startVideo() / await stream.startAudio()
```

**Common Mistake:**

```javascript
// ❌ WRONG: Getting stream before joining
const stream = client.getMediaStream();  // Returns undefined!
await client.join(...);

// ✅ CORRECT: Get stream after joining
await client.join(...);
const stream = client.getMediaStream();  // Works!
```

## Video Rendering Best Practices

These show up repeatedly in forum "high CPU", "freezing", and "Safari/Firefox rendering" threads.

- Prefer a single rendering pipeline/control rather than one independent renderer per participant.
- Add videos incrementally and measure CPU/GPU usage.
- Degrade gracefully when `isSupportMultipleVideos()` is false (mobile Safari, lower-end devices).
- Consider lower quality subscriptions for non-active speakers.

## Key Features

### WebRTC Mode

Enable WebRTC mode for direct peer-to-peer streaming with HD video support:

```javascript
await client.init('en-US', 'Global', {
  patchJsMedia: true,
  webrtc: true  // Enable WebRTC mode
});
```

**Benefits:**
- Up to 1080p HD video
- Improved performance for direct streaming

### Virtual Backgrounds

**Check support before using:**

```javascript
const stream = client.getMediaStream();

// Always check support first
if (stream.isSupportVirtualBackground()) {
  // Blur background
  await stream.updateVirtualBackgroundImage('blur');

  // Custom image background
  await stream.updateVirtualBackgroundImage('https://example.com/bg.jpg');

  // Remove virtual background
  await stream.updateVirtualBackgroundImage(undefined);
} else {
  console.log('Virtual backgrounds not supported on this device');
}
```

### HD Video Resolution

#### Check HD Capability (IMPORTANT)

**Always check if HD is supported before enabling:**

```javascript
const stream = client.getMediaStream();

// Check if 720p is supported
const hdSupported = stream.isSupp
```