# Semantic Gap Checklist for AI Governance Documents

Use this checklist when reviewing doctrine texts (MetaLupa, SOUL, operational frameworks) for semantic gaps that could cause models to misinterpret them.

## 1. STOP scope

- Does the document say "STOP" without defining what stops?
- Is it clear whether STOP means: execution loop, learning pipeline, capability evolution, or something else?
- If STOP appears without scope, flag it as HIGH RISK — models may read it as global/ontological

## 2. Capability finality

- Does the document claim something is "final" or "complete" when it should be "local to this scope"?
- Is there a distinction between MISSION_COMPLETE and LEARNING_DISABLED?
- If not, flag as MEDIUM RISK — models may infer learning is disabled when only this mission is done

## 3. Temporal ambiguity

- Does the document distinguish between "no new information NOW" and "no new information FOREVER"?
- If it says "NO_NEW_INFORMATION → STOP", does it mean "stop this refinement loop" or "stop all future learning"?
- Flag if not explicit

## 4. Contradiction with existing doctrine

- Does the new text contradict what's already written elsewhere?
- If so, is it a real contradiction or a clarifying refinement?
- If contradiction is intentional, is it clearly marked as such?

## 5. Over-correction risk

- Does the proposed fix create a new system, engine, or scaffold when a textual clarification would suffice?
- Check for: "create V2", "new learning pipeline", "separate into three concepts" — these may be creating parallel systems
- If existing doctrine already has the pieces (just poorly named/scope), flag as RISK — prefer consolidation over creation

## 6. Missing transition path

- Does the document describe how to move from investigation → learning candidate → crystal → next mission?
- If it stops at "receive receipt" without describing what happens next, flag as LOW RISK — incomplete but not dangerous

## 7. Learning triggers survival

- Does the document acknowledge that learning triggers continue after FIXED_POINT?
- Common triggers: HUMAN_CORRECTION, TOOL_ERROR, TEST_FAILURE, CONTRADICTION_FOUND, PATTERN_FOUND, MEMORY_DELTA, KNOWLEDGE_CRYSTAL, POST_MUTATION, RUNTIME_DRIFT, SESSION_END
- If these are not mentioned, flag as MEDIUM RISK — models may assume no learning happens after FIXED_POINT

## 8. Meta-self-improvement scope

- If the document discusses MetaLupa learning about itself, is it clear what's allowed vs not?
- Allowed: observing own process, locating method error, testing, minimal scaffold change, next execution starts higher
- Not allowed: auto-promoting self without delta proof, changing own owner without writer accountability
- Flag if boundary is unclear

## Scoring

- HIGH: STOP without scope, capability claimed as final when it should be local — likely to cause model misinterpretation
- MEDIUM: Learning triggers not mentioned, temporal ambiguity, meta-boundary unclear — may cause subtle misinterpretation
- LOW: Missing transition path, incomplete but not dangerous — informational only

## When to flag vs. when to note

- Flag HIGH and MEDIUM in analysis — these are actionable gaps
- Note LOW as observations, not blockers
