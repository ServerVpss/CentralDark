# COMANDO - screen-share-subscription.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\screen-share-subscription.md
**SHA:** 93bf7c670f0db2df
**Timestamp:** 2026-08-26T18:42:51.123937
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case ZoomVideoSDKShareStatus_Start:
- case ZoomVideoSDKShareStatus_Start:
- case ZoomVideoSDKShareStatus_Start:   // New share started

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {
- class ShareRawDataDelegate : public IZoomVideoSDKRawDataPipeDelegate {
- class MyDelegate : public IZoomVideoSDKDelegate {
- auto* delegate = new ShareRawDataDelegate([](YUVRawDataI420* frame) {

### Ouro Bruto (primeiros 5000 chars)
```
# Screen Share Subscription - Complete Guide

## Overview

Screen share subscription in the Zoom Video SDK is **fundamentally different** from video subscription. This guide explains why and provides complete working code for both Canvas API and Raw Data approaches.

## Why Screen Share is Different from Video

| Aspect | Video | Screen Share |
|--------|-------|--------------|
| **Streams per user** | One video stream | Multiple share streams possible (multi-share) |
| **Access method** | `user->GetVideoCanvas()` | `IZoomVideoSDKShareAction*` from callback |
| **Subscription timing** | `onUserVideoStatusChanged` | `onUserShareStatusChanged` |
| **Key object** | `IZoomVideoSDKUser*` | `IZoomVideoSDKShareAction*` |

**The critical difference**: A user can have multiple active share actions simultaneously (e.g., sharing screen + sharing a whiteboard). The `IZoomVideoSDKShareAction` object in the callback represents a specific share stream.

## The Wrong Way (Common Mistake)

```cpp
// WRONG - This won't work for remote screen shares!
IZoomVideoSDKUser* sharingUser = ...;
IZoomVideoSDKCanvas* shareCanvas = sharingUser->GetShareCanvas();
shareCanvas->subscribeWithView(hwnd, aspect);  // May fail or show nothing!
```

**Why it fails**: `GetShareCanvas()` on the user object doesn't give you access to the active share stream. You MUST use the `IZoomVideoSDKShareAction*` provided in the callback.

## The Correct Way

### Canvas API (Recommended)

The Canvas API lets the SDK render the shared screen directly to your window handle.

```cpp
class MyDelegate : public IZoomVideoSDKDelegate {
private:
    HWND shareWindow_;
    std::map<IZoomVideoSDKShareAction*, bool> activeShares_;

public:
    MyDelegate(HWND shareWnd) : shareWindow_(shareWnd) {}

    void onUserShareStatusChanged(
        IZoomVideoSDKShareHelper* pShareHelper,
        IZoomVideoSDKUser* pUser,
        IZoomVideoSDKShareAction* pShareAction) override
    {
        if (!pShareAction) return;

        ZoomVideoSDKShareStatus status = pShareAction->getShareStatus();
        ZoomVideoSDKShareType type = pShareAction->getShareType();

        // Get user name for logging
        const zchar_t* userName = pUser ? pUser->getUserName() : L"Unknown";

        switch (status) {
            case ZoomVideoSDKShareStatus_Start:
            case ZoomVideoSDKShareStatus_Resume:
                SubscribeToShare(pShareAction, userName);
                break;

            case ZoomVideoSDKShareStatus_Pause:
                // Share is paused - you may want to show a "Paused" overlay
                // The subscription remains active
                break;

            case ZoomVideoSDKShareStatus_Stop:
                UnsubscribeFromShare(pShareAction, userName);
                break;
        }
    }

private:
    void SubscribeToShare(IZoomVideoSDKShareAction* pShareAction,
                          const zchar_t* userName)
    {
        // Prevent duplicate subscriptions
        if (activeShares_.find(pShareAction) != activeShares_.end()) {
            return;
        }

        // Get the share canvas from the ShareAction (NOT from the user!)
        IZoomVideoSDKCanvas* shareCanvas = pShareAction->getShareCanvas();
        if (!shareCanvas) {
            // Error: Share canvas not available
            return;
        }

        // Subscribe with Canvas API
        ZoomVideoSDKErrors ret = shareCanvas->subscribeWithView(
            shareWindow_,
            ZoomVideoSDKVideoAspect_Original  // Show full content, letterbox if needed
        );

        if (ret == ZoomVideoSDKErrors_Success) {
            activeShares_[pShareAction] = true;
            // Successfully subscribed to share from [userName]
        } else {
            // Failed to subscribe: error code [ret]
        }
    }

    void UnsubscribeFromShare(IZoomVideoSDKShareAction* pShareAction,
                              const zchar_t* userName)
    {
        auto it = activeShares_.find(pShareAction);
        if (it == activeShares_.end()) {
            return;  // Not subscribed
        }

        IZoomVideoSDKCanvas* shareCanvas = pShareAction->getShareCanvas();
        if (shareCanvas) {
            shareCanvas->unSubscribeWithView(shareWindow_);
        }

        activeShares_.erase(it);
        // Unsubscribed from share
    }
};
```

### Raw Data Pipe (Advanced)

Use Raw Data when you need to process the shared screen frames yourself (recording, effects, computer vision).

```cpp
class ShareRawDataDelegate : public IZoomVideoSDKRawDataPipeDelegate {
private:
    std::function<void(YUVRawDataI420*)> frameCallback_;

public:
    ShareRawDataDelegate(std::function<void(YUVRawDataI420*)> callback)
        : frameCallback_(callback) {}

    void onRawDataFrameReceived(YUVRawDataI420* data) override {
        if (!data) return;

        int width = data->GetStreamWidth();
        int height = data->GetStreamHeight();

        // Share frames can be large (1080p, 4K)
        // Process efficientl
```