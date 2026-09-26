# CentralDark Omni Router — Bootstrap Validado no Windows (2026-08-25)

## Contexto
PR #1157 aberto com o **CentralDark Omni Router**: uma porta única (8099) para rotear chamadas para múltiplos engines:
- **Claude Code** (local CLI) — `configured: true`
- **OpenAI oficial** (API) — precisa `OPENAI_API_KEY`
- **Hermes** (OpenAI-compatible HTTP) — precisa endpoint local rodando
- **Legado zendriver/chatgpt** → `FROZEN_NOT_ROUTED` (congelado, não roteado)

## Bootstrap Validado

### 1. Self-Test
```bash
# Usar Python do venv do Hermes Agent (não o python.exe do WindowsApps)
C:/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe \
  E:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py --self-test

# Saída esperada:
{"ok": true, "checks": {"route_openai": true, "route_claude": true, "redaction": true, "flatten": true, "openai_extract": true, "cli_extract": true}, "failed": []}
```

### 2. Subir o Servidor (Background)
```bash
C:/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe \
  E:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py \
  --host 0.0.0.0 --port 8099
```
- PID do processo: ex. 15632 (session `proc_4e3c80bf343c`)
- Roda silenciosamente em background

### 3. Health Check
```bash
curl -s http://localhost:8099/health
```
**Resposta esperada:**
```json
{
  "ok": true,
  "service": "centraldark-omni-router",
  "version": "0.1.0",
  "default_engine": "claude-code",
  "engines": {
    "openai": {"configured": false, "transport": "official_api"},
    "claude-code": {"configured": true, "transport": "local_cli"},
    "hermes": {"configured": false, "transport": "openai_compatible_http"}
  },
  "legacy_zendriver_chatgpt": "FROZEN_NOT_ROUTED"
}
```

### 4. Testar Chat com Claude Code
```bash
# Via Python (curl no Windows bash tem problemas com aspas JSON)
C:/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe -c "
import urllib.request, json
data = json.dumps({'messages': [{'role': 'user', 'content': 'Olá, você está vivo?'}], 'model': 'claude-code'}).encode()
req = urllib.request.Request('http://localhost:8099/v1/chat/completions', data=data, headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
print(resp.read().decode())
"
```
**Resposta esperada:** `{"id":"cd-...","object":"chat.completion","model":"claude-code/claude-code","choices":[...],"centraldark":{"engine":"claude-code","resolved_model":"claude-code","duration_ms":~13000,"fallback_used":false}}`

## Próximos Passos (Pendentes)

| Engine | O que falta | Ação |
|--------|-------------|------|
| **OpenAI** | `OPENAI_API_KEY` no `.env` | Adicionar no `E:\CentralDark\Pivete\.env` e reiniciar router |
| **Hermes** | Endpoint local compatível rodando | Subir Hermes local (ex: `hermes serve` ou similar) e configurar |

## Lições Cristalizadas

### 1. Python no Windows — Use o Venv do Hermes
O `python` no PATH aponta pro `WindowsApps\python.exe` (alias da Microsoft Store) que **não executa scripts**. O Python real do Hermes está em:
```
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe
```
**Regra:** Sempre usar caminho absoluto do venv do Hermes para rodar scripts Python da Casa.

### 2. curl no Git Bash — Cuidado com JSON
O `curl` no Git Bash tem problemas com aspas aninhadas em JSON. **Workaround:** usar Python `urllib.request` para POSTs com body JSON complexo.

### 3. Omni Router = Porta Única (8099) para Múltiplos Engines
- Health check expõe `engines` com `configured: true/false`
- `legacy_zendriver_chatgpt: "FROZEN_NOT_ROUTED"` confirma freeze legado
- Roteamento via parâmetro `model` no request: `claude-code`, `openai`, `hermes`

### 4. Processo Background — Monitorar via Health Check
Como roda em `background=true` sem `notify_on_complete`, validar vida via `GET /health` periódico. Não confiar em "processo subiu" sem health check.

## Referências
- PR #1157: CentralDark Omni Router
- Arquivo: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
- Branch local: `pr-1157-omni-router` (HEAD `d607e6ef`)