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
