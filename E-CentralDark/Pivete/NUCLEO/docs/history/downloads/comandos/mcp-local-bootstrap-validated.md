---
title: "MCP CentralDark Local — Bootstrap Validado"
date: 2026-08-23
session: centraldark-runtime-wiring-2026-08-23
status: VALIDATED
---

## Procedimento Completo

### 1. Build
```bash
cd /c/CentralDark/apps/modulos/mcp
npm install
npm run build  # tsc compila src/ → dist/
```

### 2. Configurar `.env.local` (vars mínimas)
```bash
MCP_PORT=9100
MCP_PUBLIC_URL=http://localhost:9100
CENTRALDARK_ADMIN_KEY=local-dev-key-123
MCP_SESSION_SECRET=[REDIGIDO-PRESERVACAO]
LOG_LEVEL=debug
LOG_DIR=./logs
VPS_REPO_PATH=/c/CentralDark
PM2_ALLOWED_RESTART=CentralDark-MCP
GITHUB_OWNER=ServerVpss
GITHUB_REPO=CentralDark
```

### 3. Subir (background)
```bash
node dist/index.js
```

### 4. Validar
```bash
curl http://localhost:9100/health      # v0.4.0, 110 tools
curl http://localhost:9100/status.json # catálogo completo + conectores
```

---

## Evidência de Validação

### `/health` Response
```json
{
  "ok": true,
  "service": "mcp-centraldark",
  "version": "0.4.0",
  "catalogVersion": "110-656f476c7f61",
  "toolCount": 110
}
```

### `/status.json` — Conectores
| Conector | Status | Detalhe |
|----------|--------|---------|
| GitHub API | ✅ OK | 227ms |
| OAuth GitHub | ⚠️ WARN | GITHUB_CLIENT_SECRET ausente |
| Supabase | ⚠️ WARN | sem env |
| VPS SSH | ⚠️ WARN | sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE |
| Persistência | ✅ OK | /root/CentralDark/secrets/mcp-state.json |

### Tools Disponíveis (110)
- GitHub: 37 (cancel, check_token, close_issue, comment, commit, create_branch, create_issue, create_or_update_file, create_pr, create_release, delete_branch, delete_file, delete_workflow, dispatch, dispatch_workflow, get_actions_permissions, get_file, get_repo, list_commits, list_environments, list_issues, list_prs, list_repo_variables, list_repos, list_secrets, list_webhooks, list_workflow_runs, list_workflows, merge_pr, read, rerun_failed, rerun_workflow, search_code, set_repo_variable, test_webhook, upload_base64, viewer)
- VPS: 7 (git_diff, git_status, list_dir, read_file, run_once_script, tree, write_file)
- Supabase: 4
- Deploy: 2
- MCP interno: 7
- Skills: 5
- Pendências: 6
- Consciência: 4
- Aprendizado: 2
- Elite Gateway: 3
- Gemini: 2
- Linear: 5
- Notion: 4
- Sentry: 4
- Semantic: 8
- Code Reviewer, Execute Command, etc.

---

## Integração com Hermes WebUI

O MCP roda independentemente. O Hermes WebUI (BFF) pode consumir via MCP client apontando para `http://localhost:9100/mcp`.

---

## Referência
- Missão: `CENTRALDARK_RUNTIME_WIRING`
- Checkpoint: `2026-08-23-runtime-wiring-checkpoint.md`