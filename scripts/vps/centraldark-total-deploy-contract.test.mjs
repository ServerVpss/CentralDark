import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const deploy = readFileSync(path.join(root, "scripts/vps/centraldark-deploy.sh"), "utf8");
const workflow = readFileSync(path.join(root, ".github/workflows/vps-exec-selfhosted.yml"), "utf8");
const agents = readFileSync(path.join(root, "AGENTS.md"), "utf8");

test("main promovida dispara owner de deploy sem filtro parcial de paths", () => {
  const trigger = workflow.slice(0, workflow.indexOf("permissions:"));
  assert.match(trigger, /push:\n\s+branches: \[main\]/);
  assert.doesNotMatch(trigger, /\n\s+paths:/);
  assert.match(workflow, /deploy-total-regeneration:/);
  assert.match(workflow, /centraldark-deploy\.sh --apply --total/);
});

test("total deploy regenera runtime já populado sem apagar estado untracked", () => {
  for (const marker of [
    "--total",
    "UNTRACKED_RUNTIME_STATE=PRESERVED_NOT_CLEANED",
    "REGEN_FALLBACK=PM2_RESURRECT_FROM_SAVED_POPULATED_STATE",
    "pm2 save --force",
    "TOTAL_DEPLOY_FIXED_POINT=PASS",
    "SYSTEM_REGENERATED_FROM_PROVEN_MAIN_AND_POPULATED_RUNTIME=PASS",
  ]) assert.ok(deploy.includes(marker), `missing deploy marker: ${marker}`);
  assert.match(deploy, /listar_sujos_rastreados/);
  assert.match(deploy, /proteger_nao_rastreados_contra_alvo/);
});

test("contrato global fecha SAME_HEAD verde em deploy total sem reask", () => {
  for (const marker of [
    "SAME_HEAD_GREEN_PROMOTES_TO_TOTAL_DEPLOY=true",
    "TOTAL_DEPLOY_REGENERATES_FROM_PROVEN_MAIN_AND_EXISTING_RUNTIME=true",
    "DEPLOY_DOES_NOT_REASK_AFTER_AUTHORIZED_GREEN=true",
    "UNTRACKED_RUNTIME_STATE_IS_PRESERVED_NOT_BLIND_CLEANED=true",
  ]) assert.ok(agents.includes(marker), `missing contract marker: ${marker}`);
});
