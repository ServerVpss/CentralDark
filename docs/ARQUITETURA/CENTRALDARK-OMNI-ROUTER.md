# CentralDark Omni Router — uma porta, motores substituíveis

Status: `IMPLEMENTATION_CANDIDATE`
Owner: CentralDark / routing
Intenção: SEGREDO/CHEFE
PR-mãe arquitetural: #1189

## Contrato

```text
ONE_SYSTEM_ONLY=true
ONE_ENTRYPOINT=true
MODEL_IS_REPLACEABLE=true
APP_IDENTITY=CENTRALDARK
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
NO_SECOND_EVENT_BUS=true
```

## Fluxo

```text
CENTRALDARK APP
→ CENTRALDARK OMNI ROUTER
→ engine selecionado
   ├─ Claude Code local CLI
   ├─ OpenAI API oficial
   ├─ Hermes endpoint compatível
   └─ Nous Research inference
→ resposta normalizada
→ receipt de engine/modelo/duração
→ MODEL_TOUCH opcional
→ Evidence Envelope existente
```

## MODEL_TOUCH — reutilização do Evidence Envelope

Owner de evidência:

```text
supabase/functions/_shared/evidence-envelope.mjs
```

Entrada física existente:

```text
supabase/functions/agent-log/index.ts
```

O Router **não cria collector novo**. Se as duas variáveis abaixo estiverem
configuradas no runtime, ele envia o evento ao `agent-log`:

```text
CENTRALDARK_AGENT_LOG_URL
AGENT_LOG_SECRET
```

Campos de trace reaproveitados quando chegam na requisição:

```text
X-Mission-Id
X-Trace-Id
X-Request-Id
X-Correlation-Id
X-Writer-Scope
X-CentralDark-Sha
```

`mission_id` não é inventado quando ausente.

Evento:

```text
event=model_touch
producer=centraldark-omni-router
target=<engine>/<resolved_model>
latency_ms=<observado>
result=PASS|FAIL
context.engine
context.resolved_model
context.fallback_used=false
context.action_is_proof=false
```

A resposta de sucesso expõe o estado da entrega:

```text
centraldark.model_touch.evidence_delivery:
  configured
  attempted
  delivered
  status
```

Portanto:

```text
PROVIDER_INVOCATION_PASS != TELEMETRY_DELIVERED
TELEMETRY_FAILURE != PROVIDER_FAILURE
TELEMETRY_FAILURE_MUST_BE_VISIBLE
MODEL_TOUCH != ACTION_PROOF
```

Erros de provider tentam emitir `model_touch result=FAIL` quando a telemetria
está configurada e depois preservam a exceção original.

## Interface

O router expõe uma superfície OpenAI-compatible local:

```text
GET  /health
GET  /v1/models
POST /v1/chat/completions
```

Seleção de engine por `model`:

```text
auto
openai/<model>
claude-code/<model>
claude:<model>
hermes/<model>
nous/<model>
```

## Estado do legado

```text
elite-gateway/zendriver/chatgpt = FROZEN_NOT_DELETED
```

O transporte legado via automação de `chatgpt.com` não participa deste router.
Código preservado para histórico/reconciliação não é rota ativa por presença.

## Boundaries

- sem segundo app;
- sem segundo cérebro;
- sem segundo event bus;
- sem votação entre modelos como verdade;
- sem fallback oculto;
- sem segredo em log/evento;
- sem browser automation como API escondida;
- sem mutação/deploy automático;
- runtime local continua `NOT_PROVEN` até execução real no alvo.

## IA local

Hermes/local endpoint e qualquer futuro runtime local obedecem:

```text
DECLARED
→ CONFIGURED
→ ROUTER_OBSERVED
→ INVOCATION_OBSERVED
→ COUNTERPROOF_SURVIVED
```

Na reconciliação do PR-mãe:

```text
LOCAL_AI_RUNTIME=UNKNOWN
LOCAL_AI_DEFERRED_UNTIL_MEASURED=true
CONFIGURED != INVOCATION_PROVEN
ROUTER_HEALTH_PASS != PROVIDER_INVOCATION_PASS
```

ODS ou outro corpo local pode entrar futuramente como capacidade; não é
promovido antes da medição.

## Prova mínima

```text
python centraldark_omni_router.py --self-test
```

O self-test valida sem provedores externos:

- roteamento;
- normalização;
- redaction;
- shape `MODEL_TOUCH`;
- reuso dos IDs fornecidos;
- ausência de `mission_id` fabricado;
- `action_is_proof=false`.

Execução real de Claude/OpenAI/Hermes/Nous exige configuração e invocação no
runtime correspondente.

## Fechamento de lacunas amarelas

O Omni Router permanece o único owner de roteamento. A skill
`.agents/skills/engine-gap-closure/SKILL.md` adiciona procedimento de
diagnóstico e fechamento sem criar novo motor.

```text
YELLOW_GAP
→ DISCOVERY
→ ENGINE_CAPABILITY_CARD
→ SAFE_ZONE_CHECK
→ BOUNDARY_GUARD_PROFILE
→ WRITER_RESOLUTION
→ RUNTIME_PROBE
→ PROOF_DISCOVERY
→ META_LUPA
→ REALITY_JUDGE
```

### Boundary Guard derivado

```text
BOUNDARY_GUARD_PROFILE
= TRUST_FIREWALL
+ PERMISSIONS
+ META_LUPA
+ PROOF_OWNERSHIP
+ OUTPUT_GUARD
```

### Engine capability card

```text
DECLARED
→ CONFIGURED
→ ROUTER_OBSERVED
→ INVOCATION_OBSERVED
→ COUNTERPROOF_SURVIVED
```

### Probe read-only

```text
python scripts/trigger-fabric/engine_gap_probe.py
```

```text
ROUTER_HEALTH_PASS != PROVIDER_INVOCATION_PASS
NO_STATUS_OBSERVED != CI_PASS
WRITER_UNKNOWN != WRITER_NONE
```

### Fixed point do motor

```text
BOUNDARY_GUARD_BOUND
AND WRITER_RESOLVED_FOR_MUTATION
AND RUNTIME_CLAIM_MEASURED
AND CI_CLAIM_HAS_APPLICABLE_EVIDENCE
AND ENGINE_CARD_MATCHES_OBSERVED_STATE
AND NO_MATERIAL_UNKNOWN_FOR_VERDICT
AND COUNTERPROOF_SURVIVED
→ ENGINE_GAP_FIXED_POINT
```

Ausência de um termo mantém somente o ponto afetado `UNKNOWN/NOT_PROVEN`; não
converte UNKNOWN em PASS e não bloqueia trabalho independente comprovadamente
seguro.
