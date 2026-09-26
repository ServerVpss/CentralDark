# COMANDO - qa-review-build.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-review-build.md
**SHA:** eb12cc73fc6b4863
**Timestamp:** 2026-08-28T02:02:08.560885
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: 'subtasks[].status'
- pattern: 'coverage summary'
- pattern: 'eval\\(|new Function\\('
- pattern: '\\.innerHTML\\s*=|\\.outerHTML\\s*='
- pattern: 'dangerouslySetInnerHTML'
- pattern: 'shell\\s*=\\s*True|os\\.system\\(|os\\.popen\\('
- pattern: 'api[_-]?key\\s*[=:]\\s*[''"][^''"]{10,}|password\\s*[=:]\\s*[''"][^''"]+'
- pattern: 'query\\s*\\(\\s*[''"`].*\\$\\{|execute\\s*\\(.*\\.format\\('
- pattern: 'req\\.body\\.[a-zA-Z]+[^?]|req\\.query\\.[a-zA-Z]+[^?]'
- pattern: 'origin:\\s*[''"]\\*[''"]|Access-Control-Allow-Origin.*\\*'

### Riscos
- falsePositiveRisk: 'LOW|MEDIUM|HIGH'
- regressionRisk: 'low|medium|high'

### Gaps
- missing: '[list of missing items]'
- missing: '[list]'

### Ouro Bruto (primeiros 5000 chars)
```
# QA Review Build: 10-Phase Quality Assurance Review

> **Phase:** QA Review
> **Owner Agent:** @qa
> **Epic:** Epic 6 - QA Evolution
> **Command:** `*review-build {story-id}`

---

## Purpose

Execute a structured 10-phase quality assurance review of a completed build. This comprehensive review validates implementation against spec, runs automated tests, performs browser/database verification, conducts code review, checks for regressions, and produces a detailed QA report with clear APPROVE/REJECT signal.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: qa-review-build

  elicit: false
  deterministic: true
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: Story ID in format {epic}.{story} (e.g., "6.1")

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true

    - name: implementation
      type: file
      path: docs/stories/{storyId}/implementation/implementation.yaml
      required: false

    - name: storyFile
      type: file
      path: docs/stories/{storyId}*.md
      required: true

  outputs:
    - name: qa_report.md
      type: file
      path: docs/stories/{storyId}/qa/qa_report.md
      schema: qa-report-schema

    - name: status.json
      type: file
      path: .aios/status.json
      update: true

  verification:
    type: gate
    blocking: true
    verdict_field: signal

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: true
    spec: true
```

---

## 10 Review Phases

### Phase 0: Load Context

```yaml
phase: 0
name: 'Load Context'
description: 'Load all relevant artifacts to understand what was built'
blocking: true

actions:
  - id: load-spec
    action: read_file
    path: docs/stories/{storyId}/spec/spec.md
    required: true

  - id: load-implementation
    action: read_file
    path: docs/stories/{storyId}/implementation/implementation.yaml
    required: false

  - id: load-story
    action: read_file
    path: docs/stories/{storyId}*.md
    required: true

  - id: load-requirements
    action: read_file
    path: docs/stories/{storyId}/spec/requirements.json
    required: false

  - id: load-previous-qa
    action: read_file
    path: docs/stories/{storyId}/qa/qa_report.md
    required: false
    description: 'Check for previous QA reports'

output:
  context:
    spec: '{spec content}'
    implementation: '{implementation yaml}'
    story: '{story content}'
    requirements: '{requirements json}'
    previousReview: '{previous qa report if exists}'

validation:
  - spec.md exists and is readable
  - Story file exists and contains acceptance criteria
```

### Phase 1: Verify Subtasks Completed

```yaml
phase: 1
name: 'Verify Subtasks Completed'
description: 'Ensure all implementation subtasks are marked complete'
blocking: true

subphases:
  # Phase 1.2: Evidence Requirements (Absorbed from Auto-Claude)
  - id: 1.2
    name: 'Evidence Requirements Check'
    description: 'Verify required evidence is present for PR type'
    task: qa-evidence-requirements.md
    blocking: false
    actions:
      - id: detect-pr-type
        action: detect_pr_type
        sources: [story_title, commit_messages, acceptance_criteria]
        types: [bug_fix, feature, refactor, performance, security, documentation]

      - id: evaluate-evidence
        action: evaluate_evidence_checklist
        sources: [story_file, qa_report, test_results, screenshots, commits]

    checks:
      - id: minimum-score
        condition: 'evidence_score >= minimum_for_type'
        severity: HIGH
        message: 'Insufficient evidence for ${pr_type}'

      - id: no-blocking-missing
        condition: 'no CRITICAL evidence items missing'
        severity: CRITICAL
        message: 'Missing critical evidence: ${missing_items}'

    output:
      evidenceCheck:
        prType: '{detected_type}'
        score: '{X/Y}'
        passed: true|false
        missing: '[list of missing items]'

actions:
  - id: parse-subtasks
    action: extract_checklist
    source: implementation.yaml
    pattern: 'subtasks[].status'

  - id: verify-commits
    action: git_log
    filter: 'storyId:{storyId}'
    description: 'Check commits exist for this story'

  - id: check-file-list
    action: extract_section
    source: story.md
    section: 'File List'
    description: 'Verify File List section is populated'

checks:
  - id: subtasks-complete
    condition: 'all subtasks have status: completed'
    severity: HIGH
    message: 'All subtasks must be completed before QA review'

  - id: commits-exist
    condition: 'git log contains commits referencing storyId'
    severity: HIGH
    message: 'No commits found for this story'

  - id: files-documented
    condition: 'File List section is not empty'
    severity: MEDIUM
    message: 'File List section should document all changed files'

output:
  subtasks:
    total: '{count}'
    completed: '{count}'
    pending
```