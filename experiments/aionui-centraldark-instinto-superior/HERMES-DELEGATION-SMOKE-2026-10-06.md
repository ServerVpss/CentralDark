# HERMES-DELEGATION-SMOKE-2026-10-06

TEST_ID=HERMES_ORIGINAL_DELEGATED_COMMIT_01
EXECUTOR=Hermes Agent
ENGINE_USED=copilot/gpt-4.1
TARGET_PR=#1748
START_HEAD=8e8b293cc4eff4612003456ea5c25ee32157f853
scope=documentation-only proof
invariant MODEL_IS_ENGINE_NOT_OWNER=true
invariant ACTION_IS_NOT_PROOF=true
invariant ONE_WRITER_PER_SCOPE=true

## Proof
- Hermes Agent used direct terminal commands for every material step.
- This file was written and committed exclusively by Hermes Agent.
- Scope is documentation-only, ONE_WRITER_PER_SCOPE preserved, no parallel logic/owner.

## Replay Recipe
- Bind to PR head 8e8b293cc4eff4612003456ea5c25ee32157f853 on branch prototype/aionui-centraldark-instinto-superior-20261003.
- Start with a clean worktree in /tmp/centraldark-hermes-delegation-1748.
- Use Hermes terminal tools to create only this file.
- Run "git diff --check" to validate.
- Stage and commit ONLY_FILE with message: test(hermes): prove delegated commit path
- Immediately before push, verify remote head for branch is unchanged; else abort.
- Push commit to origin/prototype/aionui-centraldark-instinto-superior-20261003.
- GitHub readback: confirm commit, file, and branch HEAD updated as expected.
- NEXT_CURSOR=external GitHub readback of commit/file/PR head
