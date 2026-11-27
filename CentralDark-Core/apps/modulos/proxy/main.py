"""Proxy Arsenal — FastAPI unificando os 6 superpoderes. Porta 8083. v1.1"""
import os, time, json, asyncio
from pathlib import Path
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
VERSION = "1.1.0"
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
        with CHAMADAS.open("a") as f:
            f.write(json.dumps(reg, ensure_ascii=False) + "\n")
    except Exception:
        pass

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
        "ok": True, "servico": "arsenal-proxy", "porta": 8083, "poderes": 6,
        "versao": VERSION, "uptime_s": int(time.time() - BOOT_TS),
    }

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
