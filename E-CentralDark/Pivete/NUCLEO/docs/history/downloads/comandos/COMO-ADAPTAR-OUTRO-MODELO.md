# Como adaptar outro modelo sem alterar o código

## Provedor OpenAI-compatible

Adicione uma entrada em `config/providers.json`:

```json
{
  "id": "meu-gateway",
  "type": "openai-compatible",
  "enabled": true,
  "baseUrl": "https://gateway.exemplo.com",
  "path": "/v1/chat/completions",
  "apiKeyEnv": "MEU_GATEWAY_API_KEY",
  "modelsEnv": "MEU_GATEWAY_MODELS",
  "models": ["modelo-padrao"],
  "timeoutMs": 60000
}
```

Depois:

```powershell
$env:MEU_GATEWAY_API_KEY = "<CHAVE>"
$env:MEU_GATEWAY_MODELS = "modelo-a,modelo-b"
.\run.ps1 "#adaptar" "C:\alvo" --provider meu-gateway --model modelo-a
```

## Provedor Anthropic

Use `"type": "anthropic"` e a rota `/v1/messages`.

## Novo comando

Edite somente `config/commands.json` e acrescente um perfil. Não é necessário criar outro runtime.

## OpenAI Responses API

O pacote também entende `"type": "openai-responses"` com a rota `/v1/responses`. A chave continua vindo de `OPENAI_API_KEY` e nunca de arquivo local.
