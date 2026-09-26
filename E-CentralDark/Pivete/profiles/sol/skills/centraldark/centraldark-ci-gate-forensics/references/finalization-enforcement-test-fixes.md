# Finalization Enforcement Test Fixes — recipe bank (CentralDark)

Condensed from real incident (Aug 29, 2026). Two test failures in
`apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs` blocking CI on
`Juiz determinístico` / `porta-de-entrada`.

## Failure 1 — T14 Executor: aprender não engole falha do ledger

**Test assertion (line 119):**
```js
assert.doesNotMatch(trecho, /registrarNoLedger\([^\n]+\)\s*;?\s*\}\s*catch\s*\{\s*\}/);
```

**Root cause:** `agent.mjs` had an empty catch block that swallowed ledger failures:
```js
registrarNoLedger('licao', `hermes-runtime cat=${categoria}`, '-', licao, 'hermes');
} catch {}
```

**Minimal fix in `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`:**
```js
try {
  registrarNoLedger('licao', `hermes-runtime cat=${categoria}`, '-', licao, 'hermes');
} catch (e) {
  return { ok: false, saida: `falha ao registrar no ledger: ${e.message.slice(0, 200)}` };
}
```

**Why it matters:** The test enforces that ledger failures are NOT silently swallowed — JSON
persistence without ARSENAL ledger is not "complete success". The fix makes the failure
explicit and returns `ok: false` so the gate correctly blocks.

**Contraproof:** Run the test locally — must PASS. Plant a ledger write failure (e.g.
permissions on `ARSENAL_APRENDIZADOS`) → Executor returns `ok: false` with message
containing `falha ao registrar no ledger`.

---

## Failure 2 — T14 Executor: commit_push falha fechado e só fica verde após ler o HEAD remoto

**Test assertion (line 132):**
```js
assert.match(trecho, /set -o pipefail/);
```

**Root cause:** The bash command string had `set -o pipefail;` (with semicolon). The test
regex expects exactly `set -o pipefail` without trailing semicolon.

**Minimal fix in `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`:**
```js
const comando = `set -o pipefail cd ${ROOT} && ${add} && git commit -m "${msg}" && ...`
//                                                                 ^ no semicolon
```

**Why it matters:** The test validates that the fail-closed pattern uses `set -o pipefail`
so any command failure in the pipeline aborts immediately. The semicolon made it a
separate statement, technically valid but not matching the expected pattern that proves
intent.

**Contraproof:** Run the test locally — must PASS. Plant a push failure (offline remote) →
Executor returns `ok: false` with `REMOTE_HEAD_VERIFIED=false` and exit code 23 path
taken.

---

## General pattern for finalization-enforcement test fixes

These tests are **executable documentation** of the Casa's fail-closed contract. When a
test fails:

1. **Read the test assertion first** — it states the exact invariant that must hold.
2. **Find the source code slice** the test inspects (`executorSource.indexOf(...)`).
3. **Make the minimal change** to satisfy the invariant — no refactoring, no extra logic.
4. **Run the single test** (`node --test <file> --test-name-pattern="T14"`) to confirm.
5. **Run the full suite** to ensure no regression.

Common invariants enforced:
- No empty catch swallowing critical persistence (ledger, receipts, state).
- `set -o pipefail` present in any multi-command pipeline that must fail-closed.
- `REMOTE_HEAD_VERIFIED=<40-char-sha>` emitted and checked before green.
- Read-back of BOTH destinations (JSON + ARSENAL) before declaring learning persisted.
- `exit 23` on push failure with rebase abort path, not silent success.

---

## Acceptance gate for this class of fix

A fix is accepted ONLY when:
- `node --test apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs` → 12/12 PASS
- No other HERMES-CORE test suite regresses (run all `*.test.mjs` in the module).