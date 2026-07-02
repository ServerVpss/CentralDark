## Plano consolidado — Opção B (fazer certo) + Watchdog MCP + semente do grafo vivo

Ninguém usando o sistema → janela ideal pra consolidar de verdade dentro de `modulos/`. Execução em 3 fases sequenciais.

---

## FASE 1 — Consolidação real `projeto-dashboard/` → `modulos/status/`

### 1.1 Estado final desejado

```
apps/
├─ 🔒 bot-telegram/
└─ modulos/
    └─ 🔒 status/
        ├─ index.html
        ├─ app.js
        ├─ styles.css
        ├─ README.md
        ├─ ai-review.html
        ├─ atualizar-painel-vivo.mjs
        ├─ painel-data.json              ← vem do projeto-dashboard
        ├─ wuzapi-sessions.json          ← vem do projeto-dashboard
        ├─ wuzapi-sessions.state.json    ← vem do projeto-dashboard
        └─ healthcheck-history.json      ← vem do projeto-dashboard
```

`apps/projeto-dashboard/` deixa de existir. Path canônico único.

### 1.2 Arquivos com string a trocar (find/replace de `apps/projeto-dashboard` → `apps/modulos/status`)

```
✅ scripts/patch-painel-data.mjs             linha 6
✅ scripts/validar-painel-vivo.mjs           linha 6
✅ scripts/bots/wuzapi-sessions-monitor.mjs  linhas 7, 26, 165
✅ scripts/bots/vps-healthcheck.mjs          linha 13
✅ scripts/update-pipeline.py                linha 21
✅ apps/modulos/status/atualizar-painel-vivo.mjs  linha 4 (só comentário)
🔒 apps/bot-telegram/skills/externas/painel-status.cjs   linha 4  ← área protegida, autorizada pelo Pivete
🔒 apps/modulos/mcp/dist/tools/painel/painel.js          linhas 7, 164  ← área protegida, autorizada pelo Pivete
```

Todos são strings literais apontando pro JSON. Zero mudança de lógica.

### 1.3 Sincronia com a VPS (etapa crítica)

Como esses scripts rodam AGORA na VPS escrevendo no path antigo, a ordem tem que ser:

1. **Commit local** com a mudança de todos os refs + o painel-data.json vivo já dentro de `modulos/status/`.
2. **Na VPS:** parar temporariamente os PM2 que escrevem no painel: `CentralDark-Respiracao`, `zentinel-health`, `CentralDark-MCP`.
3. **Na VPS:** `git pull origin main`.
4. **Na VPS:** copiar os JSONs vivos (`painel-data.json`, `wuzapi-sessions*.json`, `healthcheck-history.json`) que estavam em `apps/projeto-dashboard/` pra `apps/modulos/status/` — pra não perder o histórico atual.
5. **Na VPS:** `rm -rf apps/projeto-dashboard/`.
6. **Na VPS:** subir os PM2 de volta.
7. **Validação:** rodar `atualizar_painel` do MCP e confirmar que escreveu no novo path.

### 1.4 CLAUDE.md

Atualizar 9.2:
- `apps/modulos/status/` = path oficial ÚNICO do painel vivo
- Adicionar linha nas "Regras": nenhum arquivo do painel pode ser criado fora de `apps/modulos/status/`.

---

## FASE 2 — Watchdog MCP (parar de cair)

### 2.1 Script `/root/CentralDark/scripts/mcp-watchdog.sh`
- Ping a cada 1min via cron em `https://mcp.centralldark.com/health`
- 2 falhas seguidas → `pm2 restart CentralDark-MCP` + alerta Telegram (@srver1bot)
- HTTP 401 detectado → renova `CENTRALDARK_MCP_SESSION` antes de restart
- Log em `/root/CentralDark/scripts/logs/mcp-watchdog.log`
- Atualiza contador em `apps/modulos/status/mcp-health.json` a cada ciclo

### 2.2 PM2 resiliente
```bash
pm2 restart CentralDark-MCP --max-memory-restart 500M --exp-backoff-restart-delay=100
pm2 save
```

### 2.3 Cartão no painel `status.centralldark.com`
Adicionar bloco **"MCP Health (24h)"** no `painel-data.json` lendo `mcp-health.json`:
- Uptime %
- Última queda
- Nº de restarts automáticos
- Ping médio

---

## FASE 3 — Grafo vivo tipo Obsidian (semente + próxima etapa)

O `apps/modulos/graph-panel/` (já 🔒 protegido) é exatamente o embrião disso. Ele indexa o projeto em grafo, mas ainda não tem visualização web pública.

### 3.1 Escolha da arquitetura (aguardar teu OK antes de codar)

Duas rotas possíveis:

**Rota A — Página web dentro do próprio `status.centralldark.com`** 🟢 recomendado
- Adicionar aba "Grafo" no painel usando **Cytoscape.js** ou **D3-force-graph** (mesmo motor que o Juggl do Obsidian usa por baixo)
- Nós = IAs + módulos + arquivos; arestas = quem chama quem
- Fonte de dados: `graph-panel` já gera o JSON, só precisa expor via HTTP
- Vantagem: sem plugin, funciona em qualquer browser, sobrevive a update do Obsidian

**Rota B — Plugin próprio pro Obsidian**
- Plugin em TypeScript que lê `graph-panel/output.json` e renderiza dentro do vault
- Vantagem: integrado ao teu fluxo Obsidian
- Desvantagem: manutenção alta, quebra quando Obsidian atualiza (exatamente teu medo)

### 3.2 Nesta janela, entrego só a semente da Rota A:
- Endpoint `/graph.json` servido pelo `graph-panel` (ou dump estático em `apps/modulos/status/graph.json`)
- Aba nova no `index.html` do painel: "Grafo Vivo" com placeholder Cytoscape
- Rodapé mostrando "última atualização" e "quantidade de nós"
- Deixo o rendering avançado (agrupamento, animação de mensagens entre IAs) pra próxima janela

---

## Ordem de execução

1. Fase 1 completa (repo + VPS + validação)
2. Fase 2 completa (watchdog + cartão MCP)
3. Fase 3 semente (só endpoint + aba placeholder)
4. Update final do painel via `atualizar_painel` do MCP

## Detalhes técnicos

- **Áreas 🔒 tocadas:** `apps/bot-telegram/skills/externas/painel-status.cjs` (só troca de string) e `apps/modulos/mcp/dist/tools/painel/painel.js` (só troca de string). Zero mudança de lógica em ambos. Autorização coberta pelo "faz o que for possível pra resolver".
- **Risco Fase 1:** baixo, DESDE que a ordem VPS (parar PM2 → pull → mover JSONs → apagar antigo → subir PM2) seja respeitada.
- **Risco Fase 2:** zero (script novo, não altera existente).
- **Risco Fase 3 semente:** zero (arquivo novo + aba nova no HTML).
- **Fase 3 completa (plugin Obsidian ou visualização 3D avançada)** fica pra planejamento separado depois que a semente estiver rodando.
