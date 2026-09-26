# CONTRATO - delegate-methods.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\references\delegate-methods.md
**SHA:** 6e9410d62ee59192
**Timestamp:** 2026-08-26T18:42:52.965370
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Delegate Methods Reference

Complete list of all `IZoomVideoSDKDelegate` callback methods. **All 80+ methods must be implemented**, even if empty.

> **Note**: The callback count has grown significantly in SDK v2.4.x with additions for subsessions (breakout rooms), broadcast streaming, whiteboard, RTMS, and enhanced annotation support.

---

## Quick Template

Copy this template and add your implementation:

```cpp
class MyDelegate : public IZoomVideoSDKDelegate {
public:
    // ═══════════════════════════════════════════════════════════════════════
    // SESSION LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    void onSessionJoin() override {
        // Called when successfully joined session
    }

    void onSessionLeave() override {
        // Called when left session (no reason)
    }

    void onSessionLeave(ZoomVideoSDKSessionLeaveReason reason) override {
        // Called when left session (with reason)
    }

    void onError(ZoomVideoSDKErrors errorCode, int detailErrorCode) override {
        // Called on SDK errors
    }

    void onSessionNeedPassword(IZoomVideoSDKPasswordHandler* handler) override {
        // Called when session requires password
    }

    void onSessionPasswordWrong(IZoomVideoSDKPasswordHandler* handler) override {
        // Called when password is incorrect
    }

    // ═══════════════════════════════════════════════════════════════════════
    // USER EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    void onUserJoin(IZoomVideoSDKUserHelper* helper,
                    IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Called when users join session
    }

    void onUserLeave(IZoomVideoSDKUserHelper* helper,
                     IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Called when users leave session
    }

    void onUserHostChanged(IZoomVideoSDKUserHelper* helper,
                           IZoomVideoSDKUser* user) override {
        // Called when host changes
    }

    void onUserManagerChanged(IZoomVideoSDKUser* user) override {
        // Called when manager status changes
    }

    void onUserNameChanged(IZoomVideoSDKUser* user) override {
        // Called when user name changes
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIDEO EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    void onUserVideoStatusChanged(IZoomVideoSDKVideoHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // IMPORTANT: Subscribe to video here, not in onUserJoin
    }

    void onSpotlightVideoChanged(IZoomVideoSDKVideoHelper* helper,
                                 IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Called when spotlight changes
    }

    void onVideoCanvasSubscribeFail(ZoomVideoSDKSubscribeFailReason reason,
                                    IZoomVideoSDKUser* user, void* handle) override {
        // Called when video subscription fails
    }

    void onVideoAlphaChannelStatusChanged(bool isAlphaModeOn) override {
        // Called when alpha channel mode changes
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUDIO EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    void onUserAudioStatusChanged(IZoomVideoSDKAudioHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Called when audio status changes (mute/unmute)
    }

    void onUserActiveAudioChanged(IZoomVideoSDKAudioHelper* helper,
                                  IVideoSDKVector<IZoomVideoSDKUser*>* userList) override {
        // Called when active speaker changes
    }

    void onHostAskUnmute() override {
        // Called when host requests you to unmute
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RAW AUDIO EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    void onMixedAudioRawDataReceived(AudioRawData* data) override {
        // Called with mixed audio from all participants
    }

    void onOneWayAudioRawDataReceived(AudioRawData* data,
                                      IZoomVideoSDKUser* user) override {
        // Called with audio from specific user
    }

    void onSharedAudioRawDataReceived(AudioRawData* data) override {
        // Called with shared audio
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SHARE EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    void onUserShareStatusChanged(IZoomVideoSDKShareHelper* helper,
                                  IZoomVideoSDKUser* user,
                                  IZoomVideoSDKShareAction* shareAction) override {
        // Ca
```