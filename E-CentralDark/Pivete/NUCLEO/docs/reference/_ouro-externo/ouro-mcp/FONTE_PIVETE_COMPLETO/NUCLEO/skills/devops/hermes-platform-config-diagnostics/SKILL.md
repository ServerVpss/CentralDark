---
name: hermes-platform-config-diagnostics
description: Diagnosticar plataforma cruzando .env, config.yaml e API.
category: devops
---

# Hermes Platform Config Diagnostics

## Quando usar
- Plataforma (Telegram, Discord, WhatsApp) reporta "disabled" mas token esta no .env
- Antes de restart de gateway ou reconfigurar credenciais
- Evitar falso verde: token no .env != plataforma habilitada no gateway

## Metodo canonico (3 fontes, ordem de velocidade)

### 1. Variaveis de ambiente (.env) -- R0, imediato
```bash
# Global
cat "C:/Users/danda/AppData/Local/hermes/.env" | grep -i <PLATFORM>

# Profile especifico
cat "C:/Users/danda/AppData/Local/hermes/profiles/<profile>/.env" | grep -i <PLATFORM>
```

### 2. Configuracao YAML (config.yaml) -- R0, imediato
```bash
# Global
cat "C:/Users/danda/AppData/Local/hermes/config.yaml" | grep -A10 -B2 "<platform>:"

# Profile
cat "C:/Users/danda/AppData/Local/hermes/profiles/<profile>/config.yaml" | grep -A10 -B2 "<platform>:"
```
**Chaves criticas:**
- Raiz: `<platform>.enabled: true|false`
- Em `platforms:`: `platforms.<platform>.enabled: true|false`
- **Conflito silencioso:** raiz `false` + `platforms.<platform>.enabled: true`

### 3. Estado real da API -- R0, requer token
```bash
TOKEN=$(grep -o 'window.__HERMES_SESSION_TOKEN__="[^"]*"' http://127.0.0.1:9119/sessions?profile=<profile> | cut -d'"' -f2)
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:9119/api/messaging/platforms
```
**Campos decisivos:** `enabled`, `state` (connected|disabled|error), `gateway_running`, `error_code`, `home_channel`.

## Padrao de diagnostico (3 passos)

| Fonte | Token? | enabled (raiz) | enabled (platforms) | API state | Veredito |
|---|---|---|---|---|---|
| .env | Sim | -- | -- | -- | Credencial existe |
| config.yaml global | -- | ausente | ausente | -- | **Secao faltando** |
| config.yaml profile | -- | ausente | ausente | -- | **Secao faltando** |
| API | -- | -- | -- | disabled | **Plataforma desligada** |

## Causas raiz comuns
1. **Secao ausente no config.yaml** (atualizacao perdeu bloco) -> fix: adicionar + restart gateway
2. **Conflito raiz vs platforms** (`false` vs `true`) -> fix: alinhar ambos `true`
3. **Token invalido/expirado** -> API `error_code` revela; fix: regenerar token
4. **Gateway nao reiniciou** -> config so recarrega no boot; fix: `hermes gateway stop && hermes gateway run --replace`

## Fix padrao Telegram
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

## Validacao pos-fix
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/messaging/telegram/onboarding/start \
  -X POST -H "Content-Type: application/json" -d '{"profile":"<profile>"}'

curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:9119/api/messaging/platforms
# -> "state": "connected", "gateway_running": true
```

## Pitfalls
- Nao confiar so no .env
- Nao confiar so no painel visual
- Nao reiniciar gateway sem necessidade (derruba CLI 15-30s)
- --hermes-home nao existe em gateway run --replace
- PM2 nao gerencia gateway Hermes (respawn e interno)