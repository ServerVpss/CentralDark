---
name: meta-skill-generator
category: meta
description: Generate well-structured micro-skills following best practices for context optimization
---

# Meta-Skill: Micro-Skill Generator

## Purpose

This meta-skill generates new micro-skills that are:
- **Context-optimized**: 50-150 lines max
- **Single-responsibility**: One skill = one specific task
- **Reusable**: Can be combined in plugins
- **Actionable**: Clear examples and step-by-step guides

## When to Use

Use this meta-skill when you need to create a new micro-skill for:
- A specific technical task or pattern
- Breaking down a large skill into smaller pieces
- Standardizing skill format across the codebase

## Input Requirements

To generate a micro-skill, you need:

1. **Task Name**: Specific, descriptive name (e.g., "dockerfile-multistage", "tailwind-responsive")
2. **Category**: One of: `docker-core`, `frontend-core`, `debugging-core`, `backend-core`, `testing-core`
3. **Description**: One-line description (max 100 characters)
4. **Core Concepts**: 2-3 key concepts to explain
5. **Use Cases**: 2-3 common scenarios where this skill applies
6. **Related Skills**: List of micro-skills that work well together

## Generation Process

### Step 1: Validate Scope

Before generating, ensure the skill is:
- [ ] **Small enough**: Can be explained in 50-150 lines
- [ ] **Specific enough**: Has a single, clear purpose
- [ ] **Not duplicate**: Doesn't overlap significantly with existing skills

**If too large**: Break into 2+ micro-skills
**If too vague**: Narrow down the scope
**If duplicate**: Extend existing skill instead

### Step 2: Structure the Skill

Follow this exact template structure:

```markdown
---
name: [kebab-case-name]
category: [category-name]
description: [one-line description, max 100 chars]
related_skills:
  - skill-name-1
  - skill-name-2
---

# [Human-Readable Skill Name]

## When to Use

[1-2 sentences describing the specific scenario where this skill applies]

## Quick Start

[Minimal working example in 10-15 lines - this should be copy-pasteable]

## Core Concepts

[2-3 key concepts, each as a bullet point with 1-2 line explanation]

Example:
- **Concept 1**: Brief explanation
- **Concept 2**: Brief explanation
- **Concept 3**: Brief explanation

## Step-by-Step Guide

[Numbered steps with code examples, approximately 40-60 lines total]

1. **Step 1 Name**
   [Explanation]
   ```[language]
   [code example]
   ```

2. **Step 2 Name**
   [Explanation]
   ```[language]
   [code example]
   ```

[Continue for 3-5 steps total]

## Common Patterns

[2-3 common use cases with brief code examples, ~20-30 lines]

### Pattern 1: [Pattern Name]
[When to use]
```[language]
[code example]
```

### Pattern 2: [Pattern Name]
[When to use]
```[language]
[code example]
```

## Gotchas & Tips

[Common mistakes and best practices, bullet points, ~10-15 lines]

**Common Mistakes:**
- ❌ Mistake 1: [why it's wrong]
- ❌ Mistake 2: [why it's wrong]

**Best Practices:**
- ✅ Practice 1: [why it's good]
- ✅ Practice 2: [why it's good]

## Related Skills

[Links to related micro-skills with brief context]

- Use `[skill-name-1]` for [specific purpose]
- Combine with `[skill-name-2]` when [specific scenario]
- See `[skill-name-3]` for [related topic]

[Optional: Plugin reference]
💡 **Plugin**: For complete [workflow name], see `[plugin-name]`
```

### Step 3: Content Guidelines

**Writing Style:**
- ✅ Direct, actionable language ("Do X", "Use Y when Z")
- ✅ Code examples for every major point
- ✅ Real-world scenarios, not abstract theory
- ❌ No fluff, no excessive explanations
- ❌ No duplicating what's in related skills

**Code Examples:**
- Must be **complete** (can copy-paste and run)
- Must be **minimal** (only essential code)
- Must be **correct** (tested patterns)
- Include comments for non-obvious parts

**Length Control:**
- Quick Start: 10-15 lines
- Core Concepts: 15-20 lines
- Step-by-Step: 40-60 lines
- Common Patterns: 20-30 lines
- Gotchas & Tips: 10-15 lines
- Related: 5-10 lines
- **TOTAL TARGET: 100-150 lines**

If exceeding 150 lines → split into 2 micro-skills

### Step 4: Quality Checklist

Before finalizing the micro-skill, verify:

- [ ] **Single responsibility**: Skill does ONE thing well
- [ ] **Context-optimized**: 50-150 lines total
- [ ] **Actionable**: Can immediately use the examples
- [ ] **Clear use case**: "When to Use" is specific
- [ ] **No duplication**: Doesn't repeat existing skills
- [ ] **Related skills linked**: Helps user find complementary skills
- [ ] **Examples tested**: Code examples actually work
- [ ] **Consistent format**: Follows template exactly

### Step 5: File Location

Save the generated skill to:
```
.claude/skills/[category-name]/[skill-name].md
```

Examples:
- `docker-core/dockerfile-multistage.md`
- `frontend-core/tailwind-responsive.md`
- `debugging-core/log-analysis.md`
- `backend-core/api-error-handling.md`

## Example: Full Generation Flow

**Input:**
```yaml
task_name: dockerfile-multistage
category: docker-core
description: Create optimized multi-stage Docker builds
core_concepts:
  - Build stage separation
  - Image size reduction
  - Build cache optimization
use_cases:
  - Node.js production builds
  - Go compiled binaries
  - Python with compiled dependencies
related_skills:
  - dockerfile-basics
  - docker-optimization
```

**Output:** `docker-core/dockerfile-multistage.md`

```markdown
---
name: dockerfile-multistage
category: docker-core
description: Create optimized multi-stage Docker builds to minimize image size
related_skills:
  - dockerfile-basics
  - docker-optimization
  - docker-security
---

# Multi-Stage Docker Builds

## When to Use

Use multi-stage builds when you need build tools (compilers, npm, etc.) during build but want a minimal production image without those tools.

## Quick Start

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```

## Core Concepts

- **Build Stage Separation**: Use one stage for compilation, another for runtime - keeps build tools out of final image
- **COPY --from**: Transfer only artifacts needed for runtime from build stage to production stage
- **Image Size Reduction**: Final image contains only runtime dependencies, not build dependencies (often 60-80% smaller)

## Step-by-Step Guide

1. **Define Build Stage**
   ```dockerfile
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install        # Includes devDependencies
   COPY . .
   RUN npm run build      # Compile TypeScript, bundle, etc.
   ```

2. **Define Production Stage**
   ```dockerfile
   FROM node:20-alpine    # Fresh base image
   WORKDIR /app
   COPY --from=build /app/dist ./dist              # Built artifacts
   COPY --from=build /app/node_modules ./node_modules  # Only prod deps
   ```

3. **Add Security & Runtime Config**
   ```dockerfile
   USER node              # Run as non-root
   EXPOSE 3000
   CMD ["node", "dist/server.js"]
   ```

## Common Patterns

### Pattern 1: Node.js with TypeScript
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:20-alpine
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```

### Pattern 2: Go Static Binary
```dockerfile
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server

FROM scratch                        # Minimal base
COPY --from=build /app/server /server
CMD ["/server"]
```

## Gotchas & Tips

**Common Mistakes:**
- ❌ Not using AS keyword to name build stage → can't reference it
- ❌ Copying entire build directory → includes unnecessary files
- ❌ Using same base image when smaller alternative exists for production

**Best Practices:**
- ✅ Name stages explicitly with AS keyword for clarity
- ✅ Use smallest viable base for production stage (alpine, distroless, scratch)
- ✅ COPY only specific artifacts, not entire directories
- ✅ Combine related RUN commands to reduce layers

## Related Skills

- Start with `dockerfile-basics` if new to Dockerfiles
- Use `docker-optimization` for advanced size reduction techniques
- Combine with `docker-security` for production hardening

💡 **Plugin**: For complete Docker setup, see `docker-fullstack` plugin
```

## Anti-Patterns to Avoid

When generating micro-skills, **DO NOT**:

1. ❌ **Agent System Prompt as Skill**
   - Agents have different purposes than skills
   - Agent prompts are too broad and context-heavy

2. ❌ **"All-in-One" Topic Skill**
   - Example: Don't create "docker/SKILL.md" covering all of Docker
   - Instead: Create 8-10 focused micro-skills

3. ❌ **Duplicate Content**
   - If concept appears in multiple skills, reference it, don't repeat
   - Use "Related Skills" section to link

4. ❌ **Theory-Heavy Explanations**
   - Skills should be practical, not academic papers
   - Focus on "how-to", not "why" (unless critical for understanding)

5. ❌ **Overly Generic Examples**
   - Bad: "Replace X with your value"
   - Good: Concrete example with explanation of what to change

## Success Criteria

A well-generated micro-skill:
- ✅ Can be read and understood in 2-3 minutes
- ✅ Provides immediate, actionable value
- ✅ Has copy-pasteable examples that work
- ✅ Stays under 150 lines
- ✅ Links to related skills for extended learning
- ✅ Follows consistent format

## Output Format

When generating a micro-skill using this meta-skill, output:

1. **Confirmation message** with skill name, category, and file path
2. **Full skill content** following the template
3. **Verification checklist** confirming all criteria met
4. **Related skills suggestion** for what to create next (if applicable)

Example output:
```
✅ Generated micro-skill: dockerfile-multistage
📁 Category: docker-core
💾 File path: .claude/skills/docker-core/dockerfile-multistage.md
📏 Length: 142 lines (within target 50-150)

[Full skill content here]

✅ Quality Checklist:
  ✅ Single responsibility
  ✅ 50-150 lines
  ✅ Actionable examples
  ✅ Clear use case
  ✅ Related skills linked

💡 Suggested next skills to create:
  - docker-core/dockerfile-optimization.md
  - docker-core/docker-compose-basics.md
```

---

## Usage Example

To generate a new micro-skill, invoke this meta-skill with:

```
I need to create a micro-skill for [specific task].

Task: [task name]
Category: [category]
Description: [one-line description]
Key concepts: [2-3 concepts]
Use cases: [2-3 scenarios]
Related skills: [list of related skills]
```

This meta-skill will:
1. Validate scope and ensure it's appropriate for a micro-skill
2. Generate the skill following the exact template
3. Ensure quality criteria are met
4. Save to the correct location
5. Suggest complementary skills to create

---

**Remember**: The goal is to create **small, focused, reusable skills** that minimize context usage while maximizing practical value.
