# COMANDO - recovery-tracker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\recovery-tracker.js
**SHA:** ce48aeacb6582a55
**Timestamp:** 2026-08-28T02:02:14.171861
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- subtaskId: { type: 'string', pattern: '^\\d+\\.\\d+$' },

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Recovery Tracker
 *
 * Story: 5.1 - Attempt Tracker
 * Epic: Epic 5 - Recovery System
 *
 * Tracks implementation attempts for subtasks during story development.
 * Records approach, changes, success/failure, and error information.
 *
 * Features:
 * - AC1: Located in `.aios-core/infrastructure/scripts/`
 * - AC2: Registra: attempt_number, timestamp, approach, success/fail, error
 * - AC3: Output: `docs/stories/{story-id}/recovery/attempts.json`
 * - AC4: Comando `*track-attempt {subtask-id}` no @dev
 * - AC5: Schema de validacao para attempts.json
 * - AC6: Historico mantido por subtask (nao por story)
 * - AC7: Auto-increment de attempt_number
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Optional dependencies with graceful fallback
let chalk;
try {
  chalk = require('chalk');
} catch {
  chalk = {
    blue: (s) => s,
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s,
    bold: (s) => s,
    dim: (s) => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC3: Default recovery directory within story
  recoveryDir: 'recovery',
  // AC3: Attempts file name
  attemptsFile: 'attempts.json',
  // Stories base directory
  storiesBasePath: 'docs/stories',
  // Schema version
  schemaVersion: '1.0',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS ENUM
// ═══════════════════════════════════════════════════════════════════════════════════

const AttemptStatus = {
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
};

const SubtaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SCHEMA VALIDATION (AC5)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * JSON Schema for attempts.json
 * AC5: Schema de validacao para attempts.json
 */
const ATTEMPTS_SCHEMA = {
  type: 'object',
  required: ['subtaskId', 'storyId', 'attempts', 'currentAttempt', 'status'],
  properties: {
    subtaskId: { type: 'string', pattern: '^\\d+\\.\\d+$' },
    storyId: { type: 'string' },
    attempts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['number', 'timestamp', 'approach'],
        properties: {
          number: { type: 'integer', minimum: 1 },
          timestamp: { type: 'string', format: 'date-time' },
          approach: { type: 'string' },
          changes: { type: 'array', items: { type: 'string' } },
          success: { type: 'boolean' },
          error: { type: 'string' },
          duration: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
        },
      },
    },
    currentAttempt: { type: 'integer', minimum: 0 },
    status: { enum: ['pending', 'in_progress', 'completed', 'failed'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/**
 * Validate attempts data against schema
 * @param {Object} data - Data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateAttemptsSchema(data) {
  const errors = [];

  // Required fields
  for (const field of ATTEMPTS_SCHEMA.required) {
    if (data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type checks
  if (typeof data.subtaskId !== 'string') {
    errors.push('subtaskId must be a string');
  } else if (!/^\d+\.\d+$/.test(data.subtaskId)) {
    errors.push('subtaskId must match pattern X.Y (e.g., "2.1")');
  }

  if (typeof data.storyId !== 'string') {
    errors.push('storyId must be a string');
  }

  if (!Array.isArray(data.attempts)) {
    errors.push('attempts must be an array');
  } else {
    for (let i = 0; i < data.attempts.length; i++) {
      const attempt = data.attempts[i];
      if (typeof attempt.number !== 'number' || attempt.number < 1) {
        errors.push(`attempts[${i}].number must be a positive integer`);
      }
      if (typeof attempt.timestamp !== 'string') {
        errors.push(`attempts[${i}].timestamp must be a string`);
      }
      if (typeof attempt.approach !== 'string') {
        errors.push(`attempts[${i}].approach must be a string`);
      }
      if (attempt.changes !== undefined && !Array.isArray(attempt.changes)) {
        errors.push(`attempts[${i}].changes must be an array`);
      }
    }
  }

  if (typeof data.currentAttempt !== 'number' || data.cur
```