# DAEMON ROBUSTO — REGRAS OBRIGATÓRIAS GRAVADAS NO RUNTIME

> Crystallized 2026-08-23 | Session: CentralDark Handoff 07:00

---

## REGRAS OBRIGATÓRIAS DO SOUL (CARTÃO DE BOOT)

```text
TUDO_COM_DATA_HORA_HASH_PROVA=SIM
DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
SHA256_HASH_PADRAO=OBRIGATORIO
PROVA_OBRIGATORIA_PARA_TUDO=SIM
RUNTIME_GRAVA_AUTOMATICO=SIM
```

---

## IMPLEMENTAÇÃO NO AUTO_DESTILADOR.PY

### 1. DATA/HORA ISO8601 OBRIGATÓRIA
```python
def now_iso() -> str:
    """Retorna timestamp ISO8601 obrigatório"""
    return datetime.now().isoformat()
```

**Uso:** Todos os timestamps usam `now_iso()` → `2026-08-23T15:58:04.976222`

---

### 2. SHA256 HASH COMPLETO OBRIGATÓRIO
```python
def sha256_hash(content: str) -> str:
    """Retorna SHA256 completo (64 chars) obrigatório"""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def sha256_hash_bytes(content: bytes) -> str:
    """Retorna SHA256 de bytes"""
    return hashlib.sha256(content).hexdigest()
```

**Uso:** 
- Crystal: `"sha256": sha256_hash(content)` (64 chars)
- CARVE: `"sha256": sha256_hash(json.dumps(carve, sort_keys=True))`
- Health Check: `"sha256": sha256_hash(json.dumps(details))`
- State: `"sha256": sha256_hash(json.dumps(state))`

---

### 3. PROVA OBRIGATÓRIA PARA TUDO
```python
def prove_operation(operation: str, details: dict) -> dict:
    """Gera registro de prova obrigatório para toda operação"""
    return {
        "operation": operation,
        "timestamp": now_iso(),
        "sha256": sha256_hash(json.dumps(details, sort_keys=True)),
        "details": details,
        "proved": True
    }
```

**Uso:** Health check, get_stats, CARVE, Crystal, State — todos retornam `{"proved": true, "timestamp": "...", "sha256": "..."}`

---

### 4. RUNTIME GRAVA AUTOMATICAMENTE
```python
def save_runtime_state(state: dict) -> None:
    """Salva estado no runtime automaticamente (RUNTIME_GRAVA_AUTOMATICO=SIM)"""
    state["timestamp"] = now_iso()
    state["sha256"] = sha256_hash(json.dumps(state, sort_keys=True, default=str))
    tmp = STATE_FILE + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2, default=str)
    os.replace(tmp, STATE_FILE)

# Auto-save a cada 60 segundos no main loop
if time.time() - last_state_save > 60:
    self._save_state()
    last_state_save = time.time()
```

---

## DAEMON IMORTAL — 6 PILARES

| Pilar | Implementação |
|-------|---------------|
| **Signal Handlers** | `signal.signal(SIGTERM)`, `SIGINT`, `SIGHUP` → graceful shutdown |
| **Health Check** | HTTP `localhost:8788/health` → `operation + timestamp ISO8601 + sha256 + proved` |
| **Auto-Restart Watchdog** | Main loop verifica `observer.is_alive()` a cada 30s → restart automático |
| **PID File + atexit** | `PID_FILE` escrito na init + `atexit.register(_cleanup)` |
| **Logging Persistente** | `FileHandler(LOG_FILE) + StreamHandler(stdout)` |
| **Auto-Save State** | A cada 60s → `auto-destilador-state.json` com timestamp + sha256 + proved |

---

## ESTRUTURA DE PROVA (TODA OPERAÇÃO)

```python
{
  "operation": "health_check|get_stats|crystal_write|carve_emit|state_save",
  "timestamp": "2026-08-23T15:58:04.976222",  # ISO8601
  "sha256": "efa2c3492b8d248a91d029039d2de59a662c5a903d6ff2759652ec6b031faf44",  # 64 chars
  "details": { ... },
  "proved": true
}
```

---

## ESCRITA ATÔMICA COM VERIFICAÇÃO SHA

```python
# Escrita atômica
tmp_path = filepath + ".tmp"
with open(tmp_path, 'w', encoding='utf-8') as f:
    f.write(conteudo_final)
os.replace(tmp_path, filepath)

# Verificação de prova pós-escrita
with open(filepath, 'r', encoding='utf-8') as f:
    written = f.read()
written_hash = sha256_hash(written)
logger.info(f"Escrito: {filepath} | SHA: {written_hash[:16]} | Prova: OK")
```

---

## CARVE APPEND-ONLY COM PROVA

```python
carve = {
    "carve": {...},
    "timestamp": now_iso(),
    "sha256": sha256_hash(json.dumps(cristal, sort_keys=True)),
    "proved": True
}

with open(rastro_file, 'a', encoding='utf-8') as f:
    f.write(json.dumps(carve, ensure_ascii=False) + "\n")
```

---

## HEALTH CHECK RESPONSE

```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T15:59:01.666052",
  "sha256": "14373d25d41bfac4f0ceefb6742e6a40b8f62a23432d1b13069a3a18107456a4",
  "details": {
    "service": "auto-destilador",
    "watcher_active": true,
    "pending_files": 0,
    "uptime_seconds": 93.23,
    "pid": 37908
  },
  "proved": true
}
```

---

## CRYSTAL ESCRITO NO NUCLEO

```markdown
# COMANDO - TESTE_PROVA_OBRIGATORIA.txt
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\TESTE_PROVA_OBRIGATORIA.txt
**SHA:** b1b68e7dc33d055d
**Timestamp:** 2026-08-23T15:58:04.976222
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}
**Proved:** true
```

---

## RUNTIME STATE AUTO-SAVE

```json
{
  "running": true,
  "uptime_seconds": 60.08,
  "processed_count": 0,
  "error_count": 0,
  "pending_files": [],
  "watcher_active": true,
  "pid": 37908,
  "last_save": "2026-08-23T15:58:28.455911",
  "timestamp": "2026-08-23T15:58:28.455911",
  "sha256": "d43f5f7bfe7ded2e22aa020ec7a8d44f539ee05e630939c2f017070f83b61724"
}
```

---

## PITFALLS RESOLVIDOS (2026-08-23)

| Pitfall | Sintoma | Correção Definitiva |
|---------|---------|---------------------|
| **Daemon morre com terminal** | Background process morre ao fechar terminal | Signal handlers (SIGTERM/SIGINT/SIGHUP) + PID file + Health check + Auto-restart = IMORTAL |
| **Sem health check** | Impossível saber se daemon vivo | HTTP endpoint `/health` porta 8788 com prova |
| **Observer morre silencioso** | Processamento para sem erro | Watchdog 30s + auto-restart automático |
| **Logs perdidos** | Fechar terminal = logs perdidos | `FileHandler + StreamHandler` |
| **Estado não salvo** | Reinício perde contexto | Auto-save a cada 60s com timestamp + sha256 + proved |
| **Escrita sem verificação** | Arquivo corrompido/sem prova | Escrita atômica (`os.replace`) + SHA verification pós-escrita |
| **CARVE sem prova** | Rastro não verificável | Append-only + `proved: true` + sha256 do próprio CARVE |
| **Estado não persistido** | Perda total em crash | State file JSON com auto-save 60s + atomic write |

---

## COMANDOS DE VERIFICAÇÃO

```bash
# Health check
curl http://localhost:8788/health

# Runtime state
curl http://localhost:8788/state

# Rastro CARVE
tail -5 /e/CentralDark/Pivete/NUCLEO/rastro/rastro.jsonl

# State file
cat /e/CentralDark/Pivete/NUCLEO/auto-destilador-state.json

# Logs
tail -f /e/CentralDark/Pivete/NUCLEO/auto-destilador.log

# Crystal escrito
cat /e/CentralDark/Pivete/NUCLEO/commands/TESTE_PROVA_OBRIGATORIA.md
```

---

## REFERÊNCIA RÁPIDA — FUNÇÕES OBRIGATÓRIAS

| Função | Propósito | Retorno |
|--------|-----------|---------|
| `now_iso()` | Timestamp ISO8601 | `"2026-08-23T15:58:04.976222"` |
| `sha256_hash(content)` | SHA256 completo (64 chars) | `"efa2c3492b8d248a..."` |
| `sha256_hash_bytes(bytes)` | SHA256 de bytes | `"..."` |
| `prove_operation(op, details)` | Gera prova padrão | `{"operation": "...", "timestamp": "...", "sha256": "...", "details": {...}, "proved": true}` |
| `save_runtime_state(state)` | Salva estado atomicamente | Escreve `auto-destilador-state.json` |
| `load_runtime_state()` | Carrega estado | Retorna dict ou `{}` |

---

**GRAVADO NO RUNTIME — TUDO COM DATA, HORA, HASH E PROVA** 💾🔒💎

*Este documento é referência técnica para reproduzir o padrão daemon robusto em qualquer componente da CentralDark.*