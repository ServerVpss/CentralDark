# COMANDO - pr-automation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\pr-automation.md
**SHA:** afa1856d285da460
**Timestamp:** 2026-08-28T02:02:06.793784
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Execute: `coderabbit --prompt-only -t uncommitted`

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
id: pr-automation
name: Automate Pull Request Creation for Open-Source Contributions
agent: github-devops
category: devops
complexity: medium
tools:
  - github-cli       # Create PRs, manage repository
  - coderabbit-free  # Pre-submission code review
checklists:
  - github-devops-checklist.md
  - pr-quality-checklist.md
---

# Automate Pull Request Creation for Open-Source Contributions

## Purpose

To help users contribute to the AIOS open-source project (`@synkra/aios-core`) by automating the PR creation process, ensuring contributions follow project standards, pass quality checks, and have proper formatting before submission.

**Target Repository**: `@synkra/aios-core` (open-source framework)

**Contribution Types Supported**:
- Expansion packs (new agents, tasks, workflows)
- Agent improvements (enhanced prompts, new commands)
- Task refinements (better checklists, templates)
- Tool integrations (new MCP tools)
- Bug fixes and improvements
- Documentation enhancements

## Input

### Required Parameters

- **contribution_type**: `string`
  - **Description**: Type of contribution
  - **Options**: `"Squad"`, `"agent"`, `"task"`, `"tool"`, `"bug-fix"`, `"documentation"`, `"improvement"`
  - **Required**: true

- **contribution_path**: `string`
  - **Description**: Path to new/modified files
  - **Example**: `"Squads/my-new-pack/"` or `"aios-core/agents/improved-agent.md"`
  - **Validation**: Path must exist locally

### Optional Parameters

- **title**: `string`
  - **Description**: PR title (auto-generated if not provided)
  - **Format**: `"{type}: {brief description}"`
  - **Example**: `"feat(Squad): Add content-creator pack with Instagram agent"`

- **description**: `string`
  - **Description**: PR description (auto-generated from template if not provided)

- **issue_number**: `number`
  - **Description**: Related issue number (if applicable)
  - **Example**: `42`
  - **Link**: Will add "Closes #42" to PR

- **run_coderabbit**: `boolean`
  - **Description**: Run CodeRabbit pre-check before submitting
  - **Default**: `true`
  - **Recommendation**: Always true for first-time contributors

- **skip_tests**: `boolean`
  - **Description**: Skip local test execution (NOT RECOMMENDED)
  - **Default**: `false`
  - **Warning**: Only use if tests already passing

## Output

- **pr_url**: `string`
  - **Description**: URL of created pull request
  - **Example**: `"https://github.com/SynkraAI/aios-core/pull/123"`

- **pr_number**: `number`
  - **Description**: PR number
  - **Example**: `123`

- **branch_name**: `string`
  - **Description**: Created feature branch
  - **Example**: `"contrib/Squad-content-creator"`

- **coderabbit_report**: `object` (if run_coderabbit=true)
  - **Structure**: `{ issues_found, security_warnings, suggestions, review_url }`
  - **Description**: Pre-submission code review results

- **quality_score**: `number`
  - **Description**: Contribution quality score (0-100)
  - **Criteria**: Documentation, tests, code quality, adherence to standards

- **next_steps**: `array<string>`
  - **Description**: What happens next (review process, timeline)

## Process

### Phase 1: Pre-Submission Validation (3 min)

1. **Validate Contribution Path**
   - Check if files exist locally
   - Verify correct directory structure
   - Ensure naming conventions followed

2. **Validate Repository State**
   - Check if `@synkra/aios-core` repository is set as upstream
   - Verify fork exists (or create one)
   - Ensure main branch is up-to-date

3. **Detect Contribution Type** (if not provided)
   - Scan modified files:
     - `Squads/*` → "Squad"
     - `aios-core/agents/*` → "agent"
     - `aios-core/tasks/*` → "task"
     - `aios-core/tools/*` → "tool"
     - `*.md` in docs → "documentation"
     - `*.test.js` or bug fixes → "bug-fix"

### Phase 2: Quality Pre-Check (5 min)

4. **Run Local Tests** (unless skip_tests=true)
   - Execute test suite: `npm test`
   - Check for failures
   - If failures: HALT and show errors

5. **Run CodeRabbit Pre-Check** (if run_coderabbit=true)
   - Execute: `coderabbit --prompt-only -t uncommitted`
   - Generate pre-submission review
   - Identify issues:
     - 🔴 **Critical**: Security, breaking changes, syntax errors
     - 🟠 **Important**: Best practices violations, missing tests
     - 🟡 **Suggestions**: Code style, performance tips

6. **Validate Contribution Standards**
   - Check against contribution guidelines:
     - [ ] **Expansion Packs**: Have README, agent.md, tasks/, proper structure
     - [ ] **Agents**: Follow agent template, have commands, dependencies
     - [ ] **Tasks**: Follow task format spec, have checklists, complete docs
     - [ ] **Tools**: Have tool definition YAML, usage examples
     - [ ] **Documentation**: Clear, well-formatted, no broken links

7. **Generate Quality Score**
   - **Documentation**: +30 points (README, inline comments, examples)
   - **Tests**: +25 points (test coverage, test quality)
   - **Code Quality**: +25 points (lintin
```