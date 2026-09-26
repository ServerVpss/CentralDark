# Meeting SDK - Web

Embed Zoom meetings in web applications.

## Overview

The Zoom Meeting SDK for Web embeds the full Zoom meeting experience into your web application with two view options: Component View and Client View.

## Forum-Derived Hotspots

- SharedArrayBuffer / gallery view: [sharedarraybuffer-gallery-view.md](sharedarraybuffer-gallery-view.md)
- Joining meeting timeout / browser restriction: [web-timeout-browser-restriction.md](web-timeout-browser-restriction.md)
- Performance/CPU guidance: [web-performance-cpu.md](web-performance-cpu.md)
- Component View UI customization: [component-view-ui-customization.md](component-view-ui-customization.md)
- Component View breakout rooms: [component-view-breakout-rooms.md](component-view-breakout-rooms.md)

## Prerequisites

- Meeting SDK credentials from [Marketplace](https://marketplace.zoom.us/) (sign-in required)
- SDK Key and Secret
- Modern browser (Chrome, Firefox, Safari, Edge)

## View Options

| View | Description | Use Case |
|------|-------------|----------|
| **Component View** | Flexible, embeddable UI components | Custom layouts, React/Vue integration |
| **Client View** | Full-page Zoom meeting experience | Quick integration, standard Zoom UI |

## Implementation Approaches

| Approach | Technology | Port | View | Best For |
|----------|-----------|------|------|----------|
| **Components** | React + TypeScript + Vite | 3000 | Component | Modern, flexible integration |
| **Local** | React + Webpack + NPM | 9999 | Client | Traditional npm-based setup |
| **CDN** | Vanilla JS + CDN | 9999 | Client | Simple, no build tools |

## Installation

### Component View (Recommended)

```bash
npm install @zoom/meetingsdk
```

### Client View (CDN)

```html
<script src="https://source.zoom.us/3.1.6/lib/vendor/react.min.js"></script>
<script src="https://source.zoom.us/3.1.6/lib/vendor/react-dom.min.js"></script>
<script src="https://source.zoom.us/3.1.6/lib/vendor/redux.min.js"></script>
<script src="https://source.zoom.us/3.1.6/lib/vendor/redux-thunk.min.js"></script>
<script src="https://source.zoom.us/3.1.6/lib/vendor/lodash.min.js"></script>
<script src="https://source.zoom.us/3.1.6/zoom-meeting-3.1.6.min.js"></script>
```

> **Note:** CDN provides `ZoomMtg` (Client View). For `ZoomMtgEmbedded` (Component View), use npm.

### Auth Endpoint (Required)

The Meeting SDK requires a signature from an authentication backend:

```bash
# Clone Zoom's auth endpoint sample
git clone https://github.com/zoom/meetingsdk-auth-endpoint-sample --depth 1
cd meetingsdk-auth-endpoint-sample
cp .env.example .env
# Edit .env with your SDK credentials
npm install && npm run start
```

## Quick Start (Component View)

```javascript
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

const client = ZoomMtgEmbedded.createClient();

await client.init({
  zoomAppRoot: document.getElementById('meetingSDKElement'),
  language: 'en-US',
});

await client.join({
  sdkKey: SDK_KEY,
  signature: signature,
  meetingNumber: meetingNumber,
  userName: 'User',
  password: password,
});
```

## WebRTC Optimizations

Meeting SDK Web uses WebRTC for real-time communication with optimizations for:
- HD video (720p/1080p)
- Low latency audio
- Adaptive bitrate

### Codec Support
- H.264 for video
- VP8 as fallback
- Opus for audio

## HD Video

### Check System Requirements

```javascript
// Check browser compatibility
const compatibility = client.checkSystemRequirements();
console.log('Video supported:', compatibility.video);
console.log('Audio supported:', compatibility.audio);
console.log('Screen share supported:', compatibility.screen);
```

### Check SharedArrayBuffer (Required for HD)

```javascript
// SharedArrayBuffer is REQUIRED for 720p, gallery view, virtual background
const sabAvailable = typeof SharedArrayBuffer === 'function';

if (!sabAvailable) {
  console.warn('HD features require SharedArrayBuffer');
  console.warn('Enable COOP/COEP headers on your server');
}
```

### Enable HD in Init

```javascript
await client.init({
  zoomAppRoot: document.getElementById('meetingSDKElement'),
  language: 'en-US',

  // Enable 720p (default true for SDK >= 2.8.0)
  enableHD: true,

  // Enable 1080p for webinar attendees (SDK >= 2.9.0)
  enableFullHD: true,
});
```

### HD Requirements

To enable 720p:
1. Contact Zoom Support to enable on your account
2. Enable "Group HD" in Zoom profile settings
3. SharedArrayBuffer must be available (COOP/COEP headers)
4. Solid internet connection and low CPU usage

**Resolution tiers:**
- 1:1 calls: Up to 1080p
- Small groups (2-4): Up to 720p
- Larger meetings: Adaptive

**Key limitation:** If a 3rd participant turns video on, quality reverts to standard definition.

## SharedArrayBuffer

For optimal performance, configure these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Event Handling

### Component View Events

```javascript
client.on('connection-change', (payload) => {
  console.log('Connection state:', payload.state);
});

client.on('user-added', (payload) => {
  console.log('User joined:', payload);
});

client.on('user-removed', (payload) => {
  console.log('User left:', payload);
});
```

### Client View In-Meeting Listeners

```javascript
// User events
ZoomMtg.inMeetingServiceListener('onUserJoin', (data) => {
  console.log('User joined:', data);
});

ZoomMtg.inMeetingServiceListener('onUserLeave', (data) => {
  console.log('User left:', data);
});

// Waiting room
ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', (data) => {
  console.log('User in waiting room:', data);
});

// Meeting status changes
ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data) => {
  console.log('Meeting status:', data);
});
```

## Common Tasks

### Join Meeting
```javascript
await client.join({
  sdkKey: SDK_KEY,
  signature: signature,
  meetingNumber: meetingNumber,
  userName: 'User',
});
```

### Leave Meeting
```javascript
client.leaveMeeting();
```

## Client View Full Example

```javascript
import { ZoomMtg } from '@zoom/meetingsdk';

// Check system requirements
console.log(ZoomMtg.checkSystemRequirements());

// Preload WebAssembly for faster init
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

// Initialize and join
ZoomMtg.init({
  leaveUrl: '/meeting-ended',
  disableCORP: !window.crossOriginIsolated, // Disable if no COOP/COEP
  success: () => {
    ZoomMtg.join({
      meetingNumber: '123456789',
      userName: 'User Name',
      signature: signature, // From auth endpoint
      userEmail: 'user@example.com',
      passWord: 'meeting-password',
      success: (res) => {
        console.log('Joined meeting');
        ZoomMtg.getAttendeeslist({});
        ZoomMtg.getCurrentUser({
          success: (res) => console.log('Current user:', res.result.currentUser)
        });
      },
      error: (err) => console.error('Join error:', err)
    });
  },
  error: (err) => console.error('Init error:', err)
});
```

## China CDN

For users in China, use the China-specific CDN:

```javascript
// Set before preLoadWasm()
ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/{VERSION}/lib', '/av');
```

## Zoom for Government (ZFG)

For government applications, apply for SDK credentials at [ZFG Marketplace](https://marketplace.zoomgov.com/).

### Option 1: ZFG-specific NPM Package

```json
{
  "dependencies": {
    "@zoom/meetingsdk": "3.11.2-zfg"
  }
}
```

### Option 2: Configure ZFG Endpoints

**Client View:**
```javascript
ZoomMtg.setZoomJSLib('https://source.zoomgov.com/{VERSION}/lib', '/av');
ZoomMtg.init({
  webEndpoint: 'www.zoomgov.com',
});
```

**Component View:**
```javascript
const client = ZoomMtgEmbedded.createClient();
client.init({
  assetPath: 'https://source.zoomgov.com/{VERSION}/lib/av',
  webEndpoint: 'www.zoomgov.com'
});
```

## Resources

- **Official docs**: https://developers.zoom.us/docs/meeting-sdk/web/
- **Component View sample**: https://github.com/zoom/meetingsdk-web-sample
- **Client View sample**: https://github.com/zoom/meetingsdk-sample-signature-node.js


---

# OUTRO - web.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\softbuffer-0.4.8\src\backends\web.rs
**SHA:** 1b33b34985fee9a5
**Timestamp:** 2026-08-28T02:35:44.628356
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Can also error if width or height are 0.

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation of software buffering for web targets.

#![allow(clippy::uninlined_format_args)]

use js_sys::Object;
use raw_window_handle::{HasDisplayHandle, HasWindowHandle, RawDisplayHandle, RawWindowHandle};
use wasm_bindgen::{JsCast, JsValue};
use web_sys::ImageData;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};
use web_sys::{OffscreenCanvas, OffscreenCanvasRenderingContext2d};

use crate::backend_interface::*;
use crate::error::{InitError, SwResultExt};
use crate::{util, NoDisplayHandle, NoWindowHandle, Rect, SoftBufferError};
use std::marker::PhantomData;
use std::num::NonZeroU32;

/// Display implementation for the web platform.
///
/// This just caches the document to prevent having to query it every time.
#[derive(Clone, Debug)]
pub struct WebDisplayImpl<D> {
    document: web_sys::Document,
    _display: D,
}

impl<D: HasDisplayHandle> ContextInterface<D> for WebDisplayImpl<D> {
    fn new(display: D) -> Result<Self, InitError<D>> {
        let raw = display.display_handle()?.as_raw();
        let RawDisplayHandle::Web(..) = raw else {
            return Err(InitError::Unsupported(display));
        };

        let document = web_sys::window()
            .swbuf_err("`Window` is not present in this runtime")?
            .document()
            .swbuf_err("`Document` is not present in this runtime")?;

        Ok(Self {
            document,
            _display: display,
        })
    }
}

#[derive(Debug)]
pub struct WebImpl<D, W> {
    /// The handle and context to the canvas that we're drawing to.
    canvas: Canvas,

    /// The buffer that we're drawing to.
    buffer: util::PixelBuffer,

    /// Buffer has been presented.
    buffer_presented: bool,

    /// The current canvas width/height.
    size: Option<(NonZeroU32, NonZeroU32)>,

    /// The underlying window handle.
    window_handle: W,

    /// The underlying display handle.
    _display: PhantomData<D>,
}

/// Holding canvas and context for [`HtmlCanvasElement`] or [`OffscreenCanvas`],
/// since they have different types.
#[derive(Debug)]
enum Canvas {
    Canvas {
        canvas: HtmlCanvasElement,
        ctx: CanvasRenderingContext2d,
    },
    OffscreenCanvas {
        canvas: OffscreenCanvas,
        ctx: OffscreenCanvasRenderingContext2d,
    },
}

impl<D: HasDisplayHandle, W: HasWindowHandle> WebImpl<D, W> {
    fn from_canvas(canvas: HtmlCanvasElement, window: W) -> Result<Self, SoftBufferError> {
        let ctx = Self::resolve_ctx(canvas.get_context("2d").ok(), "CanvasRenderingContext2d")?;

        Ok(Self {
            canvas: Canvas::Canvas { canvas, ctx },
            buffer: util::PixelBuffer(Vec::new()),
            buffer_presented: false,
            size: None,
            window_handle: window,
            _display: PhantomData,
        })
    }

    fn from_offscreen_canvas(canvas: OffscreenCanvas, window: W) -> Result<Self, SoftBufferError> {
        let ctx = Self::resolve_ctx(
            canvas.get_context("2d").ok(),
            "OffscreenCanvasRenderingContext2d",
        )?;

        Ok(Self {
            canvas: Canvas::OffscreenCanvas { canvas, ctx },
            buffer: util::PixelBuffer(Vec::new()),
            buffer_presented: false,
            size: None,
            window_handle: window,
            _display: PhantomData,
        })
    }

    fn resolve_ctx<T: JsCast>(
        result: Option<Option<Object>>,
        name: &str,
    ) -> Result<T, SoftBufferError> {
        let ctx = result
            .swbuf_err("Canvas already controlled using `OffscreenCanvas`")?
            .swbuf_err(format!(
                "A canvas context other than `{name}` was already created"
            ))?
            .dyn_into()
            .unwrap_or_else(|_| panic!("`getContext(\"2d\") didn't return a `{name}`"));

        Ok(ctx)
    }

    fn present_with_damage(&mut self, damage: &[Rect]) -> Result<(), SoftBufferError> {
        let (buffer_width, _buffer_height) = self
            .size
            .expect("Must set size of surface before calling `present_with_damage()`");

        let union_damage = if let Some(rect) = util::union_damage(damage) {
            rect
        } else {
            return Ok(());
        };

        // Create a bitmap from the buffer.
        let bitmap: Vec<_> = self
            .buffer
            .chunks_exact(buffer_width.get() as usize)
            .skip(union_damage.y as usize)
            .take(union_damage.height.get() as usize)
            .flat_map(|row| {
                row.iter()
                    .skip(union_damage.x as usize)
                    .take(union_damage.width.get() as usize)
            })
            .copied()
            .flat_map(|pixel| [(pixel >> 16) as u8, (pixel >> 8) as u8, pixel as u8, 255])
            .collect();

        debug_assert_eq!(
            bitmap.len() as u32,
            union_damage.width.get() * union_damage.height.get() * 4
        );

        #[cfg(target_feature = "atomics")]
        #[allow(non_local_d
```