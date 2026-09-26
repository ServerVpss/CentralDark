---
name: meta-plugin-generator
category: meta
description: Generate plugins that orchestrate multiple micro-skills for complex tasks
---

# Meta-Plugin: Plugin Generator

## Purpose

This meta-plugin generates plugins that orchestrate multiple micro-skills and agents for complex, multi-step tasks while maintaining context efficiency.

**Key difference from skills:**
- **Micro-Skills**: Single, focused tasks (50-150 lines)
- **Plugins**: Orchestrate multiple micro-skills + agents for complex workflows

## When to Use

Create a plugin when:
- Task requires 3+ micro-skills working together
- Need to coordinate between skills and agents
- Complex workflow with clear steps
- Want to "burn tokens" for high-value, complex tasks

**Examples:**
- `frontend-fullstack`: Complete frontend app setup (React + Tailwind + shadcn)
- `docker-fullstack`: Full Docker setup (Dockerfile + Compose + Security)
- `debug-production`: Complete debugging workflow (logs + profiling + fix)

## Plugin Architecture

```
Plugin = Workflow Definition + Skills + Agents + Context Management

┌─────────────────────────────────────────────┐
│              PLUGIN                         │
│                                             │
│  Workflow:                                  │
│    1. Load micro-skill-A                    │
│    2. Execute step 1                        │
│    3. Load micro-skill-B                    │
│    4. Execute step 2                        │
│    5. Call agent-X for review               │
│    6. Load micro-skill-C                    │
│    7. Final validation                      │
│                                             │
│  Context: Only loads skills when needed     │
└─────────────────────────────────────────────┘
```

## Input Requirements

To generate a plugin, you need:

1. **Plugin Name**: Descriptive, purpose-focused (e.g., "frontend-fullstack-setup")
2. **Category**: One of: `frontend`, `backend`, `infrastructure`, `debugging`, `testing`
3. **Description**: 1-2 sentence overview
4. **Goal**: What the plugin achieves end-to-end
5. **Required Skills**: List of micro-skills needed (3-10 typical)
6. **Required Agents**: List of agents to coordinate with (0-3 typical)
7. **Workflow Steps**: Ordered sequence of operations
8. **Success Criteria**: How to verify plugin completed successfully

## Generation Template

```markdown
---
name: [plugin-name]
type: plugin
category: [category]
description: [1-2 sentence description]
estimated_tokens: [estimated total context usage]
---

# Plugin: [Human-Readable Name]

## Overview

[2-3 sentence overview of what this plugin does end-to-end]

**Use this plugin when you need to:** [specific scenario]

## What This Plugin Does

[Bullet list of high-level outcomes]
- ✅ Outcome 1
- ✅ Outcome 2
- ✅ Outcome 3

## Architecture

**Micro-Skills Used:**
- `[category]/[skill-1]` - [purpose]
- `[category]/[skill-2]` - [purpose]
- `[category]/[skill-3]` - [purpose]

**Agents Coordinated:**
- `[agent-1]` - [when called]
- `[agent-2]` - [when called]

**Estimated Context Usage:** ~[X]k tokens (vs ~[Y]k if loading all skills individually)

## Workflow

### Phase 1: [Phase Name]
**Goal:** [What this phase achieves]

1. **[Step 1 Name]**
   - Load skill: `[skill-name]`
   - Action: [What to do]
   - Output: [Expected result]

2. **[Step 2 Name]**
   - Load skill: `[skill-name]`
   - Action: [What to do]
   - Output: [Expected result]

### Phase 2: [Phase Name]
**Goal:** [What this phase achieves]

3. **[Step 3 Name]**
   - Load skill: `[skill-name]`
   - Action: [What to do]
   - Output: [Expected result]

4. **[Step 4 Name]**
   - Call agent: `[agent-name]`
   - Purpose: [Why calling agent]
   - Expected outcome: [What agent should deliver]

### Phase 3: [Phase Name]
**Goal:** [What this phase achieves]

5. **[Step 5 Name]**
   - Load skill: `[skill-name]`
   - Action: [What to do]
   - Output: [Expected result]

[Continue for all phases...]

## Context Optimization Strategy

**Lazy Loading:** Skills are loaded only when needed in workflow
**Unload After Use:** Skills not needed for remaining steps can be unloaded
**Agent Delegation:** Complex sub-tasks delegated to agents (they manage their own context)

**Context Timeline:**
```
Step 1: Load skill-A        → +5k tokens
Step 2: Execute skill-A     → context maintained
Step 3: Unload skill-A      → -5k tokens
Step 4: Load skill-B        → +4k tokens
Step 5: Execute skill-B     → context maintained
Step 6: Call agent-X        → agent manages own context
Step 7: Load skill-C        → +6k tokens
...
```

**Peak Context:** [X]k tokens (much less than loading all skills at once)

## Success Criteria

Plugin is successful when:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] All tests pass
- [ ] [Specific verification command succeeds]

## Usage Example

### Scenario: [Concrete use case]

**Input:**
```
[What user provides]
```

**Invocation:**
```bash
# Using slash command
/cook [use plugin: plugin-name] for [specific task]

# Or direct skill invocation
Skill: [plugin-name]
```

**Expected Output:**
```
[What gets created/modified]
```

**Verification:**
```bash
[Commands to verify success]
```

## Customization Options

### Option 1: [Customization Name]
**When to use:** [scenario]
**Modify:** [which step(s)]
**Example:** [how to customize]

### Option 2: [Customization Name]
**When to use:** [scenario]
**Modify:** [which step(s)]
**Example:** [how to customize]

## Troubleshooting

### Issue 1: [Common problem]
**Symptoms:** [How to recognize]
**Cause:** [Why it happens]
**Fix:** [How to resolve]

### Issue 2: [Common problem]
**Symptoms:** [How to recognize]
**Cause:** [Why it happens]
**Fix:** [How to resolve]

## Related Plugins

- `[plugin-1]`: Use when [scenario]
- `[plugin-2]`: Extends this plugin for [purpose]
- `[plugin-3]`: Alternative approach for [use case]

## Performance Metrics

**Context Usage:**
- Individual skills loaded separately: ~[X]k tokens
- This plugin (optimized): ~[Y]k tokens
- **Savings:** [Z]% reduction

**Time Estimate:**
- Simple task: [X] minutes
- Medium task: [Y] minutes
- Complex task: [Z] minutes

---

**Plugin Version:** 1.0
**Last Updated:** [Date]
**Maintained by:** [Author/Team]
```

## Example: Full Plugin Generation

**Input:**
```yaml
plugin_name: frontend-fullstack-setup
category: frontend
description: Complete setup for React + TypeScript + Tailwind + shadcn/ui app
goal: Production-ready frontend with modern stack
required_skills:
  - frontend-core/react-vite-setup
  - frontend-core/typescript-config
  - frontend-core/tailwind-setup
  - frontend-core/shadcn-setup
  - frontend-core/eslint-prettier
required_agents:
  - code-reviewer
workflow:
  - Setup Vite + React
  - Configure TypeScript
  - Install Tailwind CSS
  - Setup shadcn/ui
  - Configure linting
  - Review code quality
```

**Generated Output:** `.claude/plugins/frontend-fullstack-setup.md`

```markdown
---
name: frontend-fullstack-setup
type: plugin
category: frontend
description: Complete modern frontend setup with React, TypeScript, Tailwind, and shadcn/ui
estimated_tokens: ~25k
---

# Plugin: Frontend Fullstack Setup

## Overview

This plugin sets up a complete, production-ready frontend application using modern best practices: React 18+, TypeScript, Tailwind CSS, and shadcn/ui component library.

**Use this plugin when you need to:** Bootstrap a new frontend project or migrate existing project to modern stack.

## What This Plugin Does

- ✅ Creates Vite + React + TypeScript project
- ✅ Configures Tailwind CSS with custom theme
- ✅ Sets up shadcn/ui component library
- ✅ Configures ESLint + Prettier for code quality
- ✅ Sets up folder structure and best practices
- ✅ Creates sample components demonstrating patterns
- ✅ Validates setup with code review

## Architecture

**Micro-Skills Used:**
- `frontend-core/react-vite-setup` - Create Vite project with React
- `frontend-core/typescript-config` - Configure TypeScript for React
- `frontend-core/tailwind-setup` - Install and configure Tailwind CSS
- `frontend-core/shadcn-setup` - Setup shadcn/ui component library
- `frontend-core/eslint-prettier` - Configure code quality tools

**Agents Coordinated:**
- `code-reviewer` - Review final setup for best practices

**Estimated Context Usage:** ~25k tokens (vs ~55k if loading all frontend skills)

## Workflow

### Phase 1: Project Foundation
**Goal:** Create base React + TypeScript project

1. **Initialize Vite Project**
   - Load skill: `frontend-core/react-vite-setup`
   - Action: Create Vite project with React template
   - Output: Working React app with hot reload

2. **Configure TypeScript**
   - Load skill: `frontend-core/typescript-config`
   - Action: Setup tsconfig.json with strict mode
   - Output: Type-safe React environment

### Phase 2: Styling & Components
**Goal:** Setup Tailwind CSS and component library

3. **Install Tailwind CSS**
   - Load skill: `frontend-core/tailwind-setup`
   - Action: Install Tailwind, configure tailwind.config.js
   - Output: Tailwind utilities available in components

4. **Setup shadcn/ui**
   - Load skill: `frontend-core/shadcn-setup`
   - Action: Initialize shadcn/ui, add first components
   - Output: Reusable UI components with variants

### Phase 3: Code Quality
**Goal:** Enforce consistent code style and quality

5. **Configure Linting**
   - Load skill: `frontend-core/eslint-prettier`
   - Action: Setup ESLint + Prettier with React rules
   - Output: Auto-formatting and linting on save

6. **Code Review**
   - Call agent: `code-reviewer`
   - Purpose: Validate setup follows best practices
   - Expected outcome: Verified production-ready setup

## Context Optimization Strategy

**Lazy Loading:** Each skill loaded only when its phase starts
**Sequential Unloading:** Previous phase skills unloaded before next phase

**Context Timeline:**
```
Phase 1: Load react-vite-setup      → +5k tokens
         Load typescript-config     → +4k tokens
         Unload both after phase    → -9k tokens

Phase 2: Load tailwind-setup        → +6k tokens
         Load shadcn-setup          → +7k tokens
         Unload both after phase    → -13k tokens

Phase 3: Load eslint-prettier       → +5k tokens
         Call code-reviewer agent   → agent context isolated
```

**Peak Context:** ~13k tokens (much less than ~55k for all skills at once)

## Success Criteria

Plugin is successful when:
- [ ] `npm run dev` starts development server
- [ ] TypeScript compilation has no errors
- [ ] Tailwind utilities work in components
- [ ] shadcn/ui components render correctly
- [ ] ESLint shows no errors
- [ ] `npm run build` creates production bundle
- [ ] Code reviewer approves setup

## Usage Example

### Scenario: Create new React app for dashboard project

**Input:**
```
Project name: admin-dashboard
Port: 3000
Include: authentication, dark mode
```

**Invocation:**
```bash
/cook setup frontend fullstack app named admin-dashboard with authentication and dark mode
```

**Expected Output:**
```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── auth/         # Auth components
│   │   └── layout/       # Layout components
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── tsconfig.json
├── .eslintrc.js
└── package.json
```

**Verification:**
```bash
npm run dev        # Should start on localhost:3000
npm run build      # Should compile without errors
npm run lint       # Should show no errors
```

## Customization Options

### Option 1: Add React Router
**When to use:** Multi-page application
**Modify:** Phase 1, after step 2
**Example:**
```bash
npm install react-router-dom
# Add routing setup between steps 2 and 3
```

### Option 2: Add State Management (Zustand)
**When to use:** Complex state requirements
**Modify:** Phase 1, add new step
**Example:**
```bash
npm install zustand
# Create stores/ directory with example store
```

### Option 3: Skip shadcn/ui
**When to use:** Different component library
**Modify:** Remove Phase 2, step 4
**Example:** Use Material-UI or Ant Design instead

## Troubleshooting

### Issue 1: Tailwind classes not working
**Symptoms:** Styles not applied, classes have no effect
**Cause:** Tailwind not properly configured in postcss.config.js
**Fix:** Verify postcss.config.js has tailwindcss plugin, restart dev server

### Issue 2: TypeScript errors on shadcn components
**Symptoms:** Type errors on shadcn/ui imports
**Cause:** tsconfig paths not configured
**Fix:** Ensure tsconfig.json has paths mapping for @/components

### Issue 3: ESLint conflicts with Prettier
**Symptoms:** Formatting fights between tools
**Cause:** Conflicting rules
**Fix:** Install eslint-config-prettier to disable conflicting ESLint rules

## Related Plugins

- `backend-fullstack-setup`: API backend to complement this frontend
- `component-library-setup`: Extends this with Storybook and testing
- `frontend-deploy`: Deploy the created app to Vercel/Netlify

## Performance Metrics

**Context Usage:**
- All frontend skills loaded: ~55k tokens
- This plugin (optimized): ~25k tokens
- **Savings:** 55% reduction

**Time Estimate:**
- Simple app: 5-8 minutes
- Medium app (with auth): 10-15 minutes
- Complex app (with routing, state): 15-25 minutes

---

**Plugin Version:** 1.0
**Last Updated:** 2025-12-01
**Maintained by:** Skills Team
```

## Plugin Design Principles

### 1. Sequential Loading
Load skills one at a time as needed in workflow, not all at once

### 2. Agent Delegation
Complex sub-tasks → delegate to specialized agents
- Agents manage their own context
- Cleaner separation of concerns

### 3. Clear Success Criteria
Always define verifiable success criteria
- Commands to run for verification
- Expected output
- Quality checks

### 4. Customization Hooks
Provide clear extension points for common variations

### 5. Context Accounting
Track and document context usage at each step

## Quality Checklist

Before finalizing a plugin, verify:

- [ ] **Clear workflow**: Each step has clear input/output
- [ ] **Lazy loading**: Skills loaded only when needed
- [ ] **Agent coordination**: Agents called for appropriate sub-tasks
- [ ] **Success criteria**: Verifiable completion conditions
- [ ] **Context optimized**: 40-60% less than loading all skills
- [ ] **Tested**: Plugin tested end-to-end with real scenario
- [ ] **Documented**: Usage examples and customization options
- [ ] **Troubleshooting**: Common issues documented

## File Organization

Save plugins to:
```
.claude/plugins/[category]-[purpose].md
```

Examples:
- `frontend-fullstack-setup.md`
- `docker-production-deploy.md`
- `debug-performance-issues.md`
- `api-testing-suite.md`

## Usage in Commands

Plugins can be invoked via slash commands:

```bash
# Direct invocation
/cook [use plugin: frontend-fullstack-setup] for new dashboard app

# With customization
/cook [use plugin: docker-fullstack] but skip security hardening for local dev

# Chain plugins
/cook [plugin: frontend-fullstack] then [plugin: backend-fullstack] for complete app
```

## Anti-Patterns to Avoid

1. ❌ **Loading All Skills Upfront**
   - Bad: Load all skills at start of plugin
   - Good: Load each skill only when its step executes

2. ❌ **No Agent Delegation**
   - Bad: Try to do everything in plugin steps
   - Good: Delegate code review, testing, debugging to agents

3. ❌ **Vague Success Criteria**
   - Bad: "Setup complete"
   - Good: "npm run build succeeds, all tests pass, code reviewer approves"

4. ❌ **Monolithic Plugins**
   - Bad: Plugin with 15+ skills doing too much
   - Good: Focus plugin on specific, cohesive workflow

5. ❌ **No Customization Options**
   - Bad: One-size-fits-all, rigid workflow
   - Good: Clear extension points for common variations

## Success Metrics

A well-designed plugin:
- ✅ Saves 40-60% context vs loading all skills
- ✅ Has clear, sequential workflow
- ✅ Completes in reasonable time (most under 20 min)
- ✅ Produces verifiable, quality output
- ✅ Can be customized for common variations
- ✅ Has good troubleshooting docs

---

**Remember**: Plugins are for **complex, multi-step tasks** where orchestrating multiple skills provides value. For simple tasks, use micro-skills directly.
