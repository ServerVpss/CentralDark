#!/usr/bin/env python3
import json, os, subprocess, sys, hashlib, re, shutil
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

def find_git_executable():
    candidates = []

    env_git = os.environ.get("GIT_EXE")
    if env_git:
        candidates.append(Path(env_git))

    which_git = shutil.which("git")
    if which_git:
        candidates.append(Path(which_git))

    for env_name in ("ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA", "USERPROFILE"):
        base = os.environ.get(env_name)
        if not base:
            continue
        base = Path(base)
        candidates.extend([
            base / "Git" / "cmd" / "git.exe",
            base / "Git" / "bin" / "git.exe",
            base / "Programs" / "Git" / "cmd" / "git.exe",
            base / "Programs" / "Git" / "bin" / "git.exe",
            base / "scoop" / "apps" / "git" / "current" / "cmd" / "git.exe",
        ])

    seen = set()
    for c in candidates:
        try:
            c = c.expanduser().resolve()
        except Exception:
            continue
        key = str(c).lower()
        if key in seen:
            continue
        seen.add(key)
        if c.is_file():
            return str(c)

    return None

GIT_EXE = find_git_executable()

def run_git(args, cwd=None):
    if not GIT_EXE:
        return {"code": 998, "out": "", "err": "GIT_EXECUTABLE_NOT_FOUND"}
    return run([GIT_EXE, *args], cwd=cwd)

def sanitize_remote(s):
    # remove credentials from URL-like remotes
    s = re.sub(r"(https?://)[^/@\s]+@", r"\1***@", s)
    s = re.sub(r"(://)[^/@\s]+@", r"\1***@", s)
    return s

def has_git_marker(path):
    marker = path / ".git"
    return marker.is_dir() or marker.is_file()

def find_repo():
    env = os.environ.get("CENTRALDARK_REPO")
    candidates = []
    if env:
        candidates.append(Path(env))

    candidates += [Path.cwd(), *Path.cwd().parents]

    # Historical/default candidates. Environment path always has priority.
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
    marker_candidate = None
    marker_probe = None

    for c in candidates:
        try:
            c = c.expanduser().resolve()
        except Exception:
            continue

        key = str(c).lower()
        if key in seen:
            continue
        seen.add(key)

        if not c.exists():
            continue

        # Strong local evidence: explicit .git marker.
        if has_git_marker(c):
            if marker_candidate is None:
                marker_candidate = c

            if GIT_EXE:
                r = run_git(["rev-parse", "--show-toplevel"], cwd=c)
                if r["code"] == 0 and r["out"]:
                    return Path(r["out"]), {
                        "discovery": "git_marker+rev_parse",
                        "candidate": str(c),
                        "git_executable": GIT_EXE,
                        "probe_code": r["code"],
                        "probe_err": r["err"],
                    }
                marker_probe = r
            else:
                return c, {
                    "discovery": "git_marker_only",
                    "candidate": str(c),
                    "git_executable": None,
                    "probe_code": 998,
                    "probe_err": "GIT_EXECUTABLE_NOT_FOUND",
                }

        # Also allow Git itself to discover a repository from a child/ancestor path.
        if GIT_EXE:
            r = run_git(["rev-parse", "--show-toplevel"], cwd=c)
            if r["code"] == 0 and r["out"]:
                return Path(r["out"]), {
                    "discovery": "rev_parse",
                    "candidate": str(c),
                    "git_executable": GIT_EXE,
                    "probe_code": r["code"],
                    "probe_err": r["err"],
                }

    if marker_candidate is not None:
        return marker_candidate, {
            "discovery": "git_marker_but_probe_failed",
            "candidate": str(marker_candidate),
            "git_executable": GIT_EXE,
            "probe_code": marker_probe["code"] if marker_probe else 999,
            "probe_err": marker_probe["err"] if marker_probe else "UNKNOWN_GIT_PROBE_FAILURE",
        }

    return None, {
        "discovery": "not_found",
        "candidate": None,
        "git_executable": GIT_EXE,
        "probe_code": None,
        "probe_err": None,
    }

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

    json.loads(MISSION.read_text(encoding="utf-8"))
    repo, repo_probe = find_repo()

    state = {
        "schema": "centraldark.executor.boot.v1",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "package": {
            "mission_sha256": sha256(MISSION),
            "master_sha256": sha256(MASTER)
        },
        "git": {
            "executable": GIT_EXE,
        },
        "repo_probe": repo_probe,
        "repo": None,
        "status": None
    }

    if repo is None:
        state["status"] = "BLOCKED_REPO_NOT_FOUND"

    elif not GIT_EXE:
        # We proved the repository directory by its .git marker, but cannot
        # safely measure branch/HEAD/dirty state without a real Git executable.
        state["repo"] = {
            "root": str(repo),
            "git_marker": True,
        }
        state["status"] = "BLOCKED_GIT_NOT_FOUND"

    else:
        root = run_git(["rev-parse", "--show-toplevel"], cwd=repo)
        if root["code"] != 0 or not root["out"]:
            state["repo"] = {
                "root": str(repo),
                "git_marker": has_git_marker(repo),
            }
            state["git_probe_error"] = {
                "code": root["code"],
                "stderr": root["err"],
            }
            state["status"] = "BLOCKED_GIT_PROBE_FAILED"
        else:
            repo = Path(root["out"])
            branch = run_git(["branch", "--show-current"], cwd=repo)
            head = run_git(["rev-parse", "HEAD"], cwd=repo)
            status = run_git(["status", "--short"], cwd=repo)
            remote = run_git(["remote", "-v"], cwd=repo)

            state["repo"] = {
                "root": str(repo),
                "branch": branch["out"],
                "head": head["out"],
                "dirty": bool(status["out"]),
                "status_short": status["out"].splitlines()[:200],
                "remote_sanitized": sanitize_remote(remote["out"]).splitlines()[:20],
                "agents_md": str(repo / "AGENTS.md") if (repo / "AGENTS.md").exists() else None,
                "leia_me_ia": str(repo / "LEIA-ME-IA.md") if (repo / "LEIA-ME-IA.md").exists() else None
            }

            required = {
                "branch": branch,
                "head": head,
                "status": status,
                "remote": remote,
            }
            failed = {
                name: {"code": result["code"], "stderr": result["err"]}
                for name, result in required.items()
                if result["code"] != 0
            }

            if failed:
                state["git_measurement_errors"] = failed
                state["status"] = "BLOCKED_GIT_MEASUREMENT_FAILED"
            else:
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
