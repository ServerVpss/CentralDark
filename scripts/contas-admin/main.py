"""contas-admin — painel secreto pra logar contas na VPS."""
import os, json, secrets, time, pathlib, asyncio, urllib.parse
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import httpx
from novnc_session import SessionManager

BASE_DIR = pathlib.Path(__file__).parent

# Carrega o .env local diretamente — não depender do env_file do PM2
# (instável entre versões; causava "CONTAS_ADMIN_TOKEN ausente" no boot). 28/06/2026
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except Exception:
    pass

CONTAS_DIR = pathlib.Path("/root/CentralDark/contas")
CONTAS_DIR.mkdir(parents=True, exist_ok=True)
(CONTAS_DIR / "oauth").mkdir(exist_ok=True)
(CONTAS_DIR / "profiles").mkdir(exist_ok=True)

TOKEN = os.environ.get("CONTAS_ADMIN_TOKEN", "")
GH_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GH_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")
GOOGLE_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
PUBLIC_BASE = os.environ.get("CONTAS_PUBLIC_BASE", "https://status.centralldark.com")

if not TOKEN:
    raise RuntimeError("CONTAS_ADMIN_TOKEN ausente")

app = FastAPI(title="contas-admin")
sessions = SessionManager(profiles_root=CONTAS_DIR / "profiles")

# estado OAuth em memória (state -> {"provider":..., "created":...})
_oauth_state = {}

def _check_token(req: Request):
    # aceita ?t= ou cookie ou Authorization
    t = req.query_params.get("t") or req.cookies.get("ca_t") or ""
    auth = req.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        t = auth[7:]
    if not secrets.compare_digest(t, TOKEN):
        raise HTTPException(401, "token inválido")
    return True

@app.get("/health")
async def health():
    return {"ok": True, "service": "contas-admin"}

@app.get("/ai-review.html", response_class=HTMLResponse)
async def panel(request: Request):
    # sem token = página falsa
    t = request.query_params.get("t") or request.cookies.get("ca_t") or ""
    if not secrets.compare_digest(t, TOKEN):
        return HTMLResponse("<h1>AI Review</h1><p>Página em manutenção.</p>", status_code=200)
    html = (BASE_DIR / "index.html").read_text(encoding="utf-8")
    resp = HTMLResponse(html.replace("{{TOKEN}}", TOKEN))
    resp.set_cookie("ca_t", TOKEN, max_age=86400, httponly=True, secure=True, samesite="lax")
    return resp

@app.get("/api/contas/listar")
async def listar(_=Depends(_check_token)):
    items = []
    for f in (CONTAS_DIR / "oauth").glob("*.json"):
        try:
            d = json.loads(f.read_text())
            items.append({"tipo": "oauth", "provedor": f.stem, "criado": d.get("created_at"), "user": d.get("user_label")})
        except Exception: pass
    for p in (CONTAS_DIR / "profiles").iterdir():
        if p.is_dir():
            items.append({"tipo": "navegador", "provedor": p.name, "criado": p.stat().st_mtime})
    return {"items": items}

@app.post("/api/sessao/abrir")
async def abrir_sessao(request: Request, _=Depends(_check_token)):
    body = await request.json()
    provedor = body.get("provedor", "generico").lower().strip()
    if not provedor.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(400, "provedor inválido")
    url_inicial = body.get("url", "https://chatgpt.com")
    s = await sessions.start(provedor, url_inicial)
    return s

@app.get("/api/sessao/listar")
async def listar_sessoes(_=Depends(_check_token)):
    return {"items": sessions.list()}

@app.post("/api/sessao/fechar")
async def fechar(request: Request, _=Depends(_check_token)):
    body = await request.json()
    sessions.stop(body["id"])
    return {"ok": True}

# ---- OAuth GitHub ----
@app.get("/api/oauth/github/iniciar")
async def gh_init(request: Request, _=Depends(_check_token)):
    if not GH_ID:
        raise HTTPException(500, "GITHUB_CLIENT_ID não configurado")
    state = secrets.token_urlsafe(24)
    _oauth_state[state] = {"provider": "github", "created": time.time(), "token": TOKEN}
    cb = f"{PUBLIC_BASE}/api/oauth/github/callback"
    params = {"client_id": GH_ID, "redirect_uri": cb, "scope": "read:user user:email repo", "state": state}
    return {"url": f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"}

@app.get("/api/oauth/github/callback")
async def gh_cb(code: str = "", state: str = ""):
    info = _oauth_state.pop(state, None)
    if not info or info["provider"] != "github":
        return HTMLResponse("<h1>Erro</h1><p>state inválido</p>", status_code=400)
    cb = f"{PUBLIC_BASE}/api/oauth/github/callback"
    async with httpx.AsyncClient(timeout=20) as cli:
        r = await cli.post("https://github.com/login/oauth/access_token",
            data={"client_id": GH_ID, "client_secret": GH_SECRET, "code": code, "redirect_uri": cb},
            headers={"Accept": "application/json"})
        tok = r.json()
        if "access_token" not in tok:
            return HTMLResponse(f"<h1>Erro</h1><pre>{json.dumps(tok)}</pre>", status_code=400)
        u = await cli.get("https://api.github.com/user",
            headers={"Authorization": f"Bearer {tok['access_token']}"})
        user = u.json()
    payload = {"provider": "github", "created_at": int(time.time()),
               "user_label": user.get("login"), "user": user, "token": tok}
    out = CONTAS_DIR / "oauth" / "github.json"
    out.write_text(json.dumps(payload, indent=2))
    os.chmod(out, 0o600)
    return HTMLResponse(f"<h1>✅ GitHub conectado</h1><p>Usuário: <b>{user.get('login')}</b></p><p>Token salvo em <code>{out}</code></p><script>setTimeout(()=>window.close(),2000)</script>")

# ---- OAuth Google ----
@app.get("/api/oauth/google/iniciar")
async def g_init(request: Request, _=Depends(_check_token)):
    if not GOOGLE_ID:
        raise HTTPException(400, "GOOGLE_CLIENT_ID ainda não configurado — adicione o secret na VPS")
    state = secrets.token_urlsafe(24)
    _oauth_state[state] = {"provider": "google", "created": time.time()}
    cb = f"{PUBLIC_BASE}/api/oauth/google/callback"
    params = {"client_id": GOOGLE_ID, "redirect_uri": cb, "response_type": "code",
              "scope": "openid email profile", "access_type": "offline", "prompt": "consent", "state": state}
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"}

@app.get("/api/oauth/google/callback")
async def g_cb(code: str = "", state: str = ""):
    info = _oauth_state.pop(state, None)
    if not info or info["provider"] != "google":
        return HTMLResponse("<h1>Erro</h1><p>state inválido</p>", status_code=400)
    cb = f"{PUBLIC_BASE}/api/oauth/google/callback"
    async with httpx.AsyncClient(timeout=20) as cli:
        r = await cli.post("https://oauth2.googleapis.com/token",
            data={"client_id": GOOGLE_ID, "client_secret": GOOGLE_SECRET,
                  "code": code, "redirect_uri": cb, "grant_type": "authorization_code"})
        tok = r.json()
        if "access_token" not in tok:
            return HTMLResponse(f"<h1>Erro</h1><pre>{json.dumps(tok)}</pre>", status_code=400)
        u = await cli.get("https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {tok['access_token']}"})
        user = u.json()
    payload = {"provider": "google", "created_at": int(time.time()),
               "user_label": user.get("email"), "user": user, "token": tok}
    out = CONTAS_DIR / "oauth" / "google.json"
    out.write_text(json.dumps(payload, indent=2))
    os.chmod(out, 0o600)
    return HTMLResponse(f"<h1>✅ Google conectado</h1><p>{user.get('email')}</p><script>setTimeout(()=>window.close(),2000)</script>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9400, log_level="info")
