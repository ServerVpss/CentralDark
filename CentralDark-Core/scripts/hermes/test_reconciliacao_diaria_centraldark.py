"""Hermetic contract tests: no GitHub, Hermes runtime or model is contacted."""

import base64
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).with_name("reconciliacao-diaria-centraldark.py")
SPEC = importlib.util.spec_from_file_location("reconciliation", SCRIPT)
m = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
MAIN, HEAD, BASE = "a" * 40, "b" * 40, "c" * 40


def snapshot(main=MAIN, heads=None):
    heads = {2185: HEAD} if heads is None else heads
    value = {"repository": m.REPO, "main": main,
             "prs": [{"pr": n, "head": h, "mergeable": False, "mergeable_state": "dirty"} for n, h in heads.items()]}
    return {**value, "fingerprint": m.fingerprint(value)}


class Store:
    def __init__(self):
        self.data = {"schema": m.SCHEMA}
        self.saves = []

    def load(self):
        return copy.deepcopy(self.data)

    def save(self, data):
        self.data = copy.deepcopy(data)
        self.saves.append(copy.deepcopy(data))


class GH:
    def __init__(self, store):
        self.store = store
        self.observation = snapshot()
        self.runs = []
        self.dispatched = []
        self.raw_logs = receipt()
        self.log_reads = 0
        self.dispatch_error = False

    def snapshot(self):
        return copy.deepcopy(self.observation)

    def find_run(self, request):
        matches = [r for r in self.runs if r["display_title"] == "COSTURA · " + request]
        if len(matches) > 1:
            raise m.Blocked("MULTIPLE_RUNS_FOR_REQUEST")
        return copy.deepcopy(matches[0]) if matches else None

    def get_run(self, run_id):
        return copy.deepcopy(next(r for r in self.runs if r["id"] == run_id))

    def dispatch(self, request):
        assert self.store.data["pending"]["request_id"] == request
        self.dispatched.append(request)
        if self.dispatch_error:
            raise m.Blocked("DISPATCH_RECEIPT_UNKNOWN")

    def logs(self, run_id):
        self.log_reads += 1
        if isinstance(self.raw_logs, Exception):
            raise self.raw_logs
        return self.raw_logs

    def source(self, path, sha):
        return {"ref": sha, "blob": "d" * 40, "text": "const answer = 42;\n"}

    def add_run(self, status="completed", conclusion="success", main=None):
        pending = self.store.data["pending"]
        run = {"id": 123 + len(self.runs), "display_title": "COSTURA · " + pending["request_id"],
               "head_sha": main or pending["main"], "head_branch": "main", "event": "workflow_dispatch",
               "path": m.WORKFLOW_PATH, "status": status, "conclusion": conclusion, "run_attempt": 1}
        self.runs.append(run)
        return run


def receipt(*, yellow=False, reason="UNREGISTERED_CONFLICT_REQUIRES_PROVEN_PATTERN", source=HEAD, protected=None):
    lines = []
    if yellow:
        lines.extend([
            "🧭 RESOLVER_PR=2185", f"SOURCE_PR_HEAD={source}", f"SOURCE_MAIN_HEAD={MAIN}", f"SOURCE_MERGE_BASE={BASE}",
            f"CONFLICT_DECISION path=CentralDark-Core/example.py action=YELLOW reason={reason} conflict_id=UNREGISTERED strategy= key=",
            "COSTURA_METRICS_JSON=" + json.dumps({"schema": "centraldark.costura.metrics.v1", "pr": 2185,
                                                 "state": "YELLOW_NO_PUSH", "counts": {"yellow": 1}}),
        ])
    lines.append(json.dumps({"repository": m.REPO, "open_same_repo_prs": 1,
                            "protected_prs": [1562, 1757, 1977] if protected is None else protected,
                            "acted": 0, "blocked": int(yellow), "summary": [
                                {"pr": 2185, "head_before": HEAD, "action": "CONFLICT_RESOLVER_BLOCKED" if yellow else "SKIP_NO_RECONCILIATION_NEEDED",
                                 "state": "RC_20" if yellow else "NOOP"}]}, indent=2))
    lines.append("HOUSE_PR_RECONCILE=BLOCKED count=1" if yellow else "HOUSE_PR_RECONCILE=PASS")
    return "\n".join("reconcile\tExecutar owner COSTURA existente\t2026-11-27T17:00:00.123Z " + line
                     for line in "\n".join(lines).splitlines())


def effect_receipt(*, after=None, unknown=0):
    item = {"pr": 2185, "head_before": HEAD,
            "action": "CONFLICT_RESOLUTION_HEAD_VERIFIED" if after else "UPDATE_BRANCH_REQUESTED",
            "state": "AWAIT_SAME_HEAD_CI" if after else "SYNCHRONIZING_AWAIT_READBACK_AND_CI"}
    if after:
        item["head_after"] = after
    rows = [item] + [{"pr": 3000 + n, "action": "MERGEABILITY_UNKNOWN", "state": "UNKNOWN"} for n in range(unknown)]
    return json.dumps({"repository": m.REPO, "protected_prs": sorted(m.PROTECTED), "open_same_repo_prs": len(rows),
                       "acted": 1, "blocked": unknown, "summary": rows}, indent=2) + "\n" + (
        f"HOUSE_PR_RECONCILE=BLOCKED count={unknown}" if unknown else "HOUSE_PR_RECONCILE=PASS")


class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.store = Store()
        self.gh = GH(self.store)
        self.calls = []

        def advice(context):
            self.assertEqual(self.store.data["advice"]["state"], "inflight")
            self.assertIn(m.fingerprint(context), self.store.data["advice_history"])
            self.calls.append(copy.deepcopy(context))
            return {"state": "completed", "session_id": "oneshot-test", "text": "PENDENTE: requer contraprova."}

        self.adapter = m.Adapter(self.store, self.gh, advice)

    def test_dispatch_wait_receipt_and_no_change_use_no_model(self):
        self.assertIn("solicitada", self.adapter.tick())
        run = self.gh.add_run(status="queued", conclusion=None)
        self.assertEqual(self.adapter.tick(), "")
        run.update(status="completed", conclusion="success")
        self.assertIn("APROVADO", self.adapter.tick())
        before = (len(self.store.saves), self.gh.log_reads)
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual((len(self.store.saves), self.gh.log_reads), before)
        self.assertEqual(len(self.gh.dispatched), 1)
        self.assertEqual(self.calls, [])

    def test_empty_scope_is_silent_and_no_new_writes_after_baseline(self):
        self.gh.observation = snapshot(heads={})
        self.assertEqual(self.adapter.tick(), "")
        count = len(self.store.saves)
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.store.saves), count)
        self.assertEqual(self.gh.dispatched, [])
        self.assertEqual(self.calls, [])

    def test_dispatch_transport_loss_is_not_retried(self):
        self.gh.dispatch_error = True
        with self.assertRaisesRegex(m.Blocked, "DISPATCH_RECEIPT_UNKNOWN"):
            self.adapter.tick()
        self.assertIn("UNKNOWN", self.adapter.tick())
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.gh.dispatched), 1)
        self.assertEqual(self.calls, [])

    def test_real_yellow_invokes_once_after_durable_pending(self):
        self.adapter.tick()
        self.gh.add_run(conclusion="failure")
        self.gh.raw_logs = receipt(yellow=True)
        self.assertIn("Parecer", self.adapter.tick())
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.calls), 1)

    def test_accepted_update_waits_for_effect_without_redispatch_or_false_green(self):
        self.adapter.tick()
        self.gh.add_run()
        self.gh.raw_logs = effect_receipt()
        message = self.adapter.tick()
        self.assertIn("AWAIT_HEAD_READBACK=1", message)
        self.assertNotIn("🟢 APROVADO", message)
        self.assertNotIn("last_success_fingerprint", self.store.data)
        changed = snapshot()
        changed["prs"][0].update(mergeable=None, mergeable_state="unknown")
        changed["fingerprint"] = m.fingerprint({k: v for k, v in changed.items() if k != "fingerprint"})
        self.gh.observation = changed
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.gh.dispatched), 1)
        self.assertEqual(self.calls, [])

    def test_changed_head_is_observed_before_new_source_reconciliation(self):
        self.adapter.tick()
        self.gh.add_run()
        self.gh.raw_logs = effect_receipt()
        self.adapter.tick()
        self.gh.observation = snapshot(heads={2185: "e" * 40})
        message = self.adapter.tick()
        self.assertIn("HEAD_ADVANCED_CAUSE_UNPROVEN", message)
        self.assertNotIn("🟢 APROVADO", message)
        self.assertNotIn("last_success_fingerprint", self.store.data)
        self.assertIn("solicitada", self.adapter.tick())
        self.assertEqual(len(self.gh.dispatched), 2)
        self.assertEqual(self.calls, [])

    def test_exact_after_head_is_remeasured_but_does_not_certify_ci(self):
        self.adapter.tick()
        self.gh.add_run()
        self.gh.raw_logs = effect_receipt(after="e" * 40)
        self.assertIn("AWAIT_HEAD_READBACK", self.adapter.tick())
        self.gh.observation = snapshot(heads={2185: "e" * 40})
        message = self.adapter.tick()
        self.assertIn("EXPECTED_HEAD_VERIFIED", message)
        self.assertIn("PENDENTE_NAO_MEDIDO", message)
        self.assertNotIn("🟢 APROVADO", message)

    def test_many_unknown_prs_and_one_accepted_effect_never_invoke_model(self):
        self.adapter.tick()
        self.gh.add_run(conclusion="failure")
        self.gh.raw_logs = effect_receipt(unknown=35)
        self.assertIn("AWAIT_HEAD_READBACK=1", self.adapter.tick())
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.gh.dispatched), 1)
        self.assertEqual(self.calls, [])

    def test_incomplete_sources_and_policy_boundaries_never_invoke_model(self):
        for reason in ("PRIMARY_SOURCE_OR_HUNK_UNPROVEN", "ROOT_AUTOMATION_REQUIRES_PROVEN_COMPATIBLE_COMPOSITION", "KNOWN_POLICY_MISSING_PRIMARY_SOURCE_OR_PRESERVE_RULE"):
            with self.subTest(reason=reason):
                self.setUp()
                self.adapter.tick()
                self.gh.add_run(conclusion="failure")
                self.gh.raw_logs = receipt(yellow=True, reason=reason)
                self.assertIn("PENDENTE", self.adapter.tick())
                self.assertEqual(self.calls, [])

    def test_drifted_head_never_invokes_model(self):
        self.adapter.tick()
        self.gh.add_run(conclusion="failure")
        self.gh.raw_logs = receipt(yellow=True, source="e" * 40)
        self.adapter.tick()
        self.assertEqual(self.calls, [])

    def test_unknown_advice_blocks_new_fingerprint(self):
        self.store.data["advice"] = {"fingerprint": "f" * 64, "state": "unknown"}
        self.adapter.tick()
        self.gh.add_run(conclusion="failure")
        self.gh.raw_logs = receipt(yellow=True)
        self.assertIn("PREVIOUS_ADVICE", self.adapter.tick())
        self.assertEqual(self.calls, [])

    def test_startup_failure_is_quiet_but_new_source_can_dispatch(self):
        self.adapter.tick()
        self.gh.add_run(conclusion="startup_failure")
        self.gh.raw_logs = m.Blocked("WORKFLOW_LOGS_UNAVAILABLE")
        self.assertIn("PENDENTE", self.adapter.tick())
        self.assertEqual(self.adapter.tick(), "")
        self.gh.observation = snapshot(main="e" * 40)
        self.assertIn("solicitada", self.adapter.tick())
        self.assertEqual(len(self.gh.dispatched), 2)
        self.assertEqual(self.calls, [])

    def test_manual_rerun_of_same_native_run_is_observed(self):
        self.adapter.tick()
        run = self.gh.add_run(conclusion="startup_failure")
        self.gh.raw_logs = m.Blocked("WORKFLOW_LOGS_UNAVAILABLE")
        self.adapter.tick()
        run.update(run_attempt=2, conclusion="success")
        self.gh.raw_logs = receipt()
        self.assertIn("APROVADO", self.adapter.tick())
        self.assertEqual(len(self.gh.dispatched), 1)

    def test_main_race_waits_for_terminal_then_reanchors(self):
        self.adapter.tick()
        run = self.gh.add_run(status="in_progress", conclusion=None, main="e" * 40)
        self.gh.observation = snapshot(main="e" * 40)
        self.assertEqual(self.adapter.tick(), "")
        self.assertEqual(len(self.gh.dispatched), 1)
        run.update(status="completed", conclusion="success")
        self.assertIn("obsoleta", self.adapter.tick())
        self.assertNotIn("last_success_fingerprint", self.store.data)
        self.assertIn("solicitada", self.adapter.tick())
        self.assertEqual(len(self.gh.dispatched), 2)

    def test_missing_workflow_path_is_not_assumed(self):
        self.adapter.tick()
        run = self.gh.add_run()
        del run["path"]
        self.assertIn("IDENTITY", self.adapter.tick())
        self.assertEqual(self.gh.log_reads, 0)
        self.assertNotIn("last_success_fingerprint", self.store.data)

    def test_receipt_requires_protected_scope_and_terminal_marker(self):
        with self.assertRaises(m.Blocked):
            m.parse_receipt(receipt(protected=[1562]))
        with self.assertRaises(m.Blocked):
            m.parse_receipt(receipt().replace("HOUSE_PR_RECONCILE=PASS", ""))
        with self.assertRaises(m.Blocked):
            m.parse_receipt(receipt(protected=[{}]))


class BoundaryTests(unittest.TestCase):
    def test_output_overrides_legacy_pipe_encoding_in_this_process(self):
        stdout_bytes, stderr_bytes = io.BytesIO(), io.BytesIO()
        out = io.TextIOWrapper(stdout_bytes, encoding="cp1252")
        err = io.TextIOWrapper(stderr_bytes, encoding="cp1252")
        with patch.object(m.sys, "stdout", out), patch.object(m.sys, "stderr", err):
            m.configure_output()
            out.write("🪬 Reconciliação\n")
            err.write("🟡 PENDENTE\n")
            out.flush()
            err.flush()
        self.assertEqual(stdout_bytes.getvalue().replace(b"\r\n", b"\n"), "🪬 Reconciliação\n".encode("utf-8"))
        self.assertEqual(stderr_bytes.getvalue().replace(b"\r\n", b"\n"), "🟡 PENDENTE\n".encode("utf-8"))
        out.detach()
        err.detach()

    def test_bash_path_maps_windows_drive_and_keeps_spaces_as_data(self):
        self.assertEqual(m.InventoryOwner.bash_path(PureWindowsPath(r"C:\Users\Nome Com Espaco\CentralDark-Core")),
                         "/c/Users/Nome Com Espaco/CentralDark-Core")
        self.assertEqual(m.InventoryOwner.bash_path(PureWindowsPath(r"F:\CentralDark\CentralDark-Core")),
                         "/f/CentralDark/CentralDark-Core")
        self.assertEqual(m.InventoryOwner.bash_path(PurePosixPath("/srv/Nome Com Espaco/Core")),
                         "/srv/Nome Com Espaco/Core")

    def test_inventory_runs_on_delta_and_daily_but_not_every_tick(self):
        store = Store()
        gh = GH(store)
        day = ["2026-11-27"]
        class Inventory:
            calls = 0
            def probe(self):
                return {"local_head": HEAD, "owner_blob": MAIN}
            def collect(self, observation, probe):
                self.calls += 1
                return {"status": "APROVADO", "ref": "/state/centraldark-inventory-reconcile.json", "fingerprint": "f" * 64}
        inventory = Inventory()
        adapter = m.Adapter(store, gh, lambda _: self.fail("No model expected"), inventory, today=lambda: day[0])
        adapter.tick()
        gh.add_run(status="queued", conclusion=None)
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(inventory.calls, 1)
        day[0] = "2026-11-28"
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(inventory.calls, 2)
        self.assertEqual(len(gh.dispatched), 1)

    def test_inventory_failure_does_not_claim_global_green_or_stop_costura(self):
        store = Store()
        gh = GH(store)
        class Inventory:
            def probe(self):
                return {"local_head": HEAD}
            def collect(self, observation, probe):
                raise m.Blocked("INVENTORY_OWNER_BLOCKED")
        adapter = m.Adapter(store, gh, lambda _: self.fail("No model expected"), Inventory())
        self.assertIn("INVENTORY_OWNER_BLOCKED", adapter.tick())
        gh.add_run()
        message = adapter.tick()
        self.assertIn("COSTURA concluída", message)
        self.assertNotIn("🟢 APROVADO", message)
        self.assertIn("🟡 PENDENTE", message)
        self.assertEqual(len(gh.dispatched), 1)

    def test_inventory_lock_retry_is_bounded_silent_and_preserves_last_good(self):
        store, day = Store(), ["2026-11-27"]
        gh = GH(store)
        class Inventory:
            calls = 0
            fail = False
            def probe(self):
                return {"local_head": HEAD}
            def collect(self, observation, probe):
                self.calls += 1
                if self.fail:
                    raise m.Blocked("INVENTORY_WRITER_BUSY")
                return {"status": "APROVADO", "ref": "/state/centraldark-inventory-reconcile.json", "fingerprint": "f" * 64}
        inventory = Inventory()
        adapter = m.Adapter(store, gh, lambda _: self.fail("No model expected"), inventory, today=lambda: day[0])
        adapter.tick()
        gh.add_run(status="queued", conclusion=None)
        inventory.fail, day[0] = True, "2026-11-28"
        self.assertIn("INVENTORY_WRITER_BUSY", adapter.tick())
        self.assertEqual(store.data["inventory"]["last_good"]["fingerprint"], "f" * 64)
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(inventory.calls, 4)  # One successful baseline + three retries.
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(inventory.calls, 4)
        self.assertNotIn("retry_attempts", m.inventory_report(store.data["inventory"]))
        self.assertEqual(len(gh.dispatched), 1)

    def test_inventory_transient_error_recovers_on_next_tick(self):
        store, gh = Store(), None
        gh = GH(store)
        class Inventory:
            calls = 0
            def probe(self):
                return {"local_head": HEAD}
            def collect(self, observation, probe):
                self.calls += 1
                if self.calls == 1:
                    raise m.Blocked("INVENTORY_OWNER_TIMEOUT")
                return {"status": "APROVADO", "ref": "/state/centraldark-inventory-reconcile.json", "fingerprint": "f" * 64}
        inventory = Inventory()
        adapter = m.Adapter(store, gh, lambda _: self.fail("No model expected"), inventory)
        self.assertIn("INVENTORY_OWNER_TIMEOUT", adapter.tick())
        gh.add_run(status="queued", conclusion=None)
        self.assertIn("APROVADO", adapter.tick())
        self.assertEqual(inventory.calls, 2)
        self.assertEqual(adapter.tick(), "")
        self.assertEqual(inventory.calls, 2)

    def test_inventory_git_status_disables_optional_index_writes(self):
        with tempfile.TemporaryDirectory() as tmp:
            owner = Path(tmp) / m.INVENTORY_OWNER
            owner.parent.mkdir(parents=True)
            owner.write_bytes(b"#!/bin/bash\n")
            calls = []
            def runner(argv, **kwargs):
                calls.append(argv)
                return {"code": 0, "timeout": False, "out": HEAD if "rev-parse" in argv else " M tracked.py\0", "err": ""}
            m.InventoryOwner(runner, object(), repo=tmp, bash="git-bash").probe()
            status = next(args for args in calls if "status" in args)
            self.assertIn("--no-optional-locks", status[:status.index("status")])

    def test_inventory_verifies_owner_then_reads_only_canonical_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            owner = Path(tmp) / m.INVENTORY_OWNER
            owner.parent.mkdir(parents=True)
            owner.write_bytes(b"#!/bin/bash\n# canonical inventory\n")
            blob = hashlib.sha1(b"blob " + str(owner.stat().st_size).encode() + b"\0" + owner.read_bytes()).hexdigest()
            metadata = {"type": "file", "sha": blob}
            class API:
                def api(self, path):
                    self.path = path
                    return metadata
            api = API()
            calls = []
            data = {"schema": "centraldark.reconcile.v1", "sources": {
                "github_main": {"status": "CONNECTED", "sha": MAIN},
                "dirty": {"status": "CONNECTED", "changed_count": 7}},
                "owners": {"scripts/centraldark-inventory-reconcile.sh": {"status": "EXISTS"}},
                "duplicates": {"fingerprint": "f" * 64, "partial": False},
                "pulse": {"sha": BASE}, "replay": {"preserved": True}}
            def runner(argv, **kwargs):
                calls.append((argv, kwargs))
                if argv[-1] == "--inventory":
                    out = "RECEIPT=/canonical/centraldark-inventory-reconcile.json\n"
                else:
                    out = json.dumps(data)
                return {"code": 0, "timeout": False, "out": out, "err": ""}
            inventory = m.InventoryOwner(runner, api, repo=tmp, bash="git-bash")
            probe = {"owner_blob": blob, "local_head": HEAD}
            report = inventory.collect(snapshot(), probe)
            self.assertEqual(report["dirty_count"], 7)
            self.assertFalse(report["repair_performed"])
            self.assertEqual(report["host_scope"], "Casa/local")
            self.assertEqual(report["remote_vps"], "UNKNOWN")
            self.assertEqual(calls[0][0][-1], "--inventory")
            self.assertEqual(calls[0][1]["env_overrides"]["CENTRALDARK_ROOT"],
                             m.InventoryOwner.bash_path(Path(tmp) / "CentralDark-Core"))
            self.assertEqual(calls[0][1]["env_overrides"]["PYTHONUTF8"], "1")
            self.assertEqual(calls[0][1]["env_overrides"]["PYTHONIOENCODING"], "utf-8")
            self.assertEqual(calls[0][1]["env_overrides"]["PYTHON_BIN"],
                             m.InventoryOwner.bash_path(Path(m.sys.executable)))
            self.assertEqual(calls[1][0][-1], "/canonical/centraldark-inventory-reconcile.json")
            self.assertNotIn("--pulse", str(calls))
            metadata["sha"] = "e" * 40
            before = len(calls)
            with self.assertRaisesRegex(m.Blocked, "DIFFERS_FROM_MAIN"):
                inventory.collect(snapshot(), probe)
            self.assertEqual(len(calls), before)

    def test_cli_advice_uses_stdin_empty_tools_and_no_bypass(self):
        calls = []

        def runner(argv, **kwargs):
            calls.append((argv, kwargs))
            return {"code": 0, "timeout": False, "err": "", "out": json.dumps({"type": "result", "session_id": "s1", "exit_code": 0,
                    "text": "Proposta; testes pendentes.", "tokens": {"input": 7, "output": 9, "total": 16}})}

        result = m.HermesAdvice(runner)({"untrusted": "$(do-not-run) `data`"})
        args, kw = calls[0]
        self.assertEqual(args[args.index("--toolsets") + 1], "")
        self.assertEqual(args[args.index("--max-turns") + 1], "1")
        self.assertEqual(args[args.index("--query-file") + 1], "-")
        self.assertNotIn("-z", args)
        self.assertNotIn("--yolo", args)
        self.assertNotIn("--run-budget", args)
        self.assertIn("$(do-not-run)", kw["input_text"])
        self.assertEqual(result["state"], "completed")
        self.assertEqual(result["tokens_reported"]["total"], 16)

    def test_timeout_or_failed_envelope_is_unknown_not_zero_spend(self):
        for timeout, code, out in ((True, None, "partial"), (False, 1, json.dumps({"type": "result", "session_id": "s1", "exit_code": 1})), (False, 0, "not-json")):
            with self.subTest(timeout=timeout, code=code):
                def runner(argv, **kwargs):
                    return {"code": code, "timeout": timeout, "out": out, "err": "Session: session-123\n"}
                result = m.HermesAdvice(runner)({})
                self.assertEqual(result["state"], "unknown")
                self.assertNotIn("tokens_reported", result)

    def test_native_notepad_only_exact_missing_key_initializes(self):
        def missing(argv, **kwargs):
            return {"code": 1, "timeout": False, "out": f"No notepad key '{m.NOTE_KEY}' for job {m.JOB_ID}.\n", "err": ""}
        self.assertEqual(m.NotepadStore(missing).load(), {"schema": m.SCHEMA})
        for text in ("permission denied", '{"schema":"another-owner"}'):
            def bad(argv, **kwargs):
                return {"code": 1 if text == "permission denied" else 0, "timeout": False, "out": text, "err": ""}
            with self.assertRaises(m.Blocked):
                m.NotepadStore(bad).load()

    def test_native_notepad_writes_then_reads_back_exact_value(self):
        saved, calls = {}, []
        def runner(argv, **kwargs):
            calls.append(argv)
            if argv[4] == "set":
                saved["value"] = argv[6]
                return {"code": 0, "timeout": False, "out": "Set.", "err": ""}
            return {"code": 0, "timeout": False, "out": saved["value"], "err": ""}
        m.NotepadStore(runner).save({"schema": m.SCHEMA})
        self.assertEqual([a[4] for a in calls], ["set", "get"])
        self.assertEqual({a[5] for a in calls}, {m.NOTE_KEY})

    def test_source_blob_is_verified_before_model_context(self):
        raw = b"answer = 42\n"
        sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
        payload = {"type": "file", "encoding": "base64", "size": len(raw), "sha": sha, "content": base64.b64encode(raw).decode()}
        def runner(argv, **kwargs):
            return {"code": 0, "timeout": False, "out": json.dumps(payload), "err": ""}
        gh = m.GitHub(runner)
        self.assertEqual(gh.source("file.py", MAIN)["blob"], sha)
        payload["sha"] = "f" * 40
        with self.assertRaisesRegex(m.Blocked, "READBACK_MISMATCH"):
            gh.source("file.py", MAIN)
        with self.assertRaises(m.Blocked):
            gh.source("../secret", MAIN)


if __name__ == "__main__":
    unittest.main()
