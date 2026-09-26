# OUTRO - window-focus-refresh.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\window-focus-refresh.test.ts
**SHA:** fa3b55ab704f7a69
**Timestamp:** 2026-08-23T14:16:06.924274
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let fetchTimeRangeArgs: { start: Date; end: Date } | null;
- fetchTimeRangeArgs = { start: startTime, end: endTime };

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for window focus refresh functionality
 *
 * The bug: When user opens timeline at 6:30, closes it, then reopens at 7:00,
 * it still shows 6:30 frames instead of fetching new ones.
 *
 * Root cause: `sentRequests` Set prevents re-fetching the same date.
 *
 * Fix: Add `onWindowFocus()` method that clears current date from sentRequests
 * and triggers a fresh fetch.
 */

import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";

// Mock the store's internal state
interface MockTimelineState {
  frames: any[];
  sentRequests: Set<string>;
  currentDate: Date;
  websocket: { readyState: number; send: (data: string) => void } | null;
  isLoading: boolean;
}

// Helper to create date key (matches store implementation)
function getDateKey(date: Date): string {
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
}

describe("Window Focus Refresh - sentRequests clearing", () => {
  let state: MockTimelineState;
  let fetchTimeRangeCalled: boolean;
  let fetchTimeRangeArgs: { start: Date; end: Date } | null;

  beforeEach(() => {
    fetchTimeRangeCalled = false;
    fetchTimeRangeArgs = null;

    state = {
      frames: [],
      sentRequests: new Set<string>(),
      currentDate: new Date("2024-01-15T18:30:00Z"), // 6:30 PM
      websocket: {
        readyState: 1, // WebSocket.OPEN
        send: mock(() => {}),
      },
      isLoading: false,
    };
  });

  /**
   * TEST 1: Verify sentRequests blocks re-fetch for same date
   */
  it("sentRequests should block duplicate fetch for same date", () => {
    const today = new Date("2024-01-15T18:30:00Z");
    const dateKey = getDateKey(today);

    // Simulate: first fetch at 6:30 PM
    state.sentRequests.add(dateKey);

    // Verify: key exists
    expect(state.sentRequests.has(dateKey)).toBe(true);

    // Simulate: fetchTimeRange check (from actual store code)
    const shouldSkip = state.sentRequests.has(dateKey);
    expect(shouldSkip).toBe(true); // This is the bug - we skip!
  });

  /**
   * TEST 2: onWindowFocus should clear current date from sentRequests
   */
  it("onWindowFocus should clear current date from sentRequests", () => {
    const today = new Date("2024-01-15T19:00:00Z"); // 7:00 PM
    state.currentDate = today;
    const dateKey = getDateKey(today);

    // Simulate: date was fetched earlier at 6:30
    state.sentRequests.add(dateKey);
    expect(state.sentRequests.has(dateKey)).toBe(true);

    // Simulate: onWindowFocus() implementation
    function onWindowFocus() {
      const currentDateKey = getDateKey(state.currentDate);
      state.sentRequests.delete(currentDateKey);
    }

    // Call onWindowFocus
    onWindowFocus();

    // Verify: key is cleared
    expect(state.sentRequests.has(dateKey)).toBe(false);
  });

  /**
   * TEST 3: After onWindowFocus, fetchTimeRange should be allowed
   */
  it("fetchTimeRange should be allowed after onWindowFocus clears sentRequests", () => {
    const today = new Date("2024-01-15T19:00:00Z");
    state.currentDate = today;
    const dateKey = getDateKey(today);

    // Setup: date was already fetched
    state.sentRequests.add(dateKey);

    // Simulate fetchTimeRange logic
    function fetchTimeRange(startTime: Date, endTime: Date): boolean {
      const requestKey = getDateKey(startTime);
      if (state.sentRequests.has(requestKey)) {
        return false; // Skipped
      }
      // Would send WebSocket request here
      state.sentRequests.add(requestKey);
      fetchTimeRangeCalled = true;
      fetchTimeRangeArgs = { start: startTime, end: endTime };
      return true; // Sent
    }

    // Before onWindowFocus: should skip
    const startTime = new Date(today);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(today);
    endTime.setHours(23, 59, 59, 999);

    let result = fetchTimeRange(startTime, endTime);
    expect(result).toBe(false); // Blocked!
    expect(fetchTimeRangeCalled).toBe(false);

    // Call onWindowFocus
    state.sentRequests.delete(dateKey);

    // After onWindowFocus: should work
    result = fetchTimeRange(startTime, endTime);
    expect(result).toBe(true); // Allowed!
    expect(fetchTimeRangeCalled).toBe(true);
  });

  /**
   * TEST 4: onWindowFocus should only clear current date, not other dates
   */
  it("onWindowFocus should only clear current date, preserve other dates", () => {
    const today = new Date("2024-01-15T19:00:00Z");
    const yesterday = new Date("2024-01-14T12:00:00Z");
    state.currentDate = today;

    const todayKey = getDateKey(today);
    const yesterdayKey = getDateKey(yesterday);

    // Both dates were fetched
    state.sentRequests.add(todayKey);
    state.sentRequests.add(yesterdayKey);

    // onWindowFocus only clears current date
    function onWindowFocus() {
      const currentDateKey = getDateKey(state.currentDate);
      state.sentRequests.delete(currentDateKey);
    }

    onWindowFocus();

    // Today cleared, yesterday preserved
    expect(state.sentRequest
```

---

# OUTRO - window-focus-refresh.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\window-focus-refresh.test.ts
**SHA:** fa3b55ab704f7a690f4c97d2a6502f708a63ed511ef364dac082ad8b918c3606
**Timestamp:** 2026-08-23T23:43:36.580507
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let fetchTimeRangeArgs: { start: Date; end: Date } | null;
- fetchTimeRangeArgs = { start: startTime, end: endTime };

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for window focus refresh functionality
 *
 * The bug: When user opens timeline at 6:30, closes it, then reopens at 7:00,
 * it still shows 6:30 frames instead of fetching new ones.
 *
 * Root cause: `sentRequests` Set prevents re-fetching the same date.
 *
 * Fix: Add `onWindowFocus()` method that clears current date from sentRequests
 * and triggers a fresh fetch.
 */

import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";

// Mock the store's internal state
interface MockTimelineState {
  frames: any[];
  sentRequests: Set<string>;
  currentDate: Date;
  websocket: { readyState: number; send: (data: string) => void } | null;
  isLoading: boolean;
}

// Helper to create date key (matches store implementation)
function getDateKey(date: Date): string {
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
}

describe("Window Focus Refresh - sentRequests clearing", () => {
  let state: MockTimelineState;
  let fetchTimeRangeCalled: boolean;
  let fetchTimeRangeArgs: { start: Date; end: Date } | null;

  beforeEach(() => {
    fetchTimeRangeCalled = false;
    fetchTimeRangeArgs = null;

    state = {
      frames: [],
      sentRequests: new Set<string>(),
      currentDate: new Date("2024-01-15T18:30:00Z"), // 6:30 PM
      websocket: {
        readyState: 1, // WebSocket.OPEN
        send: mock(() => {}),
      },
      isLoading: false,
    };
  });

  /**
   * TEST 1: Verify sentRequests blocks re-fetch for same date
   */
  it("sentRequests should block duplicate fetch for same date", () => {
    const today = new Date("2024-01-15T18:30:00Z");
    const dateKey = getDateKey(today);

    // Simulate: first fetch at 6:30 PM
    state.sentRequests.add(dateKey);

    // Verify: key exists
    expect(state.sentRequests.has(dateKey)).toBe(true);

    // Simulate: fetchTimeRange check (from actual store code)
    const shouldSkip = state.sentRequests.has(dateKey);
    expect(shouldSkip).toBe(true); // This is the bug - we skip!
  });

  /**
   * TEST 2: onWindowFocus should clear current date from sentRequests
   */
  it("onWindowFocus should clear current date from sentRequests", () => {
    const today = new Date("2024-01-15T19:00:00Z"); // 7:00 PM
    state.currentDate = today;
    const dateKey = getDateKey(today);

    // Simulate: date was fetched earlier at 6:30
    state.sentRequests.add(dateKey);
    expect(state.sentRequests.has(dateKey)).toBe(true);

    // Simulate: onWindowFocus() implementation
    function onWindowFocus() {
      const currentDateKey = getDateKey(state.currentDate);
      state.sentRequests.delete(currentDateKey);
    }

    // Call onWindowFocus
    onWindowFocus();

    // Verify: key is cleared
    expect(state.sentRequests.has(dateKey)).toBe(false);
  });

  /**
   * TEST 3: After onWindowFocus, fetchTimeRange should be allowed
   */
  it("fetchTimeRange should be allowed after onWindowFocus clears sentRequests", () => {
    const today = new Date("2024-01-15T19:00:00Z");
    state.currentDate = today;
    const dateKey = getDateKey(today);

    // Setup: date was already fetched
    state.sentRequests.add(dateKey);

    // Simulate fetchTimeRange logic
    function fetchTimeRange(startTime: Date, endTime: Date): boolean {
      const requestKey = getDateKey(startTime);
      if (state.sentRequests.has(requestKey)) {
        return false; // Skipped
      }
      // Would send WebSocket request here
      state.sentRequests.add(requestKey);
      fetchTimeRangeCalled = true;
      fetchTimeRangeArgs = { start: startTime, end: endTime };
      return true; // Sent
    }

    // Before onWindowFocus: should skip
    const startTime = new Date(today);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(today);
    endTime.setHours(23, 59, 59, 999);

    let result = fetchTimeRange(startTime, endTime);
    expect(result).toBe(false); // Blocked!
    expect(fetchTimeRangeCalled).toBe(false);

    // Call onWindowFocus
    state.sentRequests.delete(dateKey);

    // After onWindowFocus: should work
    result = fetchTimeRange(startTime, endTime);
    expect(result).toBe(true); // Allowed!
    expect(fetchTimeRangeCalled).toBe(true);
  });

  /**
   * TEST 4: onWindowFocus should only clear current date, not other dates
   */
  it("onWindowFocus should only clear current date, preserve other dates", () => {
    const today = new Date("2024-01-15T19:00:00Z");
    const yesterday = new Date("2024-01-14T12:00:00Z");
    state.currentDate = today;

    const todayKey = getDateKey(today);
    const yesterdayKey = getDateKey(yesterday);

    // Both dates were fetched
    state.sentRequests.add(todayKey);
    state.sentRequests.add(yesterdayKey);

    // onWindowFocus only clears current date
    function onWindowFocus() {
      const currentDateKey = getDateKey(state.currentDate);
      state.sentRequests.delete(currentDateKey);
    }

    onWindowFocus();

    // Today cleared, yesterday preserved
    expect(state.sentRequest
```