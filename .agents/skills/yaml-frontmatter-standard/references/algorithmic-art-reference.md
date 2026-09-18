# Algorithmic-Art Reference Format

Notes on the `algorithmic-art` reference format that all CentralDark skills should follow when using `--- ... ---` YAML frontmatter:

## Structure

- **Opening `---` at line 1** — single delimiter, no exceptions
- **YAML content** — `name`, `description`, `class` (optional), `license` (optional), `tags` (optional)
- **Closing `---`** — single delimiter after YAML content
- **Markdown body** — all content after the closing `---`

## Never Do

- ❌ Insert inner `---` lines between the opening and closing delimiters
- ❌ Create multiple `---` pairs (causes "expected a single document in the stream" YAML parse error)
- ❌ Place opening `---` anywhere other than line 1
- ❌ Leave content between delimiters that is not valid YAML

## From the 2026-09-15 Session

Two skills required fixing:
- `.agents/skills/deploying-cloud-deception-with-decoy-resources/SKILL.md`
- `.agents/skills/deploying-cloudflare-access-for-zero-trust/SKILL.md`

**Fix applied**: Removed inner `---` lines (present at line 43 in both files), restructured to single `--- ... ---` format with markdown body following `algorithmic-art` reference.

## Verification Command

```bash
python3 -c "import yaml; yaml.safe_load(open('.agents/skills/skill-name/SKILL.md'))"
```

**Must parse without** `expected a single document in the stream` error.

## Compatible Skills

- `algorithmic-art` — the reference skill with the correct format
- All `.agents/skills/` files in the CentralDark project
- Hermes skill system YAML parsing

## When to Apply

Apply this format when creating or editing any skill `.md` file in the CentralDark `.agents/skills/` directory that operates under the CentralDark SOUL/SOL governance model. This includes all new skills and skill edits.

# Session Notes (2026-09-15)

- YAML frontmatter format standardization was a key learning across 5 skills
- 2 skills required immediate fix (deploying-cloud-*)
- 3 skills had format issues that were observed but not all required immediate correction
- The `algorithmic-art` skill format is the reference for all CentralDark skills
- User preference: `no V2/edit existing only` — reuse before create
- Fixed point achievement (μ = 0) was the deployment goal
- 20-front parallel deployment workflow executed successfully