# COMANDO - breakout-rooms.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\references\breakout-rooms.md
**SHA:** ba836ee9c02102ea
**Timestamp:** 2026-08-26T18:42:53.509252
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- @interface MyDelegate : NSObject <MobileRTCMeetingServiceDelegate>

### Ouro Bruto (primeiros 5000 chars)
```
# Breakout Rooms

Programmatically manage breakout rooms in Zoom meetings across all platforms.

## Overview

Breakout rooms allow hosts to split meeting participants into smaller groups. This guide covers SDK APIs for creating, managing, and controlling breakout rooms.

## Platform Support

| Platform | Support Level | Notes |
|----------|---------------|-------|
| **Web SDK** | Full | Complete API |
| **iOS SDK** | Full | Creator + Admin helpers |
| **Android SDK** | Full | Creator + Admin helpers |
| **Windows SDK** | Full | Controller interface |
| **macOS SDK** | Full | Controller interface |
| **Linux SDK** | Limited | Basic functionality only |
| **Video SDK** | Different | Uses "Subsessions" - not native breakout rooms |

**Important:** Video SDK does NOT have native breakout rooms. It uses a "Subsessions" concept requiring manual session management.

## REST API: Pre-assigned Rooms

Create meetings with pre-assigned breakout rooms:

```bash
POST /v2/users/{userId}/meetings
```

```json
{
  "topic": "Team Workshop",
  "type": 2,
  "settings": {
    "breakout_room": {
      "enable": true,
      "rooms": [
        {
          "name": "Team Alpha",
          "participants": ["user1@example.com", "user2@example.com"]
        },
        {
          "name": "Team Beta",
          "participants": ["user3@example.com", "user4@example.com"]
        }
      ]
    }
  }
}
```

**Limitation:** Pre-assigned rooms are NOT auto-opened. The host must manually open breakout rooms when the meeting starts. There is NO REST API to auto-open rooms.

---

## Web SDK Implementation

### Create Breakout Rooms

```javascript
// Create 5 rooms with auto-generated names (Room 1, Room 2, etc.)
ZoomMtg.BreakoutRoom.createBreakoutRoom({
  data: 5,
  success: (response) => console.log('Rooms created:', response),
  error: (error) => console.error('Error:', error)
});

// Create named rooms
ZoomMtg.BreakoutRoom.createBreakoutRoom({
  data: [
    { name: 'Engineering' },
    { name: 'Design' },
    { name: 'Product' }
  ],
  success: (response) => console.log('Rooms created:', response),
  error: (error) => console.error('Error:', error)
});
```

### Get Breakout Rooms

```javascript
ZoomMtg.BreakoutRoom.getBreakoutRooms({
  success: (response) => {
    const rooms = response.result.rooms;
    rooms.forEach(room => {
      console.log(`Room ID: ${room.boId}, Name: ${room.name}`);
    });
  },
  error: (error) => console.error('Error:', error)
});
```

### Assign Participants

```javascript
// Get unassigned attendees first
ZoomMtg.BreakoutRoom.getUnassignedAttendeeList({
  success: (response) => {
    const unassigned = response.result.unassignedAttendeeList;
    console.log('Unassigned:', unassigned);
  }
});

// Assign user to a room
ZoomMtg.BreakoutRoom.assignUserToBreakoutRoom({
  targetRoomId: 'room-id-here',
  userId: 12345678,
  success: (response) => console.log('Assigned:', response),
  error: (error) => console.error('Error:', error)
});
```

### Move Participants Between Rooms

```javascript
ZoomMtg.BreakoutRoom.moveUserToBreakoutRoom({
  targetRoomId: 'destination-room-id',
  userId: 12345678,
  success: (response) => console.log('Moved:', response),
  error: (error) => console.error('Error:', error)
});
```

### Open Breakout Rooms

```javascript
ZoomMtg.BreakoutRoom.openBreakoutRooms({
  options: {
    isAutoJoinRoom: false,              // Let participants choose
    isBackToMainSessionEnabled: true,   // Allow returning to main
    isTimerEnabled: true,               // Enable countdown
    timerDuration: 1800,                // 30 minutes (seconds)
    needCountDown: true,                // Show countdown
    waitSeconds: 60                     // Wait before auto-join
  },
  success: (response) => console.log('Rooms opened:', response),
  error: (error) => console.error('Error:', error)
});
```

### Close Breakout Rooms

```javascript
ZoomMtg.BreakoutRoom.closeBreakoutRooms({
  success: (response) => console.log('Rooms closed:', response),
  error: (error) => console.error('Error:', error)
});
```

### Broadcast Message

```javascript
ZoomMtg.BreakoutRoom.broadcast({
  message: 'Please return to the main room in 2 minutes',
  success: (response) => console.log('Broadcast sent:', response),
  error: (error) => console.error('Error:', error)
});
```

### Check User Status

```javascript
// Get current user's breakout room
ZoomMtg.BreakoutRoom.getCurrentBreakoutRoom({
  success: (response) => {
    const { roomId, name, attendeeStatus } = response.result;
    console.log(`Current room: ${name}, Status: ${attendeeStatus}`);
  }
});

// attendeeStatus values:
// 1: UNASSIGNED - Not assigned to any room
// 2: ASSIGNED_NOT_JOIN - Assigned but hasn't joined yet
// 3: IN_BO - Currently in breakout room
```

---

## iOS SDK Implementation

### Get Helpers

```objc
#import <MobileRTC/MobileRTC.h>

// Get meeting service
MobileRTCMeetingService *meetingService = [[MobileRTC sharedRTC] getMeetingService];

// Get breakout roo
```