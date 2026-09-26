# PR #1389 - sync NEXT_CURSOR

Target lineage: `ServerVpss/CentralDark#1389`.

This package build could not prove the live PR state because the GitHub connector became unavailable at the first live read. Therefore:

- `GITHUB_REMOTE_STATE=UNKNOWN`
- `GITHUB_SYNC_PENDING=true`
- no GitHub HEAD/base/checks are claimed by this build;
- no GitHub mutation is claimed by this build.

When GitHub access returns:

1. enter through the universal master funnel;
2. remeasure repo, PR #1389, branch, HEAD, base, merge-base, checks and writers;
3. locate the existing trigger/cycle/contract/HUB/router/OAuth/test owners;
4. compare the live state with this package;
5. apply only missing material deltas on the same PR/lineage;
6. never create a second router/HUB/owner to carry this feature;
7. run universal funnel, anti-recursion, router/Gemini, secret-boundary, fallback, falsifier, and zero-regression gates;
8. prove exact tested/committed/pushed HEAD equality before promotion;
9. write a remote receipt and reconcile it with the Drive receipt.
