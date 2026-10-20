#!/usr/bin/env python3
"""CentralDark + Hermes: checkpoints de execução verificada, independentes da sessão.
Uso: verified-checkpoint.py --help. Só PASS + contraprova gera estado corrente.
"""
import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
import uuid

SCHEMA = "centraldark.hermes.verified-execution.v1"
VALID_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$")

def encode(data):
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def sha(data):
    return hashlib.sha256(data).hexdigest()

def stop(error, code=2):
    print(json.dumps({"ok": False, "error": error}, ensure_ascii=False), file=sys.stderr)
    raise SystemExit(code)

def location(mission):
    if not VALID_NAME.fullmatch(mission):
        stop("MISSION_INVALID")
    root = Path(os.environ.get("CENTRALDARK_HERMES_CHECKPOINTS", str(Path.home() / ".hermes/centraldark/verified-execution"))).expanduser()
    if root.is_symlink():
        stop("STATE_ROOT_SYMLINK")
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    if mission == "latest":
        candidates = []
        for item in root.iterdir():
            if not item.is_dir() or item.is_symlink() or not VALID_NAME.fullmatch(item.name):
                continue
            pointer = item / "current.json"
            if pointer.is_file() and not pointer.is_symlink():
                try:
                    record = json.loads(pointer.read_text(encoding="utf-8"))
                    if record.get("outcome") == "VERIFIED" and record.get("mission") == item.name:
                        candidates.append((str(record.get("at", "")), item.name))
                except (ValueError, OSError):
                    continue
        if not candidates:
            stop("NO_VERIFIED_CHECKPOINT", 4)
        mission = max(candidates)[1]
    folder = root / mission
    if folder.is_symlink():
        stop("MISSION_SYMLINK")
    folder.mkdir(mode=0o700, exist_ok=True)
    os.chmod(folder, 0o700)
    return folder

@contextmanager
def one_writer(folder):
    path = folder / ".lock"
    with path.open("a+") as handle:
        os.chmod(path, 0o600)
        fcntl.flock(handle, fcntl.LOCK_EX)
        yield

def atomic(path, payload):
    fd, tmp = tempfile.mkstemp(prefix=".current-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as h:
            h.write(encode(payload) + b"\n")
            h.flush()
            os.fsync(h.fileno())
        os.chmod(tmp, 0o600)
        os.replace(tmp, path)
        dirfd = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(dirfd)
        finally:
            os.close(dirfd)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)

def read_chain(folder):
    journal = folder / "events.jsonl"
    previous = "0" * 64
    current, failed = None, None
    count, passed = 0, 0
    if journal.exists():
        with journal.open("rb") as h:
            for raw in h:
                count += 1
                try:
                    event = json.loads(raw)
                    hash_value = event.pop("sha256")
                except (ValueError, KeyError):
                    stop("JOURNAL_PARSE_FAILURE_LINE_%s" % count, 3)
                if event.get("schema") != SCHEMA or event.get("prev_sha256") != previous or sha(encode(event)) != hash_value:
                    stop("JOURNAL_HASH_CHAIN_INVALID_LINE_%s" % count, 3)
                event["sha256"] = hash_value
                previous = hash_value
                if event.get("outcome") == "VERIFIED":
                    current = event
                    passed += 1
                elif event.get("outcome") == "FAILED":
                    failed = event
    pointer = folder / "current.json"
    if current is None and pointer.exists():
        stop("CURRENT_POINTER_WITHOUT_PROOF", 3)
    if current:
        try:
            existing = json.loads(pointer.read_text()) if pointer.exists() else None
        except (ValueError, OSError):
            existing = None
        if existing != current:
            atomic(pointer, current)   # journal is authoritative across power loss
    return previous, current, failed, count, passed

def add_event(folder, prev, values):
    event = {"schema": SCHEMA, "prev_sha256": prev, **values}
    event["sha256"] = sha(encode(event))
    journal = folder / "events.jsonl"
    with journal.open("ab") as h:
        os.chmod(journal, 0o600)
        h.write(encode(event) + b"\n")
        h.flush()
        os.fsync(h.fileno())
    if event["outcome"] == "VERIFIED":
        atomic(folder / "current.json", event)
    return event

def file_hash(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(128 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def execute(argv, cwd, timeout, stdout_path, stderr_path):
    with stdout_path.open("wb") as out, stderr_path.open("wb") as err:
        os.chmod(stdout_path, 0o600)
        os.chmod(stderr_path, 0o600)
        try:
            return subprocess.run(argv, cwd=cwd, stdout=out, stderr=err, timeout=timeout, check=False).returncode
        except subprocess.TimeoutExpired:
            return 124
        except FileNotFoundError:
            err.write(b"Executable not found\n")
            return 127

def step(folder, mission, step_id, cursor, argv, expect, verifier, intent, timeout, cwd, plan_hash="", index=None):
    if not VALID_NAME.fullmatch(step_id):
        stop("STEP_ID_INVALID")
    if not argv or not argv[0]:
        stop("COMMAND_REQUIRED")
    if not expect and not verifier:
        stop("PROOF_REQUIRED_EXPECT_OR_VERIFY")
    if timeout < 1 or timeout > 86400:
        stop("TIMEOUT_INVALID")
    cwd = str(Path(cwd).resolve())
    if not Path(cwd).is_dir():
        stop("CWD_MISSING")
    prev, current, _, _, _ = read_chain(folder)
    signature = sha(encode({"mission": mission, "step": step_id, "next": cursor,
                            "argv": argv, "expect": expect or "", "verify": verifier or [],
                            "cwd": cwd, "plan": plan_hash}))
    if current and current.get("fingerprint") == signature:
        print(json.dumps({"ok": True, "status": "REUSED_VERIFIED", "step": step_id,
                          "next_cursor": current["next_cursor"], "receipt_sha256": current["sha256"]}, ensure_ascii=False))
        return True
    logs = folder / "logs"
    logs.mkdir(mode=0o700, exist_ok=True)
    ident = uuid.uuid4().hex[:12]
    stdout_path, stderr_path = logs / (ident + ".stdout"), logs / (ident + ".stderr")
    code = execute(argv, cwd, timeout, stdout_path, stderr_path)
    match = None if not expect else (
        stdout_path.stat().st_size <= 64 * 1024 * 1024 and expect.encode("utf-8") in stdout_path.read_bytes())
    verify_code = None
    if code == 0 and (not expect or match) and verifier:
        verify_code = execute(verifier, cwd, timeout, logs / (ident + ".verify.stdout"), logs / (ident + ".verify.stderr"))
    passed = code == 0 and (not expect or match) and (not verifier or verify_code == 0)
    record = add_event(folder, prev, {
        "at": datetime.now(timezone.utc).isoformat(), "mission": mission, "step": step_id,
        "step_index": index, "intent": intent, "next_cursor": cursor, "fingerprint": signature,
        "plan_sha256": plan_hash, "outcome": "VERIFIED" if passed else "FAILED",
        "command_exit": code, "expect_pass": match, "verify_exit": verify_code,
        "stdout_sha256": file_hash(stdout_path), "stderr_sha256": file_hash(stderr_path),
        "log_id": ident, "log_directory": str(logs), "argv": argv, "verify_argv": verifier or [],
        "cwd": cwd})
    print(json.dumps({"ok": passed, "status": "VERIFIED_100" if passed else "FAILED_NO_PROMOTION",
                      "mission": mission, "step": step_id, "exit": code, "expect_pass": match,
                      "verify_exit": verify_code, "next_cursor": cursor if passed else (current or {}).get("next_cursor", step_id),
                      "receipt_sha256": record["sha256"], "log_id": ident}, ensure_ascii=False))
    return passed

def main():
    cli = argparse.ArgumentParser(description="CentralDark Hermes: executar -> contraprovar -> checkpoint -> retomar")
    subs = cli.add_subparsers(dest="action", required=True)
    for name in ("run", "plan", "status", "resume", "verify"):
        p = subs.add_parser(name)
        p.add_argument("--mission", required=True)
        if name == "run":
            p.add_argument("--step", required=True)
            p.add_argument("--next", required=True)
            p.add_argument("--intent", default="")
            p.add_argument("--expect")
            p.add_argument("--verify-command", help="comando independente, separado com shlex; sem shell implícito")
            p.add_argument("--timeout", type=int, default=180)
            p.add_argument("--cwd", default=os.getcwd())
            p.add_argument("command", nargs=argparse.REMAINDER)
        if name == "plan":
            p.add_argument("--file", required=True)
            p.add_argument("--timeout", type=int, default=180)
            p.add_argument("--cwd", default=os.getcwd())
        if name == "resume":
            p.add_argument("--format", choices=("prompt", "json"), default="prompt")
    args = cli.parse_args()
    if args.mission == "latest" and args.action in ("run", "plan"):
        stop("LATEST_IS_READ_ONLY_USE_NAMED_MISSION")
    folder = location(args.mission)
    with one_writer(folder):
        if args.action == "run":
            argv = args.command[1:] if args.command[:1] == ["--"] else args.command
            ok = step(folder, args.mission, args.step, args.next, argv, args.expect,
                      shlex.split(args.verify_command) if args.verify_command else None,
                      args.intent, args.timeout, args.cwd)
            if not ok:
                raise SystemExit(1)
        elif args.action == "plan":
            obj = json.loads(Path(args.file).read_text(encoding="utf-8"))
            if obj.get("schema") != "centraldark.hermes.execution-plan.v1" or obj.get("mission") != args.mission:
                stop("PLAN_SCHEMA_OR_MISSION_INVALID")
            steps = obj.get("steps")
            if not isinstance(steps, list) or not steps or any(not isinstance(x, dict) for x in steps):
                stop("PLAN_STEPS_INVALID")
            ids = [x.get("id") for x in steps]
            if any(not isinstance(x, str) or not VALID_NAME.fullmatch(x) for x in ids) or len(ids) != len(set(ids)):
                stop("PLAN_IDS_INVALID")
            plan_hash = sha(encode(obj))
            _, current, _, _, _ = read_chain(folder)
            if current and current.get("plan_sha256") != plan_hash:
                stop("PLAN_CHANGED_USE_NEW_MISSION_OR_RECONCILE", 3)
            start = current["step_index"] + 1 if current else 0
            atomic(folder / "active-plan.json", obj)
            if start > len(steps):
                stop("PLAN_CURSOR_OUT_OF_RANGE", 3)
            for idx in range(start, len(steps)):
                item = steps[idx]
                argv, check = item.get("argv"), item.get("verify_argv")
                if not isinstance(argv, list) or not argv or not all(isinstance(x, str) for x in argv):
                    stop("PLAN_ARGV_INVALID")
                if check is not None and (not isinstance(check, list) or not all(isinstance(x, str) for x in check)):
                    stop("PLAN_VERIFY_ARGV_INVALID")
                cursor = item.get("next_cursor") or (steps[idx + 1]["id"] if idx + 1 < len(steps) else "COMPLETO")
                if not step(folder, args.mission, item["id"], cursor, argv, item.get("expect"),
                            check, obj.get("intent", ""), args.timeout, args.cwd, plan_hash, idx):
                    raise SystemExit(1)
            print(json.dumps({"ok": True, "status": "PLAN_COMPLETE", "mission": args.mission,
                              "steps": len(steps), "plan_sha256": plan_hash}, ensure_ascii=False))
        else:
            _, current, failed, count, passed = read_chain(folder)
            if args.action == "verify":
                print(json.dumps({"ok": True, "status": "HASH_CHAIN_PASS", "events": count,
                                  "current_sha256": (current or {}).get("sha256")}, ensure_ascii=False))
            elif args.action == "status":
                print(json.dumps({"ok": True, "mission": folder.name, "verified": passed,
                                  "events": count, "last_step": (current or {}).get("step"),
                                  "next_cursor": (current or {}).get("next_cursor"),
                                  "last_failure": (failed or {}).get("step"),
                                  "current_sha256": (current or {}).get("sha256"),
                                  "storage": str(folder)}, ensure_ascii=False))
            elif args.action == "resume":
                if not current:
                    stop("NO_VERIFIED_CHECKPOINT", 4)
                if args.format == "json":
                    print(json.dumps(current, ensure_ascii=False, indent=2))
                else:
                    print("INTENCAO=" + current.get("intent", ""))
                    print("MISSAO=" + folder.name)
                    print("ULTIMO_PASS=" + current["step"])
                    print("NEXT_CURSOR=" + current["next_cursor"])
                    print("PROVA_SHA256=" + current["sha256"])
                    print("CONTINUE_A_PARTIR_DE_NEXT_CURSOR_SEM_REPETIR_PASS")
                    print("O_CHECKPOINT_E_PERSISTENTE_FORA_DO_CONTEXTO_DA_SESSAO")

if __name__ == "__main__":
    main()
