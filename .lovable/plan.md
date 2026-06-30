# Ativar MCP CentralDark no Lovable

## Objetivo
Conectar o servidor MCP `https://mcp.centralldark.com/mcp` (OAuth via GitHub em `/oauth/start`) como conector ativo deste projeto, sem mexer em nada que já existe na VPS, no Cérebro Vivo nem nos conectores Notion/Linear já ligados.

## O que vou fazer
1. Chamar `mcp_knowledge--connect` apontando pro MCP CentralDark. Isso abre o popup OAuth que cai automaticamente em `https://mcp.centralldark.com/oauth/start` (GitHub login → callback → token salvo do lado do Lovable).
2. Você aprova o login no popup com a conta `segredounlocker` (que já tem o OAuth App registrado no MCP).
3. Lovable persiste o token e o conector passa a aparecer na lista de MCPs ativos junto com Notion e Linear — sem tocar em `apps/modulos/mcp/` (área protegida), sem reiniciar PM2, sem alterar `secrets/`.

## Áreas protegidas — confirmação
Nada em `apps/modulos/mcp/`, `infra/caddy/`, `secrets/`, `.github/workflows/`, `docs/CONSCIENCIA/` será tocado. A ativação é 100% do lado do Lovable (registro de conector + token OAuth), o servidor MCP na VPS continua exatamente como está.

## Observação técnica
O catálogo de conectores featured do Lovable não lista "CentralDark" como entrada pronta. Se o `mcp_knowledge--connect` não aceitar uma URL custom, a alternativa é você ativar manualmente em **Connectors** (barra lateral) → Add custom MCP → colar `https://mcp.centralldark.com/mcp` → autorizar via GitHub. Te aviso no momento se cair nesse caminho.

## Risco
Zero pro que já roda. Pior caso: o conector não ativa e a gente tenta o fluxo manual — nada quebra.