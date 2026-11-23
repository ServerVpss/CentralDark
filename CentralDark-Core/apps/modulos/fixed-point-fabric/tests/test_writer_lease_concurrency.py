"""Regression: independent processes must not acquire the same SQLite lease.

Execute from repository root with:
  PYTHONPATH=apps/modulos/fixed-point-fabric/src \
  python -m unittest discover -s apps/modulos/fixed-point-fabric/tests -p 'test_writer_lease_concurrency.py' -v
This test exercises a shared local SQLite DB; it does NOT verify Casa↔VPS.
"""
from __future__ import annotations

import multiprocessing as mp
import os
import tempfile
import time
import unittest
from pathlib import Path

from centraldark_fixed_point.store import EventStore


def _contend(db_path: str, start, release, result) -> None:
    store = EventStore(db_path)
    try:
        start.wait(timeout=10)
        try:
            with store.writer_lease("race-scope", ttl_seconds=30):
                result.put(("ACQUIRED", os.getpid()))
                if not release.wait(timeout=10):
                    raise TimeoutError("lease hold timed out")
        except RuntimeError as error:
            if "writer lease held by pid=" in str(error):
                result.put(("DENIED", os.getpid()))
            else:
                result.put(("ERROR", repr(error)))
        except Exception as error:
            result.put(("ERROR", repr(error)))
    except Exception as error:
        result.put(("ERROR", repr(error)))
    finally:
        store.close()


class WriterLeaseConcurrencyTests(unittest.TestCase):
    def test_two_independent_processes_only_one_writer(self):
        ctx = mp.get_context("spawn")
        with tempfile.TemporaryDirectory(prefix="centraldark-writer-race-") as directory:
            for iteration in range(12):
                db_path = str(Path(directory) / f"race-{iteration}.db")
                owner = EventStore(db_path)
                owner.close()
                start = ctx.Barrier(3)
                release = ctx.Event()
                result = ctx.Queue()
                workers = [ctx.Process(target=_contend, args=(db_path, start, release, result)) for _ in range(2)]
                try:
                    for worker in workers:
                        worker.start()
                    start.wait(timeout=10)
                    statuses = [result.get(timeout=10), result.get(timeout=10)]
                    self.assertEqual(sorted(x[0] for x in statuses), ["ACQUIRED", "DENIED"], statuses)
                finally:
                    release.set()
                    for worker in workers:
                        worker.join(timeout=8)
                        if worker.is_alive():
                            worker.terminate()
                            worker.join(timeout=3)
                    result.close()
                self.assertTrue(all(worker.exitcode == 0 for worker in workers), statuses)
                store = EventStore(db_path)
                try:
                    with store.writer_lease("race-scope"):
                        self.assertIsNotNone(store.get_state("lease:race-scope"))
                    self.assertIsNone(store.get_state("lease:race-scope"))
                finally:
                    store.close()

    def test_live_existing_writer_is_denied(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            try:
                store.set_state("lease:occupied", {"pid": os.getpid() + 1000, "expires_at": time.time() + 600})
                with self.assertRaisesRegex(RuntimeError, "writer lease held"):
                    with store.writer_lease("occupied"):
                        pass
            finally:
                store.close()

    def test_same_process_reentrant_acquire_is_denied(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            try:
                with store.writer_lease("one"):
                    with self.assertRaisesRegex(RuntimeError, "writer lease held"):
                        with store.writer_lease("one"):
                            pass
                    self.assertIsNotNone(store.get_state("lease:one"))
                self.assertIsNone(store.get_state("lease:one"))
            finally:
                store.close()

    def test_expired_lease_can_be_claimed(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            try:
                store.set_state("lease:recovered", {"pid": 999999, "expires_at": time.time() - 1})
                with store.writer_lease("recovered"):
                    self.assertEqual(store.get_state("lease:recovered")["pid"], os.getpid())
            finally:
                store.close()

    def test_old_writer_cannot_release_new_token(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            try:
                with store.writer_lease("handoff"):
                    old_token = store.get_state("lease:handoff")["token"]
                    new_holder = {"pid": 123456, "token": "replacement-holder", "expires_at": time.time() + 600}
                    store.set_state("lease:handoff", new_holder)
                self.assertNotEqual(old_token, new_holder["token"])
                self.assertEqual(store.get_state("lease:handoff"), new_holder)
            finally:
                store.close()

    def test_invalid_ttl_or_corrupt_lease_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            store = EventStore(Path(directory) / "state.db")
            try:
                with self.assertRaises(ValueError):
                    with store.writer_lease("broken", ttl_seconds=0):
                        pass
                store.set_state("lease:broken", {"pid": 123})
                with self.assertRaisesRegex(RuntimeError, "state is invalid"):
                    with store.writer_lease("broken"):
                        pass
                self.assertEqual(store.get_state("lease:broken"), {"pid": 123})
            finally:
                store.close()


if __name__ == "__main__":
    unittest.main()
