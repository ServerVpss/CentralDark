# RETOMADA — Issues Agent + Pendências 29/06/2026

> Arquivo de retomada urgente — contexto em 99%. Atualizado automaticamente.

---

## ✅ O que foi feito AGORA (29/06/2026 — sessão atual)

### Issues Agent — CRIADO E FUNCIONANDO
- Script: `/root/CentralDark/scripts/issues-agent/issues-agent.mjs`
- Cron: `*/30 * * * *` no crontab da VPS
- Timer interno aleatório: 45–110min entre execuções (imita humano)
- Primeira rodada: 26 issues → 10 issues (fechou 16: duplicatas, workflows verdes, serviços parados)
- Notifica Pivete no Telegram ao final de cada rodada
- Log: `/var/log/issues-agent.log`

### Issues restantes abertas (10)
- #23 — Endpoint Install 502 (real)
- #22 — supabase-bot workflow ainda vermelho
- #21 — GitHub Bot Controller ainda vermelho
- #17 — Painel 404 (real)
- #16 — VPS SSH Exec vermelho
- #13 — painel-validacao vermelho
- #4, #3, #2 — MCP sem CORS no painel
- #1 — Endpoint API 404

---

## 🔴 Pedidos do Pivete NÃO implementados ainda (registrar e continuar)

### P1 — Notificação de conclusão Claude Code → Telegram
**O que quer:** Quando o Claude Code ou qualquer IA terminar uma análise/tarefa,
notificar no Telegram do admin que concluiu. Incluindo: "estou analisando...", "concluído!"
**Como implementar:** Hook no `.claude/settings.json` (Stop hook) que dispara script de notify
**Status:** PENDENTE — não implementado, precisa de `.claude/settings.json` atualizado

### P2 — Modo Terminal via Telegram
**O que quer:** Botão no menu do bot para ativar modo terminal — Pivete manda comandos
pelo Telegram e o agente executa igual ao Claude Code faz aqui.
**Como implementar:** Skill nova no bot + webhook que recebe mensagem e repassa para
Claude API (Anthropic) com contexto do projeto. Resposta volta no Telegram.
**TRAVA:** `apps/bot-telegram/` é área protegida → requer "PERMITO PIVETE"
**Status:** AGUARDA AUTORIZAÇÃO

### P3 — Notificar sucesso também (não só erros)
**O que quer:** Quando workflow roda e dá verde, notificar no Telegram. Mostrar atividade:
"estou trabalhando em X", "concluí Y", etc.
**Como implementar:** Atualizar workflow pipeline-notify.yml para incluir eventos de sucesso
também (não só push/PR)
**Status:** PENDENTE

### P4 — Email para coisas importantes
**O que quer:** Além do Telegram, receber email para eventos críticos (sucesso de deploy,
erros graves, issues abertas)
**Como implementar:** Usar `sendmail` ou API de email (Resend já configurado no Supabase)
**Status:** PENDENTE

### P5 — Botão "Realizar Testes" no bot
**O que quer:** Botão no menu do bot para verificar status do MCP, workflows, endpoints
**TRAVA:** `apps/bot-telegram/` área protegida → requer "PERMITO PIVETE"
**Status:** AGUARDA AUTORIZAÇÃO

### P6 — Verificação 4-Point (Obsidian + GitHub + VPS + Cérebro)
**O que quer:** Confirmar que tudo está alinhado — nota que o Pivete escreve no Obsidian
aparece no GitHub, chega na VPS, está no Cérebro
**Como verificar:** git pull na VPS + checar última atualização do INDEX.md + pm2 status
**Status:** PENDENTE VERIFICAÇÃO

---

## 🔧 Estado dos serviços agora

- Bot @srver1bot: online (PM2)
- Guardião: online
- Issues-agent: no crontab, rodando a cada ~1h com variação aleatória
- Obsidian: vault sincronizado via sparse-checkout
- INDEX workflow: corrigido (permissions + git pull --rebase)
- CORS Validator: corrigido (whatsapp optional:true)

---

## Como retomar

1. Ler este arquivo
2. Verificar issues restantes: `gh issue list --repo ServerVpss/CentralDark --state open`
3. Implementar P1 (hook de notificação) — não toca em área protegida, pode fazer
4. Implementar P2-P5 precisam de "PERMITO PIVETE"
5. Commitar o issues-agent: `git add scripts/issues-agent/ && git commit -m "feat(issues): agente autônomo de triagem de issues"`

