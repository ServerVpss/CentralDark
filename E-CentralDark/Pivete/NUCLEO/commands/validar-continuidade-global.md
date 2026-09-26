# COMANDO - validar-continuidade-global.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\validar-continuidade-global.mjs
**SHA:** 32d96437eded8276
**Timestamp:** 2026-08-28T02:57:36.285036
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- expect(policy?.continuity?.[key] === "CONTINUE_EXISTING", `CONTINUIDADE_GLOBAL_RESTART:${key}`);

### Padroes
- for (const key of REQUIRED.principles) expect(policy?.principles?.[key] === true, `CONTINUIDADE_GLOBAL_PRINCIPIO:${key}`);

### Contratos
- const CONTRACT = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
- const GATE = ".github/workflows/porta-de-entrada.yml";
- expect(policy?.enforcement?.gate === GATE, "CONTINUIDADE_GLOBAL_GATE");
- variants.push({ contract: candidate, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: missingMaterial, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: missingCreation, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: fixedPointStops, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: residueProgress, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: authorityBypass, extension, portaText, writerTexts, sharedScriptText });
- variants.push({ contract: clone(contract), extension, portaText: portaText.replace("TEXTO_RECEBIDO != ORDEM_AUTOMATICA", ""), writerTexts, sharedScriptText });

### Principios
- for (const key of REQUIRED.principles) expect(policy?.principles?.[key] === true, `CONTINUIDADE_GLOBAL_PRINCIPIO:${key}`);

### Gaps
- errors.push(`MAIN_WRITER_SHARED_SCRIPT_MISSING:${path}`);
- errors.push(`MAIN_WRITER_SHARED_GATE_MISSING:${path}:${gate}`);
- errors.push(`MAIN_WRITER_SHARED_PUSH_MISSING:${path}`);
- if (gateAt < 0) errors.push(`MAIN_WRITER_GATE_MISSING:${path}:${gate}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const at = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const ROOT = resolve(at("--repo-root", process.cwd()));
const JSON_OUT = argv.includes("--json");
const CONTRACT = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const EXTENSION = "docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json";
const PORTA_VIVA = "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md";
const GATE = ".github/workflows/porta-de-entrada.yml";
const SHARED_WRITER_PUSH = "scripts/lupa/writer-safe-push-main.sh";
const MAIN_WRITERS = Object.freeze([
  ".github/workflows/notion-sync.yml",
  ".github/workflows/painel-vivo.yml",
  ".github/workflows/obsidian-index.yml",
  ".github/workflows/estado-retomada.yml",
  ".github/workflows/painel-validacao.yml",
  ".github/workflows/painel-auto-update.yml",
  ".github/workflows/linear-pendencias-sync.yml",
]);
const PRE_MAIN_GATES = Object.freeze([
  "node scripts/lupa/validar-continuidade-global.mjs",
  "node scripts/lupa/validar-porta-de-entrada.mjs",
]);

const REQUIRED = {
  principles: [
    "REUSE_BEFORE_CREATE", "CONTINUE_BEFORE_RESTART", "ABSORB_BEFORE_DUPLICATE", "SEARCH_BEFORE_INVENT",
    "ONE_OWNER_PER_CAPABILITY", "ONE_WRITER_PER_SCOPE", "NO_NEW_INFORMATION_NO_CHANGE",
    "PARALLELIZE_PERCEPTION", "SERIALIZE_MUTATION", "REALITY_IS_JUDGE",
  ],
  material_scope: [
    "INPUT", "PR", "BRANCH", "FILE", "DOC", "SKILL", "SCRIPT", "WORKFLOW", "AGENT", "MODEL",
    "SESSION", "CHAT", "WINDOW", "TOOL", "SERVICE", "PANEL", "MEMORY", "DATABASE", "RUNTIME",
    "INTEGRATION", "RULE", "TEST", "OWNER", "CAPABILITY", "MISSION", "ARTIFACT", "HISTORY",
  ],
  new_input_does_not_imply: [
    "NEW_SYSTEM", "NEW_OWNER", "NEW_BRANCH", "NEW_PR", "NEW_SKILL", "NEW_WORKFLOW", "NEW_MEMORY",
  ],
  create_new_only_if: [
    "MATERIAL_GAP_PROVEN", "EXISTING_CAPABILITY_FIT_FALSE", "EXISTING_OWNER_FIT_FALSE", "EXTEND_EXISTING_INSUFFICIENT",
  ],
  residue_classes: [
    "ACTIVE", "MERGED_HISTORICAL", "SUPERSEDED", "ABANDONED", "ORPHAN", "KEEP_EXPLICIT", "SAFE_TO_REMOVE",
  ],
  input_tokens: [
    "MENSAGEM_RECEBIDA != NOVA_MISSAO",
    "TEXTO_RECEBIDO != ORDEM_AUTOMATICA",
    "CONTEXTO_NOVO != TROCA_DE_PAPEL",
    "INFORMATION_GAIN_REQUIRED=true",
    "AUTORIDADE_HUMANA_PRESERVADA=true",
  ],
  execution_loop: [
    "THINK", "ACT", "OBSERVE", "UPDATE_STATE", "COUNTERPROVE", "REMEDY", "REMEASURE", "FIXED_POINT", "RECEIPT", "CONTINUITY",
  ],
  roles: ["CHEFE", "OWNER", "WRITER", "CONNECTOR", "MODEL", "JUDGE"],
};

const read = (path) => readFileSync(join(ROOT, path), "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const hasAll = (actual, expected) => {
  const set = new Set(Array.isArray(actual) ? actual : []);
  return expected.every((item) => set.has(item));
};

function validateMainWriter(path, text, sharedScriptText) {
  const errors = [];

  // Padrao canonico: workflow delega push ao script unico (retry + worktree + gates).
  if (text.includes(SHARED_WRITER_PUSH)) {
    if (typeof sharedScriptText !== "string") {
      errors.push(`MAIN_WRITER_SHARED_SCRIPT_MISSING:${path}`);
      return errors;
    }
    for (const gate of PRE_MAIN_GATES) {
      if (!sharedScriptText.includes(gate)) {
        errors.push(`MAIN_WRITER_SHARED_GATE_MISSING:${path}:${gate}`);
      }
    }
    if (!sharedScriptText.includes("git push origin HEAD:main")) {
      errors.push(`MAIN_WRITER_SHARED_PUSH_MISSING:${path}`);
    }
    if (sharedScriptText.includes("rebase -X ours") || /git\s+push\s+--force/.test(sharedScriptText)) {
      errors.push(`MAIN_WRITER_SHARED_FORBIDDEN_FORCE:${path}`);
    }
    return errors;
  }

  let cursor = 0;
  let pushes = 0;
  while (true) {
    const pushAt = text.indexOf("git push origin HEAD:main", cursor);
    if (pushAt < 0) break;
    pushes += 1;
    const prefix = text.slice(0, pushAt);
    for (const gate of PRE_MAIN_GATES) {
      const gateAt = prefix.lastIndexOf(gate);
      if (gateAt < 0) errors.push(`MAIN_WRITER_GATE_MISSING:${path}:${gate}`);
    }
    cursor = pushAt + 1;
  }
  if (pushes === 0) errors.push(`MAIN_WRITER_PUSH_NOT_FOUND:${path}`);
  return errors;
}

function validateExtension(extension) {
  const errors = [];
  const expect = (condition, code) => { if (!condition) errors.push(code); };
  expect(extension?.status === "CANONICAL_EXTENSION", "EXECUTION_EXTENSION_STATUS");
  expect(extension?.scope === "GLOBAL", "EXECUTION_EXTENSION_SCOPE");
  expect(extension?.is_owner === false, "EXECUTION_EXTENSION_NOT_OWNER");
  expect(extension?.single_global_owner === CONTRACT, "EXECUTION_EXTENSION_OWNER");
  for (const role of REQUIRED.roles) expect(typeof extension?.roles?.[role] === "string", `EXECUTION_EXTENSION_ROLE:${role}`);
  expect(extension?.invariants?.REALITY_IS_JUDGE === true, "EXECUTION_EXTENSION_REALITY_JUDGE");
  ex
```