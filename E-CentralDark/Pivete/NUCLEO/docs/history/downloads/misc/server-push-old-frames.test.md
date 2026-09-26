# OUTRO - server-push-old-frames.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\server-push-old-frames.test.ts
**SHA:** 478533acf1f61938
**Timestamp:** 2026-08-23T14:16:06.780915
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const requestStart = new Date("2024-01-15T00:00:00Z");

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Test to reproduce: Server push sends old frames as if they're current
 * 
 * User report: "looks its still sending frames from 30 min ago and saying its now"
 * 
 * Scenario:
 * - Multiple monitors being recorded (monitor_1, monitor_5)
 * - monitor_5 stopped recording at 12:15 PM
 * - monitor_1 continues recording
 * - Timeline shows interleaved frames from both monitors
 * - Old frames from stopped monitor appear with recent timestamps
 */

import { describe, it, expect } from "bun:test";

interface FrameChunk {
  frame_id: number;
  timestamp: Date;
  device_name: string;
  app_name: string;
  content: string;
}

interface StreamTimeSeriesResponse {
  timestamp: Date;
  devices: {
    device_id: string;
    frame_id: number;
    metadata: {
      app_name: string;
      ocr_text: string;
    };
  }[];
}

// Simulate database query
function findVideoChunks(frames: FrameChunk[], since: Date, until: Date): FrameChunk[] {
  return frames.filter(f => f.timestamp >= since && f.timestamp <= until);
}

// Simulate create_time_series_frame - groups frames by timestamp
function createTimeSeriesFrame(chunks: FrameChunk[]): Map<string, StreamTimeSeriesResponse> {
  const byTimestamp = new Map<string, StreamTimeSeriesResponse>();
  
  for (const chunk of chunks) {
    const key = chunk.timestamp.toISOString();
    
    if (!byTimestamp.has(key)) {
      byTimestamp.set(key, {
        timestamp: chunk.timestamp,
        devices: [],
      });
    }
    
    byTimestamp.get(key)!.devices.push({
      device_id: chunk.device_name,
      frame_id: chunk.frame_id,
      metadata: {
        app_name: chunk.app_name,
        ocr_text: chunk.content,
      },
    });
  }
  
  return byTimestamp;
}

describe("BUG: Server Push Old Frames As Current", () => {
  
  /**
   * Reproduce the multi-monitor interleaving issue
   */
  it("should NOT mix frames from stopped monitor with current monitor", () => {
    // Simulate the database state
    const dbFrames: FrameChunk[] = [
      // monitor_5 frames (stopped at 12:15 PM = 20:15 UTC)
      { frame_id: 1000, timestamp: new Date("2024-01-15T20:10:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "current work" },
      { frame_id: 1001, timestamp: new Date("2024-01-15T20:12:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "current work 2" },
      { frame_id: 1002, timestamp: new Date("2024-01-15T20:15:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "last frame before stop" },
      
      // monitor_1 frames (continues recording - has pitch deck open)
      { frame_id: 2000, timestamp: new Date("2024-01-15T20:10:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      { frame_id: 2001, timestamp: new Date("2024-01-15T20:12:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      { frame_id: 2002, timestamp: new Date("2024-01-15T20:15:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      
      // monitor_1 continues after monitor_5 stopped
      { frame_id: 2003, timestamp: new Date("2024-01-15T20:30:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
      { frame_id: 2004, timestamp: new Date("2024-01-15T20:45:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
      { frame_id: 2005, timestamp: new Date("2024-01-15T20:52:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
    ];
    
    // Timeline requests frames from start of day to NOW (12:52 PM = 20:52 UTC)
    const requestStart = new Date("2024-01-15T00:00:00Z");
    const requestEnd = new Date("2024-01-15T20:52:00Z");
    
    const chunks = findVideoChunks(dbFrames, requestStart, requestEnd);
    const grouped = createTimeSeriesFrame(chunks);
    
    // At 20:52, when poll runs, it should only show:
    // - monitor_1 at 20:52 (current)
    // NOT interleaved with old monitor_5 frames
    
    // Current behavior: ALL frames are returned grouped by timestamp
    // This causes old monitor_5 frames to appear alongside monitor_1 frames
    
    const frameAt2052 = grouped.get("2024-01-15T20:52:00.000Z");
    expect(frameAt2052).toBeDefined();
    expect(frameAt2052!.devices.length).toBe(1);
    expect(frameAt2052!.devices[0].device_id).toBe("monitor_1");
    
    // The issue: when client requests "live" frames, it gets ALL monitors
    // even if one monitor stopped recording 30 min ago
    console.log("Frames at 20:52:", frameAt2052);
  });

  /**
   * The REAL bug: Poll sends frames based on timestamp, not frame_id progression
   */
  it("BUG: poll uses timestamp range but should use frame_id for tracking", () => {
    const sentFrameIds = new Set<number>();
    
    // Frames in DB - note the timestamps and IDs
    const dbFrames: FrameChunk[] = [
      // Old frame that wasn't sent yet (maybe from batch insert or sync)
      { frame_id: 500, timestamp: ne
```

---

# OUTRO - server-push-old-frames.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\server-push-old-frames.test.ts
**SHA:** 478533acf1f61938c4a5d2b3a0f59d4bc6c11487c30f8fc387396558c3730cef
**Timestamp:** 2026-08-23T23:43:37.234261
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const requestStart = new Date("2024-01-15T00:00:00Z");

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Test to reproduce: Server push sends old frames as if they're current
 * 
 * User report: "looks its still sending frames from 30 min ago and saying its now"
 * 
 * Scenario:
 * - Multiple monitors being recorded (monitor_1, monitor_5)
 * - monitor_5 stopped recording at 12:15 PM
 * - monitor_1 continues recording
 * - Timeline shows interleaved frames from both monitors
 * - Old frames from stopped monitor appear with recent timestamps
 */

import { describe, it, expect } from "bun:test";

interface FrameChunk {
  frame_id: number;
  timestamp: Date;
  device_name: string;
  app_name: string;
  content: string;
}

interface StreamTimeSeriesResponse {
  timestamp: Date;
  devices: {
    device_id: string;
    frame_id: number;
    metadata: {
      app_name: string;
      ocr_text: string;
    };
  }[];
}

// Simulate database query
function findVideoChunks(frames: FrameChunk[], since: Date, until: Date): FrameChunk[] {
  return frames.filter(f => f.timestamp >= since && f.timestamp <= until);
}

// Simulate create_time_series_frame - groups frames by timestamp
function createTimeSeriesFrame(chunks: FrameChunk[]): Map<string, StreamTimeSeriesResponse> {
  const byTimestamp = new Map<string, StreamTimeSeriesResponse>();
  
  for (const chunk of chunks) {
    const key = chunk.timestamp.toISOString();
    
    if (!byTimestamp.has(key)) {
      byTimestamp.set(key, {
        timestamp: chunk.timestamp,
        devices: [],
      });
    }
    
    byTimestamp.get(key)!.devices.push({
      device_id: chunk.device_name,
      frame_id: chunk.frame_id,
      metadata: {
        app_name: chunk.app_name,
        ocr_text: chunk.content,
      },
    });
  }
  
  return byTimestamp;
}

describe("BUG: Server Push Old Frames As Current", () => {
  
  /**
   * Reproduce the multi-monitor interleaving issue
   */
  it("should NOT mix frames from stopped monitor with current monitor", () => {
    // Simulate the database state
    const dbFrames: FrameChunk[] = [
      // monitor_5 frames (stopped at 12:15 PM = 20:15 UTC)
      { frame_id: 1000, timestamp: new Date("2024-01-15T20:10:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "current work" },
      { frame_id: 1001, timestamp: new Date("2024-01-15T20:12:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "current work 2" },
      { frame_id: 1002, timestamp: new Date("2024-01-15T20:15:00Z"), device_name: "monitor_5", app_name: "WezTerm", content: "last frame before stop" },
      
      // monitor_1 frames (continues recording - has pitch deck open)
      { frame_id: 2000, timestamp: new Date("2024-01-15T20:10:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      { frame_id: 2001, timestamp: new Date("2024-01-15T20:12:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      { frame_id: 2002, timestamp: new Date("2024-01-15T20:15:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck content" },
      
      // monitor_1 continues after monitor_5 stopped
      { frame_id: 2003, timestamp: new Date("2024-01-15T20:30:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
      { frame_id: 2004, timestamp: new Date("2024-01-15T20:45:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
      { frame_id: 2005, timestamp: new Date("2024-01-15T20:52:00Z"), device_name: "monitor_1", app_name: "Arc", content: "pitch deck - still showing" },
    ];
    
    // Timeline requests frames from start of day to NOW (12:52 PM = 20:52 UTC)
    const requestStart = new Date("2024-01-15T00:00:00Z");
    const requestEnd = new Date("2024-01-15T20:52:00Z");
    
    const chunks = findVideoChunks(dbFrames, requestStart, requestEnd);
    const grouped = createTimeSeriesFrame(chunks);
    
    // At 20:52, when poll runs, it should only show:
    // - monitor_1 at 20:52 (current)
    // NOT interleaved with old monitor_5 frames
    
    // Current behavior: ALL frames are returned grouped by timestamp
    // This causes old monitor_5 frames to appear alongside monitor_1 frames
    
    const frameAt2052 = grouped.get("2024-01-15T20:52:00.000Z");
    expect(frameAt2052).toBeDefined();
    expect(frameAt2052!.devices.length).toBe(1);
    expect(frameAt2052!.devices[0].device_id).toBe("monitor_1");
    
    // The issue: when client requests "live" frames, it gets ALL monitors
    // even if one monitor stopped recording 30 min ago
    console.log("Frames at 20:52:", frameAt2052);
  });

  /**
   * The REAL bug: Poll sends frames based on timestamp, not frame_id progression
   */
  it("BUG: poll uses timestamp range but should use frame_id for tracking", () => {
    const sentFrameIds = new Set<number>();
    
    // Frames in DB - note the timestamps and IDs
    const dbFrames: FrameChunk[] = [
      // Old frame that wasn't sent yet (maybe from batch insert or sync)
      { frame_id: 500, timestamp: ne
```