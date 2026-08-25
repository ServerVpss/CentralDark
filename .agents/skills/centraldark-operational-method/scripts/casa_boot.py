#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
casa_boot.py — Harness de boot LOCAL do perfil HERMES-CASA (pivete).

PROPOSITO:
  Amarrar o boot do perfil a um reload/reconcile do canônico LOCAL da Casa,
  SEM copiar a SOUL-SOL para dentro do perfil.

NAO COPIA: o script apenas:
  - localiza o SOUL-SOL canônico local (repo CentralDark);
  - mede mtime/sha256;
  - localiza o SOUL do perfil (este arquivo vive no mesmo dir);
  - verifica PRESENCA DE CONCEITO de governanca (nao linha literal) no perfil;
  - executa o self-test da capability-contract-router obrigatoria;
  - imprime relatorio + STATUS para o runtime consumir (stdout).

FORA DE ESCOPO (noremoto): nao toca origin/remoto. Trabalha com o estado
local do clone CentralDark montado em E:/CentralDark/Pivete/CentralDark.

SAIDA:
  JSON compacto em stdout com:
    canonical_soul, profile_soul, canonical_sha256, canonical_mtime,
    profile_mtime, governance_missing (conceitos ausentes),
    capability_router_status, capability_router_self_test,
    status (OK | DRIFT | UNKNOWN), boot_evidence.

USO:
  uv run python casa_boot.py
"""

import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

# ---- Caminhos (locais, noremoto) -------------------------------------------
HOME = os.path.expanduser("~")
PROFILE_DIR = os.path.join(HOME, "AppData", "Local", "hermes", "profiles", "pivete")
PROFILE_SOUL = os.path.join(PROFILE_DIR, "SOUL.md")

CASA_ROOT = r"E:\CentralDark\Pivete"
CLONE_CANONICO = os.path.join(CASA_ROOT, "CentralDark")
CANONICAL_SOUL = os.path.join(
    CLONE_CANONICO, "docs", "CONSCIENCIA", "01-IDENTIDADE-E-REGRAS", "SOUL-SOL.md"
)
CAPABILITY_ROUTER = os.path.join(
    CLONE_CANONICO,
    ".agents",
    "skills",
    "capability-contract-router",
    "scripts",
    "route_capabilities.py",
)

# Conceitos de governanca que o perfil PRECISA refletir. Nao exigimos a linha
# literal do canônico (isso seria copiar); exigimos que o CONCEITO esteja
# presente em linguagem propria do perfil.
GOV_CONCEPTS = {
    "AUTORIDADE_HUMANA": [
        "segredo/chefe", "autoridade final", "autoridade_human", "authority_final",
    ],
    "SOL_COORDENA": [
        "coordena", "orquestr", "coordenador",
    ],
    "PIVETE_EXECUTA": [
        "pivete/hermes", "executor", "corpo_operacional", "mordomo",
    ],
    "WRITER_UNICO": [
        "single_writer", "one_writer", "writer_unico", "um_writer", "1_writer",
    ],
    "UNKNOWN_NAO_PASS": [
        "unknown", "nao_pass", "ne_pass", "is_not_pass", "not_pass",
    ],
    "MENOS_E_MAIS": [
        "menos_e_mais", "menos é mais", "menos e mais",
    ],
    "SUBORDINACAO_CANONICA": [
        "canonical_soul", "canonico", "subordinado", "centraldark",
    ],
}


def norm(s):
    return re.sub(r"\s+", "", s).lower()


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def mtime_iso(path):
    ts = os.path.getmtime(path)
    return datetime.datetime.fromtimestamp(ts).isoformat(timespec="seconds")


def read_lines(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read().splitlines()


def concept_present(needles, haystack_norm):
    return any(n in haystack_norm for n in needles)


def run_capability_router_self_test():
    if not os.path.isfile(CAPABILITY_ROUTER):
        return {
            "status": "UNKNOWN",
            "reason": "CAPABILITY_ROUTER_AUSENTE",
            "path": CAPABILITY_ROUTER,
        }

    try:
        completed = subprocess.run(
            [sys.executable, CAPABILITY_ROUTER, "--self-test"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
    except Exception as exc:
        return {
            "status": "UNKNOWN",
            "reason": "CAPABILITY_ROUTER_SELF_TEST_EXCEPTION",
            "error": type(exc).__name__,
        }

    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return {
            "status": "DRIFT",
            "reason": "CAPABILITY_ROUTER_INVALID_JSON",
            "exit_code": completed.returncode,
            "stderr": completed.stderr[-500:],
        }

    return {
        "status": "OK" if completed.returncode == 0 and payload.get("status") == "PASS" else "DRIFT",
        "exit_code": completed.returncode,
        "self_test": payload,
    }


def main():
    out = {
        "profile_dir": PROFILE_DIR,
        "canonical_soul": CANONICAL_SOUL,
        "profile_soul": PROFILE_SOUL,
        "canonical_present": os.path.isfile(CANONICAL_SOUL),
        "profile_present": os.path.isfile(PROFILE_SOUL),
        "capability_router": CAPABILITY_ROUTER,
        "capability_router_present": os.path.isfile(CAPABILITY_ROUTER),
        "status": "UNKNOWN",
        "governance_missing": [],
        "boot_evidence": [],
    }

    if not out["canonical_present"]:
        out["boot_evidence"].append("CANONICAL_SOUL_AUSENTE_NO_DISCO_LOCAL")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    if not out["profile_present"]:
        out["boot_evidence"].append("PROFILE_SOUL_AUSENTE")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    out["canonical_sha256"] = sha256_of(CANONICAL_SOUL)
    out["canonical_mtime"] = mtime_iso(CANONICAL_SOUL)
    out["profile_mtime"] = mtime_iso(PROFILE_SOUL)
    out["boot_evidence"].append("CANONICAL_SOUL_LIDO")
    out["boot_evidence"].append("PROFILE_SOUL_LIDO")

    prof_norm = norm("\n".join(read_lines(PROFILE_SOUL)))

    missing = []
    for concept, needles in GOV_CONCEPTS.items():
        if not concept_present(needles, prof_norm):
            missing.append(concept)
    out["governance_missing"] = missing

    router = run_capability_router_self_test()
    out["capability_router_status"] = router.get("status")
    out["capability_router_self_test"] = router

    if router.get("status") == "OK":
        out["boot_evidence"].append("CAPABILITY_ROUTER_SELF_TEST_PASS")
    elif router.get("status") == "DRIFT":
        out["boot_evidence"].append("CAPABILITY_ROUTER_SELF_TEST_FAIL")
    else:
        out["boot_evidence"].append("CAPABILITY_ROUTER_SELF_TEST_UNKNOWN")

    if missing:
        out["status"] = "DRIFT"
        out["boot_evidence"].append("PERFIL_OMITE_CONCEITO_CANONICO: " + ",".join(missing))
    elif router.get("status") != "OK":
        out["status"] = "DRIFT" if router.get("status") == "DRIFT" else "UNKNOWN"
    else:
        out["status"] = "OK"
        out["boot_evidence"].append("PERFIL_REFLETE_GOVERNANCA_CANONICA")
        out["boot_evidence"].append("CAPABILITY_ROUTER_BOOT_ENFORCED")

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
