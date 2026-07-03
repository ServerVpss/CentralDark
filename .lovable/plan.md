
# 🔫 BLOCO 2 — ARSENAL NO CHAT DO WEBUI

Modo enxame · formato de guerra · verificação end-to-end antes de fechar.

## Placar atual

```
▓▓▓▓▓▓▓▓▓▓  FASE 0  Hermes revive
▓▓▓▓▓▓▓▓▓▓  BLOCO 1 Rota Lovable
░░░░░░░░░░  BLOCO 2 ← agora
░░░░░░░░░░  BLOCO 3 Chips 3D + Esmeralda
░░░░░░░░░░  BLOCO 4 Rotação de 5 chaves
░░░░░░░░░░  BLOCO 5 Card consolidado
```

## Mapa que já existe (não vou refazer)

```
┌──────────────────────────────────────────────────────────────┐
│  ArsenalProxy   PM2 68  :8083   FastAPI  (endpoints REST)    │
│    /arsenal/neural     POST  → escolhe modelo                │
│    /arsenal/swarm      POST  → N modelos em paralelo         │
│    /arsenal/chain      POST  → cadeia de 4                   │
│    /arsenal/intel      GET   → snapshot segurança            │
│    /arsenal/stats      GET   → ranking de modelos            │
│                                                              │
│  ArsenalAdapter PM2 55  :8090   OpenAI-compat (Council)      │
│    /v1/models          → lista 4 verbos como "modelos"       │
│    /v1/chat/completions → despacha pelo campo model:         │
│       arsenal-router · arsenal-parallel                      │
│       arsenal-debate · arsenal-hermes                        │
│    Auth: Bearer arsenal-key-local-2026                       │
│                                                              │
│  WebUI docker-compose JÁ tem :8090/v1 + key registrados      │
│  como 5º endpoint OpenAI. Provável que os 4 verbos           │
│  já apareçam no dropdown — precisa validar.                  │
└──────────────────────────────────────────────────────────────┘
```

## O que vou fazer

### Fase 2.1 — Validar os 4 verbos-modelo (enxame de 4 curls)

Um sub-agente por verbo, em paralelo:

| Verbo | Teste | Sucesso |
|---|---|---|
| `arsenal-router` | POST `/v1/chat/completions` "diz oi" | HTTP 200 + choices[0].message |
| `arsenal-parallel` | mesma coisa, model diferente | idem |
| `arsenal-debate` | idem | idem |
| `arsenal-hermes` | idem | idem |

- Se qualquer um der 401 → cheque `ARSENAL_ADAPTER_KEY` no PM2 55 vs o valor no docker-compose (`arsenal-key-local-2026`), harmonizar.
- Se 500 → `pm2 logs 55 --nostream` + Fabler diagnosticando.
- Se 200 mas Council responde vazio → verificar rota upstream (edge function `arsenal-proxy` no Supabase).

### Fase 2.2 — Sidecar CentralDark-Tools (2 tools OpenAPI GET)

Endpoints `intel` e `stats` são leitura pura (não conversa) — melhor virar botão no menu ◇ do que "modelo".

**Novo container `CentralDark-Tools`** em `/root/CentralDark/apps/modulos/WebUI/tools-server/`:

```python
# main.py — FastAPI mínimo, 2 rotas passthrough pro ArsenalProxy :8083
from fastapi import FastAPI
import httpx

app = FastAPI(title="Arsenal Tools", version="1.0.0")
BASE = "http://host.docker.internal:8083"

@app.get("/intel", summary="Dark Intel — snapshot de segurança agora",
         description="Retorna IPs bloqueados, últimas ameaças e contadores em tempo real.")
async def intel():
    async with httpx.AsyncClient(timeout=10) as c:
        return (await c.get(f"{BASE}/arsenal/intel")).json()

@app.get("/stats", summary="Arsenal Stats — ranking de performance dos modelos",
         description="Ranking dos 17 modelos por taxa de sucesso e latência média.")
async def stats():
    async with httpx.AsyncClient(timeout=10) as c:
        return (await c.get(f"{BASE}/arsenal/stats")).json()
```

```yaml
# adição no docker-compose.override.yml
cd-tools:
  build: ./tools-server
  container_name: CentralDark-Tools
  extra_hosts: [host.docker.internal:host-gateway]
  restart: unless-stopped
```

Envs do WebUI ganham:

```
TOOL_SERVER_CONNECTIONS=[
  {"url":"http://cd-tools:9000","path":"openapi.json","auth_type":"none","key":""}
]
```

Depois: `docker compose up -d --build cd-tools && docker compose restart webui`.

Resultado: no ◇ do composer aparecem 2 botões — **Dark Intel** e **Arsenal Stats**.

### Fase 2.3 — 5 slash-commands no composer (Prompts do WebUI)

Injetar 5 prompts na tabela `prompt` do `webui.db` via SQL direto no container. Cada slash-command é um atalho que preenche system-prompt + sugere o modelo certo:

| Slash | Modelo sugerido | System prompt (resumo) |
|---|---|---|
| `/router` | arsenal-router | "Roteia esta pergunta pro modelo ideal, resposta única e direta." |
| `/swarm` | arsenal-parallel | "Dispare 3 IAs em paralelo, o juiz sintetiza a melhor." |
| `/chain` | (modelo padrão) → chama `/arsenal/chain` do proxy | "Cadeia de 4 IAs refinando iterativamente." |
| `/debate` | arsenal-debate | "2 IAs, 2 rodadas de crítica, juiz dá veredito final." |
| `/hermes` | arsenal-hermes | "Lê PENDENCIAS, propõe autônomo, salva em EVOLUCAO/." |

SQL de inserção (idempotente com `INSERT OR REPLACE`).

### Fase 2.4 — Smoke test end-to-end (Playwright na VPS)

Um script que:
1. Faz login no ui.centralldark.com como admin.
2. Abre novo chat, seleciona `arsenal-router`, envia "oi" → confere HTTP 200 e conteúdo não-vazio.
3. Repete pra `arsenal-debate`.
4. Abre menu ◇ → clica **Dark Intel** → confere que JSON volta com `bloqueados`.
5. Digita `/debate` no composer → confere autocomplete aparecendo.

Screenshot em cada etapa em `/tmp/browser/bloco2/`.

### Fase 2.5 — Notificação Telegram (2 posts)

- Admin privado: card completo com placar + link ui.centralldark.com + 5 verbos validados + 2 tools registradas.
- Canal Status: linha curta "🟢 Bloco 2 OK — Arsenal completo no WebUI".

## Regras de segurança

- Nenhum arquivo tocado em `apps/modulos/status/`, `apps/modulos/Bolt/`, `apps/bot-telegram/`.
- Nenhuma migration ou insert no Supabase Lovable atual (só edit function ai-proxy já feito no Bloco 1).
- Se qualquer fase travar 3× → pausa e chama o Pivete.
- Consultar Fabler antes das Fases 2.1 e 2.3 (via `elite_gateway_chat`).

## Critério "10/10" pra fechar o bloco

Todos os 6 checks verdes:

```
[ ] arsenal-router responde no dropdown
[ ] arsenal-parallel responde
[ ] arsenal-debate responde
[ ] arsenal-hermes responde
[ ] Botão Dark Intel no ◇ retorna snapshot
[ ] Slash /debate autocompleta no composer
```

Se algum falhar, refino até chegar. Sem entregar meio-caminho.
