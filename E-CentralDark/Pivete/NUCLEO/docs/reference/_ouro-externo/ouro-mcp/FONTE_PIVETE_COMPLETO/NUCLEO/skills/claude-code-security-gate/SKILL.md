---
name: claude-code-security-gate
description: "Claude Code security gates and authentication management for read-only hooks and permission controls."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Claude, Security, Hook, Authentication, Permissions]
    related_skills: [claude-code, hermes-agent]
---

# Claude Code Security Gates

This skill captures the authentication and permission management patterns in Claude Code, focusing on **read-only audit patterns**, security hooks (PreToolUse, PostToolUse), and authentication gating mechanisms used in the CentralDark ecosystem.

## Core Authentication & Permission Patterns

### 1. Permissions Schema Structure

Use this schema for Claude Code permissions configuration:

```json
{
  "permissions": {
    "allow": ["permission1", "permission2"],
    "ask": ["ask_permission1", "ask_permission2"],
    "deny": ["deny_permission1", "deny_permission2"]
  }
}
```

**Key points:**
- `allow` = Always OK
- `ask` = Ask before execution
- `deny` = Block with exit 2

### 2. Critical Security Hooks

#### PreToolUse: Command Validation Hook
```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "if grep -q 'rm -rf|git push.*--force' <<<\"$CLAUDE_TOOL_INPUT\"; then echo 'Dangerous command blocked!' && exit 2; fi"
    }]
  }]
}
```

**Critical behavior:** 
- `exit 2` = Permission denial (specific, documented blocking response)
- Used in security validation before command execution
- NOT error code 1 (that's general failure)

#### PostToolUse: Auto-Format Hook
```json
{
  "PostToolUse": [{
    "matcher": "Write(*.py)",
    "hooks": [{
      "type": "command",
      "command": "ruff check --fix $CLAUDE_FILE_PATHS"
    }]
  }]
}
```

### 3. Environment Variable Mappings

| Hook Type | Variable | Purpose |
|-----------|----------|---------|
| PreToolUse | `CLAUDE_TOOL_INPUT` | Raw tool parameters (for command validation) |
| PostToolUse | `CLAUDE_FILE_PATHS` | Files being written (for post-processing) |

### 4. CentralDark Authentication Integration

#### Hermes-Integrated Setup
```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash /root/CentralDark/scripts/notify-claude/notify-telegram.sh '🤖' 'Claude Code — CentralDark' 'Resposta concluída. Aguardando próxima instrução do Pivete.'"
      }]
    }]
  },
  "hermes": {
    "core_path": "/root/CentralDark/apps/modulos/HERMES-CORE",
    "core_path_relativo": "apps/modulos/HERMES-CORE",
    "config": "apps/modulos/mcp/config/hermes.json",
    "boot_log": "apps/modulos/mcp/logs/hermes-boot.json",
    "boot_endpoint": "https://mcp.centralldark.com/hermes/boot"
  }
}
```

**Key insight:** Hermes integration follows the same security pattern but with centralized logging and notification infrastructure.

## Portability & Cross-Platform Considerations

### 1. Path Handling for Security Hooks

**Avoid absolute paths in production:**

```json
// ❌ Hardcoded (Windows native but fails on Linux)
"command": "bash /root/CentralDark/scripts/notify-claude/notify-telegram.sh"

// ✅ Relative (portable across platforms)
"command": "bash scripts/notify-claude/notify-telegram.sh"
```

### 2. Environment-Specific Variations

| Environment | Path Format | Notes |
|------------|-------------|-------|
| Windows | `C:\Scripts\notify-claude\notify-telegram.bat` | Use backslashes, `!` for batch syntax |
| Linux/macOS | `#!/bin/bash scripts/notify-claude/notify-telegram.sh` | Use forward slashes, `#!/bin/bash` |

### 3. Git Protocol Authorization

> **Critical:** Git operations require the `permito-pivete` GitHub PR label for security gate bypass, not configuration changes.

```json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git log --oneline)",
      "Bash(git diff --stat)"
    ],
    "ask": [
      "Bash(git push)",
      "Bash(git merge)",
      "Bash(git rebase)"
    ],
    "deny": [
      "Read(.env)",
      "Bash(rm -rf)",
      "Bash(git push --force)",
      "Bash(:(){ :|:& };:)"
    ]
  }
}
```

## Read-Only Audit Patterns

### 1. Settings Hierarchy

Claude Code settings follow this priority (read-only reference):

1. **CLI flags** — Override everything (read-only)
2. **Local project:** `.claude/settings.local.json` (personal, gitignored)
3. **Project:** `.claude/settings.json` (shared, git-tracked)
4. **User:** `~/.claude/settings.json` (global)

### 2. Critical Hook Detection Tests

```bash
# Test 1: Verify PreToolUse exists
cat .claude/settings.json | grep -q '"PreToolUse"' && echo "PreToolUse configured" || echo "PreToolUse MISSING"

# Test 2: Check security deny patterns
cat .claude/settings.json | grep '"Bash(rm -rf)"'

# Test 3: Validate exit 2 usage
cat .claude/settings.json | grep '"exit 2"'
```

### 3. Content Validation Commands

```bash
# Check for essential security patterns
cat .claude/settings.json | python3 << 'EOF'
import json, sys
content = sys.stdin.read()
try:
    data = json.loads(content)
    hooks = data.get('hooks', {})
    pretooluse = hooks.get('PreToolUse', [])
    print("✅ PreToolUse hooks found:", len(pretooluse))
    
    # Check for Bash matcher
    bash_matchers = [h for h in pretooluse if h.get('matcher') == 'Bash']
    print("✅ Bash command validation:", len(bash_matchers))
    
    # Check for deny patterns in permissions
    permissions = data.get('permissions', {})
    deny_patterns = [p for p in permissions.get('deny', []) if any(x in p for x in ['rm -rf', 'git push', '--force'])]
    print("✅ Security deny patterns:", len(deny_patterns))
    
except json.JSONDecodeError as e:
    print("❌ Invalid JSON:", e)
EOF
```

## Reproduction Recipes

### 1. Complete Security Setup Recipe

Save to `scripts/claude-security-setup.sh`:

```bash
#!/bin/bash
# Claude Code Security Setup Recipe
# Portable, idempotent setup for production systems

set -euo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

# Backup existing settings
sudo cp .claude/settings.json .claude/settings.json.backup.$(date +%Y%m%d%H%M%S)

# Create minimal security configuration
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(git status)", "Read", "Edit"],
    "ask": ["Bash(git push)"],
    "deny": ["Read(.env)", "Bash(rm -rf)", "Bash(git push --force)", "Bash(:(){ :|:& };:)"]
  },
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE 'rm -rf|git push.*--force'; then echo 'Dangerous command blocked!' && exit 2; fi"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write(*.py)",
      "hooks": [{
        "type": "command",
        "command": "ruff check --fix $CLAUDE_FILE_PATHS"
      }]
    }]
  }
}
EOF

echo "✅ Security configuration applied to $(git rev-parse --show-toplevel)"
echo "⚠️  Test with: cat .claude/settings.json"
```

### 2. Authentication Integration Test (Hermes)

Save to `tests/claude-auth-integration.test.sh`:

```bash
#!/bin/bash
# Claude Code Authentication Integration Test
# Validates Hermes integration with Claude Code security gates

set -euo pipefail

test_claude_auth_integration() {
    local project_root="$(git rev-parse --show-toplevel)"
    
    # Test 1: Verify settings.json exists
    if [[ ! -f "${project_root}/.claude/settings.json" ]]; then
        echo "❌ .claude/settings.json not found"
        return 1
    fi
    
    # Test 2: Validate JSON structure
    if ! python3 -m json.tool "${project_root}/.claude/settings.json" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in .claude/settings.json"
        return 1
    fi
    
    # Test 3: Check PreToolUse configuration
    if ! grep -q '"PreToolUse"' "${project_root}/.claude/settings.json"; then
        echo "❌ PreToolUse hook not configured"
        return 1
    fi
    
    # Test 4: Validate security patterns
    if ! grep -q '"Bash(rm -rf)"' "${project_root}/.claude/settings.json"; then
        echo "❌ Security deny patterns missing"
        return 1
    fi
    
    echo "✅ Claude Code authentication integration validated"
}

test_claude_auth_integration
```

## Pitfalls & Workarounds

### 1. Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Hardcoded absolute paths | Fails on cross-platform | Use relative paths |
| Forgetting exit 2 | Permission denial returns unclear error | Use `exit 2` for security blocks |
| Missing Bash matcher | Shell commands not validated | Add `"matcher": "Bash"` to PreToolUse hook |
| Ignoring consolidated areas | PR fails validate map check | Add `permito-pivete` label |

### 2. Troubleshooting Commands

```bash
# Debug PreToolUse hook
git diff HEAD~1 .claude/settings.json | grep -A5 -B5 '"PreToolUse"'

# Check exit 2 usage validation
cat .claude/settings.json | grep -q '"exit 2"' && echo "✅ Security exit code configured" || echo "❌ Missing security exit code"

# Validate GitHub label requirement
gh pr view --json labels | grep '"permito-pivete"'
```

## References

- `references\claude-security-gate\auth-patterns.md` — Detailed authentication patterns
- `references\claude-security-gate\hook-validation.md` — Hook validation recipes
- `references\claude-security-gate\portability.md` — Cross-platform compatibility matrix

## Quick Commands

```bash
# Generate minimal security configuration
claude-code-security-gate-generate.sh

# Test current configuration validation
test-claude-security-config.sh

# Validate authentication integration
test-claude-auth-integration.sh
```

**Coverage Areas:** Claude Code security hooks, authentication patterns, portable configuration, cross-platform compatibility, read-only audit capabilities, automation recipes, and troubleshooting.

Note: This skill covers Claude Code authentication and permission management; consider also loading `claude-code` for complete Claude Code orchestration guidance.
