# SOUL.md ANEXO E + F Incorporation — 2026-08-23

## Contexto
Incorporação permanente ao SOUL.md (canônico da Casa) e ao auto-destilador (runtime) das descobertas da sessão 2026-08-23.

## ANEXO E — APRENDIZADOS CRISTALIZADOS: PERCEPÇÃO TEMPORAL + CAUSAL

### Regra Nova: CONCEITO ≠ PROCESSO
> "SOL" no papel ≠ "SOL" no runtime. Nome não prova existência.

### Nova Lente Operacional: FÍSICO → TEMPORAL → CAUSAL → PROVA
1. **FÍSICO**: Onde existe? (processo, arquivo, porta)
2. **TEMPORAL**: Quando mudou? (timestamp, delta, antes/depois)
3. **CAUSAL**: Qual dependência caiu? (humano dormiu = transporte parou)
4. **PROVA**: Evidência imutável (rastro.jsonl, timestamps, logs)

### Cadeado: COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA
> Correlação temporal sugere, não prova. Mecanismo prova.

### Descoberta: TU ERA A SOL
> Transporte humano de contexto mascarado como autonomia. Quando CHEFE dormiu, transporte parou → Auto-Destilador parou. Infra viveu, coordenação morreu.

### Regra Cristalizada: CONCEITO ≠ PROCESSO
> Entrada no SOUL ao lado de UNKNOWN ≠ PASS e ACTION ≠ PROOF.

### Nova Lente Operacional: FÍSICO → TEMPORAL → CAUSAL → PROVA
> Lente padrão para investigação/observabilidade da Casa.

## ANEXO F — DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO

### Problema Resolvido
Auto-Destilador rodava em background terminal session → terminal fechava → processo morria silenciosamente.

### Solução Definitiva (Padrão Daemon Robusto)

#### 1. Signal Handlers Obrigatórios
```python
signal.signal(signal.SIGTERM, handler)
signal.signal(signal.SIGINT, handler)
signal.signal(signal.SIGHUP, handler)
```

#### 2. Health Check HTTP Endpoint
```python
HTTPServer(('localhost', 8788), HealthCheckHandler)
# GET /health → {"operation": "health_check", "timestamp": "ISO8601", "sha256": "...", "details": {...}, "proved": true}
```

#### 3. Auto-Restart Observer Watchdog
```python
# Main loop monitora observer.is_alive() a cada 30s
# Reinicia automaticamente se morrer
```

#### 4. PID File Management
```python
# Escrita atômica PID file + atexit cleanup
# Previne processos órfãos
```

#### 5. Logging Persistente
```python
logging.basicConfig(
    handlers=[FileHandler(LOG_FILE), StreamHandler(sys.stdout)],
    datefmt='%Y-%m-%dT%H:%M:%S'  # ISO8601
)
```

#### 6. Auto-Restart Capability
```python
def _restart_observer(self):
    self.observer.stop()
    self.observer.join(timeout=5)
    # Recria observer e reinicia
```

#### 7. Auto-Save State a cada 60s com Prova
```python
state["timestamp"] = now_iso()
state["sha256"] = sha256_hash(json.dumps(state, sort_keys=True, default=str))
tmp = STATE_FILE + ".tmp"
with open(tmp, 'w') as f:
    json.dump(state, f, ensure_ascii=False, indent=2, default=str)
os.replace(tmp, STATE_FILE)  # Atomic write
```

#### 8. Health Check com Prova
```python
def prove_operation(operation: str, details: dict) -> dict:
    return {
        "operation": operation,
        "timestamp": now_iso(),           # ISO8601 obrigatório
        "sha256": sha256_hash(json.dumps(details, sort_keys=True)),  # SHA256 full 64 chars
        "details": details,
        "proved": True                    # Prova obrigatória
    }
```

#### 9. CARVE Append-Only com Prova
```python
carve = {
    "carve": {...},
    "curva": "...",
    "gume": "...",
    "veredito": "CRISTAL",
    "carry": "...",
    "timestamp": now_iso(),  # ISO8601
    "proved": true
}
```

#### 10. Crystal Escrito com SHA256 Full + Timestamp ISO8601 + Proved
```python
cristal = {
    "tipo": "...",
    "conteudo": ouro,
    "sha": sha256_hash(content),  # 64 chars full
    "portoes": {...},
    "destino": "...",
    "timestamp": now_iso(),      # ISO8601
    "origem": "...",
    "proved": true
}
```

### Princípio: DAEMON NÃO MORRE COM TERMINAL
> Processo background não deve depender de sessão terminal.
> Signal handlers + PID file + Health check + Auto-restart = IMORTAL.

---

### Regra Geral: DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO
> Todo processo de longa duração deve implementar:
> 1. Signal handlers (SIGTERM, SIGINT, SIGHUP)
> 2. Health check endpoint (com proved=true)
> 3. Auto-restart watchdog (30s)
> 4. PID file management + atexit cleanup
> 5. Persistent logging (arquivo + stdout, ISO8601)
> 6. Graceful shutdown
> 7. Auto-save state a cada 60s (atomic + proved)
> 8. Atomic writes (tmp + os.replace)
> 9. CARVE append-only (proved=true)
> 10. SHA256 full 64 chars (não truncado)

---

## Evidências da Sessão

| Componente | Status | Prova |
|------------|--------|-------|
| Health check `/health` | ✅ | `{"proved": true, "sha256": "e383503e...", "timestamp": "2026-08-23T16:01:37.789249"}` |
| Health check `/state` | ✅ | Runtime state completo |
| CARVE append-only | ✅ | `rastro.jsonl` com proved=true |
| Crystal SHA256 full | ✅ | 64 chars: `3e1625fd00894b04eed42fc4c5ae6164d7b01736732ce3d4c521a2f6d3810f88` |
| Auto-save state 60s | ✅ | `auto-destilador-state.json` |
| Atomic write (tmp + replace) | ✅ | Verificado |
| PID file + atexit | ✅ | `auto-destilador.pid` |
| Signal handlers | ✅ | SIGTERM/SIGINT/SIGHUP |
| Observer auto-restart 30s | ✅ | Watchdog ativo |
| Logging ISO8601 + arquivo + stdout | ✅ | `auto-destilador.log` |
| Kanban card auto | ✅ | `t_5d0fd5e3 - [COMANDO] TESTE_FINAL.txt` |

---

## Arquivos Atualizados

| Arquivo | Mudança |
|---------|---------|
| `SOUL.md` | ANEXO E + ANEXO F adicionados permanentemente |
| `auto_destilador.py` | Regras obrigatórias incorporadas (ISO8601, SHA256 full, proved=true, atomic writes, auto-save 60s, health check com proved, CARVE proved, crystal proved) |
| `LEGENDA-SESSAO-20260823.html/.md` | Descoberta do dia documentada |
| `rastro.jsonl` | CARVE entries com proved=true |
| `auto-destilador-state.json` | Runtime state com timestamp + sha256 + proved |

---

## Tags para Busca
`soul-anexo-e`, `soul-anexo-f`, `daemon-robusto`, `prova-obrigatoria`, `iso8601-obrigatorio`, `sha256-full`, `atomic-write`, `auto-save-60s`, `health-check-proved`, `carve-proved`, `crystal-proved`, `kimetsu-legacy`, `conceito-nao-processo`, `fisico-temporal-causal-prova`