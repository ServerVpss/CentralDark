# 🎯 Plano de Orquestração — Rodada Maestro

Você manda, eu orquestro tudo daqui (Lovable → GitHub → VPS → Cérebro Vivo). A #14 (Claude do seu PC) fica congelada por último, como você pediu.

---

## 📋 Fila desta rodada

| Ordem | Pendência | O que faço |
|---|---|---|
| 1 | 🎨 **Padrão Visual pras IAs** | Publicar o formato "Status 4-Point + placar visual" que você curtiu no cérebro vivo, pra Claude/GPT/Gemini responderem no mesmo padrão |
| 2 | 🔍 **Auditoria `/root/CentralDark/hub` + `/mcp`** | Ler o estado real na VPS, mapear o que falta no hub, checar processos PM2, portas, logs |
| 3 | 🤖 **Robôs Telegram conversando** | Verificar bots ativos e disparar uma conversa curta entre eles sobre a CentralDark (você acompanha no chat) |
| 4 | ✅ **#13 — Faxina numeração CONSCIENCIA** | Renumerar docs desalinhados, atualizar índice |
| 5 | ✅ **#15 — Notif Telegram uso do MCP** | Hook no MCP → bot manda ping quando qualquer IA usar uma tool |
| 6 | ✅ **#16 — Sync-loop Drive (temp)** | Deixar rodando o loop temporário até o Hub assumir |
| 7 | ✅ **#17 — Radar Visual IA no Obsidian Graph** | Nó visual mostrando qual IA tá ativa no grafo |
| 8 | 🏗️ **Terminar o Hub (`apps/hub`)** | Fechar o que faltava: Fase 1 (Approval Service + Telegram), UI de conectores/políticas, deploy |
| 9 | 📊 **Relatório final consolidado** | Placar visual único, mostrando os 4 pontos alinhados |

---

## 🧠 Detalhe técnico (pra quem for auditar depois)

**1. Padrão Visual das IAs**
- Criar `docs/CONSCIENCIA/22-PADRAO-STATUS-VISUAL.md` com o template do card `┌─ SINCRONIA 4-POINT ─┐` + 🟢🟡🔴 + placar `▓░`
- Atualizar `.claude/prompts/reload-centraldark-v3.md` referenciando o novo padrão
- Commit no repo → sync automático VPS → todas as IAs conectadas passam a ver

**2. Auditoria Hub + MCP na VPS**
- `ls -la /root/CentralDark/hub /root/CentralDark/apps/mcp`
- `pm2 list | grep -E "hub|mcp"` + `pm2 logs --lines 30`
- `curl localhost:9100/health` (MCP) e porta do Hub
- Cruzar com `apps/hub/db/migrations/*.sql` pra ver o que já foi aplicado no Supabase

**3. Robôs Telegram**
- Listar bots ativos (`hub-adm.cjs`, `panel.cjs`, `srver1bot`)
- Confirmar webhooks e PM2 status
- Disparar mensagem seed pra iniciar diálogo curto entre 2 bots sobre "estado da CentralDark"

**4-7. Pendências #13/#15/#16/#17**
- Cada uma vira sub-tarefa via `spawn_agent` (Swarm Mode) — auditor + executor + validador em paralelo
- Handoff em `/tmp/swarm-<id>/`, limpeza obrigatória no final

**8. Terminar o Hub**
- Verificar quais migrations rodaram (`001_hub_foundation`, `002_hub_pdp_pep`, `003_hub_approval_service`)
- Completar UI React (`apps/modulos/hub/`) — grid de conectores lendo `hub.connectors`, tela de políticas, fila de aprovações
- Deploy edge function do Approval + notificação Telegram
- Popular seeds finais

**9. Relatório**
- Card no formato novo, mostrando VPS / GitHub / Cérebro / Hub todos 🟢

---

## ⚠️ Regras que sigo automático
- Sincronia 4-Point a cada etapa
- `pm2 save` depois de qualquer mudança de estado
- Sem tocar em áreas protegidas (bot-telegram, caddy, mcp/dist) sem te avisar
- Terra Arrasada: limpo lixo temporário no final
- Relatório sempre no padrão visual novo

**Confirma que posso executar nessa ordem?** Se quiser reordenar ou pular algum item, me fala agora.
