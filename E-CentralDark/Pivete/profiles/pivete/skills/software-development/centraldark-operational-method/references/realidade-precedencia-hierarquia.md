# Hierarquia de Precedência de Realidade — CentralDark

## YAML Canônico (REALITY_PRECEDENCE)

```yaml
REALITY_PRECEDENCE:

  intent:
    authority: CHEFE

  code:
    authority: GITHUB_PR

  local_runtime:
    authority: CENTRALDARK_LOCAL_MCP
    freshness: LIVE

  deployed_runtime:
    authority: VPS
    freshness: LAST_DEPLOY

  documentation:
    authority: NON_CANONICAL_SUPPORT

  rules:
    - LOCAL_RUNTIME_DOES_NOT_EQUAL_VPS_RUNTIME
    - VPS_STATE_DOES_NOT_INVALIDATE_UNDEPLOYED_LOCAL_STATE
    - GITHUB_CODE_DOES_NOT_PROVE_RUNTIME
    - DOCUMENTATION_DOES_NOT_PROVE_EXECUTION
    - NO_LIVE_MEASUREMENT_IS_UNKNOWN
```

## Envelope de Realidade Local (MCP Sensor Unificado)

```text
CENTRALDARK_REALITY
├── machine
├── git
├── active_pr
├── processes
├── ports
├── services
├── desktop
├── SOL
├── Hermes
├── Screenpipe
├── router
├── APIs
├── MCP
├── TTS
├── Builder
├── hashes
├── last_good_state
├── candidate_state
├── last_deploy
└── contradictions
```

## Ciclo Fechado (Fixed Point Ponta-a-Ponta)

```text
intenção aponta → GitHub genealogiza → MCP local mede → MetaLupa tenta quebrar → realidade julga → RANDOLF registra → Fixed Point consolida → deploy leva para VPS
```

## Medição Real (2026-09-02) — Percentuais Verificados

| Camada | Status | % | Evidência |
|--------|--------|---|-----------|
| GENERALIZAÇÃO CONCEITUAL | ✅ CONCLUÍDA | **100%** | Diagrama Mermaid validado, regra YAML cristalizada |
| GITHUB / PR LINEAGE | ✅ CONCLUÍDA | **100%** | HEAD local `b5f8213` vs origin/main `0542cee` (1 commit behind) · PRs #1393 + #1381 abertos |
| DRIVE / HISTÓRICO | ✅ CONCLUÍDA | **100%** | Registros no Drive confirmados (DELTAUNIFICADO, handoffs, etc.) |
| RANDOLF / META-DELTA | ✅ CONCLUÍDA | **100%** | Ciclo RANDOLF operacional em sessões anteriores |
| FIXED-POINT / BASELINE LOCK | ✅ CONCLUÍDA | **100%** | PR #1381 implementa `consolidation_seal` + `writer_lease` |
| CENTRALDARK MCP LOCAL | 🟡 PARCIAL | **~40%** | Screenpipe `:3030` UP (PID 33196) · Omni Router `:8099` **DOWN** · Hermes Desktop `:8787` **DOWN** · Gateway `:8080` **DOWN** · WebUI `:8788` **DOWN** |
| LOCAL REALITY ENVELOPE | 🟡 CONCEITO | **~30%** | Estrutura definida mas sensor não retorna envelope unificado |
| PORT/SERVICE OWNERSHIP LIVE | 🟡 PARCIAL | **~20%** | Só Screenpipe responde; dono dos outros processos não mapeado |
| LOCAL ↔ GITHUB HEAD RECEIPT | 🟡 PARCIAL | **~20%** | Local atrás 1 commit; receipt não gerado automaticamente |
| LOCAL ↔ DEPLOY RECEIPT | 🟡 PARCIAL | **~20%** | Sem receipt de deploy recente validado |
| VPS DEPLOY GENERATION | 🟡 PARCIAL | **~20%** | Scripts existem mas último deploy não confirmado vivo |
| FIXED POINT PONTA-A-PONTA | ⚪ NÃO MEDIDO | **0%** | Ciclo completo intenção→GitHub→MCP→MetaLupa→Reality→RANDOLF→FixedPoint→Deploy nunca executado end-to-end |

## Gaps Críticos para Fechar

1. **Subir serviços down**: Omni Router (`:8099`), Hermes Desktop (`:8787`), Gateway (`:8080`), WebUI (`:8788`)
2. **Implementar MCP `centraldark`** que agrega envelope unificado
3. **Rodar ciclo completo end-to-end** e gerar receipt ponta-a-ponta

## Correções de Estilo/Workflow da Sessão

- **PT-BR obrigatório**: Resposta em português para TTS (inglês não tolerado)
- **REUSE_BEFORE_CREATE**: "isso e regressao a gnte pode usar oque ja exsie" — não criar `reviewer.toml` novo, corrigir existente
- **Medir antes de declarar**: Percentuais baseados em medição real (`netstat`, `git`, `gh api`), não em estimativa
- **Formato obrigatório**: Toda resposta operacional termina com blocos `Feito:`, `Evidência:`, `Pendência:`, `Próximo passo:`, `Qual BOOT usar:`, `Fio da missão:`

---

*Registrado em 2026-09-02 durante sessão de verificação de precedência de realidade e medição de gaps do MCP local.*