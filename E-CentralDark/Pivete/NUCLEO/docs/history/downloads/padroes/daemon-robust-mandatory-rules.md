# DAEMON ROBUSTO — REGRAS OBRIGATÓRIAS (Padrão 1.0)

## Contexto
Descoberta 2026-08-23: Processos de longa duração (watchdogs, servidores, bridges, adapters) morriam silenciosamente quando o terminal fechava, sem health check, sem auto-restart, sem logging persistente, sem state persistence.

## Regra Cristalizada
Todo processo de longa duração DEVE implementar os 6+ pilares do Daemon Robusto:

| Pilar | Implementação Mínima | Status Auto-Destilador |
|-------|---------------------|------------------------|
| **1. Signal Handlers** | SIGTERM, SIGINT, SIGHUP → graceful shutdown | ✅ |
| **2. Health Check HTTP** | `/health` → `operation + timestamp ISO8601 + sha256 + proved: true` | ✅ |
| **3. Auto-Restart Watchdog** | Loop 30s monitora componentes → restart automático | ✅ |
| **4. PID File + atexit** | PID file atômico + `atexit.register(cleanup)` | ✅ |
| **5. Logging Persistente** | `FileHandler + StreamHandler` com ISO8601 | ✅ |
| **6. Auto-Save State** | Estado salvo a cada 60s com `timestamp + sha256 + proved: true` | ✅ |
| **7. Atomic Writes** | `tmp + os.replace` para atomicidade | ✅ |
| **8. CARVE Append-Only** | `proved=true` obrigatório | ✅ |
| **9. Crystal SHA256 Full** | 64 chars (não truncado) | ✅ |
| **10. Health Check Proved** | `proved=true` obrigatório | ✅ |

---

## Estrutura de Prova Obrigatória (JSON Schema)

```json
{
  "operation": "health_check|crystal_write|carve_emit|state_save|zip_process|pdf_process|image_process",
  "timestamp": "2026-08-23T15:58:04.976222",
  "sha256": "efa2c3492b8d248a91d029039d2de59a662c5a903d6ff2759652ec6b031faf44",
  "details": { },
  "proved": true
}
```

### Campos Obrigatórios:
| Campo | Tipo | Regra |
|-------|------|-------|
| `operation` | string | Enum: health_check, crystal_write, carve_emit, state_save, zip_process, pdf_process, image_process |
| `timestamp` | string | ISO8601 com microsegundos (`YYYY-MM-DDTHH:MM:SS.mmmmmm`) |
| `sha256` | string | 64 chars hex lowercase (não truncado) |
| `details` | object | Detalhes específicos da operação |
| `proved` | boolean | **SEMPRE `true`** — operações sem prova não existem |

---

## Implementação de Referência (Python)

### Utilitários Obrigatórios
```python
import hashlib, json, os
from datetime import datetime

def now_iso() -> str:
    """Timestamp ISO8601 obrigatório com microsegundos"""
    return datetime.now().isoformat()

def sha256_hash(content: str) -> str:
    """SHA256 completo 64 chars lowercase"""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def prove_operation(operation: str, details: dict) -> dict:
    """Gera registro de prova obrigatório para TODA operação"""
    return {
        "operation": operation,
        "timestamp": datetime.now().isoformat(),
        "sha256": hashlib.sha256(json.dumps(details, sort_keys=True).encode()).hexdigest(),
        "details": details,
        "proved": True
    }
```

### Atomic Write + SHA Verification
```python
def atomic_write_with_sha(filepath: str, content: str) -> dict:
    """Escrita atômica com verificação SHA256"""
    tmp = filepath + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(content)
    os.replace(tmp, filepath)  # Atomic
    
    # Verify
    with open(filepath, 'r', encoding='utf-8') as f:
        written = f.read()
    sha = hashlib.sha256(written.encode('utf-8')).hexdigest()
    
    return {"filepath": filepath, "sha256": sha, "verified": True, "timestamp": datetime.now().isoformat()}
```

### Runtime State Auto-Save (60s)
```python
def save_runtime_state(state: dict) -> None:
    """Auto-save com prova"""
    state["timestamp"] = datetime.now().isoformat()
    state["sha256"] = hashlib.sha256(json.dumps(state, sort_keys=True, default=str).encode()).hexdigest()
    tmp = STATE_FILE + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2, default=str)
    os.replace(tmp, STATE_FILE)  # Atomic
```

### Health Check Endpoint com Prova
```python
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            details = {"service": "auto-destilador", "watcher_active": True, "pid": os.getpid()}
            proof = {
                "operation": "health_check",
                "timestamp": datetime.now().isoformat(),
                "sha256": hashlib.sha256(json.dumps(details, sort_keys=True).encode()).hexdigest(),
                "details": details,
                "proved": True
            }
            self.wfile.write(json.dumps(proof).encode())
```

---

## Componentes CentralDark — Compliance Checklist

| Componente | Signal Handlers | Health Check | Auto-Restart | PID File | Logging | Auto-Save | Atomic Write | CARVE Proved | Crystal SHA Full | Health Proved |
|------------|-----------------|--------------|--------------|----------|---------|-----------|--------------|--------------|------------------|---------------|
| Auto-Destilador | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP Server (9100) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hermes WebUI (8787) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kanban Bridge | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Arsenal Adapter (8090) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| OAuth Broker | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Memória API | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Status/Graph Panel | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bot Telegram | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SOL Desktop | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Dependências Python
```bash
pip install watchdog pillow pymupdf pdfplumber PyPDF2
# Todas disponíveis no venv do Hermes Agent
```

---

## Referências
- `references/soul-anexo-e-f-incorporation-20260823.md` — Incorporação SOUL ANEXO E + F
- `references/auto-destilador-pattern.md` — Padrão completo do Auto-Destilador
- `references/debugging-transcript-20260823.md` — Sessão completa com bugs e fixes

---

**Status:** Auto-Destilador = ✅ COMPLIANT (10/10 pilares)
**Próximo:** Aplicar padrão aos demais componentes CentralDark