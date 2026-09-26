---
name: canonical-doc-analysis
description: "Analyze doctrine text for semantic gaps, contradictions"
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [analysis, governance, doctrine, semantic-gap, framework-review]
    homepage: https://github.com/NousResearch/hermes-agent
---

# Canonical Document Analysis

Analyze governance/philosophy documents from AI agent frameworks for semantic gaps, contradictions, alignment issues, and practical implications.

## When to Use

- User pastes a doctrine text (MetaLupa, SOUL, operational framework) and asks for critical review
- User asks "veja se isso tira capacidade" or "tem lacuna" or "isso está alinhado"
- User is comparing a proposed change against existing canonical documents
- Need to cross-reference a pasted text against actual files in the repo

## Process

### 1. Read the source text

If the text is pasted inline, work with it directly.

If the text is in a file:
- Try `read_file` first
- If read_file returns "Binary file" or similar error, try reading via terminal with `cat` or `head`
- Files may be UTF-8 with special characters that read_file misidentifies as binary

### 2. Identify the claim

What is the document claiming?
- What problem does it identify?
- What diagnosis does it make?
- What solution does it propose?

### 3. Cross-reference with canonical sources

For CentralDark specifically:
- `LEIA-ME-IA.md` — boot requirements, framework identity
- `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md` — metacognition doctrine
- `docs/CONSCIENCIA/APRENDIZADOS/` — learning records
- `.agents/skills/meta-lupa/SKILL.md` — MetaLupa skill definition
- `MASTER-CYCLE.yml` — operational cycle definition
- `TRIGGERS.yml` — trigger definitions
- Any `engine_gap_*.py` or controller files referenced

For other frameworks, locate the equivalent canonical sources.

### 4. Check for semantic gaps

Common issues to look for:

**STOP scope ambiguity**
- Does the document say "STOP" without defining what stops?
- Is it clear whether STOP means: execution loop? learning pipeline? capability evolution?
- A STOP without scope can be misread by models as global/ontological

**Capability claims**
- Does the document claim something is "final" or "complete" when it should be "local to this scope"?
- Does it distinguish between MISSION_COMPLETE and LEARNING_DISABLED?

**Contradiction with existing doctrine**
- Does the new text contradict what's already written elsewhere?
- If so, is it a real contradiction or a clarifying refinement?

**Over-correction risk**
- Does the proposed fix create a new problem?
- Example: separating FIXED_POINT into 3 concepts (EVIDENCE/MISSION/LEARNING) may be clarification but risks creating V2 of scaffold

### 5. Identify what's missing

Common missing pieces:
- Explicit scope delimiters (STOP_SCOPE=..., CURRENT_REFINEMENT_LOOP)
- Distinction between "no new information NOW" vs "no new information FOREVER"
- Transition path from investigation to learning candidate to crystal
- Learning triggers that survive FIXED_POINT

### 6. Formulate the analysis

Structure:
- **Summary**: one paragraph
- **Claim**: problem + diagnosis + proposed fix
- **Alignment**: fit with existing doctrine, conflicts
- **Gaps found**: specific semantic issues
- **Risks**: does proposed fix introduce new problems?
- **Recommendation**: what to do next

## Common Pitfalls

1. **Confusing diagnosis with prescription.** Document may correctly identify problem but propose fix that's too heavy (new engine, new scaffold) when textual clarification suffices.

2. **Creating V2.** When document proposes "separate FIXED_POINT into three concepts" or "create NEW_LEARNING_PIPELINE", check if creating parallel system. Existing doctrine usually has pieces; they need better naming/scope.

3. **Missing the real locus.** Bug may not be in controller/script but in shared semantics between documents. If script does right thing (e.g., `STOP_AND_PRESERVE_FRONTIER` in `engine_gap_fixed_point.py`), issue is textual ambiguity elsewhere.

4. **Assuming model reads STOP correctly.** Models may interpret bare "STOP" as global/ontological. Check whether document defines scope of STOP.

## Output Format

When reporting analysis:

```
RESUMO: [one paragraph]
CLAQUE: [problem + diagnosis + proposed fix]
ALINHAMENTO: [fit with existing doctrine, conflicts]
LACUNAS: [specific issues found]
RISCOS: [does fix create new problems]
RECOMENDACAO: [what to do next]
```

Keep it concise. User usually wants analysis, not restatement.

## References

- `references/file-reading-fallbacks.md` — techniques for reading files that read_file rejects as binary
- `references/semantic-gap-checklist.md` — checklist of common semantic gap patterns in AI governance documents

