# MISSAO - web-reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\web\references\web-reference.md
**SHA:** 886cebefbf122d59
**Timestamp:** 2026-08-26T18:42:52.983198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- This reference provides the complete API for the Zoom Video SDK for Web. The SDK follows a hierarchical pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Zoom Video SDK Web - API Reference

## Overview

This reference provides the complete API for the Zoom Video SDK for Web. The SDK follows a hierarchical pattern:

```
ZoomVideo (module)
  └── VideoClient (singleton)
      ├── Stream (media operations)
      └── Feature Clients (chat, recording, etc.)
```

**Official API Reference**: https://marketplacefront.zoom.us/sdk/custom/web/modules.html

---

## Level 0: ZoomVideo Module

### Static Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `createClient()` | `VideoClient` | Creates/returns the singleton client |
| `destroyClient()` | `Promise<void>` | Destroys the client instance |
| `checkSystemRequirements()` | `MediaCompatibility` | Check browser compatibility |
| `checkFeatureRequirements()` | `SupportFeatures` | Check feature support |
| `getDevices(skip?)` | `Promise<MediaDeviceInfo[]>` | Enumerate media devices |
| `preloadDependentAssets(path?)` | `void` | Preload SDK assets |
| `createLocalVideoTrack(id?)` | `LocalVideoTrack` | Create local video track for preview |
| `createLocalAudioTrack(id?)` | `LocalAudioTrack` | Create local audio track for preview |
| `VERSION` | `string` | SDK version |

### MediaCompatibility Interface

```typescript
interface MediaCompatibility {
  audio: boolean;   // Audio support
  video: boolean;   // Video support
  screen: boolean;  // Screen share support
}
```

### SupportFeatures Interface

```typescript
interface SupportFeatures {
  platform: string;           // Browser/platform info
  supportFeatures: string[];  // Supported features
  unSupportFeatures: string[]; // Unsupported features
}
```

---

## Level 1: VideoClient

### Session Lifecycle

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `init` | `(language, dependentAssets, options?)` | `ExecutedResult` | Initialize SDK |
| `join` | `(topic, token, userName, password?, timeout?)` | `ExecutedResult` | Join session |
| `leave` | `(end?)` | `ExecutedResult` | Leave/end session |
| `on` | `(event, callback)` | `void` | Subscribe to events |
| `off` | `(event, callback)` | `void` | Unsubscribe from events |

### InitOptions Interface

```typescript
interface InitOptions {
  patchJsMedia?: boolean;      // Patch JS media (recommended: true)
  webrtc?: boolean;            // Enable WebRTC mode for HD
  enforceMultipleVideos?: boolean; // Force multi-video mode
  stayAwake?: boolean;         // Prevent screen sleep
}
```

### Participant Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getAllUser()` | `Participant[]` | Get all participants |
| `getCurrentUserInfo()` | `Participant` | Get current user |
| `getUser(userId)` | `Participant \| undefined` | Get user by ID |
| `getSessionHost()` | `Participant \| undefined` | Get session host |
| `getSessionInfo()` | `SessionInfo` | Get session info |
| `isHost()` | `boolean` | Is current user host |
| `isManager()` | `boolean` | Is current user manager |
| `isOriginalHost()` | `boolean` | Is current user original host |

### Host Controls

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `makeHost` | `(userId)` | `ExecutedResult` | Make user host |
| `makeManager` | `(userId)` | `ExecutedResult` | Make user manager |
| `revokeManager` | `(userId)` | `ExecutedResult` | Remove manager |
| `removeUser` | `(userId)` | `ExecutedResult` | Remove user from session |
| `changeName` | `(name, userId?)` | `ExecutedResult` | Change display name |
| `reclaimHost` | `()` | `ExecutedResult` | Reclaim host (original host only) |

### Feature Client Getters

| Method | Returns | Description |
|--------|---------|-------------|
| `getMediaStream()` | `Stream` | Get media stream (AFTER join!) |
| `getChatClient()` | `ChatClient` | Get chat client |
| `getCommandClient()` | `CommandChannel` | Get command channel |
| `getRecordingClient()` | `RecordingClient` | Get recording client |
| `getLiveTranscriptionClient()` | `LiveTranscriptionClient` | Get transcription client |
| `getLiveStreamClient()` | `LiveStreamClient` | Get live stream client |
| `getSubsessionClient()` | `SubsessionClient` | Get subsession client |
| `getWhiteboardClient()` | `WhiteboardClient` | Get whiteboard client |
| `getBroadcastStreamingClient()` | `BroadcastStreamingClient` | Get broadcast client |
| `getRealTimeMediaStreamsClient()` | `RealTimeMediaStreamsClient` | Get RTMS client |
| `getLoggerClient(options?)` | `LoggerClient` | Get logger client |

### Participant Interface

```typescript
interface Participant {
  userId: number;           // Unique user ID
  displayName: string;      // Display name
  bVideoOn: boolean;        // Is video on
  muted: boolean;           // Is audio muted
  audio: '' | 'computer' | 'phone';  // Audio type
  sharerOn: boolean;        // Is sharing screen
  bShareAudioOn: boolean;   // Is sharing audio
  isHost: boolean;          // Is host
}
```

---

## Level 2: S
```