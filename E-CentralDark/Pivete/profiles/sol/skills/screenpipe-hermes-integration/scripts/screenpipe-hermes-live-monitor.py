#!/usr/bin/env python3
"""
screenpipe-hermes-live-monitor.py
Mede todos os pontos da cadeia Casa em tempo real e reporta placar.
READ_ONLY — não altera nada, só observa.
"""
from __future__ import annotations

import argparse
import subprocess
import time
import os
import sys
from datetime import datetime, timezone

LOG_DIR = os.path.expanduser(
    "~/AppData/Local/Packages/Claude_pzs8sxrjxfjjc/LocalCache/Roaming/Claude/screenpipe-hermes/live"
)
LOG_FILE = os.path.join(LOG_DIR, "live-monitor.log")

CICLO_COMPACTO = 600   # ~10 min
CICLO_LONGO = 1800     # ~30 min

HOSTS = {
    "Screenpipe": ("127.0.0.1", 3030),
    "Omni Router": ("127.0.0.1", 8099),
    "Hermes Desktop": ("127.0.0.1", 8787),
    "Hermes Gateway": ("127.0.0.1", 8080),
}

# ---------------------------------------------------------------------------
def log(msg: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    os.makedirs(LOG_DIR, exist_ok=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass

def curl_head(url: str, timeout_s: int = 8) -> dict:
    """GET simples, retorna codigo e corpo curto."""
    try:
        r = subprocess.run(
            ["curl", "-sS", "-m", str(timeout_s), "-o", "-", "-w", "\n%{http_code}", url],
            capture_output=True, text=True, timeout=timeout_s + 3,
        )
        parts = r.stdout.rsplit("\n", 1)
        body = parts[0].strip() if len(parts) == 2 else ""
        code = parts[1].strip() if len(parts) == 2 else ""
        try:
            code = int(code)
        except ValueError:
            code = 0
        return {"code": code, "body": body[:400], "error": None}
    except (subprocess.TimeoutExpired, FileNotFoundError) as exc:
        return {"code": 0, "body": "", "error": str(exc)}

def verifique_host(nome: str, addr: tuple[str, int]) -> dict:
    host, port = addr
    url = f"http://{host}:{port}/health"
    t0 = time.monotonic()
    res = curl_head(url, timeout_s=7)
    dur_ms = round((time.monotonic() - t0) * 1000)
    codigo = res["code"]
    if codigo in (200, 403):
        return {"status": "🟢", "detalhe": f"HTTP {codigo} em {dur_ms}ms"}
    if codigo == 0:
        return {"status": "🔴", "detalhe": res.get("error") or "sem resposta"}
    return {"status": "🟡", "detalhe": f"HTTP {codigo} em {dur_ms}ms"}

def health_check_local() -> dict:
    """Roda health_check.sh e retorna o placar textual do sistema local."""
    cand1 = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "..", "CentralDark", "Pivete", "CentralDark", "scripts", "health_check.sh",
    )
    cand2 = r"E:\CentralDark\Pivete\CentralDark\scripts\health_check.sh"
    script = os.path.normpath(cand1)
    if not os.path.isfile(script):
        script = os.path.normpath(cand2)
    if not os.path.isfile(script):
        return {"status": "⚪", "detalhe": "health_check.sh não encontrado"}

    # Descobre o bash certo: prioriza o bash nativo do Windows (git-bash/MSYS)
    # que consegue executar tasklist/wmic. O bash do WSL/cygwin falha no execvpe
    # de binários nativos.
    bash_candidates = [
        os.environ.get("HERMES_BASH", ""),
        r"C:\Program Files\Git\usr\bin\bash.exe",
        r"/usr/bin/bash.exe",
        r"/mingw64/bin/bash.exe",
    ]
    bash_path = next((p for p in bash_candidates if p and os.path.isfile(p)), None)
    if not bash_path:
        bash_path = "bash"  # fallback: confia no PATH do ambiente

    cmd = [bash_path, "-c", f'cd "{os.path.dirname(script)}" && bash "{os.path.basename(script)}"']
    try:
        r = subprocess.run(
            cmd,
            capture_output=True, text=True, timeout=40,
            cwd=os.path.dirname(script),
        )
        saida = (r.stdout or "").strip().splitlines()
        primeira = saida[0] if saida else "(sem saída)"
        if r.returncode == 0 and primeira.startswith("🟢"):
            return {"status": "🟢", "detalhe": primeira[:90]}
        if r.returncode == 0 and primeira.startswith("🔴"):
            return {"status": "🟡", "detalhe": primeira[:90]}
        if not primeira or primeira == "(sem saída)":
            return {"status": "🟡", "detalhe": f"health_check.sh sem saída útil (exit {r.returncode})"}
        return {"status": "🟡", "detalhe": f"{primeira[:90]} (exit {r.returncode})"}
    except subprocess.TimeoutExpired:
        return {"status": "🟡", "detalhe": "health_check.sh timeout (>40s)"}
    except Exception as exc:
        return {"status": "🔴", "detalhe": str(exc)[:90]}

def rodar_ciclo_completo() -> str:
    """Mede tudo e retorna relatório de uma linha por serviço + resumo."""
    linhas: list[str] = []
    placar_geral = True

    for nome, addr in HOSTS.items():
        res = verifique_host(nome, addr)
        linhas.append(f"{res['status']} {nome}: {res['detalhe']}")
        if res["status"] != "🟢":
            placar_geral = False

    local = health_check_local()
    linhas.append(f"{local['status']} Hermes-Casa local: {local['detalhe']}")
    if local["status"] != "🟢":
        placar_geral = False

    if placar_geral:
        resumo = "🟢 tudo vivo"
    elif any(l.startswith("🟡") for l in linhas):
        resumo = "🟡 com aviso"
    else:
        resumo = "🔴 algo caiu"
    linhas.append(f"[{resumo}]")
    return "\n".join(linhas)

# ---------------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(
        description="Monitor em tempo real da cadeia Hermex/Casa (READ_ONLY)"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Roda um ciclo único e sai (para cron / teste manual)",
    )
    args = parser.parse_args()

    log("Monitor Hermex/Casa iniciado")
    log(f"LOG={LOG_FILE} | CICLO_COMPACTO={CICLO_COMPACTO}s")

    if args.once:
        relatorio = rodar_ciclo_completo()
        log("=== CICLO ÚNICO ===")
        log(relatorio)
        return 0

    try:
        while True:
            relatorio = rodar_ciclo_completo()
            log("=== CICLO ===")
            log(relatorio)
            time.sleep(CICLO_COMPACTO)
    except KeyboardInterrupt:
        log("Monitor interrompido")
        return 0
    except Exception as exc:
        log(f"Falha fatal no loop: {exc}")
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
