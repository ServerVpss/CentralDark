#!/usr/bin/env python3
"""CentralDark Casa: journal de mudancas locais, sem sincronizar nem alterar arquivos."""
import argparse
import collections
import datetime as dt
import json
import os
import shutil
from pathlib import Path
import signal
import subprocess
import sys
import threading
import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

ROOT = Path(__file__).resolve().parents[2]
JOURNAL_DIR = ROOT / ".auto-sync"
JOURNAL = JOURNAL_DIR / "change-events.jsonl"
MAX_BYTES = 8 * 1024 * 1024
BACKUPS = 4


def command(*args, timeout=12):
    try:
        proc = subprocess.run(args, capture_output=True, text=True, timeout=timeout, check=False)
        return proc.stdout.strip() if proc.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def record(payload):
    JOURNAL_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    if JOURNAL.exists() and JOURNAL.stat().st_size >= MAX_BYTES:
        for n in range(BACKUPS, 0, -1):
            old = JOURNAL.with_name(JOURNAL.name + "." + str(n))
            new = JOURNAL.with_name(JOURNAL.name + "." + str(n + 1))
            if n == BACKUPS:
                old.unlink(missing_ok=True)
            elif old.exists():
                old.replace(new)
        JOURNAL.replace(JOURNAL.with_name(JOURNAL.name + ".1"))
    fd = os.open(JOURNAL, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o600)
    try:
        with os.fdopen(fd, "a", encoding="utf-8") as stream:
            stream.write(json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n")
    finally:
        os.chmod(JOURNAL, 0o600)


def timestamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def relative(path):
    try:
        return str(Path(path).relative_to(ROOT))
    except ValueError:
        return str(path)


def own_log(path):
    name = relative(path)
    return name == ".auto-sync/change-events.jsonl" or name.startswith(".auto-sync/change-events.jsonl.")


class Tracker(FileSystemEventHandler):
    def __init__(self):
        self.last = {}

    def on_any_event(self, event):
        if event.event_type not in {"created", "modified", "deleted", "moved"}:
            return
        src = relative(event.src_path)
        dest = relative(getattr(event, "dest_path", "")) if event.event_type == "moved" else None
        if own_log(event.src_path) or (dest is not None and own_log(event.dest_path)):
            return
        key = (event.event_type, src, dest)
        now = time.monotonic()
        if now - self.last.get(key, -99999) < 0.2:
            return
        self.last[key] = now
        if len(self.last) > 10000:
            self.last = {k: v for k, v in self.last.items() if now - v < 5}
        payload = {"at": timestamp(), "type": event.event_type, "path": src, "kind": "directory" if event.is_directory else "file"}
        if dest is not None:
            payload["to"] = dest
        record(payload)


def watch():
    if not ROOT.is_dir() or not (ROOT / ".git").exists():
        raise SystemExit("BLOCKED: CentralDark repo nao encontrado")
    tracker = Tracker()
    observer = Observer()
    observer.schedule(tracker, str(ROOT), recursive=True)
    stop = threading.Event()
    for signum in (signal.SIGTERM, signal.SIGINT):
        signal.signal(signum, lambda _sig, _frame: stop.set())
    observer.start()
    record({"at": timestamp(), "type": "monitor_started", "path": ".", "pid": os.getpid()})
    print("TRACKER=ACTIVE root=" + str(ROOT), flush=True)
    try:
        while not stop.wait(1):
            if not observer.is_alive():
                raise RuntimeError("watchdog observer stopped unexpectedly")
    finally:
        observer.stop()
        observer.join(timeout=10)
        record({"at": timestamp(), "type": "monitor_stopped", "path": "."})


def recent(limit=8):
    if not JOURNAL.is_file():
        return []
    with JOURNAL.open(encoding="utf-8", errors="replace") as stream:
        rows = collections.deque(stream, maxlen=limit)
    parsed = []
    for row in rows:
        try:
            parsed.append(json.loads(row))
        except json.JSONDecodeError:
            continue
    return parsed


def doctor():
    branch = command("git", "-C", str(ROOT), "branch", "--show-current")
    local_sha = command("git", "-C", str(ROOT), "rev-parse", "HEAD")
    remote_sha = command("gh", "api", "repos/ServerVpss/CentralDark/commits/main", "--jq", ".sha", timeout=25)
    changes = command("git", "-C", str(ROOT), "status", "--porcelain", "--untracked-files=no", timeout=30)
    ssh = command("systemctl", "is-active", "ssh")
    state = command("systemctl", "--user", "is-active", "centraldark-change-tracker.service")
    output = {
        "at": timestamp(),
        "root": str(ROOT),
        "branch": branch or "UNKNOWN",
        "head": local_sha or "UNKNOWN",
        "github_main": remote_sha or "UNKNOWN",
        "same_sha": None if not (local_sha and remote_sha) else local_sha == remote_sha,
        "git_dirty_tracked": None if changes is None else bool(changes),
        "ssh_active": ssh == "active",
        "gh_installed": shutil.which("gh") is not None,
        "github_authenticated_and_accessible": None if remote_sha is None else True,
        "tracker_service": state or "UNKNOWN",
        "journal": str(JOURNAL),
        "last_events": recent(),
    }
    print(json.dumps(output, ensure_ascii=False, sort_keys=True))


def main():
    parser = argparse.ArgumentParser(description="CentralDark change journal: watch / doctor / recent")
    parser.add_argument("mode", choices=("watch", "doctor", "recent"), nargs="?", default="doctor")
    args = parser.parse_args()
    if args.mode == "watch":
        watch()
    elif args.mode == "recent":
        print(json.dumps(recent(15), ensure_ascii=False))
    else:
        doctor()


if __name__ == "__main__":
    main()
