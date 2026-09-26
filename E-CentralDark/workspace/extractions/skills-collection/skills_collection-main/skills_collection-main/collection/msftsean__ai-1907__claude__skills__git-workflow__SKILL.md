---
name: git-workflow
description: Commit and push changes to GitHub with proper messages. Use when ready to save changes, push to production, or deploy updates to GitHub Pages.
---

# Git Workflow for Alpha AI Site

## Quick Commands

### Check status
```bash
git status
```

### Commit changes
```bash
git add .
git commit -m "Your message here"
```

### Push to production
```bash
git push origin main
```

GitHub Pages auto-deploys from `main` branch. Changes are live in ~2 minutes.

## Commit Message Style

Use clear, action-oriented messages:
- `Update Week 3 video to Enovair 6 Skills`
- `Add 8 AI Workflows reference table`
- `Fix broken flowchart link`
- `Refactor Week 4 to focus on experiments`

## Before Pushing

1. Test locally with `npx serve`
2. Check all pages load correctly
3. Verify video links work
4. Confirm homepage and learning-plan are in sync

## Branch Rules

- `main` is the production branch
- Never use `master` (renamed to main)
- Push directly to main for this project

## Live Site

https://msftsean.github.io/ai-1907/
