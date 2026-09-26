---
name: session-intelligence-harvester
description: Extract actionable intelligence from session logs, chat exports, and agent transcripts. Use when you need to distill patterns, decisions, and learnings from historical sessions.
---

# Session Intelligence Harvester

Extract actionable intelligence from session logs and agent transcripts.

## Core Concept
Sessions contain dense operational intelligence: decisions made, errors encountered, patterns discovered, tools used. This skill extracts that intelligence systematically.

## What to Harvest
- **Decisions**: What was chosen and why
- **Errors**: What failed, root cause, fix
- **Patterns**: Recurring approaches that worked
- **Tools**: Which tools succeeded/failed
- **Gaps**: Missing knowledge, tools, or processes
- **Contradictions**: Conflicting information discovered

## Extraction Process
1. **Ingest** → Session JSONL, chat export, transcript
2. **Segment** → By topic, phase, participant
3. **Classify** → Decision, error, pattern, tool, gap, contradiction
4. **Extract** → Structured record with evidence (quote + context)
5. **Deduplicate** → Merge same findings across sessions
6. **Crystallize** → Feed to `knowledge-compiler`

## Output Format
```json
{
  "session_id": "...",
  "findings": [
    {
      "type": "decision|error|pattern|tool|gap|contradiction",
      "summary": "one-line",
      "evidence": "verbatim quote with context",
      "confidence": 0.9,
      "tags": ["architecture", "security", "performance"]
    }
  ]
}
```

## Integration
- Results → `knowledge-compiler` for crystallization
- Patterns → `meta-lupa` for falsification
- Gaps → `knowledge-compiler` as new capability requests

## Automation
- Run on session end (hook)
- Batch process historical exports
- Incremental: only new sessions since last harvest
EOF
echo "session-intelligence-harvester SKILL.md criado"