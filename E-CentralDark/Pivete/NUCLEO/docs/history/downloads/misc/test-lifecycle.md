# OUTRO - test-lifecycle.ts
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\scripts\e2e\test-lifecycle.ts
**SHA:** f1c69e7cacac53b8
**Timestamp:** 2026-08-23T14:15:49.211910
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- throw new Error(`frame_status lost after restart: ${health.frame_status}`);
- if (!res.ok) throw new Error(`search broken after restart: ${res.status}`);
- throw new Error(`settings/API broken after restart: ${e.message}`);
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * App Lifecycle & Process Tests
 *
 * TESTING.md coverage:
 * - S8: Clean quit, force quit recovery, port conflict, orphaned processes
 * - S9: DB integrity after crash, concurrent DB access
 * - S14: COM thread conflict (Windows)
 *
 * These tests kill and restart screenpipe, so they run LAST.
 */

import {
  suite, test, summary, screenshot, fetchJson, sleep,
  HEALTH_URL, IS_WINDOWS, IS_MACOS, isScreenpipeRunning,
} from "./lib";

suite("lifecycle & stability");

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get list of screenpipe-related PIDs */
function getScreenpipePids(): number[] {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync([
      "powershell", "-NoProfile", "-Command",
      "Get-Process -Name 'screenpipe*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id",
    ]);
    return proc.stdout.toString().trim().split(/\r?\n/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  } else {
    const proc = Bun.spawnSync(["pgrep", "-f", "screenpipe"]);
    return proc.stdout.toString().trim().split(/\n/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  }
}

/** Check if port 3030 is in use */
function isPortInUse(): boolean {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      "Get-NetTCPConnection -LocalPort 3030 -ErrorAction SilentlyContinue | Select-Object -First 1"]);
    return proc.stdout.toString().trim().length > 0;
  } else {
    const proc = Bun.spawnSync(["lsof", "-i", ":3030"]);
    return proc.exitCode === 0;
  }
}

/** Find screenpipe executable path */
function findScreenpipeExe(): string | null {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      "(Get-Process -Name 'screenpipe*' -ErrorAction SilentlyContinue | Select-Object -First 1).Path"]);
    const path = proc.stdout.toString().trim();
    return path || null;
  } else {
    const proc = Bun.spawnSync(["bash", "-c", "ps aux | grep -i screenpipe | grep -v grep | head -1 | awk '{print $11}'"]);
    const path = proc.stdout.toString().trim();
    return path || null;
  }
}

/** Start screenpipe app (best effort) */
function startScreenpipe(exePath: string) {
  if (IS_WINDOWS) {
    Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      `Start-Process '${exePath}'`]);
  } else {
    Bun.spawnSync(["open", "-a", exePath]);
  }
}

/** Wait for health API with timeout */
async function waitForHealthUp(timeoutS: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutS * 1000) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return true;
    } catch {}
    await sleep(2000);
  }
  return false;
}

// ── Pre-flight: record exe path before we kill anything ─────────────────────

const exePath = findScreenpipeExe();
console.log(`  screenpipe exe: ${exePath ?? "not found"}`);

// ── S9: Concurrent DB access under load ─────────────────────────────────────

await test("concurrent DB access (50 requests)", async () => {
  const promises = Array.from({ length: 50 }, (_, i) =>
    fetch(`http://localhost:3030/search?limit=1&q=test${i}`)
      .then(r => ({ ok: r.ok, status: r.status }))
      .catch(e => ({ ok: false, status: 0, error: e.message }))
  );
  const results = await Promise.all(promises);
  const failures = results.filter(r => !r.ok);
  if (failures.length > 5) {
    throw new Error(`${failures.length}/50 requests failed (>10% failure rate)`);
  }
});

await test("mixed read/write concurrent access", async () => {
  // Interleave search and health requests (simulating real usage)
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(fetch(`http://localhost:3030/search?limit=1&content_type=ocr`).then(r => r.ok));
    promises.push(fetch(HEALTH_URL).then(r => r.ok));
    promises.push(fetch(`http://localhost:3030/search?limit=5&q=e2e`).then(r => r.ok));
  }
  const results = await Promise.all(promises);
  const failures = results.filter(r => !r);
  if (failures.length > 3) {
    throw new Error(`${failures.length}/60 mixed requests failed`);
  }
});

// ── S14: COM thread conflict (Windows) ──────────────────────────────────────

if (IS_WINDOWS) {
  await test("audio + vision both active (COM no conflict)", async () => {
    const health = await fetchJson(HEALTH_URL);
    // frame_status must be ok (vision thread using COM for screen capture)
    if (health.frame_status !== "ok") {
      throw new Error(`frame_status: ${health.frame_status} (vision COM may be broken)`);
    }
    // If audio is configured, it should also work (audio thread using COM for WASAPI)
    if (health.audio_status === "ok") {
      console.log("  both audio + vision COM threads active");
    } else {
      console.log(`  vision COM ok, audio: ${health.audio_status} (may not be configured)`);
    }
  });
}

// ── S5: CPU on idle screen ──────────────────────────────────────────────────

await test("CPU not spiking on id
```

---

# OUTRO - test-lifecycle.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\scripts\e2e\test-lifecycle.ts
**SHA:** f1c69e7cacac53b834248714110db788a22c2d8d51a4550d215cc4550cf7f5b9
**Timestamp:** 2026-08-23T23:43:04.972794
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();
- throw new Error(`frame_status lost after restart: ${health.frame_status}`);
- if (!res.ok) throw new Error(`search broken after restart: ${res.status}`);
- throw new Error(`settings/API broken after restart: ${e.message}`);
- const start = Date.now();
- const start = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * App Lifecycle & Process Tests
 *
 * TESTING.md coverage:
 * - S8: Clean quit, force quit recovery, port conflict, orphaned processes
 * - S9: DB integrity after crash, concurrent DB access
 * - S14: COM thread conflict (Windows)
 *
 * These tests kill and restart screenpipe, so they run LAST.
 */

import {
  suite, test, summary, screenshot, fetchJson, sleep,
  HEALTH_URL, IS_WINDOWS, IS_MACOS, isScreenpipeRunning,
} from "./lib";

suite("lifecycle & stability");

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get list of screenpipe-related PIDs */
function getScreenpipePids(): number[] {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync([
      "powershell", "-NoProfile", "-Command",
      "Get-Process -Name 'screenpipe*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id",
    ]);
    return proc.stdout.toString().trim().split(/\r?\n/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  } else {
    const proc = Bun.spawnSync(["pgrep", "-f", "screenpipe"]);
    return proc.stdout.toString().trim().split(/\n/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  }
}

/** Check if port 3030 is in use */
function isPortInUse(): boolean {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      "Get-NetTCPConnection -LocalPort 3030 -ErrorAction SilentlyContinue | Select-Object -First 1"]);
    return proc.stdout.toString().trim().length > 0;
  } else {
    const proc = Bun.spawnSync(["lsof", "-i", ":3030"]);
    return proc.exitCode === 0;
  }
}

/** Find screenpipe executable path */
function findScreenpipeExe(): string | null {
  if (IS_WINDOWS) {
    const proc = Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      "(Get-Process -Name 'screenpipe*' -ErrorAction SilentlyContinue | Select-Object -First 1).Path"]);
    const path = proc.stdout.toString().trim();
    return path || null;
  } else {
    const proc = Bun.spawnSync(["bash", "-c", "ps aux | grep -i screenpipe | grep -v grep | head -1 | awk '{print $11}'"]);
    const path = proc.stdout.toString().trim();
    return path || null;
  }
}

/** Start screenpipe app (best effort) */
function startScreenpipe(exePath: string) {
  if (IS_WINDOWS) {
    Bun.spawnSync(["powershell", "-NoProfile", "-Command",
      `Start-Process '${exePath}'`]);
  } else {
    Bun.spawnSync(["open", "-a", exePath]);
  }
}

/** Wait for health API with timeout */
async function waitForHealthUp(timeoutS: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutS * 1000) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return true;
    } catch {}
    await sleep(2000);
  }
  return false;
}

// ── Pre-flight: record exe path before we kill anything ─────────────────────

const exePath = findScreenpipeExe();
console.log(`  screenpipe exe: ${exePath ?? "not found"}`);

// ── S9: Concurrent DB access under load ─────────────────────────────────────

await test("concurrent DB access (50 requests)", async () => {
  const promises = Array.from({ length: 50 }, (_, i) =>
    fetch(`http://localhost:3030/search?limit=1&q=test${i}`)
      .then(r => ({ ok: r.ok, status: r.status }))
      .catch(e => ({ ok: false, status: 0, error: e.message }))
  );
  const results = await Promise.all(promises);
  const failures = results.filter(r => !r.ok);
  if (failures.length > 5) {
    throw new Error(`${failures.length}/50 requests failed (>10% failure rate)`);
  }
});

await test("mixed read/write concurrent access", async () => {
  // Interleave search and health requests (simulating real usage)
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(fetch(`http://localhost:3030/search?limit=1&content_type=ocr`).then(r => r.ok));
    promises.push(fetch(HEALTH_URL).then(r => r.ok));
    promises.push(fetch(`http://localhost:3030/search?limit=5&q=e2e`).then(r => r.ok));
  }
  const results = await Promise.all(promises);
  const failures = results.filter(r => !r);
  if (failures.length > 3) {
    throw new Error(`${failures.length}/60 mixed requests failed`);
  }
});

// ── S14: COM thread conflict (Windows) ──────────────────────────────────────

if (IS_WINDOWS) {
  await test("audio + vision both active (COM no conflict)", async () => {
    const health = await fetchJson(HEALTH_URL);
    // frame_status must be ok (vision thread using COM for screen capture)
    if (health.frame_status !== "ok") {
      throw new Error(`frame_status: ${health.frame_status} (vision COM may be broken)`);
    }
    // If audio is configured, it should also work (audio thread using COM for WASAPI)
    if (health.audio_status === "ok") {
      console.log("  both audio + vision COM threads active");
    } else {
      console.log(`  vision COM ok, audio: ${health.audio_status} (may not be configured)`);
    }
  });
}

// ── S5: CPU on idle screen ──────────────────────────────────────────────────

await test("CPU not spiking on id
```