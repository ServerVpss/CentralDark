# HANDOFF-DELTA-HERMES-TRACES-20261024

**Data/Hora (Bahia):** 2026-10-24 22:45 America/Bahia  
**Auditor:** Hermes (kanban t_928a8cbd) — leitura somente, owner CentralDark-Remote  
**Escopo exclusivo:** este arquivo novo na pasta canônica. Não edita engine/, menus, OAuth, OneShot, links, instalador, worktree, SKILL, task scheduler, GitHub, SSH/VPS.

---

## Origens observadas (somente leitura)

| Fonte | Tipo | Status observado |
|-------|------|------------------|
| `K:\Bridge\logs\centraldark-remote-source-consolidation-20261024-223004.json` | Recibo de consolidação (JSON) | PASS 10/10 aliases, SHA-256 bate |
| `C:\Users\Administrador\AppData\Local\CentralDark\Remote-Tray\receipts\remote-bridge\` | Logs bridge (UTF-16-BE, ~3KB cada, 5min) | 85 arquivos 16:24–22:35; últimos contêm tailscale serve, GitHub auth, erro porta 443 |
| `K:\Bridge\logs\` | Logs bridge (mesmo conteúdo, vazio em 22:35) | Mesmo padrão; K:\Bridge\logs\bridge-20261024-223538.log não encontrado |
| Hermes kanban `t_5b386368` (show/runs) | Cartão de integração | RUN #86 CRASHED (rc=0 sem kanban_complete/block/request_review); card READY 48min; PR #1951 criado |
| `http://127.0.0.1:9101/health` | Health endpoint nativo | `{"ok":true,"name":"CentralDark Casa Commander","engine_connected":false,"remote_vendor":false}` |

---

## Campos de trace/tool-call realmente disponíveis (sem inventar)

| Campo | Disponibilidade | Evidência |
|-------|-----------------|-----------|
| `call_id` | **NÃO DISPONÍVEL** | Logs bridge não emitem call_id; kanban events não expõem |
| `trace_id` | **NÃO DISPONÍVEL** | Sem correlation-id nos logs bridge nem kanban |
| `task_id` | **DISPONÍVEL** | `t_5b386368` presente em kanban show/comments/events |
| `run_id` | **PARCIAL** | Run #86 identificado; run_id interno Hermes não exportado nos logs bridge |
| `status` | **DISPONÍVEL** | `crashed`, `ready`, `running` via kanban; `engine_connected:false` via health |
| `duracao` | **PARCIAL** | Run #86 = 1490s (kanban); logs bridge sem timestamp de início/fim por chamada |

**Observado-agora vs histórico:**  
- Agora: health endpoint, kanban show atual, log bridge 22:35, recibo consolidação 22:30.  
- Histórico: runs/comments/events kanban (21:51–22:37), logs bridge 16:24–22:30, consolidação 10/10 aliases (histórico de validação).

---

## Contraprova

- **Consolidação 10/10 ≠ E2E:** Recibo valida apenas links simbólicos e parsers; `engine_connected=false` prova que handshake MCP não ocorreu.  
- **Run #86 rc=0 ≠ SUCESSO:** Worker saiu limpo sem chamada terminal Kanban (`kanban_complete`/`block`/`request_review`). Violação de protocolo Hermes; edições no worktree (PR #1951) persistem, mas estado do card não avançou.  
- **Logs bridge ≠ traces estruturados:** São stdout/stderr brutos do script PowerShell (tailscale serve, gh auth, erro 443). Não contêm `tool_call_id`, `trace_id`, `cid`, `duracao` por chamada.  
- **PR #1951 criado ≠ deploy/prova:** Mudanças em config, mcp-admin, tools-catalog, casa-private.js; OAuth/PKCE configurado, rota `CASA_NATIVE_COMMANDER` registrada. Engine nativo na porta 9101 não está rodando (`engine_connected=false`).

---

## Causa/pendência do worker rc=0 sem chamada terminal

**Causa raiz (observada):** Run #86 executou fase de configuração (naming migration, OAuth config, route/tool catalog, PR #1951) e criou tasks filhas `t_25ea192c` e `t_5f53bd8c` com workspaces relativos inválidos (`K:.worktrees\...`). O worker encerrou com exit code 0 **sem** invocar `kanban_complete`, `kanban_block` ou `kanban_request_review`.  
**Pendência:** Card pai `t_5b386368` ficou `READY` (não `DONE`); tasks filhas não despachadas por workspace inválido; engine nativo 9101 não iniciado; E2E pendente (OAuth + tools/list + read + readback).  
**Efeito:** Próxima execução deve reconciliar worktree absoluta `K:\_worktrees\centraldark-remote-name-migration-20261024\repo` (HEAD `78c7f1952d`), verificar PR #1951, e retomar a partir do NEXT_CURSOR abaixo — não recomeçar consolidação.

---

## Melhoria mínima para correlacionar logs existentes (sem arquitetura paralela)

1. **Padronizar envelope mínimo nos logs bridge** (já existem, só adicionar campos):  
   `timestamp_iso`, `kanban_task_id`, `run_id`, `event_type` (`bridge_tick`|`tailscale_serve`|`gh_auth`|`error`), `status`, `duration_ms`.  
   → Uma linha JSON por tick; mantém UTF-8, sem segredos, append-only.

2. **Exportar `run_id` e `tool_call_id` do Hermes** via `kanban_show` → `events` já contêm `commented`/`respawn_guarded`; mapear `run_id` para cada comentário/evento e gravar no mesmo envelope.

3. **Health endpoint incluir `last_kanban_task_id` e `last_run_id`** quando engine subir — correlação direta porta 9101 ↔ card Kanban.

4. **Não criar novo logger/gateway/daemon.** Apenas estender o `CentralDark-Remote-Bridge.ps1` (owner canônico) com 4 campos JSON por linha. O recebedor (Sala de Controle / Instinto Superior) já consome logs; ganho imediato sem novo componente.

---

## NEXT_CURSOR (para agente da integração)

1. Reconciliar worktree absoluta `K:\_worktrees\centraldark-remote-name-migration-20261024\repo` (HEAD `78c7f1952d`). Verificar PR #1951 aberto.  
2. Corrigir tasks filhas `t_25ea192c` e `t_5f53bd8c`: criar worktrees absolutas válidas ou fundir no pai; não despachar com workspace relativo.  
3. Subir engine nativo na porta 9101 (processo MCP stdio `CentralDark-Casa-Agent.mjs` → `npx @wonderwhy-er/desktop-commander@0.2.48`). Provar `engine_connected=true` no `/health`.  
4. Executar fluxo OAuth/PKCE via `centraldark_mcp=https://mcp.centralldark.com/mcp` → `initialize` → `tools/list` → chamada somente leitura (`centraldark_casa_read_file`) → readback exato.  
5. Registrar cada delta/prova em `HANDOFF-DELTA-<data>-<agente>.md` na pasta canônica. Atualizar skill/catálogo por referência.  
6. **Critério de FIXED_POINT:** `engine_connected=true` + OAuth válido + `tools/list` + chamada leitura + readback + receipt sanitizado. `engine_connected=false` **nunca** vira PASS.

---

**Fim do delta de auditoria.** Arquivo escrito em `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-HERMES-TRACES-20261024.md`.