# COMANDO - guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\dotnet-winforms\guide.md
**SHA:** b5dc16f96706f1be
**Timestamp:** 2026-08-26T18:42:56.055359
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class CustomZoomDelegate : public IZoomVideoSDKDelegate {
- void CustomZoomDelegate::onSessionJoin() {

### Ouro Bruto (primeiros 5000 chars)
```
# UI Integration Guide for Zoom Video SDK Windows

This guide covers three different UI approaches for integrating the Zoom Video SDK:

1. **Win32 (Native C++)** - Direct SDK usage, no wrapper
2. **WinForms (C# .NET)** - Requires C++/CLI wrapper
3. **WPF (C# .NET)** - Requires C++/CLI wrapper + BitmapSource conversion

## Quick Comparison

| Aspect | Win32 | WinForms | WPF |
|--------|-------|----------|-----|
| **Language** | C++ | C# | C# |
| **Wrapper Required** | No | Yes (C++/CLI) | Yes (C++/CLI) |
| **Video Rendering** | Canvas API (SDK renders) | Raw Data Pipe (you render) | Raw Data Pipe + BitmapSource |
| **Performance** | Best | Good | Good (extra conversion) |
| **Complexity** | Medium | Medium | Higher |
| **UI Threading** | Win32 message loop | `InvokeRequired` | `Dispatcher` |

---

## Option 1: Win32 (Native C++) - Direct SDK

**No wrapper needed.** The SDK is native C++, so Win32 apps use it directly.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Win32 Dialog  │────►│  Native C++ SDK │
│   (main.cpp)    │◄────│  (videosdk.dll) │
└─────────────────┘     └─────────────────┘
       HWND              Canvas API
```

### Key Patterns

#### 1. SDK Manager Class (Native C++)

```cpp
// ZoomSDKManager.h
class ZoomSDKManager {
private:
    IZoomVideoSDK* m_pZoomSDK;
    IZoomVideoSDKSession* m_pSession;
    CustomZoomDelegate* m_pDelegate;

public:
    bool Initialize();
    bool JoinSession(const std::string& name, const std::string& token, ...);
    bool StartVideo();
    bool StartVideoPreview(HWND hwnd);  // Canvas API!
    bool SubscribeRemoteVideo(HWND hwnd, const std::string& userId);
};
```

#### 2. Delegate Implementation (All 80+ Callbacks)

```cpp
class CustomZoomDelegate : public IZoomVideoSDKDelegate {
private:
    ZoomSDKManager* m_pManager;

public:
    void onSessionJoin() override {
        m_pManager->OnSessionStatusChanged(SessionStatus::InSession, "Joined");
    }

    void onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Handle video status changes
    }

    // ... implement all 80+ callbacks
};
```

#### 3. Video Rendering with Canvas API (SDK-Rendered)

```cpp
// Start video preview - SDK renders directly to HWND
bool ZoomSDKManager::StartVideoPreview(HWND hwnd) {
    IZoomVideoSDKVideoHelper* videoHelper = m_pZoomSDK->getVideoHelper();

    // SDK renders directly to the window handle
    ZoomVideoSDKErrors ret = videoHelper->startVideoCanvasPreview(hwnd);
    return ret == ZoomVideoSDKErrors_Success;
}

// Subscribe to remote user's video
bool ZoomSDKManager::SubscribeRemoteVideo(HWND hwnd, const std::string& userId) {
    IZoomVideoSDKSession* session = m_pZoomSDK->getSessionInfo();
    IVideoSDKVector<IZoomVideoSDKUser*>* userList = session->getRemoteUsers();

    for (int i = 0; i < userList->GetCount(); i++) {
        IZoomVideoSDKUser* user = userList->GetItem(i);
        IZoomVideoSDKCanvas* canvas = user->GetVideoCanvas();

        // SDK renders remote video directly to HWND
        canvas->subscribeWithView(hwnd, ZoomVideoSDKVideoAspect_Original, ZoomVideoSDKResolution_Auto);
    }
    return true;
}
```

#### 4. Win32 Dialog with Video Panels

```cpp
// main.cpp - Dialog procedure
INT_PTR CALLBACK MainDialogProc(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_INITDIALOG:
        InitializeZoomSDK();
        PopulateDeviceLists(hDlg);
        return TRUE;

    case WM_COMMAND:
        switch (LOWORD(wParam)) {
        case IDC_START_VIDEO:
            g_pSDKManager->StartVideo();

            // Get HWND of video panel control
            HWND selfVideoHwnd = GetDlgItem(hDlg, IDC_SELF_VIDEO);
            g_pSDKManager->StartVideoPreview(selfVideoHwnd);

            HWND remoteVideoHwnd = GetDlgItem(hDlg, IDC_REMOTE_VIDEO);
            g_pSDKManager->SubscribeRemoteVideo(remoteVideoHwnd, "");
            break;
        }
    }
    return FALSE;
}
```

### Win32 Flow Summary

```
1. CreateZoomVideoSDKObj()
2. Initialize SDK with params
3. Create & register CustomZoomDelegate
4. Join session
5. On IDC_START_VIDEO click:
   - startVideo() → transmit your camera
   - startVideoCanvasPreview(selfHwnd) → see yourself
   - subscribeWithView(remoteHwnd) → see others
6. SDK renders directly to HWNDs
```

### Sample Location
```
C:\tempsdk\videosdk-windows-dotnet-desktop-framework-quickstart\
  └── ZoomVideoSDK.Win32\
      ├── main.cpp              # Win32 dialog + event handlers
      ├── ZoomSDKManager.cpp    # SDK wrapper class
      ├── ZoomSDKManager.h      # Header with delegate
      └── main.rc               # Dialog resources
```

---

## Option 2: WinForms (C# + C++/CLI Wrapper)

**Requires C++/CLI bridge** because Zoom SDK is native C++.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   C# WinForms   │────►│  C++/CLI Wrapper│────►│  Native C+
```