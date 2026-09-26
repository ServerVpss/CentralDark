import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { getOperationalSnapshot } from "../src/operational-telemetry.js";

test("snapshot é fail-closed sem receipt", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-telemetry-"));
  const snap = getOperationalSnapshot({ root, heartbeat: { self: "alive" } });
  assert.equal(snap.schema, "centraldark.operational.snapshot.v1");
  assert.equal(snap.forensic.status, "UNKNOWN");
  assert.equal(snap.verdict, "UNKNOWN_NOT_PASS");
  assert.equal(snap.secretBoundary.contentExposed, false);
  assert.equal(snap.fronts.length, 10);
  assert.equal(snap.patternAlignment.redOutsidePct, 80);
  assert.equal(snap.patternAlignment.outsidePct, 80);
  assert.equal(snap.patternAlignment.marker, "RED");
  assert.equal(snap.patternAlignment.unknownCount, 2);
});

test("snapshot lê receipt sanitizado sem ler secrets", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-telemetry-"));
  const diag = path.join(root, "_DIAGNOSTICS");
  fs.mkdirSync(diag, { recursive: true });
  fs.mkdirSync(path.join(root, "secrets"), { recursive: true });
  fs.writeFileSync(path.join(root, "secrets", "token.txt"), "NUNCA_EXPOR");
  fs.writeFileSync(path.join(root, "secrets", "detect-github-auth.sh"), "#!/bin/sh\n");
  fs.writeFileSync(path.join(diag, "REPORT.txt"), "REPORT\n");
  fs.writeFileSync(path.join(diag, "archive.tar.gz"), "x");
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  fs.writeFileSync(path.join(diag, "FORENSIC-LATEST.json"), JSON.stringify({
    observed_at: now,
    mode: "READ_ONLY",
    report: path.join(diag, "REPORT.txt"),
    archive: path.join(diag, "archive.tar.gz"),
    sha256: "a".repeat(64),
    secrets_content_collected: false,
  }));
  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.forensic.status, "OBSERVED");
  assert.equal(snap.secretBoundary.githubAuthDetectorPresent, true);
  assert.equal(JSON.stringify(snap).includes("NUNCA_EXPOR"), false);
});


test("monitor do padrão fica verde quando os eixos mensuráveis estão aderentes", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-pattern-green-"));
  const diag = path.join(root, "_DIAGNOSTICS");
  const soul = path.join(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS");
  const contractDir = path.join(root, "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC");
  fs.mkdirSync(diag, { recursive: true });
  fs.mkdirSync(soul, { recursive: true });
  fs.mkdirSync(contractDir, { recursive: true });
  fs.writeFileSync(path.join(root, "AGENTS.md"), "RETURN_WITH_OPEN_ELIGIBLE_PR=FORBIDDEN\n");
  fs.writeFileSync(path.join(soul, "SOUL-SOL.md"), "SOUL\n");
  fs.writeFileSync(path.join(contractDir, "CONTRACT.yml"), [
    "remeasure_live_mergeability_before_human_return: true",
    "queued_or_in_progress_auxiliary_is_material_blocker: false",
  ].join("\n"));
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  fs.writeFileSync(path.join(diag, "FORENSIC-LATEST.json"), JSON.stringify({
    observed_at: now,
    mode: "READ_ONLY",
    secrets_content_collected: false,
  }));

  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.patternAlignment.outsidePct, 0);
  assert.equal(snap.patternAlignment.alignmentPct, 100);
  assert.equal(snap.patternAlignment.marker, "GREEN");
  assert.equal(snap.patternAlignment.unknownCount, 0);
});

test("observações externas entram no mesmo marcador sem criar segundo monitor", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-pattern-external-"));
  const statusDir = path.join(root, "apps/modulos/status");
  fs.mkdirSync(statusDir, { recursive: true });
  fs.writeFileSync(path.join(statusDir, "centraldark-pattern-observation.json"), JSON.stringify({
    dimensions: [
      { id: "X1", label: "rota 1", state: "FAIL", source: "test" },
      { id: "X2", label: "rota 2", state: "FAIL", source: "test" },
      { id: "X3", label: "rota 3", state: "PASS", source: "test" },
    ],
  }));
  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.patternAlignment.dimensions.some((item) => item.id === "X1"), true);
  assert.equal(snap.patternAlignment.externalObservationPath, "apps/modulos/status/centraldark-pattern-observation.json");
});
