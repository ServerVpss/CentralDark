# Self-hosted runner Git auth failure (CentralDark VPS)

Use when a CentralDark deploy workflow running on `runs-on: [self-hosted, Linux]` fails with Git credential errors instead of script or diff failures.

## Symptom fingerprint

```
fatal: could not read Username for 'https://github.com': No such device or address
exit code 128
```

appearing during `git fetch --prune origin main`, `git fetch --no-tags origin main`, or any `git` operation against `origin` inside the deploy step.

## This is NOT

- ENOBUFS / buffer overflow — that is a Node `spawnSync`/`execFileSync` `maxBuffer` problem, a different failure mode.
- Missing script — the workflow step references the script, the script exists, the step still fails before reaching the script's logic.
- Large diff — the failure happens on fetch, before any diff is computed.

## First diagnostic moves

1. **Confirm the runner that should have run the job.**

   ```bash
   gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | {id,name,status,busy,labels:[.labels[].name]}'
   ```

   Pay attention to `status` and `busy`. A runner offline or busy explains why a job may have queued or routed elsewhere.

2. **Check deploy keys on the repo.**

   ```bash
   gh api repos/ServerVpss/CentralDark/keys
   ```

   An empty array `[]` means no deploy keys are configured. That is relevant context for why HTTPS auth may be failing on the runner; it is not, by itself, a fix.

3. **Read the failing step's log, not only the final error line.**

   ```bash
   gh run view RUN_ID --log | rg -n "fatal:|remote add origin|git remote|git fetch|ORIGIN_URL"
   ```

   Look for whether the log shows `git remote add origin https://github.com/ServerVpss/CentralDark` (plain HTTPS, no token) before the failure. That sequence is the tell that the runner is attempting HTTPS without a credential.

## Why this happens on self-hosted runners

The workflow step may check out a fresh copy via `actions/checkout@v7` into a workflow workspace (for example `.ci-operational-guards/`), but the deploy script it calls often targets an existing checkout at a fixed path such as `/root/CentralDark`. That existing checkout carries its own remote configuration. If the remote was set to plain HTTPS without an embedded token, and the runner environment has no credential helper or deploy key that Git can use non-interactively, `git fetch origin ...` surfaces the credential prompt as a fatal error.

## What to verify before proposing a fix

- Which remote URL the runner's checkout actually has: `git remote get-url origin` inside the runner checkout.
- Whether the same runner succeeded before and what changed since (remote URL, credential store, SSH key, token rotation, runner reinstallation).
- Whether the workflow path filter and `on:` trigger actually match the event that should have fired; a push to `main` that touches no watched path will not start the deploy workflow even if the file exists.

## Do not

- Guess ENOBUFS and start raising `maxBuffer` before confirming the log shows a credential prompt.
- Assume the workflow's `actions/checkout` step fixed the remote for the pre-existing runner checkout.
- Treat an empty deploy-keys response as a fixable-by-skill condition; that is a repo/Secrets/SSH configuration decision for the owner.
