# Telegram Gateway — Seção ausente no config.yaml (04/08/2026)

## Contexto
Sessão Telegram ativa (profile pivete) mas gateway reporta `"enabled": false, "state": "disabled"` na API `/api/messaging/platforms`. Token válido no `.env` global.

## Investigação (read-only, cruzada)
| Fonte | `telegram.enabled` (raiz) | `platforms.telegram.enabled` | Token |
|---|---|---|---|
| Global config.yaml | ❌ ausente | ❌ ausente | — |
| Profile pivete config.yaml (atual) | ❌ ausente | ❌ ausente | — |
| Backup pivete 02/08 | ✅ `true` | ✅ `true` | — |
| Global .env | — | — | ✅ `TELEGRAM_BOT_TOKEN=***` |
| API `/api/messaging/platforms` | — | — | `"enabled": false, "state": "disabled"` |

## Causa raiz
Migração/atualização para `_config_version: 33` removeu a seção `telegram:` inteira do config.yaml. O gateway lê **apenas o config.yaml** para habilitação de plataforma; `.env` só fornece o token.

## Fix aplicável (R2 — precisa autorização)
Adicionar no profile pivete config.yaml:
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
+ Restart manual do gateway.

## Validação
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/messaging/telegram/onboarding/start \
  -X POST -H "Content-Type: application/json" -d '{"profile":"pivete"}'
# Sucesso → pairing_id + deep_link
```

## Lição
**Sempre verificar `config.yaml` + API `/api/messaging/platforms` antes de concluir "Telegram quebrado".** Token no `.env` é necessário mas não suficiente.