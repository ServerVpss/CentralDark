# Rerunning Failed/Skipped GitHub Actions Workflows

When working with the CentralDark repository, you may need to rerun failed or skipped workflows (e.g., after fixing a dependency issue or correcting a configuration).

## Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Access to the repository (read/write for workflow reruns)

## Steps

### 1. List failed or skipped workflows for the current branch
```bash
gh run list --branch <branch-name> --limit 100 --json databaseId,status,conclusion -q '.[] | select(.conclusion=="failure" or .conclusion=="skipped") | .databaseId'
```
Replace `<branch-name>` with the target branch (e.g., `fix/dependabot-radix-group-rebase`).

### 2. Rerun each workflow
You can rerun workflows individually or in a loop.

#### Individual rerun
```bash
gh run rerun <workflow-run-id>
```

#### Batch rerun (bash loop)
```bash
for id in $(gh run list --branch <branch-name> --limit 100 --json databaseId,status,conclusion -q '.[] | select(.conclusion=="failure" or .conclusion=="skipped") | .databaseId'); do
  gh run rerun "$id"
done
```
**Note:** If a workflow is currently running, `gh run rerun` will fail with an error like "This workflow is already running". Skip those or handle accordingly.

### 3. Verify reruns
After rerunning, check the workflow run list to confirm they are queued or in progress:
```bash
gh run list --branch <branch-name> --limit 20
```

## Tips
- Use `--limit` to increase the number of workflows checked if needed.
- The `-q` flag uses JQ to filter JSON output; ensure `jq` is available (bundled with `gh`).
- For workflows that require manual intervention (e.g., approvals), rerunning may not bypass those gates.
- Consider labeling or commenting on the PR to indicate why workflows were rerun.

## Example from CentralDark session
In a session addressing dependency updates in branch `fix/dependabot-radix-group-rebase`, the following command was used to identify failed/skipped workflows:
```bash
gh run list --branch fix/dependabot-radix-group-rebase --limit 100 --json databaseId,status,conclusion -q '.[] | select(.conclusion=="failure" or .conclusion=="skipped") | .databaseId'
```
Then each ID was passed to `gh run rerun` to trigger a new run.