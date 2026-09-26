# COMANDO - transcription-bot-linux.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\transcription-bot-linux.md
**SHA:** 596f9c9e2398937a
**Timestamp:** 2026-08-26T18:42:56.966673
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyAuthDelegate : public IAuthServiceEvent {
- class MyMeetingDelegate : public IMeetingServiceEvent {
- class TranscriptionAudioDelegate : public IZoomSDKAudioRawDataDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Transcription Bot (Linux)

Build a production-ready transcription bot using Meeting SDK for Linux to automatically transcribe Zoom meetings.

## Overview

A transcription bot joins Zoom meetings as a visible participant, captures raw audio, and streams it to a transcription service (AssemblyAI, Whisper, etc.) for real-time or post-meeting transcription.

## Skills Needed

- **[meeting-sdk/linux](../../meeting-sdk/linux/SKILL.md)** - Primary (headless meeting bot)
- **[zoom-rest-api](../../rest-api/SKILL.md)** - Get meeting details, OBF tokens
- **[zoom-oauth](../../oauth/SKILL.md)** - JWT token generation for SDK auth

## Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Meeting     │───▶│ Meeting SDK Bot │───▶│  Raw Audio       │───▶│ Transcription│
│  Started     │    │ (Linux/Docker)  │    │  Stream (PCM)    │    │  Service     │
│              │    │                 │    │  32kHz, 16-bit   │    │ (AssemblyAI) │
└──────────────┘    └─────────────────┘    └──────────────────┘    └──────────────┘
                            │                        │                       │
                            ▼                        ▼                       ▼
                    ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
                    │ 1. Get OBF Token│    │ 2. StartRaw      │    │ 3. Store     │
                    │    (REST API)   │    │    Recording     │    │    Transcript│
                    └─────────────────┘    └──────────────────┘    └──────────────┘
```

## Implementation Steps

### Step 1: Generate JWT & OBF Tokens

**JWT Token** (SDK authentication):
```bash
# Using zoom-oauth skill
curl -X POST https://your-auth-service.com/generate-jwt \
  -d '{"client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"}'
```

**OBF Token** (join external meetings):
```bash
# Via REST API
curl -X POST "https://api.zoom.us/v2/users/{userId}/token?type=obf&ttl=7200" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

See: [zoom-oauth](../../oauth/SKILL.md), [bot-authentication](../../meeting-sdk/references/bot-authentication.md)

### Step 2: Initialize Meeting SDK

**Full implementation**: [meeting-sdk/linux](../../meeting-sdk/linux/linux.md)

```cpp
#include "zoom_sdk.h"
#include <glib.h>

USING_ZOOM_SDK_NAMESPACE

// Initialize SDK
InitParam init_params;
init_params.strWebDomain = "https://zoom.us";
init_params.enableLogByDefault = true;
init_params.rawdataOpts.audioRawDataMemoryMode = ZoomSDKRawDataMemoryModeHeap;

SDKError err = InitSDK(init_params);
if (err != SDKERR_SUCCESS) {
    std::cerr << "InitSDK failed: " << err << std::endl;
    return 1;
}

// Authenticate SDK with JWT
AuthContext auth_ctx;
auth_ctx.jwt_token = [REDIGIDO-PRESERVACAO];

IAuthService* auth_service;
CreateAuthService(&auth_service);
auth_service->SetEvent(new MyAuthDelegate());
auth_service->SDKAuth(auth_ctx);
```

### Step 3: Join Meeting

```cpp
// In onAuthenticationReturn callback
class MyAuthDelegate : public IAuthServiceEvent {
    void onAuthenticationReturn(AuthResult ret) override {
        if (ret == AUTHRET_SUCCESS) {
            JoinParam join_param;
            join_param.userType = SDK_UT_WITHOUT_LOGIN;

            auto& params = join_param.param.withoutloginuserJoin;
            params.meetingNumber = 1234567890;
            params.userName = "Transcription Bot";
            params.psw = meeting_password;
            params.isVideoOff = true;   // Bot doesn't need video
            params.isAudioOff = false;  // Need audio for transcription
            params.app_privilege_token = obf_token;  // From Step 1

            meeting_service->Join(join_param);
        }
    }
};
```

### Step 4: Start Raw Recording & Subscribe to Audio

```cpp
class MyMeetingDelegate : public IMeetingServiceEvent {
    void onMeetingStatusChanged(MeetingStatus status, int iResult) override {
        if (status == MEETING_STATUS_INMEETING) {
            std::cout << "[BOT] Joined meeting successfully" << std::endl;

            // Get recording controller
            auto* record_ctrl = meeting_service->GetMeetingRecordingController();

            // Check permission
            SDKError can_record = record_ctrl->CanStartRawRecording();
            if (can_record != SDKERR_SUCCESS) {
                std::cerr << "[ERROR] Cannot start raw recording: " << can_record << std::endl;
                std::cerr << "Need: host/co-host OR recording token" << std::endl;
                return;
            }

            // Start raw recording (enables raw data access)
            SDKError err = record_ctrl->StartRawRecording();
            if (err != SDKERR_SUCCESS) {
                std::cerr << "[ERROR] StartRawRecording failed: " << err << std::endl;
                return;
            }

            std::cout << "[BOT] Raw recording started, subscribing to audio..." << std::endl;

            // Subscribe to audio
            auto* audio_helper = GetAudioRawda
```