---
title: Audio Alert Monitor for Delivery Failures
---

# Audio Alert Monitor — Design Notes

> Use when: the user wants an audible alert (bip, beep, sound) when Hermes Gateway media delivery fails, so a silent failure does not sit unnoticed.

## What the monitor is for

A delivery failure that produces no visible signal is a silent failure. The monitor converts that silence into an observable alert.

It is NOT a replacement for fixing the root cause. It is a notification layer on top of the diagnostic workflow in the parent skill.

## Failure signals to watch

Pick the signal that is already visible in your deployment; do not invent a new telemetry channel just to alert on it.

| Signal | Where it appears | Notes |
|--------|------------------|-------|
| Gateway log line containing a delivery error | `~/.hermes/logs/gateway.log` | Most direct. Parse for known error phrases. |
| `state.db` delivery ledger row in failed state | SQLite, queryable | A row that stayed failed past retry budget is a real failure. |
| Platform API error response | Gateway log or webhook error handler | Catch non-retryable rejections. |
| Agent-turn tool error about media send | Agent log / turn result | Most user-facing signal. |

## Alert design rules

1. **Alert on confirmed failure, not on transient retry.** A retryable flood-control penalty or transient network blip the gateway will retry is not an alert event. Alert when the failure is terminal or past retry budget.
2. **Pair the sound with a log line.** The bip gets attention; the log line tells the user what to look at. Without the log line, the bip is a riddle.
3. **Deduplicate.** The same failure should not bip N times in N seconds. Coalesce alerts per failure fingerprint (file path + platform + time window) and rate-limit.
4. **Make it actionable or don't alert.** If the alert tells the user nothing more than "something broke", it will be ignored. Include file path, platform, and a one-line hint (e.g. "gateway not running", "ffmpeg missing for Edge TTS Opus", "file not found at MEDIA path").

## Platform sound APIs (starter)

| Platform | API | Notes |
|----------|-----|-------|
| Windows | `PlaySound()` from `windows.h` (system sounds or custom WAV), or `Beep(frequency, duration)` for a simple tone | `Beep` is trivial, needs no file. `PlaySound` can play a custom alert WAV. |
| Linux (terminal) | `printf("\a")` console bell, or `paplay` for a WAV |

## Simple Windows C starter (Beep + log)

```c
#include <windows.h>
#include <stdio.h>

void alert(const char *msg) {
    // Simple console beep: 800Hz for 300ms
    Beep(800, 300);
    // Also log so the alert is traceable, not just audible
    fprintf(stderr, "[ALERT] %s\n", msg);
}

int main(void) {
    alert("delivery-failure-sample");
    return 0;
}

// Compile: cl /O2 delivery-bip.c /Fe:delivery-bip.exe
// Or with MinGW: gcc delivery-bip.c -o delivery-bip.exe -lwinmm
```

## Pitfalls

- **Alerting on every retry attempt.** The gateway retries transient failures; alerting on each retry pollutes the user's attention. Only alert on terminal or budget-exhausted failures.
- **Alert without a log.** A sound with no recorded context cannot be debugged later. Always write a structured log alongside the bip.
- **No dedup.** Identical failures firing repeatedly trains the user to ignore the alert. Coalesce by fingerprint.
- **Alerting on format downgrades.** Edge TTS producing a file instead of a voice bubble is a format choice with ffmpeg missing — it is not a delivery failure worth alerting on.