# CONTRATO - QUALITY-GATES-SPECIFICATION.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\docs\standards\QUALITY-GATES-SPECIFICATION.md
**SHA:** f63934a4eb768255
**Timestamp:** 2026-08-28T02:02:10.710956
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
- run: npm audit --audit-level=high
- run: npm run build

### Ouro Bruto (primeiros 5000 chars)
```
# Quality Gates Specification v2.1

**Version:** 2.1.0
**Last Updated:** 2025-12-09
**Status:** Official Standard
**Related:** Sprint 3 Implementation

---

## 📋 Table of Contents

- [Overview](#overview)
- [3-Layer Architecture](#3-layer-architecture)
- [Layer 1: Pre-commit](#layer-1-pre-commit)
- [Layer 2: PR Automation](#layer-2-pr-automation)
- [Layer 3: Human Review](#layer-3-human-review)
- [Configuration Guide](#configuration-guide)
- [CodeRabbit Self-Healing](#coderabbit-self-healing)
- [Metrics & Impact](#metrics--impact)

---

## Overview

### Purpose

The Quality Gates 3-Layer system ensures code quality through progressive automated validation, catching 80% of issues automatically and focusing human review on strategic decisions.

### Design Principles

1. **Shift Left** - Catch issues as early as possible
2. **Progressive Depth** - Each layer adds more comprehensive checks
3. **Automation First** - Humans focus on what humans do best
4. **Fast Feedback** - Immediate response at each layer
5. **Non-Blocking Default** - Warnings vs. errors where appropriate

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUALITY GATES WORKFLOW                              │
│                                                                         │
│   Developer                                                             │
│      │                                                                  │
│      ▼                                                                  │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 1: PRE-COMMIT                           │ │
│   │                     ════════════════════                          │ │
│   │   Trigger: File save, git commit                                  │ │
│   │   Time: < 5 seconds                                               │ │
│   │   Catches: 30% of issues                                          │ │
│   │                                                                   │ │
│   │   ✓ ESLint (syntax, patterns)                                    │ │
│   │   ✓ Prettier (formatting)                                        │ │
│   │   ✓ TypeScript (type checking)                                   │ │
│   │   ✓ Unit tests (changed files only)                              │ │
│   │                                                                   │ │
│   │   Blocking: Yes (can't commit if fails)                          │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                          PASS? │                                        │
│                                ▼                                        │
│                         git commit                                      │
│                         git push                                        │
│                                │                                        │
│                                ▼                                        │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 2: PR AUTOMATION                        │ │
│   │                     ══════════════════════                        │ │
│   │   Trigger: PR creation, PR update                                 │ │
│   │   Time: < 3 minutes                                               │ │
│   │   Catches: Additional 50% (80% cumulative)                        │ │
│   │                                                                   │ │
│   │   ✓ CodeRabbit AI review                                         │ │
│   │   ✓ Integration tests                                            │ │
│   │   ✓ Coverage analysis (threshold: 80%)                           │ │
│   │   ✓ Security scan (npm audit, Snyk)                              │ │
│   │   ✓ Performance benchmarks                                       │ │
│   │   ✓ Documentation validation                                     │ │
│   │                                                                   │ │
│   │   Blocking: Yes (required checks for merge)                      │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                          PASS? │                                        │
│                                ▼                                        │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 3: HUMAN REVIEW                         │ │
│   │                     ═════════════════════                         │ │
│   │   Trigger: Layer 2 passes                                         │ │
│   │   Time: 30 min - 2 hours                                          │ │
│   │   Catches: Final 20
```