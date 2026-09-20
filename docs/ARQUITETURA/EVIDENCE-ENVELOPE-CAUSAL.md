# Envelope causal único — CentralDark

**Owner:** `supabase/functions/_shared/evidence-envelope.mjs`  
**Entrada existente:** `supabase/functions/agent-log/index.ts`  
**Persistência existente:** `public.agent_events`  
**Produtores ligados/previstos pelo mesmo contrato:** `scripts/vps-reporter.js`, CentralDark Omni Router quando telemetria estiver configurada.

## Objetivo

Normalizar sinais de Hermes/Pivete, MCP/VPS, Cloudflare/API, Chrome/CDP,
modelos roteados pelo Omni Router, DarkAI, voz/áudio e guardrails em uma única
forma de evidência.

O envelope não cria cérebro, router ou event bus novo: ele é o
adaptador/normalizador causal existente.

```text
sensor/produtor
→ agent-log
→ evidence-envelope
→ dedupe causal
→ agent_events
→ painel/telepainel/cápsula como projeção
```

## MODEL_TOUCH

A reconciliação arquitetural do PR-mãe #1189 amarra o receipt observável do
Omni Router a esta mesma entrada:

```text
MODEL / ENGINE
→ CENTRALDARK OMNI ROUTER
→ event=model_touch
→ agent-log
→ evidence-envelope
→ agent_events
```

O evento carrega apenas fatos observáveis da invocação:

```text
engine
resolved_model
mission_id quando fornecido
trace_id quando fornecido
writer_scope quando fornecido
sha quando observado
latency_ms
result
fallback_used
action_is_proof
request_id/correlation_id no context quando fornecidos
```

Não persiste prompt/resposta bruta por padrão e não guarda raciocínio privado.

```text
MISSION_ID_MUST_NOT_BE_FABRICATED=true
SECRET_REDACTION_REQUIRED=true
ACTION_IS_NOT_PROOF=true
```

A entrega da telemetria tem veredito próprio:

```text
TELEMETRY_CONFIGURED
TELEMETRY_ATTEMPTED
TELEMETRY_DELIVERED
```

Um provider pode responder e a telemetria falhar; isso precisa ficar visível,
mas não altera retroativamente o fato da invocação:

```text
TELEMETRY_FAILURE != PROVIDER_FAILURE
PROVIDER_PASS != TELEMETRY_PASS
```

## Dedupe

Eventos iguais são agrupados pela identidade causal:

```text
event + producer + target + mission_id + writer_scope + sha + cause_key
```

`trace_id`, timestamps, latência e contagem não criam uma nova causa por si
só. O resultado mantém `count`, `first_seen`, `last_seen`, `rate` e
`duplicates_collapsed`.

Isso impede que 1.000 warnings ou 1.000 receipts equivalentes virem 1.000
“provas independentes”.

## Campos do evento

```text
event, producer, target, operational_scope,
first_seen, last_seen, count, rate,
context, session, mission_id, writer_scope, sha, trace_id,
latency_ms, tokens, cost, result, causal_fingerprint
```

`context` é sanitizado; chaves e formatos de segredo são redigidos antes de
persistir ou responder.

## Sensores e limites

| Sensor | O que pode provar | O que não prova sozinho |
|---|---|---|
| VPS/MCP | estado/latência observado no alvo | saúde do Chrome ou modelo externo |
| Cloudflare | camada que passou pelo proxy | PM2/SQLite/Hermes local |
| Chrome/CDP | DOM, console, rede, trace, Lighthouse | mecanismo oculto fora do browser |
| Omni Router | engine/model/latência/result da invocação roteada | correção da resposta, ação externa ou runtime não invocado |
| ChatGPT/Zendriver legado | resposta/latência do gateway observado | disponibilidade de upstream não testado |
| DarkAI | resposta da edge function | crédito/saúde de outros providers |
| voz/áudio | STT/TTS, duração, erro e latência | conteúdo privado bruto como regra |
| guardrails | bloqueio/resultado sanitizado | segurança de componentes não instrumentados |

## Exemplo de produtor

```json
{
  "agent": "OmniRouter",
  "area": "AI/Routing",
  "acao": "model_touch",
  "events": [{
    "event": "model_touch",
    "producer": "centraldark-omni-router",
    "target": "openai/gpt-x",
    "mission_id": "mission-x",
    "writer_scope": "read-only-evaluation",
    "sha": "<sha-observado>",
    "trace_id": "<trace-id-recebido>",
    "result": "PASS",
    "latency_ms": 812,
    "tokens": null,
    "cost": null,
    "context": {
      "engine": "openai",
      "resolved_model": "gpt-x",
      "fallback_used": false,
      "action_is_proof": false
    }
  }]
}
```

## MetaLupa Harvest

O envelope é rastro, não aprendizado automático:

```text
EVIDENCE ENVELOPE
→ DEDUPE
→ RENDEZVOUS
→ META_LUPA HARVEST
→ NEW INFORMATION?
   NÃO → NO_CHANGE
   SIM → DELTA CANDIDATE
→ TEST / COUNTERPROOF / REGRESSION
→ OWNER CANÔNICO
```

Portanto:

```text
RASTRO != DELTA_PROVADO
PATTERN != PROOF
MODEL_TOUCH != MODEL_QUALITY_PASS
```

## Prova e promoção

O envelope registra observação; não promove código, não autoriza deploy e não
substitui `docs/ARQUITETURA/AGENT-ADAPTER-CANONICO.md`, a Cápsula Observável,
Proof Ownership ou o fluxo canônico de promoção.

`UNKNOWN` permanece UNKNOWN até o sensor aplicável emitir evidência no mesmo
alvo/escopo.
