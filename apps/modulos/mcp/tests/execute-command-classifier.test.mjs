// #OBSERVACOES# @owner=apps/modulos/mcp/tests/execute-command-classifier.test.mjs @doc_ref=apps/modulos/mcp/docs/ARQUITETURA.md @last_updated=2026-10-24T07:49:48.830Z @estado=BRANCH_IMPLEMENTADO @pendente=CI_E_READBACK @next_cursor=PR_CI_READBACK
import assert from "node:assert/strict";
import test from "node:test";
import { isSafeReadOnlyExecuteCommand } from "../src/tools/vps/vps-lazy.js";

test("allowlist accepts only exact simple read-only literals", () => {
  for (const command of [
    "hostname",
    "pwd",
    "git status",
    "git status --short",
    "git log --oneline",
    "git log --oneline -n 10",
    "ls",
    "ls -l",
    "echo read-only probe 2026",
  ]) {
    assert.equal(isSafeReadOnlyExecuteCommand(command), true, command);
  }
});

test("classifier rejects shell composition, expansion, redirects and unlisted args", () => {
  for (const command of [
    "hostname; rm -rf /tmp/not-safe",
    "git status && cat ~/.ssh/id_rsa",
    "git status > /tmp/output",
    "echo $(id)",
    "echo ${HOME}",
    "ls /etc",
    "sudo hostname",
    "git log --oneline -n 100",
    "hostname\nprintf bad",
    " hostname",
    "hostname ",
    "",
    null,
    7,
  ]) {
    assert.equal(isSafeReadOnlyExecuteCommand(command), false, String(command));
  }
});
