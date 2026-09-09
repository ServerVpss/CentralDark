"""Proxy Arsenal — FastAPI unificando capacidades existentes. Porta 8083. v1.2"""
import os, time, json, asyncio
from pathlib import Path
from urllib import request as urlrequest, error as urlerror
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from neural_router import rotear, MODELOS
from swarm import swarm as swarm_call
from chain_reaction import rodar as chain_rodar
from dark_intel import inspecionar, snapshot as intel_snapshot
from synthetic import gerar as synth_gerar
from self_evolve import avaliar, salvar_aprendizado

UPSTREAM = os.getenv("ARSENAL_UPSTREAM", "http://127.0.0.1:8082/v1/messages")
UPSTREAM_KEY = os.getenv("ARSENAL_UPSTREAM_KEY", "")
PROVIDER_ADMIN_URL = os.getenv(
    "CENTRALDARK_PROVIDER_ADMIN_URL",
    "http://127.0.0.1:9100/admin/provider",
).rstrip("/")
PROVIDER_BEARER_FILE = os.getenv("CENTRALDARK_PROVIDER_BEARER_FILE", "").strip()
PROVIDER_MUTATION_ENABLED = os.getenv(
    "CENTRALDARK_FASTAPI_PROVIDER_MUTATION_ENABLED", "false"
).strip().lower() == "true"
VERSION = "1.2.0"
BOOT_TS = time.time()

BASE = Path(__file__).parent
CHAMADAS = BASE / "logs/chamadas.jsonl"
CHAMADAS.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="CentralDark Arsenal Proxy", version=VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- cache simples em memória para intel/stats (evita hammer do painel a cada 15s) ----
_CACHE = {}
_CACHE_TTL = {"intel": 5, "stats": 15, "neural": 30}
_STATS_APP = {"requests": 0, "erros": 0, "por_rota": {}}

def _cache_get(k):
    v = _CACHE.get(k)
    if v and time.time() < v[0]:
        return v[1]
    return None

def _cache_set(k, val, ttl):
    _CACHE[k] = (time.time() + ttl, val)

def _log_chamada(reg: dict) -> None:
    try:
        with CHAMADAS.open("a", encoding="utf-8") as f:
            f.write(json.dumps(reg, ensure_ascii=False) + "\n")
    except Exception as exc:
        _STATS_APP["erros"] = _STATS_APP.get("erros", 0) + 1
        print(f"LOG_CHAMADA_ERRO={type(exc).__name__}", flush=True)

def _read_provider_bearer(req: Request) -> str | None:
    """Resolve bearer sem registrar ou devolver o valor.

    Ordem:
    1) Authorization do chamador;
    2) arquivo absoluto apontado por CENTRALDARK_PROVIDER_BEARER_FILE.

    O arquivo permite que CLI/app/VPS compartilhem a mesma autoridade sem
    copiar token para código, GitHub ou receipts.
    """
    header = str(req.headers.get("authorization", "")).strip()
    if header.lower().startswith("bearer ") and len(header) > 12:
        return header
    if not PROVIDER_BEARER_FILE:
        return None
    try:
        path = Path(PROVIDER_BEARER_FILE)
        if not path.is_absolute() or not path.is_file() or path.stat().st_size > 64_000:
            return None
        raw = path.read_text(encoding="utf-8").strip()
        if not raw:
            return None
        return raw if raw.lower().startswith("bearer ") else f"Bearer {raw}"
    except Exception:
        return None

def _provider_call_sync(payload: dict, bearer: str) -> tuple[int, dict]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urlrequest.Request(
        PROVIDER_ADMIN_URL,
        data=data,
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": bearer,
        },
    )
    try:
        with urlrequest.urlopen(req, timeout=20) as resp:
            raw = resp.read(512_000).decode("utf-8", errors="replace")
            parsed = json.loads(raw) if raw else {}
            return int(resp.status), parsed if isinstance(parsed, dict) else {"data": parsed}
    except urlerror.HTTPError as exc:
        raw = exc.read(512_000).decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw) if raw else {}
        except Exception:
            parsed = {"ok": False, "status": f"PROVIDER_ADMIN_HTTP_{exc.code}"}
        return int(exc.code), parsed if isinstance(parsed, dict) else {"data": parsed}
    except Exception as exc:
        return 502, {
            "ok": False,
            "status": "PROVIDER_ADMIN_UNREACHABLE",
            "errorClass": type(exc).__name__,
        }

async def _provider_call(req: Request, payload: dict):
    bearer = _read_provider_bearer(req)
    if not bearer:
        return JSONResponse(
            {"ok": False, "status": "PROVIDER_ADMIN_AUTH_UNAVAILABLE"},
            status_code=401,
        )
    status, body = await asyncio.to_thread(_provider_call_sync, payload, bearer)
    _log_chamada({
        "modo": "provider-control",
        "tool": payload.get("tool"),
        "status": body.get("status"),
        "http": status,
        "ts": int(time.time()),
    })
    return JSONResponse(body, status_code=status)

@app.middleware("http")
async def dark_intel_mw(request: Request, call_next):
    ip = request.client.host if request.client else "?"
    ua = request.headers.get("user-agent", "")
    path = request.url.path
    verdict = inspecionar(ip, path, ua)
    if verdict.get("bloquear"):
        return JSONResponse({"erro": "bloqueado", "motivo": verdict["motivo"]}, status_code=403)
    t0 = time.time()
    _STATS_APP["requests"] += 1
    _STATS_APP["por_rota"][path] = _STATS_APP["por_rota"].get(path, 0) + 1
    try:
        resp = await call_next(request)
    except Exception as e:
        _STATS_APP["erros"] += 1
        return JSONResponse({"erro": "interno", "detalhe": str(e)[:200]}, status_code=500)
    resp.headers["X-Arsenal-Version"] = VERSION
    resp.headers["X-Arsenal-Latency-Ms"] = str(int((time.time() - t0) * 1000))
    return resp

@app.get("/health")
def health():
    return {
        "ok": True, "servico": "arsenal-proxy", "porta": 8083, "poderes": 7,
        "versao": VERSION, "uptime_s": int(time.time() - BOOT_TS),
        "provider_control": {
            "upstream": "configured" if PROVIDER_ADMIN_URL else "missing",
            "bearer_file": "configured" if PROVIDER_BEARER_FILE else "caller_authorization",
            "mutation_transport_enabled": PROVIDER_MUTATION_ENABLED,
        },
    }

@app.get("/arsenal/providers/credentials")
async def provider_credentials(req: Request):
    return await _provider_call(req, {"tool": "provider_credentials_status", "input": {}})

@app.get("/arsenal/providers/capabilities")
async def provider_capabilities(req: Request):
    provider = str(req.query_params.get("provider", "")).strip().lower()
    input_data = {"provider": provider} if provider in {"cloudflare", "contabo"} else {}
    return await _provider_call(req, {"tool": "provider_capabilities", "input": input_data})

@app.post("/arsenal/providers/read")
async def provider_read(req: Request):
    try:
        body = await req.json()
    except Exception:
        body = {}
    safe_input = {
        "provider": body.get("provider"),
        "capability": body.get("capability"),
        "params": body.get("params") if isinstance(body.get("params"), dict) else {},
    }
    return await _provider_call(req, {"tool": "provider_read", "input": safe_input})

@app.post("/arsenal/providers/mutate")
async def provider_mutate(req: Request):
    if not PROVIDER_MUTATION_ENABLED:
        return JSONResponse(
            {
                "ok": False,
                "status": "FASTAPI_PROVIDER_MUTATION_TRANSPORT_DISABLED",
                "observacao": "Ative somente na VPS autorizada; o MCP continua aplicando seus próprios gates de confirmação, idempotência e compensação.",
            },
            status_code=409,
        )
    try:
        body = await req.json()
    except Exception:
        body = {}
    safe_input = {
        "provider": body.get("provider"),
        "capability": body.get("capability"),
        "params": body.get("params") if isinstance(body.get("params"), dict) else {},
        "idempotencyKey": body.get("idempotencyKey"),
    }
    if body.get("expectedAmount") is not None:
        safe_input["expectedAmount"] = body.get("expectedAmount")
    if body.get("currency") is not None:
        safe_input["currency"] = body.get("currency")
    payload = {
        "tool": "provider_mutate",
        "input": safe_input,
        "confirmAdmin": body.get("confirmAdmin"),
    }
    return await _provider_call(req, payload)

@app.post("/arsenal/neural")
async def neural(req: Request):
    try:
        body = await req.json()
    except Exception:
        body = {}
    prompt = body.get("prompt", "") or (
        body.get("messages", [{}])[-1].get("content", "") if body.get("messages") else ""
    )
    key = f"neural:{hash(prompt)}"
    cached = _cache_get(key)
    if cached:
        return cached
    out = {"escolhido": rotear(prompt), "modelos_disponiveis": MODELOS}
    _cache_set(key, out, _CACHE_TTL["neural"])
    return out

@app.post("/arsenal/swarm")
async def swarm_ep(req: Request):
    try:
        body = await req.json()
    except Exception:
        body = {}
    principal = body.get("principal") or "claude-sonnet-4-6"
    fallbacks = body.get("fallbacks") or ["gpt-5-mini", "gemini-2.5-pro", "gemini-flash-latest"]
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01"}
    if UPSTREAM_KEY:
        headers["x-api-key"] = UPSTREAM_KEY
    payload = body.get("payload") or {
        "max_tokens": 128,
        "messages": [{"role": "user", "content": body.get("prompt", "ping")}],
    }
    res = await swarm_call(UPSTREAM, headers, payload, principal, fallbacks)
    _log_chamada({"modo": "swarm", "principal": principal, "vencedor": res.get("modelo"), "ts": int(time.time())})
    return res

@app.post("/arsenal/chain")
async def chain_ep(req: Request):
    try:
        body = await req.json()
    except Exception:
        body = {}
    headers = {"content-type": "application/json", "anthropic-version": "2023-06-01"}
    if UPSTREAM_KEY:
        headers["x-api-key"] = UPSTREAM_KEY
    res = await chain_rodar(UPSTREAM, headers, body.get("prompt", ""), body.get("cadeia"))
    _log_chamada({"modo": "chain", "ok": res.get("ok"), "passos": len(res.get("passos", [])), "ts": int(time.time())})
    return res

@app.get("/arsenal/intel")
def intel_ep():
    cached = _cache_get("intel")
    if cached:
        return cached
    out = intel_snapshot()
    out["app"] = dict(_STATS_APP)
    _cache_set("intel", out, _CACHE_TTL["intel"])
    return out

@app.get("/arsenal/stats")
def stats_ep():
    cached = _cache_get("stats")
    if cached:
        return cached
    out = avaliar()
    out["versao"] = VERSION
    out["uptime_s"] = int(time.time() - BOOT_TS)
    _cache_set("stats", out, _CACHE_TTL["stats"])
    return out

@app.get("/arsenal/synthetic")
def synthetic_ep():
    return synth_gerar()

@app.get("/arsenal/evolve")
def evolve_ep():
    r = avaliar()
    salvar_aprendizado(r)
    return {"ok": True, "ranking": r["ranking"][:5], "amostras": r.get("amostras", 0)}