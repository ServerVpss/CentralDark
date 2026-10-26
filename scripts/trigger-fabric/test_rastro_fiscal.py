#!/usr/bin/env python3
import hashlib
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
    @staticmethod
    def valid_note(creation="2026-10-01T10:00:00-03:00"):
        body = (
            "---\n"
            f"data_criacao: {creation}\n"
            "ultima_atualizacao: 2026-10-26T13:10:00-03:00\n"
            "ultima_modificacao: 2026-10-26T13:10:00-03:00\n"
            "ultima_verificacao: 2026-10-26T13:11:00-03:00\n"
            "fuso_horario: America/Sao_Paulo\n"
            "hash_conteudo: \n"
            "rastro: OWNER+RUN+READBACK\n"
            "grupo_notas: GRUPO_05\n"
            "relacionado_a: docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md\n"
            "estado_evidencia: PASS\n"
            "---\n"
            "# Nota de teste\n"
        )
        digest = hashlib.sha256(body.encode("utf-8")).hexdigest()
        return body.replace("hash_conteudo: \n", f"hash_conteudo: sha256:{digest}\n")

    def test_note_metadata_hash_and_group_pass(self):
        text = self.valid_note()
        r = M.verify_note_metadata(text, "notes/test.md")
        self.assertEqual("PASS", r["verdict"])
        self.assertFalse(r["modified_note"])
        self.assertEqual("GRUPO_05", r["grupo_notas"])
        self.assertEqual(text, self.valid_note())

    def test_note_changed_without_hash_refresh_fails(self):
        r = M.verify_note_metadata(self.valid_note() + "mudanca nao reconciliada")
        self.assertEqual("FAIL", r["verdict"])
        self.assertTrue(any(c["name"] == "note_hash" and c["verdict"] == "FAIL" for c in r["checks"]))

    def test_note_without_required_metadata_fails(self):
        r = M.verify_note_metadata("---\ntitle: legado\n---\n# Conteudo")
        self.assertEqual("FAIL", r["verdict"])
        self.assertIn("ultima_verificacao", r["missing_fields"])

    def test_note_unknown_creation_is_not_fake_pass(self):
        r = M.verify_note_metadata(self.valid_note(creation="UNKNOWN"))
        self.assertEqual("UNKNOWN", r["verdict"])
        self.assertTrue(any(c["name"] == "note_creation_provenance" for c in r["checks"]))

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
        self.assertTrue(any(c.name == "ledger_active" and c.verdict == "FAIL" for c in r.checks))

    def test_link_repo_mismatch_fails(self):
        text = traced_text().replace(
            f"https://github.com/{REPO}/commit/",
            "https://github.com/outro/repo/commit/",
        )
        r = M.verify_text(text, REPO, backend())
        self.assertEqual("FAIL", r.verdict)

    def test_ledger_exact_comment_ref_is_checked_directly(self):
        class ExactCommentBackend(M.GitHubBackend):
            def __init__(self):
                super().__init__(REPO)
                self.calls = []

            def _gh(self, endpoint):
                self.calls.append(endpoint)
                if endpoint == "repos/ServerVpss/CentralDark/issues/comments/5850127935":
                    return {"body": f"receipt commit {FULL}"}
                raise AssertionError(f"unexpected endpoint: {endpoint}")

        b = ExactCommentBackend()
        self.assertTrue(
            b.ledger_has_sha(
                FULL,
                1562,
                "https://github.com/ServerVpss/CentralDark/pull/1562#issuecomment-5850127935",
            )
        )
        self.assertEqual(
            ["repos/ServerVpss/CentralDark/issues/comments/5850127935"],
            b.calls,
        )

    def test_ledger_over_100_comments_starts_from_newest_page(self):
        class PaginatedBackend(M.GitHubBackend):
            def __init__(self):
                super().__init__(REPO)
                self.calls = []

            def _gh(self, endpoint):
                self.calls.append(endpoint)
                if endpoint == "repos/ServerVpss/CentralDark/issues/1562":
                    return {"comments": 299}
                if endpoint.endswith("comments?per_page=100&page=3"):
                    return [{"body": "old"} for _ in range(98)] + [{"body": f"receipt {FULL}"}]
                if "comments?per_page=100&page=" in endpoint:
                    return [{"body": "older"}]
                raise AssertionError(f"unexpected endpoint: {endpoint}")

        b = PaginatedBackend()
        self.assertTrue(b.ledger_has_sha(FULL, 1562))
        self.assertIn("comments?per_page=100&page=3", b.calls[1])
        self.assertEqual(2, len(b.calls))


    def test_local_shell_gap_requires_cross_surface_handoff(self):
        text = "Sem shell nesta superficie; TLC23 BLOCKED terminal; fronteira real."
        r = M.verify_text(text, REPO, backend(main=FULL))
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(any(c.name == "local_blocker_requires_cross_surface_handoff" and c.verdict == "FAIL" for c in r.checks))

    def test_local_shell_gap_with_handoff_evidence_is_not_failed_by_that_rule(self):
        text = (
            "Sem shell nesta superficie; blocker local. "
            "LOCAL_BLOCKED_IS_NOT_GLOBAL_BLOCKER=true "
            "CAPABILITY_HANDOFF=CASA -> SSH -> VPS "
            "ROTAS_TENTADAS=local_shell,mcp_catalog,casa_handoff"
        )
        r = M.verify_text(text, REPO, backend(main=FULL))
        self.assertFalse(any(c.name == "local_blocker_requires_cross_surface_handoff" and c.verdict == "FAIL" for c in r.checks))

    def test_response_without_trace_contract_is_executable(self):
        self.assertEqual("INVALID", M.RESPONSE_WITHOUT_TRACE)
        r = M.verify_text("Gravei a regra na main.", REPO, backend())
        self.assertEqual("FAIL", r.verdict)
        self.assertTrue(
            any(
                c.name == "write_claim_has_trace"
                and "RESPONSE_WITHOUT_TRACE=INVALID" in c.detail
                for c in r.checks
            )
        )


if __name__ == "__main__":
    unittest.main()
