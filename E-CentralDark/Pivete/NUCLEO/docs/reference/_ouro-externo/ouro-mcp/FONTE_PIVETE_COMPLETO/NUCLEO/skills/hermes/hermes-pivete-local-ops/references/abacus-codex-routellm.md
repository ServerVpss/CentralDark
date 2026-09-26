# Codex CLI + Abacus RouteLLM (Cx)

## Objetivo
Deixar o **Codex CLI** (`~/.codex`) apontando para Abacus RouteLLM com `grok-4.5`, sem expor segredo e sem falso verde.

## Paths
- Config: `C:\Users\danda\.codex\config.toml`
- Agent review: `C:\Users\danda\.codex\agents\reviewer.toml`
- Key no Hermes profile: `ABACUS_ROUTELLM_KEY` em  
  `C:\Users\danda\AppData\Local\hermes\profiles\pivete\.env`
- Doc Abacus: env `ABACUS_API_KEY`
- Loader opcional: `C:\Users\danda\.abacus_env` (export local; não commitar)

## Passos
1. Backup: `cp ~/.codex/config.toml ~/.codex/config.toml.bak-pre-abacus-<ts>`
2. Gravar model + provider + bloco `[model_providers.abacus]` (wire_api=`responses`)
3. `reviewer.toml` com `model = "grok-4.5"` se o Pivete pediu subagents/review
4. Exportar `ABACUS_API_KEY` (mesmo valor da key Abacus; não printar)
5. Provar com `codex` em shell que **já** tem a env, ou HTTP:

```text
POST https://routellm.abacus.ai/v1/responses
Authorization: Bearer <key>
{"model":"grok-4.5","input":"PONG"}
```

## Não é prova
- Só ter escrito o toml
- Sessão Telegram/Hermes já em grok-4.5
- `setx` sem reabrir o terminal
- `/v1/models` 403 enquanto se declara “configurado 100%”

## Erros vistos (sessão 02/08)
- HTTP **403** corpo `error code: 1010` em models/responses/completions → tratar como bloqueio rede/WAF/key, investigar key fresca ou rede; não reescrever toml em loop
- OpenAI Python SDK no venv hermes-agent: falha import `pydantic_core` → usar urllib/curl ou CLI Codex

## Snippet Python (doc Abacus) — só após SDK ok + key ok
```python
from openai import OpenAI
client = OpenAI(
  base_url="https://routellm.abacus.ai/v1",
  api_key=os.environ["ABACUS_API_KEY"],
)
response = client.responses.create(
  model="grok-4.5",
  input="What is the meaning of life?",
)
print(response.output_text)
```

## Claude Code via Abacus (mesmo provedor, outro cliente)
Env (não misturar com auth nativa Anthropic da CLI se o Pivete quiser rota stock):
```text
ANTHROPIC_BASE_URL=https://routellm.abacus.ai
ANTHROPIC_AUTH_TOKEN=<key>
ANTHROPIC_MODEL=claude-opus-4-6
```
Base **sem** `/v1` (SDK anexa `/v1/messages`).

## Segurança
Nunca ecoar key completa em Telegram, skills, logs de skill_manage ou dumps de sessão.
