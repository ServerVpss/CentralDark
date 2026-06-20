---
name: Acessos que o agente Lovable JÁ tem nesse sandbox
description: Lista dos tokens/segredos expostos no shell do sandbox Lovable. Evita responder "não tenho acesso" — quase tudo dá pra fazer daqui via MCP CentralDark ou API GitHub, sem pedir SSH ao usuário.
type: architecture
---

# Acessos que eu já tenho aqui (sandbox Lovable)

Conferido em 2026-06-20. Todos disponíveis como variáveis de ambiente no `code--exec`.

## VPS — via MCP CentralDark (NÃO via SSH)
- `MCP_TOKEN` / `CENTRALDARK_MCP_TOKEN` / `MCP_CENTRALDARK_TOKEN` (64 chars, mesmos 3 nomes)
- Endpoint: `https://mcp.centralldark.com` (health em `/health`)
- 89 ferramentas (vps_read_file, vps_write_file, vps_exec, pm2_restart, caddy_reload, etc.)
- Uso:
  ```bash
  curl -s -H "Authorization: Bearer $CENTRALDARK_MCP_TOKEN" \
    https://mcp.centralldark.com/tools/<tool>/call \
    -H "Content-Type: application/json" -d '{...}'
  ```
- **SSH direto NÃO funciona aqui** — `VPS_SSH_KEY_LOVABLE` e `VPS_HOST_LOVABLE` estão VAZIOS nesse sandbox. Esquecer `scripts/lovable-agent/setup-vps-ssh.sh`, ele não existe. Usar SEMPRE MCP.

## GitHub — via API REST
- `GH_TOKEN` / `GITHUB_TOKEN` (40 chars, PAT)
- `GITHUB_OWNER` = `segredounlock` (10 chars)
- `GITHUB_REPO` = `clone-deck` (11 chars)
- Uso pra disparar workflow, commitar, ler arquivos, etc.:
  ```bash
  curl -H "Authorization: token $GH_TOKEN" \
    https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/...
  ```
- Workflow já existente pra rodar coisa na VPS: `.github/workflows/vps-ssh-exec.yml`

## Supabase (Lovable Cloud)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- Disponíveis nas edge functions automaticamente. No sandbox dá pra usar via `psql "$SUPABASE_DB_URL"` se precisar de query crua.

## Outros que já estão lá (não pedir de novo)
- `LOVABLE_API_KEY`, `EFI_CLIENT_ID`, `EFI_CLIENT_SECRET`, `EFI_PIX_KEY`
- `ISEEK_API_KEY`, `ISEEK_API_BASE`, `CONSULTAS_API_KEY`
- `CF_API_TOKEN` / `CLOUDFLARE_API_TOKEN`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OAUTH_CALLBACK`, `GITHUB_OAUTH_SCOPES`

## Regra de ouro
NUNCA dizer "preciso de SSH" ou "rode esse comando na VPS" sem antes tentar via MCP CentralDark. 99% dos casos resolve daqui mesmo.
