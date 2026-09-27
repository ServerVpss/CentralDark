---
name: exercise-designer
description: Design effective exercises, drills, and practice scenarios for skill development. Use when creating training materials, coding katas, or practice scenarios.
---

# Exercise Designer

Framework for designing effective practice exercises and skill-building drills.

## Exercise Design Principles

### 1. Clear Learning Objective
- Single, measurable outcome per exercise
- Maps to specific skill/competency
- Stated in "By the end, you will be able to..."

### 2. Appropriate Difficulty
- **Zone of Proximal Development**: Challenging but achievable with effort
- Scaffolding: hints available, not forced
- Progressive: each exercise builds on previous

### 3. Authentic Context
- Realistic scenario, not abstract puzzle
- Mirrors actual work conditions
- Uses real tools/constraints when possible

### 4. Immediate Feedback
- Built-in validation (tests, expected output)
- Clear success criteria
- Actionable hints for common errors

## Exercise Template
```yaml
exercise:
  id: "unique-id"
  title: "Descriptive title"
  objective: "By the end, you will be able to..."
  difficulty: "beginner|intermediate|advanced"
  estimated_time_minutes: 30
  prerequisites: ["skill-a", "skill-b"]
  setup:
    - "Clone repo"
    - "Run setup script"
  steps:
    - description: "Step description"
      hint: "Optional hint"
      validation: "Test command or expected output"
    - ...
  solution: "Reference solution (hidden until requested)"
  extensions:
    - "Harder variant"
    - "Alternative approach"
  reflection_questions:
    - "What would you do differently?"
    - "When would this approach fail?"
```

## Exercise Types
- **Kata**: Repeated practice of a technique
- **Debug**: Fix broken code
- **Refactor**: Improve existing code
- **Design**: Architect a solution
- **Investigate**: Find root cause
- **Optimize**: Improve performance

## Feedback Loop
1. Attempt → 2. Automated check → 3. Hint (if stuck) → 4. Retry → 5. Compare with reference → 6. Reflect

## Integration
- Results → `assessment-builder` for scoring
- Patterns → `knowledge-compiler` for curriculum improvement
