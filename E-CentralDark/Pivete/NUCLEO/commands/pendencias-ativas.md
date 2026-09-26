# COMANDO - pendencias-ativas.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\skills\centraldark-consciencia\pendencias-ativas.md
**SHA:** b2b1cd3271191295
**Timestamp:** 2026-08-26T19:32:53.552481
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pu

### Gaps
- - **Falta:** validações mais profundas — ping real de chat ao vivo, query Supabase com `SELECT 1`, comparar com revisão anterior pra detectar regressão, modo `--json` pro painel admin, alerta no Teleg
- - **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/r
- - **O que falta:**
- - **Falta:**

### Ouro Bruto (primeiros 5000 chars)
```
# Pendências ativas — auto-gerado

> Espelho automático de `docs/PENDENCIAS.md` mantido pelo workflow `.github/workflows/consciencia-sync.yml`.
>
> **Não editar à mão.** Atualize `docs/PENDENCIAS.md` direto.

Última sincronização: 2026-06-07 16:02:23 -03

---

# 📌 PENDÊNCIAS — MultiZap / clone-deck

> **Setor único de pendências do projeto.** Sempre que algo ficar pra depois, registra aqui. Quando o usuário pedir "olha as pendências", esse é o arquivo. A IA também mantém uma cópia resumida em `mem://pendencias`.

**Última atualização:** 2026-06-06 BRT (✅ Caddy revivido + watchdog do MCP + página pública `/status` no install.centralldark.com + alertas Telegram)
**Como ler:** prioridade (🔴 alta · 🟡 média · 🟢 baixa) · status · descrição curta · onde mexer · critério pra fechar.

---

### Caddy quebrado após cleanup + watchdog do MCP — ✅ FECHADO em 2026-06-06
- **Sintoma:** `mcp.centralldark.com` devolvia Cloudflare 521 — Caddy `failed` desde 16:01 do dia 06/06 (durante o cleanup de disco que liberou 56GB).
- **Causa raiz:** `/etc/caddy/Caddyfile` linha 51 fazia `import /root/CentralDark/infra/caddy/install.Caddyfile`, mas o arquivo nunca existiu no FS (nem no repo). Caddy se recusava a subir.
- **Correção:** criado `CentralDark/infra/caddy/install.Caddyfile` (proxy `install.centralldark.com` → `127.0.0.1:9200`), permissão do `/var/log/caddy/install-access.log` ajustada, Caddy reiniciado e validado.
- **Bônus pedido pelo usuário (entregue no mesmo turno):**
  - **Watchdog** em `CentralDark/scripts/monitor/mcp-watchdog.sh` — roda via cron a cada 1 min, checa `/health` do MCP + install + Caddy systemd, detecta Cloudflare 521/502/504, manda alerta no Telegram (curl direto na Bot API, não depende do `MultiZap-TelegramBot` que tá quebrado), com debounce por incidente e mensagem de recovery quando volta.
  - **Página pública de status** em https://install.centralldark.com/status — mostra dot verde/vermelho, uptime do PM2, contagem de tools (56), HTTP code de cada endpoint, problemas detectados e últimos erros. Auto-refresh 30s. JSON em `/status.json`.
  - **Credenciais** propagadas pra `/root/CentralDark/secrets/telegram-alerts.env` (origem: secrets do sandbox Lovable).
- **Cadeia validada 7/7:** repo OK · install.Caddyfile no FS · Caddy `active` · 127.0.0.1:9100/9200 200 · Caddyfile aponta certo · `mcp.centralldark.com/health` 200 · `install.centralldark.com/status` 200 com marcador novo.

### MCP-CentralDark fora do ar (502) — ✅ FECHADO em 2026-06-06
- **Sintoma:** `https://mcp.centralldark.com/health` e `/tools.json` devolviam 502; PM2 mostrava `online` mas com 24 restarts e porta 9100 livre (loop de crash).
- **Causa raiz (5 Porquês):** `CentralDark/apps/mcp/src/tools/supabase.ts` ganhou `import { config } from 'dotenv'` numa alteração manual, mas `dotenv` não está em `package.json` do MCP → `ERR_MODULE_NOT_FOUND` no boot.
- **Correção:** reescrito `tools/supabase.ts` com mini-parser .env inline (sem dep externa). Mesma lógica de prioridade (cofre oficial `/root/CentralDark/secrets/*` primeiro, legados `/root/Multizap/*` como fallback). Comportamento idêntico aos callers.
- **Blindagem:** `scripts/run-once/1005-bot-enable-mcp-creation-mode.sh` ganhou pré-check de `/health`, pós-check com retry 3× e rollback automático se o serviço cair após restart.
- **Higiene:** `.github/workflows/deploy.yml` ganhou `run-name` com `#FASE` pro histórico do Actions ficar legível.


## 🔴 Alta prioridade

### 36. Arquivar e apagar pastas apps antigas após validação
- **Status:** Aberto
- **Descrição:** Depois da migração das apps antigas para a pasta principal, validar serviços, Git, HTTP e conteúdo migrado. Em seguida, colocar as pastas antigas em quarentena/backup e só depois apagar definitivamente com confirmação explícita.
- **Onde mexer:** VPS: pastas antigas de apps e pasta principal de apps do CentralDark
- **Como fechar:** Confirmar que PM2/HTTP continuam online, que os arquivos migrados úteis estão no local correto, que o GitHub recebeu o que deve receber sem arquivos privados abertos, mover antigas para quarentena, validar novamente e apagar somente após confirmação literal do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

### 35. Migrar apps antigas para /root/[oculto] após comparação VPS + GitHub
- **Status:** Aberto
- **Descrição:** Depois de comparar /root/[oculto], /root/[oculto], /root/[oculto] e o repositório ServerVpss/CentralDark, criar plano controlado para migrar somente o que for necessário para a pasta principal /root/[oculto] e remover/arquivar pastas antigas com segurança.
- **Onde mexer:** VPS: pastas apps antigas e /root/[oculto]; repositório ServerVpss/CentralDark para refletir o estado correto depois
- **Como fechar:** Gerar relatório final de comparação, escolher o que migrar, fazer backup/arquivo das pastas antigas, migrar uma pasta/app por vez, validar PM2/HTTP, e só apagar antigas após confirmação explícita do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

### 33. Garantir sync principal -> espelh
```