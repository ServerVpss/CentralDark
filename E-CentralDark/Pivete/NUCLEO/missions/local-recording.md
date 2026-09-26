# MISSAO - local-recording.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\local-recording.md
**SHA:** c16b569c28ad9ac3
**Timestamp:** 2026-08-26T18:42:51.118938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case Recording_Start:

### Ouro Bruto (primeiros 5000 chars)
```
# Local Recording

## Overview

The Meeting SDK provides local recording capabilities through `IMeetingRecordingController`. Local recording saves meeting video/audio to the local disk as MP4 files. This is different from:

- **Cloud Recording** - Saved to Zoom's cloud storage
- **Raw Recording** - Direct access to raw frames (see [raw-video-capture.md](raw-video-capture.md))

## Architecture

```
IMeetingService
    └── GetMeetingRecordingController() → IMeetingRecordingController
                                              ├── SetEvent(IMeetingRecordingCtrlEvent*)
                                              ├── CanStartRecording(bool, unsigned int)
                                              ├── StartRecording(time_t&)
                                              ├── StopRecording()
                                              ├── RequestLocalRecordingPrivilege()
                                              └── IsSupportLocalRecording()
```

## Required Headers

```cpp
#include <meeting_service_interface.h>
#include <meeting_service_components/meeting_recording_interface.h>
#include <meeting_service_components/meeting_participants_ctrl_interface.h>
```

## Step 1: Implement the Recording Event Listener

```cpp
// MeetingRecordingCtrlEventListener.h
#pragma once
#include <meeting_service_components/meeting_recording_interface.h>
#include <functional>

class MeetingRecordingCtrlEventListener
    : public ZOOMSDK::IMeetingRecordingCtrlEvent {
public:
    using PermissionCallback = std::function<void()>;

    MeetingRecordingCtrlEventListener(PermissionCallback onPermissionGranted = nullptr);
    virtual ~MeetingRecordingCtrlEventListener() = default;

    // Local recording status changes
    virtual void onRecordingStatus(ZOOMSDK::RecordingStatus status) override;

    // Cloud recording status changes
    virtual void onCloudRecordingStatus(ZOOMSDK::RecordingStatus status) override;

    // Recording privilege changed (can now record or lost privilege)
    virtual void onRecordPrivilegeChanged(bool bCanRec) override;

    // Result of RequestLocalRecordingPrivilege()
    virtual void onLocalRecordingPrivilegeRequestStatus(
        ZOOMSDK::RequestLocalRecordingStatus status
    ) override;

    // Cloud recording permission request response
    virtual void onRequestCloudRecordingResponse(
        ZOOMSDK::RequestStartCloudRecordingStatus status
    ) override;

    // Host received a recording privilege request
    virtual void onLocalRecordingPrivilegeRequested(
        ZOOMSDK::IRequestLocalRecordingPrivilegeHandler* handler
    ) override;

    // Host received a cloud recording request
    virtual void onStartCloudRecordingRequested(
        ZOOMSDK::IRequestStartCloudRecordingHandler* handler
    ) override;

    // MP4 conversion completed
    virtual void onRecording2MP4Done(
        bool bsuccess,
        int iResult,
        const zchar_t* szPath
    ) override;

    // MP4 conversion progress
    virtual void onRecording2MP4Processing(int iPercentage) override;

    // Custom UI recording layout callback
    virtual void onCustomizedLocalRecordingSourceNotification(
        ZOOMSDK::ICustomizedLocalRecordingLayoutHelper* layout_helper
    ) override;

    // Cloud storage full warning
    virtual void onCloudRecordingStorageFull(time_t gracePeriodDate) override;

    // Smart recording request
    virtual void onEnableAndStartSmartRecordingRequested(
        ZOOMSDK::IRequestEnableAndStartSmartRecordingHandler* handler
    ) override;

    // Smart recording enable action
    virtual void onSmartRecordingEnableActionCallback(
        ZOOMSDK::ISmartRecordingEnableActionHandler* handler
    ) override;

private:
    PermissionCallback m_onPermissionGranted;
};
```

```cpp
// MeetingRecordingCtrlEventListener.cpp
#include "MeetingRecordingCtrlEventListener.h"
#include <iostream>

using namespace ZOOMSDK;

MeetingRecordingCtrlEventListener::MeetingRecordingCtrlEventListener(
    PermissionCallback onPermissionGranted
) : m_onPermissionGranted(onPermissionGranted) {}

void MeetingRecordingCtrlEventListener::onRecordingStatus(RecordingStatus status) {
    switch (status) {
        case Recording_Start:
            std::cout << "Recording started" << std::endl;
            break;
        case Recording_Stop:
            std::cout << "Recording stopped" << std::endl;
            break;
        case Recording_Pause:
            std::cout << "Recording paused" << std::endl;
            break;
        case Recording_Connecting:
            std::cout << "Recording connecting..." << std::endl;
            break;
        case Recording_DiskFull:
            std::cerr << "Recording stopped - disk full!" << std::endl;
            break;
        default:
            std::cout << "Recording status: " << status << std::endl;
    }
}

void MeetingRecordingCtrlEventListener::onCloudRecordingStatus(RecordingStatus status) {
    std::cout << "Cloud recording status: " << status << std::endl;
}

void MeetingR
```