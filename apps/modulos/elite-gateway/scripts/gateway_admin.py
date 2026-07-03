#!/usr/bin/env python3
"""
CentralDark Elite Gateway — Admin CLI (gateway_admin.py)
========================================================
Ferramenta de criação de contas e manutenção do Elite HTTP Gateway (PM2 60).

Uso:
  gateway_admin.py list                 # lista contas (ids + profile_dir, NUNCA tokens)
  gateway_admin.py health               # saúde do gateway (localhost:8080)
  gateway_admin.py doctor               # diagnóstico completo (contas, perfis, duplicatas, sessão)
  gateway_admin.py add <id>             # cria SLOT de conta: perfil + token + entrada no accounts.json
  gateway_admin.py login <id>           # abre Chrome via noVNC pra LOGAR a conta (passo humano)
  gateway_admin.py test <id>            # manda um prompt de teste pela conta (via localhost)
  gateway_admin.py fix-duplicates       # aponta/corrige ids e profile_dir duplicados

Regras de ouro embutidas:
  - accounts.json SEMPRE recebe backup antes de qualquer escrita.
  - Tokens existentes NUNCA são impressos. Token novo aparece UMA vez, no add.
  - Nunca mexe no perfil/sessão da conta que já funciona.
  - Login é passo humano (ChatGPT exige usuário/senha/2FA) — a ferramenta só prepara o Chrome.
"""
import sys
import json
import os
import time
import shutil
import secrets
import subprocess
import signal
from pathlib import Path

MODULE   = Path("/root/CentralDark/apps/modulos/elite-gateway")
ACCOUNTS = MODULE / "config" / "accounts.json"
PROFILES = Path("/root/CentralDark/contas/profiles")
CHROME   = "/usr/bin/google-chrome"
GATEWAY  = "http://127.0.0.1:8080"
VNC_PORT = 5900
NOVNC_PORT = 6080
DISPLAY  = ":99"

C = {"g": "\033[0;32m", "y": "\033[1;33m", "r": "\033[0;31m", "b": "\033[0;36m", "n": "\033[0m"}
def cprint(color, *a): print(C.get(color, ""), *a, C["n"], sep="")


# ── util ──────────────────────────────────────────────────────────────────────
def load() -> dict:
    if not ACCOUNTS.exists():
        return {"accounts": {}}
    return json.loads(ACCOUNTS.read_text())

def backup() -> Path:
    dst = ACCOUNTS.with_suffix(f".json.bak-{int(time.time())}")
    shutil.copy2(ACCOUNTS, dst)
    return dst

def save(data: dict):
    b = backup()
    ACCOUNTS.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    cprint("g", f"✅ accounts.json gravado (backup: {b.name})")

def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


# ── comandos ──────────────────────────────────────────────────────────────────
def cmd_list():
    accs = load().get("accounts", {})
    cprint("b", f"═══ {len(accs)} token(s) registrado(s) ═══")
    for tok, info in accs.items():
        masked = tok[:4] + "…" + tok[-2:] if len(tok) > 8 else "…"
        exists = "🟢" if Path(info.get("profile_dir", "")).exists() else "🔴 (perfil sumiu)"
        print(f"  token {masked}  →  id={info.get('id')}  perfil={info.get('profile_dir')}  {exists}")

def cmd_health():
    r = run(["curl", "-sS", "--max-time", "5", GATEWAY + "/"])
    if r.returncode != 0:
        cprint("r", f"🔴 gateway não respondeu: {r.stderr.strip()[:120]}"); return 1
    try:
        d = json.loads(r.stdout)
        cor = "g" if d.get("status") == "online" else "y"
        cprint(cor, f"🟢 {d.get('gateway')} v{d.get('version')} | contas={d.get('contas')} | ocupado={d.get('ocupado')}")
    except Exception:
        print(r.stdout[:200])
    return 0

def cmd_doctor():
    cprint("b", "═══ DIAGNÓSTICO DO GATEWAY ═══")
    cmd_health()
    accs = load().get("accounts", {})
    ids, dirs = {}, {}
    for tok, info in accs.items():
        ids.setdefault(info.get("id"), []).append(tok)
        dirs.setdefault(info.get("profile_dir"), []).append(tok)
    print()
    cprint("b", "Contas:")
    for _id, toks in ids.items():
        flag = "  ⚠️ ID DUPLICADO" if len(toks) > 1 else ""
        cprint("y" if flag else "g", f"  id={_id}  ({len(toks)} token(s)){flag}")
    for d, toks in dirs.items():
        if len(toks) > 1:
            cprint("y", f"  ⚠️ perfil compartilhado por {len(toks)} tokens: {d}")
        p = Path(d)
        cookies = p / "Default" / "Cookies"
        if not p.exists():
            cprint("r", f"  🔴 perfil não existe: {d}")
        elif not cookies.exists():
            cprint("y", f"  🟡 perfil sem sessão (sem Cookies) — precisa login: {d}")
        else:
            age_h = (time.time() - cookies.stat().st_mtime) / 3600
            cor = "g" if age_h < 24 * 20 else "y"
            cprint(cor, f"  🟢 perfil com sessão: {p.name} (cookies tocados há {age_h:.0f}h)")
    print()
    cprint("b", "Zentinel (vigia de latência):")
    z = run(["pm2", "jlist"])
    try:
        procs = json.loads(z.stdout)
        zt = [p for p in procs if "zentinel" in p["name"].lower()]
        for p in zt:
            cprint("g" if p["pm2_env"]["status"] == "online" else "r",
                   f"  {p['name']} — {p['pm2_env']['status']}")
    except Exception:
        cprint("y", "  (não consegui ler pm2)")
    return 0

def cmd_add(new_id: str):
    if not new_id or not new_id.replace("_", "").replace("-", "").isalnum():
        cprint("r", "id inválido — use letras/números/_/- (ex.: conta_02)"); return 1
    data = load()
    accs = data.setdefault("accounts", {})
    if any(i.get("id") == new_id for i in accs.values()):
        cprint("r", f"já existe conta com id '{new_id}'. Escolha outro."); return 1

    profile_dir = str(PROFILES / new_id)
    Path(profile_dir).mkdir(parents=True, exist_ok=True)
    token = "sk-elite-" + secrets.token_urlsafe(24)
    accs[token] = {"id": new_id, "profile_dir": profile_dir}
    save(data)

    cprint("g", f"\n✅ SLOT criado: id={new_id}")
    print(f"   perfil: {profile_dir} (vazio — precisa login)")
    cprint("y", "\n🔑 TOKEN (aparece UMA vez — guarde já):")
    print(f"   {token}")
    cprint("b", f"\n▶ Próximo passo (login humano):")
    print(f"   gateway_admin.py login {new_id}")
    print(f"   depois:  pm2 restart CentralDark-EliteHTTP && pm2 save")
    return 0

def cmd_login(target_id: str):
    data = load().get("accounts", {})
    info = next((i for i in data.values() if i.get("id") == target_id), None)
    if not info:
        cprint("r", f"id '{target_id}' não existe. Rode: gateway_admin.py add {target_id}"); return 1
    profile = info["profile_dir"]

    cprint("b", f"═══ LOGIN da conta {target_id} via noVNC ═══")
    cprint("y", "⚠️ Este é o passo HUMANO: você vai logar no ChatGPT com seu usuário/senha/2FA.")
    print(f"   perfil alvo: {profile}\n")

    env = dict(os.environ, DISPLAY=DISPLAY)
    # 1) Xvfb (tela virtual)
    subprocess.Popen(["Xvfb", DISPLAY, "-screen", "0", "1280x800x24"],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    # 2) Chrome no perfil, apontando pro login
    subprocess.Popen([CHROME, f"--user-data-dir={profile}", "--no-sandbox",
                      "--no-first-run", "--start-maximized", "https://chatgpt.com/auth/login"],
                     env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    # 3) x11vnc + websockify (noVNC no navegador)
    subprocess.Popen(["x11vnc", "-display", DISPLAY, "-nopw", "-forever", "-shared", "-rfbport", str(VNC_PORT)],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.Popen(["websockify", "--web", "/usr/share/novnc", str(NOVNC_PORT), f"localhost:{VNC_PORT}"],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    ip = run(["curl", "-s", "--max-time", "5", "ifconfig.me"]).stdout.strip() or "SEU_IP"
    cprint("g", "\n🟢 Ambiente de login no ar. Conecte por UM destes:")
    print(f"   • noVNC (navegador):  http://{ip}:{NOVNC_PORT}/vnc.html")
    print(f"   • VNC client:         {ip}:{VNC_PORT}")
    cprint("y", "\nDepois de logar e ver a tela do ChatGPT carregada:")
    print(f"   1) feche o Chrome pela janela (a sessão fica salva no perfil)")
    print(f"   2) mate o ambiente:  gateway_admin.py login-stop")
    print(f"   3) ative a conta:    pm2 restart CentralDark-EliteHTTP && pm2 save")
    print(f"   4) valide:           gateway_admin.py test {target_id}")
    return 0

def cmd_login_stop():
    for proc in ("websockify", "x11vnc", "Xvfb"):
        run(["pkill", "-f", proc])
    run(["pkill", "-f", "chatgpt.com/auth/login"])
    cprint("g", "🧹 ambiente de login encerrado (Xvfb/x11vnc/websockify/Chrome-login).")
    return 0

def cmd_test(target_id: str):
    accs = load().get("accounts", {})
    token = next((t for t, i in accs.items() if i.get("id") == target_id), None)
    if not token:
        cprint("r", f"id '{target_id}' não existe."); return 1
    cprint("b", f"═══ teste da conta {target_id} (localhost) ═══")
    payload = json.dumps({"model": "gpt-4o", "messages": [{"role": "user", "content": "responda apenas: pong"}]})
    r = run(["curl", "-sS", "--max-time", "120", "-X", "POST", GATEWAY + "/v1/chat/completions",
             "-H", f"Authorization: Bearer {token}", "-H", "Content-Type: application/json", "-d", payload])
    if r.returncode != 0:
        cprint("r", f"🔴 falhou: {r.stderr.strip()[:160]}"); return 1
    try:
        d = json.loads(r.stdout)
        content = d["choices"][0]["message"]["content"]
        cprint("g", f"🟢 resposta: {content[:120]}")
    except Exception:
        cprint("y", f"resposta crua: {r.stdout[:200]}")
    return 0

def cmd_fix_duplicates():
    data = load()
    accs = data.get("accounts", {})
    ids = {}
    for tok, info in accs.items():
        ids.setdefault(info.get("id"), []).append(tok)
    dups = {i: t for i, t in ids.items() if len(t) > 1}
    if not dups:
        cprint("g", "🟢 nenhum id duplicado."); return 0
    cprint("y", "⚠️ ids duplicados encontrados:")
    for _id, toks in dups.items():
        print(f"   id={_id}: {len(toks)} tokens")
    cprint("b", "\nEsta é uma correção manual segura: renomeie os ids no accounts.json")
    print("   (ex.: conta_padrao → conta_padrao / conta_02) e aponte perfis distintos.")
    print("   NÃO faço a renomeação sozinho pra não quebrar tokens em uso. Backup: gateway_admin.py list")
    return 0


CMDS = {
    "list": cmd_list, "health": cmd_health, "doctor": cmd_doctor,
    "add": cmd_add, "login": cmd_login, "login-stop": cmd_login_stop,
    "test": cmd_test, "fix-duplicates": cmd_fix_duplicates,
}

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in CMDS:
        print(__doc__); return 1
    cmd = sys.argv[1]
    args = sys.argv[2:]
    fn = CMDS[cmd]
    return fn(*args) if args else fn()

if __name__ == "__main__":
    sys.exit(main() or 0)
