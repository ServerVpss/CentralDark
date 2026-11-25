import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const { config } = await import("../src/config.js");
const { semanticBridgePath } = await import("../src/tools/cognitivo/semantic.js");
const { config: distConfig } = await import("../dist/config.js");
const { semanticBridgePath: distSemanticBridgePath } = await import("../dist/tools/cognitivo/semantic.js");
const { canonicalSyncRepoPath, canonicalSyncScriptPath } = await import("../src/github-deploy-webhook.js");
const { canonicalSyncRepoPath: distCanonicalSyncRepoPath, canonicalSyncScriptPath: distCanonicalSyncScriptPath } = await import("../dist/github-deploy-webhook.js");

test("o bridge semântico deriva o script do Core validado", () => {
  assert.equal(
    semanticBridgePath(),
    path.join(config.vps.corePath, "infra", "mcp", "semantic_bridge.py"),
  );
});

test("o webhook usa a raiz canônica resolvida para o script de sincronização", () => {
  assert.equal(canonicalSyncRepoPath(), config.vps.repoPath);
  assert.equal(
    path.join(canonicalSyncRepoPath(), "scripts", "vps", "auto-sync-main.sh"),
    path.join(config.vps.repoPath, "scripts", "vps", "auto-sync-main.sh"),
  );
});

test("os artefatos dist reutilizam o mesmo resolvedor canônico", () => {
  assert.equal(
    distSemanticBridgePath(),
    path.join(distConfig.vps.corePath, "infra", "mcp", "semantic_bridge.py"),
  );
  assert.equal(distCanonicalSyncRepoPath(), distConfig.vps.repoPath);
});
