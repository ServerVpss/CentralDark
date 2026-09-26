#!/usr/bin/env python3
"""
Writer Collision Detection — Verificação rápida de colinearidade de escrita.

Detecta:
  - Autor recente do arquivo (git log)
  - Disco vs HEAD divergência (git diff)
  - Timestamp de modificação do arquivo
  - Disponibilidade de python3 (hook dependency check)
  - Status do hook post-merge
  - Health de Screenpipe (3030) e Omni Router (8099)

Uso:
  python writer_collision_check.py [caminho_do_arquivo]
  padrão: scripts/health_check.sh

Classe: forensic-instrumentation
Intencao: tirar proveito de tools leve antes de assumir writer collision
"""

import subprocess, os, sys

def cmd(c):
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=10)
        return r.stdout.strip(), r.returncode
    except Exception as e:
        return f"ERR:{e}", 1

def probe(url, timeout=5):
    import urllib.request
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status, None
    except Exception as e:
        return None, str(e)[:150]

target = sys.argv[1] if len(sys.argv) > 1 else "scripts/health_check.sh"

print(f"=== WRITER COLLISION CHECK: {target} ===\n")

out, rc = cmd(f"git log --oneline -5 -- {target}")
print(f"1. Últimos commits ({target}):")
print(out if out else "(sem commits para este arquivo)\n")

out, rc = cmd(f"git diff HEAD -- {target}")
print(f"2. Disco vs HEAD (diff):")
print(out if out else "  → Sincronizado (sem diferenças)\n")

out, rc = cmd(f"git status --short -- {target}")
print(f"3. Status git:")
print(out if out else "  → Limpo\n")

out, rc = cmd(f"stat -c '%y' {target} 2>/dev/null || stat -f '%Sm' {target} 2>/dev/null")
print(f"4. Timestamp modificação: {out}\n")

out, rc = cmd("which python3 2>/dev/null || where python3 2>/dev/null || echo 'INDISPONIVEL'")
print(f"5. python3 disponível (hook dependency): {out}\n")

out, rc = cmd("cat .git/hooks/post-merge 2>/dev/null | head -3")
print(f"6. Hook post-merge (primeiras linhas):")
print(out if out else "  → Hook não existe\n")

status, err = probe("http://127.0.0.1:3030/health")
print(f"7. Screenpipe (3030) HTTP: {status or 'ERR:' + err}\n")

status, err = probe("http://127.0.0.1:8099/health")
print(f"8. Omni Router (8099) HTTP: {status or 'ERR:' + err}\n")

print("=== CHECK COMPLETO ===")
