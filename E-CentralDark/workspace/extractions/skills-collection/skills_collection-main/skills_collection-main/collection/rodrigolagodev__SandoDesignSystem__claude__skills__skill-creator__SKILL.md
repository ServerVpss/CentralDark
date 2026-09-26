---
name: skill-creator
description: Guide for creating effective skills that extend Claude capabilities with specialized knowledge, workflows, or tool integrations. Use when users want to create or update a skill. Follows progressive disclosure (metadata → SKILL.md → bundled resources) and provides 6-step creation process.
license: Complete terms in LICENSE.txt
---

# Skill Creator

This skill provides guidance for creating effective skills that extend Claude's capabilities.

## About Skills

Skills are modular, self-contained packages providing specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific domains—they transform Claude from general-purpose to specialized agent equipped with procedural knowledge.

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for domains
2. **Tool integrations** - Instructions for file formats/APIs
3. **Domain expertise** - Company knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, assets for complex tasks

### Anatomy of a Skill

Every skill: required SKILL.md + optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash)
    ├── references/       - Documentation loaded as needed
    └── assets/           - Files used in output (templates, etc.)
```

#### SKILL.md (required)

**Metadata Quality:** `name` and `description` in YAML frontmatter determine when Claude uses skill. Be specific. Use third-person (e.g., "This skill should be used when..." not "Use this skill when...").

**Writing Style:** Use **imperative/infinitive form** (verb-first), not second person. Use objective, instructional language (e.g., "To accomplish X, do Y" not "You should do X"). Maintains consistency for AI consumption.

#### Bundled Resources (optional)

**scripts/** - Executable code for deterministic reliability or repeated rewrites

- **When:** Same code rewritten repeatedly or determinism needed
- **Example:** `scripts/rotate_pdf.py`
- **Benefits:** Token efficient, deterministic, may execute without loading context

**references/** - Documentation loaded as needed

- **When:** Documentation Claude should reference while working
- **Examples:** `references/finance.md` (schemas), `references/api_docs.md` (API specs)
- **Benefits:** Keeps SKILL.md lean, loaded only when needed
- **Best practice:** If large (>10k words), include grep patterns in SKILL.md
- **Avoid duplication:** Info lives in SKILL.md OR references, not both

**assets/** - Files used in output, not loaded into context

- **When:** Skill needs files for final output
- **Examples:** `assets/logo.png` (brand), `assets/frontend-template/` (boilerplate)
- **Benefits:** Separates output resources from docs

### Progressive Disclosure Design

Three-level loading for context efficiency:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed (Unlimited\*)

\*Unlimited because scripts execute without loading context.

## Skill Creation Process

Follow in order, skip only if clearly not applicable.

### Step 1: Understanding with Concrete Examples

**Purpose:** Clearly understand how skill will be used.

Skip only when usage patterns already clear. Valuable even for existing skills.

**Questions to ask:**

- "What functionality should this skill support?"
- "Can you give examples of how this would be used?"
- "What would a user say that should trigger this skill?"

**Example (image-editor):**

- "Remove red-eye from this image"
- "Rotate this image"
- What triggers: "edit image", "rotate photo", etc.

**Conclude:** When clear sense of functionality skill should support.

### Step 2: Planning Reusable Contents

**Purpose:** Identify what scripts, references, assets helpful for repeated execution.

Analyze each example by:

1. Consider execution from scratch
2. Identify helpful resources when executing repeatedly

**Examples:**

**pdf-editor** (query: "Rotate this PDF")

- Analysis: Rotating PDF requires rewriting same code
- Resource: `scripts/rotate_pdf.py` helpful

**frontend-webapp-builder** (query: "Build todo app")

- Analysis: Frontend needs same boilerplate each time
- Resource: `assets/hello-world/` template with boilerplate

**big-query** (query: "How many users logged in today?")

- Analysis: Querying requires rediscovering schemas
- Resource: `references/schema.md` documenting tables

**Output:** List of reusable resources: scripts, references, assets.

### Step 3: Initializing Skill

**Purpose:** Create skill directory structure.

Skip only if skill exists, need iteration/packaging only.

**For new skills:** Always run `init_skill.py`:

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

Script creates:

- Skill directory at path
- SKILL.md template with frontmatter + TODOs
- Example resource directories: `scripts/`, `references/`, `assets/`
- Example files (customize or delete)

After: Customize or remove generated files.

### Step 4: Edit the Skill

**Purpose:** Complete SKILL.md and resources for another Claude instance.

Focus on beneficial, non-obvious information. Consider procedural knowledge, domain details, reusable assets helpful for task execution.

#### Start with Reusable Contents

Implement `scripts/`, `references/`, `assets/` files identified in Step 2.

May require user input (e.g., `brand-guidelines` needs brand assets from user).

Delete example files/directories not needed.

#### Update SKILL.md

Answer these questions:

1. **Purpose** - What is skill's purpose? (few sentences)
2. **When to use** - When should skill be used?
3. **How to use** - In practice, how should Claude use skill? Reference all reusable contents.

**If Sando Design System skill:**
Add "Guidelines: Single Source of Truth" section referencing `.claude/guidelines/`:

```markdown
## Guidelines: Single Source of Truth

**CRITICAL**: [Skill functionality] must follow Sando guidelines in `.claude/guidelines/`.

**Primary Guidelines**:

- **guideline1.md** - What it defines
- **guideline2.md** - What it defines

**Full Index**: `.claude/guidelines/GUIDELINES_INDEX.md`

**Guideline Priority**:

1. **Sando Guidelines** - HIGHEST PRIORITY
2. **[External standards]** - For [specific purpose]
3. **[Context]** - When guidelines don't specify
```

### Step 5: Packaging

**Purpose:** Create distributable zip with validation.

```bash
scripts/package_skill.py <path/to/skill-folder>
```

Optional output directory:

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

Script will:

1. **Validate** automatically:
   - YAML frontmatter format + required fields
   - Naming conventions + directory structure
   - Description completeness + quality
   - File organization + resource references

2. **Package** if validation passes:
   - Creates zip named after skill (e.g., `my-skill.zip`)
   - Includes all files + maintains structure

If validation fails: Reports errors, exits without package. Fix and rerun.

### Step 6: Iterate

**Purpose:** Improve skill based on real usage.

**Workflow:**

1. Use skill on real tasks
2. Notice struggles/inefficiencies
3. Identify SKILL.md or resource updates needed
4. Implement changes and test

Test frequently with real examples to refine effectiveness.

## Sando Design System Considerations

When creating skills for Sando:

### 1. Guidelines Integration Required

All Sando skills must reference `.claude/guidelines/` as single source of truth:

- Add "Guidelines: Single Source of Truth" section
- List 3-5 primary guidelines relevant to skill
- Specify guideline priority hierarchy
- Reference guidelines in instructions (e.g., "per COMPONENT_ARCHITECTURE.md")

**Example skills:**

- `component-creator`: References COMPONENT_ARCHITECTURE.md (7-file pattern)
- `command-creator`: References validation thresholds from TEST_COVERAGE.md, PERFORMANCE_BUDGETS.md

### 2. Three-Layer Token Architecture

Skills working with tokens must understand TOKEN_ARCHITECTURE.md:

- Ingredients (primitives, no references)
- Flavors (semantic, reference Ingredients only)
- Recipes (component-specific, reference Flavors only)

### 3. Monolithic Component Structure

Skills scaffolding components must follow COMPONENT_ARCHITECTURE.md:

- 7 mandatory files
- Token consumption from Recipes only
- WCAG 2.1 AA compliance

### 4. Quality Standards

Skills analyzing quality must apply guideline thresholds:

- TEST_COVERAGE.md: >85% unit, 100% a11y
- PERFORMANCE_BUDGETS.md: <10KB/component
- WCAG_COMPLIANCE.md: WCAG 2.1 AA

## Best Practices

**DO:**

- ✅ Start with concrete examples (Step 1)
- ✅ Use imperative/infinitive form in SKILL.md
- ✅ Reference guidelines explicitly (Sando skills)
- ✅ Keep SKILL.md lean (<5k words), use references for details
- ✅ Test with real examples before finalizing

**DON'T:**

- ❌ Skip understanding usage patterns (Step 1)
- ❌ Duplicate info in SKILL.md and references
- ❌ Use second person ("you should...")
- ❌ Assume without user validation (ask examples)
- ❌ Package without validation (use package script)
