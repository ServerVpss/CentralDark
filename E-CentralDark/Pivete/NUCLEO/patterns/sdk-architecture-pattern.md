# PADRAO - sdk-architecture-pattern.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\concepts\sdk-architecture-pattern.md
**SHA:** 9b4869532172b205
**Timestamp:** 2026-08-26T18:42:51.033756
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- # SDK Architecture Pattern: The Universal Implementation Formula
- Every SDK feature follows this 3-step pattern:
- // Pattern: meetingService->Get[Feature]Controller()
- // Pattern: I[Feature]Event or I[Feature]CtrlEvent
- // Pattern: controller->SetEvent(listener), then call methods
- Let's implement audio mute/unmute to demonstrate the pattern:
- ## Advanced Pattern: Multiple Feature Integration

### Ouro Bruto (primeiros 5000 chars)
```
# SDK Architecture Pattern: The Universal Implementation Formula

## Core Concept

The Zoom Windows Meeting SDK follows a **consistent architectural pattern** that applies to EVERY feature. Once you understand this pattern, you can implement ANY feature just by reading the `.h` header files.

---

## The Universal Pattern

Every SDK feature follows this 3-step pattern:

### 1. Get the Controller/Helper (Singleton Pattern)

```cpp
// Pattern: meetingService->Get[Feature]Controller()
IMeetingAudioController* audioCtrl = meetingService->GetMeetingAudioController();
IMeetingChatController* chatCtrl = meetingService->GetMeetingChatController();
IMeetingVideoController* videoCtrl = meetingService->GetMeetingVideoController();
```

### 2. Implement the Event Listener Interface (Observer Pattern)

```cpp
// Pattern: I[Feature]Event or I[Feature]CtrlEvent
class MyAudioListener : public IMeetingAudioCtrlEvent {
    void onUserAudioStatusChange(IList<IUserAudioStatus*>* lstAudioStatusChange) override {
        // React to audio events
    }
    // ... implement all pure virtual methods
};
```

### 3. Register Listener and Use Controller Methods

```cpp
// Pattern: controller->SetEvent(listener), then call methods
audioCtrl->SetEvent(new MyAudioListener());
audioCtrl->MuteAudio(userId, true);  // Use feature
```

---

## Complete Architecture Overview

### The Singleton Services

**Top-level services** (created via global functions):

```cpp
// Authentication Service (JWT, user login)
IAuthService* authService;
CreateAuthService(&authService);

// Meeting Service (join, leave, access features)
IMeetingService* meetingService;
CreateMeetingService(&meetingService);
```

### Feature Controllers (35+ Available)

**All controllers** are accessed through `IMeetingService->Get[Feature]Controller()`:

```cpp
// Audio features
IMeetingAudioController* audioCtrl = meetingService->GetMeetingAudioController();

// Video features
IMeetingVideoController* videoCtrl = meetingService->GetMeetingVideoController();

// Chat features
IMeetingChatController* chatCtrl = meetingService->GetMeetingChatController();

// Participants management
IMeetingParticipantsController* participantsCtrl = meetingService->GetMeetingParticipantsController();

// Recording features
IMeetingRecordingController* recordingCtrl = meetingService->GetMeetingRecordingController();

// Screen sharing
IMeetingShareController* shareCtrl = meetingService->GetMeetingShareController();

// Waiting room
IMeetingWaitingRoomController* waitingRoomCtrl = meetingService->GetMeetingWaitingRoomController();

// Webinar features
IMeetingWebinarController* webinarCtrl = meetingService->GetMeetingWebinarController();

// Breakout rooms
IMeetingBOController* boCtrl = meetingService->GetMeetingBOController();

// AI Companion
IMeetingAICompanionController* aiCtrl = meetingService->GetMeetingAICompanionController();

// Q&A
IMeetingQAController* qaCtrl = meetingService->GetMeetingQAController();

// Polling
IMeetingPollingController* pollingCtrl = meetingService->GetMeetingPollingController();

// Whiteboard
IMeetingWhiteboardController* whiteboardCtrl = meetingService->GetMeetingWhiteboardController();

// Closed captions
IClosedCaptionController* captionCtrl = meetingService->GetMeetingClosedCaptionController();

// Live streaming
IMeetingLiveStreamController* liveStreamCtrl = meetingService->GetMeetingLiveStreamController();

// Emoji reactions
IEmojiReactionController* emojiCtrl = meetingService->GetMeetingEmojiReactionController();

// Interpretation
IMeetingInterpretationController* interpretCtrl = meetingService->GetMeetingInterpretationController();

// Remote support
IMeetingRemoteSupportController* remoteSupportCtrl = meetingService->GetMeetingRemoteSupportController();

// Encryption
IMeetingEncryptionController* encryptionCtrl = meetingService->GetInMeetingEncryptionController();

// ... and 15+ more controllers!
```

**Complete list** (35 controllers as of SDK v6.7.2):
1. `GetMeetingAudioController()` - Audio mute/unmute
2. `GetMeetingVideoController()` - Video start/stop
3. `GetMeetingShareController()` - Screen sharing
4. `GetMeetingChatController()` - Meeting chat
5. `GetMeetingParticipantsController()` - Participant management
6. `GetMeetingRecordingController()` - Recording/raw data
7. `GetMeetingWaitingRoomController()` - Waiting room management
8. `GetMeetingWebinarController()` - Webinar features
9. `GetMeetingBOController()` - Breakout rooms
10. `GetMeetingAICompanionController()` - AI features
11. `GetMeetingQAController()` - Q&A management
12. `GetMeetingPollingController()` - Polls/surveys
13. `GetMeetingWhiteboardController()` - Whiteboard
14. `GetMeetingClosedCaptionController()` - Captions
15. `GetMeetingLiveStreamController()` - Live streaming
16. `GetMeetingEmojiReactionController()` - Emoji reactions
17. `GetMeetingInterpretationController()` - Language interpretation
18. `GetMeetingSignInterpretationController()` - Sign language
19. `GetMeetingRemote
```Start Y
```udio(user);

// Events arrive in delegate
void onUserAudioStatus
```