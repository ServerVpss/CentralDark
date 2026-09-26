---
name: git-worktree-collision-avoidance
description: "Avoid git branch/worktree collisions on PR branches."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Git, Worktree, PR, Windows, Collision]
    related_skills: [github-pr-workflow]
---

# Git Worktree Collision Avoidance

Class-level skill for handling git branch and worktree naming collisions safely.

## Trigger

Use this skill whenever you encounter:
- `fatal: 'branch-name' is already used by worktree at '...'`
- `fatal: a branch named 'branch-name' already exists`
- `error: Your local changes to the following files would be overwritten by checkout`

## Core Rule

**Never reuse a branch name that is already bound to an existing worktree.** Either remove the stale worktree first, or pick a fresh branch name.

## Preferred Pattern

```bash
# 1. Fetch the remote PR branch without checking it out
git fetch origin <remote-branch>

# 2. Create a NEW local branch tracking the fetched ref
git checkout -b <unique-local-branch> FETCH_HEAD

# 3. Verify clean state
git status --short --branch
```

This avoids collisions entirely because `<unique-local-branch>` does not yet exist locally and is not bound to any worktree.

## Pitfalls

- **`git reset --hard` on a branch with an existing worktree** is blocked. Do not try to force-reuse the branch.
- **`git checkout -b proof/runtime-1416` when `proof/runtime-1416` already exists** fails even if you think it should be fresh. Check `git worktree list` first.
- **Local modifications on current branch** block checkout. Stash them before switching: `git stash push -m "backup: ..."`.
- **Long worktree creation commands can time out** on Windows Git Bash. Prefer the lightweight `git checkout -b <new> FETCH_HEAD` pattern over `git worktree add` when possible.

## Verification

After switching, always run:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
```

to confirm you are on the intended branch with no unexpected deletions or modifications.

## Recovery

If a worktree is genuinely stale:

```bash
git worktree remove /path/to/worktree
git branch -d <branch-name>
```

Only after removal should you reuse the branch name.
