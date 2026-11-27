---
name: git-analysis
description: Analyze git history, authorship, churn, and architectural evolution. Use when investigating code ownership, hotspots, coupling, or architectural drift. Skip for simple diff reading.
---

# Git Analysis

Structural analysis of git repositories for architectural insight.

## Capabilities
- **Authorship mapping**: Who owns what, knowledge bus factor
- **Churn analysis**: Files that change frequently (risk indicators)
- **Coupling detection**: Files that change together (hidden dependencies)
- **Hotspot identification**: High churn + high complexity = risk
- **Architectural drift**: Deviation from intended boundaries
- **Author expertise**: Who knows what deeply

## Core queries
- `git log --format` → authorship per file
- `git log --numstat` → churn per file
- `git log --oneline --graph` → branching/merging patterns
- `git log --all --full-history -- <path>` → file history

## Integration
- `codegraph-partner` for structural context
- `knowledge-compiler` for crystallizing findings
- `meta-lupa` for falsifying architectural assumptions

## Output format
Structured findings with evidence (commit hashes, stats) → `knowledge-compiler` for crystallization.
