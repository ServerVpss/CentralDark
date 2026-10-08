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
`NEXT_CURSOR=HERMES_CHAT_ORACLE_LOOP_AND_HUD_WINDOWS_READBACK`
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
| G08 Sync main→runtime | MAIN_PASS; RUNTIME_SKILL_SEAL_PASS | `--check`, safe `--apply`, `--seal`, SHA/hash e drift preservado |
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

## Readback G08 — 2026-10-08T03:38:58Z

**Actor da aplicação:** terminal VPS autorizado via Remote Desktop Commander executando o **owner existente** `scripts/skill-sync-check.sh`. **Não atribuir essa execução ao Hermes chat:** o `hermes chat --oneshot` foi acionado, não retornou resposta útil dentro do orçamento e a sessão foi encerrada; `HERMES_CHAT_READBACK=UNKNOWN`.

```text
MAIN_SHA=56e619a281553c5b38dfdcacd3ad1e9aa97f24af
AUTOSYNC_SKILLS=26
TARGETS=52
APPLY: SYNCED=50 UPDATED=2 ORACLE_REQUIRED=0 UNKNOWN=0 MAIN_RUNTIME_LOCK=PASS
SEAL:  SYNCED=52 UPDATED=0 ORACLE_REQUIRED=0 UNKNOWN=0 MAIN_RUNTIME_LOCK=PASS
META_LUPA_MAIN_SHA256=e7f04683a40fda0a49497b35d7a3ec7e93fcade9b982f6e3f8bdf6f445290132
META_LUPA_RUNTIME_SHA256=e7f04683a40fda0a49497b35d7a3ec7e93fcade9b982f6e3f8bdf6f445290132
ORACLE_MAIN_SHA256=3bc1d88fd8c8fd842a7f82454cf376b6885d66973f6b3fb433e1947915c68d4b
ORACLE_RUNTIME_SHA256=3bc1d88fd8c8fd842a7f82454cf376b6885d66973f6b3fb433e1947915c68d4b
SKILL_SYNC_RECEIPT=PASS
```

**Escopo exato:** skills opt-in `SKILL.md` apenas; a auxiliar `meta-lupa/KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md` existe na main, mas **não** foi encontrada em `~/.hermes/skills/` e **não** é coberta pelo sync atual. As perguntas principais foram incluídas no `meta-lupa/SKILL.md` que foi selado. `G08_SKILL_MIRROR=PASS`, mas `G08_HERMES_CHAT_E2E=UNKNOWN`; não declarar `GOAL_FIXED_POINT`.

**Próximo teste:** Hermes retorna receipt correlacionado ao mesmo `LOOP_ID` em CHAT_GLOBAL; native compact/rehydrate, projeção Goal no heartbeat e leitura do Obsidian Windows continuam desconhecidos. Nenhum segundo writer ou cron foi criado.
