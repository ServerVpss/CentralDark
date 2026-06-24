## Plano: Bootstrap do Executor Supremo no Claude + Sincronia de Memória

### Objetivo
Preparar o prompt definitivo pra colar no chat do Claude (via conector Lovable) que carrega toda a memória/contexto desse chat aqui, e ao mesmo tempo garantir que o Notion esteja com a "carga completa" sincronizada pra todo mundo trabalhar do mesmo lugar.

---

### Etapa 1 — Auditoria de memória atual (Swarm: Auditor)
Sub-agente Auditor faz, em paralelo, leitura silenciosa de:
- `.claude/` e `cerebro/` do repo `ServerVpss/CentralDark` (GitHub)
- Página "CentralDark • Consolidação" e filhos no Notion + lista dos 7 databases do hub e quais NÃO estão compartilhados com a integração "CentralDark - Lovable"
- Memórias internas do Lovable: Autonomia Secrets, Swarm Mode, Sincronia 4-Point, Pré-deploy, política VPS (whatsapp-server PM2 id 1 fica stopped), política de migração CentralDark vs CentralDark1VPS

Saída: relatório curto de gaps (o que falta no Notion, o que falta no GitHub).

### Etapa 2 — Validação de infra (Swarm: Validador)
Em paralelo ao Auditor:
- Confirmar que as secrets `SUPABASE_DB_URL` / `SUPABASE_SERVICE_ROLE_KEY` apontam pro Core (`lyoigsqluyktoclwdaft`) e que existe mapeamento separado pro Módulo Puxadas (`otifzcjioyjmwmgtxbtj`) — se não existir, listar como pendência (sem criar nada agora, é plano)
- Checar por que os webhooks de notificação (Telegram + `status.centraldark.com`) estão em silêncio: olhar `notification_routes`, `notification_events`, `notifications_log` e logs da edge function relevante
- Confirmar PM2 da VPS: whatsapp-server id 1 = stopped (estado desejado), demais legados pausados

Saída: diagnóstico "Status de Guerra" — rodando / parado / quebrado.

### Etapa 3 — Preencher gaps no Notion (Swarm: Executor)
Com base no relatório do Auditor, o Executor:
- Cria/atualiza no Notion a página "Carga de Memória CentralDark — 24/06/2026" dentro do hub, contendo:
  - Identidade e poder (obraFullAdmin)
  - Sincronia 4-Point
  - Protocolo Swarm
  - Autonomia de Secrets
  - Política de migração CentralDark ↔ CentralDark1VPS
  - Estado atual: bancos isolados (Core + Puxadas), whatsapp-server stopped, webhooks em validação
  - Backlog de guerra (Fase 1, pendência Obsidian, pendência webhooks)
- Lista quais databases ainda precisam ser compartilhados com a integração "CentralDark - Lovable" pra você liberar manualmente

### Etapa 4 — Gerar o prompt de bootstrap pro Claude
Texto único pronto pra colar no chat do Claude com conector Lovable+Notion+GitHub ativos. O prompt manda Claude:

1. Ler `CLAUDE.md`, `.claude/`, `cerebro/` do `ServerVpss/CentralDark`
2. Ler a página "Carga de Memória CentralDark — 24/06/2026" no Notion (criada na Etapa 3) e os databases do hub
3. Internalizar as regras: Sincronia 4-Point, Swarm Mode, Autonomia de Secrets, Pré-deploy obrigatório (`audit-rls`), política de migração, VPS PM2
4. Confirmar bancos isolados (Core + Puxadas) e estado dos webhooks
5. Responder no formato: "Bootstrap completo. Contexto CentralDark carregado. Pronto pra executar como Executor Supremo."

### Etapa 5 — Relatório final consolidado
Entrego, em uma resposta só:
- ✅ Status de Guerra (Etapa 2)
- ✅ Lista do que foi sincronizado no Notion (Etapa 3) + databases pendentes de share manual
- ✅ Prompt de bootstrap pronto pra copiar/colar no Claude (Etapa 4)
- 🧹 Limpeza de qualquer arquivo temporário criado

---

### O que NÃO faço nessa rodada (precisa OK separado)
- Não mexo nas secrets dos bancos (só audito o mapeamento)
- Não religo bots legados PM2
- Não disparo webhook de teste sem você confirmar (pra não poluir Telegram/status)

Quer que eu siga assim ou ajusta alguma coisa?
