# MISSAO - captions-transcription.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\captions-transcription.md
**SHA:** c99a7b59b9ef4206
**Timestamp:** 2026-08-26T18:42:53.275256
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case SDK_LiveTranscription_Status_Start:
- SDK_LiveTranscription_Status_Start = 1,   // Running

### Ouro Bruto (primeiros 5000 chars)
```
# Closed Captions and Live Transcription

## Overview

The Meeting SDK provides two related caption features through `IClosedCaptionController`:

1. **Manual Closed Captions** - Host assigns someone to type captions manually
2. **Live Transcription** - Automatic speech-to-text with optional translation

Both features support multi-language translation when enabled.

## Architecture

```
IMeetingService
    └── GetMeetingClosedCaptionController() → IClosedCaptionController
                                                  ├── SetEvent(IClosedCaptionControllerEvent*)
                                                  ├── EnableCaptions(bool)
                                                  ├── StartLiveTranscription()
                                                  ├── SetMeetingSpokenLanguage(int)
                                                  ├── SetTranslationLanguage(int)
                                                  └── SendClosedCaption(const zchar_t*)
```

## Required Headers

```cpp
#include <meeting_service_interface.h>
#include <meeting_service_components/meeting_closedcaption_interface.h>
```

## Step 1: Implement the Caption Event Listener

```cpp
// ClosedCaptionControllerEventListener.h
#pragma once
#include <meeting_service_components/meeting_closedcaption_interface.h>
#include <functional>

class ClosedCaptionControllerEventListener
    : public ZOOMSDK::IClosedCaptionControllerEvent {
public:
    using TranscriptionCallback = std::function<void(const std::wstring&, unsigned int)>;
    using CaptionCallback = std::function<void(const std::wstring&, unsigned int)>;

    ClosedCaptionControllerEventListener(
        TranscriptionCallback onTranscription = nullptr,
        CaptionCallback onCaption = nullptr
    );
    virtual ~ClosedCaptionControllerEventListener() = default;

    // Called when assigned to send closed captions
    virtual void onAssignedToSendCC(bool bAssigned) override;

    // Called when manual closed caption is received
    virtual void onClosedCaptionMsgReceived(
        const zchar_t* ccMsg,
        unsigned int sender_id,
        time_t time
    ) override;

    // Called when live transcription status changes
    virtual void onLiveTranscriptionStatus(
        ZOOMSDK::SDKLiveTranscriptionStatus status
    ) override;

    // Called when original (untranslated) message is received
    virtual void onOriginalLanguageMsgReceived(
        ZOOMSDK::ILiveTranscriptionMessageInfo* messageInfo
    ) override;

    // Called when translated transcription message is received
    virtual void onLiveTranscriptionMsgInfoReceived(
        ZOOMSDK::ILiveTranscriptionMessageInfo* messageInfo
    ) override;

    // Called when translation error occurs
    virtual void onLiveTranscriptionMsgError(
        ZOOMSDK::ILiveTranscriptionLanguage* spokenLanguage,
        ZOOMSDK::ILiveTranscriptionLanguage* transcriptLanguage
    ) override;

    // Host receives this when someone requests transcription
    virtual void onRequestForLiveTranscriptReceived(
        unsigned int requester_id,
        bool bAnonymous
    ) override;

    // Called when request status changes
    virtual void onRequestLiveTranscriptionStatusChange(bool bEnabled) override;

    // Called when caption enable status changes
    virtual void onCaptionStatusChanged(bool bEnabled) override;

    // Called when someone requests to start captions
    virtual void onStartCaptionsRequestReceived(
        ZOOMSDK::ICCRequestHandler* handler
    ) override;

    // Called when caption request is approved
    virtual void onStartCaptionsRequestApproved() override;

    // Called when manual caption status changes
    virtual void onManualCaptionStatusChanged(bool bEnabled) override;

    // Called when spoken language changes
    virtual void onSpokenLanguageChanged(
        ZOOMSDK::ILiveTranscriptionLanguage* spokenLanguage
    ) override;

private:
    TranscriptionCallback m_onTranscription;
    CaptionCallback m_onCaption;
    std::string wstringToUtf8(const std::wstring& wstr);
};
```

```cpp
// ClosedCaptionControllerEventListener.cpp
#include "ClosedCaptionControllerEventListener.h"
#include <iostream>

using namespace ZOOMSDK;

ClosedCaptionControllerEventListener::ClosedCaptionControllerEventListener(
    TranscriptionCallback onTranscription,
    CaptionCallback onCaption
) : m_onTranscription(onTranscription), m_onCaption(onCaption) {}

void ClosedCaptionControllerEventListener::onAssignedToSendCC(bool bAssigned) {
    std::cout << "Assigned to send CC: " << (bAssigned ? "yes" : "no") << std::endl;
}

void ClosedCaptionControllerEventListener::onClosedCaptionMsgReceived(
    const zchar_t* ccMsg,
    unsigned int sender_id,
    time_t time
) {
    if (ccMsg) {
        std::wstring wstr(ccMsg);
        std::string utf8 = wstringToUtf8(wstr);
        std::cout << "[CC] " << utf8 << std::endl;

        if (m_onCaption) {
            m_onCaption(wstr, sender_id);
        }
    }
}

void ClosedCaptionControlle
```