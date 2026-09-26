# COMANDO - release-management.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\release-management.md
**SHA:** 485a3003626a8f1f
**Timestamp:** 2026-08-28T02:02:08.818226
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Run: `git merge-base --is-ancestor <tag> HEAD` for each tag
- --dry-run=true

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
id: release-management
name: Manage Software Releases
agent: github-devops
category: devops
complexity: high
tools:
  - github-cli # Create releases, tags, manage artifacts
  - semantic-release # Automate versioning and changelog
checklists:
  - github-devops-checklist.md
---

# Manage Software Releases

## Purpose

To automate the complete software release process, including:

- Semantic versioning (major.minor.patch)
- Changelog generation from commits
- Git tagging
- GitHub/GitLab Release creation
- Package publishing (npm, PyPI, Docker, etc.)
- Release notes generation

## Input

### Required Parameters

- **repository_path**: `string`
  - **Description**: Local path or URL of repository
  - **Example**: `/path/to/project` or `https://github.com/user/repo`
  - **Validation**: Must be valid Git repository

- **release_type**: `string`
  - **Description**: Type of release to create
  - **Options**: `"auto"` (detect from commits), `"major"`, `"minor"`, `"patch"`, `"prerelease"`
  - **Default**: `"auto"`

### Optional Parameters

- **release_branch**: `string`
  - **Description**: Branch to release from
  - **Default**: `"main"`
  - **Note**: Must be default branch for production releases

- **changelog_format**: `string`
  - **Description**: Changelog style
  - **Options**: `"keep-a-changelog"`, `"angular"`, `"conventional-commits"`
  - **Default**: `"conventional-commits"`

- **package_registry**: `array<string>`
  - **Description**: Where to publish package
  - **Options**: `["npm"]`, `["pypi"]`, `["docker-hub"]`, `["github-packages"]`
  - **Default**: Auto-detect from project type

- **dry_run**: `boolean`
  - **Description**: Test release without publishing
  - **Default**: `false`

- **prerelease_tag**: `string`
  - **Description**: Tag for prerelease (if release_type="prerelease")
  - **Examples**: `"alpha"`, `"beta"`, `"rc"`
  - **Default**: `"beta"`

- **skip_ci**: `boolean`
  - **Description**: Skip CI checks (emergency releases only)
  - **Default**: `false`
  - **Warning**: Only use for critical hotfixes

## Output

- **new_version**: `string`
  - **Description**: Version number created
  - **Example**: `"2.1.3"`

- **git_tag**: `string`
  - **Description**: Git tag created
  - **Example**: `"v2.1.3"`

- **changelog**: `string`
  - **Description**: Generated CHANGELOG.md content for this release

- **release_url**: `string`
  - **Description**: URL to GitHub/GitLab Release
  - **Example**: `"https://github.com/user/repo/releases/tag/v2.1.3"`

- **published_packages**: `array<object>`
  - **Description**: Published packages with URLs
  - **Structure**: `{ registry, package_name, version, url }`
  - **Example**: `[{ registry: "npm", package_name: "aios-core", version: "2.1.3", url: "https://npmjs.com/package/aios-core" }]`

- **release_notes**: `string`
  - **Description**: Formatted release notes (for announcements)

- **breaking_changes**: `array<string>`
  - **Description**: List of breaking changes (if any)
  - **Note**: Empty array if backward compatible

## Process

### Phase 1: Pre-Release Validation (2 min)

1. **Validate Repository State**
   - Check if on release branch
   - Verify no uncommitted changes
   - Ensure branch is up-to-date with remote
   - Check CI status (must be passing unless skip_ci=true)

2. **🔴 CRITICAL: Validate Tag Reachability**
   - Check which version tags are reachable from HEAD
   - Run: `git merge-base --is-ancestor <tag> HEAD` for each tag
   - **If NO tags are reachable** → semantic-release will create v1.0.0!
   - This can happen after `git filter-repo` rewrites history
   - **Resolution**: Create a baseline tag at current package.json version:
     ```bash
     git tag v$(node -p "require('./package.json').version")
     git push origin v$(node -p "require('./package.json').version")
     ```

3. **Analyze Commits Since Last Release**
   - Get last version tag (e.g., `v2.1.2`)
   - Get commits since last tag: `git log v2.1.2..HEAD`
   - Parse commit messages (Conventional Commits)

4. **Determine Version Bump**
   - If `release_type="auto"`:
     - **BREAKING CHANGE** in commits → **major** bump (2.1.2 → 3.0.0)
     - **feat:** commits → **minor** bump (2.1.2 → 2.2.0)
     - **fix:** commits → **patch** bump (2.1.2 → 2.1.3)
     - No eligible commits → **HALT** (nothing to release)
   - Else: Use specified `release_type`
   - Calculate new version: `{major}.{minor}.{patch}`

5. **Check Breaking Changes**
   - Scan for `BREAKING CHANGE:` or `!` in commit messages
   - Extract breaking change descriptions
   - If found and major bump not planned → **WARN** user

### Phase 2: Changelog Generation (2 min)

5. **Generate CHANGELOG.md Updates**
   - Group commits by type:
     - **Breaking Changes** (⚠️)
     - **Features** (✨ feat:)
     - **Bug Fixes** (🐛 fix:)
     - **Performance** (⚡ perf:)
     - **Documentation** (📝 docs:)
     - **Refactoring** (♻️ refactor:)
     - **Tests** (✅ test:)
     - **Chores** (🔧 chore:)
   - Format according to `changelog_
```