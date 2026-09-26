# COMANDO - session-state.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\session-state.js
**SHA:** a16682446733eabf
**Timestamp:** 2026-08-28T02:02:00.072515
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART: 'restart',
- case ResumeOption.RESTART:

### Contratos
- QUALITY_GATE: 'quality_gate',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Session State Persistence Module
 *
 * Story 11.5: Projeto Bob - Session State Persistence
 * ADR-011: Unified Session State (absorbs Workflow State from 11.3)
 *
 * Provides session state persistence to disk for:
 * - Resume work days later without losing context
 * - Crash recovery with state restoration
 * - Progress tracking across epic/story development
 *
 * @module core/orchestration/session-state
 * @version 1.1.0
 */

'use strict';

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Constants
const SESSION_STATE_VERSION = '1.2';
const SESSION_STATE_FILENAME = '.session-state.yaml';
const CRASH_THRESHOLD_MINUTES = 30;
const LEGACY_WORKFLOW_STATE_DIR = '.aios/workflow-state';

/**
 * Action types for session state tracking
 * @enum {string}
 */
const ActionType = {
  GO: 'GO',
  PAUSE: 'PAUSE',
  REVIEW: 'REVIEW',
  ABORT: 'ABORT',
  PHASE_CHANGE: 'PHASE_CHANGE',
  EPIC_STARTED: 'EPIC_STARTED',
  STORY_STARTED: 'STORY_STARTED',
  STORY_COMPLETED: 'STORY_COMPLETED',
  CHECKPOINT_REACHED: 'CHECKPOINT_REACHED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
};

/**
 * Phase names for development cycle
 * @enum {string}
 */
const Phase = {
  VALIDATION: 'validation',
  DEVELOPMENT: 'development',
  SELF_HEALING: 'self_healing',
  QUALITY_GATE: 'quality_gate',
  PUSH: 'push',
  CHECKPOINT: 'checkpoint',
};

/**
 * Resume options for session recovery
 * @enum {string}
 */
const ResumeOption = {
  CONTINUE: 'continue',
  REVIEW: 'review',
  RESTART: 'restart',
  DISCARD: 'discard',
};

/**
 * Session State Manager class
 */
class SessionState {
  /**
   * Creates a new SessionState instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} options - Options
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      autoMigrate: true,
      ...options,
    };

    this.stateFilePath = path.join(projectRoot, 'docs/stories', SESSION_STATE_FILENAME);
    this.legacyStatePath = path.join(projectRoot, LEGACY_WORKFLOW_STATE_DIR);
    this.state = null;
  }

  /**
   * Gets the path to the session state file
   * @returns {string} Session state file path
   */
  getStateFilePath() {
    return this.stateFilePath;
  }

  /**
   * Checks if a session state file exists
   * @returns {Promise<boolean>} True if state file exists
   */
  async exists() {
    try {
      await fs.access(this.stateFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a new session state for an epic
   * @param {Object} epicInfo - Epic information
   * @param {string} epicInfo.id - Epic ID
   * @param {string} epicInfo.title - Epic title
   * @param {number} epicInfo.totalStories - Total number of stories
   * @param {string[]} epicInfo.storyIds - Array of story IDs
   * @param {string} branch - Git branch name
   * @returns {Promise<Object>} Created session state
   */
  async createSessionState(epicInfo, branch = 'main') {
    const now = new Date().toISOString();

    this.state = {
      session_state: {
        version: SESSION_STATE_VERSION,
        last_updated: now,

        // Epic Context (AC2)
        epic: {
          id: epicInfo.id,
          title: epicInfo.title,
          total_stories: epicInfo.totalStories,
        },

        // Progress Tracking (AC3)
        progress: {
          current_story: epicInfo.storyIds[0] || null,
          stories_done: [],
          stories_pending: [...epicInfo.storyIds],
        },

        // Workflow State (ADR-011 - migrated from 11.3)
        workflow: {
          current_phase: null,
          attempt_count: 0,
          phase_results: {},
          started_at: now,
        },

        // Last Action (AC4)
        last_action: {
          type: ActionType.EPIC_STARTED,
          timestamp: now,
          story: epicInfo.storyIds[0] || null,
          phase: null,
        },

        // Context Snapshot (AC5)
        context_snapshot: {
          files_modified: 0,
          executor_distribution: {},
          last_executor: null,
          branch: branch,
        },

        // Resume Instructions (auto-generated)
        resume_instructions: this.generateResumeInstructions({
          epicTitle: epicInfo.title,
          currentStory: epicInfo.storyIds[0],
          storiesDone: 0,
          totalStories: epicInfo.totalStories,
          lastPhase: null,
          lastExecutor: null,
        }),

        // Story 12.7: Session-level overrides (temporary, not persisted to user config)
        overrides: {
          educational_mode: null, // null = not overridden, true/false = session override
        },
      },
    };

    await this.save();

    if (this.options.debug) {
      console.log(`[SessionState] Created new session state: ${this.stateFilePath}`);
    }

    return this.state;
  }

  /**
   * Loads session state from disk
   * @returns {Promise<Object|null>
```