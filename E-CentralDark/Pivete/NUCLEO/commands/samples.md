# COMANDO - samples.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\references\samples.md
**SHA:** 59a68f992841f2f1
**Timestamp:** 2026-08-26T18:42:50.594640
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- All samples follow this pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Official Sample Applications

Reference guide for Zoom Video SDK Windows sample applications.

**Official Repository**: https://github.com/zoom/videosdk-windows-rawdata-sample

---

## Sample Overview

| Sample | Description | Key Features |
|--------|-------------|--------------|
| **VSDK_SkeletonDemo** | Minimal session join | Simplest starting point |
| **VSDK_getRawVideo** | Capture raw video | YUV420 frame extraction |
| **VSDK_getRawAudio** | Capture raw audio | PCM audio extraction |
| **VSDK_getRawShare** | Capture screen share | Share content capture |
| **VSDK_sendRawVideo** | Send custom video | Virtual camera injection |
| **VSDK_sendRawAudio** | Send custom audio | Virtual microphone injection |
| **VSDK_sendRawShare** | Send custom share | Custom screen share source |
| **VSDK_CloudRecording** | Cloud recording | Start/stop cloud recording |
| **VSDK_CommandChannel** | Custom messaging | Send/receive custom commands |
| **VSDK_CallIn** | PSTN dial-in | Phone dial-in support |
| **VSDK_Callout** | PSTN dial-out | Phone dial-out support |
| **VSDK_ServiceQuality** | Network statistics | Quality monitoring |
| **VSDK_TranscriptionAndTranslation** | Live transcription | Real-time captions |
| **VSDK_MultiStreamVideo** | Multiple video streams | Multi-camera support |
| **VSDK_PreviewCameraAndMicrophone** | Device preview | Pre-join device testing |
| **VSDK_Share2ndCameraAsMultiCam** | Secondary camera | Multi-camera sharing |
| **VSDK_Share2ndCameraAsShareScreenDemo** | Camera as share | Camera content sharing |
| **VSDK_ShareScreenPreprocessorDemo** | Share preprocessing | Custom share processing |
| **VSDK_RTMSDemo** | Real-time messaging | RTMS integration |
| **VSDK_DuilibDemo2** | Full UI demo | Complete GUI application |

---

## Recommended Learning Path

### 1. Start Here: VSDK_SkeletonDemo

Minimal code to join a session. Demonstrates:
- SDK initialization
- JWT authentication
- Session join/leave
- Windows message loop
- Basic delegate implementation

**Key patterns to learn:**
```cpp
// 1. Create SDK
IZoomVideoSDK* sdk = CreateZoomVideoSDKObj();

// 2. Initialize
ZoomVideoSDKInitParams params;
params.domain = L"https://zoom.us";
sdk->initialize(params);

// 3. Add delegate
sdk->addListener(myDelegate);

// 4. Join session
ZoomVideoSDKSessionContext ctx;
ctx.sessionName = L"session";
ctx.token = L"jwt";
ctx.audioOption.connect = false;
sdk->joinSession(ctx);

// 5. Message loop (CRITICAL)
while (running) {
    MSG msg;
    while (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    Sleep(10);
}
```

### 2. Video Capture: VSDK_getRawVideo

Capture raw YUV420 video frames. Demonstrates:
- `IZoomVideoSDKRawDataPipeDelegate` implementation
- `onRawDataFrameReceived()` callback
- YUV buffer extraction (Y, U, V planes)
- Resolution and rotation handling

**Key patterns:**
```cpp
class VideoCapture : public IZoomVideoSDKRawDataPipeDelegate {
    void onRawDataFrameReceived(YUVRawDataI420* data) override {
        int width = data->GetStreamWidth();
        int height = data->GetStreamHeight();
        char* yBuffer = data->GetYBuffer();
        char* uBuffer = data->GetUBuffer();
        char* vBuffer = data->GetVBuffer();
        // Process frames...
    }
};

// Subscribe
IZoomVideoSDKRawDataPipe* pipe = user->GetVideoPipe();
pipe->subscribe(ZoomVideoSDKResolution_720P, videoCapture);
```

### 3. Audio Capture: VSDK_getRawAudio

Capture raw PCM audio. Demonstrates:
- Mixed audio (all participants)
- Per-user audio separation
- Audio format (sample rate, channels)

**Key patterns:**
```cpp
void onMixedAudioRawDataReceived(AudioRawData* data) override {
    char* buffer = data->GetBuffer();
    int length = data->GetBufferLen();
    int sampleRate = data->GetSampleRate();  // 32000 Hz
    int channels = data->GetChannelNum();     // 1 or 2
    // Process PCM audio...
}
```

### 4. Video Injection: VSDK_sendRawVideo

Send custom video as virtual camera. Demonstrates:
- `IZoomVideoSDKVideoSource` implementation
- Frame sending with `sendVideoFrame()`
- YUV frame creation
- Frame rate control

### 5. Audio Injection: VSDK_sendRawAudio

Send custom audio as virtual microphone. Demonstrates:
- `IZoomVideoSDKVirtualAudioMic` implementation
- PCM audio sending
- Sample rate matching

---

## Sample Categories

### Raw Data Capture

| Sample | Input | Output |
|--------|-------|--------|
| VSDK_getRawVideo | Remote video | YUV420 frames |
| VSDK_getRawAudio | Session audio | PCM samples |
| VSDK_getRawShare | Screen share | YUV420 frames |

### Raw Data Injection

| Sample | Input | Output |
|--------|-------|--------|
| VSDK_sendRawVideo | YUV420 frames | Virtual camera |
| VSDK_sendRawAudio | PCM samples | Virtual mic |
| VSDK_sendRawShare | YUV420 frames | Screen share |

### Communication

| Sample | Feature |
|--------|---------|
| VSDK_CommandChannel | Custom command messaging (60 msgs/sec) |
| VSDK_CallIn | PSTN phone dial-in |
|
```