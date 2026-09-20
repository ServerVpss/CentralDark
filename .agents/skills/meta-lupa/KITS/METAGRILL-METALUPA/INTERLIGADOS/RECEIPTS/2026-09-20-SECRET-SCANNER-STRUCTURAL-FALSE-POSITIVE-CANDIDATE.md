# 👑🪬 Secret scanner — structural false-positive candidate

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597

Owner:
scripts/lupa/pr_secret_scan.py

## Observed scanner behavior

BARE_ASSIGNMENT matches:
SECRET_NAME = [A-Za-z0-9._~+/=-]{16,}

SAFE_REFERENCE only exempts prefixes:
- process.env
- os.environ
- env.
- secrets.
- github.
- vars.

Therefore an executable reference such as a long function or identifier can be captured before an opening parenthesis and be classified as a literal secret candidate.

Example class:
token = loadSecretFromFiles(...)

This is a structural false-positive path.

## Status

FALSE_POSITIVE_PATH_EXISTS=true.
CURRENT_PR_SECRET_SUSPECT_CAUSE=UNKNOWN_UNTIL_EXACT_DIFF_SCAN.

No secret value was printed or read into the receipt.

## NEXT_CURSOR

Run the scanner on the exact CURRENT PR diff; emit only filenames/line numbers/match class/value shape, never values.
