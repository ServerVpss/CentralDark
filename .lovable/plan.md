# 🔴 MCP TÁ OFFLINE — DIAGNÓSTICO DE GUERRA

## Sintoma confirmado agora
Tentei bater no `mcp_custom_4aHUa--mcp_status` e a resposta foi **"Connection Failed — integration currently unavailable"**. Ou seja: o servidor MCP em `mcp.centralldark.com` não tá respondendo pro Lovable. Todas as ~130 tools do CentralDark (github, vps, supabase, memória, Hermes, etc.) tão fora do ar por tabela.

Como o próprio MCP caiu, **eu não consigo mais tocar a VPS a partir daqui** (nenhuma tool `vps_*`, `execute_command`, `github_*` funciona enquanto ele tá down). Preciso te pedir 1 comando ou ligar o Hermes-Guilda via outra via.

## Mapa do que vou disparar (enxame paralelo, 3 frentes)

### Frente 1 — PM2 vivo ou morto?
```
pm2 describe mcp-server          # ou o nome real do processo
pm2 logs mcp-server --lines 100 --nostream
ss -ltnp | grep -E ':(3333|8787|443)'   # porta que o MCP escuta
```
Objetivo: saber se o processo caiu, ficou em loop de restart, ou tá up mas travado.

### Frente 2 — Caddy / entrada pública
```
systemctl status caddy
curl -sSI https://mcp.centralldark.com/health
curl -sS  https://mcp.centralldark.com/tools.json | head -50
journalctl -u caddy --since "30 min ago" | tail -50
```
Objetivo: separar "MCP caiu" de "Caddy não tá roteando" de "cert/DNS quebrou".

### Frente 3 — Darkai + Hermes cruzam olhar
- `darkai gemini "resume esses 100 linhas de log do mcp-server: <cola>"` → Gemini digere rápido e aponta o culpado (OOM, erro de módulo, porta ocupada, token expirado).
- Aciono o `Hermes-Verificador` (PM2 id 77) pra registrar o incidente no `docs/CONSCIENCIA/HERMES/` e mandar Card Hermes v1.3 no admin do Telegram assim que o MCP voltar.

## Ação de reparo (depois do diagnóstico)
Escolho automaticamente conforme o achado:
- **Processo morto** → `pm2 restart mcp-server && pm2 save`
- **Loop de restart** → `pm2 logs` pra ver stacktrace, corrijo a causa (env faltando, arquivo movido, etc.)
- **Caddy quebrado** → `caddy reload` ou fix do `Caddyfile`
- **Porta ocupada** → mato o zumbi e reinicio
- **Nada disso** → escalo pra você com o log completo + hipótese do Gemini

## O que eu preciso de você agora
Como o MCP tá offline, tenho 2 caminhos:

**A) Você roda 1 comando na VPS e me cola a saída** (30 segundos):
```bash
pm2 list | grep -i mcp && curl -sSI https://mcp.centralldark.com/health && systemctl is-active caddy
```
Com isso eu já sei em qual das 3 frentes atacar e monto o fix.

**B) Você me dá o "PERMITO PIVETE" pra eu (quando o MCP voltar por qualquer meio) fazer restart automático + registrar tudo no Cérebro Vivo + Card Hermes no Telegram**, e enquanto isso eu só fico monitorando.

Qual dos dois? (ou os dois — recomendo A + B juntos, é o mais rápido)