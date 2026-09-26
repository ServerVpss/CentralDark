# COMANDO - transcription.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\transcription.md
**SHA:** 4f282c2be4ee2f86
**Timestamp:** 2026-08-26T18:42:53.465613
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case ZoomVideoSDKLiveTranscription_Status_Start:

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Live Transcription

Complete working code for real-time speech-to-text transcription.

**Official Sample**: `VSDK_TranscriptionAndTranslation` in [videosdk-windows-rawdata-sample](https://github.com/zoom/videosdk-windows-rawdata-sample)

---

## Overview

Live transcription provides real-time captions of speech. Features:
- Automatic speech recognition
- Multiple language support
- Speaker identification
- Translation (optional)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSCRIPTION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Enable transcription → startLiveTranscription()             │
│  2. Receive captions → onLiveTranscriptionMsgInfoReceived()     │
│  3. Display/process text                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Live transcription must be enabled for the session
- Valid Zoom account with transcription feature

---

## Complete Working Code

### TranscriptionManager.h

```cpp
#pragma once
#include <windows.h>
#include <string>
#include <vector>
#include <functional>
#include "zoom_video_sdk_interface.h"

USING_ZOOM_VIDEO_SDK_NAMESPACE

struct TranscriptionMessage {
    std::wstring speakerName;
    std::wstring text;
    bool isFinal;
    unsigned long long timestamp;
};

class TranscriptionManager {
public:
    TranscriptionManager(IZoomVideoSDK* sdk);

    // Control
    bool StartTranscription();
    bool StopTranscription();
    bool IsTranscribing() const { return m_isTranscribing; }

    // Language settings
    bool SetSpokenLanguage(ILiveTranscriptionLanguage* language);
    bool SetTranslationLanguage(ILiveTranscriptionLanguage* language);
    std::vector<ILiveTranscriptionLanguage*> GetAvailableLanguages();

    // Callbacks from delegate
    void OnStatusChanged(ZoomVideoSDKLiveTranscriptionStatus status);
    void OnMessageReceived(ILiveTranscriptionMessageInfo* info);
    void OnOriginalLanguageReceived(ILiveTranscriptionMessageInfo* info);
    void OnError(ILiveTranscriptionLanguage* spoken,
                 ILiveTranscriptionLanguage* transcript);

    // Set message handler
    using MessageCallback = std::function<void(const TranscriptionMessage&)>;
    void SetMessageHandler(MessageCallback callback) { m_callback = callback; }

private:
    IZoomVideoSDK* m_sdk;
    IZoomVideoSDKLiveTranscriptionHelper* m_helper;
    bool m_isTranscribing;
    MessageCallback m_callback;
};
```

### TranscriptionManager.cpp

```cpp
#include "TranscriptionManager.h"
#include <iostream>

TranscriptionManager::TranscriptionManager(IZoomVideoSDK* sdk)
    : m_sdk(sdk)
    , m_helper(nullptr)
    , m_isTranscribing(false) {
}

bool TranscriptionManager::StartTranscription() {
    m_helper = m_sdk->getLiveTranscriptionHelper();
    if (!m_helper) {
        std::cout << "Transcription helper not available" << std::endl;
        return false;
    }

    // Check if transcription is available
    if (!m_helper->canStartLiveTranscription()) {
        std::cout << "Cannot start transcription" << std::endl;
        return false;
    }

    ZoomVideoSDKErrors err = m_helper->startLiveTranscription();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Transcription started" << std::endl;
        return true;
    }

    std::cout << "Start transcription failed: " << err << std::endl;
    return false;
}

bool TranscriptionManager::StopTranscription() {
    if (!m_helper) return false;

    ZoomVideoSDKErrors err = m_helper->stopLiveTranscription();
    if (err == ZoomVideoSDKErrors_Success) {
        std::cout << "Transcription stopped" << std::endl;
        m_isTranscribing = false;
        return true;
    }

    return false;
}

std::vector<ILiveTranscriptionLanguage*> TranscriptionManager::GetAvailableLanguages() {
    std::vector<ILiveTranscriptionLanguage*> languages;

    if (!m_helper) {
        m_helper = m_sdk->getLiveTranscriptionHelper();
    }

    if (m_helper) {
        IVideoSDKVector<ILiveTranscriptionLanguage*>* langList =
            m_helper->getAvailableSpokenLanguages();

        if (langList) {
            for (int i = 0; i < langList->GetCount(); i++) {
                languages.push_back(langList->GetItem(i));
            }
        }
    }

    return languages;
}

bool TranscriptionManager::SetSpokenLanguage(ILiveTranscriptionLanguage* language) {
    if (!m_helper || !language) return false;

    ZoomVideoSDKErrors err = m_helper->setSpokenLanguage(language);
    if (err == ZoomVideoSDKErrors_Success) {
        std::wcout << L"Spoken language set to: "
                   << language->getLTTLanguageName() << std::endl;
        return true;
    }
    return false;
}

bool TranscriptionManager::SetTranslationLanguage(ILiveTranscriptionLanguage* language) {
    if (!m_helper || !language) return false;

    ZoomVideoSDKErrors err = m_helper->setTranslationLanguage
```