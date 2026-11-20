#!/usr/bin/env python3
"""
Reality Drift Detector — Monitora divergência realidade vs histórico
Ativa tarefas de reconciliação automaticamente (sem prompt)
"""

import os
import json
import subprocess
import hashlib
import sys
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
DELTA_FILE = REPO_ROOT / "docs" / "DELTAUNIFICADOCENTRALDARK.md"
DETECTOR_STATE = REPO_ROOT / ".agents" / "skills" / "reality-drift-detector" / ".state.json"

def run_cmd(cmd):
    """Execute command, return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return result.stdout.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "", 124

def get_git_head_sha():
    """Get current git HEAD SHA"""
    sha, rc = run_cmd("git rev-parse HEAD 2>/dev/null")
    return sha if rc == 0 else "UNKNOWN"

def get_remote_head_sha():
    """Get origin/main SHA"""
    sha, rc = run_cmd("git rev-parse origin/main 2>/dev/null")
    return sha if rc == 0 else "UNKNOWN"

def get_git_status():
    """Get git status (staged, unstaged, untracked count)"""
    status, rc = run_cmd("git status --short 2>/dev/null")
    if rc != 0:
        return {"staged": 0, "unstaged": 0, "untracked": 0}

    lines = status.split("\n") if status else []
    return {
        "staged": sum(1 for l in lines if l.startswith(("A ", "M ", "D "))),
        "unstaged": sum(1 for l in lines if l.startswith(" M")),
        "untracked": sum(1 for l in lines if l.startswith("??"))
    }

def get_canonical_files_hash():
    """Hash of canonical files (detect modifications)"""
    canonical = [
        REPO_ROOT / "LEIA-ME-IA.md",
        REPO_ROOT / "AGENTS.md",
        REPO_ROOT / "CLAUDE.md",
        REPO_ROOT / "docs" / "CONSCIENCIA" / "01-IDENTIDADE-E-REGRAS" / "SOUL-SOL.md"
    ]

    hashes = {}
    for f in canonical:
        if f.exists():
            with open(f, "rb") as fp:
                hashes[f.name] = hashlib.sha256(fp.read()).hexdigest()[:8]
    return hashes

def load_state():
    """Load last known state"""
    if DETECTOR_STATE.exists():
        with open(DETECTOR_STATE) as f:
            return json.load(f)
    return {}

def save_state(state):
    """Save current state"""
    DETECTOR_STATE.parent.mkdir(parents=True, exist_ok=True)
    with open(DETECTOR_STATE, "w") as f:
        json.dump(state, f, indent=2)

def detect_drift():
    """Detect divergence between reality and historical state"""
    last_state = load_state()
    current_state = {
        "timestamp": datetime.now().isoformat(),
        "git_head": get_git_head_sha(),
        "remote_head": get_remote_head_sha(),
        "git_status": get_git_status(),
        "canonical_hashes": get_canonical_files_hash()
    }

    drifts = []

    # Category 1: Git Drift
    if last_state.get("git_head") and last_state["git_head"] != current_state["git_head"]:
        drifts.append({
            "category": "git",
            "type": "HEAD_DIVERGE",
            "description": f"HEAD changed: {last_state['git_head'][:8]} → {current_state['git_head'][:8]}",
            "severity": "HIGH"
        })

    if last_state.get("remote_head") and last_state["remote_head"] != current_state["remote_head"]:
        drifts.append({
            "category": "git",
            "type": "REMOTE_CHANGED",
            "description": f"origin/main changed: {last_state['remote_head'][:8]} → {current_state['remote_head'][:8]}",
            "severity": "MEDIUM"
        })

    # Category 2: Filesystem Drift
    last_hashes = last_state.get("canonical_hashes", {})
    for fname, new_hash in current_state["canonical_hashes"].items():
        if fname in last_hashes and last_hashes[fname] != new_hash:
            drifts.append({
                "category": "filesystem",
                "type": "CANONICAL_MODIFIED",
                "description": f"Canonical file changed: {fname}",
                "severity": "CRITICAL"
            })

    # Category 3: Git Status Drift
    if last_state.get("git_status"):
        for key in ["staged", "unstaged", "untracked"]:
            if abs(last_state["git_status"].get(key, 0) - current_state["git_status"][key]) > 3:
                drifts.append({
                    "category": "git",
                    "type": f"STATUS_{key.upper()}_CHANGED",
                    "description": f"{key}: {last_state['git_status'][key]} → {current_state['git_status'][key]}",
                    "severity": "MEDIUM"
                })

    save_state(current_state)
    return drifts

def create_reconciliation_task(drifts):
    """Create automatic reconciliation tasks"""
    if not drifts:
        return None

    task_id = f"drift-auto-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    task = {
        "id": task_id,
        "created": datetime.now().isoformat(),
        "type": "reconciliation",
        "drifts": drifts,
        "status": "active",
        "action": "MEASURE → RECONCILIAR → PROVAR",
        "execute": True
    }

    # Log to DELTAUNIFICADOCENTRALDARK.md
    if DELTA_FILE.exists():
        with open(DELTA_FILE, "a") as f:
            f.write(f"\n\n## Auto-Detected Drift — {task_id}\n")
            f.write(f"**Timestamp:** {task['created']}\n")
            for drift in drifts:
                f.write(f"- **{drift['category']}** ({drift['severity']}): {drift['description']}\n")
            f.write(f"**Action:** {task['action']}\n")

    return task

def main():
    """Run detector"""
    print("[Reality Drift Detector] Starting...")

    drifts = detect_drift()

    if drifts:
        print(f"[DRIFT DETECTED] {len(drifts)} divergence(s) found:")
        for drift in drifts:
            print(f"  - {drift['category']}: {drift['description']}")

        task = create_reconciliation_task(drifts)
        if task:
            print(f"[TASK CREATED] {task['id']}")
            print(f"[AUTO-EXECUTE] No prompt; proceeding...")
            return 0
    else:
        print("[OK] No drift detected")
        return 0

if __name__ == "__main__":
    sys.exit(main())
