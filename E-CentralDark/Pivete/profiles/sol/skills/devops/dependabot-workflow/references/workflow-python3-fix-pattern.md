# Workflow Python3 Fix Pattern

## Pattern Description
When Dependabot updates dependencies in a repository with self-hosted GitHub Actions runners, the workflows may break if they call `python` instead of `python3`. This occurs because:
- The self-hosted runner environment may have `python3` but not `python` in PATH
- The `python` command may point to Python 2.x or be completely absent
- The workflow failure manifests as "`python: command not found`" errors

## Detection
Look for workflow failures with error messages like:
```
/opt/actions-runner-*/_work/_temp/*.sh: line 2: python: command not found
```

## Solution Pattern
1. Identify all workflow files that call the problematic script
2. Replace `python ` with `python3 ` in the command invocation
3. Verify the fix by checking that workflows now succeed

## Example Transformation
**Before:**
```yaml
run: python scripts/trigger-fabric/verify_repo_contract.py .
```

**After:**
```yaml
run: python3 scripts/trigger-fabric/verify_repo_contract.py .
```

## Verification
After making the change:
1. Check that workflows now pass the verification step
2. Confirm no regression in other workflow steps
3. Ensure the change is limited to the specific command invocation

## Prevention
To prevent this issue in future dependency updates:
- Document that self-hosted runners should use `python3` in workflow documentation
- Consider adding a workflow linter rule to flag `python ` usage (when not intentional for Python 2)
- Add this pattern to the Dependabot workflow checklist

## Related Patterns
- Similar issues can occur with `node` vs `nodejs`, `pip` vs `pip3`, etc.
- The fix pattern is consistent: use the versioned command when the unversioned command is unreliable in the target environment