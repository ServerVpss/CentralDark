#!/usr/bin/env python3
import importlib.util
import pathlib
import sys
import unittest

MODULE_PATH = pathlib.Path(__file__).with_name("rastro_fiscal.py")
SPEC = importlib.util.spec_from_file_location("rastro_fiscal", MODULE_PATH)
M = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = M
SPEC.loader.exec_module(M)

FULL = "a" * 40
PATH = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md"
REPO = "ServerVpss/CentralDark"


def backend(content="OWNER=AGENTS.md\nTRACE_PRESENT != TRACE_VALID\n", *, main=FULL, ledger=True, unavailable=False):
    return M.FakeBackend(
        commits={FULL: {PATH: content}},
        main=main,
        ledger={FULL} if ledger else set(),
        unavailable=unavailable,
    )


def traced_text(sha=FULL, path=PATH, readback="TRACE_PRESENT != TRACE_VALID", current=None):
    current_line = f"CURRENT_MAIN={current}\n" if current else ""
    return (
        "Gravei direto na main.\n"
        f"{current_line}"
        f"COMMIT_SHA={sha}\n"
        f"PATH={path}\n"
        f"LINK=https://github.com/{REPO}/commit/{sha}\n"
        f"READBACK={readback}\n"
        "LEDGER_REF=#1562\n"
    )


class RastroFiscalTests(unittest.TestCase):
    def test_true_complete_trace_passes(self):
        r = M.verify_text(traced_text(), REPO, backend())
        self.assertEqual("PASS", r.verdict)

    def test_fake_commit_fails(self):
        r = M.verify_text(traced_text(sha="b" * 40), REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "commit_exists" and c.verdict == "FAIL" for c in r.checks))

    def test_false_path_fails(self):
        r = M.verify_text(traced_text(path="docs/NAO-EXISTE.md"), REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "path_at_commit" and c.verdict == "FAIL" for c in r.checks))

    def test_content_does_not_support_claim_fails(self):
        r = M.verify_text(traced_text(readback="FRASE QUE NAO EXISTE"), REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "readback_supports_claim" and c.verdict == "FAIL" for c in r.checks))

    def test_old_head_presented_as_current_fails(self):
        old = "c" * 40
        r = M.verify_text(traced_text(current=old), REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "current_main" and c.verdict == "FAIL" for c in r.checks))

    def test_gravei_without_trace_fails(self):
        r = M.verify_text("Gravei a regra na main.", REPO, backend())
        self.assertEqual("FAIL", r.verdict)

    def test_memory_without_location_fails(self):
        r = M.verify_text("Salvei isso na memória.", REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "memory_location" and c.verdict == "FAIL" for c in r.checks))

    def test_github_unavailable_is_unknown(self):
        r = M.verify_text(traced_text(), REPO, backend(unavailable=True))
        self.assertEqual("UNKNOWN", r.verdict)

    def test_direct_main_without_ledger_fails(self):
        r = M.verify_text(traced_text(), REPO, backend(ledger=False))
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "ledger_1562" and c.verdict == "FAIL" for c in r.checks))

    def test_link_repo_mismatch_fails(self):
        text = traced_text().replace(
            f"https://github.com/{REPO}/commit/",
            "https://github.com/outro/repo/commit/",
        )
        r = M.verify_text(text, REPO, backend())
        self.assertEqual("FAIL", r.verdict)


if __name__ == "__main__":
    unittest.main()
