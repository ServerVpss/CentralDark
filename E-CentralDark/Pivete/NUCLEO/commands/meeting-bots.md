# COMANDO - meeting-bots.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\meeting-bots.md
**SHA:** e8140a25b98e7428
**Timestamp:** 2026-08-26T18:42:51.109298
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class AudioRawDataDelegate : public IZoomSDKAudioRawDataDelegate {
- class VideoRawDataDelegate : public IZoomSDKRendererDelegate {
- class MeetingParticipantsDelegate : public IMeetingParticipantsCtrlEvent {

### Ouro Bruto (primeiros 5000 chars)
```
# Meeting Bots

Build bots that join Zoom meetings for AI, transcription, and automation.

## Overview

Meeting bots are headless applications that join Zoom meetings as participants to perform tasks like recording, transcription, real-time AI processing, or automated interactions.

## Skills Needed

- **meeting-sdk/linux** - Visible bot join flow, raw recording, and raw media access
- **zoom-rest-api** - Meeting lookup plus OBF/ZAK retrieval, optional cloud-recording settings
- **zoom-webhooks** - Optional if you want Zoom-managed cloud recording download after the meeting
- **zoom-rtms** - Alternative when you need invisible media access instead of a visible participant bot

## Architecture

```
Meeting Bot Architecture:
┌─────────────────┐     ┌─────────────────┐
│   Zoom Meeting  │────▶│  Bot (Linux)    │
│                 │     │  - Meeting SDK  │
│                 │◀────│  - Raw audio    │
└─────────────────┘     │  - Raw video    │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  AI Pipeline    │
                        │  - Transcription│
                        │  - Analysis     │
                        └─────────────────┘
```

## Platform

| Platform | Recommended |
|----------|-------------|
| Linux | Yes - headless, server-side |
| Windows | Possible but not typical |
| macOS | Possible but not typical |

## Key Features

- Join meetings programmatically
- Access raw audio/video data
- Start and stop raw recording explicitly
- Real-time transcription
- AI processing (sentiment, summarization)

## Automatic Join + Recording Pattern

Use this chain when the user asks for a bot that automatically joins and records a meeting:

```text
zoom-rest-api
  -> fetch meeting metadata
  -> mint OBF/ZAK token
meeting-sdk/linux
  -> join as visible participant
  -> StartRawRecording()
  -> subscribe audio/video delegates
  -> write PCM/YUV or send to downstream pipeline
optional zoom-webhooks + zoom-rest-api
  -> receive recording.completed
  -> download Zoom-managed cloud recording assets
```

### Raw Recording Control

```cpp
void onMeetingStatusChanged(MeetingStatus status, int iResult) {
    if (status != MEETING_STATUS_INMEETING) return;

    auto* recordCtrl = m_meetingService->GetMeetingRecordingController();
    if (!recordCtrl) {
        throw std::runtime_error("recording_controller_unavailable");
    }

    if (recordCtrl->CanStartRawRecording() != SDKERR_SUCCESS) {
        throw std::runtime_error("raw_recording_not_permitted");
    }

    SDKError err = recordCtrl->StartRawRecording();
    if (err != SDKERR_SUCCESS) {
        throw std::runtime_error("start_raw_recording_failed");
    }

    GetAudioRawdataHelper()->subscribe(new AudioRawDataDelegate(), true);

    IZoomSDKRenderer* renderer = nullptr;
    createRenderer(&renderer, new VideoRawDataDelegate());
    renderer->setRawDataResolution(ZoomSDKResolution_720P);
    renderer->subscribe(activeSpeakerUserId, RAW_DATA_TYPE_VIDEO);
}
```

### Choose the Right Recording Output

| Requirement | Correct path |
|-------------|--------------|
| Bot-owned audio/video files or real-time AI processing | Meeting SDK Linux raw recording |
| Zoom-hosted MP4/M4A/transcript files after meeting end | Cloud recording settings + webhooks + recordings REST API |

`StartRawRecording()` enables raw media flow. It does not create a finished MP4 by itself. You still need to persist PCM/YUV or post-process it with your own pipeline.

## Bot Implementation Patterns

### 1. Bot Authentication Flow

```cpp
// Step 1: Generate JWT for SDK authentication
void generateJWT(const string& key, const string& secret) {
    auto iat = chrono::system_clock::now();
    auto exp = iat + chrono::hours{24};

    m_jwt = jwt::create()
        .set_type("JWT")
        .set_issued_at(iat)
        .set_expires_at(exp)
        .set_payload_claim("appKey", claim(key))
        .set_payload_claim("tokenExp", claim(exp))
        .sign(algorithm::hs256{secret});
}

// Step 2: Authenticate SDK
AuthContext ctx;
ctx.jwt_token = m_jwt;
m_authService->SDKAuth(ctx);
// Wait for onAuthenticationReturn callback
```

### 2. Joining a Meeting as a Bot

```cpp
JoinParam joinParam;
joinParam.userType = SDK_UT_WITHOUT_LOGIN;
JoinParam4WithoutLogin& param = joinParam.param.withoutloginuserJoin;
param.meetingNumber = meetingNumber;
param.userName = "My Transcription Bot";  // Display name
param.psw = password;
param.isVideoOff = true;   // Bots typically don't need video
param.isAudioOff = false;  // Need audio for transcription

// For own meetings: Use ZAK token
param.userZAK = zakToken;

// For external meetings (after Feb 2026): Use OBF token
param.onBehalfToken = obfToken;

err = m_meetingService->Join(joinParam);
```

**Token Requirements:**

| Meeting Type | Required Tokens |
|--------------|-----------------|
| Your own meetings | JWT + ZAK |
| External meetings (before Feb 2026) | JWT only |
| Exte
```