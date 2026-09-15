---
title: "Auto-Ingestão Delta Útil — contrato canônico"
date: 2026-09-15
status: CANONICO_CANDIDATE
owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md
source: DELTAUNIFICADOCENTRALDARK.md + PR #1543 + main viva
sensitivity: INTERNAL
---

# Auto-Ingestão Delta Útil

## Intenção

A CentralDark pode buscar e absorver automaticamente tudo que for necessário para continuar a missão, desde que cada entrada passe por provenance, dedupe, owner existente, prova e contraprova. Isso amplia a leitura; não duplica autoridade e não cria segundo cérebro.

```text
AUTO_INGESTAO_DELTA_UTIL=true
ONE_SYSTEM_ONLY=true
SECOND_BRAIN_FORBIDDEN=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_PASS=false
MODEL_OUTPUT_IS_NOT_USER_INPUT=true
TOOL_OUTPUT_IS_NOT_USER_INPUT=true
```

## Fontes permitidas como matéria
```text
AUTHENTIC_USER_TURN
CONVERSATION_ATTACHMENT
GOOGLE_DRIVE_OWNER
GITHUB_ISSUE_PR_COMMIT
CI_ARTIFACT
RUNTIME_LOG_SANITIZED
VPS_STATE_SANITIZED
CASA_WORKTREE_STATE
OBSIDIAN_VAULT_STATE
MCP_TOOL_OUTPUT
SCREENSHOT_OR_HTML_WITNESS
```

Cada fonte entra como matéria observada, não como verdade final.

## Provenance mínima obrigatória

```text
source_id
source_surface
source_class
observed_at
content_hash_or_revision
owner_candidate
sensitivity_class
sanitized=true
lineage_target
proof_target
```
Sem provenance suficiente, o material fica em `CRYSTAL_CANDIDATE` ou `QUARANTINE_UNKNOWN`.

## Funil autônomo

```text
DISCOVER_AUTHORIZED_SOURCES
→ COLLECT_METADATA_ONLY_WHEN_POSSIBLE
→ SANITIZE
→ HASH_OR_REVISION_PIN
→ DEDUPE
→ CLASSIFY_SCOPE
→ FIND_EXISTING_OWNER
→ EXTRACT_DELTA_UTIL
→ ONE_WRITER_PER_CONFLICT_SCOPE
→ PATCH_MINIMUM
→ TEST
→ COUNTERPROOF
→ RECEIPT
→ PR_OR_EXISTING_LINEAGE
→ MAIN_ONLY_AFTER_MERGE
```

## Fan-out seguro

```text
READERS_MAX_PER_SIDE=50
READERS_PARALLEL=true
READERS_PURPOSE=evidence|lineage|dedupe|counterproof|owner_discovery
WRITER_COUNT_PER_CONFLICT_SCOPE=1
JUDGE_INDEPENDENT_FROM_WRITER=true
```
Cinquenta frentes podem observar, comparar e testar hipótese. Nenhuma frente paralela escreve no mesmo escopo sem rendezvous.

## Anti-autoengano

```text
RENDERED_TEXT_AS_USER_TURN=FAIL
STREAM_FRAGMENT_AS_AUTHENTIC_TURN=FAIL
CHAT_ONLY_STATE=FAIL
SECRET_OR_TOKEN_IN_LOG=FAIL
UNSANITIZED_RUNTIME_LOG=FAIL
OLD_COPY_AS_CURRENT_REALITY=FAIL
DIRECT_MAIN_WRITE_AS_NORMAL_FLOW=FAIL
TELEMETRY_COMMIT_SPAM=FAIL
```

## Rotas duráveis

```text
IF DRIVE_AVAILABLE -> preserve revision/link/hash
IF GITHUB_AVAILABLE -> preserve PR/commit/receipt
IF ONE_PROVIDER_FAILS -> try other authorized durable provider
IF BOTH_FAIL -> blocked: EXTERNAL_PERSISTENCE_BLOCKED
MIRROR != SOURCE_OF_TRUTH
PERSISTENCE != PROMOTION
```

## Resultado esperado

```text
INGESTION_EXPANDS_CONTEXT=true
INGESTION_DOES_NOT_GRANT_AUTHORITY=true
INGESTION_DOES_NOT_PROVE_RUNTIME=true
CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true
NEXT_AGENT_CONTINUES_BY_RECEIPT=true
```
