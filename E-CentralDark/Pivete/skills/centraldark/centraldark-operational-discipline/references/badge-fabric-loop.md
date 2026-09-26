# Badge Fabric Persistent Loop

**Session:** 05/09/2026 — PR#1431 (Badge Fabric) merged. Replaces manual "Create status badge" with an autonomous persistent loop.

## Purpose

Every workflow, branch, and PR gets a visible status badge. The badge shows state but does not substitute the Judge.

## Loop Canônico

SCAN → CLASSIFY → DETERMINISTIC_FIX → VERIFY → COUNTERPROOF → RESCAN → NO_NEW_FAILURES → FIXED_POINT

## What the Fabric Scans

- All current workflows (.github/workflows/*.yml|yaml)
- Historical workflow runs accessible via GitHub API
- Current branches
- Branch + event genuinely observed
- All PRs (state=all: open, closed, merged)
- Deleted branches without runs preserved as HISTORICAL_UNKNOWN

## Badge Generation

NO static SVG copies. Reuses GitHub native live SVG:
- actions/workflows/<workflow>.yml/badge.svg — live badge for each workflow
- badge.svg?branch=<branch>&event=<event> — when a branch/event run exists

## Output

- docs/STATUS-BADGES.md — canonical index of all badges
- scripts/ci/generate_status_badges.py — generator script
- .github/workflows/status-badge-fabric.yml — persistent workflow

## Trigger Schedule

- Manual trigger
- Every 6 hours
- When workflow or generator changes

## Classification of Findings

Each finding is classified as one of: PROVEN, REFUTED_MINERAL, UNKNOWN, BLOCKED, REUSE_CANDIDATE, INTENTIONAL_PARALLEL

## Rules

BADGE_IS_TELEMETRY_NOT_PROOF=true
UNKNOWN_IS_NOT_PASS=true
SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true
CREATE_STATIC_DUPLICATE_SVG=false
REUSE_NATIVE_BADGE_BEFORE_CREATE=true

## When Difference Found

SCAN → DELTA → automation/status-badge-fabric → PR unique

Reuses the same branch/PR for sync — does NOT create a new PR each round.

## When Nothing Changed

REUSE_PROOF_NO_CHANGE

## Anti-patterns

RED != GREEN
YELLOW != PASS
UNKNOWN != PASS
BADGE != PROOF
Never hide a failure — it becomes mineral (learning ore)

## Files

- Generator: scripts/ci/generate_status_badges.py
- Workflow: .github/workflows/status-badge-fabric.yml
- Learning crystal: docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-STATUS-BADGE-FABRIC-FIXED-POINT.md
