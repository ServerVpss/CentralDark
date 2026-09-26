# COMANDO - qa-nfr-assess.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-nfr-assess.md
**SHA:** cdade49e6c2bfabc
**Timestamp:** 2026-08-28T02:02:08.435326
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - Risk: Brute force attacks possible
- - Risk: Untested code paths
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Powered by AIOS™ Core -->

---
tools:
  - browser           # Performance testing and UI validation
  - supabase          # Database reliability and data validation
  - github-cli        # Security review and code analysis
  - context7          # Research NFR best practices
checklists:
  - architect-master-checklist.md
---

# nfr-assess

Quick NFR validation focused on the core four: security, performance, reliability, maintainability.

## Inputs

```yaml
required:
  - story_id: '{epic}.{story}' # e.g., "1.3"
  - story_path: `aios-core/core-config.yaml` for the `devStoryLocation`

optional:
  - architecture_refs: `aios-core/core-config.yaml` for the `architecture.architectureFile`
  - technical_preferences: `aios-core/core-config.yaml` for the `technicalPreferences`
  - acceptance_criteria: From story file
```

## Purpose

Assess non-functional requirements for a story and generate:

1. YAML block for the gate file's `nfr_validation` section
2. Brief markdown assessment saved to `qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`

## Process

### 0. Fail-safe for Missing Inputs

If story_path or story file can't be found:

- Still create assessment file with note: "Source story not found"
- Set all selected NFRs to CONCERNS with notes: "Target unknown / evidence missing"
- Continue with assessment to provide value

### 1. Elicit Scope

**Interactive mode:** Ask which NFRs to assess
**Non-interactive mode:** Default to core four (security, performance, reliability, maintainability)

```text
Which NFRs should I assess? (Enter numbers or press Enter for default)
[1] Security (default)
[2] Performance (default)
[3] Reliability (default)
[4] Maintainability (default)
[5] Usability
[6] Compatibility
[7] Portability
[8] Functional Suitability

> [Enter for 1-4]
```

### 2. Check for Thresholds

Look for NFR requirements in:

- Story acceptance criteria
- `docs/architecture/*.md` files
- `docs/technical-preferences.md`

**Interactive mode:** Ask for missing thresholds
**Non-interactive mode:** Mark as CONCERNS with "Target unknown"

```text
No performance requirements found. What's your target response time?
> 200ms for API calls

No security requirements found. Required auth method?
> JWT with refresh tokens
```

**Unknown targets policy:** If a target is missing and not provided, mark status as CONCERNS with notes: "Target unknown"

### 3. Quick Assessment

For each selected NFR, check:

- Is there evidence it's implemented?
- Can we validate it?
- Are there obvious gaps?

### 4. Generate Outputs

## Output 1: Gate YAML Block

Generate ONLY for NFRs actually assessed (no placeholders):

```yaml
# Gate YAML (copy/paste):
nfr_validation:
  _assessed: [security, performance, reliability, maintainability]
  security:
    status: CONCERNS
    notes: 'No rate limiting on auth endpoints'
  performance:
    status: PASS
    notes: 'Response times < 200ms verified'
  reliability:
    status: PASS
    notes: 'Error handling and retries implemented'
  maintainability:
    status: CONCERNS
    notes: 'Test coverage at 65%, target is 80%'
```

## Deterministic Status Rules

- **FAIL**: Any selected NFR has critical gap or target clearly not met
- **CONCERNS**: No FAILs, but any NFR is unknown/partial/missing evidence
- **PASS**: All selected NFRs meet targets with evidence

## Quality Score Calculation

```
quality_score = 100
- 20 for each FAIL attribute
- 10 for each CONCERNS attribute
Floor at 0, ceiling at 100
```

If `technical-preferences.md` defines custom weights, use those instead.

## Output 2: Brief Assessment Report

**ALWAYS save to:** `qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`

```markdown
# NFR Assessment: {epic}.{story}

Date: {date}
Reviewer: Quinn

<!-- Note: Source story not found (if applicable) -->

## Summary

- Security: CONCERNS - Missing rate limiting
- Performance: PASS - Meets <200ms requirement
- Reliability: PASS - Proper error handling
- Maintainability: CONCERNS - Test coverage below target

## Critical Issues

1. **No rate limiting** (Security)
   - Risk: Brute force attacks possible
   - Fix: Add rate limiting middleware to auth endpoints

2. **Test coverage 65%** (Maintainability)
   - Risk: Untested code paths
   - Fix: Add tests for uncovered branches

## Quick Wins

- Add rate limiting: ~2 hours
- Increase test coverage: ~4 hours
- Add performance monitoring: ~1 hour
```

## Output 3: Story Update Line

**End with this line for the review task to quote:**

```
NFR assessment: qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md
```

## Output 4: Gate Integration Line

**Always print at the end:**

```
Gate NFR block ready → paste into qa.qaLocation/gates/{epic}.{story}-{slug}.yml under nfr_validation
```

## Assessment Criteria

### Security

**PASS if:**

- Authentication implemented
- Authorization enforced
- Input validation present
- No hardcoded secrets

**CONCERNS if:**

- Missing rate limiting
- Weak encryption
- Incomplete authorization

**FAIL
```