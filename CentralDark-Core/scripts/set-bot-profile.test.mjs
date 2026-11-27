/* #OBSERVACOES#
 * @owner: scripts/set-bot-profile.test.mjs
 * @doc_ref: docs/CONSCIENCIA/PROGRAMAS/HUD-VOZ-CONSULTA-VISUALIZACAO-20260924.md
 * @last_updated: 2026-11-04T03:45:00.000Z
 * @implementado: regressoes P1 — json_field le .result e HERMES e o unico papel de execucao.
 * @pendente: CI no HEAD final; testes de producao nao executados.
 * @estado: SOURCE_ONLY; BASH_MOCK_LOCAL_6_PASS
 * @next_cursor: verificar node --test no mesmo HEAD via CI.
 */
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
  const start = script.indexOf("apply_profile() {");
  const end = script.indexOf('echo "=== set-bot-profile', start);
  assert.ok(start >= 0 && end > start);
  const body = script.slice(start, end);

  const measure = body.indexOf("/getMe");
  const shortDescription = body.indexOf("/setMyShortDescription");
  const fullDescription = body.indexOf("/setMyDescription");
  const receipt = body.indexOf("/getMyDescription");

  assert.ok(measure >= 0);
  assert.ok(shortDescription > measure);
  assert.ok(fullDescription > shortDescription);
  assert.ok(receipt > fullDescription);
  assert.match(body, /DRY_RUN .* getMe OK, sem mutacao/);
});

test("shell estrito sem read heredoc mascarado", () => {
  assert.match(script, /^set -euo pipefail$/m);
  assert.doesNotMatch(script, /read -r -d '' FULL_DESC[^\n]*\|\| true/);
  assert.match(script, /FULL_DESC="\$\(cat <<'TXT'/);
});

test("contracheque compara os dois valores reais, não apenas HTTP ok", () => {
  assert.match(script, /getMyShortDescription/);
  assert.match(script, /getMyDescription/);
  assert.match(script, /\[ "\$got_s" != "\$SHORT_DESC" \]/);
  assert.match(script, /\[ "\$got_d" != "\$FULL_DESC" \]/);
  assert.match(script, /match=EXACT/);
  assert.match(script, /post_ok\(\) \{/);
  assert.match(script, /json_field\(\) \{/);
});

test("domínio oficial mantém dois L e token legado não é atribuído ao bot principal", () => {
  assert.match(script, /mcp\.centralldark\.com/);
  assert.match(script, /status\.centralldark\.com/);
  assert.doesNotMatch(script, /https:\/\/mcp\.centraldark\.com/);
  assert.doesNotMatch(script, /read_key GUARDA_TELEGRAM_BOT_TOKEN/);
});

test("P1 — json_field lê dentro de result e mantém ok na raiz", () => {
  assert.match(script, /\.result\[\$field\] \/\/ \.\[\$field\]/);
  assert.match(script, /if \[ "\$field" = "ok" \]; then/);
  assert.match(script, /result = obj\.get\("result"\)/);
});

test("P1 — HERMES é o único papel técnico de execução na descrição", () => {
  assert.match(script, /^HERMES = execução$/m);
  assert.doesNotMatch(script, /PIVETE\/HERMES/);
});
