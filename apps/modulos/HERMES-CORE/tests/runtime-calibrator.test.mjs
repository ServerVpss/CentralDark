import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCalibrationMission,
  calibrationFingerprint,
  classifySnapshot,
} from "../core/runtime-calibrator.mjs";

test("classifySnapshot separates live state from wounds", () => {
  const snapshot = {
    services: {
      "hermes-gateway.service": "active",
      "kytensor.service": "inactive",
    },
    http: [
      { name: "mcp", code: 200, ok: true, body: { ok: true } },
      {
        name: "kylin_bridge",
        code: 200,
        ok: true,
        body: { status: "degraded" },
      },
    ],
    local_model: { ok: true, model: "local-model" },
  };
  assert.deepEqual(classifySnapshot(snapshot), [
    "KYLIN_BRIDGE_DEGRADED",
    "SERVICE_INACTIVE:kytensor.service:inactive",
  ]);
});

test("calibration fingerprint is stable for same wound set", () => {
  assert.equal(
    calibrationFingerprint(["B", "A"]),
    calibrationFingerprint(["A", "B"]),
  );
});

test("mission is bounded to internal runtime and forbids repo mutation", () => {
  const state = {
    eligible_for_repair: true,
    wounds: ["KYLIN_BRIDGE_DEGRADED"],
    fingerprint: "a".repeat(64),
    observed_at: "2026-10-07T00:00:00Z",
    reward: 0,
    trend: "STABLE",
    advisory: { summary: "probe bridge binding" },
    last_enqueued_fingerprint: null,
    last_enqueued_at: null,
  };
  const mission = buildCalibrationMission(state);
  assert.ok(mission);
  assert.match(mission.content, /SCOPE=VPS_RUNTIME_INTERNAL_ONLY/);
  assert.match(mission.content, /nao editar Git\/GitHub/);
  assert.match(mission.content, /REALITY_JUDGE/);
});
