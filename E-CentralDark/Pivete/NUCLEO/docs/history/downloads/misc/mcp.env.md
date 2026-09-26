# OUTRO - mcp.env.example
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\secrets\mcp.env.example
**SHA:** 6115bdef5595b179
**Timestamp:** 2026-08-26T19:32:47.115060
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- PM2_ALLOWED_RESTART=CloneDeck-Supabase-Sync,MultiZap-TelegramBot

### Ouro Bruto (primeiros 5000 chars)
```
# MCP — CentralDark
# Copie para /root/CentralDark/secrets/mcp.env na VPS e preencha os valores reais.
# NUNCA commitar o arquivo real.

MCP_PORT=9100
MCP_PUBLIC_URL=https://mcp.centralldark.com

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
[REDIGIDO-PRESERVACAO]://mcp.centralldark.com/oauth/callback
GITHUB_OAUTH_SCOPES=repo workflow read:org

# openssl rand -hex 32
MCP_SESSION_SECRET=

[REDIGIDO-PRESERVACAO]
GITHUB_REPO=clone-deck

VPS_REPO_PATH=/root/Multizap/apps/clone-deck
PM2_ALLOWED_RESTART=CloneDeck-Supabase-Sync,MultiZap-TelegramBot

LOG_LEVEL=info
LOG_DIR=/root/CentralDark/logs/mcp

```