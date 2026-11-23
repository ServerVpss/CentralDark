---
name: quiz-generator
description: Generate quizzes, knowledge checks, and assessment questions from source material. Use when you need to create validation tests, learning checks, or certification questions.
---

# Quiz Generator

Systematic generation of knowledge checks and assessment questions from source material.

## Question Types

### 1. Multiple Choice
- Single correct answer
- 3-4 distractors (plausible but clearly wrong)
- Avoid "all of the above" / "none of the above"

### 2. True/False
- Unambiguous statement
- Not trivial
- Tests specific understanding

### 3. Short Answer
- Precise expected answer
- Acceptable variations listed
- Grading rubric for partial credit

### 4. Code Completion
- Partial code with blanks
- Tests specific syntax/API knowledge
- Runnable validation

### 5. Scenario-Based
- Realistic situation
- Multiple decision points
- Branching based on choices

## Generation Process
1. **Source analysis** → Identify key concepts, facts, procedures
2. **Learning objectives** → What should the learner demonstrate?
3. **Question mapping** → Each objective → 1-3 questions
4. **Distractor design** → Plausible errors, common misconceptions
4. **Review** → Validate against source, check clarity
5. **Calibrate** → Test on sample audience

## Question Quality Checklist
- [ ] Unambiguous wording
- [ ] Single correct answer (MC)
- [ ] Distractors plausible but clearly wrong
- [ ] Tests stated objective
- [ ] No trivial/obvious answers
- [ ] No "all/none of the above"
- [ ] Appropriate difficulty for audience
- [ ] No cultural/language bias

## Output Format
```json
{
  "quiz": {
    "title": "...",
    "objectives": ["..."],
    "questions": [
      {
        "type": "multiple_choice|true_false|short_answer|code_completion|scenario",
        "objective": "objective-id",
        "stem": "Question text",
        "options": ["A", "B", "C", "D"],
        "answer": "B",
        "explanation": "Why B is correct and others aren't",
        "difficulty": "easy|medium|hard",
        "tags": ["tag1", "tag2"]
      }
    ]
  }
}
```

## Integration
- Output → `exercise-designer` for practice sets
- Results → `assessment-builder` for scoring
- Analytics → `content-evaluation-framework` for quality
