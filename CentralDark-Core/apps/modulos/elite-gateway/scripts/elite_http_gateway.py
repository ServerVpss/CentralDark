#!/usr/bin/env python3
"""
CentralDark Elite HTTP Gateway v2.7 (Zendriver patch)
──────────────────────────────────────────────────────
Melhorias sobre v2.4/v2.5:
  a) POOL: perfil efêmero por sessão (/tmp/chrome-<uuid>)
  b) TTL/kill: SIGTERM → wait 3s → SIGKILL (evita zumbis)
  c) BREAKER por-conta com jitter 30-90s no reset
  d) HEALTH /health: cache 5s, retorna "degraded" se CDP travado
  e) LOGS: flush contínuo + sanitização Bearer/Authorization/JWT
  f) SIGTERM handler: drena fila (503) antes de morrer
"""
import uvicorn
import asyncio
import json
import time
import uuid
import logging
import logging.handlers
import os
import re
import shutil
import signal
import random
import subprocess
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import zendriver as uc
from zendriver import SpecialKeys
from datetime import datetime

# ─── Caminhos ─────────────────────────────────────────────────────────────────

HERMES_DIR     = Path("/root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes")
HERMES_CADEIA  = HERMES_DIR / "cadeia.json"
HERMES_BACKUPS = HERMES_DIR / "cadeia.backups"

ACCOUNTS_FILE = Path("/root/CentralDark/apps/modulos/elite-gateway/config/accounts.json")
CHROME_BIN    = "/usr/bin/google-chrome"
LOG_FILE      = Path("/var/log/centralldark/gateway.log")
LOG_MAX_BYTES = 10 * 1024 * 1024   # 10 MB
LOG_BACKUP    = 5                   # 5 rotações → max 50 MB

# ─── [e] Sanitização de logs ──────────────────────────────────────────────────

# Detecta: Bearer <token>, Authorization: <valor>, JWT (3 segmentos base64)
_SANITIZE_PATTERNS = [
    (re.compile(r'(bearer\s+)[A-Za-z0-9\-_\.=]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(authorization["\s:]+)[^\s",}]+', re.IGNORECASE), r'\1[REDACTED]'),
    # JWT scanner: header.payload.signature
    (re.compile(r'eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+'), '[JWT_REDACTED]'),
]

def _sanitize(text: str) -> str:
    for pattern, repl in _SANITIZE_PATTERNS:
        text = pattern.sub(repl, text)
    return text


# ─── [e] Logging centralizado com flush imediato ──────────────────────────────

LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

class _SanitizedFormatter(logging.Formatter):
    def format(self, record):
        msg = super().format(record)
        return _sanitize(msg)

class _FlushingRotatingFileHandler(logging.handlers.RotatingFileHandler):
    """RotatingFileHandler que força flush após cada emit."""
    def emit(self, record):
        super().emit(record)
        self.flush()

_handler_file   = _FlushingRotatingFileHandler(
    LOG_FILE, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP, encoding="utf-8"
)
_handler_stdout = logging.StreamHandler()

for h in (_handler_file, _handler_stdout):
    h.setFormatter(_SanitizedFormatter("%(message)s"))

logger = logging.getLogger("gateway")
logger.setLevel(logging.DEBUG)
logger.addHandler(_handler_file)
logger.addHandler(_handler_stdout)


def log(level: str, event: str, **fields):
    record = {
        "ts":    time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "level": level,
        "event": event,
        **fields,
    }
    line = _sanitize(json.dumps(record, ensure_ascii=False))
    if level == "ERROR":
        logger.error(line)
    elif level == "WARN":
        logger.warning(line)
    else:
        logger.info(line)


# ─── Carrega contas ───────────────────────────────────────────────────────────

def load_accounts() -> dict:
    if not ACCOUNTS_FILE.exists():
        raise RuntimeError(f"accounts.json não encontrado: {ACCOUNTS_FILE}")
    data = json.loads(ACCOUNTS_FILE.read_text())
    return data.get("accounts", {})


ACCOUNTS = load_accounts()
log("INFO", "gateway_start", version="2.7", contas=len(ACCOUNTS))

_locks: dict[str, asyncio.Lock] = {
    info["profile_dir"]: asyncio.Lock()
    for info in ACCOUNTS.values()
}


def resolve_account(token: str) -> dict:
    account = ACCOUNTS.get(token)
    if not account:
        raise HTTPException(status_code=403, detail="Token inválido")
    return account


# ─── [c] Circuit Breaker por-conta ────────────────────────────────────────────

class _AccountBreaker:
    """
    Per-account circuit breaker.
    Estados: CLOSED (ok) → OPEN (falhou N vezes) → HALF_OPEN (testando)
    Reset com jitter 30-90s para evitar thundering herd.
    """
    MAX_FAILURES  = 3
    JITTER_MIN    = 30
    JITTER_MAX    = 90

    def __init__(self, account_id: str):
        self.account_id  = account_id
        self.failures    = 0
        self.state       = "CLOSED"   # CLOSED | OPEN | HALF_OPEN
        self._reset_at   = 0.0

    def is_open(self) -> bool:
        if self.state == "OPEN":
            if time.time() >= self._reset_at:
                self.state = "HALF_OPEN"
                log("INFO", "breaker_half_open", account=self.account_id)
                return False
            return True
        return False

    def record_success(self):
        if self.state in ("HALF_OPEN", "OPEN"):
            log("INFO", "breaker_closed", account=self.account_id)
        self.failures = 0
        self.state    = "CLOSED"

    def record_failure(self):
        self.failures += 1
        if self.failures >= self.MAX_FAILURES and self.state != "OPEN":
            jitter = random.uniform(self.JITTER_MIN, self.JITTER_MAX)
            self._reset_at = time.time() + jitter
            self.state = "OPEN"
            log("WARN", "breaker_open",
                account=self.account_id,
                failures=self.failures,
                reset_in_s=round(jitter, 1))


# Breakers indexados por account_id
_breakers: dict[str, _AccountBreaker] = {}
for _tok, _info in ACCOUNTS.items():
    _breakers[_info["id"]] = _AccountBreaker(_info["id"])


# ─── [f] SIGTERM handler — drena fila ─────────────────────────────────────────

_shutting_down = False
_pending_requests: list[asyncio.Future] = []

def _on_sigterm(signum, frame):
    global _shutting_down
    _shutting_down = True
    log("WARN", "sigterm_received", pending=len(_pending_requests))
    for fut in list(_pending_requests):
        if not fut.done():
            fut.cancel()
    log("INFO", "sigterm_drain_done")

signal.signal(signal.SIGTERM, _on_sigterm)


# ─── App FastAPI ───────────────────────────────────────────────────────────────

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    # [f] Rejeita novas requisições durante shutdown
    if _shutting_down and request.url.path != "/health":
        return JSONResponse(
            status_code=503,
            content={"error": "gateway_shutting_down", "retry_after": 10}
        )
    req_id = str(uuid.uuid4())[:8]
    t0 = time.time()
    log("INFO", "request_in",
        req_id=req_id,
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else "?",
    )
    response = await call_next(request)
    duration_ms = round((time.time() - t0) * 1000)
    log("INFO", "request_out",
        req_id=req_id,
        status=response.status_code,
        duration_ms=duration_ms,
    )
    return response


# ─── Construção do prompt ──────────────────────────────────────────────────────

def extrair_conversa(body: dict) -> str:
    messages = body.get("messages", [])
    partes = []
    for msg in messages:
        role    = msg.get("role", "user")
        content = msg.get("content", "")
        if isinstance(content, list):
            texto = "\n".join(
                p.get("text", "").strip()
                for p in content
                if isinstance(p, dict) and p.get("type") == "text"
            )
        else:
            texto = str(content)
        texto = texto.strip()
        if not texto:
            continue
        if role == "system":
            partes.append(f"[SYSTEM]\n{texto}")
        elif role == "assistant":
            partes.append(f"[ASSISTANT]\n{texto}")
        else:
            partes.append(f"[USER]\n{texto}")
    return "\n\n---\n\n".join(partes)


# ─── [b] Kill seguro de processos Chrome ──────────────────────────────────────

def _safe_kill_tree(pid: int):
    """SIGTERM na árvore de processos → espera 3s → SIGKILL (evita zumbis)."""
    if not pid:
        return
    try:
        subprocess.run(["pkill", "-TERM", "-P", str(pid)], check=False, timeout=2)
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        time.sleep(3)
        subprocess.run(["pkill", "-KILL", "-P", str(pid)], check=False, timeout=2)
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        log("INFO", "chrome_killed", pid=pid)
    except Exception as e:
        log("WARN", "chrome_kill_warn", pid=pid, error=str(e))


# ─── [a] Perfil efêmero por sessão ────────────────────────────────────────────

def _ephemeral_profile(base_profile_dir: str) -> str:
    """
    Copia o perfil permanente para /tmp/chrome-<uuid> e retorna o caminho.
    O chamador é responsável por deletar após o uso.
    """
    src = Path(base_profile_dir)
    tmp_dir = Path(f"/tmp/chrome-{uuid.uuid4().hex}")
    if src.exists():
        shutil.copytree(str(src), str(tmp_dir), dirs_exist_ok=True)
        log("INFO", "ephemeral_profile_created",
            src=str(src), dst=str(tmp_dir))
    else:
        tmp_dir.mkdir(parents=True, exist_ok=True)
        log("WARN", "ephemeral_profile_empty", src=str(src), dst=str(tmp_dir))
    return str(tmp_dir)


def _cleanup_ephemeral(tmp_dir: str):
    try:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        log("INFO", "ephemeral_profile_deleted", path=tmp_dir)
    except Exception as e:
        log("WARN", "ephemeral_profile_delete_warn", path=tmp_dir, error=str(e))


# ─── Automação Chrome ─────────────────────────────────────────────────────────

async def _chatgpt_request(prompt: str, profile_dir: str, account_id: str, req_id: str = "") -> str:
    # [c] Verifica circuit breaker
    breaker = _breakers.get(account_id)
    if breaker and breaker.is_open():
        raise HTTPException(
            status_code=503,
            detail=f"conta {account_id} em circuit-break, tente em {max(0, int(breaker._reset_at - time.time()))}s"
        )

    lock = _locks[profile_dir]
    async with lock:
        browser     = None
        chrome_pid  = None
        tmp_profile = None  # [a] perfil efêmero
        t0 = time.time()
        try:
            # [a] Cria cópia efêmera do perfil
            tmp_profile = _ephemeral_profile(profile_dir)

            log("INFO", "chrome_start", req_id=req_id, account=account_id,
                ephemeral=tmp_profile)
            browser = await uc.start(
                user_data_dir=tmp_profile,
                browser_executable_path=CHROME_BIN,
                no_sandbox=True,
                headless=True,
            )

            # Captura PID para kill seguro
            try:
                chrome_pid = browser.process.pid if hasattr(browser, "process") else None
            except Exception:
                chrome_pid = None

            page = await browser.get("https://chatgpt.com")
            await asyncio.sleep(5)

            titulo = await page.evaluate("document.title")
            log("INFO", "page_loaded", req_id=req_id, title=titulo[:60])

            if "challenge" in titulo.lower() or "just a moment" in titulo.lower():
                log("ERROR", "cloudflare_block", req_id=req_id, title=titulo)
                raise Exception(f"Cloudflare bloqueou: {titulo}")

            resultado = await page.evaluate(f"""
                (function() {{
                    const el = document.querySelector('div[contenteditable="true"]');
                    if (!el) return 'INPUT_NAO_ENCONTRADO';
                    el.focus();
                    document.execCommand('insertText', false, {json.dumps(prompt)});
                    return 'OK';
                }})()
            """)
            if resultado != "OK":
                log("ERROR", "input_not_found", req_id=req_id, result=resultado)
                raise Exception(f"Input não encontrado: {resultado}")

            log("INFO", "text_injected", req_id=req_id, prompt_chars=len(prompt))
            await asyncio.sleep(0.3)

            input_field = await page.find('div[contenteditable="true"]')
            await input_field.send_keys(SpecialKeys.ENTER)

            # Fase 1: aguarda 'Stop answering' aparecer
            generation_started = False
            for _ in range(15):
                await asyncio.sleep(0.5)
                btns = await page.evaluate("""
                    Array.from(document.querySelectorAll('form button'))
                         .map(b => b.textContent.trim())
                """)
                if any("Stop" in b for b in btns):
                    log("INFO", "generation_started", req_id=req_id)
                    generation_started = True
                    break

            if not generation_started:
                log("WARN", "generation_start_timeout", req_id=req_id)

            # Fase 2: aguarda 'Stop answering' desaparecer
            for t in range(120):
                await asyncio.sleep(1)
                btns = await page.evaluate("""
                    Array.from(document.querySelectorAll('form button'))
                         .map(b => b.textContent.trim())
                """)
                if not any("Stop" in b for b in btns):
                    resposta = await page.evaluate("""
                        (function() {
                            const els = document.querySelectorAll('[data-message-author-role="assistant"]');
                            if (!els.length) return null;
                            return els[els.length - 1].innerText || null;
                        })()
                    """)
                    if resposta and len(resposta.strip()) > 3:
                        duration = round(time.time() - t0, 1)
                        log("INFO", "generation_complete",
                            req_id=req_id, account=account_id,
                            wait_s=t, duration_s=duration,
                            response_chars=len(resposta))
                        if breaker:
                            breaker.record_success()
                        return resposta.strip()

                if t % 20 == 0 and t > 0:
                    log("WARN", "still_waiting", req_id=req_id, elapsed_s=t)

            # Fallback
            resposta = await page.evaluate("""
                (function() {
                    const els = document.querySelectorAll('[data-message-author-role="assistant"]');
                    return els.length ? els[els.length-1].innerText : null;
                })()
            """)
            if resposta:
                log("WARN", "fallback_used", req_id=req_id, response_chars=len(resposta))
                if breaker:
                    breaker.record_success()
                return resposta.strip()

            log("ERROR", "timeout_no_response", req_id=req_id)
            if breaker:
                breaker.record_failure()
            return "Timeout: resposta não detectada em 120s."

        except Exception as e:
            log("ERROR", "chrome_exception", req_id=req_id, error=str(e))
            if breaker:
                breaker.record_failure()
            raise
        finally:
            if browser:
                try:
                    await browser.stop()
                    log("INFO", "chrome_stopped", req_id=req_id)
                except Exception:
                    pass
            # [b] Kill seguro da árvore de processos
            if chrome_pid:
                _safe_kill_tree(chrome_pid)
            # [a] Deleta perfil efêmero
            if tmp_profile:
                _cleanup_ephemeral(tmp_profile)


# ─── Formatação de resposta ───────────────────────────────────────────────────

def _build_response(resposta: str, model: str = "gpt-4o") -> dict:
    return {
        "id":      f"chatcmpl-elite-{int(time.time())}",
        "object":  "chat.completion",
        "created": int(time.time()),
        "model":   model,
        "choices": [{
            "index":         0,
            "message":       {"role": "assistant", "content": resposta},
            "finish_reason": "stop",
        }],
        "usage": {
            "prompt_tokens":     0,
            "completion_tokens": len(resposta.split()),
            "total_tokens":      len(resposta.split()),
        },
    }


def _sse_stream(resposta: str, model: str = "gpt-4o"):
    chunk_id = f"chatcmpl-elite-{int(time.time())}"
    created  = int(time.time())
    yield f"data: {json.dumps({'id': chunk_id, 'object': 'chat.completion.chunk', 'created': created, 'model': model, 'choices': [{'index': 0, 'delta': {'role': 'assistant', 'content': ''}, 'finish_reason': None}]})}\n\n"
    chunk_size = 20
    for i in range(0, len(resposta), chunk_size):
        parte = resposta[i:i + chunk_size]
        yield f"data: {json.dumps({'id': chunk_id, 'object': 'chat.completion.chunk', 'created': created, 'model': model, 'choices': [{'index': 0, 'delta': {'content': parte}, 'finish_reason': None}]})}\n\n"
    yield f"data: {json.dumps({'id': chunk_id, 'object': 'chat.completion.chunk', 'created': created, 'model': model, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
    yield "data: [DONE]\n\n"


# ─── [d] Health check com cache 5s ────────────────────────────────────────────

_health_cache: dict = {"ts": 0.0, "payload": None}
_HEALTH_CACHE_TTL = 5  # segundos

async def _compute_health() -> dict:
    """Testa se o CDP está respondendo via criação de browser efêmero."""
    cdp_ok = False
    try:
        test_dir = f"/tmp/chrome-health-{uuid.uuid4().hex}"
        os.makedirs(test_dir, exist_ok=True)
        # Tenta abrir Chrome + pegar título de about:blank (timeout 10s)
        browser_test = await asyncio.wait_for(
            uc.start(
                user_data_dir=test_dir,
                browser_executable_path=CHROME_BIN,
                no_sandbox=True,
                headless=True,
            ),
            timeout=10
        )
        await asyncio.wait_for(browser_test.get("about:blank"), timeout=5)
        await browser_test.stop()
        shutil.rmtree(test_dir, ignore_errors=True)
        cdp_ok = True
    except Exception as e:
        log("WARN", "health_cdp_fail", error=str(e))

    breaker_states = {
        acc_id: b.state
        for acc_id, b in _breakers.items()
    }
    open_count = sum(1 for s in breaker_states.values() if s == "OPEN")

    return {
        "status":         "ok" if (cdp_ok and open_count == 0) else "degraded",
        "version":        "2.7",
        "cdp":            "ok" if cdp_ok else "degraded",
        "contas":         len(ACCOUNTS),
        "breakers":       breaker_states,
        "open_breakers":  open_count,
        "shutting_down":  _shutting_down,
        "ts":             time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.get("/health")
async def health():
    global _health_cache
    now = time.time()
    if now - _health_cache["ts"] < _HEALTH_CACHE_TTL and _health_cache["payload"]:
        payload = _health_cache["payload"]
    else:
        payload = await _compute_health()
        _health_cache = {"ts": now, "payload": payload}

    status_code = 200 if payload["status"] in ("ok", "degraded") else 503
    return JSONResponse(content=payload, status_code=status_code)


# ─── Endpoints principais ─────────────────────────────────────────────────────

@app.post("/v1/chat/completions")
async def chat(request: Request):
    req_id  = str(uuid.uuid4())[:8]
    auth    = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    account = resolve_account(auth)
    body    = await request.json()
    stream  = body.get("stream", False)
    model   = body.get("model", "gpt-4o")
    prompt  = extrair_conversa(body)

    if not prompt:
        raise HTTPException(status_code=400, detail="Nenhum conteúdo")
    if len(prompt) > 12000:
        prompt = prompt[:12000] + "\n\n[... truncado ...]"

    log("INFO", "chat_request",
        req_id=req_id, account=account["id"],
        model=model, prompt_chars=len(prompt), stream=stream)

    try:
        resposta = await _chatgpt_request(prompt, account["profile_dir"], account["id"], req_id)
    except HTTPException:
        raise
    except Exception as e:
        log("ERROR", "chat_failed", req_id=req_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    log("INFO", "chat_done", req_id=req_id, stream=stream, response_chars=len(resposta))

    if stream:
        return StreamingResponse(
            _sse_stream(resposta, model),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    return _build_response(resposta, model)


@app.get("/v1/models")
async def models():
    return {
        "object": "list",
        "data": [{"id": "gpt-4o", "object": "model", "created": 1700000000, "owned_by": "centralldark"}],
    }


@app.get("/v1/accounts")
async def accounts_list():
    return {
        "accounts": [
            {"id": info["id"], "profile_dir": info["profile_dir"]}
            for info in ACCOUNTS.values()
        ]
    }


@app.get("/v1/logs/tail")
async def logs_tail(lines: int = 50):
    if not LOG_FILE.exists():
        return {"lines": [], "file": str(LOG_FILE)}
    all_lines = LOG_FILE.read_text(encoding="utf-8").splitlines()
    tail = all_lines[-lines:]
    parsed = []
    for l in tail:
        try:
            parsed.append(json.loads(l))
        except Exception:
            parsed.append({"raw": l})
    return {"lines": parsed, "total_in_file": len(all_lines), "file": str(LOG_FILE)}


@app.get("/")
async def root():
    return {
        "status":  "online",
        "gateway": "CentralDark Elite",
        "version": "2.7",
        "contas":  len(ACCOUNTS),
        "ocupado": any(lock.locked() for lock in _locks.values()),
        "log":     str(LOG_FILE),
    }


# ═══════════════════════════════════════════════════════════════
# HERMES — painel de cadeia de modelos
# ═══════════════════════════════════════════════════════════════

def _hermes_auth(request: Request):
    auth  = request.headers.get("authorization", "")
    token = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
    if not token or token not in ACCOUNTS:
        raise HTTPException(status_code=401, detail="Token inválido")
    return ACCOUNTS[token]["id"]


def _hermes_load():
    if not HERMES_CADEIA.exists():
        raise HTTPException(status_code=500, detail="cadeia.json não encontrado")
    try:
        return json.loads(HERMES_CADEIA.read_text(encoding="utf-8"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"cadeia.json inválido: {e}")


def _hermes_backup():
    HERMES_BACKUPS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S")
    dst   = HERMES_BACKUPS / f"{stamp}.json"
    shutil.copy2(HERMES_CADEIA, dst)
    backs = sorted(HERMES_BACKUPS.glob("*.json"), reverse=True)
    for old in backs[5:]:
        try: old.unlink()
        except Exception: pass


@app.get("/hermes/cadeia")
async def hermes_cadeia_get(request: Request):
    _hermes_auth(request)
    return _hermes_load()


@app.put("/hermes/cadeia")
async def hermes_cadeia_put(request: Request):
    _hermes_auth(request)
    body = await request.json()
    nova = body.get("cadeia")
    if not isinstance(nova, list) or not nova:
        raise HTTPException(status_code=400, detail="campo 'cadeia' deve ser lista não-vazia")
    for i, m in enumerate(nova):
        if not isinstance(m, dict) or "modelo" not in m:
            raise HTTPException(status_code=400, detail=f"item {i} inválido")
        m["posicao"]   = i + 1
        m["timeout_s"] = int(m.get("timeout_s", 30))
        m["ativo"]     = bool(m.get("ativo", True))
    atual = _hermes_load()
    _hermes_backup()
    atual["cadeia"]       = nova
    atual["atualizado_em"] = datetime.utcnow().strftime("%Y-%m-%d")
    HERMES_CADEIA.write_text(json.dumps(atual, ensure_ascii=False, indent=2), encoding="utf-8")
    log("INFO", "hermes_cadeia_salva", itens=len(nova))
    return {"ok": True, "itens": len(nova)}


@app.post("/hermes/cadeia/reverter")
async def hermes_cadeia_reverter(request: Request):
    _hermes_auth(request)
    HERMES_BACKUPS.mkdir(parents=True, exist_ok=True)
    backs = sorted(HERMES_BACKUPS.glob("*.json"), reverse=True)
    if not backs:
        raise HTTPException(status_code=404, detail="sem backup pra reverter")
    ultimo = backs[0]
    shutil.copy2(ultimo, HERMES_CADEIA)
    log("INFO", "hermes_cadeia_revertida", backup=ultimo.name)
    return {"ok": True, "revertido_de": ultimo.name}


@app.get("/hermes/cadeia/stats")
async def hermes_cadeia_stats(request: Request):
    _hermes_auth(request)
    missoes_dir = HERMES_DIR / "missoes"
    stats = {}
    if missoes_dir.exists():
        arquivos = sorted(missoes_dir.glob("*.json"))[-100:]
        for f in arquivos:
            try:
                m = json.loads(f.read_text(encoding="utf-8"))
                for etapa in m.get("historico", []):
                    mod = etapa.get("_modelo_usado") or etapa.get("modelo_usado")
                    if not mod: continue
                    s = stats.setdefault(mod, {"ok": 0, "err": 0})
                    s["ok" if etapa.get("ok", True) else "err"] += 1
            except Exception:
                continue
    return {"stats": stats, "amostras": sum(v["ok"] + v["err"] for v in stats.values())}


# ═══════════════════════════════════════════════════════════════
# 🔍 Auditoria MCP
# ═══════════════════════════════════════════════════════════════
AUDIT_DIR = Path(os.environ.get("MCP_AUDIT_DIR", "/root/CentralDark/logs"))


def _audit_files():
    if not AUDIT_DIR.exists():
        return []
    return sorted(AUDIT_DIR.glob("mcp-audit-*.jsonl"))


def _audit_read_tail(arquivo: Path, limit: int):
    linhas = []
    try:
        with arquivo.open("rb") as f:
            f.seek(0, 2)
            tam  = f.tell()
            bloco = 64 * 1024
            buf  = b""
            pos  = tam
            while pos > 0 and len(linhas) <= limit + 50:
                ler  = min(bloco, pos)
                pos -= ler
                f.seek(pos)
                buf    = f.read(ler) + buf
                linhas = buf.split(b"\n")
        registros = []
        for raw in linhas[-(limit + 1):]:
            raw = raw.strip()
            if not raw:
                continue
            try:
                registros.append(json.loads(raw.decode("utf-8", errors="replace")))
            except Exception:
                continue
        return registros[-limit:]
    except Exception:
        return []


@app.get("/hermes/audit/dias")
async def hermes_audit_dias(request: Request):
    _hermes_auth(request)
    dias = []
    for f in _audit_files():
        try:
            dia = f.stem.replace("mcp-audit-", "")
            dias.append({"dia": dia, "bytes": f.stat().st_size})
        except Exception:
            continue
    dias.sort(key=lambda d: d["dia"], reverse=True)
    return {"dias": dias}


@app.get("/hermes/audit")
async def hermes_audit_list(request: Request):
    _hermes_auth(request)
    q   = request.query_params
    dia = q.get("date") or datetime.utcnow().strftime("%Y-%m-%d")
    try:
        limit = min(int(q.get("limit", "200")), 1000)
    except Exception:
        limit = 200
    filtro_status = q.get("status")
    arquivo       = AUDIT_DIR / f"mcp-audit-{dia}.jsonl"
    if not arquivo.exists():
        return {"dia": dia, "itens": [], "total": 0}
    registros = _audit_read_tail(arquivo, limit * 3 if filtro_status else limit)
    if filtro_status:
        registros = [r for r in registros if r.get("status") == filtro_status]
    registros = registros[-limit:]
    registros.reverse()
    return {"dia": dia, "itens": registros, "total": len(registros)}


@app.get("/hermes/audit/stats")
async def hermes_audit_stats(request: Request):
    _hermes_auth(request)
    try:
        dias = min(int(request.query_params.get("dias", "1")), 30)
    except Exception:
        dias = 1
    stats = {"por_status": {}, "por_ferramenta": {}, "por_usuario": {}, "total": 0}
    files = _audit_files()[-dias:]
    for arq in files:
        for r in _audit_read_tail(arq, 5000):
            stats["total"] += 1
            s = r.get("status", "?")
            t = r.get("tool",   "?")
            u = r.get("usuario","?")
            stats["por_status"][s]      = stats["por_status"].get(s, 0) + 1
            stats["por_ferramenta"][t]  = stats["por_ferramenta"].get(t, 0) + 1
            stats["por_usuario"][u]     = stats["por_usuario"].get(u, 0) + 1
    return stats


# ─── Entrypoint ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
