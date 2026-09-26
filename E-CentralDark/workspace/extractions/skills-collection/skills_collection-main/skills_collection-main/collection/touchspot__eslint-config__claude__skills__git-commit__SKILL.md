---
name: git-commit
description: Create git commits with Conventional Commits format. Analyzes changes to write meaningful messages. Use when committing changes, committing staged files, creating commits, making commits, or writing git commit messages.
---

# Git Commit Skill

## Overview

This skill enables creating well-structured git commits in sandbox environments where heredoc syntax is unavailable. It provides a workflow for analyzing code changes, understanding what functionality changed (not just which files), and creating Conventional Commits-compliant commit messages with proper multi-line formatting.

## Commit Workflow

Follow this workflow when creating commits:

### Step 1: Analyze Current State

Before creating a commit, gather comprehensive information about the repository state:

```bash
# Check current status
git status

# View unstaged changes
git diff

# View staged changes
git diff --cached

# View recent commit history to understand commit message style
git log --oneline -10

# View detailed recent commits to understand body format
git log -3
```

### Step 2: Retrieve Commitlint Configuration

This project uses commitlint with Conventional Commits. Run the helper script to extract all rules:

```bash
"${PROJECT_DIR}/.claude/skills/git-commit/scripts/get-rules.js"
```

This outputs a JSON object containing all commitlint rules.

**Commitlint rule structure (common to all rules):**

Each rule is an array: `[level, applicability, value]`

- **level**: `1` = warning, `2` = error (disabled rules are filtered out)
- **applicability**: `"always"` or `"never"`
- **value**: Rule-specific value (number, array, string, etc.)

**Key rules to extract:**

**`rules.type-enum`** (e.g., `[2, "always", ["feat", "fix", ...]]`)

- Extract the third element (array of allowed commit types)

**`rules.header-max-length`** (e.g., `[2, "always", 100]`)

- Extract the third element (maximum header length in characters)

**`rules.body-max-line-length`** (e.g., `[2, "always", 100]`)

- Extract the third element (maximum body line length in characters)

**`rules.scope-enum`** (e.g., `[2, "always", ["eslint-config", "global", ...]]`)

- Extract the third element (array of allowed scopes)

### Step 3: Understand What Changed (Not Just Which Files)

**THIS IS THE MOST CRITICAL STEP.** Before writing any commit message, you MUST answer: **"Why was this change necessary?"**

**ALWAYS start by identifying the problem or goal:**

- What problem existed before this change?
- What new capability is being added?
- What behavior was wrong and is now fixed?

**Focus on the OUTCOME and PURPOSE, never the implementation details:**

❌ **Bad**: "Update `auth.ts` and add `validation.ts`"
✅ **Good**: "add password reset functionality"

❌ **Bad**: "Modify config files"
✅ **Good**: "enable TypeScript strict mode"

❌ **Bad**: "Change button styles in multiple components"
✅ **Good**: "improve button accessibility with ARIA labels"

❌ **Bad**: "Move `.npmignore` and update tsconfig"
✅ **Good**: "prevent test files from being published to npm"

❌ **Bad**: "Add new API endpoint and update routes"
✅ **Good**: "enable users to delete their account"

**Required questions to answer BEFORE writing the subject:**

1. **For `feat`**: What new capability can END USERS of this project now use?
    - For this ESLint config project: New rules, new addons, new configuration options
    - NOT for: Development tools, CI improvements, documentation tooling
2. **For `fix`**: What was broken for END USERS? What problem did they face?
    - For this ESLint config project: Broken rules, incorrect linting behavior
    - NOT for: Build process issues, development workflow problems
3. **For `deps`**: What production dependency was updated?
    - `dependencies` or `peerDependencies` in `package.json` that affect library behavior
    - NOT for: `devDependencies` (use `chore` instead)
4. **For `chore`**: What development/maintenance task was done?
    - Development tools (e.g., tools in `mise.toml`), updates to `devDependencies`
    - Repository maintenance, tooling improvements
5. **For `build`**: What changed in the build system or dependencies?
    - Build configuration, `package.json` scripts, build tools
6. **For `docs`**: What documentation was improved for end users?
7. **For `refactor` / `perf`**: What code behavior improved without adding features?

**Critical: Distinguish between END USER features vs DEVELOPER tools**

- ✅ "feat: Add new ESLint rule for async/await patterns (affects users of this config)"
- ❌ "feat: Add git-commit skill (only affects developers of this project)"
- ✅ "chore: Add git-commit skill for commit automation"

**The subject line must answer "why", not "what" or "how".**

Read the actual code changes to understand their purpose, not just which files were modified.

### Step 4: Choose Type and Scope

**Type Selection:**

Choose a type from the allowed types in `rules.type-enum` (retrieved in Step 2). **Always consider: Is this change for END USERS or only for DEVELOPERS?**

Common types for this ESLint config project:

- `feat`: New ESLint rules, new addons (`react`, `next`, etc.), new configuration options
- `fix`: Fix broken ESLint rules, incorrect linting behavior
- `deps`: Production dependency updates (`dependencies`, `peerDependencies` in `package.json`)
- `chore`: Development dependency updates (`devDependencies`), development tools, repository maintenance
- `build`: Build system changes (Turborepo, TypeScript config)
- `docs`: User-facing documentation (README, usage guides)
- `refactor`: Code restructuring without behavior change
- `test`: Test additions or modifications

**Scope Selection:**

**Scope can always be omitted in this project.** While scopes are validated via `rules.scope-enum`, omitting the scope is acceptable:

- Format with scope: `type(scope): subject`
- Format without scope: `type: subject`

When in doubt, omit the scope.

### Step 5: Craft the Commit Message

Follow Conventional Commits format:

```
<type>: <subject>

<body>

<footer>
```

Or with optional scope:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Important: Write all commit messages in English.**

**Backtick Usage (both Subject and Body):**

Always enclose the following in backticks:

- File names: `auth.ts`, `package.json`, `mise.toml`, `.npmignore`
- Directory names: `src/`, `__snapshots__/`
- Library/package names: `react`, `zx`, `eslint`, `@touchspot/eslint-config`
- Tool/command names: `git-commit`, `commitlint`, `pnpm`, `jq`
- Function/method names: `useState()`, `commit.js`, `Skill(git-commit)`
- Code identifiers: `mcp__ide`, `PROJECT_DIR`, `type-enum`
- Constants/naming conventions: `KEBAB_CASE`, `UPPER_CASE`, `camelCase`
- Environment variables: `NODE_ENV`, `PATH`

**Special Characters and Arrows (both Subject and Body):**

**CRITICAL: Only use basic ASCII characters for arrows and symbols. Never use Unicode alternatives.**

For arrows, ALWAYS use the two-character ASCII sequence:

- ✅ Use `->` (hyphen + greater-than, ASCII 0x2D 0x3E)
- ❌ DO NOT use → (U+2192, rightwards arrow)
- ❌ DO NOT use any Unicode arrow characters (U+2190-U+21FF)
- ❌ DO NOT use any control characters or special quotation marks

Examples of correct usage:

- "`oldName` -> `newName`"
- "`entryPoint` -> `entry`"
- "Change A -> B for consistency"

**Why this matters:**

- Unicode arrows and special characters can be corrupted during git operations
- Some terminal/editor combinations display them as control character codes like `<U+0092>`
- ASCII `->` is universally supported and displays correctly everywhere
- Git commit messages should use only ASCII characters for maximum compatibility

**Subject (required):**

- **MUST describe the outcome/purpose, NEVER describe file changes**
- Use imperative mood: "add", "fix", "improve" (not "added", "fixed", "improved")
- Answer "why was this change necessary?" not "what files were changed?"
- Apply backtick rules above when mentioning technical terms
- No period at the end
- Keep under `rules.header-max-length` (see Step 2)
- Use lower-case or sentence-case as required by this project

Examples:

- ✅ "prevent test files from being published to npm"
- ❌ "move `.npmignore` to root and update tsconfig"

**Body (recommended for non-trivial changes):**

- **Explain WHY the change was necessary (the problem/motivation)**
- Explain WHAT was changed in detail (implementation details belong here, not in subject)
- List specific files, components, or modules modified
- Apply backtick rules above consistently
- Use bullet points for multiple changes
- Wrap lines at `rules.body-max-line-length` (see Step 2)
- Leave a blank line after the subject

**Role separation:**

- **Subject**: WHY (the purpose/outcome) - "prevent test files from being published"
- **Body**: WHAT (the implementation) - "Move `.npmignore` to root, exclude `__snapshots__/`"

**Footer (optional):**

- Reference issues: "Fixes #123", "Relates to #456"
- Document breaking changes: "BREAKING CHANGE: description"
- Leave a blank line after the body

**Example commit message:**

```
fix: prevent form submission with empty required fields

Previously, the FormInput component allowed forms to be submitted
even when required fields were empty due to missing client-side
validation.

Changes:
- Add validation logic to FormInput component (`src/components/FormInput.tsx`)
- Display inline error messages for invalid inputs
- Disable submit button when validation fails
- Add validation tests (`test/FormInput.test.ts`)

Fixes #234
```

### Step 6: Stage Files (if needed)

If files are not yet staged, stage them appropriately:

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage all changes (use carefully)
git add .

# Stage only modified files (not new/deleted)
git add -u
```

**Important:** Be selective about what to stage. Related changes should be committed together, but unrelated changes should be separate commits.

### Step 7: Execute the Commit

**Use the `Write` tool and temporary file approach for sandbox environments:**

Follow this workflow to commit safely in sandbox environments:

1. **Create a temporary file with a unique random path:**

    ```bash
    mktemp -p ${PROJECT_DIR}/.claude/skills/git-commit/drafts
    ```

    This command:
    - Creates a new temporary file with a unique random name
    - Returns the full path to the created file in the standard output
    - Ensures the file is fresh and empty
    - Guarantees no conflicts with previous temporary files

    The output will be the full path to the temporary file.
    Use this path in the following steps.

2. **Read the temporary file using the `Read` tool:**

    ```
    Read tool with file_path: /path/to/the/temporary/file
    ```

    This step is required before using the `Write` tool on a newly created file.
    The file will be empty at this point, which is expected.

3. **Write commit message to the temporary file using the `Write` tool:**

4. **Execute the commit using the temporary file:**

    ```bash
    git commit -F /path/to/the/temporary/file
    ```

5. **Clean up the temporary file:**

    ```bash
    rm /path/to/the/temporary/file
    ```

**Why use this approach?**

In Claude Code's sandbox environment:

- Heredoc syntax (`cat <<'EOF'`) is not available
- Direct command-line commit messages with newlines fail or get corrupted
- Special characters get escaped incorrectly when passed as command arguments
- The Write tool + `git commit -F` approach:
    - Writes the commit message exactly as-is to a file
    - Uses git's `-F` (file) option to read the message
    - Avoids shell escaping issues entirely
    - Preserves all newlines, special characters, and formatting correctly
- The Read tool must be used before Write tool for newly created files (Claude Code requirement)

### Step 8: Verify the Commit

After committing, verify:

```bash
# Check commit was created
git log -1

# View the full commit message
git log -1 --format=full

# Check commit status
git status
```

## Common Pitfalls to Avoid

1. **Don't describe implementation/files in subject - describe the purpose**
    - ❌ "move `.npmignore` to root and update tsconfig"
    - ✅ "prevent test files from being published to npm"
    - ❌ "add new API endpoint and update routes"
    - ✅ "enable users to delete their account"
    - ❌ "update `auth.ts` and `validation.ts`"
    - ✅ "add password reset functionality"

2. **Don't use past tense**
    - ❌ "Added feature" or "Fixed bug"
    - ✅ "add feature" or "fix bug"

3. **Don't exceed length limits**
    - Check `rules.header-max-length` and `rules.body-max-line-length` from Step 2

4. **Don't omit the body for complex changes**
    - Simple one-line changes: subject only is fine
    - Multi-file or complex changes: include body explaining WHY and WHAT

5. **Don't write the subject before understanding WHY**
    - ALWAYS answer "why was this change necessary?" first
    - Then write the subject based on that answer
    - File changes and implementation details go in the body, not subject

6. **Don't use `feat` for developer-only changes**
    - ❌ "feat: add `git-commit` skill for commit automation"
    - ✅ "chore: add `git-commit` skill for commit automation"
    - ❌ "feat: add GitHub Actions workflow for CI"
    - ✅ "ci: add GitHub Actions workflow for CI"
    - Ask: "Does this change what END USERS can do with this ESLint config?"
