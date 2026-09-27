---
name: context-synthesis
description: Synthesize context from multiple sources into coherent understanding. Use when you need to combine information from docs, code, conversations, and external sources into a unified mental model.
---

# Context Synthesis

Framework for combining information from multiple sources into a unified understanding.

## Core Problem
Information is scattered across: code, docs, conversations, external sources, git history, configs. Synthesis means building a coherent model from fragments.

## Synthesis Process

### 1. Source Collection
| Source | What it gives | Freshness |
|--------|---------------|-----------|
| Code | Ground truth behavior | Live |
| Tests | Expected behavior | Live |
| Docs | Intended behavior | May lag |
| Git history | Why decisions made | Historical |
| Conversations | Intent, constraints | Real-time |
| External | Best practices, standards | Varies |

### 2. Triangulation
- Same fact from 2+ independent sources = high confidence
- Code + tests + docs agree = verified
- Code + docs disagree = code wins, docs lag
- Conversation contradicts code = investigate

### 3. Gap Mapping
```
KNOWN          UNKNOWN          ASSUMED
   ↓              ↓               ↓
Verify        Investigate      Validate
```

### 4. Model Building
- Entities: What objects/concepts exist
- Relationships: How they connect
- Flows: Data/control paths
- Invariants: What must always hold
- Boundaries: What's inside/outside

## Synthesis Output
Structured mental model:
- Entity-relationship diagram (text)
- Data/control flow description
- Invariant list
- Boundary definitions
- Gap list with priority

## Anti-patterns
- ❌ Single source reliance
- ❌ Treating docs as ground truth
- ❌ Ignoring git history
- ❌ Assuming unknown = false
- ❌ Conflating correlation with causation

## Integration
- Results → `knowledge-compiler` for crystallization
- Gaps → `knowledge-compiler` as capability requests
- Contradictions → `meta-lupa` for falsification
