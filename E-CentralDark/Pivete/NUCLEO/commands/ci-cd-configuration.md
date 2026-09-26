# COMANDO - ci-cd-configuration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\ci-cd-configuration.md
**SHA:** 96bd560b59233356
**Timestamp:** 2026-08-28T02:02:05.000825
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm ci
- run: npm run lint
- run: npm ci
- run: npm test -- --coverage
- run: npm ci
- run: npm run build
- run: npm ci
- run: npm run build

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
id: ci-cd-configuration
name: Configure CI/CD Pipeline
agent: github-devops
category: devops
complexity: high
tools:
  - github-cli       # Manage workflows and repository settings
  - coderabbit-free  # Automated code review (FREE tier)
checklists:
  - github-devops-checklist.md
---

# Configure CI/CD Pipeline

## Purpose

To set up a complete, production-ready CI/CD pipeline for a repository, including linting, testing, building, code review (CodeRabbit Free), and deployment automation.

## Supported CI Providers

- **GitHub Actions** (primary, recommended)
- **GitLab CI/CD**
- **CircleCI**
- **Jenkins** (basic support)

## Input

### Required Parameters

- **repository_path**: `string`
  - **Description**: Local path or GitHub URL of the repository
  - **Example**: `/path/to/project` or `https://github.com/user/repo`
  - **Validation**: Must be valid Git repository

- **ci_provider**: `string`
  - **Description**: CI/CD provider to configure
  - **Options**: `"github-actions"`, `"gitlab-ci"`, `"circleci"`, `"jenkins"`
  - **Default**: `"github-actions"`

- **project_type**: `string`
  - **Description**: Type of project (determines pipeline stages)
  - **Options**: `"nodejs"`, `"python"`, `"fullstack"`, `"monorepo"`
  - **Required**: true

### Optional Parameters

- **testing_framework**: `string`
  - **Description**: Primary testing framework
  - **Examples**: `"jest"`, `"pytest"`, `"vitest"`, `"mocha"`
  - **Auto-detect**: true (scans package.json or requirements.txt)

- **deployment_target**: `string`
  - **Description**: Where to deploy
  - **Options**: `"vercel"`, `"netlify"`, `"aws"`, `"none"`
  - **Default**: `"none"`

- **enable_coderabbit**: `boolean`
  - **Description**: Enable CodeRabbit Free for automated code review
  - **Default**: `true`
  - **Note**: **FREE tier** - No cost, no API keys needed for public repos

- **branch_protection**: `boolean`
  - **Description**: Enable branch protection rules
  - **Default**: `true`
  - **Rules**: Require PR, require status checks, no force push

- **required_checks**: `array<string>`
  - **Description**: Status checks that must pass
  - **Default**: `["lint", "test", "build"]`

- **secrets**: `object`
  - **Description**: Environment secrets (will be stored securely)
  - **Example**: `{ VERCEL_TOKEN: "xxx", DATABASE_URL: "postgres://..." }`

## Output

- **workflow_files**: `array<string>`
  - **Description**: Created workflow/config files
  - **Example**: `[".github/workflows/ci.yml", ".github/workflows/deploy.yml"]`

- **branch_protection_rules**: `object`
  - **Description**: Applied branch protection settings
  - **Structure**: `{ branch, required_checks, enforce_admins, allow_force_push }`

- **coderabbit_config**: `object` (if enabled)
  - **Description**: CodeRabbit configuration
  - **Structure**: `{ enabled: true, config_file: ".coderabbit.yaml", integration_status: "active" }`

- **secrets_configured**: `array<string>`
  - **Description**: List of secrets successfully stored
  - **Note**: Values not included (security)

- **pipeline_url**: `string`
  - **Description**: URL to view pipeline runs
  - **Example**: `"https://github.com/user/repo/actions"`

- **README_section**: `string`
  - **Description**: Markdown section to add to README.md
  - **Content**: CI/CD badges, status, setup instructions

## Process

### Phase 1: Repository Analysis & Validation (2 min)

1. **Validate Repository**
   - Check if valid Git repository
   - Verify remote origin exists
   - Check CI provider compatibility

2. **Detect Project Structure**
   - Auto-detect project type (if not provided)
   - Scan for package.json, requirements.txt, pom.xml, etc.
   - Identify testing framework
   - Identify build commands

3. **Check Existing CI Configuration**
   - Look for existing workflows
   - Warn if overwriting: "⚠️ Found existing CI config. Backup created at: {path}"

### Phase 2: CodeRabbit Free Setup (2 min) 🆓

**Note**: CodeRabbit Free is **100% FREE** for public repositories. No API keys, no credit card, no costs.

4. **Install CodeRabbit GitHub App**
   - Guide user: "To enable CodeRabbit Free:
     1. Visit: https://github.com/apps/coderabbitai
     2. Click 'Install' (FREE for public repos)
     3. Grant access to repository: {repo_name}
     4. Return here when done"
   - Wait for user confirmation
   - Verify installation via GitHub API

5. **Create CodeRabbit Configuration**
   - Generate `.coderabbit.yaml`:
     ```yaml
     # CodeRabbit Free Configuration
     # 🆓 FREE for public repositories - No costs, no limits
     
     language: "en-US"
     
     reviews:
       profile: "chill"  # balanced review depth
       request_changes_workflow: false
       high_level_summary: true
       poem: false
       review_status: true
       collapse_walkthrough: false
       auto_review:
         enabled: true
         ignore_title_keywords:
           - "WIP"
           - "DO NOT REVIEW"
       
     chat:
       auto_reply: true
     
     # Focus areas (a
```