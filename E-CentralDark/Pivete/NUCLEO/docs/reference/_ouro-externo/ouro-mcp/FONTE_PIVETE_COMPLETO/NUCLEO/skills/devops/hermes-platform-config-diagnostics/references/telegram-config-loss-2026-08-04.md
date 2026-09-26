# Caso Real: Seção Telegram Sumiu do config.yaml Após Atualização v33

**Data:** 04/08/2026
**Profile:** pivete
**Versão Hermes:** 0.19.1 (config_version: 33)

## Sintoma
- Telegram configurado no `.env` global (`TELEGRAM_BOT_TOKEN`, `ALLOWED_USERS`, `HOME_CHANNEL`)
- API `/api/messaging/platforms` reporta: `"enabled": false`, `"state": "disabled"`, `"gateway_running": false`
- Dashboard mostra Telegram como "disabled"

## Investigação (3 fontes)

### 1. .env global — OK
```
TELEGRAM_BOT_TOKEN=8884831955:***
TELEGRAM_ALLOWED_USERS=1901426549
TELEGRAM_ALLOW_ALL_USERS=true
TELEGRAM_HOME_CHANNEL=1901426549
```

### 2. config.yaml global — SEM SEÇÃO TELEGRAM
```yaml
# Apenas platforms.api_server e platforms.telegram.enabled: false (linha 242)
platforms:
  api_server:
    enabled: true
  telegram:
    enabled: false  # <- só isso, sem bloco raiz telegram:
```

### 3. config.yaml profile pivete (atual) — VAZIO
```yaml
onboarding:
  seen:
    busy_input_prompt: true
# FIM DO ARQUIVO (3 linhas)
```

### 4. Backup profile pivete (02/08, antes da atualização) — TINHA SEÇÃO COMPLETA
```yaml
telegram:
  extra:
    language: pt-BR
    card_style: true
    card_width: 52
    card_title: HERMES
  enabled: true

platforms:
  telegram:
    enabled: true
    # toolsets completos...
```

## Causa Raiz
Atualização/migração para `config_version: 33` **perdeu a seção `telegram:` raiz e o bloco `platforms.telegram` completo** do config.yaml do profile pivete. O `.env` manteve o token, mas o gateway não lê `.env` para saber se a plataforma está habilitada — ele lê o `config.yaml`.

## Fix Aplicado
Adicionar ao `C:/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml`:
```yaml
telegram:
  extra:
    language: pt-BR
    card_style: true
    card_width: 52
    card_title: HERMES
  enabled: true

platforms:
  telegram:
    enabled: true
```

## Validação Pós-Fix (pendente - aguarda restart manual do gateway)
```bash
# 1. Onboarding
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/messaging/telegram/onboarding/start \
  -X POST -H "Content-Type: application/json" -d '{"profile":"pivete"}'

# 2. API mostra connected
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:9119/api/messaging/platforms
# Esperado: "state": "connected", "gateway_running": true
```

## Lição
**Nunca confiar só no `.env`**. Sempre cruzar as 3 fontes:
1. `.env` (credencial existe?)
2. `config.yaml` (plataforma habilitada nas DUAS chaves?)
3. `/api/messaging/platforms` (estado real do runtime?)

Falso verde = token no .env + painel visual "configurado" + API disabled.