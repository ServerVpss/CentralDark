# COMANDO - spec-parsing.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\notion\skills\notion-spec-to-implementation\reference\spec-parsing.md
**SHA:** 26bebf0eb255488b
**Timestamp:** 2026-08-26T18:31:13.984574
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- When critical info is missing:

### Ouro Bruto (primeiros 5000 chars)
```
# Specification Parsing

## Finding the Specification

Before parsing, locate the spec page:

```
1. Search for spec:
   Notion:search
   query: "[Feature Name] spec"
   query_type: "internal"
   filters: {}

   If that misses, run a second search with:
   query: "[Feature Name] specification"
   query_type: "internal"
   filters: {}

2. Handle results:
   - If found → use page URL/ID
   - If multiple → ask user which one
   - If not found → ask user for URL/ID

Example:
Notion:search
query: "User Profile API spec"
query_type: "internal"
filters: {}
```

## Reading Specifications

After finding the spec, fetch it with `Notion:fetch`:

1. Read the full content
2. Identify key sections
3. Extract structured information
4. Note ambiguities or gaps

```
Notion:fetch
id: "spec-page-id-from-search"
```

## Common Spec Structures

### Requirements-Based Spec

```
# Feature Spec
## Overview
[Feature description]

## Requirements
### Functional
- REQ-1: [Requirement]
- REQ-2: [Requirement]

### Non-Functional
- PERF-1: [Performance requirement]
- SEC-1: [Security requirement]

## Acceptance Criteria
- AC-1: [Criterion]
- AC-2: [Criterion]
```

Extract:
- List of functional requirements
- List of non-functional requirements
- List of acceptance criteria

### User Story Based Spec

```
# Feature Spec
## User Stories
### As a [user type]
I want [goal]
So that [benefit]

**Acceptance Criteria**:
- [Criterion]
- [Criterion]
```

Extract:
- User personas
- Goals/capabilities needed
- Acceptance criteria per story

### Technical Design Doc

```
# Technical Design
## Problem Statement
[Problem description]

## Proposed Solution
[Solution approach]

## Architecture
[Architecture details]

## Implementation Plan
[Implementation approach]
```

Extract:
- Problem being solved
- Proposed solution approach
- Architectural decisions
- Implementation guidance

### Product Requirements Document (PRD)

```
# PRD: [Feature]
## Goals
[Business goals]

## User Needs
[User problems being solved]

## Features
[Feature list]

## Success Metrics
[How to measure success]
```

Extract:
- Business goals
- User needs
- Feature list
- Success metrics

## Extraction Strategies

### Requirement Identification

Look for:
- "Must", "Should", "Will" statements
- Numbered requirements (REQ-1, etc.)
- User stories (As a... I want...)
- Acceptance criteria sections
- Feature lists

### Categorization

Group requirements by:

**Functional**: What the system does
- User capabilities
- System behaviors
- Data operations

**Non-Functional**: How the system performs
- Performance targets
- Security requirements
- Scalability needs
- Availability requirements
- Compliance requirements

**Constraints**: Limitations
- Technical constraints
- Business constraints
- Timeline constraints

### Priority Extraction

Identify priority indicators:
- "Critical", "Must have", "P0"
- "Important", "Should have", "P1"
- "Nice to have", "Could have", "P2"
- "Future", "Won't have", "P3"

Map to implementation phases based on priority.

## Handling Ambiguity

### Unclear Requirements

When requirement is ambiguous:

```markdown
## Clarifications Needed

### [Requirement ID/Description]
**Current text**: "[Ambiguous requirement]"
**Question**: [What needs clarification]
**Impact**: [Why this matters for implementation]
**Assumed for now**: [Working assumption if any]
```

Create clarification task or add comment to spec.

### Missing Information

When critical info is missing:

```markdown
## Missing Information

- **[Topic]**: Spec doesn't specify [what's missing]
- **Impact**: Blocks [affected tasks]
- **Action**: Need to [how to resolve]
```

### Conflicting Requirements

When requirements conflict:

```markdown
## Conflicting Requirements

**Conflict**: REQ-1 says [X] but REQ-5 says [Y]
**Impact**: [Implementation impact]
**Resolution needed**: [Decision needed]
```

## Acceptance Criteria Parsing

### Explicit Criteria

Direct acceptance criteria:

```
## Acceptance Criteria
- User can log in with email and password
- System sends confirmation email
- Session expires after 24 hours
```

Convert to checklist:
- [ ] User can log in with email and password
- [ ] System sends confirmation email
- [ ] Session expires after 24 hours

### Implicit Criteria

Derive from requirements:

```
Requirement: "Users can upload files up to 100MB"

Implied acceptance criteria:
- [ ] Files up to 100MB upload successfully
- [ ] Files over 100MB are rejected with error message
- [ ] Progress indicator shows during upload
- [ ] Upload can be cancelled
```

### Testable Criteria

Ensure criteria are testable:

❌ **Not testable**: "System is fast"
✓ **Testable**: "Page loads in < 2 seconds"

❌ **Not testable**: "Users like the interface"
✓ **Testable**: "90% of test users complete task successfully"

## Technical Detail Extraction

### Architecture Information

Extract:
- System components
- Data models
- APIs/interfaces
- Integration points
- Technology choices

### Design Decisions

Note:
- Tec
```