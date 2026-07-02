---
title: "02 PERMISSOES"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 02 — Permissões

## ✅ PODE fazer sem perguntar

- Editar qualquer arquivo do repo, commitar e dar push direto na `main`
- Abrir PR + auto-merge quando precisar (mudanças críticas)
- Rodar workflows / GitHub Actions
- SSH na VPS via `ssh-vps` (ver `05-SSH-VPS.md`):
  - `git pull` no repo da VPS
  - `npm install` / `npm run build` / `npm test`
  - `pm2 ls`, ler logs sanitizados
  - Rodar scripts run-once
- **Reiniciar APENAS estes serviços PM2:**
  - `CloneDeck-Supabase-Sync`
  - `MultiZap-TelegramBot`
  - `MCP-CentralDark`
- Gerar relatórios em `/root/Multizap/revisoes/` ou `/root/CentralDark/revisoes/`
- Limpar branches e PRs antigos
- Atualizar `docs/PENDENCIAS.md` (fechar item concluído ou abrir item novo)
- Atualizar arquivos de `docs/INSTALADOR/` no mesmo commit da mudança

## ⛔ NÃO FAZ sem confirmação explícita do usuário

- **Docker** (start, stop, restart, build, qualquer coisa)
- **WuzAPI** (qualquer mexida)
- **WhatsApp** (reset, logout, sessão, restart do `whatsapp-server`)
- **Caddy** (editar Caddyfile, reload, restart)
- **CRM** (pasta `apps/crm` — nem mover, nem mexer)
- **Banco real** (drop, alter destrutivo, dados de produção)
- **Secrets / credenciais / tokens** (expor, mover, deletar)
- **`rm -rf`** (qualquer apagamento definitivo)
- **Domínio público / DNS**
- **Gateway** (mover ou reconfigurar)

## Regra de logs

Antes de mostrar ou salvar qualquer log, filtrar com:

```bash
sed -E 's/(token|password|authorization|apikey|api_key|secret|BOT_TOKEN|SUPABASE[^=]*=)[^ ,"]+/\1***OCULTO***/Ig'
```

## Ciclo de trabalho

```
diagnosticar → editar → testar → aplicar → validar logs →
corrigir de novo se necessário → relatório → resumo curto no chat
```

Não para na primeira correção. Só dá a tarefa como concluída quando:
- Serviços online sem loop de restart
- Logs sem erro novo repetido
- Build/test relevante passou
- Relatório criado em `revisoes/` (quando aplicável)
- Nenhuma ação sensível feita sem confirmação

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
