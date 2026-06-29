# Auditoria Geral CentralDark — 100% Só Leitura

Combinado: **não escrevo nada em lugar nenhum**. Nem arquivo no repo, nem commit, nem migration, nem restart, nem comando que mude estado. Só leio e te entrego o relatório aqui no chat.

## O que vou ler

**1. Lovable (este repo)**
- Estrutura, build status, console e network do preview.
- Auth: logs do Cloud mostram `bad_jwt` recorrente — investigar de onde vem (só leitura do código).

**2. GitHub**
- `gh run list` workflows recentes (verde/vermelho).
- PRs abertos parados.
- HEAD da `main`.

**3. VPS (`/root/CentralDark`) via SSH — só comandos de leitura**
- `pm2 list` (sem restart, sem save).
- `git status` / `git log -1` no repo da VPS.
- `ss -tulpn`, `free -h`, `df -h`.
- `systemctl status caddy` (sem reload).
- `curl` nos subdomínios públicos (multizap.dev, bot/crm/hook, status/mcp/api.centralldark.com) só pra ver HTTP code.
- Listar último backup em `/root/Multizap/backups/` (sem tocar).

**4. Lovable Cloud**
- `cloud_status`, `db_health`, `linter`.
- Listar edge functions e ler logs recentes com erro.
- `read_query` em tabelas de saúde (`module_health_status`, `edge_function_health`) — SELECT puro.
- Lista de secrets cadastrados (só nomes, nunca valores).

**5. Cérebro Vivo**
- Ler `docs/PENDENCIAS.md`, `09-ESTADO-ATUAL.md`, último `last-report.json` do memory linker.

## Entregável

**Só no chat.** Relatório consolidado em uma mensagem, com:
- Semáforo por área (🟢🟡🔴)
- O que tá quebrado de fato
- O que tá pendente
- Fila sugerida do que atacar primeiro (pra tu decidir depois, em outra conversa)

**Nada é gravado em `docs/CONSCIENCIA/`, nada vira commit, nada vira PR.** Se quiser que vire arquivo depois, tu pede explicitamente.

## Garantias (cumprindo `02-PERMISSOES.md` + CLAUDE.md §9)

- Zero escrita: nenhum arquivo do repo é tocado.
- Zero `git add/commit/push`.
- Zero restart de PM2 (nem os 3 permitidos).
- Zero mexida em Docker, WuzAPI, WhatsApp, Caddy, CRM, DNS, secrets, banco.
- Zero toque em áreas protegidas.
- Logs sanitizados antes de qualquer trecho aparecer aqui.

Aprova que eu rode a leitura?