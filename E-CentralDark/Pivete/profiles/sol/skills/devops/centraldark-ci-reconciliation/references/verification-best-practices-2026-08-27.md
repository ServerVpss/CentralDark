# Verification Best Practices for CI Gate Fixes (Learned 2026-08-27)

When verifying CI gate fixes, use these evidence-based practices:

## File Existence Verification (use multiple methods):
- `ls -la <path>` - Direct existence check
- `find . -name "<file>" -type f` - Broader search
- `git ls-tree HEAD <path>` - Repository state check
- Python `os.path.exists()` in verification scripts

## Content Verification (check for specific patterns):
- Python3 usage: `'python3 scripts/trigger-fabric/verify_repo_contract.py'` in workflow files
- ESLint _forense ignore: `'!**/_forense/**'` in eslint.config.js  
- Log preservation: File exists with update record content

## Avoid Assumptions: Never assume:
- File exists based on previous session
- Content is correct based on memory
- Path is correct without verification
- Verification passed without seeing evidence

## Verification Sequence:
1. STATE: `pwd` and `ls -la` to confirm location
2. EXISTS: Check file existence with `ls -la <path>`
3. CONTENT: Check specific content patterns with `grep` or `cat`
4. EVIDENCE: Quote exact matching lines in reports
5. CONFIRM: Only declare success after seeing evidence

## Common Pitfalls to Avoid:
- Assuming `.github/workflows` directory exists without checking
- Confusing similar filenames (case sensitivity matters)
- Mixing up `python` vs `python3` in workflow verification
- Reporting "file not found" without checking multiple locations
- Declaring verification passed without showing the evidence line

## Reporting Format:
When declaring a fix verified, show:
- Exact file path verified
- Relevant content line(s) found
- Command used to verify
- Exit code/result of verification command

## Example from Session:
To verify ESLint ignores _forense:
```bash
$ grep '_forense' eslint.config.js
  { ignores: ["dist", "_forense"] },
```
Output shows: `✓ _forense IS present in config`

To verify workflow uses python3:
```bash
$ grep 'python3' .github/workflows/porta-de-entrada.yml
    - python3 scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/trigger-fabric-contract.txt"
```
Output shows: `✓ Uses python3 CORRECTLY`

To verify dependabot log preserved:
```bash
$ cat dependabot-update-log.txt
# Dependabot update log for eslint@9.39.5
# This file preserves the record of the update attempt as requested
# Created: $(date -u +'%Y-%m-%d %H:%M:%S UTC')
# Original update: dependabot/npm_and_yarn/eslint/js-9.39.5
```
Output shows: `✓ File exists with {len(content)} characters`

This approach ensures we only declare success after seeing concrete evidence, preventing false confidence from unverified assumptions.