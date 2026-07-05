---
title: "PIVETE 08 MCP LIBERACAO"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-08 · LIBERAÇÃO DO MCP

## Contexto
Pivete determinou: **"não tem ninguém no sistema, sem perigo por enquanto — liberar o MCP pra não ficar bloqueado".**

## O que foi destravado

### `apps/modulos/mcp/dist/tools/vps/vps-lazy.js`
- Removida checagem que exigia `MCP_ALLOW_VPS_COMMANDS=true`.
- Removida allowlist restritiva de binários.
- Preservado: timeout, captura de stdout/stderr, exitCode.
- Adicionado: chamada a `auditLog()` em cada exit path (Success/Failure/Timeout/Blocked).

### `apps/modulos/mcp/dist/tools/vps/vps-run-once.js`
- Removida trava de execução de scripts.
- Preservado: sandbox de path (script tem que estar em `/tmp/` ou `<caminho-vps>`).
- Adicionado: `auditLog()` no handler.

## Ambiente PM2
Variável `MCP_ALLOW_VPS_COMMANDS=true` no PM2 id 33.

## O que continua não permitido (bom senso, não trava técnica)
- `rm -rf /` (destruição total)
- `mkfs.*` (formatação)
- `reboot`, `shutdown`, `halt`, `poweroff`
- Sobrescrever `/etc/passwd`, `/etc/shadow`
- `iptables -F`, `ufw disable`, `nft flush ruleset` sem justificativa
- `curl … | sh` sem revisão
- Mexer em `<caminho-vps>` (protegido)

**Regra:** essas restrições são de conduta do pivete, NÃO travas do MCP. O Pivete pode override a qualquer momento sem cerimônia.

## O que NÃO foi implementado (revertido pelo Pivete)
- ❌ `DENY_ETERNO` (lista imutável)
- ❌ `DENY_FORA_CENTRALDARK` (bloqueio fora do projeto)
- ❌ Guardian PM2 checando SHA-256
- ❌ `nftables` novo com IP allowlist
- ❌ Backup imutável com `chattr +i`
- ❌ Sandbox `resolvePath` obrigatório

**Motivo (Pivete):** "a base militar tem que ficar aberta porque se eu necessitar editar ou fazer atualizações diretamente pelo chat do WebUI posso trabalhar inclusive usando você".

## Status atual
🟢 MCP totalmente liberado
🟢 Auditoria universal ativa
🟡 Zero trava proativa — proteção é comportamental

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

## Ensinar QUALQUER IA a usar o MCP (universal)

Vale pra ChatGPT, Claude, Grok, Gemini, Cursor, Codex, Copilot — qualquer cliente MCP. Docs oficiais:

- **[RECONECTAR-CONECTOR.md](../04-MCP-E-CONECTORES/RECONECTAR-CONECTOR.md)** — fix do cache (quando aparece menos tools que o servidor publica)
- **[SYSTEM-PROMPT-UNIVERSAL.md](../04-MCP-E-CONECTORES/SYSTEM-PROMPT-UNIVERSAL.md)** — prompt oficial pra colar em Custom Instructions de qualquer cliente
- **[URLS-DESCOBERTA.md](../04-MCP-E-CONECTORES/URLS-DESCOBERTA.md)** — endpoints públicos (`/health`, `/tools.json`) pra IA validar catálogo sozinha

**Regra de ouro universal:**
1. Nunca "abre path direto" — usa `github_get_file` ou `vps_read_file_safe`
2. Se tool não aparece, chama via `mcp_admin_call({tool, input})`
3. Destrutivo exige `confirmAdmin: "CONFIRMO ADMIN"`
