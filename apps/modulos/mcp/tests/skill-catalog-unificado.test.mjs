import test from "node:test";
import assert from "node:assert/strict";
import { indexSkillTree, resolveSkill, searchSkills } from "../src/tools/skills/catalog-index.js";

const tree = {
  sha: "sha-source-123", truncated: false,
  tree: [
    { type: "blob", path: "skills/centraldark-delegacao/SKILL.md", sha: "abc" },
    { type: "blob", path: ".agents/skills/hermes/hermes-agent/SKILL.md", sha: "def" },
    { type: "blob", path: ".agents/skills/team/hermes-agent/SKILL.md", sha: "ghi" },
    { type: "blob", path: ".agents/skills/.archive/old-agent/SKILL.md", sha: "jkl" },
    { type: "blob", path: ".agents/skills/hermes/README.md", sha: "xxx" },
    { type: "blob", path: ".claude/skills/synced/old-agent/SKILL.md", sha: "yyy" },
  ],
};

test("une as duas raízes sem contar os mirrors e distingue histórico", () => {
  const entries = indexSkillTree(tree);
  assert.equal(entries.length, 4);
  assert.equal(entries.filter((x) => x.archived).length, 1);
  assert.equal(entries.filter((x) => x.origem === "portable").length, 1);
  assert.equal(entries.filter((x) => x.origem === "agents").length, 3);
});

test("pesquisa paginada sem falso estado de execução", () => {
  const entries = indexSkillTree(tree);
  const r = searchSkills(entries, { busca: "hermes-agent", limit: 1, offset: 0 });
  assert.equal(r.total, 2);
  assert.equal(r.skills.length, 1);
  assert.equal(r.has_more, true);
  assert.equal(r.skills[0].carregada, "UNKNOWN");
  assert.equal(r.skills[0].executada, "UNKNOWN");
  assert.equal(searchSkills(entries, {}).total, 3);
  assert.equal(searchSkills(entries, { incluir_arquivadas: true }).total, 4);
});

test("nome duplicado bloqueia escolha implícita; path exato resolve", () => {
  const entries = indexSkillTree(tree);
  const ambiguous = resolveSkill(entries, { nome: "hermes-agent" });
  assert.equal(ambiguous.estado, "AMBIGUOUS");
  assert.equal(ambiguous.candidates.length, 2);
  const selected = resolveSkill(entries, { path: ".agents/skills/team/hermes-agent/SKILL.md" });
  assert.equal(selected.estado, "RESOLVED");
  assert.equal(selected.entry.sha, "ghi");
  assert.equal(resolveSkill(entries, { nome: "skill-ausente" }).estado, "NOT_FOUND");
  assert.equal(resolveSkill(entries, { path: ".agents/skills/.archive/old-agent/SKILL.md" }).estado, "NOT_FOUND");
});

test("índice incompleto/sem prova falha fechado", () => {
  assert.throws(() => indexSkillTree({ tree: [], truncated: true }), /TRUNCATED/);
  assert.throws(() => indexSkillTree({ truncated: false }), /UNAVAILABLE/);
  assert.throws(() => indexSkillTree({
    tree: [{ type: "blob", path: "skills/a/../SKILL.md", sha: "bad" }],
  }), /INVALID_OR_DUPLICATE/);
});
