# Envelope causal único — CentralDark

**Owner:** `supabase/functions/_shared/evidence-envelope.mjs`  
**Entrada existente:** `supabase/functions/agent-log/index.ts`  
**Persistência existente:** `public.agent_events`  
**Produtor já ligado:** `scripts/vps-reporter.js`

## Objetivo

Normalizar sinais de Hermes/Pivete, MCP/VPS, Cloudflare/API, Chrome/CDP/Lighthouse,
ChatGPT/Zendriver, DarkAI, voz/áudio e guardrails em uma única forma de evidência.
O envelope não cria um cérebro novo: ele é um adaptador/normalizador.

```text
sensor/produtor
→ agent-log
→ evidence-envelope
→ dedupe causal
→ agent_events
→ painel/telepainel/cápsula como projeção
```

## Dedupe

Eventos iguais são agrupados pela identidade causal:

```text
event + producer + target + mission_id + writer_scope + sha + cause_key
```

`trace_id`, timestamps, latência e contagem não criam uma nova causa por si só.
O resultado mantém `count`, `first_seen`, `last_seen`, `rate` e
`duplicates_collapsed`. Isso impede que 1.000 warnings virem 1.000 evidências.

## Campos do evento

```text
event, producer, target, operational_scope,
first_seen, last_seen, count, rate,
context, session, mission_id, writer_scope, sha, trace_id,
latency_ms, tokens, cost, result, causal_fingerprint
```

`context` é sanitizado; chaves e formatos de segredo são redigidos antes de persistir
ou responder.

## Sensores e limites

| Sensor | O que pode provar | O que não prova sozinho |
|---|---|---|
| VPS/MCP | estado/latência observado no alvo | saúde do Chrome ou do modelo externo |
| Cloudflare | camada Cloudflare que passou pelo proxy | PM2/SQLite/Hermes local |
| Chrome/CDP | DOM, console, rede, trace, Lighthouse | mecanismo oculto fora do browser |
| ChatGPT/Zendriver | resposta/latência do gateway observado | disponibilidade de upstream não testado |
| DarkAI | resposta da edge function | crédito/saúde de outros providers |
| voz/áudio | STT/TTS, duração, erro e latência | conteúdo privado bruto como regra |
| guardrails | bloqueio/resultado sanitizado | segurança de componentes não instrumentados |

## Exemplo de produtor

```json
{
  "agent": "Chrome",
  "area": "Browser",
  "acao": "Lighthouse audit",
  "events": [{
    "event": "lighthouse_audit",
    "producer": "chrome-devtools-mcp",
    "target": "Browser|Cloudflare|Site",
    "mission_id": "mission-x",
    "writer_scope": "observability",
    "sha": "<sha-ou-unknown>",
    "trace_id": "<trace-id>",
    "result": "PASS",
    "latency_ms": 812,
    "tokens": null,
    "cost": null,
    "context": {"performance": 92, "accessibility": 98}
  }]
}
```

## Prova e promoção

O envelope registra observação; não promove código, não autoriza deploy e não substitui
`docs/ARQUITETURA/AGENT-ADAPTER-CANONICO.md`, a Cápsula Observável ou o fluxo canônico
de promoção. `UNKNOWN` permanece UNKNOWN até o sensor aplicável emitir evidência.
