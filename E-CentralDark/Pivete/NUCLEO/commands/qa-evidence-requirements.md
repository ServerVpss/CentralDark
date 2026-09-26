# COMANDO - qa-evidence-requirements.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-evidence-requirements.md
**SHA:** cfa30b79bf1eac27
**Timestamp:** 2026-08-28T02:02:07.324432
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - evidence_status: object { complete: boolean, missing: string[] }
- missing: string[]

### Ouro Bruto (primeiros 5000 chars)
```
# Evidence Requirements Task

Enforce evidence-based QA with mandatory proof of fix and verification.

**Absorbed from:** Auto-Claude PR Review Phase 3 - Evidence Requirements

---

## Task Definition

```yaml
task: qaEvidenceRequirements()
responsavel: Quinn (Guardian)
atomic_layer: Molecule

inputs:
  - story_id: string (required)
  - issue_type: "bug_fix" | "feature" | "dependency_update" | "refactor"

outputs:
  - evidence_checklist: file (docs/stories/{story-id}/qa/evidence_checklist.md)
  - evidence_status: object { complete: boolean, missing: string[] }
```

---

## Evidence Checklists by Issue Type

### Bug Fix Evidence

```yaml
bug_fix_evidence:
  required:
    - id: original-error
      name: 'Original Error Documented'
      description: 'Screenshot, log, or reproduction steps of the bug'
      severity: CRITICAL

    - id: root-cause
      name: 'Root Cause Identified'
      description: 'Clear explanation of why the bug occurred'
      severity: HIGH

    - id: before-after
      name: 'Before/After Comparison'
      description: 'Code diff showing the fix with explanation'
      severity: HIGH

    - id: regression-test
      name: 'Regression Test Added'
      description: 'Test case that would catch this bug if reintroduced'
      severity: CRITICAL

  optional:
    - id: related-issues
      name: 'Related Issues Checked'
      description: 'Similar code patterns checked for same bug'
      severity: LOW
```

### Feature Implementation Evidence

```yaml
feature_evidence:
  required:
    - id: acceptance-verified
      name: 'All Acceptance Criteria Verified'
      description: 'Each criterion has proof of completion'
      severity: CRITICAL

    - id: edge-cases
      name: 'Edge Cases Tested'
      description: 'Boundary conditions and error states verified'
      severity: HIGH

    - id: happy-path
      name: 'Happy Path Demonstrated'
      description: 'Primary use case works as expected'
      severity: CRITICAL

  conditional:
    - id: cross-platform
      name: 'Cross-Platform Tested'
      condition: 'feature has UI component'
      platforms: ['Chrome', 'Firefox', 'Safari', 'Mobile']
      severity: MEDIUM

    - id: performance-impact
      name: 'Performance Impact Assessed'
      condition: 'feature is performance-critical'
      severity: HIGH
```

### Dependency Update Evidence

```yaml
dependency_evidence:
  required:
    - id: security-check
      name: 'Security Vulnerabilities Checked'
      description: 'npm audit or equivalent shows no new vulnerabilities'
      severity: CRITICAL

    - id: license-check
      name: 'License Compatibility Verified'
      description: 'New dependency license is compatible with project'
      severity: HIGH

    - id: breaking-changes
      name: 'Breaking Changes Handled'
      description: 'Changelog reviewed and breaking changes addressed'
      severity: CRITICAL

  conditional:
    - id: bundle-size
      name: 'Bundle Size Impact'
      condition: 'frontend dependency'
      description: 'Bundle size change documented'
      severity: MEDIUM
```

### Refactor Evidence

```yaml
refactor_evidence:
  required:
    - id: behavior-preserved
      name: 'Behavior Preserved'
      description: 'Tests pass before and after refactor'
      severity: CRITICAL

    - id: no-new-features
      name: 'No New Features Added'
      description: 'Refactor is purely structural'
      severity: HIGH

  optional:
    - id: performance-improvement
      name: 'Performance Improvement'
      description: 'Benchmarks showing improvement if claimed'
      severity: LOW
```

---

## Workflow

### Phase 1: Detect Issue Type

```yaml
detection:
  bug_fix:
    patterns:
      - story title contains "fix", "bug", "issue"
      - commit messages contain "fix", "bug"
      - linked issue is type "bug"

  feature:
    patterns:
      - story title contains "add", "implement", "create"
      - acceptance criteria present

  dependency_update:
    patterns:
      - changes in package.json
      - changes in package-lock.json
      - story mentions "update", "upgrade", "dependency"

  refactor:
    patterns:
      - story title contains "refactor", "cleanup", "reorganize"
      - no new features in acceptance criteria
```

### Phase 2: Generate Checklist

```yaml
generate:
  - Load appropriate evidence template
  - Evaluate conditional items
  - Create evidence_checklist.md in story qa folder
  - Return checklist for QA verification
```

### Phase 3: Verify Evidence

```yaml
verify:
  for_each: checklist_item
  actions:
    - Check if evidence exists
    - Validate evidence quality
    - Mark as complete or missing

  output:
    complete: boolean
    missing: string[]
    blocking: boolean (if any CRITICAL missing)
```

---

## Command

```
*evidence-check {story-id} [--type bug_fix|feature|dependency_update|refactor]
```

**Examples:**

```bash
*evidence-check 6.3
*evidence-check 6.3 --type bug_fix
```

---

## Evidence Checklist Template

```markdown
# Evidenc
```