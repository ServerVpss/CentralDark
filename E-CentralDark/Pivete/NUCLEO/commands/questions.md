# COMANDO - questions.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\wizard\questions.js
**SHA:** d5b58d8505c47926
**Timestamp:** 2026-08-28T02:19:01.175986
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove entirely in future version - each project has unique MCP needs
- // TODO: Consider removing getSquadQuestions() entirely in future version

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Wizard Questions Definitions
 *
 * Modular question system for AIOS installation wizard
 * Questions from Stories 1.3-1.6 will be added here
 *
 * @module wizard/questions
 */

const { colors } = require('../utils/aios-colors');
const { createInquirerValidator, validateProjectType } = require('./validators');
const { t, getLanguageChoices, setLanguage: _setLanguage } = require('./i18n');

/**
 * Get language selection question (first question)
 * @returns {Object} Inquirer question object
 */
function getLanguageQuestion() {
  return {
    type: 'list',
    name: 'language',
    message: '🌐 Language:',
    choices: getLanguageChoices(),
    default: 'en',
  };
}

/**
 * Get user profile question (Story 10.2 - Epic 10: User Profile System)
 * Asks user about their ability to detect AI-generated code errors
 * PRD: AIOS v2.0 "Projeto Bob" - Seção 2.4
 *
 * @returns {Object} Inquirer question object
 */
function getUserProfileQuestion() {
  return {
    type: 'list',
    name: 'userProfile',
    message: colors.primary(t('userProfileQuestion')),
    choices: [
      {
        name:
          colors.highlight(`🟢 ${t('modoAssistido')}`) +
          colors.dim(` (${t('recommended')})`),
        value: 'bob',
      },
      {
        name: `🔵 ${t('modoAvancado')}`,
        value: 'advanced',
      },
    ],
    default: 1, // Default to 'advanced' for backward compatibility
  };
}

/**
 * Get project type question (Story 1.3)
 * Uses i18n for translation
 *
 * @returns {Object} Inquirer question object
 */
function getProjectTypeQuestion() {
  return {
    type: 'list',
    name: 'projectType',
    message: colors.primary(t('projectTypeQuestion')),
    choices: [
      {
        name: colors.highlight(t('greenfield')) + colors.dim(` (${t('greenfieldDesc')})`),
        value: 'greenfield',
      },
      {
        name: t('brownfield') + colors.dim(` (${t('brownfieldDesc')})`),
        value: 'brownfield',
      },
    ],
    default: 0,
    validate: createInquirerValidator(validateProjectType),
  };
}

/**
 * Get IDE selection questions (Story 1.4)
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getIDEQuestions() {
  const { getIDESelectionQuestion } = require('./ide-selector');
  return [getIDESelectionQuestion()];
}

/**
 * Get package manager selection question (Story 1.7)
 *
 * @param {string} detectedPM - Auto-detected package manager
 * @returns {Object} Inquirer question object
 */
function getPackageManagerQuestion(detectedPM = 'npm') {
  return {
    type: 'list',
    name: 'packageManager',
    message: colors.primary('Which package manager should be used?'),
    choices: [
      {
        name: detectedPM === 'npm' ? colors.highlight('npm') + colors.dim(' (detected)') : 'npm',
        value: 'npm',
      },
      {
        name: detectedPM === 'yarn' ? colors.highlight('yarn') + colors.dim(' (detected)') : 'yarn',
        value: 'yarn',
      },
      {
        name: detectedPM === 'pnpm' ? colors.highlight('pnpm') + colors.dim(' (detected)') : 'pnpm',
        value: 'pnpm',
      },
      {
        name: detectedPM === 'bun' ? colors.highlight('bun') + colors.dim(' (detected)') : 'bun',
        value: 'bun',
      },
    ],
    default: ['npm', 'yarn', 'pnpm', 'bun'].indexOf(detectedPM) || 0,
  };
}

/**
 * Get MCP selection questions (Story 1.5 / 1.8 Integration)
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getMCPQuestions() {
  return [
    {
      type: 'checkbox',
      name: 'selectedMCPs',
      message: colors.primary('Select MCPs to install (project-level):'),
      choices: [
        {
          name:
            colors.highlight('Browser (Puppeteer)') + colors.dim(' - Web automation and testing'),
          value: 'browser',
          checked: true,
        },
        {
          name: colors.highlight('Context7') + colors.dim(' - Library documentation search'),
          value: 'context7',
          checked: true,
        },
        {
          name: colors.highlight('Exa') + colors.dim(' - Advanced web search'),
          value: 'exa',
          checked: true,
        },
        {
          name: colors.highlight('Desktop Commander') + colors.dim(' - File system access'),
          value: 'desktop-commander',
          checked: true,
        },
      ],
      validate: () => {
        // Allow empty selection (user can skip MCP installation)
        return true;
      },
    },
    // Note: API keys are configured later via aios-master or directly in .env
  ];
}

/**
 * Get environment configuration questions (Story 1.6)
 *
 * DESIGN NOTE: Environment configuration uses its own prompt system
 * via @clack/prompts in packages/installer/src/config/configure-environment.js
 *
 * API key prompts are NOT part of wizard questions to keep the
 * environment module self-contained and testable independently.
 *
 * The wizard calls configureEnvironment() directly after IDE selection
 * in src/wizard/index.js (Task 1.6.7)
 *
 * @returns {O
```