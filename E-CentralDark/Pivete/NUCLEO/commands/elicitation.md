# COMANDO - elicitation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\engine\elicitation.js
**SHA:** 01e327bee674ff9d
**Timestamp:** 2026-08-28T02:02:22.158811
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = patterns[docType] || `**/${docType}-*.md`;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Variable Elicitation Module
 * Handles interactive prompting for template variables using inquirer.js
 *
 * @module elicitation
 * @version 2.0.0
 */

'use strict';

const inquirer = require('inquirer');

/**
 * Map template variable types to inquirer question types
 * @param {string} type - Template variable type
 * @returns {string} Inquirer question type
 */
function mapQuestionType(type) {
  const typeMap = {
    string: 'input',
    text: 'editor',
    number: 'number',
    boolean: 'confirm',
    choice: 'list',
    multichoice: 'checkbox',
    password: 'password',
    array: 'input',
  };

  return typeMap[type] || 'input';
}

/**
 * Create an inquirer question from a template variable
 * @param {Object} variable - Template variable definition
 * @param {Object} context - Existing context values
 * @returns {Object} Inquirer question configuration
 */
function createQuestion(variable, context = {}) {
  const question = {
    type: mapQuestionType(variable.type),
    name: variable.name,
    message: variable.prompt,
    default: context[variable.name] ?? variable.default,
  };

  // Add choices for choice/multichoice types
  if (variable.choices) {
    question.choices = variable.choices;
  }

  // Add validation
  if (variable.required && variable.type !== 'boolean') {
    question.validate = (input) => {
      if (variable.type === 'array') {
        return input && input.trim().length > 0 ? true : `${variable.name} is required`;
      }
      if (input === undefined || input === null || input === '') {
        return `${variable.name} is required`;
      }
      return true;
    };
  }

  // Add custom validation
  if (variable.validation) {
    const baseValidate = question.validate;
    question.validate = (input) => {
      if (baseValidate) {
        const baseResult = baseValidate(input);
        if (baseResult !== true) return baseResult;
      }

      if (variable.validation.minLength && input.length < variable.validation.minLength) {
        return `${variable.name} must be at least ${variable.validation.minLength} characters`;
      }
      if (variable.validation.maxLength && input.length > variable.validation.maxLength) {
        return `${variable.name} must be at most ${variable.validation.maxLength} characters`;
      }
      if (variable.validation.pattern) {
        const regex = new RegExp(variable.validation.pattern);
        if (!regex.test(input)) {
          return variable.validation.message || `${variable.name} format is invalid`;
        }
      }

      return true;
    };
  }

  // Transform array input
  if (variable.type === 'array') {
    question.filter = (input) => {
      if (typeof input === 'string') {
        return input.split(',').map(s => s.trim()).filter(Boolean);
      }
      return input;
    };
  }

  return question;
}

/**
 * VariableElicitation class for handling interactive prompts
 */
class VariableElicitation {
  /**
   * Create a VariableElicitation instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.interactive - Enable interactive mode (default: true)
   */
  constructor(options = {}) {
    this.interactive = options.interactive !== false;
    this.autoResolvers = new Map();
    this.registerDefaultAutoResolvers();
  }

  /**
   * Register default auto-resolvers for common auto values
   */
  registerDefaultAutoResolvers() {
    // Next number resolvers
    this.autoResolvers.set('next_adr_number', async () => this.getNextNumber('adr'));
    this.autoResolvers.set('next_pmdr_number', async () => this.getNextNumber('pmdr'));
    this.autoResolvers.set('next_dbdr_number', async () => this.getNextNumber('dbdr'));
    this.autoResolvers.set('next_story_number', async () => this.getNextNumber('story'));
    this.autoResolvers.set('next_epic_number', async () => this.getNextNumber('epic'));
    this.autoResolvers.set('next_task_number', async () => this.getNextNumber('task'));

    // Current date/time
    this.autoResolvers.set('current_date', async () => new Date().toISOString().split('T')[0]);
    this.autoResolvers.set('current_datetime', async () => new Date().toISOString());
    this.autoResolvers.set('now', async () => new Date());
  }

  /**
   * Get next number for a document type by scanning existing files
   * @param {string} docType - Document type (adr, pmdr, etc.)
   * @returns {Promise<number>} Next available number
   */
  async getNextNumber(docType) {
    const fs = require('fs').promises;
    const path = require('path');
    const glob = require('glob');

    const patterns = {
      adr: 'docs/architecture/decisions/adr-*.md',
      pmdr: 'docs/decisions/pmdr-*.md',
      dbdr: 'docs/decisions/dbdr-*.md',
      story: 'docs/stories/**/story-*.md',
      epic: 'docs/epics/epic-*.md',
      task: 'docs/tasks/task-*.md',
    };

    const pattern = patterns[docType] || `**/${docType}-*.md`;

    try {
      const files = glob.sync(pattern, { cwd: process.cwd() });
      const numbers = 
```