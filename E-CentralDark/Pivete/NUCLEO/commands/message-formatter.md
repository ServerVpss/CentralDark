# COMANDO - message-formatter.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\orchestration\message-formatter.js
**SHA:** b7413c04fa22db1c
**Timestamp:** 2026-08-28T02:02:00.043844
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- let message = `\n💡 Decisão: ${decision}\n`;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Message Formatter — Educational Mode Message Formatting
 *
 * Story 12.7: Modo Educativo (Opt-in)
 * PRD Reference: §0.5 (Modo Educativo do Bob)
 *
 * Formats Bob's messages based on educational mode:
 * - OFF (default): Concise messages, just results
 * - ON: Detailed explanations with trade-offs, reasoning, and agent info
 *
 * @module core/orchestration/message-formatter
 * @version 1.0.0
 */

'use strict';

/**
 * Message Formatter class
 */
class MessageFormatter {
  /**
   * Creates a new MessageFormatter instance
   * @param {Object} options - Formatter options
   * @param {boolean} [options.educationalMode=false] - Enable educational mode
   */
  constructor(options = {}) {
    this.educationalMode = options.educationalMode || false;
  }

  /**
   * Sets the educational mode
   * @param {boolean} enabled - Whether educational mode is enabled
   */
  setEducationalMode(enabled) {
    this.educationalMode = Boolean(enabled);
  }

  /**
   * Gets the current educational mode state
   * @returns {boolean} Current educational mode state
   */
  isEducationalMode() {
    return this.educationalMode;
  }

  /**
   * Formats an action result message
   *
   * @param {string} action - Action name (e.g., 'Autenticação JWT')
   * @param {Object} details - Action details
   * @param {number} [details.filesCreated=0] - Number of files created
   * @param {number} [details.filesModified=0] - Number of files modified
   * @param {string} [details.reason] - Why this action (educational mode)
   * @param {string[]} [details.steps] - Steps taken (educational mode)
   * @param {Object[]} [details.agents] - Agents involved (educational mode)
   * @param {Object[]} [details.tradeoffs] - Trade-offs considered (educational mode)
   * @returns {string} Formatted message
   */
  formatActionResult(action, details = {}) {
    const {
      filesCreated = 0,
      filesModified = 0,
      reason,
      steps,
      agents,
      tradeoffs,
    } = details;

    const totalFiles = filesCreated + filesModified;

    if (!this.educationalMode) {
      // OFF mode: Concise message
      let fileInfo = '';
      if (filesCreated > 0 && filesModified > 0) {
        fileInfo = `${filesCreated} arquivo${filesCreated > 1 ? 's' : ''} criado${filesCreated > 1 ? 's' : ''}, ${filesModified} modificado${filesModified > 1 ? 's' : ''}.`;
      } else if (filesCreated > 0) {
        fileInfo = `${filesCreated} arquivo${filesCreated > 1 ? 's' : ''} criado${filesCreated > 1 ? 's' : ''}.`;
      } else if (filesModified > 0) {
        fileInfo = `${filesModified} arquivo${filesModified > 1 ? 's' : ''} modificado${filesModified > 1 ? 's' : ''}.`;
      } else if (totalFiles === 0) {
        fileInfo = 'Concluído.';
      }

      return `✅ ${action} implementada. ${fileInfo}`;
    }

    // ON mode: Detailed message with explanations
    let message = `Vou implementar ${action}.\n`;

    // Add reason (📚 Por quê?)
    if (reason) {
      message += '\n📚 Por quê?\n';
      message += `   ${reason}\n`;
    }

    // Add trade-offs if provided
    if (tradeoffs && tradeoffs.length > 0) {
      message += '\n   Trade-offs:\n';
      for (const tradeoff of tradeoffs) {
        message += `   - ${tradeoff.choice}: ${tradeoff.selected}\n`;
        if (tradeoff.reason) {
          message += `     Motivo: ${tradeoff.reason}\n`;
        }
      }
    }

    // Add steps (🔧 O que vou fazer)
    if (steps && steps.length > 0) {
      message += '\n🔧 O que vou fazer:\n';
      steps.forEach((step, index) => {
        message += `   ${index + 1}. ${step}\n`;
      });
    }

    // Add agents involved
    if (agents && agents.length > 0) {
      message += '\n👥 Agentes envolvidos:\n';
      for (const agent of agents) {
        message += `   - ${agent.id} (${agent.name}): ${agent.task}\n`;
      }
    }

    // Add file summary
    if (totalFiles > 0) {
      message += `\n📁 Arquivos: ${filesCreated} criado${filesCreated !== 1 ? 's' : ''}, ${filesModified} modificado${filesModified !== 1 ? 's' : ''}\n`;
    }

    return message;
  }

  /**
   * Formats a decision explanation
   *
   * @param {string} decision - Decision description
   * @param {Object[]} [tradeoffs] - Trade-offs considered
   * @param {string} [tradeoffs[].choice] - The choice made
   * @param {string} [tradeoffs[].selected] - Selected option
   * @param {string} [tradeoffs[].reason] - Reason for selection
   * @returns {string} Formatted explanation (empty string if educational mode is OFF)
   */
  formatDecisionExplanation(decision, tradeoffs = []) {
    if (!this.educationalMode) {
      // OFF mode: Silence (no output)
      return '';
    }

    // ON mode: Detailed explanation
    let message = `\n💡 Decisão: ${decision}\n`;

    if (tradeoffs && tradeoffs.length > 0) {
      message += '\n📊 Trade-offs considerados:\n';
      for (const tradeoff of tradeoffs) {
        message += `   • ${tradeoff.choice}\n`;
        message += `     → Escolhido: ${tradeoff.selected}\n`;
        
```