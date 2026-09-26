# CONTRATO - VISION_PIPELINE_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\docs\VISION_PIPELINE_SPEC.md
**SHA:** a6c7cc2c837dc551
**Timestamp:** 2026-08-23T14:17:01.865459
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- On server start:

### Contratos
- **Invariant: a frame row and its OCR text rows must reference the same video chunk and offset.** This is guaranteed today because both come from the same `CaptureResult`. With decoupled OCR, the `Capt

### Principios
- **Invariant: a frame row and its OCR text rows must reference the same video chunk and offset.** This is guaranteed today because both come from the same `CaptureResult`. With decoupled OCR, the `Capt

### Ouro Bruto (primeiros 5000 chars)
```
# Vision Pipeline v2 — Architecture Spec

<!-- doc-covers: crates/screenpipe-screen, crates/screenpipe-capture -->
<!-- doc-verified: a35930c27 -->
> **Historical.** Last verified against a35930c27 (2026-02-13). `crates/screenpipe-screen`, `crates/screenpipe-capture` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

> **Status**: Draft
> **Date**: 2026-02-12
> **Context**: Sentry issues APP-38/62/4D, CLI-9Z/9Y (vision restart cascade), fresh install testing on Mac Mini revealing pipeline stalls, silent frame drops, and 30-60s delays before first data appears.

## 1. Problem Statement

### 1.1 The Promise

Screenpipe promises: "AI that knows everything you've seen, said, or heard." Users expect that anything they saw on screen is searchable later. Missing data = broken product.

### 1.2 What's Broken Today (v2.0.440)

**Bug 1: Pipeline stalls after ~30 seconds.** The capture loop processes 12-13 frames, then stops producing new frames entirely. The heartbeat keeps ticking (iterations 100→6000+) but `frames_processed` freezes. The user browses 3 websites — none captured.

Root cause: OCR runs synchronously inside the capture loop. `process_max_average_frame()` calls `perform_ocr_apple()` for every visible window, blocking the entire capture cycle for 2-5 seconds per frame. After a burst of initial frames, the hash-based frame comparison (at 320×180 downscale) starts returning false matches, and all subsequent frames are skipped.

**Bug 2: Silent frame drops.** Out of 38 frames "processed" by the capture loop, only 4 reached the database. The `frame_write_tracker` race condition drops frames that pass OCR but haven't been written to video yet. The DB writer waits 100ms, doesn't find the frame in the tracker, and silently `continue`s.

**Bug 3: Health endpoint lies.** Reports `frame_status: ok` with `last_frame_timestamp` 6+ minutes stale. The tray icon shows "recording" when no data is being captured. The user has no way to know the pipeline is stalled.

**Bug 4: Permission recovery restart spam.** The permission recovery component polls every 500ms with no single-fire guard. When permissions are granted, it fires `stopScreenpipe()` + `spawnScreenpipe()` 13 times in 10 seconds, causing cascading server restarts, orphaned process kills, and OCR channel closures.

### 1.3 User Impact

- Fresh install: timeline shows "Building your memory" for 30-60+ seconds. Users think it's broken.
- Active use: user scrolls through articles, switches tabs, browses — most content is never captured.
- Search: "I know I saw that on screen" but it's not in the database.
- 3-monitor setups: 3× the OCR load, same serial pipeline. CPU spikes, frames drop.

## 2. User Scenarios & Guarantees

### 2.1 Scenarios

| Scenario | What happens today | What should happen |
|----------|-------------------|-------------------|
| **A. First launch** | 30-60s before first frame in DB. Timeline shows loading spinner. | First frame in DB within 5 seconds. Timeline shows content immediately. |
| **B. Scrolling HN thread** | 2-3 frames captured out of 30s of scrolling. Most comments lost. | At least 1 frame per 3-5s of active scrolling. All visible text captured. |
| **C. Rapid tab switching** | Maybe 2 out of 5 tabs captured. Others lost forever. | Every tab transition captured. Each tab's content OCR'd. |
| **D. 1-hour Zoom call** | OCR burns cycles on static camera window. Misses slide transitions. | Changed windows (shared screen) OCR'd. Static windows (camera) skipped. |
| **E. 3 monitors, coding** | All 3 monitors OCR'd equally. High CPU, frames still drop. | Active monitor at full rate. Idle monitors at reduced rate. CPU scales sublinearly. |
| **F. Left desk 20 min** | Pipeline may keep comparing frames, burning CPU. | Near-zero CPU on static screen. Instant resume when user returns. |
| **G. MacBook on battery** | Same CPU as plugged in. Battery drains fast. | "Light" mode available. Meaningful capture at ~2% CPU. |

### 2.2 Guarantees

**G1: Every window/app transition is captured.**
If the focused window changes, a frame of both the old and new state MUST reach the DB within 5 seconds. This is the highest-value event — it represents context switches the user will want to search for.

**G2: Active content changes are captured.**
During active use (scrolling, typing, browsing), at least 1 frame every 5 seconds reaches the DB with OCR text. The user should be able to reconstruct what they were looking at during any 10-second window of active use.

**G3: Static screens cost near-zero CPU.**
If the screen hasn't meaningfully changed for 30 seconds and there's no user input, the pipeline should sleep. No frame comparison, no OCR, no hash computation. Wake on input event or slow heartbeat (1 frame per 30-60s).

**G4: OCR never blocks capture.**
Screen capture must never wait for OCR. If OCR falls behin
```

---

# CONTRATO - VISION_PIPELINE_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\docs\VISION_PIPELINE_SPEC.md
**SHA:** a6c7cc2c837dc551f255e7f2c69bf7116184159eb058055b4d50665025e19920
**Timestamp:** 2026-08-24T01:39:59.664151
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- On server start:

### Contratos
- **Invariant: a frame row and its OCR text rows must reference the same video chunk and offset.** This is guaranteed today because both come from the same `CaptureResult`. With decoupled OCR, the `Capt

### Principios
- **Invariant: a frame row and its OCR text rows must reference the same video chunk and offset.** This is guaranteed today because both come from the same `CaptureResult`. With decoupled OCR, the `Capt

### Ouro Bruto (primeiros 5000 chars)
```
# Vision Pipeline v2 — Architecture Spec

<!-- doc-covers: crates/screenpipe-screen, crates/screenpipe-capture -->
<!-- doc-verified: a35930c27 -->
> **Historical.** Last verified against a35930c27 (2026-02-13). `crates/screenpipe-screen`, `crates/screenpipe-capture` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

> **Status**: Draft
> **Date**: 2026-02-12
> **Context**: Sentry issues APP-38/62/4D, CLI-9Z/9Y (vision restart cascade), fresh install testing on Mac Mini revealing pipeline stalls, silent frame drops, and 30-60s delays before first data appears.

## 1. Problem Statement

### 1.1 The Promise

Screenpipe promises: "AI that knows everything you've seen, said, or heard." Users expect that anything they saw on screen is searchable later. Missing data = broken product.

### 1.2 What's Broken Today (v2.0.440)

**Bug 1: Pipeline stalls after ~30 seconds.** The capture loop processes 12-13 frames, then stops producing new frames entirely. The heartbeat keeps ticking (iterations 100→6000+) but `frames_processed` freezes. The user browses 3 websites — none captured.

Root cause: OCR runs synchronously inside the capture loop. `process_max_average_frame()` calls `perform_ocr_apple()` for every visible window, blocking the entire capture cycle for 2-5 seconds per frame. After a burst of initial frames, the hash-based frame comparison (at 320×180 downscale) starts returning false matches, and all subsequent frames are skipped.

**Bug 2: Silent frame drops.** Out of 38 frames "processed" by the capture loop, only 4 reached the database. The `frame_write_tracker` race condition drops frames that pass OCR but haven't been written to video yet. The DB writer waits 100ms, doesn't find the frame in the tracker, and silently `continue`s.

**Bug 3: Health endpoint lies.** Reports `frame_status: ok` with `last_frame_timestamp` 6+ minutes stale. The tray icon shows "recording" when no data is being captured. The user has no way to know the pipeline is stalled.

**Bug 4: Permission recovery restart spam.** The permission recovery component polls every 500ms with no single-fire guard. When permissions are granted, it fires `stopScreenpipe()` + `spawnScreenpipe()` 13 times in 10 seconds, causing cascading server restarts, orphaned process kills, and OCR channel closures.

### 1.3 User Impact

- Fresh install: timeline shows "Building your memory" for 30-60+ seconds. Users think it's broken.
- Active use: user scrolls through articles, switches tabs, browses — most content is never captured.
- Search: "I know I saw that on screen" but it's not in the database.
- 3-monitor setups: 3× the OCR load, same serial pipeline. CPU spikes, frames drop.

## 2. User Scenarios & Guarantees

### 2.1 Scenarios

| Scenario | What happens today | What should happen |
|----------|-------------------|-------------------|
| **A. First launch** | 30-60s before first frame in DB. Timeline shows loading spinner. | First frame in DB within 5 seconds. Timeline shows content immediately. |
| **B. Scrolling HN thread** | 2-3 frames captured out of 30s of scrolling. Most comments lost. | At least 1 frame per 3-5s of active scrolling. All visible text captured. |
| **C. Rapid tab switching** | Maybe 2 out of 5 tabs captured. Others lost forever. | Every tab transition captured. Each tab's content OCR'd. |
| **D. 1-hour Zoom call** | OCR burns cycles on static camera window. Misses slide transitions. | Changed windows (shared screen) OCR'd. Static windows (camera) skipped. |
| **E. 3 monitors, coding** | All 3 monitors OCR'd equally. High CPU, frames still drop. | Active monitor at full rate. Idle monitors at reduced rate. CPU scales sublinearly. |
| **F. Left desk 20 min** | Pipeline may keep comparing frames, burning CPU. | Near-zero CPU on static screen. Instant resume when user returns. |
| **G. MacBook on battery** | Same CPU as plugged in. Battery drains fast. | "Light" mode available. Meaningful capture at ~2% CPU. |

### 2.2 Guarantees

**G1: Every window/app transition is captured.**
If the focused window changes, a frame of both the old and new state MUST reach the DB within 5 seconds. This is the highest-value event — it represents context switches the user will want to search for.

**G2: Active content changes are captured.**
During active use (scrolling, typing, browsing), at least 1 frame every 5 seconds reaches the DB with OCR text. The user should be able to reconstruct what they were looking at during any 10-second window of active use.

**G3: Static screens cost near-zero CPU.**
If the screen hasn't meaningfully changed for 30 seconds and there's no user input, the pipeline should sleep. No frame comparison, no OCR, no hash computation. Wake on input event or slow heartbeat (1 frame per 30-60s).

**G4: OCR never blocks capture.**
Screen capture must never wait for OCR. If OCR falls behin
```