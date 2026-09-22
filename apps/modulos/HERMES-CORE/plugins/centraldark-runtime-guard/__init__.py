"""Hermes-native adapter for CentralDark's canonical runtime contracts.

This is an adapter, not a second orchestrator: policy and proof remain owned by
HERMES-CORE, Trigger Fabric, MetaLupa, and the repository's workflows.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PLUGIN_NAME = "centraldark-runtime-guard"
DEFAULT_REPO = Path("/root/CentralDark")
LOGICAL_PREFIXES = (
    "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/",
    "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/",
    "scripts/trigger-fabric/",
    "apps/modulos/HERMES-CORE/core/",
)
LOGICAL_EXACT = {
    "LEIA-ME-IA.md",
    "CENTRALDARK_AI_BOOT.yaml",
    ".agents/skills/meta-lupa/SKILL.md",
}
MUTATING_TOOLS = {"write_file", "patch", "skill_manage", "terminal", "browser_exec"}
SESSION: dict[str, Any] = {"started_at": None, "last_anchor_hash": None, "events": 0}


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def repo_root() -> Path:
    candidate = Path(os.environ.get("CENTRALDARK_REPO_ROOT", str(DEFAULT_REPO))).expanduser().resolve()
    return candidate


def stable_hash(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def run_text(argv: list[str], cwd: Path, timeout: int = 5) -> tuple[int, str]:
    try:
        result = subprocess.run(argv, cwd=cwd, capture_output=True, text=True, timeout=timeout, check=False)
        return result.returncode, (result.stdout or result.stderr or "").strip()
    except (OSError, subprocess.SubprocessError) as error:
        return 127, str(error)


def git_snapshot(root: Path) -> dict[str, Any]:
    if not (root / ".git").exists():
        return {"repo": str(root), "state": "UNKNOWN", "reason": "REPO_NOT_FOUND"}
    _, head = run_text(["git", "rev-parse", "HEAD"], root)
    remote_rc, remote = run_text(["git", "rev-parse", "origin/main"], root)
    _, porcelain = run_text(["git", "status", "--porcelain"], root)
    return {
        "repo": str(root),
        "state": "OBSERVED",
        "head_sha": head if re.fullmatch(r"[0-9a-f]{40}", head, re.I) else None,
        "origin_main_sha": remote if remote_rc == 0 and re.fullmatch(r"[0-9a-f]{40}", remote, re.I) else None,
        "worktree_dirty_entries": len([line for line in porcelain.splitlines() if line.strip()]),
    }


def pdf_gate(root: Path) -> dict[str, Any]:
    script = root / "scripts/lupa/pdf-conformance-cc2003.mjs"
    if not script.exists():
        return {"status": "UNKNOWN", "reason": "PDF_GATE_OWNER_NOT_FOUND"}
    rc, output = run_text(["node", str(script)], root, timeout=10)
    start, end = output.find("{"), output.rfind("}")
    try:
        payload = json.loads(output[start:end + 1]) if start >= 0 and end >= start else {}
    except json.JSONDecodeError:
        payload = {}
    return {
        "status": "PROVED" if rc == 0 and payload.get("status") == "PROVED_IN_SCOPE" else "BLOCKED",
        "reason": payload.get("reason", "PDF_GATE_EXECUTION_FAILED"),
        "sha256": payload.get("sha256"),
        "path": payload.get("path"),
    }


def collect_paths(value: Any) -> list[str]:
    if isinstance(value, dict):
        found = []
        for key, item in value.items():
            if key in {"path", "file_path", "target", "file"} and isinstance(item, str):
                found.append(item)
            found.extend(collect_paths(item))
        return found
    if isinstance(value, list):
        return [path for item in value for path in collect_paths(item)]
    return []


def is_logical_path(path: str) -> bool:
    normalized = path.replace("\\", "/").lstrip("./")
    return normalized in LOGICAL_EXACT or normalized.endswith("/.agents/skills/meta-lupa/SKILL.md") or any(
        normalized.startswith(prefix) or f"/{prefix}" in normalized for prefix in LOGICAL_PREFIXES
    )


def is_mutating(tool_name: str, args: dict[str, Any]) -> bool:
    if tool_name in {"write_file", "patch", "skill_manage"}:
        return True
    if tool_name != "terminal":
        return False
    command = str(args.get("command", ""))
    return bool(re.search(r"\b(git\s+(add|commit|push|merge|rebase|reset|checkout|switch|cherry-pick|revert)|rm\b|mv\b|cp\b|tee\b|chmod\b|chown\b|npm\s+(install|add|remove|update)|pm2\s+(start|stop|restart|reload|delete)|systemctl\s+(start|stop|restart|reload))\b|(?<!>)>>(?!>)|(?<![<>=])>(?![=>])", command, re.I))


def logical_mutation(tool_name: str, args: dict[str, Any]) -> bool:
    paths = collect_paths(args)
    if any(is_logical_path(path) for path in paths):
        return True
    command = str(args.get("command", ""))
    return tool_name == "terminal" and is_mutating(tool_name, args) and any(token in command for token in LOGICAL_PREFIXES + tuple(LOGICAL_EXACT))


def receipt_path() -> Path:
    root = Path(__file__).resolve().parent
    state = root / ".runtime-state"
    state.mkdir(parents=True, exist_ok=True)
    return state / "tool-receipts.jsonl"


def append_receipt(event: dict[str, Any]) -> None:
    safe = {
        "schema": "centraldark.hermes-runtime-guard-receipt.v1",
        "at": now(),
        "plugin": PLUGIN_NAME,
        "tool": str(event.get("tool", "UNKNOWN"))[:100],
        "phase": str(event.get("phase", "UNKNOWN"))[:40],
        "logical_scope": bool(event.get("logical_scope")),
        "verdict": str(event.get("verdict", "UNKNOWN"))[:80],
        "argument_fingerprint": stable_hash(event.get("args", {})),
    }
    with receipt_path().open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(safe, ensure_ascii=False) + "\n")


def _tool_parts(*args: Any, **kwargs: Any) -> tuple[str, dict[str, Any]]:
    data = kwargs.get("tool_args") or kwargs.get("args") or {}
    name = kwargs.get("tool_name") or kwargs.get("name") or ""
    if args:
        if isinstance(args[0], str):
            name = args[0]
        elif isinstance(args[0], dict):
            data = args[0].get("args", args[0])
            name = args[0].get("tool_name", args[0].get("name", name))
    return str(name), data if isinstance(data, dict) else {}


def on_session_start(*_args: Any, **_kwargs: Any) -> None:
    SESSION.update({"started_at": now(), "last_anchor_hash": None, "events": 0})


def pre_llm_call(*_args: Any, **_kwargs: Any) -> dict[str, str] | None:
    root = repo_root()
    snapshot = git_snapshot(root)
    gate = pdf_gate(root)
    anchor = {"snapshot": snapshot, "tlc23": gate}
    fingerprint = stable_hash(anchor)
    if SESSION.get("last_anchor_hash") == fingerprint:
        return None
    SESSION["last_anchor_hash"] = fingerprint
    return {"context": "CENTRALDARK_RUNTIME_ANCHOR=" + json.dumps(anchor, ensure_ascii=False, separators=(",", ":")) + "\nRegra: estado observado não é prova de runtime; mutação de regra lógica exige TLC23=PROVED antes da ferramenta."}


def pre_tool_call(tool_name: str = "", args: Any = None, **_kwargs: Any) -> dict[str, Any] | None:
    tool_args = args if isinstance(args, dict) else {}
    if tool_name not in MUTATING_TOOLS or not is_mutating(tool_name, tool_args):
        return None
    scoped = logical_mutation(tool_name, tool_args)
    if not scoped:
        append_receipt({"tool": tool_name, "args": tool_args, "phase": "PRE_TOOL", "logical_scope": False, "verdict": "OUT_OF_TLC23_SCOPE"})
        return None
    gate = pdf_gate(repo_root())
    verdict = "ALLOW_TLC23_PROVED" if gate["status"] == "PROVED" else "BLOCK_TLC23_NOT_PROVED"
    append_receipt({"tool": tool_name, "args": tool_args, "phase": "PRE_TOOL", "logical_scope": True, "verdict": verdict})
    if gate["status"] == "PROVED":
        return None
    return {"action": "block", "message": f"CENTRALDARK_TLC23_GATE={gate['status']} reason={gate.get('reason', 'UNKNOWN')}; mutation of logical policy is fail-closed until the canonical PDF identity is proved."}


def post_tool_call(*args: Any, **kwargs: Any) -> None:
    tool_name, tool_args = _tool_parts(*args, **kwargs)
    if tool_name:
        append_receipt({"tool": tool_name, "args": tool_args, "phase": "POST_TOOL", "logical_scope": logical_mutation(tool_name, tool_args), "verdict": "OBSERVED"})
        SESSION["events"] = int(SESSION.get("events", 0)) + 1


def on_session_end(*_args: Any, **_kwargs: Any) -> None:
    append_receipt({"tool": "SESSION", "args": {"events": SESSION.get("events", 0)}, "phase": "SESSION_END", "logical_scope": False, "verdict": "CLOSED"})


def pre_verify(*_args: Any, **_kwargs: Any) -> dict[str, str] | None:
    """Do not let a changed repository close while Git detects malformed whitespace."""
    root = repo_root()
    if not (root / ".git").exists():
        return None
    rc, output = run_text(["git", "diff", "--check"], root)
    if rc == 0:
        return None
    return {"action": "continue", "message": "CENTRALDARK_DIFF_CONFORMANCE=FAIL: " + output[:1200]}


def register(ctx: Any) -> None:
    """Bind only Hermes-native lifecycle points; all policy remains in CentralDark."""
    ctx.register_hook("on_session_start", on_session_start)
    ctx.register_hook("pre_llm_call", pre_llm_call)
    ctx.register_hook("pre_tool_call", pre_tool_call)
    ctx.register_hook("post_tool_call", post_tool_call)
    ctx.register_hook("pre_verify", pre_verify)
    ctx.register_hook("on_session_end", on_session_end)


def self_test() -> dict[str, Any]:
    assert is_logical_path("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md")
    assert is_logical_path("CENTRALDARK_AI_BOOT.yaml")
    assert not is_logical_path("apps/modulos/mcp/src/index.js")
    assert is_mutating("terminal", {"command": "git commit -m x"})
    assert not is_mutating("terminal", {"command": "git status --short"})
    assert logical_mutation("write_file", {"path": "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/X.md"})
    assert not logical_mutation("write_file", {"path": "README.md"})
    return {"status": "PASS", "plugin": PLUGIN_NAME, "checks": 7}


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        print(json.dumps(self_test(), ensure_ascii=False))
    else:
        print(json.dumps({"plugin": PLUGIN_NAME, "status": "READY"}, ensure_ascii=False))
