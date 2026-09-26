# COMANDO - video-rendering.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\video-rendering.md
**SHA:** d9e9f8b63661bd8c
**Timestamp:** 2026-08-26T18:42:50.970605
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Video Rendering with Canvas API

Complete working code for subscribing to and displaying video using the Canvas API.

## Overview

The Canvas API lets the SDK render video directly to your window. This is the **recommended approach** for standard video applications.

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIDEO SUBSCRIPTION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│  onSessionJoin       →  Subscribe to self video                 │
│  onUserVideoStatusChanged →  Subscribe to remote video (when ON)│
│  onUserLeave         →  Unsubscribe and cleanup                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critical Rule

### Subscribe in onUserVideoStatusChanged, NOT onUserJoin

```cpp
// WRONG - Video may not be ready yet!
void onUserJoin(IZoomVideoSDKUserHelper* helper,
                IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
    for (int i = 0; i < userList->GetCount(); i++) {
        IZoomVideoSDKUser* user = userList->GetItem(i);
        // This returns Error 2 (Internal_Error) - video not ready!
        user->GetVideoCanvas()->subscribeWithView(hwnd, aspect, resolution);
    }
}

// CORRECT - Wait for video status change
void onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* helper,
                               IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
    IZoomVideoSDKUser* myself = g_sdk->getSessionInfo()->getMyself();

    for (int i = 0; i < userList->GetCount(); i++) {
        IZoomVideoSDKUser* user = userList->GetItem(i);

        // Skip self (handled separately)
        if (user == myself) continue;

        // Check if video is actually on
        ZoomVideoSDKVideoStatus status = user->GetVideoPipe()->getVideoStatus();
        if (status.isOn) {
            // NOW it's safe to subscribe
            SubscribeToUser(user);
        } else {
            // Video turned off - unsubscribe
            UnsubscribeFromUser(user);
        }
    }
}
```

---

## Complete Working Code

### VideoCanvasManager.h

```cpp
#pragma once
#include <windows.h>
#include <map>
#include <vector>
#include "zoom_video_sdk_interface.h"

USING_ZOOM_VIDEO_SDK_NAMESPACE

class VideoCanvasManager {
public:
    VideoCanvasManager(HWND parentWindow, IZoomVideoSDK* sdk);
    ~VideoCanvasManager();

    // Subscribe to self video
    void SubscribeToSelf();

    // Subscribe/unsubscribe to remote user
    void SubscribeToUser(IZoomVideoSDKUser* user);
    void UnsubscribeFromUser(IZoomVideoSDKUser* user);

    // Cleanup
    void UnsubscribeAll();

    // Layout
    void UpdateLayout();

private:
    HWND CreateVideoWindow();
    void DestroyVideoWindow(HWND hwnd);

    IZoomVideoSDK* m_sdk;
    HWND m_parentWindow;

    // Self video
    HWND m_selfVideoWindow;
    IZoomVideoSDKCanvas* m_selfCanvas;

    // Remote users: user -> window mapping
    std::map<IZoomVideoSDKUser*, HWND> m_userWindows;
    std::map<IZoomVideoSDKUser*, IZoomVideoSDKCanvas*> m_userCanvases;
};
```

### VideoCanvasManager.cpp

```cpp
#include "VideoCanvasManager.h"
#include <iostream>

VideoCanvasManager::VideoCanvasManager(HWND parentWindow, IZoomVideoSDK* sdk)
    : m_parentWindow(parentWindow)
    , m_sdk(sdk)
    , m_selfVideoWindow(nullptr)
    , m_selfCanvas(nullptr) {
}

VideoCanvasManager::~VideoCanvasManager() {
    UnsubscribeAll();
}

HWND VideoCanvasManager::CreateVideoWindow() {
    // Create a child window for video rendering
    HWND hwnd = CreateWindowExW(
        0,
        L"STATIC",  // Simple static window class
        L"",
        WS_CHILD | WS_VISIBLE | WS_BORDER,
        0, 0, 320, 240,  // Size will be set by UpdateLayout()
        m_parentWindow,
        nullptr,
        GetModuleHandle(nullptr),
        nullptr
    );

    return hwnd;
}

void VideoCanvasManager::DestroyVideoWindow(HWND hwnd) {
    if (hwnd) {
        DestroyWindow(hwnd);
    }
}

void VideoCanvasManager::SubscribeToSelf() {
    IZoomVideoSDKSession* session = m_sdk->getSessionInfo();
    if (!session) return;

    IZoomVideoSDKUser* myself = session->getMyself();
    if (!myself) return;

    // Create window for self video
    if (!m_selfVideoWindow) {
        m_selfVideoWindow = CreateVideoWindow();
    }

    // Subscribe
    m_selfCanvas = myself->GetVideoCanvas();
    if (m_selfCanvas) {
        ZoomVideoSDKErrors err = m_selfCanvas->subscribeWithView(
            m_selfVideoWindow,
            ZoomVideoSDKVideoAspect_PanAndScan,
            ZoomVideoSDKResolution_Auto
        );

        if (err == ZoomVideoSDKErrors_Success) {
            std::cout << "Self video subscribed" << std::endl;
        } else {
            std::cout << "Self video subscribe failed: " << err << std::endl;
        }
    }

    UpdateLayout();
}

void VideoCanvasManager::SubscribeToUser(IZoomVideoSDKUser* user) {
    if (!user) return;

    // Skip if already subscribed
    if (m_userWindows.f
```