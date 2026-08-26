# CentralDark Omni Router — uma porta, motores substituíveis

Status: IMPLEMENTATION_CANDIDATE
Owner: CentralDark / routing
Intenção: SEGREDO/CHEFE

## Contrato

```text
ONE_SYSTEM_ONLY=true
ONE_ENTRYPOINT=true
MODEL_IS_REPLACEABLE=true
APP_IDENTITY=CENTRALDARK
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

## Fluxo

```text
CENTRALDARK APP
→ CENTRALDARK OMNI ROUTER
→ engine selecionado
   ├─ Claude Code local CLI
   ├─ OpenAI API oficial
   └─ Hermes endpoint compatível
→ resposta normalizada
→ receipt de engine/modelo/duração
```

## Estado do legado

```text
elite-gateway/zendriver/chatgpt = FROZEN_NOT_DELETED
```

O transporte legado via automação de `chatgpt.com` não participa deste router. O código permanece preservado no repositório para reconciliação/histórico, mas não é rota de produção deste contrato.

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
```

## Boundaries

- sem segundo app;
- sem segundo cérebro;
- sem votação entre modelos;
- sem fallback oculto;
- sem segredo em log;
- sem browser automation como API escondida;
- sem mutação/deploy automático;
- runtime local continua `NOT_PROVEN` até execução real no alvo.

## Prova mínima

O script contém `--self-test` para validar roteamento, normalização e redaction sem chamar provedores externos.

```text
python centraldark_omni_router.py --self-test
```

A execução real de Claude/OpenAI/Hermes exige que cada engine esteja configurado no runtime local correspondente.

## Fechamento de lacunas amarelas

O Omni Router permanece o único owner de roteamento. A skill `.agents/skills/engine-gap-closure/SKILL.md` adiciona procedimento de diagnóstico e fechamento sem criar novo motor.

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

`GuardiaoCasa` pode ser usado como linguagem/alias visual para a fronteira, mas não ganha owner físico separado.

```text
BOUNDARY_GUARD_PROFILE
= TRUST_FIREWALL
+ PERMISSIONS
+ META_LUPA
+ PROOF_OWNERSHIP
+ OUTPUT_GUARD
```

Pergunta discriminante:

```text
ESTA_ACAO_PODE_ATRAVESSAR_ESTA_FRONTEIRA?
```

### Engine capability card

Cada engine deve separar declaração, configuração e execução observada:

```text
DECLARED
→ CONFIGURED
→ ROUTER_OBSERVED
→ INVOCATION_OBSERVED
→ COUNTERPROOF_SURVIVED
```

`CONFIGURED != INVOCATION_PROVEN`.

### Probe read-only

```text
python scripts/trigger-fabric/engine_gap_probe.py
```

O probe mede branch/HEAD e `GET /health`, produz cards de capacidade e mantém Writer/CI/provider invocation como `UNKNOWN` quando não possui evidência correspondente.

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

Ausência de um termo mantém somente o ponto afetado amarelo; não converte UNKNOWN em PASS e não bloqueia trabalho independente comprovadamente seguro.
