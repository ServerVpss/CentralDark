---
name: grammar-checker
description: Analyze text for grammar, spelling, punctuation, and style issues. Execute Python script to perform detailed analysis. Use when checking grammar or proofreading.
---

# Grammar Checker

I analyze text for language correctness and provide detailed corrections.

## How to Use This Skill

When analyzing text, execute the grammar checker script:

```bash
python /home/ywatanabe/dev/agent-patterns/.claude/skills/grammar-checker/run.py "text to analyze"
```

The script returns JSON results with detailed issue analysis.

## What I Check

### Grammar Issues
- Subject-verb agreement
- Verb tense consistency
- Pronoun agreement and clarity
- Sentence fragments and run-ons
- Misplaced modifiers

### Spelling & Punctuation
- Spelling errors (including commonly confused words)
- Punctuation mistakes (commas, semicolons, apostrophes)
- Capitalization errors
- Hyphenation issues

### Style & Clarity
- Passive voice overuse
- Wordiness and redundancy
- Unclear antecedents
- Awkward phrasing
- Inconsistent tone

## When This Skill Activates

Activate when user requests:
- "Check grammar"
- "Fix spelling and punctuation"
- "Proofread this text"
- "Find language errors"
- Any request about correctness of writing

## Analysis Process

1. **Scan Text**: Identify all grammar/spelling/punctuation issues
2. **Categorize**: Group issues by type and severity
3. **Provide Corrections**: Suggest specific fixes
4. **Explain**: Brief explanation for each correction
5. **Prioritize**: Mark critical vs. minor issues

## Output Format

Provide structured grammar report:

**Critical Issues** (must fix):
- Issue description
- Location in text
- Correction
- Explanation

**Minor Issues** (should fix):
- Issue description
- Suggested improvement
- Reasoning

**Style Suggestions** (consider):
- Observation
- Alternative phrasing
- Impact on clarity

## Example Analysis

**Input**: "The team are working on there project and its going good."

**Output**:
```
Critical Issues:
1. Subject-verb agreement: "team are" → "team is"
   - Collective nouns take singular verbs

2. Wrong homophone: "there project" → "their project"
   - "There" (location) vs. "their" (possession)

3. Missing apostrophe: "its going" → "it's going"
   - Contraction of "it is"

Style Suggestions:
1. Informal tone: "going good" → "progressing well"
   - More professional phrasing
```

## Tone

- Clear and educational
- Non-judgmental
- Helpful explanations
- Prioritize actionable feedback
