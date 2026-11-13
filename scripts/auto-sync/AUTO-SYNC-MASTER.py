#!/usr/bin/env python3
# #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
# @last_updated: 2026-11-13T04:33:00Z
# @implementado: planner 3-way fail-closed, lock de writer único e status atômico; removido ours/rebase/commit automático.
# @pendente: promoção de conflitos semânticos continua exigindo owner/teste/contraprova; dry-run nunca vira PASS.
# @next_cursor: Cockpit consome --dry-run --json; resolver frentes semânticas e só então convergir checkout.
"""AUTO-SYNC MASTER — Casa / Main / VPS, preservação antes de mutação.

O resolvedor deste owner NÃO escolhe "ours" nem "theirs", NÃO cria commit,
NÃO faz stash/reset/clean e NÃO executa rebase em checkout sujo. Primeiro
mede BASE/LOCAL/MAIN por caminho e devolve um plano 3-way verificável.
"""
import argparse
from contextlib import contextmanager
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
from enum import Enum

try:
    import fcntl
except ImportError:
    fcntl = None
    import msvcrt

SAFE_RECONCILER_VERSION = "cd40.v1"
ONE_WRITER_LOCK = True

class SyncTarget(Enum):
    WINDOWS = "windows"
    MAIN = "main"
    VPS = "vps"
    ALL = "all"

class SyncStatus(Enum):
    IDLE = "idle"
    SYNCING = "syncing"
    SUCCESS = "success"
    FAILED = "failed"
    CONFLICT = "conflict"

class AutoSyncMaster:
    def __init__(self, repo_root: str | None = None):
        self.repo_root = Path(repo_root or Path(__file__).resolve().parents[2]).resolve()
        self.state_dir = self.repo_root / ".auto-sync"
        self.status_file = self.state_dir / "status.json"
        self.lock_file = self.state_dir / "sync.lock"
        self.state_dir.mkdir(exist_ok=True, parents=True)
        self._init_status()

    def _git(self, *args: str, check: bool = True) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["git", "-C", str(self.repo_root), *args],
            check=check, capture_output=True, text=True
        )

    @contextmanager
    def _one_writer(self):
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        with self.lock_file.open("a+b") as handle:
            if fcntl is not None:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
            else:
                handle.seek(0, os.SEEK_END)
                if handle.tell() == 0:
                    handle.write(b"0")
                    handle.flush()
                handle.seek(0)
                msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)
            try:
                yield
            finally:
                if fcntl is not None:
                    fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
                else:
                    handle.seek(0)
                    msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)

    def _init_status(self):
        if not self.status_file.exists():
            self._write_status({
                "last_sync": None,
                "status": SyncStatus.IDLE.value,
                "targets": {"windows": None, "main": None, "vps": None},
            })

    def _write_status(self, status: dict):
        self.state_dir.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(prefix=".status-", suffix=".json", dir=self.state_dir)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as h:
                json.dump(status, h, indent=2, ensure_ascii=False, default=str)
                h.write("\n")
                h.flush()
                os.fsync(h.fileno())
            os.replace(tmp, self.status_file)
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)

    def _read_status(self) -> dict:
        return json.loads(self.status_file.read_text(encoding="utf-8"))

    @staticmethod
    def _safe_path(path: str) -> str:
        lowered = path.lower()
        if any(x in lowered for x in (".env", ".pem", ".key", "secrets/", "tokens/")):
            return "[arquivo sensível ocultado]"
        return path

    def _dirty_entries(self) -> list[tuple[str, str]]:
        raw = subprocess.run(
            ["git", "-C", str(self.repo_root), "status", "--porcelain=v1", "-z", "--untracked-files=all"],
            check=True, capture_output=True
        ).stdout
        chunks = [x for x in raw.split(b"\0") if x]
        out: list[tuple[str, str]] = []
        i = 0
        while i < len(chunks):
            line = chunks[i].decode("utf-8", "surrogateescape")
            status, path = line[:2], line[3:]
            if status[:1] in ("R", "C") or status[1:2] in ("R", "C"):
                if i + 1 < len(chunks):
                    path = chunks[i + 1].decode("utf-8", "surrogateescape")
                    i += 1
            out.append((status, path))
            i += 1
        return out

    def _blob(self, ref: str, path: str) -> bytes | None:
        probe = subprocess.run(
            ["git", "-C", str(self.repo_root), "cat-file", "-e", f"{ref}:{path}"],
            capture_output=True
        )
        if probe.returncode != 0:
            return None
        return subprocess.run(
            ["git", "-C", str(self.repo_root), "show", f"{ref}:{path}"],
            check=True, capture_output=True
        ).stdout

    def _three_way_probe(self, path: str, base_ref: str, remote_ref: str) -> tuple[str, int]:
        local = self.repo_root / path
        base = self._blob(base_ref, path)
        remote = self._blob(remote_ref, path)
        if base is None or remote is None or not local.is_file():
            return ("PATH_SHAPE_OR_DELETE", 1)
        with tempfile.TemporaryDirectory(prefix="cd40-merge-") as td:
            root = Path(td)
            bp, rp = root / "base", root / "remote"
            bp.write_bytes(base)
            rp.write_bytes(remote)
            result = subprocess.run(
                ["git", "merge-file", "-p", str(local), str(bp), str(rp)],
                capture_output=True
            )
        if result.returncode == 0:
            return ("AUTO_MERGEABLE", 0)
        if 0 < result.returncode < 128:
            return ("CONTENT_CONFLICT", result.returncode)
        return ("MERGE_PROBE_ERROR", 1)

    def plan_main(self, fetch: bool = True) -> dict:
        if fetch:
            self._git("fetch", "--no-tags", "origin", "refs/heads/main")
        head = self._git("rev-parse", "HEAD").stdout.strip()
        remote = self._git("rev-parse", "FETCH_HEAD").stdout.strip()
        base = self._git("merge-base", "HEAD", "FETCH_HEAD").stdout.strip()
        left, right = self._git("rev-list", "--left-right", "--count", "HEAD...FETCH_HEAD").stdout.split()
        ahead, behind = int(left), int(right)
        entries = self._dirty_entries()
        dirty_paths = {p for _, p in entries}
        tracked_dirty = sum(1 for st, _ in entries if st != "??")
        untracked = sum(1 for st, _ in entries if st == "??")
        remote_changed = set(
            x for x in self._git("diff", "--name-only", "HEAD..FETCH_HEAD").stdout.splitlines() if x
        )
        overlap = sorted(dirty_paths & remote_changed)
        conflicts: list[dict] = []
        auto_mergeable: list[str] = []
        status_by_path = {p: st for st, p in entries}
        conflict_hunks = 0
        for path in overlap:
            if status_by_path.get(path) == "??":
                conflicts.append({"path": self._safe_path(path), "reason": "UNTRACKED_REMOTE_COLLISION"})
                conflict_hunks += 1
                continue
            verdict, hunks = self._three_way_probe(path, head, remote)
            if verdict == "AUTO_MERGEABLE":
                auto_mergeable.append(self._safe_path(path))
            else:
                conflicts.append({"path": self._safe_path(path), "reason": verdict, "hunks": hunks})
                conflict_hunks += hunks

        if ahead and behind:
            state = "COMMITTED_DIVERGENCE_BLOCKED"
        elif not entries and behind:
            state = "FAST_FORWARD_READY"
        elif not entries and ahead:
            state = "PUSH_READY"
        elif not entries:
            state = "ALREADY_CONVERGED"
        elif conflicts:
            state = "DIRTY_CONFLICTS"
        else:
            state = "DIRTY_RECONCILE_READY"

        fingerprint_payload = "\n".join(
            [head, remote, base] + [f"{st} {p}" for st, p in entries]
        ).encode("utf-8", "surrogateescape")
        return {
            "schema": "centraldark.auto-sync-plan.v2",
            "resolver": SAFE_RECONCILER_VERSION,
            "state": state,
            "head": head,
            "origin_main": remote,
            "merge_base": base,
            "ahead": ahead,
            "behind": behind,
            "dirty_total": len(entries),
            "dirty_tracked": tracked_dirty,
            "untracked": untracked,
            "remote_changed": len(remote_changed),
            "overlap": len(overlap),
            "auto_mergeable": len(auto_mergeable),
            "conflicts": len(conflicts),
            "conflict_hunks": conflict_hunks,
            "conflict_paths": conflicts,
            "non_overlap_dirty": len(dirty_paths - remote_changed),
            "fingerprint": hashlib.sha256(fingerprint_payload).hexdigest(),
            "mutated_worktree": False,
            "dry_run": True,
            "unknown_is_not_pass": True,
        }

    def _auto_resolve_conflicts(self) -> bool:
        """Compatibilidade: agora só calcula plano; nunca escolhe um lado."""
        plan = self.plan_main(fetch=False)
        print("[CONFLICT-RESOLVER] SAFE_PLAN=" + json.dumps(plan, ensure_ascii=False, sort_keys=True))
        return plan["conflicts"] == 0

    def sync_windows(self) -> bool:
        entries = self._dirty_entries()
        if entries:
            print(f"[WINDOWS] BLOCKED: {len(entries)} alterações locais exigem writer/escopo; nenhum add/commit automático.")
            return False
        print("[WINDOWS] Checkout sem delta local pendente.")
        return True

    def sync_main(self) -> bool:
        with self._one_writer():
            plan = self.plan_main(fetch=True)
            if plan["dirty_total"]:
                self._write_status({
                    "last_sync": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "status": SyncStatus.CONFLICT.value,
                    "details": plan,
                })
                print("[MAIN] BLOCKED_DIRTY_SAFE_PLAN=" + json.dumps(plan, ensure_ascii=False, sort_keys=True))
                return False
            if plan["ahead"] and plan["behind"]:
                print("[MAIN] BLOCKED_COMMITTED_DIVERGENCE")
                return False
            if plan["behind"]:
                self._git("merge", "--ff-only", "FETCH_HEAD")
            after = self._git("rev-parse", "HEAD").stdout.strip()
            ok = after == plan["origin_main"] or plan["ahead"] > 0
            self._write_status({
                "last_sync": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "status": SyncStatus.SUCCESS.value if ok else SyncStatus.FAILED.value,
                "details": {"state": plan["state"], "head": after, "origin_main": plan["origin_main"]},
            })
            print(f"[MAIN] {'PASS' if ok else 'BLOCKED'} HEAD={after} ORIGIN_MAIN={plan['origin_main']}")
            return ok

    def sync_main_to_vps(self) -> bool:
        """Publica somente commits existentes; deploy/runtime continuam prova separada."""
        with self._one_writer():
            if self._dirty_entries():
                print("[MAIN→REMOTE] BLOCKED_DIRTY: nenhum push de checkout sujo.")
                return False
            self._git("fetch", "--no-tags", "origin", "refs/heads/main")
            left, right = self._git("rev-list", "--left-right", "--count", "HEAD...FETCH_HEAD").stdout.split()
            ahead, behind = int(left), int(right)
            if behind:
                print(f"[MAIN→REMOTE] BLOCKED_BEHIND={behind}")
                return False
            if ahead:
                self._git("push", "origin", "HEAD:main")
            print(f"[MAIN→REMOTE] PUSH_ONLY PASS ahead={ahead}; DEPLOY=UNPROVEN")
            return True

    def run_cycle(self, target: SyncTarget = SyncTarget.ALL) -> bool:
        status = self._read_status()
        status["status"] = SyncStatus.SYNCING.value
        status["last_sync"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self._write_status(status)
        success = True
        if target in (SyncTarget.WINDOWS, SyncTarget.ALL):
            success = self.sync_windows()
        if success and target in (SyncTarget.MAIN, SyncTarget.ALL):
            success = self.sync_main()
        if success and target in (SyncTarget.VPS, SyncTarget.ALL):
            success = self.sync_main_to_vps()
        status["status"] = SyncStatus.SUCCESS.value if success else SyncStatus.FAILED.value
        self._write_status(status)
        print(f"AUTO_SYNC_CYCLE={'PASS' if success else 'BLOCKED'}")
        return success

    def get_status_for_ui(self) -> dict:
        status = self._read_status()
        return {
            "timestamp": status.get("last_sync"),
            "status": status.get("status"),
            "human_readable": self._format_timestamp(status.get("last_sync")),
            "details": status.get("details"),
        }

    @staticmethod
    def _format_timestamp(iso_str: str | None) -> str:
        if not iso_str:
            return "Nunca sincronizado"
        dt = datetime.datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return f"{dt.strftime('%H:%M:%S')} · {dt.strftime('%d/%m/%Y')}"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AUTO-SYNC CentralDark — planner 3-way fail-closed")
    parser.add_argument("--target", choices=["windows", "main", "vps", "all"], default="all")
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="calcula BASE/LOCAL/MAIN sem mutar worktree/index/HEAD")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--repo", default=None, help="checkout explícito; padrão é a raiz deste script")
    args = parser.parse_args()
    sync = AutoSyncMaster(args.repo)
    if args.status:
        print(json.dumps(sync.get_status_for_ui(), ensure_ascii=False, indent=2))
    elif args.dry_run:
        with sync._one_writer():
            plan = sync.plan_main(fetch=True)
        print(json.dumps(plan, ensure_ascii=False, sort_keys=True) if args.json else json.dumps(plan, ensure_ascii=False, indent=2))
    else:
        target = SyncTarget[args.target.upper()]
        raise SystemExit(0 if sync.run_cycle(target) else 1)
