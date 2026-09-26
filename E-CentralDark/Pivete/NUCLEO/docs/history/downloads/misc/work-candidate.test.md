# OUTRO - work-candidate.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\tests\work-candidate.test.mjs
**SHA:** ab678179e3bd13d6
**Timestamp:** 2026-08-28T02:55:09.810467
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- }, { branch_sha: HEAD_A, risk: "R2" });

### Ouro Bruto (primeiros 5000 chars)
```
import test from "node:test";
import assert from "node:assert/strict";
import {
  candidateFingerprint,
  deriveWriterScope,
  extractWorkCandidates,
} from "../src/lib/work-candidate.js";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);

test("fingerprint é estável para ordem de chaves e ignora título cosmético", () => {
  const common = {
    capability: "github_read",
    writerScope: "capability:github_read",
    target: "repo",
    branchSha: HEAD_A,
  };
  const a = candidateFingerprint({ ...common, input: { b: 2, a: 1 } });
  const b = candidateFingerprint({ ...common, input: { a: 1, b: 2 } });
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test("mudança material de HEAD muda fingerprint", () => {
  const base = {
    capability: "github_read",
    writerScope: "capability:github_read",
    target: "repo",
    input: { q: "x" },
  };
  assert.notEqual(
    candidateFingerprint({ ...base, branchSha: HEAD_A }),
    candidateFingerprint({ ...base, branchSha: HEAD_B }),
  );
});

test("resultado pode propor candidato, mas authorization do próprio resultado é ignorada", () => {
  const out = extractWorkCandidates({
    ok: true,
    work_candidates: [{
      title: "Investigar delta",
      capability: "github_read",
      input: { query: "delta" },
      authorization: "approved",
    }],
  }, { branch_sha: HEAD_A, risk: "R2" });

  assert.equal(out.accepted.length, 1);
  assert.equal(out.accepted[0].writer_scope, "capability:github_read");
  assert.equal(out.accepted[0].risk, "R2");
  assert.equal("authorization" in out.accepted[0], false);
});

test("material sensível é rejeitado antes de chegar ao plano de controle", () => {
  const byKey = extractWorkCandidates({
    work_candidates: [{
      capability: "github_read",
      input: { api_key: "curto-mas-proibido" },
    }],
  }, { branch_sha: HEAD_A });

  const byValue = extractWorkCandidates({
    work_candidates: [{
      capability: "github_read",
      input: { value: "sk-" + "x".repeat(24) },
    }],
  }, { branch_sha: HEAD_A });

  assert.equal(byKey.accepted.length, 0);
  assert.equal(byKey.rejected[0].reason, "SENSITIVE_MATERIAL");
  assert.equal(byValue.accepted.length, 0);
  assert.equal(byValue.rejected[0].reason, "SENSITIVE_MATERIAL");
});

test("revisão do pai é obrigatória e scope é derivado da capability", () => {
  assert.equal(deriveWriterScope("GitHub_Read"), "capability:github_read");
  assert.equal(deriveWriterScope("bad space"), null);

  const out = extractWorkCandidates({
    work_candidates: [{ capability: "github_read", input: {} }],
  }, { branch_sha: "nao-e-sha" });

  assert.equal(out.accepted.length, 0);
  assert.equal(out.rejected[0].reason, "PARENT_REVISION_UNPROVEN");
});

```