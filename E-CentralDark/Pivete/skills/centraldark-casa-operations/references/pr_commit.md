# PR Commit Procedure

Final stage of a **CentralDark** PR: commit, rebase, and push.

1. Stage all changes: `git add -A`.
2. Commit using `git commit -m "feat: <short description>"`.
3. Rebase onto `origin/main`: `git pull --rebase origin main`.
4. Push to the PR branch: `git push origin <branch>`.
5. Add receipt (`docs/RELATORIOS/...`) to `main` using same workflow.

Tip: ensure remote tracking is current before rebasing.
