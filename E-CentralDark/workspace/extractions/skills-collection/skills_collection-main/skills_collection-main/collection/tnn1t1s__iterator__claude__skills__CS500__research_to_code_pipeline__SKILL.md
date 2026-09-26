---
name: research_to_code_pipeline
description: Orchestrates the full research pipeline from problem specification through theory, design, implementation, benchmarking, to final report. Tracks dependencies and feedback loops. Use for end-to-end research projects.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch
---

# Research-to-Code Pipeline Orchestrator

## Purpose

Coordinate the complete research workflow, ensuring each stage builds on previous results and maintains consistency.

## Pipeline Stages

### Stage 1: Problem Definition
**Skills**: problem_specification
**Output**: Formal spec with types, constraints, invariants
**Checkpoint**: Spec reviewed and approved

### Stage 2: Theoretical Analysis
**Skills**: algorithmic_analysis, comparative_complexity
**Output**: Complexity analysis, design comparison table
**Checkpoint**: Theory sound, alternatives evaluated

### Stage 2.5: Optimization Loop (Optional)
**Skills**: iterative_optimizer
**Output**: Improved algorithm or confirmation of optimality
**Checkpoint**: User satisfied or proven optimal
**Mode**: User-enabled via "aggressive optimization" or "can we do better?"
**Loop**: Repeats Stage 2 with challenges until user stops

### Stage 3: Design Selection
**Skills**: systems_design_patterns, microarchitectural_modeling, language_comparative_runtime
**Output**: Design decision with justification
**Checkpoint**: Design choice documented and justified

### Stage 4: Implementation
**Skills**: multi_language_codegen, safety_invariants
**Output**: Working code in Java, C++, Rust
**Checkpoint**: Code compiles, passes basic tests

### Stage 5: Testing
**Skills**: unit_test_generation
**Output**: Comprehensive test suites
**Checkpoint**: All tests pass, coverage ≥90%

### Stage 6: Benchmarking
**Skills**: test_data_design (FIRST), benchmark_design, performance_interpretation
**Output**: Test data catalog, performance measurements, and analysis
**Checkpoint**: Comprehensive test data covers edge cases; results match theoretical predictions (within ±20%)

### Stage 7: Reporting
**Skills**: reporting_visualization, technical_exposition, pedagogical_reflection, temporal_style_adapter
**Output**: Complete technical report
**Checkpoint**: Document ready for review

### Stage 8: Consistency Check
**Skills**: self_consistency_checker
**Output**: Verification report
**Checkpoint**: No contradictions detected

## Orchestration Logic

### Sequential Dependencies
```
problem_specification
    ↓
algorithmic_analysis + comparative_complexity
    ↓
[OPTIONAL LOOP: iterative_optimizer]
    ↓ (if improvements found)
    ↑ (re-run analysis with new approach)
    ↓ (user stops or proven optimal)
systems_design_patterns + microarchitectural_modeling
    ↓
multi_language_codegen + safety_invariants
    ↓
unit_test_generation
    ↓
benchmark_design → performance_interpretation
    ↓
reporting_visualization + technical_exposition
    ↓
pedagogical_reflection
    ↓
self_consistency_checker
```

### Feedback Loops
- **Optimization loop (Stage 2.5)**: iterative_optimizer challenges solution → re-run Stage 2 with improvements
- **Benchmarks contradict theory**: Revisit analysis or modeling
- **Tests fail**: Revisit implementation or specification
- **Consistency check fails**: Revisit affected stages

## Execution Strategy

### Automatic Mode
1. Execute stages sequentially
2. Use skill_context_cache to pass results forward
3. Halt on checkpoint failures
4. Generate final report automatically
5. **Optimization loop disabled by default** (enables on "aggressive optimization" keyword)

### Interactive Mode
1. Execute stage, present results
2. User approves or requests revision
3. Continue to next stage
4. User can jump back to any stage
5. **Optimization loop**: After Stage 2, ask "Optimize further or continue?" If optimize → Stage 2.5

### Aggressive Optimization Mode
1. After Stage 2, automatically activate iterative_optimizer
2. Challenge current solution with 3-5 improvements
3. User selects challenge or stops
4. If challenge selected: re-run Stage 2 with new approach
5. Loop until user satisfied or proven optimal
6. **Trigger**: User says "aggressive optimization", "find optimal", "can we do better?"

### Parallel Opportunities
- Implement Java, C++, Rust in parallel (after design)
- Run benchmarks in parallel (after all implementations)
- Generate sections of report in parallel (after benchmarks)

## Context Handoff

Use skill_context_cache to pass:
- **Spec → Analysis**: Types, constraints, invariants
- **Analysis → Design**: Complexity, operations profile
- **Design → Implementation**: Data structures, algorithms
- **Implementation → Testing**: Code structure, edge cases
- **Testing → Benchmarking**: Validated implementations
- **Benchmarking → Reporting**: Measurements, analysis

## Pipeline Invocation

**Full Pipeline**:
```
"Research optimal k-way merge, implement in all languages, benchmark, and write CS500 report"
```

**Partial Pipeline**:
```
"Implement heap-based merge from existing spec"
→ Starts at Stage 4
```

**Resume Pipeline**:
```
"Benchmarks showed unexpected results; re-analyze and update report"
→ Loops back to Stage 2, continues to Stage 7
```

**Optimization Loop**:
```
"Research k-way merge with aggressive optimization"
→ Runs Stage 1-2
→ Stage 2.5: "O(nk) found. Can we do better?" → Challenge with heap O(n log k)
→ Loop: User approves → re-run Stage 2 with heap
→ Stage 2.5: "O(n log k) achieved. Can we do better?" → Challenge with constants
→ Loop: User stops → Continue to Stage 3
```

## Quality Gates

Each stage has acceptance criteria:

| Stage | Gate | Criteria |
|-------|------|----------|
| 1 | Spec Complete | All invariants documented |
| 2 | Theory Sound | Complexity proven, alternatives compared |
| 2.5 | Optimization Complete | User satisfied or proven optimal (optional) |
| 3 | Design Justified | Trade-offs documented |
| 4 | Code Correct | Compiles, no warnings |
| 5 | Tests Pass | 100% pass, ≥90% coverage |
| 6 | Results Plausible | Within 2× of predictions |
| 7 | Report Complete | All sections present |
| 8 | Consistency OK | No contradictions |

## Error Handling

### Checkpoint Failure
- Document issue
- Identify root cause
- Determine which stage to revisit
- Re-execute from that stage

### Unexpected Results
- Treat as scientific finding, not error
- Investigate cause (measurement issue vs model issue)
- Update model or document limitation
- Continue pipeline

## Cross-Skill Integration

**Coordinates**: All 19 other skills (including iterative_optimizer)
**Uses**: skill_context_cache for state management
**Feeds into**: Final deliverable (complete research artifact)
**Optional loop**: iterative_optimizer challenges solutions after Stage 2
