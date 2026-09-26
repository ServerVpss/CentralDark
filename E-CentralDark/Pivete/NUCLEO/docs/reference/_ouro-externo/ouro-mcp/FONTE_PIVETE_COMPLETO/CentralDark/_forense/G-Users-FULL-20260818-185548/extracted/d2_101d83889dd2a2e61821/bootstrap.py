#!/usr/bin/env python3
import json, os, subprocess, sys, hashlib, re
from pathlib import Path
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
MISSION = HERE / "mission.json"
MASTER = HERE / "CENTRALDARK-EXECUTOR.md"

def run(cmd, cwd=None):
    try:
        p = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, timeout=15)
        return {"code": p.returncode, "out": p.stdout.strip(), "err": p.stderr.strip()}
    except Exception as e:
        return {"code": 999, "out": "", "err": repr(e)}

def sanitize_remote(s):
    # remove credentials from URL-like remotes
    s = re.sub(r"(https?://)[^/@\s]+@", r"\1***@", s)
    s = re.sub(r"(://)[^/@\s]+@", r"\1***@", s)
    return s

def find_repo():
    env = os.environ.get("CENTRALDARK_REPO")
    candidates = []
    if env:
        candidates.append(Path(env))
    candidates += [Path.cwd(), *Path.cwd().parents]
    for p in [
        Path("/workspace/CentralDark"),
        Path("/workspaces/CentralDark"),
        Path("/repo/CentralDark"),
        Path("/root/CentralDark"),
        Path("/mnt/e/CentralDark/Pivete/CentralDark-main"),
        Path("/mnt/e/CentralDark"),
    ]:
        candidates.append(p)
    seen = set()
    for c in candidates:
        try:
            c = c.resolve()
        except Exception:
            continue
        if str(c) in seen:
            continue
        seen.add(str(c))
        if not c.exists():
            continue
        r = run(["git","rev-parse","--show-toplevel"], cwd=c)
        if r["code"] == 0 and r["out"]:
            return Path(r["out"])
    return None

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1024*1024), b""):
            h.update(b)
    return h.hexdigest()

def main():
    if not MISSION.exists() or not MASTER.exists():
        print("STATUS=BLOCKED_PACKAGE_INCOMPLETE")
        return 2

    mission = json.loads(MISSION.read_text(encoding="utf-8"))
    repo = find_repo()

    state = {
        "schema": "centraldark.executor.boot.v1",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "package": {
            "mission_sha256": sha256(MISSION),
            "master_sha256": sha256(MASTER)
        },
        "repo": None,
        "status": None
    }

    if repo is None:
        state["status"] = "BLOCKED_REPO_NOT_FOUND"
    else:
        branch = run(["git","branch","--show-current"], cwd=repo)
        head = run(["git","rev-parse","HEAD"], cwd=repo)
        status = run(["git","status","--short"], cwd=repo)
        remote = run(["git","remote","-v"], cwd=repo)
        root = run(["git","rev-parse","--show-toplevel"], cwd=repo)
        state["repo"] = {
            "root": root["out"] or str(repo),
            "branch": branch["out"],
            "head": head["out"],
            "dirty": bool(status["out"]),
            "status_short": status["out"].splitlines()[:200],
            "remote_sanitized": sanitize_remote(remote["out"]).splitlines()[:20],
            "agents_md": str(repo/"AGENTS.md") if (repo/"AGENTS.md").exists() else None,
            "leia_me_ia": str(repo/"LEIA-ME-IA.md") if (repo/"LEIA-ME-IA.md").exists() else None
        }
        state["status"] = "BOOT_MEASURED"

    runtime = HERE / ".runtime"
    runtime.mkdir(exist_ok=True)
    boot_path = runtime / "BOOT.json"
    boot_path.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(state, indent=2, ensure_ascii=False))
    print("\nNEXT:")
    print("Leia CENTRALDARK-EXECUTOR.md + mission.json + .runtime/BOOT.json.")
    print("Se repo foi medido, continue imediatamente no estado vivo.")
    print("Pare somente em PASS_COMPROVADO | BLOCKED_REAL | CHEFE_NECESSARIO.")
    return 0 if state["status"] == "BOOT_MEASURED" else 3

if __name__ == "__main__":
    raise SystemExit(main())
