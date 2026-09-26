# COMANDO - share-raw-data-capture.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\share-raw-data-capture.md
**SHA:** 609b97518135640b
**Timestamp:** 2026-08-26T18:42:53.416340
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class ZoomSDKShareRendererDelegate : public ZOOMSDK::IZoomSDKRendererDelegate {
- ZoomSDKShareRendererDelegate::ZoomSDKShareRendererDelegate()
- ZoomSDKShareRendererDelegate::~ZoomSDKShareRendererDelegate() {
- void ZoomSDKShareRendererDelegate::onRawDataFrameReceived(YUVRawDataI420* data) {
- void ZoomSDKShareRendererDelegate::onRawDataStatusChanged(RawDataStatus status) {
- void ZoomSDKShareRendererDelegate::onRendererBeDestroyed() {
- void ZoomSDKShareRendererDelegate::enableFileOutput(const std::string& filename) {
- void ZoomSDKShareRendererDelegate::disableFileOutput() {
- ZoomSDKShareRendererDelegate* g_shareDelegate = nullptr;
- g_shareDelegate = new ZoomSDKShareRendererDelegate();

### Ouro Bruto (primeiros 5000 chars)
```
# Screen Share Raw Data Capture

## Overview

The Meeting SDK allows you to receive raw screen share data (YUV420 frames) from participants sharing their screen. This uses the same `IZoomSDKRenderer` and `IZoomSDKRendererDelegate` pattern as video capture, but subscribes to `RAW_DATA_TYPE_SHARE` instead of `RAW_DATA_TYPE_VIDEO`.

## Architecture

```
IMeetingService
    ├── GetMeetingShareController() → IMeetingShareController
    │                                      └── GetViewableSharingUserList()
    │
    └── GetMeetingRecordingController() → IMeetingRecordingController
                                               └── StartRawRecording()

createRenderer() → IZoomSDKRenderer
                       ├── subscribe(userId, RAW_DATA_TYPE_SHARE)
                       └── unSubscribe()

IZoomSDKRendererDelegate (your implementation)
    └── onRawDataFrameReceived(YUVRawDataI420*)
```

## Required Headers

```cpp
#include <meeting_service_interface.h>
#include <meeting_service_components/meeting_sharing_interface.h>
#include <meeting_service_components/meeting_recording_interface.h>
#include <rawdata/zoom_rawdata_api.h>
#include <rawdata/rawdata_renderer_interface.h>
```

## Step 1: Implement the Renderer Delegate

```cpp
// ZoomSDKShareRendererDelegate.h
#pragma once
#include <rawdata/rawdata_renderer_interface.h>
#include <fstream>
#include <string>

class ZoomSDKShareRendererDelegate : public ZOOMSDK::IZoomSDKRendererDelegate {
public:
    ZoomSDKShareRendererDelegate();
    virtual ~ZoomSDKShareRendererDelegate();

    // Called when a share frame is received
    virtual void onRawDataFrameReceived(ZOOMSDK::YUVRawDataI420* data) override;

    // Called when renderer status changes
    virtual void onRawDataStatusChanged(
        ZOOMSDK::RawDataStatus status
    ) override;

    // Called when resolution changes
    virtual void onRendererBeDestroyed() override;

    // Frame statistics
    unsigned int getFrameCount() const { return m_frameCount; }
    void resetFrameCount() { m_frameCount = 0; }

    // Enable/disable file output
    void enableFileOutput(const std::string& filename);
    void disableFileOutput();

private:
    unsigned int m_frameCount;
    std::ofstream m_outputFile;
    bool m_writeToFile;
    int m_lastWidth;
    int m_lastHeight;
};
```

```cpp
// ZoomSDKShareRendererDelegate.cpp
#include "ZoomSDKShareRendererDelegate.h"
#include <iostream>

using namespace ZOOMSDK;

ZoomSDKShareRendererDelegate::ZoomSDKShareRendererDelegate()
    : m_frameCount(0)
    , m_writeToFile(false)
    , m_lastWidth(0)
    , m_lastHeight(0) {}

ZoomSDKShareRendererDelegate::~ZoomSDKShareRendererDelegate() {
    disableFileOutput();
}

void ZoomSDKShareRendererDelegate::onRawDataFrameReceived(YUVRawDataI420* data) {
    if (!data) return;

    m_frameCount++;

    // Get frame dimensions
    unsigned int width = data->GetStreamWidth();
    unsigned int height = data->GetStreamHeight();

    // Check for resolution change
    if (width != m_lastWidth || height != m_lastHeight) {
        std::cout << "[Share] Resolution changed: "
                  << width << "x" << height << std::endl;
        m_lastWidth = width;
        m_lastHeight = height;
    }

    // Log periodically
    if (m_frameCount % 30 == 0) {
        std::cout << "[Share] Frame " << m_frameCount
                  << " - " << width << "x" << height
                  << std::endl;
    }

    // YUV420 data access
    char* yBuffer = data->GetYBuffer();
    char* uBuffer = data->GetUBuffer();
    char* vBuffer = data->GetVBuffer();

    // Calculate buffer sizes for YUV420
    unsigned int ySize = width * height;
    unsigned int uvSize = (width / 2) * (height / 2);

    // Write to file if enabled
    if (m_writeToFile && m_outputFile.is_open()) {
        m_outputFile.write(yBuffer, ySize);
        m_outputFile.write(uBuffer, uvSize);
        m_outputFile.write(vBuffer, uvSize);
    }

    // Process the frame (e.g., display, encode, analyze)
    // The data is in YUV I420 format:
    // - Y plane: width * height bytes (luminance)
    // - U plane: (width/2) * (height/2) bytes (chrominance)
    // - V plane: (width/2) * (height/2) bytes (chrominance)
}

void ZoomSDKShareRendererDelegate::onRawDataStatusChanged(RawDataStatus status) {
    switch (status) {
        case RawData_On:
            std::cout << "[Share] Raw data: ON" << std::endl;
            break;
        case RawData_Off:
            std::cout << "[Share] Raw data: OFF" << std::endl;
            break;
        default:
            std::cout << "[Share] Raw data status: " << status << std::endl;
    }
}

void ZoomSDKShareRendererDelegate::onRendererBeDestroyed() {
    std::cout << "[Share] Renderer being destroyed" << std::endl;
    disableFileOutput();
}

void ZoomSDKShareRendererDelegate::enableFileOutput(const std::string& filename) {
    disableFileOutput();
    m_outputFile.open(filename, std::ios::binary);
    if (m_outputFile.is_open()) {
        m_writeToFile = true;
  
```