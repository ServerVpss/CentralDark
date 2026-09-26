# COMANDO - scripted-workflow.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\workflows\scripted-workflow.ts
**SHA:** 9ae3ca7f2797d5e4
**Timestamp:** 2026-08-28T02:25:00.283878
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- loc?: { start: { line: number; column: number } };

### Padroes
- const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
- const runKeyPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

### Ouro Bruto (primeiros 5000 chars)
```
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { Worker } from "node:worker_threads";

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const requireFromPackage = createRequire(import.meta.url);

export interface WorkflowScriptValidationError {
	message: string;
	line?: number;
	column?: number;
}

export interface WorkflowScriptValidationResult {
	ok: boolean;
	errors: WorkflowScriptValidationError[];
}

const WORKER_SOURCE = String.raw`
const { parentPort, workerData } = require("node:worker_threads");
const vm = require("node:vm");
const { inspect } = require("node:util");
const { parse } = require(workerData.acornPath);

let promiseHooks;
try {
  ({ promiseHooks } = require("node:v8"));
} catch {}

function createWorkflowPromiseHook(callbacks) {
  if (!promiseHooks || typeof promiseHooks.createHook !== "function") return () => {};
  try {
    return promiseHooks.createHook(callbacks);
  } catch (error) {
    if (error?.name !== "NotImplementedError") throw error;
    return () => {};
  }
}

let nextCallId = 0;
let topLevelWorkflowPromise;
let suppressNativePromiseConsumption = 0;
const activeNativePromises = [];
const pending = new Map();
const runKeyPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const trackedPromiseTrackers = new WeakMap();
const trackedPromiseTargets = new WeakMap();
let nativePromiseTrackers = new WeakMap();
let nativePromiseParents = new WeakMap();
const observedCallIds = new Set();

function stableRunJson(value) {
  if (Array.isArray(value)) return "[" + value.map(stableRunJson).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stableRunJson(value[key])).join(",") + "}";
  return JSON.stringify(value) ?? "undefined";
}

function isDirectWorkflowScriptPromiseHandlerCall() {
  const stack = new Error().stack;
  if (typeof stack !== "string") return false;
  return stack.split("\n").some((line) => line.includes("workflow-script.js") && !line.includes("at async "));
}

function nativePromiseTracker(promise) {
  if (!promise || (typeof promise !== "object" && typeof promise !== "function")) return undefined;
  let tracker = nativePromiseTrackers.get(promise);
  if (!tracker) {
    tracker = { observations: [], consumed: false, dependencies: [] };
    nativePromiseTrackers.set(promise, tracker);
  }
  return tracker;
}

function promiseObservationTracker(value) {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return undefined;
  return trackedPromiseTrackers.get(value) ?? nativePromiseTrackers.get(value);
}

function addTrackerDependency(tracker, dependency) {
  if (!dependency) return;
  tracker.dependencies ??= [];
  if (!tracker.dependencies.includes(dependency)) tracker.dependencies.push(dependency);
  if (tracker.consumed) markTrackedObservationsConsumed(dependency);
}

function descendsFromTopLevelWorkflow(promise) {
  const seen = new Set();
  for (let current = promise; current && !seen.has(current); current = nativePromiseParents.get(current)) {
    if (current === topLevelWorkflowPromise) return true;
    seen.add(current);
  }
  return false;
}

function withSuppressedNativePromiseConsumption(callback) {
  suppressNativePromiseConsumption++;
  try {
    return callback();
  } finally {
    suppressNativePromiseConsumption--;
  }
}

function mergeObservations(...groups) {
  const seen = new Set();
  const merged = [];
  for (const group of groups) {
    for (const observation of group) {
      if (!observation || typeof observation.callId !== "number" || typeof observation.key !== "string" || typeof observation.operation !== "string" || seen.has(observation.callId)) continue;
      seen.add(observation.callId);
      merged.push(observation);
    }
  }
  return merged;
}

function trackedObservationTracker(value) {
  return value && (typeof value === "object" || typeof value === "function") ? trackedPromiseTrackers.get(value) : undefined;
}

function trackedPromiseTarget(value) {
  return value && (typeof value === "object" || typeof value === "function") ? trackedPromiseTargets.get(value) ?? value : value;
}

function addTrackedObservations(tracker, observations) {
  tracker.observations = mergeObservations(tracker.observations, observations);
  if (!tracker.consumed) return;
  for (const observation of tracker.observations) {
    if (observedCallIds.has(observation.callId)) continue;
    observedCallIds.add(observation.callId);
    parentPort.postMessage({ type: "callObserved", callId: observation.callId, key: observation.key, operation: observation.operation });
  }
}

function markTrackedObservationsConsumed(tracker, seen = new Set()) {
  if (seen.has(tracker)) return;
  seen.add(tracker);
  tracker.consumed = true;
  addTrackedObservations(tracker, []);
  for (const dependency of tracker.dependencies ?? []) markTrackedObservationsConsumed(depe
```