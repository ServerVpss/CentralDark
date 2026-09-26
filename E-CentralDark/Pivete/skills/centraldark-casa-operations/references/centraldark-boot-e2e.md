# CentralDark Boot E2E Verification

## Purpose
This reference documents the steps and expected receipt for verifying that the CentralDark engine automatically registers the `ZORD_WORKFLOW_DEDUPE` capability and executes all required loops at each `!CENTRALDARK` boot.

## Prerequisites
* A clean checkout of `ServerVpss/CentralDark` at the `main` branch.
* No dangling processes from previous engines.
* `hermes` executable available in the current `PATH`.

## Steps
1. **Open a fresh terminal or agent instance.** Replace any running Hermes process so that the environment is pristine.
2. **Ensure the repository is up‑to‑date**
   ```bash
   git fetch origin
   git checkout main
   git reset --hard origin/main
   ```
3. **Start the agent and wait for the bootstrap to finish.** `hermes` should emit the sequence:
   - `engine_register: ZORD_WORKFLOW_DEDUPE`
   - `capability_router: MEGAZORD-CENTRALDARK`
   - `self_healing_sweep: PASS`
   - `dedupe_radar_when_material: PASS`
   - `meta_lupa: PASS`
   - `receipt: <base64‑checksum>`
   - `next_cursor: <SHA>` or `FIXED_POINT`
4. **Execute the command**
   ```text
   !CENTRALDARK
   ```
5. **Wait for the receipt**. The output should contain a line that starts with `receipt:` and include a SHA‑256 hash or base64 representation.
6. **Confirm the next cursor**. If the operation is still in progress, the receipt will include `next_cursor: <sha>` pointing to the next state. A fixed point will be indicated by `fixed_point: true`.

## Validation
​Verify that the receipt matches the content of `CENTRALDARK_AI_BOOT.yaml` and the `ENGINE_BINDING.yml` flags in the repository. The presence of `RUN_SELF_HEALING_FAILURE_SWEEP` and `RUN_WORKFLOW_FUNCTION_JOB_RUNNER_DEDUPE_RADAR_WHEN_MATERIAL` in the receipt confirms that the boot contract is honored.

## Common Pitfalls
* **Residual Hermes processes**: They may cache bindings; ensure they are terminated before testing.
* **Branch mis‑alignment**: The test must be executed on the `main` branch; using a feature branch will lead to different bindings.
* **Missing `hermes` dependency**: Make sure the `hermes` binary is in `PATH`.

## Expected Output Sample
```text
engine_register: ZORD_WORKFLOW_DEDUPE
capability_router: MEGAZORD-CENTRALDARK
self_healing_sweep: PASS
......
receipt: kG2pJgT9u2EwU...
next_cursor: 1a2b3c4d5e6f...
```

If any of the `PASS` lines are `FAIL` or missing, investigate the corresponding section in `ENGINE_BINDING.yml` or `CENTRALDARK_AI_BOOT.yaml` for missing flags or misconfigurations.
