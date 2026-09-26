# PADRAO - pattern-capture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\workflow-intelligence\learning\pattern-capture.js
**SHA:** 241eee4c49236437
**Timestamp:** 2026-08-28T02:02:23.956297
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = {
- pattern: pattern,
- pattern: result.pattern,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @module PatternCapture
 * @description Captures workflow patterns from user sessions
 * @story WIS-5 - Pattern Capture (Internal)
 * @version 1.0.0
 */

'use strict';

const crypto = require('crypto');

/**
 * Default minimum sequence length for pattern capture
 * @type {number}
 */
const DEFAULT_MIN_SEQUENCE_LENGTH = 3;

/**
 * Key workflow commands that trigger pattern capture
 * @type {string[]}
 */
const KEY_WORKFLOW_COMMANDS = [
  'develop',
  'review-qa',
  'apply-qa-fixes',
  'validate-story-draft',
  'create-story',
  'create-next-story',
  'run-tests',
  'create-pr',
];

/**
 * PatternCapture class for capturing workflow patterns from sessions
 */
class PatternCapture {
  /**
   * Create a PatternCapture instance
   * @param {Object} options - Configuration options
   * @param {number} options.minSequenceLength - Minimum sequence length (default: 3)
   * @param {string[]} options.keyCommands - Commands that trigger capture
   * @param {boolean} options.enabled - Whether capture is enabled
   */
  constructor(options = {}) {
    this.minSequenceLength = options.minSequenceLength || DEFAULT_MIN_SEQUENCE_LENGTH;
    this.keyCommands = options.keyCommands || KEY_WORKFLOW_COMMANDS;
    this.enabled = options.enabled !== false && process.env.AIOS_PATTERN_CAPTURE !== 'false';
    this.sessionBuffer = new Map(); // Track ongoing sessions
  }

  /**
   * Capture a completed session as a pattern
   * @param {Object} sessionData - Session data to capture
   * @param {string[]} sessionData.agentSequence - Sequence of agents used
   * @param {string[]} sessionData.commands - Sequence of commands executed
   * @param {boolean} sessionData.success - Whether workflow completed successfully
   * @param {number} sessionData.timestamp - Session timestamp
   * @param {string} sessionData.sessionId - Unique session identifier
   * @returns {Object} Captured pattern with validity info
   */
  captureSession(sessionData) {
    if (!this.enabled) {
      return { valid: false, reason: 'Pattern capture disabled' };
    }

    if (!sessionData || !sessionData.commands) {
      return { valid: false, reason: 'Invalid session data' };
    }

    // Only capture successful workflows
    if (!sessionData.success) {
      return { valid: false, reason: 'Workflow not successful' };
    }

    // Check minimum sequence length
    if (sessionData.commands.length < this.minSequenceLength) {
      return {
        valid: false,
        reason: `Sequence too short (${sessionData.commands.length} < ${this.minSequenceLength})`,
      };
    }

    // Extract normalized command sequence
    const sequence = this._normalizeCommands(sessionData.commands);
    const agents = this._normalizeAgents(sessionData.agentSequence || []);

    // Build pattern object
    const pattern = {
      id: crypto.randomUUID(),
      sequence: sequence,
      agents: agents,
      occurrences: 1,
      successRate: 1.0,
      firstSeen: new Date(sessionData.timestamp || Date.now()).toISOString(),
      lastSeen: new Date(sessionData.timestamp || Date.now()).toISOString(),
      sessionId: sessionData.sessionId || crypto.randomUUID(),
      workflow: this._detectWorkflow(sequence),
      status: 'pending',
    };

    return {
      valid: true,
      pattern: pattern,
      sequence: sequence,
    };
  }

  /**
   * Extract pattern candidates from command history
   * @param {string[]} commandHistory - Full command history
   * @returns {Object[]} Array of pattern candidates
   */
  extractPatterns(commandHistory) {
    if (!commandHistory || commandHistory.length < this.minSequenceLength) {
      return [];
    }

    const patterns = [];
    const normalized = this._normalizeCommands(commandHistory);

    // Use sliding window to find subsequences
    for (let length = this.minSequenceLength; length <= Math.min(normalized.length, 7); length++) {
      for (let i = 0; i <= normalized.length - length; i++) {
        const subsequence = normalized.slice(i, i + length);

        // Only include if it contains at least one key command
        if (this._containsKeyCommand(subsequence)) {
          patterns.push({
            sequence: subsequence,
            startIndex: i,
            length: length,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Get the minimum sequence length setting
   * @returns {number} Minimum sequence length
   */
  getMinimumSequenceLength() {
    return this.minSequenceLength;
  }

  /**
   * Handle task completion event
   * @param {string} taskName - Name of completed task
   * @param {Object} context - Task context
   * @returns {Promise<Object>} Capture result
   */
  async onTaskComplete(taskName, context) {
    if (!this.enabled) {
      return { captured: false, reason: 'disabled' };
    }

    const sessionId = context.sessionId || 'default';

    // Get or create session buffer
    if (!this.sessionBuffer.has(sessionId)) {
      this.sessionBuffer.set(sessionId, {
        commands: [],
     
```