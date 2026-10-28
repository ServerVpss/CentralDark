# 2026-10-02 — Sistema híbrido multirota, bidirecional e transversal

## Origem

Durante uma leitura da Casa, a rota antiga `Remote Desktop Commander -> SEGREDO Windows` ficou offline. O erro seria concluir `CASA_OFFLINE` ou `SYSTEM_BLOCKED` a partir de uma única rota.

A busca pelos owners existentes mostrou que a CentralDark já tinha os cristais:

```text
LOCAL_BLOCKED_IS_NOT_GLOBAL_BLOCKER=true
LOCAL_CAPABILITY_GAP_REQUIRES_CROSS_SURFACE_HANDOFF=true
HUMAN_FRONTIER_REQUIRES_EXHAUSTED_AUTHORIZED_BODIES=true
LOCAL_TOOL_MISS_IS_NOT_GLOBAL_CAPABILITY_MISS=true
ONE_ROUTE_FAILED != MISSION_FAILED
```

O delta novo foi unir isso num modelo explícito de capability sistêmica multirota.

## Prova viva desta sessão

Snapshot temporal de 2026-10-02:

```text
Rota antiga:
Remote Desktop Commander / SEGREDO Windows
→ OFFLINE naquele instante

Rota alternativa:
conector CENTRALDARK
→ 3 bindings CENTRALDARK-OS ONLINE

Binding A:
CENTRALDARK-OS / root
→ Tailscale Running
→ tailnet IP observado

Bindings B/C:
CENTRALDARK-OS / usuário
→ Tailscale NeedsLogin
```

Conclusão válida:

```text
ROUTE_STATE != SYSTEM_STATE
TAILSCALE_STATE(binding_A) != TAILSCALE_STATE(binding_B)
SEGREDO_RDC_OFFLINE != CENTRALDARK_SYSTEM_OFFLINE
```

Esses estados são evidência temporal. Devem ser remedidos antes de claim CURRENT futuro.

## Modelo canônico

```text
ROUTE = transporte/binding
SURFACE = ponto de interação
CAPABILITY = capacidade realmente disponível naquela rota
OWNER = autoridade técnica da função
REALITY = efeito observado

CAPABILITY_SYSTEM(t)
= UNION(
    CAPABILITY(route,t)
    for route in AUTHORIZED_ROUTES
    if route measured alive and applicable to claim
  )
```

A união não significa somar permissões cegamente. Cada capability continua limitada por autorização, escopo, claim, tempo e owner.

## Bidirecionalidade

A mesma CentralDark pode ser observada/operada:

```text
FORA -> DENTRO
DENTRO -> FORA
CASA <-> CENTRALDARK-OS
CENTRALDARK-OS <-> VPS
VPS <-> CASA
CHAT_GLOBAL <-> MCP
HERMES <-> SHELL
GITHUB <-> RUNTIME
TAILSCALE <-> BRIDGE
RDC <-> DESKTOP
SSH <-> CONTROL_PLANE
TELEGRAM <-> GATEWAY
```

Isso não cria múltiplos sistemas. São nervos diferentes do mesmo organismo.

## Transversalidade

Uma mesma intenção pode atravessar superfícies diferentes sem trocar owner:

```text
INTENÇÃO
→ superfície disponível
→ rota autorizada
→ capability medida
→ owner existente
→ executor aplicável
→ mesma lei de prova
→ REALIDADE
```

`TRANSVERSAL_ROUTE_REUSES_SAME_OWNER_AND_PROOF_LAW=true`.

## Regra de falha

Nunca promover falha local para falha sistêmica sem medir alternativas aplicáveis:

```text
ROUTE_FAIL
→ CLASSIFY_EXACT_ROUTE
→ KEEP_SYSTEM_STATE_UNDECIDED
→ INVENTORY_AUTHORIZED_ALTERNATE_ROUTES
→ MEASURE_ALTERNATES
→ REUSE_LIVE_CAPABILITY
→ COMPARE_SAME_CLAIM_SCOPE_TIME
→ PASS | UNKNOWN | BLOCKED
```

## O que NÃO inferir

- rota presente não significa rota saudável;
- rota saudável não significa todas as rotas saudáveis;
- Tailscale Running num binding não apaga NeedsLogin em outro;
- três devices com mesmo nome não provam duplicação arquitetural;
- multiplicidade de bindings pode representar contas/processos/transportes distintos;
- rota documentada não é prova de runtime;
- falha de uma tool não prova ausência da capability global;
- capability global não concede autoridade extra.

## Relação com #145

O #145 separou:

```text
MARCA != SUPERFÍCIE != CAPABILITY != ESTADO != PROVA
```

O #146 acrescenta:

```text
ROTA != SISTEMA
CAPABILITY(route) != CAPABILITY_SYSTEM
ONE_ROUTE_FAILED != SYSTEM_FAILED
```

## Cristal

```text
ONE_ROUTE_FAILED_IS_NOT_SYSTEM_FAILED=true
LOCAL_ROUTE_OFFLINE_IS_NOT_GLOBAL_CAPABILITY_OFFLINE=true
LOCAL_BLOCKED_IS_NOT_GLOBAL_BLOCKER=true
ALTERNATE_AUTHORIZED_ROUTE_BEFORE_HUMAN_BLOCKER=true
HUMAN_FRONTIER_REQUIRES_EXHAUSTED_AUTHORIZED_BODIES=true
ROUTE_HEALTH_MUST_BE_REMEASURED_PER_BINDING=true
SAME_LOGICAL_SYSTEM_MAY_BE_REACHED_FROM_OUTSIDE_IN_AND_INSIDE_OUT=true
BIDIRECTIONAL_ROUTE_DOES_NOT_CREATE_SECOND_SYSTEM=true
TRANSVERSAL_ROUTE_REUSES_SAME_OWNER_AND_PROOF_LAW=true
CAPABILITY_SYSTEM_MODEL=UNION_OF_MEASURED_AUTHORIZED_ROUTE_CAPABILITIES
```

## NEXT_CURSOR

Quando uma rota falhar, procurar e medir as rotas autorizadas existentes antes de envolver o CHEFE ou declarar blocker. Registrar sempre qual binding provou qual claim.
