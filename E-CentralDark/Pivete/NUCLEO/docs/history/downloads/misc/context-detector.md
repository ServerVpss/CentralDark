# OUTRO - context-detector.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\session\context-detector.js
**SHA:** a0965838e25e0764
**Timestamp:** 2026-08-28T02:02:00.892857
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const commandPattern = /\*([a-z0-9-]+)/g;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Context Detector - Hybrid Session Type Detection
 *
 * Detects session type using conversation history (preferred)
 * with fallback to file-based session tracking.
 *
 * Session Types:
 * - 'new': Fresh session, no prior context
 * - 'existing': Ongoing session with some history
 * - 'workflow': Active workflow detected (e.g., story development)
 *
 * @module core/session/context-detector
 * @migrated Story 2.2 - Core Module Creation
 */

const fs = require('fs');
const path = require('path');

const SESSION_STATE_PATH = path.join(process.cwd(), '.aios', 'session-state.json');
const SESSION_TTL = 60 * 60 * 1000; // 1 hour

class ContextDetector {
  /**
   * Detect session type using hybrid approach
   * @param {Array} conversationHistory - Recent conversation messages
   * @param {string} sessionFilePath - Optional custom session file path
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  detectSessionType(conversationHistory = [], sessionFilePath = SESSION_STATE_PATH) {
    // Hybrid approach: Prefer conversation history
    // FIX: Check for null/undefined explicitly to avoid empty array bypassing file detection
    if (conversationHistory != null && conversationHistory.length > 0) {
      return this._detectFromConversation(conversationHistory);
    }

    // Fallback to file-based detection
    return this._detectFromFile(sessionFilePath);
  }

  /**
   * Detect session type from conversation history
   * @private
   * @param {Array} conversationHistory - Recent conversation messages
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectFromConversation(conversationHistory) {
    if (conversationHistory.length === 0) {
      return 'new';
    }

    // Extract last 10 commands from conversation
    const recentCommands = this._extractCommands(conversationHistory);

    // Check for workflow patterns
    if (this._detectWorkflowPattern(recentCommands)) {
      return 'workflow';
    }

    // Has history but no workflow
    return 'existing';
  }

  /**
   * Detect session type from file
   * @private
   * @param {string} sessionFilePath - Path to session state file
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectFromFile(sessionFilePath) {
    try {
      if (!fs.existsSync(sessionFilePath)) {
        return 'new';
      }

      const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));

      // Check if session expired (TTL)
      const now = Date.now();
      const lastActivity = sessionData.lastActivity || 0;

      if (now - lastActivity > SESSION_TTL) {
        return 'new';
      }

      // Check for active workflow
      if (sessionData.workflowActive && sessionData.lastCommands && sessionData.lastCommands.length > 0) {
        return 'workflow';
      }

      // Valid session with some history
      if (sessionData.lastCommands && sessionData.lastCommands.length > 0) {
        return 'existing';
      }

      return 'new';
    } catch (error) {
      // File read error or invalid JSON - assume new session
      console.warn('[ContextDetector] File read error, defaulting to new session:', error.message);
      return 'new';
    }
  }

  /**
   * Extract command names from conversation history
   * @private
   * @param {Array} conversationHistory - Recent conversation messages
   * @returns {Array<string>} Command names
   */
  _extractCommands(conversationHistory) {
    const commands = [];
    const commandPattern = /\*([a-z0-9-]+)/g;

    // Take last 10 messages for analysis
    const recentMessages = conversationHistory.slice(-10);

    for (const message of recentMessages) {
      const text = message.content || message.text || '';
      const matches = text.matchAll(commandPattern);

      for (const match of matches) {
        commands.push(match[1]);
      }
    }

    return commands.slice(-10); // Last 10 commands
  }

  /**
   * Detect if commands match a known workflow pattern
   * @private
   * @param {Array<string>} commands - Recent command history
   * @returns {boolean} True if workflow pattern detected
   */
  _detectWorkflowPattern(commands) {
    if (commands.length < 2) {
      return false;
    }

    // Common workflow patterns (simplified detection)
    const workflows = {
      story_development: ['validate-story-draft', 'develop', 'review-qa'],
      epic_creation: ['create-epic', 'create-story', 'validate-story-draft'],
      backlog_management: ['backlog-review', 'backlog-prioritize', 'backlog-schedule'],
    };

    // Check if recent commands match any workflow sequence
    for (const [_workflowName, pattern] of Object.entries(workflows)) {
      if (this._matchesPattern(commands, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if commands contain workflow pattern
   * @private
   * @param {Array<string>} commands - Recent command history
   * @param {Array<string>} pattern - Workflow pattern to match
   * @returns {boolean} True if pattern found
   *
```