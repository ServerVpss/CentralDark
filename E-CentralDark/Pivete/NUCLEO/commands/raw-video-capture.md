# COMANDO - raw-video-capture.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\raw-video-capture.md
**SHA:** 2ffca148cf8ea6e8
**Timestamp:** 2026-08-26T18:42:53.123542
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- SDKError canStart = recordingCtrl->CanStartRecording(false, 0);

### Contratos
- class ZoomSDKRendererDelegate : public IZoomSDKRendererDelegate {
- ZoomSDKRendererDelegate::ZoomSDKRendererDelegate() : frameCount(0) {
- ZoomSDKRendererDelegate::~ZoomSDKRendererDelegate() {
- void ZoomSDKRendererDelegate::onRawDataFrameReceived(YUVRawDataI420* data) {
- void ZoomSDKRendererDelegate::onRawDataStatusChanged(RawDataStatus status) {
- void ZoomSDKRendererDelegate::onRendererBeDestroyed() {
- void ZoomSDKRendererDelegate::SaveToRawYUVFile(YUVRawDataI420* data) {
- ZoomSDKRendererDelegate* videoDelegate = new ZoomSDKRendererDelegate();
- videoDelegate = nullptr;
- class ZoomAudioRawDataDelegate : public IZoomSDKAudioRawDataDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Raw Video Capture Example

## Overview

This guide shows how to capture raw video data from Zoom meetings using the Windows Meeting SDK. Raw video data is provided in **YUV420 (I420) format** for video and **PCM format** for audio.

---

## Raw Recording vs Raw Streaming

There are **two ways** to access raw data in the Zoom SDK:

| Method | Permission Source | How to Get Permission | Use Case |
|--------|-------------------|----------------------|----------|
| **Raw Recording** | Local recording permission | Host/co-host OR request from host | Capture data with "recording" consent dialog |
| **Raw Streaming** | Live streaming permission | Must be licensed Pro/Business/Education/Enterprise | Capture data with "streaming" consent dialog |

**Key differences**:
- **Raw Recording**: Disables local recording (`.mp4`) for the SDK user. Host can still cloud record.
- **Raw Streaming**: Other participants see "live streaming" notification instead of "recording".
- Both give you the same raw data access (YUV420 video, PCM audio).

**SDK Version Requirements**:
- Raw recording: SDK 5.9.0+
- Raw streaming by host: SDK 5.11.0+
- Raw streaming by non-host: SDK 5.12.8+
- Request local recording permission: SDK 5.13.5+

---

## Permission Requirements

### For Raw Recording

The meeting must have **local recording enabled**, AND you must meet **one** of:
- You are the meeting host or co-host
- You have been granted local recording permission by the host
- You joined with an OAuth app privilege token (see below)

### For Raw Streaming

You must meet **all** of:
- Current user has raw live streaming permission
- Meeting host has a Pro, Business, Education, or Enterprise account
- Meeting host is licensed for live streaming

### OAuth App Privilege Token (Advanced)

You can skip the "request permission from host" step by using OAuth tokens:

**For recording**:
1. OAuth app requests `Meeting_token:read:admin:local_recording` (admin) or `Meeting_token:read:local_recording` (user)
2. Call REST API: `GET /meetings/{meetingId}/jointoken/local_recording`
3. Pass token to SDK via `app_privilege_token` join parameter

**For streaming**:
1. OAuth app requests `Meeting_token:read:admin:live_streaming` (admin) or `Meeting_token:read:live_streaming` (user)
2. Call REST API: `GET /meetings/{meetingId}/jointoken/live_streaming`
3. Pass token to SDK via `app_privilege_token` join parameter

---

## Complete Workflow

### Step 1: Join Meeting Successfully

Before capturing video, you must:
1. ✅ Initialize SDK
2. ✅ Authenticate with JWT token
3. ✅ Join meeting successfully (`MEETING_STATUS_INMEETING`)

See [Authentication Pattern](authentication-pattern.md) for this setup.

---

### Step 2: Start Raw Recording (or Streaming)

**CRITICAL**: You MUST call `StartRawRecording()` before you can capture video data.

```cpp
void OnInMeeting() {
    std::cout << "[VIDEO] In meeting! Starting video capture..." << std::endl;

    // Get recording controller
    IMeetingRecordingController* recordingCtrl =
        meetingService->GetMeetingRecordingController();

    if (!recordingCtrl) {
        std::cerr << "[VIDEO] ERROR: Failed to get recording controller" << std::endl;
        return;
    }

    // Check if we can start recording
    SDKError canStart = recordingCtrl->CanStartRecording(false, 0);
    if (canStart != SDKERR_SUCCESS) {
        std::cerr << "[VIDEO] Cannot start recording: " << canStart << std::endl;
        return;
    }

    // Start raw recording (this enables raw data capture)
    SDKError err = recordingCtrl->StartRawRecording();
    if (err != SDKERR_SUCCESS) {
        std::cerr << "[VIDEO] StartRawRecording failed: " << err << std::endl;
        return;
    }

    std::cout << "[VIDEO] Raw recording started!" << std::endl;

    // Wait a moment for recording to initialize
    std::this_thread::sleep_for(std::chrono::milliseconds(500));

    // Continue to Step 3...
}
```

**Important notes**:
- `StartRawRecording()` does NOT create a recording file on disk
- It only enables raw data capture via SDK callbacks
- You need host/co-host permissions OR special SDK app privileges
- If you get `SDKERR_WRONG_USAGE`, you may lack permissions

**Alternative: Use Raw Streaming instead**:
```cpp
// If you have streaming permission instead of recording permission
IMeetingLiveStreamController* streamCtrl = meetingService->GetMeetingLiveStreamController();

SDKError err = streamCtrl->StartRawLiveStream();
if (err != SDKERR_SUCCESS) {
    std::cerr << "[VIDEO] StartRawLiveStream failed: " << err << std::endl;
    return;
}

std::cout << "[VIDEO] Raw streaming started!" << std::endl;
// Same subscription process applies after this
```

**Requesting permission at runtime**:
```cpp
// If you're not the host, request permission
IMeetingLiveStreamController* streamCtrl = meetingService->GetMeetingLiveStreamController();
streamCtrl->RequestRawLiveStream(L"My AI Bot", L"https://example.com/description");

// Listen for onRawLiveStreamPrivilegeChan
```ZoomVideoSDKRawDataPipe*> m_pipes;

public:
    MyDelegate(IZoomVideoSDK* sdk) : m_sdk(sdk) {}

    ~MyDelegate() {
        // 
```