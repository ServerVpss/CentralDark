# COMANDO - policy-learning.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\tests\policy-learning.test.mjs
**SHA:** a054f7c133a07545
**Timestamp:** 2026-08-26T19:10:24.489447
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "trailer de rodapé não reconhecido",
- const result = await registerLearning({ proven: true, pattern: "x", estado: "VERDE_CONSOLIDADO" }, { learningDir: dir });

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { evaluatePolicyGate } from "../runtime/policy-gate.mjs";
import {
  createEvidenceReceipt,
  registerLearning,
  loadLearningForPattern,
  validateLearningContract,
} from "../runtime/learning-store.mjs";

const HEAD = "94e53e97856bc93e0f5c96aafbb4d08685fd5a92";

function fullPolicy(overrides = {}) {
  return {
    MATCH_PROVADO: "SIM", ALTERACAO_LOCAL: "SIM", REVERSIVEL: "SIM", WRITER_UNICO: "SIM",
    ESCOPO_AUTORIZADO: "SIM", MUDANCA_MINIMA: "SIM", TESTE_DISCRIMINATIVO_EXISTE: "SIM",
    TESTE_ANTES_FALHOU: "SIM", TESTE_DEPOIS_PASSOU: "SIM", REGRESSAO_PASSOU: "SIM",
    CASO_NEGATIVO_PASSOU: "SIM", IDEMPOTENCIA_PASSOU: "SIM", ROLLBACK_EXISTE: "SIM",
    HEAD_FIXADO: "SIM", SEM_CONFLITO_CANONICO: "SIM", ARQUIVOS_FORA_ESCOPO_ZERO: 0,
    FAIL_ZERO: 0, SKIPPED_ZERO: 0, UNKNOWN_ZERO: 0,
    SECRETS: "NAO", MERGE: "NAO", DEPLOY: "NAO", VPS: "NAO", PRODUCAO: "NAO", HISTORY_REWRITE: "NAO",
    ...overrides,
  };
}

function fullLearning(overrides = {}) {
  return {
    proven: true,
    estado: "VERDE_CONSOLIDADO",
    pattern: "trailer de rodapé não reconhecido",
    errorExact: "parser retornou writer null",
    cause: "escape duplicado alterou a regex",
    fix: "restaurar escape real na regex existente",
    sourceIds: [`receipt:${"0".repeat(64)}`, `commit:${HEAD}`],
    testBefore: { status: "FAIL", exitCode: 1 },
    testAfter: { status: "PASS", exitCode: 0 },
    regression: { status: "PASS" },
    negativeCase: { status: "PASS" },
    fail: 0, skipped: 0, unknown: 0, filesOutOfScope: 0,
    finalHead: HEAD,
    rollback: "restaurar patch preservado",
    ...overrides,
  };
}

async function learningWithReceipt(dir, overrides = {}) {
  const record = fullLearning({ ...overrides, sourceIds: [] });
  const receipt = await createEvidenceReceipt(record, {
    command: "node --test",
    beforeExit: 1,
    afterExit: 0,
    regression: "PASS",
  }, { learningDir: dir });
  record.sourceIds = [receipt.id, `commit:${record.finalHead}`];
  return record;
}

describe("Policy Gate — todos os parafusos", () => {
  it("default bloqueia", () => assert.equal(evaluatePolicyGate({}).allowed, false));
  it("libera apenas contrato completo", () => assert.equal(evaluatePolicyGate(fullPolicy()).allowed, true));
  it("um único critério ausente bloqueia", () => {
    const result = evaluatePolicyGate(fullPolicy({ CASO_NEGATIVO_PASSOU: "NAO" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("CASO_NEGATIVO_PASSOU=NAO"));
  });
  it("área proibida bloqueia mesmo com provas verdes", () => {
    const result = evaluatePolicyGate(fullPolicy({ DEPLOY: "SIM" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.some((reason) => reason.includes("DEPLOY")));
  });
  it("ausência de declaração SECRETS=NAO bloqueia", () => {
    const flags = fullPolicy();
    delete flags.SECRETS;
    const result = evaluatePolicyGate(flags);
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("SECRETS=DESCONHECIDO"));
  });

  it("UNKNOWN textual não é aceito como zero", () => {
    assert.equal(evaluatePolicyGate(fullPolicy({ UNKNOWN_ZERO: "UNKNOWN" })).allowed, false);
  });
});

describe("Learning Store — prova causal, recibo, dedupe e isolamento", () => {
  it("proven=true sozinho não promove — regressão do falso verde anterior", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning({ proven: true, pattern: "x", estado: "VERDE_CONSOLIDADO" }, { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "PROVA_INCOMPLETA");
    assert.ok(result.missing.includes("TESTE_ANTES_FAIL"));
  });

  it("ANTI_PADRAO nunca é promovido", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning({ estado: "ANTI_PADRAO" }), { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "TENTATIVA_VERMELHA");
  });

  it("contrato estrutural completo é válido", () => assert.equal(validateLearningContract(fullLearning()).valid, true));

  it("contadores ausentes não são tratados como zero", () => {
    const record = fullLearning();
    delete record.skipped;
    const result = validateLearningContract(record);
    assert.equal(result.valid, false);
    assert.ok(result.missing.includes("SKIPPED_ZERO"));
  });

  it("sourceId bem formatado sem recibo real não promove", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning(), { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "PROVENIENCIA_NAO_COMPROVADA");
  });

  it("promove
```

---

# COMANDO - policy-learning.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\qa_skillmaster_audit\qa.teste-de-software.MARKDOWN\tests\policy-learning.test.mjs
**SHA:** 1f4938286be7d067
**Timestamp:** 2026-08-26T19:10:27.549483
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "trailer de rodapé não reconhecido",
- const result = await registerLearning({ proven: true, pattern: "x", estado: "VERDE_CONSOLIDADO" }, { learningDir: dir });

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { evaluatePolicyGate } from "../runtime/policy-gate.mjs";
import { registerLearning, loadLearningForPattern, validateLearningContract } from "../runtime/learning-store.mjs";

function fullPolicy(overrides = {}) {
  return {
    MATCH_PROVADO: "SIM", ALTERACAO_LOCAL: "SIM", REVERSIVEL: "SIM", WRITER_UNICO: "SIM",
    ESCOPO_AUTORIZADO: "SIM", MUDANCA_MINIMA: "SIM", TESTE_DISCRIMINATIVO_EXISTE: "SIM",
    TESTE_ANTES_FALHOU: "SIM", TESTE_DEPOIS_PASSOU: "SIM", REGRESSAO_PASSOU: "SIM",
    CASO_NEGATIVO_PASSOU: "SIM", IDEMPOTENCIA_PASSOU: "SIM", ROLLBACK_EXISTE: "SIM",
    HEAD_FIXADO: "SIM", SEM_CONFLITO_CANONICO: "SIM", ARQUIVOS_FORA_ESCOPO_ZERO: 0,
    FAIL_ZERO: 0, SKIPPED_ZERO: 0, UNKNOWN_ZERO: 0,
    SECRETS: "NAO", MERGE: "NAO", DEPLOY: "NAO", VPS: "NAO", PRODUCAO: "NAO", HISTORY_REWRITE: "NAO",
    ...overrides,
  };
}

function fullLearning(overrides = {}) {
  return {
    proven: true,
    estado: "VERDE_CONSOLIDADO",
    pattern: "trailer de rodapé não reconhecido",
    errorExact: "parser retornou writer null",
    cause: "escape duplicado alterou a regex",
    fix: "restaurar escape real na regex existente",
    sourceIds: ["session:PR664", "test:trailer-rodape"],
    testBefore: { status: "FAIL", exitCode: 1 },
    testAfter: { status: "PASS", exitCode: 0 },
    regression: { status: "PASS" },
    negativeCase: { status: "PASS" },
    fail: 0, skipped: 0, unknown: 0, filesOutOfScope: 0,
    finalHead: "94e53e97856bc93e0f5c96aafbb4d08685fd5a92",
    rollback: "restaurar patch preservado",
    ...overrides,
  };
}

describe("Policy Gate — todos os parafusos", () => {
  it("default bloqueia", () => assert.equal(evaluatePolicyGate({}).allowed, false));
  it("libera apenas contrato completo", () => assert.equal(evaluatePolicyGate(fullPolicy()).allowed, true));
  it("um único critério ausente bloqueia", () => {
    const result = evaluatePolicyGate(fullPolicy({ CASO_NEGATIVO_PASSOU: "NAO" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("CASO_NEGATIVO_PASSOU=NAO"));
  });
  it("área proibida bloqueia mesmo com provas verdes", () => {
    const result = evaluatePolicyGate(fullPolicy({ DEPLOY: "SIM" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.some((reason) => reason.includes("DEPLOY")));
  });
  it("ausência de declaração SECRETS=NAO bloqueia", () => {
    const flags = fullPolicy();
    delete flags.SECRETS;
    const result = evaluatePolicyGate(flags);
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("SECRETS=DESCONHECIDO"));
  });

  it("UNKNOWN textual não é aceito como zero", () => {
    assert.equal(evaluatePolicyGate(fullPolicy({ UNKNOWN_ZERO: "UNKNOWN" })).allowed, false);
  });
});

describe("Learning Store — prova causal, dedupe e isolamento", () => {
  it("proven=true sozinho não promove — regressão do falso verde anterior", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning({ proven: true, pattern: "x", estado: "VERDE_CONSOLIDADO" }, { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "PROVA_INCOMPLETA");
    assert.ok(result.missing.includes("TESTE_ANTES_FAIL"));
  });

  it("ANTI_PADRAO nunca é promovido", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning({ estado: "ANTI_PADRAO" }), { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "TENTATIVA_VERMELHA");
  });

  it("contrato completo é válido", () => assert.equal(validateLearningContract(fullLearning()).valid, true));

  it("contadores ausentes não são tratados como zero", () => {
    const record = fullLearning();
    delete record.skipped;
    const result = validateLearningContract(record);
    assert.equal(result.valid, false);
    assert.ok(result.missing.includes("SKIPPED_ZERO"));
  });

  it("promove e reutiliza por padrão causal", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning(), { learningDir: dir });
    assert.equal(result.promoted, true);
    const found = await loadLearningForPattern("escape duplicado regex trailer", { learningDir: dir });
    assert.equal(found.length, 1);
    assert.equal(found[0].id, result.id);
  });

  it("segunda promoção equivalente deduplica com o mesmo ID", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const first = await registerLearning(fullLearning(), { learningDir: dir });
    const second = await registerLearning(fullLearning(), { learningDir: dir });
    assert.equal(second.reason, "EVENTO_JA_REGISTRADO");

```