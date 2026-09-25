import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, "set-bot-profile.sh");
const script = fs.readFileSync(scriptPath, "utf8");

test("GuardiaoCasa usa owner e token canônicos", () => {
  assert.match(script, /TOK_GUARDA_PRINCIPAL=.*read_key GUARDA_PRINCIPAL_BOT_TOKEN/);
  assert.match(script, /apply_profile "GuardiaoCasa" "\$TOK_GUARDA_PRINCIPAL"/);
  assert.doesNotMatch(script, /^TOK_GUARDA=/m);
  assert.doesNotMatch(script, /apply_profile "Guardiaodopivete"/);
});

test("ONLY_GUARDIAO preserva execução isolada da porta oficial", () => {
  assert.match(script, /ONLY_GUARDIAO="\$\{ONLY_GUARDIAO:-0\}"/);
  assert.match(script, /if \[ "\$ONLY_GUARDIAO" != "1" \]; then/);
  assert.match(script, /apply_profile "srver1bot"/);
  assert.match(script, /apply_profile "GuardiaoCasa"/);
});

test("perfil mede antes de mutar e fecha com receipt", () => {
  const measure = script.indexOf("/getMe");
  const shortDescription = script.indexOf("/setMyShortDescription");
  const fullDescription = script.indexOf("/setMyDescription");
  const receipt = script.indexOf("/getMyDescription");

  assert.ok(measure >= 0);
  assert.ok(shortDescription > measure);
  assert.ok(fullDescription > shortDescription);
  assert.ok(receipt > fullDescription);
  assert.match(script, /DRY_RUN .* getMe OK, sem mutacao/);
});
