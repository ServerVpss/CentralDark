# OUTRO - server-poll-logic.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\server-poll-logic.test.ts
**SHA:** 2632deb5e223f504
**Timestamp:** 2026-08-23T14:16:06.793224
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const pollStart = lastPolled;
- const badPollStart = badLastPolled;
- const pollStart = activeRequest.last_polled;
- const pollStart = activeRequest.last_polled; // 00:00:00
- const pollStart = activeRequest.last_polled; // Still 00:00:00

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests to reproduce server-side poll_timer issue
 *
 * The bug: New frames are captured to DB but not pushed to client in real-time.
 * User must right-click refresh to see new frames.
 *
 * This test simulates the server-side logic to identify the root cause.
 */

import { describe, it, expect, beforeEach } from "bun:test";

// Simulate the server-side data structures
interface FrameChunk {
  frame_id: number;
  timestamp: Date;
  data: string;
}

interface ActiveRequest {
  start_time: Date;
  end_time: Date;
  is_descending: boolean;
  last_polled: Date;
}

// Simulate database
function createMockDb(frames: FrameChunk[]) {
  return {
    find_video_chunks: (since: Date, until: Date): FrameChunk[] => {
      return frames.filter(f => f.timestamp >= since && f.timestamp <= until);
    }
  };
}

describe("Server Poll Logic - Reproducing Real-Time Push Bug", () => {

  /**
   * TEST 1: Simulate initial fetch marking frames as sent
   */
  it("initial fetch should mark all fetched frame IDs as sent", () => {
    const sentFrameIds = new Set<number>();

    // Simulate initial frames in DB (frames from today, 00:00 to now)
    const initialFrames: FrameChunk[] = [
      { frame_id: 1, timestamp: new Date("2024-01-15T10:00:00Z"), data: "frame1" },
      { frame_id: 2, timestamp: new Date("2024-01-15T10:01:00Z"), data: "frame2" },
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
    ];

    // Simulate fetch_and_process_frames_with_tracking
    for (const frame of initialFrames) {
      sentFrameIds.add(frame.frame_id);
    }

    expect(sentFrameIds.size).toBe(3);
    expect(sentFrameIds.has(1)).toBe(true);
    expect(sentFrameIds.has(2)).toBe(true);
    expect(sentFrameIds.has(3)).toBe(true);
  });

  /**
   * TEST 2: Poll should find NEW frames (not in sentFrameIds)
   */
  it("poll should find new frames not in sentFrameIds", () => {
    const sentFrameIds = new Set<number>([1, 2, 3]); // Already sent

    // New frame captured after initial fetch
    const allFrames: FrameChunk[] = [
      { frame_id: 1, timestamp: new Date("2024-01-15T10:00:00Z"), data: "frame1" },
      { frame_id: 2, timestamp: new Date("2024-01-15T10:01:00Z"), data: "frame2" },
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
      { frame_id: 4, timestamp: new Date("2024-01-15T10:03:00Z"), data: "frame4" }, // NEW
    ];

    const db = createMockDb(allFrames);

    // Simulate poll: look for frames from last_polled to now
    const lastPolled = new Date("2024-01-15T10:02:00Z");
    const now = new Date("2024-01-15T10:04:00Z");

    const chunks = db.find_video_chunks(lastPolled, now);
    const newFrames = chunks.filter(f => !sentFrameIds.has(f.frame_id));

    expect(newFrames.length).toBe(1);
    expect(newFrames[0].frame_id).toBe(4);
  });

  /**
   * TEST 3: BUG REPRODUCTION - last_polled equals latest frame timestamp
   *
   * If last_polled is set to the timestamp of the latest frame (not the current time),
   * and new frames have timestamps AFTER that, they should be found.
   *
   * But what if find_video_chunks uses > instead of >= ?
   */
  it("should find frames with timestamp > last_polled", () => {
    const sentFrameIds = new Set<number>([1, 2, 3]);

    const allFrames: FrameChunk[] = [
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
      { frame_id: 4, timestamp: new Date("2024-01-15T10:02:01Z"), data: "frame4" }, // 1 second later
    ];

    // last_polled is exactly the timestamp of frame 3
    const lastPolled = new Date("2024-01-15T10:02:00Z");
    const now = new Date("2024-01-15T10:04:00Z");

    // Simulate find_video_chunks with >= (inclusive)
    const chunksInclusive = allFrames.filter(f => f.timestamp >= lastPolled && f.timestamp <= now);
    const newFramesInclusive = chunksInclusive.filter(f => !sentFrameIds.has(f.frame_id));

    // Frame 4 should be found
    expect(newFramesInclusive.length).toBe(1);
    expect(newFramesInclusive[0].frame_id).toBe(4);
  });

  /**
   * TEST 4: BUG - What if poll_start >= poll_end?
   *
   * Server code: if poll_start < poll_end { ... }
   * If this fails, no poll happens!
   */
  it("POTENTIAL BUG: poll_start < poll_end check", () => {
    const lastPolled = new Date("2024-01-15T10:02:00.000Z");
    const now = new Date("2024-01-15T10:02:00.500Z"); // Only 500ms later
    const endTime = new Date("2024-01-15T23:59:59.999Z");

    const pollStart = lastPolled;
    const pollEnd = now < endTime ? now : endTime;

    // This should pass - 500ms gap
    expect(pollStart < pollEnd).toBe(true);

    // But what if last_polled was set to a future timestamp by mistake?
    const badLastPolled = new Date("2024-01-15T10:05:00.000Z"); // In the future!
    const badPollStart = badLastPolled;

    // This would FAIL - no poll would happen
    expect(badPollStart < pollEnd).toBe(false);
  });

  /**
   * TEST 5: BUG - last_polled set to latest frame, but frames captured
```

---

# OUTRO - server-poll-logic.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\server-poll-logic.test.ts
**SHA:** 2632deb5e223f50417b03723e5383bc3e9932160d8ad44d4c457560fc21c728c
**Timestamp:** 2026-08-23T23:43:30.650678
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const pollStart = lastPolled;
- const badPollStart = badLastPolled;
- const pollStart = activeRequest.last_polled;
- const pollStart = activeRequest.last_polled; // 00:00:00
- const pollStart = activeRequest.last_polled; // Still 00:00:00

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests to reproduce server-side poll_timer issue
 *
 * The bug: New frames are captured to DB but not pushed to client in real-time.
 * User must right-click refresh to see new frames.
 *
 * This test simulates the server-side logic to identify the root cause.
 */

import { describe, it, expect, beforeEach } from "bun:test";

// Simulate the server-side data structures
interface FrameChunk {
  frame_id: number;
  timestamp: Date;
  data: string;
}

interface ActiveRequest {
  start_time: Date;
  end_time: Date;
  is_descending: boolean;
  last_polled: Date;
}

// Simulate database
function createMockDb(frames: FrameChunk[]) {
  return {
    find_video_chunks: (since: Date, until: Date): FrameChunk[] => {
      return frames.filter(f => f.timestamp >= since && f.timestamp <= until);
    }
  };
}

describe("Server Poll Logic - Reproducing Real-Time Push Bug", () => {

  /**
   * TEST 1: Simulate initial fetch marking frames as sent
   */
  it("initial fetch should mark all fetched frame IDs as sent", () => {
    const sentFrameIds = new Set<number>();

    // Simulate initial frames in DB (frames from today, 00:00 to now)
    const initialFrames: FrameChunk[] = [
      { frame_id: 1, timestamp: new Date("2024-01-15T10:00:00Z"), data: "frame1" },
      { frame_id: 2, timestamp: new Date("2024-01-15T10:01:00Z"), data: "frame2" },
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
    ];

    // Simulate fetch_and_process_frames_with_tracking
    for (const frame of initialFrames) {
      sentFrameIds.add(frame.frame_id);
    }

    expect(sentFrameIds.size).toBe(3);
    expect(sentFrameIds.has(1)).toBe(true);
    expect(sentFrameIds.has(2)).toBe(true);
    expect(sentFrameIds.has(3)).toBe(true);
  });

  /**
   * TEST 2: Poll should find NEW frames (not in sentFrameIds)
   */
  it("poll should find new frames not in sentFrameIds", () => {
    const sentFrameIds = new Set<number>([1, 2, 3]); // Already sent

    // New frame captured after initial fetch
    const allFrames: FrameChunk[] = [
      { frame_id: 1, timestamp: new Date("2024-01-15T10:00:00Z"), data: "frame1" },
      { frame_id: 2, timestamp: new Date("2024-01-15T10:01:00Z"), data: "frame2" },
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
      { frame_id: 4, timestamp: new Date("2024-01-15T10:03:00Z"), data: "frame4" }, // NEW
    ];

    const db = createMockDb(allFrames);

    // Simulate poll: look for frames from last_polled to now
    const lastPolled = new Date("2024-01-15T10:02:00Z");
    const now = new Date("2024-01-15T10:04:00Z");

    const chunks = db.find_video_chunks(lastPolled, now);
    const newFrames = chunks.filter(f => !sentFrameIds.has(f.frame_id));

    expect(newFrames.length).toBe(1);
    expect(newFrames[0].frame_id).toBe(4);
  });

  /**
   * TEST 3: BUG REPRODUCTION - last_polled equals latest frame timestamp
   *
   * If last_polled is set to the timestamp of the latest frame (not the current time),
   * and new frames have timestamps AFTER that, they should be found.
   *
   * But what if find_video_chunks uses > instead of >= ?
   */
  it("should find frames with timestamp > last_polled", () => {
    const sentFrameIds = new Set<number>([1, 2, 3]);

    const allFrames: FrameChunk[] = [
      { frame_id: 3, timestamp: new Date("2024-01-15T10:02:00Z"), data: "frame3" },
      { frame_id: 4, timestamp: new Date("2024-01-15T10:02:01Z"), data: "frame4" }, // 1 second later
    ];

    // last_polled is exactly the timestamp of frame 3
    const lastPolled = new Date("2024-01-15T10:02:00Z");
    const now = new Date("2024-01-15T10:04:00Z");

    // Simulate find_video_chunks with >= (inclusive)
    const chunksInclusive = allFrames.filter(f => f.timestamp >= lastPolled && f.timestamp <= now);
    const newFramesInclusive = chunksInclusive.filter(f => !sentFrameIds.has(f.frame_id));

    // Frame 4 should be found
    expect(newFramesInclusive.length).toBe(1);
    expect(newFramesInclusive[0].frame_id).toBe(4);
  });

  /**
   * TEST 4: BUG - What if poll_start >= poll_end?
   *
   * Server code: if poll_start < poll_end { ... }
   * If this fails, no poll happens!
   */
  it("POTENTIAL BUG: poll_start < poll_end check", () => {
    const lastPolled = new Date("2024-01-15T10:02:00.000Z");
    const now = new Date("2024-01-15T10:02:00.500Z"); // Only 500ms later
    const endTime = new Date("2024-01-15T23:59:59.999Z");

    const pollStart = lastPolled;
    const pollEnd = now < endTime ? now : endTime;

    // This should pass - 500ms gap
    expect(pollStart < pollEnd).toBe(true);

    // But what if last_polled was set to a future timestamp by mistake?
    const badLastPolled = new Date("2024-01-15T10:05:00.000Z"); // In the future!
    const badPollStart = badLastPolled;

    // This would FAIL - no poll would happen
    expect(badPollStart < pollEnd).toBe(false);
  });

  /**
   * TEST 5: BUG - last_polled set to latest frame, but frames captured
```