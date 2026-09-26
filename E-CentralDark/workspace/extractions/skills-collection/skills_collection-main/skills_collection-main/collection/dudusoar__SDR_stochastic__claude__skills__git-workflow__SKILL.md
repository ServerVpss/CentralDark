---
name: git-workflow
description: Quick reference for common Git workflows and commands to save tokens on Git operations. Use when performing git status checks, commits, branch operations, or when user asks about git commands. Provides concise command patterns for daily development workflow.
---

# Git Workflow

Quick reference for common Git operations without repeatedly explaining basic commands.

## Daily Workflow

### Check Status
```bash
# See current status
git status

# Short format
git status -s

# Check what changed
git diff

# Check staged changes
git diff --staged
```

### Commit Changes
```bash
# Stage all changes
git add .

# Stage specific files
git add path/to/file.py

# Commit with message
git commit -m "Your message"

# Stage and commit in one step
git commit -am "Your message"

# Amend last commit
git commit --amend --no-edit
```

### Push/Pull
```bash
# Pull latest changes
git pull

# Push to remote
git push

# Push new branch
git push -u origin branch-name

# Force push (careful!)
git push --force
```

## Branch Operations

### Create and Switch Branches
```bash
# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch in one command
git checkout -b feature-name

# Switch branch (modern syntax)
git switch feature-name

# Create and switch (modern)
git switch -c feature-name
```

### Manage Branches
```bash
# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Force delete
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename current branch
git branch -m new-name
```

## Viewing History

### Log Commands
```bash
# View commit history
git log

# Compact one-line format
git log --oneline

# Last N commits
git log --oneline -10

# With file changes
git log --stat

# Graphical view
git log --oneline --graph --all
```

### Show Changes
```bash
# Show specific commit
git show commit-hash

# Show files in commit
git show --name-only commit-hash

# Show last commit
git show HEAD
```

## Undoing Changes

### Unstage Files
```bash
# Unstage file
git restore --staged file.py

# Unstage all
git restore --staged .

# Old syntax
git reset HEAD file.py
```

### Discard Changes
```bash
# Discard changes in file
git restore file.py

# Discard all changes
git restore .

# Old syntax
git checkout -- file.py
```

### Reset Commits
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard commit-hash
```

## Stash Operations

### Save Work Temporarily
```bash
# Stash changes
git stash

# Stash with message
git stash save "WIP: feature description"

# Stash including untracked files
git stash -u
```

### Retrieve Stashed Work
```bash
# List stashes
git stash list

# Apply latest stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

## Merge and Rebase

### Merging
```bash
# Merge branch into current
git merge feature-branch

# Merge with no fast-forward
git merge --no-ff feature-branch

# Abort merge
git merge --abort
```

### Rebasing
```bash
# Rebase current branch
git rebase main

# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Continue after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

## Remote Operations

### Managing Remotes
```bash
# View remotes
git remote -v

# Add remote
git remote add origin url

# Change remote URL
git remote set-url origin new-url

# Remove remote
git remote remove origin
```

### Fetching
```bash
# Fetch all branches
git fetch

# Fetch specific remote
git fetch origin

# Fetch and prune deleted branches
git fetch --prune
```

## Project-Specific Patterns

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to remote
git push -u origin feature/new-feature

# 4. After PR merged, update main
git checkout main
git pull
git branch -d feature/new-feature
```

### Hotfix Pattern
```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/bug-fix

# 2. Fix and commit
git add .
git commit -m "Fix critical bug"

# 3. Push and merge quickly
git push -u origin hotfix/bug-fix
```

### Sync Fork
```bash
# 1. Add upstream remote (once)
git remote add upstream original-repo-url

# 2. Fetch upstream
git fetch upstream

# 3. Merge into main
git checkout main
git merge upstream/main

# 4. Push to your fork
git push origin main
```

## Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Simple feature
git commit -m "feat: add distance matrix caching"

# Bug fix with scope
git commit -m "fix(alns): correct temperature decay calculation"

# Documentation
git commit -m "docs: update installation instructions"

# With body
git commit -m "feat: integrate OSMnx for real maps

- Add osmnx_integration.py module
- Implement distance matrix from graph
- Add Purdue campus example"
```

## VRP Project Workflow

### Before Committing Migration
```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Stage migration files
git add vrp_toolkit/problems/pdptw.py
git add tests/test_pdptw.py

# 4. Commit with standard message
git commit -m "feat(migration): migrate instance.py to pdptw.py

- Extract generic Instance class
- Add type hints and docstrings
- Create basic test suite

🤖 Generated with Claude Code"
```

### Update Progress Commits
```bash
# After using update-progress skill
git add .claude/CLAUDE.md .claude/MIGRATION_LOG.md
git commit -m "chore: update migration progress (1/9 files)"
git push
```

### Create Tutorial Commits
```bash
git add tutorials/01_quickstart.ipynb
git commit -m "docs: add quickstart tutorial

- Show basic instance creation
- Demonstrate ALNS solving
- Include visualization examples"
git push
```

## Quick Troubleshooting

### Forgot to Create Branch
```bash
# Stash changes
git stash

# Create and switch to branch
git checkout -b correct-branch

# Apply changes
git stash pop
```

### Wrong Commit Message
```bash
# Change last commit message
git commit --amend -m "Correct message"

# If already pushed
git push --force
```

### Accidentally Committed to Main
```bash
# Move commit to new branch
git branch feature-branch
git reset --hard HEAD~1
git checkout feature-branch
```

### Merge Conflict
```bash
# 1. See conflicted files
git status

# 2. Resolve conflicts in files
# Edit files, remove conflict markers

# 3. Mark as resolved
git add conflicted-file.py

# 4. Complete merge
git commit
```

## Token-Saving Shortcuts

Instead of explaining, use these direct commands:

| Need | Command |
|------|---------|
| Status | `git status -s` |
| Last 5 commits | `git log --oneline -5` |
| What changed | `git diff` |
| Quick commit | `git commit -am "msg"` |
| Push branch | `git push -u origin branch` |
| Create branch | `git checkout -b name` |
| Undo last commit | `git reset --soft HEAD~1` |
| Stash work | `git stash` |
| Get stash | `git stash pop` |

## Integration with Other Skills

**Works with:**
- **update-progress**: After updating docs, commit with standard message
- **migrate-module**: After migration, commit migrated files
- **session-start**: Check git log to see recent work

**Example flow:**
```
migrate instance.py
  ↓
git add vrp_toolkit/problems/pdptw.py
git commit -m "feat(migration): migrate instance.py"
  ↓
update-progress
  ↓
git add .claude/CLAUDE.md .claude/MIGRATION_LOG.md
git commit -m "chore: update progress (1/9)"
git push
```
