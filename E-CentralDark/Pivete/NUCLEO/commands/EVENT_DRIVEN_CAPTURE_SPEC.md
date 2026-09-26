# COMANDO - EVENT_DRIVEN_CAPTURE_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\docs\EVENT_DRIVEN_CAPTURE_SPEC.md
**SHA:** f68424f4f009351f
**Timestamp:** 2026-08-23T14:17:01.761901
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- ### Principle: Use Accessibility to Test Accessibility

### Ouro Bruto (primeiros 5000 chars)
```
# Event-Driven Capture — Architecture Spec

<!-- doc-covers: crates/screenpipe-engine/src/event_driven_capture.rs -->
<!-- doc-verified: 8c70b4b18 -->
> **Historical.** Last verified against 8c70b4b18 (2026-02-20). `crates/screenpipe-engine/src/event_driven_capture.rs` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

> **Status**: Draft
> **Date**: 2026-02-20

## 1. Problem

Three independent capture systems run on their own clocks with zero synchronization:

- **Vision**: polls at 0.5–10 FPS, compares frames, runs OCR, encodes H.265 video
- **Accessibility tree walker**: walks every 3s or on app switch, stores text separately
- **UI event recorder**: real-time input capture, stored in its own table

When a user searches a keyword that exists in accessibility data, the nearest screenshot is from a different moment. The thumbnail is wrong. The user doesn't trust the results.

Meanwhile the vision pipeline burns CPU comparing and skipping identical frames on a static screen. The `ActivityFeed` already detects every click, keystroke, and app switch — but instead of triggering a capture, it nudges a polling rate. That's backwards.

## 2. Design

### 2.1 One Capture System

Kill the three-system split. One system: **event happens → screenshot + text extraction → store together**.

```
Event (click / app switch / typing pause / scroll stop / idle timer)
  → Screenshot (reuse capture_monitor_image)
  → Accessibility tree walk (reuse walk_focused_window)
  → If accessibility empty → OCR fallback (reuse process_ocr_task)
  → Write JPEG to disk
  → Insert frame + text into DB (single row, single timestamp)
```

Screenshot and text share the same timestamp because they come from the same capture. No desync possible.

### 2.2 Event Triggers

| Trigger | Debounce | Why |
|---------|----------|-----|
| App switch | 300ms settle | Highest-value event — user changed context |
| Window focus change | 300ms settle | New tab, new document, new conversation |
| Mouse click | 200ms | User interacted — screen likely changed |
| Typing pause | 500ms after last key | Capture the result of typing, not every character |
| Scroll stop | 400ms after last scroll | New content scrolled into view |
| Clipboard copy | 200ms | User grabbed something — capture context |
| **Idle fallback** | **Every 5s** | Catch passive changes: notifications, incoming messages, auto-play |

**Hard constraints**:
- **Minimum interval**: 200ms between captures per monitor. Non-negotiable — prevents storms.
- **Maximum gap**: 10s. If nothing triggers a capture for 10s, take one anyway. Identical consecutive idle frames are deduplicated via frame hash comparison (already exists in `FrameComparer`).

### 2.3 Text Extraction

Accessibility first. OCR as fallback. No "both" mode at capture time — keep it simple.

```
walk_focused_window() → result
  if result.text_content is non-empty → done (text_source = "accessibility")
  if result is empty/error → run OCR → done (text_source = "ocr")
```

Accessibility tree walk has a **200ms hard timeout**. If the app has a massive AX tree (Electron apps with 10k+ nodes), we take whatever text we got in 200ms and move on. This keeps capture latency predictable.

OCR is the safety net for:
- Image-heavy apps (Figma, Photoshop)
- PDF viewers rendering as canvas
- Video players showing text
- Apps with broken/missing accessibility support

The user doesn't choose. The system picks the right method per-capture.

### 2.4 Snapshot Storage

No more H.265 video encoding. No more FFmpeg for frame extraction.

Each capture writes a JPEG directly to disk:

```
~/.screenpipe/data/
  2026-02-20/
    1708423935123_m0.jpg     # monitor 0 screenshot
    1708423937456_m0.jpg
    1708423939100_m1.jpg     # monitor 1 screenshot
    ...
```

Metadata (text, app name, trigger, etc.) lives in the DB, not sidecar files. The JPEG is just pixels.

**Why kill video?**
1. Event-driven capture has irregular timing. H.265 assumes consistent FPS.
2. FFmpeg extraction is the #1 timeline bottleneck (100-500ms per frame, 3-permit semaphore).
3. FFmpeg is a 100MB+ dependency we can stop depending on for the hot path.
4. JPEG files are directly servable. Zero processing to display.

**Storage math** (8 hours active use, 1080p, JPEG quality 80 ≈ 80KB/frame):
- Today (0.5-1 FPS continuous): 14,400–28,800 frames → 1.1–2.3 GB (H.265 compressed ≈ 100-200 MB/hr × 8hr)
- Event-driven (~10 captures/min active, 6/min idle, 50/50 split): ~3,840 frames → ~300 MB total

Fewer frames, each slightly larger, far less total storage.

**Reading old data**: Legacy video-chunk frames stay on disk forever. The frame retrieval endpoint checks `snapshot_path` on the frame row — if set, serve JPEG directly; if NULL, use the existing FFmpeg extraction path. Old data keeps working with zero migration effort.

### 2.5 Database Changes

On
```

---

# COMANDO - EVENT_DRIVEN_CAPTURE_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\docs\EVENT_DRIVEN_CAPTURE_SPEC.md
**SHA:** f68424f4f009351f5007fbab9c93f9e6fce92a5eb393f422eb117f627b94eb0c
**Timestamp:** 2026-08-24T01:39:59.325837
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- ### Principle: Use Accessibility to Test Accessibility

### Ouro Bruto (primeiros 5000 chars)
```
# Event-Driven Capture — Architecture Spec

<!-- doc-covers: crates/screenpipe-engine/src/event_driven_capture.rs -->
<!-- doc-verified: 8c70b4b18 -->
> **Historical.** Last verified against 8c70b4b18 (2026-02-20). `crates/screenpipe-engine/src/event_driven_capture.rs` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

> **Status**: Draft
> **Date**: 2026-02-20

## 1. Problem

Three independent capture systems run on their own clocks with zero synchronization:

- **Vision**: polls at 0.5–10 FPS, compares frames, runs OCR, encodes H.265 video
- **Accessibility tree walker**: walks every 3s or on app switch, stores text separately
- **UI event recorder**: real-time input capture, stored in its own table

When a user searches a keyword that exists in accessibility data, the nearest screenshot is from a different moment. The thumbnail is wrong. The user doesn't trust the results.

Meanwhile the vision pipeline burns CPU comparing and skipping identical frames on a static screen. The `ActivityFeed` already detects every click, keystroke, and app switch — but instead of triggering a capture, it nudges a polling rate. That's backwards.

## 2. Design

### 2.1 One Capture System

Kill the three-system split. One system: **event happens → screenshot + text extraction → store together**.

```
Event (click / app switch / typing pause / scroll stop / idle timer)
  → Screenshot (reuse capture_monitor_image)
  → Accessibility tree walk (reuse walk_focused_window)
  → If accessibility empty → OCR fallback (reuse process_ocr_task)
  → Write JPEG to disk
  → Insert frame + text into DB (single row, single timestamp)
```

Screenshot and text share the same timestamp because they come from the same capture. No desync possible.

### 2.2 Event Triggers

| Trigger | Debounce | Why |
|---------|----------|-----|
| App switch | 300ms settle | Highest-value event — user changed context |
| Window focus change | 300ms settle | New tab, new document, new conversation |
| Mouse click | 200ms | User interacted — screen likely changed |
| Typing pause | 500ms after last key | Capture the result of typing, not every character |
| Scroll stop | 400ms after last scroll | New content scrolled into view |
| Clipboard copy | 200ms | User grabbed something — capture context |
| **Idle fallback** | **Every 5s** | Catch passive changes: notifications, incoming messages, auto-play |

**Hard constraints**:
- **Minimum interval**: 200ms between captures per monitor. Non-negotiable — prevents storms.
- **Maximum gap**: 10s. If nothing triggers a capture for 10s, take one anyway. Identical consecutive idle frames are deduplicated via frame hash comparison (already exists in `FrameComparer`).

### 2.3 Text Extraction

Accessibility first. OCR as fallback. No "both" mode at capture time — keep it simple.

```
walk_focused_window() → result
  if result.text_content is non-empty → done (text_source = "accessibility")
  if result is empty/error → run OCR → done (text_source = "ocr")
```

Accessibility tree walk has a **200ms hard timeout**. If the app has a massive AX tree (Electron apps with 10k+ nodes), we take whatever text we got in 200ms and move on. This keeps capture latency predictable.

OCR is the safety net for:
- Image-heavy apps (Figma, Photoshop)
- PDF viewers rendering as canvas
- Video players showing text
- Apps with broken/missing accessibility support

The user doesn't choose. The system picks the right method per-capture.

### 2.4 Snapshot Storage

No more H.265 video encoding. No more FFmpeg for frame extraction.

Each capture writes a JPEG directly to disk:

```
~/.screenpipe/data/
  2026-02-20/
    1708423935123_m0.jpg     # monitor 0 screenshot
    1708423937456_m0.jpg
    1708423939100_m1.jpg     # monitor 1 screenshot
    ...
```

Metadata (text, app name, trigger, etc.) lives in the DB, not sidecar files. The JPEG is just pixels.

**Why kill video?**
1. Event-driven capture has irregular timing. H.265 assumes consistent FPS.
2. FFmpeg extraction is the #1 timeline bottleneck (100-500ms per frame, 3-permit semaphore).
3. FFmpeg is a 100MB+ dependency we can stop depending on for the hot path.
4. JPEG files are directly servable. Zero processing to display.

**Storage math** (8 hours active use, 1080p, JPEG quality 80 ≈ 80KB/frame):
- Today (0.5-1 FPS continuous): 14,400–28,800 frames → 1.1–2.3 GB (H.265 compressed ≈ 100-200 MB/hr × 8hr)
- Event-driven (~10 captures/min active, 6/min idle, 50/50 split): ~3,840 frames → ~300 MB total

Fewer frames, each slightly larger, far less total storage.

**Reading old data**: Legacy video-chunk frames stay on disk forever. The frame retrieval endpoint checks `snapshot_path` on the frame row — if set, serve JPEG directly; if NULL, use the existing FFmpeg extraction path. Old data keeps working with zero migration effort.

### 2.5 Database Changes

On
```