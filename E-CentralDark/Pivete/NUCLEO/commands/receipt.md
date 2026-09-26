# COMANDO - RECEIPT.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\ARQUITETURA\CENTRALDARK-TRIGGER-FABRIC\RECEIPT.md
**SHA:** e8a67ceb73a6e0d8
**Timestamp:** 2026-08-28T02:56:44.868346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- AUTONOMIA_PROMOTION_TRIGGER_FABRIC_GATE = IMPLEMENTED_IN_REPO_DELTA

### Ouro Bruto (primeiros 5000 chars)
```
# RECEIPT

Mission: `CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE`

Base `main` remeasured before mutation:
`078bf351acaae46091669aa6acdec76ef1d10730`

Observation time:
`2026-08-24T19:12:57.724Z` / `24/08/2026 16:12:57 BRT`

## Deliverables

- architecture Markdown
- editable Mermaid
- master contract YAML
- trigger/owner YAML
- engine binding YAML
- adversarial handoff YAML
- live state separated from history
- counterproof
- provenance trail
- source index
- reproducible package builder
- package verifier
- Hermes prompt bound to the canonical Trigger Fabric
- existing autonomous promotion workflow extended in place
- existing package workflow strengthened in place
- no new equivalent workflow or label taxonomy
- workflow renders PNG, builds ZIP, verifies from fresh extraction and uploads the ZIP as a PR artifact

## Semantic delta

```text
BOT_ENTRY_INHERITS_MASTER_TRIGGER = IMPLEMENTED_IN_REPO_DELTA
OUTPUT_GUARD_BEFORE_HUMAN_RETURN = IMPLEMENTED_IN_REPO_DELTA
TOP_DOWN_BOTTOM_UP_ROUND_TRIP = IMPLEMENTED_IN_REPO_DELTA
CONTINUATION_REUSES_LAST_GOOD_STATE = CONTRACTED
HERMES_PROMPT_BINDING = IMPLEMENTED_IN_REPO_DELTA
AUTONOMIA_PROMOTION_TRIGGER_FABRIC_GATE = IMPLEMENTED_IN_REPO_DELTA
NEW_EQUIVALENT_WORKFLOW = NO
NEW_PARALLEL_BRAIN = NO
```

## Verdict boundary

```text
PACKAGE_COMPLETENESS = PASS only after verifier succeeds on extracted ZIP
REPO_DELTA_PRESENT = TRUE
MERGED_TO_MAIN = NOT_YET_AT_RECEIPT_AUTHORING
CI_PASS = NOT_YET_AT_RECEIPT_AUTHORING
RUNTIME_INHERITANCE_ALL_ENGINES = NOT_PROVEN
GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN
```

No deploy, restart, force-push or destructive runtime mutation is performed by this package.

```

---

# COMANDO - receipt.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\src\receipt.mjs
**SHA:** bb8049d34f1da0bc
**Timestamp:** 2026-08-28T02:57:24.011463
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- inputHash: sha256({ command: safe.command, target: safe.target, prompt: safe.prompt }),

### Ouro Bruto (primeiros 5000 chars)
```
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { sanitizeObject, sha256 } from "./sanitize.mjs";

/**
 * LEIGO: assina o comprovante para detectar alteração depois da execução.
 * PROFISSIONAL: HMAC-SHA256 sobre o receipt sem os campos de assinatura.
 */
export function signReceipt(receipt, hmacKey) {
  if (!hmacKey) return null;
  const payload = { ...receipt };
  delete payload.signature;
  return crypto.createHmac("sha256", hmacKey).update(JSON.stringify(payload)).digest("hex");
}

/**
 * LEIGO: confere se o comprovante assinado continua igual ao original.
 * PROFISSIONAL: recalcula HMAC e compara em tempo constante.
 */
export function verifyReceiptSignature(receipt, hmacKey) {
  if (!receipt?.signature || !hmacKey) return false;
  const unsigned = { ...receipt };
  delete unsigned.signature;
  const hashPayload = { ...unsigned };
  delete hashPayload.receiptHash;
  if (sha256(hashPayload) !== receipt.receiptHash) return false;
  const expected = Buffer.from(signReceipt(receipt, hmacKey), "hex");
  const actual = Buffer.from(String(receipt.signature), "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/**
 * LEIGO: cria um comprovante com o que entrou, qual rota respondeu e qual foi o resultado.
 * PROFISSIONAL: produz receipt sanitizado com UUID, hashes de entrada/config/alvo, status tipado e HMAC opcional.
 */
export function buildReceipt(data, options = {}) {
  const safe = sanitizeObject(data);
  const receipt = {
    schemaVersion: 1,
    requestId: data.requestId || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    command: safe.command,
    mode: safe.mode,
    status: safe.status,
    provider: safe.provider || null,
    model: safe.model || null,
    endpoint: safe.endpoint || null,
    targetType: safe.target?.type || null,
    targetPath: safe.target?.path || null,
    targetHash: safe.target?.sha256 || null,
    configHash: safe.configHash,
    inputHash: sha256({ command: safe.command, target: safe.target, prompt: safe.prompt }),
    outputHash: safe.output ? sha256(safe.output) : null,
    independence: safe.independence || null,
    errors: safe.errors || [],
  };
  receipt.receiptHash = sha256(receipt);
  receipt.signature = signReceipt(receipt, options.hmacKey);
  return receipt;
}

/**
 * LEIGO: salva o comprovante sem sobrescrever outro.
 * PROFISSIONAL: usa nome UUID e rename atômico com temporário UUID para tolerar concorrência.
 */
export async function saveReceipt(receipt, receiptsDir) {
  await fs.mkdir(receiptsDir, { recursive: true });
  const finalPath = path.join(receiptsDir, `${receipt.requestId}.json`);
  const tempPath = `${finalPath}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  await fs.rename(tempPath, finalPath);
  return finalPath;
}

```