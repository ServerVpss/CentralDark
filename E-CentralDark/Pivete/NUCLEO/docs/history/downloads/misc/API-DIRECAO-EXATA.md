# Direção exata da API

## Onde alterar o endereço

Arquivo único:

```text
config/providers.json
```

Entrada CentralDark entregue neste pacote:

```json
{
  "id": "centraldark",
  "type": "openai-compatible",
  "baseUrl": "https://api.centralldark.com",
  "path": "/v1/chat/completions",
  "apiKeyEnv": "CENTRALDARK_API_KEY",
  "modelsEnv": "CENTRALDARK_MODELS"
}
```

Endpoint final calculado:

```text
https://api.centralldark.com/v1/chat/completions
```

A rota acima veio do material CentralDark fornecido. O script não tenta descobrir outra rota nem lê arquivo `.env`.

## Onde colocar a chave

A chave fica **somente no ambiente do processo**.

PowerShell, sessão atual:

```powershell
$env:CENTRALDARK_API_KEY = "<SUA_CHAVE>"
$env:CENTRALDARK_MODELS = "gpt-5,claude-sonnet-4,grok-4"
```

CMD, sessão atual:

```bat
set CENTRALDARK_API_KEY=<SUA_CHAVE>
set CENTRALDARK_MODELS=gpt-5,claude-sonnet-4,grok-4
```

Não grave a chave em `providers.json`, `commands.json`, logs, recibos ou argumentos.

## API local deste adaptador

Inicie:

```powershell
$env:UNIVERSAL_API_TOKEN = "<TOKEN_LOCAL>"
node .\bin\server.mjs
```

Direções:

```text
GET  http://127.0.0.1:8787/health
POST http://127.0.0.1:8787/v1/universal/execute
```

Exemplo:

```powershell
$headers = @{
  Authorization = "Bearer $env:UNIVERSAL_API_TOKEN"
  "Content-Type" = "application/json"
}

$body = @{
  command = "!auditar"
  target = "C:\caminho\alvo"
  provider = "centraldark"
  model = "gpt-5"
} | ConvertTo-Json

Invoke-RestMethod \
  -Method Post \
  -Uri "http://127.0.0.1:8787/v1/universal/execute" \
  -Headers $headers \
  -Body $body
```

## Servidor exposto fora do computador

Para `UNIVERSAL_HOST=0.0.0.0`, o script exige **ao mesmo tempo**:

```text
UNIVERSAL_API_TOKEN
UNIVERSAL_ALLOWED_ROOTS
```

Sem os dois, o servidor recusa iniciar. Isso impede que uma API exposta vire leitor arbitrário do disco.
