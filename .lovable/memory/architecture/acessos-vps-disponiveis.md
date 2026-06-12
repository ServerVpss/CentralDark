---
name: Acessos à VPS CentralDark a partir do Lovable
description: O que eu (agente) consigo e não consigo fazer na VPS root@CentralDark, e por qual canal.
type: architecture
---

# Acessos à VPS CentralDark

A VPS `/root/CentralDark/` espelha o repo `ServerVpss/CentralDark` no GitHub.

## Tenho aqui no Lovable (secrets já existentes)
- `GH_TOKEN` + `GITHUB_OWNER=ServerVpss` + `GITHUB_REPO=CentralDark` → leio/edito o repo via API GitHub. **Esse é o caminho preferido pra ver/alterar arquivos** (`/root/CentralDark/` = clone do repo).
- `MCP_CENTRALDARK_TOKEN` / `MCP_TOKEN` → chamo `https://mcp.centralldark.com/mcp` (autenticado). Se o catálogo do MCP expuser uma tool de exec/shell, dá pra rodar comando real na VPS por aqui.
- `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` → DNS/zonas dos subdomínios `*.centralldark.com`.
- `GH_TOKEN` permite também disparar workflows via `POST /actions/workflows/{id}/dispatches`.

## NÃO tenho
- Chave SSH direta pra `ssh root@vps`. A chave usada pelos workflows mora como secret **no GitHub Actions** (`VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`), **não** aqui no Lovable. Se ela estiver ausente/inválida, o workflow `vps-ssh-exec.yml` pula sem rodar.
- Acesso ao service-role do Supabase do CentralDark (a edge function `vps-exec` exige login JWT admin).

## Ordem certa para inspecionar/mexer na VPS
1. **Ler / editar arquivos**: API do GitHub no repo `ServerVpss/CentralDark`. O repo é a fonte da verdade — sync automático pra VPS.
2. **Ver estado vivo (uptime, tools, conectores)**: `curl https://mcp.centralldark.com/status.json` e `/health` (públicos, sem token).
3. **Executar comando real no shell da VPS**: tentar via tool do MCP CentralDark (autenticada com `MCP_CENTRALDARK_TOKEN`). Se não existir tool, disparar workflow `vps-ssh-exec.yml` — só funciona se o secret SSH no GitHub Actions estiver válido.
4. **Último recurso**: pedir pro usuário rodar o comando ele mesmo na VPS e colar o resultado.

## Erro a NÃO repetir
Dizer "não tenho acesso à VPS" sem antes:
- conferir `secrets--fetch_secrets`,
- tentar GitHub API no repo espelhado,
- tentar o MCP CentralDark.
