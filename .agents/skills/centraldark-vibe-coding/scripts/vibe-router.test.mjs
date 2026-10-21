import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { routeVibeCoding } from "./vibe-router.mjs";

test("objetivo curto ativa CREATE e só rotas sob demanda", () => {
  const r=routeVibeCoding("!CENTRALDARK #VIBECODING crie um cockpit modular");
  assert.equal(r.mode,"CREATE"); assert.equal(r.actionTaken,false); assert.equal(r.loadAll,false);
  assert.ok(r.skillsOnDemand.includes("meta-lupa"));
});
test("ideação aciona brainstorming sem virar execução", () => {
  const r=routeVibeCoding("!VIBECODING brainstorm de novas telas");
  assert.equal(r.mode,"IDEATE"); assert.ok(r.skillsOnDemand.includes("brainstorming"));
  assert.equal(r.status,"ROUTE_DECLARED_NOT_EXECUTED");
});
test("patch exige alvo e limita a mutação", () => {
  const no=routeVibeCoding({command:"#VIBECODING não gostei, ajustar o visual"});
  assert.equal(no.status,"TARGET_REQUIRED");
  const ok=routeVibeCoding({command:"#VIBECODING ajustar só o botão",target:"botão de busca"});
  assert.equal(ok.mode,"PATCH"); assert.equal(ok.target,"botão de busca");
  assert.equal(ok.allowedSurface,"NAMED_COMPONENT_ONLY");
});
test("recomeçar o rascunho nunca apaga projeto", () => {
  const no=routeVibeCoding({command:"#VIBECODING recomeçar tudo"});
  assert.equal(no.status,"CONFIRM_DRAFT_SCOPE_REQUIRED");
  const yes=routeVibeCoding({command:"#VIBECODING recomeçar rascunho",confirmRestart:true});
  assert.equal(yes.status,"DRAFT_RESET_CANDIDATE_ONLY");
  assert.equal(yes.allowedSurface,"ISOLATED_DRAFT_ONLY"); assert.equal(yes.actionTaken,false);
});
test("conflito Git usa o resolvedor canônico", () => {
  const r=routeVibeCoding("#VIBECODING reconciliar conflito PR #1880");
  assert.equal(r.mode,"RECONCILE");
  assert.ok(r.skillsOnDemand.includes("git-conflict-resolve-house-standard"));
});
test("sem gatilho ou sem objetivo não executa nada", () => {
  assert.equal(routeVibeCoding("crie outro cockpit").status,"NOT_TRIGGERED");
  assert.equal(routeVibeCoding("#VIBECODING").status,"GOAL_REQUIRED");
});
test("super skill está no grafo com arestas recíprocas", () => {
  const registry=JSON.parse(readFileSync(new URL("../../meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS/SKILLS/REGISTRY.json",import.meta.url),"utf8"));
  const c=registry.creative_on_demand;
  assert.equal(registry.root_trigger,"🔗 !># INTERLIGADOS");
  assert.equal(c.canonical_skill,"centraldark-vibe-coding");
  assert.equal(c.on_demand,true); assert.equal(c.auto_load_all_skills,false);
  assert.ok(c.edges.some(e=>e.from==="centraldark-vibe-coding"&&e.to==="brainstorming"));
  assert.ok(c.edges.some(e=>e.from==="brainstorming"&&e.to==="centraldark-vibe-coding"));
  assert.ok(c.tags.includes("🪡 MUTACAO_SELETIVA"));
  assert.equal(registry.inventory.count,52,"índice histórico preservado");
  const body=readFileSync(new URL("../SKILL.md",import.meta.url),"utf8");
  const bridge=readFileSync(new URL("../INTERLIGADOS.md",import.meta.url),"utf8");
  assert.match(body,/^name: centraldark-vibe-coding$/m);
  assert.match(bridge,/BRAINSTORMING/);
});
