# OUTRO - animation-map.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\hyperframes\scripts\animation-map.mjs
**SHA:** 6840bf5c08b8b1ea
**Timestamp:** 2026-08-26T18:31:31.219850
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: +tw.start.toFixed(3),
- const start = parentOffset + (node.startTime?.() ?? 0);
- let zoneStart = null;
- if (zoneStart === null) zoneStart = d.t;
- start: zoneStart,
- zoneStart = null;
- start: zoneStart,

### Gaps
- if (!el) return { x: 0, y: 0, w: 0, h: 0, missing: true };

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// animation-map.mjs — HyperFrames animation map for agents
//
// Reads every GSAP timeline registered in window.__timelines, enumerates
// tweens, samples bboxes at N points per tween, computes flags and
// human-readable summaries. Outputs a single animation-map.json.
//
// Usage:
//   node skills/hyperframes/scripts/animation-map.mjs <composition-dir> \
//     [--frames N] [--out <dir>] [--min-duration S] [--width W] [--height H] [--fps N]

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

import {
  createFileServer,
  createCaptureSession,
  initializeSession,
  closeCaptureSession,
  getCompositionDuration,
} from "@hyperframes/producer";

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));
if (!args.composition) die("missing <composition-dir>");

const FRAMES = Number(args.frames ?? 6);
const OUT_DIR = resolve(args.out ?? ".hyperframes/anim-map");
const MIN_DUR = Number(args["min-duration"] ?? 0.15);
const WIDTH = Number(args.width ?? 1920);
const HEIGHT = Number(args.height ?? 1080);
const FPS = Number(args.fps ?? 30);
const COMP_DIR = resolve(args.composition);

await mkdir(OUT_DIR, { recursive: true });

// ─── Main ────────────────────────────────────────────────────────────────────

const server = await createFileServer({ projectDir: COMP_DIR, port: 0 });
const session = await createCaptureSession(
  server.url,
  OUT_DIR,
  { width: WIDTH, height: HEIGHT, fps: FPS, format: "png" },
  null,
);
await initializeSession(session);

try {
  const duration = await getCompositionDuration(session);
  const tweens = await enumerateTweens(session);
  const kept = tweens.filter((tw) => tw.end - tw.start >= MIN_DUR);

  const report = {
    composition: COMP_DIR,
    duration,
    totalTweens: tweens.length,
    mappedTweens: kept.length,
    skippedMicroTweens: tweens.length - kept.length,
    tweens: [],
  };

  for (let i = 0; i < kept.length; i++) {
    const tw = kept[i];
    const times = Array.from(
      { length: FRAMES },
      (_, k) => +(tw.start + ((k + 0.5) / FRAMES) * (tw.end - tw.start)).toFixed(3),
    );

    const bboxes = [];
    for (const t of times) {
      await seekTo(session, t);
      const bbox = await measureTarget(session, tw.selectorHint);
      bboxes.push({ t, ...bbox });
    }

    const animProps = tw.props.filter(
      (p) => !["parent", "overwrite", "immediateRender", "startAt", "runBackwards"].includes(p),
    );
    const flags = computeFlags(tw, bboxes, { width: WIDTH, height: HEIGHT });
    const summary = describeTween(tw, animProps, bboxes, flags);

    report.tweens.push({
      index: i + 1,
      selector: tw.selectorHint,
      targets: tw.targetCount,
      props: animProps,
      start: +tw.start.toFixed(3),
      end: +tw.end.toFixed(3),
      duration: +(tw.end - tw.start).toFixed(3),
      ease: tw.ease,
      bboxes,
      flags,
      summary,
    });
  }

  markCollisions(report.tweens);

  for (const tw of report.tweens) {
    if (tw.flags.includes("collision") && !tw.summary.includes("collision")) {
      tw.summary += " Overlaps another animated element.";
    }
  }

  // ── Composition-level analysis ──
  report.choreography = buildTimeline(report.tweens, duration);
  report.density = computeDensity(report.tweens, duration);
  report.staggers = detectStaggers(report.tweens);
  report.elements = buildElementLifecycles(report.tweens);
  report.deadZones = findDeadZones(report.density, duration);
  report.snapshots = await captureSnapshots(session, report.tweens, duration);

  await writeFile(join(OUT_DIR, "animation-map.json"), JSON.stringify(report, null, 2));

  printSummary(report);
} finally {
  await closeCaptureSession(session).catch(() => {});
  server.close();
}

// ─── Seek helper ────────────────────────────────────────────────────────────

async function seekTo(session, t) {
  await session.page.evaluate((time) => {
    if (window.__hf && typeof window.__hf.seek === "function") {
      window.__hf.seek(time);
      return;
    }
    const tls = window.__timelines;
    if (tls) {
      for (const tl of Object.values(tls)) {
        if (typeof tl.seek === "function") tl.seek(time);
      }
    }
  }, t);
  await new Promise((r) => setTimeout(r, 100));
}

// ─── Timeline introspection ──────────────────────────────────────────────────

async function enumerateTweens(session) {
  return await session.page.evaluate(() => {
    const results = [];
    const registry = window.__timelines || {};

    const selectorOf = (el) => {
      if (!el || !(el instanceof Element)) return null;
      if (el.id) return `#${el.id}`;
      const cls = [...el.classList].slice(0, 2).join(".");
      return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
    };

    const walk = (node, parentOffset = 0) => {
      if (!node) return;
      if (typeof node.getChildren === "function") {
        const of
```