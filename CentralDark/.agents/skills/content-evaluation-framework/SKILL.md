---
name: content-evaluation-framework
description: Framework for evaluating content quality, relevance, and accuracy across domains. Use when assessing documentation, articles, code comments, or any written material.
---

# Content Evaluation Framework

Systematic framework for evaluating content quality and relevance.

## Evaluation Dimensions

### 1. Accuracy
- Factual correctness
- Up-to-date information
- Proper citations/references

### 2. Clarity
- Clear structure and organization
- Appropriate terminology for audience
- Logical flow

### 3. Completeness
- Covers stated scope
- No critical omissions
- Edge cases addressed

### 4. Actionability
- Clear next steps
- Concrete examples
- Reproducible instructions

### 5. Relevance
- Addresses stated need
- Right level of detail
- Timely

## Scoring Rubric (1-5)
| Score | Meaning |
|-------|---------|
| 5 | Exemplary — gold standard |
| 4 | Strong — minor improvements only |
| 3 | Adequate — meets baseline |
| 2 | Weak — significant gaps |
| 1 | Inadequate — fails core purpose |

## Evaluation Process
1. **Read fully** — understand intent and audience
2. **Score each dimension** — use descriptors, not gut feel
3. **Weight dimensions** — based on content purpose
3. **Calculate weighted score** — Σ(score × weight)
4. **Identify top 3 improvements** — specific, actionable

## Weights by Content Type
| Type | Accuracy | Clarity | Completeness | Actionability | Relevance |
|------|----------|---------|--------------|---------------|-----------|
| Technical docs | 0.35 | 0.25 | 0.20 | 0.15 | 0.05 |
| Tutorials | 0.30 | 0.30 | 0.15 | 0.20 | 0.05 |
| Code comments | 0.40 | 0.30 | 0.15 | 0.10 | 0.05 |
| Architecture docs | 0.40 | 0.20 | 0.25 | 0.10 | 0.05 |

## Output
Structured evaluation → `knowledge-compiler` for pattern crystallization.
