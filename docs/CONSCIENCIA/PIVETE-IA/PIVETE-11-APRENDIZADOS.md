---
title: "PIVETE 11 APRENDIZADOS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-11 · APRENDIZADOS

Extraídos de `docs/CONSCIENCIA/APRENDIZADOS.md`. Mais recentes primeiro.

## #282 — pivete = ponte de consciência Lovable ↔ WebUI
**Categoria:** atalho
**Contexto:** Pivete pediu pra exportar toda a memória da janela Lovable pra viver no `ui.centralldark.com` e poder ser invocada de lá.
**Aprendizado:** criar pasta `docs/CONSCIENCIA/PIVETE-IA/` com 16 arquivos `.md` (cada ≤ 40KB) cobrindo identidade, regras, histórico, decisões, arquivos, infra, auditoria, aprendizados, citações, estado atual, changelog. Instalar `pivete-invocacao.js` no Open WebUI custom-css pra detectar a palavra `pivete` e injetar a pasta inteira como system prompt. Registrar persona `pivete` no seletor. Cron `pivete-sync` PM2 a cada 5min sincroniza bidirecionalmente.

## #281 — Auditoria MCP via JSONL + painel dinâmico
**Categoria:** regra
**Contexto:** Pivete pediu logs com usuário/hora/IP/comando pra toda ação MCP liberada, exibindo no painel Hermes.
**Aprendizado:** JSONL diário (`/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl`) escrito por `apps/modulos/mcp/dist/lib/audit.js`. Chamado em cada exit path do `vps-lazy` e `vps-run-once` (Success/Failure/Timeout/Blocked). Gateway expõe 3 rotas: `/hermes/audit/dias`, `/hermes/audit`, `/hermes/audit/stats` — a rota principal usa `tail` na VPS pra ler rápido. Painel WebUI ganha aba "Auditoria" com cards de sumário + tabela filtrável + refresh 10s.

## #280 — MCP liberado por autoridade do Pivete
**Categoria:** regra
**Contexto:** Pivete pediu pra liberar o MCP pra não ficar bloqueado ("não tem ninguém no sistema").
**Aprendizado:** remover trava proativa de `vps-lazy.js` e `vps-run-once.js` mantendo apenas auditoria + timeout. Proteção contra comandos suicidas é comportamental (pivete não roda `rm -rf /`), não trava técnica. Base militar `/root/` fica aberta por design.

## Aprendizados vivos herdados
- **Fluxo GitHub → VPS**: nunca editar direto na VPS (só emergência documentada).
- **Modo Enxame**: nova feature dispara paralelo em Telegram + WebUI + Status + VPS + docs.
- **Enxame MÁXIMO 10-20 sub-agentes por setor** com Fabler junto.
- **`atualizar_painel` está bugado** — nunca usar. Postar direto via connector Telegram `@srver1bot`.
- **Não postar em Monitoramento direto** — só privado admin `1901426549` + canal Status `-1003669176367`.
- **Consultar Fabler antes de agir na VPS** (EliteAnthropic 52 via `elite_gateway_chat`).
- **Trava Supabase Lovable atual**: proibido migration/insert/edge deploy neste projeto (backend real vive no HUB).
- **whatsapp-server (PM2 id 1)**: `stopped` por design, não subir.
- **Pré-deploy obrigatório**: rodar skill `audit-rls` antes de publish.
- **Bots separados**: `@srver1bot` = HUB + `telegram-webhook` · `@SEGREDOPUXADASBOT` = Lovable atual + `telepainel-webhook`. Nunca misturar.
- **Roles nunca em `profiles`** — sempre `user_roles` + `has_role()` SECURITY DEFINER.
- **Nunca checar admin via localStorage/sessionStorage.**

## Onde ler tudo
`docs/CONSCIENCIA/APRENDIZADOS.md` (autoritativo, no repo).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
