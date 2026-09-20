---
name: MCP CentralDark — endpoints de status
description: Como o MCP público expõe saúde/status, semântica do campo `ok`, e por que não existe página HTML /status separada.
type: architecture
---

# MCP CentralDark — Endpoints de Status

Domínio: `https://mcp.centralldark.com`

## Endpoints expostos (apenas JSON)
- `GET /health` → resposta enxuta. Ex: `{"ok":true,"service":"mcp-centraldark","version":"0.4.0","catalogVersion":"97-...","toolCount":97,"time":"..."}`
- `GET /status.json` → resposta completa: catálogo, grupos, conectores, deploy diff, sugestões, recomendações, estado de auth (clients/tokens).

## Não existe (e NÃO criar) página HTML `/status`
A visualização bonita do estado vivo é responsabilidade do **Mega Painel** em `https://status.centralldark.com`, que consome esses dois JSONs. Não duplicar UI no domínio do MCP — `mcp.centralldark.com` é só API/JSON.

## Semântica importante de `status.json.ok`
Hoje o campo `ok` vira `false` se **qualquer** item tiver `level: "warn"` (ex.: Supabase sem env, VPS_SSH_KEY ausente, grupo "Outros" sem categoria, deploy.diff sem conseguir consultar GitHub). Isso pinta o widget "Status ao vivo" como **vermelho** mesmo o serviço estando 100% no ar.

**Recomendação futura (a ser feita no repo do MCP na VPS, não aqui no Lovable):** mudar regra para `ok = false` somente quando houver `level: "error"` ou serviço fora do ar. Warnings devem ficar em campo separado (`warnings: [...]`) e pintar amarelo no widget, não vermelho.

## Onde mora o código
- `mcp.centralldark.com` → repositório separado na VPS (não é este projeto Lovable).
- `status.centralldark.com` (Mega Painel) → repositório separado na VPS.
- Este projeto Lovable é o **TelePanel** (painel admin do bot Telegram). Para mexer nos dois acima usar `vps-exec` + GitHub Actions ou SSH direto.
