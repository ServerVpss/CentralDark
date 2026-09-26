# COMANDO - cloud-recording.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\cloud-recording.md
**SHA:** 61b952de196589df
**Timestamp:** 2026-08-26T18:42:50.559636
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case RecordingStatus_Start:

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Cloud Recording

Complete working code for controlling cloud recording in sessions.

**Official Sample**: `VSDK_CloudRecording` in [videosdk-windows-rawdata-sample](https://github.com/zoom/videosdk-windows-rawdata-sample)

---

## Overview

Cloud recording saves session recordings to Zoom's cloud storage. Features:
- Start/stop recording programmatically
- Recording consent handling
- Recording status notifications

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD RECORDING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Check canStartRecording()                                   │
│  2. Start recording → startCloudRecording()                     │
│  3. Handle consent → onCloudRecordingStatus() callback          │
│  4. Stop recording → stopCloudRecording()                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Session must have cloud recording enabled
- User must have recording privileges (host or granted permission)
- Valid Zoom account with cloud recording quota

---

## Complete Working Code

### RecordingManager.h

```cpp
#pragma once
#include <windows.h>
#include "zoom_video_sdk_interface.h"

USING_ZOOM_VIDEO_SDK_NAMESPACE

class RecordingManager {
public:
    RecordingManager(IZoomVideoSDK* sdk);

    // Recording control
    bool StartRecording();
    bool StopRecording();
    bool PauseRecording();
    bool ResumeRecording();

    // Status
    bool CanStartRecording();
    bool IsRecording() const { return m_isRecording; }

    // Called from delegate
    void OnRecordingStatus(RecordingStatus status,
                           IZoomVideoSDKRecordingConsentHandler* handler);

private:
    IZoomVideoSDK* m_sdk;
    IZoomVideoSDKRecordingHelper* m_recordingHelper;
    bool m_isRecording;
};
```

### RecordingManager.cpp

```cpp
#include "RecordingManager.h"
#include <iostream>

RecordingManager::RecordingManager(IZoomVideoSDK* sdk)
    : m_sdk(sdk)
    , m_recordingHelper(nullptr)
    , m_isRecording(false) {
}

bool RecordingManager::CanStartRecording() {
    m_recordingHelper = m_sdk->getRecordingHelper();
    if (!m_recordingHelper) {
        std::cout << "Recording helper not available" << std::endl;
        return false;
    }

    ZoomVideoSDKErrors err = m_recordingHelper->canStartRecording();
    if (err == ZoomVideoSDKErrors_Success) {
        return true;
    }

    std::cout << "Cannot start recording: " << err << std::endl;
    return false;
}

bool RecordingManager::StartRecording() {
    if (!CanStartRecording()) {
        return false;
    }

    ZoomVideoSDKErrors err = m_recordingHelper->startCloudRecording();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Cloud recording started" << std::endl;
        return true;
    }

    std::cout << "Start recording failed: " << err << std::endl;
    return false;
}

bool RecordingManager::StopRecording() {
    if (!m_recordingHelper) {
        m_recordingHelper = m_sdk->getRecordingHelper();
    }

    if (!m_recordingHelper) {
        return false;
    }

    ZoomVideoSDKErrors err = m_recordingHelper->stopCloudRecording();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Cloud recording stopped" << std::endl;
        m_isRecording = false;
        return true;
    }

    std::cout << "Stop recording failed: " << err << std::endl;
    return false;
}

bool RecordingManager::PauseRecording() {
    if (!m_recordingHelper) return false;

    ZoomVideoSDKErrors err = m_recordingHelper->pauseCloudRecording();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Recording paused" << std::endl;
        return true;
    }
    return false;
}

bool RecordingManager::ResumeRecording() {
    if (!m_recordingHelper) return false;

    ZoomVideoSDKErrors err = m_recordingHelper->resumeCloudRecording();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Recording resumed" << std::endl;
        return true;
    }
    return false;
}

void RecordingManager::OnRecordingStatus(RecordingStatus status,
                                          IZoomVideoSDKRecordingConsentHandler* handler) {
    switch (status) {
        case RecordingStatus_Start:
            std::cout << "Recording started" << std::endl;
            m_isRecording = true;
            break;

        case RecordingStatus_Stop:
            std::cout << "Recording stopped" << std::endl;
            m_isRecording = false;
            break;

        case RecordingStatus_Pause:
            std::cout << "Recording paused" << std::endl;
            break;

        case RecordingStatus_Connecting:
            std::cout << "Recording connecting..." << std::endl;
            break;

        case RecordingStatus_DiskFull:
            std::cout << "Recording stopped - disk full!" << std::endl;
            m_isRecording = false;
            break;

        default:

```