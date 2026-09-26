# COMANDO - auto-worktree.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\workflows\auto-worktree.yaml
**SHA:** 96e6795192ce4212
**Timestamp:** 2026-08-28T02:02:10.052134
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Navigate:   cd {worktree.path}

### Ouro Bruto (primeiros 5000 chars)
```
workflow:
  id: auto-worktree
  name: Auto-Worktree - Automatic Isolated Development Environment
  version: "1.0"
  description: >-
    Automatically creates and manages isolated worktrees for story development.
    Triggered when @dev starts working on a story, ensuring parallel development
    capability and clean isolation between different development tasks.

    Part of the Auto-Claude ADE (Autonomous Development Engine) infrastructure.

  type: automation
  project_types:
    - aios-development
    - autonomous-development
    - parallel-development

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              TRIGGER CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════════════════

  triggers:
    # Primary trigger: When @dev starts a story
    - event: story_started
      agent: dev
      condition: projectConfig.autoWorktree.enabled === true
      action: create_worktree

    # Secondary trigger: When @po assigns a story
    - event: story_assigned
      agent: po
      condition: projectConfig.autoWorktree.createOnAssign === true
      action: create_worktree

    # Manual trigger: Explicit command
    - event: command
      command: "*auto-worktree"
      action: interactive_flow

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════════════════

  config:
    # Enable automatic worktree creation
    enabled: true

    # Create worktree when story is assigned (before development starts)
    createOnAssign: false

    # Automatically switch to worktree after creation
    autoSwitch: true

    # Show worktree creation summary
    verbose: true

    # Cleanup stale worktrees before creating new one
    autoCleanup: false

    # Maximum worktrees before requiring cleanup
    maxWorktrees: 10

    # Days before worktree is considered stale
    staleDays: 30

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              PRE-FLIGHT CHECKS
  # ═══════════════════════════════════════════════════════════════════════════════════

  pre_flight:
    enabled: true

    checks:
      - id: git_repo
        description: Verify git repository
        command: git rev-parse --is-inside-work-tree
        blocking: true
        error: "Not a git repository. Auto-worktree requires git."

      - id: worktree_support
        description: Verify git worktree support
        command: git worktree list
        blocking: true
        error: "Git worktree not supported. Requires git >= 2.5."

      - id: worktree_manager
        description: Verify WorktreeManager available
        file_exists: .aios-core/infrastructure/scripts/worktree-manager.js
        blocking: true
        error: "WorktreeManager not found. AIOS infrastructure incomplete."

      - id: check_limit
        description: Check worktree limit not exceeded
        script: |
          const WorktreeManager = require('./.aios-core/infrastructure/scripts/worktree-manager.js');
          const manager = new WorktreeManager();
          const count = await manager.getCount();
          return count.total < manager.maxWorktrees;
        blocking: false
        warning: "Approaching worktree limit. Consider cleanup."

  # ═══════════════════════════════════════════════════════════════════════════════════
  #                              WORKFLOW SEQUENCE
  # ═══════════════════════════════════════════════════════════════════════════════════

  sequence:

    # ═════════════════════════════════════════════════════════════════════════════════
    # STEP 1: EXTRACT STORY CONTEXT
    # ═════════════════════════════════════════════════════════════════════════════════

    - step: extract_story_context
      phase: 1
      phase_name: "Extract Context"
      action: extract_story_info

      description: >-
        Extract story information from the trigger context.
        Determines the story ID to use for worktree naming.

      script: |
        // Extract story ID from various sources
        function extractStoryId(context) {
          // From explicit parameter
          if (context.storyId) return context.storyId;

          // From story file path
          if (context.storyFile) {
            const match = context.storyFile.match(/story-(\d+\.\d+)/);
            if (match) return match[1];
          }

          // From current task
          if (context.currentTask?.storyId) return context.currentTask.storyId;

          // From git branch (if following convention)
          const branch = await execGit(['branch', '--show-current']);
          const branchMatch = branch.match(/story[-\/](\d+\.\d+)/i);
          if (branchMatch) return branchMatch[1];

          return null;
        }

        const storyId = extractStoryId(context);
        if (!story
```