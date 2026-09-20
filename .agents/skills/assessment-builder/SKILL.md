---
name: assessment-builder
description: Build structured assessments, evaluations, and rubrics for code quality, architecture reviews, and skill assessments. Use when you need systematic evaluation criteria.
---

# Assessment Builder

Systematic framework for building evaluations, rubrics, and assessments.

## Core Concepts
- **Criterion**: Single measurable dimension of quality
- **Level**: Discrete performance tier (e.g., 1-4, Fail/Pass/Exceeds)
- **Descriptor**: Concrete observable behavior for each level
- **Weight**: Relative importance of criterion

## Rubric Structure
```yaml
rubric:
  name: "Code Review Quality"
  criteria:
    - name: "Correctness"
      weight: 0.30
      levels:
        4: "All logic verified; edge cases handled; tests pass"
        3: "Core logic correct; minor edge cases missing"
        2: "Core logic has gaps; some tests fail"
        1: "Fundamental logic errors; tests fail"
    - name: "Maintainability"
      weight: 0.25
      levels:
        4: "Clean, documented, follows patterns; easy to modify"
        3: "Mostly clean; minor inconsistencies"
        2: "Inconsistent style; hard to follow in places"
        1: "Confusing, undocumented, hard to modify"
```

## Building Process
1. **Define purpose** → What decision does this assessment inform?
2. **Identify dimensions** → What aspects matter? (max 5-7 criteria)
3. **Write descriptors** → Concrete, observable, mutually exclusive
4. **Calibrate** → Test on known-good/known-bad samples
5. **Validate** → Inter-rater reliability check

## Scoring
- Weighted sum: Σ(criterion_score × weight)
- Normalize to 0-100 or letter grade
- Flag criteria below threshold for targeted feedback

## Integration
- Use for code reviews, architecture reviews, agent evaluations
- Results → `knowledge-compiler` for pattern crystallization
- Track scores over time → trend analysis
