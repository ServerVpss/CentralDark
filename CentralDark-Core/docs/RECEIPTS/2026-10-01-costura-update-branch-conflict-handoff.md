# COSTURA — update-branch com handoff para o resolvedor canônico

Data: 2026-10-01  
PR-MÃE: #1562  
Ferida material: PR #1279  
Estado: PROVADO NO ESCOPO DE DETECÇÃO + HANDOFF ESTÁTICO; próximo conflito real ainda precisa provar o ciclo end-to-end.

## Ferida observada

O workflow `PR Update Branch — determinístico` executou:

`PUT /pulls/1279/update-branch`

e recebeu conflito real. O receipt ficou em:

```text
action=BLOCKED
state=CONFLICT_REQUIRES_EXISTING_RESOLVER
exit code=2
```

O erro não era o código 2 em si. A causa era a transição incompleta:

```text
UPDATE_BRANCH
→ CONFLICT_REQUIRES_EXISTING_RESOLVER
→ sem handoff automático para o owner que já existia
```

## Estado do PR #1279

HEAD histórico:

`a70e37521d25b46a6f6c01bcc5f417822d08dadc`

Intenção original:

`vitest 3.2.6 → 3.2.7`

A main CURRENT já continha:

`apps/modulos/Bolt/source/package.json` com `"vitest": "^3.2.7"`

e lockfile correspondente.

A PR estava milhares de commits atrás e conflitante. Como a intenção material já estava satisfeita na main, #1279 foi fechada **sem merge** como superseded pela main.

```text
INTENT_ALREADY_SATISFIED_IN_MAIN=true
STALE_DEPENDABOT_PR_DO_NOT_REMERGE_HISTORY=true
CLOSE_AS_SUPERSEDED_BY_MAIN=true
DIRECT_MAIN_WRITE_FROM_PR1279=0
```

## Correção no owner existente

Commit:

`8732f4e76b885e7195a5ef9c8433a933117fd66b`

Arquivo:

`.github/workflows/pr-update-branch-deterministic.yml`

Quando o update-branch de uma PR same-repo/base main detecta conflito bloqueado, o fluxo agora remede a PR e encaminha para:

```text
repository_dispatch
→ centraldark_dependabot_reconcile
→ .github/workflows/dependabot-auto-merge.yml
→ scripts/dependabot/reconcile-open-prs.mjs
→ scripts/dependabot/resolve-conflicts.sh
```

Nenhum segundo resolvedor foi criado.

## Gate anti-regressão

Commit:

`b38fc086c79c784c32fa64193411ef66ab30e0c2`

O `verify_repo_contract.py` passou a exigir que a COSTURA mantenha o handoff para o resolvedor canônico existente.

Prova no CURRENT:

```text
REPO_CONTRACT_VERIFY=PASS
COSTURA_ROUTE_MARKERS_MISSING=[]
COSTURA_ROUTE_STATIC_PROOF=PASS
```

## Limite da prova

O que está provado:

- conflito no update-branch não deve mais terminar apenas como “precisa do resolvedor” sem rota;
- o handoff está materializado no workflow atual;
- o contrato fiscaliza a existência dessa rota;
- #1279 não precisava ser remergada porque sua intenção já estava satisfeita na main.

O que ainda não está provado:

- um **novo conflito real** atravessando completamente
  `update-branch → repository_dispatch → resolver → novo HEAD → SAME_HEAD CI`.

Portanto:

```text
HANDOFF_STATIC_PROOF=PASS
END_TO_END_NEXT_REAL_CONFLICT=UNKNOWN
UNKNOWN_IS_NOT_PASS=true
```

## Leis preservadas

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_PARALLEL_RESOLVER=true
ACTION_IS_NOT_PROOF=true
EXIT_CODE_IS_SIGNAL_NOT_CAUSE=true
CURRENT > HISTORY
UNKNOWN != PASS
```
