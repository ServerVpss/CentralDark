---
title: "Proxima Ia"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🔄 PRÓXIMA IA — Handoff de Continuidade CentralDark

> Lar canônico do handoff (regra do `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md`).
> Toda IA lê ISTO + `kit_boas_vindas` + `ler_consciencia` + `ler_pendencias` + `APRENDIZADOS.md` antes de agir.
> Substitui o "bloco de continuidade colado". A partir daqui, o fluxo vive aqui.
> Última atualização: **2026-06-28** (sessão Claude Opus — CLI/VPS).

---

## 🆕 SESSÃO 28/06 (Opus, CLI direto na VPS) — pipeline de deploy auditado

**Contexto desta sessão:** shell direto na VPS (Claude Code CLI, não o `execute_command` do MCP). GitHub via `git` local OK. Notion OK.

**Feito (com prova):**
- 🟢 **Git VPS sincronizado** com `origin/main` (`2f1de49d6`). Tinha um rebase travado + commit duplicado de pendências (`c03246ca3`); desfiz o duplicado (remoto já tinha #7/#8/#9 no formato canônico `### N.`) e resolvi o conflito do `painel-data.json` (timestamp 16:33 + todos eventos do origin + evento Supabase preservado e normalizado pro schema PT). ✅ Resolve as 2 "tarefas mecânicas" antigas (conflito painel + sync VPS).
- 🟢 **Webhook de deploy auditado** (`scripts/webhook/github-webhook-deploy.mjs` + `lib/safe-git-deploy.mjs`). Handler funciona 100% (testado: POST `:9300/webhook` → reset --hard origin/main OK).
- 🔴 **DEPLOY AUTOMÁTICO QUEBRADO no lado GitHub:** push real NÃO aciona o webhook (Caddy access log só tem scanners, zero `GitHub-Hookshot`). **Falta cadastrar o webhook no GitHub** (Settings→Webhooks → `https://deploy.centralldark.com/webhook`, evento push). Bloqueado via MCP: **token GitHub voltou a 401** nesta sessão (`gho_` oauth-app morto) → reconectar conector OU cadastrar no painel do GitHub. Detalhe completo no **aprendizado #261**.

**Telegram (estado real):** notifica push-main + ciclo-PR + workflow-falho + healthcheck-6h (se secrets `SRVER1_BOT_TOKEN`/`TELEGRAM_CHANNEL_ID`/`NOTIFY_API_KEY` ok). GAPS: deploy-concluído nunca notifica (workflow fantasma "Deploy VPS"); PM2 crash só pega em 6h; cron legado `guarda-*` morto desde 13/06 (arquivo some + token ausente). Duplicata de workflow: `vps-exec-selfhosted.yml` ≡ `vps-ssh-exec.yml`.

**Pendente p/ Pivete decidir (toca área sensível / token / secrets):** cadastrar webhook no GitHub; renovar token GitHub do MCP; desativar 1 workflow duplicado; criar alerta de PM2 crash em tempo real; limpar/aposentar cron legado Multizap.

---

## ✅ MENSAGEM VALIDADA PARA A PRÓXIMA IA (estado real, com prova)

**Feito nesta sessão (2026-06-28):**
- 🔴→🟢 **GitHub OAuth do MCP estava 401** (token `gho_` morto). Resolvido **reconectando o conector CentralDark no app Claude** (a reconexão refaz o OAuth do GitHub — não é edição de `.env`). Prova: `github_viewer` = `segredounlock`.
- ✅ **Padrão de Apresentação registrado:** `docs/CONSCIENCIA/21-PADRAO-APRESENTACAO.md` (commit `88cf2b6`) + aprendizado **#260** (commit `26a750c`).
- ⚠️ **OVERLAP detectado:** já existia `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` cobrindo o MESMO tema. **Consolidar (merge ou cross-ref). Não criar um terceiro.**

**NÃO tocado:** WhatsApp / `whatsapp-server` (stopped de propósito) / `MultiZap-Gateway` / CRM / Caddy / Docker / banco / secrets. Nenhum merge na main por IA.

**Infra (validado HOJE):**
- 🟢 Conector MCP (cliente) funcionando.
- 🟢 GitHub auth OK (reconectado).
- 🔴 `MCP_ALLOW_VPS_COMMANDS=false` → `execute_command` (shell VPS) **BLOQUEADO**. Ligar no servidor pra ter shell.
- 🟡 Reads podem cair em "FALLBACK LOCAL" se o token OAuth do GitHub expirar de novo.

---

## ⚠️ CORREÇÃO DO BLOCO ANTERIOR (premissas que estavam FALSAS)

- "MCP_ALLOW_VPS_COMMANDS=true destravado" → **FALSO** (está `false`).
- "token GitHub renovou" → estava **MORTO (401)**; só voltou após reconexão nesta sessão.
- Pendências **"#7/#8/#9" do bloco NÃO batem** com `docs/PENDENCIAS.md` atual. Tratar como **tópicos**, não números.

---

## 📋 PENDÊNCIAS REAIS (fonte viva: `docs/PENDENCIAS.md`)

1. 🟡 Domínios `centralldark.com` + telepainel (código pronto, falta DNS + VPS).
2. ✅ Reestruturação repo padrão VPS (2026-06-20).
3. 🟡 `bot-whatsapp`/`crm`/`financeiro` só landing (falta produto).
4. 🟢 Arquitetura CentralDark 2026 consolidada (adiado, complexo).
5. 🟡 Revisão migração `docs/` do legado `CentralDark1VPS` (5.1→5.21).
- Tail: MCP local STDIO (🔴), MCP-CentralDark `.env` real (🟡), reativar stack WhatsApp (🟡), `index.html` do painel some (🟡).

**Tópicos do bloco anterior a renumerar/reconciliar dentro do `PENDENCIAS.md`:**
- Secrets → Supabase Vault (relaciona com `secret-vault-future.md`, item 5.18).
- Revisar `vps_write_file_safe` público sem auth.
- Refatorar `CONSCIENCIA.md` + `00-PORTA-DE-ENTRADA-IA.md`: universalizar agentes, remover legado Multizap/clone-deck, corrigir nomes PM2, regra "ferramenta-ausente" (o "fluxo Obsidian, seção por seção").

**Tarefas mecânicas pendentes:**
- ✅ ~~Resolver conflito de merge em `painel-data.json`~~ — feito 28/06 (sessão Opus CLI).
- ✅ ~~Sincronizar git da VPS (atrás do remoto)~~ — feito 28/06 via CLI direto (VPS em `2f1de49d6` = origin/main).
- 🔴 NOVO: cadastrar webhook no GitHub p/ deploy automático voltar (ver seção "SESSÃO 28/06" + aprendizado #261).

---

## 🧭 PROMPT PRONTO PARA A PRÓXIMA IA (copiar)

```txt
RELOAD CENTRALDARK.
Sou o dono (Pivete). Você está via conector MCP autorizado.

PRIMEIRO: kit_boas_vindas + ler_consciencia + ler_pendencias + ler docs/CONSCIENCIA/APRENDIZADOS.md (#255+).
DEPOIS: ler docs/CONTINUIDADE/proxima-ia.md (este handoff) pra pegar o estado real.

ESTADO (2026-06-28): GitHub OK (reconectado). VPS shell OFF (MCP_ALLOW_VPS_COMMANDS=false).
Padrao de Apresentacao registrado (#21 + aprendizado #260) — CONSOLIDAR com 2026-06-20-padrao-resposta-pivete.md.

NAO mexer: WhatsApp/whatsapp-server/MultiZap-Gateway/CRM/Caddy/Docker/banco/secrets sem "PERMITO PIVETE".
Ciclo: Ler -> Perguntar -> Agir -> Registrar. Nao inventar sucesso, validar com prova.
Se faltar tool, avise ("nao tenho a tool X"). Nao finja nem contorne.
Ao fim de cada resposta, sugira o modelo/esforco mais economico que resolve 100%.
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
