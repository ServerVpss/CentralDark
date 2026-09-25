import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "centraldark-operator-preflight.sh");

function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-preflight-"));
  const root = path.join(base, "repo");
  const home = path.join(base, "home");
  fs.mkdirSync(path.join(root, "apps/bot-telegram/skills/core"), { recursive: true });
  fs.mkdirSync(path.join(root, "apps/modulos/mcp/src"), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(root, "apps/bot-telegram/skills/core/consciousness.cjs"), "module.exports = {};\n");
  fs.writeFileSync(path.join(root, "apps/modulos/mcp/src/hub-mission-consumer.js"), "export {};\n");
  fs.writeFileSync(path.join(home, ".bashrc"), '. "$HOME/.cargo/env"\n');

  const fakeGh = path.join(base, "gh");
  fs.writeFileSync(fakeGh, `#!/usr/bin/env bash
if [ "\$1" = "auth" ] && [ "\$2" = "status" ]; then exit 0; fi
if [ "\$1" = "api" ] && [ "\$2" = "user" ]; then echo segredounlock; exit 0; fi
exit 1
`);
  fs.chmodSync(fakeGh, 0o755);
  return { root, home, fakeGh };
}

function run(args = []) {
  const fx = fixture();
  return spawnSync("bash", [script, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      CENTRALDARK_ROOT: fx.root,
      HOME: fx.home,
      GH_BIN: fx.fakeGh,
    },
  });
}

test("preflight mede auth existente e cargo startup sem pedir IA", () => {
  const r = run();
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /GH_AUTH=PASS/);
  assert.match(r.stdout, /GH_LOGIN=segredounlock/);
  assert.match(r.stdout, /GH_LOGIN_ACTION=SKIP_ALREADY_AUTHENTICATED/);
  assert.match(r.stdout, /CARGO_ENV=ABSENT_OPTIONAL/);
  assert.match(r.stdout, /CARGO_STARTUP=GUARD_NEEDED/);
  assert.match(r.stdout, /consciousness\.cjs:PRESENT/);
  assert.match(r.stdout, /hub-mission-consumer\.js:PRESENT/);
  assert.match(r.stdout, /RESULT=PASS_READ_ONLY/);
});

test("preflight corrige deterministicamente gh STATUS sem executar", () => {
  const r = run(["gh", "STATUS"]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /INPUT_CLASS=INVALID_GH_SUBCOMMAND_CASE/);
  assert.match(r.stdout, /CANONICAL_COMMAND=gh status/);
});

test("preflight não tenta executar arquivo cjs como shell", () => {
  const r = run(["apps/bot-telegram/skills/core/consciousness.cjs"]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /INPUT_CLASS=SOURCE_PATH_NOT_SHELL_COMMAND/);
  assert.match(r.stdout, /SAFE_ACTION=INSPECT_OR_USE_OWNER_ENTRYPOINT/);
});

test("preflight bloqueia placeholder com reticências", () => {
  const r = run(["apps/modulos/.../orchestrator.mjs"]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /INPUT_CLASS=PLACEHOLDER_NOT_EXECUTABLE/);
});
