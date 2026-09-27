# CENTRALDARK_UNIFIED_SURFACE_PARITY_01 — Parallel Convergence Addendum

**Owner:** `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`  
**Origem:** correção direta do CHEFE após divergência semântica entre janelas/modelos.  
**Status:** contrato semântico de convergência.

## Regra corrigida

O erro é dizer que nunca pode existir caminho paralelo.

```text
CAMINHO_PARALELO != SISTEMA_PARALELO
```

Caminhos paralelos podem existir. O que não pode existir é arquitetura paralela, owner duplicado ou estado vivo concorrente.

## Lei

```yaml
PARALLEL_PATHS_ALLOWED: true
PARALLEL_TOOLS_ALLOWED: true
PARALLEL_MODELS_ALLOWED: true
PARALLEL_WINDOWS_ALLOWED: true
PARALLEL_MODALITIES_ALLOWED: true
CROSS_CHAT_CROSS_MODEL_COUNTERPROOF_ALLOWED: true
PARALLEL_ARCHITECTURE_DUPLICATION_FORBIDDEN: true
PARALLEL_OWNER_DUPLICATION_FORBIDDEN: true
PARALLEL_LIVE_STATE_CONFLICT_FORBIDDEN: true
MANY_ROUTES_ONE_INTENT_ONE_LIVE_STATE: true
MANY_PENS_ONE_FINAL_RECEIPT: true
```

## Significado operacional

O CHEFE pode operar em várias janelas, contas, modelos, IDEs, apps, superfícies, voz, texto, imagem, vídeo, logs, screenshots e runtime local ao mesmo tempo.

Isso não enfraquece o sistema. Isso fortalece a contraprova quando tudo converge para:

```text
UMA_INTENCAO
UM_OWNER_LOGICO
UM_ESTADO_VIVO_RECONCILIADO
UMA_PROVA_FINAL
UM_RECEIPT_FINAL
```

## Diferença dura

Permitido:

```text
multi-canetas
multi-modelos
multi-janelas
multi-modalidades
multi-rotas
cross-chat
cross-history
cross-runtime
```

Proibido:

```text
novo sistema paralelo
owner duplicado sem gap real
estado vivo concorrente
claim sem receipt
falso verde
reescrever cristal provado por opinião
```

## Regra de reconciliação

Quando duas ou mais superfícies trouxerem prova sobre o mesmo escopo:

```text
1. preservar todas as evidências
2. identificar INTENT_ID / OWNER / SCOPE
3. comparar SHA / hash / receipt / tool-call / runtime effect
4. deduplicar descoberta repetida
5. reter delta novo
6. escolher um finalizador canônico por escopo
7. registrar receipt final
8. marcar divergência real como UNKNOWN/BLOCKED até reconciliar
```

## Frase núcleo

```text
PARALELISMO É PERCEPÇÃO + CONTRAPROVA.
DUPLICAÇÃO DE SISTEMA É DRIFT.
MUITOS CAMINHOS PODEM EXISTIR.
O ESTADO FINAL É UM SÓ.
```
