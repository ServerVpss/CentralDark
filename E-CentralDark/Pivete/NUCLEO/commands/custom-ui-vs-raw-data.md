# COMANDO - custom-ui-vs-raw-data.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\concepts\custom-ui-vs-raw-data.md
**SHA:** 2f94b015d2483433
**Timestamp:** 2026-08-26T18:42:50.848480
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- -> IZoomSDKRendererDelegate::onRawDataFrameReceived(YUVRawDataI420*)
- - `IZoomSDKRendererDelegate::onRawDataFrameReceived(YUVRawDataI420*)` — frame callback
- - `IZoomSDKRendererDelegate::onRawDataStatusChanged(RawDataStatus)` — status changes

### Ouro Bruto (primeiros 5000 chars)
```
# Two Approaches to Custom UI: SDK-Rendered vs Self-Rendered

> **Skill**: Zoom Meeting SDK (Windows)
> **Category**: Concepts
> **Prerequisite**: [Custom UI Architecture](custom-ui-architecture.md), [Raw Video Capture](../examples/raw-video-capture.md)

## Overview

There are two fundamentally different ways to build a custom meeting UI with the Zoom SDK. Both require Custom UI mode (`ENABLE_CUSTOMIZED_UI_FLAG`), but they differ in who renders the video.

## Approach 1: SDK-Rendered (ICustomizedVideoContainer)

The SDK renders video into your window using Direct3D. You control layout, the SDK controls pixels.

### How it works
```
Your Win32 Window
  -> SDK creates child HWND inside it
    -> SDK renders video via D3D11 into child HWND
      -> You call SetPos(RECT) to position video elements
```

### You control
- Window creation, sizing, positioning
- Which participants are visible and where (`SetPos`)
- Active speaker vs gallery layout
- Your own UI controls (buttons, toolbar)
- Background color (`SetBkColor`)

### SDK controls
- Actual video decoding and rendering
- D3D pipeline
- Frame timing
- Video quality / resolution scaling

### Key APIs
- `CreateCustomizedUIMgr()` / `DestroyCustomizedUIMgr()`
- `ICustomizedUIMgr::CreateVideoContainer()` / `DestroyVideoContainer()`
- `ICustomizedVideoContainer::CreateVideoElement()`
- `IActiveVideoRenderElement::Start()` / `Stop()`
- `INormalVideoRenderElement::Subscribe(userId)`
- `IVideoRenderElement::SetPos(RECT)` / `Show()` / `Hide()`

### Best for
- Standard meeting applications
- Apps that need a meeting window with video
- Rapid development (less code)
- When you don't need pixel-level access

### Limitations
- No access to raw video frames
- Cannot apply custom filters/effects
- Cannot render video in your own graphics engine
- Cannot pop individual videos into separate windows (elements are regions within one container)
- Single rendering surface per container

---

## Approach 2: Self-Rendered (IZoomSDKRenderer + Raw Data)

You get raw YUV420 frames per participant and render them yourself. Maximum control.

### How it works
```
SDK decodes video internally
  -> IZoomSDKRendererDelegate::onRawDataFrameReceived(YUVRawDataI420*)
    -> You get raw pixel data (Y, U, V planes)
      -> You render with your own engine (D3D11, OpenGL, GDI, etc.)
```

### You control
- Everything from Approach 1, PLUS:
- Raw pixel access (YUV420 frames)
- Your own rendering pipeline (D3D11, OpenGL, Vulkan, GDI, etc.)
- Custom video processing (filters, watermarks, overlays, effects)
- Multiple separate windows per participant
- Picture-in-picture
- Recording/streaming with effects applied
- Any layout imaginable

### SDK provides
- Decoded video frames as `YUVRawDataI420*`
- Frame metadata (width, height, rotation)
- Per-participant subscription

### Key APIs
- `createRenderer()` — creates a renderer for one participant
- `IZoomSDKRenderer::setRawDataResolution()` — set quality
- `IZoomSDKRenderer::subscribe(userId)` — bind to participant
- `IZoomSDKRendererDelegate::onRawDataFrameReceived(YUVRawDataI420*)` — frame callback
- `IZoomSDKRendererDelegate::onRawDataStatusChanged(RawDataStatus)` — status changes
- Raw recording: `IMeetingRecordingController::StartRawRecording()`

### Best for
- Custom rendering engines
- Video processing / effects
- Multi-window layouts
- Recording with overlays
- Streaming applications
- Research / computer vision

### Limitations
- More code to write (you handle all rendering)
- Must convert YUV420 to RGB/BGRA for display
- Must manage frame buffers and timing
- Higher CPU usage if not GPU-accelerated
- Must call `StartRawRecording()` before frames flow

---

## Approach 3: Hybrid (Both Together)

You can combine both approaches in the same application:

```
Custom UI mode enabled
  |
  +-- ICustomizedVideoContainer for main meeting view
  |     (SDK renders, you layout)
  |
  +-- IZoomSDKRenderer for specific participants
        (raw frames for recording, processing, pop-out windows)
```

### Use cases
- Main meeting window uses SDK rendering (efficient, easy)
- Simultaneously capture raw frames for recording with watermarks
- Pop out a specific participant into a custom-rendered window
- Apply computer vision to one participant's feed while showing others normally

### How to combine
1. Initialize with `ENABLE_CUSTOMIZED_UI_FLAG`
2. Create `ICustomizedVideoContainer` for the main view
3. Also call `createRenderer()` + `subscribe()` for raw data on specific users
4. Both can run simultaneously

---

## Comparison Table

| Feature | SDK-Rendered | Self-Rendered | Hybrid |
|---------|-------------|---------------|--------|
| Raw pixel access | No | Yes | Yes (selected users) |
| Custom filters/effects | No | Yes | Yes (selected users) |
| Multiple windows | No (regions in 1 container) | Yes | Yes |
| Rendering effort | Minimal | High | Medium |
| CPU usage | Low (SDK uses D3D) | Higher (unless GPU) | Medium |
| Code complexity | Low | High | Medi
```