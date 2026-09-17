#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
casa_boot.py — boot/reancoragem do perfil HERMES-CASA (pivete).

LEI:
  Existe uma SOUL canônica:
    docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md

  O profile local/VPS é somente THIN_EXECUTOR_BRIDGE.
  Não copia identidade/governança/memória.

VPS:
  /root/CentralDark (operacional, pode estar dirty)
    -> scripts/vps/centraldark-deploy.sh --apply --canonical-cache
    -> /var/lib/centraldark/canonical-main (descartável, origin/main)
    -> SOUL + contracts + gates
    -> runtime medido

LOCAL/CI:
  usa o checkout atual por padrão; não força leitura de origin/main.

UNKNOWN != PASS
SOURCE != RUNTIME
"""

import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

HERE = os.path.abspath(os.path.dirname(__file__))
CURRENT_REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
HOME = os.path.expanduser("~")
IS_WINDOWS = os.name == "nt"

DEFAULT_OPERATIONAL_REPO = (
    r"E:\CentralDark\Pivete\CentralDark"
    if IS_WINDOWS
    else "/root/CentralDark"
)
OPERATIONAL_REPO = os.environ.get("CENTRALDARK_REPO_DIR", DEFAULT_OPERATIONAL_REPO)
if not os.path.isdir(os.path.join(OPERATIONAL_REPO, ".git")):
    OPERATIONAL_REPO = CURRENT_REPO

RUNTIME_SURFACE = os.environ.get("CENTRALDARK_RUNTIME_SURFACE", "").strip().upper()
IS_VPS_RUNTIME = (
    RUNTIME_SURFACE == "VPS"
    or os.path.abspath(OPERATIONAL_REPO) == "/root/CentralDark"
)

DEFAULT_PROFILE_DIR = (
    os.path.join(HOME, "AppData", "Local", "hermes", "profiles", "pivete")
    if IS_WINDOWS
    else os.path.join(HOME, ".config", "hermes", "profiles", "pivete")
)
PROFILE_DIR = os.environ.get("HERMES_PROFILE_DIR", DEFAULT_PROFILE_DIR)
PROFILE_SOUL = os.environ.get(
    "HERMES_PROFILE_SOUL",
    os.path.join(PROFILE_DIR, "SOUL.md"),
)

CANONICAL_CACHE_DIR = os.environ.get(
    "CENTRALDARK_CANONICAL_CACHE_DIR",
    "/var/lib/centraldark/canonical-main" if IS_VPS_RUNTIME else CURRENT_REPO,
)
CLONE_CANONICO = CANONICAL_CACHE_DIR if IS_VPS_RUNTIME else CURRENT_REPO
CANONICAL_CACHE_OWNER = os.path.join(
    OPERATIONAL_REPO, "scripts", "vps", "centraldark-deploy.sh"
)

CANONICAL_SOUL_REL = os.path.join(
    "docs", "CONSCIENCIA", "01-IDENTIDADE-E-REGRAS", "SOUL-SOL.md"
)
CANONICAL_SOUL = os.path.join(CLONE_CANONICO, CANONICAL_SOUL_REL)
SOUL_TLC23_BINDING = os.path.join(
    CLONE_CANONICO,
    "docs",
    "CONSCIENCIA",
    "01-IDENTIDADE-E-REGRAS",
    "SOUL-TLC23-RUNTIME-BINDING.yml",
)
CAPABILITY_ROUTER = os.path.join(
    CLONE_CANONICO,
    ".agents",
    "skills",
    "capability-contract-router",
    "scripts",
    "route_capabilities.py",
)
TLC23_RUNTIME_GATE = os.path.join(
    CLONE_CANONICO,
    ".agents",
    "skills",
    "centraldark-operational-method",
    "scripts",
    "tlc23_runtime_gate.py",
)
UNIVERSAL_METHOD_VALIDATOR = os.path.join(
    CLONE_CANONICO,
    "apps",
    "modulos",
    "HERMES-CORE",
    "core",
    "universal-method-contract.mjs",
)

# O profile local não repete a SOUL. Só precisa provar ponte, papel e limite local.
BRIDGE_CONCEPTS = {
    "EXECUTOR_ROLE": [
        "pivete/hermes", "executor_role", "executor", "hermes",
    ],
    "CANONICAL_SOUL_POINTER": [
        "canonical_soul", "soul-sol.md", "canonical_soul_path",
    ],
    "NO_SECOND_SOUL": [
        "no_second_soul", "no second soul", "no_copy", "nao copia", "não copia",
    ],
    "LOCAL_RUNTIME_SCOPE": [
        "local_rules_only", "runtime", "vps", "paths", "tools",
    ],
}


def norm(value):
    return re.sub(r"\s+", "", value).lower()


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
    return any(norm(n) in haystack_norm for n in needles)


def git_rev_parse(repo, ref):
    try:
        cp = subprocess.run(
            ["git", "-C", repo, "rev-parse", "--verify", ref],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except Exception:
        return None
    return cp.stdout.strip() if cp.returncode == 0 else None


def refresh_canonical_cache():
    if not IS_VPS_RUNTIME:
        return {
            "status": "NOT_APPLICABLE",
            "reason": "NON_VPS_USES_CURRENT_CHECKOUT",
            "canonical_root": CLONE_CANONICO,
        }

    if not os.path.isfile(CANONICAL_CACHE_OWNER):
        return {
            "status": "UNKNOWN",
            "reason": "CANONICAL_CACHE_OWNER_MISSING",
            "owner": CANONICAL_CACHE_OWNER,
        }

    env = os.environ.copy()
    env["REPO_DIR"] = OPERATIONAL_REPO
    env["CANONICAL_CACHE_DIR"] = CANONICAL_CACHE_DIR
    try:
        cp = subprocess.run(
            ["bash", CANONICAL_CACHE_OWNER, "--apply", "--canonical-cache"],
            cwd=OPERATIONAL_REPO,
            env=env,
            capture_output=True,
            text=True,
            timeout=150,
            check=False,
        )
    except Exception as exc:
        return {
            "status": "UNKNOWN",
            "reason": "CANONICAL_CACHE_REFRESH_EXCEPTION",
            "error": type(exc).__name__,
        }

    cache_head = git_rev_parse(CANONICAL_CACHE_DIR, "HEAD")
    main_sha = git_rev_parse(OPERATIONAL_REPO, "origin/main")
    ok = (
        cp.returncode == 0
        and cache_head is not None
        and main_sha is not None
        and cache_head == main_sha
    )
    return {
        "status": "OK" if ok else "UNKNOWN",
        "exit_code": cp.returncode,
        "owner": CANONICAL_CACHE_OWNER,
        "canonical_cache_dir": CANONICAL_CACHE_DIR,
        "cache_head": cache_head,
        "origin_main_sha": main_sha,
        "stdout_sha256": hashlib.sha256(
            (cp.stdout or "").encode("utf-8", errors="replace")
        ).hexdigest(),
        "stderr_tail": (cp.stderr or "")[-500:],
    }


def run_capability_router_self_test():
    if not os.path.isfile(CAPABILITY_ROUTER):
        return {
            "status": "UNKNOWN",
            "reason": "CAPABILITY_ROUTER_AUSENTE",
            "path": CAPABILITY_ROUTER,
        }
    try:
        cp = subprocess.run(
            [sys.executable, CAPABILITY_ROUTER, "--self-test"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        payload = json.loads(cp.stdout)
    except Exception as exc:
        return {
            "status": "UNKNOWN",
            "reason": "CAPABILITY_ROUTER_SELF_TEST_INVALID",
            "error": type(exc).__name__,
        }
    return {
        "status": "OK"
        if cp.returncode == 0 and payload.get("status") == "PASS"
        else "DRIFT",
        "exit_code": cp.returncode,
        "self_test": payload,
    }


def run_tlc23_runtime_binding_check():
    if not os.path.isfile(TLC23_RUNTIME_GATE):
        return {
            "status": "UNKNOWN",
            "reason": "TLC23_RUNTIME_GATE_AUSENTE",
            "path": TLC23_RUNTIME_GATE,
        }
    try:
        cp = subprocess.run(
            [sys.executable, TLC23_RUNTIME_GATE, "--binding-check"],
            capture_output=True,
            text=True,
            timeout=20,
            check=False,
        )
        payload = json.loads(cp.stdout)
    except Exception as exc:
        return {
            "status": "UNKNOWN",
            "reason": "TLC23_RUNTIME_GATE_INVALID",
            "error": type(exc).__name__,
        }
    verdict = payload.get("verdict")
    return {
        "status": "OK"
        if cp.returncode == 0 and verdict == "PASS"
        else "UNKNOWN",
        "exit_code": cp.returncode,
        "verdict": verdict,
        "gate": payload,
    }


def run_universal_method_self_test():
    if not os.path.isfile(UNIVERSAL_METHOD_VALIDATOR):
        return {
            "status": "UNKNOWN",
            "reason": "UNIVERSAL_METHOD_VALIDATOR_AUSENTE",
            "path": UNIVERSAL_METHOD_VALIDATOR,
        }
    try:
        cp = subprocess.run(
            ["node", UNIVERSAL_METHOD_VALIDATOR, "--self-test"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except Exception as exc:
        return {
            "status": "UNKNOWN",
            "reason": "UNIVERSAL_METHOD_SELF_TEST_EXCEPTION",
            "error": type(exc).__name__,
        }
    return {
        "status": "OK" if cp.returncode == 0 else "DRIFT",
        "exit_code": cp.returncode,
        "stdout_sha256": hashlib.sha256(
            (cp.stdout or "").encode("utf-8", errors="replace")
        ).hexdigest(),
        "stderr_tail": (cp.stderr or "")[-500:],
    }


def main():
    refresh = refresh_canonical_cache()
    out = {
        "schema": "centraldark.hermes-casa-boot.v2",
        "runtime_surface": "VPS" if IS_VPS_RUNTIME else "LOCAL_OR_CI",
        "operational_repo": OPERATIONAL_REPO,
        "canonical_source_ref": "origin/main" if IS_VPS_RUNTIME else "CURRENT_CHECKOUT",
        "canonical_cache_owner": CANONICAL_CACHE_OWNER,
        "canonical_cache_dir": CANONICAL_CACHE_DIR,
        "canonical_cache_refresh": refresh,
        "profile_dir": PROFILE_DIR,
        "profile_soul": PROFILE_SOUL,
        "canonical_soul": CANONICAL_SOUL,
        "soul_tlc23_binding": SOUL_TLC23_BINDING,
        "status": "UNKNOWN",
        "bridge_missing": [],
        "governance_missing": [],  # compatibilidade com consumidores antigos
        "boot_evidence": [],
    }

    if IS_VPS_RUNTIME and refresh.get("status") != "OK":
        out["boot_evidence"].append("CURRENT_origin_main_NAO_PROVADO")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    out["canonical_present"] = os.path.isfile(CANONICAL_SOUL)
    out["profile_present"] = os.path.isfile(PROFILE_SOUL)
    out["soul_tlc23_binding_present"] = os.path.isfile(SOUL_TLC23_BINDING)

    if not out["canonical_present"]:
        out["boot_evidence"].append("CANONICAL_SOUL_AUSENTE")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return
    if not out["profile_present"]:
        out["boot_evidence"].append("THIN_EXECUTOR_BRIDGE_AUSENTE")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return
    if not out["soul_tlc23_binding_present"]:
        out["boot_evidence"].append("SOUL_TLC23_BINDING_AUSENTE")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    out["canonical_sha256"] = sha256_of(CANONICAL_SOUL)
    out["canonical_mtime"] = mtime_iso(CANONICAL_SOUL)
    out["profile_mtime"] = mtime_iso(PROFILE_SOUL)
    out["canonical_head"] = git_rev_parse(CLONE_CANONICO, "HEAD")
    out["boot_evidence"] += [
        "CANONICAL_SOUL_LIDO",
        "THIN_EXECUTOR_BRIDGE_LIDO",
        "SOUL_TLC23_BINDING_LIDO",
    ]

    profile_norm = norm("\n".join(read_lines(PROFILE_SOUL)))
    missing = [
        concept
        for concept, needles in BRIDGE_CONCEPTS.items()
        if not concept_present(needles, profile_norm)
    ]
    out["bridge_missing"] = missing
    out["governance_missing"] = missing

    router = run_capability_router_self_test()
    tlc23 = run_tlc23_runtime_binding_check()
    universal = run_universal_method_self_test()
    out["capability_router_status"] = router.get("status")
    out["capability_router_self_test"] = router
    out["tlc23_runtime_gate_status"] = tlc23.get("status")
    out["tlc23_runtime_gate_result"] = tlc23
    out["universal_method_status"] = universal.get("status")
    out["universal_method_self_test"] = universal

    if missing:
        out["status"] = "DRIFT"
        out["boot_evidence"].append(
            "THIN_EXECUTOR_BRIDGE_INVALIDO:" + ",".join(missing)
        )
    elif router.get("status") != "OK":
        out["status"] = "UNKNOWN" if router.get("status") == "UNKNOWN" else "DRIFT"
    elif tlc23.get("status") != "OK":
        out["status"] = "UNKNOWN"
    elif universal.get("status") != "OK":
        out["status"] = (
            "UNKNOWN" if universal.get("status") == "UNKNOWN" else "DRIFT"
        )
    else:
        out["status"] = "OK"
        out["boot_evidence"] += [
            "PROFILE_IS_THIN_EXECUTOR_BRIDGE",
            "CAPABILITY_ROUTER_BOOT_ENFORCED",
            "TLC23_HORN_RUNTIME_GATE_ENFORCED",
            "UNIVERSAL_METHOD_GATE_ENFORCED",
        ]

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
