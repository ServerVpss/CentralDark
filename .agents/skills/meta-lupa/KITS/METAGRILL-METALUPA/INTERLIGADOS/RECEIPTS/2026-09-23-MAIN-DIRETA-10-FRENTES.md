# ⭕ !AURÉOLA — MAIN DIRETA + 10 FRENTES

CURRENT_MAIN_AT_WRITE=c6a003ddf19050a6154e2bebbad84139ba38e591

## Decisão operacional atual

```text
MODE=DIRECT_MAIN_SOFT_EVOLUTION
NEW_PR_DEFAULT=false
EXISTING_OPEN_PRS_REMAIN_VALID=true
PR_MOTHER=#1562
PR_MOTHER_MERGE_FORBIDDEN=true
PR_MOTHER_IS_HISTORY_HANDOFF_LEDGER=true
HARD_PR_GATES=DEFERRED
MIN_SECURITY_ONLY=true
REUSE_BEFORE_CREATE=true
NO_PARALLEL_ARCHITECTURE=true
NO_V1_V2_V3_OWNER_FORK=true
REALITY=JUDGE
```

## 10 frentes — começo → meio → fim

| # | Setor | Capacidade dirigente | Começo | Meio | Fim |
|---|---|---|---|---|---|
| 1 | Fonte da verdade / governança | META_COGNIÇÃO | medir CURRENT | separar regra viva de legado | main + receipt coerentes |
| 2 | Reuso de owner / arquitetura | META_LUPA | localizar owner | falsificar duplicação | estender o mesmo owner |
| 3 | Contas / Hub / Gmail | META_GRILL | medir oauth-broker | provar integração sem segundo auth | Gmail projetado no Hub existente |
| 4 | Notificações / e-mail | FABLE | reproduzir mensagem ruim | traduzir humano primeiro + receipt técnico | comentário legível que preserva prova |
| 5 | Lógica de capability | TLC23 | separar UNKNOWN de NAO | derivar efeito só de premissa explícita | UNKNOWN não fabrica SUPPORT_REQUIRED |
| 6 | Histórico Git / PRs | RECONCILIAR | inventariar PRs existentes | manter delta útil sem novo PR obrigatório | #1562 guarda handoff/história |
| 7 | Runtime Hermes | CONTRAPROVA | medir runtime quando causal | testar efeito real | T1 ou UNKNOWN localizado |
| 8 | MCP / conectores / rotas | MULTIBÚSSOLA | medir superfícies | cruzar sem segundo sistema | uma rota/owner por capability |
| 9 | VPS / deploy | HERMES | receber main provada | deploy causal mínimo | HEAD/runtime remediados |
| 10 | HUD / receipts / continuidade | FIXED_POINT | abrir delta | registrar evidência + next cursor | fixed point do delta e loop #1562 |

## Fluxo CURRENT

```text
DELTA_NOVO
→ CURRENT_MAIN_REMEASURE
→ OWNER_EXISTENTE
→ MENOR_PATCH
→ META_CAPABILITY_ADEQUADA
→ PROVA
→ CONTRAPROVA
→ SECRET_SCAN
→ SYNTAX/PARSE QUANDO APLICÁVEL
→ TESTE ALVO QUANDO DISPONÍVEL
→ COMMIT DIRETO MAIN
→ MAIN_READBACK
→ DEPLOY_CAUSAL SE APLICÁVEL
→ T1
→ RECEIPT #1562
→ FIXED_POINT DO DELTA
```

PR já aberto não é apagado nem invalidado. Permanece fonte histórica/delta útil e pode ser reconciliado depois. Nenhum PR novo é requisito por rotina enquanto este modo estiver ativo.

## Delta integrado nesta passagem

- Gmail reutiliza `apps/modulos/oauth-broker/server.mjs` e a superfície **Contas / Hub**.
- Nenhum mail-hub, auth V2/V3 ou arquitetura paralela foi criado.
- Comentários que viram e-mail passam a falar humano primeiro e deixam detalhe técnico recolhido.
- Capability `UNKNOWN` não fabrica `SUPPORT_REQUIRED`; apenas `NAO` explícito e materialmente requerido dispara suporte automático.
- O PR-mãe continua sem merge e serve como ledger/handoff.

```text
UNKNOWN != PASS
UNKNOWN != FAIL_BY_ITSELF
NAO_EXPLICITO + CAPABILITY_REQUERIDA => SUPPORT_REQUIRED
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
REALIDADE É O JUIZ
```
