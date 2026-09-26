# COMANDO - raw-audio-capture.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\raw-audio-capture.md
**SHA:** 8d552b187d5cfe57
**Timestamp:** 2026-08-26T18:42:55.946385
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Raw Audio Capture

Complete working code for capturing raw PCM audio from sessions.

**Official Sample**: `VSDK_getRawAudio` in [videosdk-windows-rawdata-sample](https://github.com/zoom/videosdk-windows-rawdata-sample)

---

## Overview

The SDK provides two audio capture modes:
- **Mixed Audio**: All participants combined into single stream
- **Per-User Audio**: Separate stream for each participant

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIO CAPTURE FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│  IZoomVideoSDKDelegate                                          │
│  ├── onMixedAudioRawDataReceived(AudioRawData*)     [Combined]  │
│  └── onOneWayAudioRawDataReceived(AudioRawData*, user) [Per-user]│
└─────────────────────────────────────────────────────────────────┘
```

---

## Audio Format

| Property | Value |
|----------|-------|
| Format | PCM (uncompressed) |
| Sample Rate | 32000 Hz |
| Bit Depth | 16-bit signed |
| Channels | Mono (1) or Stereo (2) |
| Byte Order | Little-endian |

**Buffer size per callback**: Varies, typically 640-1280 bytes (20-40ms of audio)

---

## Complete Working Code

### AudioCapture.h

```cpp
#pragma once
#include <windows.h>
#include <fstream>
#include <mutex>
#include "zoom_video_sdk_delegate_interface.h"

USING_ZOOM_VIDEO_SDK_NAMESPACE

class AudioCapture {
public:
    AudioCapture(const std::string& outputPath);
    ~AudioCapture();

    // Called from delegate
    void OnMixedAudio(AudioRawData* data);
    void OnUserAudio(AudioRawData* data, IZoomVideoSDKUser* user);

    // Statistics
    int GetSampleCount() const { return m_sampleCount; }

private:
    std::ofstream m_outputFile;
    std::mutex m_mutex;
    int m_sampleCount;
    int m_sampleRate;
    int m_channels;
};
```

### AudioCapture.cpp

```cpp
#include "AudioCapture.h"
#include <iostream>

AudioCapture::AudioCapture(const std::string& outputPath)
    : m_sampleCount(0)
    , m_sampleRate(0)
    , m_channels(0) {

    m_outputFile.open(outputPath, std::ios::binary);
    if (!m_outputFile.is_open()) {
        std::cerr << "Failed to open: " << outputPath << std::endl;
    }
}

AudioCapture::~AudioCapture() {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (m_outputFile.is_open()) {
        m_outputFile.close();
    }
    std::cout << "Captured " << m_sampleCount << " audio samples" << std::endl;
    std::cout << "Sample rate: " << m_sampleRate << " Hz" << std::endl;
    std::cout << "Channels: " << m_channels << std::endl;
}

void AudioCapture::OnMixedAudio(AudioRawData* data) {
    if (!data) return;

    std::lock_guard<std::mutex> lock(m_mutex);

    // Get audio properties
    char* buffer = data->GetBuffer();
    unsigned int length = data->GetBufferLen();
    unsigned int sampleRate = data->GetSampleRate();
    unsigned int channels = data->GetChannelNum();

    // Log format on first callback
    if (m_sampleCount == 0) {
        std::cout << "Audio format: " << sampleRate << " Hz, "
                  << channels << " channel(s)" << std::endl;
        m_sampleRate = sampleRate;
        m_channels = channels;
    }

    // Write PCM data
    if (m_outputFile.is_open() && buffer && length > 0) {
        m_outputFile.write(buffer, length);
    }

    m_sampleCount++;

    // Log progress
    if (m_sampleCount % 500 == 0) {
        std::cout << "Audio samples: " << m_sampleCount << std::endl;
    }
}

void AudioCapture::OnUserAudio(AudioRawData* data, IZoomVideoSDKUser* user) {
    if (!data || !user) return;

    // Process per-user audio
    // Could write to separate files per user
    std::wcout << L"Audio from: " << user->getUserName() << std::endl;
}
```

### Using in Delegate

```cpp
class MyDelegate : public IZoomVideoSDKDelegate {
private:
    AudioCapture* m_audioCapture;

public:
    MyDelegate() {
        m_audioCapture = new AudioCapture("audio.pcm");
    }

    ~MyDelegate() {
        delete m_audioCapture;
    }

    // Mixed audio from all participants
    void onMixedAudioRawDataReceived(AudioRawData* data) override {
        m_audioCapture->OnMixedAudio(data);
    }

    // Audio from specific user
    void onOneWayAudioRawDataReceived(AudioRawData* data,
                                       IZoomVideoSDKUser* user) override {
        m_audioCapture->OnUserAudio(data, user);
    }

    // Shared audio (from screen share with audio)
    void onSharedAudioRawDataReceived(AudioRawData* data) override {
        // Handle shared audio separately if needed
    }

    // ... other callbacks
};
```

---

## Playing Raw PCM Audio

### FFplay

```cmd
ffplay -f s16le -ar 32000 -ac 1 audio.pcm
```

### Convert to WAV

```cmd
ffmpeg -f s16le -ar 32000 -ac 1 -i audio.pcm output.wav
```

### FFmpeg Flags

| Flag | Description |
|------|-------------|
| `-f s16le` | Signed 16-bit little-endian PCM |
| `-ar 32000` | Sample rate 32000 Hz |
| `-ac 1` | Mono (use `-ac 2` for stereo) |

--
```