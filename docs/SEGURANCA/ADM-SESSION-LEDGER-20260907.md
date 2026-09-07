# 🛡️ ADM — LEDGER DE SESSÕES E AUDITORIA CENTRALDARK

> Índice administrativo das sessões materialmente observadas. Este arquivo referencia evidências; não transforma narrativa em prova.

## Escopo

- Repositório canônico: `ServerVpss/CentralDark`
- PR owner desta área: `#1444`
- Área: `docs/SEGURANCA/`
- Regra: `CURRENT > HISTORY`, `UNKNOWN != PASS`, `DOCUMENTED != EXECUTED`, `ACTION != PROOF`
- Sem secrets, tokens, cookies ou chaves SSH.

## Sessões consolidadas

| Sessão/evidência | Estado | Prova |
|---|---|---|
| TIKTAK / ACORDAR | cristalizada | handoffs e receipts dentro do PR #1444 |
| Correção Signal-Watcher | aplicada | `argValue()` restaurado no commit `09478cd` do PR #1445 |
| Correção Fable | aplicada | `FABLE_LOOP.default_routing=false` no commit `09478cd` |
| Runner Linux | observado | job executado por `vmi3256920-centraldark` |
| VPS/Hermes | conexão observada | sessão em `/root/CentralDark` |
| Comando bloqueado | BLOCKED | scanner informou ausência de consentimento; não houve retry |
| SSH direto | UNKNOWN/HUMAN_FRONTIER | nenhum shell SSH autorizado nesta sessão |
| Runner Windows | UNKNOWN | não há execução self-hosted Windows observada |
| POMBO r02 | MAIN_REMEASURED_WITH_GATE_BREACH | lineage preservado; sem revisão nova comprovada |

## Como averiguar a segurança

1. Confirmar o SHA atual do PR e a base `main`.
2. Listar workflows/check-runs associados **ao mesmo SHA**.
3. Abrir logs dos jobs falhos e registrar causa, owner e condição de reabertura.
4. Verificar runner, branch, permissões e caminho alterado.
5. Classificar cada item como `PROVADO`, `QUEBRADO` ou `EVIDÊNCIA FALTANTE`.
6. Só então aplicar delta mínimo no owner correto e repetir a contraprova.

## Cadeado operacional

```text
MUTATION_REQUIRES_OWNER=true
SAME_HEAD_REQUIRED=true
NO_FORCE_PUSH=true
NO_MAIN_DIRECT_WRITE=true
NO_SECRET_HANDLING=true
BLOCKED_COMMAND_IS_NOT_RETRIED=true
```

## Limites

Este ledger não prova deploy, runtime de produção, SSH, Windows self-hosted ou fixed point. Checks pulados, cancelados ou em fila permanecem sem autoridade para promover.

## Próximo cursor

```text
FETCH_CURRENT_HEAD
→ CHECKS_SAME_HEAD
→ READ_FAILED_LOG
→ OWNER_SCOPED_FIX
→ COUNTERPROOF
→ RECEIPT
```
