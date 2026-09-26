# COMANDO - singleton-hierarchy.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\concepts\singleton-hierarchy.md
**SHA:** 99fdd54d53bcbba4
**Timestamp:** 2026-08-26T18:42:56.810516
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Navigate: Level 1 → Level 2 → Level 3
- // Navigate: Level 1 → Level 2 → Level 3 → Level 4

### Ouro Bruto (primeiros 5000 chars)
```
# Singleton Hierarchy: Navigation Guide

## Overview

The Zoom Windows Meeting SDK uses a **service locator pattern** - a tree of singletons where you navigate from root services down to specific features. You don't construct objects; you traverse to them.

```
You want to...              You navigate to...
─────────────────────────────────────────────────────
Mute audio                  IMeetingService → IMeetingAudioController
Create breakout rooms       IMeetingService → IMeetingBOController → IBOCreator
Control remote camera       IMeetingService → IMeetingVideoController → IMeetingCameraHelper
Start live stream           IMeetingService → IMeetingLiveStreamController
Add Q&A questions           IMeetingService → IMeetingQAController
Enable interpretation       IMeetingService → IMeetingInterpretationController
Batch invite contacts       IAuthService → INotificationServiceHelper → IPresenceHelper → IBatchRequestContactHelper
```

---

## Complete Hierarchy (4 Levels Deep)

```
Level 0: Global Factory Functions (zoom_sdk.h)
│
├─► Level 1: IAuthService
│   ├─► Level 2: IDirectShareServiceHelper                              [LEAF]
│   └─► Level 2: INotificationServiceHelper
│       └─► Level 3: IPresenceHelper
│           └─► Level 4: IBatchRequestContactHelper                     [LEAF - MAX DEPTH]
│
├─► Level 1: IMeetingService
│   │
│   │   ══════════════════════════════════════════════════════════════
│   │   CROSS-PLATFORM CONTROLLERS (All platforms)
│   │   ══════════════════════════════════════════════════════════════
│   │
│   ├─► Level 2: IMeetingVideoController
│   │   ├─► Level 3: IMeetingCameraHelper                               [LEAF]
│   │   ├─► Level 3: ISetVideoOrderHelper                               [LEAF - Windows]
│   │   └─► Level 3: ICameraController                                  [LEAF - Windows]
│   │
│   ├─► Level 2: IMeetingAudioController                                [LEAF]
│   ├─► Level 2: IMeetingShareController                                [LEAF]
│   ├─► Level 2: IMeetingChatController                                 [LEAF]
│   ├─► Level 2: IMeetingRecordingController                            [LEAF]
│   ├─► Level 2: IMeetingParticipantsController                         [LEAF]
│   ├─► Level 2: IMeetingWaitingRoomController                          [LEAF]
│   ├─► Level 2: IMeetingWebinarController                              [LEAF]
│   ├─► Level 2: IMeetingRawArchivingController                         [LEAF]
│   ├─► Level 2: IMeetingReminderController                             [LEAF]
│   ├─► Level 2: IMeetingEncryptionController                           [LEAF]
│   ├─► Level 2: IMeetingConfiguration                                  [LEAF]
│   ├─► Level 2: IListFactory                                           [LEAF - utility]
│   │
│   ├─► Level 2: IMeetingBOController (Breakout Rooms)
│   │   ├─► Level 3: IBOCreator
│   │   │   └─► Level 4: IBatchCreateBOHelper                           [LEAF - MAX DEPTH]
│   │   ├─► Level 3: IBOAdmin                                           [LEAF]
│   │   ├─► Level 3: IBOAssistant                                       [LEAF]
│   │   ├─► Level 3: IBOAttendee                                        [LEAF]
│   │   └─► Level 3: IBOData                                            [LEAF]
│   │
│   ├─► Level 2: IMeetingAICompanionController
│   │   ├─► Level 3: IMeetingSmartSummaryHelper                         [LEAF - DEPRECATED]
│   │   ├─► Level 3: IMeetingAICompanionSmartSummaryHelper              [LEAF]
│   │   └─► Level 3: IMeetingAICompanionQueryHelper                     [LEAF]
│   │
│   │   ══════════════════════════════════════════════════════════════
│   │   WINDOWS-ONLY CONTROLLERS (#if defined(WIN32))
│   │   ══════════════════════════════════════════════════════════════
│   │
│   ├─► Level 2: IMeetingUIController                                   [LEAF - Windows]
│   │
│   ├─► Level 2: IAnnotationController
│   │   └─► Level 3: ICustomizedAnnotationController                    [LEAF - Custom UI]
│   │
│   ├─► Level 2: IMeetingRemoteController                               [LEAF - Windows]
│   ├─► Level 2: IMeetingH323Helper                                     [LEAF - Windows]
│   ├─► Level 2: IMeetingPhoneHelper                                    [LEAF - Windows]
│   ├─► Level 2: IMeetingLiveStreamController                           [LEAF - Windows]
│   ├─► Level 2: IClosedCaptionController                               [LEAF - Windows]
│   ├─► Level 2: IZoomRealNameAuthMeetingHelper                         [LEAF - Windows]
│   ├─► Level 2: IMeetingQAController                                   [LEAF - Windows]
│   ├─► Level 2: IMeetingInterpretationController                       [LEAF - Windows]
│   ├─► Level 2: IMeetingSignInterpretationController                   [LEAF - Windows]
│   ├─► Level 2: IEmojiReactionController                               [LEAF - Windows]
│   ├─► Level 2: IMeetingAANController         
```