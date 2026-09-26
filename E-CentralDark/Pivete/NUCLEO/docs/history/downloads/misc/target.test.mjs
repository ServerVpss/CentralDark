import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadTarget } from "../src/target-loader.mjs";

test("arquivo permitido é lido com hash", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-target-"));
  const file = path.join(root, "a.md"); await fs.writeFile(file, "abc");
  const value = await loadTarget(file, { allowedRoots: [root] });
  assert.equal(value.content, "abc"); assert.equal(value.sha256.length, 64);
});

test("symlink que escapa da raiz é bloqueado", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-root-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "uai-out-"));
  const secret = path.join(outside, "x.md"); await fs.writeFile(secret, "secret");
  const link = path.join(root, "link.md");
  try { await fs.symlink(secret, link); } catch { t.skip("symlink não disponível"); return; }
  await assert.rejects(() => loadTarget(link, { allowedRoots: [root] }), /TARGET_OUTSIDE_ALLOWED_ROOTS/);
});

test("diretório não segue symlink", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-dir-"));
  await fs.writeFile(path.join(root, "a.md"), "a");
  try { await fs.symlink(path.join(root, "a.md"), path.join(root, "l.md")); } catch { t.skip("symlink não disponível"); return; }
  const value = await loadTarget(root, { allowedRoots: [root] });
  assert.equal(value.inventory.some((x) => x.type === "symlink-blocked"), true);
});

test("symlink escape é bloqueado mesmo sem --allowed-root", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-default-root-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "uai-default-out-"));
  const secret = path.join(outside, "x.md"); await fs.writeFile(secret, "secret");
  const link = path.join(root, "link.md");
  try { await fs.symlink(secret, link); } catch { t.skip("symlink não disponível"); return; }
  await assert.rejects(() => loadTarget(link), /TARGET_OUTSIDE_ALLOWED_ROOTS/);
});

test(".env.local é bloqueado", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-env-"));
  const file = path.join(root, ".env.local"); await fs.writeFile(file, "X=1");
  await assert.rejects(() => loadTarget(file), /SENSITIVE_TARGET_BLOCKED/);
});
