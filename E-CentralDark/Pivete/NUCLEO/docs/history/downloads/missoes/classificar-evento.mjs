#!/usr/bin/env node
/** Normaliza pacote bruto sem alterar a missão original. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeText } from "./sanitize.mjs";

const KNOWN_EVENTS = new Set([
  "TEST_FAILED",
  "NODE_CHECK_FAILED",
  "SEMANTIC_FAILURE_WITH_SYNTAX_PASS",
  "REGRESSION_FAILED",
  "TIMEOUT",
  "STATE_TRANSITION_ERROR",
  "NON_IDEMPOTENT_RESULT",
  "REPEATED_ERROR",
  "SESSION_CHECKPOINT",
  "SESSION_RESUME",
  "ENXAME_REQUEST",
  "PERF_ANALYSIS",
  "STAFF_CHALLENGE",
  "DOUTRINA_CHECK",
  "UNKNOWN",
]);

function strings(values) {
  return Array.isArray(values) ? values.map((value) => sanitizeText(value, 500)) : [];
}

export function classificarEvento(raw = {}) {
  const originalEvent = String(raw.event || raw.type || "UNKNOWN").trim().toUpperCase();
  const event = KNOWN_EVENTS.has(originalEvent) ? originalEvent : "UNKNOWN";

  return {
    event,
    originalEvent,
    mission: {
      id: raw.mission?.id || raw.missionId || null,
      objective: raw.mission?.objective || raw.objective || null,
      state: raw.mission?.state || raw.state || null,
      nextState: raw.mission?.nextState || raw.nextState || null,
    },
    workspace: {
      path: raw.workspace?.path || raw.worktree || null,
      branch: raw.workspace?.branch || raw.branch || null,
      head: raw.workspace?.head || raw.head || null,
    },
    evidence: {
      command: sanitizeText(raw.evidence?.command || raw.command || "", 1000) || null,
      exitCode: raw.evidence?.exitCode ?? raw.exitCode ?? null,
      error: sanitizeText(raw.evidence?.error || raw.error || "", 2000) || null,
      changedFiles: strings(raw.evidence?.changedFiles || raw.changedFiles),
      tests: strings(raw.evidence?.tests || raw.tests),
    },
    tags: strings(raw.tags),
    checkpoint: raw.checkpoint || null,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(classificarEvento({ event: "test_failed", error: "trailer", mission: { id: "PR664" } }), null, 2));
}
