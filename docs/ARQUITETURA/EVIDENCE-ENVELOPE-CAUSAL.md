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
context, session, mission_id, writer_scope, sha, event_id, causation_id, surface_id, attempt_id, trace_id,
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

<!-- CENTRALDARK_ROUTE_RECOVERY_CAUSAL_20261112 -->
## Recuperação de rotas legadas — leitura causal de 12/11/2026

**Intenção:** recuperar o site e a Sala de Controle existentes, sem criar outro painel, servidor, gateway ou normalizador. Esta seção é **evidência de auditoria e contrato de contraprova**, não registro de deploy ou de emissão de eventos.

**Owners distintos, um único circuito:**

- **Site legado:** `src/main.tsx` importa `src/App.tsx`. Esse roteador efetivamente montado não registra `/admin/cockpit`; o registro em `src/app/rotas/rotas-admin.tsx` pertence à árvore `src/app/App.tsx` e, por si só, **não prova que a rota foi montada no entrypoint atual**. A interface original continua em `src/paginas/admin-cockpit/SalaControle.tsx`.
- **Cockpit operacional:** `apps/instinto-superior/src/routes/_authenticated/sala-controle.tsx` é a Sala de Controle existente, com verificação de sessão e papel administrativo; `CockpitShell.tsx` é a casca atual. Não contornar essa verificação para restaurar alias.
- **Omni Router:** `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`, serviço `centraldark-omni-router.service` na porta 8099. É backend/API, não a página React. Não mover o frontend para 8099 para ocultar um 404.
- **Projeção/catalogação:** [Jukebox A–Z / J001–J301](../CONSCIENCIA/RECEIPTS/2026-10-21-JUKEBOX-CENTRALDARK-A-Z-001-N.md) e Cockpit são leitores/projeções; o único normalizador causal continua sendo `supabase/functions/_shared/evidence-envelope.mjs` via `agent-log`.

### Snapshot observado, somente leitura

| Superfície e alvo | Observação em 12/11/2026 | Limite da conclusão |
| --- | --- | --- |
| VMware / Cockpit `:8080` | Serviço `centraldark-instinto-superior.service` ativo; `/admin/cockpit` respondeu HTTP 404 | A URL legada não foi servida nesse teste; não prova exclusão do componente |
| VMware / Omni `:8099` | Serviço `centraldark-omni-router.service` ativo; `/health`, `/docs` e `/openapi.json` responderam HTTP 200 | Saúde/documentação da API não provam frontend ou rotas de negócio |
| VMware / Omni `:8099/admin/cockpit` | HTTP 404 | O backend não serve a página React; não é motivo para criar outra UI |
| Código do Cockpit `/sala-controle` | Rota autenticada presente na fonte `apps/instinto-superior` | Presença no código não comprova navegação autenticada, renderização ou dados live |
| API pública `api.centralldark.com` | HTTP 525 relatado em auditoria anterior | **Histórico não remensurado neste snapshot**; falha TLS de origem não prova ausência de `/api/graph`, `/api/stats` ou `/api/audit` |

**Causa no site legado, demonstrada em fonte:** a rota existe em `rotas-admin.tsx`, mas o entrypoint `src/main.tsx` usa `src/App.tsx`, que não consome essa composição. **Hipótese de recuperação:** compatibilizar `/admin/cockpit` e `/preview/cockpit` com `/sala-controle` no roteador/host existente, preservando a autenticação. Nenhum redirect, build, deploy ou teste autenticado foi executado por esta documentação.

### Como o envelope deve distinguir cada camada

`ROUTE_SOURCE_EXISTS != ROUTE_MOUNTED != HTTP_REACHABLE != AUTHORIZED != UI_RENDERED != LIVE_DATA_VERIFIED`.

1. **Transporte:** DNS/túnel/TLS e origem identificados; 525 fica na camada TLS, antes de concluir sobre handler HTTP.
2. **HTTP e rota:** registrar host lógico, path, método, status e timestamp do probe. `404` não significa `SOURCE_DELETED`; `200` de `/health` não significa `UI_PASS`.
3. **Autenticação:** testar sem sessão e com sessão autorizada, sem registrar cookie, token, URL de callback sensível ou dados pessoais. `401/403` podem comprovar proteção, não sucesso de navegação.
4. **Interface:** confirmar navegação, renderização e ausência de erro de console, sem mascarar a falha com fallback que devolve 200 para qualquer path.
5. **Dados e ação:** separar UI renderizada de integração real com Omni, MCP, Hermes e Supabase; mock não vira PASS por estar visível.
6. **Regressão:** validar rotas públicas existentes, alias legado, autorização e retorno ao Cockpit no mesmo build/commit; registrar recibo, SHA observado e `NEXT_CURSOR`.

**Exemplo ilustrativo de entrada para o produtor existente** (não é evento já entregue):

```json
{
  "event": "route_probe",
  "producer": "cockpit-readonly-probe",
  "target": "cockpit:8080/admin/cockpit",
  "writer_scope": "read-only-route-audit",
  "result": "OBSERVED",
  "context": {
    "http_status": 404,
    "route_kind": "legacy",
    "interpretation": "ROUTE_NOT_SERVED_IN_PROBE",
    "action_is_proof": false
  }
}
```

Não preencher `mission_id`, `sha`, `event_id` ou `trace_id` com valores fictícios: só incluir quando observados. A identidade causal implementada também considera `event_id`, `causation_id`, `surface_id` e `attempt_id` **quando fornecidos**, além dos campos-base da seção Dedupe; `trace_id` e latência não geram causa independente. Uma captura/receipt repetido não vira múltiplas provas.

**Gate de aceite:** redirect/alias no **owner existente** + bloqueio administrativo preservado + navegação real + dados reais quando aplicáveis + testes de regressão + readback no mesmo SHA. `DOCUMENTED != EXECUTED`; `HTTP_200 != AUTH_PASS`; `UNKNOWN != PASS`.

**NEXT_CURSOR:** `OWNER_ROUTE_CURRENT → COMPATIBILIDADE_SEM_BYPASS → BUILD → PROBE_HTTP_E_AUTH → PROVA_VISUAL → PROVA_DADOS → REGRESSAO → RECEIPT_SHA → JUKEBOX_READBACK → FIXED_POINT`.
<!-- /CENTRALDARK_ROUTE_RECOVERY_CAUSAL_20261112 -->
