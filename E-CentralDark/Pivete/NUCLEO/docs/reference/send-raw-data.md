# REFERENCIA - send-raw-data.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\send-raw-data.md
**SHA:** efb5c6e1e8205c1e
**Timestamp:** 2026-08-26T18:42:56.368198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- All follow the same pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Send Raw Data (Virtual Camera & Microphone)

Send custom video and audio into a Zoom meeting as a virtual camera or microphone. This enables:
- Streaming pre-recorded video files
- AI-generated video/audio
- Custom video effects
- Screen capture injection
- Audio playback into meetings

---

## Overview

The SDK provides three "send" interfaces:
1. **IZoomSDKVideoSource** - Virtual camera (send video)
2. **IZoomSDKVirtualAudioMicEvent** - Virtual microphone (send audio)
3. **IZoomSDKShareSource** - Virtual share source (send screen share)

All follow the same pattern:
1. Implement the interface
2. Pass it during meeting join/start
3. SDK calls your callbacks when ready to send

---

## Send Video (Virtual Camera)

### Interface: IZoomSDKVideoSource

```cpp
#include <rawdata/rawdata_video_source_helper_interface.h>

class ZoomSDKVideoSource : public IZoomSDKVideoSource {
private:
    IZoomSDKVideoSender* video_sender_ = nullptr;
    string video_source_;

public:
    ZoomSDKVideoSource(string video_source) : video_source_(video_source) {}

    void onInitialize(IZoomSDKVideoSender* sender,
                      IList<VideoSourceCapability>* support_cap_list,
                      VideoSourceCapability& suggest_cap) override {
        // Store the sender - you'll use this to send frames
        video_sender_ = sender;
        std::cout << "Video source initialized" << std::endl;
    }

    void onPropertyChange(IList<VideoSourceCapability>* support_cap_list,
                          VideoSourceCapability suggest_cap) override {
        // SDK suggests resolution/framerate based on network
        std::cout << "Suggested: " << suggest_cap.width << "x"
                  << suggest_cap.height << " @ " << suggest_cap.frame << "fps" << std::endl;
    }

    void onStartSend() override {
        // SDK is ready - start sending frames in a separate thread
        std::thread([this]() { PlayVideo(); }).detach();
    }

    void onStopSend() override {
        // Stop sending frames
        running_ = false;
    }

    void onUninitialized() override {
        video_sender_ = nullptr;
    }

private:
    bool running_ = false;

    void PlayVideo() {
        running_ = true;

        // Open video file with OpenCV
        cv::VideoCapture cap(video_source_);
        if (!cap.isOpened()) {
            std::cerr << "Failed to open video: " << video_source_ << std::endl;
            return;
        }

        while (running_ && video_sender_) {
            cv::Mat frame;
            if (!cap.read(frame)) {
                cap.set(cv::CAP_PROP_POS_FRAMES, 0);  // Loop video
                continue;
            }

            // Convert BGR to YUV420 (I420)
            cv::Mat yuv;
            cv::cvtColor(frame, yuv, cv::COLOR_BGR2YUV_I420);

            // Send frame
            char* buffer = (char*)yuv.data;
            int width = frame.cols;
            int height = frame.rows;
            int frameLen = yuv.total() * yuv.elemSize();

            SDKError err = video_sender_->sendVideoFrame(buffer, width, height, frameLen, 0);
            if (err != SDKERR_SUCCESS) {
                std::cerr << "sendVideoFrame failed: " << err << std::endl;
            }

            // Control framerate (e.g., 30fps = 33ms per frame)
            std::this_thread::sleep_for(std::chrono::milliseconds(33));
        }
    }
};
```

### Register Virtual Camera

```cpp
// Create your video source
ZoomSDKVideoSource* videoSource = new ZoomSDKVideoSource("my_video.mp4");

// Get the raw data helper
IZoomSDKVideoSourceHelper* videoSourceHelper = GetRawdataVideoSourceHelper();

// Set as external video source
videoSourceHelper->setExternalVideoSource(videoSource);

// Join meeting - your video will be the "camera"
meetingService->Join(joinParam);
```

### Frame Format: YUV420 (I420)

```
YUV420 Layout (1920x1080 example):
┌────────────────────────┐
│         Y plane        │  1920 x 1080 = 2,073,600 bytes
│      (luminance)       │
├────────────────────────┤
│    U plane (Cb)        │  960 x 540 = 518,400 bytes
├────────────────────────┤
│    V plane (Cr)        │  960 x 540 = 518,400 bytes
└────────────────────────┘
Total: width * height * 1.5 = 3,110,400 bytes
```

---

## Send Audio (Virtual Microphone)

### Interface: IZoomSDKVirtualAudioMicEvent

```cpp
#include <rawdata/rawdata_audio_helper_interface.h>

class ZoomSDKVirtualAudioMic : public IZoomSDKVirtualAudioMicEvent {
private:
    IZoomSDKAudioRawDataSender* audio_sender_ = nullptr;
    string audio_source_;
    bool running_ = false;

public:
    ZoomSDKVirtualAudioMic(string audio_source) : audio_source_(audio_source) {}

    void onMicInitialize(IZoomSDKAudioRawDataSender* pSender) override {
        audio_sender_ = pSender;
        std::cout << "Virtual mic initialized" << std::endl;
    }

    void onMicStartSend() override {
        // SDK is ready - start sending audio
        std::thread([this]() { PlayAudio(); }).detach();
    }

    void onMicStopSend() override {
   
```