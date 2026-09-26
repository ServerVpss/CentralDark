# 🏷️ STATUS BADGE FABRIC — FIXED POINT

## INTENÇÃO DO CHEFE

Todo workflow da CentralDark deve possuir sinal visual descobrível e reproduzível sem depender de clique manual em **Create status badge**.

A regra vale para presente e histórico observável:

WORKFLOW
→ EXECUÇÃO
→ BRANCH
→ EVENTO
→ PR quando houver
→ `badge.svg` nativo do GitHub
→ índice canônico
→ remedição
→ FIXED_POINT

## Lei

```text
BADGE_FABRIC=PERSISTENT
BADGE_SOURCE=GITHUB_ACTIONS_NATIVE_SVG
BADGE_IS_TELEMETRY_NOT_PROOF=true
UNKNOWN_IS_NOT_PASS=true
SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true
CREATE_STATIC_DUPLICATE_SVG=false
REUSE_NATIVE_BADGE_BEFORE_CREATE=true
```

Não criamos cópias estáticas de SVGs que o próprio GitHub já gera dinamicamente.
O owner é a URL canônica:

`/actions/workflows/<workflow>.yml/badge.svg`

Com filtros, quando existe execução observada:

`?branch=<branch>&event=<event>`

## Cobertura

A Badge Fabric deve inventariar:

1. todos os arquivos `.github/workflows/*.yml|yaml` atuais;
2. todas as branches retornadas pela API do GitHub;
3. todas as workflow runs acessíveis no histórico;
4. todos os PRs acessíveis com `state=all`;
5. combinação branch/workflow/evento somente quando houve execução observada;
6. branches históricas apagadas ficam `HISTORICAL_UNKNOWN` se não houver run preservada — nunca inventar PASS.

## Loop autônomo seguro

```text
SCAN
→ CLASSIFY
→ OWNER
→ DETERMINISTIC_FIX_IF_KNOWN
→ VERIFY
→ COUNTERPROOF
→ RESCAN
→ NO_NEW_FAILURES
→ FIXED_POINT
```

### Pode corrigir autonomamente

- badge ausente do índice quando o workflow existe;
- workflow/run/branch/PR novo não indexado;
- link `badge.svg` determinístico desatualizado;
- duplicata exata no índice;
- ordenação/normalização determinística;
- índice divergente do inventário atual.

### Não pode fabricar autonomamente

- transformar badge vermelho/amarelo em verde;
- concluir que check amarelo é PASS;
- declarar branch apagada como saudável sem run;
- alterar lógica do workflow só para melhorar badge;
- esconder workflow falho;
- apagar histórico porque está vermelho.

Falha real vira minério/rastro e entra no próximo cursor; não é descartada.

## Persistência

Owner operacional:

- `scripts/ci/generate_status_badges.py`
- `.github/workflows/status-badge-fabric.yml`
- `docs/STATUS-BADGES.md`

A atualização futura ocorre em branch única:

`automation/status-badge-fabric`

A workflow reutiliza o PR aberto dessa branch quando existir. Não cria PR por rodada.

## Critério de ponto fixo

```text
WORKFLOW_FILES == WORKFLOW_BADGES_INDEXED
OBSERVED_BRANCH_RUN_COMBOS == BRANCH_BADGES_INDEXED
ALL_PRS_API == PR_HISTORY_INDEXED
DUPLICATE_BADGE_ROWS == 0
FABRIC_DIFF_AFTER_REGEN == 0
UNKNOWN_PRESERVED == true
```

Quando a regeneração não produz diff:

`BADGE_FABRIC=REUSE_PROOF_NO_CHANGE`

Quando produz diff:

`BADGE_FABRIC=DELTA_MATERIAL → PR único → same-head checks`.

## Verso operacional

📜 “Cada obra terá seu sinal visível; o sinal mostra o estado, mas não substitui o Juiz.”

O verso pode variar com a ocasião. A intenção, owner, prova e destino conceitual não mudam.
