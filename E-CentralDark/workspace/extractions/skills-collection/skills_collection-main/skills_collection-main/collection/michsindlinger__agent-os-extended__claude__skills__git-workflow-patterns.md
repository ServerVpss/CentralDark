---
name: Git Workflow Patterns
description: Apply consistent Git workflow and commit message standards
triggers:
  - task_mentions: "commit|git|branch|merge|pull request"
---

# Git Workflow Patterns

Follow these Git workflow standards for consistent version control.

## Branch Naming

**Use descriptive, hierarchical branch names:**

```bash
# Good ✓
feature/user-authentication
bugfix/login-validation-error
hotfix/critical-security-patch
chore/update-dependencies

# Avoid ✗
fix-stuff
johns-branch
test123
```

**Branch prefixes:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

## Commit Messages

**Follow conventional commits format:**

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Good ✓
git commit -m "feat(auth): add JWT token refresh mechanism"
git commit -m "fix(api): resolve null pointer in user endpoint"
git commit -m "docs(readme): update installation instructions"

# Avoid ✗
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "wip"
```

## Pull Request Guidelines

**PR Title:**
- Same format as commit messages
- Clear and descriptive

**PR Description should include:**
- Summary of changes
- Motivation and context
- Testing performed
- Screenshots (for UI changes)
- Breaking changes (if any)

**PR Template:**
```markdown
## Summary
Brief description of what this PR does

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] Edge cases considered

## Screenshots
(if applicable)
```

## Code Review Standards

**As reviewer:**
- Review within 24 hours
- Provide constructive feedback
- Approve only when satisfied

**As author:**
- Keep PRs small and focused
- Respond to feedback promptly
- Don't force push after reviews start

## Workflow Best Practices

**Before starting work:**
```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

**During development:**
```bash
# Commit frequently with clear messages
git add .
git commit -m "feat(feature): implement core functionality"
```

**Before creating PR:**
```bash
# Ensure you're up to date
git checkout main
git pull origin main
git checkout feature/my-new-feature
git rebase main

# Push to remote
git push origin feature/my-new-feature
```

## Merge Strategies

**Prefer:**
- Squash merge for feature branches (clean history)
- Rebase for keeping feature branch up to date

**Avoid:**
- Merge commits in feature branches (use rebase)
- Force pushing to shared branches

## Git Hygiene

- Don't commit:
  - Credentials or API keys
  - `.env` files
  - `node_modules/` or dependency folders
  - IDE-specific files (unless project-specific)
  - Large binary files (use Git LFS)
  - Compiled code or build artifacts

- Do commit:
  - Source code
  - Configuration templates
  - Documentation
  - Tests
  - Package manifests (package.json, pom.xml, etc.)
