
# Registro no Notion + diagnóstico read-only

**Passo 1 — Notion** (trigger: `Registrar decisão no Cérebro Vivo`)
- `notion-fetch` no DB 🔥 Pendências Ativas pra ler o schema.
- ✅ Decisões Tomadas → página "Contrato operacional do Cérebro Vivo — 7 regras".
- 📜 Regras do Projeto → página "Cérebro Vivo Central — protocolo obrigatório multi-IA".
- 🔥 Pendências Ativas → 4 cards: P1 MCP CentralDark, P2 Mega Painel realtime, P3 Telegram start/end, P4 Obsidian futuro.
- 🤖 Agent Logs → 1 linha de registro.

**Passo 2 — Diagnóstico read-only**
- `curl` em `mcp.centralldark.com/status.json` e `/health`.
- `supabase--read_query` em `notifications_log` últimas 24h.
- Análise honesta: hoje não existe hook automático de start/end no Telegram.
- `query-data-sources` listando todas as pendências abertas.

**Passo 3 — Confirmação única**
O que foi feito, 7 links/IDs, trigger usado, status MCP, estado do Mega Painel, verdade sobre Telegram, lista de pendências.

**Travas:** não toco em edge function, health-check, notify-telegram, WhatsApp, PM2, Docker, Caddy, VPS ou workflows. Paro depois do Passo 3 e espero *"Pode seguir pra prioridade 1"*.
