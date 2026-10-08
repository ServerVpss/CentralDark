---
title: "PR equivalente — Prova E2E Goal-Clause / META-GRILL / Hermes / Obsidian"
status: "E2E_PROOF_PENDING"
created_utc: "2026-10-08T03:31:48Z"
intent_authority: "SEGREDO/CHEFE"
writer_scope: "Hermes runtime evidence + existing owner readbacks"
main_architecture_sha: "56e619a281553c5b38dfdcacd3ad1e9aa97f24af"
source_contract: "docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md#21"
truth: "SOURCE_PROVEN_PARTIAL; RUNTIME_E2E_UNKNOWN"
---

# PR equivalente: verificação, não segunda implementação

A arquitetura, código de avaliação e projeção HUD **já foram publicados diretamente na `main`** no SHA acima, conforme autorização explícita do CHEFE. Este PR transporta somente o **receipt de prova E2E** para o Hermes completar com fatos; não duplica a implementação e não deve ser marcado verde por existir.

## GOAL / contrato único

`INTENT_ID=CHEFE-GOAL-METAGRILL-ORACLE-OBSIDIAN-20261008`
`GOAL_FINGERPRINT=main:56e619a281553c5b38dfdcacd3ad1e9aa97f24af+G01..G12`
`OWNER=Hermes (execução) + owners canônicos por escopo`
`NEXT_CURSOR=HERMES_SYNC_CHECK_THEN_SAFE_APPLY_AND_RUNTIME_READBACK`
`FIXED_POINT=NOT_PROVEN`

| Cláusula | Estado provado | Prova / contraprova exigida |
|---|---|---|
| G01 Identidade CURRENT | SOURCE_PASS; RUNTIME_UNKNOWN | SOUL/RULES/AGENTS e leitura CURRENT pelo Hermes |
| G02 META-GRILL | SOURCE_PASS; RUNTIME_UNKNOWN | gancho/skill presentes; entrevista aplicada em turno correlacionado |
| G03 Horn/Goal | UNIT_PASS | 14/14 testes Horn; CLI `--goal-stdin` com PASS/UNKNOWN/STALE/FAIL |
| G04 Owner único | SOURCE_PASS; RUNTIME_UNKNOWN | owner map + ausência de writer concorrente durante execução |
| G05 GREEN_STATE/receita | UNIT_PASS; REPLAY_UNKNOWN | testes Horn reuse + replay com fingerprint real |
| G06 Oracle/Deep Research | UNKNOWN | Hermes↔CHAT_GLOBAL 3 turnos, candidato, custo/valor e receipt |
| G07 Capsule/compact | UNIT_PASS; HOOK_UNKNOWN | 53/53 testes continuity; native compact/rehydrate readback |
| G08 Sync main→runtime | MAIN_PASS; RUNTIME_UNKNOWN | `--check`, safe `--apply`, `--seal`, SHA/hash e drift preservado |
| G09 Reality Judge/sensor | UNIT_PASS; LIVE_UNKNOWN | positivo + negativo + contraprova independente do sensor |
| G10 PR equivalência | PR_OPEN_PENDING | G01..G12 idênticos ao contrato; links de CI/receipts |
| G11 HUD/Obsidian | JS_SYNTAX_PASS; WINDOWS_UNKNOWN | heartbeat projection real + plugin Obsidian + arquivo Windows readback |
| G12 Receipt/tempo/cursor | SOURCE_PASS; E2E_UNKNOWN | UTC ISO + Bahia, receipt durável, next cursor e replay |

## Evidência local no SHA de arquitetura

- `node --test scripts/lupa/horn-reuse-fixed-point.test.mjs apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs apps/modulos/HERMES-CORE/core/horn-proof-gate.test.mjs scripts/ci/centraldark-horn-line-gate.test.mjs`: **79/79 PASS**.
- `node scripts/lupa/validar-continuidade-global.mjs`: **PASS**.
- `node --check` do script extraído de `docs/HUD/HUD.html`: **PASS**.
- `git diff --check`: **PASS**.
- `node scripts/lupa/validar-porta-de-entrada.mjs`: **5 achados no baseline e 5 após patch**, incluindo duas inconsistências de contrato e três órfãos BRAIN. **Não resolvidos por este PR**; não atribuir ao delta atual nem fingir verde.
- `git push` não forçado para `main` e `git ls-remote` retornaram `56e619a281553c5b38dfdcacd3ad1e9aa97f24af` em 2026-10-08T03:31:48Z. **GitHub SHA != VPS runtime sync**.

## Protocolo para Hermes (sem segundo writer)

1. Revalidar `origin/main` e SHA exato; medir estado do repo VPS e runtime Hermes em canais independentes.
2. Executar `scripts/skill-sync-check.sh --check` do owner existente. Preservar todo `ORACLE_REQUIRED_*_DRIFT`, comparar main + runtime + docs + intenção antes de promover.
3. Executar `--apply` **somente** se o owner determinar que o alvo é seguro; `--seal` depois, com hashes e backups. **Não** rodar reset/force/overwrite cego na árvore suja.
4. Provar Hermes↔Oracle no mesmo LOOP_ID e captura de três turnos, sem promover resposta externa diretamente.
5. Provar capsule antes/depois de compact/clean apenas quando hook oficial existir; caso contrário `HOOK_UNKNOWN`.
6. Provar HUD real no Obsidian Windows com medição e timestamp de fonte, não só sintaxe de HTML; sem Windows readback `WINDOWS_UNKNOWN`.
7. Atualizar este receipt pelo writer existente com `BEGIN/FINAL`, SHA, comando, exit, logs sanitizados, contraprova, `measured_at_utc`, `owner`, `NEXT_CURSOR` e estados por cláusula. Só declarar `FIXED_POINT` quando todas as cláusulas obrigatórias forem PASS e receipt final estiver validado.

`UNKNOWN != PASS`; `REALITY_JUDGE_AFTER_EFFECT`; `NO_SECRET_LEAK`; `ONE_WRITER_PER_SCOPE`; `REUSE_BEFORE_CREATE`.
