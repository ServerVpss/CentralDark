# COMANDO - high-level-scenarios.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\linux\concepts\high-level-scenarios.md
**SHA:** 13c96d3cf3e0632d
**Timestamp:** 2026-08-26T18:42:50.287765
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class TranscriptionAudioDelegate : public IZoomSDKAudioRawDataDelegate {
- class VideoRecorderDelegate : public IZoomSDKRendererDelegate {
- class AudioRecorderDelegate : public IZoomSDKAudioRawDataDelegate {
- class AIAssistantAudioDelegate : public IZoomSDKAudioRawDataDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# High-Level Scenarios for Meeting SDK Linux

This guide covers common bot architectures and patterns that remain stable across SDK versions, with flexible approaches to handle API changes.

## Scenario 1: Transcription Bot

**Goal**: Join meetings to transcribe conversations in real-time.

### Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Meeting   │───►│  Meeting SDK │───►│  Audio Stream   │───►│ Transcription│
│   Starts    │    │  Join + Auth │    │  (PCM 32kHz)    │    │   Service    │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────────┘
                           │                      │                     │
                           ▼                      ▼                     ▼
                   ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
                   │ StartRaw     │    │ onMixedAudio    │    │  Store       │
                   │ Recording    │    │ RawDataReceived │    │  Transcript  │
                   └──────────────┘    └─────────────────┘    └──────────────┘
```

### Core Pattern (Version-Flexible)

```cpp
// STEP 1: Initialize (stable across versions)
InitParam init_params;
init_params.strWebDomain = "https://zoom.us";
init_params.enableLogByDefault = true;
init_params.rawdataOpts.audioRawDataMemoryMode = ZoomSDKRawDataMemoryModeHeap;
InitSDK(init_params);

// STEP 2: Authenticate (JWT token - stable)
AuthContext auth_ctx;
auth_ctx.jwt_token = getJWTToken();  // Generate from SDK credentials
CreateAuthService(&auth_service);
auth_service->SDKAuth(auth_ctx);

// STEP 3: Join meeting (flexible - check SDK version for exact field names)
JoinParam join_param;
join_param.userType = SDK_UT_WITHOUT_LOGIN;
auto& params = join_param.param.withoutloginuserJoin;
params.meetingNumber = meeting_number;
params.userName = "Transcription Bot";
params.psw = meeting_password;

// Version-flexible: Check if these fields exist in your SDK version
// params.app_privilege_token = obf_token;  // v5.15+
// params.onBehalfToken = obf_token;        // Some versions
// params.userZAK = zak_token;              // Alternative

meeting_service->Join(join_param);

// STEP 4: In onMeetingStatusChanged callback
if (status == MEETING_STATUS_INMEETING) {
    // Get recording controller (pattern stable)
    auto* record_ctrl = meeting_service->GetMeetingRecordingController();

    // Start raw recording (enables raw data access)
    if (record_ctrl->CanStartRawRecording() == SDKERR_SUCCESS) {
        record_ctrl->StartRawRecording();
    }

    // Subscribe to audio
    auto* audio_helper = GetAudioRawdataHelper();
    audio_helper->subscribe(new TranscriptionAudioDelegate());
}

// STEP 5: Process audio
class TranscriptionAudioDelegate : public IZoomSDKAudioRawDataDelegate {
    void onMixedAudioRawDataReceived(AudioRawData* data) override {
        // Send PCM data to transcription service
        sendToTranscriptionAPI(data->GetBuffer(), data->GetBufferLen());
    }
};
```

### Version Handling Strategy

**Flexible field access**:
```cpp
// Define a macro to check field existence at compile time
#ifdef HAS_APP_PRIVILEGE_TOKEN
    params.app_privilege_token = token;
#elif defined(HAS_ON_BEHALF_TOKEN)
    params.onBehalfToken = token;
#else
    params.userZAK = token;
#endif
```

**Runtime capability detection**:
```cpp
SDKError canRecord = record_ctrl->CanStartRawRecording();
if (canRecord != SDKERR_SUCCESS) {
    // Fallback: Try local recording
    if (record_ctrl->CanStartRecording(true) == SDKERR_SUCCESS) {
        record_ctrl->StartRecording(time, path);
    }
}
```

### Key Resilience Patterns

1. **Always check CanXXX() before calling XXX()**
2. **Have fallback authentication methods** (OBF → ZAK → password-only)
3. **Detect capabilities**, don't assume
4. **Use error codes** to adapt behavior

---

## Scenario 2: Recording Bot (Video + Audio)

**Goal**: Record meetings with synchronized audio and video.

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│ Join Meeting │───►│ StartRawRecording│───►│ Subscribe    │
│              │    │                  │    │ Audio+Video  │
└──────────────┘    └─────────────────┘    └──────────────┘
                                                    │
                         ┌──────────────────────────┴─────────────────┐
                         ▼                                            ▼
                  ┌──────────────┐                           ┌──────────────┐
                  │ Write YUV420 │                           │ Write PCM    │
                  │ video.yuv    │                           │ audio.pcm    │
                  └──────────────┘                           └──────────────┘
                         │                                            │
                         └──────────────────────────────────────────┬─┘
                                                                     ▼
                                       
```