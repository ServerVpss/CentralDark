# YAML Frontmatter Format Check

File: `.agents/skills/skill-name/SKILL.md`

1. Opening `---` at line 1? ✓ / ✗
2. Exactly one opening `---`? ✓ / ✗
3. Closing `---` after YAML content? ✓ / ✗
4. Markdown body after second `---`? ✓ / ✗
5. Python YAML parse: success ✓ / error ✗
6. Inner `---` lines present? ✓ / ✗ (remove if yes)
7. Content between delimiters valid YAML? ✓ / ✗

# Decision Template

| Question | Answer | Action |
|----------|--------|--------|
| Opening `---` at line 1? | | |
| Exactly one opening `---`? | | |
| Closing `---` after YAML? | | |
| Markdown body after second `---`? | | |
| Python YAML parse success? | | |
| Inner `---` lines present? | | |
| Content valid YAML? | | |

# Fix Pattern (when inner `---` observed)

1. Read file content
2. Remove any `---` lines between line 1 and the final closing `---`
3. Ensure exactly one opening `---` at line 1 and one closing `---` after YAML content
4. Verify with Python YAML parse
5. Commit change with governance receipt