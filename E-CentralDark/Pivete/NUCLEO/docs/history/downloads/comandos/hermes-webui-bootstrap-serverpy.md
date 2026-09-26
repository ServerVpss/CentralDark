---
title: "Hermes WebUI Bootstrap — Caminho Validado server.py"
date: 2026-08-23
session: centraldark-runtime-wiring-2026-08-23
status: VALIDATED
---

## Problema
`bootstrap.py` falha no Windows:
- Aliases `python`/`python3` apontam para Microsoft Store
- `--skip-onboarding` não existe
- Paths de venv não resolvem corretamente

---

## Caminho Validado (Funciona)

### 1. Criar `.env` local no repo hermes-webui
```bash
HERMES_WEBUI_HOST=127.0.0.1
HERMES_WEBUI_PORT=8787
HERMES_WEBUI_STATE_DIR=./webui_state
HERMES_WEBUI_DEFAULT_WORKSPACE=/c/CentralDark
HERMES_HOME=/c/Users/danda/AppData/Local/hermes
HERMES_CONFIG_PATH=/c/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml
HERMES_WEBUI_BOT_NAME=Hermes
HERMES_WEBUI_PASSWORD=localdev123
HERMES_WEBUI_SKIP_ONBOARDING=1
```

### 2. Subir `server.py` direto com venv do Hermes Agent
```bash
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe server.py
```

---

## Validação (Testado)

| Endpoint | Resultado |
|----------|-----------|
| `GET /health` | 200 OK |
| `GET /api/kanban/board` | Kanban CRUD funcionando |
| `POST /api/chat/start` | RuntimeAdapter (legacy-journal) cria run → `stream_id` |
| `POST /api/kanban/tasks` | Task criada no board default |
| `PATCH /api/kanban/tasks/{id}?board=default` | Status update (todo → done) |

---

## O que NÃO funciona ainda

| Endpoint | Status |
|----------|--------|
| `/api/session` (POST create) | 404 not found |
| `/api/runs/start` direto | 404 not found (usar `/api/chat/start`) |

---

## Por que server.py funciona e bootstrap.py não?

| Fator | bootstrap.py | server.py |
|-------|--------------|-----------|
| Python resolution | Usa `python3`/`python` (aliases Store) | Chamado explicitamente com venv path |
| Argumentos | `--skip-onboarding` não existe | Não precisa (usa env `HERMES_WEBUI_SKIP_ONBOARDING`) |
| Config | Tenta auto-discovery complexo | Lê `.env` + env vars direto |
| Processo | Tenta spawn detached | Roda no foreground (herda terminal) |

---

## Comando Único para Subir
```bash
cd /c/CentralDark/hermes-webui && /c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe server.py
```

---

## Referência
- Missão: `CENTRALDARK_RUNTIME_WIRING`
- Checkpoint: `2026-08-23-runtime-wiring-checkpoint.md`