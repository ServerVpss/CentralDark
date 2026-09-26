# COMANDO - meeting-sdk-bot.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\linux\meeting-sdk-bot.md
**SHA:** 668a708c3a12d3e7
**Timestamp:** 2026-08-26T18:42:53.293478
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- IZoomSDKAudioRawDataDelegate* audioDelegate = new MyAudioDelegate();
- IZoomSDKVideoRawDataDelegate* videoDelegate = new MyVideoDelegate();

### Gaps
- // TODO: Call REST API to get fresh OBF token

### Ouro Bruto (primeiros 5000 chars)
```
# Meeting SDK Bot (Linux)

Build resilient meeting bots that join Zoom meetings as visible participants using the Meeting SDK.

## Overview

Meeting SDK bots join as real participants (visible in participant list) and can access raw audio/video data for recording, transcription, or AI processing.

**Use this approach when:**
- You need to be visible in the participant list
- You want to interact with meeting features (chat, reactions, etc.)
- You need local recording control
- You're processing your own meetings or have user consent

**Alternative:** See [rtms/examples/rtms-bot.md](../../rtms/examples/rtms-bot.md) for invisible, read-only access via RTMS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEETING SDK BOT FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 1. Pre-Join: REST API                                               │
│    └── Get meeting schedule (number, password, start time)          │
│    └── Get OBF token for user (bot joins "on behalf of" user)       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Join with Retry (OBF requires owner present)                     │
│    └── Retry with configurable interval until owner joins           │
│    └── Circuit breaker: Stop after N attempts                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Start Raw Recording (Meeting SDK singleton)                      │
│    └── IMeetingRecordingController::StartRawRecording()             │
│    └── Subscribe to raw audio/video                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Process Media Streams                                            │
│    └── Audio: PCM data via IZoomSDKAudioRawDataDelegate             │
│    └── Video: YUV420 frames via IZoomSDKVideoRawDataDelegate        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Mid-Meeting: Connection Monitoring                               │
│    └── Detect disconnections → Exponential backoff retry            │
│    └── Stop after N reconnection attempts                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Skills Required

| Skill | Purpose |
|-------|---------|
| **zoom-rest-api** | Get meeting schedule, retrieve OBF token |
| **zoom-meeting-sdk** (Linux) | Join meeting, control recording, access raw media |

## Choose the Recording Mode

| Goal | Primary path | Skills |
|------|--------------|--------|
| Bot writes its own audio/video files | `StartRawRecording()` + raw audio/video delegates | `zoom-meeting-sdk` (Linux) |
| Zoom-hosted MP4/M4A/transcript assets after meeting end | Meeting/account cloud recording settings + `recording.completed` webhook + recordings download API | `zoom-rest-api` + `zoom-webhooks` |

Use raw recording when the bot must process or persist media itself. Use the cloud-recording path when the requirement is post-meeting retrieval of Zoom-managed recording assets.

## Automatic Join + Recording Flow

```text
zoom-rest-api
  -> get meeting metadata
  -> get OBF or ZAK token
Meeting SDK Linux bot
  -> join with retry
  -> CanStartRawRecording()
  -> StartRawRecording()
  -> subscribe raw audio/video
  -> write PCM/YUV or forward to AI pipeline
Optional post-meeting cloud path
  -> zoom-webhooks recording.completed
  -> zoom-rest-api recordings download
```

## Prerequisites

- Zoom Meeting SDK v5.15+ (Linux)
- Meeting SDK JWT credentials (SDK Key + Secret)
- Server-to-Server OAuth app or OAuth app for REST API access
- REST API scopes: `meeting:read`, `user:read`, optionally `meeting:write` if triggering meetings
- Raw Data entitlement enabled (Admin → Account Settings → Meeting → "Allow access to raw data")

## Configuration

### Retry Parameters (Customizable)

```cpp
// config.h or environment variables
struct BotConfig {
    // Join retry (waiting for owner to be present)
    int join_retry_attempts = 5;          // Max join attempts (default: 5)
    int join_retry_interval_ms = 60000;   // Constant interval: 60s (default: 1min)

    // Mid-meeting reconnection (network failures)
    int reconnect_max_attempts = 3;       // Max reconnection attempts (default: 3)
    int recon
```