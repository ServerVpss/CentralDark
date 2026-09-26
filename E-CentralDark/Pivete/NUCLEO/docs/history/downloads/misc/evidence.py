from __future__ import annotations
import hashlib, json, subprocess, time
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4
from .types import Evidence

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def hash_tree(path: Path) -> str:
    path = Path(path)
    h = hashlib.sha256()
    if not path.exists():
        return h.hexdigest()
    for item in sorted(p for p in path.rglob("*") if p.is_file()):
        rel = item.relative_to(path).as_posix().encode()
        h.update(len(rel).to_bytes(8, "big"))
        h.update(rel)
        h.update(bytes.fromhex(sha256_file(item)))
    return h.hexdigest()

def run_command(command: list[str], cwd: Path, timeout: int, kind: str, evidence_dir: Path) -> Evidence:
    if not command or not all(isinstance(x, str) and x for x in command):
        raise ValueError("command must be a non-empty list of strings")
    start = time.monotonic()
    try:
        proc = subprocess.run(command, cwd=str(cwd), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              timeout=timeout, check=False, shell=False)
        code, out, err = proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired as exc:
        code, out, err = 124, exc.stdout or b"", (exc.stderr or b"") + b"\nTIMEOUT"
    ev = Evidence(
        evidence_id=str(uuid4()), kind=kind, command=command, exit_code=code,
        stdout_sha256=sha256_bytes(out), stderr_sha256=sha256_bytes(err),
        timestamp=datetime.now(timezone.utc).isoformat(),
        duration_ms=int((time.monotonic()-start)*1000),
        stdout_excerpt=out.decode("utf-8","replace")[-4000:],
        stderr_excerpt=err.decode("utf-8","replace")[-4000:],
    )
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir/f"{ev.evidence_id}.json").write_text(
        json.dumps(ev.__dict__, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return ev
