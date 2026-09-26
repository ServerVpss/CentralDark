# Quick Reference — CentralDark Bolt + VPS Mission

## Comandos Essenciais

```bash
# Subir builder na VPS
ssh Segredo-VPS "cd /root/CentralDark && docker compose -f apps/modulos/Bolt/docker-compose.yml up -d"

# Ver logs builder
ssh Segredo-VPS "docker logs CentralDark-Builder --tail 100"

# Verificar Caddy
ssh Segredo-VPS "docker ps -a --filter name=caddy"

# Testar preview local
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5174

# Verificar DNS
dig builder.centralldark.com +short
```

## Checklist de Validação Preview

- [ ] Container `CentralDark-Builder` Up
- [ ] Porta 5174 exposta e HTTP 200 local
- [ ] Caddy rodando como reverse proxy
- [ ] DNS A record → IP VPS (89.117.78.124)
- [ ] Caddy config: `builder.centralldark.com { reverse_proxy builder:5173 }`
- [ ] Preview HTTPS `https://builder.centralldark.com` carrega

## Gateways Quebrados (2026-07-27)

| Gateway | URL | Status | Ação |
|---------|-----|--------|------|
| Elite Gateway (Anthropic) | `host.docker.internal:8082` | 🔴 Não sobe | Subir gateway local ou bypass |
| Arsenal Adapter | `api.centralldark.com/v1` | 🔴 401 | Renovar key `SEGREDO_ELITE_123` |
| OpenRouter | `openrouter.ai/api/v1` | 🟢 OK | Fallback principal |

## Fallback de Modelo (Bypass Gateway)

```bash
# Configurar no cookie do Bolt:
# Provider: OpenRouter
# Model: qwen3-coder-480b
# API Key: sk-or-v1-... (válida)
# Base URL: https://openrouter.ai/api/v1
```

## Checklist Lacunas Críticas

- [ ] Tool routing Step 0-3 no gateway/HERMES-CORE
- [ ] `if_version` + auto-merge nas 3 temperaturas
- [ ] Frases proibidas em `SOUL.md`/`04-COMUNICACAO.md`

## Comandos Úteis VPS

```bash
# Subir builder
ssh Segredo-VPS "cd /root/CentralDark && docker compose -f apps/modulos/Bolt/docker-compose.yml up -d"

# Ver logs
ssh Segredo-VPS "docker logs CentralDark-Builder --tail 100"

# Ver containers
ssh Segredo-VPS "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# Ver Caddy
ssh Segredo-VPS "docker ps -a --filter name=caddy"
```