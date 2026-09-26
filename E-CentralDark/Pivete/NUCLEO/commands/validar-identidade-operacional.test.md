# COMANDO - validar-identidade-operacional.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\validar-identidade-operacional.test.mjs
**SHA:** 371e63fa1403c1b6
**Timestamp:** 2026-08-28T02:57:36.358012
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- "DELTA_DE_CRENCA_OU_REGRA=SIM",
- "DELTA_DE_CRENCA_OU_REGRA=SIM",

### Contratos
- const contract = JSON.parse(claimContract());
- const contract = JSON.parse(claimContract());
- const contract = JSON.parse(claimContract());

### Ouro Bruto (primeiros 5000 chars)
```
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  findForbidden,
  runValidation,
  validateAgentClaimPolicy,
  validateExternalSourceBoundary,
  validateExternalDelta,
  validateGenericAddedText,
  validateProfileRoot,
  validateRequiredTokens,
} from "./validar-identidade-operacional.mjs";

const require = createRequire(import.meta.url);

function write(root, path, content) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function deltaFixture(path, before, after) {
  const root = mkdtempSync(join(tmpdir(), "centraldark-external-delta-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "guard@centraldark.invalid"]);
  git(root, ["config", "user.name", "CentralDark Guard"]);
  write(root, "seed.txt", "base\n");
  if (before != null) write(root, path, before);
  git(root, ["add", "--", "seed.txt", ...(before != null ? [path] : [])]);
  git(root, ["commit", "-q", "-m", "base"]);
  const baseRef = git(root, ["rev-parse", "HEAD"]);
  write(root, path, after);
  git(root, ["add", "--", path]);
  git(root, ["commit", "-q", "-m", "delta"]);
  const headRef = git(root, ["rev-parse", "HEAD"]);
  return { root, baseRef, headRef };
}

function claimContract(overrides = {}) {
  const base = {
    applies_to: [
      "chatgpt", "claude", "codex", "gemini", "copilot", "cursor", "windsurf",
      "hermes", "plugins", "future_agents", "mcp", "webui", "cli", "ci", "cd", "telegram",
    ],
    agent_claim_policy: {
      marker: "AGENT_CLAIM_CAPABILITY_REQUIRED",
      narrative_changes_system_state: false,
      claim_must_not_exceed_observable_capability: true,
      permanent_behavior_without_proved_persistence: "BLOCK",
      absolute_commitment_without_verifiable_mechanism: "REWRITE_TO_OBSERVABLE_SCOPE",
      communication_policy: {
        critique_target: "SYSTEM_OR_ARTIFACT_NOT_HUMAN",
        status_colors: {
          YELLOW: "CONCRETE_WORK_IN_PROGRESS_OR_TARGET_PROOF_PENDING",
          NONE: "UNKNOWN_NOT_MEASURED_NOT_APPLICABLE_OR_DESCRIPTIVE",
        },
      },
      integration: {
        one_policy_for_all_adapters: true,
        external_vendor_ui: "OUT_OF_REPO_CONTROL",
      },
    },
  };
  return JSON.stringify({ ...base, ...overrides }, null, 2);
}

function validRepo() {
  const root = mkdtempSync(join(tmpdir(), "centraldark-identidade-"));
  write(
    root,
    "LEIA-ME-IA.md",
    "SEGREDO/CHEFE COMANDA\nSOL ORGANIZA\nPIVETE/HERMES PRESERVA E EXECUTA\n",
  );
  write(
    root,
    "AGENTS.md",
    [
      "existe somente um escritor por escopo",
      "SEGREDO/CHEFE permanece autoridade humana final",
      "SOL coordena, PIVETE/HERMES preserva e executa",
      "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
    ].join("\n"),
  );
  write(
    root,
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    [
      "SEGREDO/CHEFE = humano e autoridade final",
      "SOL = coordenadora da casa e organizadora dos agentes",
      "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
      "WRITER_UNICO=true",
      "UNKNOWN_NAO_PASSA=true",
      "CHEFE_SEGREDO_NECESSARIO",
    ].join("\n"),
  );
  write(
    root,
    "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md",
    "SEGREDO/CHEFE = humano e autoridade final\nPIVETE = Hermes treinado\n",
  );
  write(root, "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json", claimContract());
  write(
    root,
    ".agents/skills/meta-lupa/SKILL.md",
    "AUTORIZACAO_DO_SEGREDO_CHEFE:\nAutoLupa sem prometer certeza absoluta\n",
  );
  write(
    root,
    ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA",
    "0123456789012345678901234567890123456789  .agents/skills/meta-lupa/SKILL.md\n# atualização exige autorização aplicável de SEGREDO/CHEFE\n",
  );
  write(root, "LEIA-ME-IA.md", [
    "SEGREDO/CHEFE COMANDA",
    "SOL ORGANIZA E RECONCILIA",
    "PIVETE/HERMES PRESERVA E EXECUTA",
    "#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR",
    "Convergência adversarial total **só é aberta por solicitação explícita de SEGREDO/CHEFE**",
  ].join("\n"));
  write(root, "AGENTS.md", [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicita
```