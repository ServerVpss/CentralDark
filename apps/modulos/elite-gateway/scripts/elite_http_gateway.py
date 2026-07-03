#!/usr/bin/env python3
"""
CentralDark Elite HTTP Gateway v2.4
- Multi-contas: token → {id, profile_dir} via accounts.json
- Lock por perfil (um Chrome por conta)
- Suporte a stream:true (SSE) para Cline/Cursor/Open WebUI
- Detecção real de fim de geração via botão 'Stop answering'
- Logging estruturado JSON centralizado em /var/log/centralldark/gateway.log
"""
import uvicorn
import asyncio
import json
import time
import uuid
import logging
import logging.handlers
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
import zendriver as uc
from zendriver import SpecialKeys

ACCOUNTS_FILE = Path("/root/CentralDark/apps/modulos/elite-gateway/config/accounts.json")
CHROME_BIN    = "/usr/bin/google-chrome"
LOG_FILE      = Path("/var/log/centralldark/gateway.log")
LOG_MAX_BYTES = 10 * 1024 * 1024   # 10 MB por arquivo
LOG_BACKUP    = 5                   # 5 rotações → máx 50 MB total


# ─── Logging centralizado ─────────────────────────────────────────────────────

LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

_handler_file = logging.handlers.RotatingFileHandler(
    LOG_FILE, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP, encoding="utf-8"
)
_handler_stdout = logging.StreamHandler()

for h in (_handler_file, _handler_stdout):
    h.setFormatter(logging.Formatter("%(message)s"))

logger = logging.getLogger("gateway")
logger.setLevel(logging.DEBUG)
logger.addHandler(_handler_file)
logger.addHandler(_handler_stdout)


def log(level: str, event: str, **fields):
    record = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "level": level,
        "event": event,
        **fields,
    }
    line = json.dumps(record, ensure_ascii=False)
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
log("INFO", "gateway_start", version="2.4", contas=len(ACCOUNTS))

_locks: dict[str, asyncio.Lock] = {
    info["profile_dir"]: asyncio.Lock()
    for info in ACCOUNTS.values()
}


def resolve_account(token: str) -> dict:
    account = ACCOUNTS.get(token)
    if not account:
        raise HTTPException(status_code=403, detail="Token inválido")
    return account


# ─── Middleware de logging de requisições ─────────────────────────────────────

app = FastAPI()


@app.middleware("http")
async def request_logger(request: Request, call_next):
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
        role = msg.get("role", "user")
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


# ─── Automação Chrome ─────────────────────────────────────────────────────────

async def _chatgpt_request(prompt: str, profile_dir: str, account_id: str, req_id: str = "") -> str:
    lock = _locks[profile_dir]
    async with lock:
        browser = None
        t0 = time.time()
        try:
            log("INFO", "chrome_start", req_id=req_id, account=account_id)
            browser = await uc.start(
                user_data_dir=profile_dir,
                browser_executable_path=CHROME_BIN,
                no_sandbox=True,
                headless=True,
            )
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
                return resposta.strip()

            log("ERROR", "timeout_no_response", req_id=req_id)
            return "Timeout: resposta não detectada em 120s."

        except Exception as e:
            log("ERROR", "chrome_exception", req_id=req_id, error=str(e))
            raise
        finally:
            if browser:
                try:
                    await browser.stop()
                    log("INFO", "chrome_stopped", req_id=req_id)
                except Exception:
                    pass


# ─── Formatação de resposta ───────────────────────────────────────────────────

def _build_response(resposta: str, model: str = "gpt-4o") -> dict:
    return {
        "id": f"chatcmpl-elite-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": resposta},
            "finish_reason": "stop",
        }],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": len(resposta.split()),
            "total_tokens": len(resposta.split()),
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


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/v1/chat/completions")
async def chat(request: Request):
    req_id = str(uuid.uuid4())[:8]
    auth   = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    account = resolve_account(auth)

    body   = await request.json()
    stream = body.get("stream", False)
    model  = body.get("model", "gpt-4o")
    prompt = extrair_conversa(body)

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
    """Lista IDs das contas ativas (sem expor tokens)."""
    return {
        "accounts": [
            {"id": info["id"], "profile_dir": info["profile_dir"]}
            for info in ACCOUNTS.values()
        ]
    }


@app.get("/v1/logs/tail")
async def logs_tail(lines: int = 50):
    """Últimas N linhas do log centralizado (apenas para admin)."""
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
        "status": "online",
        "gateway": "CentralDark Elite",
        "version": "2.4",
        "contas": len(ACCOUNTS),
        "ocupado": any(lock.locked() for lock in _locks.values()),
        "log": str(LOG_FILE),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
