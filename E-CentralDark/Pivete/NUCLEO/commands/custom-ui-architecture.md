# COMANDO - custom-ui-architecture.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\concepts\custom-ui-architecture.md
**SHA:** eec6333f80068230
**Timestamp:** 2026-08-26T18:42:51.281732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- The `ICustomizedUIMgr` interface has a `HasLicense()` method. The official SDK demo checks it as a hard gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Custom UI Architecture — How It Actually Works

> **Skill**: Zoom Meeting SDK (Windows)
> **Category**: Concepts
> **Prerequisite**: [SDK Architecture Pattern](sdk-architecture-pattern.md)

## Overview

Custom UI mode lets you create your OWN meeting window instead of the SDK's default meeting UI. The SDK renders video into your window using Direct3D, but you control all layout, window management, and UI elements.

**This is NOT "HWND hijacking."** The SDK creates child windows inside your parent window and renders into those using its own D3D pipeline. Your window and WndProc remain untouched.

## Enabling Custom UI Mode

Set `ENABLE_CUSTOMIZED_UI_FLAG` during SDK initialization:

```cpp
InitParam initParam;
initParam.strWebDomain = L"https://zoom.us";
initParam.emLanguageID = LANGUAGE_English;

// CRITICAL: Enable Custom UI mode
initParam.obConfigOpts.optionalFeatures = ENABLE_CUSTOMIZED_UI_FLAG;

SDKError err = InitSDK(initParam);
```

Without this flag, the SDK creates its own default meeting window. With it, the SDK creates NO UI — you must provide everything.

## Internal Architecture

```
Your Window (WS_OVERLAPPEDWINDOW) — you own this, your WndProc
  |
  +-- [SDK Child HWND] — created internally by CreateVideoContainer()
       |   - SDK owns the WndProc
       |   - D3D11 swap chain bound to this child HWND
       |   - Composites all video onto one surface
       |
       +-- VideoElement: Active   (logical RECT region, NOT a window)
       +-- VideoElement: Normal0  (logical RECT region, NOT a window)
       +-- VideoElement: Normal1  (logical RECT region, NOT a window)
       +-- ...
  |
  +-- [SDK Child HWND for Share] — created by CreateShareRender()
       |   - Separate D3D surface for screen share content
       |   - Requires HandleWindowsMoveMsg() for DWM resync
```

### Key architectural facts

1. **`CreateVideoContainer(hParentWnd, rc)`** — SDK creates a **child HWND** inside your parent. You never see or manage this child HWND directly.

2. **Video elements are NOT separate windows** — they are **logical render regions** within a single D3D surface. `SetPos(RECT)` tells the SDK's compositor where to place each video texture within the container.

3. **Your app does ZERO rendering** — no `WM_PAINT`, no GDI calls, no `BitBlt`. The SDK handles 100% of video drawing internally.

## Rendering Technology

The SDK supports multiple rendering backends, configurable via `InitParam.renderOpts.videoRenderMode`:

```cpp
enum ZoomSDKVideoRenderMode {
    ZoomSDKVideoRenderMode_None = 0,       // Auto (default)
    ZoomSDKVideoRenderMode_Auto,
    ZoomSDKVideoRenderMode_D3D11EnableFLIP, // D3D11 with DXGI flip model (best)
    ZoomSDKVideoRenderMode_D3D11,           // D3D11 standard
    ZoomSDKVideoRenderMode_D3D9,            // D3D9 fallback
    ZoomSDKVideoRenderMode_GDI,             // GDI software fallback (VMs)
};
```

**Hierarchy**: D3D11 FLIP > D3D11 > D3D9 > GDI

The D3D11 FLIP model uses `DXGI_SWAP_EFFECT_FLIP_SEQUENTIAL` — this requires a dedicated child HWND (further confirming the child window architecture).

## Why onWindowMsgNotification Exists

The SDK's child HWND has its own WndProc that **intercepts input messages**. Your parent window's WndProc never sees mouse/keyboard events that land on the video area. The SDK forwards them back to you through callbacks:

```
Forwarded messages:
  WM_MOUSEMOVE, WM_MOUSEENTER, WM_MOUSELEAVE,
  WM_LBUTTONDOWN, WM_LBUTTONUP, WM_RBUTTONUP,
  WM_LBUTTONDBLCLK, WM_KEYDOWN
```

If you need to handle clicks on the video (e.g., click a participant to select them), you must handle them in `onWindowMsgNotification`, not in your parent WndProc.

## Why HandleWindowsMoveMsg() Exists (Share Render Only)

```cpp
// On ICustomizedShareRender only
virtual SDKError HandleWindowsMoveMsg() = 0;
```

When using Direct3D, the swap chain's presentation is tied to the window's screen position via DWM (Desktop Window Manager) composition. When the parent window moves:

1. Child HWND moves with it automatically
2. BUT the D3D swap chain may not update its DWM surface coordinates immediately
3. This causes "ghost frame" / "stale composition" artifacts

`HandleWindowsMoveMsg()` tells the SDK to force re-present at the new coordinates.

**This only exists on `ICustomizedShareRender`**, not on `ICustomizedVideoContainer` — the video container likely handles this internally or uses the FLIP model which doesn't have this issue.

## HasLicense() Check

The `ICustomizedUIMgr` interface has a `HasLicense()` method. The official SDK demo checks it as a hard gate:

```cpp
SDKError err = m_pCustomUIMgr->HasLicense();
if (err != SDKERR_SUCCESS) {
    // Demo aborts here
}
```

In practice, modern SDK licenses may include Custom UI by default. It's safe to log a warning but continue if it fails — the SDK will return errors on actual API calls if the license is truly missing.

## Custom UI Object Lifecycle

### Creation order (during meeting connect):
1. `CreateCustomizedUIMgr(&pM
```