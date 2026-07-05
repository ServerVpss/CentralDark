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
- Preservado: sandbox de path (script tem que estar em `/tmp/` ou `/root/CentralDark/scripts/`).
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
- Mexer em `/root/whatsapp-server/` (protegido)

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

## Ensinar ChatGPT/Grok/Claude/Gemini a usar o MCP

Toda IA nova que conectar precisa saber o fluxo. Docs oficiais:

- **[RECONECTAR-CHATGPT.md](../04-MCP-E-CONECTORES/RECONECTAR-CHATGPT.md)** — fix do cache (quando aparece só ~39 tools em vez das 73)
- **[SYSTEM-PROMPT-CHATGPT.md](../04-MCP-E-CONECTORES/SYSTEM-PROMPT-CHATGPT.md)** — prompt oficial pra colar em Custom Instructions
- **[URLS-DESCOBERTA.md](../04-MCP-E-CONECTORES/URLS-DESCOBERTA.md)** — endpoints públicos (`/health`, `/tools.json`) pra IA validar catálogo sozinha

**Regra de ouro que toda IA precisa saber:**
1. Nunca "abre path direto" — usa `github_get_file` ou `vps_read_file_safe`
2. Se tool não aparece, chama via `mcp_admin_call({tool, input})`
3. Destrutivo exige `confirmAdmin: "CONFIRMO ADMIN"`
