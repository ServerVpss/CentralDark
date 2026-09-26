# PADRAO - session-join-pattern.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\session-join-pattern.md
**SHA:** 86b4e00f5d0c591b
**Timestamp:** 2026-08-26T18:42:50.392732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Session Join Pattern

Complete working code for initializing the SDK and joining a session.

## Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  InitSDK    │───►│  AddListener│───►│ JoinSession │───►│ onSessionJoin│
│             │    │  (delegate) │    │  (JWT)      │    │  callback   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Complete Working Code

### main.cpp

```cpp
#include <windows.h>
#include <cstdint>
#include <iostream>
#include <fstream>
#include <string>
#include <thread>
#include <chrono>

// SDK headers
#include "zoom_video_sdk_api.h"
#include "zoom_video_sdk_interface.h"
#include "zoom_video_sdk_delegate_interface.h"

// JSON parsing (optional - for config file)
#include <json/json.h>

USING_ZOOM_VIDEO_SDK_NAMESPACE

// Global state
IZoomVideoSDK* g_sdk = nullptr;
bool g_inSession = false;
bool g_exit = false;

// Configuration
std::wstring g_jwt;
std::wstring g_sessionName;
std::wstring g_sessionPassword;
std::wstring g_userName;

//─────────────────────────────────────────────────────────────────────────────
// DELEGATE IMPLEMENTATION
//─────────────────────────────────────────────────────────────────────────────

class MyDelegate : public IZoomVideoSDKDelegate {
public:
    // === SESSION LIFECYCLE ===

    void onSessionJoin() override {
        std::cout << "[EVENT] Session joined successfully!" << std::endl;
        g_inSession = true;

        // Connect audio
        IZoomVideoSDKAudioHelper* audioHelper = g_sdk->getAudioHelper();
        if (audioHelper) {
            audioHelper->startAudio();
            std::cout << "[ACTION] Audio connected" << std::endl;
        }

        // Start video
        IZoomVideoSDKVideoHelper* videoHelper = g_sdk->getVideoHelper();
        if (videoHelper) {
            videoHelper->startVideo();
            std::cout << "[ACTION] Video started" << std::endl;
        }
    }

    void onSessionLeave() override {
        std::cout << "[EVENT] Session left" << std::endl;
        g_inSession = false;
        g_exit = true;
    }

    void onError(ZoomVideoSDKErrors errorCode, int detailErrorCode) override {
        std::cout << "[ERROR] Code: " << errorCode
                  << ", Detail: " << detailErrorCode << std::endl;
    }

    // === USER EVENTS ===

    void onUserJoin(IZoomVideoSDKUserHelper* helper,
                    IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        for (int i = 0; i < userList->GetCount(); i++) {
            IZoomVideoSDKUser* user = userList->GetItem(i);
            std::wcout << L"[EVENT] User joined: " << user->getUserName() << std::endl;
        }
    }

    void onUserLeave(IZoomVideoSDKUserHelper* helper,
                     IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        for (int i = 0; i < userList->GetCount(); i++) {
            IZoomVideoSDKUser* user = userList->GetItem(i);
            std::wcout << L"[EVENT] User left: " << user->getUserName() << std::endl;
        }
    }

    void onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        for (int i = 0; i < userList->GetCount(); i++) {
            IZoomVideoSDKUser* user = userList->GetItem(i);
            bool isOn = user->GetVideoPipe()->getVideoStatus().isOn;
            std::wcout << L"[EVENT] Video " << (isOn ? L"ON" : L"OFF")
                       << L": " << user->getUserName() << std::endl;
        }
    }

    void onUserAudioStatusChanged(IZoomVideoSDKAudioHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        for (int i = 0; i < userList->GetCount(); i++) {
            IZoomVideoSDKUser* user = userList->GetItem(i);
            bool isMuted = user->getAudioStatus().isMuted;
            std::wcout << L"[EVENT] Audio " << (isMuted ? L"muted" : L"unmuted")
                       << L": " << user->getUserName() << std::endl;
        }
    }

    // === CHAT ===

    void onChatNewMessageNotify(IZoomVideoSDKChatHelper* helper,
                                IZoomVideoSDKChatMessage* msg) override {
        std::wcout << L"[CHAT] " << msg->getSendUser()->getUserName()
                   << L": " << msg->getContent() << std::endl;
    }

    // === REQUIRED EMPTY IMPLEMENTATIONS ===
    // (All pure virtual methods must be implemented)

    void onSessionLeave(ZoomVideoSDKSessionLeaveReason reason) override {}
    void onSessionNeedPassword(IZoomVideoSDKPasswordHandler* handler) override {}
    void onSessionPasswordWrong(IZoomVideoSDKPasswordHandler* handler) override {}
    void onUserHostChanged(IZoomVideoSDKUserHelper* helper, IZoomVideoSDKUser* user) override {}
    void onUserManagerChanged(IZoomVideoSDKUser* user) override {}
    void onUserNameChanged(IZoomVideoSDKUser* user) override {}
    void onUserActiveAudioChanged(IZoomVideoSDKAudioHelper* helper, IVideoSDKVect
```

---

# PADRAO - session-join-pattern.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\linux\examples\session-join-pattern.md
**SHA:** d54960231720e187
**Timestamp:** 2026-08-26T18:42:57.611463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class BotDelegate : public IZoomVideoSDKDelegate {
- void BotDelegate::onSessionJoin() {
- void BotDelegate::onSessionLeave() {
- void BotDelegate::onError(ZoomVideoSDKErrors errorCode, int detailErrorCode) {
- void BotDelegate::onUserJoin(IZoomVideoSDKUserHelper* pUserHelper,
- void BotDelegate::onUserLeave(IZoomVideoSDKUserHelper* pUserHelper,
- void BotDelegate::onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* pVideoHelper,
- void BotDelegate::onUserAudioStatusChanged(IZoomVideoSDKAudioHelper* pAudioHelper,
- void BotDelegate::onSessionNeedPassword(IZoomVideoSDKPasswordHandler* handler) {
- void BotDelegate::onSessionPasswordWrong(IZoomVideoSDKPasswordHandler* handler) {

### Ouro Bruto (primeiros 5000 chars)
```
# Session Join Pattern - Complete Working Example

## Overview

This guide provides a complete, working example of joining a Zoom Video SDK session on Linux, including JWT generation, session configuration, event handling, and cleanup.

## Prerequisites

```bash
# System dependencies
sudo apt update
sudo apt install -y build-essential gcc cmake libglib2.0-dev liblzma-dev \
    libxcb-image0 libxcb-keysyms1 libxcb-xfixes0 libxcb-xkb1 libxcb-shape0 \
    libxcb-shm0 libxcb-randr0 libxcb-xtest0 libgbm1 libxtst6 libgl1 libnss3 \
    libasound2 libpulse0

# For headless Linux
sudo apt install -y pulseaudio
mkdir -p ~/.config
echo "[General]" > ~/.config/zoomus.conf
echo "system.audio.type=default" >> ~/.config/zoomus.conf

# Create log directory
mkdir -p ~/.zoom/logs
```

## JWT Token Generation

**CRITICAL**: You need a JWT token to join sessions. Generate from your SDK credentials.

### Using Python

```python
import jwt
import time

def generate_video_sdk_jwt(sdk_key, sdk_secret, session_name, role_type=1, session_key="", user_identity=""):
    iat = int(time.time()) - 30
    exp = iat + 60 * 60 * 2  # 2 hours

    payload = {
        "app_key": sdk_key,
        "iat": iat,
        "exp": exp,
        "tpc": session_name,
        "role_type": role_type,  # 0=participant, 1=host
    }

    if session_key:
        payload["session_key"] = session_key
    if user_identity:
        payload["user_identity"] = user_identity

    token = jwt.encode(payload, sdk_secret, algorithm="HS256")
    return token

# Usage
SDK_KEY = "YOUR_SDK_KEY"
SDK_SECRET = "YOUR_SDK_SECRET"
SESSION_NAME = "my-test-session"

jwt_token = generate_video_sdk_jwt(SDK_KEY, SDK_SECRET, SESSION_NAME, role_type=1)
print(f"JWT Token: {jwt_token}")
```

### Using Node.js

```javascript
const jwt = require('jsonwebtoken');

function generateVideoSDKJWT(sdkKey, sdkSecret, sessionName, roleType = 1) {
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 hours

    const payload = {
        app_key: sdkKey,
        iat: iat,
        exp: exp,
        tpc: sessionName,
        role_type: roleType // 0=participant, 1=host
    };

    return jwt.sign(payload, sdkSecret);
}

const SDK_KEY = "YOUR_SDK_KEY";
const SDK_SECRET = "YOUR_SDK_SECRET";
const SESSION_NAME = "my-test-session";

const jwtToken = generateVideoSDKJWT(SDK_KEY, SDK_SECRET, SESSION_NAME, 1);
console.log(`JWT Token: ${jwtToken}`);
```

## Complete C++ Implementation

### Header File: BotDelegate.h

```cpp
#ifndef BOT_DELEGATE_H
#define BOT_DELEGATE_H

#include "zoom_video_sdk_api.h"
#include "zoom_video_sdk_interface.h"
#include "zoom_video_sdk_delegate_interface.h"
#include <stdio.h>
#include <atomic>

USING_ZOOM_VIDEO_SDK_NAMESPACE

class BotDelegate : public IZoomVideoSDKDelegate {
public:
    BotDelegate() : running_(true) {}

    bool isRunning() const { return running_; }
    void stop() { running_ = false; }

    // Session events
    virtual void onSessionJoin() override;
    virtual void onSessionLeave() override;
    virtual void onError(ZoomVideoSDKErrors errorCode, int detailErrorCode) override;

    // User events
    virtual void onUserJoin(IZoomVideoSDKUserHelper* pUserHelper,
                           IVideoSDKVector<IZoomVideoSDKUser*>* userList) override;
    virtual void onUserLeave(IZoomVideoSDKUserHelper* pUserHelper,
                            IVideoSDKVector<IZoomVideoSDKUser*>* userList) override;
    virtual void onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* pVideoHelper,
                                         IVideoSDKVector<IZoomVideoSDKUser*>* userList) override;
    virtual void onUserAudioStatusChanged(IZoomVideoSDKAudioHelper* pAudioHelper,
                                         IVideoSDKVector<IZoomVideoSDKUser*>* userList) override;

    // Password events
    virtual void onSessionNeedPassword(IZoomVideoSDKPasswordHandler* handler) override;
    virtual void onSessionPasswordWrong(IZoomVideoSDKPasswordHandler* handler) override;

    // Host/manager events
    virtual void onUserHostChanged(IZoomVideoSDKUserHelper* pUserHelper,
                                  IZoomVideoSDKUser* pUser) override;
    virtual void onUserManagerChanged(IZoomVideoSDKUser* pUser) override;
    virtual void onUserNameChanged(IZoomVideoSDKUser* pUser) override;

    // Audio raw data (optional)
    virtual void onMixedAudioRawDataReceived(AudioRawData* data_) override;
    virtual void onOneWayAudioRawDataReceived(AudioRawData* data_,
                                             IZoomVideoSDKUser* pUser) override;

    // Minimal stubs for required callbacks
    virtual void onUserShareStatusChanged(IZoomVideoSDKShareHelper*, IZoomVideoSDKUser*,
                                         IZoomVideoSDKShareAction*) override {}
    virtual void onLiveStreamStatusChanged(IZoomVideoSDKLiveStreamHelper*,
                                          ZoomVideoSDKLiveStreamStatus) override {}
    virtual void onCloudRecordingStatus(RecordingSta
```