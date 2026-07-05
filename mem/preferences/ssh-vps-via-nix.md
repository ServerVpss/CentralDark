---
name: SSH na VPS via nix (fallback definitivo)
description: Como conectar na VPS quando o sandbox Lovable não tem ssh no PATH — usar OpenSSH via nix run
type: preference
---

# Regra: sandbox Lovable NÃO tem `ssh` no PATH

Sempre que precisar rodar comando na VPS e `ssh` falhar com "command not found", usar **OpenSSH via nix run** direto — sem variável intermediária (variável com espaços quebra o parse e vira "hostname ssh").

## Formato correto (sempre usar este)

```bash
SSH_KEY="$HOME/.ssh/vps_key"
HOST="89.117.78.124"
nix run nixpkgs#openssh -- -i "$SSH_KEY" \
  -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=12 \
  root@$HOST 'bash -s' <<'REMOTE'
# comandos remotos aqui
REMOTE
```

## Formato ERRADO (não usar)

```bash
SSH="nix run nixpkgs#openssh -- ssh"   # ❌ vira "hostname ssh"
$SSH -i ... root@host                  # ❌ quebra
```

O `nix run nixpkgs#openssh --` já invoca o cliente ssh direto; NÃO passar `ssh` de novo depois do `--`.

## Sempre aplicar redact nos logs

Ao puxar logs (PM2, Caddy, Nginx), passar por sed pra mascarar:
`access_token`, `refresh_token`, `client_secret`, `password`, `senha`, `code`, `state`, `authorization`, `MCP_ADMIN_PASSWORD`, `Bearer ...`.

## Quando aplicar

- Qualquer diagnóstico da VPS (`89.117.78.124`)
- Logs PM2 (`pm2 logs <id>`)
- Health de `mcp.centralldark.com`, `status.centralldark.com`, etc.
- Inspeção de Caddy/Nginx
