---
name: git-pr-best-practices
description: Best practices for creating, reviewing, and merging pull requests. Use when authoring PRs, reviewing PRs, or establishing team PR standards.
---

# Git PR Best Practices

Structured approach to pull requests that minimizes review cycles and prevents regressions.

## Before Creating PR

### Branch Strategy
- One logical change per branch
- Branch name: `type/scope-short-description` (feat/auth-add-oauth, fix/api-timeout, refactor/db-indices)
- Branch from latest `main` (rebase before push)

### Commit Hygiene
- Atomic commits: one logical change per commit
- Conventional commit messages: `type(scope): summary`
- No "fixup", "wip", "temp" commits in final history
- Rebase + squash locally before pushing

### Pre-push Checklist
- [ ] Tests pass locally (`npm test`, `pytest`, etc.)
- [ ] Lint passes (`npm run lint`, `ruff check`, etc.)
- [ ] Build succeeds (`npm run build`, etc.)
- [ ] No debug code, console.log, print statements
- [ ] No secrets, tokens, or credentials
- [ ] CHANGELOG updated if user-facing change

## PR Description Template

```markdown
## Summary
Brief description of what and why.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual verification steps (if any)

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|

## Screenshots (if UI)
<!-- Attach before/after -->

## Related
- Closes #issue
- Related to #issue
```

## Review Guidelines

### For Author
- Keep PR small (< 400 lines changed when possible)
- Self-review before requesting review
- Respond to all comments
- Don't force-push after review starts (use new commits)

### For Reviewer
- Review within 24h when possible
- Focus on: correctness, security, performance, maintainability
- Ask questions instead of demanding changes
- Approve when criteria met, request changes when blocking

## Merge Strategy
- Squash merge for feature branches (clean history)
- Rebase merge for long-running branches with many commits
- Never force-push to main
- Delete branch after merge

## Post-Merge
- Delete branch
- Verify CI passes on main
- Update local main
- Communicate deployment if applicable
