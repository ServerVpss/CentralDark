# Codex CLI rodando pela bridge oficial (CentralDark)

> Data: 08/07/2026 — Autorizado pelo Pivete
> Objetivo: usar o Codex CLI da OpenAI reaproveitando o Lovable AI Gateway
> (GPT-5, Gemini) sem chave própria da OpenAI/Anthropic.

## Resumo

- **Endpoint**: `https://bridge.centralldark.com/v1` (Caddy → PM2 `CentralDark-LovableBridge` na porta local `127.0.0.1:8099`).
- **Chave**: `cd-webui-...` (aceita qualquer Bearer; a `LOVABLE_API_KEY` real é lida do vault `/root/CentralDark/secrets/*` DENTRO da bridge e nunca sai de lá).
- **Rotas expostas**: `/v1/chat/completions`, `/v1/responses` (novo, pro Codex 0.14+), `/v1/audio/speech`, `/v1/models`, `/health`.

## Arquitetura

```
Codex CLI  ── Bearer cd-webui-... ──▶  bridge.centralldark.com  ── Lovable-API-Key ──▶  ai.gateway.lovable.dev
   (VPS)                                (PM2 lovable-openai-bridge)                       (GPT-5 / Gemini)
```

O Codex 0.14+ removeu suporte a `wire_api = "chat"` — só fala **Responses API** (`/v1/responses`). A bridge adicionou:
- Rota `POST /v1/responses` que converte `input` (Responses) → `messages` (chat/completions).
- Conversão de `tools[]` do formato Responses (achatado) pro formato chat (aninhado em `.function`).
- Emissão de SSE em eventos Responses API (`response.created`, `response.output_text.delta`, `response.completed`, etc) mesmo chamando upstream em `stream:false`.

Código: `apps/modulos/lovable-openai-bridge/server.mjs`.

## Setup na VPS (uma vez)

### 1) `/etc/centraldark/codex.env` (chmod 600, root:root)

```bash
export OPENAI_BASE_URL="https://bridge.centralldark.com/v1"
export OPENAI_API_KEY="cd-webui-..."   # qualquer Bearer aceito pela bridge
export OPENAI_MODEL="gpt-5"
```

### 2) `/root/.codex/config.toml` (chmod 600)

```toml
model = "gpt-5"
model_provider = "centraldark"

[model_providers.centraldark]
name = "CentralDark Bridge"
base_url = "https://bridge.centralldark.com/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```

### 3) Teste

```bash
source /etc/centraldark/codex.env
echo "responda apenas: vivo" | codex exec
# esperado: "vivo"  |  tokens used ~10k
```

## 3 telas (multi-agente)

Aliases já cadastrados na bridge: `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5.5`
(além dos IDs longos `openai/*` e `google/*`).

```bash
tmux new -d -s tela1 "source /etc/centraldark/codex.env && codex -c model='gpt-5'"
tmux new -d -s tela2 "source /etc/centraldark/codex.env && codex -c model='google/gemini-2.5-pro'"
tmux new -d -s tela3 "source /etc/centraldark/codex.env && codex -c model='gpt-5.5'"
```

Cada tela é uma sessão Codex interativa isolada. Reata com `tmux a -t telaN`.

## Modelos disponíveis pela bridge

- `openai/gpt-5`, `openai/gpt-5-mini`, `openai/gpt-5-nano`, `openai/gpt-5.5`
- `google/gemini-2.5-pro`, `google/gemini-2.5-flash`
- `google/gemini-3-flash-preview`, `google/gemini-3.1-pro-preview`
- Aliases curtos: `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5.5`

Consulta em vivo: `curl https://bridge.centralldark.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`.

## Rotação da `LOVABLE_API_KEY`

Rotacionada em 08/07/2026. A bridge relê o vault a cada boot — após rotacionar,
basta `pm2 restart CentralDark-LovableBridge`.

## Não fazer

- ❌ Colocar `LOVABLE_API_KEY` crua em `codex.env` ou variável de ambiente do Codex.
- ❌ Apontar Codex direto pra `ai.gateway.lovable.dev` — usa header `Lovable-API-Key`, não `Bearer`.
- ❌ Voltar `wire_api = "chat"` — Codex 0.14+ rejeita no boot.
- ❌ Editar `server.mjs` sem backup (a tool `vps_write_file_safe` gera backup, mas conferir sempre).
