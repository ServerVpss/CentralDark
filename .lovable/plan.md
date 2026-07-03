## O que tá acontecendo

O código da aba **Catálogo** já foi mergeado na `main` do repo (PR #62, commit `1ccbfc851`), mas o site `hub.centralldark.com` no VPS ainda serve o build antigo. Ou seja: repo atualizado ✅, site servido ❌.

## O que vou fazer (sem tocar em nada fora do necessário)

### 1. Descobrir o que serve o hub hoje
- Rodar `pm2 list` + `grep -i hub` pra achar o processo do hub (ou se é servido via Caddy estático).
- Ler `infra/caddy/` pra confirmar de qual pasta `hub.centralldark.com` é servido.

### 2. Sincronizar a pasta com a `main`
- `cd` na pasta do hub no VPS.
- `git fetch && git reset --hard origin/main` (ou `git pull`).

### 3. Rebuild
- Detectar `bun` ou `npm`.
- `bun install && bun run build` (ou `npm ci && npm run build`).
- Isso gera o `dist/` novo com a aba Catálogo.

### 4. Reload do serviço
- Se for PM2 (SSR/Node): `pm2 restart <id-do-hub>` + `pm2 save`.
- Se for estático via Caddy: só o rebuild já basta (Caddy serve `dist/` direto). Se precisar, `systemctl reload caddy`.

### 5. Validação
- `curl -sI https://hub.centralldark.com` conferindo HTTP 200.
- `curl -s https://hub.centralldark.com | grep -i "catálogo\|catalog"` pra confirmar que o novo bundle tá servindo.
- Ping no Telegram admin quando estiver 100%.

## Áreas protegidas — respeito total
Não vou tocar em `apps/modulos/status/`, `apps/modulos/Bolt/`, `apps/modulos/WebUI/`, bot Telegram, Caddy config, nem secrets. Só `apps/modulos/hub/` (que é a área nova do MCP Catalog, desbloqueada).

## Se der ruim
Se o build falhar por dep faltando ou erro de TS, eu isolo o erro, mostro pra ti e proponho o fix antes de continuar — não vou ficar tentando fix cego.

## Resultado esperado
Em ~2 min você abre `hub.centralldark.com`, dá F5 e vê a aba **Catálogo** com o botão de sync + lista de 102 tools do MCP puxadas do HUB Supabase.
