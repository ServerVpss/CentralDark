---
name: hermes-gateway-map
description: Mapa dos endpoints úteis da gateway local 127.0.0.1:9119 (Hermes v0.20.0).
---

# MAPA DA GATEWAY LOCAL — http://127.0.0.1:9119

Fonte: `http://127.0.0.1:9119/openapi.json` (Hermes Agent v0.20.0, 251 paths).
Docs: `http://127.0.0.1:9119/docs?profile=pivete`
Usar SEMPRE que precisar agir na própria máquina/perfil via API em vez de chutar comando.

## GRUPOS DE FUNÇÃO (os que uso no dia a dia)

### 1. PERFIL / SOUL / MODELO
- `GET /api/profiles` — lista perfis
- `GET,POST /api/profiles/active` — perfil ativo
- `GET,PUT /api/profiles/{name}/soul` — ler/editar SOUL.md do perfil
- `PUT /api/profiles/{name}/model` — trocar modelo do perfil
- `POST /api/profiles/{name}/open-terminal` — abrir terminal do perfil
- `GET /api/model/options` — modelos disponíveis
- `POST /api/model/set` — setar modelo/atribuição
- `GET /api/model/info` — info do modelo atual

### 2. SESSÕES (memória viva)
- `GET /api/sessions` — lista sessões
- `GET /api/sessions/search` — busca FTS5 no histórico
- `GET /api/sessions/{id}/messages` — mensagens de uma sessão
- `GET /api/sessions/{id}/export` — exportar
- `POST /api/sessions/prune` — podar vazias/antigas
- `GET /api/sessions/stats` — estatísticas

### 3. SKILLS (capacidades)
- `GET /api/skills` — lista skills
- `GET,PUT /api/skills/content` — ler/editar conteúdo de skill
- `PUT /api/skills/toggle` — ligar/desligar skill
- `GET /api/skills/hub/search` — buscar no catálogo/hub
- `POST /api/skills/hub/install` — instalar do hub

### 4. MEMÓRIA / APRENDIZADO
- `GET /api/memory` — status da memória
- `GET /api/learning/graph` — grafo de aprendizado
- `DELETE,GET,PUT /api/learning/node` — nó de conhecimento
- `PUT /api/memory/provider` — provider de memória

### 5. ARQUIVOS / FS (Casa)
- `GET,POST /api/files` — listar arquivos gerenciados
- `GET /api/files/read` — ler
- `POST /api/files/upload` — subir
- `GET /api/fs/list` — listar FS
- `GET /api/fs/read-text` / `POST /api/fs/write-text` — ler/escrever texto
- `GET /api/fs/git-root` — raiz git

### 6. GIT (operação segura)
- `GET /api/git/status` — status
- `POST /api/git/review/stage` / `unstage` — stage
- `POST /api/git/review/commit` — commit
- `POST /api/git/review/push` — push
- `POST /api/git/review/create-pr` — PR
- `GET /api/git/file-diff` — diff
- `POST /api/git/worktree/add` — worktree

### 7. CRON (agendamento)
- `GET,POST /api/cron/jobs` — listar/criar
- `POST /api/cron/jobs/{id}/trigger` — disparar
- `POST /api/cron/jobs/{id}/pause` / `resume` — pausar/retomar
- `GET /api/cron/jobs/{id}/runs` — histórico de runs
- `GET /api/cron/blueprints` — blueprints prontos

### 8. KANBAN (tarefas)
- `GET /api/plugins/kanban/board` — board
- `POST /api/plugins/kanban/tasks` — criar task
- `GET,PATCH /api/plugins/kanban/tasks/{id}` — ver/editar
- `POST /api/plugins/kanban/tasks/{id}/reassign` — reassign
- `GET /api/plugins/kanban/workers/active` — workers ativos

### 9. OPS (manutenção)
- `POST /api/ops/doctor` — diagnóstico
- `POST /api/ops/backup` — backup
- `POST /api/ops/import` — importar
- `POST /api/ops/dump` — dump de estado
- `POST /api/ops/security-audit` — audit de segurança
- `POST /api/ops/prompt-size` — tamanho de prompt

### 10. GATEWAY (controle do runtime)
- `POST /api/gateway/restart` — reiniciar (R3 — só com ordem)
- `POST /api/gateway/stop` / `start` — parar/iniciar (R3)
- `POST /api/gateway/drain` — drenar
- `GET /api/health` — saúde
- `GET /api/status` — status geral

### 11. CONFIG
- `GET,PUT /api/config` — config
- `GET /api/config/raw` — raw
- `GET /api/config/schema` — schema
- `DELETE,GET,PUT /api/env` — env vars

### 12. MENSAGERIA (Telegram/WhatsApp)
- `GET /api/messaging/platforms` — plataformas
- `POST /api/messaging/telegram/onboarding/start` — parear Telegram
- `PUT /api/messaging/platforms/{id}` — atualizar plataforma
- `POST /api/messaging/platforms/{id}/test` — testar

### 13. PROVIDERS / OAUTH
- `GET /api/providers/oauth` — listar
- `POST /api/providers/oauth/{id}/start` — iniciar login
- `GET /api/providers/oauth/{id}/poll/{sid}` — poll
- `POST /api/providers/validate` — validar credencial

### 14. MCP / PLUGINS
- `GET /api/mcp/servers` — servidores MCP
- `GET /api/mcp/catalog` — catálogo
- `POST /api/mcp/catalog/install` — instalar
- `GET /api/dashboard/plugins/hub` — hub de plugins

### 15. ÁUDIO / VISÃO
- `POST /api/audio/speak` — TTS
- `POST /api/audio/transcribe` — STT
- `GET /api/audio/elevenlabs/voices` — vozes

### 16. CURADOR (auto-improve)
- `GET /api/curator` — status
- `PUT /api/curator/paused` — pausar
- `POST /api/curator/run` — rodar

### 17. WEBHOOKS
- `GET,POST /api/webhooks` — listar/criar
- `PUT /api/webhooks/{name}/enabled` — ligar/desligar

## REGRA DE OURO
- R0/R1 (ler/listar): usar direto.
- R2/R3 (escrever/git push/restart/gateway stop): só com ordem do Pivete.
- Nunca `gateway/stop` ou `restart` sem autorização aplicável.
- `127.0.0.1:9119` é a fonte canônica do meu runtime — antes de chutar comando no terminal, consultar aqui.
