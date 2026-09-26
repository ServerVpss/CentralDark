# OUTRO - timeline-reconnection.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\timeline-reconnection.test.ts
**SHA:** a616ce3f85a896c1
**Timestamp:** 2026-08-23T14:16:06.845851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = new Date(2024, 0, 15, 0, 0, 0);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for Timeline WebSocket Reconnection Logic
 *
 * These tests verify that:
 * 1. sentRequests is cleared on reconnection (so data can be re-fetched)
 * 2. Request timeout triggers auto-retry
 * 3. State is properly reset on reconnection
 */

import { describe, it, expect, beforeEach } from "bun:test";

// ============================================================================
// ISSUE: sentRequests blocking re-fetches after reconnection
// ============================================================================

describe("Timeline Reconnection - sentRequests Management", () => {
  /**
   * TEST 1: sentRequests should be cleared when WebSocket reconnects
   *
   * Scenario: WebSocket disconnects and reconnects. The sentRequests Set
   * still has old entries, blocking new requests for the same date.
   *
   * Expected: sentRequests should be cleared on reconnection so fresh
   * data can be fetched.
   */
  it("should clear sentRequests on WebSocket reconnection", () => {
    // Simulate initial state with a sent request
    let sentRequests = new Set<string>();
    const dateKey = "15-0-2024"; // Jan 15, 2024
    sentRequests.add(dateKey);

    expect(sentRequests.has(dateKey)).toBe(true);

    // Simulate connectWebSocket being called (reconnection)
    function simulateReconnect(): Set<string> {
      // This is what SHOULD happen on reconnection
      return new Set<string>(); // Clear all sent requests
    }

    sentRequests = simulateReconnect();

    // After reconnection, sentRequests should be empty
    expect(sentRequests.has(dateKey)).toBe(false);
    expect(sentRequests.size).toBe(0);
  });

  /**
   * TEST 2: hasDateBeenFetched should return false after reconnection
   */
  it("hasDateBeenFetched should return false after reconnection", () => {
    let sentRequests = new Set<string>();

    function hasDateBeenFetched(date: Date): boolean {
      const dateKey = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
      return sentRequests.has(dateKey);
    }

    const testDate = new Date(2024, 0, 15); // Jan 15, 2024

    // Initially not fetched
    expect(hasDateBeenFetched(testDate)).toBe(false);

    // Mark as fetched
    sentRequests.add("15-0-2024");
    expect(hasDateBeenFetched(testDate)).toBe(true);

    // Simulate reconnection - clear sentRequests
    sentRequests = new Set<string>();
    expect(hasDateBeenFetched(testDate)).toBe(false);
  });

  /**
   * TEST 3: Multiple dates should all be clearable
   */
  it("should clear all dates on reconnection, not just current", () => {
    const sentRequests = new Set<string>();

    // Mark multiple dates as fetched
    sentRequests.add("15-0-2024"); // Jan 15
    sentRequests.add("16-0-2024"); // Jan 16
    sentRequests.add("17-0-2024"); // Jan 17

    expect(sentRequests.size).toBe(3);

    // Simulate reconnection
    const newSentRequests = new Set<string>();

    expect(newSentRequests.size).toBe(0);
  });
});

// ============================================================================
// ISSUE: Request timeout and auto-retry
// ============================================================================

describe("Timeline Reconnection - Request Timeout Logic", () => {
  /**
   * TEST 4: Should detect when request times out (no frames received)
   */
  it("should detect request timeout when no frames arrive", () => {
    const REQUEST_TIMEOUT_MS = 5000;

    interface RequestState {
      requestSentAt: number | null;
      framesReceived: number;
    }

    const state: RequestState = {
      requestSentAt: Date.now(),
      framesReceived: 0,
    };

    function isRequestTimedOut(currentTime: number): boolean {
      if (!state.requestSentAt) return false;
      if (state.framesReceived > 0) return false;
      return currentTime - state.requestSentAt > REQUEST_TIMEOUT_MS;
    }

    // Before timeout
    expect(isRequestTimedOut(Date.now() + 3000)).toBe(false);

    // After timeout with no frames
    expect(isRequestTimedOut(Date.now() + 6000)).toBe(true);
  });

  /**
   * TEST 5: Should not timeout if frames have been received
   */
  it("should not timeout if frames have been received", () => {
    const REQUEST_TIMEOUT_MS = 5000;

    interface RequestState {
      requestSentAt: number | null;
      framesReceived: number;
    }

    const state: RequestState = {
      requestSentAt: Date.now(),
      framesReceived: 5, // Frames received
    };

    function isRequestTimedOut(currentTime: number): boolean {
      if (!state.requestSentAt) return false;
      if (state.framesReceived > 0) return false;
      return currentTime - state.requestSentAt > REQUEST_TIMEOUT_MS;
    }

    // Even after timeout period, should not be timed out because frames exist
    expect(isRequestTimedOut(Date.now() + 10000)).toBe(false);
  });

  /**
   * TEST 6: Auto-retry should clear the specific date from sentRequests
   */
  it("should clear specific date from sentRequests on timeout for retry", () => {
 
```

---

# OUTRO - timeline-reconnection.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\lib\hooks\__tests__\timeline-reconnection.test.ts
**SHA:** a616ce3f85a896c19a80ab9922fc8451a22360b0db93cda2f0f5f51f5851f1b7
**Timestamp:** 2026-08-23T23:43:38.134537
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = new Date(2024, 0, 15, 0, 0, 0);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Tests for Timeline WebSocket Reconnection Logic
 *
 * These tests verify that:
 * 1. sentRequests is cleared on reconnection (so data can be re-fetched)
 * 2. Request timeout triggers auto-retry
 * 3. State is properly reset on reconnection
 */

import { describe, it, expect, beforeEach } from "bun:test";

// ============================================================================
// ISSUE: sentRequests blocking re-fetches after reconnection
// ============================================================================

describe("Timeline Reconnection - sentRequests Management", () => {
  /**
   * TEST 1: sentRequests should be cleared when WebSocket reconnects
   *
   * Scenario: WebSocket disconnects and reconnects. The sentRequests Set
   * still has old entries, blocking new requests for the same date.
   *
   * Expected: sentRequests should be cleared on reconnection so fresh
   * data can be fetched.
   */
  it("should clear sentRequests on WebSocket reconnection", () => {
    // Simulate initial state with a sent request
    let sentRequests = new Set<string>();
    const dateKey = "15-0-2024"; // Jan 15, 2024
    sentRequests.add(dateKey);

    expect(sentRequests.has(dateKey)).toBe(true);

    // Simulate connectWebSocket being called (reconnection)
    function simulateReconnect(): Set<string> {
      // This is what SHOULD happen on reconnection
      return new Set<string>(); // Clear all sent requests
    }

    sentRequests = simulateReconnect();

    // After reconnection, sentRequests should be empty
    expect(sentRequests.has(dateKey)).toBe(false);
    expect(sentRequests.size).toBe(0);
  });

  /**
   * TEST 2: hasDateBeenFetched should return false after reconnection
   */
  it("hasDateBeenFetched should return false after reconnection", () => {
    let sentRequests = new Set<string>();

    function hasDateBeenFetched(date: Date): boolean {
      const dateKey = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
      return sentRequests.has(dateKey);
    }

    const testDate = new Date(2024, 0, 15); // Jan 15, 2024

    // Initially not fetched
    expect(hasDateBeenFetched(testDate)).toBe(false);

    // Mark as fetched
    sentRequests.add("15-0-2024");
    expect(hasDateBeenFetched(testDate)).toBe(true);

    // Simulate reconnection - clear sentRequests
    sentRequests = new Set<string>();
    expect(hasDateBeenFetched(testDate)).toBe(false);
  });

  /**
   * TEST 3: Multiple dates should all be clearable
   */
  it("should clear all dates on reconnection, not just current", () => {
    const sentRequests = new Set<string>();

    // Mark multiple dates as fetched
    sentRequests.add("15-0-2024"); // Jan 15
    sentRequests.add("16-0-2024"); // Jan 16
    sentRequests.add("17-0-2024"); // Jan 17

    expect(sentRequests.size).toBe(3);

    // Simulate reconnection
    const newSentRequests = new Set<string>();

    expect(newSentRequests.size).toBe(0);
  });
});

// ============================================================================
// ISSUE: Request timeout and auto-retry
// ============================================================================

describe("Timeline Reconnection - Request Timeout Logic", () => {
  /**
   * TEST 4: Should detect when request times out (no frames received)
   */
  it("should detect request timeout when no frames arrive", () => {
    const REQUEST_TIMEOUT_MS = 5000;

    interface RequestState {
      requestSentAt: number | null;
      framesReceived: number;
    }

    const state: RequestState = {
      requestSentAt: Date.now(),
      framesReceived: 0,
    };

    function isRequestTimedOut(currentTime: number): boolean {
      if (!state.requestSentAt) return false;
      if (state.framesReceived > 0) return false;
      return currentTime - state.requestSentAt > REQUEST_TIMEOUT_MS;
    }

    // Before timeout
    expect(isRequestTimedOut(Date.now() + 3000)).toBe(false);

    // After timeout with no frames
    expect(isRequestTimedOut(Date.now() + 6000)).toBe(true);
  });

  /**
   * TEST 5: Should not timeout if frames have been received
   */
  it("should not timeout if frames have been received", () => {
    const REQUEST_TIMEOUT_MS = 5000;

    interface RequestState {
      requestSentAt: number | null;
      framesReceived: number;
    }

    const state: RequestState = {
      requestSentAt: Date.now(),
      framesReceived: 5, // Frames received
    };

    function isRequestTimedOut(currentTime: number): boolean {
      if (!state.requestSentAt) return false;
      if (state.framesReceived > 0) return false;
      return currentTime - state.requestSentAt > REQUEST_TIMEOUT_MS;
    }

    // Even after timeout period, should not be timed out because frames exist
    expect(isRequestTimedOut(Date.now() + 10000)).toBe(false);
  });

  /**
   * TEST 6: Auto-retry should clear the specific date from sentRequests
   */
  it("should clear specific date from sentRequests on timeout for retry", () => {
 
```